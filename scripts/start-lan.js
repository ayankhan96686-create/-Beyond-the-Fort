/**
 * Beyond the Fort — Local Area Network (LAN) Startup Utility
 * Detects your local Wi-Fi / Ethernet IPv4 address, binds to 0.0.0.0,
 * and launches the unified Port 5173 server for phone / colleague testing.
 */

const os = require('os');
const { spawn } = require('child_process');
const path = require('path');

function getLanIps() {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        addresses.push({ interface: name, address: iface.address });
      }
    }
  }
  return addresses;
}

const lanAddresses = getLanIps();
const primaryIp = lanAddresses[0]?.address || '127.0.0.1';
const port = process.env.PORT || 5173;

console.log('\n===============================================================');
console.log('   BEYOND THE FORT — GWALIOR TOURISM AI (SINGLE-PORT LAN)');
console.log('===============================================================');
console.log(`   Local Machine:     http://localhost:${port}`);
console.log(`   Network LAN (Wi-Fi): http://${primaryIp}:${port}`);
if (lanAddresses.length > 1) {
  lanAddresses.slice(1).forEach(addr => {
    console.log(`   Alt Interface (${addr.interface}): http://${addr.address}:${port}`);
  });
}
console.log('---------------------------------------------------------------');
console.log('   Share the Network LAN URL with any phone, tablet, or laptop');
console.log('   connected to the same Wi-Fi / local network.');
console.log('===============================================================\n');

// Set HOST=0.0.0.0 in env
process.env.HOST = '0.0.0.0';

// Launch node server.js
const serverProc = spawn('node', [path.join(__dirname, '..', 'server.js')], {
  stdio: 'inherit',
  env: process.env,
  cwd: path.join(__dirname, '..')
});

serverProc.on('error', (err) => {
  console.error('Failed to start LAN server process:', err);
});

serverProc.on('exit', (code) => {
  console.log(`Server process exited with code ${code}`);
});
