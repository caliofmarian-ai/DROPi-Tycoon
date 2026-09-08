# Country Catalog Chapter — Special

Status: Generated audit manifest; country-by-country maintenance surface.

Parent: #446

## Source contract
- runtime catalog version: `1.4.0`
- Natural Earth upstream commit: `ca96624a56bd078437bca8184e78163e5039ad19`
- every node coordinate remains a source coordinate; this manifest does not reposition places.

## Chapter summary
- countries/territories: **2**
- representative nodes: **5**
- structural PASS: **0**
- REVIEW: **1**
- documented GAP: **1**

## Country-by-country manifest

| ID | Country / territory | Capital | Nodes | Slots | State | Notes |
|---:|---|---|---:|---|---|---|
| 010 | Antarctica | McMurdo Station | 5 | CAPITAL, NE, SE, SW, NW | **REVIEW** | #477: Antarctic Treaty semantics required: McMurdo Station is a research/logistics station, not a sovereign national capital; Antarctic territorial positions must remain neutral |
| 260 | Fr. S. Antarctic Lands | — | 0 | — | **GAP** | documented source coverage gap |

## Interpretation
- `PASS` means automated structural and pinned-source checks pass; it does not claim final economy/transport simulation is active.
- `REVIEW` requires a dedicated country-level investigation before correction.
- `GAP` means the pinned source has no truthful representative locality and no place is invented to fill the pattern.
