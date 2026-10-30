const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const file = process.env.SAVED_ITINERARIES_FILE || path.join(__dirname, '..', 'data', '.saved-itineraries.json');
function read() {
  try { const rows = JSON.parse(fs.readFileSync(file, 'utf8')); return Array.isArray(rows) ? rows : []; }
  catch (error) { if (error.code === 'ENOENT') return []; throw new Error('Saved plans are unavailable'); }
}
function write(rows) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = `${file}.${crypto.randomBytes(8).toString('hex')}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(rows, null, 2), { mode: 0o600, flag: 'wx' });
  try { fs.renameSync(tmp, file); } catch (error) { try { fs.unlinkSync(tmp); } catch {} throw error; }
  try { fs.chmodSync(file, 0o600); } catch {}
}
function list(userId) {
  const rows = read();
  const retained = rows.filter(x => !x.createdAt || Date.now() - Date.parse(x.createdAt) <= 365 * 86400_000);
  if (retained.length !== rows.length) write(retained);
  return retained.filter(x => x.userId === userId);
}
function get(userId, id) {
  const rows = read();
  const saved = rows.find(x => x.id === id && x.userId === userId);
  return saved ? { id: saved.id, createdAt: saved.createdAt, request: saved.request, itinerary: saved.itinerary } : null;
}
function create(userId, itinerary, request) {
  if (!itinerary || typeof itinerary !== 'object' || Array.isArray(itinerary) || !request || typeof request !== 'object' || Array.isArray(request)) return { error: 'A valid plan and request are required.' };
  const rows = read().filter(x => x.userId !== userId || Date.now() - Date.parse(x.createdAt) < 365 * 86400_000);
  if (rows.filter(x => x.userId === userId).length >= 100) return { error: 'You have reached the saved plan limit.' };
  const saved = { id: crypto.randomUUID(), userId, createdAt: new Date().toISOString(), request, itinerary };
  rows.push(saved);
  write(rows);
  return { saved };
}
function remove(userId, id) {
  const rows = read();
  const index = rows.findIndex(x => x.id === id && x.userId === userId);
  if (index < 0) return false;
  rows.splice(index, 1); write(rows); return true;
}
function update(userId, id, itinerary, request) {
  if (!itinerary || typeof itinerary !== 'object' || Array.isArray(itinerary) || !request || typeof request !== 'object' || Array.isArray(request)) return { error: 'A valid plan and request are required.' };
  const rows = read();
  const saved = rows.find(x => x.id === id && x.userId === userId);
  if (!saved) return { notFound: true };
  saved.itinerary = itinerary; saved.request = request; saved.updatedAt = new Date().toISOString();
  try { write(rows); } catch { return { error: 'Saved plans are unavailable.' }; }
  return { saved };
}
module.exports = { list, get, create, update, remove };
