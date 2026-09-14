# Native walking and clothed humanoids — evaluation candidate

Parent: #725, #726; draft PR #712. Integration baseline: b85909fa68fc97f4c7326b14a271cdd932eb78e1.

## Implemented scope

- Use native authored Idle and Walk clips on their original clothed bodies. Build-time verification requires an unambiguous genuine walk; no jog/sprint is relabeled. Native character geometry, skin, material slots and animation values remain together.
- The attempted Universal Animation Library 2 transfer was rejected by CI: rest rotation mismatch 0.29794 radians. That candidate is not used. We do not weaken the mismatch threshold or force a name-only transfer onto an incompatible rig.
- Normal joystick traversal is capped at 1.65 metres/second. Input directions, yaw, camera sensitivity, collisions and GPS are unchanged. getSpeed reports post-collision displacement per actual frame time, not requested speed.
- Idle and walk use complementary weights and hysteretic transitions. Animation speed follows actual movement; a blocked hero or teleport does not drive a running animation.
- The hero now uses a clothed Casual Hoodie candidate normalized to 1.78 metres, not the unclothed base character. It uses the existing p1-rigged-hero-root / hero-visual-ground-root contract, and the original hero node retains movement authority.
- Eight pedestrian presentations use two clothed native humanoid variants. Complete material hierarchies survive; every body has its own skeleton and pose. Original npc-N roots and routes remain simulation authority. Capsule presentation is hidden while loading and restored only on explicit failure.
- Foot-to-toe geometry determines visual +Z instead of guessed sign flips. Four bind-calibrated sole probes sample governed ground/sidewalk heights. This is not full planted-foot IK.
- Hero and pedestrians share two scene-scoped asset containers; geometry/materials shared, animation poses independent. Late failures dispose partial models before restoring fallback.

## Asset evidence

Immutable mirror: RRG314/WorldExplorer3D@b5a6a32448fcaa7c5e079ccb78d9d6030de29a00, app/assets/models/characters/.

- city-explorer-v1.glb: Ultimate Modular Men / Casual Hoodie by Quaternius. SHA256 0dba57f454956ca5886a2d72e6c5a65f6dc9d45987dc3d47bfe419ff0d0b82b4, 1,558,208 bytes.
- city-explorer-woman-casual-v1.glb: Ultimate Modular Women / Casual by Quaternius. SHA256 e406f91a5fc6f94cc2ee0df0bfcfcc4c8c4e3949412daeac586201b75df244a6, 1,579,380 bytes.
- Primary author declarations checked 2026-09-14: https://quaternius.com/packs/ultimatemodularcharacters.html and https://quaternius.com/packs/ultimatemodularwomen.html, both CC0.
- MANIFEST.json records actual selected native clip names and foot roles. PROVENANCE.json retains mirror, authors, source/derivative hashes and CANDIDATE_NOT_RELEASE_CLEARED qualification. Final project commercial clearance is not implied.

## Verification boundary

verify:humans checks movement math, actual imported candidate skeletons/material hierarchy, independent animation targets, foot orientation/sole markers and surface sampling in NullEngine. It runs after strict TypeScript and alongside the existing presentation regression suite. Structural tests are not rendered Android acceptance or FPS evidence.

## Explicitly open

The hoodie is an intermediate casual outfit, not the final branded courier uniform. Two-hand carrying and hand sockets are not solved. Foot planting, dynamic performance, render resolution and richer environment materials remain open. The humanoid assets are stylized intermediates, not the Runway visual target. No production integration or merge to main.

Owner validation must cover startup, all eight pedestrians, forward/back/left/right movement and collisions, stops/reversals, shoe-ground contact, package scale and grip, near/far performance, and full P2/P3/P4 activation.
