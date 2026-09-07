# Batch 001 Extracted Candidate Index

Version: 1.0.0
Status: CANDIDATE — Owner-approved source families, review derivatives only
Last Updated: 2026-09-07
Parent issue: #410
Umbrella: #409

## Purpose

This index records the first large deterministic extraction from the owner-approved world-art boards. It turns approved family boards into individually addressable candidate assets without confusing review crops with final runtime art.

## Extracted Candidate Counts

| Domain | Count | Approved source | Review derivative size |
|---|---:|---|---|
| Human identities | 72 | `SRC-HUMAN-001` | 96×128 source review target; compact transfer copies may be smaller |
| Buildings / companies | 40 | `SRC-BUILDING-001` | 160×128 source review target; compact transfer copies may be smaller |
| Products / cargo | 136 | `SRC-PRODUCT-001` | 96×96 source review target; compact transfer copies may be smaller |
| **Total** | **248** | — | — |

The compact repository-import package prepared for this batch contains exactly **248 individual WebP candidate files** plus manifests.

Package verification SHA-256:

`979ceef61c1486a4c5c486ed6433fb24fef9edfbbb78aa8f24fa404fd91aa91d`

## Human Coverage

The 72 identities deliberately cover more than generic pedestrians. Seed roles include:

- construction workers;
- couriers and delivery riders;
- warehouse staff;
- mechanics;
- farmers;
- chefs;
- medical staff and paramedics;
- police/security;
- business/office/IT/management;
- teachers/students/tourists/seniors;
- merchants/retail/waitstaff;
- airport ground/cabin/pilot roles;
- rail workers;
- port/maritime/fishing/diving roles;
- industrial workers;
- engineers/architects/urban/environment specialists;
- firefighters;
- sanitation/recycling;
- drivers;
- food inspectors;
- researchers.

These are identity seeds, not permission to clone one face across occupations. Production multiplication must preserve the Human Diversity Matrix in `WORLD_ASSET_BIBLE.md`.

## Product / Cargo Coverage

The 136 candidates cover 21 physically meaningful product/cargo families:

1. fresh produce;
2. bakery and staples;
3. dairy and eggs;
4. beverages;
5. packaged food;
6. chilled meat/fish;
7. household goods;
8. clothing/footwear;
9. electronics/IT;
10. medical goods;
11. tools;
12. construction materials;
13. industrial parts;
14. agricultural inputs;
15. packaging/pallets;
16. barrels/sacks;
17. containers and cargo equipment;
18. office products;
19. furniture/decor;
20. parcels/general cargo;
21. special cargo.

These families support the canonical physical flow:

`materials/supplier -> production -> storage -> distribution -> merchant/marketplace -> customer`.

## Building / Company Coverage

The 40 candidates cover residential, retail, service, civic, industrial, agricultural, utilities and logistics foundations, including:

- small house / apartment / townhouses;
- grocery / supermarket / bakery / café / restaurant;
- pharmacy / electronics / furniture / clothing / hardware / pet retail;
- gas station / car service;
- clinic / hospital / school / police / fire / post / bank / city hall;
- office / technology / startup;
- courier depot / cold-chain depot / warehouse / logistics hub;
- factory / construction supplier / farm / greenhouse / food processing / recycling / water treatment / power / telecom.

## Candidate vs Production-Ready Boundary

These extracted files are **CANDIDATE review derivatives**. They may be used to:

- browse family coverage;
- approve/reject individual concepts;
- map identities/products/buildings to future gameplay data;
- select which assets deserve high-resolution final generation.

They must **not** be enlarged and treated as final art.

A selected candidate becomes `PRODUCTION_READY` only after a clean source/export satisfies:

- canonical style and diversity rules;
- correct alpha/background treatment;
- exact runtime footprint/dimension contract where one exists;
- directional/animation requirements where applicable;
- naming/provenance traceability;
- Android readability and performance constraints.

## Reproducibility

Extraction logic is owned by:

`08_Assets/Production/Tools/extract_batch001_candidates.py`

Expected approved board filenames for deterministic extraction:

- `human-diversity-seed.webp`
- `products-cargo-seed.webp`
- `building-company-foundations.webp`

## Next Production Steps

After repository import of the 248 candidates:

1. mark the selected current-runtime families for high-resolution production;
2. generate current courier/NPC/building/product derivatives at real runtime dimensions;
3. continue separate governed mega-kits for transport, nature/agriculture/animals, infrastructure/city archetypes, UI/maps/VFX and interiors/logistics props;
4. keep future airport/port/ship/aircraft final dimensions pending real runtime footprint contracts;
5. integrate only approved production-ready assets into `game-web/public/assets/` through visible-runtime issues and Android owner review.
