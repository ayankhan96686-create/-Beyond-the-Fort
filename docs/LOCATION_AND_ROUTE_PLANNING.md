# Location and Route Planning

Updated: 2026-10-30. This describes the active Express/EJS planner and Flask/LangGraph backend.

## Location selection and privacy

The Plan Your Visit form supports three ways to set coordinates:

- **Current location:** the browser Geolocation API is called only after the user clicks “Use my current location”. The browser decides whether to grant permission. The request is one-time, high accuracy is requested, and the UI reports denied, unavailable, and timed-out cases while leaving map/coordinate options usable.
- **Map pin:** choose Start or End, then click/tap the Leaflet map. Pins have separate Start and End markers and can be cleared.
- **Manual coordinates:** enter latitude, longitude and a human-readable label. Bounds and finite numeric values are checked in the browser and again in Python.

“Return to my starting point” is selected initially. When enabled, the endpoint sent to the API is a copy of the selected start coordinates. When disabled, an independent end point is required. Changing either point requires submitting a fresh plan; the saved itinerary is tab-local.

Location is not continuously tracked. The chosen coordinates are held with the itinerary in this tab's `sessionStorage` and sent to the backend only for planning. There is no account or server-side itinerary persistence. Clear this tab's site data/session storage to remove the saved itinerary and coordinates. Application logs summarize route counts and do not include endpoint coordinates.

## API location shape

```json
{
  "label": "User-selected place",
  "latitude": 26.2,
  "longitude": 78.1,
  "source": "map_pin",
  "accuracy_m": 25,
  "captured_at": "2026-10-30T10:00:00Z"
}
```

`latitude` must be finite and between -90 and 90; `longitude` must be finite and between -180 and 180. `source` supports `browser_geolocation`, `map_pin`, `manual_coordinates`, `manual_geocoded`, and the backward-compatible `legacy_config`. Optional `place_id`, accuracy and capture time are validated/retained. The server does not treat these values as proof that an attraction claim is verified.

`start_location`, `end_location`, and `return_to_start` pass through Express `POST /api/v1/tourism-plan` to Flask `POST /plan`. Legacy callers using `return_location_coordinates` or `origin` remain supported and default to return-to-start. The response carries the normalized endpoints and return choice.

## Address lookup status

No geocoding adapter or address-search endpoint exists, and there is no geocoding configuration variable. The UI therefore does not claim a typed place name was resolved. A label entered with coordinates is descriptive only. To select a place without known coordinates, use the map pin; to support address autocomplete later, configure and test a geocoding provider with its required attribution, rate limits and privacy terms.

## Route and deterministic feasibility

The Route & Time node requests directed route data for the selected network of points: start, each researched attraction, and destination. This gives the optimizer actual directed candidates for `start → stop_1 → ... → stop_N → end`; Mapbox routes each direction independently. `direct_route_only=true` skips research and returns just a direct start-to-destination route, when feasible. Normal itinerary search remains capped at three selected stops.

The optimizer sums initial/inter-stop/final travel durations, visit dwell, and a fixed 25% safety buffer. It validates the total against both the available-minute window and the hard destination deadline. If a required live provider route fails, the workflow returns `provider_error`; synthetic Haversine estimates are used only when `DEMO_MODE=true` and are labelled inference. Budget-constrained records with unknown costs remain rejected.

The response exposes the selected `route_legs`, distance/travel/visit totals, safety buffer, estimated destination arrival and deadline. Directed lookups run in a bounded worker pool (default 8) to keep multi-stop planning within the proxy's 45-second timeout. The map shows Start, ordered numbered stops and End, fits its viewport to available points, and displays only provider-returned GeoJSON LineString geometry. If geometry is absent, markers remain visible and no connecting road line is drawn. OSM tiles display OpenStreetMap attribution.

Mapbox driving time is not mode-specific for auto-rickshaw, e-rickshaw or cab and is not traffic-aware. Mapbox Directions does not provide the requested public-transit route mode in this adapter. Live availability and traffic are not guaranteed.

## Verification

- `.venv\Scripts\python.exe -m pytest -q multiagent-engine -m "not integration"` — PASS, 53 passed and 1 integration test deselected. The tests include coordinate validation, both endpoint routing, return-to-start normalization, route ordering, destination deadline rejection and feasible full-leg fixtures. Provider fixtures are synthetic test data, not live routing.
- `node --test tests/acceptanceTests.test.js` — PASS, 14 passed, including Express forwarding of the start/end contract.
- `node --check public\js\main.js` and `node --check public\js\itinerary.js` — PASS.
- Browser GPS permission behavior was not automated; it requires a real browser's permission prompt. The browser code uses the one-time Geolocation API only inside the explicit click handler.
- A live single-leg Mapbox request using independent start and end coordinates succeeded in the location implementation check; it returned Mapbox driving geometry, 2.02 km and 8 minutes. The full multi-stop chat itinerary was not live-tested in that check; do not treat mocked multi-leg tests as live-provider proof.
