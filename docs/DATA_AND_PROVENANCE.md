# Data and Provenance

## Sources and loading paths

| Data | Location / loader | Records and use | Evidence limits |
| --- | --- | --- | --- |
| Curated Gwalior POIs | `data/gwalior_curated_pois.json`; Express `config/db.js`; Python `agents/research.py` | 12 records with stable IDs, categories, coordinates, dwell-time labels, operating-hour fields and community notes. | Current file has no `source_url`, `source_reference`, or `cost_estimate`. `VERIFIED_OWNER` / `VERIFIED_AUDITOR` values are stored labels, not independently supported audit records in this repository. |
| Supplemental Beyond the Fort export | `data/beyond_the_fort_places.json`; adapted in Python `agents/research.py:_adapt_supplemental_record` | 179 Apify Google Maps listing rows; tourism-relevant, coordinate-bearing rows may be matched. `googleMapsUrl` is copied to `source_url`; a generic source reference records the supplied export. | Listings are unverified. URLs, ratings, website, phone, address, and scraped hours are not confirmed facts. The adapter assigns a 30-minute heuristic visit default. |
| Itinerary photos | Wikimedia Commons URLs from `agents/research.py`; credits in `data/IMAGE_ATTRIBUTION.md` | Exact-page images for some known venues; category images are labeled representative. | A representative image does not depict a specific listing. Respect the recorded author/license and source-page links. |

The Express `/api/v1/pois` endpoint serves only the 12 curated records. The Flask `/attractions` endpoint and Research node load both JSON files. No database client or persistence layer is active; `MONGODB_URI` is not used to read/write these records.

## Search and planning behavior

- Research filters by city and category/lexical interest. It excludes placeholder/synthetic records and caps candidates at six to limit routing requests.
- Research does not apply budget filtering; the itinerary node applies it after matching. Unknown price is not treated as zero. All current rows lack known costs, so a budget request cannot be validated against these files.
- Imported listing dwell time is a planning heuristic, not source data. The agent returns a warning when such rows match.
- Curated hours use normalized `{open, close}` values when available. Supplemental scraped opening-hour arrays are retained as evidence but are not enforced as verified schedules. No date-specific calendar exists.

## Evidence classifications

- **`VERIFIED`:** reserved in the active planner for a route estimate returned by a live configured routing provider. It means the provider returned a route response, not that actual traffic or arrival is guaranteed.
- **`STAKEHOLDER_PROVIDED`:** place claim comes from a supplied record or status label without an independently checked source.
- **`UNVERIFIED`:** listing explicitly carries an unverified source status, including the imported Google Maps records.
- **`AI_INFERENCE`:** synthetic demo route estimates and heuristic dwell-time claims.

The verification node was repaired to fail closed: a non-empty URL/reference or a status containing “AUDITOR” does not promote place claims. No source URLs are fetched or fact-checked automatically. Add an auditable source-check process before presenting POI claims as independently verified.

## Dataset actions before public use

1. Confirm each business/site exists and that its address and coordinates are correct.
2. Record source URL, check date, reviewer, and fact supported for each public claim.
3. Confirm opening hours for the chosen date and add explicit cost estimates if the budget feature should recommend places.
4. Retain the existing image credits and clearly distinguish illustrative images from exact venue photos.
