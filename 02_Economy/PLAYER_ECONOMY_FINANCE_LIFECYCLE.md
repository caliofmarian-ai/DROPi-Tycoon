# Player Economy Finance Lifecycle

## Scope

This contract defines the DT-03 employee-first finance lifecycle built on the existing Player Economy aggregate and authoritative World Clock C1.

Runtime implementation:

- `game-web/src/economy/playerEconomyFinanceLifecycle.ts`

It coordinates existing money/work/living operations. It does not create a second money ledger, clock, mission engine, Save schema, UI surface, or company economy.

## Lifecycle chain

The governed employee-first sequence is:

`productive work -> shift progress -> C1 shift boundary -> wage eligibility -> wage settlement`

and:

`C1 operating-day boundary -> living cost -> arrears if unpaid -> later earned wage -> arrears recovery`

The lifecycle processor consumes only explicit `WorldClockState` values and C1 policy boundaries.

## Productive work and shift progress

Productive work remains owned by `performBasicDeliveryWork()` and the merged real-delivery adapter.

The lifecycle does not manufacture work. It reads the existing `workCapacity.activities` ledger for the current or completed shift and derives:

- productive minutes;
- required productive minutes;
- remaining productive minutes;
- whether the shift would be wage-eligible at close;
- current/max Work Capacity.

`readCurrentEmployeeShiftProgress()` is a read-only projection. It performs no money, work, clock, or capability mutation.

Duplicate productive work remains rejected by the existing Player Economy activity identity. Therefore duplicate work cannot increase shift progress or create wage eligibility.

## Shift close and wage settlement

A shift can close only when the supplied C1 interval crosses a configured C1 shift-start boundary.

For each crossed shift boundary, the lifecycle:

1. identifies the immediately completed shift using `workShiftPosition()`;
2. derives its productive-work progress;
3. delegates wage settlement to `settleCompletedStarterShiftWage()`;
4. records the resulting lifecycle outcome.

Valid outcomes are:

- `wage-paid`;
- `not-earned`;
- `already-settled`;
- `employer-insolvent`.

No work means `not-earned` and zero Personal Money credit.

An eligible wage uses the existing stable wage transaction identity. Employer treasury debit must equal employee Personal Money credit. Reprocessing the same shift returns `already-settled` and cannot move money again.

The legacy prototype per-delivery `CompanyState.money` reward is not redirected into Personal Money.

## Operating-day living cost

Operating-day boundaries come only from C1 `operatingDayStartMinute`.

For every crossed day boundary, the lifecycle delegates to `settleBasicLivingCostsThroughClock()`.

The existing living-cost obligation identity remains authoritative, so:

- one operating day can be charged at most once;
- Personal Money never becomes negative;
- insufficient Personal Money produces arrears;
- replay of an already processed day produces no second charge.

## Arrears recovery

If an earned wage becomes available while living arrears exist, the same C1 wage boundary may immediately delegate to `settleLivingArrears()`.

This gives the employee a deterministic recovery path without debt forgiveness or money creation:

- wage first enters Personal Money from the employer treasury;
- available Personal Money may then pay existing living arrears;
- the arrears payment is separately ledgered;
- identity, employment and capability remain intact.

## Chronological event ordering

Intervals may cross several shift and operating-day boundaries. The lifecycle enumerates those C1 boundaries and processes them in chronological order.

This avoids causal errors such as using a wage earned later in the interval to pay a living cost that occurred earlier.

If a future C1 policy places a shift boundary and operating-day boundary at the same exact minute, the deterministic tie order is:

1. completed-shift wage settlement;
2. living-cost settlement.

## Bounded processing

The lifecycle rejects intervals larger than `WorldClockPolicy.maxAdvanceMinutes` instead of creating an unbounded catch-up processor.

Cross-world and reversed-clock intervals are rejected without mutation.

## Ownership boundaries

This slice does not modify or own:

- Save v2 or #566;
- `GameSessionState`;
- `game-web/server/**` or PostgreSQL;
- Mission Framework or mission persistence;
- dialogue or story rewards;
- Personal Capability mutation;
- Brăila map/visual presentation;
- Android UI;
- Railway or CI configuration.

DT-02 remains the Save/world continuity owner. DT-06 remains capability/profession eligibility owner.

## Hard invariants

1. No productive work means no wage.
2. Duplicate productive work cannot count twice.
3. Duplicate shift close cannot pay twice.
4. Duplicate operating-day processing cannot charge twice.
5. Employer wage debit equals employee Personal Money credit.
6. Personal Money remains distinct from company-owned money.
7. Work Capacity remains the productive-work authority.
8. World Clock C1 is the only lifecycle time source.
9. Mission/dialogue layers cannot create money through this lifecycle.
10. Legacy Company Money is never reinterpreted as Personal Money.
11. Insolvency creates recoverable arrears rather than negative money or identity deletion.

## Deterministic acceptance coverage

Focused tests cover:

- shift-progress projection before and after productive work;
- duplicate productive work rejection;
- no work -> no wage;
- eligible shift -> exactly one conserved wage;
- duplicate shift processing -> no duplicate wage;
- chronological wage-before-living processing across a day;
- living cost exact-once behavior and arrears creation;
- later wage-funded arrears recovery;
- cross-world, reversed and over-bounded C1 rejection;
- legacy Company Money isolation.

The repository-wide Player Economy/runtime-adapter tests continue to cover real settled delivery -> productive work, Work Capacity exhaustion and replay protection.

## Canonical rule

**Employee finance advances only at authoritative C1 boundaries: real productive work earns shift eligibility, employer treasury funds exactly-once wages, operating days create exactly-once living obligations, and later earned Personal Money provides the recovery path for unpaid living costs.**
