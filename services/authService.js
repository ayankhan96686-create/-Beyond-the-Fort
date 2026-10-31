const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const emailService = require('./emailService');

const USER_FILE = process.env.AUTH_USERS_FILE || path.join(__dirname, '..', 'data', '.auth-users.json');
const SESSION_TTL = 12 * 60 * 60 * 1000;
const sessions = new Map();
const loginAttempts = new Map();
const MAX_CONSECUTIVE_FAILURES = 5;
const LOCKOUT_MS = 15 * 60 * 1000;
let users = null;
const cookieName = 'beyond_fort_session';
const csrfCookieName = 'beyond_fort_csrf';

function checkLockout(email) {
  const record = loginAttempts.get(email);
  if (!record) return null;
  if (Date.now() > record.resetAt) {
    loginAttempts.delete(email);
    return null;
  }
  if (record.count >= MAX_CONSECUTIVE_FAILURES) {
    const minutesLeft = Math.ceil((record.resetAt - Date.now()) / 60000);
    return { locked: true, minutesLeft };
  }
  return null;
}

function recordLoginFailure(email) {
  const now = Date.now();
  let record = loginAttempts.get(email);
  if (!record || now > record.resetAt) {
    record = { count: 0, resetAt: now + LOCKOUT_MS };
  }
  record.count += 1;
  loginAttempts.set(email, record);
}

function recordLoginSuccess(email) {
  loginAttempts.delete(email);
}

function loadUsers() {
  if (users) return users;
  try {
    const value = JSON.parse(fs.readFileSync(USER_FILE, 'utf8'));
    users = Array.isArray(value) ? value : [];
  } catch (error) {
    if (error.code !== 'ENOENT') throw new Error('Account store could not be read');
    users = [];
  }
  return users;
}
function saveUsers() {
  fs.mkdirSync(path.dirname(USER_FILE), { recursive: true });
  const tmp = `${USER_FILE}.${crypto.randomBytes(8).toString('hex')}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(users, null, 2), { mode: 0o600, flag: 'wx' });
  try { fs.renameSync(tmp, USER_FILE); } catch (error) { try { fs.unlinkSync(tmp); } catch {} throw error; }
  try { fs.chmodSync(USER_FILE, 0o600); } catch {}
  try {
    const db = require('../config/db');
    const col = db.getUsersCollection();
    if (col && Array.isArray(users) && users.length > 0) {
      const ops = users.map(u => ({
        updateOne: {
          filter: { id: u.id },
          update: { $set: { ...u } },
          upsert: true
        }
      }));
      col.bulkWrite(ops).catch(() => {});
    }
  } catch {}
}
function parseCookies(header = '') {
  return Object.fromEntries(header.split(';').map(x => x.trim()).filter(Boolean).map(x => {
    const i = x.indexOf('='); let value = x.slice(i + 1); try { value = decodeURIComponent(value); } catch {} return [x.slice(0, i), value];
  }).filter(([key]) => key));
}
function cookieOptions(maxAge, httpOnly = true) {
  return `Path=/; SameSite=Lax; Max-Age=${maxAge}${httpOnly ? '; HttpOnly' : ''}${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`;
}
function appendCookie(res, value) {
  const current = res.getHeader('Set-Cookie');
  res.setHeader('Set-Cookie', [...(Array.isArray(current) ? current : current ? [current] : []), value]);
}
function setCsrfCookie(res, token) { appendCookie(res, `${csrfCookieName}=${encodeURIComponent(token)}; ${cookieOptions(SESSION_TTL / 1000, false)}`); }
function issueSession(res, user) {
  const token = crypto.randomBytes(32).toString('base64url');
  const csrf = crypto.randomBytes(32).toString('base64url');
  sessions.set(token, { userId: user?.id || null, role: user?.role || 'guest', csrf, expiresAt: Date.now() + SESSION_TTL });
  appendCookie(res, `${cookieName}=${token}; ${cookieOptions(SESSION_TTL / 1000)}`);
  setCsrfCookie(res, csrf);
  return sessions.get(token);
}
function expireSession(res, token) {
  if (token) sessions.delete(token);
  appendCookie(res, `${cookieName}=; ${cookieOptions(0)}`);
  appendCookie(res, `${csrfCookieName}=; ${cookieOptions(0, false)}`);
}
function sessionMiddleware(req, res, next) {
  const now = Date.now();
  for (const [key, value] of sessions) if (value.expiresAt <= now) sessions.delete(key);
  while (sessions.size >= 10_000) sessions.delete(sessions.keys().next().value);
  const cookies = parseCookies(req.headers.cookie);
  let token = cookies[cookieName];
  let session = token && sessions.get(token);
  if (!session || session.expiresAt <= Date.now()) {
    if (token) sessions.delete(token);
    if (req.method === 'GET' && (/^\/health$/.test(req.path) || /^\/api\/v1\/(?:pois|attractions\/[^/]+)$/.test(req.path) || /^\/api\/auth\/me$/.test(req.path))) {
      req.auth = { userId: null, role: 'guest', sessionToken: null, csrf: null };
      return next();
    }
    session = issueSession(res, null);
    token = res.getHeader('Set-Cookie')?.[0]?.match(/beyond_fort_session=([^;]+)/)?.[1];
  }
  req.auth = { userId: session.userId, role: session.role, sessionToken: token, csrf: session.csrf };
  if (req.auth.userId) {
    const user = loadUsers().find(x => x.id === req.auth.userId && x.status === 'active');
    if (user) { session.role = user.role; req.auth.role = user.role; req.auth.user = { id: user.id, email: user.email, role: user.role }; }
    else { session.userId = null; session.role = 'guest'; req.auth = { userId: null, role: 'guest', sessionToken: token, csrf: session.csrf }; }
  }
  setCsrfCookie(res, session.csrf);
  next();
}
function csrfProtection(req, res, next) {
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) return next();
  const cookies = parseCookies(req.headers.cookie);
  const supplied = req.get('x-csrf-token');
  if (!supplied || supplied !== cookies[csrfCookieName] || supplied !== req.auth?.csrf) return res.status(403).json({ status: 'error', code: 'CSRF_INVALID', message: 'Refresh the page and try again.' });
  next();
}
function requireUser(req, res, next) {
  if (!req.auth?.user) return res.status(401).json({ status: 'error', code: 'AUTH_REQUIRED', message: 'Please sign in to continue.' });
  next();
}
function requireAdmin(req, res, next) {
  if (!req.auth?.user) return res.status(401).json({ status: 'error', code: 'AUTH_REQUIRED', message: 'Please sign in to continue.' });
  if (req.auth.role !== 'administrator') return res.status(403).json({ status: 'error', code: 'FORBIDDEN', message: 'Administrator access is required.' });
  next();
}
function derivePassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  return new Promise((resolve, reject) => crypto.scrypt(password, salt, 64, { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 }, (err, key) => err ? reject(err) : resolve({ salt, hash: key.toString('hex') })));
}
async function register(email, password) {
  const normalized = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,254}$/.test(normalized) || normalized.length > 254) return { code: 'AUTH_EMAIL_INVALID', error: 'Enter a valid email address.' };
  if (password.length < 12 || password.length > 128 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password)) return { code: 'AUTH_PASSWORD_WEAK', error: 'Use 12–128 characters with a lowercase letter, uppercase letter, and number.' };
  const accountList = loadUsers();
  if (accountList.some(x => x.email === normalized)) return { code: 'AUTH_EMAIL_EXISTS', error: 'Unable to create an account with those details.' };
  const derived = await derivePassword(password);
  if (accountList.some(x => x.email === normalized)) return { code: 'AUTH_EMAIL_EXISTS', error: 'Unable to create an account with those details.' };
  if (accountList.some(x => x.email === normalized)) return { error: 'Unable to create an account with those details.' };
  const bootstrapEmail = String(process.env.INITIAL_ADMIN_EMAIL || '').trim().toLowerCase();
  const role = bootstrapEmail && normalized === bootstrapEmail && !accountList.some(x => x.role === 'administrator') ? 'administrator' : 'user';
  const user = { id: crypto.randomUUID(), email: normalized, role, status: 'active', passwordSalt: derived.salt, passwordHash: derived.hash, createdAt: new Date().toISOString() };
  accountList.push(user);
  try { saveUsers(); } catch { accountList.pop(); return { code: 'AUTH_UNAVAILABLE', error: 'Account service is unavailable. Try again later.' }; }
  return { user: { id: user.id, email: user.email, role: user.role } };
}
async function authenticate(email, password) {
  const normalized = String(email).trim().toLowerCase();
  const lockout = checkLockout(normalized);
  if (lockout) {
    return { error: 'AUTH_ACCOUNT_LOCKED', message: `Too many failed attempts. Account locked for ${lockout.minutesLeft} more minute(s).` };
  }
  const user = loadUsers().find(x => x.email === normalized && x.status === 'active');
  const salt = user?.passwordSalt || '00000000000000000000000000000000';
  const expected = user?.passwordHash || '00'.repeat(64);
  const derived = await derivePassword(String(password), salt);
  const actual = Buffer.from(derived.hash, 'hex');
  const expectedBuffer = Buffer.from(expected, 'hex');
  if (!user || actual.length !== expectedBuffer.length || !crypto.timingSafeEqual(actual, expectedBuffer)) {
    recordLoginFailure(normalized);
    return null;
  }
  recordLoginSuccess(normalized);
  return { id: user.id, email: user.email, role: user.role };
}
function login(req, res, user) { if (req.auth?.sessionToken) sessions.delete(req.auth.sessionToken); return issueSession(res, user); }
function logout(req, res) { expireSession(res, req.auth?.sessionToken); issueSession(res, null); }
function updateProfile(userId, email) {
  const normalized = String(email).trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,254}$/.test(normalized) || normalized.length > 254) return { code: 'AUTH_EMAIL_INVALID', error: 'Enter a valid email address.' };
  const list = loadUsers();
  if (list.some(x => x.email === normalized && x.id !== userId)) return { code: 'AUTH_EMAIL_EXISTS', error: 'That email address is already in use.' };
  const user = list.find(x => x.id === userId);
  if (!user) return { code: 'AUTH_NOT_FOUND', error: 'Account not found.' };
  user.email = normalized;
  try { saveUsers(); } catch { return { code: 'AUTH_UNAVAILABLE', error: 'Account service is unavailable.' }; }
  return { user: { id: user.id, email: user.email, role: user.role } };
}
function setRole(id, role) {
  const user = loadUsers().find(x => x.id === id);
  if (!user || !['user', 'administrator'].includes(role)) return null;
  const previous = user.role;
  user.role = role;
  try { saveUsers(); } catch { user.role = previous; return false; }
  return { id: user.id, email: user.email, role: user.role };
}

async function requestPasswordReset(email, appUrl = '') {
  const normalized = String(email || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,254}$/.test(normalized) || normalized.length > 254) {
    return { code: 'AUTH_EMAIL_INVALID', error: 'Enter a valid email address.' };
  }

  const lockout = checkLockout(normalized);
  if (lockout) {
    return { error: 'AUTH_ACCOUNT_LOCKED', message: `Too many failed attempts. Account locked for ${lockout.minutesLeft} more minute(s).` };
  }

  // If email service is not configured, fail safely and inform the user
  if (!emailService.isConfigured()) {
    return {
      code: 'EMAIL_NOT_CONFIGURED',
      error: 'Password reset email service is currently not configured by the administrator. Please contact support.'
    };
  }

  const list = loadUsers();
  const user = list.find(x => x.email === normalized && x.status === 'active');
  const genericSuccess = {
    status: 'success',
    message: 'If an account exists with that email address, a password reset link has been sent.'
  };

  if (!user) {
    return genericSuccess;
  }

  // Generate cryptographically secure random token (64 hex characters)
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour

  user.resetTokenHash = tokenHash;
  user.resetTokenExpires = expiresAt;

  try {
    saveUsers();
  } catch (error) {
    return { code: 'AUTH_UNAVAILABLE', error: 'Account service is unavailable. Please try again later.' };
  }

  const baseUrl = process.env.APP_PUBLIC_URL || appUrl || 'http://localhost:5173';
  const resetUrl = `${baseUrl.replace(/\/$/, '')}/reset-password?token=${rawToken}`;

  try {
    await emailService.sendPasswordResetEmail(user.email, resetUrl);
    return genericSuccess;
  } catch (err) {
    delete user.resetTokenHash;
    delete user.resetTokenExpires;
    try { saveUsers(); } catch {}
    console.error(JSON.stringify({ event: 'auth.reset_email_failed', error_type: err?.name || 'Error' }));
    return {
      code: 'EMAIL_SEND_FAILED',
      error: 'Unable to send password reset email at this moment. Please try again later.'
    };
  }
}

async function resetPassword(token, newPassword) {
  if (typeof token !== 'string' || !/^[a-f0-9]{64}$/i.test(token.trim())) {
    return { code: 'INVALID_TOKEN', error: 'The password reset token is invalid or has expired.' };
  }
  const cleanToken = token.trim();
  const tokenHash = crypto.createHash('sha256').update(cleanToken).digest('hex');

  const list = loadUsers();
  const now = Date.now();
  const user = list.find(x => x.resetTokenHash === tokenHash && x.resetTokenExpires && x.resetTokenExpires > now);

  if (!user) {
    return { code: 'INVALID_OR_EXPIRED_TOKEN', error: 'The password reset link is invalid or has expired. Please request a new one.' };
  }

  if (typeof newPassword !== 'string' || newPassword.length < 12 || newPassword.length > 128 || !/[a-z]/.test(newPassword) || !/[A-Z]/.test(newPassword) || !/\d/.test(newPassword)) {
    return { code: 'AUTH_PASSWORD_WEAK', error: 'Use 12–128 characters with a lowercase letter, uppercase letter, and number.' };
  }

  const derived = await derivePassword(newPassword);
  user.passwordSalt = derived.salt;
  user.passwordHash = derived.hash;
  delete user.resetTokenHash;
  delete user.resetTokenExpires;

  // Invalidate any active sessions for this user
  for (const [sessToken, sessData] of sessions.entries()) {
    if (sessData.userId === user.id) {
      sessions.delete(sessToken);
    }
  }

  try {
    saveUsers();
  } catch (error) {
    return { code: 'AUTH_UNAVAILABLE', error: 'Account service is unavailable. Please try again.' };
  }

  return { status: 'success', message: 'Your password has been reset successfully. You can now sign in with your new password.' };
}

module.exports = {
  sessionMiddleware,
  csrfProtection,
  requireUser,
  requireAdmin,
  register,
  authenticate,
  login,
  logout,
  updateProfile,
  setRole,
  requestPasswordReset,
  resetPassword,
  _sessions: sessions,
  _loginAttempts: loginAttempts,
  _loadUsers: loadUsers
};
