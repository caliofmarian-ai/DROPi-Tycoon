# AI Implementation Report — Productive Employee Fleet

Date: 2026-09-07
Issue: #346
Branch: `openai/issue-346-productive-employee-fleet`

## Owner validation checkpoint

The owner confirmed on the installed Android app that PR #350's HQ return-context fix works: after leaving the Operations & Dispatch management surface, the hero returns to the same physical HQ position instead of the entrance. That result was recorded on #325 before this implementation started.

## Goal

Make idle company vehicles productive by assigning them to active Courier employees without transferring ownership. A vehicle must never be simultaneously player-active and employee-assigned. Productive couriers generate deterministic delivery income that is reported separately from salary and vehicle/operating costs.

## Implemented domain

- `OwnedVehicleState.assignedEmployeeId` is an additive optional Save-v2 field using stable employee and vehicle IDs.
- Added `employeeFleetSystem.ts` with authoritative assignment, release, usage-state and productivity logic.
- Vehicle usage resolves to `PlayerActive`, `EmployeeAssigned` or `Available`.
- Assignment requires an existing Active Courier, compatible company-owned vehicle, no previous employee assignment and a vehicle that is not the player's active transport.
- Assigned vehicles are excluded from player transport selection and player vehicle presentation.
- Releasing an assignment returns the vehicle to the available company fleet.
- A reusable employee-assignment release helper exists for future employee-removal workflows.

## Economy

Employee field revenue is deterministic and centrally tuned in `config/balancing.ts` by vehicle family plus a bounded company-level bonus. These values are prototype balancing values, not permanent game-design canon.

Operating-day settlement now:

1. calculates productive employee delivery revenue;
2. credits that income;
3. charges normal operating expense and full owned-fleet maintenance;
4. records cumulative employee delivery income separately inside the existing financial ledger;
5. preserves total delivery revenue as the aggregate authoritative income value.

The financial report distinguishes player delivery income and employee delivery income while salary, operating and maintenance expenses remain separate.

## Physical HQ UX

- Vehicle Fleet now shows whether an owned vehicle is player-active, available, or assigned to a field Courier.
- An available vehicle can be assigned to an Active Courier from the HQ fleet surface.
- An assigned vehicle can be released back to the company fleet.
- Player-active vehicles cannot be assigned until the player switches transport at Vehicle Handoff.
- Employee Management shows whether the Courier has a field vehicle and whether field delivery work is active.
- Financial Report shows cumulative employee delivery income and the next operating day's employee-income-versus-operating-cost preview.

## Persistence

Save format remains version 2. Existing saves remain compatible because assignment and employee-delivery ledger fields are additive and optional.

Save decoding validates that an assignment points to an existing Active Courier and prevents duplicate employee assignments. Invalid assignment metadata is repaired safely. The saved active player transport is also revalidated, so an employee-assigned vehicle cannot remain player-active after restore.

Added autosave event: `employee-vehicle-assignment-changed`.

## Tests

Added `game-web/tests/employee-fleet-productivity.test.ts` covering:

- active-player vehicle assignment rejection;
- Bicycle assignment to Alex after switching the player to Scooter;
- employee-assigned fleet exclusion from player transport selection;
- release back to available fleet;
- revenue only for an Active Courier with assigned transport;
- deterministic operating-day income/cost settlement;
- separate employee delivery income reporting;
- Save-v2 round-trip of assignments and employee revenue.

Updated the authoritative financial-report expectation for the new separate income categories.

## Boundaries preserved

- Company Money remains authoritative.
- No multiplayer is fabricated.
- No token, blockchain, wallet, real-money employment or real-world labor-contract system is introduced.
- Fleet ownership always remains with the company.
- Physical HQ remains the management surface.
- Phaser runtime and Android input architecture are unchanged.

## Verification status

Implementation is committed on the issue branch. GitHub Actions / TypeScript / production build verification is pending at the time of this report and must be green before merge. Owner Android validation is still required after deployment before #346 can be closed.
