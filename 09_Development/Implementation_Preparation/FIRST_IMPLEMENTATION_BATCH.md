# Document Information

Document: FIRST_IMPLEMENTATION_BATCH.md
Project: DROPi Tycoon
Version: 1.1.0
Status: Implementation Preparation — Non-Authoritative
Author: AI Agent (PR #56 correction from Report 057)
Language: English
Last Updated: 2026-07-14

---

# First Implementation Batch — BATCH-001 (Corrected)

## Batch Identity

- Batch ID: **BATCH-001**
- Title: **GDevelop Project Foundation Scaffold**
- Purpose: Establish implementation foundation only.
- Canonical requirement IDs: **REQ-145, REQ-146, REQ-147, REQ-149, REQ-150, REQ-151, REQ-173**
- Blocks next: BATCH-002 and BATCH-003
- Owner-decision dependency: **None**

---

## Exact Branch Purpose

Create only the minimum project scaffold required to start implementation batches.

No gameplay logic, gameplay content, release claims, or scope expansion are allowed.

---

## Exact Project Path and Expected Files

- Project file path: `Game/DROPi_Tycoon.json`
- Expected directories (project-level asset folders):
  - `Assets/Sprites`
  - `Assets/Audio`
  - `Assets/UI`

Expected output in repository:
- project file present under `Game/`
- no playable build output under `Builds/`

---

## Scene Creation in BATCH-001

**Yes — scenes are created in BATCH-001 as empty scaffolds only:**

- `MainMenu`
- `GameWorld`
- `CompanyManagement`

No objects, gameplay events, or runtime mechanics are added in this batch.

---

## Project Settings in BATCH-001

Required settings:
- mobile-target-compatible project profile
- project opens cleanly in the selected GDevelop version

Not fixed in this batch (implementation details):
- exact numeric resolution
- exact orientation property wording in tool UI
- visual transition effects

---

## Global Variable Scaffold in BATCH-001

Create global roots only:
- `CompanyData`
- `GameSettings`
- `SaveFormatVersion`

Do not finalize owner-gated persistence semantics in this batch.

---

## Exact Validation

BATCH-001 passes only if all are true:
1. `Game/DROPi_Tycoon.json` exists.
2. Project opens without errors.
3. Exactly three scenes exist with canonical names.
4. Global roots `CompanyData`, `GameSettings`, `SaveFormatVersion` exist.
5. Asset folders `Sprites`, `Audio`, `UI` exist.
6. No gameplay objects/events/system logic were created.
7. No excluded features were introduced.

---

## Stop Conditions

Stop and escalate if any occur:
1. Project cannot be created/saved at `Game/DROPi_Tycoon.json`.
2. Canonical scene names cannot be represented exactly.
3. GDevelop version constraints prevent required scaffold structure.
4. Any canonical conflict is discovered while executing this batch.

---

## Explicit Non-Goals

- No delivery gameplay implementation.
- No order lifecycle implementation.
- No save/load behavior implementation.
- No UI gameplay behavior implementation.
- No owner-decision resolution.
- No asset production or final balancing.

---

## Executability Result

BATCH-001 is executable as written and does not depend on unresolved owner decisions.

---

End of Document
