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

The process begins after receiving:

- ZIP archive
- Project files
- Documentation
- Assets

---

# Phase 1 — Extraction

The agent must:

- Extract the project archive
- Verify file integrity
- Identify project root folder

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