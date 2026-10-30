/**
 * PM2 Process Manager Configuration
 * Beyond the Fort — Team Venator
 * Production deployment for AWS EC2, DigitalOcean, or Linux VPS
 */

module.exports = {
  apps: [
    {
      name: 'beyond-fort-python',
      cwd: './multiagent-engine',
      script: '../.venv/bin/python',
      args: 'server.py',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 8000,
        PYTHONUNBUFFERED: '1'
      }
    },
    {
      name: 'beyond-fort-node',
      cwd: './',
      script: 'server.js',
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '800M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        TRUST_PROXY_HOPS: 1
      }
    }
  ]
};
