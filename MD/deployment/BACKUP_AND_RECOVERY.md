# Backup and Recovery

## What must be backed up

Back up the private files configured by `AUTH_USERS_FILE` and `SAVED_ITINERARIES_FILE`. These contain account emails/password hashes/roles and user itineraries with exact location coordinates. Keep backups encrypted and limit access to authorized operators. Do not put them in Git or public artifacts. Provider credentials should be backed up only by the hosting secret manager.

## Current capability

The app writes these JSON files atomically using a temporary file and rename where supported. It does not create backups, encrypt files, retain versions, or test recovery automatically. In-memory sessions and chatbot history are intentionally lost on restart; users sign in again.

## Manual recovery outline

1. Stop the single Express writer before restoring files.
2. Restore both files from the same known-good snapshot to their configured paths.
3. Restrict ownership/permissions to the application identity (mode `0600` where supported); verify the files parse as JSON without printing their contents.
4. Start Express and check `/health`, `/api/auth/me`, and an authorized account-owned plan retrieval with a test account.
5. Record the snapshot date and recovery result without copying personal data into logs.

This procedure has not been tested on a production instance. Choose a backup schedule and retention period appropriate to the deployment and privacy obligations before launch.
