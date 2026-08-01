# Document Information

Document: GDEVELOP_IMPLEMENTATION_ARCHITECTURE.md
Project: DROPi Tycoon
Version: 1.1.2
Status: Archived Reference / Implementation Preparation — Non-Authoritative
Author: AI Agent (PR #56 correction from Report 057; corrected per Report 073)
Language: English
Last Updated: 2026-08-01

---

# GDevelop Implementation Architecture (Corrected)

## Purpose

Define a canonically supported implementation architecture for Prototype v0.1 without creating game files.

This package remains non-authoritative and archived/reference-only. Canonical documents govern.

---

## Canonical Baseline

- `09_Development/GDEVELOP_PROJECT_STRUCTURE.md`
- `09_Development/GAME_DATA_STRUCTURE.md`
- `06_Technical/SAVE_SYSTEM.md`
- `09_Development/MOBILE_UI_CONTROLS.md`
- `09_Development/ASSET_IMPORT_GUIDE.md`
- `09_Development/PROTOTYPE_V0.1.md`

---

## Classification Rule

Each architecture element is classified as exactly one:

- CANONICAL REQUIREMENT
- AUTHORIZED IMPLEMENTATION DETAIL
- OWNER DECISION
- EXCLUSION

---

## 1) Scenes

| Element | Classification | Evidence |
|---|---|---|
| `MainMenu` | CANONICAL REQUIREMENT | `GDEVELOP_PROJECT_STRUCTURE.md` Scenes |
| `GameWorld` | CANONICAL REQUIREMENT | `GDEVELOP_PROJECT_STRUCTURE.md` Scenes |
| `CompanyManagement` | CANONICAL REQUIREMENT | `GDEVELOP_PROJECT_STRUCTURE.md` Scenes |

Count: **3 scenes**.

## 2) External Event Sheets

| Element | Classification | Evidence |
|---|---|---|
| `OrderSystem` | CANONICAL REQUIREMENT | `GDEVELOP_PROJECT_STRUCTURE.md` ExternalEvents |
| `EconomySystem` | CANONICAL REQUIREMENT | `GDEVELOP_PROJECT_STRUCTURE.md` ExternalEvents |
| `ProgressionSystem` | CANONICAL REQUIREMENT | `GDEVELOP_PROJECT_STRUCTURE.md` ExternalEvents |

Count: **3 external event sheets**.

## 3) Event Groups

| Element | Classification | Evidence |
|---|---|---|
| `PlayerEvents`, `OrderEvents`, `DeliveryEvents`, `EconomyEvents`, `UIEvents` | CANONICAL REQUIREMENT | `GDEVELOP_PROJECT_STRUCTURE.md` Event Organization |
| `SaveTriggers` | AUTHORIZED IMPLEMENTATION DETAIL | Required autosave behavior from `SAVE_SYSTEM.md` with implementation-defined grouping |
| `SceneFlow` | AUTHORIZED IMPLEMENTATION DETAIL | Scene transitions are required behavior; exact grouping is implementation-defined |

Count: **7 event groups**.

## 4) Object Types

| Element | Classification | Evidence |
|---|---|---|
| `Player`, `Package`, `Building`, `Customer`, `DeliveryPoint` | CANONICAL REQUIREMENT | `GDEVELOP_PROJECT_STRUCTURE.md` Objects |
| `Vehicle` | CANONICAL REQUIREMENT | `GDEVELOP_PROJECT_STRUCTURE.md` Main Project Structure / Objects |

Count: **6 object types**.

Vehicle treatment result: **Vehicle restored as canonical object; Prototype v0.1 still limits gameplay transport to walking + Bicycle only.**

## 5) Global Variables

| Element | Classification | Evidence |
|---|---|---|
| `CompanyData` | CANONICAL REQUIREMENT | `GAME_DATA_STRUCTURE.md` |
| `GameSettings` | CANONICAL REQUIREMENT | `GAME_DATA_STRUCTURE.md` |
| `SaveFormatVersion` | CANONICAL REQUIREMENT | `SAVE_SYSTEM.md` Version Compatibility |

Count: **3 global variable entries**.

## 6) Scene Variables

| Element | Classification | Evidence |
|---|---|---|
| `PlayerData`, `ActiveOrder`, `WorldData` in `GameWorld` | AUTHORIZED IMPLEMENTATION DETAIL | Data structures are canonical; scene-level ownership is not fixed canonically |

Count: **3 scene variables (implementation-owned placement)**.

## 7) Object Variables

| Element | Classification | Evidence |
|---|---|---|
| `Player.CarryingPackage` | CANONICAL REQUIREMENT | `GAME_DATA_STRUCTURE.md` PlayerData |
| `Player.MovementSpeed` | CANONICAL REQUIREMENT | `GAME_DATA_STRUCTURE.md` PlayerData |

Count: **2 object variables**.

Removed unsupported fields:
- `BuildingName`, `BuildingType`, `IsInteractive`
- `DeliveryPoint.PointID`, `PointType`, `AssignedOrderID`
- `Package.OrderID`, `CarriedByPlayer`

## 8) Persistence Structure

| Element | Classification | Evidence |
|---|---|---|
| Persisted: `CompanyData` required fields | CANONICAL REQUIREMENT | `SAVE_SYSTEM.md` Required Saved Data |
| Persisted: `TutorialStatus` | CANONICAL REQUIREMENT | `SAVE_SYSTEM.md` Required Saved Data |
| Persisted: `SaveFormatVersion` | CANONICAL REQUIREMENT | `SAVE_SYSTEM.md` Version Compatibility |
| `ActiveOrder` not restored; `WorldData` not persisted | CANONICAL REQUIREMENT | `SAVE_SYSTEM.md` |
| `Player position persistence` | OWNER DECISION | `SAVE_SYSTEM.md` conditional wording |

CompanyData.Experience result: **Removed from required persisted schema (unsupported as a required persisted field in `SAVE_SYSTEM.md`).**

## 9) UI Layers

| Element | Classification | Evidence |
|---|---|---|
| `HUD` over gameplay content | CANONICAL REQUIREMENT | `MOBILE_UI_CONTROLS.md`, `UI.md` critical information |
| `Base`, `Notifications`, `Modal` layer partition in GameWorld | AUTHORIZED IMPLEMENTATION DETAIL | Exact layer partition names/count are implementation-owned |

GameWorld layer count for planning: **4 layers** (`Base`, `HUD`, `Notifications`, `Modal`) as authorized implementation detail.

## 10) Input Model

| Element | Classification | Evidence |
|---|---|---|
| Tap-to-Move | CANONICAL REQUIREMENT | `MOBILE_UI_CONTROLS.md` Recommended MVP Choice |
| Camera follows player | CANONICAL REQUIREMENT | `MOBILE_UI_CONTROLS.md` Camera System / MVP Camera |
| Direct movement method (force/behavior/pathfinding choice) | AUTHORIZED IMPLEMENTATION DETAIL | Canonical docs require Tap-to-Move outcome but do not mandate one engine-specific movement method |
| Arrival threshold value for "reached tapped target" | AUTHORIZED IMPLEMENTATION DETAIL | Canonical docs define movement outcome, not an exact numeric stop threshold |
| Target marker implementation (object/temporary visual/no marker) | AUTHORIZED IMPLEMENTATION DETAIL | Canonical docs require tap destination movement, not a fixed marker artifact |
| Camera-follow implementation mechanics (follow action, smoothing tuning, basic zoom value) | AUTHORIZED IMPLEMENTATION DETAIL | `MOBILE_UI_CONTROLS.md` requires follow + smooth movement + basic zoom without fixing implementation method or numeric values |
| Walking movement-speed baseline value before Bicycle purchase | AUTHORIZED IMPLEMENTATION DETAIL | `PROTOTYPE_V0.1.md` requires on-foot start and later Bicycle speed increase; exact baseline value is not fixed canonically |

## 11) Save Slot Count

| Element | Classification | Evidence |
|---|---|---|
| One local save slot | CANONICAL REQUIREMENT | `SAVE_SYSTEM.md` Save Slot Policy |

## 12) Placeholder Asset Rule

| Element | Classification | Evidence |
|---|---|---|
| Placeholder assets allowed and replaceable | CANONICAL REQUIREMENT | `ASSET_IMPORT_GUIDE.md` |

## 13) JavaScript Usage

| Element | Classification | Evidence |
|---|---|---|
| JavaScript is not required in implementation preparation | EXCLUSION | No canonical requirement mandates JavaScript in Prototype v0.1 docs |

---

## Corrected ODR References

- ODR-001: Player position persistence (previously misreferenced)
- ODR-003: GameSettings persistence scope (previously misreferenced)
- ODR-004: Reclassified on 2026-08-01 (record only; not an active Owner Decision)

ODR-002 is not an Owner Decision (reclassified to canonical requirement coverage in inventory).

ODR-004 reclassification record:
- Date: 2026-08-01
- Active decision status: Not active
- Canonical trigger authority: `09_Development/GAMEPLAY_EVENTS_FLOW.md` and `03_Logistics/ORDERS.md` already define wrong-destination interaction as the `PickedUp -> Failed` trigger
- Cancellation scope: Manual cancellation is excluded from Prototype v0.1
- Blocking impact: ODR-004 does not block BATCH-008

---

## Architecture Summary Counts

- Scenes: **3**
- External event sheets: **3**
- Event groups: **7**
- Object types: **6**
- Global variable entries: **3**
- Scene variables: **3**
- Object variables: **2**
- GameWorld UI layers (planning partition): **4**
- Save slots: **1 local**

---

End of Document
