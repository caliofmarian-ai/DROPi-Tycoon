# Report Metadata

- Report ID: 2026-07-12_017
- Report title: F-07 Order Lifecycle State Machine — Correction Proposal
- Date: 2026-07-12
- Project: DROPi Tycoon
- Task type: Analysis-Only / Correction Proposal
- Agent/model: GitHub Copilot Task Agent (copilot-swe-agent[bot]); model identity N/A — not exposed in session store
- Repository: caliofmarian-ai/DROPi-Tycoon
- Branch: copilot/analyze-audit-finding-f07
- Base commit: 3fc32374226fe24beee0de705f3c0f375e8fcc40
- Resulting commit: N/A — analysis-only; no canonical files modified
- Pull Request: Pending creation
- Human approval status: Pending review

---

# Original Task Instruction

Analyze audit finding F-07 in the DROPi Tycoon repository and produce a correction proposal.

This is an analysis-only task.

Do not modify any canonical project file.
Do not fix F-07 yet.
Do not analyze or fix unrelated audit findings.
Do not start GDevelop implementation.
Do not invent new gameplay mechanics, order states, events, variables, data structures, UI systems, persistence rules, or implementation requirements.

OBJECTIVE

Determine the exact remaining inconsistencies in the Order lifecycle/state model across the current repository after all previously approved corrections and define the minimum safe correction required to fully resolve audit finding F-07.

SOURCE OF TRUTH

Use:

- current main branch;
- 09_Development/AI_Reports/2026-07-12_001_FULL_DOCUMENTATION_CONSISTENCY_AUDIT.md;
- current 03_Logistics/ORDERS.md;
- current 03_Logistics/LOGISTICS.md;
- current 01_GameDesign/GAMEPLAY.md;
- current 01_GameDesign/MISSIONS.md;
- current 09_Development/PROTOTYPE_V0.1.md;
- current 09_Development/CORE_GAMEPLAY_SYSTEMS.md;
- current 09_Development/GAME_DATA_STRUCTURE.md;
- current 09_Development/GAMEPLAY_EVENTS_FLOW.md;
- current 09_Development/FIRST_PLAYABLE_EXPERIENCE.md;
- current 09_Development/PROTOTYPE_MILESTONES.md;
- current 09_Development/PROTOTYPE_TESTING_PLAN.md;
- current 09_Development/PROTOTYPE_RELEASE_CHECKLIST.md;
- current 06_Technical/SAVE_SYSTEM.md;
- real current repository contents.

REQUIRED ANALYSIS

1. Verify the current main branch and inspect the real repository state.
2. Read the complete original F-07 finding.
3. Read every live non-historical document that defines, references, stores, checks, transitions, validates, tests, saves, loads, displays, or otherwise depends on Order states.
4. Perform a repository-wide search for all relevant state names and terms.
5. Build the complete current Order lifecycle inventory.
6. Distinguish clearly between states, transitions, events, stored data values, and descriptive wording.
7. Determine the exact current contradictions.
8. Determine the canonical owner of the Order lifecycle state machine.
9. Determine the canonical owner of technical stored state values.
10. Determine the correct canonical Order lifecycle for Prototype v0.1.
11. Determine exact canonical state names.
12. Define the exact canonical state machine.
13. Map gameplay/technical events to state transitions.
14. Analyze persistence compatibility.
15. Analyze all downstream dependencies.
16. Define the exact correction required.
17. Prefer the smallest safe correction.
18. Determine whether any unresolved design decision blocks implementation.
19. Define validation criteria proving F-07 is fully resolved.
20. Determine whether implementing the proposed correction would make F-07 FULLY RESOLVED, PARTIALLY RESOLVED, or NOT RESOLVED.

OUTPUT: Root Cause Analysis, Current Repository Order Lifecycle Inventory, Complete State/Transition/Event/Data-Value Mismatch Inventory, Canonical Ownership Analysis, Prototype v0.1 State-by-State Decision Table, Recommended Canonical Technical Vocabulary, Recommended Canonical Order State Machine, Event-to-Transition Mapping, Persistence Compatibility Analysis, Downstream Dependency Analysis, F-07 Scope Boundary, Exact Correction Plan, Required vs Optional File Changes, Exact Files That Would Change, Validation Plan, Risks, Unresolved Design Decisions, Whether F-07 would be fully resolved, Final Recommendation.

REPORTING REQUIREMENT: Follow 09_Development/AI_REPORTING_PROTOCOL.md. Create the next persistent report in 09_Development/AI_Reports/. Verify the next sequence number from the real repository state before creating it. Create a report-only Pull Request for human review. Do not merge the Pull Request.

---

# Objective

Determine the exact remaining inconsistencies in the Order lifecycle/state model across the current repository on main branch after all previously approved corrections (F-01 through F-06), and define the minimum safe correction required to fully resolve audit finding F-07.

This report produces no changes to canonical project files.

---

# Scope

- Audit finding: F-07 (Order lifecycle states defined differently in 4 documents)
- Scope boundary: Order lifecycle states, transitions, events, and stored values only
- Out of scope: all other audit findings (F-01 through F-06 already addressed; F-08 and beyond not analyzed here)
- Repository state: current main branch at commit 3fc32374226fe24beee0de705f3c0f375e8fcc40

---

# Files Inspected

| File | Reason |
|---|---|
| `09_Development/AI_Reports/2026-07-12_001_FULL_DOCUMENTATION_CONSISTENCY_AUDIT.md` | Source of F-07 original finding |
| `03_Logistics/ORDERS.md` | Candidate canonical lifecycle owner; defines Order Lifecycle section |
| `03_Logistics/LOGISTICS.md` | Core logistics document; references order flow |
| `03_Logistics/ROUTING.md` | References order lifecycle in routing context |
| `03_Logistics/DRONES.md` | References orders in drone context |
| `01_GameDesign/GAMEPLAY.md` | Canonical gameplay design; defines player actions |
| `01_GameDesign/MISSIONS.md` | Mission and objective system; references orders |
| `09_Development/PROTOTYPE_V0.1.md` | Defines Prototype v0.1 approved scope |
| `09_Development/CORE_GAMEPLAY_SYSTEMS.md` | Defines Order States section — key conflict document |
| `09_Development/GAME_DATA_STRUCTURE.md` | Defines Order Status values — key conflict document |
| `09_Development/GAMEPLAY_EVENTS_FLOW.md` | Defines event vocabulary — key conflict document |
| `09_Development/FIRST_PLAYABLE_EXPERIENCE.md` | Defines first-session player flow |
| `09_Development/PROTOTYPE_MILESTONES.md` | Development milestones for Prototype v0.1 |
| `09_Development/PROTOTYPE_TESTING_PLAN.md` | Testing requirements for Prototype v0.1 |
| `09_Development/PROTOTYPE_RELEASE_CHECKLIST.md` | Release validation checklist |
| `09_Development/PROTOTYPE_GENERATION_PACKAGE.md` | AI generation specification; references OrderStatus |
| `09_Development/GDEVELOP_PROJECT_STRUCTURE.md` | GDevelop structure; references orders |
| `06_Technical/SAVE_SYSTEM.md` | Persistence specification; describes active order behavior on load |
| `09_Development/AI_REPORTING_PROTOCOL.md` | Reporting governance |

---

# Files Created

- `09_Development/AI_Reports/2026-07-12_017_F07_ORDER_LIFECYCLE_CORRECTION_PROPOSAL.md` (this file)

---

# Files Modified

None. This is an analysis-only task. No canonical project files were modified.

---

# Files Moved or Renamed

None.

---

# Files Deleted

None.

---

# Actions Performed

1. Verified current branch (`copilot/analyze-audit-finding-f07`) and confirmed base commit.
2. Read F-07 original finding from `2026-07-12_001_FULL_DOCUMENTATION_CONSISTENCY_AUDIT.md`.
3. Read all canonical and implementation documents listed in scope.
4. Performed repository-wide search for all relevant state and event term names.
5. Verified git history to determine whether relevant documents were modified after original audit.
6. Mapped current state of each document against the original audit evidence table.
7. Analyzed each candidate state for Prototype v0.1 inclusion/exclusion.
8. Evaluated canonical ownership.
9. Defined the minimum safe correction plan.
10. Verified next available report sequence number (017).

---

# Findings

## Finding 1: Original Audit Evidence Table Is Partially Outdated

The original F-07 evidence table in `2026-07-12_001_FULL_DOCUMENTATION_CONSISTENCY_AUDIT.md` recorded:

| Document | Order States (as audited) |
|---|---|
| `CORE_GAMEPLAY_SYSTEMS.md` | Available → Accepted → PickedUp → Completed / Failed |
| `GAME_DATA_STRUCTURE.md` | Created → Available → In Progress → Completed → Failed |
| `GAMEPLAY_EVENTS_FLOW.md` | OrderCreated → OrderAccepted → PackagePickedUp → DeliveryCompleted |
| `ORDERS.md` | Created → Available → Assigned → In Transit → Delivered / Failed / Cancelled |

**Current state of these documents (verified on main branch):**

| Document | Current Order States |
|---|---|
| `CORE_GAMEPLAY_SYSTEMS.md` | Created → Available → Accepted → **In Progress** → Completed |
| `GAME_DATA_STRUCTURE.md` | Created → Available → Accepted → **PickedUp** → Completed → Failed |
| `GAMEPLAY_EVENTS_FLOW.md` | Events: OrderCreated, OrderAccepted, PackagePickedUp, DeliveryCompleted |
| `ORDERS.md` | Narrative lifecycle only (see Finding 2) |

**Significant changes since the audit:**

- The state names `In Progress` and `PickedUp` appear to be **swapped** relative to the audit's description — the document the audit associated with `PickedUp` now contains `In Progress`, and vice versa. This is an audit transcription discrepancy. The **contradiction is real but affects different documents than stated**.
- `ORDERS.md` no longer contains the state names `Assigned`, `In Transit`, `Delivered`, or `Cancelled` as technical states. It contains only a narrative lifecycle description (see Finding 2).
- The core F-07 contradiction **remains unresolved** in the current repository.

## Finding 2: ORDERS.md Contains Only a Narrative Lifecycle, Not Technical State Definitions

**File:** `03_Logistics/ORDERS.md`
**Section:** "Order Lifecycle"

The current ORDERS.md Order Lifecycle section reads:

```
Order Created
↓
Order Available
↓
Order Accepted
↓
Resources Assigned
↓
Pickup
↓
Transportation
↓
Delivery
↓
Completed
↓
Customer Feedback
```

**Classification:** This is a **descriptive player-facing narrative** of the business process, not a technical state machine. The items `Resources Assigned`, `Pickup`, `Transportation`, `Delivery`, and `Customer Feedback` are process phases, not stored state values.

**Impact:** ORDERS.md does not currently define any formal technical state names. It cannot serve as the canonical lifecycle owner until it contains an explicit state table.

**Correction required:** ORDERS.md needs a formal technical state machine section for Prototype v0.1.

## Finding 3: CORE_GAMEPLAY_SYSTEMS.md Uses "In Progress" — Contradicts GAME_DATA_STRUCTURE.md

**File:** `09_Development/CORE_GAMEPLAY_SYSTEMS.md`
**Section:** "Order States"

```
Created
↓
Available
↓
Accepted
↓
In Progress
↓
Completed
```

**Problems:**
1. Uses `In Progress` for the in-transit/delivery phase. GAME_DATA_STRUCTURE.md uses `PickedUp` for the same phase. These are different state names for the same semantic concept — **direct contradiction**.
2. Does not list `Failed` as a terminal state. GAME_DATA_STRUCTURE.md includes `Failed`. Other gameplay documents describe order failures. This omission is a **functional gap**.
3. Uses two-word name `In Progress` with a space. Technical stored values should not contain spaces (see Finding 8).

**Impact:** An implementation agent reading CORE_GAMEPLAY_SYSTEMS.md would define `OrderStatus = "In Progress"` for a picked-up delivery, while another reading GAME_DATA_STRUCTURE.md would define `OrderStatus = "PickedUp"`. The condition check `OrderStatus = "In Progress"` would never match an order set to `"PickedUp"`, breaking the gameplay loop.

## Finding 4: GAME_DATA_STRUCTURE.md Order Status Values Are the Most Accurate

**File:** `09_Development/GAME_DATA_STRUCTURE.md`
**Section:** "Order Status"

```
Created
Available
Accepted
PickedUp
Completed
Failed
```

**Assessment:** This list is the **most consistent and technically precise** of all current documents. It:
- Uses single-word, no-space values appropriate for stored variables.
- Includes both terminal states (`Completed` and `Failed`).
- Covers the full Prototype v0.1 player flow.
- Does NOT include unsupported states (`Assigned`, `InTransit`, `Delivered`, `Cancelled`).

**Only issue:** It lacks an explicit cross-reference to ORDERS.md as the lifecycle semantic owner.

## Finding 5: GAMEPLAY_EVENTS_FLOW.md Correctly Defines Events, Not States

**File:** `09_Development/GAMEPLAY_EVENTS_FLOW.md`
**Section:** "MVP Event List"

```
GameStarted
OrderCreated
OrderAccepted
PackagePickedUp
DeliveryCompleted
MoneyReceived
UpgradePurchased
```

**Assessment:** These are **events** (triggers/signals), not state values. The document correctly labels them as events. The event names directly correspond to state transitions but do NOT define state names.

**Important nuance:** The event `PackagePickedUp` implies a resulting state of `PickedUp`. The event `DeliveryCompleted` implies a resulting state of `Completed`. The event `OrderAccepted` implies a resulting state of `Accepted`.

**Remaining issue:** The document references "Delivery Failed" and "Cancelled order" as causes of failure but does not define a canonical `DeliveryFailed` event or `OrderFailed` event. There is no explicit event that causes the `Failed` terminal state.

## Finding 6: LOGISTICS.md Does Not Define Technical Order States

**File:** `03_Logistics/LOGISTICS.md`
**Section:** "Core Logistics Loop"

Contains a narrative process description (Customer Creates Demand → Order Generation → Resource Assignment → Package Transportation → Delivery Completion → Customer Feedback). These are process phases, not technical state values. No contradiction with technical documents.

**Classification:** Descriptive player-facing process, no technical impact on F-07.

## Finding 7: SAVE_SYSTEM.md Implies Implicit Cancellation Without Defining a State

**File:** `06_Technical/SAVE_SYSTEM.md`
**Section:** "Active Order"

> "The current active order is cancelled and reset on load. Active orders are not restored from save in Prototype v0.1."

**Assessment:** This defines a system behavior (orders in `Accepted` or `PickedUp` state are discarded on load) but does NOT require a stored `Cancelled` state value. The system can implement this by deleting the order record or resetting its status to `Available` without needing `Cancelled` as a stored state.

**Conclusion:** `Cancelled` is NOT required as a stored OrderStatus value for Prototype v0.1. It is a system behavior, not a game-state value.

## Finding 8: "In Progress" Contains a Space — Invalid for Technical Stored Values

`In Progress` (two words with a space) is inappropriate as a stored variable value. Technical state names stored in a variable like `OrderStatus` must be single tokens without spaces to avoid string comparison fragility in GDevelop events. All other current state names (`Created`, `Available`, `Accepted`, `PickedUp`, `Completed`, `Failed`) are single words without spaces.

## Finding 9: No Document Currently Defines "Assigned" as a Prototype v0.1 State

The narrative lifecycle in ORDERS.md mentions "Resources Assigned" as a phase. However:
- No technical document defines `Assigned` as a stored OrderStatus value.
- Resource assignment (dispatching employees, vehicles) is a multi-vehicle/employee system not present in Prototype v0.1.
- Prototype v0.1 has one player courier and one active order; no dispatch logic exists.

**Conclusion:** `Assigned` is NOT part of the Prototype v0.1 state machine. It is a full-game concept in ORDERS.md's narrative and does not require a stored state.

## Finding 10: Repository-Wide Search Confirms No Additional Contradictions in Other Documents

Repository-wide search for all relevant state terms found:
- `ROUTING.md`: mentions "Order Created" as a routing trigger — descriptive, no contradiction.
- `DRONES.md`: mentions "Available order" — descriptive, no contradiction (drones are excluded from Prototype v0.1).
- `GDEVELOP_PROJECT_STRUCTURE.md`: mentions "Available orders" — descriptive reference, no technical state definition.
- `PROTOTYPE_GENERATION_PACKAGE.md`: references `OrderStatus` as a data field name — no state values defined; consistent with GAME_DATA_STRUCTURE.md.
- `PROTOTYPE_TESTING_PLAN.md`: refers to "Order status changes correctly" — does not define specific values; requires one consistent set to be meaningful.
- `PROTOTYPE_RELEASE_CHECKLIST.md`: "Orders can be accepted", "Delivery can be completed" — player-facing descriptions, no technical state names.

No additional F-07 contradictions were found in other documents beyond the three primary conflict documents identified above.

---

# Current Repository Order Lifecycle Inventory

## ORDERS.md

| Property | Value |
|---|---|
| File | `03_Logistics/ORDERS.md` |
| Section | "Order Lifecycle" |
| Document role | Canonical gameplay design |
| States defined | None (narrative phases only) |
| Transitions described | Narrative sequence only |
| Events used | None |
| Variables/fields | None |
| State type | Descriptive player-facing narrative |
| Consistency | Incomplete — no formal technical state definition |

Narrative phases: Order Created → Order Available → Order Accepted → Resources Assigned → Pickup → Transportation → Delivery → Completed → Customer Feedback

## CORE_GAMEPLAY_SYSTEMS.md

| Property | Value |
|---|---|
| File | `09_Development/CORE_GAMEPLAY_SYSTEMS.md` |
| Section | "Order States" |
| Document role | Prototype design — gameplay rules |
| States defined | Created, Available, Accepted, In Progress, Completed |
| Transitions described | Linear sequence; no branching to Failed |
| Events used | None explicitly in state section |
| Variables/fields | "Status" (generic reference) |
| State type | Technical state definition (intended for stored values) |
| Consistency | CONTRADICTORY — uses `In Progress` (conflicts with GAME_DATA_STRUCTURE.md's `PickedUp`); omits `Failed` |

## GAME_DATA_STRUCTURE.md

| Property | Value |
|---|---|
| File | `09_Development/GAME_DATA_STRUCTURE.md` |
| Section | "Order Status" |
| Document role | Prototype technical design — data model |
| States defined | Created, Available, Accepted, PickedUp, Completed, Failed |
| Transitions described | Linear sequence; terminal states Completed and Failed |
| Events used | None in this section |
| Variables/fields | `OrderData.Status` (mapped to these values) |
| State type | Persistent stored data values |
| Consistency | CONSISTENT internally; CONTRADICTORY vs CORE_GAMEPLAY_SYSTEMS.md (`PickedUp` vs `In Progress`) |

## GAMEPLAY_EVENTS_FLOW.md

| Property | Value |
|---|---|
| File | `09_Development/GAMEPLAY_EVENTS_FLOW.md` |
| Section | "MVP Event List" |
| Document role | Prototype technical design — event communication |
| States defined | None (events only) |
| Events used | GameStarted, OrderCreated, OrderAccepted, PackagePickedUp, DeliveryCompleted, MoneyReceived, UpgradePurchased |
| Variables/fields | None in event list |
| State type | Events (triggers/signals) — correctly distinguished from states |
| Consistency | INTERNALLY CONSISTENT; no failure event defined for Failed terminal state |

## LOGISTICS.md

| Property | Value |
|---|---|
| File | `03_Logistics/LOGISTICS.md` |
| Section | "Core Logistics Loop" |
| Document role | Canonical logistics design |
| States defined | None (narrative phases) |
| Consistency | Descriptive only; no technical state contradiction |

## SAVE_SYSTEM.md

| Property | Value |
|---|---|
| File | `06_Technical/SAVE_SYSTEM.md` |
| Section | "Active Order" |
| Document role | Canonical persistence specification |
| States referenced | Active order (implicitly Accepted or PickedUp) |
| Consistency | Describes system behavior; does not define stored state values |

---

# Complete State/Transition/Event/Data-Value Mismatch Inventory

## Contradiction C-1: State Name Conflict — "In Progress" vs "PickedUp"

| | |
|---|---|
| Type | State name contradiction |
| Documents | CORE_GAMEPLAY_SYSTEMS.md vs GAME_DATA_STRUCTURE.md |
| CORE_GAMEPLAY_SYSTEMS.md | `In Progress` |
| GAME_DATA_STRUCTURE.md | `PickedUp` |
| Semantic meaning | Both refer to: order accepted by player, package physically collected, player in transit to destination |
| Impact | Variable set to `"In Progress"` will never match condition checking for `"PickedUp"`. Delivery completion logic fails. |
| Severity | CRITICAL — breaks gameplay loop |

## Contradiction C-2: Missing "Failed" State in CORE_GAMEPLAY_SYSTEMS.md

| | |
|---|---|
| Type | Missing terminal state |
| Documents | CORE_GAMEPLAY_SYSTEMS.md |
| Problem | `Failed` is not listed in the Order States section |
| Correct behavior | Failures are referenced throughout the document (reputation system, delivery failure) |
| GAME_DATA_STRUCTURE.md | Correctly includes `Failed` |
| Impact | Implementation agent following CORE_GAMEPLAY_SYSTEMS.md has no state to transition to on failure |
| Severity | MAJOR — failure behavior undefined |

## Contradiction C-3: ORDERS.md Has No Technical State Table

| | |
|---|---|
| Type | Missing canonical definition |
| Documents | ORDERS.md |
| Problem | Designated canonical lifecycle owner has no explicit technical state definitions |
| Current content | Narrative lifecycle only (process phases, not stored values) |
| Impact | ORDERS.md cannot fulfill canonical owner role without explicit state definitions |
| Severity | MAJOR — canonical ownership unfulfilled |

## Contradiction C-4: "In Progress" Contains Space — Not Suitable as Stored Value

| | |
|---|---|
| Type | Technical naming violation |
| Documents | CORE_GAMEPLAY_SYSTEMS.md |
| Problem | Two-word name with space is fragile for string comparison in GDevelop variables |
| All other state names | Single word, no spaces |
| Impact | String comparison bugs if implementation uses `"In Progress"` |
| Severity | MAJOR — technical implementation risk |

## Non-Issue (Confirmed): Events vs States in GAMEPLAY_EVENTS_FLOW.md

| | |
|---|---|
| Type | Confirmed correct |
| Assessment | GAMEPLAY_EVENTS_FLOW.md correctly identifies its content as events, not states. No fix required. |
| Residual gap | No failure event (DeliveryFailed / OrderFailed) is defined. This creates an incomplete event vocabulary but is categorized as OPTIONAL improvement. |

## Non-Issue (Confirmed): "Assigned" Is Not a Prototype v0.1 State

| | |
|---|---|
| Type | Confirmed not applicable |
| Assessment | "Resources Assigned" in ORDERS.md narrative is a full-game concept. Not in prototype scope. No stored state required. |

## Non-Issue (Confirmed): "Cancelled" Is Not a Required Stored State

| | |
|---|---|
| Type | Confirmed not applicable |
| Assessment | SAVE_SYSTEM.md "cancelled and reset on load" is a system behavior, not a stored state value. |

## Non-Issue (Confirmed): "Delivered" vs "Completed"

| | |
|---|---|
| Type | Confirmed resolved |
| Assessment | No document currently defines `Delivered` as a distinct technical state. All technical documents use `Completed`. No contradiction. |

---

# Canonical Ownership Analysis

## Question 1: Should ORDERS.md Own the Lifecycle Semantic Definition?

**Evidence supporting ORDERS.md as canonical lifecycle owner:**
- ORDERS.md has `Status: Canonical` in its document header.
- Its mandate is "defines the order generation and management system."
- Its "Canonical Rule" states: "Every future logistics feature must connect naturally to the order lifecycle."
- It is in `03_Logistics/`, which is the gameplay design layer, appropriate for lifecycle semantics.
- The original audit recommended it as canonical owner.

**Evidence against (current gap):**
- ORDERS.md currently contains only a narrative lifecycle, not technical state definitions.
- Its narrative includes full-game concepts (`Resources Assigned`, `Customer Feedback`) not in Prototype v0.1.

**Conclusion:** ORDERS.md **should** be the canonical lifecycle owner. Its current gap (lack of explicit state table) is exactly what correction C-3 addresses. The gap does not invalidate its ownership role — it defines the correction needed.

## Question 2: Should GAME_DATA_STRUCTURE.md Own the Technical Stored Values?

**Evidence supporting GAME_DATA_STRUCTURE.md as technical value owner:**
- `Status: Prototype Technical Design` — explicitly the technical data model.
- Its mandate is "defines the internal data organization."
- It already contains the most accurate and complete Order Status value list.
- It is the appropriate layer for "what exact string goes in the variable."

**Ownership relationship:**
- `03_Logistics/ORDERS.md` **defines the canonical lifecycle semantics** — what each state means, what transitions are allowed, what happens in each state.
- `09_Development/GAME_DATA_STRUCTURE.md` **defines the exact technical stored values** — what string is stored in the `OrderStatus` variable for each state.
- Both must be aligned. Neither can contradict the other.
- GAME_DATA_STRUCTURE.md is **subordinate** to ORDERS.md's semantic definitions.

---

# Prototype v0.1 State-by-State Decision Table

| State | Decision | Reason | Semantic Meaning | Allowed Transitions |
|---|---|---|---|---|
| `Created` | **INCLUDE** | System needs an initial state when the order object is constructed but before it is displayed to the player. Also the event `OrderCreated` fires at this moment, making the state observable. | Order has been generated by the system. Not yet visible to the player. | Created → Available |
| `Available` | **INCLUDE** | The player must be able to see and choose orders. This state represents orders visible in the player's order list but not yet accepted. | Order is visible and can be accepted by the player. | Available → Accepted |
| `Accepted` | **INCLUDE** | Player has committed to an order but has not yet picked up the package. Needed to distinguish from Available (not accepted) and PickedUp (package collected). | Player accepted the order. Active objective assigned. Player must travel to pickup location. | Accepted → PickedUp, Accepted → Failed |
| `Assigned` | **EXCLUDE** | Requires multi-vehicle/employee dispatch logic not in Prototype v0.1. One player, one active order — no separate assignment step needed. | N/A | N/A |
| `PickedUp` | **INCLUDE** | Player has collected the package and is in transit. Distinct from Accepted (no package yet) and Completed (delivered). The event `PackagePickedUp` has a direct corresponding state. | Package collected. Player in transit to destination. | PickedUp → Completed, PickedUp → Failed |
| `In Progress` | **EXCLUDE** | Semantic alias for PickedUp. Two-word name with space is technically fragile. Less precise than PickedUp (does not specify why/how in progress). GAME_DATA_STRUCTURE.md correctly does not use this name. | N/A | N/A |
| `InTransit` | **EXCLUDE** | Synonym for PickedUp. Not used in any current technical document. Unnecessary duplicate. | N/A | N/A |
| `Completed` | **INCLUDE** | Required terminal success state. Package delivered, reward calculated. | Delivery successfully completed. Reward applied. Order closed. | None (terminal) |
| `Delivered` | **EXCLUDE** | Synonym for Completed. Not used in any current technical document. | N/A | N/A |
| `Failed` | **INCLUDE** | Required terminal failure state. Occurs on late delivery, cancelled order (load reset), or system failure. Required for reputation system. | Order could not be completed. Reputation affected. | None (terminal) |
| `Cancelled` | **EXCLUDE** | Not a stored state for Prototype v0.1. Load-time reset behavior is handled by system logic (SAVE_SYSTEM.md), not by transitioning to a Cancelled state. | N/A | N/A |

---

# Recommended Canonical Technical Vocabulary

## Order State Names

The following are the exact canonical technical values for `OrderStatus`:

| Technical Value | Role | Semantic Label |
|---|---|---|
| `Created` | Initial | Order Generated |
| `Available` | Intermediate | Available for Acceptance |
| `Accepted` | Intermediate | Accepted by Player |
| `PickedUp` | Intermediate | Package Collected |
| `Completed` | Terminal (success) | Delivered Successfully |
| `Failed` | Terminal (failure) | Order Failed |

**Rules:**
- All values are single words, PascalCase, no spaces.
- No aliases are permitted in technical contexts.
- `In Progress` → replaced by `PickedUp` in all technical documents.
- `Delivered` → replaced by `Completed` in all technical documents.
- `Assigned`, `InTransit`, `Cancelled` → excluded from Prototype v0.1 (full-game reserved).

## Event Names

The following are the canonical event names that communicate state transitions:

| Event Name | Type | Trigger |
|---|---|---|
| `OrderCreated` | System event | Order object constructed |
| `OrderAccepted` | Player action event | Player accepts an order |
| `PackagePickedUp` | Player action event | Player reaches pickup location and collects package |
| `DeliveryCompleted` | System event | Package delivered to correct destination |
| `DeliveryFailed` | System/timeout event | Order cannot be completed (OPTIONAL addition) |

---

# Recommended Canonical Order State Machine

## Initial State

`Created`

## Happy Path (Complete)

```
Created → Available → Accepted → PickedUp → Completed
```

## Failure Paths

```
Accepted → Failed
PickedUp → Failed
```

## All Allowed Transitions

| Source State | Event | Target State |
|---|---|---|
| Created | OrderCreated (fires; order becomes visible) | Available |
| Available | OrderAccepted | Accepted |
| Accepted | PackagePickedUp | PickedUp |
| PickedUp | DeliveryCompleted | Completed |
| Accepted | DeliveryFailed / timeout / load-reset | Failed |
| PickedUp | DeliveryFailed / timeout | Failed |

## Prohibited Transitions

| Prohibited | Reason |
|---|---|
| Available → PickedUp | Cannot pick up without accepting |
| Available → Completed | Cannot complete without accepting and picking up |
| Accepted → Completed | Cannot complete without picking up |
| Created → Accepted | Cannot accept before order is available |
| Completed → any | Terminal state |
| Failed → any | Terminal state |

## Terminal States

- `Completed` — no outbound transitions
- `Failed` — no outbound transitions

---

# Event-to-Transition Mapping

## OrderCreated

| Property | Value |
|---|---|
| Type | Event |
| Source state | Created |
| Target state | Available |
| Trigger | System generates an order |
| Current status | Correctly defined in GAMEPLAY_EVENTS_FLOW.md |
| Name change required | No |

## OrderAccepted

| Property | Value |
|---|---|
| Type | Event |
| Source state | Available |
| Target state | Accepted |
| Trigger | Player action: accepts an order |
| Current status | Correctly defined in GAMEPLAY_EVENTS_FLOW.md |
| Name change required | No |

## PackagePickedUp

| Property | Value |
|---|---|
| Type | Event |
| Source state | Accepted |
| Target state | PickedUp |
| Trigger | Player reaches pickup location and collects package |
| Current status | Correctly defined in GAMEPLAY_EVENTS_FLOW.md |
| Name change required | No |

## DeliveryCompleted

| Property | Value |
|---|---|
| Type | Event |
| Source state | PickedUp |
| Target state | Completed |
| Trigger | Player delivers package to correct destination |
| Current status | Correctly defined in GAMEPLAY_EVENTS_FLOW.md |
| Name change required | No |

## DeliveryFailed (missing event)

| Property | Value |
|---|---|
| Type | Event (currently unnamed / implicit) |
| Source state | Accepted or PickedUp |
| Target state | Failed |
| Trigger | Failure condition detected (time exceeded, wrong destination, load reset) |
| Current status | Not explicitly named in MVP Event List; described as conditions only |
| Recommendation | OPTIONAL: add `DeliveryFailed` to GAMEPLAY_EVENTS_FLOW.md MVP Event List |
| Blocking for F-07 | No — missing failure event name does not block state machine correction |

---

# Persistence Compatibility Analysis

## Current SAVE_SYSTEM.md Behavior

- Active orders (`Accepted` or `PickedUp` state) are **not persisted**. They are discarded on load.
- Completed/Failed orders are not persisted either (only their results — money, reputation changes — are persisted through CompanyData).
- OrderData is transient runtime data; it is **regenerated on load**.

## Compatibility of Proposed State Machine

| Question | Answer |
|---|---|
| Does the proposed state machine require new data fields? | No |
| Does it require migration of saved data? | No — OrderData is not persisted |
| Does changing `In Progress` → `PickedUp` affect saved values? | No — order states are never saved |
| Does adding `Failed` affect persistence? | No — Failed orders are terminal and discarded |
| Does the save system need changes? | No |

## Conclusion

The proposed canonical state machine is **100% compatible with the existing persistence model**. Zero structural changes to SAVE_SYSTEM.md or GAME_DATA_STRUCTURE.md persistence fields are required.

---

# Downstream Dependency Analysis

## Documents Requiring Change to Fully Resolve F-07

| File | Classification | Current Problem |
|---|---|---|
| `09_Development/CORE_GAMEPLAY_SYSTEMS.md` | **REQUIRED** | Uses `In Progress` instead of `PickedUp`; omits `Failed` |
| `03_Logistics/ORDERS.md` | **REQUIRED** | Has no technical state table; cannot serve as canonical owner without one |

## Documents With Optional Improvement Opportunity

| File | Classification | Improvement |
|---|---|---|
| `09_Development/GAMEPLAY_EVENTS_FLOW.md` | **OPTIONAL** | Add `DeliveryFailed` to MVP Event List to complete the failure vocabulary |
| `09_Development/GAME_DATA_STRUCTURE.md` | **OPTIONAL** | Add cross-reference to ORDERS.md as canonical lifecycle semantic owner |

## Documents Verified as Already Consistent

| File | Status |
|---|---|
| `09_Development/GAME_DATA_STRUCTURE.md` Order Status values | Consistent with proposed canonical machine |
| `09_Development/GAMEPLAY_EVENTS_FLOW.md` event names | Consistent; correctly labeled as events |
| `06_Technical/SAVE_SYSTEM.md` | Consistent; persistence behavior unchanged |
| `03_Logistics/LOGISTICS.md` | Consistent; narrative only |
| `03_Logistics/ROUTING.md` | Consistent; narrative only |
| `09_Development/PROTOTYPE_V0.1.md` | Consistent; no state definitions |
| `09_Development/FIRST_PLAYABLE_EXPERIENCE.md` | Consistent; narrative only |
| `09_Development/PROTOTYPE_MILESTONES.md` | Consistent; no state definitions |
| `09_Development/PROTOTYPE_TESTING_PLAN.md` | Consistent; references behavior, not state names |
| `09_Development/PROTOTYPE_RELEASE_CHECKLIST.md` | Consistent; player-facing descriptions |
| `09_Development/PROTOTYPE_GENERATION_PACKAGE.md` | Consistent; references `OrderStatus` field without state values |
| `01_GameDesign/GAMEPLAY.md` | Consistent; no technical state definitions |
| `01_GameDesign/MISSIONS.md` | Consistent; no technical state definitions |

---

# F-07 Scope Boundary

| In scope for F-07 | Out of scope for F-07 |
|---|---|
| Order state names in technical documents | Event names (correctly defined; no change needed) |
| ORDERS.md technical state table | GAMEPLAY_EVENTS_FLOW.md restructuring |
| CORE_GAMEPLAY_SYSTEMS.md state names | UI display wording for player |
| GAME_DATA_STRUCTURE.md cross-reference | Failure event naming (optional) |
| — | Any other audit finding (F-01 through F-06 already addressed) |
| — | GDevelop implementation events |
| — | Full-game lifecycle (Assigned, InTransit, Cancelled for future) |

---

# Exact Correction Plan

## Change 1 — REQUIRED: Update CORE_GAMEPLAY_SYSTEMS.md Order States Section

**File:** `09_Development/CORE_GAMEPLAY_SYSTEMS.md`
**Section:** "Order States"

**Current content:**

```
Possible states:

Created
↓
Available
↓
Accepted
↓
In Progress
↓
Completed
```

**Recommended correction:**

```
Possible states:

Created
↓
Available
↓
Accepted
↓
PickedUp
↓
Completed
|
Failed
```

**Additional note to add after the state list:**

> State names are stored exactly as listed above. See `09_Development/GAME_DATA_STRUCTURE.md` for the complete `OrderStatus` value set. See `03_Logistics/ORDERS.md` for the canonical lifecycle semantic definition.

**Reason:** Replaces `In Progress` (which conflicts with GAME_DATA_STRUCTURE.md's `PickedUp`), adds the missing `Failed` terminal state, and adds cross-references to canonical owner and data model.

**Classification:** REQUIRED

---

## Change 2 — REQUIRED: Add Prototype v0.1 Technical State Machine Section to ORDERS.md

**File:** `03_Logistics/ORDERS.md`
**After section:** "Order Lifecycle" (narrative section)

**Add new section:**

```markdown
# Prototype v0.1 Canonical Order State Machine

This section defines the canonical technical Order state machine for Prototype v0.1.

All implementation documents must align with this definition.

## Canonical States

| State | Technical Value | Semantic Meaning |
|---|---|---|
| Created | `Created` | Order generated by the system. Not yet visible to the player. |
| Available | `Available` | Order visible to the player and ready for acceptance. |
| Accepted | `Accepted` | Player accepted the order. Traveling to pickup location. |
| PickedUp | `PickedUp` | Package collected. Player in transit to destination. |
| Completed | `Completed` | Package delivered successfully. Order closed. Reward applied. |
| Failed | `Failed` | Order could not be completed. Reputation affected. Order closed. |

## Canonical Transitions

Initial state: `Created`

Happy path: `Created → Available → Accepted → PickedUp → Completed`

Failure paths: `Accepted → Failed`, `PickedUp → Failed`

Terminal states: `Completed`, `Failed`

## Canonical Event-to-Transition Map

| Event | Source State | Target State |
|---|---|---|
| OrderCreated | Created | Available |
| OrderAccepted | Available | Accepted |
| PackagePickedUp | Accepted | PickedUp |
| DeliveryCompleted | PickedUp | Completed |
| DeliveryFailed | Accepted or PickedUp | Failed |

## Note on Full-Game Lifecycle

The narrative Order Lifecycle section above describes the full-game business process vision.

States such as `Assigned`, `InTransit`, and `Cancelled` belong to future versions and are NOT part of the Prototype v0.1 state machine.

For stored variable values, see `09_Development/GAME_DATA_STRUCTURE.md`.
```

**Reason:** ORDERS.md is the designated canonical lifecycle owner but currently contains no technical state definitions. This section fulfills that ownership role without rewriting any existing content. The narrative lifecycle section is retained as the full-game vision context.

**Classification:** REQUIRED

---

## Change 3 — OPTIONAL: Add Cross-Reference to GAME_DATA_STRUCTURE.md

**File:** `09_Development/GAME_DATA_STRUCTURE.md`
**Section:** After "Order Status" values list

**Add note:**

> Canonical lifecycle semantic definitions are owned by `03_Logistics/ORDERS.md`. The values listed above are the exact stored technical values and are subordinate to the lifecycle definition in ORDERS.md.

**Reason:** Clarifies the ownership relationship between ORDERS.md and GAME_DATA_STRUCTURE.md for future implementation agents.

**Classification:** OPTIONAL

---

## Change 4 — OPTIONAL: Add DeliveryFailed to GAMEPLAY_EVENTS_FLOW.md MVP Event List

**File:** `09_Development/GAMEPLAY_EVENTS_FLOW.md`
**Section:** "MVP Event List"

**Add:** `DeliveryFailed` to the list

**Reason:** Provides a canonical event name for the failure-to-Failed transition. Currently only described as failure conditions; no event name is assigned.

**Classification:** OPTIONAL — the failure state can be implemented without a named canonical event (implementation can use internal logic), but naming it reduces future ambiguity.

---

# Required vs Optional File Changes

## Required Changes (F-07 remains contradictory without these)

| File | Change |
|---|---|
| `09_Development/CORE_GAMEPLAY_SYSTEMS.md` | Replace `In Progress` → `PickedUp`; add `Failed` |
| `03_Logistics/ORDERS.md` | Add Prototype v0.1 canonical state machine section |

## Optional Changes (clarity improvements only)

| File | Change |
|---|---|
| `09_Development/GAME_DATA_STRUCTURE.md` | Add cross-reference to ORDERS.md |
| `09_Development/GAMEPLAY_EVENTS_FLOW.md` | Add `DeliveryFailed` to MVP Event List |

---

# Exact Files That Would Change

If the correction plan is approved and implemented:

- `03_Logistics/ORDERS.md` — section added (new content only; no existing content modified)
- `09_Development/CORE_GAMEPLAY_SYSTEMS.md` — "Order States" section updated
- `09_Development/GAME_DATA_STRUCTURE.md` — note added (optional)
- `09_Development/GAMEPLAY_EVENTS_FLOW.md` — `DeliveryFailed` added to list (optional)

**Files confirmed NOT to change:**
- All other canonical documents
- `06_Technical/SAVE_SYSTEM.md`
- `09_Development/PROTOTYPE_V0.1.md`
- `09_Development/PROTOTYPE_TESTING_PLAN.md`
- `09_Development/PROTOTYPE_RELEASE_CHECKLIST.md`
- All historical AI Reports

---

# Validation Plan

F-07 is considered fully resolved when ALL of the following are true:

| Validation Check | Criterion |
|---|---|
| V-01 | One canonical Order lifecycle section exists in ORDERS.md with explicit state table |
| V-02 | CORE_GAMEPLAY_SYSTEMS.md Order States section uses `PickedUp` (not `In Progress`) |
| V-03 | CORE_GAMEPLAY_SYSTEMS.md Order States section includes `Failed` |
| V-04 | GAME_DATA_STRUCTURE.md Order Status values match the canonical state table exactly |
| V-05 | GAMEPLAY_EVENTS_FLOW.md events are not labeled as states anywhere in the document |
| V-06 | Every state in the canonical table has a corresponding event that triggers entry into it |
| V-07 | No document in the live canonical set uses `In Progress`, `InProgress`, `In Transit`, `InTransit`, `Delivered`, `Assigned`, or `Cancelled` as technical OrderStatus values |
| V-08 | All state names in the canonical table are single-word PascalCase with no spaces |
| V-09 | The Prototype v0.1 player flow (FIRST_PLAYABLE_EXPERIENCE.md) is compatible with the canonical state machine — each player action has a corresponding state and event |
| V-10 | SAVE_SYSTEM.md behavior is compatible — active order discard on load works with Accepted and PickedUp states without requiring a Cancelled stored state |
| V-11 | No non-F-07 canonical document was modified as part of this correction |
| V-12 | No historical AI Reports were modified |

---

# Risks

| Risk | Probability | Severity | Mitigation |
|---|---|---|---|
| R-01: Implementation agent reads CORE_GAMEPLAY_SYSTEMS.md before correction and uses `In Progress` | HIGH (current state) | CRITICAL | Prioritize Change 1 in implementation task |
| R-02: Narrative lifecycle in ORDERS.md (with `Resources Assigned`, etc.) is misread as technical states | MEDIUM | MAJOR | Change 2 (adding canonical state section) explicitly annotates narrative as full-game vision |
| R-03: Future agent adds Cancelled or Assigned without updating ORDERS.md canonical section | LOW | MODERATE | ORDERS.md canonical section explicitly notes these as out of scope for v0.1 |
| R-04: DeliveryFailed event not named; failure state entered via unnamed condition | LOW | MINOR | Optional Change 4 addresses this; not blocking |

---

# Unresolved Design Decisions

No unresolved design decisions block the implementation of F-07 correction.

All state inclusion/exclusion decisions are derivable from:
- Current approved Prototype v0.1 scope (PROTOTYPE_V0.1.md)
- Existing player flow documents
- Existing event vocabulary
- Existing data model

The following are noted as **already resolved by existing documents**:

| Decision | Resolution | Source |
|---|---|---|
| Is Cancelled a stored state for v0.1? | No — system behavior only | SAVE_SYSTEM.md |
| Is Assigned a stored state for v0.1? | No — multi-vehicle concept not in scope | PROTOTYPE_V0.1.md |
| Is Delivered different from Completed? | No — same terminal success state | GAME_DATA_STRUCTURE.md |
| Should PickedUp or InProgress be used? | PickedUp — more precise, single word, supported by event name | GAME_DATA_STRUCTURE.md + GAMEPLAY_EVENTS_FLOW.md |

---

# Whether F-07 Would Be Fully Resolved

**If both Required changes are implemented: FULLY RESOLVED.**

Rationale:
- Required Change 1 (CORE_GAMEPLAY_SYSTEMS.md) eliminates Contradiction C-1 (`In Progress` vs `PickedUp`) and Contradiction C-4 (space in state name), and fills Contradiction C-2 (missing `Failed`).
- Required Change 2 (ORDERS.md) eliminates Contradiction C-3 (no technical state table in canonical owner document) and formally establishes ORDERS.md as the lifecycle semantic authority.
- After both changes, all live canonical and implementation documents use the same six state names: `Created`, `Available`, `Accepted`, `PickedUp`, `Completed`, `Failed`.
- No deprecated aliases remain in technical contexts.
- Persistence is compatible without modification.
- The canonical state machine is minimal, deterministic, and covers the complete Prototype v0.1 player flow.

**If only Optional changes are implemented without Required changes: NOT RESOLVED.**

**If only Required Change 1 is implemented without Required Change 2: PARTIALLY RESOLVED** (C-1, C-2, C-4 fixed; C-3 remains).

**If only Required Change 2 is implemented without Required Change 1: PARTIALLY RESOLVED** (C-3 fixed; C-1, C-2, C-4 remain; and the new canonical section in ORDERS.md now explicitly contradicts CORE_GAMEPLAY_SYSTEMS.md, making the situation worse).

---

# Final Recommendation

## Summary

F-07 is **unresolved** in the current repository. The core contradictions identified by the original audit remain active, though the documents holding specific conflicting values are clarified by this analysis.

## Recommended Actions

1. **Approve this correction proposal** (human review of this report).

2. **Implement Required Change 1** in `09_Development/CORE_GAMEPLAY_SYSTEMS.md`:
   - Replace `In Progress` → `PickedUp` in the Order States section.
   - Add `Failed` as a terminal state.
   - Add cross-reference to ORDERS.md and GAME_DATA_STRUCTURE.md.

3. **Implement Required Change 2** in `03_Logistics/ORDERS.md`:
   - Add the "Prototype v0.1 Canonical Order State Machine" section as defined above.
   - Do not modify or remove the existing narrative lifecycle section.

4. **Optionally implement** Changes 3 and 4 in the same PR for completeness.

5. **Validate** using the validation checklist (V-01 through V-12).

## Canonical State Machine (Final)

```
Created → Available → Accepted → PickedUp → Completed
                                 ↓               
                              Failed         
          (from Accepted or PickedUp on failure)
```

## Canonical State Values

`Created` | `Available` | `Accepted` | `PickedUp` | `Completed` | `Failed`

## Canonical Lifecycle Owner

`03_Logistics/ORDERS.md` — semantic definitions and allowed transitions

`09_Development/GAME_DATA_STRUCTURE.md` — exact stored technical values (subordinate)

---

# Validation Performed

| Check | Method | Result |
|---|---|---|
| Repository state on main branch | `git log --oneline -20`; branch confirmed | copilot/analyze-audit-finding-f07 at 3fc32374 |
| Next report sequence number | `ls 09_Development/AI_Reports/` | 017 confirmed |
| F-07 original finding | Read from 2026-07-12_001 audit | Transcribed verbatim into this report |
| ORDERS.md current state | File read | Narrative lifecycle only; no technical states |
| CORE_GAMEPLAY_SYSTEMS.md current state | File read | `In Progress`; no `Failed` |
| GAME_DATA_STRUCTURE.md current state | File read | `PickedUp`; includes `Failed` |
| GAMEPLAY_EVENTS_FLOW.md current state | File read | Correctly events; no state names |
| SAVE_SYSTEM.md | File read | Active order behavior compatible |
| Repository-wide state name search | grep across all .md files (excluding AI_Reports) | No additional contradictions found outside primary 3 documents |
| All other documents in scope | File read | Consistent or narrative only |

---

# Validation Results

- All files listed in scope were successfully read.
- Contradictions C-1 through C-4 are confirmed present in current main branch.
- The proposed correction covers all confirmed contradictions.
- No canonical files were modified.
- No historical AI Reports were modified.
- Report sequence number 017 is confirmed as the next available number.

---

# Unresolved Issues

None that block F-07 correction. All design decisions are resolvable from existing approved documents.

Optional improvement: `DeliveryFailed` event naming (Change 4) may be addressed during the implementation task but is not required to resolve F-07.

---

# Final Result/Status

**Status:** Analysis Complete — Correction Proposal Delivered

**F-07 Current Status:** UNRESOLVED in current main branch

**F-07 Post-Correction Status (if proposal approved and implemented):** FULLY RESOLVED

This report is created as a read-only proposal for human review. No canonical files were modified.

---

# Follow-up Actions

| Action | Owner | Priority |
|---|---|---|
| Human review and approval of this correction proposal | Human (project owner) | Required |
| Create implementation task for F-07 corrections | AI agent (after approval) | Required |
| Implement Required Change 1 (CORE_GAMEPLAY_SYSTEMS.md) | AI agent | Required |
| Implement Required Change 2 (ORDERS.md) | AI agent | Required |
| Implement Optional Change 3 (GAME_DATA_STRUCTURE.md cross-reference) | AI agent (discretionary) | Optional |
| Implement Optional Change 4 (GAMEPLAY_EVENTS_FLOW.md DeliveryFailed) | AI agent (discretionary) | Optional |
| Validate against V-01 through V-12 after implementation | AI agent | Required |
| Create implementation report after all changes committed | AI agent | Required |

---

End of Report
