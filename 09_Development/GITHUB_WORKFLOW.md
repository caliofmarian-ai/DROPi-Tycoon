# Document Information

Document: GITHUB_WORKFLOW.md
Project: DROPi Tycoon
Version: 1.1.0
Status: Development Repository Rules
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-09-12

---

# GitHub Workflow

## Purpose

This document defines the workflow used for managing DROPi Tycoon development through GitHub.

The goal is to maintain:

- Project safety
- Version history
- Collaboration readiness
- AI-assisted development control

---

# Repository Purpose

The GitHub repository is the central location for:

- Structured project documentation across numbered domain folders (`00_Project/` through `09_Development/`)
- Game project files
- Asset governance (`08_Assets/`)
- Build versions
- Development history

---

# Repository Structure

```
DROPi-Tycoon

├── README.md
├── 00_Project/
├── 01_GameDesign/
├── 02_Economy/
├── 03_Logistics/
├── 04_World/
├── 05_AI/
├── 06_Technical/
├── 07_UI/
├── 08_Assets/
├── 09_Development/
├── Game/
└── Builds/
```

The canonical complete repository structure map is owned by:

`00_Project/DOCUMENT_INDEX.md`

This document provides only a summarized root structure for workflow context.

`09_Development/AI_Reports/` is a managed historical reporting directory governed by:

`09_Development/AI_REPORTING_PROTOCOL.md`

---

# Branch Strategy

## Main Branch

Purpose:

Stable project version.

Rules:

- Contains approved changes only.
- Must always remain functional.

---

## Development Branch

Purpose:

Active development.

Used for:

- New features
- Experiments
- Testing

---

# AI Agent Workflow

DT agents use the repository-first workflow below:

```
Read canonical repository memory and live GitHub

↓

Reconcile current main, Issues, PRs and exact-head CI

↓

Implement directly or route a bounded DT specialist mission

↓

Create/update one scoped Pull Request

↓

Run deterministic validation and inspect the exact head

↓

DT-00 decides merge sequencing

↓

Merge only when the applicable technical and owner-visible gates pass

↓

Verify exact-main CI, deployment and player/device evidence when applicable
```

DT-00 may continue routine reversible repository work already authorized by the Project Owner without asking Marian to repeat approval for each mechanical step. A new product decision, purchase, external authority, destructive action or unresolved scope expansion still requires explicit owner direction.

Specialists do not self-merge and do not enable auto-merge. DT-00 independently verifies their claims against GitHub.

---

# Commit Rules

Every commit should describe the change clearly.

Good examples:

```
Add player movement prototype

Update economy documentation

Fix delivery event logic
```

Avoid:

```
Update files

Changes

Test
```

---

# Version Tags

Important versions receive tags.

Examples:

```
v0.1.0
v0.2.0
v1.0.0
```

---

# Backup Rules

Before major changes:

Create:

- Commit
- Backup
- Version checkpoint

---

# Pull Request Rules

Major changes should be reviewed before merging.

Review questions:

- Does this follow the architecture?
- Does it improve gameplay?
- Does it introduce unnecessary complexity?

Required merge evidence:

- the PR is based on a reconciled current `main`, or the impact of any base movement is explicitly audited;
- required checks are `SUCCESS` on the exact head intended for merge;
- no test, release gate or truth label was weakened merely to obtain green CI;
- ownership and canonical-document boundaries remain intact;
- DT-00 records the merge decision;
- player-visible runtime changes receive the applicable Project Owner/Android acceptance and are never merged only because CI is green.

After merge, DT-00 re-reads the canonical `main`, verifies exact-main CI and the existing Railway deployment when affected, and fixes attributable regressions before reporting the task as complete.

---

# Project Owner Operating Surface

Routine project development does not require Marian to use a PC, Termux or tmux. GitHub repository automation, Pull Requests and CI are the normal operating surface.

Termux/tmux-assisted commands are provided only when Marian explicitly requests repository synchronization/copying to a phone, computer or server, or separately approves another exceptional operation. When required, provide one complete copy-paste command block with all paths and no interactive editor.

Connected Figma, Canva, Runway and Higgsfield capabilities are auxiliary project tools governed by:

`09_Development/AI_Project_Memory/AUTHORIZED_TOOLING.md`

They do not replace or fragment the GitHub codebase. All generated or edited implementation code enters this repository through a Pull Request. Selected external assets/evidence enter the applicable provenance, legal, asset and release workflow.

---

# Persistent AI Task Report Commit Rule

For significant AI tasks, reports required by:

`09_Development/AI_REPORTING_PROTOCOL.md`

must be committed together with the related work.

For significant analysis-only tasks with no other repository modifications, use a report-only commit and Pull Request.

---

# AI Modification Rules

AI agents must not:

- Delete important files without approval
- Change architecture without approval
- Add large features without documentation

---

# Conflict Resolution

If conflicts appear:

Priority order:

1. Project vision
2. Approved architecture
3. Current milestone
4. New suggestions

---

# Development Safety

The repository should always allow:

- Returning to previous versions
- Understanding changes
- Reproducing builds

---

# Canonical Rule

GitHub is the memory and single code/integration source of truth for the project.

Every important decision and change must be traceable.

---

End of Document
