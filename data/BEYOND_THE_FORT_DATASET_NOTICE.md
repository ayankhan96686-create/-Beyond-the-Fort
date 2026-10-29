# Supplemental dataset notice

- File: `beyond_the_fort_places.json`
- Records: 179, copied from the supplied Beyond_The_Fort_Full_Project backend dataset.
- Source type: Apify Google Maps business-listing export.
- Source verification: listings are labeled `Unverified` in the source export. Do not represent ratings, addresses, phone numbers, websites, or hours as confirmed.
- Agent use: records with coordinates and tourism-relevant categories can be matched as candidates. The agent uses a 30-minute visit planning default because the source has no dwell-time field; this value is a heuristic, not source data.
- Scope: this file is supplemental. The original `gwalior_curated_pois.json` and source records are retained separately.
- Before travel or public release, independently confirm place status and opening hours.
