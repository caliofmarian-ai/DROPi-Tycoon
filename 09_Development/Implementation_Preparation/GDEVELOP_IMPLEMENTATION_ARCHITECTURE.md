# Document Information

Document: GDEVELOP_IMPLEMENTATION_ARCHITECTURE.md
Project: DROPi Tycoon
Version: 1.0.0
Status: Implementation Preparation — Non-Authoritative
Author: AI Agent (Prototype v0.1 Implementation Preparation Task)
Language: English
Last Updated: 2026-07-14

---

# GDevelop Implementation Architecture

## Purpose

This document defines the minimum GDevelop architecture necessary for DROPi Tycoon Prototype v0.1.

All architecture decisions are derived from canonical documentation. No architecture is invented without canonical basis.

**This document does not create implementation files. It defines what implementation should create.**

**If any conflict exists between this document and a canonical document, the canonical document governs.**

---

## Canonical Derivation Sources

- `09_Development/GDEVELOP_PROJECT_STRUCTURE.md` — canonical GDevelop structure authority
- `09_Development/PROTOTYPE_TECH_STACK.md` — technology decisions
- `09_Development/GAME_DATA_STRUCTURE.md` — canonical data structure definitions
- `09_Development/GAMEPLAY_EVENTS_FLOW.md` — canonical event architecture
- `06_Technical/SAVE_SYSTEM.md` — persistence architecture
- `06_Technical/SAFE_SYSTEM.md` — development safety boundaries
- `09_Development/PROTOTYPE_V0.1.md` — scope constraints
- `09_Development/MOBILE_UI_CONTROLS.md` — UI layer requirements
- `08_Assets/ASSETS.md` — asset folder structure

---

# 1. Project File Location

```
Game/DROPi_Tycoon.json
```

The GDevelop project file is stored at the repository root under the canonical `Game/` directory.

GDevelop project format: `.json` (GDevelop 5 project format).

The canonical name follows the canonical project name `DROPi_Tycoon` (from `GDEVELOP_PROJECT_STRUCTURE.md`).

---

# 2. Scene List and Responsibility

Three scenes are required. No additional scenes are supported by canonical documentation for Prototype v0.1.

| Scene | Purpose | Canonical Source |
|---|---|---|
| `MainMenu` | Starting screen: Start Game, Continue, Settings, Information | `GDEVELOP_PROJECT_STRUCTURE.md` Scenes/MainMenu |
| `GameWorld` | Main gameplay: map, player, buildings, delivery locations, orders | `GDEVELOP_PROJECT_STRUCTURE.md` Scenes/GameWorld |
| `CompanyManagement` | Management interface: company info, upgrades, economy overview | `GDEVELOP_PROJECT_STRUCTURE.md` Scenes/CompanyManagement |

---

# 3. Scene Transition Flow

```
MainMenu
    ├── [Start Game — no valid save] ──────────→ GameWorld (new game initialized)
    ├── [Continue — valid save exists] ────────→ GameWorld (saved state loaded)
    └── [Settings] ────────────────────────────→ (modal or inline in MainMenu)

GameWorld
    └── [Upgrade button / management access] ──→ CompanyManagement

CompanyManagement
    └── [Back / Return] ────────────────────────→ GameWorld
```

**Note on new game guard:** Starting a new game when a valid save exists requires explicit confirmation from the player. This is canonically required by `SAVE_SYSTEM.md` (Load Behavior).

---

# 4. External Event Sheets

Three external event sheets are required. They are included by the GameWorld scene events.

| External Event Sheet | Responsibility | Canonical Source |
|---|---|---|
| `OrderSystem` | Order creation, state transitions (Created→Available→Accepted→PickedUp→Completed/Failed), OrderCreated/OrderAccepted/PackagePickedUp/DeliveryCompleted/DeliveryFailed events | `GDEVELOP_PROJECT_STRUCTURE.md` ExternalEvents/OrderSystem; `GAMEPLAY_EVENTS_FLOW.md` |
| `EconomySystem` | Money changes (MoneyReceived after DeliveryCompleted), upgrade cost deduction, balance validation | `GDEVELOP_PROJECT_STRUCTURE.md` ExternalEvents/EconomySystem; `GAMEPLAY_EVENTS_FLOW.md` Economy Event Flow |
| `ProgressionSystem` | Company level tracking, reputation changes, upgrade effects application | `GDEVELOP_PROJECT_STRUCTURE.md` ExternalEvents/ProgressionSystem |

---

# 5. Scene Event Sheet Responsibility

| Scene | Internal Event Groups | Includes External Sheets |
|---|---|---|
| `MainMenu` | GameStarted event, Start/Continue/Settings button handling, new game guard logic, save load call | None |
| `GameWorld` | PlayerEvents (Tap-to-Move, interaction detection), UIEvents (HUD update, notification display), SaveTrigger events (autosave after delivery/upgrade/progression) | OrderSystem, EconomySystem, ProgressionSystem |
| `CompanyManagement` | Upgrade display logic, UpgradePurchased event, Bicycle purchase, return to GameWorld | EconomySystem, ProgressionSystem |

**Event inclusion relationship:**
```
GameWorld.events
    ├── includes: OrderSystem (external)
    ├── includes: EconomySystem (external)
    └── includes: ProgressionSystem (external)

CompanyManagement.events
    ├── includes: EconomySystem (external)
    └── includes: ProgressionSystem (external)
```

---

# 6. GDevelop Object List

All objects are defined by `GDEVELOP_PROJECT_STRUCTURE.md`.

| Object Name | Type | Scene(s) | Responsibility |
|---|---|---|---|
| `Player` | Sprite | GameWorld | Player character movement, interaction, position tracking; variables: CarryingPackage, MovementSpeed |
| `Package` | Sprite | GameWorld | Package state, pickup status, delivery status; variables: OrderID, CarriedByPlayer |
| `Building` | Sprite | GameWorld | Location identity, interaction point; variables: BuildingName, BuildingType, IsInteractive |
| `Customer` | Sprite | GameWorld | Order request representation; spawned at commercial buildings |
| `DeliveryPoint` | Sprite | GameWorld | Pickup and destination markers; variables: PointID, PointType, AssignedOrderID |

**Note on Vehicle object:** The Bicycle is the only vehicle in Prototype v0.1. Its visual representation may be implemented as a state change on the Player object (e.g., player sprite changes when Bicycle is owned) or as a separate overlay object. This is an `IMPLEMENTATION DETAIL — AGENT MAY CHOOSE`. No advanced vehicle object system is required.

---

# 7. Global Variable Schema

Derived from `GAME_DATA_STRUCTURE.md` and `SAVE_SYSTEM.md`.

## CompanyData (Structure — Global)

| Field | Type | Default | Persisted | Notes |
|---|---|---|---|---|
| `CompanyData.CompanyName` | String | "" | YES | Player-chosen at game start |
| `CompanyData.Money` | Number | [AGENT CHOOSES — see IDR-001] | YES | Must be ≥ 0 on load |
| `CompanyData.Level` | Number | 1 | YES | Must be > 0 on load |
| `CompanyData.Experience` | Number | 0 | YES | |
| `CompanyData.Reputation` | Number | 0 | YES | |
| `CompanyData.UpgradeList` | Structure | (defined below) | YES | Purchased upgrade levels |

## CompanyData.UpgradeList (Sub-structure)

| Field | Type | Default | Notes |
|---|---|---|---|
| `DeliverySpeed` | Number | 0 | Level of speed upgrade purchased |
| `Capacity` | Number | 0 | Level of capacity upgrade purchased |
| `Efficiency` | Number | 0 | Level of efficiency upgrade purchased |
| `BicycleOwned` | Boolean | false | Whether Bicycle has been purchased |

## GameSettings (Structure — Global)

| Field | Type | Default | Persisted | Notes |
|---|---|---|---|---|
| `GameSettings.TutorialStatus` | Boolean | false | YES | Whether tutorial has been completed |
| `GameSettings.Sound` | Boolean | true | TBD (see ODR-004) | |
| `GameSettings.Music` | Boolean | true | TBD (see ODR-004) | |
| `GameSettings.Language` | String | "en" | TBD (see ODR-004) | |
| `GameSettings.Difficulty` | String | "normal" | TBD (see ODR-004) | |

## SaveFormatVersion (Number — Global)

| Field | Type | Default | Persisted | Notes |
|---|---|---|---|---|
| `SaveFormatVersion` | Number | 1 | YES | Required by `SAVE_SYSTEM.md` — Version Compatibility |

---

# 8. Scene Variable Schema

## GameWorld Scene Variables

| Variable | Type | Scope | Persisted | Notes |
|---|---|---|---|---|
| `ActiveOrder` | Structure | GameWorld | NO (cancelled on load) | Current active order; see structure below |
| `PlayerPosition` | Structure | GameWorld | CONDITIONAL (see ODR-003) | Current player X, Y position |

## ActiveOrder Structure (GameWorld Scene Variable)

Derived from `GAME_DATA_STRUCTURE.md` OrderData.

| Field | Type | Notes |
|---|---|---|
| `OrderID` | String | Unique per order |
| `PickupLocation` | Structure {X, Y, BuildingID} | Map position of pickup |
| `Destination` | Structure {X, Y, BuildingID} | Map position of destination |
| `Reward` | Number | Money reward value |
| `Status` | String | One of: Created, Available, Accepted, PickedUp, Completed, Failed |

---

# 9. Object Variable Schema

| Object | Variable | Type | Notes |
|---|---|---|---|
| `Player` | `CarryingPackage` | Boolean | True when package picked up |
| `Player` | `MovementSpeed` | Number | Base speed modified by Bicycle upgrade |
| `Building` | `BuildingName` | String | Display name |
| `Building` | `BuildingType` | String | residential / commercial / company / pickup |
| `Building` | `IsInteractive` | Boolean | Whether player can interact |
| `DeliveryPoint` | `PointID` | String | Unique identifier |
| `DeliveryPoint` | `PointType` | String | Pickup or Destination |
| `DeliveryPoint` | `AssignedOrderID` | String | Links point to active order |
| `Package` | `OrderID` | String | Links package to order |
| `Package` | `CarriedByPlayer` | Boolean | True when player carries package |

---

# 10. Persistent Data Schema

Derived from `SAVE_SYSTEM.md`.

## Save Data Structure (one local slot)

```json
{
  "SaveFormatVersion": 1,
  "CompanyData": {
    "CompanyName": "",
    "Money": 0,
    "Level": 1,
    "Experience": 0,
    "Reputation": 0,
    "UpgradeList": {
      "DeliverySpeed": 0,
      "Capacity": 0,
      "Efficiency": 0,
      "BicycleOwned": false
    }
  },
  "GameSettings": {
    "TutorialStatus": false
  }
}
```

**Not included in save (per SAVE_SYSTEM.md):**
- ActiveOrder (cancelled and reset on load)
- WorldData (regenerated on load)
- PlayerPosition (conditional — see ODR-003)

---

# 11. Save / Load Architecture

Derived from `SAVE_SYSTEM.md`.

## Save Ownership

The `GameWorld` scene events own autosave triggers:
- After `DeliveryCompleted` event
- After `UpgradePurchased` event (in CompanyManagement — triggers save from EconomySystem/ProgressionSystem includes)
- After progression state change (level up, reputation change)
- After tutorial step completion (if tutorial implemented)

The `MainMenu` scene events own:
- `Continue` — load save on entry
- `Start New Game` — new game guard confirmation → initialize defaults

## GDevelop Storage API Boundary

- GDevelop built-in `Storage` actions (JSON read/write to local storage)
- No external backend, no cloud API, no server
- Save key: `DROPi_Tycoon_Save` (IMPLEMENTATION DETAIL — see IDR-002)

## Data Validation on Load

Before using any loaded value:
1. Check SaveFormatVersion compatibility
2. Validate: Money ≥ 0 (default 0 if invalid)
3. Validate: Level > 0 (default 1 if invalid)
4. Validate: UpgradeList values are non-negative integers
5. Validate: TutorialStatus is boolean
6. If required field missing, apply safe default (do not crash)

---

# 12. SAFE System Boundary

The SAFE system (`06_Technical/SAFE_SYSTEM.md`) governs development safety. It is distinct from the Save System.

SAFE system constraints for implementation:

- Each batch implements one cohesive unit — no unrelated systems mixed
- Existing gameplay loop must remain functional after each batch
- No major system added until current milestone is functional (per `PROTOTYPE_MILESTONES.md`)
- Canonical documents not modified without going through proper change process
- No scope expansion: features not in Prototype v0.1 must not enter any batch

---

# 13. UI Layer Structure

Derived from `MOBILE_UI_CONTROLS.md` and `UI.md`.

## GameWorld Scene Layers

| Layer | Purpose | Always Visible |
|---|---|---|
| `Base` (layer 0) | Game world, map tiles, buildings, player, packages, NPCs | Yes (game running) |
| `HUD` (layer 1) | Money, level, active order panel, action buttons | Yes (game running) |
| `Notifications` (layer 2) | Popup feedback messages (delivery completed, etc.) | When active |
| `Modal` (layer 3) | Fullscreen/overlay panels (order details, upgrade confirmation dialog) | When active |

## MainMenu Scene Layers

| Layer | Purpose |
|---|---|
| `Base` | Background, title, decorative elements |
| `UI` | Buttons, menu items |
| `Modal` | New game confirmation dialog |

## CompanyManagement Scene Layers

| Layer | Purpose |
|---|---|
| `Base` | Background |
| `UI` | Upgrade list, money display, back button |

---

# 14. HUD Ownership

The `HUD` layer in the `GameWorld` scene owns all persistent player-visible HUD elements.

HUD elements and their required data sources:

| HUD Element | Data Source | Update Trigger |
|---|---|---|
| Money display | `CompanyData.Money` | After MoneyReceived, after UpgradePurchased |
| Level display | `CompanyData.Level` | After level-up event |
| Active order panel | `ActiveOrder` scene variable | After OrderAccepted, after DeliveryCompleted/Failed |
| Pickup location indicator | `ActiveOrder.PickupLocation` | After OrderAccepted |
| Destination indicator | `ActiveOrder.Destination` | After PackagePickedUp |
| Reward display | `ActiveOrder.Reward` | After OrderAccepted |
| Accept Order button | Visible when `ActiveOrder.Status = Available` | Order state change |
| Deliver button | Visible when player at destination + CarryingPackage = true | Player position + order state |
| Upgrade button | Visible when `ActiveOrder.Status = Completed` or between deliveries | Order state change |

---

# 15. Input / Control Ownership

Derived from `MOBILE_UI_CONTROLS.md`.

## Primary Input System

- **Touch / Tap-to-Move**: GDevelop touch input processed in `PlayerEvents` event group within `GameWorld` scene
- Player moves to tapped world position via pathfinding or direct movement behavior
- Action buttons (HUD) processed in `UIEvents` event group within `GameWorld` scene

## Camera

- Camera follows Player object with smooth movement
- Basic zoom supported
- Camera owned by `GameWorld` scene events

---

# 16. Reusable Function / Event Group Boundaries

Derived from `GAMEPLAY_EVENTS_FLOW.md` and `GDEVELOP_PROJECT_STRUCTURE.md`.

## Event Groups within GameWorld Scene

| Group | Purpose |
|---|---|
| `PlayerEvents` | Movement logic, interaction detection with buildings/delivery points |
| `OrderEvents` | Order creation trigger, order state UI updates |
| `DeliveryEvents` | Pickup detection, delivery detection, completion verification |
| `UIEvents` | HUD update logic, notification display, button visibility logic |
| `SaveTriggers` | Autosave calls after meaningful completed actions |
| `CameraEvents` | Camera follow, zoom |

## External Event Sheet Groups

| External Sheet | Event Groups |
|---|---|
| `OrderSystem` | `GenerateOrder`, `TransitionOrderState`, `ValidatePickup`, `ValidateDelivery` |
| `EconomySystem` | `AddDeliveryReward`, `DeductUpgradeCost`, `ValidateAffordability` |
| `ProgressionSystem` | `UpdateLevel`, `UpdateReputation`, `ApplyUpgradeEffect`, `ApplyBicycleEffect` |

---

# 17. Asset Directory Structure

Derived from `GDEVELOP_PROJECT_STRUCTURE.md` and `ASSETS.md`.

Physical folder structure inside the GDevelop project:

```
Game/DROPi_Tycoon/

    Assets/
        Sprites/
            player_character_idle
            player_character_walk
            building_company
            building_residential
            building_commercial
            delivery_point_pickup
            delivery_point_destination
            package_basic
            vehicle_bicycle_basic
            map_road_h
            map_road_v
            map_road_intersection
            map_grass
            map_sidewalk
        Audio/
            (placeholder — no audio required at start)
        UI/
            icon_money
            icon_level
            icon_order
            button_accept
            button_deliver
            button_upgrade
            button_back
```

All asset names follow the `type_description_variant` convention from `ASSETS.md` (Asset Naming Rules).

---

# 18. Placeholder Asset Strategy

Derived from `ASSET_IMPORT_GUIDE.md`.

During Prototype v0.1 development:

- All sprites may be **colored rectangles or simple shapes** with clear color coding
- Placeholder assets must be **named correctly** using the canonical naming convention
- Gameplay logic must never depend on a specific asset filename or path beyond the canonical folder structure
- All placeholder assets are replaceable without changing event logic

## Recommended Placeholder Color Coding

| Object | Placeholder Color | Purpose |
|---|---|---|
| Player | Blue square | Clearly distinct from world |
| Pickup DeliveryPoint | Green circle/marker | Pickup location |
| Destination DeliveryPoint | Red circle/marker | Delivery location |
| Package | Yellow square | Carried item |
| Company Building | Dark gray rectangle | Main base |
| Residential Building | Tan/beige rectangle | Customer home |
| Commercial Building | Orange rectangle | Order source |
| Roads | Light gray fill | Navigation surface |

Color coding is an `IMPLEMENTATION DETAIL — AGENT MAY CHOOSE` (IDR-003).

---

# Architecture Summary

| Dimension | Decision | Canonical Basis |
|---|---|---|
| Engine | GDevelop | `PROTOTYPE_TECH_STACK.md` |
| Project location | `Game/DROPi_Tycoon.json` | `GDEVELOP_PROJECT_STRUCTURE.md`, `DOCUMENT_INDEX.md` |
| Scenes | 3: MainMenu, GameWorld, CompanyManagement | `GDEVELOP_PROJECT_STRUCTURE.md` |
| External event sheets | 3: OrderSystem, EconomySystem, ProgressionSystem | `GDEVELOP_PROJECT_STRUCTURE.md` |
| Control scheme | Tap-to-Move | `MOBILE_UI_CONTROLS.md` |
| Save | 1 local slot, GDevelop Storage API | `SAVE_SYSTEM.md` |
| Save format version | Field required in save data | `SAVE_SYSTEM.md` |
| Global data | CompanyData, GameSettings, SaveFormatVersion | `GAME_DATA_STRUCTURE.md` |
| UI layers | Base, HUD, Notifications, Modal | `MOBILE_UI_CONTROLS.md`, `UI.md` |
| Asset folders | Assets/Sprites, Assets/Audio, Assets/UI | `GDEVELOP_PROJECT_STRUCTURE.md`, `ASSETS.md` |
| AI | Basic order generation only | `PROTOTYPE_V0.1.md` |
| Vehicles | Foot + Bicycle only | `PROTOTYPE_V0.1.md`, `VEHICLES.md` |
| No external backend | Local storage only | `SAVE_SYSTEM.md` |

---

End of Document
