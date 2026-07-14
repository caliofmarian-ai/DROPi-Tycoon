# Document Information
Document: PROTOTYPE_V0.1_REQUIREMENTS_INVENTORY.md
Project: DROPi Tycoon
Version: 1.1.0
Status: Implementation Preparation — Non-Authoritative
Author: AI Agent (PR #56 correction from Report 057)
Language: English
Last Updated: 2026-07-14
---
# Prototype v0.1 Requirements Inventory (Corrected)
## Purpose
This inventory records valid implementation requirements derived from canonical sources only.
This package is non-authoritative; canonical documents remain the source of truth.

## Corrected Integrity Summary
- Final valid requirement count: **188**
- Final ID format: **REQ-NNN (sequential)**
- Final ID range: **REQ-001 through REQ-188**
- Duplicate IDs: **0**
- Invalid IDs: **0**
- Unexplained gaps: **0**

## Report 057 Flagged-ID Disposition
| Legacy ID | Legacy Item | Disposition | Canonical Evidence | Rationale | Final Destination |
|---|---|---|---|---|---|
| REQ-039b | Created→Available transition system-driven | VALID CANONICAL REQUIREMENT | `03_Logistics/ORDERS.md` (Created→Available), `09_Development/GAMEPLAY_EVENTS_FLOW.md` | Canonical behavior valid; only legacy ID format was invalid. | Reindexed as REQ-035 |
| REQ-079b | No advanced vehicle mechanics in v0.1 | VALID CANONICAL REQUIREMENT | `09_Development/PROTOTYPE_V0.1.md` Transportation System / Bicycle | Canonical exclusion statement is valid; only legacy ID format was invalid. | Reindexed as REQ-075 |
| REQ-090 | DeliveryPoint AssignedOrderID schema | REMOVE AS UNSUPPORTED | No canonical object-variable requirement for AssignedOrderID | Specific field-level object schema was invented beyond canonical scope. | Removed from requirements and architecture |
| REQ-173 | MainMenu→GameWorld transition as canonical requirement | IMPLEMENTATION DETAIL | `09_Development/GDEVELOP_PROJECT_STRUCTURE.md` scene responsibilities | Transition is needed for implementation but not explicitly mandated as a canonical requirement row. | Moved to IDR-011 |
| REQ-175 | CompanyManagement→GameWorld return as canonical requirement | IMPLEMENTATION DETAIL | `09_Development/PROTOTYPE_V0.1.md` optional management branch | Return flow is implementation-owned detail under canonical loop intent. | Moved to IDR-012 |
| REQ-185 | PlayerData fixed as GameWorld scene variable | IMPLEMENTATION DETAIL | `09_Development/GAME_DATA_STRUCTURE.md` defines structure but not scene ownership | Ownership placement is implementation architecture choice. | Moved to IDR-013 |
| REQ-186 | ActiveOrder fixed as GameWorld scene variable | IMPLEMENTATION DETAIL | `09_Development/GAME_DATA_STRUCTURE.md` + `06_Technical/SAVE_SYSTEM.md` | Data model exists canonically; scene-variable placement is implementation architecture choice. | Moved to IDR-013 |
| REQ-187 | WorldData fixed as GameWorld scene variable | IMPLEMENTATION DETAIL | `09_Development/GAME_DATA_STRUCTURE.md` + `06_Technical/SAVE_SYSTEM.md` | WorldData semantics are canonical; exact scene-variable ownership is implementation detail. | Moved to IDR-013 |
| REQ-192 | Building variable schema fields | REMOVE AS UNSUPPORTED | `09_Development/GDEVELOP_PROJECT_STRUCTURE.md` does not define these fields | Field-level schema was not canonically specified. | Removed from requirements and architecture |
| REQ-193 | DeliveryPoint variable schema fields | REMOVE AS UNSUPPORTED | `09_Development/GDEVELOP_PROJECT_STRUCTURE.md` does not define these fields | Field-level schema was not canonically specified. | Removed from requirements and architecture |
| REQ-194 | Package variable schema fields | REMOVE AS UNSUPPORTED | `09_Development/GDEVELOP_PROJECT_STRUCTURE.md` does not define these fields | Field-level schema was not canonically specified. | Removed from requirements and architecture |

## Final Valid Requirements Table
| Requirement ID | Canonical Requirement | Canonical Source(s) | Canonical Section(s) | Priority | Legacy ID |
|---|---|---|---|---|---|
| REQ-001 | Player starts on foot (walking is the only transport method at game start) | `PROTOTYPE_V0.1.md` | Transportation System / Starting Transport | P0 | REQ-001 |
| REQ-002 | Player starts with a small amount of money (sufficient to begin but limited) | `FIRST_PLAYABLE_EXPERIENCE.md`; Starting Situation / Resources; `01_GameDesign/GAMEPLAY.md` | Early Game | P0 | REQ-002 |
| REQ-003 | Player starts with one operating zone (small neighborhood / first map area) | `FIRST_PLAYABLE_EXPERIENCE.md` | Starting Situation / Resources | P0 | REQ-003 |
| REQ-004 | Player starts with no Bicycle (Bicycle is not starting equipment) | `PROTOTYPE_V0.1.md`; Transportation System / Starting Transport; `01_GameDesign/GAMEPLAY.md` | Early Game | P0 | REQ-004 |
| REQ-005 | Player chooses company name at game start | `FIRST_PLAYABLE_EXPERIENCE.md` | Starting Situation / Company | P1 | REQ-005 |
| REQ-006 | Receive Order — order is Available and presented to player | `PROTOTYPE_V0.1.md` | Core Gameplay Loop / Happy Path | P0 | REQ-010 |
| REQ-007 | Accept Order — Available → Accepted state transition | `PROTOTYPE_V0.1.md` | Core Gameplay Loop / Happy Path | P0 | REQ-011 |
| REQ-008 | Navigate to Pickup Location | `PROTOTYPE_V0.1.md` | Core Gameplay Loop / Happy Path | P0 | REQ-012 |
| REQ-009 | Pick Up Package — Accepted → PickedUp state transition | `PROTOTYPE_V0.1.md` | Core Gameplay Loop / Happy Path | P0 | REQ-013 |
| REQ-010 | Navigate to Destination | `PROTOTYPE_V0.1.md` | Core Gameplay Loop / Happy Path | P0 | REQ-014 |
| REQ-011 | Deliver Package — PickedUp → Completed state transition | `PROTOTYPE_V0.1.md` | Core Gameplay Loop / Happy Path | P0 | REQ-015 |
| REQ-012 | Receive Payment (money added after Completed) | `PROTOTYPE_V0.1.md` | Core Gameplay Loop / Happy Path | P0 | REQ-016 |
| REQ-013 | Loop repeats — new order becomes available | `PROTOTYPE_V0.1.md` | Core Gameplay Loop / Happy Path | P0 | REQ-017 |
| REQ-014 | Failure branch: PickedUp → Failed (with reputation consequence display) | `PROTOTYPE_V0.1.md` | Core Gameplay Loop / Failure Branch | P1 | REQ-018 |
| REQ-015 | Optional management branch: after payment, player may open CompanyManagement, purchase upgrade, return to loop | `PROTOTYPE_V0.1.md` | Core Gameplay Loop / Optional Management Branch | P1 | REQ-019 |
| REQ-016 | Player movement is Tap-to-Move (recommended for Prototype v0.1) | `MOBILE_UI_CONTROLS.md` | Recommended MVP Choice | P0 | REQ-020 |
| REQ-017 | Player movement enables world navigation for delivery loop | `CORE_GAMEPLAY_SYSTEMS.md` | System 3 / MVP Movement | P0 | REQ-021 |
| REQ-018 | Walking is the only movement method at game start | `PROTOTYPE_V0.1.md` | Transportation System | P0 | REQ-022 |
| REQ-019 | After Bicycle purchase, player moves faster (increased MovementSpeed) | `PROTOTYPE_V0.1.md` | Transportation System / Bicycle | P1 | REQ-023 |
| REQ-020 | Primary control is touch-based (screen taps, buttons, menus) | `MOBILE_UI_CONTROLS.md` | Control Method | P0 | REQ-025 |
| REQ-021 | Tap-to-Move: player taps a location and character moves there | `MOBILE_UI_CONTROLS.md` | Recommended MVP Choice | P0 | REQ-026 |
| REQ-022 | Action buttons: Accept Order, Deliver, Upgrade | `MOBILE_UI_CONTROLS.md` | Action Buttons | P0 | REQ-027 |
| REQ-023 | Camera follows player with smooth movement and basic zoom | `MOBILE_UI_CONTROLS.md` | Camera System / MVP Camera | P1 | REQ-028 |
| REQ-024 | Touch targets must be large enough for comfortable tap interaction | `MOBILE_UI_CONTROLS.md` | Accessibility | P1 | REQ-029 |
| REQ-025 | First order: a simple local delivery request with pickup location, destination, reward shown | `FIRST_PLAYABLE_EXPERIENCE.md` | Step 1: Receive First Order | P0 | REQ-030 |
| REQ-026 | Tutorial teaches through actions — no long explanations | `FIRST_PLAYABLE_EXPERIENCE.md` | First Tutorial Sequence | P1 | REQ-031 |
| REQ-027 | Player should understand deliveries, money, upgrades, company growth within ~5 minutes | `FIRST_PLAYABLE_EXPERIENCE.md` | First 5 Minutes Goal | P1 | REQ-032 |
| REQ-028 | After initial on-foot deliveries and sufficient money, first upgrade opportunity appears (Bicycle purchase) | `FIRST_PLAYABLE_EXPERIENCE.md` | Step 5: First Upgrade | P1 | REQ-033 |
| REQ-029 | Core emotional moment: "I started with nothing and I improved my company" | `FIRST_PLAYABLE_EXPERIENCE.md` | Core Emotional Moment | P2 | REQ-034 |
| REQ-030 | Game generates simple delivery requests (basic order generation) | `PROTOTYPE_V0.1.md` | Delivery System / Order Creation; AI Scope | P0 | REQ-035 |
| REQ-031 | Each order contains: pickup location, destination, reward | `PROTOTYPE_V0.1.md` | Delivery System / Order Creation | P0 | REQ-036 |
| REQ-032 | Each order has unique OrderID | `CORE_GAMEPLAY_SYSTEMS.md` | System 1 / Order Data; `GAME_DATA_STRUCTURE.md` | P0 | REQ-037 |
| REQ-033 | Prototype supports one active order at a time | `CORE_GAMEPLAY_SYSTEMS.md` | System 1 / MVP Order Rules | P0 | REQ-038 |
| REQ-034 | Orders have fixed rewards in Prototype v0.1 (not dynamic pricing) | `CORE_GAMEPLAY_SYSTEMS.md` | System 1 / MVP Order Rules | P0 | REQ-039 |
| REQ-035 | Created → Available transition is system-driven (immediate after creation in v0.1) | `GAMEPLAY_EVENTS_FLOW.md` | Order Lifecycle Event-to-Transition Mapping | P0 | REQ-039b |
| REQ-036 | Player accepts order through explicit action (Accept Order button) | `MOBILE_UI_CONTROLS.md` | Action Buttons; `GAMEPLAY_EVENTS_FLOW.md` | P0 | REQ-040 |
| REQ-037 | OrderAccepted event: Available → Accepted state transition | `GAMEPLAY_EVENTS_FLOW.md` | Order Acceptance Flow; `ORDERS.md` | P0 | REQ-041 |
| REQ-038 | On acceptance: order status changes, package assigned, player objective updated | `GAMEPLAY_EVENTS_FLOW.md` | Order Acceptance Flow / Process | P0 | REQ-042 |
| REQ-039 | Active order displayed in HUD/UI after acceptance | `MOBILE_UI_CONTROLS.md` | Active Order Display | P0 | REQ-043 |
| REQ-040 | Player navigates to pickup location after order acceptance | `PROTOTYPE_V0.1.md` | Core Gameplay Loop / Happy Path | P0 | REQ-045 |
| REQ-041 | PackagePickedUp event fires when player reaches correct pickup location | `GAMEPLAY_EVENTS_FLOW.md` | Package Pickup Flow | P0 | REQ-046 |
| REQ-042 | Accepted → PickedUp state transition on pickup | `ORDERS.md` | Allowed Transitions | P0 | REQ-047 |
| REQ-043 | Game verifies correct location before allowing pickup | `GAMEPLAY_EVENTS_FLOW.md` | Package Pickup Flow / Process | P0 | REQ-048 |
| REQ-044 | Player carries package after pickup (CarryingPackage = true) | `GAME_DATA_STRUCTURE.md` | PlayerData | P0 | REQ-049 |
| REQ-045 | Player navigates to delivery destination after pickup | `PROTOTYPE_V0.1.md` | Core Gameplay Loop / Happy Path | P0 | REQ-050 |
| REQ-046 | DeliveryCompleted event fires when player reaches correct destination with package | `GAMEPLAY_EVENTS_FLOW.md` | Delivery Completion Flow | P0 | REQ-051 |
| REQ-047 | PickedUp → Completed state transition on delivery | `ORDERS.md` | Allowed Transitions | P0 | REQ-052 |
| REQ-048 | Delivery success conditions: correct package, correct destination, order conditions fulfilled | `CORE_GAMEPLAY_SYSTEMS.md` | System 2 / Delivery Success | P0 | REQ-053 |
| REQ-049 | Delivery button available when player at destination with active package | `MOBILE_UI_CONTROLS.md` | Action Buttons / Deliver | P0 | REQ-054 |
| REQ-050 | Six canonical states: Created, Available, Accepted, PickedUp, Completed, Failed | `ORDERS.md` | Canonical States table | P0 | REQ-055 |
| REQ-051 | Allowed transitions: Created→Available, Available→Accepted, Accepted→PickedUp, PickedUp→Completed, PickedUp→Failed | `ORDERS.md` | Allowed Transitions | P0 | REQ-056 |
| REQ-052 | Terminal states: Completed and Failed have no outbound transitions | `ORDERS.md` | Terminal States | P0 | REQ-057 |
| REQ-053 | Technical value strings stored exactly: `Created`, `Available`, `Accepted`, `PickedUp`, `Completed`, `Failed` | `GAME_DATA_STRUCTURE.md` | Order Status | P0 | REQ-058 |
| REQ-054 | No cancellation or assignment states in Prototype v0.1 | `ORDERS.md` | Note on Full-Game Lifecycle | P0 | REQ-059 |
| REQ-055 | MoneyReceived event: money added to CompanyData.Money after DeliveryCompleted | `GAMEPLAY_EVENTS_FLOW.md` | Economy Event Flow | P0 | REQ-060 |
| REQ-056 | CompanyData.Money is a persistent global variable | `GAME_DATA_STRUCTURE.md` | CompanyData; `SAVE_SYSTEM.md` | P0 | REQ-061 |
| REQ-057 | Money display updated after each reward | `MOBILE_UI_CONTROLS.md` | Company Status / Money; `CORE_GAMEPLAY_SYSTEMS.md` | P0 | REQ-062 |
| REQ-058 | Reward calculation considers distance/difficulty (basic) | `GAME_BALANCING_RULES.md` | Delivery Reward Rules / Example Reward Logic | P1 | REQ-063 |
| REQ-059 | Company reputation increases after successful delivery | `CORE_GAMEPLAY_SYSTEMS.md` | System 6 / Reputation Changes; `GAMEPLAY_EVENTS_FLOW.md` | P1 | REQ-064 |
| REQ-060 | DeliveryFailed event: PickedUp → Failed state transition | `PROTOTYPE_V0.1.md` | Core Gameplay Loop / Failure Branch; `ORDERS.md` | P1 | REQ-065 |
| REQ-061 | Failure displays existing failure and reputation consequences | `PROTOTYPE_V0.1.md` | Core Gameplay Loop / Failure Branch | P1 | REQ-066 |
| REQ-062 | After failure, game returns to Receive Order state (new order generation) | `PROTOTYPE_V0.1.md` | Core Gameplay Loop / Failure Branch | P1 | REQ-067 |
| REQ-063 | Company reputation decreases after failed delivery | `CORE_GAMEPLAY_SYSTEMS.md` | System 6 / Reputation Changes | P1 | REQ-068 |
| REQ-064 | Failure is a learning opportunity — small penalty, no permanent setback | `GAME_BALANCING_RULES.md` | Failure Balance | P1 | REQ-069 |
| REQ-065 | Company level tracking (CompanyData.Level) | `GAME_DATA_STRUCTURE.md` | CompanyData; `CORE_GAMEPLAY_SYSTEMS.md` | P1 | REQ-070 |
| REQ-066 | Company reputation tracking (CompanyData.Reputation) | `GAME_DATA_STRUCTURE.md` | CompanyData; `CORE_GAMEPLAY_SYSTEMS.md` | P1 | REQ-071 |
| REQ-067 | Upgrade system: DeliverySpeed, Capacity, Efficiency upgrade types | `GAME_DATA_STRUCTURE.md` | Upgrade Data / MVP Upgrades | P1 | REQ-072 |
| REQ-068 | Purchased upgrade levels persisted to save | `SAVE_SYSTEM.md` | Required Saved Data / Purchased upgrade levels | P0 | REQ-073 |
| REQ-069 | Tutorial completion status tracked and persisted | `SAVE_SYSTEM.md` | Required Saved Data / Progression State | P1 | REQ-074 |
| REQ-070 | Bicycle is the first purchasable vehicle | `PROTOTYPE_V0.1.md` | Transportation System / Bicycle | P1 | REQ-075 |
| REQ-071 | Bicycle is NOT starting equipment | `PROTOTYPE_V0.1.md` | Transportation System / Starting Transport | P0 | REQ-076 |
| REQ-072 | Bicycle is purchased through existing upgrade/shop interaction using earned money | `PROTOTYPE_V0.1.md` | Transportation System / Bicycle | P1 | REQ-077 |
| REQ-073 | Bicycle ownership persisted through Save & Load (upgrade purchase persistence system) | `PROTOTYPE_V0.1.md` | Transportation System / Bicycle; `SAVE_SYSTEM.md` | P1 | REQ-078 |
| REQ-074 | After purchase, player's MovementSpeed increases | `PROTOTYPE_V0.1.md` | Transportation System / Bicycle | P1 | REQ-079 |
| REQ-075 | No advanced vehicle mechanics required (no maintenance, fuel, damage, enter/exit animation) | `PROTOTYPE_V0.1.md` | Transportation System / Bicycle | P0 | REQ-079b |
| REQ-076 | One small city/neighborhood area (first map) | `PROTOTYPE_V0.1.md` | World Prototype; `FIRST_MAP_DESIGN.md` | P0 | REQ-044 |
| REQ-077 | Map contains: residential area, company base, business area, storage/pickup area, delivery locations | `FIRST_MAP_DESIGN.md` | Initial Map Layout / Main Locations | P0 | REQ-080 |
| REQ-078 | Map contains basic roads, sidewalks, trees, decorative elements | `FIRST_MAP_DESIGN.md` | Map Objects / Environment | P0 | REQ-081 |
| REQ-079 | Map supports clear navigation: player always knows where they are, where package is, where destination is | `FIRST_MAP_DESIGN.md` | Navigation Design | P0 | REQ-082 |
| REQ-080 | Visual guidance: clear icons, markers, short routes | `FIRST_MAP_DESIGN.md` | Navigation Design / Visual guidance | P0 | REQ-083 |
| REQ-081 | Map optimized for mobile performance (avoid excessive objects, heavy animations) | `FIRST_MAP_DESIGN.md` | Performance Requirements | P1 | REQ-084 |
| REQ-082 | Map is 2D top-down view | `PROTOTYPE_TECH_STACK.md` | Game Type | P0 | REQ-085 |
| REQ-083 | Company base building (upgrade interface and management access) | `FIRST_MAP_DESIGN.md` | Company Base; `BUILDINGS.md` | P0 | REQ-086 |
| REQ-084 | Residential buildings (customer homes / delivery destinations) | `FIRST_MAP_DESIGN.md` | Residential Area; `BUILDINGS.md` | P0 | REQ-087 |
| REQ-085 | Commercial buildings (restaurants / shops / small businesses — order generation sources) | `FIRST_MAP_DESIGN.md` | Business Area; `BUILDINGS.md` | P0 | REQ-088 |
| REQ-086 | Pickup points (storage / package collection locations) | `FIRST_MAP_DESIGN.md` | Storage / Pickup Area | P0 | REQ-089 |
| REQ-087 | Buildings support interaction (tap to see name, available action) | `MOBILE_UI_CONTROLS.md` | Interaction System / Building | P1 | REQ-091 |
| REQ-088 | Main menu scene: Start Game, Settings, Information | `FIRST_PLAYABLE_EXPERIENCE.md` | Main Menu; `GDEVELOP_PROJECT_STRUCTURE.md` | P0 | REQ-092 |
| REQ-089 | Company Management scene: company info, upgrades, economy overview | `GDEVELOP_PROJECT_STRUCTURE.md` | Scenes / CompanyManagement | P1 | REQ-093 |
| REQ-090 | GameWorld HUD displays: current money, active order, delivery status | `PROTOTYPE_V0.1.md` | UI Requirements; `MOBILE_UI_CONTROLS.md` | P0 | REQ-094 |
| REQ-091 | Company status always visible: Money, Level, Reputation | `MOBILE_UI_CONTROLS.md` | Information Display / Company Status | P0 | REQ-095 |
| REQ-092 | Active order display: pickup location, destination, reward | `MOBILE_UI_CONTROLS.md` | Information Display / Active Order | P0 | REQ-096 |
| REQ-093 | Screen layout: Money/Level (top), Game Map (center), Order Information / Action Buttons (bottom) | `MOBILE_UI_CONTROLS.md` | Main Interface Layout | P0 | REQ-097 |
| REQ-094 | Available upgrades display in CompanyManagement | `PROTOTYPE_V0.1.md` | UI Requirements | P1 | REQ-098 |
| REQ-095 | Interface remains simple — no complex menus | `PROTOTYPE_V0.1.md` | UI Requirements; `FIRST_PLAYABLE_EXPERIENCE.md` | P0 | REQ-099 |
| REQ-096 | UI works on mobile screens (different screen sizes, large touch targets, readable text) | `PROTOTYPE_RELEASE_CHECKLIST.md` | Section 4 / Mobile Experience | P1 | REQ-100 |
| REQ-097 | HUD layer separate from game world layer | `GDEVELOP_PROJECT_STRUCTURE.md` | Project structure design | P0 | REQ-101 |
| REQ-098 | HUD renders over game world (always visible during gameplay) | `MOBILE_UI_CONTROLS.md` | Main Interface Layout | P0 | REQ-102 |
| REQ-099 | HUD: Money value (critical information, always visible) | `UI.md` | UI Information Hierarchy / Critical Information | P0 | REQ-103 |
| REQ-100 | HUD: Active order information (pickup, destination, reward) | `MOBILE_UI_CONTROLS.md` | Active Order Display | P0 | REQ-104 |
| REQ-101 | HUD: Delivery status / current objective indicator | `PROTOTYPE_V0.1.md` | UI Requirements | P0 | REQ-105 |
| REQ-102 | HUD: Accept Order button (shown when order is Available) | `MOBILE_UI_CONTROLS.md` | Action Buttons / Accept Order | P0 | REQ-106 |
| REQ-103 | HUD: Deliver button (shown when player is at destination with package) | `MOBILE_UI_CONTROLS.md` | Action Buttons / Deliver | P0 | REQ-107 |
| REQ-104 | HUD: Upgrade/Management button (shown after payment, optional) | `MOBILE_UI_CONTROLS.md` | Action Buttons / Upgrade | P1 | REQ-108 |
| REQ-105 | Feedback on order accepted: "New delivery started" (or equivalent) | `MOBILE_UI_CONTROLS.md` | User Feedback / Order accepted | P1 | REQ-110 |
| REQ-106 | Feedback on delivery completed: "Delivery successful +[amount] money" | `MOBILE_UI_CONTROLS.md` | User Feedback / Delivery completed | P0 | REQ-111 |
| REQ-107 | Feedback on upgrade purchased: "Company improved" (or equivalent) | `MOBILE_UI_CONTROLS.md` | User Feedback / Upgrade purchased | P1 | REQ-112 |
| REQ-108 | Feedback on delivery failed (failure consequence display) | `PROTOTYPE_V0.1.md` | Failure Branch | P1 | REQ-113 |
| REQ-109 | Feedback on purchase failed (not enough money) | `GAMEPLAY_EVENTS_FLOW.md` | Error Events / Purchase Failed | P1 | REQ-114 |
| REQ-110 | MVP event list fired as game events: GameStarted, OrderCreated, OrderAccepted, PackagePickedUp, DeliveryCompleted, DeliveryFailed, MoneyReceived, UpgradePurchased | `GAMEPLAY_EVENTS_FLOW.md` | MVP Event List | P0 | REQ-115 |
| REQ-111 | Local Save & Load required before Prototype v0.1 release | `SAVE_SYSTEM.md` | Prototype v0.1 Scope | P0 | REQ-120 |
| REQ-112 | One local save slot per device | `SAVE_SYSTEM.md` | Save Slot Policy | P0 | REQ-121 |
| REQ-113 | Required saved data: CompanyName, Money, Level, Reputation, PurchasedUpgradeLevels, TutorialStatus | `SAVE_SYSTEM.md` | Required Saved Data | P0 | REQ-122 |
| REQ-114 | Active order is NOT restored on load — cancelled and reset | `SAVE_SYSTEM.md` | Required Saved Data / Active Order | P0 | REQ-123 |
| REQ-115 | WorldData NOT persisted — regenerated on load | `SAVE_SYSTEM.md` | Required Saved Data / Transient Runtime Data | P0 | REQ-124 |
| REQ-116 | Autosave after: delivery completion, upgrade purchase, progression state change, tutorial step completion | `SAVE_SYSTEM.md` | Save Triggers / Autosave Events | P0 | REQ-125 |
| REQ-117 | No manual save UI required for Prototype v0.1 | `SAVE_SYSTEM.md` | Manual Save Policy | P0 | REQ-126 |
| REQ-118 | Continue Game: loads valid save automatically | `SAVE_SYSTEM.md` | Load Behavior / Continue Game | P0 | REQ-127 |
| REQ-119 | Start New Game: creates new data only when no valid save exists OR player explicitly confirms | `SAVE_SYSTEM.md` | Load Behavior / Start New Game | P0 | REQ-128 |
| REQ-120 | New game must never silently overwrite a valid save | `SAVE_SYSTEM.md` | Load Behavior / Start New Game | P0 | REQ-129 |
| REQ-121 | Save data must include save format version field | `SAVE_SYSTEM.md` | Version Compatibility | P0 | REQ-130 |
| REQ-122 | On load, validate required fields before using them (money ≥ 0, level > 0, etc.) | `SAVE_SYSTEM.md` | Data Validation | P0 | REQ-131 |
| REQ-123 | If no save file exists, start new game without notification | `SAVE_SYSTEM.md` | Missing or Corrupted Save Behavior | P0 | REQ-132 |
| REQ-124 | If save file exists but is unreadable/invalid, inform player that progress cannot be restored | `SAVE_SYSTEM.md` | Missing or Corrupted Save Behavior | P0 | REQ-133 |
| REQ-125 | Require player confirmation before replacing corrupted save with new game | `SAVE_SYSTEM.md` | Missing or Corrupted Save Behavior | P0 | REQ-134 |
| REQ-126 | Use GDevelop local storage APIs — no external backend | `SAVE_SYSTEM.md` | GDevelop Implementation Boundary | P0 | REQ-135 |
| REQ-127 | Player position persisted only if required for chosen prototype flow | `SAVE_SYSTEM.md` | Required Saved Data / Player State | P2 | REQ-136 |
| REQ-128 | SAFE system governs development safety (documentation first, modular changes, MVP protection) | `SAFE_SYSTEM.md` | Core Safety Principles | P0 | REQ-140 |
| REQ-129 | SAFE system is distinct from SAVE system — they have separate responsibilities | `DOCUMENT_INDEX.md` | 06_Technical note; `SAFE_SYSTEM.md` | P0 | REQ-141 |
| REQ-130 | Implementation must not change canonical documents without going through proper change process | `SAFE_SYSTEM.md` | AI Development Safety | P0 | REQ-142 |
| REQ-131 | No major system added until current milestone is functional | `SAFE_SYSTEM.md` | Testing Safety | P0 | REQ-143 |
| REQ-132 | Basic order generation — game generates simple delivery requests | `PROTOTYPE_V0.1.md` | AI Scope; `AI_SYSTEM.md` | P0 | REQ-150 |
| REQ-133 | Simple customer behavior — customers generate orders | `PROTOTYPE_V0.1.md` | AI Scope; `AI_SYSTEM.md` | P0 | REQ-151 |
| REQ-134 | No advanced AI automation, route optimization, recommendation systems, or fleet management | `PROTOTYPE_V0.1.md` | Systems Not Included; `AI_SYSTEM.md` | P0 | REQ-152 |
| REQ-135 | Single courier (player) performs all deliveries personally in Prototype v0.1 | `01_GameDesign/GAMEPLAY.md` | Early Game; `PROGRESSION.md` | P0 | REQ-155 |
| REQ-136 | One active order at a time | `CORE_GAMEPLAY_SYSTEMS.md` | System 1 / MVP Order Rules | P0 | REQ-156 |
| REQ-137 | No route planning, fleet management, or employee assignment | `PROTOTYPE_V0.1.md` | Systems Not Included | P0 | REQ-157 |
| REQ-138 | Income source: completed deliveries only (Prototype v0.1) | `CORE_GAMEPLAY_SYSTEMS.md` | System 4 / Income | P0 | REQ-160 |
| REQ-139 | Expenses: upgrade costs and Bicycle purchase cost | `CORE_GAMEPLAY_SYSTEMS.md` | System 4 / Expenses; `PROTOTYPE_V0.1.md` | P0 | REQ-161 |
| REQ-140 | No salary, maintenance, fuel, or infrastructure costs in Prototype v0.1 | `PROTOTYPE_V0.1.md` | Systems Not Included (implicit) | P0 | REQ-162 |
| REQ-141 | Money is the only financial resource in Prototype v0.1 | `ECONOMY.md` | Financial Resources / MVP Economy Scope | P0 | REQ-163 |
| REQ-142 | Systems communicate through events, not direct cross-system control | `GAMEPLAY_EVENTS_FLOW.md` | Event System Philosophy | P0 | REQ-165 |
| REQ-143 | Event naming: clear descriptive names (OrderAccepted, DeliveryCompleted, etc.) | `GAMEPLAY_EVENTS_FLOW.md` | Event Naming Rules | P0 | REQ-166 |
| REQ-144 | UI receives delivery information and displays feedback | `GAMEPLAY_EVENTS_FLOW.md` | UI Event Flow | P0 | REQ-167 |
| REQ-145 | MainMenu scene | `GDEVELOP_PROJECT_STRUCTURE.md` | Scenes / MainMenu | P0 | REQ-170 |
| REQ-146 | GameWorld scene (main gameplay scene) | `GDEVELOP_PROJECT_STRUCTURE.md` | Scenes / GameWorld | P0 | REQ-171 |
| REQ-147 | CompanyManagement scene | `GDEVELOP_PROJECT_STRUCTURE.md` | Scenes / CompanyManagement | P0 | REQ-172 |
| REQ-148 | Scene transition: GameWorld → CompanyManagement on Upgrade button | `PROTOTYPE_V0.1.md` | Optional Management Branch | P1 | REQ-174 |
| REQ-149 | GlobalVariable CompanyData structure: CompanyName, Money, Level, Experience, Reputation, UpgradeList | `GAME_DATA_STRUCTURE.md` | Company Data | P0 | REQ-180 |
| REQ-150 | GlobalVariable GameSettings structure: Language, Sound, Music, Difficulty, TutorialStatus | `GAME_DATA_STRUCTURE.md` | Game Settings | P1 | REQ-181 |
| REQ-151 | GlobalVariable SaveFormatVersion | `SAVE_SYSTEM.md` | Version Compatibility | P0 | REQ-182 |
| REQ-152 | Player object variable: CarryingPackage (boolean) | `GAME_DATA_STRUCTURE.md` | PlayerData / CarryingPackage | P0 | REQ-190 |
| REQ-153 | Player object variable: MovementSpeed (number) | `GAME_DATA_STRUCTURE.md` | PlayerData / MovementSpeed | P0 | REQ-191 |
| REQ-154 | PlayerData structure | `GAME_DATA_STRUCTURE.md` | Player Data | P0 | REQ-200 |
| REQ-155 | CompanyData structure | `GAME_DATA_STRUCTURE.md` | Company Data | P0 | REQ-201 |
| REQ-156 | OrderData structure | `GAME_DATA_STRUCTURE.md` | Order Data | P0 | REQ-202 |
| REQ-157 | WorldData structure | `GAME_DATA_STRUCTURE.md` | World Data | P0 | REQ-203 |
| REQ-158 | Upgrade structure: Name, Cost, Level, Effect | `GAME_DATA_STRUCTURE.md` | Upgrade Data | P1 | REQ-204 |
| REQ-159 | GameSettings structure | `GAME_DATA_STRUCTURE.md` | Game Settings | P1 | REQ-205 |
| REQ-160 | Variable naming convention: CompanyMoney, CurrentOrder, DeliveryReward (not Value1, Data2) | `GAME_DATA_STRUCTURE.md` | Variable Naming Rules | P0 | REQ-206 |
| REQ-161 | Persisted: CompanyData (Name, Money, Level, Reputation, UpgradeList) | `SAVE_SYSTEM.md` | Required Saved Data / Company Data | P0 | REQ-210 |
| REQ-162 | Persisted: TutorialStatus | `SAVE_SYSTEM.md` | Required Saved Data / Progression State | P1 | REQ-211 |
| REQ-163 | NOT persisted: ActiveOrder (cancelled and reset on load) | `SAVE_SYSTEM.md` | Required Saved Data / Active Order | P0 | REQ-212 |
| REQ-164 | NOT persisted: WorldData (regenerated on load) | `SAVE_SYSTEM.md` | Required Saved Data / Transient Runtime Data | P0 | REQ-213 |
| REQ-165 | Save format version field in every save | `SAVE_SYSTEM.md` | Version Compatibility | P0 | REQ-214 |
| REQ-166 | Player character: idle image, movement image | `ASSET_IMPORT_GUIDE.md` | Character Assets / Player Character | P0 | REQ-220 |
| REQ-167 | Building sprites: company building, residential, commercial | `ASSET_IMPORT_GUIDE.md` | Building Assets | P0 | REQ-221 |
| REQ-168 | Delivery point icon/marker | `FIRST_MAP_DESIGN.md` | Map Objects / Interactive Objects | P0 | REQ-222 |
| REQ-169 | Package sprite | `GDEVELOP_PROJECT_STRUCTURE.md` | Objects / Package | P0 | REQ-223 |
| REQ-170 | Money/HUD icon | `ASSET_IMPORT_GUIDE.md` | UI Assets / icon_money | P0 | REQ-224 |
| REQ-171 | Bicycle sprite | `VEHICLES.md` | Vehicle Assets; `ASSETS.md` | P1 | REQ-225 |
| REQ-172 | Road/environment tiles for map | `FIRST_MAP_DESIGN.md` | Map Objects / Environment | P0 | REQ-226 |
| REQ-173 | Asset physical folders: Assets/Sprites, Assets/Audio, Assets/UI | `GDEVELOP_PROJECT_STRUCTURE.md` | Assets section | P0 | REQ-227 |
| REQ-174 | Placeholder graphics are acceptable during Prototype v0.1 development | `ASSET_IMPORT_GUIDE.md` | Temporary Assets | P0 | REQ-230 |
| REQ-175 | Placeholder assets must be replaceable without changing gameplay logic | `ASSET_IMPORT_GUIDE.md` | Asset Replacement Strategy | P0 | REQ-231 |
| REQ-176 | Placeholder shapes/colors may represent: player (distinct color), buildings (distinct shapes), roads (gray), delivery points (marker icons) | `ASSET_IMPORT_GUIDE.md` | Asset Philosophy; `FIRST_MAP_DESIGN.md` | P0 | REQ-232 |
| REQ-177 | Asset naming: object-type_function_version (e.g., vehicle_bicycle_basic) | `ASSETS.md` | Asset Naming Rules | P0 | REQ-233 |
| REQ-178 | Gameplay testing: complete delivery loop works without interruption | `PROTOTYPE_TESTING_PLAN.md` | Section 1 / Gameplay Testing | P0 | REQ-240 |
| REQ-179 | Order system testing: orders created, accepted, status changes correctly | `PROTOTYPE_TESTING_PLAN.md` | Section 2 / Order System | P0 | REQ-241 |
| REQ-180 | Delivery system testing: pickup works, delivery works, completion detected | `PROTOTYPE_TESTING_PLAN.md` | Section 2 / Delivery System | P0 | REQ-242 |
| REQ-181 | Economy system testing: rewards added, costs removed, money updates | `PROTOTYPE_TESTING_PLAN.md` | Section 2 / Economy System | P0 | REQ-243 |
| REQ-182 | All persistence test cases from SAVE_SYSTEM.md and PROTOTYPE_TESTING_PLAN.md pass | `PROTOTYPE_TESTING_PLAN.md` | Section 3 / Persistence Testing; `SAVE_SYSTEM.md` | P0 | REQ-244 |
| REQ-183 | Mobile testing: buttons easy to press, text readable, controls natural, performance acceptable | `PROTOTYPE_TESTING_PLAN.md` | Section 5 / Mobile Testing | P1 | REQ-245 |
| REQ-184 | No critical bugs remain before release | `PROTOTYPE_TESTING_PLAN.md` | Prototype Completion Criteria / Stability | P0 | REQ-246 |
| REQ-185 | Completion gate is owned exclusively by PROTOTYPE_RELEASE_CHECKLIST.md | `PROTOTYPE_RELEASE_CHECKLIST.md` | Canonical Completion Gate Authority | P0 | REQ-250 |
| REQ-186 | All 7 release checklist sections must be verified: Project Stability, Core Gameplay, UI, Mobile Experience, Balance, Quality, Save & Load | `PROTOTYPE_RELEASE_CHECKLIST.md` | Sections 1–7 | P0 | REQ-251 |
| REQ-187 | Human approval required before Prototype v0.1 is declared complete | `PROTOTYPE_RELEASE_CHECKLIST.md` | Canonical Completion Gate Authority | P0 | REQ-252 |
| REQ-188 | No release checklist item may be marked complete during implementation preparation | `AI_AGENT_EXECUTION_PROTOCOL.md` | MVP Protection | P0 | REQ-253 |

---

End of Document
