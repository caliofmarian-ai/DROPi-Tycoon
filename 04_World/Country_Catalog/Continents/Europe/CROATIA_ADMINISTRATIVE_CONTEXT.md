# Croatia Administrative Context

Status: governed country context for issue #526 under the Europe country-by-country rollout.

## Current county-level structure

Current Croatian Bureau of Statistics releases use **21 county-level territorial units**: 20 counties plus the City of Zagreb.

Official references:
- https://podaci.dzs.hr/2026/en/121448
- https://podaci.dzs.hr/2026/en/121350

DROPi therefore uses those 21 county-level units as Croatia's first-order Country/Region gameplay layer.

## Zagreb County seat exception

The official Zagreb County website states that the **seat of Zagreb County is Zagreb**. The City of Zagreb is, however, a separate county-level unit in the Croatian territorial structure.

Official county reference:
- https://www.zagrebacka-zupanija.hr/zupanija/

The retained GeoNames snapshot source-owns `Zagreb` (`geonames:3186886`) under `HR.21 Zagreb`, corresponding to the City of Zagreb. `HR.20 Zagreb County` contains no `PPLC` or `PPLA` because the real county seat lies outside that source-owned county surface.

DROPi therefore keeps one unambiguous Zagreb locality identity:
- `HR.21 City of Zagreb` → Zagreb (`PPLC`), retaining national-capital semantics;
- `HR.20 County of Zagreb` → Velika Gorica (`PPLA2`) as the deterministic source-backed representative inside the county.

Velika Gorica is **not** relabeled as the seat of Zagreb County. It is only the representative gameplay locality used to avoid duplicating Zagreb into two county ownership slots. The true county-seat relationship remains explicit in country metadata.

## Density boundary

The retained GeoNames corpus contains 1,215 Croatia candidate localities. The normal regional gameplay layer publishes 21 representatives, one per county-level unit. Remaining source localities stay available as provenance/reference infrastructure for future deeper city/locality LOD.

## Multiplayer economy rule

County-level nodes belong to the shared Croatian world economy. Their development and prominence are governed by aggregate company activity, employment, production, logistics, construction/investment, transport connectivity, trade, population-economic simulation and regional/national policy.

Personal player progression does not unlock county development and this country slice defines no arbitrary numeric thresholds.
