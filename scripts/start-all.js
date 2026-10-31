/**
 * Unified Process Orchestrator for Beyond the Fort
 * Team Venator (ID: 60358412) - AI Synergy Hackathon 2026
 * 
 * [LEGACY REDIRECT]: The fragmented 3-tier architecture (ports 3000, 8000, 5173)
 * has been permanently consolidated into a single unified Node.js process listening
 * exclusively on Port 5173.
 * 
 * Invoking `node server.js` directly.
 */

console.log('===============================================================');
console.log('  Beyond the Fort — Unified Single-Port Architecture (:5173)');
console.log('  Notice: 3-tier ports (3000, 8000) have been retired.');
console.log('  Launching unified Node.js server (LangGraph.js + Vite + Express)...');
console.log('===============================================================\n');

require('../server');
