# DROPi Tycoon — Demand-Driven Asset Generation Policy

Version: 1.0.0
Status: Canonical Production Policy
Last Updated: 2026-09-07
Authority: `09_Development/Owner_Directives/2026-09-07_MASTER_OWNER_DIRECTIVE_004_DEMAND_DRIVEN_ASSET_PRODUCTION.md`
Coordinates: #409, #411, #413, #414

## Purpose

Prevent asset-library inflation, duplicate generation, style drift and wasted runtime work while preserving the ability to expand the world whenever an executable feature needs a new visual capability.

## Mandatory pre-generation audit

Before any new source image is generated, record the answers to all of the following:

1. What executable gameplay/world/UI requirement needs art?
2. Which runtime class or visual role is required?
3. Which existing approved-source families were checked?
4. Which existing candidate/runtime files were checked?
5. Can an existing source be cropped, cleaned, resized, recolored within governed limits, converted to transparency, converted to an atlas, or otherwise derived to satisfy the need?
6. Would the proposed new source be materially different in silhouette, role, state, direction, biome, architecture, profession, identity or product/logistics form?
7. If a new source is still required, why is it not a duplicate or near-duplicate with no gameplay value?

If questions 3–7 are not answered, generation is blocked.

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

Same semantic role and materially same visual form.

Action: reuse existing blob/file. Do not retain another copy.

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

Action: retain with explicit variant reason.

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

No stage may be skipped silently.
