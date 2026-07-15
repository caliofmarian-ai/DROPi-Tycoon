# Document Information

Document: CHANGELOG.md
Project: DROPi Tycoon
Version: 1.0.0
Status: Development Log
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-07-15 (BATCH-007)

---

# Changelog

## Purpose

This document records important changes made during the development of DROPi Tycoon.

The changelog helps maintain project history and understand how the game evolves over time.

---

# Version Format

Changes follow this structure:

Version

Date

Category

Description

---

# [2026-07-15] - BATCH-007 Pickup Proximity + Accepted→PickedUp Core

## Added

- Added 1 new scene variable to `GameWorld` in `Game/DROPi_Tycoon.json`:
  - `PickupRadius` (number, default 32) — configurable pickup proximity threshold for the BATCH-007 pickup check (IDR-017).
- Implemented 1 standard event in the `OrderEvents` group of `GameWorld` in `Game/DROPi_Tycoon.json`:
  - Conditions: `TouchHasStarted(0)`, `ActiveOrder.Status == "Available"`, and `IsCursorOnObject(Package)`.
  - Action: Set `ActiveOrder.AcceptRequested = 1`.
  - Result: the existing BATCH-005 `OrderSystem` event remains the only `Available → Accepted` transition and is now reachable on Android touch.
- Implemented 1 standard event in the `DeliveryEvents` group of `GameWorld` in `Game/DROPi_Tycoon.json`:
  - Conditions: `ActiveOrder.Status == "Accepted"`, `ActiveOrder.PickupLocation == "PickupZone"`, `PlayerData.CarryingPackage == False`, and `Distance(Player, Package) < Variable(PickupRadius)`.
  - Actions: Set `ActiveOrder.Status = "PickedUp"`, set `PlayerData.CarryingPackage = True`, and set `Player.CarryingPackage = True`.
  - Result: automatic pickup now happens only at the correct pickup location and only once per order lifecycle.

## Requirements Implemented

- REQ-041: `PackagePickedUp` event path implemented through pickup proximity at the correct pickup location.
- REQ-042: `Accepted → PickedUp` order-state transition implemented.
- REQ-043: pickup now validates the correct pickup location before firing.
- REQ-044: carrying state now updates to true after pickup.

## Not Changed

- No delivery completion or failure logic added.
- No reward, money, economy, progression, or save/load logic added.
- No HUD button objects, notifications, or advanced UI added.
- No Bicycle behavior, AI, missions, DronePorts, drones, vans, or other BATCH-008+ features added.
- `OrderSystem` remains the sole owner of the `Available → Accepted` lifecycle transition.
- `Package` visibility and placement remain unchanged.

---

# [2026-07-15] - BATCH-006 Tap-to-Move + Camera Behavior

## Added

- Added `Move` animation to global `Player` sprite object in `Game/DROPi_Tycoon.json`.
  - Uses same placeholder image frame as `Idle` animation (looping, 0.08s frame time).
  - Enables Idle/Move animation switching; placeholder is replaceable with real walk cycle.
- Added 4 new scene variables to `GameWorld` scene in `Game/DROPi_Tycoon.json`:
  - `TapTarget` (structure: `X` number=380, `Y` number=270) — stores the tapped world position.
  - `IsMoving` (number, default 0) — movement state flag (0=idle, 1=moving).
  - `DistanceToTarget` (number, default 0) — updated each frame while moving; used for arrival check.
  - `ArrivalThreshold` (number, default 5) — configurable pixel radius for "destination reached" (IDR-013).
- Implemented `PlayerEvents` event group in `GameWorld` scene in `Game/DROPi_Tycoon.json` containing 5 standard events:
  - Event 1: "BATCH-006 Init — Set movement defaults at scene start"
    - Condition: `DepartScene` (at beginning of scene)
    - Actions: Set `PlayerData.MovementSpeed` = 150 (configurable baseline — IDR-016), set `Player.MovementSpeed` = 150 (object variable sync), set `TapTarget.X` = 380 and `TapTarget.Y` = 270 (Player start position), set `ArrivalThreshold` = 5, set `IsMoving` = 0.
  - Event 2: "BATCH-006 Touch Input — Primary tap-to-move (Android-first)"
    - Condition: `TouchHasStarted(0)` — REQ-020 (touch-first control), REQ-021 (direct tap-to-move)
    - Actions: Set `TapTarget.X` = `TouchX("Base", 0)`, `TapTarget.Y` = `TouchY("Base", 0)`, `IsMoving` = 1.
  - Event 3: "BATCH-006 Mouse Fallback — Desktop testing"
    - Condition: `MouseButtonReleased("Left")` — IDR-012 (optional mouse click fallback)
    - Actions: Set `TapTarget.X` = `MouseX("Base", 0)`, `TapTarget.Y` = `MouseY("Base", 0)`, `IsMoving` = 1.
  - Event 4: "BATCH-006 Movement — Move Player toward TapTarget each frame"
    - Condition: `VarScene IsMoving = 1`
    - Action: Update `DistanceToTarget` = `sqrt((Player.X()-TapTarget.X)^2+(Player.Y()-TapTarget.Y)^2)`.
    - Sub-event A (still moving): `DistanceToTarget > ArrivalThreshold` → move Player X and Y using `angleToPosition` + `TimeDelta()`, set animation `"Move"`.
    - Sub-event B (arrived): `DistanceToTarget <= ArrivalThreshold` → snap Player to TapTarget, set `IsMoving` = 0, set animation `"Idle"`.
  - Event 5: "BATCH-006 Camera Follow — Center camera on Player each frame"
    - Condition: (none — always)
    - Action: `CentreSurObjet("", "Player", "yes")` — REQ-023 (camera follows player), IDR-015.

## Requirements Implemented

- REQ-016: Tap-to-Move behavior fully implemented as the canonical MVP movement method.
- REQ-020: Touch-first control preserved; `TouchHasStarted(0)` is primary input.
- REQ-021: Direct Tap-to-Move: player moves directly to tapped world coordinates.
- REQ-023: Camera follows Player with `CentreSurObjet` each frame.
- REQ-024 (constraint): Touch target sizing enforced via standard full-screen tap input; no HUD interaction added.

## Not Changed

- No Accept Order button or HUD acceptance behavior added.
- No pickup interaction added.
- No delivery interaction added.
- No rewards, money, or economy logic added.
- No save/load behavior added.
- No HUD or notification elements added.
- No AI, failure logic, bicycle, or progression logic added.
- No JavaScript introduced.
- No new sprite assets or audio assets added.
- No BATCH-007+ functionality introduced.
- BATCH-001/002/003/004/005 artifacts remain intact.
- No playable prototype exists.

---

# [2026-07-15] - BATCH-005 Order Generation + Lifecycle Core

## Added

- Added `AcceptRequested` child variable (number, default 0) to `ActiveOrder` scene variable in `GameWorld` scene in `Game/DROPi_Tycoon.json`.
  - This is the implementation-owned trigger field (IDR-010) that BATCH-006 will set to 1 when the player presses the Accept Order button.
- Added `OrderEvents` event group to `OrderSystem` external event sheet in `Game/DROPi_Tycoon.json` containing 2 standard events:
  - Event 1: "Order Initialization — Created → Available"
    - Condition: `DepartScene` (at beginning of scene)
    - Actions: Set `ActiveOrder.OrderID` = "ORDER-001", `ActiveOrder.PickupLocation` = "PickupZone", `ActiveOrder.Destination` = "DeliveryZone", `ActiveOrder.Status` = "Created" then immediately = "Available" (REQ-035)
  - Event 2: "Order Acceptance — Available → Accepted"
    - Conditions: `ActiveOrder.Status == "Available"` AND `ActiveOrder.AcceptRequested == 1`
    - Actions: Set `ActiveOrder.Status` = "Accepted" (REQ-037), Set `PlayerData.CurrentOrder` = `ActiveOrder.OrderID` (REQ-038 player objective), Reset `ActiveOrder.AcceptRequested` = 0 (REQ-038 acceptance complete)

## Requirements Implemented

- REQ-050: Six canonical order states defined and used in event logic: Created, Available, Accepted, PickedUp (downstream), Completed (downstream), Failed (downstream).
- REQ-051: Allowed transitions enforced: Created→Available implemented; Available→Accepted implemented; downstream transitions (Accepted→PickedUp, PickedUp→Completed, PickedUp→Failed) reserved for BATCH-007/008.
- REQ-052: Terminal states (Completed, Failed) have no outbound transitions — confirmed absent in current implementation.
- REQ-054: No cancellation or assignment states present — confirmed.
- REQ-035: Created→Available transition is system-driven and immediate (both states set in the same DepartScene event).
- REQ-037: OrderAccepted event logic implemented: Available → Accepted state transition.
- REQ-038: On acceptance: order status changed (Accepted), player objective updated (PlayerData.CurrentOrder), package assignment implicit in order state (AcceptRequested reset).

## Not Changed

- No pickup interaction added (Accepted→PickedUp reserved for BATCH-007).
- No delivery interaction added.
- No rewards, money, or economy logic added.
- No save/load behavior added.
- No HUD, notifications, or UI elements added.
- No timers, AI, failure logic, bicycle, or progression logic added.
- No JavaScript introduced.
- No new objects, sprites, or assets added.
- No BATCH-006+ functionality introduced.
- BATCH-001/002/003/004 artifacts remain intact.
- No playable prototype exists.

---

# [2026-07-14] - BATCH-004 Map/Player/Building World Setup

## Added

- Created 2 additional placeholder sprite PNG files in `Game/Assets/Sprites/`:
  - `delivery_point_marker.png` (32×32, yellow diamond marker) — delivery/pickup point placeholder (REQ-168)
  - `environment_road_tile.png` (32×32, gray road tile) — road/environment tile placeholder (REQ-172)
- Registered 7 image resources in `Game/DROPi_Tycoon.json` (`resources.resources`):
  - `player_character_idle`, `building_company_small`, `building_residential`, `building_commercial`,
    `package_delivery`, `delivery_point_marker`, `environment_road_tile`
- Created 5 global Sprite object types in `Game/DROPi_Tycoon.json`:
  - `Player` (1 animation "Idle", variables CarryingPackage and MovementSpeed)
  - `Building` (3 animations: "Company" anim=0, "Residential" anim=1, "Commercial" anim=2)
  - `Package` (1 animation "Default")
  - `DeliveryPoint` (1 animation "Default")
  - `Environment` (1 animation "Road" — road/environment tiles)
- Placed 16 static instances in `GameWorld` scene on `Base` layer:
  - 1 Player at (380, 270)
  - 1 Company Building (anim=0) at (368, 182)
  - 2 Residential Buildings (anim=1) at (80, 60) and (160, 60)
  - 2 Commercial Buildings (anim=2) at (580, 60) and (660, 60)
  - 1 Package at (120, 440)
  - 3 DeliveryPoints at (120, 490), (580, 470), (660, 510)
  - 6 Environment road tiles at (240, 200), (272, 200), (304, 200), (336, 200), (432, 200), (464, 200)

## Not Changed

- No event conditions or actions added (conditions=0, actions=0).
- No JavaScript introduced.
- No behaviors added.
- No movement, input, order, delivery, economy, progression, save/load, or AI logic added.
- No playable prototype exists.
- BATCH-001/002/003 artifacts remain intact.
- BATCH-005 not started.

---

# [2026-07-14] - BATCH-003 Placeholder Asset Setup

## Added

- Created 7 sprite placeholder PNG files in `Game/Assets/Sprites/`:
  - `player_character_idle.png` (32×32, bright blue) — player character idle placeholder
  - `player_character_move.png` (32×32, cyan) — player character movement placeholder
  - `building_company_small.png` (48×48, orange) — company building placeholder
  - `building_residential.png` (48×48, green) — residential building placeholder
  - `building_commercial.png` (48×48, yellow) — commercial building placeholder
  - `vehicle_bicycle_basic.png` (32×32, purple) — bicycle vehicle placeholder
  - `package_delivery.png` (32×32, brown) — delivery package placeholder
- Created 1 UI icon placeholder PNG file in `Game/Assets/UI/`:
  - `icon_money.png` (32×32, gold circle) — money/HUD icon placeholder
- Added asset provenance record `08_Assets/BATCH_003_PLACEHOLDER_PROVENANCE.md`.
- Added persistent implementation report `09_Development/AI_Reports/2026-07-14_064_BATCH_003_PLACEHOLDER_ASSET_SETUP_IMPLEMENTATION.md`.

## Not Changed

- `Game/DROPi_Tycoon.json` was not modified. Resource registration deferred to BATCH-004.
- No GDevelop sprite objects were created.
- No scene instances were placed.
- No behaviors, events, or gameplay logic were added.
- No JavaScript was introduced.
- All placeholders are temporary and intended for replacement with final artwork.

---

# [2026-07-14] - BATCH-002 Scene/Event Scaffold Wiring

## Added

- Added exactly three empty external event sheet scaffolds to `Game/DROPi_Tycoon.json`: `OrderSystem`, `EconomySystem`, and `ProgressionSystem`.
- Added exactly seven empty GameWorld event-group scaffolds: `PlayerEvents`, `OrderEvents`, `DeliveryEvents`, `EconomyEvents`, `UIEvents`, `SaveTriggers`, and `SceneFlow`.
- Added empty `SceneFlow` event-group scaffolds to `MainMenu` and `CompanyManagement`.
- Added GameWorld scene-variable scaffolds: `PlayerData`, `ActiveOrder`, and `WorldData`, using canonical sub-structure names only.
- Added GameWorld external-event binding references for the three empty external event sheets.
- Added persistent implementation report `09_Development/AI_Reports/2026-07-14_061_BATCH_002_GDEVELOP_SCENE_EVENT_SCAFFOLD_IMPLEMENTATION.md`.

## Changed

- Replaced the default unnamed GameWorld layer setup with the approved four-layer scaffold partition: `Base`, `HUD`, `Notifications`, `Modal`.
- Updated `00_Project/PROJECT_STATUS.md` to reflect BATCH-002 completion, scaffold status, and unchanged no-gameplay reality.

No gameplay logic was implemented. No objects were added. No JavaScript, save/load behavior, extensions, placeholder assets, or later-batch systems were introduced.

---

# [2026-07-14] - BATCH-001 GDevelop Project Foundation

## Added

- Created the initial GDevelop project scaffold at `Game/DROPi_Tycoon.json` using an official GDevelop example-derived JSON structure adapted to DROPi Tycoon foundation requirements.
- Created required project asset directories: `Game/Assets/Sprites/`, `Game/Assets/Audio/`, and `Game/Assets/UI/`.
- Added exactly three empty scaffold scenes with canonical names: `MainMenu`, `GameWorld`, `CompanyManagement`.
- Added foundation-only global variable roots: `CompanyData`, `GameSettings`, `SaveFormatVersion`.
- Added persistent implementation report `09_Development/AI_Reports/2026-07-14_059_BATCH_001_GDEVELOP_PROJECT_FOUNDATION_IMPLEMENTATION.md`.

## Changed

- Updated `00_Project/PROJECT_STATUS.md` to reflect that implementation has started, BATCH-001 is complete, no gameplay exists yet, and BATCH-002 has not started.

No gameplay logic was implemented. No playable build exists. No external event sheets, JavaScript, save/load behavior, or future-batch systems were added.

---

# [0.1.0] - Initial Documentation Phase

## Added

- Created initial project documentation structure.
- Defined core game vision.
- Established DROPi Tycoon as a logistics simulation game.
- Created foundation documents for gameplay systems.

---

# [2026-07-14] - Prototype v0.1 Implementation Preparation

## Added

- Prototype v0.1 implementation preparation package created: `09_Development/Implementation_Preparation/`
- Corrected requirements inventory with sequential IDs: 188 valid requirements (REQ-001 through REQ-188)
- Corrected architecture package: 3 scenes, 3 external event sheets, 7 event groups, 6 objects (including canonical Vehicle), 3 global variables, 3 scene variables, 2 object variables
- Corrected dependency graph and batch plan: 17 batches (`BATCH-001`..`BATCH-016` + `BATCH-010b`) and verified 14-batch longest critical path
- Corrected traceability matrix: 188 mapped requirements out of 188 (100.00%), zero unmapped requirements, zero orphan artifacts
- Corrected Owner Decision Register: ODR-001, ODR-003, ODR-004 remain; ODR-002 reclassified as non-ODR requirement coverage
- Corrected exclusion register references and integrity checks (removed broken `REQ-EXC-*` references)
- Corrected first implementation batch definition to remain strictly foundation-only and executable
- `09_Development/Implementation_Preparation/` registered as managed directory in DOCUMENT_INDEX.md
- PROJECT_STATUS.md updated to reflect corrected/reverified preparation status while preserving implementation-not-started reality
- Report 056 created: `09_Development/AI_Reports/2026-07-14_056_PROTOTYPE_V01_IMPLEMENTATION_PREPARATION.md`
- Report 056 amended and correction/reverification report added: `09_Development/AI_Reports/2026-07-14_058_PROTOTYPE_V01_IMPLEMENTATION_PREPARATION_CORRECTION_AND_REVERIFICATION.md`
- Corrected readiness verdict for PR #56 package: **A — PR #56 CORRECTED AND VERIFIED — SAFE TO MERGE**

No game code was implemented. No GDevelop project was created. No playable build exists. Prototype v0.1 implementation has not started. No release checklist item was marked complete.

---

# [2026-07-14] - Correction Campaign Completion: F-21 Through F-29 and Final Closure Audit

## Changed

- F-21 and F-22: Repository and index structure corrections — DOCUMENT_INDEX `Game/` and `Builds/` directory entries updated; repository name hyphen consistency verified across live documents.
- F-23: CHANGELOG backfill — prior changelog state restored with accurate development history entries.
- F-24: Prototype v0.1 authoritative completion gate established; `09_Development/PROTOTYPE_RELEASE_CHECKLIST.md` declared the single authoritative gate; PROTOTYPE_V0.1.md, PROTOTYPE_TESTING_PLAN.md, and PROTOTYPE_MILESTONES.md all defer to it explicitly.
- F-25: INITIAL_REPOSITORY_AUDIT.md metadata and indexing completed.
- F-26: PROJECT_INTAKE_PROTOCOL.md updated to support both Git clone and ZIP archive project intake modes.
- F-27: Global five-level Document Authority Hierarchy added to DOCUMENT_INDEX.md, together with eight conflict-resolution rules and the AI-report non-override policy.
- F-28: MISSIONS.md DronePort achievement corrected with Stage 7+ qualifier to avoid Prototype v0.1 scope contradiction.
- F-29: Undefined starting resource "delivery account" removed from GAMEPLAY.md; Bicycle correctly described as the first purchasable vehicle.

## Added

- Final Documentation Closure Audit completed (Report 054 — `09_Development/AI_Reports/2026-07-14_054_FINAL_DOCUMENTATION_CLOSURE_AUDIT.md`): all F-01 through F-29 findings independently verified as resolved. Three new minor follow-up items (NC-01, NC-02, NC-05) identified; none block implementation preparation.

No game code was implemented. No playable build exists. Prototype v0.1 implementation has not started.

---

# [2026-07-13] - Canonical Consistency Corrections Through F-20

## Changed

- Consolidated canonical ownership and structure declarations across live documentation through approved corrections up to F-20, including repository structure/ownership clarity and AI system metadata consistency.
- Maintained project-status reality that implementation is not started and that `Game/` and `Builds/` remain placeholder-only managed directories.

## Fixed

- Corrected documentation inconsistencies covered by approved findings through F-20, including canonical order/state terminology alignment, prototype loop ownership clarity, and documentation-ownership boundary corrections.

---

# [2026-07-12] - Documentation Baseline, Prototype Definitions, and Governance

## Added

- Established and documented the initial project vision and identity foundation in canonical project/game design documents.
- Established the structured canonical documentation architecture and ownership map across repository domains.
- Defined the core gameplay concept and progression model for long-term gameplay design.
- Selected GDevelop as the Prototype v0.1 technology stack.
- Defined Prototype v0.1 scope, included/excluded systems, and prototype success criteria.
- Defined the canonical Prototype v0.1 gameplay loop and clarified ownership boundaries versus long-term gameplay and technical flow documents.
- Defined the canonical Prototype v0.1 Order lifecycle state machine and allowed transitions.
- Defined and corrected Save & Load versus SAFE system ownership boundaries (in-game persistence vs development safety governance).
- Recorded the full documentation consistency audit and initiated the correction campaign as a persistent report stream.
- Established AI reporting governance and mandatory persistent-report protocol for significant AI tasks.

---

# Project Foundation

## Added Systems Documentation

Created documentation for:

- Logistics
- World
- AI
- Technical Architecture
- UI/UX
- Assets
- Development workflow

---

# Development Principles Established

Defined:

- MVP-first approach
- Modular architecture
- Controlled complexity
- Documentation-driven development

---

# Future Entries

All future changes should include:

## Added

New features or systems.

## Changed

Improvements or modifications.

## Removed

Deleted systems or concepts.

## Fixed

Problems corrected.

---

# Changelog Rules

Every major development milestone should update this file.

Changes should be:

- Clear
- Short
- Understandable
- Linked to a specific version

---

# Canonical Rule

The changelog represents the history of DROPi Tycoon development and protects the evolution of the project.

---

End of Document