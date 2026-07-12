# Report Metadata

- Report ID: 2026-07-12_015_F06_SCENE_NAMING_CORRECTION_PROPOSAL
- Report title: F-06 Scene Naming Consistency Analysis and Correction Proposal
- Date: 2026-07-12
- Project: DROPi Tycoon
- Task type: Analysis-only (persistent report + correction proposal)
- Agent/model: GitHub Copilot Task Agent (GPT-5 class via Copilot)
- Repository: caliofmarian-ai/DROPi-Tycoon
- Branch: copilot/f-06-analyze-scene-naming
- Base commit: 6a94f14a775a4b00bb9e6143ed6090a37af96d22
- Resulting commit: N/A (assigned after commit)
- Pull Request: N/A (created after commit)
- Human approval status: Pending review

# Original Task Instruction

Analyze audit finding F-06 in the DROPi Tycoon repository and produce a correction proposal.

This is an analysis-only task.

Do not modify any canonical project file.
Do not fix F-06 yet.
Do not analyze or fix unrelated audit findings.
Do not invent new scenes, gameplay flows, UI screens, GDevelop architecture, naming systems, or implementation requirements.

OBJECTIVE

Resolve the documented inconsistency in GDevelop scene names across the DROPi Tycoon repository.

The repository may currently use conflicting scene names such as:

- MainMenu
- Main_Menu

- GameWorld
- Game_Map

- CompanyManagement
- Company_Interface

The goal is to determine one canonical scene naming scheme and the smallest safe correction required to make all live project documents consistent.

SOURCE OF TRUTH

Use:

- current main branch;
- 09_Development/AI_Reports/2026-07-12_001_FULL_DOCUMENTATION_CONSISTENCY_AUDIT.md;
- real current repository contents;
- all canonical documents that define or depend on GDevelop scenes, scene transitions, project structure, gameplay flow, UI flow, prototype scope, testing, build generation, events, assets, and implementation.

REQUIRED ANALYSIS

1. Read the complete persistent audit finding F-06.

2. Search the complete repository for every scene-name reference, including:

- MainMenu
- Main_Menu
- GameWorld
- Game_Map
- CompanyManagement
- Company_Interface
- Loading
- Settings
- scene
- scenes
- Scene
- Scenes
- Change scene
- scene transition
- scene flow
- GDevelop scene

3. Build a complete inventory of all scene names currently used in live non-historical repository documents.

For every scene name found, record:

- exact scene name;
- exact file path;
- exact section/context;
- purpose of the scene;
- whether the reference is canonical, implementation-oriented, descriptive, example-only, or historical;
- whether another name is used elsewhere for the same scene.

4. Identify every contradiction, including:

- multiple names for the same logical scene;
- names used in scene-flow documents but not project-structure documents;
- names used in GDevelop implementation documents but not prototype documents;
- scene names referenced in testing/build documents but absent from the canonical scene set;
- inconsistent capitalization;
- inconsistent separators;
- singular/plural inconsistencies;
- scene names that appear to represent different concepts but may have been incorrectly treated as aliases.

5. Determine the current canonical ownership for:

A. Prototype v0.1 scene scope.

B. GDevelop project scene structure.

C. Scene transition flow.

D. UI navigation flow.

E. Gameplay flow.

F. Scene names used by implementation agents.

G. Scene names used by testing and release validation.

6. Determine whether a canonical scene registry already exists.

If it exists:

- identify its canonical owner;
- determine whether other documents correctly reference it.

If it does not exist:

- determine which existing document should own the canonical scene-name registry;
- prefer an existing document;
- do not recommend creating a new document unless repository evidence proves it necessary.

7. Determine the complete minimum scene set required for Prototype v0.1.

Do not add scenes solely for future convenience.

For every required scene, provide:

- logical purpose;
- all names currently used for it;
- recommended canonical name;
- reason for the recommended name.

8. Evaluate the competing naming schemes.

At minimum analyze:

Option A:
MainMenu
GameWorld
CompanyManagement

Option B:
Main_Menu
Game_Map
Company_Interface

Option C:
Another consistent naming scheme already supported more strongly by repository evidence.

Evaluate each option for:

- current repository usage frequency;
- compatibility with existing GDevelop project structure;
- compatibility with scene transitions;
- compatibility with gameplay flow;
- compatibility with UI documentation;
- compatibility with build pipeline;
- compatibility with testing documents;
- implementation safety;
- naming consistency;
- migration cost.

Recommend exactly one canonical naming scheme.

Do not choose a scheme only because it looks better stylistically.

Base the recommendation on repository evidence and implementation safety.

9. Determine whether names such as:

- Loading
- Settings
- Results
- Pause
- Upgrade
- Shop
- Delivery
- or other scene-like terms

are actual GDevelop scenes, overlays/UI states, panels, systems, examples, or future concepts.

Do not incorrectly add them to the canonical scene set.

10. Identify every live document that must change to fully resolve F-06.

For each proposed change provide:

- exact file path;
- exact section;
- current scene name;
- recommended canonical scene name;
- reason;
- whether the change is required or optional.

11. Determine whether any GDevelop project files or implementation artifacts currently exist.

If real project files exist:

- inspect the actual scene names;
- treat implementation reality as important evidence;
- do not modify project files in this analysis task.

If no real GDevelop project exists yet:

- state this explicitly;
- recommend names that minimize future implementation ambiguity.

12. Prefer the smallest safe correction set.

Do not perform unrelated cleanup.

13. Define the canonical rule future AI agents must follow when creating or referencing scenes.

The rule should prevent:

- aliases;
- silent scene renaming;
- undocumented new scenes;
- mismatch between documentation and GDevelop implementation.

14. Define validation criteria proving F-06 is fully resolved.

Validation must include:

- repository-wide search for deprecated scene names;
- canonical scene registry verification;
- scene-flow consistency;
- GDevelop project-structure consistency;
- testing/build-document consistency;
- no unrelated file modifications.

SCOPE BOUNDARY

Do not fix or expand into:

- gameplay balancing;
- Bicycle design;
- AI ownership;
- incomplete DOCUMENT_INDEX findings;
- repository naming;
- asset implementation;
- actual GDevelop project generation;
- code generation;
- event implementation;
- UI redesign;
- new scenes;
- future gameplay systems;
- multiplayer;
- backend systems;
- cloud systems;
- unrelated terminology cleanup.

OUTPUT

Provide:

- Root Cause Analysis
- Complete Scene Reference Inventory
- Scene Alias/Contradiction Matrix
- Canonical Ownership Analysis
- Existing Scene Registry Analysis
- Prototype v0.1 Minimum Scene Set
- Naming Scheme Comparison
- Recommended Canonical Scene Naming Scheme
- Canonical Scene Registry Recommendation
- Exact Correction Plan
- Exact Files That Would Change
- Required Changes vs Optional Changes
- Canonical Rule for Future AI Agents
- Validation Plan
- Risks
- Whether F-06 would be fully resolved
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

Create a report-only Pull Request for human review.

Do not merge the Pull Request.

AT COMPLETION PROVIDE

- exact report file created;
- evidence sources used;
- root cause summary;
- complete Prototype v0.1 minimum scene set;
- recommended canonical naming scheme;
- canonical owner of the scene registry;
- exact files that would change if approved;
- required vs optional changes;
- whether real GDevelop project files currently exist;
- whether F-06 would be fully resolved;
- validation results;
- Pull Request link.

# Objective

Analyze persistent finding F-06 against current repository reality, determine one evidence-based canonical GDevelop scene naming scheme for Prototype v0.1, and define the smallest safe correction set without modifying canonical project documents.

# Scope

- In scope: F-06 scene-name consistency analysis only.
- In scope: live non-historical documentation references and dependency checks (structure, transitions, prototype scope, UI flow, gameplay flow, testing/build references, implementation guidance).
- Out of scope: implementing fixes in canonical docs, unrelated findings, gameplay/system redesign, project generation.

# Files Inspected

- `/home/runner/work/DROPi-Tycoon/DROPi-Tycoon/09_Development/AI_REPORTING_PROTOCOL.md`
- `/home/runner/work/DROPi-Tycoon/DROPi-Tycoon/09_Development/AI_Reports/2026-07-12_001_FULL_DOCUMENTATION_CONSISTENCY_AUDIT.md`
- `/home/runner/work/DROPi-Tycoon/DROPi-Tycoon/09_Development/GDEVELOP_PROJECT_STRUCTURE.md`
- `/home/runner/work/DROPi-Tycoon/DROPi-Tycoon/09_Development/PROTOTYPE_TECH_STACK.md`
- `/home/runner/work/DROPi-Tycoon/DROPi-Tycoon/09_Development/PROTOTYPE_GENERATION_PACKAGE.md`
- `/home/runner/work/DROPi-Tycoon/DROPi-Tycoon/09_Development/PROTOTYPE_MILESTONES.md`
- `/home/runner/work/DROPi-Tycoon/DROPi-Tycoon/09_Development/PROTOTYPE_BUILD_PIPELINE.md`
- `/home/runner/work/DROPi-Tycoon/DROPi-Tycoon/09_Development/PROTOTYPE_RELEASE_CHECKLIST.md`
- `/home/runner/work/DROPi-Tycoon/DROPi-Tycoon/09_Development/PROTOTYPE_TESTING_PLAN.md`
- `/home/runner/work/DROPi-Tycoon/DROPi-Tycoon/09_Development/AI_PROJECT_GENERATION_PLAN.md`
- `/home/runner/work/DROPi-Tycoon/DROPi-Tycoon/09_Development/AI_AGENT_EXECUTION_PROTOCOL.md`
- `/home/runner/work/DROPi-Tycoon/DROPi-Tycoon/09_Development/AI_DEVELOPMENT_WORKFLOW.md`
- `/home/runner/work/DROPi-Tycoon/DROPi-Tycoon/09_Development/PROTOTYPE_V0.1.md`
- `/home/runner/work/DROPi-Tycoon/DROPi-Tycoon/09_Development/FIRST_PLAYABLE_EXPERIENCE.md`
- `/home/runner/work/DROPi-Tycoon/DROPi-Tycoon/09_Development/MOBILE_UI_CONTROLS.md`
- `/home/runner/work/DROPi-Tycoon/DROPi-Tycoon/09_Development/GAMEPLAY_EVENTS_FLOW.md`
- `/home/runner/work/DROPi-Tycoon/DROPi-Tycoon/09_Development/CORE_GAMEPLAY_SYSTEMS.md`
- `/home/runner/work/DROPi-Tycoon/DROPi-Tycoon/07_UI/UI.md`
- `/home/runner/work/DROPi-Tycoon/DROPi-Tycoon/07_UI/UX.md`
- `/home/runner/work/DROPi-Tycoon/DROPi-Tycoon/01_GameDesign/GAMEPLAY.md`
- `/home/runner/work/DROPi-Tycoon/DROPi-Tycoon/Game/.gitkeep`

# Files Created

- `/home/runner/work/DROPi-Tycoon/DROPi-Tycoon/09_Development/AI_Reports/2026-07-12_015_F06_SCENE_NAMING_CORRECTION_PROPOSAL.md`

# Files Modified

- `/home/runner/work/DROPi-Tycoon/DROPi-Tycoon/09_Development/AI_Reports/2026-07-12_015_F06_SCENE_NAMING_CORRECTION_PROPOSAL.md`

# Files Moved or Renamed

- None.

# Files Deleted

- None.

# Actions Performed

1. Read full AI reporting protocol and extracted mandatory report requirements.
2. Read persistent audit finding F-06 section and its original evidence table.
3. Executed repository-wide search for requested scene-name tokens and scene-flow terms.
4. Segmented findings into live non-historical docs vs historical AI reports.
5. Built inventory of all explicit scene-name references in live docs.
6. Cross-checked scene usage across structure, generation, prototype flow, testing, and release docs.
7. Verified implementation artifact presence (`Game/` contains only `.gitkeep`; no GDevelop project file found).
8. Evaluated naming options A/B/C against usage, compatibility, and migration safety.
9. Produced minimum correction proposal and validation criteria.

# Findings

## Root Cause Analysis

- F-06 originated from mixed scene naming across design docs.
- Current repository state shows **one remaining live inconsistency source**: `PROTOTYPE_TECH_STACK.md` still uses underscore aliases (`Main_Menu`, `Game_Map`, `Company_Interface`) while implementation-oriented scene docs use camel-case canonical names.
- Additional ambiguity exists from descriptive UI wording (`Main Menu`, `Main scene`) that is not a direct alias but can confuse implementation agents when no explicit mapping is given.
- Historical F-06 evidence line for `PROTOTYPE_GENERATION_PACKAGE.md` (`Company`) and `CompanyPanel` is no longer accurate in current main; that document currently uses `CompanyManagement`.

## Complete Scene Reference Inventory (Live Non-Historical)

| Exact scene name/reference | File path | Exact context/section | Purpose | Reference type | Alias conflict? |
|---|---|---|---|---|---|
| `MainMenu` | `09_Development/GDEVELOP_PROJECT_STRUCTURE.md` | Main Project Structure tree; `# Scenes` → `## MainMenu` | Start screen scene | Canonical + implementation-oriented | Conflicts with `Main_Menu`, descriptive `Main Menu` |
| `GameWorld` | `09_Development/GDEVELOP_PROJECT_STRUCTURE.md` | Main Project Structure tree; `# Scenes` → `## GameWorld`; MVP Implementation Order | Main gameplay scene | Canonical + implementation-oriented | Conflicts with `Game_Map` |
| `CompanyManagement` | `09_Development/GDEVELOP_PROJECT_STRUCTURE.md` | Main Project Structure tree; `# Scenes` → `## CompanyManagement` | Company management interface scene | Canonical + implementation-oriented | Conflicts with `Company_Interface` |
| `Main_Menu` | `09_Development/PROTOTYPE_TECH_STACK.md` | `# Project Structure` code block under `Scenes/` | Intended menu scene in initial stack structure | Implementation-oriented (but inconsistent) | Alias of `MainMenu` |
| `Game_Map` | `09_Development/PROTOTYPE_TECH_STACK.md` | `# Project Structure` code block under `Scenes/` | Intended main map/gameplay scene | Implementation-oriented (but inconsistent) | Alias of `GameWorld` |
| `Company_Interface` | `09_Development/PROTOTYPE_TECH_STACK.md` | `# Project Structure` code block under `Scenes/` | Intended company management scene | Implementation-oriented (but inconsistent) | Alias of `CompanyManagement` |
| `MainMenu` | `09_Development/PROTOTYPE_GENERATION_PACKAGE.md` | `# Scene Package` → `## MainMenu Scene` | Entry-point scene for generated prototype | Implementation-oriented generation spec | Consistent with canonical |
| `GameWorld` | `09_Development/PROTOTYPE_GENERATION_PACKAGE.md` | `# Scene Package` → `## GameWorld Scene` | Main playable environment | Implementation-oriented generation spec | Consistent with canonical |
| `CompanyManagement` | `09_Development/PROTOTYPE_GENERATION_PACKAGE.md` | `# Scene Package` → `## CompanyManagement Scene` | Company interface scene | Implementation-oriented generation spec | Consistent with canonical |
| `GameWorld scene` | `09_Development/PROTOTYPE_MILESTONES.md` | Milestone 1 task: “Create GameWorld scene” | Implementation milestone target | Implementation-oriented | Consistent with canonical |
| `Main Menu` (descriptive) | `09_Development/FIRST_PLAYABLE_EXPERIENCE.md` | `# First Launch Experience` → `## Main Menu` | UX/UI launch step | Descriptive (not explicit technical scene ID) | Potential ambiguity with `MainMenu` |
| `Main scene` (generic) | `09_Development/PROTOTYPE_RELEASE_CHECKLIST.md` | Project Stability checklist: “Main scene loads correctly” | Release validation checkpoint | Descriptive testing shorthand | Potential ambiguity (scene not explicitly named) |

## Scene Alias / Contradiction Matrix

| Logical scene | Names found | Where conflicting names appear | Contradiction type | Severity |
|---|---|---|---|---|
| Main menu scene | `MainMenu`, `Main_Menu`, `Main Menu` | `GDEVELOP_PROJECT_STRUCTURE.md`; `PROTOTYPE_TECH_STACK.md`; `FIRST_PLAYABLE_EXPERIENCE.md` | Separator/casing inconsistency + descriptive vs technical naming | Major |
| Main gameplay scene | `GameWorld`, `Game_Map` | `GDEVELOP_PROJECT_STRUCTURE.md`; `PROTOTYPE_TECH_STACK.md` | Different identifier for same scene | Major |
| Company management scene | `CompanyManagement`, `Company_Interface` | `GDEVELOP_PROJECT_STRUCTURE.md`; `PROTOTYPE_TECH_STACK.md` | Different identifier for same scene | Major |

### Additional contradiction checks

- Scene-flow docs vs structure docs: no dedicated scene-transition document with explicit IDs; flow is mostly descriptive (“Start game”, “Enter world”), so explicit mismatch is concentrated in `PROTOTYPE_TECH_STACK.md`.
- Implementation docs vs prototype docs: implementation docs (`GDEVELOP_PROJECT_STRUCTURE.md`, `PROTOTYPE_GENERATION_PACKAGE.md`) align on camel-case names; prototype scope docs are mostly generic and do not redefine scene IDs.
- Testing/build docs: no deprecated scene IDs found, but testing uses ambiguous generic wording (`Main scene`) without explicit canonical ID mapping.
- Capitalization/separator inconsistencies: present only in `PROTOTYPE_TECH_STACK.md`.
- Singular/plural inconsistencies: none affecting concrete scene IDs.
- False alias risk: `Main Menu` and `Main scene` are descriptive labels, not proven separate scenes.

## Canonical Ownership Analysis

### A. Prototype v0.1 scene scope
- Owner: `09_Development/PROTOTYPE_V0.1.md` (scope authority), with concrete scene realization delegated to GDevelop structure docs.

### B. GDevelop project scene structure
- Owner: `09_Development/GDEVELOP_PROJECT_STRUCTURE.md` (explicitly defines scene list and responsibilities).

### C. Scene transition flow
- Practical owner: `09_Development/PROTOTYPE_GENERATION_PACKAGE.md` (“First Prototype Gameplay” start→enter world flow) + `09_Development/FIRST_PLAYABLE_EXPERIENCE.md` (first-launch UX flow).
- Gap: no dedicated canonical scene transition map with exact IDs.

### D. UI navigation flow
- Owner set is split by intent: `07_UI/UI.md` (canonical UI architecture) and `09_Development/FIRST_PLAYABLE_EXPERIENCE.md` + `09_Development/MOBILE_UI_CONTROLS.md` (prototype UX/UI behavior).

### E. Gameplay flow
- Owner: `01_GameDesign/GAMEPLAY.md` (canonical gameplay loop), constrained for prototype by `09_Development/PROTOTYPE_V0.1.md`.

### F. Scene names used by implementation agents
- Primary owner: `09_Development/GDEVELOP_PROJECT_STRUCTURE.md`.
- Operational dependency: `09_Development/PROTOTYPE_GENERATION_PACKAGE.md`.
- Conflict source: `09_Development/PROTOTYPE_TECH_STACK.md`.

### G. Scene names used by testing and release validation
- `09_Development/PROTOTYPE_RELEASE_CHECKLIST.md` references “Main scene” (generic, not canonical ID).
- `09_Development/PROTOTYPE_TESTING_PLAN.md` does not define concrete scene IDs.

## Existing Scene Registry Analysis

- A canonical scene registry **already exists** in `09_Development/GDEVELOP_PROJECT_STRUCTURE.md` (`# Scenes` section + project tree).
- Registry owner: `GDEVELOP_PROJECT_STRUCTURE.md`.
- Cross-document conformance:
  - Conformant: `PROTOTYPE_GENERATION_PACKAGE.md`, `PROTOTYPE_MILESTONES.md`.
  - Non-conformant: `PROTOTYPE_TECH_STACK.md`.
  - Ambiguous but non-conflicting: `FIRST_PLAYABLE_EXPERIENCE.md`, `PROTOTYPE_RELEASE_CHECKLIST.md`.
- Conclusion: no new registry document is needed.

## Prototype v0.1 Minimum Scene Set

| Logical purpose | Names currently used | Recommended canonical name | Reason |
|---|---|---|---|
| Launch/entry UI | `MainMenu`, `Main_Menu`, `Main Menu` | `MainMenu` | Already canonical in structure + generation docs; lowest migration risk |
| Main playable world | `GameWorld`, `Game_Map` | `GameWorld` | Used by canonical structure, generation package, milestones |
| Company management interface | `CompanyManagement`, `Company_Interface` | `CompanyManagement` | Canonical structure + generation package alignment |

No additional scenes are required for Prototype v0.1 by current repository evidence.

## Naming Scheme Comparison

| Criterion | Option A (`MainMenu`,`GameWorld`,`CompanyManagement`) | Option B (`Main_Menu`,`Game_Map`,`Company_Interface`) | Option C (descriptive spaced names e.g. `Main Menu`,`Game World`,`Company Management`) |
|---|---|---|---|
| Current usage frequency (live docs) | Highest across scene-defining docs (2 strong docs + milestones) | Only one scene-defining doc (`PROTOTYPE_TECH_STACK.md`) | Only descriptive mentions, not technical IDs |
| Compatibility with GDevelop project structure | Full | Conflicts with canonical structure doc | Conflicts with existing technical IDs |
| Compatibility with scene transitions/flow docs | Compatible with “Start game/enter world” flow | Requires remapping | Ambiguous mapping required |
| Compatibility with gameplay/UI docs | Compatible (easy descriptive mapping) | Creates extra alias layer | Ambiguous for implementation |
| Compatibility with build pipeline/testing docs | Compatible; no explicit conflict | Adds inconsistency to existing checklists | Too vague for test automation |
| Implementation safety | Highest | Lower (would require changing canonical owner docs) | Low (introduces new technical naming) |
| Naming consistency | Strong camel-case scheme | Strong underscore scheme but isolated | Weak as technical scheme |
| Migration cost | Minimal (one required doc correction) | High (multi-doc canonical rewrite) | Medium/high (new normalization effort) |

## Recommended Canonical Scene Naming Scheme

**Recommended scheme: Option A**

- `MainMenu`
- `GameWorld`
- `CompanyManagement`

Reason: strongest current repository support in canonical scene owner + generation implementation docs, with the smallest safe migration surface.

## Canonical Scene Registry Recommendation

- Keep `09_Development/GDEVELOP_PROJECT_STRUCTURE.md` as the canonical scene registry owner.
- Do not create a new registry file.
- Require dependent docs to reference this registry verbatim for scene IDs.

# Recommendations

## Exact Correction Plan (smallest safe set)

1. Normalize scene IDs in `PROTOTYPE_TECH_STACK.md` Project Structure block:
   - `Main_Menu` → `MainMenu`
   - `Game_Map` → `GameWorld`
   - `Company_Interface` → `CompanyManagement`
2. Do not change gameplay/UI/system semantics.
3. Keep all other files unchanged unless ambiguity must be removed for validation clarity.

## Exact Files That Would Change

### Required changes

| File path | Section | Current | Recommended | Reason |
|---|---|---|---|---|
| `09_Development/PROTOTYPE_TECH_STACK.md` | `# Project Structure` code block (`Scenes/`) | `Main_Menu`, `Game_Map`, `Company_Interface` | `MainMenu`, `GameWorld`, `CompanyManagement` | Removes direct alias conflict with canonical scene registry |

### Optional changes (clarity hardening, not required to resolve core conflict)

| File path | Section | Current | Recommended | Reason |
|---|---|---|---|---|
| `09_Development/FIRST_PLAYABLE_EXPERIENCE.md` | `# First Launch Experience` heading | `Main Menu` | Keep text, optionally annotate `(MainMenu scene)` | Prevent implementation ambiguity while preserving UX wording |
| `09_Development/PROTOTYPE_RELEASE_CHECKLIST.md` | Project Stability checklist | `Main scene loads correctly` | Optionally specify `MainMenu scene loads correctly` | Makes testing explicit and aligned with registry |

## Required Changes vs Optional Changes

- Required: 1 file (`PROTOTYPE_TECH_STACK.md`) to remove all direct conflicting technical scene IDs.
- Optional: 2 files for clarity only; not mandatory for F-06 core resolution.

## Canonical Rule for Future AI Agents

When creating or referencing GDevelop scenes:

1. Use scene IDs **only** from `09_Development/GDEVELOP_PROJECT_STRUCTURE.md` `# Scenes`.
2. Do not introduce aliases (`Main_Menu`, `Game_Map`, etc.) in any implementation or generation document.
3. Any new scene requires explicit canonical update in the owner document first, then synchronized updates in dependent docs.
4. Silent renaming is forbidden; every rename must include explicit old→new mapping and repository-wide reference update.

This rule prevents aliases, silent renaming, undocumented scenes, and docs/implementation drift.

# Validation Performed

1. Repository-wide search for required tokens:
   - `MainMenu`, `Main_Menu`, `GameWorld`, `Game_Map`, `CompanyManagement`, `Company_Interface`
   - `Loading`, `Settings`, `Results`, `Pause`, `Upgrade`, `Shop`
   - `scene`, `scenes`, `Change scene`, `scene transition`, `scene flow`, `GDevelop scene`
2. Cross-document consistency check between:
   - canonical structure docs
   - generation/package docs
   - prototype scope/gameplay/UI docs
   - testing/release/build docs
3. Implementation artifact check for actual GDevelop project files in repository (`Game/`, `*.json`, `*.gd*`, `*.js`).

# Validation Results

## Repository evidence summary

- Conflicting scene aliases are present in live docs only in `PROTOTYPE_TECH_STACK.md`.
- Canonical scene set is already consistent in `GDEVELOP_PROJECT_STRUCTURE.md` and `PROTOTYPE_GENERATION_PACKAGE.md`.
- No dedicated GDevelop project artifact currently exists (`Game/` contains only `.gitkeep`; no actual scene implementation file found).

## Scene-like term classification

- `Settings`: appears as menu/button/config concept, not an explicit scene ID.
- `Loading`: not found as live doc scene reference.
- `Results`: not found as scene reference (matches only report-section headers in historical reports).
- `Pause`: not found as scene reference.
- `Upgrade`: gameplay/UI system or action, not a scene.
- `Shop`: appears only as world role (“Shop owners”), not a scene.
- `Delivery`: gameplay mechanic/system term, not a scene ID.

## F-06 resolution status by proposal

- If required correction is applied (`PROTOTYPE_TECH_STACK.md` scene IDs), F-06 would be fully resolved for live technical scene naming.
- Optional clarity edits improve resilience but are not mandatory for core resolution.

# Unresolved Issues

- None blocking the correction proposal.
- Minor documentation ambiguity remains in descriptive wording (`Main Menu`, `Main scene`) if optional changes are not adopted.

# Final Result/Status

Completed: Analysis-only F-06 correction proposal with evidence-based canonical scheme and minimal safe correction set.

Decision: Adopt and enforce `MainMenu`, `GameWorld`, `CompanyManagement` with `GDEVELOP_PROJECT_STRUCTURE.md` as canonical registry owner.

F-06 full-resolution expectation: **Yes**, after required correction to `PROTOTYPE_TECH_STACK.md`.

# Follow-up Actions

1. Human review and approve this proposal.
2. In a separate implementation task, update required file(s) only.
3. Run post-change validation:
   - zero matches for deprecated aliases in live docs (`Main_Menu`, `Game_Map`, `Company_Interface`);
   - canonical registry still authoritative;
   - scene-flow/testing/build docs remain consistent;
   - no unrelated file modifications.

