# Country Catalog Chapter — Special

Status: Generated audit manifest; country-by-country maintenance surface.

Parent: #446

## Source contract
- runtime catalog version: `1.9.0`
- Natural Earth upstream commit: `ca96624a56bd078437bca8184e78163e5039ad19`
- every node coordinate remains a source coordinate; this manifest does not reposition places.
- Structural capital slot is a sparse-map data role only; player-facing political/territory semantics are governed by `game-web/public/data/country-semantic-metadata-v1.json`.

## Chapter summary
- countries/territories: **2**
- representative nodes: **5**
- structural PASS: **0**
- REVIEW: **1**
- documented GAP: **1**

## Country-by-country manifest

| ID | Country / territory | Structural capital slot | Nodes | Slots | State | Notes |
|---:|---|---|---:|---|---|---|
| 010 | Antarctica | McMurdo Station | 5 | CAPITAL, NE, SE, SW, NW | **REVIEW** | #477: Antarctic Treaty semantics implemented; McMurdo and other source-backed Antarctic facilities/localities are not exposed as a sovereign national capital; owner Android acceptance pending |
| 260 | Fr. S. Antarctic Lands | — | 0 | — | **GAP** | documented source coverage gap |

## Interpretation
- `PASS` means automated structural and pinned-source checks pass; it does not claim final economy/transport simulation is active.
- A structural `CAPITAL` slot is not automatically a player-facing national-capital claim; semantic metadata overrides the label where political, constitutional or territory status requires it.
- `REVIEW` requires a dedicated country-level investigation before correction.
- `GAP` means the pinned source has no truthful representative locality and no place is invented to fill the pattern.
