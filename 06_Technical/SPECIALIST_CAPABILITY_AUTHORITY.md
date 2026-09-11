# Specialist Capability Authority

Status: DT-06 runtime boundary for #437 / #359, coordinating #653.
Base audited: `08e33ad71e11e4f17eeb1f38d530386ee447d334`.

## Purpose

This contract clarifies the authority boundary between personal skill, formal qualification, specialist workforce, company capability, physical equipment/facilities and Work Capacity.

The binding rule is:

> A person may possess a qualification; an organization may benefit from that person's capability only while a legitimate engagement and current availability connect that person to the organization. The organization never owns the person's qualification.

The runtime proof for the people-side boundary is `game-web/src/capabilities/specialistWorkforceCapability.ts`.

## Authority map

| Concept | Authority / source of truth | DT-06 relationship | Must not be interpreted as |
| --- | --- | --- | --- |
| Player skill / learned capability | Personal capability/progression evidence | DT-06 owns semantics and eligibility | formal qualification, employment, equipment or company capability |
| Formal qualification | Person-bound qualification evidence | DT-06 owns qualification semantics | a profession label, Player Level, money payment or transferable company stat |
| Hired specialist | Stable person identity plus legitimate employment/service engagement | DT-06 evaluates the person's contribution; workforce/company owner creates and ends the engagement | player skill, company-owned collectible or permanent company capability flag |
| Company capability | Derived organizational ability composed from qualified people plus other owned/controlled prerequisites | DT-06 supplies only the specialist/people-side contribution | proof of equipment, facility, treasury, authorization or operating capacity |
| Equipment / facility | Physical company/world operational state | DT-06 consumes these facts where work/training eligibility requires them | personal qualification or Work Capacity |
| Work Capacity | Player Economy personal state and mutation authority | DT-06 consumes it read-only for player work eligibility | specialist headcount, company throughput or facility capacity |

## Existing authorities preserved

The merged #359 foundation remains authoritative for player personal capability IDs, learned-state persistence and prerequisite evaluation.

`game-web/src/capabilities/capabilityModel.ts` already consumes `companyCapabilityIds` as external runtime facts. DT-06 does not turn that field into a second company aggregate. The owning company/operations domain must derive or supply those facts from legitimate company state.

Player Economy remains the single writer for Personal Money, employment state used by the current starter-player adapter, and Work Capacity mutation. Capability code remains read-only toward those facts.

Current RBATCH employee persistence remains compatibility truth for its existing `Courier` employee shape until an explicit workforce migration extends it. This slice does not silently reinterpret existing employee records as qualified specialists.

## Specialist contribution contract

`evaluateSpecialistWorkforceContribution(...)` answers only one question:

> Does this known specialist currently satisfy the people-side requirements that another authority may compose into company capability?

It requires all of the following when requested:

- stable specialist actor identity matches the engagement identity;
- legitimate engagement is active;
- specialist is currently available for assignment;
- required learned personal capability evidence exists;
- required formal qualification evidence exists.

It is deterministic and mutation-free.

It does **not**:

- hire the specialist;
- settle wages;
- mutate company membership;
- create or persist a company capability flag;
- own facility/equipment state;
- own Work Capacity;
- own fragment inventory, fragment minting or marketplace settlement;
- grant the specialist's qualification to the player or company.

## Capability gain and loss semantics

A company may gain the people-side contribution when a qualified specialist becomes legitimately engaged and available.

A company loses that contribution when the specialist:

- leaves or the engagement ends;
- becomes unavailable for the assignment;
- no longer satisfies a required governed qualification/authorization where expiry or revocation is later implemented.

Loss of organizational contribution does **not** erase the specialist's personal learned history or qualification evidence. Likewise, company bankruptcy or dismissal cannot rewrite a person's valid qualification record.

A later company capability graph may compose the contribution as conceptually:

`company capability = qualified available people + required equipment + required facility/infrastructure + required authorization/access + operating capacity`

The exact composition rule belongs to the owning company/operations authority. DT-06 only proves the people-side predicate.

## #653 Specialist Card Fragment boundary

Specialist Card Fragments are not capability evidence.

A governed completed fragment set may unlock **access to a recruitable specialist candidate/profile**. That access does not satisfy `engagementActive` and therefore contributes zero company capability by itself.

The progression/economy/inventory authority owns fragment minting, thresholds, replay safety, custody and marketplace ownership. Workforce/company authority owns actual recruitment/employment/service engagement. DT-06 begins contributing specialist capability only after a real person profile and legitimate active engagement exist.

Transporting or reselling an existing fragment cannot create a new qualification, person, engagement or company capability through this contract.

## Profession labels

A profession is an identity/career classification and navigation surface. Selecting or assigning a profession never grants the underlying capability or qualification by itself.

Career history may change without deleting earned personal evidence. Employment may change without changing profession. Qualification may exist while unemployed. These concepts are related but not interchangeable.

## Work Capacity boundary

Work Capacity is the player's current ability to perform productive work and is owned/mutated by Player Economy.

It is not:

- a formal qualification;
- a specialist availability pool;
- company throughput;
- an employee count;
- a facility operating-capacity meter.

DT-06 work-access evaluation may reject player work when authoritative Work Capacity is insufficient, but it never mints, restores or spends that state independently.

## Persistence / migration impact

None in this slice.

The new specialist evaluator is a pure domain contract. It introduces no Save schema field and does not persist specialist engagements or qualification profiles. Before specialist runtime state becomes durable, DT-02 and the owning workforce/company domain must define the capture/restore handoff and migration path.

Derived company capability should be recomputed from authoritative person/engagement/physical facts rather than persisted as an unexplained permanent grant when its prerequisites are revocable.

## Cross-DT handoff

- DT-03: fragment settlement/inventory and exactly-once reward authority may expose recruitable-candidate access, never qualification/company capability.
- DT-20: company/workforce authority supplies legitimate specialist engagement plus physical equipment/facility facts and composes final company capability.
- DT-02: persistence integration is required before specialist engagement/evidence becomes durable World Instance state.
- DT-18: authoritative time may later govern qualification expiry, schedules and long training durations.
- DT-21: UI should display truthful blockers and must not show a recruitable/unlocked card as already-hired company capability.

## Acceptance proved by this slice

Automated tests prove that:

- a qualified, actively engaged, available specialist can contribute;
- candidate/recruitment access without engagement contributes nothing;
- learned capability and formal qualification are separate requirements;
- ending engagement removes organizational contribution without mutating personal qualification evidence;
- actor identity mismatch fails closed.

## Canonical rule

**Skills and qualifications belong to people. Company capability may depend on those people, but only through legitimate active relationships and the other required physical/operational prerequisites. Unlocking a specialist candidate is not hiring them, and hiring them is not transferring their qualification.**
