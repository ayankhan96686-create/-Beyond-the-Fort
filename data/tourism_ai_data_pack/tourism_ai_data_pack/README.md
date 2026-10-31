# Tourism AI Multi-Agent Data Pack — Gwalior MVP

This pack combines the two uploaded CSVs with supporting taxonomy, constraint rules, a source-review registry, and synthetic QA fixtures.

## Main files

- `Venator_Real_Local_Businesses_Ratings_Gwalior.csv`: 25 local business listing candidates. Several fields are missing and records need rechecking before public use.
- `AI_Synergy_Venator_Large_Dataset_500.csv`: 502 rows total: 32 `Source-backed seed` rows and 470 `Synthetic placeholder` rows. The source-backed items still require field-level verification.
- `source_backed_seed_records_review_required.csv`: the 32 source-backed seed records extracted for review. Not automatically verified.
- `synthetic_placeholder_records_test_only.csv`: synthetic records explicitly restricted to local tests/demo. Do not treat as real places.
- `gwalior_combined_candidate_catalog.csv`: normalized combination of 32 source-backed seed candidates and 25 local-business candidates; intentionally excludes the 470 placeholders. Missing facts remain empty.
- `interest_taxonomy.csv`: conceptual interest/category matching rules for the Research Agent. This is a search taxonomy, not a factual tourist database.
- `constraint_rules.csv`: planning and safety rules for the deterministic itinerary engine.
- `agent_test_cases.csv`: 20 synthetic scenarios for testing inputs, deadlines, budget, provenance and errors.
- `routing_test_fixtures_SYNTHETIC_ONLY.csv`: fake route fixtures for unit tests only. Never display these travel times as real.
- `source_registry_review_required.csv`: source URLs/provider labels copied from the provided datasets; source availability and exact field support were not independently checked while creating this pack.
- `data_quality_report.csv`: simple data quality summary.
- `dataset_manifest.json`: machine-readable inventory and safety rules.

## Important integration rules

1. Load `gwalior_combined_candidate_catalog.csv` as a candidate catalog, not as an all-verified database.
2. Filter records with `verification_status`/`use_in_recommendations` before returning results.
3. Do not recommend synthetic placeholder records as real venues. Keep them only in testing or clearly labelled demo mode.
4. Do not fill null values with invented opening hours, coordinates, prices, rating or source URLs.
5. Ratings/review counts and opening hours can change; re-check source before production display.
6. Route estimates must come from a configured routing provider in live mode. Demo fixture values are synthetic.
7. Keep citation/source provenance per claim through research, verification and final response.
8. Where data is incomplete, disclose uncertainty or ask for a valid source; do not say “verified”.

## Suggested load strategy

- Development mode: use candidate catalog plus `agent_test_cases.csv`; synthetic route fixtures may be used only by unit tests.
- Production mode: allow only records whose required fields have been checked, have traceable source metadata, and have the right to be shown. Re-check opening hours, fees, address, rating and coordinates with suitable sources.
- Keep `source_backed_seed_records_review_required.csv` separate until source checks are complete.

The supplied sources/URLs were copied from the input files; this pack does not claim to have live-checked them.
