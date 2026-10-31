# Authentication

## Available flow

Express provides `/register`, `/login`, `/account`, `GET /api/auth/me`, and `POST /api/auth/logout`. Registration requires a valid email and a 12–128 character password with lowercase, uppercase, and numeric characters. Passwords are hashed using Node's built-in scrypt (`N=32768`, `r=8`, `p=1`, 64-byte output, random 16-byte salt). Plaintext passwords are not written to disk. Login uses a generic invalid-credentials response and rotates the session identifier. Failed login attempts are tracked per normalized account email: 5 consecutive failed attempts trigger an automatic 15-minute temporary lockout (`HTTP 429 AUTH_ACCOUNT_LOCKED`), mitigating targeted brute-force and credential-stuffing attacks.

## Sessions and CSRF

The browser receives a random opaque 256-bit session ID in an HttpOnly, SameSite=Lax cookie. Production adds Secure. Session records stay in Express process memory for up to 12 hours and clear on restart. Mutating routes require `X-CSRF-Token` equal to both the CSRF cookie and the current session token. A token is returned at `GET /api/auth/csrf` and is also available to same-origin browser code through a non-HttpOnly cookie.

Logout invalidates the current server record and issues a fresh guest session. Password reset and email verification are not implemented because no mail service is configured. Account creation is immediate; no recovery flow exists. Account email changes are available in `/account`; password changes and account deletion are not implemented.

## Storage and operation

Account records and password hashes live in the private file configured by `AUTH_USERS_FILE` (local default: ignored `data/.auth-users.json`). Restrict OS and backup access. Sessions are not shared across Node processes. Production startup requires an explicit persistent storage path. For configuration and limitations, see [ENVIRONMENT_SETUP.md](ENVIRONMENT_SETUP.md) and [DEPLOYMENT.md](DEPLOYMENT.md).
