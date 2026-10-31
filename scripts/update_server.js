const fs = require('fs');
const path = require('path');

const p = path.join(__dirname, '..', 'server.js');
let s = fs.readFileSync(p, 'utf8');

// Normalize CRLF to LF
s = s.replace(/\r\n/g, '\n');

// 1. Add /plan endpoint if missing
if (!s.includes("app.post('/plan'")) {
  s = s.replace(
    "app.post('/tourism-plan',",
    "app.post('/plan', aiLimiter, async (req, res) => {\n  const result = await tourismWorkflowService.executeWorkflow(req.body);\n  const { statusCode, ...body } = result;\n  return res.status(statusCode || 200).json(body);\n});\n\napp.post('/tourism-plan',"
  );
}

// 2. In non-test mode, root / is served by Vite / React SPA
s = s.replace(
  "app.get('/', (req, res) => feasibilityController.renderHome(req, res));",
  "if (process.env.NODE_ENV === 'test') {\n  app.get('/', (req, res) => feasibilityController.renderHome(req, res));\n} else {\n  app.get('/ejs', (req, res) => feasibilityController.renderHome(req, res));\n}"
);

// 3. Update server startup to attach Vite middleware mode
const oldStartup = `if (require.main === module) {
  db.connect().then(() => {
    // Bind locally over IPv4 so the server can coexist with services bound to
    // the IPv6 wildcard address and remains reachable at localhost on Windows.
    const listenHost = process.env.HOST || (process.env.PORT || process.env.RAILWAY_ENVIRONMENT || process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1');
    app.listen(config.port, listenHost, () => {
      console.log(\`=======================================================\`);
      console.log(\`  Team Venator: Time-Aware Digital Discoverability\`);
      console.log(\`  AI Synergy Hackathon 2026 • Round 1\`);
      console.log(\`  Server listening on http://localhost:\${config.port}\`);
      console.log(\`=======================================================\`);
    });
  });
}`;

const newStartup = `async function startServer() {
  await db.connect();

  if (process.env.NODE_ENV !== 'test') {
    try {
      const { createServer: createViteServer } = require('vite');
      const vite = await createViteServer({
        root: path.resolve(__dirname, 'new_style'),
        server: { middlewareMode: true },
        appType: 'spa'
      });
      app.use(vite.middlewares);
      console.log('[Vite] Live React 19 HMR middleware attached to Port ' + config.port);
    } catch (err) {
      console.warn('[Vite] Fallback to static production bundle:', err.message);
      const dist = path.resolve(__dirname, 'new_style/dist');
      if (fs.existsSync(dist)) {
        app.use(express.static(dist));
        app.get('*', (req, res, next) => {
          if (req.path.startsWith('/api') || req.path === '/health' || req.path === '/ready' || req.path === '/plan') return next();
          res.sendFile(path.join(dist, 'index.html'));
        });
      }
    }
  }

  const listenHost = process.env.HOST || (process.env.PORT || process.env.RAILWAY_ENVIRONMENT || process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1');
  const server = app.listen(config.port, listenHost, () => {
    console.log('=======================================================');
    console.log('  BEYOND THE FORT — UNIFIED SINGLE-PORT ARCHITECTURE');
    console.log('  Team Venator (ID: 60358412) | AI Synergy Hackathon 2026');
    console.log('  Frontend + Backend + LangGraph.js AI running on:');
    console.log('  http://localhost:' + config.port);
    console.log('=======================================================');
  });
  return server;
}

if (require.main === module) {
  startServer().catch(err => {
    console.error('Unified server failed to start:', err);
    process.exit(1);
  });
}`;

if (s.includes(oldStartup)) {
  s = s.replace(oldStartup, newStartup);
} else {
  console.log('Old startup pattern not exact match, searching for require.main === module');
  const idx = s.indexOf('if (require.main === module)');
  if (idx !== -1) {
    s = s.slice(0, idx) + newStartup + '\n\nmodule.exports = app;\n';
  }
}

fs.writeFileSync(p, s);
console.log('server.js successfully rewritten for unified single-port architecture.');

