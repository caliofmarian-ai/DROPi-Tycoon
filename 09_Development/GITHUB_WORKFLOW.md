# Document Information

Document: GITHUB_WORKFLOW.md
Project: DROPi Tycoon
Version: 1.0.0
Status: Development Repository Rules
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-07-12

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

AI agents must follow:

```
Read

↓

Analyze

↓

Propose

↓

Receive Approval

↓

Modify

↓

Test

↓

Commit
```

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

GitHub is the memory of the project.

Every important decision and change must be traceable.

---

End of Document