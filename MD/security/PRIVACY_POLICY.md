# Privacy Notice (Implementation Summary)

This page describes what the current prototype does. It is not legal advice or a claim of regulatory compliance. A public deployment should replace it with an operator-reviewed notice including the operator's identity, contact channel, jurisdiction, and provider terms.

## Data processed

- Registration stores the email address, account role/status, creation time, random password salt, and scrypt password hash. Plaintext passwords are not stored.
- A random session ID and CSRF token are held in the browser cookies; session state is held in Express process memory for up to 12 hours.
- A saved itinerary stores the submitted trip request, selected start/end coordinates, plan result, and creation time in a private local JSON file. Users can list, update, and delete their own saved plans. Records older than 365 days are removed when the store is accessed. Account deletion is not implemented.
- Chat history is held in process memory, isolated by a separate chat cookie and conversation ID, capped at 20 messages, and expires after 12 hours of inactivity. It clears on restart.
- Browser `sessionStorage` holds the currently displayed trip/map state until the tab session ends. `localStorage` is used by the existing interface for language and theme preference; it is not used for auth tokens.
- A tourism question and bounded conversation context are sent to Gemini. A planning request sends coordinates and route points to the configured routing provider through Flask. Review those providers' privacy terms before use.

## Logs, retention, and deletion

Application logs record event/error types, counts, and workflow metadata. The current implementation avoids logging passwords, tokens, chat content, or coordinates, but hosting/platform logs and third-party provider processing may have separate retention. Users can delete saved plans in Account. There is no account deletion or self-service password reset/email verification. Account email and password hash remain until an operator removes the account record.

## Storage and choices

Account and itinerary data is stored in private local JSON files, not MongoDB. Restrict file and backup access. Do not enable real geolocation unless needed; the browser requests it only after a visitor action. Avoid sending sensitive information in tourism questions. For security limitations, see [SECURITY_AUDIT.md](SECURITY_AUDIT.md).
