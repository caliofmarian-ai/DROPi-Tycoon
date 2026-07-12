# Document Information

Document: AI_REPORTING_PROTOCOL.md
Project: DROPi Tycoon
Version: 1.0.0
Status: Persistent AI Task Reporting Governance
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-07-12

---

# AI Reporting Protocol

## Purpose and Scope

This document defines the canonical protocol for persisting significant AI task outputs inside the repository.

The protocol ensures that AI work is reviewable by:

- Project Owner
- Future AI agents
- External reviewers

This is a governance and traceability protocol.

It does not redefine gameplay, architecture, prototype scope, or implementation design.

---

# Canonical Report Storage

Mandatory report folder:

`09_Development/AI_Reports/`

Mandatory report filename format:

`YYYY-MM-DD_NNN_REPORT_NAME.md`

Example format only:

`2026-07-12_001_TASK_REPORT.md`

---

# Sequential Numbering Rules

- `NNN` is a three-digit sequence (`001`, `002`, `003`, ...).
- Sequence is global for the report folder, not per agent.
- New report number = next unused number after the highest existing report number.
- Do not reuse numbers, including when a report is cancelled or superseded.
- If two tasks conflict on numbering, resolve by using the next available number before merge.

---

# Which Tasks Require Persistent Reports

A persistent report is mandatory for significant AI tasks, including:

- Analysis that produces findings, recommendations, or decisions
- Documentation updates that affect process, governance, or project operations
- Code, asset, configuration, or structure modifications
- Audits, reviews, investigations, or validation activities
- Tasks that are failed, blocked, cancelled, or partially completed

---

# Trivial Task Exemptions

Reports may be exempt only for trivial tasks with no substantive project impact, such as:

- Minor formatting-only edits
- Typo-only corrections
- Non-substantive wording cleanup without behavioral, governance, or decision impact

If a task is not clearly trivial, create a report.

---

# Operational Completion Rule

A significant AI task is not operationally complete until its persistent report is created or updated under this protocol.

---

# Required Report Metadata

Every report must include, when available:

- Report ID
- Report title
- Date
- Project
- Task type
- Agent/model
- Repository
- Branch
- Base commit
- Resulting commit
- Pull Request
- Human approval status

If data is unavailable, write `N/A` and explain briefly.

---

# Required Report Sections

Every report must include all sections below:

- Original task instruction
- Objective
- Scope
- Files inspected
- Files created
- Files modified
- Files moved or renamed
- Files deleted
- Actions performed
- Findings
- Recommendations
- Validation performed
- Validation results
- Unresolved issues
- Final result/status
- Follow-up actions

---

# Mandatory Report Template

```md
# Report Metadata

- Report ID:
- Report title:
- Date:
- Project: DROPi Tycoon
- Task type:
- Agent/model:
- Repository:
- Branch:
- Base commit:
- Resulting commit:
- Pull Request:
- Human approval status:

# Original Task Instruction

<Paste original instruction exactly>

# Objective

# Scope

# Files Inspected

# Files Created

# Files Modified

# Files Moved or Renamed

# Files Deleted

# Actions Performed

# Findings

# Recommendations

# Validation Performed

# Validation Results

# Unresolved Issues

# Final Result/Status

# Follow-up Actions
```

---

# Task-Type Rules

## Analysis-Only Tasks

- Record exact analysis scope and boundaries.
- Record all substantive findings and recommendations.
- Record validations executed and their results.
- If no file was changed, still persist a report for significant analysis tasks.

## Implementation/Modification Tasks

- Record exactly what changed and why.
- Record exact files read and changed.
- Record resulting commits and PR when available.
- Record validation steps and outcomes.

---

# Failed, Blocked, Cancelled, or Partial Tasks

These tasks still require a report if significant.

The report must clearly state:

- Status (`Failed`, `Blocked`, `Cancelled`, or `Partial`)
- What was completed
- What was not completed
- Blocking reason or failure cause
- Recommended next action

---

# Identity and Traceability Rules

When available, reports must record:

- Agent identity
- Model identity
- Repository
- Branch
- Base commit
- Resulting commit
- Pull Request reference

Missing metadata must be marked `N/A`.

---

# File Traceability Rules

Reports must record exact repository paths for:

- Files read/inspected
- Files created
- Files modified
- Files moved or renamed
- Files deleted

Do not summarize with vague labels.

---

# Original Instruction Preservation Rule

The original task instruction must be preserved verbatim in the report.

Do not paraphrase or shorten the instruction in that section.

---

# Substantive Result Preservation Rule

Reports must preserve the complete substantive output of the task, including:

- Findings
- Recommendations
- Validation activity and results
- Unresolved issues

Do not remove substantive conclusions from the persistent report.

---

# Human Approval Status Rule

Every report must state human approval status explicitly, for example:

- Pending review
- Approved
- Approved with conditions
- Rejected

Update approval status by amending with a new entry, not by deleting prior history.

---

# Non-Canonical Specification Rule

AI task reports are historical records.

They must not be treated as canonical gameplay, architecture, prototype scope, or implementation specifications unless a canonical document is explicitly updated and approved.

---

# Report Integrity Rules

- Agents must not silently edit prior reports.
- Corrections must be made through a new amendment section or a new report referencing the corrected report ID.
- The correction must identify:
  - What was wrong
  - Why it was wrong
  - What the corrected information is

---

# Relationship with Other Governance Documents

This protocol is mandatory and complementary to:

- `00_Project/PROJECT_INTAKE_PROTOCOL.md`
- `09_Development/AI_AGENT_EXECUTION_PROTOCOL.md`
- `09_Development/GITHUB_WORKFLOW.md`
- Future audit documents

If a conflict is detected, escalate for human resolution and do not expand scope.

---

# Canonical Rule

Significant AI work must be persisted, traceable, and reviewable through reports in:

`09_Development/AI_Reports/`

---

End of Document
