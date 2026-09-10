# DROPi Tycoon — Demand-Driven Asset Generation Policy

Version: 1.3.0
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
- the persistent DROPi Tycon Library as an audited source-presence input when source artifacts exist there but have not yet been ingested into GitHub;
- `09_Development/Compliance/GLOBAL_ASSET_PROVENANCE_CONTRACT_565_643.md` as the canonical DT-13 legal qualification/release-evidence contract;
- `game-web/public/legal/runtime-provenance.json` only as the runtime evidence manifest consumed by the qualification process, never as a legal authority of its own.

DT-19 owns production identity, lifecycle and lineage. DT-13 owns legal/provenance qualification for commercial release. A DT-19 lifecycle state never grants `CLEARED`, `REVIEW_REQUIRED` or `BLOCKED`, and the DT-19 registry must not copy or reinterpret those legal conclusions. Missing provider, tool, generation date, applicable terms, reference/input rights or other legal facts stay unknown and fail closed under the DT-13 contract; DT-19 must not invent them.

## Presence is not one state

Asset existence must not be reduced to a single "present/not present" flag. DT-19 keeps these dimensions independent:

- `LIBRARY_PRESENT`: the artifact is directly observed in the persistent project Library and is valid dedup/source-discovery evidence;
- `REPOSITORY_ATTESTED`: the relevant bytes are actually present on canonical GitHub main and can be verified by repository tooling;
- DT-19 lifecycle state: production readiness/progression only;
- DT-13 legal/commercial qualification: independent release-rights status only.

`LIBRARY_PRESENT` does **not** imply `REPOSITORY_ATTESTED`, `APPROVED_SOURCE`, `PRODUCTION_READY`, `RUNTIME_INTEGRATED`, `ANDROID_VERIFIED` or legal/commercial clearance. Conversely, lack of repository attestation must never be reported as proof that the asset does not exist when Library evidence is available.

Issue #413 owns governed harvesting/ingestion of already-produced Library sources into repository paths. Issue #414 may inventory Library evidence to prevent duplicate generation, but it must not copy those binaries into GitHub, promote them or manufacture missing legal/provenance facts.

The current #414 audit has directly identified the persistent Library source boards for `SRC-20260907-001` through `SRC-20260907-010`. The board for `SRC-20260907-001` has repository-attested candidate derivatives, while the source board itself remains Library-only. Source boards `SRC-20260907-002` through `SRC-20260907-010` are Library-present and are not repository-attested on the audited main. This is presence evidence only; their canonical source-family approval remains the existing generated-family register, not the Library listing.

The audit also identifies `crops_q55.zip` and `crops_q68.zip` as Library-only alternate derivative archives for the same 50 logical candidate paths already represented by `Legacy_Board_Crops_v1`. Their member bytes differ from the repository crop binaries, so they are not exact repository copies and must not silently inflate the canonical candidate count.

`DROPi_Tycoon_Approved_Assets_2026-09-05.zip` is Library-present. Its three production branding members correspond by exact recorded SHA-256 identity to the canonical mobile branding files; the ZIP itself and its three reference-only JPEG members are not thereby repository-attested as package/reference artifacts.

The historical Batch 001 package documenting 248 candidate assets remains `NOT_ATTESTED_ON_MAIN`. A 2026-09-10 Library search by recorded package hash/name did not identify that package. `LIBRARY_NOT_FOUND_IN_AUDIT` is an audit result, not a claim that the bytes cannot exist elsewhere.

The verifier enforces repository presence metadata, Library-audit metadata integrity, lifecycle structure, source-family references, semantic-family classification, exact binary reuse declarations and the DT-19/DT-13 authority boundary. CI does not query the personal Library live: repository verification validates the audited metadata committed to the registry, while #413 remains responsible for any later binary ingestion. Visual near-duplicate classification remains a required human/art review because byte equality alone cannot prove or disprove material visual similarity.

## Mandatory pre-generation audit

Before any new source image is generated, record the answers to all of the following:

1. What executable gameplay/world/UI requirement needs art?
2. Which runtime class or visual role is required?
3. Which existing approved-source families were checked in the canonical inventory and source registers?
4. Which relevant persistent-Library source artifacts, candidate/runtime files and repository paths were checked?
5. Can an existing Library source, repository source or candidate be cropped, cleaned, resized, recolored within governed limits, converted to transparency, converted to an atlas, or otherwise derived to satisfy the need after the appropriate ingestion/promotion gate?
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
10. visual similarity to existing Library, candidate, approved, production and runtime assets.

An unknown or unassessed dimension does **not** prove that a capability is missing. When the registry cannot decide a near-duplicate question mechanically, the pre-generation audit must perform the visual comparison before authorizing a new source.

## Reuse hierarchy

Use the first sufficient option in this order:

1. existing runtime asset;
2. existing `PRODUCTION_READY` derivative;
3. existing `APPROVED_SOURCE` asset;
4. existing `CANDIDATE` that can be promoted safely;
5. already-produced Library source after governed #413 ingestion and required promotion gates;
6. derivative from an approved board/family;
7. controlled variant from an approved family;
8. new generated source only when 1–7 cannot meet the executable requirement.

Library presence affects duplicate-prevention decisions before it affects runtime availability. Never skip #413 or a lifecycle gate merely to use a Library-only source.

## Duplicate classification

### Exact duplicate

Same bytes or same semantic role and materially same visual form.

Action: reuse the existing blob/file. If the same bytes intentionally appear at more than one required load path, every repository inventory record must share one explicit `reuseGroup`; otherwise verification fails. Do not create an undeclared duplicate source.

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

Action: derive from the existing source after any required #413 ingestion. Do not generate an unrelated source board.

## Source-board rule

Owner-approved contact sheets/atlases are source references, not automatically production-ready runtime textures. This remains true whether the board is repository-attested or only Library-present.

Use them to:

- identify and crop suitable objects;
- preserve style/proportion/material references;
- create exact runtime derivatives when needed;
- avoid regenerating already-covered semantic families.

Do not upscale a small crop and label it production-ready if source quality is insufficient. If a final runtime derivative requires higher fidelity, regenerate only that missing object/family member while preserving the approved source identity and style.

## Generation stop condition

When existing approved or already-produced Library families cover the foreseeable world domains, stop bulk generation and move effort to:

- governed ingestion;
- deduplication;
- runtime adoption;
- gameplay/economy linkage;
- Android verification.

This policy does not require the repository or Library to reach a numeric file target before gameplay integration.

## Runtime adoption boundary

Art-library PRs and runtime-integration PRs should remain separate when practical.

A runtime asset reaches states in order:

`INVENTORIED -> SPECIFIED -> CANDIDATE -> APPROVED_SOURCE -> PRODUCTION_READY -> RUNTIME_INTEGRATED -> ANDROID_VERIFIED`

No stage may be skipped silently. Legal/provenance qualification remains independent at every stage and is governed by DT-13's canonical contract.

Assets that already existed in runtime before this machine-readable registry are inventoried truthfully with an explicit legacy migration status rather than retroactively fabricating missing lifecycle evidence. This exception documents historical state; it does not authorize any future transition to skip a gate or imply commercial clearance.
