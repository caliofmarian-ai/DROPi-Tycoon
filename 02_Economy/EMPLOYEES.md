# Document Information

Document: EMPLOYEES.md
Project: DROPi Tycoon
Version: 1.1.0
Status: Canonical — Workforce and Payroll Specialization
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-09-08

---

# Employee System

## Purpose

This document defines the canonical workforce/payroll specialization while preserving the existing RBATCH-018 employee implementation as runtime compatibility truth.

It aligns with `02_Economy/ECONOMY.md`, `02_Economy/PERSONAL_FINANCE.md`, `04_World/WORLD.md`, `06_Technical/WORLD_INSTANCES.md`, and `06_Technical/SAVE_SYSTEM.md`.

Employees are productive economic actors, not decorative NPCs or automatic money generators.

---

# 1. Workforce Identity

A worker record must be tied to a stable economic actor identity appropriate to the implementation stage.

Canonical workforce concepts include:

- stable worker identity;
- employer/company identity;
- role/profession;
- employment/onboarding status;
- qualifications/authorizations;
- schedule/shift/availability where implemented;
- wage/salary basis;
- assigned workplace/equipment/vehicle where relevant;
- work/output history required for settlement.

Human and NPC workers should use compatible economic semantics even when their control/input differs.

---

# 2. Existing RBATCH-018 Runtime Contract

The current executable employee model remains valid implementation history.

Each hired employee currently stores:

- stable employee identity;
- display name;
- role;
- employment/onboarding status;
- salary cost per salary cycle.

Current executable role: `Courier`.

Current executable states:

1. `Onboarding`;
2. `Active`.

Candidate data remains outside CompanyState until hiring succeeds. Hiring creates the employee exactly once.

These implementation details are retained until explicitly migrated; they do not limit the final profession/labor model.

---

# 3. Hiring

Hiring must:

- resolve a known candidate/economic actor;
- reject duplicate employment creation for the same intended contract;
- verify employer capability and hiring/commitment cost where applicable;
- create employment exactly once;
- preserve authoritative employer/worker identity;
- trigger persistence after successful material state mutation.

Numeric costs are balancing data.

Future human-player employment must not silently reuse NPC-only candidate assumptions when account/world identity is required.

---

# 4. Onboarding and Qualification

Onboarding is an explicit state transition.

Repeating completion must not duplicate economic effects.

Future roles may require qualifications, practical training, authorizations, facilities, equipment, instructors, or prior experience. A company cannot make an unqualified worker productive in a specialist role merely by changing a label.

---

# 5. Work, Shifts and Availability

The canonical world now has authoritative time.

Work may therefore be organized into shifts, schedules, assignments, contracts, or other explicit availability periods.

A worker can be productive only when the required combination exists, such as:

- valid employment/contract;
- availability/shift;
- qualification;
- assignment;
- workplace/infrastructure;
- equipment/vehicle;
- demand/input/cargo;
- operational capacity.

The previous RBATCH-018 statement that payroll must not invent a game clock remains historically correct for that implementation batch, but the canonical time authority now exists in `04_World/WORLD.md` and `06_Technical/WORLD_INSTANCES.md`.

---

# 6. Payroll and Wage Settlement

Payroll is not a free reward loop.

For NPC/simulated workers, current CompanyState payroll may continue to aggregate salary costs until a broader actor-ledger migration is implemented.

For a human player, wage settlement must eventually be one balanced transaction:

`employer Company Money -> worker Personal Money`

A human starter wage requires actual eligible work/shift participation. Offline absence does not manufacture salary.

Salary/payroll settlement must be deterministic, exactly-once/idempotent under shared authority, and must not debit/credit twice after retry/reconnect.

---

# 7. Current Deterministic Payroll Boundary

The existing runtime stores `lastProcessedCycle`.

Until migrated, an RBATCH-018 salary cycle:

- uses a positive integer cycle identifier;
- is processed sequentially;
- charges only current `Active` employee records;
- calculates total from salary records;
- rejects duplicate/skipped cycles;
- rejects processing when Company Money is insufficient;
- deducts once and advances `lastProcessedCycle` only after success.

This remains a valid local deterministic implementation boundary.

Future time integration should call/migrate this behavior against authoritative operating-day/shift semantics rather than create a second payroll truth.

---

# 8. Multiple Jobs and Membership

A person may hold compatible multiple jobs/contracts when schedules, permissions and conflict rules allow them.

This is distinct from company membership:

- employment = labor relationship;
- Internal/Member relationship = primary organizational membership/governance relationship;
- executive authority = management power;
- External investment = portfolio ownership.

A person has one primary Internal/Member company relationship at a time but may have compatible employment/contract relationships under canonical rules.

---

# 9. Productive Workforce Rule

Workers do not create money merely by existing.

Valid work may create or enable:

- deliveries;
- sorting/handling;
- dispatch;
- maintenance;
- production;
- agriculture;
- infrastructure operation;
- specialist services;
- management/coordination effects where causally modeled.

Output still requires the relevant demand, inputs, capacity and facilities.

---

# 10. Employer Distress

An employer may become unable to pay wages or maintain operations.

Possible consequences include:

- arrears/default state;
- reduced/paused hiring;
- employee departure;
- restructuring;
- asset sale;
- acquisition;
- company bankruptcy/closure.

Failure must settle through the economy rather than delete workers or fabricate payment.

A human worker retains their person identity and valid personal qualifications if an employer fails.

---

# 11. World Instance and NPC Boundary

Employment is World-Instance-local economic state.

NPC workers may preserve low-population playability, but they obey wages/costs, qualifications, availability and productive constraints. They cannot provide infinite free labor.

---

# 12. Persistence

Employee and payroll progression is meaningful company state and is currently persisted in Save v2 through:

- `company.employees`;
- `company.payroll.lastProcessedCycle`.

Existing v1 data migrates forward by preserving recoverable company/settings progression and safely initializing employee/payroll state.

Future human employment, Personal Money wage settlement, shifts, qualifications and World Instance identity require an explicit save/server migration rather than silent reinterpretation of these current fields.

---

# 13. Authority

When multiplayer/shared economic state is activated, trusted/server authority must validate employment, role/permission, completed work, payroll eligibility and money settlement.

The client cannot declare that a wage was earned or paid.

---

# Canonical Rule

**Workers are real productive economic actors. Employment, work, time, qualification, assignment and pay must connect causally; human wages move money from employer Company Money to worker Personal Money; NPC and human labor share compatible semantics; and no employee record creates free output or money merely by existing.**
