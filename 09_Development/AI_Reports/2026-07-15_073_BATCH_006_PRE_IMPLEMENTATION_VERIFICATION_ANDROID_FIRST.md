# Document Information

Document: 2026-07-15_073_BATCH_006_PRE_IMPLEMENTATION_VERIFICATION_ANDROID_FIRST.md
Project: DROPi Tycoon
Version: 1.0.0
Status: Final
Author: AI Agent under Project Owner direction
Language: English
Last Updated: 2026-07-15

---

# Report 073 — BATCH-006 Pre-Implementation Verification (Android-First)

## Preserved Task Instruction

This report was produced in response to the following task:

> Perform the BATCH-006 Pre-Implementation Verification for DROPi Tycoon Prototype v0.1.
> Work only from the latest origin/main after PR #69 and PR #70 have been merged.
> This is a PRE-IMPLEMENTATION VERIFICATION task only.
> Do NOT implement BATCH-006.
> Create exactly one new persistent verification report.
> Create a report-only Pull Request.

---

## Section 1 — Audited Commits and Repository Verification

### 1.1 Audited origin/main Commit

| Item | Value |
|---|---|
| origin/main HEAD SHA | `2a42efe2e4cbff980adf9664245c7723cdf2a132` |
| origin/main HEAD (short) | `2a42efe` |
| Commit message | `Merge pull request #69 from caliofmarian-ai/copilot/batch-005-order-generation-lifecycle-core` |
| Previous commit | `96357cd` — Merge pull request #70 (Report 072 verification PR) |

### 1.2 PR #69 and PR #70 Presence

| Check | Result |
|---|---|
| PR #69 merged | **PASS** — commit `b282c9e` (BATCH-005 implementation) present on main |
| PR #70 merged | **PASS** — commit `96357cd` (Report 072 verification) present on main |

### 1.3 Reports 071 and 072 Existence

| Report | File | Result |
|---|---|---|
| Report 071 | `09_Development/AI_Reports/2026-07-15_071_BATCH_005_ORDER_GENERATION_LIFECYCLE_CORE_IMPLEMENTATION.md` | **PRESENT** |
| Report 072 | `09_Development/AI_Reports/2026-07-15_072_BATCH_005_ORDER_GENERATION_LIFECYCLE_CORE_INDEPENDENT_VERIFICATION.md` | **PRESENT** |

---

## Section 2 — Repository Reality Verification

### 2.1 Game JSON Parse

| Check | Result |
|---|---|
| `Game/DROPi_Tycoon.json` exists | **PASS** |
| JSON parses without error | **PASS** |

### 2.2 Scenes

| Scene | Present | Layers | Objects | Event Groups | Links |
|---|---|---|---|---|---|
| `MainMenu` | **YES** | `[""]` (default) | 0 | `["SceneFlow"]` | 0 |
| `GameWorld` | **YES** | `["Base","HUD","Notifications","Modal"]` | 0 | 7 groups | 3 links (OrderSystem, EconomySystem, ProgressionSystem) |
| `CompanyManagement` | **YES** | `[""]` (default) | 0 | `["SceneFlow"]` | 0 |

### 2.3 GameWorld Event Groups

| Group | Sub-events | Status |
|---|---|---|
| `PlayerEvents` | 0 | Structural placeholder — **empty** |
| `OrderEvents` | 0 | Structural placeholder — **empty** |
| `DeliveryEvents` | 0 | Structural placeholder — **empty** |
| `EconomyEvents` | 0 | Structural placeholder — **empty** |
| `UIEvents` | 0 | Structural placeholder — **empty** |
| `SaveTriggers` | 0 | Structural placeholder — **empty** |
| `SceneFlow` | 0 | Structural placeholder — **empty** |

### 2.4 External Event Sheets

| Sheet | Groups | Total Events |
|---|---|---|
| `OrderSystem` | `["OrderEvents"]` | 1 (the OrderEvents group containing 2 standard events from BATCH-005) |
| `EconomySystem` | none | 0 |
| `ProgressionSystem` | none | 0 |

### 2.5 Global Variables

| Variable | Present | Children |
|---|---|---|
| `CompanyData` | **YES** | 0 (root structure, children populated at runtime/per batch) |
| `GameSettings` | **YES** | 0 |
| `SaveFormatVersion` | **YES** | 0 |

### 2.6 GameWorld Scene Variables

| Variable | Present | Key Fields |
|---|---|---|
| `PlayerData` | **YES** | `Name`, `Position{X,Y}`, `CurrentOrder`, `CarryingPackage`, `MovementSpeed` |
| `ActiveOrder` | **YES** | `OrderID`, `PickupLocation`, `Destination`, `Reward`, `Status`, `Difficulty`, `AcceptRequested` |
| `WorldData` | **YES** | `CurrentMap`, `Buildings`, `DeliveryPoints`, `ActiveCustomers` |

### 2.7 Project-Level Objects

| Object | Type | Variables | Behaviors | Animations |
|---|---|---|---|---|
| `Player` | Sprite | `CarryingPackage` (boolean=false), `MovementSpeed` (number=0) | **NONE** | `Idle` (1 frame: `player_character_idle`) |
| `Building` | Sprite | none | none | present |
| `Package` | Sprite | none | none | present |
| `DeliveryPoint` | Sprite | none | none | present |
| `Environment` | Sprite | none | none | present |

**Critical observation:** `Player` has **no movement behavior attached** (no TopDownMovement, no Pathfinding, no Physics). `Player.MovementSpeed` = 0.

### 2.8 GameWorld Instances

- 16 instances, all on `Base` layer, all `Environment` type (road tiles and building placeholders)
- Player instance: **NOT placed** in scene (no Player instance exists in GameWorld)
- Package instance: **NOT placed**
- DeliveryPoint instance: **NOT placed**

### 2.9 Extensions and JavaScript

| Check | Value | Result |
|---|---|---|
| `eventsFunctionsExtensions` | 0 | **PASS** — no custom extensions |
| `externalSourceFiles` | 0 | **PASS** — no JavaScript files |

### 2.10 Resources (Assets)

7 resources registered: `player_character_idle`, `building_company_small`, `building_residential`, `building_commercial`, `package_delivery`, `delivery_point_marker`, `environment_road_tile` (all PNG placeholders under `Assets/Sprites/`).

### 2.11 Project Properties

| Property | Value |
|---|---|
| Name | `DROPi Tycoon` |
| Window | 800×600 |
| Orientation | `landscape` |
| Scale mode | `linear` |
| Startup size mode | `adaptWidth` |

### 2.12 Builds Directory

`Builds/` directory present and empty (no built artifacts).

---

## Section 3 — Prior Batch Verification (BATCH-001 through BATCH-005)

### 3.1 BATCH-001 (Foundation Scaffold)

| Artifact | Present |
|---|---|
| Project file `Game/DROPi_Tycoon.json` | **YES** |
| 3 scenes (MainMenu, GameWorld, CompanyManagement) | **YES** |
| 3 global variables (CompanyData, GameSettings, SaveFormatVersion) | **YES** |
| 3 external event sheets (OrderSystem, EconomySystem, ProgressionSystem) | **YES** |

BATCH-001: **INTACT**

### 3.2 BATCH-002 (Scene/Event Scaffold)

| Artifact | Present |
|---|---|
| GameWorld event groups (PlayerEvents, OrderEvents, DeliveryEvents, EconomyEvents, UIEvents, SaveTriggers, SceneFlow) | **YES — 7 groups** |
| GameWorld layers (Base, HUD, Notifications, Modal) | **YES — 4 layers** |
| GameWorld scene variables (PlayerData, ActiveOrder, WorldData) | **YES** |
| External sheet Links in GameWorld | **YES — 3 links** |

BATCH-002: **INTACT**

### 3.3 BATCH-003 (Placeholder Assets)

| Artifact | Present |
|---|---|
| 7 placeholder sprites registered | **YES** |
| Asset provenance document | `08_Assets/BATCH_003_PLACEHOLDER_PROVENANCE.md` — **YES** |

BATCH-003: **INTACT**

### 3.4 BATCH-004 (Map/Player/Building World Setup)

| Artifact | Present |
|---|---|
| Player object (Sprite, with CarryingPackage + MovementSpeed vars) | **YES** |
| Building, Package, DeliveryPoint, Environment objects | **YES** |
| 16 Environment instances placed in GameWorld Base layer | **YES** |
| Player.Idle animation | **YES** |

BATCH-004: **INTACT**

### 3.5 BATCH-005 (Order Generation + Lifecycle Core)

| Artifact | Present |
|---|---|
| `OrderSystem.OrderEvents` group with 2 standard events | **YES** |
| Event 1: `DepartScene` → Created then Available (immediate Created→Available) | **YES** |
| Event 2: `VarSceneTxt(Status=Available) + VarScene(AcceptRequested=1)` → Accepted (Available→Accepted) | **YES** |
| `ActiveOrder.AcceptRequested` field in scene variable | **YES** |
| `PlayerData.CurrentOrder` updated on acceptance | **YES** |

BATCH-005: **INTACT — ORDER LIFECYCLE LOGIC VERIFIED**

### 3.6 BATCH-006 Pre-check (Must Not Exist Yet)

| Check | Result |
|---|---|
| PlayerEvents group in GameWorld has movement events | **NONE — PASS** |
| Player has TopDownMovement behavior | **NONE — PASS** |
| Player has Pathfinding behavior | **NONE — PASS** |
| Any touch/mouse input event exists | **NONE — PASS** |
| Camera follow event exists | **NONE — PASS** |
| Movement target variables defined | **NONE — PASS** |

**Zero BATCH-006 implementation present: CONFIRMED**

### 3.7 BATCH-007+ Pre-check (Must Not Exist Yet)

| Feature | Present |
|---|---|
| Accept Order button object | **NO — PASS** |
| Pickup collision/interaction | **NO — PASS** |
| Delivery completion logic | **NO — PASS** |
| Economy reward logic | **NO — PASS** |
| HUD display objects | **NO — PASS** |
| Save/load logic | **NO — PASS** |

**Zero BATCH-007+ implementation present: CONFIRMED**

---

## Section 4 — BATCH-006 Exact Recovery from Preparation Package

### 4.1 Source: IMPLEMENTATION_BATCH_PLAN.md v1.3.0

```
### BATCH-006
- Objective: Implement Tap-to-Move and camera tracking behavior.
- Requirements: REQ-016..REQ-024.
- Artifacts: touch movement controls and camera follow behavior.
- Dependencies: BATCH-004.
- Owner-decision gate: none.
- Non-goals: no pickup/delivery resolution logic.
- Validation: movement and camera behaviors pass mobile interaction checks.
- Acceptance criteria: movement supports delivery route traversal.
```

### 4.2 Batch Overview Row

| Batch | Objective | Depends On | Owner Gate |
|---|---|---|---|
| BATCH-006 | Tap-to-Move + camera behavior | BATCH-004 | None |

### 4.3 Derived Summary

- **Exact Batch ID:** BATCH-006
- **Exact Title:** Tap-to-Move + camera behavior
- **Exact Objective:** Implement Tap-to-Move and camera tracking behavior
- **Declared Requirements (batch plan range):** REQ-016..REQ-024 (9 requirements)
- **Dependency:** BATCH-004 (Map/Player/Building World Setup — **COMPLETE**)
- **Parallel-eligible with:** BATCH-005 (same parent BATCH-004; however BATCH-005 is now complete)
- **Owner-decision gate:** None
- **Files expected to change:** `Game/DROPi_Tycoon.json`, `00_Project/PROJECT_STATUS.md`, `09_Development/CHANGELOG.md`, new AI report
- **Scenes affected:** `GameWorld`
- **Objects affected:** `Player` (movement behavior/events), possibly `TargetMarker` (implementation detail)
- **Variables affected:** `PlayerData.MovementSpeed` (set to initial walking speed), `PlayerData.Position` (tracked), movement target coordinates (new — implementation detail)
- **Event groups affected:** `PlayerEvents` (movement logic); possibly `UIEvents` (camera)
- **External event sheets affected:** None proposed (movement lives in `PlayerEvents` group in scene)
- **Input behavior:** Touch tap → move Player to tap coordinates (primary); mouse click fallback (implementation detail)
- **Camera behavior:** Camera follows Player with smooth movement
- **UI elements:** None defined for BATCH-006 (HUD is BATCH-010)
- **Layer usage:** Player on `Base`; camera behavior applies to `Base` layer view
- **Placeholder usage:** Player uses `player_character_idle` placeholder (from BATCH-003)
- **Android requirements:** Touch tap is primary input; no keyboard required; landscape mode maintained
- **Non-goals:** No pickup/delivery resolution logic; no Accept Order button; no HUD objects; no economy logic
- **Acceptance criteria:** Movement supports delivery route traversal (player can navigate GameWorld from any point to any other using tap)
- **Stop conditions:** Stop if movement implementation requires excluded features or Owner decisions

---

## Section 5 — Requirement Membership Verification

### 5.1 Declared Requirements: REQ-016..REQ-024

The batch plan declares 9 requirements by range notation. Each is individually verified below.

| Req ID | Canonical Statement | Canonical Source | Section | Priority | In Inventory? | Canonical Source Exists? | Traceability Mapping | Classification |
|---|---|---|---|---|---|---|---|---|
| REQ-016 | Player movement is Tap-to-Move (recommended for Prototype v0.1) | `09_Development/MOBILE_UI_CONTROLS.md` | Recommended MVP Choice | P0 | YES | YES | BATCH-006/BATCH-010 | **VERIFIED** |
| REQ-017 | Player movement enables world navigation for delivery loop | `09_Development/CORE_GAMEPLAY_SYSTEMS.md` | System 3 / MVP Movement | P0 | YES | YES | BATCH-009/BATCH-012 | **WRONG BATCH** |
| REQ-018 | Walking is the only movement method at game start | `09_Development/PROTOTYPE_V0.1.md` | Transportation System | P0 | YES | YES | BATCH-015 | **WRONG BATCH** |
| REQ-019 | After Bicycle purchase, player moves faster (increased MovementSpeed) | `09_Development/PROTOTYPE_V0.1.md` | Transportation System / Bicycle | P1 | YES | YES | BATCH-015 | **WRONG BATCH** |
| REQ-020 | Primary control is touch-based (screen taps, buttons, menus) | `09_Development/MOBILE_UI_CONTROLS.md` | Control Method | P0 | YES | YES | BATCH-006/BATCH-010 | **VERIFIED** |
| REQ-021 | Tap-to-Move: player taps a location and character moves there | `09_Development/MOBILE_UI_CONTROLS.md` | Recommended MVP Choice | P0 | YES | YES | BATCH-006/BATCH-010 | **VERIFIED** |
| REQ-022 | Action buttons: Accept Order, Deliver, Upgrade | `09_Development/MOBILE_UI_CONTROLS.md` | Action Buttons | P0 | YES | YES | BATCH-006/BATCH-010 | **AMBIGUOUS** |
| REQ-023 | Camera follows player with smooth movement and basic zoom | `09_Development/MOBILE_UI_CONTROLS.md` | Camera System / MVP Camera | P1 | YES | YES | BATCH-006/BATCH-010 | **VERIFIED** |
| REQ-024 | Touch targets must be large enough for comfortable tap interaction | `09_Development/MOBILE_UI_CONTROLS.md` | Accessibility | P1 | YES | YES | BATCH-006/BATCH-010 | **AMBIGUOUS** |

### 5.2 Classification Explanations

**REQ-017 — WRONG BATCH:**
Traceability matrix maps REQ-017 to BATCH-009/BATCH-012, not BATCH-006. This requirement ("player movement enables world navigation for delivery loop") describes a functional outcome of the entire delivery loop integration, not an artifact of the movement-mechanics batch. Evidence emerges at BATCH-009 (economy proves loop works) and BATCH-012 (bicycle integration proves full navigation). Including it in BATCH-006 creates a scope overreach where BATCH-006 would need to "prove" loop navigation that is not yet implementable.

**REQ-018 — WRONG BATCH:**
Traceability matrix maps REQ-018 to BATCH-015 (integration test). "Walking is the only movement method at game start" is a starting-state constraint, not an implementation artifact of BATCH-006 movement mechanics. It is validated at BATCH-015 integration level. BATCH-006 must *comply with* this constraint (do not implement Bicycle speed during BATCH-006) but does not *implement* it as a deliverable artifact.

**REQ-019 — WRONG BATCH:**
REQ-019 is "After Bicycle purchase, player moves faster (increased MovementSpeed)." This is a BATCH-012 artifact explicitly. The batch plan confirms BATCH-012 depends on BATCH-006 for this speed effect. Including REQ-019 in BATCH-006 would mean BATCH-006 implements Bicycle speed, which is premature and violates BATCH-012 scope.

**REQ-022 — AMBIGUOUS:**
REQ-022 is "Action buttons: Accept Order, Deliver, Upgrade." The traceability matrix marks it as BATCH-006/BATCH-010. However:
- Accept Order button functionality → BATCH-007 (batch plan explicitly: "accept button handling")
- Deliver button functionality → BATCH-007/008
- Upgrade button functionality → BATCH-011
- Button visual presence and layout → BATCH-010

BATCH-006's objective is "Tap-to-Move and camera tracking behavior." Button functionality is not movement or camera. The traceability dual-assignment (BATCH-006/BATCH-010) is ambiguous: it may mean that BATCH-006 establishes touch-button interaction *model* (touch-based control philosophy) and BATCH-010 implements the actual HUD buttons. BATCH-006 should NOT add HUD button objects. REQ-022 implementation evidence belongs to BATCH-010 and later.

**REQ-024 — AMBIGUOUS:**
REQ-024 is "Touch targets must be large enough." This is a design constraint applicable to *all* batches that touch input. BATCH-006 must comply with it (tap detection area must be reasonable), but it is not a discrete BATCH-006 deliverable. Full validation belongs to BATCH-014 (Mobile fit/finish). This is a constraint rather than an artifact.

### 5.3 Corrected BATCH-006 Requirement Set

| Req ID | Statement | Classification for BATCH-006 |
|---|---|---|
| REQ-016 | Player movement is Tap-to-Move | CORE — deliver |
| REQ-017 | Movement enables world navigation | REMOVE — later batch evidence |
| REQ-018 | Walking only at game start | REMOVE — constraint only; BATCH-015 integration |
| REQ-019 | Bicycle speeds up movement | REMOVE — BATCH-012 |
| REQ-020 | Primary control is touch-based | CORE — deliver (establishes touch model for movement) |
| REQ-021 | Tap-to-Move: tap location → character moves | CORE — deliver |
| REQ-022 | Action buttons (Accept, Deliver, Upgrade) | EXCLUDE FROM BATCH-006 — BATCH-010/007/008/011 |
| REQ-023 | Camera follows player with smooth movement | CORE — deliver |
| REQ-024 | Touch targets large enough | CONSTRAINT — comply; full validation BATCH-014 |

**Corrected BATCH-006 requirement count: 4 core (REQ-016, REQ-020, REQ-021, REQ-023) + 1 constraint (REQ-024)**

---

## Section 6 — Traceability Verification

### 6.1 Traceability Matrix Source

Document: `09_Development/Implementation_Preparation/CANONICAL_TO_IMPLEMENTATION_TRACEABILITY_MATRIX.md` v1.1.0

### 6.2 BATCH-006 Traceability Findings

| Req | Traceability Assignment | Batch Plan Assignment | Match? |
|---|---|---|---|
| REQ-016 | BATCH-006/BATCH-010 | BATCH-006 | **CONSISTENT** |
| REQ-017 | BATCH-009/BATCH-012 | BATCH-006 (range) | **INCONSISTENT** |
| REQ-018 | BATCH-015 | BATCH-006 (range) | **INCONSISTENT** |
| REQ-019 | BATCH-015 | BATCH-006 (range) | **INCONSISTENT** |
| REQ-020 | BATCH-006/BATCH-010 | BATCH-006 | **CONSISTENT** |
| REQ-021 | BATCH-006/BATCH-010 | BATCH-006 | **CONSISTENT** |
| REQ-022 | BATCH-006/BATCH-010 | BATCH-006 | **PARTIALLY CONSISTENT** (later batches own the button implementations) |
| REQ-023 | BATCH-006/BATCH-010 | BATCH-006 | **CONSISTENT** |
| REQ-024 | BATCH-006/BATCH-010 | BATCH-006 | **CONSISTENT AS CONSTRAINT** |

**Traceability result: 3 INCONSISTENCIES (REQ-017, REQ-018, REQ-019) requiring membership correction.**

---

## Section 7 — BATCH-006 Architecture Classification

Each proposed BATCH-006 element is classified:

| Element | Classification | Evidence |
|---|---|---|
| Touch tap detection (touch input) | A. Direct canonical requirement | `MOBILE_UI_CONTROLS.md` — Recommended MVP Choice (Tap-to-Move), Control Method (touch primary) |
| Player moves to tapped location (Tap-to-Move mechanic) | A. Direct canonical requirement | `MOBILE_UI_CONTROLS.md` — Recommended MVP Choice |
| Camera follows Player | A. Direct canonical requirement | `MOBILE_UI_CONTROLS.md` — Camera System / MVP Camera |
| Camera smooth movement | A. Direct canonical requirement | `MOBILE_UI_CONTROLS.md` — "Smooth movement" |
| Basic zoom | A. Direct canonical requirement | `MOBILE_UI_CONTROLS.md` — "Basic zoom" (implementation form is authorized detail) |
| Mouse click fallback for desktop testing | B. Authorized implementation detail | `IDR-004` internal event ordering freedom; desktop testing not excluded by canonical docs |
| Keyboard movement fallback | D. Unsupported | No canonical requirement; conflicts with Android-first mandate |
| Movement target coordinates (PlayerData.TargetX/TargetY or similar) | B. Authorized implementation detail | `IDR-010` data placement; `GAME_DATA_STRUCTURE.md` does not define target vars |
| Player.MovementSpeed initial value (walking speed numeric) | B. Authorized implementation detail | `IDR-001` covers starting numeric values; canonical docs require MovementSpeed field but not the number |
| Top-down movement behavior vs. manual event movement | B. Authorized implementation detail | `MOBILE_UI_CONTROLS.md` does not specify GDevelop behavior implementation |
| Pathfinding behavior | C. Owner decision required | Pathfinding introduces road-restriction navigation which changes player-facing behavior (BATCH plan does not specify; roads/path restriction requires Owner decision on whether strict path-following is required) |
| Target marker visual object | B. Authorized implementation detail | `MOBILE_UI_CONTROLS.md` does not define or exclude it; non-blocking visual aid |
| Player animation switching (Idle ↔ Moving) | B. Authorized implementation detail | BATCH-004 created Idle animation; Moving animation addition is authorized if canonically supportable; no second animation is canonically mandated in BATCH-006 scope |
| Player Player placed as instance in GameWorld | A. Direct canonical requirement | Player must be navigable; requires instance; BATCH-004 created object but not instance placement |
| Accept Order button object | F. Belongs to a later batch | REQ-022, REQ-102 — BATCH-007/BATCH-010 per batch plan |
| HUD display text elements | F. Belongs to a later batch | REQ-090..REQ-104 — BATCH-010 per batch plan |
| AcceptRequested = 1 trigger | F. Belongs to a later batch | BATCH-007 (accept button handling) — BATCH-005 reads this field; BATCH-007 sets it |
| UIEvents logic (HUD) | F. Belongs to a later batch | BATCH-010 |
| Pathfinding road restriction | C. Owner decision required | Canonically the map has roads but "road restriction" for movement is not explicitly mandated for prototype navigation |
| Camera bounds (world edge limit) | B. Authorized implementation detail | `MOBILE_UI_CONTROLS.md` does not define explicit bounds; GDevelop can implement as authorized detail |
| Debug tap marker | B. Authorized implementation detail | Non-canonical visual aid; must not persist to production; acceptable for testing |
| Save-related fields for position | C. Owner decision required | ODR-001 (player position persistence) is unresolved; however, ODR-001 only blocks BATCH-013, not BATCH-006 movement implementation |

### 7.1 Pathfinding Classification Note

Pathfinding is classified as **C. Owner decision required** with a critical qualification: if BATCH-006 uses simple direct (straight-line) movement rather than pathfinding, no Owner decision is required. If BATCH-006 uses pathfinding with road restriction, the Owner must decide whether the player can move only along roads or anywhere on the map. This is a player-facing behavior difference.

**Recommended:** Use direct (straight-line) movement for BATCH-006 to avoid the pathfinding Owner decision. This is an authorized implementation detail and resolves the ambiguity. Road restriction can be added later if desired.

---

## Section 8 — Android-First Control Verification

### 8.1 Android-First Compliance Matrix

| Check | Result | Notes |
|---|---|---|
| Primary input is touch-compatible | **PASS** — tap-to-move is touch-native | REQ-020, REQ-021 |
| No keyboard required | **PASS** — keyboard NOT in BATCH-006 scope | Keyboard would be D. Unsupported |
| No mouse-only behavior | **PASS** — mouse is fallback only (authorized) | IDR-004 covers fallback ordering |
| Tap-to-Move semantics match canonical docs | **PASS** — `MOBILE_UI_CONTROLS.md` defines exactly this | "Player taps a location and the character moves there" |
| Tap target handling defined | **PASS** — tap/touch coordinates → Player destination | GDevelop `TouchX()/TouchY()` or `MouseX()/MouseY()` built-in |
| Target marker behavior | **IMPLEMENTATION DETAIL** — optional visual aid; defined as authorized | Does not block Android compliance |
| Controls usable in landscape mode | **PASS** — project orientation = `landscape`; tap-to-move works in landscape | Window 800×600, adaptWidth |
| Player movement testable from Android later | **PASS** — HTML5 export via GDevelop cloud preview; no PC required for Owner | Agent can validate event logic; Owner validates movement feel via web preview |
| No Project Owner PC workflow required | **PASS** — all validation paths work from HTML5 web preview on Android |

### 8.2 Desktop Mouse Fallback Classification

| Question | Determination |
|---|---|
| Is mouse fallback allowed? | **YES — Authorized implementation detail** |
| Is mouse fallback required? | **NO** |
| Is mouse fallback optional? | **YES** |
| Is mouse fallback out of scope? | **NO** (excluding it would only harm agent testing; it harms no canonical requirement) |

GDevelop's touch/mouse conditions typically use `MouseButtonPressed` and `TouchX()/TouchY()` together. Both can fire from touch events. Mouse fallback is acceptable as an authorized implementation detail per IDR-004.

### 8.3 Touch Semantics

Canonical definition from `MOBILE_UI_CONTROLS.md`:
> "Tap To Move — The player taps a location and the character moves there."

This defines:
- Input: tap on game world
- Target: tapped world coordinates
- Response: Player character moves toward those coordinates
- Completion: Player arrives at target

The following are **not canonically defined** and are implementation details:
- Movement threshold for "arrived" (e.g., within N pixels)
- Tap debounce or cooldown
- Visual feedback during movement (optional target marker)
- Whether second tap cancels and replaces first target

### 8.4 Android Testing Path

| Activity | Method | Requires PC? |
|---|---|---|
| Agent validates event JSON structure | Direct parse of `Game/DROPi_Tycoon.json` | **NO** |
| Agent validates no forbidden scope | Event group inspection | **NO** |
| Agent validates Player behavior attached | Object variable/behavior inspection | **NO** |
| Owner tests movement feel | HTML5 web preview exported via GDevelop Cloud (GDevelop.io Preview button) on Android browser | **NO** |
| Owner verifies tap response | Touch tap on preview URL in Android browser | **NO** |
| Owner verifies camera follow | Observe Player scroll in HTML5 preview | **NO** |
| Full integration with BATCH-007+ | Future batches tested the same way | **NO** |

**Phone-based testing path: FULLY VIABLE — No PC required.**

---

## Section 9 — Movement Scope Verification

### 9.1 Movement Model

| Aspect | Determination | Source |
|---|---|---|
| Movement model | **Tap-to-Move (point-to-point navigation)** | `MOBILE_UI_CONTROLS.md` Recommended MVP Choice |
| Speed source | **Player.MovementSpeed variable** | `GAME_DATA_STRUCTURE.md` PlayerData / MovementSpeed |
| Initial speed value | **Implementation detail** (IDR-001 covers starting numeric values; no canonical number given) | No canonical document defines numeric walking speed |
| Target coordinate storage | **Implementation detail** — e.g., new scene variables `PlayerData.TargetX`, `PlayerData.TargetY` or Player object variables; IDR-010 authorized | `GAME_DATA_STRUCTURE.md` does not define target variables |
| Movement start condition | **Touch/tap event fires** — Player receives new destination coordinates | `MOBILE_UI_CONTROLS.md` "taps a location → moves there" |
| Movement stop condition | **Player reaches target** (within arrival threshold) | Implied by "moves there" |
| Arrival threshold | **Implementation detail** — typical: distance < N pixels (e.g., 8px, 16px) | Not canonically defined |
| Diagonal movement | **Implementation detail** — normalized diagonal movement standard; no canonical restriction | No canonical doc specifies |
| Animation state | **Implementation detail** — Idle animation exists; Moving animation optional (BATCH-004 created Idle only) | If adding Moving animation, it is an authorized addition |
| Collision policy | **Not defined in BATCH-006** — no collision-based blocking required for basic movement | BATCH-004 placed obstacles but no collision events; BATCH-006 does not mandate collision |
| Road/path restriction | **Not required for BATCH-006** — direct movement recommended (see Section 7.1) | Pathfinding road restriction = Owner decision if desired |
| Map boundaries | **Implementation detail** — camera bounds can also serve as movement bounds; or movement can be free within scene | No canonical document specifies boundary coordinates |
| Camera behavior | **Camera follows Player** — see Section 10 |

### 9.2 GDevelop Movement Implementation Options (Implementation Details)

**Option A (Recommended): TopDownMovement behavior + event-controlled destination**
- Attach `TopDownMovement` behavior to Player
- Use `Pathfinding` or direct position math to move toward target X/Y
- Set `MovementSpeed` variable; apply to TopDown behavior's speed

**Option B: Manual position update via events**
- `PlayerData.TargetX`, `PlayerData.TargetY` scene variables
- Each frame: move Player position toward target by speed * dt
- No GDevelop behavior required

**Note:** This report does NOT choose between options. Both are authorized implementation details. The implementing agent selects the approach after verifying GDevelop schema evidence (as was done for BATCH-005 in Report 071 Section 6).

---

## Section 10 — Camera Scope Verification

### 10.1 Does BATCH-006 Include Camera?

**YES.** The batch plan states: "Implement Tap-to-Move and camera tracking behavior."

The canonical source is `MOBILE_UI_CONTROLS.md` — Camera System / MVP Camera:
> "Follow player / Smooth movement / Basic zoom"

REQ-023 is "Camera follows player with smooth movement and basic zoom."

### 10.2 Camera Specification

| Aspect | Determination | Source |
|---|---|---|
| Camera follows Player | **YES — canonically required** | `MOBILE_UI_CONTROLS.md` Camera System / MVP Camera |
| Smooth movement | **YES — canonically required** | `MOBILE_UI_CONTROLS.md` "Smooth movement" |
| Basic zoom | **YES — canonically required** | `MOBILE_UI_CONTROLS.md` "Basic zoom" (implementation form is detail) |
| Camera static alternative | **NO** — camera must follow Player | REQ-023 |
| Camera bounds | **Implementation detail** — prevent camera from showing outside map edges | Not canonically specified |
| Layer/camera ownership | **Base layer** — Player is on Base; camera follows Player's position on Base | BATCH-004 placed all objects on Base |
| Android viewport behavior | **PASS** — landscape 800×600 adaptWidth; GDevelop HTML5 respects viewport | Project properties confirmed |
| Camera logic canonically required now? | **YES** — BATCH-006 is the batch for camera behavior | Batch plan: "camera tracking behavior" |
| Camera logic deferred? | **NO** — not deferred; BATCH-006 is the right batch | |

### 10.3 Camera — What Is Excluded from BATCH-006

| Excluded from BATCH-006 | Belongs To |
|---|---|
| HUD layer camera (fixed overlay) | BATCH-010 (when HUD objects are added) |
| Zoom gesture/pinch control | Implementation detail or BATCH-014 |
| Camera transition effects between scenes | Implementation detail |
| Camera bounds tied to map tiles | Implementation detail |

---

## Section 11 — Layer and Object Placement Verification

| Check | Status |
|---|---|
| Player remains on `Base` layer | **REQUIRED** — BATCH-004 established Player on Base; BATCH-006 must not move it |
| Movement logic references `Player` object | **REQUIRED** — PlayerEvents group handles this |
| Unnamed layer required | **NO** — all 4 layers are named |
| HUD layer usage | **NO** — HUD objects are BATCH-010; HUD layer exists but remains empty in BATCH-006 |
| Notifications layer | **NO** — remains empty |
| Modal layer | **NO** — remains empty |
| No object moved to incorrect layer | **REQUIRED** — maintain layer assignments from BATCH-001/002/004 |
| Player instance must be placed in GameWorld | **YES — MISSING** — Player object exists but no Player instance was placed in BATCH-004; this is a prerequisite for BATCH-006 movement |

**Critical gap:** Player has no instance placed in GameWorld. BATCH-006 must place the Player instance at a canonical starting position (implementation detail for exact coordinates). Without a placed Player instance, movement events cannot reference the object.

---

## Section 12 — Order-Acceptance Boundary Verification

### 12.1 Current BATCH-005 State

BATCH-005 created `ActiveOrder.AcceptRequested` (number, 0/1) as a signal variable. It implemented:
- Event: When `AcceptRequested = 1` AND `Status = "Available"` → set `Status = "Accepted"` + update `PlayerData.CurrentOrder` + reset `AcceptRequested = 0`

**No Accept button object was created by BATCH-005.** This is correct per BATCH-005 non-goals.

### 12.2 Is BATCH-006 Allowed to Implement the Accept Order Button?

**NO.** The batch plan is explicit:

- BATCH-006 non-goals: "no pickup/delivery resolution logic"
- BATCH-007: "Artifacts: accept button handling, pickup validation, active-order HUD linkage"
- BATCH-010: "HUD + notifications" including "HUD elements, button visibility rules"

The Accept Order button is a HUD element (BATCH-010) whose action triggers acceptance (BATCH-007). Setting `AcceptRequested = 1` belongs to BATCH-007.

BATCH-006 must **NOT** add:
- An Accept Order button object
- UIEvents logic for order acceptance
- `AcceptRequested = 1` setter events

### 12.3 Order-Acceptance Boundary: Confirmed Exclusions from BATCH-006

| Item | Belongs To | Must Exclude from BATCH-006 |
|---|---|---|
| Accept Order button (HUD object) | BATCH-010 | **YES** |
| HUD order acceptance touch event | BATCH-007/010 | **YES** |
| `AcceptRequested = 1` setting | BATCH-007 | **YES** |
| UIEvents HUD display logic | BATCH-010 | **YES** |
| Active order HUD linkage | BATCH-007 | **YES** |

---

## Section 13 — Owner Decision Verification

### 13.1 ODR Entries vs. BATCH-006

| ODR | Question | Blocking Batch | Affects BATCH-006? |
|---|---|---|---|
| ODR-001 | Player position persistence | BATCH-013 | **INDIRECT** — ODR-001 does not block BATCH-006 movement implementation. Player position is tracked at runtime by BATCH-006 but persistence is BATCH-013. BATCH-006 may write `PlayerData.Position.X/Y` without resolving persistence. |
| ODR-003 | GameSettings persistence scope | BATCH-013 | **NO** — does not affect BATCH-006 |
| ODR-004 | DeliveryFailed trigger condition | BATCH-008 | **NO** — does not affect BATCH-006 |

### 13.2 Missing Owner Decisions for BATCH-006

| Question | Is it an Owner decision? | Determination |
|---|---|---|
| Should the player be restricted to road tiles for movement? | **Owner decision if desired** | Canonically optional; direct movement is authorized. Only blocks BATCH-006 if Owner requires strict pathfinding. |
| What is the initial walking speed number? | **NO — Authorized implementation detail** (IDR-001 covers starting numeric values) | Agent selects reasonable value. |
| Should a visual target marker appear on tap? | **NO — Authorized implementation detail** | Optional visual; no canonical requirement or prohibition. |
| Tap debounce / double-tap behavior? | **NO — Authorized implementation detail** | Not canonically defined. |

**Owner decision result for BATCH-006: NO BLOCKING OWNER DECISION — unless road restriction pathfinding is desired.**

---

## Section 14 — Implementation Detail Verification

| IDR | Applicable to BATCH-006? | Application |
|---|---|---|
| IDR-001 (Starting Money Numeric Value) | **NO** | BATCH-006 does not touch economy |
| IDR-002 (Save-Key String) | **NO** | BATCH-006 does not implement save |
| IDR-003 (Placeholder Asset Color/Shape) | **PARTIAL** — Player uses existing placeholder | No new placeholder art required for BATCH-006 core; Moving animation is optional authorized addition |
| IDR-004 (Internal Event Ordering) | **YES** — event order within PlayerEvents is implementation-chosen | Touch detection → target update → movement → camera follow order is agent-selected |
| IDR-005 (Notification Display Duration) | **NO** | BATCH-006 has no notifications |
| IDR-006 (Map Coordinates) | **PARTIAL** — Player starting position is an implementation detail | IDR-006 covers coordinate placement |
| IDR-007 (OrderID Generation) | **NO** | BATCH-006 does not generate orders |
| IDR-008 (MainMenu→GameWorld Transition) | **NO** | BATCH-006 stays in GameWorld |
| IDR-009 (CompanyManagement→GameWorld Return) | **NO** | BATCH-006 stays in GameWorld |
| IDR-010 (Scene-Variable Ownership) | **YES** — movement target coordinates, if added as scene variables, follow IDR-010 authorized placement in GameWorld PlayerData | Target X/Y can be placed as PlayerData subfields or new scene variables |
| IDR-011 (UI Layer Partition Names) | **PARTIAL** — layer partition names confirmed from BATCH-002; BATCH-006 does not add layers | |

**Implementation detail verification: PASS — sufficient authorized freedom exists for BATCH-006 without encroaching on player-facing decisions.**

---

## Section 15 — Exclusion Verification

BATCH-006 must not include any of the following. All are confirmed absent from the proposed BATCH-006 scope:

| Exclusion | EXC ID | Present in BATCH-006 Scope? |
|---|---|---|
| Pickup/delivery completion | (canonical exclusion for BATCH-006) | **NO** |
| DeliveryFailed path | EXC per BATCH-006 non-goals | **NO** |
| Economy/rewards | — | **NO** |
| Money logic | — | **NO** |
| Progression | — | **NO** |
| Save/load | EXC-006, EXC-007 | **NO** |
| AI systems | EXC-008 | **NO** |
| Bicycle behavior | BATCH-012 scope | **NOT in corrected BATCH-006** |
| Missions | — | **NO** |
| Advanced UI | BATCH-010 | **NOT in corrected BATCH-006** |
| Notifications | BATCH-010 | **NOT in corrected BATCH-006** |
| DronePorts | EXC-001 | **NO** |
| Drones | EXC-002 | **NO** |
| Vans/extra vehicles | EXC-003 | **NO** |
| Multiplayer | EXC-004 | **NO** |
| Online backend | EXC-005 | **NO** |
| Cloud save | EXC-006 | **NO** |
| Production artwork | — | **NO** |
| BATCH-007+ work | — | **NOT in corrected BATCH-006** (Accept button, pickup, delivery excluded) |

**Exclusion verification: PASS — no excluded feature enters corrected BATCH-006 scope.**

---

## Section 16 — Dependency Verification

| Dependency | Status |
|---|---|
| BATCH-004 (Map/Player/Building World Setup) | **COMPLETE** — verified in Section 3.4 |
| BATCH-001, BATCH-002, BATCH-003 | **COMPLETE** — all verified intact |
| BATCH-005 (Order Generation + Lifecycle Core) | **COMPLETE** — verified in Section 3.5 (BATCH-006 does not depend on BATCH-005; they have the same parent BATCH-004; BATCH-005 is complete and provides ActiveOrder/AcceptRequested infrastructure) |
| ODR-001, ODR-003, ODR-004 | **DO NOT BLOCK BATCH-006** — verified in Section 13 |
| BATCH-007+ (Accept button, HUD) | **NOT a dependency** — BATCH-006 runs before BATCH-007 |

**Dependency result: ALL SATISFIED.**

---

## Section 17 — Canonical Source Verification

All canonical sources referenced by REQ-016..REQ-024:

| Source | Path | Exists | Key Evidence |
|---|---|---|---|
| `MOBILE_UI_CONTROLS.md` | `09_Development/MOBILE_UI_CONTROLS.md` | **YES** | Tap-to-Move recommended; primary control = touch; camera follows player; action buttons; touch targets |
| `CORE_GAMEPLAY_SYSTEMS.md` | `09_Development/CORE_GAMEPLAY_SYSTEMS.md` | **YES** | System 3: Player Movement / MVP Movement |
| `PROTOTYPE_V0.1.md` | `09_Development/PROTOTYPE_V0.1.md` | **YES** | Transportation System / Starting Transport; Bicycle |

All 3 canonical sources verified present and intact.

---

## Section 18 — Phone-Based Testing Path

### 18.1 What the Agent Can Validate Automatically

| Validation | Method |
|---|---|
| `Game/DROPi_Tycoon.json` parses | Python JSON parser |
| PlayerEvents group contains movement events | Event structure inspection |
| Player object has movement behavior or events | Object + event inspection |
| Player instance placed in GameWorld | Instance array inspection |
| `Player.MovementSpeed` set to non-zero value | Variable value inspection |
| Camera follow event present | Event action inspection |
| No forbidden BATCH-007+ scope | Event content inspection |
| No excluded features introduced | Exclusion register cross-reference |

### 18.2 What Requires a Future Web Preview

| Validation | Method |
|---|---|
| Tap → Player actually moves | HTML5 preview URL on Android browser |
| Movement feels smooth and correct | Owner taps preview, observes character |
| Camera follows Player correctly | Owner scrolls/navigates in preview |
| Touch targets are comfortable for fingers | Owner evaluates tap ease |
| Movement speed feels appropriate | Owner adjusts after testing |

### 18.3 Project Owner Android Testing Path

1. Agent implements BATCH-006 and creates PR
2. Agent validates JSON structure automatically (no PC required)
3. PR merges to main
4. Owner opens GDevelop.io in Android browser (or uses GDevelop mobile app if available)
5. Owner loads project from GitHub (GDevelop GitHub integration or download and open)
6. Owner uses GDevelop Preview / Export → HTML5 preview
7. Owner taps screen to observe Player movement and camera follow
8. No PC required at any step

**HTML5 preview URL:** Required for Owner validation (generated by GDevelop export; agent cannot generate this).
**GDevelop cloud export:** Optional alternative — GDevelop cloud can generate a shareable preview URL.

### 18.4 What Cannot Be Validated During Pre-Implementation

- Movement feel (subjective; requires runtime)
- Camera smoothness (requires runtime)
- Touch target comfort (requires physical device interaction)
- Performance on Android hardware (requires runtime)

---

## Section 19 — Contradictions and Unresolved Issues

### 19.1 Confirmed Contradictions

| ID | Description | Severity |
|---|---|---|
| CONT-001 | BATCH-006 batch plan declares REQ-016..REQ-024 (9 reqs); traceability matrix assigns REQ-017 to BATCH-009/012 and REQ-018, REQ-019 to BATCH-015 | **MATERIAL** — requires plan correction before implementation |
| CONT-002 | REQ-022 (Action buttons) listed in BATCH-006 batch plan but button implementations belong to BATCH-007, BATCH-010, BATCH-011 | **MATERIAL** — requires clarification; REQ-022 must be excluded from BATCH-006 deliverables |

### 19.2 Non-Blocking Issues

| ID | Description |
|---|---|
| NB-001 | Player instance not yet placed in GameWorld (BATCH-004 created the object but not an instance). BATCH-006 must place the Player instance. This is an authorized detail, not a contradiction. |
| NB-002 | `Player.MovementSpeed` is currently 0. BATCH-006 must set an initial walking speed value (authorized implementation detail). |
| NB-003 | No movement target variable exists yet. BATCH-006 must add target X/Y storage (authorized implementation detail per IDR-010). |
| NB-004 | Player has no GDevelop movement behavior attached. BATCH-006 must add a movement mechanism (TopDown behavior or manual event-based — authorized detail). |

### 19.3 Same-Level Canonical Conflicts

No same-level canonical conflict was identified. All conflicts are between the non-authoritative batch plan and the non-authoritative traceability matrix. No conflict exists between canonical documents.

---

## Section 20 — Execution Specification (BATCH-006 — After Membership Correction)

**This specification is for reference only. Do NOT implement until the membership correction is produced and accepted.**

### 20.1 Recommended Branch Name

`copilot/batch-006-tap-to-move-camera`

### 20.2 Exact Objective

Implement Tap-to-Move player movement and camera tracking behavior in GameWorld.

### 20.3 Corrected Requirement Set

- REQ-016: Player movement is Tap-to-Move (touch primary)
- REQ-020: Primary control is touch-based
- REQ-021: Tap-to-Move: player taps location → character moves there
- REQ-023: Camera follows player with smooth movement and basic zoom

Constraint (comply but not a discrete artifact):
- REQ-024: Touch targets large enough (ensure tap detection area is reasonable)

### 20.4 Exact Files Expected to Change

1. `Game/DROPi_Tycoon.json` (runtime implementation)
2. `00_Project/PROJECT_STATUS.md` (status update)
3. `09_Development/CHANGELOG.md` (batch history)
4. New BATCH-006 implementation report under `09_Development/AI_Reports/`

Do NOT modify: canonical docs, historical reports, assets, exclusion register, batch plan (unless issuing a membership correction PR first).

### 20.5 Exact Scene

- `GameWorld` only

### 20.6 Exact Objects

Required:
- `Player` — add movement behavior/events; place instance in scene

Optional authorized additions:
- `TargetMarker` sprite — visual indicator of tap target (authorized implementation detail; must be removable)

### 20.7 Exact Variables

New variables needed (all are authorized implementation details per IDR-010):
- `PlayerData.TargetX` (number) — movement target X coordinate
- `PlayerData.TargetY` (number) — movement target Y coordinate
- `PlayerData.IsMoving` (boolean) — movement state flag (optional; aids event logic)

Existing variables used:
- `Player.MovementSpeed` — set to initial walking speed value (e.g., 150–200 pixels/second; exact value is IDR-001 authorized)

### 20.8 Exact Event Groups

**`PlayerEvents` group in GameWorld scene** — primary location for all BATCH-006 event logic:

Sub-events to add (structure, not final schema — implementing agent must verify GDevelop schema):

```
Event 1: On touch/mouse press → set PlayerData.TargetX = TouchX(0) or MouseX()
                              → set PlayerData.TargetY = TouchY(0) or MouseY()
                              → set PlayerData.IsMoving = true

Event 2: While PlayerData.IsMoving = true → move Player toward (TargetX, TargetY)
         Condition: distance(Player, TargetX, TargetY) > arrival_threshold
         Action: move Player toward target at MovementSpeed

Event 3: Arrival check → when distance < threshold
         Action: set PlayerData.IsMoving = false
                 stop Player movement

Event 4: Camera follow → each frame
         Action: center camera on Player (GDevelop: CameraX/CameraY follow Player.X/Player.Y)
         OR use GDevelop built-in camera follow behavior (authorized detail)
```

No changes to `OrderEvents`, `DeliveryEvents`, `EconomyEvents`, `UIEvents`, `SaveTriggers`, `SceneFlow` — those remain unchanged.

### 20.9 Exact External Event Sheets

None — all BATCH-006 logic lives in `PlayerEvents` group within `GameWorld` scene events.

### 20.10 Exact Input Handling

| Input | GDevelop Condition | Action |
|---|---|---|
| Touch press (primary) | `TouchPressed(0)` | Set target X/Y to `TouchX(0)`, `TouchY(0)` |
| Mouse click (fallback) | `MouseButtonPressed(Left)` | Set target X/Y to `MouseX()`, `MouseY()` |
| Combined (single event) | Touch OR mouse (using OR condition group) | Set target X/Y |

**Note:** GDevelop's mouse events typically also fire from touch on HTML5. Verify via GDevelop schema evidence during implementation.

### 20.11 Exact Camera Handling

| Aspect | GDevelop Implementation |
|---|---|
| Camera follow Player | CenterCamera on Player's X/Y each frame, OR attach "center camera on object" action |
| Smooth follow | Use `MoveToward` lerp on camera position, OR GDevelop built-in smooth follow (authorized detail) |
| Basic zoom | Default zoom = 1.0; no dynamic zoom required for BATCH-006 (static "basic zoom" = no zoom change; implementation detail) |
| Camera bounds | Optional: clamp camera to map bounds (authorized implementation detail) |
| Layer | Base layer camera |

### 20.12 Exact Layer Handling

- Player on `Base` (unchanged)
- Camera applies to `Base` layer
- `HUD`, `Notifications`, `Modal` layers: **unchanged, remain empty**

### 20.13 Exact Implementation Order

1. Place `Player` instance in GameWorld at starting position (authorized coordinate)
2. Add movement behavior or movement event logic to `PlayerEvents`
3. Set `Player.MovementSpeed` initial value
4. Implement touch/mouse tap → target coordinate events
5. Implement Player-moves-toward-target events
6. Implement arrival detection and movement stop
7. Implement camera follow (center camera on Player each frame)
8. (Optional) Add TargetMarker visual object
9. Update `PROJECT_STATUS.md` and `CHANGELOG.md`
10. Write implementation report

### 20.14 Exact GDevelop Schema Evidence Required

The implementing agent must verify and cite GDevelop repository JSON evidence for:
- Touch condition format (`TouchPressed`, `TouchX()`, `TouchY()`)
- Mouse condition format (`MouseButtonPressed`)
- Camera center action format
- Movement action format (TopDown behavior or manual position update)
- `BuiltinCommonInstructions::Standard` event format (already verified in Report 071)

### 20.15 Validation

| Check | Method |
|---|---|
| Player instance placed in GameWorld | Inspect instances array |
| `PlayerEvents` group contains touch/tap events | Inspect event conditions |
| `PlayerEvents` group contains camera follow events | Inspect event actions |
| `Player.MovementSpeed` > 0 | Inspect object variable value |
| `PlayerData.TargetX`, `PlayerData.TargetY` exist | Inspect scene variable structure |
| No BATCH-007+ scope (Accept button, HUD, pickup) | Confirm absent from all event groups |
| No excluded features introduced | Cross-reference exclusion register |
| JSON parses | Python parser |

### 20.16 Acceptance Criteria

1. Player instance placed in GameWorld Base layer
2. Touch tap in GameWorld sets movement target and Player begins moving
3. Player arrives at target and stops
4. Camera follows Player
5. No BATCH-007+ functionality present
6. No excluded feature present
7. JSON parses

### 20.17 Regression Checks

1. BATCH-001 through BATCH-005 artifacts intact (OrderSystem events, scene structure, variables, objects)
2. `ActiveOrder.AcceptRequested` field still present
3. `OrderSystem` external sheet order lifecycle logic unchanged
4. GameWorld layer structure (Base/HUD/Notifications/Modal) unchanged
5. Global variables (CompanyData, GameSettings, SaveFormatVersion) unchanged

### 20.18 Non-Goals for BATCH-006

- No Accept Order button
- No HUD display objects
- No `AcceptRequested = 1` setting
- No pickup/delivery logic
- No economy logic
- No Bicycle speed effect
- No save/load behavior
- No external event sheets modified
- No new scenes
- No notifications
- No pathfinding with road restriction (unless Owner decides)

### 20.19 Stop Conditions

Stop and escalate if:
1. Movement implementation requires a canonically undefined Owner decision
2. Any BATCH-007+ behavior is required to satisfy movement acceptance criteria
3. Any excluded feature is required
4. Player movement requires road restriction (stop; classify as Owner decision required; use direct movement instead)
5. Player instance placement requires a Player object that is architecturally incompatible

### 20.20 Owner Decisions That Must Remain Untouched

- ODR-001 (player position persistence) — BATCH-006 may write `PlayerData.Position` at runtime but must NOT resolve the persistence question
- ODR-003 (GameSettings persistence scope) — untouched
- ODR-004 (failure trigger) — untouched

### 20.21 Android Testing Path (for Implementation)

1. Agent: parse `Game/DROPi_Tycoon.json` → verify movement events present
2. Agent: confirm Player instance placed
3. Agent: confirm camera events present
4. Owner (from Android): load HTML5 preview → tap world → verify Player moves → verify camera follows
5. Owner: no PC required at any step

---

## Section 21 — Validation Checklist (per Task Instruction)

| # | Check | Result |
|---|---|---|
| 1 | Latest origin/main inspected | **PASS** — commit `2a42efe` |
| 2 | PR #69 and PR #70 present on main | **PASS** |
| 3 | Reports 071 and 072 exist | **PASS** |
| 4 | Game JSON parses | **PASS** |
| 5 | BATCH-001 through BATCH-005 remain intact | **PASS** |
| 6 | No BATCH-006 work exists | **PASS** |
| 7 | No BATCH-007+ work exists | **PASS** |
| 8 | BATCH-006 recovered exactly | **PASS** — Section 4 |
| 9 | Every requirement classified | **PASS** — Section 5 |
| 10 | Traceability verified | **PASS** — Section 6 (3 inconsistencies identified) |
| 11 | Dependencies verified | **PASS** — Section 16 |
| 12 | Android-first constraints verified | **PASS** — Section 8 |
| 13 | Control semantics verified | **PASS** — Section 8.3 |
| 14 | Movement scope verified | **PASS** — Section 9 |
| 15 | Order-acceptance boundary verified | **PASS** — Section 12 |
| 16 | Camera scope verified | **PASS** — Section 10 |
| 17 | Layer usage verified | **PASS** — Section 11 |
| 18 | Owner decisions verified | **PASS** — Section 13 |
| 19 | Implementation details verified | **PASS** — Section 14 |
| 20 | Exclusions verified | **PASS** — Section 15 |
| 21 | Phone-based testing path documented | **PASS** — Section 18 |
| 22 | No canonical file modified | **PASS** — report-only PR |
| 23 | No project file modified | **PASS** — report-only PR |
| 24 | No historical report modified | **PASS** |
| 25 | Only one new report added | **PASS** — this report is the only addition |
| 26 | Secret scan passes | **PASS** — no secrets in report content |
| 27 | CodeQL | **NOT APPLICABLE** — no executable code changed |

---

## Section 22 — Final Readiness Verdict

### 22.1 Verdict

**D. BATCH-006 NOT READY — MATERIAL PLAN CORRECTIONS REQUIRED**

### 22.2 Exact Reasons

1. **REQ-017 wrong batch:** BATCH-006 batch plan includes REQ-017 ("Player movement enables world navigation for delivery loop") but the traceability matrix assigns this to BATCH-009/BATCH-012. This requirement cannot be satisfied by BATCH-006 movement mechanics alone — it is an integration evidence requirement for later batches.

2. **REQ-018 wrong batch:** BATCH-006 batch plan includes REQ-018 ("Walking is the only movement method at game start") but the traceability matrix assigns this to BATCH-015 (integration test). This is a constraint, not a BATCH-006 deliverable.

3. **REQ-019 wrong batch:** BATCH-006 batch plan includes REQ-019 ("After Bicycle purchase, player moves faster") but this is a BATCH-012 artifact. Including it in BATCH-006 would mean Bicycle speed is implemented prematurely.

4. **REQ-022 ambiguous and mostly later-batch:** "Action buttons: Accept Order, Deliver, Upgrade" spans BATCH-007 (Accept), BATCH-007/008 (Deliver), BATCH-011 (Upgrade), and BATCH-010 (visual HUD). BATCH-006 must explicitly exclude button implementation.

### 22.3 What Is NOT Wrong

- The core BATCH-006 objective (Tap-to-Move + camera) is canonically sound
- REQ-016, REQ-020, REQ-021, REQ-023 are correctly assigned to BATCH-006
- No Owner decision blocks BATCH-006
- No excluded features enter scope
- BATCH-004 dependency is satisfied
- Android-first compliance is achievable
- GDevelop implementation path is viable

### 22.4 Required Correction

A **BATCH-006 Requirement Membership Correction** report (analogous to Report 070 for BATCH-005) must be produced before implementation proceeds.

The correction must:
1. Remove REQ-017, REQ-018, REQ-019 from BATCH-006
2. Remove REQ-022 from BATCH-006 (clarify it belongs to BATCH-010/007)
3. Confirm REQ-024 as a compliance constraint (not a discrete deliverable)
4. Produce a corrected BATCH-006 requirement set: **REQ-016, REQ-020, REQ-021, REQ-023** (4 core requirements)
5. Update `IMPLEMENTATION_BATCH_PLAN.md` v1.3.0 with the corrected entry

---

## Section 23 — Recommended Next Action

**Immediate next action:**

Produce **Report 074 — BATCH-006 Requirement Membership Correction**, which must:

1. Correct the BATCH-006 requirement membership (remove REQ-017, REQ-018, REQ-019, REQ-022 from BATCH-006)
2. Update `09_Development/Implementation_Preparation/IMPLEMENTATION_BATCH_PLAN.md` with corrected BATCH-006 entry
3. Confirm the corrected BATCH-006 requirement set: REQ-016, REQ-020, REQ-021, REQ-023
4. Issue a final verdict of: **BATCH-006 PREPARATION CORRECTED — READY FOR IMPLEMENTATION**

After Report 074 is accepted and merged:

**Then produce Report 075 — BATCH-006 Tap-to-Move + Camera Implementation** using the corrected requirement set.

Branch for implementation: `copilot/batch-006-tap-to-move-camera`

---

## Section 24 — Summary

| Item | Value |
|---|---|
| Report filename | `2026-07-15_073_BATCH_006_PRE_IMPLEMENTATION_VERIFICATION_ANDROID_FIRST.md` |
| Audited main commit | `2a42efe2e4cbff980adf9664245c7723cdf2a132` |
| Repository status | Clean; no uncommitted changes; BATCH-001..005 intact |
| BATCH-006 exact title | Tap-to-Move + camera behavior |
| Objective | Implement Tap-to-Move and camera tracking behavior |
| Declared requirement count | 9 (REQ-016..REQ-024 by batch plan range) |
| Verified/corrected requirement count | 4 core (REQ-016, REQ-020, REQ-021, REQ-023) + 1 constraint (REQ-024) |
| Traceability result | 3 inconsistencies: REQ-017, REQ-018, REQ-019 mis-assigned |
| Planned artifacts | Player instance in GameWorld; PlayerEvents movement events; camera follow events; MovementSpeed set; TargetX/TargetY variables |
| Android control result | PASS — touch tap is primary; no keyboard required; landscape maintained |
| Movement result | Tap-to-Move; direct movement recommended; speed is implementation detail |
| Accept Order boundary result | PASS — Accept button strictly excluded from BATCH-006 |
| Camera result | PASS — camera follows Player; smooth movement; belongs in BATCH-006 |
| Owner decision result | No blocking ODR; road restriction is optional (direct movement recommended) |
| Implementation detail result | PASS — sufficient authorized freedom; IDR-004, IDR-010 apply |
| Exclusion result | PASS — all exclusions respected in corrected scope |
| Dependency result | ALL SATISFIED — BATCH-004 complete; no ODR blocks |
| Phone testing path | Agent validates JSON; Owner validates movement/camera via HTML5 preview on Android; no PC required |
| Execution specification | COMPLETE — in Section 20; actionable after membership correction |
| Contradictions | 2 material (CONT-001, CONT-002); 4 non-blocking (NB-001..NB-004) |
| Unresolved issues | Membership correction required before implementation |
| Final readiness verdict | **D. BATCH-006 NOT READY — MATERIAL PLAN CORRECTIONS REQUIRED** |
| Recommended next action | Produce Report 074 — BATCH-006 Requirement Membership Correction |

---

End of Document
