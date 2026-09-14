# Authored walking and humanoid pedestrians — evaluation candidate

Parent: #725, #726; draft PR #712. Baseline: b85909fa68fc97f4c7326b14a271cdd932eb78e1.

## Implemented scope

- Replace the slowed Jog_Fwd_Loop proxy with a separately pinned authored walking clip from Universal Animation Library 2 Standard. Build-time validation requires a genuine, unambiguous walking clip, exact target-name coverage and compatible rest rotation axes. Retarget translations by the source/target rest offsets; root horizontal motion cannot become world authority.
- Normal joystick traversal is capped at 1.65 metres/second. Camera-relative input signs, yaw conventions, camera sensitivity, collisions and GPS are unchanged. getSpeed reports post-collision displacement per real frame time rather than requested speed.
- Idle and walk use complementary weights and hysteretic transitions instead of repeated stop/start. Animation progress follows actual motion; blocked movement and teleports do not request a running animation.
- Replace the eight existing capsule presentations with two pinned clothed humanoid variants. Complete hierarchies/materials survive; each copy has its own skeleton and pose. Existing npc-N roots and their routes remain simulation authority. Foot-to-toe geometry determines the adapter's forward frame. Four bind-calibrated sole markers sample governed ground/sidewalk heights.
- Asset containers keep animation carriers out of the live scene. Late hero animation failures dispose partial imports before restoring a fallback.

## Asset evidence

- Universal Animation Library 2 Standard: dustinc555/mygame@6f12ffb2f924af86d910ade13e6e2ba3df8cd3df, LFS OID 9a0ffda4931f934f13fb584002c51673723b03f9655a581167e7e5dae744f086, 8,061,600 bytes. Author declaration: https://quaternius.itch.io/universal-animation-library-2 (CC0).
- Casual Hoodie / Casual Woman: immutable WorldExplorer3D mirror at b5a6a32448fcaa7c5e079ccb78d9d6030de29a00; source SHA-256/size verified in setupHumanoidAssets.mjs. Upstream author pages: https://quaternius.com/packs/ultimatemodularcharacters.html and https://quaternius.com/packs/ultimatemodularwomen.html (CC0).
- MANIFEST.json records the actual selected clip, joint roles and rest-compatibility evidence. PROVENANCE.json retains authors, mirror identities and derivative hashes. Status remains CANDIDATE_NOT_RELEASE_CLEARED.

## Verification boundary

verify:humans checks movement math, actual imported candidate skeletons/material hierarchy, independent animation poses, foot markers and surface sampling in NullEngine. It runs after strict TypeScript, alongside the existing presentation regression suite. NullEngine cannot establish Android visual appearance or performance.

## Explicitly not solved / not accepted

The current close hero still needs a proper courier outfit and a hand/socket-driven carrying pose. Ground sampling is not full planted-foot IK. The pedestrian assets are intermediate stylized humanoids, not the Runway visual target. No higher-resolution/FPS claim, no physical Android acceptance, no global asset clearance, no production integration and no merge to main.

Owner validation must cover initial loading, all eight pedestrians, forward/back/left/right movement and collisions, stops/reversals, shoe-ground contact, package scale, carried posture, near/far draw cost, and full P2/P3/P4 activation.
