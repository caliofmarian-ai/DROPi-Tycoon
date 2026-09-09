# Player Economy Runtime Adapter

## Scope

This document defines the narrow DT-03 adapter between the merged real urban delivery loop and the merged Player Economy domain under #436.

The adapter lives at:

- `game-web/src/economy/playerEconomyRuntimeAdapter.ts`

It does not own Save #566, `GameSessionState`, Save v2, mission persistence, World Instance persistence, Personal Capability rules, or visible Android UX.

## Authoritative productive-work evidence

The existing urban runtime remains authoritative for whether a delivery actually happened:

`performUrbanInteraction()` -> `attemptDelivery()` -> `settleDeliveryOutcome()`

The Player Economy adapter accepts work only when the runtime result proves that:

- the source order was `PickedUp`;
- the source order had not already been economy-settled;
- the urban interaction reports `settled: true`;
- the runtime advanced away from the completed order;
- cargo is no longer carried;
- the player's active order reference is cleared.

An unsuccessful interaction, malformed transition or non-settled order creates no productive work.

## Productive work and Work Capacity

A validated completed delivery is translated to the existing `performBasicDeliveryWork()` domain operation.

The adapter does not invent a second work system. The Player Economy domain continues to own:

- productive-minute values;
- Work Capacity cost;
- capacity bounds;
- employment validation;
- World Instance / World Clock validation.

The stable runtime work reference is derived from the real order ID.

Replay protection is intentionally stronger than the original shift-local activity identity: before recording work, the adapter checks all existing work records for the same real order ID. Therefore replaying the same order after a shift/day boundary cannot manufacture more productive minutes or consume Work Capacity twice.

## Wage settlement

`settleRuntimeEmployeeShiftWage()` is the runtime-facing wage boundary and delegates to the existing Player Economy wage settlement.

The domain continues to enforce:

- enough real productive work in the completed shift;
- one stable wage transaction identity;
- exactly-once settlement;
- employer Company Money debit equals Personal Money credit;
- no negative or invalid employer treasury;
- no wage in legacy compatibility mode.

The adapter never converts or redirects the legacy prototype delivery reward into Personal Money.

## Read-only work port

`readPlayerEconomyWorkPort()` exposes a narrow read-only snapshot for consumers such as DT-06 capability/profession eligibility:

- World Instance and hero identity;
- employee mode/employer identity;
- current employee transport mode;
- Personal Money balance;
- employer treasury balance;
- current/max Work Capacity;
- whether basic delivery work has enough capacity and active employment.

The port contains no mutation callbacks and imports no Personal Capability engine. Capability eligibility remains owned by DT-06.

## Save #566 boundary

DT-03 does not add fields to Save v2 and does not modify mission/cargo persistence.

For #566, the persistence owner may later persist the Player Economy aggregate and its stable work/wage identities. The adapter's responsibility is only to make replay-safe runtime identities available so restored state cannot legitimately count one real order twice.

No save/reload authority is claimed by this PR.

## Acceptance

Deterministic integration tests cover:

- a real settled urban delivery becoming productive employee work;
- Work Capacity consumption;
- duplicate real-order replay after World Clock advancement;
- two real deliveries satisfying shift work and funding a conserved employer-to-person wage;
- duplicate wage rejection;
- unsuccessful/malformed runtime transitions producing no work;
- legacy compatibility remaining outside the employee bridge;
- read-only work-port behavior without Save or capability ownership.

## Canonical rule

**Only an already-settled real delivery may become Player Economy productive work; one real order may count at most once across all shifts, and wage value moves only through the existing conserved employer-treasury-to-Personal-Money settlement.**
