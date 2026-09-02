# DROPi Tycoon Prototype v0.1 — Owner HOLD Checkpoint

Date: 2026-09-02
Milestone: M-008 — Prototype v0.1 Verification & Release
Authoritative gate: `09_Development/PROTOTYPE_RELEASE_CHECKLIST.md`
Prior evidence package: RBATCH-017

## Decision state

**HOLD PROTOTYPE v0.1 RELEASE**

The Project Owner's real Android review identified usability/gameplay-depth failures after the RBATCH-017 evidence package was merged. This checkpoint records those observations without rewriting the historical completion state of RBATCH-004..RBATCH-017.

M-008 remains **In Progress**. M-009 depends on M-008 and therefore Phase 2 / RBATCH-018 must not begin until this owner gate is truthfully resolved.

## Owner-review remediation issues

### #269 — Interactive map camera controls

Planning position: M-008 owner-review remediation.

Traceability:
- E-016 / RBATCH-015 — Mobile Optimization
- historical acceptance gap against E-006 / RBATCH-006 — Player Movement & Camera

Implementation state:
- PR #270 merged as `f27a8aedfe8bf2ee4032fcf8a6fec61ac9126c3d`.
- PR CI `33596071655`: SUCCESS.
- 296/296 tests passed at that checkpoint.

Real Android re-verification still required for pinch zoom, pan, rotation, fallback buttons, recenter and gameplay-input isolation.

### #271 — Continuous order generation and route variety

Planning position: M-008 owner-review remediation.

Traceability:
- E-007 / RBATCH-005 — Order Generation + Lifecycle Core
- E-017 / RBATCH-016 — Full-Loop Integration Verification

Implementation state:
- PR #272 merged as `5b17ece132da0d0a52403be24e6312fdf71c10af`.
- PR CI `33596828500`: SUCCESS.
- post-merge main CI `33596917479`: SUCCESS.
- 310/310 tests passed at that checkpoint.

Real Android re-verification still required for repeated orders, route changes, contextual notifications and exactly-once rewards.

### #273 — Explorable and zone-structured first map

Planning position: M-008 owner-review remediation.

Traceability:
- historical acceptance gap against E-005 / RBATCH-004 — World Map & Environment
- validates practical usefulness of E-006 / RBATCH-006 and #269
- preserves E-007 / RBATCH-005 order semantics and #271

Implementation state:
- PR #274 merged as `38a530655654e3bc116b5de4924973a0ab7363b8`.
- PR CI `33620081451`: SUCCESS.
- post-merge main CI `33620188813`: SUCCESS.
- 320/320 tests passed at the final PR checkpoint.
- world expanded from 800×600 to 1600×1200.
- four canonical zones, roads, sidewalks, 24 structures, decorations and distributed route points are implemented from centralized layout data.

Real Android re-verification still required for exploration, visibility, route reachability, camera behavior and mobile usability across the expanded world.

## Governance boundary

Historical batches remain historically completed/merged according to canonical planning. These owner-review issues are corrective acceptance work inside M-008; they do not consume or rename future roadmap identifiers.

In particular:
- RBATCH-018 remains Phase 2 Employee Hiring & Onboarding.
- M-009 remains Planned — Future and depends on M-008.
- no Phase 2 execution is authorized by this checkpoint.

## Required owner re-review

On the deployed Android/public runtime, verify in one play session:

1. Camera: tap-to-move, pan, pinch zoom, two-finger rotation, +/-/rotate buttons and recenter.
2. Expanded map: all four zones, roads, sidewalks, structures and decorations render and can be explored.
3. Orders: complete several consecutive orders without restarting; IDs/routes should advance and vary.
4. Economy: successful delivery pays once; failure does not duplicate reward; reputation behaves as expected.
5. HUD/input: camera gestures do not accidentally accept orders or choose delivery destinations.
6. Save/Load: after earning money/buying an upgrade, close/reopen and verify Continue restores approved progression while player position resets per ODR-001=A.
7. Mobile quality: text readability, button comfort, portrait/landscape usability, performance and first-five-minute clarity/enjoyment.

## Next planning transition

Only after the Project Owner explicitly records that the M-008 review is satisfactory may the release gate be changed from HOLD and the dependency chain proceed to M-009 / RBATCH-018.

No automated test, CI run or merged PR may substitute for that owner decision.
