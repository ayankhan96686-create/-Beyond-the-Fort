/**
 * PM2 Process Manager Configuration — Unified Single-Port Architecture
 * Beyond the Fort — Team Venator
 * Production deployment for AWS EC2, DigitalOcean, or Linux VPS
 */

module.exports = {
  apps: [
    {
      name: 'beyond-fort-unified',
      cwd: './',
      script: 'server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 5173,
        TRUST_PROXY_HOPS: 1
      }
    }
  ]
};
