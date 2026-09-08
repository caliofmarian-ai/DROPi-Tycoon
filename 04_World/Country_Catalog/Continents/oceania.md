# Country Catalog Chapter — Oceania

Status: Generated audit manifest; country-by-country maintenance surface.

Parent: #446

## Source contract
- runtime catalog version: `1.4.0`
- Natural Earth upstream commit: `ca96624a56bd078437bca8184e78163e5039ad19`
- every node coordinate remains a source coordinate; this manifest does not reposition places.

## Chapter summary
- countries/territories: **7**
- representative nodes: **37**
- structural PASS: **7**
- REVIEW: **0**
- documented GAP: **0**

## Country-by-country manifest

| ID | Country / territory | Capital | Nodes | Slots | State | Notes |
|---:|---|---|---:|---|---|---|
| 036 | Australia | Canberra | 9 | CAPITAL, N, E, S, W, NE, SE, SW, NW | **PASS** | structural/source checks passed |
| 242 | Fiji | Suva | 4 | CAPITAL, N, S, W | **PASS** | structural/source checks passed |
| 540 | New Caledonia | Noumea | 1 | CAPITAL | **PASS** | structural/source checks passed |
| 554 | New Zealand | Wellington | 9 | CAPITAL, N, E, S, W, NE, SE, SW, NW | **PASS** | structural/source checks passed |
| 598 | Papua New Guinea | Port Moresby | 9 | CAPITAL, N, E, S, W, NE, SE, SW, NW | **PASS** | structural/source checks passed |
| 090 | Solomon Is. | Honiara | 3 | CAPITAL, SE, NW | **PASS** | structural/source checks passed |
| 548 | Vanuatu | Port Vila | 2 | CAPITAL, NE | **PASS** | structural/source checks passed |

## Interpretation
- `PASS` means automated structural and pinned-source checks pass; it does not claim final economy/transport simulation is active.
- `REVIEW` requires a dedicated country-level investigation before correction.
- `GAP` means the pinned source has no truthful representative locality and no place is invented to fill the pattern.
