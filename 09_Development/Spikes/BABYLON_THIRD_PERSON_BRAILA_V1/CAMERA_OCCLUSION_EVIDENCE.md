# Camera obstruction correction — device recording 2026-09-14

Issues #717 / #731; draft PR #712. Base: 45f07eb0a06c72cc0bf971217ff83e3bf9accdc3.

## Evidence observed

Owner video Recording_20260914_073123.mp4, SHA256 01894c9abfb09907749d1921689b9412262ac0951ccbd66e2640215bb770388c, duration 112.6167 s. Extracted frames span the recording; this is not a continuous audio audit. Build in HUD is 768b4b34.

At ~32s the HQ canopy obscures the upper hero; at ~40s HUD shows a recent COLLISION:dropi-hq and 13 average FPS / p95 140.4ms / 604x270. A collision notification alone is not proof of penetration. At ~104s the parcel visibly floats with both hands down; 17 average FPS / p95 73.6ms / 604x270. These are individual HUD samples, not a device-wide benchmark. P2/P3/P4 show ACTIVE. Cold startup is not covered by this recording.

Downloaded and inspected software-render artifact 10337886034 for 45f07eb0: 01-city-start.png and 03-carry.png. The carry contact numbers pass, but the carry screenshot is mostly a wall. Numerical hand/socket contact therefore does not by itself prove a visible interaction. That run failed the touch-forward integration gate and produced no APK; this correction does not weaken that gate.

## Verified source conflict and bounded correction

cameraAuthorityV3 restored the user's radius after main/naturalControls and engine collision work. Its minimum 3.1m could prevent a sufficiently short camera boom near a wall/canopy. The new adapter separates requested zoom from temporary safety radius, tests the entire focus-to-eye segment against enabled gameplay collision bounds plus the HQ canopy and storefront awnings, pulls inward immediately and restores distance smoothly. Player yaw/pitch/sensitivity remain unchanged and engine collision checking stays enabled.

A relocated/blocked lagging focus point snaps to the actual hero focus rather than traversing a building during restart/test relocation. No building colliders, routes, hero positions, economy or save authority are disabled or modified.

verify:camera adds 12 strict checks, including 1152 directional/height sweeps using the named building envelopes derived from current main.ts. This is geometric regression evidence, not rendered or physical Android acceptance. The existing full-bundle rendered gate remains mandatory.

## Remaining acceptance

Review actual rendered screenshots for hero visibility and carry readability, and physical-device free-look/zoom/recenter/near-wall behavior. Corner cases with a blocked focus are explicit TARGET_BLOCKED/FAIL rather than fabricated CLEAR. Android FPS, final image realism and Runway target match remain unaccepted. Do not infer that the camera correction resolves all visual problems or that the next APK is ready until exact-head CI and packaging pass.
