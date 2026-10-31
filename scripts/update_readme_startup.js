const fs = require('fs');
let c = fs.readFileSync('README.md', 'utf8');

const oldBlock = `### Starting the Application

Run each service in a separate terminal from the repository root:
\`\`\`bash
npm start
\`\`\`

\`\`\`powershell
.\\.venv\\Scripts\\python.exe .\\multiagent-engine\\server.py
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.`;

const newBlock = `### Starting the Application (Single-Port :5173)

Launch the unified system with one command from the repository root:
\`\`\`bash
# Development (with Vite HMR)
npm run dev

# Production
npm run build
npm start
\`\`\`

Open [http://localhost:5173](http://localhost:5173) in your browser.`;

// Replace regardless of CRLF or LF
const normC = c.replace(/\r\n/g, '\n');
const normOld = oldBlock.replace(/\r\n/g, '\n');
const normNew = newBlock.replace(/\r\n/g, '\n');

if (normC.includes(normOld)) {
  const updated = normC.replace(normOld, normNew);
  fs.writeFileSync('README.md', updated, 'utf8');
  console.log('README.md startup updated successfully');
} else {
  console.log('Target block not found');
}

