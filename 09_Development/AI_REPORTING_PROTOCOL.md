# Document Information

Document: AI_REPORTING_PROTOCOL.md  
Project: DROPi Tycoon  
Version: 1.1.0  
Status: Persistent AI Task Reporting Governance  
Author: Marian Caliof & OpenAI  
Language: English  
Last Updated: 2026-09-10

---

# AI Reporting Protocol

## Purpose and scope

This document defines the canonical protocol for persisting significant AI task history inside the repository so work remains reviewable by the Project Owner, future AI agents and external reviewers.

This is governance and traceability. It does not redefine gameplay, architecture, prototype scope or implementation design.

## Historical reports are not operational memory

Mandatory historical report folder:

`09_Development/AI_Reports/`

These reports preserve significant task history and evidence. They are **historical records** and must not silently become current operational truth.

Current operational project state and resumable session handoffs are maintained separately under:

`09_Development/AI_Project_Memory/`

The deterministic entry point is:

`09_Development/AI_Project_Memory/BOOTSTRAP.md`

A significant session therefore has two complementary persistence duties:

1. preserve its historical task/report evidence under this protocol; and
2. preserve/update the current durable handoff required by the execution/memory protocol.

Completing one does not waive the other.

## Operational completion invariant

For significant sessions:

`NO DURABLE HANDOFF = SESSION NOT OPERATIONALLY COMPLETE`

A historical report alone is not sufficient to mark a significant DT session closed, paused, superseded, READY, HOLD or handed off.

The effective handoff must preserve the required current fields defined by `AI_AGENT_EXECUTION_PROTOCOL.md` and `AI_Project_Memory/BOOTSTRAP.md`.

## Canonical report storage

Mandatory report filename format:

`YYYY-MM-DD_NNN_REPORT_NAME.md`

Example only:

`2026-07-12_001_TASK_REPORT.md`

### Sequential numbering

- `NNN` is a three-digit global sequence for `AI_Reports/`.
- New report number is the next unused number after the highest existing report number.
- Never reuse a number, including cancelled/superseded reports.
- Concurrent numbering conflicts must be resolved before merge by taking the next available number.

## Tasks requiring persistent reports

A report is mandatory for significant AI tasks including:

- analysis producing findings/recommendations/decisions;
- process/governance documentation changes;
- code, asset, configuration or structure modifications;
- audits, reviews, investigations or validation;
- failed, blocked, cancelled or partial tasks.

Only trivial formatting/typo-only work with no substantive impact may be exempt.

## Required report metadata

Every report records, when available:

- Report ID;
- Report title;
- Date;
- Project;
- Task type;
- Agent/model;
- Repository;
- Branch;
- Base commit;
- Resulting commit;
- Pull Request;
- Human approval status.

Unavailable historical metadata may use `N/A` with a brief explanation. Current operational uncertainty belongs in the handoff/UNKNOWN register and uses `UNKNOWN`, not invented values.

## Required report sections

Every report includes:

- Original task instruction;
- Objective;
- Scope;
- Files inspected;
- Files created;
- Files modified;
- Files moved or renamed;
- Files deleted;
- Actions performed;
- Findings;
- Recommendations;
- Validation performed;
- Validation results;
- Unresolved issues;
- Final result/status;
- Follow-up actions.

## Mandatory report template

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

<Paste original instruction exactly, or reference an immutable GitHub Issue body/comment when the exact instruction is already preserved there and duplicating it would create competing history.>

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

## Task-type rules

### Analysis-only tasks
- Record exact analysis scope/boundaries.
- Preserve substantive findings/recommendations.
- Record validation and results.
- Significant analysis still receives a report even if no implementation file changed.

### Implementation/modification tasks
- Record exactly what changed and why.
- Record exact files read/changed.
- Record resulting commits/PR when available.
- Record validation and outcomes.

### Failed, blocked, cancelled or partial tasks
The report must state the status, what completed, what did not, blocking reason/failure cause and recommended next action.

## Identity and traceability

When available, reports record agent/model identity, repository, branch, base/resulting commit and PR reference.

Current resumable state must not be reconstructed by scanning all reports; it belongs in `AI_Project_Memory/HANDOFFS.json` and is live-reconciled through GitHub.

## File traceability

Reports record exact repository paths for files read, created, modified, moved/renamed or deleted. Avoid vague labels.

## Original instruction preservation

Preserve the original task instruction verbatim when it is not already durably and immutably present in the referenced GitHub Issue/comment.

For Issue-backed missions such as #683, a report may cite the exact Issue/comment URL/number instead of duplicating a very large instruction body, provided the report identifies that reference as the complete original instruction authority.

## Substantive result preservation

Reports preserve substantive findings, recommendations, validation/results and unresolved issues. They must not be stripped down to status words.

## Human approval status

Every report explicitly states human approval status, such as Pending review, Approved, Approved with conditions or Rejected. Amend history; do not silently erase prior approval state.

## Non-canonical specification rule

AI task reports are historical records. They are not canonical gameplay, architecture, prototype scope or implementation specifications unless an authorized canonical document is explicitly updated and approved.

Operational memory is also not canonical domain authority. It records current execution state and references the domain authorities that control the work.

## Report integrity

- Do not silently rewrite prior reports.
- Corrections use an amendment section or a new report referencing the corrected report.
- State what was wrong, why and the corrected evidence.

## Durable handoff update

Before a significant session is considered operationally complete, update the applicable repository-backed handoff so a fresh AI can resume without prior conversation history.

At minimum preserve the fields required by `AI_AGENT_EXECUTION_PROTOCOL.md` and the bootstrap protocol, including status, evidence, UNKNOWNs, blockers, forbidden actions and next safe action.

If live GitHub has moved, reconcile first. Historical report text never overrides live GitHub state.

## Relationship with other governance documents

This protocol is mandatory and complementary to:

- `00_Project/PROJECT_INTAKE_PROTOCOL.md`;
- `09_Development/AI_AGENT_EXECUTION_PROTOCOL.md`;
- `09_Development/GITHUB_WORKFLOW.md`;
- `09_Development/AI_Project_Memory/BOOTSTRAP.md`;
- future audit documents.

A real conflict that cannot be resolved from authority/evidence must be escalated rather than silently normalized.

## Canonical rule

Significant AI work must be historically traceable through `09_Development/AI_Reports/` **and** operationally resumable through the repository-backed persistent-memory/handoff layer.

---

End of Document
