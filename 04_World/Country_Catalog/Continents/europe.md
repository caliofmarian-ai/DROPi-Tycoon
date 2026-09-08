# Country Catalog Chapter — Europe

Status: Generated audit manifest; country-by-country maintenance surface.

Parent: #446

## Source contract
- runtime catalog version: `1.1.0`
- Natural Earth upstream commit: `ca96624a56bd078437bca8184e78163e5039ad19`
- every node coordinate remains a source coordinate; this manifest does not reposition places.

## Chapter summary
- countries/territories: **39**
- representative nodes: **290**
- structural PASS: **37**
- REVIEW: **2**
- documented GAP: **0**

## Country-by-country manifest

| ID | Country / territory | Capital | Nodes | Slots | State | Notes |
|---:|---|---|---:|---|---|---|
| 008 | Albania | Tirana | 9 | CAPITAL, N, E, S, W, NE, SE, SW, NW | **PASS** | structural/source checks passed |
| 040 | Austria | Vienna | 8 | CAPITAL, N, E, S, W, NE, SE, SW | **PASS** | structural/source checks passed |
| 112 | Belarus | Minsk | 9 | CAPITAL, N, E, S, W, NE, SE, SW, NW | **PASS** | structural/source checks passed |
| 056 | Belgium | Brussels | 9 | CAPITAL, N, E, S, W, NE, SE, SW, NW | **PASS** | structural/source checks passed |
| 070 | Bosnia and Herz. | Sarajevo | 6 | CAPITAL, N, E, S, W, NE | **PASS** | structural/source checks passed |
| 100 | Bulgaria | Sofia | 9 | CAPITAL, N, E, S, W, NE, SE, SW, NW | **PASS** | structural/source checks passed |
| 191 | Croatia | Zagreb | 9 | CAPITAL, N, E, S, W, NE, SE, SW, NW | **PASS** | structural/source checks passed |
| 203 | Czechia | Prague | 9 | CAPITAL, N, E, S, W, NE, SE, SW, NW | **PASS** | structural/source checks passed |
| 208 | Denmark | Kobenhavn | 7 | CAPITAL, N, E, S, W, NE, SE | **PASS** | structural/source checks passed |
| 233 | Estonia | Tallinn | 7 | CAPITAL, N, E, S, W, NE, SW | **PASS** | structural/source checks passed |
| 246 | Finland | Helsinki | 9 | CAPITAL, N, E, S, W, NE, SE, SW, NW | **PASS** | structural/source checks passed |
| 250 | France | Paris | 9 | CAPITAL, N, E, S, W, NE, SE, SW, NW | **PASS** | structural/source checks passed |
| 276 | Germany | Berlin | 9 | CAPITAL, N, E, S, W, NE, SE, SW, NW | **PASS** | structural/source checks passed |
| 300 | Greece | Athens | 9 | CAPITAL, N, E, S, W, NE, SE, SW, NW | **PASS** | structural/source checks passed |
| 348 | Hungary | Budapest | 9 | CAPITAL, N, E, S, W, NE, SE, SW, NW | **PASS** | structural/source checks passed |
| 352 | Iceland | Reykjavik | 8 | CAPITAL, N, E, S, W, NE, SW, NW | **PASS** | structural/source checks passed |
| 372 | Ireland | Dublin | 9 | CAPITAL, N, E, S, W, NE, SE, SW, NW | **PASS** | structural/source checks passed |
| 380 | Italy | Rome | 9 | CAPITAL, N, E, S, W, NE, SE, SW, NW | **PASS** | structural/source checks passed |
| None | Kosovo | Pristina | 3 | CAPITAL, N, S | **REVIEW** | #478: nonstandard geometry identity and neutral status semantics required: Kosovo must not depend on a None catalog key or an implied universally settled sovereignty position; unstable/non-numeric geometry ID |
| 428 | Latvia | Riga | 6 | CAPITAL, N, E, W, NE, SW | **PASS** | structural/source checks passed |
| 440 | Lithuania | Vilnius | 5 | CAPITAL, N, E, W, NE | **PASS** | structural/source checks passed |
| 442 | Luxembourg | Luxembourg | 3 | CAPITAL, N, E | **PASS** | structural/source checks passed |
| 807 | Macedonia | Skopje | 3 | CAPITAL, N, E | **PASS** | structural/source checks passed |
| 498 | Moldova | Chisinau | 5 | CAPITAL, N, E, S, NE | **PASS** | structural/source checks passed |
| 499 | Montenegro | Podgorica | 1 | CAPITAL | **PASS** | structural/source checks passed |
| 528 | Netherlands | Amsterdam | 9 | CAPITAL, N, E, S, W, NE, SE, SW, NW | **PASS** | structural/source checks passed |
| 578 | Norway | Oslo | 8 | CAPITAL, N, E, S, W, NE, SW, NW | **PASS** | structural/source checks passed |
| 616 | Poland | Warsaw | 9 | CAPITAL, N, E, S, W, NE, SE, SW, NW | **PASS** | structural/source checks passed |
| 620 | Portugal | Lisbon | 9 | CAPITAL, N, E, S, W, NE, SE, SW, NW | **PASS** | structural/source checks passed |
| 642 | Romania | Bucharest | 9 | CAPITAL, N, E, S, W, NE, SE, SW, NW | **PASS** | structural/source checks passed |
| 643 | Russia | Moscow | 8 | CAPITAL, N, E, S, NE, SE, SW, NW | **PASS** | structural/source checks passed |
| 688 | Serbia | Belgrade | 7 | CAPITAL, N, E, S, W, SW, NW | **PASS** | structural/source checks passed |
| 703 | Slovakia | Bratislava | 7 | CAPITAL, N, E, S, W, NE, NW | **PASS** | structural/source checks passed |
| 705 | Slovenia | Ljubljana | 2 | CAPITAL, N | **PASS** | structural/source checks passed |
| 724 | Spain | Madrid | 9 | CAPITAL, N, E, S, W, NE, SE, SW, NW | **PASS** | structural/source checks passed |
| 752 | Sweden | Stockholm | 9 | CAPITAL, N, E, S, W, NE, SE, SW, NW | **PASS** | structural/source checks passed |
| 756 | Switzerland | Bern | 9 | CAPITAL, N, E, S, W, NE, SE, SW, NW | **PASS** | structural/source checks passed |
| 804 | Ukraine | Kiev | 9 | CAPITAL, N, E, S, W, NE, SE, SW, NW | **PASS** | structural/source checks passed |
| 826 | United Kingdom | Hamilton | 7 | CAPITAL, N, E, S, NE, SW, NW | **REVIEW** | #469: country-identity bleed: Hamilton from a British overseas territory must not be grouped as the United Kingdom national capital |

## Interpretation
- `PASS` means automated structural and pinned-source checks pass; it does not claim final economy/transport simulation is active.
- `REVIEW` requires a dedicated country-level investigation before correction.
- `GAP` means the pinned source has no truthful representative locality and no place is invented to fill the pattern.
