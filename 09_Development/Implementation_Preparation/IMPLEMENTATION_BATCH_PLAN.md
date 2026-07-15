# Document Information

Document: IMPLEMENTATION_BATCH_PLAN.md
Project: DROPi Tycoon
Version: 1.3.1
Status: Implementation Preparation — Non-Authoritative
Author: AI Agent (PR #56 correction from Report 057; corrected per Report 065/066; corrected per Report 070; corrected per Report 073)
Language: English
Last Updated: 2026-07-15

---

# Implementation Batch Plan (Corrected)

## Purpose

Define a dependency-ordered, scope-safe implementation plan for Prototype v0.1.

---

## Corrected Batch Count

- Final batch count: **17**
- Batch IDs: **BATCH-001..BATCH-016 plus BATCH-010b**
- Completion-gate verification remains final: **BATCH-016**

---

## Batch Overview

| Batch | Objective | Depends On | Owner Gate |
|---|---|---|---|
| BATCH-001 | GDevelop foundation scaffold | None | None |
| BATCH-002 | Scene/event scaffold wiring | BATCH-001 | None |
| BATCH-003 | Placeholder asset setup | BATCH-001 | None |
| BATCH-004 | Map/player/building world setup | BATCH-002, BATCH-003 | None |
| BATCH-005 | Order generation + lifecycle core | BATCH-004 | None |
| BATCH-006 | Tap-to-Move + camera behavior | BATCH-004 | None |
| BATCH-007 | Order acceptance and pickup | BATCH-005, BATCH-006 | None |
| BATCH-008 | Delivery completion + failure path | BATCH-007 | ODR-004 required |
| BATCH-009 | Economy reward/reputation updates | BATCH-008 | None |
| BATCH-010 | HUD + notifications | BATCH-007, BATCH-009 | None |
| BATCH-010b | MainMenu flow (Start/Continue/new-game guard) | BATCH-002 | None |
| BATCH-011 | CompanyManagement + upgrade purchase flow | BATCH-009, BATCH-010 | None |
| BATCH-012 | Bicycle ownership + speed effect | BATCH-011, BATCH-006 | None |
| BATCH-013 | Save/load implementation | BATCH-011, BATCH-012, BATCH-010b | ODR-001 + ODR-003 required |
| BATCH-014 | Mobile optimization and polish | BATCH-010, BATCH-013 | None |
| BATCH-015 | Full-loop integration verification | BATCH-014 | None |
| BATCH-016 | Release-checklist verification package | BATCH-015 | Human owner approval |

---

## Detailed Batch Definitions

### BATCH-001
- Objective: Create project scaffold (project file, 3 empty scenes, global vars, asset directories).
- Requirements: REQ-145, REQ-146, REQ-147, REQ-149, REQ-150, REQ-151, REQ-173.
- Artifacts: `Game/DROPi_Tycoon.json`, empty scene list, global variable roots.
- Dependencies: none.
- Owner-decision gate: none.
- Non-goals: no gameplay systems, no assets, no runtime logic.
- Validation: project opens; no gameplay objects/events.
- Acceptance criteria: scaffold exists and matches architecture doc.

### BATCH-002
- Objective: Add scene-level event scaffolding and external-sheet bindings.
- Requirements: REQ-145..REQ-147, REQ-155..REQ-160.
- Artifacts: Scene event groups + external event-sheet references.
- Dependencies: BATCH-001.
- Owner-decision gate: none.
- Non-goals: no delivery loop behavior completion.
- Validation: structure present and separated by responsibility.
- Acceptance criteria: scene/event organization aligns with canonical structure.

### BATCH-003
- Objective: Create placeholder asset library and naming-compliant folders.
- Requirements: REQ-166..REQ-177.
- Artifacts: placeholder sprites/UI/audio stubs and naming map.
- Dependencies: BATCH-001.
- Owner-decision gate: none.
- Non-goals: no final art production.
- Validation: placeholders replaceable and correctly named.
- Acceptance criteria: assets exist in canonical folder structure.

### BATCH-004
- Objective: Implement map, player placement, and interaction-ready world entities.
- Requirements: REQ-076, REQ-077, REQ-078, REQ-079, REQ-080, REQ-081, REQ-083, REQ-084, REQ-085, REQ-086, REQ-168, REQ-172.
- Artifacts: GameWorld map composition, player start placement, building/interaction-point entities.
- Dependencies: BATCH-002, BATCH-003.
- Owner-decision gate: none.
- Non-goals: no completed order lifecycle, no gameplay event logic, no save/load behavior.
- Validation: world entities placed; player can navigate world context with required locations.
- Acceptance criteria: world supports upcoming order flow batches.

### BATCH-005
- Objective: Implement order creation and canonical order-state progression core (Created → Available → Accepted only).
- Requirements: REQ-035, REQ-037, REQ-038, REQ-050, REQ-051, REQ-052, REQ-054.
- Artifacts: order state-machine definition and Created→Available→Accepted lifecycle logic in `OrderSystem` event sheet / `OrderEvents` group.
- Dependencies: BATCH-004.
- Owner-decision gate: none.
- Non-goals: no pickup interaction (Accepted→PickedUp); no delivery completion (PickedUp→Completed); no failure path (PickedUp→Failed); no economy or reputation logic; no HUD/button display; no save/load behavior; no BATCH-006+ features.
- Validation: Created→Available→Accepted flow executes deterministically; no economy, HUD, or later-lifecycle logic is introduced.
- Acceptance criteria: one active order model initialises with canonical state machine and advances through Created→Available→Accepted correctly.

### BATCH-006
- Objective: Implement Tap-to-Move and camera tracking behavior.
- Requirements (core): REQ-016, REQ-020, REQ-021, REQ-023.
- Constraints (applicable): REQ-024 (touch target sizing for mobile interaction).
- Removed from BATCH-006 membership: REQ-017, REQ-018, REQ-019, REQ-022.
- Artifacts: Android-first tap-to-move input handling, movement target scaffolding, player movement toward tapped world targets, and camera follow behavior.
- Dependencies: BATCH-004.
- Owner-decision gate: none.
- Non-goals: no Accept Order button, no HUD order acceptance, no UI-driven `AcceptRequested`, no rewards/economy/progression, no pickup/delivery/failure handling, no save/load, no bicycle behavior, no AI/notifications/missions, no BATCH-007+ scope.
- Validation: movement and camera behaviors pass Android-first interaction checks without keyboard or mouse-only dependency.
- Acceptance criteria: tap-to-move and camera follow are implemented with only the allowed BATCH-006 core requirements plus REQ-024 constraint compliance.

### BATCH-007
- Objective: Implement order acceptance UI flow and pickup transition.
- Requirements: REQ-040..REQ-049, REQ-088..REQ-109.
- Artifacts: accept button handling, pickup validation, active-order HUD linkage.
- Dependencies: BATCH-005, BATCH-006.
- Owner-decision gate: none.
- Non-goals: no completed/failed delivery outcomes.
- Validation: Available→Accepted→PickedUp transition passes.
- Acceptance criteria: pickup logic and UI state updates are correct.

### BATCH-008
- Objective: Implement delivery completion and failure branch execution.
- Requirements: REQ-050..REQ-069.
- Artifacts: destination validation, completion event, failure event trigger.
- Dependencies: BATCH-007.
- Owner-decision gate: **ODR-004 required before implementation**.
- Non-goals: no persistence implementation.
- Validation: PickedUp→Completed and PickedUp→Failed both testable.
- Acceptance criteria: failure/complete paths comply with canonical loop.

### BATCH-009
- Objective: Implement economy and reputation outcomes from delivery results.
- Requirements: REQ-060..REQ-064, REQ-128..REQ-133.
- Artifacts: money/reputation updates and affordability checks.
- Dependencies: BATCH-008.
- Owner-decision gate: none.
- Non-goals: no upgrade UI scene implementation.
- Validation: reward and penalty effects update canonical data correctly.
- Acceptance criteria: economy state remains coherent with order outcomes.

### BATCH-010
- Objective: Implement GameWorld HUD and feedback/notification surface.
- Requirements: REQ-094..REQ-110.
- Artifacts: HUD elements, button visibility rules, notifications.
- Dependencies: BATCH-007, BATCH-009.
- Owner-decision gate: none.
- Non-goals: no MainMenu save-flow handling.
- Validation: critical UI information remains visible and responsive.
- Acceptance criteria: HUD supports full loop execution.

### BATCH-010b
- Objective: Implement MainMenu Start/Continue/new-game guard flow.
- Requirements: REQ-088, REQ-111, REQ-118, REQ-119, REQ-120.
- Artifacts: scene entry flow, overwrite confirmation guard.
- Dependencies: BATCH-002.
- Owner-decision gate: none.
- Non-goals: no save serializer implementation.
- Validation: Continue and Start rules align with save policy.
- Acceptance criteria: menu flow is canonically compliant and isolated.

### BATCH-011
- Objective: Implement CompanyManagement scene and upgrade purchase logic.
- Requirements: REQ-019, REQ-071..REQ-073, REQ-089, REQ-092.
- Artifacts: upgrade UI/actions, CompanyManagement scene flow.
- Dependencies: BATCH-009, BATCH-010.
- Owner-decision gate: none.
- Non-goals: no bicycle speed effect application yet.
- Validation: upgrades can be purchased within affordability constraints.
- Acceptance criteria: optional management branch works end-to-end.

### BATCH-012
- Objective: Implement Bicycle ownership effect on movement speed.
- Requirements: REQ-070, REQ-072, REQ-074, REQ-075.
- Artifacts: bicycle-owned state and speed effect application.
- Dependencies: BATCH-011, BATCH-006.
- Owner-decision gate: none.
- Non-goals: no extra vehicles.
- Validation: movement speed increases after bicycle acquisition.
- Acceptance criteria: walking vs bicycle behavior distinction is clear.

### BATCH-013
- Objective: Implement save/load, validation, and autosave policy.
- Requirements: REQ-111..REQ-127, REQ-161..REQ-165.
- Artifacts: local save storage, load validation, autosave triggers.
- Dependencies: BATCH-011, BATCH-012, BATCH-010b.
- Owner-decision gate: **ODR-001 and ODR-003 required before implementation**.
- Non-goals: no cloud/backend/multi-slot scope.
- Validation: required save test cases pass; non-persisted fields remain non-persisted.
- Acceptance criteria: save behavior matches canonical save policy.

### BATCH-014
- Objective: Mobile fit/finish and performance optimization.
- Requirements: REQ-029, REQ-084, REQ-100, REQ-177.
- Artifacts: tuned UI/controls/performance adjustments.
- Dependencies: BATCH-010, BATCH-013.
- Owner-decision gate: none.
- Non-goals: no feature-scope expansion.
- Validation: mobile usability checks pass.
- Acceptance criteria: build is mobile-playable within prototype constraints.

### BATCH-015
- Objective: Integration test full prototype gameplay loop.
- Requirements: REQ-178..REQ-184.
- Artifacts: integration validation evidence and defect list.
- Dependencies: BATCH-014.
- Owner-decision gate: none.
- Non-goals: no release declaration.
- Validation: loop continuity, system interoperability, and regression checks.
- Acceptance criteria: all P0/P1 loop behaviors validated.

### BATCH-016
- Objective: Completion-gate verification package for owner review.
- Requirements: REQ-185..REQ-188.
- Artifacts: release-checklist evidence package (no self-approval).
- Dependencies: BATCH-015.
- Owner-decision gate: **Human owner approval required**.
- Non-goals: AI self-declaration of prototype completion.
- Validation: checklist evidence assembled for all 7 sections.
- Acceptance criteria: package is ready for human gate decision.

---

## Scope-Safety Notes

- Unsupported architecture removed from this plan.
- Excluded features remain excluded and absent from all batches.
- No Owner decision blocks BATCH-001.

---

End of Document
