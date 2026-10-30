# Authorization

## Roles

| Capability | Guest | Registered user | Administrator |
| --- | --- | --- | --- |
| Browse POIs / public attraction details | Yes | Yes | Yes |
| Ask public tourism questions in Tansen AI | Yes, rate-limited | Yes | Yes |
| Generate personalized plans | No | Yes | Yes |
| Read, update, or delete saved plans | No | Own records only | Own records only |
| Read/update own email | No | Yes | Yes |
| List users/change roles | No | No | Yes |

Authorization is enforced by Express middleware and owner-scoped service queries; frontend visibility is not relied on. Profile update rejects `role` and `status`. Single itinerary lookup (`GET /api/itineraries/:id`), updates (`PUT /api/itineraries/:id`), and removals (`DELETE /api/itineraries/:id`) strictly require matching `userId` ownership; querying an itinerary ID belonging to another user returns `404 Not Found` without disclosing whether the record exists (preventing IDOR and resource existence enumeration). Public chat planning requests are rejected unless the request has a registered session.

## Administrator bootstrap

Set `INITIAL_ADMIN_EMAIL` in the private environment before first startup, then register that exact email. If no administrator exists, the first matching registration receives administrator role. Remove the setting after bootstrap. If an administrator is unavailable, the account store must be changed through an authorized operational procedure; there is no unauthenticated role grant endpoint. Admin APIs are `GET /api/admin/users` and `PATCH /api/admin/users/:id/role`; role changes are persisted, and an administrator cannot demote their own account.

## Limits

There are only `guest`, `user`, and `administrator` roles. Admin content-management, account suspension, MFA, and audit-event persistence are not implemented. Administrator login has the same password policy and rate limits as other users; no stronger second factor is configured. See [API_DOCUMENTATION.md](API_DOCUMENTATION.md).
