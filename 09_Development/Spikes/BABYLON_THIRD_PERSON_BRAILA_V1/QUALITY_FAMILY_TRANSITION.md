# DROPi Tycoon Babylon spike — quality-family transition

Status: `CANDIDATE RESEARCH — NOT YET INTEGRATED`

Coordinates: #710 #712 #720 #725 #726 #731

## Why this exists

The procedural hero/building stack remains useful for movement, camera, collision, semantic-world and Android-budget calibration, but it is not an acceptable final visual family for the owner-approved grounded-stylized target.

The next durable visual step must move from "more primitives" to governed, mobile-ready assets while preserving the canonical movement/world authority.

## Character/animation candidate

Candidate source: **Quaternius — Universal Base Characters**

Official source:
- https://quaternius.com/packs/universalbasecharacters.html
- https://quaternius.itch.io/universal-base-characters

Source facts published by the author:
- CC0 1.0;
- glTF available;
- humanoid rig;
- average about 13k triangles;
- designed for animation retargeting;
- compatible with the Universal Animation Library.

Candidate animation source: **Quaternius — Universal Animation Library**

Official source:
- https://quaternius.com/packs/universalanimationlibrary.html
- https://quaternius.itch.io/universal-animation-library

Source facts published by the author:
- CC0 1.0;
- GLB/FBX/Blend availability;
- humanoid rig;
- locomotion coverage including idle/walk/jog/sprint and multidirectional movement;
- free for commercial/personal/educational use under CC0.

## Governance boundary

This document does **not** mark either source as integrated, release-cleared or store-ready.

Before an asset enters the canonical game asset set:
1. DT-19 records exact source package, original filename, package hash, derivative hash and transformation steps.
2. DT-13 confirms license/provenance classification under the canonical asset provenance contract.
3. The asset is copied into GitHub or deterministically fetched from a pinned immutable source during an audited build step.
4. The Android artifact records the exact containing commit SHA.
5. The owner accepts the physical-device visual/performance result.

No runtime production dependency may silently fetch a mutable third-party asset URL.

## First integration proof

The first governed character proof should replace **only the visible hero render**, not movement/collision/gameplay authority.

The existing authoritative `hero` TransformNode remains the root for:
- position;
- yaw;
- collision;
- navigation;
- route/GPS;
- interaction distance;
- mission state.

A rigged visual child consumes velocity/heading and exposes:
- Idle;
- Walk Forward;
- Walk Left/Right or strafe/turn response;
- optional Jog only if gameplay speed supports it;
- parcel-carry presentation override.

Acceptance requires:
- local +Z / world-facing contract from #731 preserved;
- no mirrored/reversed motion;
- no foot sliding severe enough to read as backward movement;
- hero remains approximately 1.78 m in the calibrated scene;
- no gameplay/collision authority moves into the imported skeleton;
- Android frame budget is measured on the representative HQ -> Mara -> customer route.

## Current bridge slice

Until that governed binary asset is integrated, `visualTargetJumpV1.ts` is intentionally a **bridge**, not the final art solution. It upgrades material breakup, façade depth, vehicle proportions, lighting and hero silhouette without introducing an untracked third-party binary.

Truth label remains:

`NON-AUTHORITATIVE TECHNICAL/VISUAL SPIKE — NOT AUTHENTIC GAMEPLAY`
