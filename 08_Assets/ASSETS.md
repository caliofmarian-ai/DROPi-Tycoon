# Document Information

Document: ASSETS.md
Project: DROPi Tycoon
Version: 2.0.0
Status: Canonical
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-09-07

---

# Game Assets System

## Purpose

This document defines the top-level asset management, identity, approval-state and storage rules for DROPi Tycoon.

Detailed world-art direction, diversity, product visibility, city/industry families and production-scale rules are owned by:

- `08_Assets/WORLD_ASSET_BIBLE.md` — canonical world-art and asset specialization;
- `08_Assets/MASTER_ASSET_PLAN_V2.md` — governed staged production plan.

This document does not redefine Universe, Business, Logistics, Game, World, UI or Technical canon.

---

# Asset Philosophy

Assets should support gameplay, readability, character, immersion and economic meaning.

DROPi Tycoon is game-first. The visual identity must make the installed application feel like a deliberate commercial game product rather than a technical prototype, browser wrapper, generic dashboard or developer utility.

The player should be able to see the company, people, products, vehicles, marketplace, industries, infrastructure, cities and logistics network they are building.

The asset library is expected to grow from prototype-scale resources into a governed library of thousands of meaningful source/runtime derivatives.

Volume alone is not the goal. Coherent families, visible economic function, variety and runtime usefulness are the goal.

---

# Canonical Visual Direction — 2026-09-07

The Project Owner approved the current candidate asset direction and authorized quality improvement toward a richer three-dimensional presentation while preserving one coherent style.

Canonical description:

**Stylized 3D Pre-Rendered Mobile World — premium mobile tycoon presentation, soft-isometric / elevated 3/4 perspective, readable forms, controlled color, clear materials, consistent lighting and production-quality visual coherence.**

This does not require a full real-time 3D engine rewrite.

The active Phaser game may use optimized 2D sprites/textures derived from three-dimensional-looking source art where that best protects Android performance.

The owner decision is recorded in:

`09_Development/Owner_Directives/2026-09-07_MASTER_OWNER_DIRECTIVE_003_WORLD_ART_AND_ASSET_SYSTEM.md`.

---

# Approved Product Identity — 2026-09-05

The approved DROPi Tycoon identity includes:

- bold, friendly `DROPi Tycoon` wordmark;
- `O` / location-pin visual language;
- city/local-business imagery;
- drone delivery as a recognizable capability;
- parcel/logistics imagery;
- bright blue/cyan technology/route accents;
- green growth/community/success accents;
- gold/orange value/progression/premium accents;
- dark/deep-blue contrast surfaces;
- optimistic approachable tycoon presentation rather than photorealistic corporate presentation.

These identity colors are anchors, not a requirement that every world asset share the same colors.

People, nature, architecture, products, cities, companies and vehicles require broad controlled variety inside one style.

---

# Approved Production Branding Assets

| Asset | Intended repository/runtime role | SHA-256 |
|---|---|---|
| `dropi-tycoon-logo.png` | DROPi Tycoon logo / wordmark source | `3aa62f1c6f38d06d52403477ff796665428a55178f5e3a975f38b527f7654616` |
| `dropi-tycoon-app-icon.png` | Android / store application icon source | `f02072f431e93cb822afa40b177f07e1540e539998a3e662b6e8bcfed61fc24f` |
| `dropi-tycoon-splash.jpg` | installed-app splash/loading artwork source | `0524e0a265e5a775d8ae1c6a5ec36f00f7511d9fa548d09ce21054e550ad485c` |

Mobile copies belong under:

```text
game-mobile/assets/branding/
```

Runtime-specific derivatives may be created for dimensions/compression, but branding must not be silently redesigned during optimization.

---

# Approved Simulation Reference Set

| Reference | Purpose | SHA-256 |
|---|---|---|
| `dropi-tycoon-brand-concept-e.jpg` | ecosystem identity: marketplace + drones + community + future token direction | `f00e587cf4211f9b352a657bc8bc8f195be0ffab4a678662404f762de4216c71` |
| `delivery-progression-reference.jpg` | visible delivery progression: on foot → bicycle → motorbike → car → van → DronePort/drone operations | `8a6a869dedff04ad670d7650a7cccd4b89aedc2d04e98deca739be1bd67122a3` |
| `dropi-port-employee-activity-reference.jpg` | visible DronePort interior and employee operational activity | `40a9140f71407ab583c192ac4c97d0cbfa97685ce5704bf9a7c62e95efc576ff` |

Reference copies belong under:

```text
08_Assets/Approved_References/
```

Reference boards are directional targets, not fake gameplay screenshots or automatic authorization for out-of-sequence mechanics.

---

# Candidate Board Crop Set — 2026-09-07

The fifty individually cropped candidate assets created during the world-asset audit are a **candidate/reference seed set**, not the complete library and not automatic runtime approval.

They established useful early direction for:

- people;
- vehicles;
- drones;
- buildings;
- products/packages;
- environment;
- map/UI/status iconography.

The Project Owner confirmed that the style direction is liked but the scope is far too small for the intended world.

The approved response is to expand through the governed world-asset program defined in `WORLD_ASSET_BIBLE.md` and `MASTER_ASSET_PLAN_V2.md`, not to treat fifty assets as completion.

---

# Canonical Diversity Rule

Asset production must not create a world of clones.

People require material variation in face, skin tone, hair, age presentation, silhouette, clothing, profession and equipment.

Nature requires species/form/size/environment diversity.

Architecture requires structural/material/footprint differences, not only recolors.

Companies require function-specific identity.

Cities require distinct architectural/economic character.

Products require recognizable visual and packaging/cargo forms.

Detailed rules are owned by `WORLD_ASSET_BIBLE.md`.

---

# Product and Economy Visibility Rule

Products are central world assets.

Where physical logistics matters, the player should be able to see what is being produced, stored, moved, transferred or delivered.

Asset production must support the canonical economic/logistics flow:

**materials/supplier -> production -> storage -> distribution -> merchant/marketplace -> customer**.

Products may appear as individual goods, retail packs, parcels, crates, pallets, containers or other safe logistics abstractions according to the implemented system.

---

# Major World Asset Domains

The long-term library must be capable of representing:

- human identities and professions;
- animals;
- products and cargo;
- residential architecture;
- commercial architecture;
- industrial/logistics facilities;
- civic/special buildings;
- companies and industries;
- road vehicles;
- drones and DronePorts;
- rail infrastructure and trains;
- airports, aviation and air cargo;
- river and sea ports;
- river/maritime vessels;
- nature, agriculture and rural environments;
- roads, bridges, urban furniture and environment;
- city archetype kits;
- local/city/regional/world maps;
- UI/HUD/iconography;
- VFX;
- audio assets under separate audio production controls.

---

# Asset State Model

Every material asset should have a clear state.

## Candidate

Generated/imported for evaluation. Not runtime-approved.

## Approved Source

Project/owner-approved visual source or family direction.

## Production Asset

Cleaned/finalized source prepared for a known role and dimensional contract.

## Runtime Asset

Optimized derivative actually loaded by the active game.

Runtime derivatives must remain traceable to their source.

---

# Asset Organization

Engine-agnostic source/reference governance belongs under `08_Assets/`.

Active runtime copies belong only where the application loads them.

```text
08_Assets/
    ASSETS.md
    WORLD_ASSET_BIBLE.md
    MASTER_ASSET_PLAN_V2.md
    Approved_References/
    Candidate_Board_Crops_v1/      # when merged/retained as review material
    Production/
        01_Characters/
        02_Animals/
        03_Products/
        04_Buildings/
        05_Road_Vehicles/
        06_Drones/
        07_Rail/
        08_Aviation/
        09_Naval/
        10_Environment/
        11_Agriculture/
        12_City_Kits/
        13_Maps/
        14_UI/
        15_VFX/
        Manifests/

game-web/
    public/assets/                # authoritative Phaser runtime assets when integrated

game-mobile/
    assets/branding/             # installed Android shell branding/icon/splash sources
```

Empty future directories need not be committed until a real asset/manifest exists.

Historical GDevelop asset structure remains historical/reference material and does not override the active Phaser + mobile-shell architecture.

---

# Runtime Dimension Rule

Do not guess final dimensions for future large assets merely because they are planned.

Current implemented runtime classes keep their current dimensional contracts until deliberately changed.

Future airports, stations, ports, ships, aircraft and other large infrastructure must receive final export dimensions only after their runtime footprint, camera, layering, collision and culling contract exists.

This protects asset quality, Android memory and engineering effort.

Exact current contracts are recorded in `WORLD_ASSET_BIBLE.md`.

---

# Naming Rules

Preferred pattern:

`<domain>_<family>_<variant>_<state>_<tier>.<ext>`

Good examples:

```text
human_courier_female_07_walk_down.webp
building_shop_pharmacy_modern_03.webp
vehicle_van_delivery_blue_02.webp
product_food_bread_crate_01.webp
```

Avoid meaningless names such as:

```text
object123_final2.png
```

---

# Quality and Integration Gates

Before runtime integration, verify:

- canonical fit;
- style consistency;
- real diversity rather than clone/recolor-only variation;
- product/industry meaning;
- exact dimensions/anchors if required;
- transparency/background behavior;
- mobile readability;
- Android memory/performance;
- naming/provenance;
- source/runtime traceability;
- owner visual acceptance for material visible changes.

Issue #317 remains the cross-cutting visual-quality gate.

Issues #327, #332 and #406 remain active player-facing convergence owners and are coordinated by the world-asset production program rather than replaced by it.

---

# Audio Assets

Audio remains required for product quality and atmosphere, including:

- music;
- UI interaction;
- order acceptance;
- delivery success/failure;
- reward/money feedback;
- hiring/onboarding;
- warning/error;
- vehicle/drone activity;
- environment/marketplace ambience.

Audio requires separate production/provenance execution and is not completed by visual asset work.

---

# Asset Management Rules

Before generating or adding an asset:

- Is the family required by canon or an executable roadmap/issue?
- Does it improve the current playable world or establish a clear future canonical family?
- Does it match `WORLD_ASSET_BIBLE.md`?
- Does an approved usable source already exist?
- Is the intended state Candidate, Approved Source, Production or Runtime?
- Are dimensions actually known, or should they remain implementation-dependent?

Do not regenerate approved branding merely because a new AI session starts.

Do not generate thousands of nominal variants with negligible meaningful difference.

---

# Canonical Rule

**DROPi Tycoon assets exist to make the living economic/logistics society visible. The library may scale into thousands of coherent assets, but all production must preserve one stylized 3D pre-rendered mobile visual language, genuine diversity, visible products and industries, exact runtime contracts, traceable approval state and Android performance.**

---

End of Document
