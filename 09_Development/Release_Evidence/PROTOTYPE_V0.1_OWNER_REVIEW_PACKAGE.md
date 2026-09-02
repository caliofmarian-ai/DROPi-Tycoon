# DROPi Tycoon Prototype v0.1 — Owner Review Package

Date: 2026-09-02
Batch lineage: RBATCH-017 evidence package + M-008 owner-review remediation
Authoritative gate: `09_Development/PROTOTYPE_RELEASE_CHECKLIST.md`
Current decision state: **HOLD PROTOTYPE v0.1 RELEASE**

## Governance status

The Project Owner's 2026-09-01 approval of RBATCH-017 resolved the batch execution gate. It did **not** automatically answer the final review questions and is not reused as release sign-off.

Real Android owner review on 2026-09-02 identified release-blocking usability/gameplay-depth gaps. Corrective work is tracked inside M-008 rather than by rewriting completed historical batches or consuming future Phase 2 identifiers.

Detailed checkpoint:

- `09_Development/Release_Evidence/PROTOTYPE_V0.1_OWNER_HOLD_2026-09-02.md`

## Corrective issues now implemented but awaiting real-device re-verification

- **#269 — Interactive map camera controls**
  - PR #270 merged.
  - pinch zoom, pan, rotation, fallback camera buttons, recenter and gameplay-input isolation implemented.
- **#271 — Continuous order generation and route variety**
  - PR #272 merged.
  - sequential orders and varied route templates implemented without changing the approved reward contract.
- **#273 — Explorable and zone-structured first map**
  - PR #274 merged.
  - 1600×1200 centralized world with four canonical zones, roads, sidewalks, 24 structures, decorations and distributed route points implemented.

All three issues remain open with M-008 / `status:in-progress` until the current deployed Android/public runtime is observed.

## Current automated evidence

Repository CI verifies the compiled web runtime, local production launch, deterministic success/failure gameplay loop, economy/reputation settlement, HUD/menu behavior, Bicycle progression, Save/Load safety/continuity, representative mobile viewport/touch contracts, camera-control calculations, continuous-order generation and expanded world-layout contracts.

Latest owner-remediation evidence includes:

- #269 / PR #270 CI `33596071655`: SUCCESS — 296/296 tests at that checkpoint.
- #271 / PR #272 CI `33596828500`: SUCCESS; post-merge `33596917479`: SUCCESS — 310/310 tests at that checkpoint.
- #273 / PR #274 CI `33620081451`: SUCCESS; post-merge `33620188813`: SUCCESS — 320/320 tests at the final PR checkpoint.

Automated evidence does not replace physical-device observation.

## Owner observations still required

1. Open the current public/Railway build on the Android phone and confirm it launches and reaches the expanded playable world.
2. Confirm ordinary tap still moves the player.
3. Confirm one-finger pan, pinch zoom, two-finger rotation, camera +/-/rotate buttons and recenter all work comfortably.
4. Confirm camera gestures do not accidentally trigger order acceptance, movement targets or delivery selection.
5. Confirm all four map zones are visible/distinguishable and the expanded map can be explored without clipping or unreachable areas.
6. Complete several consecutive deliveries without restarting and confirm order IDs/routes continue changing.
7. Confirm notifications match the active generated pickup/destination and successful reward is applied only once.
8. Confirm text is comfortably readable and buttons remain comfortable in portrait and landscape.
9. Confirm performance feels acceptable during normal play.
10. Confirm Save/Load preserves approved progression after a delivery/upgrade and that player position resets according to ODR-001=A.
11. Confirm the objective and next action are clear without developer explanation.
12. Confirm rewards/progression feel meaningful and motivating for a prototype.
13. Play roughly the first five minutes and decide whether the experience is enjoyable enough to prove the concept.

## Final owner questions

- Gameplay: Is the core loop fun enough for Prototype v0.1?
- Clarity: Do you understand what to do without developer explanation?
- Progression: Does earning money and buying the first upgrade feel rewarding?
- Future: Does this prototype prove a foundation worth expanding?

## Decision choices

**APPROVE PROTOTYPE v0.1 RELEASE** — only after the remaining human/device checks are satisfactory and #269/#271/#273 are truthfully resolved.

**HOLD PROTOTYPE v0.1 RELEASE** — current state; keep M-008 In Progress while one or more owner observations remain unsatisfactory or unverified.

## Roadmap dependency

Canonical `MILESTONE_ARCHITECTURE.md` defines M-009 — Employee & Financial Systems as depending on M-008. Therefore RBATCH-018 and later Phase 2 execution must not begin while this final M-008 owner gate remains HOLD.
