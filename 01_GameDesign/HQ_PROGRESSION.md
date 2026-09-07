# Document Information

Document: HQ_PROGRESSION.md
Project: DROPi Tycoon
Version: 1.0.0
Status: Canonical Gameplay Specialization
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-09-07

---

# Progressive Headquarters and Department Construction

## Purpose

This document specializes the global progression rules in `PROGRESSION.md` for the physical headquarters and its operational departments.

It is subordinate to `00_Project/VISION.md`, `01_GameDesign/GDD.md`, and `01_GameDesign/PROGRESSION.md`. It does not replace their authority.

DROPi Tycoon headquarters must visibly evolve with the company. A department is not considered available merely because a menu, label, or future feature exists in code or documentation.

---

# Core Rule

The headquarters begins with only the minimum viable operational footprint required by the currently playable company stage.

Additional departments must be constructed or unlocked through authoritative Tycoon progression before they become operational.

A department that has not been constructed must be represented honestly as one of the following:

- construction space;
- reserved expansion space;
- locked wing;
- unfinished infrastructure.

It must not display functioning specialist equipment, working specialist staff, or usable department actions as though the department already exists.

---

# Department State

Each governed HQ department has explicit company-owned progression state.

The state must answer at minimum:

- whether the department is constructed;
- what prerequisites govern construction;
- what Company Money cost applies when a cost is required;
- which equipment and staff stations become valid after construction;
- which interactions remain unavailable before construction.

The current implementation uses stable department identifiers and a persistent constructed-department set. Future expansion may add department levels, construction phases, capacity, condition, equipment tiers, staffing capacity, utilities, or specialist requirements without discarding the underlying explicit-state model.

---

# Minimum Headquarters Footprint

`Core` represents the minimum viable headquarters footprint.

Core exists so the current playable loop remains possible while the broader headquarters grows around it. It does not imply that every future department is built from the beginning.

The Core footprint may contain only the operational surfaces that are genuinely required by the current playable stage. As systems mature, functions currently inside Core may move into their own constructed departments under governed migration rules.

---

# Progressive Department Families

The long-term HQ may contain department families such as:

- Employee / HR;
- Fleet Bay;
- Operations / Dispatch;
- Parcel Staging / Sorting;
- Maintenance / Workshop;
- Warehouse and inventory support;
- Finance / administration;
- research and technology;
- drone operations and future DronePort support;
- specialist multimodal logistics departments.

This list defines direction, not an instruction to make all departments available immediately.

Each department must enter gameplay only when its mechanics, prerequisites, physical representation, and persistence are ready.

---

# First Implemented Progressive Wing — Maintenance

The first implemented construction slice converts the existing physical `Maintenance Wing` construction placeholder into authoritative progression.

Before construction:

- the area is visibly unfinished;
- the workshop is not operational;
- maintenance specialist stations are absent;
- the player sees the current construction requirement and cost;
- construction cannot succeed until its authoritative prerequisites are satisfied.

After construction:

- Company Money is charged exactly once;
- the same physical HQ area changes visibly into a workshop foundation;
- workbench, diagnostic, and tool infrastructure may appear;
- the department remains part of the physical world rather than becoming a detached abstract menu;
- future mechanic employees and advanced maintenance systems have a legitimate place to attach.

Concrete numeric costs and thresholds used by the prototype are centralized balancing values. They are replaceable tuning values and are not permanent design canon unless separately approved.

---

# Progression Requirements

Department construction may depend on multiple authoritative systems, including:

- Company Money;
- company level or development stage;
- reputation;
- fleet scale;
- employee count and specialist qualifications;
- research;
- infrastructure dependencies;
- permits or regional progression where applicable.

Money alone must not automatically bypass every future prerequisite.

This follows the global progression philosophy that company growth is driven by multiple systems rather than a single number.

---

# Staff and Equipment Visibility

Employees, equipment, and technical props must respect constructed department state.

Examples:

- a maintenance specialist belongs in a constructed workshop, not at an imaginary desk in an unbuilt wing;
- dispatch staff belong at a valid Operations / Dispatch department when that department is governed separately;
- field Couriers may be represented as outside HQ while actively delivering;
- fleet assets belong only in valid fleet/storage areas and must not be duplicated across physical representations.

Locked or unbuilt departments must not host operational staff or functioning equipment.

---

# Physical Interaction Rule

HQ construction is an in-world company action.

The player must encounter the relevant physical headquarters expansion surface, construction control, office, or authorized facility interaction when performing construction actions.

The future player smartphone may show status, requirements, notifications, plans, or remote information, but it must not silently bypass physical-location actions when the design requires the player or qualified staff to be present at HQ.

---

# Persistence and Compatibility

Department construction state is durable company progression and must survive Save / Continue.

The first implementation extends the existing Save v2 payload additively:

- old Save v2 data without explicit HQ state defaults safely to Core-only;
- missing optional HQ state is a valid compatibility default, not save corruption;
- malformed department identifiers or duplicate state must be normalized safely;
- constructed departments must not disappear after Continue;
- construction must not be charged again after restoration.

A Save format version increase is not required merely because this additive optional field exists.

---

# Visual Evolution Rule

A headquarters upgrade must create visible world change, not only a changed number or text label.

At minimum, constructing a department should change some combination of:

- walls or occupied floor area;
- construction barriers;
- equipment;
- workstations;
- signage;
- lighting or active-state indicators;
- staff placement;
- storage or vehicle presentation;
- interaction points.

Larger future HQ stages may also alter the exterior building footprint and city presentation.

---

# Multiplayer and Future Authority

Future multiplayer must not allow clients to fabricate department construction or spend Company Money independently of authoritative game state.

When multiplayer becomes server-authoritative, department construction, prerequisites, spending, staffing capacity, and resulting world state must be validated by the authoritative simulation.

This document does not itself enable multiplayer.

---

# Canonical Boundaries

Progressive HQ construction must not:

- invent real DROPi product capabilities;
- create token, blockchain, wallet, or real-money construction mechanics;
- bypass employee skill and specialist requirements where those systems are governed later;
- make unbuilt departments appear operational;
- replace the physical HQ with a global abstract Company menu;
- reset or invalidate established company, fleet, employee, financial, or save progression without an explicit migration rule.

---

# Acceptance Direction

A progressive-HQ implementation is successful when the owner can visibly recognize that the company headquarters grows because of gameplay progression.

The first slice must demonstrate this by showing an unfinished Maintenance Wing, allowing legitimate construction when prerequisites are met, changing the same physical space into an operational workshop foundation, and preserving that result across Save / Continue.

Future slices should extend the same governed model to additional departments rather than introducing independent one-off unlock systems.

---

End of Document
