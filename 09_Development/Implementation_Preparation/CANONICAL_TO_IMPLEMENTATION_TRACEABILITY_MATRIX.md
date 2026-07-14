# Document Information

Document: CANONICAL_TO_IMPLEMENTATION_TRACEABILITY_MATRIX.md
Project: DROPi Tycoon
Version: 1.0.0
Status: Implementation Preparation — Non-Authoritative
Author: AI Agent (Prototype v0.1 Implementation Preparation Task)
Language: English
Last Updated: 2026-07-14

---

# Canonical-to-Implementation Traceability Matrix

## Purpose

This document maps every canonical Prototype v0.1 requirement to its planned implementation artifact.

**This document is non-authoritative. If any conflict exists between this matrix and canonical documents, canonical documents govern.**

---

## How to Read This Matrix

Each row maps a canonical requirement (or requirement group) to:
- Planned artifact path or location
- Implementation batch
- Dependency on prior batch
- Validation evidence source

---

# Part 1 — GDevelop Project Configuration

| Canonical Req | Canonical Owner | Planned Artifact | Artifact Location | Batch | Validation Evidence |
|---|---|---|---|---|---|
| REQ-170 MainMenu scene | `GDEVELOP_PROJECT_STRUCTURE.md` | Scene: MainMenu | `Game/DROPi_Tycoon.json` → Scenes | BATCH-001 | V2 checklist |
| REQ-171 GameWorld scene | `GDEVELOP_PROJECT_STRUCTURE.md` | Scene: GameWorld | `Game/DROPi_Tycoon.json` → Scenes | BATCH-001 | V2 checklist |
| REQ-172 CompanyManagement scene | `GDEVELOP_PROJECT_STRUCTURE.md` | Scene: CompanyManagement | `Game/DROPi_Tycoon.json` → Scenes | BATCH-001 | V2 checklist |
| REQ-180 CompanyData global vars | `GAME_DATA_STRUCTURE.md` | Global variable: CompanyData (structure) | Project globals | BATCH-001 | V3 checklist |
| REQ-181 GameSettings global vars | `GAME_DATA_STRUCTURE.md` | Global variable: GameSettings (structure) | Project globals | BATCH-001 | V3 checklist |
| REQ-182 SaveFormatVersion | `SAVE_SYSTEM.md` | Global variable: SaveFormatVersion (number) | Project globals | BATCH-001 | V3 checklist |
| REQ-227 Asset folder structure | `GDEVELOP_PROJECT_STRUCTURE.md` | Folders: Assets/Sprites, Assets/Audio, Assets/UI | GDevelop asset manager | BATCH-001 | V4 checklist |

---

# Part 2 — Scenes

| Canonical Req | Canonical Owner | Scene | Scene Responsibility | Batch |
|---|---|---|---|---|
| REQ-092 Main menu | `FIRST_PLAYABLE_EXPERIENCE.md` | MainMenu | Start Game, Continue, Settings, company name input | BATCH-010b |
| REQ-127 Continue (load) | `SAVE_SYSTEM.md` | MainMenu | Load save on Continue button | BATCH-013 |
| REQ-128/129 New game guard | `SAVE_SYSTEM.md` | MainMenu | Confirmation before overwrite | BATCH-010b |
| REQ-171 GameWorld scene | `GDEVELOP_PROJECT_STRUCTURE.md` | GameWorld | Map, player, orders, delivery, HUD | BATCH-004+ |
| REQ-173 MainMenu→GameWorld | Implied structure | MainMenu | Transition on Start/Continue | BATCH-010b |
| REQ-093 CompanyManagement | `GDEVELOP_PROJECT_STRUCTURE.md` | CompanyManagement | Upgrades, Bicycle, company info | BATCH-011 |
| REQ-174/175 Scene transitions | `PROTOTYPE_V0.1.md` | GameWorld↔CompanyManagement | Upgrade button / Back button | BATCH-011 |

---

# Part 3 — External Event Sheets

| Canonical Req | Canonical Owner | External Sheet | Responsible Event Groups | Batch |
|---|---|---|---|---|
| REQ-035 Order generation | `PROTOTYPE_V0.1.md` | OrderSystem | GenerateOrder | BATCH-005 |
| REQ-055-059 Order lifecycle | `ORDERS.md` | OrderSystem | TransitionOrderState | BATCH-005 |
| REQ-046-048 Pickup validation | `GAMEPLAY_EVENTS_FLOW.md` | OrderSystem | ValidatePickup | BATCH-007 |
| REQ-051-053 Delivery validation | `GAMEPLAY_EVENTS_FLOW.md` | OrderSystem | ValidateDelivery | BATCH-008 |
| REQ-060 Money reward | `GAMEPLAY_EVENTS_FLOW.md` | EconomySystem | AddDeliveryReward | BATCH-009 |
| REQ-161 Upgrade cost deduction | `CORE_GAMEPLAY_SYSTEMS.md` | EconomySystem | DeductUpgradeCost | BATCH-011 |
| REQ-161 Affordability check | `ECONOMY.md` | EconomySystem | ValidateAffordability | BATCH-011 |
| REQ-070 Level tracking | `GAME_DATA_STRUCTURE.md` | ProgressionSystem | UpdateLevel | BATCH-011 |
| REQ-071 Reputation tracking | `GAME_DATA_STRUCTURE.md` | ProgressionSystem | UpdateReputation | BATCH-009 |
| REQ-072 Upgrade effects | `GAME_DATA_STRUCTURE.md` | ProgressionSystem | ApplyUpgradeEffect | BATCH-011 |
| REQ-079 Bicycle speed effect | `PROTOTYPE_V0.1.md` | ProgressionSystem | ApplyBicycleEffect | BATCH-012 |

---

# Part 4 — Scene Event Groups (GameWorld)

| Canonical Req | Canonical Owner | Event Group | Owner Scene | Batch |
|---|---|---|---|---|
| REQ-020/026 Tap-to-Move | `MOBILE_UI_CONTROLS.md` | PlayerEvents | GameWorld | BATCH-006 |
| REQ-028 Camera follow | `MOBILE_UI_CONTROLS.md` | CameraEvents | GameWorld | BATCH-006 |
| REQ-040-043 Order acceptance | `MOBILE_UI_CONTROLS.md` | UIEvents + DeliveryEvents | GameWorld | BATCH-007 |
| REQ-046-049 Pickup detection | `GAMEPLAY_EVENTS_FLOW.md` | DeliveryEvents | GameWorld | BATCH-007 |
| REQ-050-054 Delivery detection | `GAMEPLAY_EVENTS_FLOW.md` | DeliveryEvents | GameWorld | BATCH-008 |
| REQ-094-108 HUD display | `MOBILE_UI_CONTROLS.md` | UIEvents | GameWorld | BATCH-010 |
| REQ-110-114 Notifications | `MOBILE_UI_CONTROLS.md` | UIEvents | GameWorld | BATCH-010 |
| REQ-125 Autosave triggers | `SAVE_SYSTEM.md` | SaveTriggers | GameWorld | BATCH-013 |

---

# Part 5 — GDevelop Objects

| Canonical Req | Canonical Owner | Object | Scene(s) | Batch |
|---|---|---|---|---|
| Player movement, interaction | `GDEVELOP_PROJECT_STRUCTURE.md` | Player | GameWorld | BATCH-004 |
| Package state, pickup | `GDEVELOP_PROJECT_STRUCTURE.md` | Package | GameWorld | BATCH-007 |
| Building location, interaction | `GDEVELOP_PROJECT_STRUCTURE.md` | Building | GameWorld | BATCH-004 |
| Customer / order source | `GDEVELOP_PROJECT_STRUCTURE.md` | Customer | GameWorld | BATCH-005 |
| Pickup/destination locations | `GDEVELOP_PROJECT_STRUCTURE.md` | DeliveryPoint | GameWorld | BATCH-004 |

---

# Part 6 — Global Variables

| Canonical Req | Canonical Owner | Variable | Type | Persisted | Batch |
|---|---|---|---|---|---|
| REQ-180 | `GAME_DATA_STRUCTURE.md` | CompanyData.CompanyName | String | YES | BATCH-001 |
| REQ-061 | `GAME_DATA_STRUCTURE.md` | CompanyData.Money | Number | YES | BATCH-001 |
| REQ-070 | `GAME_DATA_STRUCTURE.md` | CompanyData.Level | Number | YES | BATCH-001 |
| REQ-071 | `GAME_DATA_STRUCTURE.md` | CompanyData.Reputation | Number | YES | BATCH-001 |
| REQ-073 | `SAVE_SYSTEM.md` | CompanyData.UpgradeList | Structure | YES | BATCH-001 |
| REQ-078 | `PROTOTYPE_V0.1.md` | CompanyData.UpgradeList.BicycleOwned | Boolean | YES | BATCH-001 |
| REQ-074 | `SAVE_SYSTEM.md` | GameSettings.TutorialStatus | Boolean | YES | BATCH-001 |
| REQ-130/214 | `SAVE_SYSTEM.md` | SaveFormatVersion | Number | YES | BATCH-001 |

---

# Part 7 — Scene Variables

| Canonical Req | Canonical Owner | Variable | Type | Scene | Persisted | Batch |
|---|---|---|---|---|---|---|
| REQ-185 | `GAME_DATA_STRUCTURE.md` | PlayerData (structure) | Structure | GameWorld | NO (partial — see ODR-001) | BATCH-004 |
| REQ-186 ActiveOrder | `GAME_DATA_STRUCTURE.md` | ActiveOrder (structure) | Structure | GameWorld | NO (cancelled on load) | BATCH-005 |
| REQ-058 Status value | `ORDERS.md` | ActiveOrder.Status | String | GameWorld | NO | BATCH-005 |
| REQ-036 | `PROTOTYPE_V0.1.md` | ActiveOrder.OrderID | String | GameWorld | NO | BATCH-005 |
| REQ-036 | `PROTOTYPE_V0.1.md` | ActiveOrder.PickupLocation | Structure | GameWorld | NO | BATCH-005 |
| REQ-036 | `PROTOTYPE_V0.1.md` | ActiveOrder.Destination | Structure | GameWorld | NO | BATCH-005 |
| REQ-036 | `PROTOTYPE_V0.1.md` | ActiveOrder.Reward | Number | GameWorld | NO | BATCH-005 |
| REQ-187 | `GAME_DATA_STRUCTURE.md` | WorldData (structure) | Structure | GameWorld | NO | BATCH-004 |

---

# Part 8 — Object Variables

| Canonical Req | Canonical Owner | Variable | Object | Batch |
|---|---|---|---|---|
| REQ-190 | `GAME_DATA_STRUCTURE.md` | Player.CarryingPackage | Player | BATCH-004 |
| REQ-191 | `GAME_DATA_STRUCTURE.md` | Player.MovementSpeed | Player | BATCH-004 |
| REQ-192 | `BUILDINGS.md` / `GAME_DATA_STRUCTURE.md` | Building.BuildingName, BuildingType, IsInteractive | Building | BATCH-004 |
| REQ-193 | `GAME_DATA_STRUCTURE.md` | DeliveryPoint.PointID, PointType, AssignedOrderID | DeliveryPoint | BATCH-004 |
| REQ-194 | `GAME_DATA_STRUCTURE.md` | Package.OrderID, CarriedByPlayer | Package | BATCH-007 |

---

# Part 9 — Persistent Data Schema

| Canonical Req | Canonical Owner | Save Field | Type | Batch |
|---|---|---|---|---|
| REQ-120/130 | `SAVE_SYSTEM.md` | SaveFormatVersion | Number | BATCH-013 |
| REQ-122 | `SAVE_SYSTEM.md` | CompanyData.CompanyName | String | BATCH-013 |
| REQ-122 | `SAVE_SYSTEM.md` | CompanyData.Money | Number | BATCH-013 |
| REQ-122 | `SAVE_SYSTEM.md` | CompanyData.Level | Number | BATCH-013 |
| REQ-122 | `SAVE_SYSTEM.md` | CompanyData.Reputation | Number | BATCH-013 |
| REQ-122 | `SAVE_SYSTEM.md` | CompanyData.UpgradeList | Structure | BATCH-013 |
| REQ-211 | `SAVE_SYSTEM.md` | GameSettings.TutorialStatus | Boolean | BATCH-013 |
| REQ-123 | `SAVE_SYSTEM.md` | ActiveOrder | NOT SAVED | N/A |
| REQ-124 | `SAVE_SYSTEM.md` | WorldData | NOT SAVED | N/A |

---

# Part 10 — UI Layers

| Canonical Req | Canonical Owner | Layer | Scene | Contents | Batch |
|---|---|---|---|---|---|
| REQ-101/102 HUD layer | `MOBILE_UI_CONTROLS.md` | HUD | GameWorld | Money, Level, Order panel, buttons | BATCH-010 |
| Map/world rendering | `PROTOTYPE_V0.1.md` | Base | GameWorld | Map, Player, Buildings, NPCs | BATCH-004 |
| REQ-110-114 | `MOBILE_UI_CONTROLS.md` | Notifications | GameWorld | Popup feedback messages | BATCH-010 |
| New game guard | `SAVE_SYSTEM.md` | Modal | MainMenu | Confirmation dialogs | BATCH-010b |
| Upgrade display | `PROTOTYPE_V0.1.md` | UI | CompanyManagement | Upgrade cards, money, back button | BATCH-011 |

---

# Part 11 — HUD Elements

| Canonical Req | Canonical Owner | HUD Element | Condition | Batch |
|---|---|---|---|---|
| REQ-103 | `UI.md` | MoneyText | Always visible | BATCH-010 |
| REQ-104 | `MOBILE_UI_CONTROLS.md` | OrderPanel | Active order exists | BATCH-010 |
| REQ-105 | `PROTOTYPE_V0.1.md` | DeliveryStatusText | Order accepted/picked up | BATCH-010 |
| REQ-106 | `MOBILE_UI_CONTROLS.md` | AcceptOrderButton | Status = Available | BATCH-007 |
| REQ-107 | `MOBILE_UI_CONTROLS.md` | DeliverButton | Status = PickedUp, at destination | BATCH-008 |
| REQ-108 | `MOBILE_UI_CONTROLS.md` | UpgradeButton | Between deliveries | BATCH-010 |
| REQ-095 | `MOBILE_UI_CONTROLS.md` | LevelText | Always visible | BATCH-010 |

---

# Part 12 — Input Actions

| Canonical Req | Canonical Owner | Input Action | Implementation | Batch |
|---|---|---|---|---|
| REQ-026 Tap-to-Move | `MOBILE_UI_CONTROLS.md` | Touch tap on map | GDevelop touch input in PlayerEvents | BATCH-006 |
| REQ-027 Accept Order btn | `MOBILE_UI_CONTROLS.md` | Tap AcceptOrderButton | UIEvents button handler | BATCH-007 |
| REQ-027 Deliver btn | `MOBILE_UI_CONTROLS.md` | Tap DeliverButton | UIEvents button handler | BATCH-008 |
| REQ-027 Upgrade btn | `MOBILE_UI_CONTROLS.md` | Tap UpgradeButton | UIEvents → scene change | BATCH-011 |
| REQ-028 Camera | `MOBILE_UI_CONTROLS.md` | Camera follow | CameraEvents | BATCH-006 |

---

# Part 13 — Reusable Functions / Event Groups

| Canonical Req | Canonical Owner | Function/Group | Purpose | Batch |
|---|---|---|---|---|
| REQ-035 | `PROTOTYPE_V0.1.md` | GenerateOrder | Create new order | BATCH-005 |
| REQ-056 | `ORDERS.md` | TransitionOrderState | Enforce state machine | BATCH-005 |
| REQ-048 | `GAMEPLAY_EVENTS_FLOW.md` | ValidatePickup | Verify correct pickup location | BATCH-007 |
| REQ-053 | `CORE_GAMEPLAY_SYSTEMS.md` | ValidateDelivery | Verify correct destination | BATCH-008 |
| REQ-060 | `GAMEPLAY_EVENTS_FLOW.md` | AddDeliveryReward | Add money after delivery | BATCH-009 |
| REQ-079 | `PROTOTYPE_V0.1.md` | ApplyBicycleEffect | Increase MovementSpeed | BATCH-012 |
| REQ-125 | `SAVE_SYSTEM.md` | AutosaveAfterDelivery | Persist state | BATCH-013 |
| REQ-125 | `SAVE_SYSTEM.md` | AutosaveAfterUpgrade | Persist state | BATCH-013 |
| REQ-131 | `SAVE_SYSTEM.md` | ValidateSaveData | Validate fields on load | BATCH-013 |

---

# Part 14 — Placeholder Assets

| Canonical Req | Canonical Owner | Asset File | Folder | Batch |
|---|---|---|---|---|
| REQ-220 | `ASSET_IMPORT_GUIDE.md` | player_character_idle | Assets/Sprites | BATCH-003 |
| REQ-220 | `ASSET_IMPORT_GUIDE.md` | player_character_walk | Assets/Sprites | BATCH-003 |
| REQ-221 | `ASSET_IMPORT_GUIDE.md` | building_company | Assets/Sprites | BATCH-003 |
| REQ-221 | `ASSET_IMPORT_GUIDE.md` | building_residential | Assets/Sprites | BATCH-003 |
| REQ-221 | `ASSET_IMPORT_GUIDE.md` | building_commercial | Assets/Sprites | BATCH-003 |
| REQ-222 | `FIRST_MAP_DESIGN.md` | delivery_point_pickup | Assets/Sprites | BATCH-003 |
| REQ-222 | `FIRST_MAP_DESIGN.md` | delivery_point_destination | Assets/Sprites | BATCH-003 |
| REQ-223 | `GDEVELOP_PROJECT_STRUCTURE.md` | package_basic | Assets/Sprites | BATCH-003 |
| REQ-224 | `ASSET_IMPORT_GUIDE.md` | icon_money | Assets/UI | BATCH-003 |
| REQ-225 | `VEHICLES.md` | vehicle_bicycle_basic | Assets/Sprites | BATCH-003 |
| REQ-226 | `FIRST_MAP_DESIGN.md` | map_road_h, map_road_v, etc. | Assets/Sprites | BATCH-003 |

---

# Part 15 — Tests / Checklists

| Canonical Req | Canonical Owner | Test Artifact | Batch |
|---|---|---|---|
| REQ-240 Gameplay loop | `PROTOTYPE_TESTING_PLAN.md` | BATCH-015 integration test report | BATCH-015 |
| REQ-241 Order system | `PROTOTYPE_TESTING_PLAN.md` | Per-batch validation in BATCH-005 | BATCH-005 |
| REQ-242 Delivery system | `PROTOTYPE_TESTING_PLAN.md` | Per-batch validation in BATCH-008 | BATCH-008 |
| REQ-243 Economy | `PROTOTYPE_TESTING_PLAN.md` | Per-batch validation in BATCH-009 | BATCH-009 |
| REQ-244 7 persistence cases | `SAVE_SYSTEM.md` | BATCH-013 validation checklist | BATCH-013 |
| REQ-245 Mobile testing | `PROTOTYPE_TESTING_PLAN.md` | BATCH-014 validation | BATCH-014 |

---

# Part 16 — Release Gate Items

| Canonical Req | Canonical Owner | Checklist Section | Agent May Mark? | Batch |
|---|---|---|---|---|
| REQ-250-253 | `PROTOTYPE_RELEASE_CHECKLIST.md` | Section 1: Project Stability | NO — human only | BATCH-016 |
| REQ-250-253 | `PROTOTYPE_RELEASE_CHECKLIST.md` | Section 2: Core Gameplay | NO — human only | BATCH-016 |
| REQ-250-253 | `PROTOTYPE_RELEASE_CHECKLIST.md` | Section 3: User Interface | NO — human only | BATCH-016 |
| REQ-250-253 | `PROTOTYPE_RELEASE_CHECKLIST.md` | Section 4: Mobile Experience | NO — human only | BATCH-016 |
| REQ-250-253 | `PROTOTYPE_RELEASE_CHECKLIST.md` | Section 5: Balance | NO — human only | BATCH-016 |
| REQ-250-253 | `PROTOTYPE_RELEASE_CHECKLIST.md` | Section 6: Quality | NO — human only | BATCH-016 |
| REQ-250-253 | `PROTOTYPE_RELEASE_CHECKLIST.md` | Section 7: Save & Load | NO — human only | BATCH-016 |

---

# Traceability Coverage Summary

| Category | Requirements Mapped | Coverage |
|---|---|---|
| GDevelop project configuration | 7 | 100% |
| Scenes | 7 groups | 100% |
| External event sheets | 12 event groups | 100% |
| Scene event groups | 8 groups | 100% |
| Objects | 5 objects | 100% |
| Global variables | 8 fields | 100% |
| Scene variables | 8 fields | 100% |
| Object variables | 9 fields | 100% |
| Persistent data schema | 7 persisted + 2 explicit not-saved | 100% |
| UI layers | 5 layers across 3 scenes | 100% |
| HUD elements | 7 elements | 100% |
| Input actions | 5 actions | 100% |
| Reusable functions | 9 groups | 100% |
| Placeholder assets | 14 files | 100% |
| Test/validation artifacts | 6 test areas | 100% |
| Release gate items | 7 checklist sections | 100% |

**All canonical requirements in the requirements inventory are represented in this traceability matrix.**

---

End of Document
