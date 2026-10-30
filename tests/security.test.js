const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');

process.env.NODE_ENV = 'test';
const fixtureDir = fs.mkdtempSync(path.join(os.tmpdir(), 'beyond-fort-security-'));
process.env.AUTH_USERS_FILE = path.join(fixtureDir, 'users.json');
process.env.SAVED_ITINERARIES_FILE = path.join(fixtureDir, 'itineraries.json');
process.env.INITIAL_ADMIN_EMAIL = 'admin@example.test';
const app = require('../server');
let server, base;
before(async () => { server = app.listen(0, '127.0.0.1'); await new Promise(resolve => server.once('listening', resolve)); base = `http://127.0.0.1:${server.address().port}`; });
after(async () => { await new Promise(resolve => server.close(resolve)); fs.rmSync(fixtureDir, { recursive: true, force: true }); });

function client() {
  const jar = new Map();
  return {
    async request(url, { method = 'GET', body, csrf = true, redirect = 'follow' } = {}) {
      const headers = {};
      if (jar.size) headers.Cookie = [...jar].map(([k, v]) => `${k}=${v}`).join('; ');
      if (body !== undefined) headers['Content-Type'] = 'application/json';
      if (csrf && method !== 'GET') headers['X-CSRF-Token'] = jar.get('beyond_fort_csrf') || '';
      const response = await fetch(`${base}${url}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body), redirect });
      for (const value of response.headers.getSetCookie()) {
        const pair = value.split(';', 1)[0]; const i = pair.indexOf('='); jar.set(pair.slice(0, i), pair.slice(i + 1));
      }
      return response;
    }
  };
}

test('accounts hash passwords, rotate sessions, enforce roles, CSRF, and itinerary ownership', async () => {
  const admin = client();
  await admin.request('/api/auth/csrf');
  const adminResponse = await admin.request('/api/auth/register', { method: 'POST', body: { email: 'admin@example.test', password: 'ExcellentPass123' } });
  assert.equal(adminResponse.status, 201);
  const adminUser = (await adminResponse.json()).user;
  assert.equal(adminUser.role, 'administrator');
  const adminPage = await admin.request('/admin');
  assert.equal(adminPage.status, 200);
  assert.match(await adminPage.text(), /Account roles/);
  const accountRecord = JSON.parse(fs.readFileSync(process.env.AUTH_USERS_FILE, 'utf8'))[0];
  assert.equal(accountRecord.passwordHash.includes('ExcellentPass123'), false);
  assert.equal(accountRecord.passwordHash.length, 128);

  const guest = client(); await guest.request('/api/auth/csrf');
  const protectedPage = await guest.request('/account', { redirect: 'manual' });
  assert.equal(protectedPage.status, 302);
  assert.match(protectedPage.headers.get('location'), /^\/login\?/);
  const protectedResult = await guest.request('/api/v1/tourism-plan', { method: 'POST', body: { query: 'heritage' } });
  assert.equal(protectedResult.status, 401);
  const missingCsrf = await guest.request('/api/auth/register', { method: 'POST', csrf: false, body: { email: 'nobody@example.test', password: 'ExcellentPass123' } });
  assert.equal(missingCsrf.status, 403);

  const user = client(); await user.request('/api/auth/csrf');
  const registered = await user.request('/api/auth/register', { method: 'POST', body: { email: 'user@example.test', password: 'BetterPassword123' } });
  assert.equal(registered.status, 201);
  const userId = (await registered.json()).user.id;
  const accountPage = await user.request('/account');
  assert.equal(accountPage.status, 200);
  assert.match(await accountPage.text(), new RegExp(`data-user-id="${userId}"`));
  const ownPlan = { itinerary_stops: [{ poi_id: 'fort', name: '<img src=x>' }], status: 'feasible' };
  const saved = await user.request('/api/itineraries', { method: 'POST', body: { request: { query: '<script>x</script>' }, itinerary: ownPlan } });
  assert.equal(saved.status, 201);
  const row = (await saved.json()).data;
  assert.equal(row.userId, undefined);
  const adminSaved = await admin.request('/api/itineraries', { method: 'POST', body: { request: { query: 'private admin trip' }, itinerary: ownPlan } });
  const adminRow = (await adminSaved.json()).data;
  assert.equal((await user.request(`/api/itineraries/${adminRow.id}`, { method: 'PUT', body: { request: {}, itinerary: ownPlan } })).status, 404);
  assert.equal((await user.request(`/api/itineraries/${adminRow.id}`, { method: 'DELETE' })).status, 404);
  const userPlans = (await (await user.request('/api/itineraries')).json()).data;
  const adminPlans = (await (await admin.request('/api/itineraries')).json()).data;
  assert.equal(userPlans.length, 1);
  assert.equal(adminPlans.length, 1);
  assert.equal(userPlans[0].id, row.id);

  // Single itinerary retrieval and IDOR protection
  const ownFetch = await user.request(`/api/itineraries/${row.id}`);
  assert.equal(ownFetch.status, 200);
  assert.equal((await ownFetch.json()).data.id, row.id);
  const otherFetch = await user.request(`/api/itineraries/${adminRow.id}`);
  assert.equal(otherFetch.status, 404);
  const guestFetch = await guest.request(`/api/itineraries/${row.id}`);
  assert.equal(guestFetch.status, 401);

  assert.equal((await user.request(`/api/itineraries/${row.id}`, { method: 'DELETE' })).status, 200);
  assert.equal((await user.request('/api/admin/users')).status, 403);
  const deniedAdminPage = await user.request('/admin');
  assert.equal(deniedAdminPage.status, 403);
  assert.match(await deniedAdminPage.text(), /Access denied/);
  assert.equal((await admin.request('/api/admin/users')).status, 200);
  assert.equal((await user.request('/api/auth/profile', { method: 'PATCH', body: { email: 'user@example.test', role: 'administrator' } })).status, 400);

  // Security Headers verification
  const homeResp = await guest.request('/');
  assert.equal(homeResp.headers.get('x-powered-by'), null);
  assert.equal(homeResp.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(homeResp.headers.get('x-frame-options'), 'DENY');
  assert.match(homeResp.headers.get('content-security-policy'), /default-src 'self'/);

  // Intent input validation
  const oversizedQuery = await guest.request('/api/v1/intent/parse', { method: 'POST', body: { query: 'a'.repeat(1001) } });
  assert.equal(oversizedQuery.status, 400);
  assert.equal((await oversizedQuery.json()).code, 'INVALID_QUERY_LENGTH');
  const badMinutes = await guest.request('/api/v1/intent/parse', { method: 'POST', body: { query: 'silk', fallback_minutes: 9999 } });
  assert.equal(badMinutes.status, 400);
  assert.equal((await badMinutes.json()).code, 'INVALID_FALLBACK_MINUTES');

  // Account lockout protection after consecutive failures
  for (let i = 0; i < 5; i++) {
    const failed = await user.request('/api/auth/login', { method: 'POST', body: { email: 'user@example.test', password: 'WrongPassword123' } });
    assert.equal(failed.status, 401);
  }
  const lockedOut = await user.request('/api/auth/login', { method: 'POST', body: { email: 'user@example.test', password: 'BetterPassword123' } });
  assert.equal(lockedOut.status, 429);
  assert.equal((await lockedOut.json()).code, 'AUTH_ACCOUNT_LOCKED');

  // Reset lockout record for user to test successful authentication
  const authService = require('../services/authService');
  authService._loginAttempts.delete('user@example.test');

  const correctLogin = await user.request('/api/auth/login', { method: 'POST', body: { email: 'user@example.test', password: 'BetterPassword123' } });
  assert.equal(correctLogin.status, 200);
  const logout = await user.request('/api/auth/logout', { method: 'POST' });
  assert.equal(logout.status, 200);
  assert.equal((await (await user.request('/api/auth/me')).json()).user, null);
  assert.equal((await user.request('/api/itineraries')).status, 401);
  assert.match(crypto.randomUUID(), /^[0-9a-f-]{36}$/);
});

test('password reset enforces secure token hashing, expiration, anti-enumeration, session revocation, and unconfigured fallback', async () => {
  const rateLimit = require('../middleware/rateLimit');
  rateLimit.reset();
  const emailService = require('../services/emailService');
  const authService = require('../services/authService');
  const guest = client();
  await guest.request('/api/auth/csrf');

  // Register a user to test password reset
  const regResp = await guest.request('/api/auth/register', {
    method: 'POST',
    body: { email: 'reset-tester@example.test', password: 'InitialPassword123' }
  });
  assert.equal(regResp.status, 201);

  // 1. Unconfigured SMTP returns 503 EMAIL_NOT_CONFIGURED
  const unconfiguredResp = await guest.request('/api/auth/forgot-password', {
    method: 'POST',
    body: { email: 'reset-tester@example.test' }
  });
  assert.equal(unconfiguredResp.status, 503);
  const unconfiguredJson = await unconfiguredResp.json();
  assert.equal(unconfiguredJson.code, 'EMAIL_NOT_CONFIGURED');

  // 2. Mock email service
  let capturedEmail = null;
  let capturedResetUrl = null;
  const originalIsConfigured = emailService.isConfigured;
  const originalSendEmail = emailService.sendPasswordResetEmail;

  emailService.isConfigured = () => true;
  emailService.sendPasswordResetEmail = async (to, url) => {
    capturedEmail = to;
    capturedResetUrl = url;
    return { messageId: 'test-msg-123' };
  };

  try {
    // 3. Anti-enumeration: unknown email returns 200 with generic message without leaking account absence
    const unknownResp = await guest.request('/api/auth/forgot-password', {
      method: 'POST',
      body: { email: 'nonexistent-user@example.test' }
    });
    assert.equal(unknownResp.status, 200);
    assert.match((await unknownResp.json()).message, /If an account exists/);
    assert.equal(capturedResetUrl, null); // No email was sent

    // 4. Request reset for valid registered user
    const validResp = await guest.request('/api/auth/forgot-password', {
      method: 'POST',
      body: { email: 'reset-tester@example.test' }
    });
    assert.equal(validResp.status, 200);
    assert.equal(capturedEmail, 'reset-tester@example.test');
    assert.match(capturedResetUrl, /\/reset-password\?token=[a-f0-9]{64}$/);

    const token = new URL(capturedResetUrl).searchParams.get('token');
    assert.equal(token.length, 64);

    // 5. Invariant: Plaintext token is NEVER in users.json; only SHA-256 hash
    const users = JSON.parse(fs.readFileSync(process.env.AUTH_USERS_FILE, 'utf8'));
    const testUser = users.find(u => u.email === 'reset-tester@example.test');
    assert.ok(testUser.resetTokenHash);
    assert.equal(testUser.resetTokenHash.includes(token), false);
    const expectedHash = crypto.createHash('sha256').update(token).digest('hex');
    assert.equal(testUser.resetTokenHash, expectedHash);
    assert.ok(testUser.resetTokenExpires > Date.now());

    // 6. Token validation & weak password rejection
    const malformedResp = await guest.request('/api/auth/reset-password', {
      method: 'POST',
      body: { token: 'invalid-short-token', password: 'BrandNewPassword123' }
    });
    assert.equal(malformedResp.status, 400);

    const nonExistentResp = await guest.request('/api/auth/reset-password', {
      method: 'POST',
      body: { token: '0'.repeat(64), password: 'BrandNewPassword123' }
    });
    assert.equal(nonExistentResp.status, 400);

    const weakPasswordResp = await guest.request('/api/auth/reset-password', {
      method: 'POST',
      body: { token, password: 'weak' }
    });
    assert.equal(weakPasswordResp.status, 400);
    assert.equal((await weakPasswordResp.json()).code, 'AUTH_PASSWORD_WEAK');

    // 7. Active session revocation test: user is logged in
    const activeClient = client();
    await activeClient.request('/api/auth/csrf');
    const loginBeforeReset = await activeClient.request('/api/auth/login', {
      method: 'POST',
      body: { email: 'reset-tester@example.test', password: 'InitialPassword123' }
    });
    assert.equal(loginBeforeReset.status, 200);
    assert.equal((await activeClient.request('/account')).status, 200);

    // 8. Successful password reset
    const successReset = await guest.request('/api/auth/reset-password', {
      method: 'POST',
      body: { token, password: 'BrandNewSecurePassword#2026' }
    });
    assert.equal(successReset.status, 200);
    assert.match((await successReset.json()).message, /reset successfully/);

    // 9. Invariants after reset:
    // a) User record has resetTokenHash removed
    const updatedUsers = JSON.parse(fs.readFileSync(process.env.AUTH_USERS_FILE, 'utf8'));
    const updatedUser = updatedUsers.find(u => u.email === 'reset-tester@example.test');
    assert.equal(updatedUser.resetTokenHash, undefined);
    assert.equal(updatedUser.resetTokenExpires, undefined);

    // b) Previous active session was revoked (cannot access /account)
    const accessAfterRevoke = await activeClient.request('/account', { redirect: 'manual' });
    assert.equal(accessAfterRevoke.status, 302);

    // c) Token single-use: reuse rejected
    await guest.request('/api/auth/csrf');
    const reuseResp = await guest.request('/api/auth/reset-password', {
      method: 'POST',
      body: { token, password: 'AnotherPassword123' }
    });
    assert.equal(reuseResp.status, 400);

    // d) Old password rejected
    const oldLogin = await guest.request('/api/auth/login', {
      method: 'POST',
      body: { email: 'reset-tester@example.test', password: 'InitialPassword123' }
    });
    assert.equal(oldLogin.status, 401);

    // e) New password accepted
    const newLogin = await guest.request('/api/auth/login', {
      method: 'POST',
      body: { email: 'reset-tester@example.test', password: 'BrandNewSecurePassword#2026' }
    });
    assert.equal(newLogin.status, 200);

    // 10. Expired token rejection
    const expireUserResp = await guest.request('/api/auth/forgot-password', {
      method: 'POST',
      body: { email: 'reset-tester@example.test' }
    });
    assert.equal(expireUserResp.status, 200);
    const expiredToken = new URL(capturedResetUrl).searchParams.get('token');
    
    // Manually expire the token in memory
    const u = authService._loadUsers().find(x => x.email === 'reset-tester@example.test');
    u.resetTokenExpires = Date.now() - 1000; // Expired 1 second ago

    const tryExpired = await guest.request('/api/auth/reset-password', {
      method: 'POST',
      body: { token: expiredToken, password: 'YetAnotherPassword123' }
    });
    assert.equal(tryExpired.status, 400);
    assert.equal((await tryExpired.json()).code, 'INVALID_OR_EXPIRED_TOKEN');
  } finally {
    emailService.isConfigured = originalIsConfigured;
    emailService.sendPasswordResetEmail = originalSendEmail;
  }
});
