# Administrator Guide

## Bootstrap

Before registering the first admin, set `INITIAL_ADMIN_EMAIL` in the private environment. The first registration for that exact normalized email becomes administrator only if the account store contains no administrator. Remove the setting after bootstrap. Do not grant the role from a browser or profile update.

## Supported operations

- The protected `/admin` page and `GET /api/admin/users` list account IDs, emails, roles, status, and creation times. Password hashes are not returned.
- `PATCH /api/admin/users/:id/role` accepts `{ "role": "user" }` or `{ "role": "administrator" }` and checks the server session. Mutations require the CSRF header. An administrator cannot remove their own admin role.
- The admin APIs are not a full dashboard. There is no content/business management, account suspension, persisted audit trail, MFA, or account deletion endpoint.

Use a unique strong password, restrict access to the admin identity and private JSON files, and avoid sending user emails or location data into logs. Admin accounts do not currently have stronger technical authentication than registered-user accounts. See [AUTHORIZATION.md](AUTHORIZATION.md).
