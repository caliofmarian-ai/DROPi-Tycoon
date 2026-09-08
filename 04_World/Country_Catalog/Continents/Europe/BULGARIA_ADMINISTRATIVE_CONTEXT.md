# Bulgaria Administrative Context

Status: governed country context for issue #524 under the Europe country-by-country rollout.

## Current administrative structure

The Bulgarian National Statistical Institute reports that, as of 31 December 2025, Bulgaria is divided into **28 administrative districts** and **265 municipalities**.

Official references:
- https://www.nsi.bg/en/press-release/administrative-territorial-and-territorial-division-of-the-republic-of-bulgaria-9010
- https://www.nsi.bg/en/statistical-data/46/1333

DROPi therefore uses the 28 administrative districts as Bulgaria's first-order Country/Region gameplay layer.

## Sofia dual-centre exception

NSI states that the city of Sofia is the administrative centre of two districts:
- Sofia-Capital, containing Stolichna Municipality;
- Sofia district, containing 22 municipalities around the capital.

The retained GeoNames snapshot source-owns `Sofia` (`geonames:727011`) under `BG.42 Sofia-Capital`. `BG.58 Sofia` contains no `PPLC` or `PPLA` locality because its real administrative centre lies outside that source-owned district surface.

DROPi therefore keeps one unambiguous Sofia locality identity:
- `BG.42 Sofia-Capital` → Sofia (`PPLC`), retaining national-capital semantics;
- `BG.58 Sofia` → Samokov (`PPL`) as a deterministic inside-district representative gameplay locality.

Samokov is **not** the administrative capital of Sofia district. It is only the source-backed representative node used to avoid duplicating Sofia into two regional ownership slots. The real administrative-centre relationship remains explicit in the country metadata.

## Density boundary

The retained GeoNames corpus contains 333 Bulgaria candidate localities. The normal regional gameplay layer publishes 28 representatives, one per district; the rest remain source/provenance infrastructure for future deeper city/locality LOD.

## Multiplayer economy rule

District nodes belong to the shared Bulgarian world economy. Development and prominence are governed by aggregate company activity, employment, production, logistics, construction/investment, transport connectivity, trade, population-economic simulation and regional/national policy.

Personal player progression does not unlock district development and this country slice defines no arbitrary numeric thresholds.
