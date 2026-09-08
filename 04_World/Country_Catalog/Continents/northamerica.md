# Country Catalog Chapter — North America

Status: Generated audit manifest; country-by-country maintenance surface.

Parent: #446

## Source contract
- runtime catalog version: `1.1.0`
- Natural Earth upstream commit: `ca96624a56bd078437bca8184e78163e5039ad19`
- every node coordinate remains a source coordinate; this manifest does not reposition places.

## Chapter summary
- countries/territories: **18**
- representative nodes: **133**
- structural PASS: **18**
- REVIEW: **0**
- documented GAP: **0**

## Country-by-country manifest

| ID | Country / territory | Capital | Nodes | Slots | State | Notes |
|---:|---|---|---:|---|---|---|
| 044 | Bahamas | Nassau | 2 | CAPITAL, N | **PASS** | structural/source checks passed |
| 084 | Belize | Belmopan | 7 | CAPITAL, N, E, S, W, NE, SE | **PASS** | structural/source checks passed |
| 124 | Canada | Ottawa | 8 | CAPITAL, E, S, W, NE, SE, SW, NW | **PASS** | structural/source checks passed |
| 188 | Costa Rica | San Jose | 7 | CAPITAL, N, E, W, NE, SE, NW | **PASS** | structural/source checks passed |
| 192 | Cuba | Havana | 9 | CAPITAL, N, E, S, W, NE, SE, SW, NW | **PASS** | structural/source checks passed |
| 214 | Dominican Rep. | Santo Domingo | 9 | CAPITAL, N, E, S, W, NE, SE, SW, NW | **PASS** | structural/source checks passed |
| 222 | El Salvador | San Salvador | 9 | CAPITAL, N, E, S, W, NE, SE, SW, NW | **PASS** | structural/source checks passed |
| 304 | Greenland | Nuuk | 7 | CAPITAL, N, E, NE, SE, SW, NW | **PASS** | structural/source checks passed |
| 320 | Guatemala | Guatemala | 9 | CAPITAL, N, E, S, W, NE, SE, SW, NW | **PASS** | structural/source checks passed |
| 332 | Haiti | Port-au-Prince | 7 | CAPITAL, N, E, S, W, NE, SE | **PASS** | structural/source checks passed |
| 340 | Honduras | Tegucigalpa | 9 | CAPITAL, N, E, S, W, NE, SE, SW, NW | **PASS** | structural/source checks passed |
| 388 | Jamaica | Kingston | 9 | CAPITAL, N, E, S, W, NE, SE, SW, NW | **PASS** | structural/source checks passed |
| 484 | Mexico | Mexico City | 9 | CAPITAL, N, E, S, W, NE, SE, SW, NW | **PASS** | structural/source checks passed |
| 558 | Nicaragua | Managua | 8 | CAPITAL, N, E, S, W, SE, SW, NW | **PASS** | structural/source checks passed |
| 591 | Panama | Panama City | 9 | CAPITAL, N, E, S, W, NE, SE, SW, NW | **PASS** | structural/source checks passed |
| 630 | Puerto Rico | San Juan | 4 | CAPITAL, N, S, W | **PASS** | structural/source checks passed |
| 780 | Trinidad and Tobago | Port-of-Spain | 2 | CAPITAL, E | **PASS** | structural/source checks passed |
| 840 | United States of America | Washington, D.C. | 9 | CAPITAL, N, E, S, W, NE, SE, SW, NW | **PASS** | structural/source checks passed |

## Interpretation
- `PASS` means automated structural and pinned-source checks pass; it does not claim final economy/transport simulation is active.
- `REVIEW` requires a dedicated country-level investigation before correction.
- `GAP` means the pinned source has no truthful representative locality and no place is invented to fill the pattern.
