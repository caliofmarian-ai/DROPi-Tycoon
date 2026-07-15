# Document Information

Document: CANONICAL_TO_IMPLEMENTATION_TRACEABILITY_MATRIX.md
Project: DROPi Tycoon
Version: 1.1.1
Status: Implementation Preparation — Non-Authoritative
Author: AI Agent (PR #56 correction from Report 057; corrected per Report 073)
Language: English
Last Updated: 2026-07-15

---

# Canonical-to-Implementation Traceability Matrix (Corrected)

## Purpose

Map every final valid requirement to at least one planned implementation evidence target.

## Coverage Calculation

- Total valid requirements: **188**
- Mapped requirements: **188**
- Unmapped requirements: **0**
- Duplicate mappings: **0**
- Orphan artifacts: **0**
- Exact traceability percentage: **100.00%** (`188 / 188 = 100.00%`)

## Requirement-to-Artifact Mappings

| Requirement ID | Requirement Summary | Mapping Classification | Planned Artifact / Evidence Target | Primary Batch |
|---|---|---|---|---|
| REQ-001 | Player starts on foot (walking is the only transport method at game start) | CANONICAL REQUIREMENT | Batch-plan acceptance evidence | BATCH-015 |
| REQ-002 | Player starts with a small amount of money (sufficient to begin but limited) | CANONICAL REQUIREMENT | Batch-plan acceptance evidence | BATCH-015 |
| REQ-003 | Player starts with one operating zone (small neighborhood / first map area) | CANONICAL REQUIREMENT | Batch-plan acceptance evidence | BATCH-015 |
| REQ-004 | Player starts with no Bicycle (Bicycle is not starting equipment) | CANONICAL REQUIREMENT | Batch-plan acceptance evidence | BATCH-015 |
| REQ-005 | Player chooses company name at game start | CANONICAL REQUIREMENT | Batch-plan acceptance evidence | BATCH-015 |
| REQ-006 | Receive Order — order is Available and presented to player | CANONICAL REQUIREMENT | Batch-plan acceptance evidence | BATCH-015 |
| REQ-007 | Accept Order — Available → Accepted state transition | CANONICAL REQUIREMENT | Batch-plan acceptance evidence | BATCH-015 |
| REQ-008 | Navigate to Pickup Location | CANONICAL REQUIREMENT | Batch-plan acceptance evidence | BATCH-015 |
| REQ-009 | Pick Up Package — Accepted → PickedUp state transition | CANONICAL REQUIREMENT | Batch-plan acceptance evidence | BATCH-015 |
| REQ-010 | Navigate to Destination | CANONICAL REQUIREMENT | Batch-plan acceptance evidence | BATCH-015 |
| REQ-011 | Deliver Package — PickedUp → Completed state transition | CANONICAL REQUIREMENT | Batch-plan acceptance evidence | BATCH-015 |
| REQ-012 | Receive Payment (money added after Completed) | CANONICAL REQUIREMENT | Batch-plan acceptance evidence | BATCH-015 |
| REQ-013 | Loop repeats — new order becomes available | CANONICAL REQUIREMENT | Batch-plan acceptance evidence | BATCH-015 |
| REQ-014 | Failure branch: PickedUp → Failed (with reputation consequence display) | CANONICAL REQUIREMENT | Batch-plan acceptance evidence | BATCH-015 |
| REQ-015 | Optional management branch: after payment, player may open CompanyManagement, purchase upgrade, return to loop | CANONICAL REQUIREMENT | Batch-plan acceptance evidence | BATCH-015 |
| REQ-016 | Player movement is Tap-to-Move (recommended for Prototype v0.1) | CANONICAL REQUIREMENT | Tap-to-Move movement implementation evidence | BATCH-006 |
| REQ-017 | Player movement enables world navigation for delivery loop | CANONICAL REQUIREMENT | Economy/progression implementation evidence | BATCH-009/BATCH-012 |
| REQ-018 | Walking is the only movement method at game start | CANONICAL REQUIREMENT | Batch-plan acceptance evidence | BATCH-015 |
| REQ-019 | After Bicycle purchase, player moves faster (increased MovementSpeed) | CANONICAL REQUIREMENT | Batch-plan acceptance evidence | BATCH-015 |
| REQ-020 | Primary control is touch-based (screen taps, buttons, menus) | CANONICAL REQUIREMENT | Touch-first movement/input implementation evidence | BATCH-006 |
| REQ-021 | Tap-to-Move: player taps a location and character moves there | CANONICAL REQUIREMENT | Tap target acquisition and movement-to-target evidence | BATCH-006 |
| REQ-022 | Action buttons: Accept Order, Deliver, Upgrade | CANONICAL REQUIREMENT | HUD/action-button implementation evidence | BATCH-010 |
| REQ-023 | Camera follows player with smooth movement and basic zoom | CANONICAL REQUIREMENT | Camera-follow implementation evidence | BATCH-006 |
| REQ-024 | Touch targets must be large enough for comfortable tap interaction | CANONICAL CONSTRAINT | Constraint-compliance evidence for touch-target sizing (full mobile fit/finish validation later) | BATCH-006/BATCH-010/BATCH-014 |
| REQ-025 | First order: a simple local delivery request with pickup location, destination, reward shown | CANONICAL REQUIREMENT | Batch-plan acceptance evidence | BATCH-015 |
| REQ-026 | Tutorial teaches through actions — no long explanations | CANONICAL REQUIREMENT | Batch-plan acceptance evidence | BATCH-015 |
| REQ-027 | Player should understand deliveries, money, upgrades, company growth within ~5 minutes | CANONICAL REQUIREMENT | Batch-plan acceptance evidence | BATCH-015 |
| REQ-028 | After initial on-foot deliveries and sufficient money, first upgrade opportunity appears (Bicycle purchase) | CANONICAL REQUIREMENT | Batch-plan acceptance evidence | BATCH-015 |
| REQ-029 | Core emotional moment: "I started with nothing and I improved my company" | CANONICAL REQUIREMENT | Batch-plan acceptance evidence | BATCH-015 |
| REQ-030 | Game generates simple delivery requests (basic order generation) | CANONICAL REQUIREMENT | Batch-plan acceptance evidence | BATCH-015 |
| REQ-031 | Each order contains: pickup location, destination, reward | CANONICAL REQUIREMENT | Batch-plan acceptance evidence | BATCH-015 |
| REQ-032 | Each order has unique OrderID | CANONICAL REQUIREMENT | Economy/progression implementation evidence | BATCH-009/BATCH-012 |
| REQ-033 | Prototype supports one active order at a time | CANONICAL REQUIREMENT | Economy/progression implementation evidence | BATCH-009/BATCH-012 |
| REQ-034 | Orders have fixed rewards in Prototype v0.1 (not dynamic pricing) | CANONICAL REQUIREMENT | Economy/progression implementation evidence | BATCH-009/BATCH-012 |
| REQ-035 | Created → Available transition is system-driven (immediate after creation in v0.1) | CANONICAL REQUIREMENT | Order/event lifecycle implementation evidence | BATCH-005/BATCH-009 |
| REQ-036 | Player accepts order through explicit action (Accept Order button) | CANONICAL REQUIREMENT | HUD/input/notification implementation evidence | BATCH-010 |
| REQ-037 | OrderAccepted event: Available → Accepted state transition | CANONICAL REQUIREMENT | Order/event lifecycle implementation evidence | BATCH-005/BATCH-009 |
| REQ-038 | On acceptance: order status changes, package assigned, player objective updated | CANONICAL REQUIREMENT | Order/event lifecycle implementation evidence | BATCH-005/BATCH-009 |
| REQ-039 | Active order displayed in HUD/UI after acceptance | CANONICAL REQUIREMENT | HUD/input/notification implementation evidence | BATCH-010 |
| REQ-040 | Player navigates to pickup location after order acceptance | CANONICAL REQUIREMENT | Batch-plan acceptance evidence | BATCH-015 |
| REQ-041 | PackagePickedUp event fires when player reaches correct pickup location | CANONICAL REQUIREMENT | Order/event lifecycle implementation evidence | BATCH-005/BATCH-009 |
| REQ-042 | Accepted → PickedUp state transition on pickup | CANONICAL REQUIREMENT | Order/event lifecycle implementation evidence | BATCH-005/BATCH-009 |
| REQ-043 | Game verifies correct location before allowing pickup | CANONICAL REQUIREMENT | Order/event lifecycle implementation evidence | BATCH-005/BATCH-009 |
| REQ-044 | Player carries package after pickup (CarryingPackage = true) | CANONICAL REQUIREMENT | Project scaffold/architecture/schema implementation evidence | BATCH-001/BATCH-002 |
| REQ-045 | Player navigates to delivery destination after pickup | CANONICAL REQUIREMENT | Batch-plan acceptance evidence | BATCH-015 |
| REQ-046 | DeliveryCompleted event fires when player reaches correct destination with package | CANONICAL REQUIREMENT | Order/event lifecycle implementation evidence | BATCH-005/BATCH-009 |
| REQ-047 | PickedUp → Completed state transition on delivery | CANONICAL REQUIREMENT | Order/event lifecycle implementation evidence | BATCH-005/BATCH-009 |
| REQ-048 | Delivery success conditions: correct package, correct destination, order conditions fulfilled | CANONICAL REQUIREMENT | Economy/progression implementation evidence | BATCH-009/BATCH-012 |
| REQ-049 | Delivery button available when player at destination with active package | CANONICAL REQUIREMENT | HUD/input/notification implementation evidence | BATCH-010 |
| REQ-050 | Six canonical states: Created, Available, Accepted, PickedUp, Completed, Failed | CANONICAL REQUIREMENT | Order/event lifecycle implementation evidence | BATCH-005/BATCH-009 |
| REQ-051 | Allowed transitions: Created→Available, Available→Accepted, Accepted→PickedUp, PickedUp→Completed, PickedUp... | CANONICAL REQUIREMENT | Order/event lifecycle implementation evidence | BATCH-005/BATCH-009 |
| REQ-052 | Terminal states: Completed and Failed have no outbound transitions | CANONICAL REQUIREMENT | Order/event lifecycle implementation evidence | BATCH-005/BATCH-009 |
| REQ-053 | Technical value strings stored exactly: `Created`, `Available`, `Accepted`, `PickedUp`, `Completed`, `Failed` | CANONICAL REQUIREMENT | Project scaffold/architecture/schema implementation evidence | BATCH-001/BATCH-002 |
| REQ-054 | No cancellation or assignment states in Prototype v0.1 | CANONICAL REQUIREMENT | Order/event lifecycle implementation evidence | BATCH-005/BATCH-009 |
| REQ-055 | MoneyReceived event: money added to CompanyData.Money after DeliveryCompleted | CANONICAL REQUIREMENT | Order/event lifecycle implementation evidence | BATCH-005/BATCH-009 |
| REQ-056 | CompanyData.Money is a persistent global variable | CANONICAL REQUIREMENT | Save/load implementation and validation checklist | BATCH-013 |
| REQ-057 | Money display updated after each reward | CANONICAL REQUIREMENT | HUD/input/notification implementation evidence | BATCH-010 |
| REQ-058 | Reward calculation considers distance/difficulty (basic) | CANONICAL REQUIREMENT | Batch-plan acceptance evidence | BATCH-015 |
| REQ-059 | Company reputation increases after successful delivery | CANONICAL REQUIREMENT | Order/event lifecycle implementation evidence | BATCH-005/BATCH-009 |
| REQ-060 | DeliveryFailed event: PickedUp → Failed state transition | CANONICAL REQUIREMENT | Order/event lifecycle implementation evidence | BATCH-005/BATCH-009 |
| REQ-061 | Failure displays existing failure and reputation consequences | CANONICAL REQUIREMENT | Batch-plan acceptance evidence | BATCH-015 |
| REQ-062 | After failure, game returns to Receive Order state (new order generation) | CANONICAL REQUIREMENT | Batch-plan acceptance evidence | BATCH-015 |
| REQ-063 | Company reputation decreases after failed delivery | CANONICAL REQUIREMENT | Economy/progression implementation evidence | BATCH-009/BATCH-012 |
| REQ-064 | Failure is a learning opportunity — small penalty, no permanent setback | CANONICAL REQUIREMENT | Batch-plan acceptance evidence | BATCH-015 |
| REQ-065 | Company level tracking (CompanyData.Level) | CANONICAL REQUIREMENT | Economy/progression implementation evidence | BATCH-009/BATCH-012 |
| REQ-066 | Company reputation tracking (CompanyData.Reputation) | CANONICAL REQUIREMENT | Economy/progression implementation evidence | BATCH-009/BATCH-012 |
| REQ-067 | Upgrade system: DeliverySpeed, Capacity, Efficiency upgrade types | CANONICAL REQUIREMENT | Project scaffold/architecture/schema implementation evidence | BATCH-001/BATCH-002 |
| REQ-068 | Purchased upgrade levels persisted to save | CANONICAL REQUIREMENT | Save/load implementation and validation checklist | BATCH-013 |
| REQ-069 | Tutorial completion status tracked and persisted | CANONICAL REQUIREMENT | Save/load implementation and validation checklist | BATCH-013 |
| REQ-070 | Bicycle is the first purchasable vehicle | CANONICAL REQUIREMENT | Batch-plan acceptance evidence | BATCH-015 |
| REQ-071 | Bicycle is NOT starting equipment | CANONICAL REQUIREMENT | Batch-plan acceptance evidence | BATCH-015 |
| REQ-072 | Bicycle is purchased through existing upgrade/shop interaction using earned money | CANONICAL REQUIREMENT | Batch-plan acceptance evidence | BATCH-015 |
| REQ-073 | Bicycle ownership persisted through Save & Load (upgrade purchase persistence system) | CANONICAL REQUIREMENT | Save/load implementation and validation checklist | BATCH-013 |
| REQ-074 | After purchase, player's MovementSpeed increases | CANONICAL REQUIREMENT | Batch-plan acceptance evidence | BATCH-015 |
| REQ-075 | No advanced vehicle mechanics required (no maintenance, fuel, damage, enter/exit animation) | CANONICAL REQUIREMENT | Batch-plan acceptance evidence | BATCH-015 |
| REQ-076 | One small city/neighborhood area (first map) | CANONICAL REQUIREMENT | Map/world composition and interaction implementation | BATCH-004 |
| REQ-077 | Map contains: residential area, company base, business area, storage/pickup area, delivery locations | CANONICAL REQUIREMENT | Map/world composition and interaction implementation | BATCH-004 |
| REQ-078 | Map contains basic roads, sidewalks, trees, decorative elements | CANONICAL REQUIREMENT | Map/world composition and interaction implementation | BATCH-004 |
| REQ-079 | Map supports clear navigation: player always knows where they are, where package is, where destination is | CANONICAL REQUIREMENT | Map/world composition and interaction implementation | BATCH-004 |
| REQ-080 | Visual guidance: clear icons, markers, short routes | CANONICAL REQUIREMENT | Map/world composition and interaction implementation | BATCH-004 |
| REQ-081 | Map optimized for mobile performance (avoid excessive objects, heavy animations) | CANONICAL REQUIREMENT | Map/world composition and interaction implementation | BATCH-004 |
| REQ-082 | Map is 2D top-down view | CANONICAL REQUIREMENT | Project scaffold/architecture/schema implementation evidence | BATCH-001/BATCH-002 |
| REQ-083 | Company base building (upgrade interface and management access) | CANONICAL REQUIREMENT | Map/world composition and interaction implementation | BATCH-004 |
| REQ-084 | Residential buildings (customer homes / delivery destinations) | CANONICAL REQUIREMENT | Map/world composition and interaction implementation | BATCH-004 |
| REQ-085 | Commercial buildings (restaurants / shops / small businesses — order generation sources) | CANONICAL REQUIREMENT | Map/world composition and interaction implementation | BATCH-004 |
| REQ-086 | Pickup points (storage / package collection locations) | CANONICAL REQUIREMENT | Map/world composition and interaction implementation | BATCH-004 |
| REQ-087 | Buildings support interaction (tap to see name, available action) | CANONICAL REQUIREMENT | HUD/input/notification implementation evidence | BATCH-010 |
| REQ-088 | Main menu scene: Start Game, Settings, Information | CANONICAL REQUIREMENT | Project scaffold/architecture/schema implementation evidence | BATCH-001/BATCH-002 |
| REQ-089 | Company Management scene: company info, upgrades, economy overview | CANONICAL REQUIREMENT | Project scaffold/architecture/schema implementation evidence | BATCH-001/BATCH-002 |
| REQ-090 | GameWorld HUD displays: current money, active order, delivery status | CANONICAL REQUIREMENT | HUD/input/notification implementation evidence | BATCH-010 |
| REQ-091 | Company status always visible: Money, Level, Reputation | CANONICAL REQUIREMENT | HUD/input/notification implementation evidence | BATCH-010 |
| REQ-092 | Active order display: pickup location, destination, reward | CANONICAL REQUIREMENT | HUD/input/notification implementation evidence | BATCH-010 |
| REQ-093 | Screen layout: Money/Level (top), Game Map (center), Order Information / Action Buttons (bottom) | CANONICAL REQUIREMENT | HUD/input/notification implementation evidence | BATCH-010 |
| REQ-094 | Available upgrades display in CompanyManagement | CANONICAL REQUIREMENT | Batch-plan acceptance evidence | BATCH-015 |
| REQ-095 | Interface remains simple — no complex menus | CANONICAL REQUIREMENT | Batch-plan acceptance evidence | BATCH-015 |
| REQ-096 | UI works on mobile screens (different screen sizes, large touch targets, readable text) | CANONICAL REQUIREMENT | Release checklist verification evidence | BATCH-016 |
| REQ-097 | HUD layer separate from game world layer | CANONICAL REQUIREMENT | HUD/input/notification implementation evidence | BATCH-010 |
| REQ-098 | HUD renders over game world (always visible during gameplay) | CANONICAL REQUIREMENT | HUD/input/notification implementation evidence | BATCH-010 |
| REQ-099 | HUD: Money value (critical information, always visible) | CANONICAL REQUIREMENT | HUD/input/notification implementation evidence | BATCH-010 |
| REQ-100 | HUD: Active order information (pickup, destination, reward) | CANONICAL REQUIREMENT | HUD/input/notification implementation evidence | BATCH-010 |
| REQ-101 | HUD: Delivery status / current objective indicator | CANONICAL REQUIREMENT | HUD/input/notification implementation evidence | BATCH-010 |
| REQ-102 | HUD: Accept Order button (shown when order is Available) | CANONICAL REQUIREMENT | HUD/input/notification implementation evidence | BATCH-010 |
| REQ-103 | HUD: Deliver button (shown when player is at destination with package) | CANONICAL REQUIREMENT | HUD/input/notification implementation evidence | BATCH-010 |
| REQ-104 | HUD: Upgrade/Management button (shown after payment, optional) | CANONICAL REQUIREMENT | HUD/input/notification implementation evidence | BATCH-010 |
| REQ-105 | Feedback on order accepted: "New delivery started" (or equivalent) | CANONICAL REQUIREMENT | HUD/input/notification implementation evidence | BATCH-010 |
| REQ-106 | Feedback on delivery completed: "Delivery successful +[amount] money" | CANONICAL REQUIREMENT | HUD/input/notification implementation evidence | BATCH-010 |
| REQ-107 | Feedback on upgrade purchased: "Company improved" (or equivalent) | CANONICAL REQUIREMENT | HUD/input/notification implementation evidence | BATCH-010 |
| REQ-108 | Feedback on delivery failed (failure consequence display) | CANONICAL REQUIREMENT | Batch-plan acceptance evidence | BATCH-015 |
| REQ-109 | Feedback on purchase failed (not enough money) | CANONICAL REQUIREMENT | Order/event lifecycle implementation evidence | BATCH-005/BATCH-009 |
| REQ-110 | MVP event list fired as game events: GameStarted, OrderCreated, OrderAccepted, PackagePickedUp, DeliveryCom... | CANONICAL REQUIREMENT | Order/event lifecycle implementation evidence | BATCH-005/BATCH-009 |
| REQ-111 | Local Save & Load required before Prototype v0.1 release | CANONICAL REQUIREMENT | Save/load implementation and validation checklist | BATCH-013 |
| REQ-112 | One local save slot per device | CANONICAL REQUIREMENT | Save/load implementation and validation checklist | BATCH-013 |
| REQ-113 | Required saved data: CompanyName, Money, Level, Reputation, PurchasedUpgradeLevels, TutorialStatus | CANONICAL REQUIREMENT | Save/load implementation and validation checklist | BATCH-013 |
| REQ-114 | Active order is NOT restored on load — cancelled and reset | CANONICAL REQUIREMENT | Save/load implementation and validation checklist | BATCH-013 |
| REQ-115 | WorldData NOT persisted — regenerated on load | CANONICAL REQUIREMENT | Save/load implementation and validation checklist | BATCH-013 |
| REQ-116 | Autosave after: delivery completion, upgrade purchase, progression state change, tutorial step completion | CANONICAL REQUIREMENT | Save/load implementation and validation checklist | BATCH-013 |
| REQ-117 | No manual save UI required for Prototype v0.1 | CANONICAL REQUIREMENT | Save/load implementation and validation checklist | BATCH-013 |
| REQ-118 | Continue Game: loads valid save automatically | CANONICAL REQUIREMENT | Save/load implementation and validation checklist | BATCH-013 |
| REQ-119 | Start New Game: creates new data only when no valid save exists OR player explicitly confirms | CANONICAL REQUIREMENT | Save/load implementation and validation checklist | BATCH-013 |
| REQ-120 | New game must never silently overwrite a valid save | CANONICAL REQUIREMENT | Save/load implementation and validation checklist | BATCH-013 |
| REQ-121 | Save data must include save format version field | CANONICAL REQUIREMENT | Save/load implementation and validation checklist | BATCH-013 |
| REQ-122 | On load, validate required fields before using them (money ≥ 0, level > 0, etc.) | CANONICAL REQUIREMENT | Save/load implementation and validation checklist | BATCH-013 |
| REQ-123 | If no save file exists, start new game without notification | CANONICAL REQUIREMENT | Save/load implementation and validation checklist | BATCH-013 |
| REQ-124 | If save file exists but is unreadable/invalid, inform player that progress cannot be restored | CANONICAL REQUIREMENT | Save/load implementation and validation checklist | BATCH-013 |
| REQ-125 | Require player confirmation before replacing corrupted save with new game | CANONICAL REQUIREMENT | Save/load implementation and validation checklist | BATCH-013 |
| REQ-126 | Use GDevelop local storage APIs — no external backend | CANONICAL REQUIREMENT | Save/load implementation and validation checklist | BATCH-013 |
| REQ-127 | Player position persisted only if required for chosen prototype flow | CANONICAL REQUIREMENT | Save/load implementation and validation checklist | BATCH-013 |
| REQ-128 | SAFE system governs development safety (documentation first, modular changes, MVP protection) | CANONICAL REQUIREMENT | Governance compliance verification evidence | BATCH-016 |
| REQ-129 | SAFE system is distinct from SAVE system — they have separate responsibilities | CANONICAL REQUIREMENT | Governance compliance verification evidence | BATCH-016 |
| REQ-130 | Implementation must not change canonical documents without going through proper change process | CANONICAL REQUIREMENT | Governance compliance verification evidence | BATCH-016 |
| REQ-131 | No major system added until current milestone is functional | CANONICAL REQUIREMENT | Governance compliance verification evidence | BATCH-016 |
| REQ-132 | Basic order generation — game generates simple delivery requests | CANONICAL REQUIREMENT | Batch-plan acceptance evidence | BATCH-015 |
| REQ-133 | Simple customer behavior — customers generate orders | CANONICAL REQUIREMENT | Batch-plan acceptance evidence | BATCH-015 |
| REQ-134 | No advanced AI automation, route optimization, recommendation systems, or fleet management | CANONICAL REQUIREMENT | Batch-plan acceptance evidence | BATCH-015 |
| REQ-135 | Single courier (player) performs all deliveries personally in Prototype v0.1 | CANONICAL REQUIREMENT | Economy/progression implementation evidence | BATCH-009/BATCH-012 |
| REQ-136 | One active order at a time | CANONICAL REQUIREMENT | Economy/progression implementation evidence | BATCH-009/BATCH-012 |
| REQ-137 | No route planning, fleet management, or employee assignment | CANONICAL REQUIREMENT | Batch-plan acceptance evidence | BATCH-015 |
| REQ-138 | Income source: completed deliveries only (Prototype v0.1) | CANONICAL REQUIREMENT | Economy/progression implementation evidence | BATCH-009/BATCH-012 |
| REQ-139 | Expenses: upgrade costs and Bicycle purchase cost | CANONICAL REQUIREMENT | Economy/progression implementation evidence | BATCH-009/BATCH-012 |
| REQ-140 | No salary, maintenance, fuel, or infrastructure costs in Prototype v0.1 | CANONICAL REQUIREMENT | Batch-plan acceptance evidence | BATCH-015 |
| REQ-141 | Money is the only financial resource in Prototype v0.1 | CANONICAL REQUIREMENT | Economy/progression implementation evidence | BATCH-009/BATCH-012 |
| REQ-142 | Systems communicate through events, not direct cross-system control | CANONICAL REQUIREMENT | Order/event lifecycle implementation evidence | BATCH-005/BATCH-009 |
| REQ-143 | Event naming: clear descriptive names (OrderAccepted, DeliveryCompleted, etc.) | CANONICAL REQUIREMENT | Order/event lifecycle implementation evidence | BATCH-005/BATCH-009 |
| REQ-144 | UI receives delivery information and displays feedback | CANONICAL REQUIREMENT | Order/event lifecycle implementation evidence | BATCH-005/BATCH-009 |
| REQ-145 | MainMenu scene | CANONICAL REQUIREMENT | Project scaffold/architecture/schema implementation evidence | BATCH-001/BATCH-002 |
| REQ-146 | GameWorld scene (main gameplay scene) | CANONICAL REQUIREMENT | Project scaffold/architecture/schema implementation evidence | BATCH-001/BATCH-002 |
| REQ-147 | CompanyManagement scene | CANONICAL REQUIREMENT | Project scaffold/architecture/schema implementation evidence | BATCH-001/BATCH-002 |
| REQ-148 | Scene transition: GameWorld → CompanyManagement on Upgrade button | CANONICAL REQUIREMENT | Batch-plan acceptance evidence | BATCH-015 |
| REQ-149 | GlobalVariable CompanyData structure: CompanyName, Money, Level, Experience, Reputation, UpgradeList | CANONICAL REQUIREMENT | Project scaffold/architecture/schema implementation evidence | BATCH-001/BATCH-002 |
| REQ-150 | GlobalVariable GameSettings structure: Language, Sound, Music, Difficulty, TutorialStatus | CANONICAL REQUIREMENT | Project scaffold/architecture/schema implementation evidence | BATCH-001/BATCH-002 |
| REQ-151 | GlobalVariable SaveFormatVersion | CANONICAL REQUIREMENT | Save/load implementation and validation checklist | BATCH-013 |
| REQ-152 | Player object variable: CarryingPackage (boolean) | CANONICAL REQUIREMENT | Project scaffold/architecture/schema implementation evidence | BATCH-001/BATCH-002 |
| REQ-153 | Player object variable: MovementSpeed (number) | CANONICAL REQUIREMENT | Project scaffold/architecture/schema implementation evidence | BATCH-001/BATCH-002 |
| REQ-154 | PlayerData structure | CANONICAL REQUIREMENT | Project scaffold/architecture/schema implementation evidence | BATCH-001/BATCH-002 |
| REQ-155 | CompanyData structure | CANONICAL REQUIREMENT | Project scaffold/architecture/schema implementation evidence | BATCH-001/BATCH-002 |
| REQ-156 | OrderData structure | CANONICAL REQUIREMENT | Project scaffold/architecture/schema implementation evidence | BATCH-001/BATCH-002 |
| REQ-157 | WorldData structure | CANONICAL REQUIREMENT | Project scaffold/architecture/schema implementation evidence | BATCH-001/BATCH-002 |
| REQ-158 | Upgrade structure: Name, Cost, Level, Effect | CANONICAL REQUIREMENT | Project scaffold/architecture/schema implementation evidence | BATCH-001/BATCH-002 |
| REQ-159 | GameSettings structure | CANONICAL REQUIREMENT | Project scaffold/architecture/schema implementation evidence | BATCH-001/BATCH-002 |
| REQ-160 | Variable naming convention: CompanyMoney, CurrentOrder, DeliveryReward (not Value1, Data2) | CANONICAL REQUIREMENT | Project scaffold/architecture/schema implementation evidence | BATCH-001/BATCH-002 |
| REQ-161 | Persisted: CompanyData (Name, Money, Level, Reputation, UpgradeList) | CANONICAL REQUIREMENT | Save/load implementation and validation checklist | BATCH-013 |
| REQ-162 | Persisted: TutorialStatus | CANONICAL REQUIREMENT | Save/load implementation and validation checklist | BATCH-013 |
| REQ-163 | NOT persisted: ActiveOrder (cancelled and reset on load) | CANONICAL REQUIREMENT | Save/load implementation and validation checklist | BATCH-013 |
| REQ-164 | NOT persisted: WorldData (regenerated on load) | CANONICAL REQUIREMENT | Save/load implementation and validation checklist | BATCH-013 |
| REQ-165 | Save format version field in every save | CANONICAL REQUIREMENT | Save/load implementation and validation checklist | BATCH-013 |
| REQ-166 | Player character: idle image, movement image | CANONICAL REQUIREMENT | Placeholder asset import/naming verification | BATCH-003 |
| REQ-167 | Building sprites: company building, residential, commercial | CANONICAL REQUIREMENT | Placeholder asset import/naming verification | BATCH-003 |
| REQ-168 | Delivery point icon/marker | CANONICAL REQUIREMENT | Map/world composition and interaction implementation | BATCH-004 |
| REQ-169 | Package sprite | CANONICAL REQUIREMENT | Project scaffold/architecture/schema implementation evidence | BATCH-001/BATCH-002 |
| REQ-170 | Money/HUD icon | CANONICAL REQUIREMENT | Placeholder asset import/naming verification | BATCH-003 |
| REQ-171 | Bicycle sprite | CANONICAL REQUIREMENT | Placeholder asset import/naming verification | BATCH-003 |
| REQ-172 | Road/environment tiles for map | CANONICAL REQUIREMENT | Map/world composition and interaction implementation | BATCH-004 |
| REQ-173 | Asset physical folders: Assets/Sprites, Assets/Audio, Assets/UI | CANONICAL REQUIREMENT | Placeholder asset import/naming verification | BATCH-003 |
| REQ-174 | Placeholder graphics are acceptable during Prototype v0.1 development | CANONICAL REQUIREMENT | Placeholder asset import/naming verification | BATCH-003 |
| REQ-175 | Placeholder assets must be replaceable without changing gameplay logic | CANONICAL REQUIREMENT | Placeholder asset import/naming verification | BATCH-003 |
| REQ-176 | Placeholder shapes/colors may represent: player (distinct color), buildings (distinct shapes), roads (gray)... | CANONICAL REQUIREMENT | Placeholder asset import/naming verification | BATCH-003 |
| REQ-177 | Asset naming: object-type_function_version (e.g., vehicle_bicycle_basic) | CANONICAL REQUIREMENT | Placeholder asset import/naming verification | BATCH-003 |
| REQ-178 | Gameplay testing: complete delivery loop works without interruption | CANONICAL REQUIREMENT | Integration/mobile test evidence | BATCH-014/BATCH-015 |
| REQ-179 | Order system testing: orders created, accepted, status changes correctly | CANONICAL REQUIREMENT | Integration/mobile test evidence | BATCH-014/BATCH-015 |
| REQ-180 | Delivery system testing: pickup works, delivery works, completion detected | CANONICAL REQUIREMENT | Integration/mobile test evidence | BATCH-014/BATCH-015 |
| REQ-181 | Economy system testing: rewards added, costs removed, money updates | CANONICAL REQUIREMENT | Integration/mobile test evidence | BATCH-014/BATCH-015 |
| REQ-182 | All persistence test cases from SAVE_SYSTEM.md and PROTOTYPE_TESTING_PLAN.md pass | CANONICAL REQUIREMENT | Integration/mobile test evidence | BATCH-014/BATCH-015 |
| REQ-183 | Mobile testing: buttons easy to press, text readable, controls natural, performance acceptable | CANONICAL REQUIREMENT | Integration/mobile test evidence | BATCH-014/BATCH-015 |
| REQ-184 | No critical bugs remain before release | CANONICAL REQUIREMENT | Integration/mobile test evidence | BATCH-014/BATCH-015 |
| REQ-185 | Completion gate is owned exclusively by PROTOTYPE_RELEASE_CHECKLIST.md | CANONICAL REQUIREMENT | Release checklist verification evidence | BATCH-016 |
| REQ-186 | All 7 release checklist sections must be verified: Project Stability, Core Gameplay, UI, Mobile Experience,... | CANONICAL REQUIREMENT | Release checklist verification evidence | BATCH-016 |
| REQ-187 | Human approval required before Prototype v0.1 is declared complete | CANONICAL REQUIREMENT | Release checklist verification evidence | BATCH-016 |
| REQ-188 | No release checklist item may be marked complete during implementation preparation | CANONICAL REQUIREMENT | Governance compliance verification evidence | BATCH-016 |

## Authorized Implementation-Detail Mappings

| Implementation Detail ID | Detail | Authority Type | Planned Artifact | Batch |
|---|---|---|---|---|
| IDR-008 | MainMenu→GameWorld transition implementation pattern | AUTHORIZED IMPLEMENTATION DETAIL | Scene transition events in MainMenu | BATCH-010b |
| IDR-009 | CompanyManagement→GameWorld return transition pattern | AUTHORIZED IMPLEMENTATION DETAIL | Back/return transition in CompanyManagement | BATCH-011 |
| IDR-010 | Scene-variable ownership for PlayerData/ActiveOrder/WorldData | AUTHORIZED IMPLEMENTATION DETAIL | GameWorld scene-variable setup | BATCH-004/BATCH-005 |
| IDR-011 | UI layer partition names and ordering | AUTHORIZED IMPLEMENTATION DETAIL | Scene layer configuration | BATCH-010 |

---

End of Document
