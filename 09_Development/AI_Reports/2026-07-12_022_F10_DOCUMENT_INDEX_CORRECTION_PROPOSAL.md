# Report Metadata

- Report ID: 2026-07-12_022
- Report title: F-10 DOCUMENT_INDEX Correction Proposal — Current Coverage Analysis and Safe Indexing Policy
- Date: 2026-07-12
- Project: DROPi Tycoon
- Task type: Analysis-Only / Correction Proposal
- Agent/model: GitHub Copilot Task Agent; model identity N/A — not exposed in this environment
- Repository: caliofmarian-ai/DROPi-Tycoon
- Branch: copilot/analyze-f-10-audit-finding
- Base commit: 9f2496b2d0c29b30a649700218e655e05588fe69
- Resulting commit: N/A — self-referential report-only change; use PR commit history
- Pull Request: Pending creation at time of initial report authoring
- Human approval status: Pending review

# Original Task Instruction

```text
Analyze audit finding F-10 in the DROPi Tycoon repository and produce a correction proposal.

This is an analysis-only task.

Do not modify any canonical project file.
Do not fix F-10 yet.
Do not analyze or fix unrelated audit findings.
Do not perform repository-wide cleanup.
Do not rename, move, create, or delete project documents.

OBJECTIVE

Determine the exact current incompleteness of:

00_Project/DOCUMENT_INDEX.md

and define the safest canonical indexing policy for the current repository.

The original audit found that DOCUMENT_INDEX.md listed only a small fraction of the existing project documents.

The repository has changed substantially since that audit.

The goal is to decide exactly:

- what DOCUMENT_INDEX.md must index;
- how detailed the index must be;
- which files and managed directories must be registered;
- how dynamic AI reports should be represented;
- how to prevent the index from immediately becoming stale again.

SOURCE OF TRUTH

Use:

- current main branch;
- 09_Development/AI_Reports/2026-07-12_001_FULL_DOCUMENTATION_CONSISTENCY_AUDIT.md;
- all persistent correction reports through the current latest report;
- current 00_Project/DOCUMENT_INDEX.md;
- current 00_Project/PROJECT_STATUS.md;
- current 00_Project/PROJECT_INTAKE_PROTOCOL.md;
- current 09_Development/AI_REPORTING_PROTOCOL.md;
- current 09_Development/GITHUB_WORKFLOW.md;
- real current repository contents.

REQUIRED ANALYSIS

1. Verify the current main branch and build a complete real repository inventory.

2. Read the current DOCUMENT_INDEX.md in full.

3. Determine the current stated purpose of DOCUMENT_INDEX.md.

4. Compare that purpose with its actual current coverage.

5. Inventory all current repository-managed content, including at minimum:

- root README.md;
- Builds/;
- Game/;
- all numbered folders;
- every current Markdown document;
- AI_Reports/;
- .gitkeep files where relevant to managed directory existence;
- any other live file or directory at repository root.

6. Distinguish between:

A. Canonical project documents.

B. Development planning documents.

C. Governance and process documents.

D. Historical audit/report artifacts.

E. Templates.

F. Placeholder directories.

G. Generated game/build artifacts.

H. External-facing documentation.

7. Determine whether DOCUMENT_INDEX.md should be:

Option A:
A literal complete file-by-file inventory of all repository content.

Option B:
A canonical documentation map listing all project Markdown documents and managed directories, while excluding transient/generated artifacts.

Option C:
A high-level ownership map only.

Option D:
A hybrid model.

Evaluate each option for:

- discoverability;
- maintainability;
- AI-agent routing;
- staleness risk;
- governance clarity;
- repository growth;
- compatibility with AI_REPORTING_PROTOCOL.md;
- compatibility with PROJECT_INTAKE_PROTOCOL.md.

Recommend exactly one policy.

8. Determine how AI_Reports/ should be represented.

Evaluate whether DOCUMENT_INDEX.md should:

- list every individual AI report;
- list only the AI_Reports/ directory and reference AI_REPORTING_PROTOCOL.md;
- list the latest report sequence;
- use another maintainable approach.

Do not recommend individual report enumeration unless strong repository evidence supports it.

9. Determine how Game/ and Builds/ should be represented.

Clarify:

- purpose;
- ownership;
- expected content;
- whether their internal generated files should be individually indexed.

10. Determine how templates and historical audits should be represented.

At minimum analyze:

- PROJECT_CONSISTENCY_REPORT_TEMPLATE.md;
- INITIAL_REPOSITORY_AUDIT.md;
- AI_Reports/ historical reports.

11. Identify every current mismatch in DOCUMENT_INDEX.md, including:

- missing top-level directories;
- wrong repository root name;
- missing documents;
- documents listed but absent;
- incorrect file names;
- incorrect responsibilities;
- incomplete folder descriptions;
- missing canonical owners;
- stale counts;
- stale examples;
- missing governance documents;
- missing development documents;
- missing technical documents;
- missing README files;
- missing report infrastructure.

12. Separate findings into:

A. F-10 required scope.

B. Other known audit findings that overlap with DOCUMENT_INDEX.md, including where relevant:

- F-12;
- F-21;
- F-22;
- F-25;
- F-27.

Do not fix those findings automatically.

However, determine whether a single carefully scoped DOCUMENT_INDEX.md correction could safely resolve multiple overlapping findings without creating duplicate future work.

13. Determine whether the safest implementation should:

- resolve only F-10;
- resolve F-10 plus tightly coupled index findings;
- defer all overlaps.

Recommend one approach and justify it.

14. Define the exact target structure of DOCUMENT_INDEX.md.

Provide a proposed section outline, including at minimum:

- Purpose
- Indexing Policy
- Repository Structure
- Root Files
- 00_Project
- 01_GameDesign
- 02_Economy
- 03_Logistics
- 04_World
- 05_AI
- 06_Technical
- 07_UI
- 08_Assets
- 09_Development
- Game/
- Builds/
- AI_Reports/
- Information Ownership Rules
- Canonical Priority / Conflict Resolution, only if included in approved scope
- Maintenance Rule

15. For every folder/document entry define the minimum metadata required.

Evaluate whether each entry needs:

- path;
- title;
- purpose;
- status;
- canonical responsibility;
- owner;
- version;
- update date.

Avoid overengineering.

16. Determine how the index remains maintainable.

Define rules for:

- adding a new canonical document;
- moving/renaming a document;
- creating a new managed directory;
- adding AI reports;
- generated files;
- archived/historical files;
- validating index consistency during intake or audit.

17. Determine whether document counts should be included.

Avoid counts if they create unnecessary staleness unless there is a reliable maintenance mechanism.

18. Define the exact correction plan.

For every proposed change provide:

- exact section;
- current issue;
- recommended correction;
- reason;
- REQUIRED or OPTIONAL;
- related audit findings resolved or affected.

19. Determine exact files that would change.

Prefer modifying only:

00_Project/DOCUMENT_INDEX.md

and the required persistent report.

If another file must change, justify why.

20. Define validation criteria proving F-10 is fully resolved.

Validation must verify:

- every live canonical Markdown document is discoverable from the index;
- every managed top-level directory is represented;
- no absent document is presented as real;
- AI_Reports representation matches AI_REPORTING_PROTOCOL.md;
- Game/ and Builds/ are documented without listing generated internals;
- ownership rules match real structure;
- no stale repository name remains;
- no unrelated canonical document was modified;
- historical reports were not modified.

21. Determine whether the proposed correction would make:

- F-10 FULLY RESOLVED;
- F-10 PARTIALLY RESOLVED;
- F-10 NOT RESOLVED.

22. Also state which overlapping findings would be:

- fully resolved;
- partially resolved;
- unaffected;

if the recommended correction is implemented.

OUTPUT

Provide:

- Root Cause Analysis
- Current Real Repository Inventory Summary
- Current DOCUMENT_INDEX.md Coverage Analysis
- Content Classification Matrix
- Indexing Policy Options Comparison
- Recommended Canonical Indexing Policy
- AI_Reports Representation Decision
- Game/ and Builds/ Representation Decision
- Templates and Historical Reports Representation Decision
- Complete Current Mismatch Inventory
- F-10 Scope Boundary
- Overlapping Findings Analysis
- Recommended Target DOCUMENT_INDEX.md Outline
- Minimum Entry Metadata
- Maintenance Rules
- Exact Correction Plan
- Required vs Optional Changes
- Exact Files That Would Change
- Validation Plan
- Risks
- F-10 Resolution Status if Implemented
- Impact on F-12, F-21, F-22, F-25, and F-27
- Final Recommendation

REPORTING REQUIREMENT

This is a significant analysis-only task.

Follow:

09_Development/AI_REPORTING_PROTOCOL.md

Create the next persistent report in:

09_Development/AI_Reports/

Verify the next report sequence number from the real repository state.

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
- recommended indexing policy;
- recommended treatment of AI_Reports/;
- recommended treatment of Game/ and Builds/;
- exact required files that would change if approved;
- overlapping findings affected;
- whether F-10 would be fully resolved;
- validation results;
- Pull Request link.
```

# Objective

Determine the exact current incompleteness of `00_Project/DOCUMENT_INDEX.md`, define the safest maintainable canonical indexing policy for the current repository state, and specify the smallest future correction that would fully resolve F-10 without modifying canonical project files in this task.

# Scope

- Analysis only; no canonical project file was changed.
- Allowed repository modification scope for this task: creation of this required persistent report only.
- Source-of-truth scope used: remote default branch metadata (`origin` HEAD = `main`), current branch contents, the original audit report, all persistent reports currently present through `2026-07-12_021_F09_SAVE_LOAD_ANALYSIS.md`, the required governance documents, and real repository file inventory.
- Out of scope for implementation in this task: editing `00_Project/DOCUMENT_INDEX.md`, editing historical reports, changing any canonical gameplay/technical/development document, or fixing unrelated findings.

# Files Inspected

- `00_Project/DOCUMENT_INDEX.md`
- `00_Project/INITIAL_REPOSITORY_AUDIT.md`
- `00_Project/PROJECT_CONSISTENCY_REPORT_TEMPLATE.md`
- `00_Project/PROJECT_INTAKE_PROTOCOL.md`
- `00_Project/PROJECT_STATUS.md`
- `00_Project/README.md`
- `00_Project/ROADMAP.md`
- `00_Project/VISION.md`
- `01_GameDesign/GAMEPLAY.md`
- `01_GameDesign/GDD.md`
- `01_GameDesign/MISSIONS.md`
- `01_GameDesign/PROGRESSION.md`
- `02_Economy/ECONOMY.md`
- `02_Economy/MARKET.md`
- `02_Economy/PRICING.md`
- `03_Logistics/DRONEPORTS.md`
- `03_Logistics/DRONES.md`
- `03_Logistics/LOGISTICS.md`
- `03_Logistics/ORDERS.md`
- `03_Logistics/ROUTING.md`
- `03_Logistics/VEHICLES.md`
- `04_World/BUILDINGS.md`
- `04_World/MAP.md`
- `04_World/NPC.md`
- `04_World/WEATHER.md`
- `04_World/WORLD.md`
- `05_AI/AI_AGENTS.md`
- `05_AI/AI_SYSTEM.md`
- `06_Technical/ARCHITECTURE.md`
- `06_Technical/SAFE_SYSTEM.md`
- `06_Technical/SAVE_SYSTEM.md`
- `06_Technical/TDD.md`
- `07_UI/UI.md`
- `07_UI/UX.md`
- `08_Assets/ASSETS.md`
- `09_Development/AI_AGENT_EXECUTION_PROTOCOL.md`
- `09_Development/AI_DEVELOPMENT_WORKFLOW.md`
- `09_Development/AI_PROJECT_GENERATION_PLAN.md`
- `09_Development/AI_REPORTING_PROTOCOL.md`
- `09_Development/AI_Reports/2026-07-12_001_FULL_DOCUMENTATION_CONSISTENCY_AUDIT.md`
- `09_Development/AI_Reports/2026-07-12_002_AI_REPORTING_PROTOCOL_IMPLEMENTATION.md`
- `09_Development/AI_Reports/2026-07-12_003_PERSISTENT_REPORT_CREATION_TASK.md`
- `09_Development/AI_Reports/2026-07-12_004_VISION_GDD_ALIGNMENT.md`
- `09_Development/AI_Reports/2026-07-12_005_VISION_GDD_REPORT_CREATION_TASK.md`
- `09_Development/AI_Reports/2026-07-12_006_F01_F04_CORRECTION_PROPOSAL.md`
- `09_Development/AI_Reports/2026-07-12_007_F01_F04_CORRECTION_IMPLEMENTATION.md`
- `09_Development/AI_Reports/2026-07-12_008_F02_CORRECTION_PROPOSAL.md`
- `09_Development/AI_Reports/2026-07-12_009_F02_CORRECTION_IMPLEMENTATION.md`
- `09_Development/AI_Reports/2026-07-12_010_F03_BICYCLE_CORRECTION_PROPOSAL.md`
- `09_Development/AI_Reports/2026-07-12_011_F03_BICYCLE_CORRECTION_IMPLEMENTATION.md`
- `09_Development/AI_Reports/2026-07-12_012_F03_ASSET_IMPORT_GUIDE_CORRECTION.md`
- `09_Development/AI_Reports/2026-07-12_013_F05_CORRECTION_PROPOSAL.md`
- `09_Development/AI_Reports/2026-07-12_014_F05_CORRECTION_IMPLEMENTATION.md`
- `09_Development/AI_Reports/2026-07-12_015_F06_SCENE_NAMING_CORRECTION_PROPOSAL.md`
- `09_Development/AI_Reports/2026-07-12_016_F06_SCENE_NAMING_CORRECTION_IMPLEMENTATION.md`
- `09_Development/AI_Reports/2026-07-12_017_F07_ORDER_LIFECYCLE_CORRECTION_PROPOSAL.md`
- `09_Development/AI_Reports/2026-07-12_018_F07_ORDER_LIFECYCLE_CORRECTION_IMPLEMENTATION.md`
- `09_Development/AI_Reports/2026-07-12_019_F08_GAMEPLAY_LOOP_CORRECTION_PROPOSAL.md`
- `09_Development/AI_Reports/2026-07-12_020_F08_GAMEPLAY_LOOP_CORRECTION_IMPLEMENTATION.md`
- `09_Development/AI_Reports/2026-07-12_021_F09_SAVE_LOAD_ANALYSIS.md`
- `09_Development/ASSET_IMPORT_GUIDE.md`
- `09_Development/CHANGELOG.md`
- `09_Development/CORE_GAMEPLAY_SYSTEMS.md`
- `09_Development/DEVELOPMENT_WORKFLOW.md`
- `09_Development/FIRST_MAP_DESIGN.md`
- `09_Development/FIRST_PLAYABLE_EXPERIENCE.md`
- `09_Development/GAMEPLAY_EVENTS_FLOW.md`
- `09_Development/GAME_BALANCING_RULES.md`
- `09_Development/GAME_DATA_STRUCTURE.md`
- `09_Development/GDEVELOP_PROJECT_STRUCTURE.md`
- `09_Development/GITHUB_WORKFLOW.md`
- `09_Development/IDEAS.md`
- `09_Development/MOBILE_UI_CONTROLS.md`
- `09_Development/PROTOTYPE_BUILD_PIPELINE.md`
- `09_Development/PROTOTYPE_GENERATION_PACKAGE.md`
- `09_Development/PROTOTYPE_MILESTONES.md`
- `09_Development/PROTOTYPE_RELEASE_CHECKLIST.md`
- `09_Development/PROTOTYPE_TECH_STACK.md`
- `09_Development/PROTOTYPE_TESTING_PLAN.md`
- `09_Development/PROTOTYPE_V0.1.md`
- `09_Development/TASKS.md`
- `README.md`
- `09_Development/AI_Reports/.gitkeep`
- `Builds/.gitkeep`
- `Game/.gitkeep`

# Files Created

- `09_Development/AI_Reports/2026-07-12_022_F10_DOCUMENT_INDEX_CORRECTION_PROPOSAL.md`

# Files Modified

- None.

# Files Moved or Renamed

- None.

# Files Deleted

- None.

# Actions Performed

1. Verified the working branch is `copilot/analyze-f-10-audit-finding` and the remote default branch (`origin` HEAD) is `main`.
2. Read `00_Project/DOCUMENT_INDEX.md` in full.
3. Read `00_Project/PROJECT_STATUS.md`, `00_Project/PROJECT_INTAKE_PROTOCOL.md`, `09_Development/AI_REPORTING_PROTOCOL.md`, and `09_Development/GITHUB_WORKFLOW.md` in full.
4. Read `00_Project/INITIAL_REPOSITORY_AUDIT.md` and `00_Project/PROJECT_CONSISTENCY_REPORT_TEMPLATE.md`.
5. Read the F-10, F-12, F-21, F-22, F-25, and F-27 sections of `09_Development/AI_Reports/2026-07-12_001_FULL_DOCUMENTATION_CONSISTENCY_AUDIT.md`.
6. Inspected all persistent reports currently present through `09_Development/AI_Reports/2026-07-12_021_F09_SAVE_LOAD_ANALYSIS.md`, including report metadata headers across the entire folder and targeted searches for prior `DOCUMENT_INDEX.md` overlap decisions.
7. Built a real repository inventory from filesystem contents, including every live Markdown file, root-level directory, and relevant `.gitkeep` placeholder file.
8. Compared the stated purpose of `DOCUMENT_INDEX.md` with current real repository contents and current governance requirements.
9. Determined the safest future correction scope and the exact validation criteria required to close F-10.
10. Verified the next AI report sequence from real repository state: existing reports `001` through `021`; next available sequence = `022`.

# Findings

## Root Cause Analysis

`00_Project/DOCUMENT_INDEX.md` is currently written as a mixed-purpose document: it claims to be a **complete map** of project documentation, but its structure behaves like a partial folder overview with a few example file lists and a few responsibility notes. That mismatch between declared purpose and actual maintenance model is the core cause of F-10.

The index was also not designed with three growth patterns in mind:

1. `09_Development/` expanded rapidly from a small planning area to a large mixed governance/planning/prototype folder.
2. `09_Development/AI_Reports/` became a high-churn historical record stream governed by `AI_REPORTING_PROTOCOL.md`.
3. `Game/` and `Builds/` exist as managed root directories whose internal contents are expected to be dynamic or generated.

Because the index has no explicit indexing policy, maintainers had no stable rule telling them **which files must be listed individually** and **which directories must be represented only at policy level**. The result is predictable staleness: some sections became complete (`01_GameDesign`), most remained incomplete, and dynamic areas were not modeled at all.

## Current Real Repository Inventory Summary

### Branch and repository state

- Working branch: `copilot/analyze-f-10-audit-finding`
- Remote default branch: `main`
- Base commit inspected: `9f2496b2d0c29b30a649700218e655e05588fe69`
- Working tree before report creation: clean

### Root repository inventory

- `README.md` — Root external-facing project overview.
- `00_Project/` — Project control, governance, status, roadmap, audit, and document index.
- `01_GameDesign/` — Canonical gameplay and design documents.
- `02_Economy/` — Canonical economy system documents.
- `03_Logistics/` — Canonical logistics system documents.
- `04_World/` — Canonical world simulation documents.
- `05_AI/` — Canonical in-game AI documents.
- `06_Technical/` — Canonical technical architecture and safety documents.
- `07_UI/` — Canonical UI and UX documents.
- `08_Assets/` — Canonical asset management document.
- `09_Development/` — Development planning, workflow, reporting, and prototype-delivery documents.
- `Game/` — Managed game-source directory; currently placeholder only (`Game/.gitkeep`).
- `Builds/` — Managed build-output directory; currently placeholder only (`Builds/.gitkeep`).

### Inventory counts

- Live Markdown files in repository: **82**
- Persistent AI reports in `09_Development/AI_Reports/`: **21** (`001` through `021`)
- Live non-report Markdown files: **61**
- Root managed placeholder files relevant to directory existence: `Game/.gitkeep`, `Builds/.gitkeep`, `09_Development/AI_Reports/.gitkeep`
- Live generated game/build artifacts currently present: **none**

### Current Markdown inventory by area

### 00_Project
- `00_Project/README.md` — Internal project-summary readme for the project folder.
- `00_Project/VISION.md` — Canonical strategic identity, mission, values, and design philosophy.
- `00_Project/PROJECT_STATUS.md` — Canonical current phase and project-state summary.
- `00_Project/ROADMAP.md` — Roadmap and staged delivery planning.
- `00_Project/DOCUMENT_INDEX.md` — Canonical documentation map and ownership index.
- `00_Project/PROJECT_INTAKE_PROTOCOL.md` — Governance for repository/project intake auditing.
- `00_Project/PROJECT_CONSISTENCY_REPORT_TEMPLATE.md` — Reusable audit template; not a gameplay specification.
- `00_Project/INITIAL_REPOSITORY_AUDIT.md` — Historical initial audit artifact; still a live repository document.

### 01_GameDesign
- `01_GameDesign/GDD.md` — Game design rules and high-level design synthesis.
- `01_GameDesign/GAMEPLAY.md` — Gameplay structure and loop rules.
- `01_GameDesign/MISSIONS.md` — Mission system and objectives.
- `01_GameDesign/PROGRESSION.md` — Player/company progression rules.

### 02_Economy
- `02_Economy/ECONOMY.md` — Economy system rules.
- `02_Economy/MARKET.md` — Market behavior rules.
- `02_Economy/PRICING.md` — Pricing rules and price logic.

### 03_Logistics
- `03_Logistics/LOGISTICS.md` — Top-level logistics system rules.
- `03_Logistics/ORDERS.md` — Order lifecycle and order-state rules.
- `03_Logistics/ROUTING.md` — Routing rules and pathing expectations.
- `03_Logistics/VEHICLES.md` — Vehicle-system rules.
- `03_Logistics/DRONES.md` — Drone-system rules.
- `03_Logistics/DRONEPORTS.md` — DronePort-system rules.

### 04_World
- `04_World/WORLD.md` — World simulation rules and world scope.
- `04_World/MAP.md` — Map system and geography rules.
- `04_World/BUILDINGS.md` — Building-system rules.
- `04_World/NPC.md` — NPC-system rules.
- `04_World/WEATHER.md` — Weather-system rules.

### 05_AI
- `05_AI/AI_SYSTEM.md` — In-game AI systems.
- `05_AI/AI_AGENTS.md` — In-game AI agent behavior roles.

### 06_Technical
- `06_Technical/ARCHITECTURE.md` — Architecture and system layering.
- `06_Technical/SAVE_SYSTEM.md` — Canonical save/load behavior and persistence scope.
- `06_Technical/SAFE_SYSTEM.md` — Development/project safety and change-stability governance.
- `06_Technical/TDD.md` — Testing methodology guidance.

### 07_UI
- `07_UI/UI.md` — User interface rules.
- `07_UI/UX.md` — User experience rules.

### 08_Assets
- `08_Assets/ASSETS.md` — Asset management philosophy and rules.

### 09_Development
- `09_Development/AI_AGENT_EXECUTION_PROTOCOL.md` — AI execution procedure.
- `09_Development/AI_DEVELOPMENT_WORKFLOW.md` — AI-assisted development workflow.
- `09_Development/AI_PROJECT_GENERATION_PLAN.md` — AI project generation strategy.
- `09_Development/AI_REPORTING_PROTOCOL.md` — Mandatory governance for persistent AI reports.
- `09_Development/ASSET_IMPORT_GUIDE.md` — Prototype asset import guidance.
- `09_Development/CHANGELOG.md` — Historical development log.
- `09_Development/CORE_GAMEPLAY_SYSTEMS.md` — Prototype gameplay-system planning.
- `09_Development/DEVELOPMENT_WORKFLOW.md` — General development workflow.
- `09_Development/FIRST_MAP_DESIGN.md` — Prototype first-map planning.
- `09_Development/FIRST_PLAYABLE_EXPERIENCE.md` — Prototype first-playable definition.
- `09_Development/GAMEPLAY_EVENTS_FLOW.md` — Prototype gameplay-event flow.
- `09_Development/GAME_BALANCING_RULES.md` — Prototype balancing rules.
- `09_Development/GAME_DATA_STRUCTURE.md` — Prototype data-structure planning.
- `09_Development/GDEVELOP_PROJECT_STRUCTURE.md` — GDevelop project/file structure plan.
- `09_Development/GITHUB_WORKFLOW.md` — Repository workflow and PR rules.
- `09_Development/IDEAS.md` — Development ideation backlog.
- `09_Development/MOBILE_UI_CONTROLS.md` — Mobile control implementation guidance.
- `09_Development/PROTOTYPE_BUILD_PIPELINE.md` — Prototype build/export pipeline.
- `09_Development/PROTOTYPE_GENERATION_PACKAGE.md` — Package of required prototype-generation inputs.
- `09_Development/PROTOTYPE_MILESTONES.md` — Prototype milestone planning.
- `09_Development/PROTOTYPE_RELEASE_CHECKLIST.md` — Prototype completion/release checklist.
- `09_Development/PROTOTYPE_TECH_STACK.md` — Technology-stack decision record.
- `09_Development/PROTOTYPE_TESTING_PLAN.md` — Prototype testing plan.
- `09_Development/PROTOTYPE_V0.1.md` — Prototype v0.1 scope definition.
- `09_Development/TASKS.md` — Development task backlog.

### AI report inventory

The following historical report files currently exist in `09_Development/AI_Reports/`:

- `09_Development/AI_Reports/2026-07-12_001_FULL_DOCUMENTATION_CONSISTENCY_AUDIT.md`
- `09_Development/AI_Reports/2026-07-12_002_AI_REPORTING_PROTOCOL_IMPLEMENTATION.md`
- `09_Development/AI_Reports/2026-07-12_003_PERSISTENT_REPORT_CREATION_TASK.md`
- `09_Development/AI_Reports/2026-07-12_004_VISION_GDD_ALIGNMENT.md`
- `09_Development/AI_Reports/2026-07-12_005_VISION_GDD_REPORT_CREATION_TASK.md`
- `09_Development/AI_Reports/2026-07-12_006_F01_F04_CORRECTION_PROPOSAL.md`
- `09_Development/AI_Reports/2026-07-12_007_F01_F04_CORRECTION_IMPLEMENTATION.md`
- `09_Development/AI_Reports/2026-07-12_008_F02_CORRECTION_PROPOSAL.md`
- `09_Development/AI_Reports/2026-07-12_009_F02_CORRECTION_IMPLEMENTATION.md`
- `09_Development/AI_Reports/2026-07-12_010_F03_BICYCLE_CORRECTION_PROPOSAL.md`
- `09_Development/AI_Reports/2026-07-12_011_F03_BICYCLE_CORRECTION_IMPLEMENTATION.md`
- `09_Development/AI_Reports/2026-07-12_012_F03_ASSET_IMPORT_GUIDE_CORRECTION.md`
- `09_Development/AI_Reports/2026-07-12_013_F05_CORRECTION_PROPOSAL.md`
- `09_Development/AI_Reports/2026-07-12_014_F05_CORRECTION_IMPLEMENTATION.md`
- `09_Development/AI_Reports/2026-07-12_015_F06_SCENE_NAMING_CORRECTION_PROPOSAL.md`
- `09_Development/AI_Reports/2026-07-12_016_F06_SCENE_NAMING_CORRECTION_IMPLEMENTATION.md`
- `09_Development/AI_Reports/2026-07-12_017_F07_ORDER_LIFECYCLE_CORRECTION_PROPOSAL.md`
- `09_Development/AI_Reports/2026-07-12_018_F07_ORDER_LIFECYCLE_CORRECTION_IMPLEMENTATION.md`
- `09_Development/AI_Reports/2026-07-12_019_F08_GAMEPLAY_LOOP_CORRECTION_PROPOSAL.md`
- `09_Development/AI_Reports/2026-07-12_020_F08_GAMEPLAY_LOOP_CORRECTION_IMPLEMENTATION.md`
- `09_Development/AI_Reports/2026-07-12_021_F09_SAVE_LOAD_ANALYSIS.md`

## Current DOCUMENT_INDEX.md Coverage Analysis

### Current stated purpose

`00_Project/DOCUMENT_INDEX.md` explicitly states that it provides **"a complete map of DROPi Tycoon project documentation."** It also says its purpose is to maintain organization, prevent duplicated information, keep documents connected, and support AI-assisted development.

### Actual current coverage

The current document does **not** function as a complete index.

- It has **no Root Files section**, so root `README.md` is invisible.
- It has **no sections for `Game/`, `Builds/`, or `AI_Reports/`** as managed directories.
- It lists all four `01_GameDesign` documents, but `02_Economy` through `08_Assets` are described only at topic level and are missing explicit file registration.
- The `09_Development` section explicitly names only **6** top-level documents plus `AI_Reports/`, while the folder currently contains **25** top-level Markdown documents.
- `00_Project` is incomplete even though it contains core governance and historical files relevant to discoverability.

### Exact current discoverability gap

Using exact file-name/path presence in `DOCUMENT_INDEX.md` as the minimum discoverability threshold:

- Live non-report Markdown files present: **61**
- Live non-report Markdown files explicitly named anywhere in `DOCUMENT_INDEX.md`: **17**
- Live non-report Markdown files not named anywhere in `DOCUMENT_INDEX.md`: **44**
- Full repository Markdown files present (including AI reports): **82**
- Markdown files not individually named when reports are included: **65**

Even the higher `17` figure is generous because some of those names are only mentioned incidentally (for example, `VISION.md` and `DEVELOPMENT_WORKFLOW.md`) rather than being formally registered as index entries.

### Practical consequence

An agent using the current index as its discovery source would reliably miss:

- most governance documents in `00_Project/`;
- all explicit system docs in `02_Economy/`, `03_Logistics/`, `04_World/`, `05_AI/`, `07_UI/`, and `08_Assets/`;
- most of `06_Technical/` and `09_Development/`;
- the existence and policy status of `Game/`, `Builds/`, and `AI_Reports/`.

So the current document is not just incomplete; it is structurally ambiguous about **what kind of index it is supposed to be**.

## Content Classification Matrix

| Class | Repository content | Current indexing implication |
|---|---|---|
| A. Canonical project documents | `00_Project/VISION.md`, `00_Project/PROJECT_STATUS.md`, `00_Project/ROADMAP.md`, all documents in `01_GameDesign/` through `08_Assets/`, and stable technical/development specifications such as `09_Development/PROTOTYPE_V0.1.md`, `09_Development/GDEVELOP_PROJECT_STRUCTURE.md`, `09_Development/PROTOTYPE_TESTING_PLAN.md` | Must be individually discoverable from `DOCUMENT_INDEX.md` |
| B. Development planning documents | `09_Development/CORE_GAMEPLAY_SYSTEMS.md`, `FIRST_MAP_DESIGN.md`, `FIRST_PLAYABLE_EXPERIENCE.md`, `GAME_BALANCING_RULES.md`, `PROTOTYPE_MILESTONES.md`, `TASKS.md`, `IDEAS.md`, and similar planning docs | Must be individually listed because they are live repository knowledge, even if not canonical gameplay authority |
| C. Governance and process documents | `00_Project/DOCUMENT_INDEX.md`, `00_Project/PROJECT_INTAKE_PROTOCOL.md`, `09_Development/AI_REPORTING_PROTOCOL.md`, `09_Development/GITHUB_WORKFLOW.md`, `09_Development/AI_AGENT_EXECUTION_PROTOCOL.md`, `09_Development/AI_DEVELOPMENT_WORKFLOW.md`, `09_Development/DEVELOPMENT_WORKFLOW.md`, `09_Development/PROTOTYPE_BUILD_PIPELINE.md` | Must be individually listed because they direct agent behavior and repository operations |
| D. Historical audit/report artifacts | `00_Project/INITIAL_REPOSITORY_AUDIT.md`, `09_Development/AI_Reports/*.md`, and `09_Development/CHANGELOG.md` | Historical artifacts must be represented, but only stable standalone history docs should be individually listed; high-churn report streams should be directory-level only |
| E. Templates | `00_Project/PROJECT_CONSISTENCY_REPORT_TEMPLATE.md` | Must be individually listed and clearly labeled as template/non-spec |
| F. Placeholder directories | `Game/` with `Game/.gitkeep`; `Builds/` with `Builds/.gitkeep` | Directory must be indexed; `.gitkeep` should be noted only as placeholder evidence, not as first-class index entries |
| G. Generated game/build artifacts | Future contents under `Game/` and `Builds/` once real project and export files exist | Should not be individually indexed in `DOCUMENT_INDEX.md` unless a stable non-generated control document is later added |
| H. External-facing documentation | Root `README.md` | Must be listed in a Root Files section |

## Indexing Policy Options Comparison

| Option | Summary | Discoverability | Maintainability | AI-agent routing | Staleness risk | Governance clarity | Repository growth | AI_REPORTING_PROTOCOL compatibility | PROJECT_INTAKE_PROTOCOL compatibility | Verdict |
|---|---|---|---|---|---|---|---|---|---|---|
| A | Literal file-by-file inventory of all repository content | Very high initially | Poor | Noisy in dynamic areas | Very high | Blurs canonical vs historical vs generated | Poor | Poor — every new AI report would require index edits | Strong for raw intake, weak for long-term governance | Reject |
| B | Canonical documentation map of all project Markdown docs and managed directories, excluding transient/generated artifacts | High | Good | Strong | Moderate | Good | Good | Good | Good | Strong candidate |
| C | High-level ownership map only | Low | Very high | Too weak for discovery | Low | Medium | Good | Good | Weak — does not satisfy inventory/discoverability needs | Reject |
| D | Hybrid: individually list all stable Markdown docs; represent dynamic/generated/historical directories at directory-policy level | Very high where it matters | Best balance | Strongest | Low-to-moderate | Strongest | Best | Best | Best | **Recommend** |

## Recommended Canonical Indexing Policy

**Recommended policy: Option D — a hybrid model.**

`DOCUMENT_INDEX.md` should become a **canonical documentation map of all stable live Markdown documents plus all managed root-level directories**, while explicitly **not** attempting to enumerate dynamic historical report streams or generated internals.

That means:

1. **Every stable live Markdown document outside the high-churn report stream must be individually listed.**
2. **Every managed top-level directory must be represented**, even if currently empty.
3. **Dynamic/historical/generated areas must be indexed by directory and policy**, not by ever-growing file lists.
4. The index must clearly distinguish **document discovery** from **content authority**.

This is the safest policy because it fully solves F-10 without turning `DOCUMENT_INDEX.md` into an unmaintainable mirror of the entire filesystem.

## AI_Reports Representation Decision

`09_Development/AI_Reports/` should be represented **at directory level only**, with an explicit rule referencing `09_Development/AI_REPORTING_PROTOCOL.md`.

Recommended treatment:

- List `09_Development/AI_Reports/` as a managed historical report directory.
- State that its contents are **non-canonical historical AI task records**.
- State that individual report files are governed by `AI_REPORTING_PROTOCOL.md` and are discoverable through folder contents, not through individual enumeration in `DOCUMENT_INDEX.md`.
- Do **not** list every report file.
- Do **not** encode the latest report sequence number in `DOCUMENT_INDEX.md`.

Why this is safest:

- There are already **21** reports in a single day of repository history.
- `AI_REPORTING_PROTOCOL.md` requires continuous sequential growth.
- Enumerating report files would force frequent index churn and would reintroduce immediate staleness.
- The protocol itself explicitly defines these reports as historical and non-canonical.

## Game/ and Builds/ Representation Decision

### `Game/`

Recommended representation:

- List `Game/` as a managed root directory for live editable game project/source artifacts.
- State current real state: placeholder-only (`Game/.gitkeep`) at the moment.
- Reference that directory purpose is supported by technical/development structure docs such as `09_Development/GDEVELOP_PROJECT_STRUCTURE.md` and `06_Technical/ARCHITECTURE.md`.
- Do **not** individually index internal game files expected to be engine/project artifacts.

### `Builds/`

Recommended representation:

- List `Builds/` as a managed root directory for generated/exported build outputs.
- State current real state: placeholder-only (`Builds/.gitkeep`) at the moment.
- Reference build governance via `09_Development/PROTOTYPE_BUILD_PIPELINE.md` and `09_Development/GITHUB_WORKFLOW.md`.
- Do **not** individually index internal build/export files.

### Ownership rule

- `Game/` = source artifact storage area.
- `Builds/` = generated/export artifact storage area.
- Neither directory should be treated as a canonical document set.
- Their existence must be indexed; their future generated internals must not be cataloged file-by-file in `DOCUMENT_INDEX.md`.

## Templates and Historical Reports Representation Decision

### `00_Project/PROJECT_CONSISTENCY_REPORT_TEMPLATE.md`

- Should be individually listed in `00_Project`.
- Must be labeled as a **template**.
- It is a live reusable repository document, so excluding it would keep the index incomplete.

### `00_Project/INITIAL_REPOSITORY_AUDIT.md`

- Should be individually listed in `00_Project`.
- Must be labeled as a **historical audit artifact** rather than active canonical gameplay/architecture specification.
- It remains a live repository document and is directly referenced by later governance and audit work.

### `09_Development/AI_Reports/*.md`

- Should **not** be individually listed.
- Must be represented by the folder plus the governing rule from `AI_REPORTING_PROTOCOL.md`.
- This preserves discoverability without converting a historical log stream into a high-maintenance static list.

## Complete Current Mismatch Inventory

### Structural mismatches

1. Project structure block uses `DROPi_Tycoon/` instead of real repository name `DROPi-Tycoon`.
2. Project structure block omits root-level managed directories `Game/` and `Builds/`.
3. There is no Root Files section, so root `README.md` is omitted.
4. There is no section for `AI_Reports/` as a distinct managed directory with its own indexing rules.

### 00_Project mismatches

5. `00_Project` document list omits `README.md`.
6. `00_Project` document list omits `ROADMAP.md`.
7. `00_Project` document list omits `PROJECT_INTAKE_PROTOCOL.md`.
8. `00_Project` document list omits `PROJECT_CONSISTENCY_REPORT_TEMPLATE.md`.
9. `00_Project` document list omits `INITIAL_REPOSITORY_AUDIT.md`.
10. `00_Project/VISION.md` is referenced only indirectly in a note, not formally registered as a document entry.
11. `00_Project` section does not distinguish canonical strategic docs from template/history docs.

### 02_Economy through 08_Assets mismatches

12. `02_Economy` has no explicit file list for `ECONOMY.md`, `MARKET.md`, `PRICING.md`.
13. `03_Logistics` has no explicit file list for `LOGISTICS.md`, `ORDERS.md`, `ROUTING.md`, `VEHICLES.md`, `DRONES.md`, `DRONEPORTS.md`.
14. `04_World` has no explicit file list for `WORLD.md`, `MAP.md`, `BUILDINGS.md`, `NPC.md`, `WEATHER.md`.
15. `05_AI` has no explicit file list for `AI_SYSTEM.md` and `AI_AGENTS.md`.
16. `06_Technical` omits `TDD.md` from its explicit named list.
17. `07_UI` has no explicit file list for `UI.md` and `UX.md`.
18. `08_Assets` has no explicit file list for `ASSETS.md`.

### 09_Development mismatches

19. `09_Development` names only 6 top-level documents explicitly while 25 top-level Markdown documents currently exist.
20. Missing explicit `09_Development` documents include: `ASSET_IMPORT_GUIDE.md`, `CHANGELOG.md`, `CORE_GAMEPLAY_SYSTEMS.md`, `DEVELOPMENT_WORKFLOW.md`, `FIRST_MAP_DESIGN.md`, `FIRST_PLAYABLE_EXPERIENCE.md`, `GAMEPLAY_EVENTS_FLOW.md`, `GAME_BALANCING_RULES.md`, `GAME_DATA_STRUCTURE.md`, `GDEVELOP_PROJECT_STRUCTURE.md`, `GITHUB_WORKFLOW.md`, `IDEAS.md`, `MOBILE_UI_CONTROLS.md`, `PROTOTYPE_MILESTONES.md`, `PROTOTYPE_RELEASE_CHECKLIST.md`, `PROTOTYPE_TECH_STACK.md`, `PROTOTYPE_TESTING_PLAN.md`, `PROTOTYPE_V0.1.md`, and `TASKS.md`.
21. `AI_Reports/` is mentioned only as a name, with no policy distinguishing historical reports from canonical docs.
22. `09_Development` purpose text is too narrow for its real current content mix; the folder now contains planning, governance, workflow, reporting, build, testing, and prototype-scope documents.

### Ownership / governance mismatches

23. The current index does not clearly register `00_Project/VISION.md` as the strategic-identity owner, leaving the F-12 ambiguity open.
24. The current index does not describe ownership/purpose of `Game/` and `Builds/`, leaving the F-21 ambiguity open.
25. The current index does not explain how high-churn report infrastructure should be represented, leaving report discoverability policy undefined.
26. The current index does not explicitly say whether it is intended to index **all stable live Markdown docs** or only a sample. That ambiguity is the core F-10 defect.

### Documents listed but absent

27. No currently listed file in `DOCUMENT_INDEX.md` was found to be absent. The problem is incompleteness and policy ambiguity, not phantom entries.

### Stale counts / stale examples

28. The document still functions as a selective example list in several sections while presenting itself as a complete map.
29. The `09_Development` “Important documents” list is a stale subset, not a real index.
30. The current document structure has no maintenance rule for fast-growing directories, so it is guaranteed to become stale again after correction unless policy is added.

## F-10 Scope Boundary

### A. F-10 required scope

The minimum scope required to fully resolve F-10 is:

- redefine `DOCUMENT_INDEX.md` as an explicit hybrid documentation map;
- individually register every live stable Markdown document that should be discoverable;
- register every managed root-level directory;
- add explicit policy treatment for `AI_Reports/`, `Game/`, and `Builds/`;
- add maintenance rules that stop immediate re-staleness.

### B. Overlapping findings touching the same file

- **F-12** — `VISION.md` not formally registered in the correct ownership context.
- **F-21** — `Game/` and `Builds/` missing from the index structure.
- **F-22** — repository root name uses underscore instead of hyphen.
- **F-25** — `INITIAL_REPOSITORY_AUDIT.md` not indexed (separate header issue remains outside `DOCUMENT_INDEX.md`).
- **F-27** — no canonical conflict hierarchy.

## Overlapping Findings Analysis

### Safe overlap bundling assessment

A single carefully scoped `DOCUMENT_INDEX.md` correction can safely resolve **F-10 plus the tightly coupled index-only parts of F-12, F-21, F-22, and part of F-25** because all of those are direct indexing/discoverability defects in the same file.

However, **F-27 should be deferred** unless explicitly approved for inclusion. Adding a conflict hierarchy is governance expansion, not just indexing repair. It is logically adjacent, but not required to make the index complete and may deserve separate human review.

### Recommended implementation scope choice

**Recommend: resolve F-10 plus tightly coupled index findings, while deferring F-27.**

That means the future correction should intentionally include:

- F-10 full repair;
- F-12 directory/index acknowledgment of `VISION.md`;
- F-21 registration of `Game/` and `Builds/`;
- F-22 repository-name correction;
- F-25 index-registration portion only.

And it should intentionally defer:

- F-27 conflict hierarchy unless the approver explicitly wants it bundled.
- The remaining F-25 header issue in `INITIAL_REPOSITORY_AUDIT.md`, because that requires modifying a second file.

## Recommended Target DOCUMENT_INDEX.md Outline

1. **Purpose**
   - define the document as the canonical repository documentation map and managed-directory index.
2. **Indexing Policy**
   - stable Markdown docs are listed individually;
   - dynamic/generated/historical streams are listed at directory-policy level when appropriate.
3. **Repository Structure**
   - show real root name `DROPi-Tycoon` and all live root-level managed directories.
4. **Root Files**
   - `README.md`.
5. **00_Project**
   - all 8 current documents, with strategic/governance/template/history distinctions.
6. **01_GameDesign**
   - all 4 current documents.
7. **02_Economy**
   - all 3 current documents.
8. **03_Logistics**
   - all 6 current documents.
9. **04_World**
   - all 5 current documents.
10. **05_AI**
    - both current documents.
11. **06_Technical**
    - all 4 current documents.
12. **07_UI**
    - both current documents.
13. **08_Assets**
    - `ASSETS.md`.
14. **09_Development**
    - all 25 current top-level documents.
15. **Game/**
    - purpose, expected contents, placeholder/generated-file rule.
16. **Builds/**
    - purpose, expected contents, generated-file rule.
17. **AI_Reports/**
    - purpose, non-canonical status, governing protocol reference, non-enumeration rule.
18. **Information Ownership Rules**
    - concise cross-folder ownership map.
19. **Canonical Priority / Conflict Resolution**
    - include only if explicitly approved for bundle scope; otherwise omit.
20. **Maintenance Rule**
    - exact update rules for new docs, renames, new managed dirs, reports, generated outputs, and audits.

## Minimum Entry Metadata

Recommended minimum per-entry metadata for stable document entries:

- **Path:** required.
- **Purpose:** required.
- **Canonical responsibility / note:** required when needed to prevent overlap or ambiguity.

Not recommended as per-entry metadata in `DOCUMENT_INDEX.md`:

- **Status:** no — already belongs in document headers and creates duplicate maintenance.
- **Owner:** no per-entry field needed; folder/section ownership plus responsibility note is enough.
- **Version:** no — already in document headers and quickly becomes stale.
- **Update date:** no — already in document headers and creates unnecessary churn.

Recommended minimum for managed-directory entries:

- **Path:** required.
- **Purpose:** required.
- **Indexing rule:** required (for example “directory-level only; do not list generated internals”).

## Maintenance Rules

1. **Adding a new canonical or stable live Markdown document**
   - Add a new entry to the correct section of `DOCUMENT_INDEX.md` in the same change.
2. **Moving or renaming a document**
   - Update its path and any ownership note in `DOCUMENT_INDEX.md` in the same change.
3. **Creating a new managed top-level directory**
   - Add a new directory entry with purpose and indexing rule before or together with the directory change.
4. **Adding AI reports**
   - Do not edit `DOCUMENT_INDEX.md` for each report; the folder-level `AI_Reports/` entry and `AI_REPORTING_PROTOCOL.md` already govern them.
5. **Generated files**
   - Do not individually index generated/export/build internals under `Game/` or `Builds/`.
6. **Archived or historical files**
   - Individually list stable standalone historical documents (for example `INITIAL_REPOSITORY_AUDIT.md`) when they remain live repository references; represent report streams at directory level.
7. **Consistency validation**
   - During intake/audit, compare real root directories and all live Markdown paths against `DOCUMENT_INDEX.md`.
   - Validation should fail if a stable live Markdown document is missing from the index or if an indexed file does not exist.
8. **Counts**
   - Do not hardcode per-folder document counts in `DOCUMENT_INDEX.md`.
   - Counts are useful in audit reports, not in the canonical index.

## Exact Correction Plan

| Exact section | Current issue | Recommended correction | Reason | Priority | Related findings |
|---|---|---|---|---|---|
| Purpose | Claims to be a complete map without defining what is included | Rewrite purpose to define stable-doc + managed-directory hybrid scope | Removes the ambiguity that caused F-10 | REQUIRED | F-10 |
| Indexing Policy (new) | No inclusion/exclusion rule exists | Add explicit policy for stable docs vs dynamic/generated/historical directories | Prevents immediate re-staleness | REQUIRED | F-10 |
| Repository Structure | Wrong root name; missing `Game/` and `Builds/` | Use `DROPi-Tycoon` and include all live root-level managed dirs | Aligns index with real repo | REQUIRED | F-10, F-21, F-22 |
| Root Files (new) | Root `README.md` invisible | Add `README.md` entry | Restores discoverability of external-facing docs | REQUIRED | F-10 |
| 00_Project | Only 2 formal documents listed; multiple live docs omitted | List all 8 current docs and label template/history items | Fixes large governance/index gap | REQUIRED | F-10, F-12, F-25 (partial) |
| 01_GameDesign | Already complete, but should remain in full list format | Keep complete explicit registration | Maintain consistency across sections | REQUIRED | F-10 |
| 02_Economy | No explicit documents listed | Add all 3 docs | Full discoverability | REQUIRED | F-10 |
| 03_Logistics | No explicit documents listed | Add all 6 docs | Full discoverability | REQUIRED | F-10 |
| 04_World | No explicit documents listed | Add all 5 docs | Full discoverability | REQUIRED | F-10 |
| 05_AI | No explicit documents listed | Add both docs | Full discoverability | REQUIRED | F-10 |
| 06_Technical | `TDD.md` omitted from explicit list | Add complete 4-document list | Full discoverability | REQUIRED | F-10 |
| 07_UI | No explicit documents listed | Add both docs | Full discoverability | REQUIRED | F-10 |
| 08_Assets | `ASSETS.md` not explicitly registered | Add the document entry | Full discoverability | REQUIRED | F-10 |
| 09_Development | Only 6 docs explicitly listed; policy for reports absent | List all 25 top-level docs and separate `AI_Reports/` treatment | Biggest current gap by volume | REQUIRED | F-10 |
| Game/ | Directory absent from index | Add directory section with purpose and non-enumeration rule | Real root folder must be represented | REQUIRED | F-10, F-21 |
| Builds/ | Directory absent from index | Add directory section with purpose and non-enumeration rule | Real root folder must be represented | REQUIRED | F-10, F-21 |
| AI_Reports/ | Directory named without policy; reports unbounded | Add dedicated section referencing `AI_REPORTING_PROTOCOL.md` and directory-level indexing only | Matches real report governance | REQUIRED | F-10 |
| Information Ownership Rules | Current ownership summary is too coarse for real structure | Refresh ownership summary to match actual repo and clarify `VISION.md` vs `01_GameDesign` | Reduces routing ambiguity | REQUIRED | F-10, F-12 |
| Canonical Priority / Conflict Resolution | Not required for completeness; expands governance | Defer unless explicitly approved | Keeps this correction safely scoped | OPTIONAL / DEFER | F-27 |
| Maintenance Rule | No upkeep rule beyond generic “check if it exists already” | Add concrete maintenance obligations | Prevents future stale index drift | REQUIRED | F-10 |

## Required vs Optional Changes

### Required

- Rewrite purpose/scope.
- Add an explicit indexing policy.
- Correct repository root name.
- Add root `README.md`.
- Expand all numbered-folder sections to complete explicit file registration.
- Add `Game/`, `Builds/`, and `AI_Reports/` sections with directory-level rules.
- Update ownership rules to reflect real current structure.
- Add maintenance rules.

### Optional / defer

- Add canonical conflict hierarchy language for F-27.
- Modify `00_Project/INITIAL_REPOSITORY_AUDIT.md` header to add `Status:` (needed only for full F-25 resolution, not for F-10).

## Exact Files That Would Change

### Required if the proposed correction is approved

- `00_Project/DOCUMENT_INDEX.md`

### Not required for F-10 closure

- No other canonical file is required to fully resolve F-10.

### Only if a reviewer also wants full F-25 closure

- `00_Project/INITIAL_REPOSITORY_AUDIT.md` — to add the missing `Status:` header field.

## Validation Plan

A future implementation should be accepted only if all checks below pass:

1. Every live stable Markdown document outside `09_Development/AI_Reports/` is discoverable by explicit entry in `00_Project/DOCUMENT_INDEX.md`.
2. Root `README.md`, `Game/`, `Builds/`, and `09_Development/AI_Reports/` are represented.
3. No file is listed that does not currently exist.
4. `AI_Reports/` is represented in a way that matches `09_Development/AI_REPORTING_PROTOCOL.md` (directory-level historical/non-canonical treatment, no mandatory per-report enumeration).
5. `Game/` and `Builds/` are documented without enumerating generated internals.
6. `00_Project/VISION.md` is formally discoverable in the correct section.
7. Repository name is `DROPi-Tycoon`, not `DROPi_Tycoon`.
8. No document counts are hardcoded in a way that creates unnecessary staleness.
9. Only approved files are modified (`00_Project/DOCUMENT_INDEX.md` and the required persistent report for that task).
10. Historical AI reports are not edited.

## Risks

- **Over-scoping risk:** bundling F-27 could expand a straightforward indexing correction into a broader governance decision.
- **Under-scoping risk:** fixing only a few missing files would leave the index structurally incomplete and F-10 still open.
- **Maintenance risk:** listing dynamic report files or future build artifacts individually would cause immediate staleness.
- **Ambiguity risk:** if the corrected index does not explicitly state inclusion rules, the repository will drift back into partial-example behavior.

# Recommendations

## F-10 Resolution Status if Implemented

If the recommended correction is implemented exactly as proposed above, **F-10 would be FULLY RESOLVED**.

Reason:

- the index would have a clear policy;
- all stable live Markdown docs would become discoverable;
- all managed top-level directories would be represented;
- dynamic/historical/generated areas would be handled in a maintainable way.

If a future implementation only expands a few sections but leaves policy undefined, F-10 should be treated as only **PARTIALLY RESOLVED**.

## Impact on F-12, F-21, F-22, F-25, and F-27

| Finding | Impact if recommended F-10 correction is implemented | Notes |
|---|---|---|
| F-12 | **Fully resolved** | Explicit `00_Project/VISION.md` registration and clarified ownership boundary solve the index/taxonomy ambiguity |
| F-21 | **Fully resolved** | `Game/` and `Builds/` become represented with purpose rules |
| F-22 | **Fully resolved** | Repository name is corrected to `DROPi-Tycoon` |
| F-25 | **Partially resolved** | Index-registration portion is solved; missing `Status:` field in `INITIAL_REPOSITORY_AUDIT.md` remains unless that file is separately edited |
| F-27 | **Unaffected** if deferred; **fully resolved** only if conflict hierarchy is explicitly bundled | Recommend deferring unless separately approved |

## Final Recommendation

Approve a **single-file future correction to `00_Project/DOCUMENT_INDEX.md`** that implements the hybrid indexing model described in this report.

That correction should intentionally bundle:

- F-10 full repair,
- F-12 index acknowledgment,
- F-21 directory registration,
- F-22 repository-name correction,
- and the index portion of F-25.

It should intentionally **exclude** F-27 unless a reviewer explicitly wants to expand scope into cross-document conflict governance.

This is the safest, smallest, and most maintainable way to make `DOCUMENT_INDEX.md` accurate again without converting it into an unstable mirror of every historical or generated file in the repository.

# Validation Performed

1. Verified remote default branch metadata: `origin` HEAD branch = `main`.
2. Verified the working branch and current base commit.
3. Built a full live inventory of repository Markdown files and relevant `.gitkeep` placeholders.
4. Confirmed current root repository contents are limited to documentation folders plus managed placeholders (`Game/`, `Builds/`).
5. Confirmed current live generated build/game artifacts are absent.
6. Cross-checked current `DOCUMENT_INDEX.md` against actual live Markdown file names to measure explicit discoverability.
7. Verified current AI report numbering state: highest report = `021`; next available = `022`.
8. Verified no package manifests, workflow files, build configs, or test harness files exist in the repository root/content scan; therefore there are no existing repository lint/build/test commands to run for this report-only task.

# Validation Results

- ✅ Remote default branch verified as `main`.
- ✅ Real repository inventory completed.
- ✅ Current `DOCUMENT_INDEX.md` read in full.
- ✅ Required governance/source documents read.
- ✅ All persistent reports through current latest report (`021`) were inspected at metadata level, with targeted overlap review for `DOCUMENT_INDEX.md` findings.
- ✅ Exact next report sequence verified as `022`.
- ✅ This task remained analysis-only with report-only modification scope.
- ✅ No canonical project file was modified.
- ✅ No historical report file was modified.

# Unresolved Issues

- F-10 remains open in the repository because `00_Project/DOCUMENT_INDEX.md` has not yet been corrected.
- F-27 remains a separate governance decision unless explicitly bundled with the future correction.
- F-25 cannot be fully closed without an additional edit to `00_Project/INITIAL_REPOSITORY_AUDIT.md`.
- PR link is pending until a report-only pull request is created for this file.

# Final Result/Status

**Completed — analysis and correction proposal produced.**

This task established the exact current incompleteness of `00_Project/DOCUMENT_INDEX.md`, selected the safest maintainable indexing policy, defined the complete future correction scope, and created the required persistent report without modifying any canonical project document.

# Follow-up Actions

1. Open the required report-only Pull Request for human review.
2. If approved, execute a separate implementation task that edits only `00_Project/DOCUMENT_INDEX.md` (plus its own required implementation report).
3. In that future implementation task, bundle F-12, F-21, F-22, and the index-registration portion of F-25.
4. Leave F-27 for separate approval unless the reviewer explicitly authorizes conflict-hierarchy bundling.
