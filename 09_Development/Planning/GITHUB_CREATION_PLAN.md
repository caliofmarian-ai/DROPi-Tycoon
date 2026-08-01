# Document Information

Document: GITHUB_CREATION_PLAN.md
Project: DROPi Tycoon
Version: 1.0.0
Status: Planning — Canonical
Author: AI Agent (Report 086)
Language: English
Last Updated: 2026-08-01

---

# GitHub Creation Plan

## Purpose

This document describes the process for creating GitHub milestones, labels, and issues from the planning package.

This is a planning document only. No actual GitHub objects are created by this document or by this PR.

---

## Important Constraint

**GitHub milestones, issues, labels, and Projects must NOT be created during this PR.**

This PR is a documentation and planning change only.

Execution of the GitHub creation plan is a separate operation that requires explicit owner approval.

---

## Machine-Readable Plan

The complete machine-readable creation plan is available in:

`09_Development/Planning/github_creation_plan.yaml`

---

## Creation Sequence

The following sequence must be followed when executing the GitHub creation plan.

### Step 1: Create Labels

All labels defined in `LABEL_TAXONOMY.md` must be created before issues are created.

Label groups to create in order:
1. Type labels (7 labels)
2. Phase labels (10 labels)
3. Batch labels (42 labels)
4. Epic labels (37 labels)
5. Status labels (5 labels)

Total labels to create: **101**

### Step 2: Create Milestones

Create GitHub milestones matching the milestone definitions in `MILESTONE_ARCHITECTURE.md`.

Milestones to create: **21** (M-001 through M-021)

Note: GitHub milestone objects for M-001 through M-004 (COMPLETED milestones) should be created in **closed** state to reflect their completed status.

### Step 3: Create Executable Issues

Create GitHub issues for all 31 executable issues defined in `ISSUE_CATALOG.md`.

Issues to create: **31** (ISSUE-001 through ISSUE-031)

Each issue must:
- Reference the correct milestone
- Include all required labels (type, phase, batch, epic)
- Reference the parent epic and batch in the issue body

### Step 4: Mark Future Placeholders

Create GitHub issues for the 12 future placeholders defined in `ISSUE_CATALOG.md`, labeled with `status:future`.

Placeholders to create: **12** (PLACEHOLDER-001 through PLACEHOLDER-012)

---

## Inspection Limitation

**GitHub milestone-list endpoint unavailability:**

The GitHub milestone-list API endpoint was not available during the creation of this planning package.

Therefore, it is NOT confirmed whether any GitHub milestone objects for M-001 through M-004 currently exist in the repository.

The milestone planning definitions in `MILESTONE_ARCHITECTURE.md` are the canonical source of truth for milestone names, scopes, and statuses.

Before executing Step 2 of this plan, a GitHub user with repository access must:
1. Manually check the existing GitHub milestone list.
2. Skip creation of any milestone that already exists with the correct title.
3. Update the status of any existing milestone as needed (open/closed).

This is an inspection limitation, not a planning defect.

---

## Pre-Execution Checklist

Before executing the GitHub creation plan:

- [ ] Owner approval obtained for plan execution
- [ ] Existing GitHub milestones manually audited
- [ ] Existing GitHub labels manually audited (remove conflicts)
- [ ] Existing GitHub issues manually audited
- [ ] `github_creation_plan.yaml` reviewed and YAML parsed successfully
- [ ] Creation will proceed in the sequence defined above

---

## Post-Execution Verification

After executing the GitHub creation plan:

- [ ] All 21 milestones exist in GitHub
- [ ] All 101 labels exist in GitHub
- [ ] All 31 executable issues exist and reference correct milestones/labels
- [ ] All 12 placeholder issues exist and are labeled `status:future`
- [ ] Milestone open/closed states match planning status
- [ ] No duplicate milestones, labels, or issues

---

## Files in This Planning Package

The complete planning package consists of:

| File | Purpose |
|---|---|
| `MILESTONE_ARCHITECTURE.md` | 21 milestone definitions |
| `EPIC_CATALOG.md` | 37 epic definitions |
| `BATCH_ARCHITECTURE.md` | 42 roadmap batch definitions (RBATCH-001–042) |
| `ISSUE_CATALOG.md` | 31 executable issues + 12 future placeholders |
| `DEPENDENCY_GRAPH.md` | Acyclic dependency graphs for milestones, epics, batches |
| `LABEL_TAXONOMY.md` | 101 GitHub label definitions |
| `GITHUB_CREATION_PLAN.md` | This document — GitHub creation instructions |
| `github_creation_plan.yaml` | Machine-readable creation plan |

---

End of Document
