# MASTER OWNER DIRECTIVE 004 — Demand-Driven Asset Production

Date: 2026-09-07
Owner: Marian Caliof
Status: CANONICAL OWNER DIRECTIVE
Coordinates: #409, #410, #411, #412, #413, #414

## Decision

The Project Owner approves the current DROPi Tycoon visual direction and the asset families already generated during the 2026-09-07 asset-production session.

The Project Owner explicitly stops speculative bulk image generation at this point because continuing to generate large families without an executable need creates unacceptable duplication and repetition risk.

## Canonical production rule

From this directive forward, asset creation is **demand-driven**.

1. Do not generate new source art merely to increase repository/library counts.
2. Before any new generation, audit existing approved sources, candidates and reusable runtime assets for a suitable equivalent.
3. Prefer reuse, crop, extraction, cleanup, transparent-background derivation, resizing, atlas construction, directional/state derivation and other governed transformations of already-approved sources before requesting unrelated new source art.
4. Generate new source art only when an executable gameplay/world/UI/runtime requirement proves that the current library is materially insufficient.
5. Any future generation task must state:
   - the executable requirement;
   - the missing visual capability;
   - the existing families checked;
   - why existing assets/derivatives cannot satisfy the requirement.
6. New art must preserve the canonical **Stylized 3D Pre-Rendered Mobile World** direction unless the Owner explicitly approves a style change.
7. Source-family ingestion and runtime adoption must remain separate, reviewable PRs when practical.
8. Candidate/reference images must not be silently treated as runtime-ready; final derivatives must satisfy the real runtime contract.
9. Duplicate prevention is mandatory. Exact duplicates must be reused; near-duplicates without gameplay value must be rejected.
10. The thousands-of-assets target in the World Asset Bible is a **capability/coverage horizon**, not a requirement to generate thousands of files in advance.

## Already-generated source families

The following owner-approved families are to be harvested and reused rather than regenerated speculatively:

- initial approved candidate board and its 50 individual crops;
- civic/public/special buildings and institutions;
- multimodal logistics infrastructure including airport, rail, port, depots and cargo hubs;
- transport fleet families spanning road, rail, air, sea, special vehicles and drones;
- industrial, energy, utility and production facilities;
- world city architecture and district kits;
- map/network/roads/rail/water/utility modules;
- human workforce specialists;
- nature, biomes, animals and farm-system families;
- products and cargo atlas families including the later expanded product atlas.

These families remain approved visual source material even if a particular source board has not yet been promoted to a runtime derivative.

## Runtime adoption

Future implementation PRs should consume approved existing assets first. A runtime slice may create only the derivative it needs, such as:

- exact-size world sprite;
- static building derivative;
- icon;
- transparent prop;
- animation atlas;
- directional state set;
- district module;
- product/cargo representation.

Expensive derivatives should not be produced before a real executable contract exists.

## Owner interaction rule

The assistant may continue autonomously under this directive and should stop for Owner approval only when:

- a material art-style change is proposed;
- two valid product/world interpretations require an Owner choice;
- an irreversible/high-impact runtime decision is needed;
- a player-visible milestone requires the Owner's normal Android verification.

Routine reuse, deduplication, extraction, organization, cleanup, runtime wiring, tests, PR creation and merge may proceed without repeatedly asking the Owner.
