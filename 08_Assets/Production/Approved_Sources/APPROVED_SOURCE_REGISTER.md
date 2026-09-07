# DROPi Tycoon Approved Asset Source Register

Version: 1.0.0
Status: Production Governance
Last Updated: 2026-09-07

## Purpose

This register records owner-approved visual source families that may be used to derive production candidates under `08_Assets/WORLD_ASSET_BIBLE.md`.

Approval of a source family means the visual family/style direction is accepted. It does **not** automatically make every crop or derivative runtime-ready.

Canonical state transition:

`CANDIDATE -> APPROVED_SOURCE -> PRODUCTION_READY -> RUNTIME_INTEGRATED -> ANDROID_VERIFIED`

## Global Visual Direction

Approved style: **Stylized 3D Pre-Rendered Mobile World**.

Required invariants:

- elevated / soft-isometric 3/4 presentation where spatial assets require it;
- clear three-dimensional volume and readable materials;
- bright but controlled DROPi Tycoon color language;
- consistent soft lighting and shadow logic;
- premium mobile-tycoon readability;
- genuine human, architectural, natural and economic diversity;
- no same-face or recolor-only multiplication strategy;
- generated source art remains separate from runtime until exact runtime contracts and quality gates are satisfied.

## Owner-Approved Source Families — 2026-09-07

| ID | Family | Source board role | Nominal board dimensions | Approval state |
|---|---|---|---:|---|
| SRC-WORLD-001 | World Asset Bible overview | global visual/style reference | 1672×941 | APPROVED_SOURCE |
| SRC-HUMAN-001 | Human Diversity Seed | citizen, worker and specialist identity families | 1672×941 | APPROVED_SOURCE |
| SRC-PRODUCT-001 | Products & Cargo Seed | visible products, packages, cargo and handling forms | 1672×941 | APPROVED_SOURCE |
| SRC-BUILDING-001 | Building & Company Foundations | residential, commercial, civic, industrial and logistics buildings | 1672×941 | APPROVED_SOURCE |
| SRC-TRANSPORT-001 | Transport Mega Kit | road, drone, rail, air, river and sea transport | 1672×941 | APPROVED_SOURCE |
| SRC-NATURE-001 | Nature, Agriculture & Animals | vegetation, rural systems, crops and fauna | 1672×941 | APPROVED_SOURCE |
| SRC-INFRA-001 | Infrastructure & City Archetypes | airports, stations, ports, roads, public infrastructure and city archetypes | 1672×941 | APPROVED_SOURCE |
| SRC-UI-001 | UI, Maps & Economy Support | UI icons, maps, status, economy and interaction support | 1672×941 | APPROVED_SOURCE |

## Family-Level Approval Decision

The Project Owner explicitly accepted:

1. the shared visual style;
2. the generated family boards;
3. continued production and multiplication within that style;
4. repository storage, cropping and organization according to canonical asset governance.

Therefore ordinary controlled variants inside these accepted families do **not** require a new owner approval each time.

A new owner checkpoint is required only when:

- the visual style materially changes;
- a new family establishes a materially different art language;
- a source is proposed for final player-visible runtime integration and Android review is required;
- a major runtime footprint/camera/layering decision is needed for a future large asset class;
- a gameplay/product decision cannot be derived from current canon.

## Source Preservation Rule

Approved source boards are provenance/reference material. Individual production assets should be regenerated or extracted into clean source files with suitable alpha/background treatment and runtime dimensions rather than stretching a board crop beyond its useful resolution.

## Runtime Boundary

Nothing in this register authorizes silent replacement of current assets under `game-web/public/assets/`.

Runtime adoption must be explicit, tested and compatible with #317, #327, #332 and #406.
