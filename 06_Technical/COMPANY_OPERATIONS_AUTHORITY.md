# Document Information

Document: COMPANY_OPERATIONS_AUTHORITY.md
Project: DROPi Tycoon
Status: Proposed — DT-20 company-operations authority contract
Language: English
Target: #438
Canonical main reconciled: `3545700511b9debaa71449ae59a98b40ac54d4c2`

---

# Company Operations Authority

## Purpose

This document defines the DT-20 company-operations composition boundary without creating a second company engine, ledger, workforce store, equity system, fleet store, HQ progression store, capability writer, or persistence writer.

The company is a physical organization in the world. A phone action may inspect or plan company state; it does not itself create infrastructure, treasury value, membership, vehicles, staff, equipment, ownership, or permanent capability.

---

# 1. Existing Authorities Consumed

DT-20 extends and composes authorities already present on canonical `main`.

| Concern | Current source authority | DT-20 treatment |
| --- | --- | --- |
| Company identity / founder / service / operating area / authorization | `RegisteredBusinessIdentity` / `LocalBusinessRegistryState` | Consume as identity; do not create another company identity catalog. Founder history alone is not ownership. |
| Membership eligibility (legacy bridge) | `CompanyEquityState.activeMemberActorIds` | Project as explicit operational membership records until a coordinated membership-writer migration is assigned. Membership is not ownership and does not imply holdings. |
| Employment | `CompanyState.employees` | Consume as workforce relationship/state. Employment is not membership or ownership. |
| Ownership / investment | `OwnershipEconomyState.equity.holdings` | Consume only explicit holdings as investment/ownership state. Do not infer holdings from membership, founder history, employment, or executive role. |
| Company Money / treasury | `CompanyState.money` and Economy settlement systems | Read only. DT-20 does not mint, debit, credit, or mirror Company Money. |
| HQ construction | `CompanyState.hq` + `hqProgressionSystem.ts` | Consume source department state. Do not create parallel department unlock state and do not use normalization defaults as proof of legitimate physical startup. |
| Fleet ownership | `CompanyState.vehicles` | Consume as company operational assets. Do not create a second vehicle ledger or infer Fleet Bay capability from vehicle presence. |
| People qualification / specialist contribution | Canonical DT-06 `game-web/src/capabilities/specialistWorkforceCapability.ts` | Consume the people-side verdict when a later integration slice is assigned. DT-20 does not redefine `SpecialistCapabilityProfile`, qualification semantics, or `evaluateSpecialistWorkforceContribution(...)`. |
| Save / durable composition | DT-02 | No new writer in this slice. Future persistence must be single-writer and migration-safe. |

Merged DT-06 PR #666 is canonical on the reconciled main. Its evaluator is pure/read-only and establishes that a qualified person's contribution depends on a legitimate active engagement and availability. This DT-20 slice does not duplicate that evaluator and does not yet implement the later specialist + facility + equipment composition.

---

# 2. Single Operational Aggregate Contract

`game-web/src/systems/companyOperationsSystem.ts` defines a read-only `CompanyOperationalAggregate` that separates:

1. `identity`;
2. `membership`;
3. `employment`;
4. `ownershipInvestment`;
5. `treasury`;
6. `physicalFacilities`;
7. `fleet`;
8. derived DT-20 physical capability projection.

The aggregate is a composition/read model, not another persisted owner of these values.

Company/founder identity mismatches fail closed rather than silently combining unrelated records. The founder check is an identity-history consistency check only; it does not create or infer equity ownership.

---

# 3. Membership Boundary

Operational membership must remain distinct from:

- employment;
- Founder history;
- executive control;
- Internal/Member share holdings;
- External investment holdings.

The current equity foundation contains `activeMemberActorIds` because Internal/Member shares require membership eligibility. Until DT-20 receives an explicit migration slice, the company-operations aggregate treats that field as a compatibility membership projection source only.

`activeMemberActorIds` proves membership eligibility only. An actor in that list has no ownership unless explicit equity holdings say so. Likewise, creating/founding the company context does not automatically make the founder an owner.

A future migration must establish one durable membership writer and then make equity consume membership eligibility from that authority. It must not leave two independently mutable member lists.

---

# 4. Physical Startup Boundary

A newly registered company is not operational merely because `CompanyState` has a legacy `Core` HQ default.

This read model does not materialize `CompanyPhysicalStartupBinding` from authorization. It consumes an already-legitimate physical binding established by the owning physical/world authority and validates it against existing source HQ state.

The binding associates:

- the `companyId`;
- its governed `operatingAreaId`;
- an existing `Core` HQ department fact.

The composition system intentionally does **not** invent:

- a new HQ;
- a new locality ID;
- a street/address;
- world coordinates;
- a second facility identity;
- fleet assets;
- equipment;
- a new HQ progression system;
- permanent capability.

A binding with the wrong company/operating area fails closed. A binding claiming `Core` while source physical HQ state does not actually contain `Core` also fails closed.

Authorization remains a separate operational condition. A legitimate existing footprint may remain associated if authorization later becomes `Suspended` or `Closed`, but derived operational capability is withheld while the company is not `Authorized`.

The exact building/site identity and world placement require the owning world/locality/facility contract when assigned; this slice does not fabricate them.

---

# 5. Derived Physical Capability Rule

DT-20 derived physical capability exists only when all required physical facts are already present and the company is currently authorized to operate.

Current implemented projection is intentionally minimal:

- `CoreOperations` — requires an explicit legitimate physical startup binding, a source `Core` construction fact, and current `Authorized` status;
- `MaintenanceWorkshop` — additionally requires source `Maintenance` construction state.

A vehicle alone does not imply Fleet Bay capability. A phone button does not imply Operations & Dispatch. Money alone does not imply any department. A recruited specialist does not imply a facility exists, and a facility does not grant a specialist's qualification.

For future people-dependent company capability, DT-20 must consume the canonical DT-06 specialist-contribution verdict and combine it with separately authoritative physical/equipment/authorization facts. It must not copy DT-06 qualification rules or persist a permanent capability flag after a specialist leaves or becomes unavailable.

Future Fleet Bay, Operations & Dispatch, staging/sorting, warehouse, DronePort, research, or specialist departments must extend the existing governed facility authority rather than become menu-only booleans.

---

# 6. Formation-to-Operation Transaction Boundary

The eventual executable formation path must preserve this causal order:

```text
qualified person / legitimate formation prerequisites
-> business registration request
-> authorized company identity
-> exactly-once startup capitalization settlement (DT-03 economic authority)
-> explicit operational membership activation (DT-20)
-> legitimate physical startup/site fact established by its owning authority
-> DT-20 consumes/validates that physical fact
-> durable single-writer persistence composition (DT-02)
-> derived operational company capabilities
```

The steps that mutate money, membership, physical ownership, or durable state must be replay-safe and future-server-authoritative where contested.

This PR does **not** implement startup capitalization, physical materialization, specialist engagement persistence, or Save mutation. It establishes the composition boundary those later mutations must target.

---

# 7. Legacy Compatibility

The existing runtime still creates a starter `CompanyState` with Company Money, fleet/workforce arrays and Core HQ for compatibility.

This slice does not reinterpret that legacy runtime as proof that a fresh canonical hero already owns a legitimate company or has a legitimate physical startup binding.

Legacy state remains loadable under its existing path. A future DT-02 migration must explicitly decide how a legacy starter company maps to company identity, membership, treasury, facilities and World Instance scope.

No old Company Money becomes Personal Money. No old local company becomes a multiplayer-owned company merely because IDs can be composed locally.

---

# 8. Multiplayer / Security Boundary

Company identity, membership, permissions, balances, ownership, vehicles, facilities and contested capability are future server-authoritative families under the shared-authority contract.

The client may request an action and display the resulting state. It must not self-assert:

- company membership;
- executive permission;
- treasury balance;
- ownership;
- physical facility construction;
- vehicle ownership;
- equipment existence;
- specialist capability;
- successful startup capitalization.

The current aggregate is local/offline composition only. It does not create a production multiplayer trust boundary.

---

# 9. Known Limitations / Next Required Slices

This first DT-20 slice deliberately leaves open:

- a durable independent membership writer and migration from the current equity eligibility projection;
- exactly-once Personal Money/startup-funding -> Company Money capitalization settlement with DT-03;
- authoritative physical facility/site materialization and locality placement;
- DT-02 Save composition/migration;
- Fleet Bay, Operations & Dispatch, parcel staging/sorting and broader departments;
- specialist + facility + equipment capability composition consuming canonical DT-06 evidence;
- physical Android verification of company formation/startup.

These are not satisfied by the existence of this document or aggregate.

---

# Canonical Direction

**Company identity, membership, employment, ownership/investment, treasury, facilities, fleet and derived operational capability are distinct facts. Legacy membership does not prove ownership; founder history does not prove ownership. DT-20 consumes existing physical facts and never materializes HQ, fleet, equipment or permanent capability from a menu action or authorization record. Canonical DT-06 owns people-side specialist contribution and must be consumed rather than duplicated or redefined.**
