# Document Information

Document: FIRST_IMPLEMENTATION_BATCH.md
Project: DROPi Tycoon
Version: 1.0.0
Status: Implementation Preparation — Non-Authoritative
Author: AI Agent (Prototype v0.1 Implementation Preparation Task)
Language: English
Last Updated: 2026-07-14

---

# First Implementation Batch — BATCH-001

## Purpose

This document provides the complete, directly executable definition of the first implementation batch for DROPi Tycoon Prototype v0.1.

A future agent or developer can use this document to begin implementation immediately without consulting any other preparation document first.

**This is a non-authoritative planning document. If any conflict exists between this document and a canonical document, the canonical document governs.**

---

## Batch Identity

| Field | Value |
|---|---|
| Batch ID | BATCH-001 |
| Title | GDevelop Project Foundation |
| Type | Repository & Tool Foundation |
| Canonical requirements covered | REQ-170, REQ-171, REQ-172, REQ-180, REQ-181, REQ-182, REQ-227 |
| Estimated scope | Small — one GDevelop project creation session |
| Human approval required | No |
| Blocks | BATCH-002, BATCH-003 (both can start immediately after) |
| Predecessor | None — starting from empty |

---

## Branch Purpose

Create a new feature branch from `origin/main`.

Suggested branch name: `feat/batch-001-gdevelop-foundation`

This branch contains only the GDevelop project foundation — no gameplay, no events, no assets.

---

## Exact Objective

Create a valid, runnable, correctly configured GDevelop 5 project that:

1. Is saved to `Game/DROPi_Tycoon.json` in the repository
2. Is configured for mobile (portrait orientation, Android target)
3. Contains exactly 3 empty scenes: `MainMenu`, `GameWorld`, `CompanyManagement`
4. Contains the complete global variable schema (CompanyData, GameSettings, SaveFormatVersion)
5. Contains the empty asset folder structure (Sprites, Audio, UI)
6. Opens without errors in GDevelop

---

## Preconditions Checklist

Before starting BATCH-001, verify:

- [ ] Working on a branch created from `origin/main` (verified at commit `d8e1dd0` or later)
- [ ] `Game/` directory exists and is empty (verified: placeholder-only per repository reality check)
- [ ] GDevelop 5 is available and accessible (tool required for implementation)
- [ ] Repository state: Implementation_Preparation/ package exists (documentation only, no game files)

---

## Exact Files / Artifacts Expected

### New files created

- `Game/DROPi_Tycoon.json` — GDevelop project file

### New directories created (inside GDevelop project)

- `Game/DROPi_Tycoon/Assets/Sprites/` (empty or with .gitkeep)
- `Game/DROPi_Tycoon/Assets/Audio/` (empty or with .gitkeep)
- `Game/DROPi_Tycoon/Assets/UI/` (empty or with .gitkeep)

### Files NOT expected to be created

- No gameplay files
- No event sheets
- No sprites or audio files
- No documentation changes (CHANGELOG, PROJECT_STATUS, DOCUMENT_INDEX are not modified in BATCH-001)

---

## Exact Canonical Sources

| Architecture Decision | Canonical Source | Section |
|---|---|---|
| Project name: DROPi_Tycoon | `GDEVELOP_PROJECT_STRUCTURE.md` | Main Project Structure |
| Project location: Game/ | `DOCUMENT_INDEX.md` | Game/ section |
| Scene: MainMenu | `GDEVELOP_PROJECT_STRUCTURE.md` | Scenes/MainMenu |
| Scene: GameWorld | `GDEVELOP_PROJECT_STRUCTURE.md` | Scenes/GameWorld |
| Scene: CompanyManagement | `GDEVELOP_PROJECT_STRUCTURE.md` | Scenes/CompanyManagement |
| Global: CompanyData | `GAME_DATA_STRUCTURE.md` | CompanyData Structure |
| Global: GameSettings | `GAME_DATA_STRUCTURE.md` | GameSettings |
| Global: SaveFormatVersion | `SAVE_SYSTEM.md` | Version Compatibility |
| Asset folders: Sprites, Audio, UI | `GDEVELOP_PROJECT_STRUCTURE.md` | Assets section; `ASSETS.md` |
| Mobile / Android target | `PROTOTYPE_TECH_STACK.md` | Target Platform |

---

## Exact Implementation Steps

### Step 1 — Open GDevelop and Create New Project

1. Open GDevelop 5
2. Select `Create a new project`
3. Set project name: `DROPi_Tycoon`
4. Set save location: `Game/` directory of the repository
5. Confirm project is saved as `Game/DROPi_Tycoon.json`

### Step 2 — Configure Mobile Settings

1. Open project properties (Project menu → Project Properties)
2. Set orientation: `Portrait`
3. Set game resolution:
   - Width: 360
   - Height: 640
   - Resize mode: `Adapt to screen size` (or GDevelop equivalent for mobile)
4. Set target platform: Android (or confirm build target is configured for Android)

### Step 3 — Create Three Scenes

Create the following scenes in this order:

1. `MainMenu` (set as the first/default scene)
2. `GameWorld`
3. `CompanyManagement`

Leave all scenes completely empty (no objects, no events).

### Step 4 — Define Global Variables

Open the global variables panel and create the following structure:

#### CompanyData (Structure type)

Sub-fields:

| Field Name | Type | Default Value |
|---|---|---|
| `CompanyName` | String | `""` (empty string) |
| `Money` | Number | `100` (see note below) |
| `Level` | Number | `1` |
| `Experience` | Number | `0` |
| `Reputation` | Number | `0` |
| `UpgradeList` | Structure | (sub-fields below) |

**CompanyData.UpgradeList sub-fields:**

| Field Name | Type | Default Value |
|---|---|---|
| `DeliverySpeed` | Number | `0` |
| `Capacity` | Number | `0` |
| `Efficiency` | Number | `0` |
| `BicycleOwned` | Boolean | `false` |

> **Note on starting money:** The canonical requirement (REQ-002) specifies "small amount of money, limited ability, clear reason to improve." The exact value is classified as `IMPLEMENTATION DETAIL — AGENT MAY CHOOSE` (IDR-001). A default of `100` is suggested here as a starting point, subject to balancing during BATCH-009 and confirmation at BATCH-016.

#### GameSettings (Structure type)

| Field Name | Type | Default Value |
|---|---|---|
| `TutorialStatus` | Boolean | `false` |
| `Sound` | Boolean | `true` |
| `Music` | Boolean | `true` |
| `Language` | String | `"en"` |
| `Difficulty` | String | `"normal"` |

#### SaveFormatVersion (Number)

| Variable Name | Type | Default Value |
|---|---|---|
| `SaveFormatVersion` | Number | `1` |

### Step 5 — Create Asset Folder Structure

Inside the GDevelop project asset manager, create the following folders:

- `Sprites` (inside Assets)
- `Audio` (inside Assets)
- `UI` (inside Assets)

Leave all folders empty.

### Step 6 — Save and Verify

1. Save the project (`Ctrl+S` or File → Save)
2. Confirm file exists at `Game/DROPi_Tycoon.json`
3. Close GDevelop
4. Reopen GDevelop and load `Game/DROPi_Tycoon.json`
5. Confirm: project opens without errors
6. Confirm: all 3 scenes exist
7. Confirm: all global variables exist with correct names
8. Confirm: asset folders exist

### Step 7 — Commit

1. Stage all files in `Game/`
2. Run secret scanning on changed files before committing
3. Commit with message: `feat: BATCH-001 GDevelop project foundation — 3 scenes, global variable schema, asset folders`
4. Push branch
5. Create Pull Request for review

---

## Exact Validation Steps

After completing Step 6 above, execute the following validation checks:

### Validation V1 — Project Opens

- [ ] `Game/DROPi_Tycoon.json` exists in repository
- [ ] Project opens in GDevelop without errors or warnings

### Validation V2 — Scene Existence

- [ ] Scene `MainMenu` exists
- [ ] Scene `GameWorld` exists
- [ ] Scene `CompanyManagement` exists
- [ ] `MainMenu` is the first (default) scene

### Validation V3 — Global Variable Schema

- [ ] Global variable `CompanyData` is type Structure
- [ ] `CompanyData.CompanyName` exists (String)
- [ ] `CompanyData.Money` exists (Number, default 100 or chosen value ≥ 0)
- [ ] `CompanyData.Level` exists (Number, default 1)
- [ ] `CompanyData.Experience` exists (Number, default 0)
- [ ] `CompanyData.Reputation` exists (Number, default 0)
- [ ] `CompanyData.UpgradeList` exists (Structure)
- [ ] `CompanyData.UpgradeList.DeliverySpeed` exists (Number, default 0)
- [ ] `CompanyData.UpgradeList.Capacity` exists (Number, default 0)
- [ ] `CompanyData.UpgradeList.Efficiency` exists (Number, default 0)
- [ ] `CompanyData.UpgradeList.BicycleOwned` exists (Boolean, default false)
- [ ] Global variable `GameSettings` is type Structure
- [ ] `GameSettings.TutorialStatus` exists (Boolean, default false)
- [ ] Global variable `SaveFormatVersion` exists (Number, default 1)

### Validation V4 — Asset Folders

- [ ] `Sprites` folder exists in project asset manager
- [ ] `Audio` folder exists in project asset manager
- [ ] `UI` folder exists in project asset manager

### Validation V5 — No Implementation Scope Expansion

- [ ] No gameplay events were added
- [ ] No objects were added to scenes
- [ ] No assets were imported
- [ ] No documentation files were modified

---

## Acceptance Criteria

BATCH-001 is accepted when all 5 validation checklists above pass with no unchecked items.

---

## Explicit Non-Goals

The following are explicitly excluded from BATCH-001:

- Map creation (BATCH-004)
- Player object (BATCH-004)
- Event sheets of any kind (BATCH-002 onwards)
- Sprite assets (BATCH-003)
- Order system (BATCH-005)
- Player movement (BATCH-006)
- HUD or UI (BATCH-010)
- Save/Load implementation (BATCH-013)
- Any gameplay behavior of any kind
- Changes to any documentation file

---

## Stop Conditions

Stop BATCH-001 immediately and report to the Project Owner if:

1. GDevelop cannot save the project to the `Game/` directory
2. GDevelop reports the `Game/DROPi_Tycoon.json` format is incompatible with the current GDevelop version
3. The global variable system in the available GDevelop version does not support nested structures as described — report the exact constraint and await architectural guidance before proceeding
4. Any canonical conflict is discovered during this batch that was not identified in the preparation package — do not resolve it silently; create a report and escalate

---

## What BATCH-002 Expects From BATCH-001

BATCH-002 (Scene Scaffold & External Event Sheet Definitions) expects:

- `Game/DROPi_Tycoon.json` to be a valid, openable GDevelop project
- All 3 scenes to exist
- Global variable schema to be defined
- No conflicts with architecture decisions in `GDEVELOP_IMPLEMENTATION_ARCHITECTURE.md`

---

## What BATCH-003 Expects From BATCH-001

BATCH-003 (Placeholder Asset Creation) expects:

- `Game/DROPi_Tycoon.json` to be a valid, openable GDevelop project
- Asset folder structure (Sprites, Audio, UI) to exist

---

End of Document
