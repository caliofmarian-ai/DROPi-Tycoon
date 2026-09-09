# DROPi Tycoon — Demand-Driven Asset Generation Policy

Version: 1.2.0
Status: Canonical Production Policy
Last Updated: 2026-09-10
Authority: `09_Development/Owner_Directives/2026-09-07_MASTER_OWNER_DIRECTIVE_004_DEMAND_DRIVEN_ASSET_PRODUCTION.md`
Coordinates: #409, #411, #413, #414, #565, #643

## Purpose

Prevent asset-library inflation, duplicate generation, style drift and wasted runtime work while preserving the ability to expand the world whenever an executable feature needs a new visual capability.

## Canonical inventory / dedup authority

Before generation or promotion, DT-19 uses:

- `08_Assets/Production/asset-inventory.v1.json` as the machine-readable production inventory and lineage index;
- `08_Assets/Production/Tools/verify_asset_inventory.mjs` as the fail-closed structural/exact-duplicate verifier;
- the existing approved-source and generated-family Markdown registers as source-family evidence consumed by that inventory;
- `09_Development/Compliance/GLOBAL_ASSET_PROVENANCE_CONTRACT_565_643.md` as the canonical DT-13 legal qualification/release-evidence contract;
- `game-web/public/legal/runtime-provenance.json` only as the runtime evidence manifest consumed by the qualification process, never as a legal authority of its own.

DT-19 owns production identity, lifecycle and lineage. DT-13 owns legal/provenance qualification for commercial release. A DT-19 lifecycle state never grants `CLEARED`, `REVIEW_REQUIRED` or `BLOCKED`, and the DT-19 registry must not copy or reinterpret those legal conclusions. Missing provider, tool, generation date, applicable terms, reference/input rights or other legal facts stay unknown and fail closed under the DT-13 contract; DT-19 must not invent them.

The inventory distinguishes repository-present artifacts from source families or packages that are only documented. A documented package, board or historical branch is not available production art until its canonical repository presence is attested.

The verifier enforces repository presence, lifecycle structure, source-family references, semantic-family classification, exact binary reuse declarations and the DT-19/DT-13 authority boundary. Visual near-duplicate classification remains a required human/art review because byte equality alone cannot prove or disprove material visual similarity.

## Mandatory pre-generation audit

Before any new source image is generated, record the answers to all of the following:

1. What executable gameplay/world/UI requirement needs art?
2. Which runtime class or visual role is required?
3. Which existing approved-source families were checked in the canonical inventory and source registers?
4. Which existing candidate/runtime files were checked in the canonical inventory and repository paths?
5. Can an existing source be cropped, cleaned, resized, recolored within governed limits, converted to transparency, converted to an atlas, or otherwise derived to satisfy the need?
6. Would the proposed new source be materially different in silhouette, role, state, direction, biome, architecture, profession, identity or product/logistics form?
7. If a new source is still required, why is it not a duplicate or near-duplicate with no gameplay value?

If questions 3–7 are not answered, generation is blocked.

### Required #414 dedup dimensions

The audit must explicitly consider the same searchable dimensions carried by `asset-inventory.v1.json`:

1. semantic role / family;
2. silhouette or material form;
3. runtime class / footprint;
4. direction / state / animation requirement;
5. biome / region / city archetype;
6. profession / recurring identity;
7. product / logistics form;
8. transport mode / capacity;
9. source board / family / provenance lineage;
10. visual similarity to existing candidate, approved, production and runtime assets.

An unknown or unassessed dimension does **not** prove that a capability is missing. When the registry cannot decide a near-duplicate question mechanically, the pre-generation audit must perform the visual comparison before authorizing a new source.

## Reuse hierarchy

Use the first sufficient option in this order:

1. existing runtime asset;
2. existing `PRODUCTION_READY` derivative;
3. existing `APPROVED_SOURCE` asset;
4. existing `CANDIDATE` that can be promoted safely;
5. derivative from an approved board/family;
6. controlled variant from an approved family;
7. new generated source only when 1–6 cannot meet the executable requirement.

## Duplicate classification

### Exact duplicate

Same bytes or same semantic role and materially same visual form.

Action: reuse the existing blob/file. If the same bytes intentionally appear at more than one required load path, every inventory record must share one explicit `reuseGroup`; otherwise verification fails. Do not create an undeclared duplicate source.

### Near duplicate — no gameplay value

Minor palette, accessory, pose or labeling difference that does not create useful world/role/identity distinction.

Action: reject as unnecessary duplication.

### Controlled useful variant

Materially useful difference such as:

- different human identity;
- different profession/equipment;
- different architecture/footprint;
- different transport role/capacity;
- different product/logistics form;
- different biome/species;
- different direction/state/animation requirement;
- different city archetype/regional language.

Action: retain with explicit variant reason and parent/source-family lineage.

### Missing runtime derivative

The source family exists, but runtime needs a new direction, state, exact size, frame grid, transparent crop, LOD or other implementation-specific derivative.

Action: derive from the existing source. Do not generate an unrelated source board.

## Source-board rule

Owner-approved contact sheets/atlases are source references, not automatically production-ready runtime textures.

Use them to:

- identify and crop suitable objects;
- preserve style/proportion/material references;
- create exact runtime derivatives when needed;
- avoid regenerating already-covered semantic families.

Do not upscale a small crop and label it production-ready if source quality is insufficient. If a final runtime derivative requires higher fidelity, regenerate only that missing object/family member while preserving the approved source identity and style.

## Generation stop condition

When existing approved families cover the foreseeable world domains, stop bulk generation and move effort to:

- ingestion;
- deduplication;
- runtime adoption;
- gameplay/economy linkage;
- Android verification.

This policy does not require the library to reach a numeric file target before gameplay integration.

## Runtime adoption boundary

Art-library PRs and runtime-integration PRs should remain separate when practical.

A runtime asset reaches states in order:

`INVENTORIED -> SPECIFIED -> CANDIDATE -> APPROVED_SOURCE -> PRODUCTION_READY -> RUNTIME_INTEGRATED -> ANDROID_VERIFIED`

No stage may be skipped silently. Legal/provenance qualification remains independent at every stage and is governed by DT-13's canonical contract.

Assets that already existed in runtime before this machine-readable registry are inventoried truthfully with an explicit legacy migration status rather than retroactively fabricating missing lifecycle evidence. This exception documents historical state; it does not authorize any future transition to skip a gate or imply commercial clearance.
