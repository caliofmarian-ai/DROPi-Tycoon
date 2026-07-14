# Document Information

Document: PROTOTYPE_V0.1_REQUIREMENTS_INVENTORY.md
Project: DROPi Tycoon
Version: 1.0.0
Status: Implementation Preparation — Non-Authoritative
Author: AI Agent (Prototype v0.1 Implementation Preparation Task)
Language: English
Last Updated: 2026-07-14

---

# Prototype v0.1 Requirements Inventory

## Purpose

This document provides the complete canonical requirements inventory for DROPi Tycoon Prototype v0.1.

Every requirement is traced to its canonical source. No requirement is invented.

Where a required implementation detail is genuinely unspecified, it is classified as either:
- `OWNER DECISION REQUIRED` — a decision that must come from the Project Owner
- `IMPLEMENTATION DETAIL — AGENT MAY CHOOSE` — a detail within agent-authorized freedom

**This document does not override canonical documentation. If conflict exists, canonical documents govern.**

---

## Requirement Classification Legend

- **P0** — Must exist for Prototype v0.1 to be functional at all
- **P1** — Required before Prototype v0.1 release (checklist items)
- **P2** — Required for prototype quality/polish but not hard blockers
- **DEP** — Dependency notation: other requirement IDs that must be implemented first

---

# Section 1 — Player Starting State

| ID | Description | Canonical Source | Section | Priority | Dependencies |
|---|---|---|---|---|---|
| REQ-001 | Player starts on foot (walking is the only transport method at game start) | `PROTOTYPE_V0.1.md` | Transportation System / Starting Transport | P0 | — |
| REQ-002 | Player starts with a small amount of money (sufficient to begin but limited) | `FIRST_PLAYABLE_EXPERIENCE.md` | Starting Situation / Resources; `01_GameDesign/GAMEPLAY.md` | Early Game | P0 | — |
| REQ-003 | Player starts with one operating zone (small neighborhood / first map area) | `FIRST_PLAYABLE_EXPERIENCE.md` | Starting Situation / Resources | P0 | REQ-044 |
| REQ-004 | Player starts with no Bicycle (Bicycle is not starting equipment) | `PROTOTYPE_V0.1.md` | Transportation System / Starting Transport; `01_GameDesign/GAMEPLAY.md` | Early Game | P0 | — |
| REQ-005 | Player chooses company name at game start | `FIRST_PLAYABLE_EXPERIENCE.md` | Starting Situation / Company | P1 | REQ-055 |

**Exact starting money amount:** `IMPLEMENTATION DETAIL — AGENT MAY CHOOSE` (constrained by GAME_BALANCING_RULES.md: "enough to begin, limited ability, clear reason to improve"; final balance confirmed in balancing phase)

---

# Section 2 — Core Gameplay Loop

| ID | Description | Canonical Source | Section | Priority | Dependencies |
|---|---|---|---|---|---|
| REQ-010 | Receive Order — order is Available and presented to player | `PROTOTYPE_V0.1.md` | Core Gameplay Loop / Happy Path | P0 | REQ-030 |
| REQ-011 | Accept Order — Available → Accepted state transition | `PROTOTYPE_V0.1.md` | Core Gameplay Loop / Happy Path | P0 | REQ-010 |
| REQ-012 | Navigate to Pickup Location | `PROTOTYPE_V0.1.md` | Core Gameplay Loop / Happy Path | P0 | REQ-011, REQ-020 |
| REQ-013 | Pick Up Package — Accepted → PickedUp state transition | `PROTOTYPE_V0.1.md` | Core Gameplay Loop / Happy Path | P0 | REQ-012 |
| REQ-014 | Navigate to Destination | `PROTOTYPE_V0.1.md` | Core Gameplay Loop / Happy Path | P0 | REQ-013, REQ-020 |
| REQ-015 | Deliver Package — PickedUp → Completed state transition | `PROTOTYPE_V0.1.md` | Core Gameplay Loop / Happy Path | P0 | REQ-014 |
| REQ-016 | Receive Payment (money added after Completed) | `PROTOTYPE_V0.1.md` | Core Gameplay Loop / Happy Path | P0 | REQ-015 |
| REQ-017 | Loop repeats — new order becomes available | `PROTOTYPE_V0.1.md` | Core Gameplay Loop / Happy Path | P0 | REQ-016 |
| REQ-018 | Failure branch: PickedUp → Failed (with reputation consequence display) | `PROTOTYPE_V0.1.md` | Core Gameplay Loop / Failure Branch | P1 | REQ-013 |
| REQ-019 | Optional management branch: after payment, player may open CompanyManagement, purchase upgrade, return to loop | `PROTOTYPE_V0.1.md` | Core Gameplay Loop / Optional Management Branch | P1 | REQ-016, REQ-061 |

---

# Section 3 — Player Movement

| ID | Description | Canonical Source | Section | Priority | Dependencies |
|---|---|---|---|---|---|
| REQ-020 | Player movement is Tap-to-Move (recommended for Prototype v0.1) | `MOBILE_UI_CONTROLS.md` | Recommended MVP Choice | P0 | REQ-040 |
| REQ-021 | Player movement enables world navigation for delivery loop | `CORE_GAMEPLAY_SYSTEMS.md` | System 3 / MVP Movement | P0 | REQ-020 |
| REQ-022 | Walking is the only movement method at game start | `PROTOTYPE_V0.1.md` | Transportation System | P0 | REQ-001 |
| REQ-023 | After Bicycle purchase, player moves faster (increased MovementSpeed) | `PROTOTYPE_V0.1.md` | Transportation System / Bicycle | P1 | REQ-070 |

---

# Section 4 — Mobile Control Requirements

| ID | Description | Canonical Source | Section | Priority | Dependencies |
|---|---|---|---|---|---|
| REQ-025 | Primary control is touch-based (screen taps, buttons, menus) | `MOBILE_UI_CONTROLS.md` | Control Method | P0 | — |
| REQ-026 | Tap-to-Move: player taps a location and character moves there | `MOBILE_UI_CONTROLS.md` | Recommended MVP Choice | P0 | — |
| REQ-027 | Action buttons: Accept Order, Deliver, Upgrade | `MOBILE_UI_CONTROLS.md` | Action Buttons | P0 | — |
| REQ-028 | Camera follows player with smooth movement and basic zoom | `MOBILE_UI_CONTROLS.md` | Camera System / MVP Camera | P1 | REQ-020 |
| REQ-029 | Touch targets must be large enough for comfortable tap interaction | `MOBILE_UI_CONTROLS.md` | Accessibility | P1 | — |

---

# Section 5 — First Playable Experience

| ID | Description | Canonical Source | Section | Priority | Dependencies |
|---|---|---|---|---|---|
| REQ-030 | First order: a simple local delivery request with pickup location, destination, reward shown | `FIRST_PLAYABLE_EXPERIENCE.md` | Step 1: Receive First Order | P0 | REQ-035 |
| REQ-031 | Tutorial teaches through actions — no long explanations | `FIRST_PLAYABLE_EXPERIENCE.md` | First Tutorial Sequence | P1 | — |
| REQ-032 | Player should understand deliveries, money, upgrades, company growth within ~5 minutes | `FIRST_PLAYABLE_EXPERIENCE.md` | First 5 Minutes Goal | P1 | — |
| REQ-033 | After initial on-foot deliveries and sufficient money, first upgrade opportunity appears (Bicycle purchase) | `FIRST_PLAYABLE_EXPERIENCE.md` | Step 5: First Upgrade | P1 | REQ-070 |
| REQ-034 | Core emotional moment: "I started with nothing and I improved my company" | `FIRST_PLAYABLE_EXPERIENCE.md` | Core Emotional Moment | P2 | — |

---

# Section 6 — Order Generation

| ID | Description | Canonical Source | Section | Priority | Dependencies |
|---|---|---|---|---|---|
| REQ-035 | Game generates simple delivery requests (basic order generation) | `PROTOTYPE_V0.1.md` | Delivery System / Order Creation; AI Scope | P0 | — |
| REQ-036 | Each order contains: pickup location, destination, reward | `PROTOTYPE_V0.1.md` | Delivery System / Order Creation | P0 | — |
| REQ-037 | Each order has unique OrderID | `CORE_GAMEPLAY_SYSTEMS.md` | System 1 / Order Data; `GAME_DATA_STRUCTURE.md` | P0 | — |
| REQ-038 | Prototype supports one active order at a time | `CORE_GAMEPLAY_SYSTEMS.md` | System 1 / MVP Order Rules | P0 | — |
| REQ-039 | Orders have fixed rewards in Prototype v0.1 (not dynamic pricing) | `CORE_GAMEPLAY_SYSTEMS.md` | System 1 / MVP Order Rules | P0 | — |
| REQ-039b | Created → Available transition is system-driven (immediate after creation in v0.1) | `GAMEPLAY_EVENTS_FLOW.md` | Order Lifecycle Event-to-Transition Mapping | P0 | REQ-035 |

---

# Section 7 — Order Acceptance

| ID | Description | Canonical Source | Section | Priority | Dependencies |
|---|---|---|---|---|---|
| REQ-040 | Player accepts order through explicit action (Accept Order button) | `MOBILE_UI_CONTROLS.md` | Action Buttons; `GAMEPLAY_EVENTS_FLOW.md` | P0 | REQ-035, REQ-027 |
| REQ-041 | OrderAccepted event: Available → Accepted state transition | `GAMEPLAY_EVENTS_FLOW.md` | Order Acceptance Flow; `ORDERS.md` | P0 | REQ-040 |
| REQ-042 | On acceptance: order status changes, package assigned, player objective updated | `GAMEPLAY_EVENTS_FLOW.md` | Order Acceptance Flow / Process | P0 | REQ-041 |
| REQ-043 | Active order displayed in HUD/UI after acceptance | `MOBILE_UI_CONTROLS.md` | Active Order Display | P0 | REQ-041, REQ-080 |

---

# Section 8 — Pickup Behavior

| ID | Description | Canonical Source | Section | Priority | Dependencies |
|---|---|---|---|---|---|
| REQ-045 | Player navigates to pickup location after order acceptance | `PROTOTYPE_V0.1.md` | Core Gameplay Loop / Happy Path | P0 | REQ-041 |
| REQ-046 | PackagePickedUp event fires when player reaches correct pickup location | `GAMEPLAY_EVENTS_FLOW.md` | Package Pickup Flow | P0 | REQ-045 |
| REQ-047 | Accepted → PickedUp state transition on pickup | `ORDERS.md` | Allowed Transitions | P0 | REQ-046 |
| REQ-048 | Game verifies correct location before allowing pickup | `GAMEPLAY_EVENTS_FLOW.md` | Package Pickup Flow / Process | P0 | REQ-046 |
| REQ-049 | Player carries package after pickup (CarryingPackage = true) | `GAME_DATA_STRUCTURE.md` | PlayerData | P0 | REQ-047 |

---

# Section 9 — Delivery Behavior

| ID | Description | Canonical Source | Section | Priority | Dependencies |
|---|---|---|---|---|---|
| REQ-050 | Player navigates to delivery destination after pickup | `PROTOTYPE_V0.1.md` | Core Gameplay Loop / Happy Path | P0 | REQ-047 |
| REQ-051 | DeliveryCompleted event fires when player reaches correct destination with package | `GAMEPLAY_EVENTS_FLOW.md` | Delivery Completion Flow | P0 | REQ-050 |
| REQ-052 | PickedUp → Completed state transition on delivery | `ORDERS.md` | Allowed Transitions | P0 | REQ-051 |
| REQ-053 | Delivery success conditions: correct package, correct destination, order conditions fulfilled | `CORE_GAMEPLAY_SYSTEMS.md` | System 2 / Delivery Success | P0 | REQ-051 |
| REQ-054 | Delivery button available when player at destination with active package | `MOBILE_UI_CONTROLS.md` | Action Buttons / Deliver | P0 | REQ-049 |

---

# Section 10 — Order Lifecycle States

| ID | Description | Canonical Source | Section | Priority | Dependencies |
|---|---|---|---|---|---|
| REQ-055 | Six canonical states: Created, Available, Accepted, PickedUp, Completed, Failed | `ORDERS.md` | Canonical States table | P0 | — |
| REQ-056 | Allowed transitions: Created→Available, Available→Accepted, Accepted→PickedUp, PickedUp→Completed, PickedUp→Failed | `ORDERS.md` | Allowed Transitions | P0 | REQ-055 |
| REQ-057 | Terminal states: Completed and Failed have no outbound transitions | `ORDERS.md` | Terminal States | P0 | REQ-055 |
| REQ-058 | Technical value strings stored exactly: `Created`, `Available`, `Accepted`, `PickedUp`, `Completed`, `Failed` | `GAME_DATA_STRUCTURE.md` | Order Status | P0 | REQ-055 |
| REQ-059 | No cancellation or assignment states in Prototype v0.1 | `ORDERS.md` | Note on Full-Game Lifecycle | P0 | REQ-055 |

---

# Section 11 — Reward / Money Behavior

| ID | Description | Canonical Source | Section | Priority | Dependencies |
|---|---|---|---|---|---|
| REQ-060 | MoneyReceived event: money added to CompanyData.Money after DeliveryCompleted | `GAMEPLAY_EVENTS_FLOW.md` | Economy Event Flow | P0 | REQ-051 |
| REQ-061 | CompanyData.Money is a persistent global variable | `GAME_DATA_STRUCTURE.md` | CompanyData; `SAVE_SYSTEM.md` | P0 | — |
| REQ-062 | Money display updated after each reward | `MOBILE_UI_CONTROLS.md` | Company Status / Money; `CORE_GAMEPLAY_SYSTEMS.md` | P0 | REQ-060, REQ-080 |
| REQ-063 | Reward calculation considers distance/difficulty (basic) | `GAME_BALANCING_RULES.md` | Delivery Reward Rules / Example Reward Logic | P1 | REQ-036 |
| REQ-064 | Company reputation increases after successful delivery | `CORE_GAMEPLAY_SYSTEMS.md` | System 6 / Reputation Changes; `GAMEPLAY_EVENTS_FLOW.md` | P1 | REQ-051 |

**Exact reward amounts:** `IMPLEMENTATION DETAIL — AGENT MAY CHOOSE` (constrained by GAME_BALANCING_RULES.md principles)

---

# Section 12 — Failure Behavior

| ID | Description | Canonical Source | Section | Priority | Dependencies |
|---|---|---|---|---|---|
| REQ-065 | DeliveryFailed event: PickedUp → Failed state transition | `PROTOTYPE_V0.1.md` | Core Gameplay Loop / Failure Branch; `ORDERS.md` | P1 | REQ-047 |
| REQ-066 | Failure displays existing failure and reputation consequences | `PROTOTYPE_V0.1.md` | Core Gameplay Loop / Failure Branch | P1 | REQ-065 |
| REQ-067 | After failure, game returns to Receive Order state (new order generation) | `PROTOTYPE_V0.1.md` | Core Gameplay Loop / Failure Branch | P1 | REQ-065 |
| REQ-068 | Company reputation decreases after failed delivery | `CORE_GAMEPLAY_SYSTEMS.md` | System 6 / Reputation Changes | P1 | REQ-065 |
| REQ-069 | Failure is a learning opportunity — small penalty, no permanent setback | `GAME_BALANCING_RULES.md` | Failure Balance | P1 | REQ-065 |

**No numeric failure penalties are defined canonically:** `IMPLEMENTATION DETAIL — AGENT MAY CHOOSE` (constrained by balancing rules: small penalty)

---

# Section 13 — Progression Requirements

| ID | Description | Canonical Source | Section | Priority | Dependencies |
|---|---|---|---|---|---|
| REQ-070 | Company level tracking (CompanyData.Level) | `GAME_DATA_STRUCTURE.md` | CompanyData; `CORE_GAMEPLAY_SYSTEMS.md` | P1 | — |
| REQ-071 | Company reputation tracking (CompanyData.Reputation) | `GAME_DATA_STRUCTURE.md` | CompanyData; `CORE_GAMEPLAY_SYSTEMS.md` | P1 | — |
| REQ-072 | Upgrade system: DeliverySpeed, Capacity, Efficiency upgrade types | `GAME_DATA_STRUCTURE.md` | Upgrade Data / MVP Upgrades | P1 | REQ-061 |
| REQ-073 | Purchased upgrade levels persisted to save | `SAVE_SYSTEM.md` | Required Saved Data / Purchased upgrade levels | P0 | REQ-072 |
| REQ-074 | Tutorial completion status tracked and persisted | `SAVE_SYSTEM.md` | Required Saved Data / Progression State | P1 | — |

---

# Section 14 — Bicycle Purchase and Behavior

| ID | Description | Canonical Source | Section | Priority | Dependencies |
|---|---|---|---|---|---|
| REQ-075 | Bicycle is the first purchasable vehicle | `PROTOTYPE_V0.1.md` | Transportation System / Bicycle | P1 | REQ-001 |
| REQ-076 | Bicycle is NOT starting equipment | `PROTOTYPE_V0.1.md` | Transportation System / Starting Transport | P0 | — |
| REQ-077 | Bicycle is purchased through existing upgrade/shop interaction using earned money | `PROTOTYPE_V0.1.md` | Transportation System / Bicycle | P1 | REQ-072, REQ-061 |
| REQ-078 | Bicycle ownership persisted through Save & Load (upgrade purchase persistence system) | `PROTOTYPE_V0.1.md` | Transportation System / Bicycle; `SAVE_SYSTEM.md` | P1 | REQ-073 |
| REQ-079 | After purchase, player's MovementSpeed increases | `PROTOTYPE_V0.1.md` | Transportation System / Bicycle | P1 | REQ-077 |
| REQ-079b | No advanced vehicle mechanics required (no maintenance, fuel, damage, enter/exit animation) | `PROTOTYPE_V0.1.md` | Transportation System / Bicycle | P0 | — |

**Exact Bicycle purchase price:** `IMPLEMENTATION DETAIL — AGENT MAY CHOOSE` (constrained by GAME_BALANCING_RULES.md: affordable early upgrade; confirmed in balancing phase)

---

# Section 15 — Map Requirements

| ID | Description | Canonical Source | Section | Priority | Dependencies |
|---|---|---|---|---|---|
| REQ-044 | One small city/neighborhood area (first map) | `PROTOTYPE_V0.1.md` | World Prototype; `FIRST_MAP_DESIGN.md` | P0 | — |
| REQ-080 | Map contains: residential area, company base, business area, storage/pickup area, delivery locations | `FIRST_MAP_DESIGN.md` | Initial Map Layout / Main Locations | P0 | REQ-044 |
| REQ-081 | Map contains basic roads, sidewalks, trees, decorative elements | `FIRST_MAP_DESIGN.md` | Map Objects / Environment | P0 | REQ-044 |
| REQ-082 | Map supports clear navigation: player always knows where they are, where package is, where destination is | `FIRST_MAP_DESIGN.md` | Navigation Design | P0 | REQ-044 |
| REQ-083 | Visual guidance: clear icons, markers, short routes | `FIRST_MAP_DESIGN.md` | Navigation Design / Visual guidance | P0 | REQ-082 |
| REQ-084 | Map optimized for mobile performance (avoid excessive objects, heavy animations) | `FIRST_MAP_DESIGN.md` | Performance Requirements | P1 | REQ-044 |
| REQ-085 | Map is 2D top-down view | `PROTOTYPE_TECH_STACK.md` | Game Type | P0 | — |

---

# Section 16 — Building / Location Requirements

| ID | Description | Canonical Source | Section | Priority | Dependencies |
|---|---|---|---|---|---|
| REQ-086 | Company base building (upgrade interface and management access) | `FIRST_MAP_DESIGN.md` | Company Base; `BUILDINGS.md` | P0 | REQ-044 |
| REQ-087 | Residential buildings (customer homes / delivery destinations) | `FIRST_MAP_DESIGN.md` | Residential Area; `BUILDINGS.md` | P0 | REQ-044 |
| REQ-088 | Commercial buildings (restaurants / shops / small businesses — order generation sources) | `FIRST_MAP_DESIGN.md` | Business Area; `BUILDINGS.md` | P0 | REQ-044 |
| REQ-089 | Pickup points (storage / package collection locations) | `FIRST_MAP_DESIGN.md` | Storage / Pickup Area | P0 | REQ-035 |
| REQ-090 | DeliveryPoint objects with PointType (Pickup / Destination) and AssignedOrderID | `GDEVELOP_PROJECT_STRUCTURE.md` | Objects / DeliveryPoint; `GAME_DATA_STRUCTURE.md` | P0 | REQ-089 |
| REQ-091 | Buildings support interaction (tap to see name, available action) | `MOBILE_UI_CONTROLS.md` | Interaction System / Building | P1 | REQ-086 |

---

# Section 17 — UI Requirements

| ID | Description | Canonical Source | Section | Priority | Dependencies |
|---|---|---|---|---|---|
| REQ-092 | Main menu scene: Start Game, Settings, Information | `FIRST_PLAYABLE_EXPERIENCE.md` | Main Menu; `GDEVELOP_PROJECT_STRUCTURE.md` | P0 | — |
| REQ-093 | Company Management scene: company info, upgrades, economy overview | `GDEVELOP_PROJECT_STRUCTURE.md` | Scenes / CompanyManagement | P1 | REQ-072 |
| REQ-094 | GameWorld HUD displays: current money, active order, delivery status | `PROTOTYPE_V0.1.md` | UI Requirements; `MOBILE_UI_CONTROLS.md` | P0 | REQ-061 |
| REQ-095 | Company status always visible: Money, Level, Reputation | `MOBILE_UI_CONTROLS.md` | Information Display / Company Status | P0 | REQ-070, REQ-071 |
| REQ-096 | Active order display: pickup location, destination, reward | `MOBILE_UI_CONTROLS.md` | Information Display / Active Order | P0 | REQ-042 |
| REQ-097 | Screen layout: Money/Level (top), Game Map (center), Order Information / Action Buttons (bottom) | `MOBILE_UI_CONTROLS.md` | Main Interface Layout | P0 | — |
| REQ-098 | Available upgrades display in CompanyManagement | `PROTOTYPE_V0.1.md` | UI Requirements | P1 | REQ-072 |
| REQ-099 | Interface remains simple — no complex menus | `PROTOTYPE_V0.1.md` | UI Requirements; `FIRST_PLAYABLE_EXPERIENCE.md` | P0 | — |
| REQ-100 | UI works on mobile screens (different screen sizes, large touch targets, readable text) | `PROTOTYPE_RELEASE_CHECKLIST.md` | Section 4 / Mobile Experience | P1 | — |

---

# Section 18 — HUD Requirements

| ID | Description | Canonical Source | Section | Priority | Dependencies |
|---|---|---|---|---|---|
| REQ-101 | HUD layer separate from game world layer | `GDEVELOP_PROJECT_STRUCTURE.md` | Project structure design | P0 | — |
| REQ-102 | HUD renders over game world (always visible during gameplay) | `MOBILE_UI_CONTROLS.md` | Main Interface Layout | P0 | REQ-101 |
| REQ-103 | HUD: Money value (critical information, always visible) | `UI.md` | UI Information Hierarchy / Critical Information | P0 | REQ-061 |
| REQ-104 | HUD: Active order information (pickup, destination, reward) | `MOBILE_UI_CONTROLS.md` | Active Order Display | P0 | REQ-042 |
| REQ-105 | HUD: Delivery status / current objective indicator | `PROTOTYPE_V0.1.md` | UI Requirements | P0 | REQ-041 |
| REQ-106 | HUD: Accept Order button (shown when order is Available) | `MOBILE_UI_CONTROLS.md` | Action Buttons / Accept Order | P0 | REQ-040 |
| REQ-107 | HUD: Deliver button (shown when player is at destination with package) | `MOBILE_UI_CONTROLS.md` | Action Buttons / Deliver | P0 | REQ-054 |
| REQ-108 | HUD: Upgrade/Management button (shown after payment, optional) | `MOBILE_UI_CONTROLS.md` | Action Buttons / Upgrade | P1 | REQ-019 |

---

# Section 19 — Notification / Feedback Requirements

| ID | Description | Canonical Source | Section | Priority | Dependencies |
|---|---|---|---|---|---|
| REQ-110 | Feedback on order accepted: "New delivery started" (or equivalent) | `MOBILE_UI_CONTROLS.md` | User Feedback / Order accepted | P1 | REQ-041 |
| REQ-111 | Feedback on delivery completed: "Delivery successful +[amount] money" | `MOBILE_UI_CONTROLS.md` | User Feedback / Delivery completed | P0 | REQ-051 |
| REQ-112 | Feedback on upgrade purchased: "Company improved" (or equivalent) | `MOBILE_UI_CONTROLS.md` | User Feedback / Upgrade purchased | P1 | REQ-072 |
| REQ-113 | Feedback on delivery failed (failure consequence display) | `PROTOTYPE_V0.1.md` | Failure Branch | P1 | REQ-065 |
| REQ-114 | Feedback on purchase failed (not enough money) | `GAMEPLAY_EVENTS_FLOW.md` | Error Events / Purchase Failed | P1 | REQ-072 |
| REQ-115 | MVP event list fired as game events: GameStarted, OrderCreated, OrderAccepted, PackagePickedUp, DeliveryCompleted, DeliveryFailed, MoneyReceived, UpgradePurchased | `GAMEPLAY_EVENTS_FLOW.md` | MVP Event List | P0 | — |

---

# Section 20 — Save / Load Requirements

| ID | Description | Canonical Source | Section | Priority | Dependencies |
|---|---|---|---|---|---|
| REQ-120 | Local Save & Load required before Prototype v0.1 release | `SAVE_SYSTEM.md` | Prototype v0.1 Scope | P0 | — |
| REQ-121 | One local save slot per device | `SAVE_SYSTEM.md` | Save Slot Policy | P0 | — |
| REQ-122 | Required saved data: CompanyName, Money, Level, Reputation, PurchasedUpgradeLevels, TutorialStatus | `SAVE_SYSTEM.md` | Required Saved Data | P0 | REQ-061, REQ-070-074 |
| REQ-123 | Active order is NOT restored on load — cancelled and reset | `SAVE_SYSTEM.md` | Required Saved Data / Active Order | P0 | — |
| REQ-124 | WorldData NOT persisted — regenerated on load | `SAVE_SYSTEM.md` | Required Saved Data / Transient Runtime Data | P0 | — |
| REQ-125 | Autosave after: delivery completion, upgrade purchase, progression state change, tutorial step completion | `SAVE_SYSTEM.md` | Save Triggers / Autosave Events | P0 | REQ-051, REQ-072 |
| REQ-126 | No manual save UI required for Prototype v0.1 | `SAVE_SYSTEM.md` | Manual Save Policy | P0 | — |
| REQ-127 | Continue Game: loads valid save automatically | `SAVE_SYSTEM.md` | Load Behavior / Continue Game | P0 | REQ-120 |
| REQ-128 | Start New Game: creates new data only when no valid save exists OR player explicitly confirms | `SAVE_SYSTEM.md` | Load Behavior / Start New Game | P0 | REQ-120 |
| REQ-129 | New game must never silently overwrite a valid save | `SAVE_SYSTEM.md` | Load Behavior / Start New Game | P0 | REQ-128 |
| REQ-130 | Save data must include save format version field | `SAVE_SYSTEM.md` | Version Compatibility | P0 | REQ-120 |
| REQ-131 | On load, validate required fields before using them (money ≥ 0, level > 0, etc.) | `SAVE_SYSTEM.md` | Data Validation | P0 | REQ-127 |
| REQ-132 | If no save file exists, start new game without notification | `SAVE_SYSTEM.md` | Missing or Corrupted Save Behavior | P0 | — |
| REQ-133 | If save file exists but is unreadable/invalid, inform player that progress cannot be restored | `SAVE_SYSTEM.md` | Missing or Corrupted Save Behavior | P0 | — |
| REQ-134 | Require player confirmation before replacing corrupted save with new game | `SAVE_SYSTEM.md` | Missing or Corrupted Save Behavior | P0 | REQ-133 |
| REQ-135 | Use GDevelop local storage APIs — no external backend | `SAVE_SYSTEM.md` | GDevelop Implementation Boundary | P0 | — |
| REQ-136 | Player position persisted only if required for chosen prototype flow | `SAVE_SYSTEM.md` | Required Saved Data / Player State | P2 | OWNER DECISION REQUIRED (see ODR-003) |

---

# Section 21 — SAFE System Boundary

| ID | Description | Canonical Source | Section | Priority | Dependencies |
|---|---|---|---|---|---|
| REQ-140 | SAFE system governs development safety (documentation first, modular changes, MVP protection) | `SAFE_SYSTEM.md` | Core Safety Principles | P0 | — |
| REQ-141 | SAFE system is distinct from SAVE system — they have separate responsibilities | `DOCUMENT_INDEX.md` | 06_Technical note; `SAFE_SYSTEM.md` | P0 | — |
| REQ-142 | Implementation must not change canonical documents without going through proper change process | `SAFE_SYSTEM.md` | AI Development Safety | P0 | — |
| REQ-143 | No major system added until current milestone is functional | `SAFE_SYSTEM.md` | Testing Safety | P0 | — |

---

# Section 22 — AI System Requirements (Prototype v0.1)

| ID | Description | Canonical Source | Section | Priority | Dependencies |
|---|---|---|---|---|---|
| REQ-150 | Basic order generation — game generates simple delivery requests | `PROTOTYPE_V0.1.md` | AI Scope; `AI_SYSTEM.md` | P0 | REQ-035 |
| REQ-151 | Simple customer behavior — customers generate orders | `PROTOTYPE_V0.1.md` | AI Scope; `AI_SYSTEM.md` | P0 | REQ-035 |
| REQ-152 | No advanced AI automation, route optimization, recommendation systems, or fleet management | `PROTOTYPE_V0.1.md` | Systems Not Included; `AI_SYSTEM.md` | P0 | — |

---

# Section 23 — Logistics Requirements

| ID | Description | Canonical Source | Section | Priority | Dependencies |
|---|---|---|---|---|---|
| REQ-155 | Single courier (player) performs all deliveries personally in Prototype v0.1 | `01_GameDesign/GAMEPLAY.md` | Early Game; `PROGRESSION.md` | P0 | — |
| REQ-156 | One active order at a time | `CORE_GAMEPLAY_SYSTEMS.md` | System 1 / MVP Order Rules | P0 | REQ-038 |
| REQ-157 | No route planning, fleet management, or employee assignment | `PROTOTYPE_V0.1.md` | Systems Not Included | P0 | — |

---

# Section 24 — Economy Requirements

| ID | Description | Canonical Source | Section | Priority | Dependencies |
|---|---|---|---|---|---|
| REQ-160 | Income source: completed deliveries only (Prototype v0.1) | `CORE_GAMEPLAY_SYSTEMS.md` | System 4 / Income | P0 | REQ-060 |
| REQ-161 | Expenses: upgrade costs and Bicycle purchase cost | `CORE_GAMEPLAY_SYSTEMS.md` | System 4 / Expenses; `PROTOTYPE_V0.1.md` | P0 | REQ-072, REQ-077 |
| REQ-162 | No salary, maintenance, fuel, or infrastructure costs in Prototype v0.1 | `PROTOTYPE_V0.1.md` | Systems Not Included (implicit) | P0 | — |
| REQ-163 | Money is the only financial resource in Prototype v0.1 | `ECONOMY.md` | Financial Resources / MVP Economy Scope | P0 | REQ-061 |

---

# Section 25 — Events and Event-Flow Requirements

| ID | Description | Canonical Source | Section | Priority | Dependencies |
|---|---|---|---|---|---|
| REQ-165 | Systems communicate through events, not direct cross-system control | `GAMEPLAY_EVENTS_FLOW.md` | Event System Philosophy | P0 | — |
| REQ-166 | Event naming: clear descriptive names (OrderAccepted, DeliveryCompleted, etc.) | `GAMEPLAY_EVENTS_FLOW.md` | Event Naming Rules | P0 | — |
| REQ-167 | UI receives delivery information and displays feedback | `GAMEPLAY_EVENTS_FLOW.md` | UI Event Flow | P0 | REQ-110-114 |

---

# Section 26 — Scene Requirements

| ID | Description | Canonical Source | Section | Priority | Dependencies |
|---|---|---|---|---|---|
| REQ-170 | MainMenu scene | `GDEVELOP_PROJECT_STRUCTURE.md` | Scenes / MainMenu | P0 | — |
| REQ-171 | GameWorld scene (main gameplay scene) | `GDEVELOP_PROJECT_STRUCTURE.md` | Scenes / GameWorld | P0 | — |
| REQ-172 | CompanyManagement scene | `GDEVELOP_PROJECT_STRUCTURE.md` | Scenes / CompanyManagement | P0 | — |
| REQ-173 | Scene transition: MainMenu → GameWorld on Start/Continue | — | Implied by canonical structure | P0 | REQ-170, REQ-171 |
| REQ-174 | Scene transition: GameWorld → CompanyManagement on Upgrade button | `PROTOTYPE_V0.1.md` | Optional Management Branch | P1 | REQ-171, REQ-172 |
| REQ-175 | Scene transition: CompanyManagement → GameWorld on return | `PROTOTYPE_V0.1.md` | Optional Management Branch | P1 | REQ-174 |

---

# Section 27 — Global Variables

| ID | Description | Canonical Source | Section | Priority | Dependencies |
|---|---|---|---|---|---|
| REQ-180 | GlobalVariable CompanyData structure: CompanyName, Money, Level, Experience, Reputation, UpgradeList | `GAME_DATA_STRUCTURE.md` | Company Data | P0 | — |
| REQ-181 | GlobalVariable GameSettings structure: Language, Sound, Music, Difficulty, TutorialStatus | `GAME_DATA_STRUCTURE.md` | Game Settings | P1 | — |
| REQ-182 | GlobalVariable SaveFormatVersion | `SAVE_SYSTEM.md` | Version Compatibility | P0 | REQ-130 |

---

# Section 28 — Scene Variables

| ID | Description | Canonical Source | Section | Priority | Dependencies |
|---|---|---|---|---|---|
| REQ-185 | GameWorld SceneVariable PlayerData structure: Position, CurrentOrder, CarryingPackage, MovementSpeed | `GAME_DATA_STRUCTURE.md` | Player Data | P0 | — |
| REQ-186 | GameWorld SceneVariable ActiveOrder structure: OrderID, PickupLocation, Destination, Reward, Status | `GAME_DATA_STRUCTURE.md` | Order Data | P0 | REQ-055 |
| REQ-187 | GameWorld SceneVariable WorldData structure: DeliveryPoints, Buildings, ActiveCustomers (runtime, not persisted) | `GAME_DATA_STRUCTURE.md` | World Data | P0 | — |

---

# Section 29 — Object Variables

| ID | Description | Canonical Source | Section | Priority | Dependencies |
|---|---|---|---|---|---|
| REQ-190 | Player object variable: CarryingPackage (boolean) | `GAME_DATA_STRUCTURE.md` | PlayerData / CarryingPackage | P0 | — |
| REQ-191 | Player object variable: MovementSpeed (number) | `GAME_DATA_STRUCTURE.md` | PlayerData / MovementSpeed | P0 | — |
| REQ-192 | Building object variable: BuildingName (string), BuildingType (string), IsInteractive (bool) | `GAME_DATA_STRUCTURE.md` | WorldData / Buildings; `BUILDINGS.md` | P0 | — |
| REQ-193 | DeliveryPoint object variable: PointID (string), PointType (Pickup/Destination), AssignedOrderID (string) | `GAME_DATA_STRUCTURE.md` | OrderData / PickupLocation; `GDEVELOP_PROJECT_STRUCTURE.md` | P0 | — |
| REQ-194 | Package object variable: OrderID (string), CarriedByPlayer (boolean) | `GAME_DATA_STRUCTURE.md` | OrderData | P0 | — |

---

# Section 30 — Data Structures

| ID | Description | Canonical Source | Section | Priority | Dependencies |
|---|---|---|---|---|---|
| REQ-200 | PlayerData structure | `GAME_DATA_STRUCTURE.md` | Player Data | P0 | REQ-185 |
| REQ-201 | CompanyData structure | `GAME_DATA_STRUCTURE.md` | Company Data | P0 | REQ-180 |
| REQ-202 | OrderData structure | `GAME_DATA_STRUCTURE.md` | Order Data | P0 | REQ-186 |
| REQ-203 | WorldData structure | `GAME_DATA_STRUCTURE.md` | World Data | P0 | REQ-187 |
| REQ-204 | Upgrade structure: Name, Cost, Level, Effect | `GAME_DATA_STRUCTURE.md` | Upgrade Data | P1 | REQ-072 |
| REQ-205 | GameSettings structure | `GAME_DATA_STRUCTURE.md` | Game Settings | P1 | REQ-181 |
| REQ-206 | Variable naming convention: CompanyMoney, CurrentOrder, DeliveryReward (not Value1, Data2) | `GAME_DATA_STRUCTURE.md` | Variable Naming Rules | P0 | — |

---

# Section 31 — Persistence Boundaries

| ID | Description | Canonical Source | Section | Priority | Dependencies |
|---|---|---|---|---|---|
| REQ-210 | Persisted: CompanyData (Name, Money, Level, Reputation, UpgradeList) | `SAVE_SYSTEM.md` | Required Saved Data / Company Data | P0 | REQ-122 |
| REQ-211 | Persisted: TutorialStatus | `SAVE_SYSTEM.md` | Required Saved Data / Progression State | P1 | REQ-122 |
| REQ-212 | NOT persisted: ActiveOrder (cancelled and reset on load) | `SAVE_SYSTEM.md` | Required Saved Data / Active Order | P0 | — |
| REQ-213 | NOT persisted: WorldData (regenerated on load) | `SAVE_SYSTEM.md` | Required Saved Data / Transient Runtime Data | P0 | — |
| REQ-214 | Save format version field in every save | `SAVE_SYSTEM.md` | Version Compatibility | P0 | REQ-130 |

---

# Section 32 — Required Prototype Assets

| ID | Description | Canonical Source | Section | Priority | Dependencies |
|---|---|---|---|---|---|
| REQ-220 | Player character: idle image, movement image | `ASSET_IMPORT_GUIDE.md` | Character Assets / Player Character | P0 | — |
| REQ-221 | Building sprites: company building, residential, commercial | `ASSET_IMPORT_GUIDE.md` | Building Assets | P0 | REQ-086-088 |
| REQ-222 | Delivery point icon/marker | `FIRST_MAP_DESIGN.md` | Map Objects / Interactive Objects | P0 | REQ-090 |
| REQ-223 | Package sprite | `GDEVELOP_PROJECT_STRUCTURE.md` | Objects / Package | P0 | REQ-049 |
| REQ-224 | Money/HUD icon | `ASSET_IMPORT_GUIDE.md` | UI Assets / icon_money | P0 | REQ-103 |
| REQ-225 | Bicycle sprite | `VEHICLES.md` | Vehicle Assets; `ASSETS.md` | P1 | REQ-075 |
| REQ-226 | Road/environment tiles for map | `FIRST_MAP_DESIGN.md` | Map Objects / Environment | P0 | REQ-081 |
| REQ-227 | Asset physical folders: Assets/Sprites, Assets/Audio, Assets/UI | `GDEVELOP_PROJECT_STRUCTURE.md` | Assets section | P0 | — |

---

# Section 33 — Placeholder Asset Policy

| ID | Description | Canonical Source | Section | Priority | Dependencies |
|---|---|---|---|---|---|
| REQ-230 | Placeholder graphics are acceptable during Prototype v0.1 development | `ASSET_IMPORT_GUIDE.md` | Temporary Assets | P0 | — |
| REQ-231 | Placeholder assets must be replaceable without changing gameplay logic | `ASSET_IMPORT_GUIDE.md` | Asset Replacement Strategy | P0 | — |
| REQ-232 | Placeholder shapes/colors may represent: player (distinct color), buildings (distinct shapes), roads (gray), delivery points (marker icons) | `ASSET_IMPORT_GUIDE.md` | Asset Philosophy; `FIRST_MAP_DESIGN.md` | P0 | — |
| REQ-233 | Asset naming: object-type_function_version (e.g., vehicle_bicycle_basic) | `ASSETS.md` | Asset Naming Rules | P0 | — |

---

# Section 34 — Testing Requirements

| ID | Description | Canonical Source | Section | Priority | Dependencies |
|---|---|---|---|---|---|
| REQ-240 | Gameplay testing: complete delivery loop works without interruption | `PROTOTYPE_TESTING_PLAN.md` | Section 1 / Gameplay Testing | P0 | REQ-010-017 |
| REQ-241 | Order system testing: orders created, accepted, status changes correctly | `PROTOTYPE_TESTING_PLAN.md` | Section 2 / Order System | P0 | REQ-055-059 |
| REQ-242 | Delivery system testing: pickup works, delivery works, completion detected | `PROTOTYPE_TESTING_PLAN.md` | Section 2 / Delivery System | P0 | REQ-045-054 |
| REQ-243 | Economy system testing: rewards added, costs removed, money updates | `PROTOTYPE_TESTING_PLAN.md` | Section 2 / Economy System | P0 | REQ-060-064 |
| REQ-244 | All persistence test cases from SAVE_SYSTEM.md and PROTOTYPE_TESTING_PLAN.md pass | `PROTOTYPE_TESTING_PLAN.md` | Section 3 / Persistence Testing; `SAVE_SYSTEM.md` | P0 | REQ-120-136 |
| REQ-245 | Mobile testing: buttons easy to press, text readable, controls natural, performance acceptable | `PROTOTYPE_TESTING_PLAN.md` | Section 5 / Mobile Testing | P1 | — |
| REQ-246 | No critical bugs remain before release | `PROTOTYPE_TESTING_PLAN.md` | Prototype Completion Criteria / Stability | P0 | — |

---

# Section 35 — Completion Gate Requirements

| ID | Description | Canonical Source | Section | Priority | Dependencies |
|---|---|---|---|---|---|
| REQ-250 | Completion gate is owned exclusively by PROTOTYPE_RELEASE_CHECKLIST.md | `PROTOTYPE_RELEASE_CHECKLIST.md` | Canonical Completion Gate Authority | P0 | — |
| REQ-251 | All 7 release checklist sections must be verified: Project Stability, Core Gameplay, UI, Mobile Experience, Balance, Quality, Save & Load | `PROTOTYPE_RELEASE_CHECKLIST.md` | Sections 1–7 | P0 | all P0/P1 reqs |
| REQ-252 | Human approval required before Prototype v0.1 is declared complete | `PROTOTYPE_RELEASE_CHECKLIST.md` | Canonical Completion Gate Authority | P0 | REQ-251 |
| REQ-253 | No release checklist item may be marked complete during implementation preparation | `AI_AGENT_EXECUTION_PROTOCOL.md` | MVP Protection | P0 | — |

---

# Section 36 — Explicit Exclusions from Prototype v0.1

*(See PROTOTYPE_V0.1_EXCLUSION_REGISTER.md for the full exclusion register)*

| ID | Excluded Feature | Canonical Source |
|---|---|---|
| EXC-001 | DronePorts | `PROTOTYPE_V0.1.md` Systems Not Included |
| EXC-002 | Drone delivery | `PROTOTYPE_V0.1.md` Systems Not Included |
| EXC-003 | Multiple cities | `PROTOTYPE_V0.1.md` Systems Not Included |
| EXC-004 | Multiplayer | `PROTOTYPE_V0.1.md` Systems Not Included |
| EXC-005 | Advanced AI agents / automation | `PROTOTYPE_V0.1.md` Systems Not Included |
| EXC-006 | Complex economy (loans, taxes, stock, inflation) | `PROTOTYPE_V0.1.md` Systems Not Included |
| EXC-007 | Vans, motorcycles, trucks, or vehicles beyond Bicycle | `VEHICLES.md` MVP Vehicle Scope; `PROTOTYPE_V0.1.md` |
| EXC-008 | Employee hiring or management | `PROTOTYPE_V0.1.md` (implicit); `PROGRESSION.md` Stage 2+ |
| EXC-009 | Cloud save / cross-device sync | `SAVE_SYSTEM.md` Save Slot Policy |
| EXC-010 | Multiple save slots | `SAVE_SYSTEM.md` Save Slot Policy |
| EXC-011 | Online backend / server services | `PROTOTYPE_V0.1.md` Systems Not Included |

---

End of Document
