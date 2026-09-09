# Iceland Regional Representative Localities

Status: country slice for issue #649 under the Europe rollout.

## Government truth versus Country LOD

Iceland does **not** have an elected regional-government tier between the state and municipalities. The public-administration model has two government levels: the Icelandic state and municipal local governments (`sveitarfélög`).

DROPi therefore does not present the eight surfaces in this slice as regional governments. They are **statistical/economic Country LOD surfaces** used to keep the world map sparse, source-backed and economically meaningful.

Current authority references:

- Government of Iceland: https://www.government.is/library/01-Ministries/Prime-Ministrers-Office/WHO00082_WELLBEING_ECONOMY_AW_WEB.pdf
- Statistics Iceland — municipalities and urban nuclei: https://statice.is/statistics/population/inhabitants/municipalities-and-urban-nuclei/
- Statistics Iceland — Population 1 January 2026: https://www.statice.is/publications/news-archive/inhabitants/population-1-january-2026/
- Statistics Iceland — regional/municipal population publication: https://www.statice.is/publications/news-archive/inhabitants/population-by-regions-and-municipalities-1-january-2026/
- Icelandic Association of Local Authorities: https://www.samband.is/nanar-um-sveitarfelogin

## 2026 municipality-count timing

Two different 2026 counts are both valid for their stated dates:

- Statistics Iceland reported **62 municipalities on 1 January 2026**.
- The Icelandic Association of Local Authorities reports **61 municipalities after the 16 May 2026 local-election/amalgamation state**.

The sparse Country LOD count remains **8** because it represents statistical/economic regional surfaces, not municipalities.

## Retained GeoNames audit

Retained snapshot: `source-geonames-cities500-2026-09-08-f3cda4f9`.

- source country: `IS`;
- retained Iceland populated-place candidates: **50**;
- retained GeoNames admin1 surfaces: **8**;
- admin1 surfaces with candidate coverage: **8 / 8**;
- direct `PPLC/PPLA` selections: **8**;
- governed fallbacks: **0**;
- invented coordinates: **0**;
- high-density gameplay import: **disabled**.

Retained source hashes:

- `cities500.zip`: `f3cda4f9d256d90045121fb8eebad3ed91695c32370ed93b50fbe0cb616e2bbd`
- `admin1CodesASCII.txt`: `590651498043f674accda2b7f46d21286cda0e290b02f8561c5005eee9a5448c`

Candidate counts by retained admin1 surface:

| GeoNames admin1 | Source surface | Candidates |
|---|---|---:|
| IS.39 | Capital Region | 8 |
| IS.43 | Southern Peninsula | 6 |
| IS.45 | West | 7 |
| IS.44 | Westfjords | 3 |
| IS.41 | Northwest | 3 |
| IS.40 | Northeast | 6 |
| IS.38 | East | 8 |
| IS.42 | South | 9 |
| **Total** |  | **50** |

## Statistics Iceland / GeoNames crosswalk

The eight retained GeoNames surfaces align with the eight statistical regional groupings used for the sparse model. One current-name presentation crosswalk is required:

- `IS.43` is retained by GeoNames as **Southern Peninsula**;
- Statistics Iceland currently presents the region in English as **Southwest**;
- DROPi renders `Southwest` while preserving the retained GeoNames source identity and source reference.

This is a name crosswalk only. It does not create a new administrative authority or boundary.

## Representative set

| Admin1 | DROPi statistical/economic LOD surface | Representative locality | Feature | Selection | Source ref |
|---|---|---|---|---|---|
| IS.39 | Capital Region | Reykjavík | PPLC | source-first-order-seat-role | geonames:3413829 |
| IS.43 | Southwest | Keflavík | PPLA | source-first-order-seat-role | geonames:3415496 |
| IS.45 | West | Borgarnes | PPLA | source-first-order-seat-role | geonames:3418076 |
| IS.44 | Westfjords | Ísafjörður | PPLA | source-first-order-seat-role | geonames:3415667 |
| IS.41 | Northwest | Sauðárkrókur | PPLA | source-first-order-seat-role | geonames:2627309 |
| IS.40 | Northeast | Akureyri | PPLA | source-first-order-seat-role | geonames:2633274 |
| IS.38 | East | Egilsstaðir | PPLA | source-first-order-seat-role | geonames:2632132 |
| IS.42 | South | Selfoss | PPLA | source-first-order-seat-role | geonames:3413604 |

Reykjavík is the only representative with `national-capital-and-regional-node` presentation semantics. Its municipality remains a municipality at Iceland's local-government level; the capital role does not invent a regional-government tier.

## Shared multiplayer economy

All eight representative nodes use:

- `authority=shared-regional-national-multiplayer-economy`;
- `personalPlayerProgressionUnlock=false`;
- `numericThresholdsDefined=false`.

Representative prominence and development are shared-world economic outcomes driven by future company activity, employment, production, logistics, construction, investment, infrastructure, trade and policy. They are not personal player-level unlocks.

## Runtime geometry boundary

The current DROPi 110m topology represents Iceland as geometry `352`, type **Polygon**, with **1** top-level component.

The eight Country LOD identities remain statistical/economic catalog identities. This slice does not fabricate internal regional polygons, municipal polygons, arbitrary economic thresholds or a high-density settlement marker dump.
