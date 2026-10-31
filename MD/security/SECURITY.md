# Security Policy

## Supported project

This repository is an actively developed tourism prototype. It has not received an independent penetration test and is not certified for production use.

## Reporting a vulnerability

Do not publish credentials, personal data, or a working exploit in a public issue. Use GitHub's private vulnerability reporting/security advisory flow for this repository if enabled; otherwise contact the repository maintainers through a private channel. This repository does not define a staffed response SLA.

Include affected component, impact, reproduction steps, and a safe proof of concept. Redact API keys, session cookies, passwords, and visitor locations. Do not test against production accounts or data.

## Current safeguards

The Express app uses scrypt password hashes, opaque HttpOnly sessions, CSRF token checks, server-side user/admin guards, per-IP in-memory rate limits, account-level 5-strike brute-force lockout, owner-scoped itinerary IDOR protection, request size limits, explicit CORS, self-hosted vendor assets under strict CSP, disabled framework advertising (`X-Powered-By: off`), and comprehensive security headers. The production Flask planner checks a shared service bearer token. Review [API_SECURITY.md](API_SECURITY.md), [SECURITY_AUDIT.md](SECURITY_AUDIT.md), and [FINAL_SECURITY_AND_AUTH_REPORT.md](FINAL_SECURITY_AND_AUTH_REPORT.md) for full technical controls and open risks.

## Credential handling

Keep `.env` and provider credentials out of source control, logs, browser bundles, screenshots, and tickets. The checked-in `.env.example` contains placeholders. A prior project audit reported that a Gemini key may have been pasted into a chat; whether it was rotated is unverified. Rotate any credential that may have been exposed, then update the private secret store.
