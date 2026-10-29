# Archive Policy

This directory is for reversible archival of project files only after references, runtime use, ownership, and restoration paths have been checked. Never place credentials, `.env` files, private keys, or production data here.

No repository file was archived during the 2026-10-30 backend audit because the remaining unreferenced items (`n8n/`, `new_style/`, and `output/`) have unclear ownership or may be user-supplied deliverables. They remain in place and are listed for review in `docs/KNOWN_ISSUES.md`.

If a later audit proves an item obsolete, first add its original path, archived path, proof of non-use, checks, and restore command to [`removed-items/MANIFEST.md`](removed-items/MANIFEST.md). Keep the path structure under `archive/removed-items/YYYY-MM-DD/` so restoration is explicit. To restore an archived file, move it from its recorded archived path back to the original path with `Move-Item -LiteralPath`; rerun the checks listed in the manifest.
