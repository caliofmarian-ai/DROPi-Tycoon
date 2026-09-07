# Document Information

Document: MASTER_ASSET_PLAN_V2.md
Project: DROPi Tycoon
Version: 2.0.0
Status: Governed Production Plan
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-09-07

---

# DROPi Tycoon Master Asset Plan v2

## Purpose

This document converts `WORLD_ASSET_BIBLE.md` into an executable, staged production program.

It does not make every future asset immediately runtime-required. It defines the library architecture, production order, scale targets, gates and first executable wave.

---

# 1. Program Objective

Build a coherent asset library large enough to support the canonical living economic/logistics world:

- diverse people and professions;
- visible goods and packaging;
- specialized companies and industries;
- varied residential/commercial/industrial architecture;
- multiple city archetypes;
- nature, agriculture and animals;
- road, drone, rail, aviation and maritime logistics;
- major infrastructure such as airports, stations, ports and hubs;
- regional/world maps and UI/iconography;
- later expansion without art-style drift.

Expected long-term library scale: approximately **3,000–7,000+ meaningful source/runtime derivatives**, depending on how many variants are actually useful and implemented.

This is a planning range, not a requirement to manufacture meaningless duplicates.

---

# 2. Category Scale Targets

| Domain | Long-term target range | Notes |
|---|---:|---|
| Human identities / professions / derivatives | 300–700 | recurring identities, outfits, professions, animation/portrait derivatives |
| Animals | 50–150 | urban, rural, farm, decorative fauna |
| Products / packaging / cargo | 300–800 | visible economy and logistics handling |
| Residential buildings | 300–700 | architecture, density, city-archetype variants |
| Commercial buildings | 300–700 | shops, offices, services, merchants |
| Industrial/logistics buildings | 200–500 | factories, warehouses, hubs, cold chain, yards |
| Civic/special infrastructure buildings | 150–350 | HQ, Marketplace, City Hall, hospitals, stations, airports, ports, DronePorts |
| Road vehicles | 200–500 | personal, delivery, freight, service, livery variants |
| Drones and DronePort support | 80–200 | drone families and support equipment |
| Rail | 100–250 | track modules, stations, locomotives, rolling stock, freight terminal props |
| Aviation | 100–250 | airport modules, aircraft, cargo support, ground equipment |
| Naval / river / maritime | 100–300 | docks, cranes, vessels, barges, cargo ships, port yards |
| Environment / urban props | 400–1,000 | roads, sidewalks, bridges, furniture, water, vegetation |
| Agriculture / rural | 150–400 | crops, orchards, farm structures, machinery, farm props |
| City kits / architectural families | 300–800 | cross-domain modular families supporting city archetypes |
| Maps / overlays / location icons | 100–250 | local to world-scale presentation |
| UI / HUD / iconography | 200–500 | game systems, product/logistics/economy surfaces |
| VFX | 100–250 | feedback, weather, construction, logistics, rewards |

Ranges overlap because one production source may generate multiple runtime derivatives. They are capacity guidance, not independent hard totals.

---

# 3. Production States

Every family moves through these states:

1. **INVENTORIED** — required by canon or an executable issue.
2. **SPECIFIED** — family purpose, style, scale and runtime contract defined.
3. **CANDIDATE** — generated/imported for review.
4. **OWNER/PROJECT APPROVED** — visual direction accepted.
5. **PRODUCTION READY** — cleaned, named, transparent/background-correct, dimensions known.
6. **RUNTIME INTEGRATED** — copied/optimized into active runtime.
7. **ANDROID VERIFIED** — checked in installed game where player-visible.

No candidate skips directly to runtime merely because it looks attractive.

---

# 4. Production Wave A — Canon and Pipeline Foundation

Status: **AUTHORIZED / EXECUTION STARTED**

Deliverables:

- `WORLD_ASSET_BIBLE.md`;
- `MASTER_ASSET_PLAN_V2.md`;
- updated `ASSETS.md`;
- updated `VISUAL_DESIGN_SYSTEM.md`;
- updated `DOCUMENT_INDEX.md`;
- owner directive recording the visual/world decision;
- dedicated GitHub asset-program issue;
- first production manifest.

Acceptance:

- no contradiction with Universe/Business/Logistics canon;
- style is explicitly named and locked by owner decision;
- candidate vs approved/runtime states are clear;
- current Android runtime dimensions remain authoritative where known;
- future large infrastructure dimensions remain implementation-driven.

---

# 5. Production Wave B — Human Diversity + Products + Company Foundations

Priority: **P0/P1 — FIRST EXECUTABLE CONTENT WAVE**

## B1. Human Diversity Seed Set

Create enough source identities to prove diversity before multiplying animation derivatives.

Initial candidate target:

- 12 citizen identities;
- 8 courier/delivery identities;
- 6 merchant/business-owner identities;
- 6 warehouse/logistics workers;
- 4 farmers/agricultural workers;
- 4 mechanics/maintenance specialists;
- 4 office/management specialists;
- 4 transport specialists spanning drone/rail/airport/port visual direction.

Minimum initial identity seed: **48 materially distinct people**.

Diversity must vary face, skin tone, hair, age presentation, silhouette and clothing rather than changing only shirt color.

Only identities needed by current/near-term runtime receive animation atlases immediately.

## B2. Product Seed Set

Initial visible product categories:

- fresh food;
- bakery;
- dairy/chilled;
- beverages;
- household/retail;
- electronics;
- medical/pharma;
- industrial parts/tools;
- construction materials;
- agricultural goods;
- energy/technical goods.

For each category, produce a small coherent set of:

- product form;
- parcel/carton form;
- crate/pallet or bulk logistics form when appropriate.

Initial target: **60–100 product/packaging candidates**.

## B3. Company Foundation Set

Create recognizable early company families tied to the product categories above.

Initial families:

- grocery/supermarket;
- bakery;
- pharmacy;
- electronics retailer;
- café/restaurant;
- local manufacturer/workshop;
- construction/material supplier;
- agricultural producer;
- warehouse/distribution company;
- courier/logistics company;
- cold-chain operator;
- technology company.

Initial target: **24–40 building/company candidates** across multiple architectural/material/color variants.

---

# 6. Production Wave C — Core City Building Mega-Kit

Priority: P1

Targets:

- residential families;
- commercial/storefront families;
- offices;
- industrial/logistics facilities;
- civic services;
- landmarks;
- HQ tiers;
- Marketplace identity;
- city-archetype architectural variants.

Production principle:

- vary structure, roof, facade, windows, doors, awnings, loading areas, yard configuration and footprint;
- do not create apparent diversity through color-only swaps.

Runtime integration should extend the reusable/cached building-family strategy already used by the Phaser world.

---

# 7. Production Wave D — Transport Mega-Kit

Priority: P1/P2 depending on gameplay availability

## Road

- walking;
- bicycle;
- scooter;
- motorcycle;
- cars;
- vans;
- trucks;
- company livery variants;
- civilian traffic variants.

## Drone

- delivery drone families;
- cargo/specialist drone families;
- pads, chargers, hangars and support props.

## Rail

- tracks;
- crossings/signals;
- stations;
- terminals;
- locomotives;
- passenger and freight rolling stock.

## Aviation

- airport modules;
- cargo terminal;
- runway/taxiway/apron;
- tower/hangar;
- aircraft families;
- ground service.

## Naval

- river and maritime port modules;
- cranes/docks/yards;
- barges;
- tugboats;
- ferries;
- cargo/container vessels;
- support craft.

Large transport/infrastructure exports wait for an exact runtime footprint contract.

---

# 8. Production Wave E — Nature, Agriculture and Animals

Priority: P1/P2

Targets:

- urban tree families;
- park tree families;
- conifers;
- ornamental/flowering trees;
- river/coastal vegetation;
- orchard families;
- shrubs/hedges/flowers;
- crop-field tiles/patches;
- greenhouses;
- barns/silos;
- farm equipment;
- cats/dogs/birds;
- farm animals;
- rural worker identities.

The goal is a living environment, not decorative clutter density.

---

# 9. Production Wave F — City Archetype Kits

Priority: P2

Initial archetypes:

1. European classic/historic;
2. Eastern European mixed urban;
3. modern corporate/metropolitan;
4. industrial/manufacturing;
5. river city;
6. maritime port city;
7. agricultural market town;
8. suburban/high-growth city;
9. technology/high-growth city;
10. small town/locality.

Each kit should define:

- architectural families;
- street/block character;
- vegetation mix;
- dominant industry visuals;
- transport mix;
- special landmarks/gateways;
- company/product mix;
- color/material tendencies.

The runtime should compose cities from modular families rather than a single giant baked background.

---

# 10. Production Wave G — Map, UI, VFX and World-Scale Support

Priority: aligned to executable features

Targets:

- city/regional/world map visual language;
- transport gateway icons;
- demand/production overlays;
- product/category icons;
- profession icons;
- company/industry icons;
- infrastructure status;
- UI feedback;
- construction/upgrade VFX;
- delivery/cargo feedback;
- weather/environment effects when implemented.

UI art must remain compatible with `07_UI/VISUAL_DESIGN_SYSTEM.md` and player-smartphone constraints.

---

# 11. First Production Manifest

The first actual generation/integration stream must use a manifest rather than free-form prompts.

Manifest fields:

- asset ID;
- family;
- category;
- intended gameplay/world role;
- current/future status;
- visual-style invariant;
- source dimensions;
- target runtime dimensions if known;
- transparency/background requirement;
- anchor/collision notes if relevant;
- candidate file;
- approval state;
- runtime derivative path;
- provenance/generation note;
- owner review state.

The manifest becomes the traceability bridge from thousands of candidates to the subset actually shipped.

---

# 12. Current Runtime Priority Mapping

The largest long-term library must not distract from the playable game.

Current priority families are those that materially support:

- issue #317 visual quality gate;
- issue #327 city/world diversity;
- issue #332 courier/vehicle presentation;
- issue #406 playable living-world convergence;
- physical HQ and Marketplace;
- local products/merchant/delivery economy;
- upcoming profession/education and local competition systems.

Airports, rail, ports, ships and aircraft are canonically required for later world expansion, but should be developed as modular source families ahead of runtime only when doing so does not block immediate playable-world quality.

---

# 13. Review Cadence

Owner review should happen at meaningful family checkpoints, not every tiny file.

Recommended visual gates:

- human diversity seed contact sheet;
- product/packaging family contact sheet;
- company/building family contact sheet;
- transport family contact sheet;
- nature/agriculture family contact sheet;
- city-archetype kit contact sheet.

Once a family/style checkpoint is approved, controlled variants can continue without asking the owner to re-approve the same unchanged style for every individual file.

A new approval is required when:

- art style materially changes;
- perspective/lighting/material language changes;
- a major new visual family establishes a new precedent;
- a candidate would replace approved branding;
- a runtime integration materially changes player-visible Android presentation.

---

# 14. Completion Definition

This plan is not completed by reaching an arbitrary file count.

The program succeeds when:

- the city no longer looks like repeated prototypes;
- people are recognizably diverse;
- companies visibly differ by economic function;
- products can be seen moving through the logistics chain;
- nature and rural/urban environments feel varied;
- later cities can possess distinct architecture and economic identity;
- multimodal infrastructure can be represented coherently;
- all of it still looks like one DROPi Tycoon world;
- Android performance remains acceptable.

---

# Production Rule

**Generate breadth through governed families, not random volume. Every new asset should either improve the current playable world or prepare a canonical future family with a clear implementation path.**

---

End of Document
