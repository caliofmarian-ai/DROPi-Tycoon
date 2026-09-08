# Country Catalog Chapter — Asia

Status: Generated audit manifest; country-by-country maintenance surface.

Parent: #446

## Source contract
- runtime catalog version: `1.9.0`
- Natural Earth upstream commit: `ca96624a56bd078437bca8184e78163e5039ad19`
- every node coordinate remains a source coordinate; this manifest does not reposition places.
- Structural capital slot is a sparse-map data role only; player-facing political/territory semantics are governed by `game-web/public/data/country-semantic-metadata-v1.json`.

## Chapter summary
- countries/territories: **47**
- representative nodes: **356**
- structural PASS: **41**
- REVIEW: **5**
- documented GAP: **1**

## Country-by-country manifest

| ID | Country / territory | Structural capital slot | Nodes | Slots | State | Notes |
|---:|---|---|---:|---|---|---|
| 004 | Afghanistan | Kabul | 9 | CAPITAL, N, E, S, W, NE, SE, SW, NW | **PASS** | structural/source checks passed |
| 051 | Armenia | Yerevan | 8 | CAPITAL, N, E, S, W, NE, SE, SW | **PASS** | structural/source checks passed |
| 031 | Azerbaijan | Baku | 9 | CAPITAL, N, E, S, W, NE, SE, SW, NW | **PASS** | structural/source checks passed |
| 050 | Bangladesh | Dhaka | 9 | CAPITAL, N, E, S, W, NE, SE, SW, NW | **PASS** | structural/source checks passed |
| 064 | Bhutan | Thimphu | 4 | CAPITAL, N, E, S | **PASS** | structural/source checks passed |
| 096 | Brunei | Bandar Seri Begawan | 1 | CAPITAL | **PASS** | structural/source checks passed |
| 116 | Cambodia | Phnom Penh | 9 | CAPITAL, N, E, S, W, NE, SE, SW, NW | **PASS** | structural/source checks passed |
| 156 | China | Beijing | 9 | CAPITAL, N, E, S, W, NE, SE, SW, NW | **PASS** | structural/source checks passed |
| 196 | Cyprus | Nicosia | 4 | CAPITAL, E, S, W | **PASS** | structural/source checks passed |
| 268 | Georgia | Tbilisi | 7 | CAPITAL, N, E, S, W, NE, SW | **PASS** | structural/source checks passed |
| 356 | India | New Delhi | 9 | CAPITAL, N, E, S, W, NE, SE, SW, NW | **PASS** | structural/source checks passed |
| 360 | Indonesia | Jakarta | 9 | CAPITAL, N, E, S, W, NE, SE, SW, NW | **PASS** | structural/source checks passed |
| 364 | Iran | Tehran | 9 | CAPITAL, N, E, S, W, NE, SE, SW, NW | **PASS** | structural/source checks passed |
| 368 | Iraq | Baghdad | 9 | CAPITAL, N, E, S, W, NE, SE, SW, NW | **PASS** | structural/source checks passed |
| 376 | Israel | Jerusalem | 6 | CAPITAL, W, N, E, S, SW | **REVIEW** | #467: Jerusalem source-backed structural role implemented with Israeli institutional semantics and UN final-status context; Tel Aviv-Yafo retained as major economic/metropolitan centre; owner Android acceptance pending |
| 392 | Japan | Tokyo | 9 | CAPITAL, W, N, E, S, NE, SE, SW, NW | **REVIEW** | #464: Tokyo current-capital override implemented; Kyoto retained as a non-capital representative city; owner Android Country Layer acceptance pending |
| 400 | Jordan | Amman | 8 | CAPITAL, N, E, S, W, NE, SE, NW | **PASS** | structural/source checks passed |
| 398 | Kazakhstan | Astana | 9 | CAPITAL, N, E, S, W, NE, SE, SW, NW | **PASS** | structural/source checks passed |
| 414 | Kuwait | Kuwait City | 4 | CAPITAL, N, E, W | **PASS** | structural/source checks passed |
| 417 | Kyrgyzstan | Bishkek | 9 | CAPITAL, N, E, S, W, NE, SE, SW, NW | **PASS** | structural/source checks passed |
| 418 | Laos | Vientiane | 8 | CAPITAL, N, E, S, W, NE, SE, NW | **PASS** | structural/source checks passed |
| 422 | Lebanon | Beirut | 6 | CAPITAL, N, E, S, W, SW | **PASS** | structural/source checks passed |
| 458 | Malaysia | Kuala Lumpur | 9 | CAPITAL, N, E, S, W, NE, SE, SW, NW | **PASS** | structural/source checks passed |
| 496 | Mongolia | Ulaanbaatar | 9 | CAPITAL, N, E, S, W, NE, SE, SW, NW | **PASS** | structural/source checks passed |
| 104 | Myanmar | Nay Pyi Taw | 9 | CAPITAL, SE, N, E, S, W, NE, SW, NW | **REVIEW** | #465: Nay Pyi Taw capital override implemented; Yangon retained as a major commercial city; owner Android Country Layer acceptance pending |
| XNC | N. Cyprus | — | 0 | — | **GAP** | documented source coverage gap |
| 524 | Nepal | Kathmandu | 9 | CAPITAL, N, E, S, W, NE, SE, SW, NW | **PASS** | structural/source checks passed |
| 408 | North Korea | Pyongyang | 9 | CAPITAL, N, E, S, W, NE, SE, SW, NW | **PASS** | structural/source checks passed |
| 512 | Oman | Muscat | 9 | CAPITAL, N, E, S, W, NE, SE, SW, NW | **PASS** | structural/source checks passed |
| 586 | Pakistan | Islamabad | 9 | CAPITAL, N, E, S, W, NE, SE, SW, NW | **PASS** | structural/source checks passed |
| 275 | Palestine | Ramallah | 4 | CAPITAL, SW, N, E | **REVIEW** | #468: Gaza capital flag removed; Ramallah retained as temporary government/administrative seat and East Jerusalem represented as source-governed semantic capital designation without fabricated marker; owner Android acceptance pending |
| 608 | Philippines | Manila | 9 | CAPITAL, N, E, S, W, NE, SE, SW, NW | **PASS** | structural/source checks passed |
| 634 | Qatar | Doha | 1 | CAPITAL | **PASS** | structural/source checks passed |
| 682 | Saudi Arabia | Riyadh | 9 | CAPITAL, N, E, S, W, NE, SE, SW, NW | **PASS** | structural/source checks passed |
| 410 | South Korea | Seoul | 9 | CAPITAL, N, E, S, W, NE, SE, SW, NW | **PASS** | structural/source checks passed |
| 144 | Sri Lanka | Sri Jayewardenepura Kotte | 9 | CAPITAL, SW, N, E, S, W, NE, SE, NW | **REVIEW** | #466: Sri Jayewardenepura Kotte administrative/national-capital and Colombo commercial-capital semantics implemented; owner Android Country Layer acceptance pending |
| 760 | Syria | Damascus | 9 | CAPITAL, N, E, S, W, NE, SE, SW, NW | **PASS** | structural/source checks passed |
| 158 | Taiwan | Taipei | 9 | CAPITAL, N, E, S, W, NE, SE, SW, NW | **PASS** | structural/source checks passed |
| 762 | Tajikistan | Dushanbe | 8 | CAPITAL, N, E, S, W, NE, SW, NW | **PASS** | structural/source checks passed |
| 764 | Thailand | Bangkok | 9 | CAPITAL, N, E, S, W, NE, SE, SW, NW | **PASS** | structural/source checks passed |
| 626 | Timor-Leste | Dili | 1 | CAPITAL | **PASS** | structural/source checks passed |
| 792 | Turkey | Ankara | 9 | CAPITAL, N, E, S, W, NE, SE, SW, NW | **PASS** | structural/source checks passed |
| 795 | Turkmenistan | Ashgabat | 9 | CAPITAL, N, E, S, W, NE, SE, SW, NW | **PASS** | structural/source checks passed |
| 784 | United Arab Emirates | Abu Dhabi | 7 | CAPITAL, N, E, S, W, NE, NW | **PASS** | structural/source checks passed |
| 860 | Uzbekistan | Tashkent | 9 | CAPITAL, N, E, S, W, NE, SE, SW, NW | **PASS** | structural/source checks passed |
| 704 | Vietnam | Hanoi | 9 | CAPITAL, N, E, S, W, NE, SE, SW, NW | **PASS** | structural/source checks passed |
| 887 | Yemen | Sanaa | 9 | CAPITAL, N, E, S, W, NE, SE, SW, NW | **PASS** | structural/source checks passed |

## Interpretation
- `PASS` means automated structural and pinned-source checks pass; it does not claim final economy/transport simulation is active.
- A structural `CAPITAL` slot is not automatically a player-facing national-capital claim; semantic metadata overrides the label where political, constitutional or territory status requires it.
- `REVIEW` requires a dedicated country-level investigation before correction.
- `GAP` means the pinned source has no truthful representative locality and no place is invented to fill the pattern.
