/**
 * Unified Process Orchestrator for Beyond the Fort
 * Team Venator (ID: 60358412) - AI Synergy Hackathon 2026
 * 
 * Manages dual service runtimes:
 * 1. Python 3.14 LangGraph Multi-Agent Service (Port 8000)
 * 2. Node.js 24 / Express Core Application Server (Port 3000)
 */

const { spawn } = require('child_process');
const http = require('http');
const path = require('path');
const fs = require('fs');

const REPO_ROOT = path.resolve(__dirname, '..');
const MULTIAGENT_DIR = path.join(REPO_ROOT, 'multiagent-engine');

function checkPortLive(port, path = '/health') {
  return new Promise(resolve => {
    const req = http.get({ hostname: '127.0.0.1', port, path, timeout: 1500 }, res => {
      resolve(res.statusCode >= 200 && res.statusCode < 400);
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => { req.destroy(); resolve(false); });
  });
}

function resolvePythonBinary() {
  const winVenv = path.join(REPO_ROOT, '.venv', 'Scripts', 'python.exe');
  const posixVenv = path.join(REPO_ROOT, '.venv', 'bin', 'python');
  if (fs.existsSync(winVenv)) return winVenv;
  if (fs.existsSync(posixVenv)) return posixVenv;
  return process.platform === 'win32' ? 'python' : 'python3';
}

async function startAll() {
  console.log('===============================================================');
  console.log('  Beyond the Fort — Service Orchestrator (Team Venator)');
  console.log('===============================================================');

  const children = [];

  const cleanup = () => {
    console.log('\n[Orchestrator] Shutting down child services...');
    for (const child of children) {
      try {
        if (!child.killed) child.kill();
      } catch (_) {}
    }
    process.exit(0);
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);

  // 1. Check Python LangGraph Service (:8000)
  const pythonLive = await checkPortLive(8000);
  if (pythonLive) {
    console.log('[Orchestrator] [OK] Python LangGraph service already running on port 8000.');
  } else {
    const pyBin = resolvePythonBinary();
    console.log(`[Orchestrator] Launching Python LangGraph service using ${pyBin}...`);
    const pyProc = spawn(pyBin, ['server.py'], {
      cwd: MULTIAGENT_DIR,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: process.env
    });

    pyProc.stdout.on('data', data => {
      process.stdout.write(`[Python:8000] ${data.toString()}`);
    });
    pyProc.stderr.on('data', data => {
      process.stderr.write(`[Python:8000] ${data.toString()}`);
    });
    pyProc.on('exit', code => {
      console.log(`[Orchestrator] Python LangGraph exited with code ${code}`);
    });
    children.push(pyProc);

    // Wait for python to bind
    for (let i = 0; i < 15; i++) {
      await new Promise(r => setTimeout(r, 600));
      if (await checkPortLive(8000)) {
        console.log('[Orchestrator] [OK] Python LangGraph service listening on port 8000.');
        break;
      }
    }
  }

  // 2. Check Node.js Express Server (:3000)
  const nodeLive = await checkPortLive(3000);
  if (nodeLive) {
    console.log('[Orchestrator] [OK] Node.js Express server already running on port 3000.');
  } else {
    console.log('[Orchestrator] Launching Node.js Express server on port 3000...');
    const nodeProc = spawn('node', ['server.js'], {
      cwd: REPO_ROOT,
      stdio: ['ignore', 'inherit', 'inherit'],
      env: process.env
    });
    nodeProc.on('exit', code => {
      console.log(`[Orchestrator] Node.js server exited with code ${code}`);
    });
    children.push(nodeProc);
  }

  console.log('\n===============================================================');
  console.log('  All services ready:');
  console.log('  • Web App:     http://localhost:3000');
  console.log('  • Chatbot:     http://localhost:3000/chat');
  console.log('  • Itinerary:   http://localhost:3000/itinerary');
  console.log('  • LangGraph:   http://127.0.0.1:8000/health');
  console.log('===============================================================\n');
}

startAll().catch(err => {
  console.error('[Orchestrator] Startup failed:', err);
  process.exit(1);
});

