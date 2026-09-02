# Document Information

Document: EMPLOYEES.md
Project: DROPi Tycoon
Version: 1.0.0
Status: Canonical Phase-2 Detail
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-09-02

---

# Employee System

## Purpose

This document details the first executable employee model for M-009 / E-018 / RBATCH-018 while remaining aligned with `04_World/NPC.md`, `02_Economy/ECONOMY.md`, and `06_Technical/SAVE_SYSTEM.md`.

Employees are company workforce. They are progression state, not decorative NPCs.

## RBATCH-018 Model

Each hired employee has one authoritative record containing:

- stable employee identity;
- display name;
- role;
- employment/onboarding status;
- salary cost per salary cycle.

The initial executable role is `Courier`.

The initial executable employment states are:

1. `Onboarding` — hired but not yet salary-eligible;
2. `Active` — onboarding completed and salary-eligible.

Candidate data exists outside CompanyState until hiring succeeds. Hiring creates the employee record exactly once.

## Hiring

Hiring must:

- resolve a known candidate;
- reject duplicate hiring of the same employee identity;
- verify the company can afford the hiring cost;
- deduct the hiring cost exactly once;
- create the employee in `Onboarding` state;
- trigger an approved autosave after successful state mutation.

Numeric hiring costs are centralized balancing values. They are replaceable implementation details, not permanent canon.

## Onboarding

Onboarding is an explicit state transition.

A hired employee moves from `Onboarding` to `Active` exactly once. Repeating the completion action must not duplicate state or economic effects.

## Salary Processing

Salary cost is stored on the employee record as a non-negative integer amount per salary cycle.

Company payroll state stores `lastProcessedCycle`.

A salary cycle must:

- use a positive integer cycle identifier;
- be processed sequentially;
- charge only `Active` employees;
- calculate the total from employee salary records;
- reject duplicate or skipped cycles;
- reject processing when company money is insufficient;
- deduct the total once and advance `lastProcessedCycle` only after successful processing.

RBATCH-018 implements this deterministic payroll boundary but does not invent a game clock or daily-expense cadence. A later authorized system may call this boundary when its canonical time/cycle trigger exists.

## Economy Boundary

Employee hiring and salaries consume Company Money and therefore remain inside the canonical economy model from `02_Economy/ECONOMY.md`.

RBATCH-019 owns daily operational expenses and financial reporting. RBATCH-018 must not pull those systems forward.

## Persistence

Employee and payroll progression is meaningful company progress and is persisted in the Phase-2 save schema.

Save format v2 adds:

- `company.employees`;
- `company.payroll.lastProcessedCycle`.

Existing Prototype v0.1 save-format v1 data is migrated forward by preserving all recoverable v1 company/settings progression and initializing employee/payroll state safely. The migration writes the normalized current format on the next successful save/load normalization path.

World position, active orders, and other transient runtime data remain outside the save contract unless separately approved.

## Future Expansion

Later authorized batches may add employee performance, assignment, training, equipment, experience, availability schedules, or automation. Those systems must extend this model rather than create parallel workforce truth.

## Canonical Rule

CompanyState is the authoritative runtime owner of hired employees and payroll progression. No scene may maintain a parallel employee ownership flag or independent salary ledger.
