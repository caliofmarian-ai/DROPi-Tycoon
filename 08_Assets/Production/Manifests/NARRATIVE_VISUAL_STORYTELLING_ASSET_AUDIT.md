# Narrative Visual Storytelling Asset Audit

Version: 1.1.0
Status: RECONCILED IMPLEMENTATION AUDIT — Issue #554
Date: 2026-09-09
Branch: `agent/visual-storytelling-characters`

## Scope

This audit is the required pre-generation and provenance check for character, dialogue and environmental story presentation under #554.

Sources inspected before implementation and reconciliation:

- `08_Assets/WORLD_ASSET_BIBLE.md`;
- `08_Assets/MASTER_ASSET_PLAN_V2.md`;
- `08_Assets/ASSETS.md`;
- `08_Assets/Production/**`, including the coverage matrix, approved-source registers and Batch 001 manifest;
- `08_Assets/Approved_References/**` inventory;
- `game-web/public/assets/**` runtime inventory;
- the governed candidate-audit branch history;
- the governed Batch 001 world-foundation branch history;
- merged Story Bible, narrative-ID and authored first-hour mission contracts.

Provenance is intentionally expressed through governed repository manifests, source IDs, issues and branch history. This keeps the repository-wide source-policy gate intact while preserving the evidence needed to audit where the approved human visual capability came from.

## Reuse hierarchy applied

The #411/#412 hierarchy was applied in this order:

1. runtime asset;
2. production-ready derivative;
3. approved source;
4. candidate;
5. governed derivative;
6. new source generation only when a proven visual capability is absent.

## Findings

### Runtime

`game-web/public/assets/production/` contains the production runtime order icon. Existing `game-web/public/assets/sprites/` contains legacy/minimal world sprites for buildings, delivery markers, parcel and player presentation.

There is no production-ready recurring-NPC portrait family in runtime today.

### Approved human sources

The human visual capability is **not missing**.

The project already has owner-approved human source families recorded in governed local source registers:

- `SRC-HUMAN-001` — Human Diversity Seed;
- `SRC-20260907-008` — Human workforce specialists v2.

The approved family covers couriers, riders, office/management, retail/cashier, industrial and specialist roles that can support the opening cast.

Therefore a new broad human/character board would duplicate existing approved capability and is prohibited by the demand-driven generation rule.

### Batch 001 candidates

`BATCH_001_EXTRACTED_CANDIDATE_INDEX.md` records 72 human identity candidates. These are review derivatives only. The manifest explicitly prohibits enlarging them and treating them as final runtime art.

They may inform identity selection, but they are not silently promoted by #554.

### Historical asset branches

The governed candidate-audit branch remains review material rather than runtime authority. Its player/character board crops are not runtime-adopted here.

The Batch 001 world-foundation branch has no unique runtime authority that should be resurrected over current `main`.

## #554 decision

**No new image generation is justified for this slice.**

The missing capability is not human visual source art. The missing capability is a governed runtime presentation layer that can keep character identity consistent while approved portrait derivatives are still pending production promotion.

The implemented bridge is therefore:

- reusable procedural identity portraits drawn from stable silhouette, clothing, equipment and role cues;
- stable canonical character IDs;
- an explicit future `runtime-texture` portrait slot;
- no candidate board crop copied into `game-web/public/assets/`;
- no asset marked `PRODUCTION_READY`, `RUNTIME_INTEGRATED` or `ANDROID_VERIFIED` by this PR.

This is a presentation fallback, not a replacement art direction. The canonical target remains **Stylized 3D Pre-Rendered Mobile World**.

## Recurring character visual mapping

The merged Story Bible and narrative identity contract canonize the following identities. #554 prepares distinct visual signatures for each without creating new bitmap art:

| Character | Role | Stable visual cues in this slice |
|---|---|---|
| Ana Stoica | dispatcher / mentor | operational blue clothing, headset, OPS badge, distinct bob silhouette |
| Radu Marin | coworker / friendly competitor | courier green clothing, shoulder bag, RIDE badge, short-hair silhouette |
| Mirela Stan | merchant | commerce/apron cue, SHOP badge, distinct compact silhouette |
| Petru Neagu | recurring household customer | older silver-hair cue, cane, Old Town badge |
| Daria Iancu | producer / business owner | industrial neutral clothing, clipboard, PROD badge |
| Elena Dobre | trainer / instructor | training folder, TRAIN badge, distinct professional silhouette |
| Victor Lupu | competitor / rival | contrasting logistics clothing, route case, RIVAL badge |

Identity is intentionally communicated through several signals, not the name label alone.

## Future production-ready portrait requirement

When a story-critical portrait is selected for final art production, the derivative should be produced from the already approved human family and must record:

- stable character ID;
- approved source-family provenance;
- face/hair/body/clothing/equipment identity continuity;
- transparent/background treatment appropriate for dialogue UI;
- exact portrait runtime dimensions determined by the accepted Android dialogue contract;
- WebP export and bounded memory size;
- runtime texture key/path;
- `PRODUCTION_READY` evidence before integration;
- physical Android evidence before any future `ANDROID_VERIFIED` state.

A portrait derivative must never be created merely to decorate one line of dialogue.

## Runtime references used by this slice

The #554 contract exposes only existing runtime-safe references. The current validated reference is:

- `/assets/production/icon-orders.webp`.

Character presentation remains procedural until governed portrait derivatives are genuinely promoted.

## Story and mission authority boundary

The merged first-hour authored mission registry is now the authority source for mission IDs, authored refs, signals and narrative fact IDs consumed by the visual-storytelling contract.

#554 does not emit those signals, start or complete missions, settle economy state, mutate cargo, or fabricate narrative facts. The presentation layer is prepared to receive authoritative evidence through a separate runtime adapter.

## Environmental storytelling boundary

#554 defines presentation rules for active depots, merchant identity, repaired workshops, district improvement, temporary disruption and infrastructure opening. Every rule requires authoritative world/economic state before visual evidence may appear.

The visual layer does not create shortages, repairs, prosperity, disruption, infrastructure availability, inventory or employment state.
