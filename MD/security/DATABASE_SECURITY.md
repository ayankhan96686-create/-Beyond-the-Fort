# Database and Data Storage Security

## Current stores

Tourism content is managed through a hybrid resilient architecture:
- **MongoDB Atlas (`config/db.js`):** Connected via official `mongodb` driver (v7.7.0) using connection pooling (`maxPoolSize: 10`, 5-second `serverSelectionTimeoutMS`). When connected, it queries the `pois` collection in the `tourism_gwalior` database with projection projection `{ _id: 0 }`. It automatically seeds the cloud collection with the 12 curated Gwalior POIs if empty.
- **Local Dataset Fallback:** If `MONGODB_URI` is unconfigured, or if MongoDB Atlas experiences network disruption or downtime, `config/db.js` automatically and seamlessly falls back to the local authoritative curated dataset (`data/gwalior_curated_pois.json`), ensuring zero-downtime availability.
- **Accounts & Saved Plans:** User accounts and saved itineraries use separate private JSON stores configured via `AUTH_USERS_FILE` and `SAVED_ITINERARIES_FILE` (`data/.auth-users.json` and `data/.saved-itineraries.json`), excluded from version control.

## Protections and limitations

Writes use a temporary file and rename with mode `0600` where supported. API itinerary operations filter by authenticated user ID before returning, replacing, or deleting a plan. These files are not encrypted at rest by the application, not transactionally locked, and not coordinated across Node processes. Use OS-level access controls and encrypted storage/backups. Production requires explicit persistent paths. Do not scale this design to multiple writers.

No database role separation, row-level security, managed backup job, point-in-time recovery, or tested restore exists. A file-based recovery procedure is described in [BACKUP_AND_RECOVERY.md](BACKUP_AND_RECOVERY.md); it must be adapted to the hosting platform and has not been exercised against production data.
