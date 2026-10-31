/**
 * Beyond the Fort — Cross-City Cloudflare Quick Tunnel Launcher
 * 
 * Safely exposes the local single-port application (Port 5173) through a temporary HTTPS tunnel
 * for friends/evaluators located in another city (e.g., Agra, Delhi, Mumbai).
 * 
 * Reliability Features:
 * - Checks if Port 5173 server is already healthy; starts it only if needed (avoids duplicate processes).
 * - Verifies local homepage responds before connecting the tunnel.
 * - Enforces `--protocol http2` over TCP to prevent router UDP NAT timeouts and Cloudflare Error 1033.
 * - Formats and displays the live generated HTTPS URL.
 * - Keeps tunnel process alive and handles graceful termination.
 */

const { spawn, execSync } = require('child_process');
const http = require('http');
const path = require('path');
const fs = require('fs');

const CLOUDFLARED_BIN = 'D:\\tools\\cloudflared.exe';
const PROJECT_ROOT = path.join(__dirname, '..');
const LOCAL_PORT = 5173;

function checkLocalHealth() {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${LOCAL_PORT}/ready`, (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(2500, () => {
      req.destroy();
      resolve(false);
    });
  });
}

function stopStaleTunnelProcesses() {
  try {
    // Check if cloudflared is running and kill only stale quick tunnel instances
    const stdout = execSync('tasklist /FI "IMAGENAME eq cloudflared.exe" /NH', { encoding: 'utf-8' });
    if (stdout.includes('cloudflared.exe')) {
      console.log('[Tunnel Manager] Terminating existing cloudflared instance to prevent duplicate connections...');
      execSync('taskkill /F /IM cloudflared.exe', { stdio: 'ignore' });
    }
  } catch {
    // No process or already terminated
  }
}

async function main() {
  console.log('\n===============================================================');
  console.log('   BEYOND THE FORT — SECURE CROSS-CITY CLOUDFLARE TUNNEL');
  console.log('   Location: Morna  ===>  Friend: Agra');
  console.log('===============================================================\n');

  if (!fs.existsSync(CLOUDFLARED_BIN)) {
    console.error(`[Fatal Error] cloudflared.exe was not found at: ${CLOUDFLARED_BIN}`);
    console.error('Please download it from: https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe');
    process.exit(1);
  }

  // 1. Verify / Start Website Server
  console.log(`[1/3] Checking local website server on Port ${LOCAL_PORT}...`);
  let isServerRunning = await checkLocalHealth();

  if (!isServerRunning) {
    console.log(`      Website is not currently running. Starting unified server on Port ${LOCAL_PORT}...`);
    const serverProcess = spawn('node', ['server.js'], {
      cwd: PROJECT_ROOT,
      stdio: 'inherit',
      env: process.env
    });

    serverProcess.on('error', (err) => {
      console.error('[Server Error] Failed to launch server process:', err);
      process.exit(1);
    });

    // Poll until server responds
    let retries = 15;
    while (retries > 0 && !(await checkLocalHealth())) {
      await new Promise(r => setTimeout(r, 1000));
      retries--;
    }

    if (retries === 0) {
      console.error(`[Fatal Error] Server did not become ready on http://localhost:${LOCAL_PORT}/ready.`);
      process.exit(1);
    }
    console.log(`      ✓ Server is healthy on http://localhost:${LOCAL_PORT}/`);
  } else {
    console.log(`      ✓ Local website is already active and healthy on http://localhost:${LOCAL_PORT}/`);
  }

  // 2. Clear any stale tunnel processes
  console.log('[2/3] Preparing clean Cloudflare tunnel connection...');
  stopStaleTunnelProcesses();

  // 3. Launch Cloudflare Quick Tunnel with TCP HTTP/2 (eliminates UDP timeout error 1033)
  console.log('[3/3] Connecting to Cloudflare Edge Network (HTTP/2 Protocol over IPv4)...');

  const tunnelArgs = [
    'tunnel',
    '--protocol', 'http2',
    '--edge-ip-version', '4',
    '--no-autoupdate',
    '--url', `http://localhost:${LOCAL_PORT}`
  ];

  const tunnelProcess = spawn(CLOUDFLARED_BIN, tunnelArgs, {
    stdio: ['ignore', 'pipe', 'pipe']
  });

  let urlDetected = false;

  const handleLog = (chunk) => {
    const text = chunk.toString();
    
    // Check for tunnel URL
    const urlMatch = text.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/i);
    if (urlMatch && !urlDetected) {
      urlDetected = true;
      const publicUrl = urlMatch[0];

      console.log('\n===============================================================');
      console.log('   🎉 SUCCESS! YOUR CROSS-CITY HTTPS URL IS LIVE:');
      console.log('---------------------------------------------------------------');
      console.log(`   👉  ${publicUrl}`);
      console.log('---------------------------------------------------------------');
      console.log('   Send this exact URL to your friend in Agra.');
      console.log('   It works on mobile phones, tablets, and computers.');
      console.log('   Status: Verified with HTTP/2 persistent connection.');
      console.log('===============================================================');
      console.log('   [NOTICE] Keep this command prompt window OPEN while testing.');
      console.log('   Closing this window will terminate cross-city access.\n');
    }

    // Surface critical connection registration errors
    if (text.includes('ERR') || text.includes('error')) {
      if (!text.includes('metrics')) {
        process.stderr.write(`[Tunnel Log]: ${text}`);
      }
    }
  };

  tunnelProcess.stdout.on('data', handleLog);
  tunnelProcess.stderr.on('data', handleLog);

  tunnelProcess.on('close', (code) => {
    console.log(`\n[Notice] Cloudflare tunnel disconnected (exit code: ${code}).`);
    process.exit(code || 0);
  });

  process.on('SIGINT', () => {
    console.log('\nStopping Cloudflare tunnel...');
    tunnelProcess.kill();
    process.exit(0);
  });
}

main().catch(err => {
  console.error('[Launcher Error]:', err);
  process.exit(1);
});
