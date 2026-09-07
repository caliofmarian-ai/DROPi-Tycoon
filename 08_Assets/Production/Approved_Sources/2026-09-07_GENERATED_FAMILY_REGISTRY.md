# DROPi Tycoon — 2026-09-07 Generated Family Registry

Version: 1.0.0
Status: APPROVED_SOURCE REGISTRY
Owner approval: 2026-09-07
Governance: #409, #411, #413, #414
Canonical style: Stylized 3D Pre-Rendered Mobile World

## Purpose

Record the owner-approved visual families already produced during the 2026-09-07 asset session so future work reuses or derives from them instead of generating duplicate family boards.

This registry records semantic/source-family approval. Individual objects still require the normal promotion path before runtime use.

## Registry

| Family ID | Approved source family | Coverage examples | Current state | Future rule |
|---|---|---|---|---|
| SRC-20260907-001 | Initial game asset audit board | brand, player, drone, vehicles, buildings, environment, UI, items, map/status/misc seeds | APPROVED_SOURCE; 50 legacy individual crops already reconciled | reuse existing crops; derive only missing runtime forms |
| SRC-20260907-002 | Civic / public / special institutions | city hall, courthouse, hospital, clinic, fire, police, school, university, library, museum, stadium, mall, bank, post, R&D, data center, hotel, church, logistics HQ, recycling, emergency command, customs, utilities, telecom, tourism, transit/business center | APPROVED_SOURCE | do not regenerate broad civic board; crop/derive required building only |
| SRC-20260907-003 | Multimodal logistics infrastructure | airport terminal/control, aircraft apron, cargo terminal, hangar, runway, helipad, train station, rail freight, metro, bus depot, truck depot, toll, container port, river port, dry dock, ferry, marina, customs, distribution center, warehouse, cold storage, fuel depot, parking, intermodal hub | APPROVED_SOURCE | use as infrastructure source family; final dimensions follow executable footprint contracts |
| SRC-20260907-004 | Transport fleet atlas | passenger/cargo aircraft, turboprops, helicopters, drones, locomotives, passenger trains, freight wagons, buses, vans, trucks, municipal/special vehicles, cranes, container ships, bulk ships, ferries, tug/pilot/police/coast-guard craft, yachts/workboats | APPROVED_SOURCE | derive only transport actually needed by current mechanics |
| SRC-20260907-005 | Industrial / energy / utility / production facilities | general factory, foundry, food, bakery, dairy, bottling, textile, furniture, electronics, chemical, recycling, waste, solar, wind, hydro, substation, water, telecom, server/data, refinery, biogas, gas, nuclear, quarry, mining, sawmill, greenhouse, cold storage, service garages, cement, concrete/asphalt, bricks, glass, paper, plastics, battery, supply depot | APPROVED_SOURCE | crop/derive per implemented industry chain; no replacement mega-board |
| SRC-20260907-006 | World city architecture / district kit | European historic, civic landmarks, modern towers/offices/mall/hotel/HQ, apartments, suburban, Mediterranean/coastal, resort, rural/farm, mountain/northern, desert, East-Asian commercial, industrial/public-service foundations | APPROVED_SOURCE | use to differentiate city archetypes; generate only missing region/footprint required by executable city slice |
| SRC-20260907-007 | Map / network module kit | road straights/curves/intersections/roundabout/highway/ramp/bridge/tunnel, rail track/switch/crossing/platform/station, runway/taxiway/apron/control tower, river/canal/quay/container terminal/breakwater, parking/sidewalk/bike/bus, utilities, zone markers, pins/routes/nodes, terrain/decorations | APPROVED_SOURCE | derive map/world modules as mechanics require them |
| SRC-20260907-008 | Human workforce specialists v2 | farmer, veterinarian, mechanic, electrician, installer, construction/crane, warehouse, docker/sailor, pilot, train driver, chef/baker, researcher, medical, firefighter, police, office manager, courier/rider, engineer, factory, retail/cashier, cleaner, miner, IT/technical, teacher, gardener/environment specialist | APPROVED_SOURCE | preserve identity diversity; create directional/animation derivatives only for active roles |
| SRC-20260907-009 | Nature / biomes / animals / farm system v2 | deciduous/conifer/tropical trees, shrubs/flowers, desert/wetland plants, terrain/biomes, crops, orchards, vineyards, greenhouse crops, farm animals, pets, wildlife, fish, bees/apiary, machinery, farm props/buildings, silos, fences, water features | APPROVED_SOURCE | reuse by biome/farm feature; no speculative additional species boards |
| SRC-20260907-010 | Products & Cargo Atlas Vol. 2 | vegetables, fruits, dairy, bakery/cereals, meat, seafood, drinks, clothing, furniture, construction materials, metals, tools, electronics/appliances, medical, cosmetics, cleaning, toys, components, agriculture/gardening, convenience foods, pallets/containers/packaging | APPROVED_SOURCE | map products to economy/logistics when implemented; derive only needed package/cargo forms |

## Deduplication invariant

Before any new source generation, search this registry plus candidate/runtime directories. If the semantic family already exists, first attempt a governed derivative.

## Binary/source-ingestion note

Some approved family boards may exist as session-produced source artifacts before every binary source has been mirrored into the repository. That does **not** authorize regenerating the same family. Issue #413 owns harvesting/ingestion from already-produced sources; issue #414 owns duplicate prevention.

## Promotion rule

An object from a registered source family may become runtime-visible only after:

1. executable requirement exists;
2. source/crop is selected;
3. derivative meets exact runtime contract;
4. derivative is stored in the runtime asset path;
5. code wiring and tests pass;
6. PR merges;
7. Owner verifies the player-visible result on Android when required.
