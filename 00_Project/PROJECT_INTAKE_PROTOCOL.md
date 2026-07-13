# Document Information

Document: PROJECT_INTAKE_PROTOCOL.md
Project: DROPi Tycoon
Version: 1.0.0
Status: Project Transfer Procedure
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-07-12

---

# Project Intake Protocol

## Purpose

This document defines the procedure an AI agent must follow when receiving the DROPi Tycoon project package.

The objective is to understand the real project state before making any changes.

---

# Core Principle

Never assume that documentation represents the current project state.

The AI agent must create an independent inventory from the received files.

---

# Intake Process

The process begins when an AI agent receives access to the project through one of two supported intake modes:

## Mode A — Git Repository Intake (Preferred)

When a Git repository is available, the agent receives the project by:

- Clone or access the repository
- Fetch the latest target branch
- Verify repository identity, branch, commit, and working-tree state
- Inspect the real repository directly

Git repository intake is the preferred mode when a repository is available.

## Mode B — ZIP Archive Intake

When the project is delivered as an archive (for offline transfer, snapshot, export, or projects not yet hosted in Git), the agent receives the project by:

- Receive the archive
- Extract it into a working directory
- Verify archive contents and root structure
- Inspect the extracted project

ZIP archive intake remains fully supported.

## Notes

- Both intake modes lead into the same inventory and audit process.
- Intake source does not change canonical document ownership or project rules.
- ZIP intake is not deprecated; it remains appropriate for offline transfer, snapshots, exports, or projects not yet hosted in Git.

---

# Phase 1 — Initialization

The agent must initialize access to the project according to the received intake mode.

## Git Repository Mode

The agent must:

- Clone or access the repository
- Fetch and update the target branch
- Record repository, branch, and base commit
- Verify clean or known working-tree state
- Do not silently discard local or uncommitted changes

## ZIP Archive Mode

The agent must:

- Extract the archive
- Identify the project root
- Verify extraction completeness
- Record archive and source identity when available

## Shared Step (Both Modes)

After either initialization mode, the agent must:

- Create a complete real inventory of files, folders, and repository/project structure

---

# Phase 2 — Real Project Inventory

The agent must scan:

## Files

Record:

- File name
- Location
- Type
- Size
- Modification date

---

## Folders

Record:

- Folder structure
- Missing folders
- Unexpected folders

---

## Documents

Identify:

- Existing documentation
- Versions
- Duplicates
- Missing references

---

## Development Files

Identify:

- Engine files
- Configuration files
- Source files
- Export files

---

# Phase 3 — Architecture Comparison

Compare:

REAL PROJECT

against:

DOCUMENTED ARCHITECTURE

Check:

- Missing components
- Extra components
- Naming differences
- Structural conflicts

---

# Phase 4 — Inventory Report

The agent creates:

```
PROJECT_REAL_INVENTORY.md
```

Containing:

- Actual folder tree
- Actual file list
- Current status
- Problems found

---

# Phase 5 — Consistency Report

The agent creates:

```
PROJECT_CONSISTENCY_REPORT.md
```

Containing:

## Matching Components

What exists correctly.

## Missing Components

What documentation expects but does not exist.

## Unexpected Components

What exists but is not documented.

## Recommendations

Required corrections.

---

# Intake Audit Persistence Rule

Significant intake audit outputs must be persisted according to:

`09_Development/AI_REPORTING_PROTOCOL.md`

Intake work is not operationally complete until the required persistent report is created or updated under that protocol.

---

# Restrictions Before Audit Completion

The AI agent must not:

- Modify files
- Delete files
- Rename structures
- Add systems

before completing the inventory.

---

# Approval Point

After the audit:

Human approval is required before:

- Repairs
- Refactoring
- Development

---

# Canonical Rule

First understand the project.

Then change the project.

---

End of Document