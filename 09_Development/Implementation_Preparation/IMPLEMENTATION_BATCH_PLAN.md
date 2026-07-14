# Document Information

Document: IMPLEMENTATION_BATCH_PLAN.md
Project: DROPi Tycoon
Version: 1.0.0
Status: Implementation Preparation — Non-Authoritative
Author: AI Agent (Prototype v0.1 Implementation Preparation Task)
Language: English
Last Updated: 2026-07-14

---

# Implementation Batch Plan

## Purpose

This document defines the complete ordered batch plan for DROPi Tycoon Prototype v0.1 implementation.

Each batch is independently reviewable and should be completable in one AI agent session (or a short human session).

**This plan does not execute implementation. It defines what each future implementing agent must do.**

**Canonical requirements govern. If this plan conflicts with canonical documents, canonical documents take precedence.**

---

## Batch Naming Convention

Each batch is identified as `BATCH-NNN` with a descriptive title.

---

# BATCH-001 — GDevelop Project Foundation

## Objective

Create a valid, runnable GDevelop project with correct mobile configuration, empty scenes, global variable schema, and the asset folder skeleton.

## Canonical Requirements Covered

REQ-170, REQ-171, REQ-172, REQ-180, REQ-181, REQ-182, REQ-227

## Preconditions

- Repository is on a new feature branch from origin/main
- `Game/` directory exists (placeholder only) — verified

## Files / Artifacts Expected

- `Game/DROPi_Tycoon.json` — main GDevelop project file
- Empty `Game/DROPi_Tycoon/Assets/Sprites/` directory (or .gitkeep)
- Empty `Game/DROPi_Tycoon/Assets/Audio/` directory
- Empty `Game/DROPi_Tycoon/Assets/UI/` directory

## Implementation Steps

1. Open GDevelop and create a new project named `DROPi_Tycoon`
2. Save project to `Game/DROPi_Tycoon.json`
3. Configure mobile orientation: portrait, target Android
4. Create three empty scenes: `MainMenu`, `GameWorld`, `CompanyManagement`
5. Create global variable structure:
   - `CompanyData` (structure) with fields: CompanyName, Money, Level, Experience, Reputation, UpgradeList (sub-structure with: DeliverySpeed, Capacity, Efficiency, BicycleOwned)
   - `GameSettings` (structure) with fields: TutorialStatus, Sound, Music, Language, Difficulty
   - `SaveFormatVersion` (number, default: 1)
6. Create asset folder structure: `Assets/Sprites/`, `Assets/Audio/`, `Assets/UI/`
7. Verify project opens, launches to a blank screen, and shows no errors

## Non-Goals

- No map, no player object, no events
- No assets (just directory structure)
- No gameplay of any kind

## Validation Procedure

1. Open project in GDevelop — no errors
2. Confirm all 3 scenes exist
3. Confirm global variables exist with correct field names
4. Confirm asset directory structure exists
5. Git status shows only new/modified files under `Game/`

## Acceptance Criteria

- Project opens in GDevelop without errors
- All 3 scenes exist (even if empty)
- Global variable schema matches `GDEVELOP_IMPLEMENTATION_ARCHITECTURE.md` Section 7
- Asset folder structure present

## Regression Checks

- No documentation files were modified

## Dependencies

None

## Human Approval Required

No (technical foundation only)

---

# BATCH-002 — Scene Scaffold & External Event Sheet Definitions

## Objective

Create the event-sheet scaffold for all 3 scenes and define the 3 external event sheets with their initial event groups (empty, correctly named).

## Canonical Requirements Covered

REQ-165, REQ-166, REQ-170, REQ-171, REQ-172, REQ-173, REQ-174, REQ-175

## Preconditions

- BATCH-001 complete

## Files / Artifacts Expected

- `Game/DROPi_Tycoon.json` updated with:
  - External event sheet: `OrderSystem`
  - External event sheet: `EconomySystem`
  - External event sheet: `ProgressionSystem`
  - GameWorld scene: includes OrderSystem, EconomySystem, ProgressionSystem
  - GameWorld scene event groups: PlayerEvents, OrderEvents, DeliveryEvents, UIEvents, SaveTriggers, CameraEvents
  - CompanyManagement scene: includes EconomySystem, ProgressionSystem
  - MainMenu scene event groups: GameStarted, StartGame, ContinueGame, SettingsMenu

## Implementation Steps

1. Create external event sheet `OrderSystem` with empty event groups: GenerateOrder, TransitionOrderState, ValidatePickup, ValidateDelivery
2. Create external event sheet `EconomySystem` with empty event groups: AddDeliveryReward, DeductUpgradeCost, ValidateAffordability
3. Create external event sheet `ProgressionSystem` with empty event groups: UpdateLevel, UpdateReputation, ApplyUpgradeEffect, ApplyBicycleEffect
4. In GameWorld scene events, add `Include` for all 3 external sheets
5. In GameWorld scene events, create empty named event groups: PlayerEvents, OrderEvents, DeliveryEvents, UIEvents, SaveTriggers, CameraEvents
6. In CompanyManagement scene events, add `Include` for EconomySystem and ProgressionSystem
7. In MainMenu scene events, create empty named event groups: GameStarted, StartGame, ContinueGame, SettingsMenu

## Non-Goals

- No gameplay events yet — event groups are empty scaffolds
- No UI objects yet

## Validation Procedure

1. Project opens without errors
2. All 3 external event sheets exist and are named correctly
3. GameWorld includes all 3 external sheets
4. Event group names match canonical specification

## Acceptance Criteria

- Event sheet scaffold matches architecture in `GDEVELOP_IMPLEMENTATION_ARCHITECTURE.md` Section 5

## Regression Checks

- BATCH-001 artifacts still intact

## Dependencies

BATCH-001

## Human Approval Required

No

---

# BATCH-003 — Placeholder Asset Creation

## Objective

Create placeholder sprites for all required prototype objects using simple colored shapes, correctly named per the asset naming convention.

## Canonical Requirements Covered

REQ-220 through REQ-233

## Preconditions

- BATCH-001 complete

## Files / Artifacts Expected

Sprites in `Game/DROPi_Tycoon/Assets/Sprites/`:
- `player_character_idle` (blue square placeholder)
- `player_character_walk` (blue square, slightly different)
- `building_company` (dark gray rectangle)
- `building_residential` (beige/tan rectangle)
- `building_commercial` (orange rectangle)
- `delivery_point_pickup` (green circle/marker)
- `delivery_point_destination` (red circle/marker)
- `package_basic` (yellow square)
- `vehicle_bicycle_basic` (blue square with different aspect ratio or marking)
- `map_road_h` (light gray horizontal strip)
- `map_road_v` (light gray vertical strip)
- `map_road_intersection` (light gray square)
- `map_grass` (green rectangle)
- `map_sidewalk` (light gray narrow strip)

UI assets in `Game/DROPi_Tycoon/Assets/UI/`:
- `icon_money` (simple coin icon or yellow circle)
- `icon_level` (simple star or number indicator)
- `icon_order` (simple box/package icon)
- `button_accept` (green button placeholder)
- `button_deliver` (blue button placeholder)
- `button_upgrade` (purple button placeholder)
- `button_back` (gray button placeholder)

## Implementation Steps

1. Create each sprite as a minimal PNG using GDevelop's built-in shape drawing or imported from simple external tool
2. Name each file exactly per the naming convention
3. Import all sprites into correct GDevelop asset folders

## Non-Goals

- No polished art required
- No audio assets required at this stage (deferred)

## Validation Procedure

1. All named assets appear in GDevelop asset manager
2. Asset names match naming convention from `ASSETS.md`
3. Each placeholder is visually distinguishable from others

## Acceptance Criteria

- All required prototype objects have placeholder sprites
- All assets are in correct folders

## Regression Checks

- BATCH-001 project file still opens without error

## Dependencies

BATCH-001

## Human Approval Required

No

---

# BATCH-004 — GameWorld Map & Player Object

## Objective

Create the first playable map with all required location types, add the Player object, implement basic camera follow.

## Canonical Requirements Covered

REQ-044, REQ-080, REQ-081, REQ-082, REQ-083, REQ-084, REQ-085, REQ-086, REQ-087, REQ-088, REQ-089, REQ-090, REQ-091, REQ-190, REQ-191, REQ-192, REQ-193

## Preconditions

- BATCH-002, BATCH-003 complete

## Files / Artifacts Expected

- GameWorld scene updated with:
  - Map layout (tile-based or sprite-placed): roads, grass, sidewalks
  - Building objects placed: CompanyBase, residential buildings (2–4), commercial buildings (2–3)
  - DeliveryPoint objects: at least 2 pickup points, at least 2 destination points
  - Player object at starting position near CompanyBase
  - Camera configured to follow Player

## Implementation Steps

1. In GameWorld scene, place map tiles using placeholder road/grass/sidewalk sprites
2. Create map layout matching `FIRST_MAP_DESIGN.md` zones: residential, company base, business, pickup areas
3. Add `Building` objects (instances) for company base, residential, commercial buildings
4. Set Building object variables: BuildingName, BuildingType, IsInteractive
5. Add `DeliveryPoint` objects at logical locations; set PointID, PointType (Pickup/Destination)
6. Add `Player` object at start position (near CompanyBase)
7. Set Player object variables: CarryingPackage=false, MovementSpeed=[agent chooses — see IDR-001]
8. Configure camera to follow Player object with smooth movement
9. Add basic zoom capability

## Non-Goals

- No movement events yet (BATCH-006)
- No order events yet (BATCH-005)
- No HUD yet (BATCH-010)

## Validation Procedure

1. GameWorld scene shows player at starting position
2. All building types visible at distinct locations
3. At least 2 pickup points and 2 destination points visible
4. Camera follows player when player position is set manually (test with debug object or console)
5. Player, Building, DeliveryPoint object variables accessible

## Acceptance Criteria

- GameWorld scene renders a navigable small-neighborhood map
- All required location types present
- Player object exists with correct variables

## Regression Checks

- BATCH-001/002/003 still intact

## Dependencies

BATCH-002, BATCH-003

## Human Approval Required

No

---

# BATCH-005 — Order System (Generation + Lifecycle)

## Objective

Implement order generation, the full order state machine, and all MVP game events related to orders.

## Canonical Requirements Covered

REQ-035 through REQ-039b, REQ-055 through REQ-059, REQ-115 (OrderCreated event)

## Preconditions

- BATCH-004 complete (DeliveryPoint objects exist)

## Files / Artifacts Expected

- `OrderSystem` external event sheet populated with:
  - GenerateOrder group: creates order with unique ID, sets status to Created then Available, assigns PickupLocation/Destination from available DeliveryPoints
  - TransitionOrderState group: handles state transitions (Available→Accepted, Accepted→PickedUp, PickedUp→Completed, PickedUp→Failed)
- `GameWorld` scene variable `ActiveOrder` populated with correct structure fields
- OrderCreated game event raised when order is generated

## Implementation Steps

1. In `OrderSystem.GenerateOrder`: create logic to generate a simple order on game start or after previous delivery completes
2. Assign a unique OrderID (timestamp + random, or counter)
3. Pick a random PickupDeliveryPoint and a random DestinationDeliveryPoint (different from pickup)
4. Set `ActiveOrder.Status = "Available"`
5. Fire `OrderCreated` scene event
6. In `TransitionOrderState`: implement all 5 allowed transitions with correct status string values
7. Set `ActiveOrder.PickupLocation` and `ActiveOrder.Destination` from selected DeliveryPoints
8. In `GameWorld.OrderEvents` event group: handle display of active order info when status changes

## Non-Goals

- No player acceptance yet (BATCH-007)
- No pickup detection yet (BATCH-007)
- No delivery detection yet (BATCH-008)
- No reward yet (BATCH-009)

## Validation Procedure

1. On game start, `ActiveOrder.Status` becomes "Available"
2. `ActiveOrder.OrderID` is non-empty and unique
3. `ActiveOrder.PickupLocation` and `.Destination` point to valid positions
4. State transitions can be triggered manually (debug) and status string values are exact

## Acceptance Criteria

- Order generated automatically on game start
- All 6 status values are correct strings
- All 5 allowed transitions work correctly (no invalid transitions possible)

## Regression Checks

- BATCH-004 map and player still intact

## Dependencies

BATCH-004

## Human Approval Required

No

---

# BATCH-006 — Player Movement (Tap-to-Move)

## Objective

Implement Tap-to-Move player movement with correct interaction zone detection for buildings and delivery points.

## Canonical Requirements Covered

REQ-020, REQ-021, REQ-022, REQ-025, REQ-026, REQ-028

## Preconditions

- BATCH-004 complete

## Files / Artifacts Expected

- `GameWorld` scene `PlayerEvents` event group populated:
  - Touch input: on screen tap, move Player to tapped position
  - Player moves at MovementSpeed toward target
  - On overlap with Building (IsInteractive=true): interaction available
  - On overlap with DeliveryPoint: interaction available
  - Camera follows Player with smooth movement

## Implementation Steps

1. In `PlayerEvents`: detect touch input (touch position on screen)
2. Convert touch screen coordinates to world coordinates
3. Set Player movement target to world coordinates
4. Use GDevelop pathfinding behavior or direct movement behavior to move Player
5. Player moves at `Player.MovementSpeed` units/second
6. Camera: configure smooth follow of Player object
7. Add interaction zone detection: when Player overlaps DeliveryPoint, set a scene variable `PlayerAtDeliveryPoint=true` with PointID
8. When Player overlaps Building with IsInteractive=true, set scene variable `PlayerAtBuilding=true`

## Non-Goals

- No order acceptance logic yet (BATCH-007)
- No pickup/delivery detection yet (BATCH-007)
- No HUD yet (BATCH-010)

## Validation Procedure

1. Tap on map → Player moves to tapped location
2. Player stops at destination
3. Camera follows Player
4. When Player reaches a DeliveryPoint, the overlap is detected (verify with debug console)

## Acceptance Criteria

- Tap-to-Move works on touch device / touch simulation
- Player speed configurable via MovementSpeed variable
- Camera follow smooth

## Regression Checks

- Order generation (BATCH-005) still works
- Map layout intact

## Dependencies

BATCH-004

## Human Approval Required

No

---

# BATCH-007 — Order Acceptance & Package Pickup

## Objective

Implement order acceptance button, pickup detection, and PackagePickedUp event.

## Canonical Requirements Covered

REQ-040 through REQ-049, REQ-106, REQ-115 (OrderAccepted, PackagePickedUp events)

## Preconditions

- BATCH-005, BATCH-006 complete

## Files / Artifacts Expected

- HUD: `Accept Order` button (shown when `ActiveOrder.Status = "Available"`)
- `GameWorld.DeliveryEvents` + `OrderSystem.TransitionOrderState`:
  - On Accept Order button tap: fire `OrderAccepted`, transition Available→Accepted
  - On Player overlaps PickupDeliveryPoint with matching AssignedOrderID and status=Accepted: fire `PackagePickedUp`, transition Accepted→PickedUp
  - Player.CarryingPackage = true after pickup
  - Package sprite appears on/near Player after pickup

## Implementation Steps

1. Create Accept Order button on HUD layer (shown only when status=Available)
2. On button tap: validate player can accept (status is Available, not already carrying), call TransitionOrderState (Available→Accepted)
3. Fire `OrderAccepted` event
4. Update `ActiveOrder.Status = "Accepted"`
5. Set `DeliveryPoint.AssignedOrderID` on the pickup point
6. In `DeliveryEvents`: when Player overlaps DeliveryPoint where PointType="Pickup" and AssignedOrderID = ActiveOrder.OrderID and ActiveOrder.Status = "Accepted"
7. Call TransitionOrderState (Accepted→PickedUp), fire PackagePickedUp
8. Set Player.CarryingPackage = true
9. Show Package object on Player (or overlay visual)
10. Hide Accept Order button, show Deliver button (disabled until at destination)

## Non-Goals

- No delivery completion yet (BATCH-008)
- No money reward yet (BATCH-009)
- No full HUD yet (BATCH-010)

## Validation Procedure

1. Accept Order button visible when status=Available
2. Button tap transitions order to Accepted
3. Player moves to pickup point → status becomes PickedUp
4. Player.CarryingPackage = true after pickup

## Acceptance Criteria

- Full Accepted→PickedUp path works
- Order state transitions are correct
- PackagePickedUp event fires

## Regression Checks

- Order generation (BATCH-005) still works
- Player movement (BATCH-006) still works

## Dependencies

BATCH-005, BATCH-006

## Human Approval Required

No

---

# BATCH-008 — Delivery Completion & Failure

## Objective

Implement delivery completion detection, DeliveryCompleted event, DeliveryFailed event, and failure display.

## Canonical Requirements Covered

REQ-050 through REQ-057, REQ-065 through REQ-069, REQ-107, REQ-115 (DeliveryCompleted, DeliveryFailed events)

## Preconditions

- BATCH-007 complete

## Files / Artifacts Expected

- `GameWorld.DeliveryEvents` + `OrderSystem.TransitionOrderState`:
  - Deliver button visible when Player at destination and CarryingPackage=true
  - On Deliver button tap: verify destination, fire DeliveryCompleted, transition PickedUp→Completed
  - On failure condition: fire DeliveryFailed, transition PickedUp→Failed, display failure message
  - After Completed or Failed: reset CarryingPackage=false, generate new order

## Implementation Steps

1. Deliver button: show when Player overlaps DestinationDeliveryPoint where AssignedOrderID matches and status=PickedUp and CarryingPackage=true
2. On Deliver tap: call TransitionOrderState (PickedUp→Completed), fire DeliveryCompleted
3. Set Player.CarryingPackage = false
4. Remove Package visual from Player
5. After Completed: trigger new order generation
6. Failure path: define at least one failure condition (e.g., delivery cancelled by player — optional tap on Cancel, or timeout if timer implemented)
7. On failure: TransitionOrderState (PickedUp→Failed), fire DeliveryFailed, display failure notification (reputation consequence message)
8. After Failed: reset and generate new order

## Non-Goals

- No money reward yet (BATCH-009)
- No full HUD yet (BATCH-010)
- No reputation update yet (BATCH-009/011)

## Validation Procedure

1. Player at destination with package → Deliver button visible
2. Deliver tap → status = Completed, DeliveryCompleted event fires
3. Failure path can be triggered and results in status = Failed
4. After both outcomes, new order is generated

## Acceptance Criteria

- PickedUp→Completed path works
- PickedUp→Failed path works
- No invalid transitions can occur

## Regression Checks

- Order acceptance and pickup (BATCH-007) still work

## Dependencies

BATCH-007

## Human Approval Required

No

---

# BATCH-009 — Economy System (Rewards + Money)

## Objective

Implement money reward after delivery completion, money deduction for upgrade costs, MoneyReceived event, HUD money display update.

## Canonical Requirements Covered

REQ-060 through REQ-064, REQ-115 (MoneyReceived event)

## Preconditions

- BATCH-008 complete

## Files / Artifacts Expected

- `EconomySystem` external event sheet populated:
  - AddDeliveryReward: on DeliveryCompleted, add `ActiveOrder.Reward` to `CompanyData.Money`, fire MoneyReceived
  - DeductUpgradeCost: on UpgradePurchased, subtract upgrade cost from CompanyData.Money
  - ValidateAffordability: check CompanyData.Money >= cost before allowing purchase
- Money value visible in HUD (basic text display — full HUD in BATCH-010)

## Implementation Steps

1. In `EconomySystem.AddDeliveryReward`: triggered after DeliveryCompleted event
2. Add `ActiveOrder.Reward` to `CompanyData.Money`
3. Update reputation: `CompanyData.Reputation` += positive delta
4. Fire `MoneyReceived` game event
5. In `EconomySystem.DeductUpgradeCost`: triggered after UpgradePurchased (called from BATCH-011)
6. Subtract cost from `CompanyData.Money`
7. In `EconomySystem.ValidateAffordability`: return bool (Money >= requiredCost)
8. Add basic money display to GameWorld HUD area (even a simple text object is sufficient)

## Non-Goals

- Full HUD in BATCH-010
- Upgrade system in BATCH-011

## Validation Procedure

1. Complete delivery → CompanyData.Money increases by reward amount
2. MoneyReceived event fires
3. Money display updates in scene

## Acceptance Criteria

- Money correctly updated after delivery
- Economy system is modular (delivery system does not directly change money)

## Regression Checks

- Delivery completion (BATCH-008) still works

## Dependencies

BATCH-008

## Human Approval Required

No

---

# BATCH-010 — HUD & Notification System

## Objective

Implement complete HUD with all required elements and the notification popup system.

## Canonical Requirements Covered

REQ-092 (partial), REQ-094, REQ-095, REQ-096, REQ-097, REQ-098 (partial), REQ-099, REQ-101 through REQ-115

## Preconditions

- BATCH-007, BATCH-009 complete

## Files / Artifacts Expected

- GameWorld `HUD` layer (separate from Base layer) with:
  - Money display (top area)
  - Level display (top area)
  - Active order panel (bottom area): pickup, destination, reward
  - Accept Order button (conditional visibility)
  - Deliver button (conditional visibility)
  - Upgrade/Management button (conditional visibility)
- Notification system: popup message on HUD/Notifications layer, auto-dismiss after 2–3 seconds
- Notification triggers: delivery completed, order accepted, delivery failed, purchase failed

## Implementation Steps

1. Add HUD layer to GameWorld scene
2. Create HUD objects: MoneyText, LevelText, ReputationText, OrderPanel, AcceptButton, DeliverButton, UpgradeButton
3. Wire MoneyText to `CompanyData.Money`, update every frame (or on MoneyReceived event)
4. Wire LevelText to `CompanyData.Level`
5. Wire OrderPanel visibility and content to `ActiveOrder` scene variable fields
6. Implement button conditional visibility (per requirements REQ-106, REQ-107, REQ-108)
7. Create notification system: spawn notification text object on Notifications layer with fade-out behavior
8. Connect notifications to game events: OrderAccepted, DeliveryCompleted, DeliveryFailed, PurchaseFailed
9. Test on different screen sizes (different zoom levels)

## Non-Goals

- CompanyManagement scene (BATCH-011)
- Save system (BATCH-013)

## Validation Procedure

1. Money displayed and updates after delivery
2. Active order info visible in bottom panel
3. Buttons show/hide based on game state correctly
4. Notification appears and disappears after delivery
5. HUD renders above game world

## Acceptance Criteria

- All HUD elements function correctly
- Notifications display for all required events

## Regression Checks

- Economy and delivery systems still work

## Dependencies

BATCH-007, BATCH-009

## Human Approval Required

No

---

# BATCH-010b — MainMenu Scene

## Objective

Implement the MainMenu scene with Start Game, Continue, and Settings buttons including the new game guard.

## Canonical Requirements Covered

REQ-092, REQ-127, REQ-128, REQ-129, REQ-173

## Preconditions

- BATCH-002 complete

## Files / Artifacts Expected

- MainMenu scene with: title display, Start Game button, Continue button, Settings (basic)
- New game guard: if valid save exists and player taps Start Game, show confirmation dialog
- Continue: transitions to GameWorld and loads save (wired to BATCH-013 save load call — may be a stub until BATCH-013)
- Start Game (confirmed): initializes new game data, transitions to GameWorld

## Implementation Steps

1. Add title text/logo to MainMenu scene
2. Add Start Game, Continue, Settings buttons
3. Continue button: check if save slot has data — if yes, transition to GameWorld (load call stub)
4. Start Game button: if save slot empty, directly initialize new game → GameWorld; if save slot has data, show confirmation modal
5. Confirmation modal: "Overwrite existing progress?" Yes/No buttons
6. On Yes: clear save data, initialize defaults, transition to GameWorld
7. On No: return to MainMenu
8. Company name input (if implementing in v0.1 — see ODR-002)

## Non-Goals

- Full save/load implementation (BATCH-013 provides this)
- Settings implementation beyond basic structure

## Validation Procedure

1. Start Game with no save → directly enters GameWorld
2. Start Game with valid save → confirmation dialog appears
3. Continue with valid save → enters GameWorld
4. Continue with no save → Start Game behavior or disabled button

## Acceptance Criteria

- New game guard works correctly
- Transitions to GameWorld work

## Regression Checks

- BATCH-002 event scaffold intact

## Dependencies

BATCH-002

## Human Approval Required

No

---

# BATCH-011 — Upgrade System & CompanyManagement Scene

## Objective

Implement CompanyManagement scene with upgrade purchase logic, UpgradePurchased event, and progression tracking.

## Canonical Requirements Covered

REQ-019, REQ-070 through REQ-074, REQ-093, REQ-098, REQ-112, REQ-115 (UpgradePurchased event), REQ-161, REQ-174, REQ-175, REQ-204

## Preconditions

- BATCH-009, BATCH-010 complete

## Files / Artifacts Expected

- CompanyManagement scene populated with:
  - Company info panel (Money, Level, Reputation display)
  - Upgrade list: DeliverySpeed, Capacity, Efficiency (with cost display and purchase button)
  - Bicycle purchase entry (cost display and purchase button)
  - Back button to return to GameWorld
- `ProgressionSystem` populated:
  - UpdateLevel, UpdateReputation event groups implemented
  - ApplyUpgradeEffect: when upgrade purchased, apply effect (e.g., increase MovementSpeed for DeliverySpeed upgrade)
- `EconomySystem.DeductUpgradeCost`: wired to UpgradePurchased
- Upgrade button in GameWorld HUD: navigates to CompanyManagement

## Implementation Steps

1. Design CompanyManagement scene layout with upgrade cards
2. For each upgrade (DeliverySpeed, Capacity, Efficiency): show name, current level, cost, purchase button
3. Purchase button: validate affordability, deduct cost, increment upgrade level, fire UpgradePurchased, apply effect
4. Bicycle entry: cost display, purchase button (disabled if BicycleOwned=true), on purchase: BicycleOwned=true, apply speed effect
5. In `ProgressionSystem.ApplyUpgradeEffect`: on DeliverySpeed upgrade purchase, increase Player.MovementSpeed
6. Back button: transition back to GameWorld
7. Level and reputation update logic in ProgressionSystem
8. Purchase feedback notification

## Non-Goals

- Bicycle movement visual effect (BATCH-012)
- Save & Load (BATCH-013)

## Validation Procedure

1. Open CompanyManagement from GameWorld
2. Purchase DeliverySpeed upgrade (with enough money) → level increments, money decreases
3. Purchase fails when insufficient money → "not enough money" notification
4. Back button returns to GameWorld
5. Upgrade levels visible

## Acceptance Criteria

- All 3 upgrade types purchasable
- Economy correctly deducted
- Upgrade effects applied
- UpgradePurchased event fires

## Regression Checks

- Economy system (BATCH-009) still works
- HUD updates (BATCH-010) still work

## Dependencies

BATCH-009, BATCH-010

## Human Approval Required

No

---

# BATCH-012 — Bicycle Purchase & Movement Speed Effect

## Objective

Finalize Bicycle purchase flow, apply MovementSpeed increase when Bicycle is owned, and confirm persistence via BicycleOwned flag.

## Canonical Requirements Covered

REQ-075 through REQ-079b, REQ-023

## Preconditions

- BATCH-011, BATCH-006 complete

## Files / Artifacts Expected

- CompanyManagement Bicycle entry: functional purchase, BicycleOwned=true after purchase
- `ProgressionSystem.ApplyBicycleEffect`: when BicycleOwned becomes true, set Player.MovementSpeed to higher value
- Player sprite update when carrying Bicycle (optional visual — `IMPLEMENTATION DETAIL`)
- On game load: if BicycleOwned=true, re-apply MovementSpeed increase (handled in BATCH-013 load path)

## Implementation Steps

1. In CompanyManagement: Bicycle purchase button visible and enabled only when BicycleOwned=false
2. On purchase: set `CompanyData.UpgradeList.BicycleOwned = true`, deduct cost via EconomySystem
3. In `ProgressionSystem.ApplyBicycleEffect`: set Player.MovementSpeed = [higher value — see IDR-001]
4. Fire UpgradePurchased event (so autosave triggers — BATCH-013 will implement)
5. Optionally update Player sprite to show bicycle visual state

## Non-Goals

- Advanced vehicle mechanics (no maintenance, fuel, damage — canonically excluded)
- Enter/exit animation
- Full save/load (BATCH-013)

## Validation Procedure

1. Purchase Bicycle → BicycleOwned = true
2. Player moves noticeably faster after Bicycle purchase
3. Bicycle purchase button disabled after purchase

## Acceptance Criteria

- Bicycle correctly purchased
- MovementSpeed increased
- BicycleOwned flag correctly set

## Regression Checks

- Upgrade system (BATCH-011) still works
- Player movement (BATCH-006) still works

## Dependencies

BATCH-011, BATCH-006

## Human Approval Required

No

---

# BATCH-013 — Save & Load System

## Objective

Implement the complete Save & Load system per `SAVE_SYSTEM.md`, including autosave, Continue, new game guard, data validation, corrupted save handling, and save format version.

## Canonical Requirements Covered

REQ-120 through REQ-136

## Preconditions

- BATCH-011, BATCH-012, BATCH-010b complete (all persisted data fields exist)

## Files / Artifacts Expected

- `GameWorld` scene `SaveTriggers` event group populated:
  - Autosave after DeliveryCompleted
  - Autosave after UpgradePurchased
  - Autosave after progression state change
  - Autosave after tutorial step completion (if applicable)
- `MainMenu.ContinueGame` event group: load save, validate, apply to global variables
- `MainMenu.StartGame` new game initialization: write defaults to save slot
- Save data validation on load
- Corrupted save handling and player notification
- Save format version check

## Implementation Steps

1. In `SaveTriggers.AutosaveAfterDelivery`: after DeliveryCompleted event, write CompanyData + GameSettings.TutorialStatus + SaveFormatVersion to GDevelop Storage key `DROPi_Tycoon_Save` as JSON
2. In `SaveTriggers.AutosaveAfterUpgrade`: after UpgradePurchased event, same write
3. In `SaveTriggers.AutosaveAfterProgression`: after level-up or reputation change, same write
4. In `MainMenu.ContinueGame`: read from Storage key, check if data exists
5. Validate each required field (Money ≥ 0, Level > 0, UpgradeList fields non-negative, TutorialStatus boolean)
6. If invalid/missing fields: apply safe defaults for those fields only
7. If save is unreadable/structurally invalid: show notification "Progress could not be restored", require confirmation before new game
8. Check SaveFormatVersion — if incompatible, treat as corrupted
9. If valid: apply all fields to CompanyData and GameSettings globals, transition to GameWorld
10. In `MainMenu.StartGame`: write default values to Storage key (new game)
11. New game guard: check if Storage key has data, if yes, show confirmation dialog before overwriting
12. In GameWorld load path: if BicycleOwned=true, call ApplyBicycleEffect

## Non-Goals

- Multiple save slots (excluded by SAVE_SYSTEM.md)
- Cloud save (excluded)
- Manual save UI (excluded by SAVE_SYSTEM.md)

## Validation Procedure

Execute all 7 canonical persistence test cases from `SAVE_SYSTEM.md` / `PROTOTYPE_TESTING_PLAN.md`:
1. Save after delivery → close → reopen → money and progression restored ✓
2. Save after upgrade → close → reopen → upgrade state restored ✓
3. Close mid-session without save trigger → last saved state restored ✓
4. Start new game, no save → initializes correctly ✓
5. Start new game with valid save → confirmation required ✓
6. Corrupted save → no crash, player informed, confirmation required ✓
7. Missing save file → new game without error ✓

## Acceptance Criteria

- All 7 persistence test cases pass

## Regression Checks

- All prior systems still function after save/load cycle
- Bicycle ownership correctly re-applied on Continue

## Dependencies

BATCH-011, BATCH-012, BATCH-010b

## Human Approval Required

No (implementation batch); yes for final verification via BATCH-016

---

# BATCH-014 — Mobile Experience Optimization

## Objective

Optimize touch controls, UI layout, and performance for mobile device targets.

## Canonical Requirements Covered

REQ-025 through REQ-029, REQ-029, REQ-084, REQ-100, REQ-245

## Preconditions

- BATCH-013 complete

## Files / Artifacts Expected

- Adjusted button sizes (minimum touch target 44px equivalent)
- Adjusted text sizes for mobile readability
- UI layout tested at 360×640 (small Android) and 414×896 (large Android) screen sizes
- Performance check: no noticeable frame drops on average device

## Implementation Steps

1. Review all HUD buttons — ensure touch targets are comfortably tappable
2. Review all text elements — ensure readable at mobile screen size
3. Test at multiple GDevelop preview resolutions
4. Optimize any map objects that may cause performance issues (reduce unnecessary update events)
5. Ensure camera does not show black borders at edge of map

## Non-Goals

- Visual polish beyond baseline clarity
- Audio implementation (deferred — no audio required for Prototype v0.1 core)

## Validation Procedure

1. Full gameplay loop completable without accidental taps
2. Text is readable
3. Performance acceptable in GDevelop preview
4. HUD elements not overlapping or clipped

## Acceptance Criteria

- Mobile experience checklist items (PROTOTYPE_RELEASE_CHECKLIST.md Section 4) can be marked

## Regression Checks

- Save/load system (BATCH-013) unaffected

## Dependencies

BATCH-013

## Human Approval Required

No

---

# BATCH-015 — Integration Test — Full Gameplay Loop

## Objective

Execute the complete Prototype v0.1 gameplay loop end-to-end and verify all integration points.

## Canonical Requirements Covered

REQ-240 through REQ-246

## Preconditions

- BATCH-014 complete

## Files / Artifacts Expected

- No new implementation files (test-only batch)
- Test results recorded in the AI report for this batch

## Implementation Steps

1. Execute the full gameplay loop: Start Game → receive order → accept → navigate to pickup → pick up package → navigate to destination → deliver → receive reward → open management → purchase upgrade → purchase Bicycle (if sufficient money) → return to loop → save → close → open → Continue → verify state restored
2. Execute failure path: accept order → pick up → trigger failure → verify failed state → verify new order generated
3. Execute all 7 persistence test cases
4. Verify all MVP events fire: GameStarted, OrderCreated, OrderAccepted, PackagePickedUp, DeliveryCompleted, DeliveryFailed, MoneyReceived, UpgradePurchased
5. Verify all HUD elements display correctly throughout loop
6. Verify notifications fire for all required events
7. Verify no critical bugs or crashes

## Non-Goals

- Fixing discovered issues during this batch (issues are logged; fixes go in a new batch)

## Validation Procedure

All test cases from Section 1–7 of `PROTOTYPE_TESTING_PLAN.md` pass.

## Acceptance Criteria

- Complete gameplay loop works without interruption
- No critical bugs remain
- All 7 persistence test cases pass
- Failure path works

## Regression Checks

- N/A (this is the regression check itself)

## Dependencies

BATCH-014

## Human Approval Required

No (agent runs tests; findings reported)

---

# BATCH-016 — Prototype Release Checklist Verification (HUMAN APPROVAL REQUIRED)

## Objective

Verify all items in `PROTOTYPE_RELEASE_CHECKLIST.md`, document results, and obtain Project Owner approval.

## Canonical Requirements Covered

REQ-250 through REQ-253

## Preconditions

- BATCH-015 complete with no critical bugs

## Files / Artifacts Expected

- Updated `PROJECT_STATUS.md`: reflect prototype complete pending human approval
- No release checklist items are pre-marked as complete by AI agent

## Implementation Steps

1. Walk through every checklist item in `PROTOTYPE_RELEASE_CHECKLIST.md` Sections 1–7
2. Record evidence for each item
3. Present results to Project Owner for review
4. **Project Owner makes final decision**
5. If approved: update PROJECT_STATUS.md to reflect Prototype v0.1 complete
6. If not approved: record failing items and return to fix batch

## Non-Goals

- AI agent declaring prototype complete
- Skipping any checklist section

## Validation Procedure

Project Owner reviews all 7 checklist sections and approves.

## Acceptance Criteria

- All 7 checklist sections verified
- Project Owner approval recorded

## Regression Checks

- N/A

## Dependencies

BATCH-015

## Human Approval Required

**YES — MANDATORY. Project Owner must approve before Prototype v0.1 is declared complete.**

---

End of Document
