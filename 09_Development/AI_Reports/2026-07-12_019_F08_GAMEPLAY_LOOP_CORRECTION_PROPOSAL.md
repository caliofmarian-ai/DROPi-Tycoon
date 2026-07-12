# Report Metadata

- Report ID: 2026-07-12_019
- Report title: F-08 Gameplay Loop Correction Proposal — Canonical Prototype v0.1 Loop Definition
- Date: 2026-07-12
- Project: DROPi Tycoon
- Task type: Analysis-Only / Correction Proposal
- Agent/model: GitHub Copilot Coding Agent (claude-sonnet-4.6)
- Repository: caliofmarian-ai/DROPi-Tycoon
- Branch: copilot/analyze-audit-finding-f-08
- Base commit: 6a0e8d322a84b557406a71ed6829d4175ca2034b
- Resulting commit: N/A (analysis-only; no canonical files modified)
- Pull Request: Pending (report-only PR; see Follow-up Actions)
- Human approval status: Pending review

---

# Original Task Instruction

Analyze audit finding F-08 in the DROPi Tycoon repository and produce a correction proposal.

This is an analysis-only task.

Do not modify any canonical project file.
Do not fix F-08 yet.
Do not analyze or fix unrelated audit findings.
Do not start GDevelop implementation.
Do not invent new gameplay steps, screens, events, systems, UI flows, progression layers, or Prototype v0.1 features.

OBJECTIVE

Resolve the documented inconsistency in the Prototype v0.1 core gameplay loop across the current repository.

The original audit found multiple loop definitions across:

- 01_GameDesign/GAMEPLAY.md
- 09_Development/PROTOTYPE_V0.1.md
- 09_Development/CORE_GAMEPLAY_SYSTEMS.md
- 09_Development/GAMEPLAY_EVENTS_FLOW.md
- 09_Development/FIRST_PLAYABLE_EXPERIENCE.md

The goal is to determine one canonical Prototype v0.1 loop and the minimum safe correction required to align all live documents without erasing their distinct responsibilities.

SOURCE OF TRUTH

Use:

- current main branch;
- 09_Development/AI_Reports/2026-07-12_001_FULL_DOCUMENTATION_CONSISTENCY_AUDIT.md;
- current versions of all files listed above;
- current approved corrections for F-01 through F-07;
- real current repository contents.

REQUIRED ANALYSIS

1. Read the complete original F-08 finding.

2. Search the complete repository for every definition or representation of:

- core gameplay loop;
- gameplay loop;
- delivery loop;
- main loop;
- player journey;
- first playable sequence;
- event flow;
- receive order;
- accept order;
- pickup;
- deliver;
- reward;
- upgrade;
- manage company;
- plan;
- repeat.

3. Build a complete inventory of all live non-historical gameplay-loop representations.

For every document provide:

- exact file path;
- exact section;
- exact step sequence;
- number of steps;
- purpose of the sequence;
- whether it represents long-term game design, Prototype v0.1 scope, implementation flow, event flow, tutorial flow, or UX flow;
- whether it is actually contradictory or merely a different level of abstraction.

4. Distinguish clearly between:

A. Long-term game loop.

B. Prototype v0.1 canonical gameplay loop.

C. First five-minute/tutorial sequence.

D. Technical event flow.

E. Company-management loop.

F. Player-facing UI/UX flow.

Do not force all documents to contain identical wording if they legitimately describe different abstraction levels.

5. Determine the canonical owner for:

- long-term gameplay loop;
- Prototype v0.1 gameplay loop;
- tutorial/first playable sequence;
- technical event flow.

The original audit recommended:

09_Development/PROTOTYPE_V0.1.md

as the canonical owner for the Prototype v0.1 loop.

Verify whether current repository governance and document responsibilities still support this.

6. Determine the exact minimum Prototype v0.1 gameplay loop.

Evaluate all current candidate steps, including:

- Start game
- View map
- Receive order
- Accept order
- Navigate to pickup
- Pick up package
- Navigate to destination
- Deliver package
- Receive payment
- Update reputation
- Save progress
- Purchase upgrade
- Manage company
- Plan next action
- Repeat

For each candidate step decide:

- REQUIRED in the canonical Prototype v0.1 loop;
- OPTIONAL/secondary;
- tutorial-only;
- technical-only;
- long-term-only;
- EXCLUDED.

7. Ensure the canonical loop is compatible with all already approved decisions:

- player starts on foot;
- Bicycle is first purchasable vehicle milestone;
- canonical Order lifecycle:
  Created → Available → Accepted → PickedUp → Completed / Failed;
- Save & Load exists in Prototype v0.1;
- Prototype v0.1 includes money and basic upgrades;
- drones and DronePorts are excluded;
- scene registry is MainMenu, GameWorld, CompanyManagement.

8. Determine whether Save & Load belongs as a visible step in the gameplay loop or as a background technical behavior.

Do not add it as a player-facing loop step unless current design evidence supports that.

9. Determine whether Bicycle purchase belongs inside the core loop or as a progression milestone reached after repeated loop cycles.

10. Determine whether company management should be:

- an explicit core-loop step;
- an optional between-deliveries action;
- a separate management sub-loop;
- excluded from the minimal Prototype v0.1 loop.

Use repository evidence.

11. Determine how failure fits into the gameplay loop.

The canonical lifecycle now includes Failed.

Analyze whether the gameplay loop should include:

- failure recovery;
- retry;
- return to available orders;
- penalty feedback;

without inventing new systems.

12. Define the recommended canonical Prototype v0.1 loop.

Provide:

- exact ordered happy path;
- failure branch;
- repeat point;
- optional management branch;
- relationship to Bicycle progression;
- relationship to autosave/background persistence;
- relationship to event flow.

13. Determine the exact role of each conflicting document after correction.

At minimum define:

- GAMEPLAY.md — long-term/general loop;
- PROTOTYPE_V0.1.md — canonical Prototype v0.1 loop;
- CORE_GAMEPLAY_SYSTEMS.md — system-level implementation summary;
- GAMEPLAY_EVENTS_FLOW.md — technical event sequence;
- FIRST_PLAYABLE_EXPERIENCE.md — tutorial/first-session sequence.

14. Identify every live document that must change to fully resolve F-08.

For each proposed change provide:

- exact file path;
- exact section;
- current issue;
- recommended correction;
- reason;
- REQUIRED or OPTIONAL.

15. Prefer the smallest safe correction set.

Do not rewrite entire documents.

Do not duplicate the complete canonical loop in every document if a concise cross-reference is sufficient.

16. Determine whether any other live document defines a conflicting Prototype v0.1 loop outside the five primary files.

If found:

- classify it;
- include it in the required correction set only if it is genuinely contradictory;
- otherwise record it as descriptive or out of scope.

17. Define a canonical hierarchy and cross-reference strategy preventing future drift.

18. Define validation criteria proving F-08 is fully resolved.

Validation must verify:

- one canonical Prototype v0.1 loop exists;
- other loop representations are explicitly classified;
- technical event flow maps to the canonical loop;
- tutorial flow does not redefine scope;
- long-term loop does not override Prototype v0.1;
- failure branch is compatible with the canonical Order lifecycle;
- Bicycle remains a progression milestone, not starting equipment;
- Save & Load remains background behavior unless explicitly designed otherwise;
- no unrelated finding is modified;
- no historical AI report is modified.

19. Determine whether implementing the proposal would make F-08:

- FULLY RESOLVED;
- PARTIALLY RESOLVED;
- NOT RESOLVED.

OUTPUT

Provide:

- Root Cause Analysis
- Complete Gameplay Loop Reference Inventory
- Abstraction-Level Classification Matrix
- Canonical Ownership Analysis
- Candidate Step Decision Table
- Recommended Canonical Prototype v0.1 Loop
- Failure Branch
- Optional Management Branch
- Bicycle Progression Relationship
- Save & Load Relationship
- Event Flow Relationship
- Document Responsibility Map
- Exact Correction Plan
- Required vs Optional File Changes
- Exact Files That Would Change
- Cross-Reference Strategy
- Validation Plan
- Risks
- Unresolved Design Decisions, if any
- Whether F-08 would be fully resolved
- Final Recommendation

REPORTING REQUIREMENT

This is a significant analysis-only task.

Follow:

09_Development/AI_REPORTING_PROTOCOL.md

Create the next persistent report in:

09_Development/AI_Reports/

Verify the next sequence number from the real repository state before creating it.

The report must preserve this exact task instruction and the complete substantive analysis result.

Because this task creates its required persistent report as part of completion, do not create an additional recursive self-report.

Modify only the new report file inside:

09_Development/AI_Reports/

Do not modify any canonical project file.

Create a report-only Pull Request for human review.

Do not merge the Pull Request.

AT COMPLETION PROVIDE

- exact report file created;
- evidence sources used;
- root cause summary;
- recommended canonical Prototype v0.1 loop;
- recommended canonical owner;
- failure branch;
- optional management branch;
- Bicycle relationship;
- Save & Load relationship;
- exact required files that would change if approved;
- exact optional files;
- unresolved design decisions, if any;
- whether F-08 would be fully resolved;
- validation results;
- Pull Request link.

---

# Objective

Determine the single canonical Prototype v0.1 gameplay loop; classify every competing loop representation by abstraction level; produce the minimum safe correction plan to resolve F-08 without rewriting documents or erasing their distinct roles.

---

# Scope

- Audit finding F-08 only.
- Five primary documents plus any live secondary documents that define a conflicting Prototype v0.1 loop.
- Analysis and proposal only; no canonical file modifications in this report.
- Must be compatible with all decisions approved in F-01 through F-07.

---

# Files Inspected

| File | Role |
|---|---|
| `09_Development/AI_Reports/2026-07-12_001_FULL_DOCUMENTATION_CONSISTENCY_AUDIT.md` | Source of F-08 finding (lines 551–578) |
| `01_GameDesign/GAMEPLAY.md` | Primary source — long-term loop |
| `09_Development/PROTOTYPE_V0.1.md` | Primary source — Prototype v0.1 loop |
| `09_Development/CORE_GAMEPLAY_SYSTEMS.md` | Primary source — system implementation loop |
| `09_Development/GAMEPLAY_EVENTS_FLOW.md` | Primary source — technical event flow |
| `09_Development/FIRST_PLAYABLE_EXPERIENCE.md` | Primary source — tutorial/first-session sequence |
| `03_Logistics/ORDERS.md` | Canonical Order lifecycle (F-07 result) |
| `06_Technical/SAVE_SYSTEM.md` | Save & Load behavior definition |
| `09_Development/AI_REPORTING_PROTOCOL.md` | Report format governance |
| `09_Development/AI_Reports/2026-07-12_018_F07_ORDER_LIFECYCLE_CORRECTION_IMPLEMENTATION.md` | Approved F-07 decisions |
| `06_Technical/TDD.md` | Secondary — references "basic delivery loop" descriptively |
| `06_Technical/SAFE_SYSTEM.md` | Secondary — references "fun gameplay loop" descriptively |
| `09_Development/PROTOTYPE_RELEASE_CHECKLIST.md` | Secondary — references "gameplay loop is functional" descriptively |
| `09_Development/PROTOTYPE_TESTING_PLAN.md` | Secondary — references "main gameplay loop" descriptively |
| `07_UI/UX.md` | Secondary — references "simple delivery loop" descriptively |
| `09_Development/DEVELOPMENT_WORKFLOW.md` | Secondary — references "core gameplay loop" descriptively |
| `09_Development/FIRST_MAP_DESIGN.md` | Secondary — references "core delivery gameplay loop" descriptively |
| `09_Development/PROTOTYPE_BUILD_PIPELINE.md` | Secondary — references "loop functional" descriptively |

---

# Files Created

| File | Description |
|---|---|
| `09_Development/AI_Reports/2026-07-12_019_F08_GAMEPLAY_LOOP_CORRECTION_PROPOSAL.md` | This report |

---

# Files Modified

None. This is an analysis-only task.

---

# Files Moved or Renamed

None.

---

# Files Deleted

None.

---

# Actions Performed

1. Read the complete F-08 finding from the original audit report (lines 551–578).
2. Read all five primary documents in full.
3. Read `03_Logistics/ORDERS.md` (canonical Order lifecycle per F-07).
4. Read `06_Technical/SAVE_SYSTEM.md` (save trigger definitions).
5. Searched the complete repository for all files referencing "gameplay loop," "core loop," "delivery loop," "main loop," "repeat," "receive order," "accept order," "manage company," and related terms.
6. Classified each reference by abstraction level and contradiction status.
7. Evaluated all candidate loop steps against repository evidence and approved decisions.
8. Defined the canonical Prototype v0.1 loop, failure branch, and optional management branch.
9. Identified the minimum safe correction set.
10. Defined the cross-reference strategy, validation plan, and resolution status.
11. Created this report.

---

# Findings

## F-08 Original Finding (Verbatim from Audit Report)

**Severity:** MAJOR
**Title:** The core gameplay loop has five different definitions across canonical documents

**Files Involved:**
- `01_GameDesign/GAMEPLAY.md`
- `09_Development/PROTOTYPE_V0.1.md`
- `09_Development/CORE_GAMEPLAY_SYSTEMS.md`
- `09_Development/GAMEPLAY_EVENTS_FLOW.md`
- `09_Development/FIRST_PLAYABLE_EXPERIENCE.md`

**Sections Involved:**
- Each document's gameplay loop / core loop section

**Evidence:**
- `GAMEPLAY.md` defines a 10-step loop: Start → View Map → Accept Order → Navigate → Pickup → Deliver → Receive Payment → Manage Company → Plan → Repeat
- `PROTOTYPE_V0.1.md` defines a 5-step loop: Receive Order → Accept → Pickup → Deliver → Reward
- `CORE_GAMEPLAY_SYSTEMS.md` defines a 6-step loop
- `GAMEPLAY_EVENTS_FLOW.md` defines events, not explicit steps
- `FIRST_PLAYABLE_EXPERIENCE.md` defines an 8-step experience

**Why It Matters:** An agent generating `GameplayEventsFlow` will pick one of these as the event sequence template. GDevelop events built on the `GAMEPLAY.md` 10-step loop will not match the simpler 5-step `PROTOTYPE_V0.1.md` loop.

**Recommended Correction:** Declare `09_Development/PROTOTYPE_V0.1.md` as the single authoritative gameplay loop definition for v0.1. Add a note in other documents that they describe the long-term vision loop, not the prototype implementation loop.

**Canonical Ownership:** `09_Development/PROTOTYPE_V0.1.md` for v0.1; `01_GameDesign/GAMEPLAY.md` for long-term vision.

---

## Root Cause Analysis

### Primary Root Cause

F-08 has a **split root cause**:

**Cause A — Genuine structural inconsistency:** `PROTOTYPE_V0.1.md` and `CORE_GAMEPLAY_SYSTEMS.md` each define a Prototype v0.1 loop using different step vocabulary and different step counts, with no declared canonical ownership between them.

**Cause B — Abstraction-level conflation:** `GAMEPLAY.md`, `GAMEPLAY_EVENTS_FLOW.md`, and `FIRST_PLAYABLE_EXPERIENCE.md` were incorrectly treated in the original audit as direct competitors to the Prototype v0.1 loop. They actually describe different abstraction levels (long-term vision, technical event flow, tutorial UX sequence) and are not true loop-level contradictions.

**Cause C — Missing failure branch:** No document fully integrates the `PickedUp → Failed` failure path (added canonically in F-07) into a gameplay loop representation.

**Cause D — Lifecycle state mapping gap:** The Prototype v0.1 loop in `PROTOTYPE_V0.1.md` was written before F-07 established the canonical Order lifecycle. It does not map its steps to `Created → Available → Accepted → PickedUp → Completed / Failed`.

**Cause E — No declared canonical owner:** No document explicitly declares itself as the sole canonical authority for the Prototype v0.1 loop definition. The audit recommended `PROTOTYPE_V0.1.md` but the document itself does not assert this ownership.

### Impact Assessment

Without correction:
- An implementation agent may use the CORE_GAMEPLAY_SYSTEMS.md loop (starting with system-driven "Create Order") to design GDevelop events, creating events that cannot be triggered by player action.
- The failure state (`DeliveryFailed`) established in F-07 has no home in the player-facing loop.
- The canonical Order lifecycle cannot be traced back to player-visible loop steps.

---

## Complete Gameplay Loop Reference Inventory

### Document 1: `01_GameDesign/GAMEPLAY.md`

**Section:** "Core Gameplay Loop"

**Exact Step Sequence:**
1. Receive Customer Demand
2. Accept Delivery Orders
3. Plan Logistics
4. Assign Resources
5. Deliver Packages
6. Generate Revenue
7. Pay Expenses
8. Analyze Performance
9. Invest in Growth
10. Expand Operations
11. Repeat

**Step Count:** 10 action steps + Repeat

**Purpose:** Defines the repeating high-level business cycle from startup to global corporation. Every step applies to the full game lifespan, not a single delivery.

**Abstraction Level:** Long-term game design loop (strategic/company level)

**Note:** The audit evidence described a different 10-step sequence for this file ("Start → View Map → Accept Order → Navigate → Pickup → Deliver → Receive Payment → Manage Company → Plan → Repeat"). The current file contains the strategic/management loop above. The difference is consistent with earlier F-01/F-03 corrections that added a Bicycle cross-reference note to this file. The current content is a higher-abstraction strategic loop, not a player delivery loop.

**Genuinely Contradictory?** NO — Different abstraction level (strategic company management vs player delivery cycle). No direct Prototype v0.1 scope claim beyond the Early Game section cross-reference note.

---

### Document 2: `09_Development/PROTOTYPE_V0.1.md`

**Section:** "Core Gameplay Loop"

**Exact Step Sequence:**
1. Receive Order
2. Choose Delivery Method
3. Complete Delivery
4. Receive Payment
5. Upgrade Company
6. Accept More Opportunities
7. Repeat

**Step Count:** 6 action steps + Repeat

**Purpose:** Defines the core repeating player action loop for Prototype v0.1.

**Abstraction Level:** Prototype v0.1 canonical gameplay loop (player-facing, high abstraction)

**Issues Identified:**
- Does not map steps to the canonical Order lifecycle states (Created → Available → Accepted → PickedUp → Completed / Failed).
- "Receive Order" and "Accept Order" are collapsed into one step ("Receive Order"), but the lifecycle distinguishes them: the Order becomes Available, then the player Accepts it.
- "Choose Delivery Method" is an implementation detail for the tutorial (walk vs Bicycle), not a repeating loop step — every cycle the player uses whatever transport they have.
- "Upgrade Company" appears as a mandatory loop step, but upgrades are optional between-delivery actions, not required every cycle.
- The failure branch (PickedUp → Failed) is absent.
- No explicit declaration of canonical ownership.

**Genuinely Contradictory?** PARTIALLY — This is the intended canonical document, but its current loop text is internally misaligned with the canonical Order lifecycle (F-07) and missing the failure branch.

---

### Document 3: `09_Development/CORE_GAMEPLAY_SYSTEMS.md`

**Section:** "Core Gameplay Loop"

**Exact Step Sequence:**
1. Create Order
2. Accept Order
3. Collect Package
4. Deliver Package
5. Receive Reward
6. Improve Company
7. Unlock Better Opportunities
8. Repeat

**Step Count:** 7 action steps + Repeat

**Purpose:** Defines the loop from the system implementation perspective for Prototype v0.1. Includes the system-driven "Create Order" step, which is not a player action.

**Abstraction Level:** System implementation flow (developer-facing, Prototype v0.1 scope)

**Issues Identified:**
- "Create Order" is a system-driven action (the game generates orders), not a player step. Starting the loop with a system action misrepresents the player's entry point.
- Parallel with PROTOTYPE_V0.1.md with different vocabulary and step count, without acknowledging PROTOTYPE_V0.1.md as the canonical loop owner.
- No failure branch.
- No cross-reference to the canonical lifecycle.

**Genuinely Contradictory?** YES — Defines a parallel Prototype v0.1 loop without declaring a relationship to the canonical owner, creating ambiguity about which loop should guide implementation.

---

### Document 4: `09_Development/GAMEPLAY_EVENTS_FLOW.md`

**Section:** "Main Event Flow"

**Exact Step Sequence (generic pattern):**
1. Player Action
2. Game Event Created
3. Relevant System Processes Event
4. Game State Updated
5. UI Feedback Displayed

**Additional subsections (not a loop, but a sequence of event flows):**
- Order Creation Flow (4-step process)
- Order Acceptance Flow (4-step process)
- Package Pickup Flow (3-step process)
- Delivery Completion Flow (4-step process)
- Economy Event Flow (3-step process)
- Upgrade Flow (4-step process)
- Order Lifecycle Event-to-Transition Mapping (added by F-07 correction)

**Step Count:** 5-step generic pattern + 6 specific event flows

**Purpose:** Defines how gameplay events communicate between systems using an event-driven architecture. Maps events to state transitions.

**Abstraction Level:** Technical event flow (developer-facing, system communication layer)

**Genuinely Contradictory?** NO — This document does not define a gameplay loop. It defines how individual events propagate through systems. The "Main Event Flow" is a generic event-processing pattern, not a loop definition. Per F-07, the document now includes a lifecycle event-to-transition mapping table that correctly maps all events to canonical lifecycle states.

---

### Document 5: `09_Development/FIRST_PLAYABLE_EXPERIENCE.md`

**Section:** "First Tutorial Sequence" (Steps 1–5)

**Exact Step Sequence:**
1. Step 1: Receive First Order
2. Step 2: Choose Delivery Method
3. Step 3: Complete Delivery
4. Step 4: First Reward
5. Step 5: First Upgrade (Purchase Bicycle after on-foot deliveries)

**Step Count:** 5 tutorial steps

**Purpose:** Defines the specific UX sequence a new player experiences in the first five minutes. Teaches mechanics through action. The Bicycle appears at Step 5 as the first upgrade milestone.

**Abstraction Level:** Tutorial/first-session UX flow (player-facing, onboarding scope)

**Genuinely Contradictory?** NO — This is a tutorial flow, not a repeating loop. "Choose Delivery Method" is appropriate here because a tutorial must explicitly present the option. Steps 1–4 represent the first pass through the loop; Step 5 represents the first upgrade milestone, which is a one-time event. This is a UX sequence, not a competing loop definition.

---

### Secondary Document References (Non-Contradictory)

| File | Reference | Classification |
|---|---|---|
| `06_Technical/TDD.md` | "Basic delivery loop" (line 216) | Descriptive reference only |
| `06_Technical/SAFE_SYSTEM.md` | "Fun gameplay loop" (line 171) | Descriptive reference only |
| `09_Development/PROTOTYPE_RELEASE_CHECKLIST.md` | "The gameplay loop is functional" / "Is the core loop fun?" | Quality criteria reference only |
| `09_Development/PROTOTYPE_TESTING_PLAN.md` | "Main gameplay loop works" / "Complete gameplay loop works" | Test criteria reference only |
| `07_UI/UX.md` | "Simple delivery loop" | UX design principle reference only |
| `09_Development/DEVELOPMENT_WORKFLOW.md` | "Protect the core gameplay loop" | Workflow principle reference only |
| `09_Development/FIRST_MAP_DESIGN.md` | "Core delivery gameplay loop" | World-design context reference only |
| `09_Development/PROTOTYPE_BUILD_PIPELINE.md` | "Is the loop functional?" | Build validation criterion only |

**Conclusion on secondary documents:** None define a competing Prototype v0.1 loop. All references are descriptive or quality-criterion references that do not enumerate loop steps. None require correction for F-08.

---

## Abstraction-Level Classification Matrix

| Document | Classification | Scope | Contradictory? | Requires Change? |
|---|---|---|---|---|
| `01_GameDesign/GAMEPLAY.md` | A — Long-term game loop | Full game lifespan | No | Optional (add scope clarifier) |
| `09_Development/PROTOTYPE_V0.1.md` | B — Prototype v0.1 canonical loop | Prototype v0.1 | Partially (lifecycle gap, no failure branch) | REQUIRED |
| `09_Development/CORE_GAMEPLAY_SYSTEMS.md` | System implementation flow (Prototype v0.1 scope) | Prototype v0.1 | Yes (parallel loop, no ownership declaration) | REQUIRED |
| `09_Development/GAMEPLAY_EVENTS_FLOW.md` | D — Technical event flow | Prototype v0.1 | No | Optional (add cross-reference) |
| `09_Development/FIRST_PLAYABLE_EXPERIENCE.md` | C — Tutorial/first-session sequence | First 5 minutes | No | Optional (add scope clarifier) |
| Secondary files (8 documents) | Descriptive references | Various | No | None |

---

## Canonical Ownership Analysis

### Long-term Gameplay Loop Owner
**`01_GameDesign/GAMEPLAY.md`** — confirmed by document header ("Status: Canonical"), "Canonical Rule" section, and content (company-management strategic steps spanning full game lifespan). No change to this ownership.

### Prototype v0.1 Gameplay Loop Owner
**`09_Development/PROTOTYPE_V0.1.md`** — confirmed as the correct canonical owner by:
- Document header ("Status: Development Milestone Definition")
- Document scope ("defines the first playable prototype of DROPi Tycoon")
- Audit recommendation (report 001, F-08 finding)
- Repository governance: this is the only document whose primary purpose is to scope Prototype v0.1

The document must explicitly declare its canonical ownership of the Prototype v0.1 loop in the Core Gameplay Loop section.

### Tutorial/First Playable Sequence Owner
**`09_Development/FIRST_PLAYABLE_EXPERIENCE.md`** — confirmed by document header ("Status: Prototype Design"), purpose ("defines the first experience a player has"), and five-step tutorial structure.

### Technical Event Flow Owner
**`09_Development/GAMEPLAY_EVENTS_FLOW.md`** — confirmed by document header ("Status: Prototype Technical Design"), purpose ("defines how gameplay events communicate"), and event-to-transition mapping table (added by F-07).

### System Implementation Reference
**`09_Development/CORE_GAMEPLAY_SYSTEMS.md`** — confirmed by document header ("Status: Prototype Design") and content (seven system definitions with implementation priority). The Core Gameplay Loop section in this document represents the system-level implementation sequence, not the canonical player-facing loop.

---

## Candidate Step Decision Table

| Candidate Step | Decision | Reason |
|---|---|---|
| Start game | EXCLUDED | Pre-loop action; handled by MainMenu scene before the loop begins |
| View map | EXCLUDED | Navigation is implicit player movement within the world; not a discrete loop milestone |
| Receive order | REQUIRED | Player entry point to each loop cycle; maps to Order state Available (presented to player) |
| Accept order | REQUIRED | Explicit player decision; maps to canonical state transition Available → Accepted |
| Navigate to pickup | REQUIRED | Delivery sub-step; necessary for PickedUp state; implicit in "Pick up package" but required for correct lifecycle mapping |
| Pick up package | REQUIRED | Maps to canonical state transition Accepted → PickedUp; confirmed by Package Pickup Flow in GAMEPLAY_EVENTS_FLOW.md |
| Navigate to destination | REQUIRED | Delivery sub-step; precondition for Deliver Package |
| Deliver package | REQUIRED | Maps to canonical state transition PickedUp → Completed (happy path) |
| Receive payment | REQUIRED | Core economy feedback; player must see result of delivery; confirmed in all five primary documents |
| Update reputation | OPTIONAL/secondary | Reputation update is automatic system behavior triggered by DeliveryCompleted / DeliveryFailed events; not a player-visible loop step |
| Save progress | TECHNICAL BACKGROUND | Per SAVE_SYSTEM.md, saves are automatic triggers (autosave after delivery completion and upgrade purchase); not a player-facing loop step |
| Purchase upgrade | OPTIONAL | Available between-delivery cycles; not required every iteration; Bicycle is first upgrade milestone |
| Manage company | OPTIONAL/separate branch | Available via CompanyManagement scene; not required for delivery loop completion |
| Plan next action | EXCLUDED | Meta-cognitive player activity; not a game mechanic with a defined event |
| Repeat | REQUIRED | Closes the loop; returns to "Receive order" |

---

## Recommended Canonical Prototype v0.1 Loop

### Happy Path

```
Receive Order          [Order: Available — presented to player]
        ↓
Accept Order           [Order: Available → Accepted]
        ↓
Navigate to Pickup Location
        ↓
Pick Up Package        [Order: Accepted → PickedUp]
        ↓
Navigate to Destination
        ↓
Deliver Package        [Order: PickedUp → Completed]
        ↓
Receive Payment        [Economy: MoneyReceived event]
        ↓
Repeat
```

**Step count:** 7 action steps + Repeat

**Note on abstraction:** "Navigate to Pickup Location" and "Navigate to Destination" are player movement steps within the GameWorld scene. They do not represent new scenes or systems. They are included because they map to the Order lifecycle transitions (Accepted → PickedUp requires physical arrival at pickup; PickedUp → Completed requires physical arrival at destination).

---

## Failure Branch

The canonical Order lifecycle (F-07) defines `PickedUp → Failed` as the failure path.

```
[During Navigate to Destination or Deliver Package step]
        ↓
Failure Condition Triggered
(time exceeded / wrong destination / system failure)
        ↓
Order Failed           [Order: PickedUp → Failed]
        ↓
Reputation Penalty     [Automatic system behavior]
        ↓
Return to Receive Order
```

**Failure recovery:** The player returns to the top of the loop (Receive Order). No retry of the same order is defined for Prototype v0.1. The Failed state is terminal per the canonical lifecycle.

**Note:** Failure conditions (time limit threshold, wrong-destination detection) are implementation details not defined here. This proposal does not invent new systems; it integrates the existing canonical `Failed` state into the loop representation.

---

## Optional Management Branch

```
[After Receive Payment, before Repeat]
        ↓
[Optional] Open Company Management
        ↓
[Optional] Purchase Upgrade or Manage Resources
        ↓
Return to Repeat
```

**Company management classification:** An optional between-deliveries action. It is NOT an explicit core-loop step. Players may open the CompanyManagement scene at will between deliveries. It is not required to complete a delivery cycle.

**Evidence:** `GAMEPLAY.md` describes company management as a Mid/Late Game activity. `CORE_GAMEPLAY_SYSTEMS.md` System 5 and System 7 define upgrades and progression as asynchronous to delivery cycles. `PROTOTYPE_V0.1.md` Prototype Scope lists "Company progression" as a separate included system, not a loop step.

---

## Bicycle Progression Relationship

The Bicycle is a **one-time progression milestone** reached after repeated loop cycles, not a step in the core loop.

**Location in the loop:** The Bicycle is purchased through the **Optional Management Branch** (Purchase Upgrade) after sufficient money has been accumulated from on-foot deliveries. After purchase, the player returns to the top of the loop and all subsequent navigation steps execute at Bicycle speed.

**Current PROTOTYPE_V0.1.md evidence (Transportation System section):**
```
Player starts on foot
      ↓
Player completes initial deliveries
      ↓
Player earns money
      ↓
Player purchases the Bicycle
      ↓
Bicycle becomes owned persistently
      ↓
Bicycle increases movement speed
```

This progression sequence is already correctly defined in `PROTOTYPE_V0.1.md`. It does not need to be embedded in the core loop. The core loop remains unchanged; the Bicycle changes how fast "Navigate to Pickup Location" and "Navigate to Destination" execute.

**Compatibility check:** Player starts on foot (confirmed). Bicycle is first purchasable vehicle milestone (confirmed). Bicycle is not starting equipment (confirmed). No other vehicles required for Prototype v0.1 (confirmed).

---

## Save & Load Relationship

**Decision: Save & Load is a background technical behavior. It does NOT appear as a player-facing loop step.**

**Evidence from `06_Technical/SAVE_SYSTEM.md`:**

> "Autosave triggers after each meaningful completed action."

Save triggers:
- Delivery completion
- Upgrade purchase

Both triggers align exactly with delivery loop events:
- "Deliver Package → Receive Payment" triggers autosave (delivery completion).
- "Purchase Upgrade" in the optional branch triggers autosave (upgrade purchase).

The player does not initiate saves manually. The save is invisible to the player during normal gameplay. Therefore, "Save progress" is correctly classified as TECHNICAL BACKGROUND and must not appear as a numbered step in the canonical loop.

**SAVE_SYSTEM.md scope note:** `PROTOTYPE_V0.1.md` already contains: "Local Save & Load system (minimal; see `06_Technical/SAVE_SYSTEM.md`)" in the Included Systems section. This is sufficient acknowledgment.

---

## Event Flow Relationship

The `GAMEPLAY_EVENTS_FLOW.md` technical event flow maps directly to the recommended canonical loop:

| Canonical Loop Step | Triggering Event | State Transition |
|---|---|---|
| Receive Order | `OrderCreated` (system) → `OrderCreated` state, then system-driven to `Available` | Created → Available |
| Accept Order | `OrderAccepted` | Available → Accepted |
| Pick Up Package | `PackagePickedUp` | Accepted → PickedUp |
| Deliver Package (success) | `DeliveryCompleted` | PickedUp → Completed |
| Receive Payment | `MoneyReceived` | Economy update |
| Purchase Upgrade (optional) | `UpgradePurchased` | Economy deduction + effect applied |
| Deliver Package (failure) | `DeliveryFailed` | PickedUp → Failed |

All events in the MVP Event List (`GameStarted`, `OrderCreated`, `OrderAccepted`, `PackagePickedUp`, `DeliveryCompleted`, `DeliveryFailed`, `MoneyReceived`, `UpgradePurchased`) map correctly to the recommended canonical loop. No new events are needed. No events are orphaned.

**Navigation steps** ("Navigate to Pickup Location", "Navigate to Destination") do not trigger named events; they are continuous player movement within the GameWorld scene, terminated by proximity detection that fires `PackagePickedUp` or `DeliveryCompleted`.

---

## Document Responsibility Map

| Document | Primary Role After Correction | Loop Type | Scope |
|---|---|---|---|
| `01_GameDesign/GAMEPLAY.md` | Long-term game design loop owner | Strategic/company management | Full game lifespan |
| `09_Development/PROTOTYPE_V0.1.md` | **Canonical Prototype v0.1 loop owner** | Player-facing delivery cycle | Prototype v0.1 |
| `09_Development/CORE_GAMEPLAY_SYSTEMS.md` | System implementation reference | Developer-facing system flow | Prototype v0.1 |
| `09_Development/GAMEPLAY_EVENTS_FLOW.md` | Technical event communication flow | System events and transitions | Prototype v0.1 |
| `09_Development/FIRST_PLAYABLE_EXPERIENCE.md` | Tutorial/first-session UX sequence | Onboarding flow | First 5 minutes |

---

# Recommendations

## Exact Correction Plan

### REQUIRED Change 1: `09_Development/PROTOTYPE_V0.1.md`

**Section:** "Core Gameplay Loop"

**Current issue:**
- Loop does not map to canonical lifecycle states.
- "Receive Order" and "Accept Order" are conflated.
- "Choose Delivery Method" is a tutorial detail, not a repeating loop step.
- "Upgrade Company" appears as a mandatory loop step.
- Failure branch (PickedUp → Failed) is absent.
- No canonical ownership declaration.

**Recommended correction:**

Replace the current Core Gameplay Loop section with:

1. An explicit declaration that this section defines the canonical Prototype v0.1 gameplay loop.
2. The 7-step happy path with lifecycle state annotations.
3. The failure branch.
4. The optional management branch.

The Bicycle Progression sequence in the Transportation System section and the Included Systems list are already correct and require no change.

**Reason:** `PROTOTYPE_V0.1.md` is the declared canonical owner of the Prototype v0.1 loop. The loop must accurately reflect the canonical Order lifecycle established in F-07.

**Classification:** REQUIRED

---

### REQUIRED Change 2: `09_Development/CORE_GAMEPLAY_SYSTEMS.md`

**Section:** "Core Gameplay Loop"

**Current issue:**
- Defines a parallel Prototype v0.1 loop starting with system-driven "Create Order," which is not a player action.
- No acknowledgment of `PROTOTYPE_V0.1.md` as the canonical loop owner.
- No cross-reference to the canonical lifecycle.
- Ambiguity: an implementation agent cannot determine whether to follow this loop or the one in `PROTOTYPE_V0.1.md`.

**Recommended correction:**

Add a scope clarifier at the beginning of the Core Gameplay Loop section identifying this as the system implementation flow, not the player-facing canonical loop, with a cross-reference to `PROTOTYPE_V0.1.md` for the canonical loop.

Do NOT remove the current loop steps; they describe system interactions accurately. The addition of a one-sentence cross-reference and scope label is sufficient.

**Reason:** The parallel loop without declared ownership is the primary F-08 contradiction. A cross-reference resolves the ambiguity without rewriting the document.

**Classification:** REQUIRED

---

### OPTIONAL Change 3: `09_Development/GAMEPLAY_EVENTS_FLOW.md`

**Section:** "Main Event Flow" or document header Purpose section

**Current issue:**
- No explicit acknowledgment that the canonical Prototype v0.1 loop is defined in `PROTOTYPE_V0.1.md`.
- The Main Event Flow generic pattern could be mistaken for a loop definition.

**Recommended correction:**

Add one sentence in the Purpose section clarifying that this document defines technical event communication, not the canonical gameplay loop, with a cross-reference to `PROTOTYPE_V0.1.md`.

**Reason:** The document is not contradictory, but the clarification prevents future drift when an agent reads this document in isolation.

**Classification:** OPTIONAL

---

### OPTIONAL Change 4: `09_Development/FIRST_PLAYABLE_EXPERIENCE.md`

**Section:** "First Tutorial Sequence" or document header Purpose section

**Current issue:**
- Tutorial steps could be misread as a competing loop definition by an agent that does not recognize the UX scope.
- "Choose Delivery Method" appears as Step 2, which was flagged in the original audit as a loop inconsistency (though it is appropriate for a tutorial context).

**Recommended correction:**

Add one sentence in the Purpose section clarifying that this document defines the tutorial/first-session sequence, not the canonical repeating gameplay loop, with a cross-reference to `PROTOTYPE_V0.1.md`.

**Reason:** The document is not contradictory, but the clarifier prevents the tutorial steps from being used as the canonical loop reference.

**Classification:** OPTIONAL

---

### OPTIONAL Change 5: `01_GameDesign/GAMEPLAY.md`

**Section:** "Core Gameplay Loop"

**Current issue:**
- The Core Gameplay Loop section contains the strategic long-term loop but does not explicitly state that it applies to the full game lifespan, not Prototype v0.1.
- The Early Game section already contains a cross-reference to `PROTOTYPE_V0.1.md` for the Bicycle, but the Core Gameplay Loop section itself has no scope qualifier.

**Recommended correction:**

Add one sentence in the Core Gameplay Loop section clarifying that this is the long-term strategic gameplay loop applicable to all game phases, and that the Prototype v0.1 loop is defined in `09_Development/PROTOTYPE_V0.1.md`.

**Reason:** The document is not contradictory at the current abstraction level, but the clarifier closes any remaining ambiguity about the long-term loop overriding the prototype loop.

**Classification:** OPTIONAL

---

## Required vs Optional File Changes

| File | Classification | Reason |
|---|---|---|
| `09_Development/PROTOTYPE_V0.1.md` | REQUIRED | Primary contradiction: loop misaligned with canonical lifecycle; missing failure branch; no ownership declaration |
| `09_Development/CORE_GAMEPLAY_SYSTEMS.md` | REQUIRED | Primary contradiction: parallel loop without ownership declaration; system-driven first step misrepresents player entry point |
| `09_Development/GAMEPLAY_EVENTS_FLOW.md` | OPTIONAL | Not contradictory; cross-reference prevents future drift |
| `09_Development/FIRST_PLAYABLE_EXPERIENCE.md` | OPTIONAL | Not contradictory; scope clarifier prevents misinterpretation |
| `01_GameDesign/GAMEPLAY.md` | OPTIONAL | Not contradictory; scope clarifier closes residual ambiguity |

---

## Exact Files That Would Change (If Approved)

**REQUIRED (2 files):**
1. `09_Development/PROTOTYPE_V0.1.md`
2. `09_Development/CORE_GAMEPLAY_SYSTEMS.md`

**OPTIONAL (3 files):**
3. `09_Development/GAMEPLAY_EVENTS_FLOW.md`
4. `09_Development/FIRST_PLAYABLE_EXPERIENCE.md`
5. `01_GameDesign/GAMEPLAY.md`

**Confirmed NOT changing:**
- All secondary files (8 documents with descriptive references)
- All `09_Development/AI_Reports/` files (historical records)
- `03_Logistics/ORDERS.md` (canonical lifecycle already correct per F-07)
- `06_Technical/SAVE_SYSTEM.md` (save behavior already correctly defined)

---

## Cross-Reference Strategy

To prevent future drift after correction:

1. **PROTOTYPE_V0.1.md** declares explicit canonical ownership: the Core Gameplay Loop section states "This section defines the canonical Prototype v0.1 gameplay loop. All other documents that reference a gameplay loop for Prototype v0.1 defer to this definition."

2. **CORE_GAMEPLAY_SYSTEMS.md** adds: "The loop above represents the system implementation flow. The canonical Prototype v0.1 player-facing gameplay loop is defined in `09_Development/PROTOTYPE_V0.1.md`."

3. **GAMEPLAY_EVENTS_FLOW.md** (optional) adds: "This document defines technical event communication. The canonical Prototype v0.1 gameplay loop is defined in `09_Development/PROTOTYPE_V0.1.md`."

4. **FIRST_PLAYABLE_EXPERIENCE.md** (optional) adds: "This document defines the tutorial/first-session sequence. The canonical repeating Prototype v0.1 gameplay loop is defined in `09_Development/PROTOTYPE_V0.1.md`."

5. **GAMEPLAY.md** (optional) adds in the Core Gameplay Loop section: "This is the long-term strategic gameplay loop. For the Prototype v0.1 loop, see `09_Development/PROTOTYPE_V0.1.md`."

**Governance rule implied:** Only `09_Development/PROTOTYPE_V0.1.md` may define the enumerated steps of the Prototype v0.1 gameplay loop. Other documents may reference the loop by name and cross-reference only.

---

# Validation Performed

This is an analysis-only task. Validation was performed through document reading and evidence comparison. No runtime validation is possible.

---

# Validation Results

## Validation Criteria (From Task Instruction)

| Criterion | Status | Evidence |
|---|---|---|
| One canonical Prototype v0.1 loop exists | WILL PASS after REQUIRED changes | `PROTOTYPE_V0.1.md` declared as owner with corrected loop |
| Other loop representations are explicitly classified | WILL PASS after REQUIRED changes | CORE_GAMEPLAY_SYSTEMS.md gets classification note; OPTIONAL changes add classifiers to remaining docs |
| Technical event flow maps to the canonical loop | PASSES NOW | F-07 event-to-transition mapping covers all canonical loop steps |
| Tutorial flow does not redefine scope | PASSES NOW | FIRST_PLAYABLE_EXPERIENCE.md is a 5-step tutorial, not a repeating loop |
| Long-term loop does not override Prototype v0.1 | PASSES NOW | GAMEPLAY.md is clearly strategic/management level; does not claim Prototype v0.1 scope |
| Failure branch is compatible with canonical Order lifecycle | WILL PASS after REQUIRED changes | Failure branch added to `PROTOTYPE_V0.1.md` using PickedUp → Failed |
| Bicycle remains a progression milestone, not starting equipment | PASSES NOW | `PROTOTYPE_V0.1.md` Transportation System section already correct |
| Save & Load remains background behavior | PASSES NOW | `SAVE_SYSTEM.md` defines autosave triggers; no player-facing loop step added |
| No unrelated finding is modified | PASSES NOW | Analysis scope confirmed to F-08 only |
| No historical AI report is modified | PASSES NOW | No historical reports were modified |

---

# Unresolved Issues

### Unresolved Design Decision D-01: Failure Condition Thresholds

**Description:** The canonical Order lifecycle defines `PickedUp → Failed` as triggered by "time exceeded, wrong destination, or system failure." The failure branch has been incorporated into the recommended loop, but the specific threshold values (time limit per delivery, wrong-destination tolerance) are not defined anywhere in the repository.

**Impact on F-08:** None — the failure branch can be defined without exact thresholds. The loop representation is complete. Threshold values are an implementation detail for the balancing phase.

**Recommended action:** Define time limits and failure penalties in `09_Development/GAME_BALANCING_RULES.md` during the implementation phase. Do not block F-08 resolution on this.

---

### Unresolved Design Decision D-02: Reputation Penalty Magnitude

**Description:** `CORE_GAMEPLAY_SYSTEMS.md` System 6 defines that reputation decreases on failed deliveries, but no penalty magnitude is specified.

**Impact on F-08:** None — reputation update is classified as OPTIONAL/secondary (automatic system behavior). It does not appear as a player-facing loop step. Penalty magnitude is a balancing decision.

**Recommended action:** Define in `09_Development/GAME_BALANCING_RULES.md`. Do not block F-08 resolution on this.

---

### Unresolved Design Decision D-03: "Receive Order" vs "View Available Orders"

**Description:** The recommended loop starts with "Receive Order." In the current prototype design, orders are generated by the system and become Available. The player sees them (possibly as a list or map pin) and then Accepts one. Whether the player passively receives one order or actively browses a list of available orders is a UX decision not yet fully specified.

**Impact on F-08:** Low — the loop step "Receive Order" is sufficient at the canonical loop abstraction level. The UX distinction (list vs automatic) is a UI implementation detail.

**Recommended action:** Clarify in `07_UI/UX.md` or `09_Development/FIRST_MAP_DESIGN.md` during implementation. The canonical loop step label "Receive Order" is adequate for the correction.

---

# Final Result/Status

**F-08 Analysis Status:** COMPLETE

**F-08 Correction Proposal Status:** COMPLETE (analysis-only; no canonical files modified in this task)

**If the REQUIRED changes are implemented:** F-08 would be **FULLY RESOLVED**.

**If only the REQUIRED changes are implemented (without OPTIONAL):** F-08 is still FULLY RESOLVED. The OPTIONAL changes reduce drift risk but are not required for resolution.

**Resolution summary:**
- Root cause identified: structural inconsistency between PROTOTYPE_V0.1.md and CORE_GAMEPLAY_SYSTEMS.md; lifecycle state mapping gap; missing failure branch.
- Recommended canonical loop: 7-step happy path + failure branch + optional management branch, mapped to canonical Order lifecycle.
- Canonical owner confirmed: `09_Development/PROTOTYPE_V0.1.md`.
- Minimum safe change set: 2 files (REQUIRED).

---

# Follow-up Actions

1. **Human review:** Review this proposal and approve or modify the recommended canonical loop.
2. **F-08 implementation task:** If approved, implement REQUIRED changes to `PROTOTYPE_V0.1.md` and `CORE_GAMEPLAY_SYSTEMS.md` in a separate implementation task.
3. **OPTIONAL changes:** Implement OPTIONAL cross-reference additions to `GAMEPLAY_EVENTS_FLOW.md`, `FIRST_PLAYABLE_EXPERIENCE.md`, and `GAMEPLAY.md` if approved.
4. **Balancing tasks:** Define failure condition thresholds and reputation penalties in `GAME_BALANCING_RULES.md` (separate from F-08).
5. **UX clarification:** Clarify "Receive Order" UX (list vs automatic) in `07_UI/UX.md` during implementation (separate from F-08).

---

# Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Implementation agent adds navigation steps as new scenes instead of in-GameWorld movement | Medium | Medium | PROTOTYPE_V0.1.md correction should note navigation occurs within the GameWorld scene |
| "Receive Order" label misunderstood as player manually creating orders | Low | High | Correct PROTOTYPE_V0.1.md loop to show Order status (Available) at that step |
| Failure branch causes implementation of permanent player punishment | Low | Medium | Explicitly note in correction that failure return point is back to "Receive Order" (no game over) |
| Optional management branch implemented as mandatory scene transition | Medium | Medium | Correction must use "Optional" language explicitly |
| Future agent adds "View Map" as a mandatory loop step | Low | Low | Canonical ownership declaration in PROTOTYPE_V0.1.md prevents this |

---

End of Report

