# RBATCH-018 Employee Hiring, Onboarding & Payroll — Implementation Report

Date: 2026-09-02
Batch: RBATCH-018
Epic: E-018 — Employee Management System
Milestone: M-009 — Employee & Financial Systems
PR: #284

## Result

RBATCH-018 implementation is complete on the PR branch and has passed the permanent repository CI before merge.

## Implemented

- Added the Phase-2 employee model to authoritative `CompanyState`.
- Added stable employee identity, role, onboarding/employment status, and salary-per-cycle state.
- Added a deterministic employee candidate catalog with replaceable balancing values.
- Added affordability validation and duplicate-hire protection.
- Added explicit `Onboarding` -> `Active` transition.
- Added deterministic sequential salary-cycle processing.
- Salary processing charges only active employees, rejects duplicate/skipped cycles, and does not advance a cycle when funds are insufficient.
- Added player-facing `EmployeeManagementScene` reachable from Company Management.
- Added Android-responsive employee-management layout using the existing touch-comfort baseline without canonizing one orientation.
- Added Save format v2 with employee/payroll persistence.
- Added automatic safe migration from Prototype v0.1 Save format v1, preserving recoverable existing progression.
- Added approved autosave events for employee hire, onboarding completion, and salary-cycle processing.
- Added canonical Phase-2 employee detail document at `02_Economy/EMPLOYEES.md`.

## Scope boundaries preserved

- No RBATCH-019 daily-expense or financial-reporting logic was pulled forward.
- No game clock or invented salary cadence was introduced. RBATCH-018 exposes a deterministic salary-cycle boundary for a later authorized time/cycle system to call.
- Numeric hiring and salary values are centralized replaceable balancing details, not permanent game-design canon.
- Employee work assignment/automation remains future scope.
- Archived `Game/` was not modified.
- Phaser remains a replaceable runtime implementation detail and is not promoted to canonical architecture.

## Save compatibility

Current format: v2.

Migration behavior:
- v2 primary/staging is preferred;
- when no v2 save exists, legacy v1 primary/staging is discovered;
- valid v1 progression is migrated into v2 company/settings state;
- employees initialize empty and payroll cycle initializes at zero for legacy data;
- migrated data is marked for normalization so the normal Continue path writes the current format;
- unknown formats remain incompatible rather than being silently guessed.

## Automated evidence

Permanent CI run: `33692012908`

Result: SUCCESS.

- 21 test files passed.
- 394/394 tests passed.
- TypeScript + Vite production build passed.
- Production HTTP smoke test passed.
- PR-range whitespace validation passed.
- Archived `Game/` guard passed.
- Canonical planning YAML validation passed.
- Active planning crosswalk passed.
- Prototype owner-progression gate passed.

The immediately preceding run `33691917855` had all 394 tests passing but TypeScript correctly rejected one unused local variable in the new layout helper. The variable was removed in commit `d81d30e8d9d5d7a92e8fc12e58c9ecea51102655`; no gameplay logic changed in that correction.

## Non-blocking existing observations

- npm audit continues to report the pre-existing 2 dependency findings (1 moderate, 1 high); RBATCH-018 does not change package dependencies.
- Vite's existing large-chunk warning remains a separate optimization concern.

## Merge gate

PR #284 may merge only after the final head CI (including this report commit) passes. After merge, #210, #212, and #218 may be closed/done and RBATCH-018 / E-018 can move to merged-complete state. The next dependency-gated work is RBATCH-019.
