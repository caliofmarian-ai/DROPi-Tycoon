# Player Economy Hardship / Arrears / Recovery Lifecycle

## Scope

This document defines the DT-03 hardship lifecycle layered on top of the merged Player Economy and authoritative World Clock C1 finance lifecycle.

Runtime implementation:

- `game-web/src/economy/playerEconomyHardshipLifecycle.ts`

The causal path is:

`living cost due -> insufficient Personal Money -> arrears -> insolvency -> Emergency Housing when threshold is crossed -> legitimate Personal Money recovery -> Recovering -> Stable`

This slice is domain/runtime integration only. It adds no Save schema, no giant UI and no alternative clock or money ledger.

## Authorities

The existing Player Economy remains authoritative for:

- Personal Money balance and ledger;
- employer Company Money and wage conservation;
- living-cost settlement;
- arrears amount;
- `Stable`, `Insolvent` and `Recovering` financial status;
- `Housed` and `EmergencyHousing` housing status;
- Work Capacity and productive work.

World Clock C1 remains the only time authority.

`playerEconomyHardshipLifecycle.ts` does not store a second hardship ledger. It reconstructs hardship days, recovery payments and transition history deterministically from the existing authoritative state.

## Deterministic day identity

Every settled living obligation already has a stable ID:

`living:<worldInstanceId>:<heroActorId>:<operatingDayIndex>`

The hardship timeline uses that existing obligation ID as its authoritative day ID.

Therefore replay of the same operating day cannot create another hardship day. The underlying living-cost settlement already refuses to charge an obligation twice.

## Deterministic transition identity

Hardship transitions are reconstructed rather than separately persisted.

A transition ID is derived from:

- World Instance;
- hero actor;
- source type (`day` or `recovery`);
- authoritative source ID;
- transition kind.

Examples of transition kinds:

- `InsolvencyEntered`;
- `EmergencyHousingEntered`;
- `ArrearsRecoveryApplied`;
- `EmergencyHousingExited`;
- `RecoveryStarted`;
- `StableRecoveryReached`.

Identical Player Economy state always reconstructs the same transition IDs. There is no second mutable transition store that can drift or duplicate.

## Paid living cost

When Personal Money covers the full living cost:

- the existing Personal Money ledger pays the living obligation;
- no arrears are added;
- no insolvency transition is generated;
- no Emergency Housing transition is generated.

A player already in `Recovering` who pays the next living obligation in full with no remaining arrears advances to `Stable`. That day reconstructs `StableRecoveryReached`.

## Unpaid living cost and arrears

When Personal Money is insufficient:

- Personal Money is debited only up to its available balance;
- Personal Money never becomes negative;
- the unpaid amount becomes arrears;
- financial status becomes `Insolvent`;
- the first transition into insolvency reconstructs `InsolvencyEntered`.

Further unpaid operating days accumulate arrears but do not create duplicate insolvency-entry transitions while the player remains insolvent.

## Emergency Housing

When arrears reach or exceed `PlayerEconomyPolicy.emergencyHousingArrearsMinor`, housing status becomes `EmergencyHousing`.

The threshold crossing reconstructs exactly one `EmergencyHousingEntered` transition for that causal day.

Emergency Housing is a safety/recovery state only. It does not:

- credit Personal Money;
- credit Company Money;
- forgive arrears;
- create wages;
- bypass Work Capacity;
- grant profit;
- force the player into entrepreneurship or a CEO path.

## Recovery

`settleHardshipRecoveryFromAvailablePersonalMoney()` is a career-neutral recovery boundary.

It delegates to the existing `settleLivingArrears()` operation and can only spend Personal Money that already exists in the validated Personal Money ledger.

It never mints funds.

This allows the same hardship recovery mechanism to remain compatible with multiple future careers. Any future legitimate career may supply Personal Money through its own governed income path; hardship recovery only consumes that already-authoritative Personal Money.

Each actual arrears payment reconstructs `ArrearsRecoveryApplied`.

When arrears fall below the Emergency Housing threshold, `EmergencyHousingExited` is reconstructed.

When arrears reach zero, financial status becomes `Recovering` and `RecoveryStarted` is reconstructed.

The player becomes `Stable` only after a subsequent fully paid living obligation leaves arrears at zero. This prevents instant hardship erasure at the same moment a debt is cleared.

## Replay safety

The hardship runtime derives history from:

- `living.settledObligationIds`;
- Personal Money ledger entries with `BasicLivingCost`;
- Personal Money ledger entries with `LivingArrearsPayment`.

Replay cannot create duplicate hardship state because:

1. living obligations are exactly-once by stable day ID;
2. wage settlement is exactly-once by stable shift transaction ID;
3. arrears payments are ledger transactions;
4. transition IDs are pure deterministic derivations of those authoritative source IDs;
5. there is no separate mutable hardship transition ledger.

`processEmployeeHardshipLifecycleThroughClock()` diffs the deterministic before/after timelines and reports only transitions that were newly materialized by the supplied C1 interval.

## Integrity checks

The timeline reconstruction validates that:

- Personal Money is ledger-derived and non-negative;
- Personal Money transaction IDs are unique;
- living obligation IDs are unique and world/hero-bound;
- living payments cannot exceed the configured living cost;
- arrears payments cannot exceed reconstructed arrears;
- reconstructed arrears equal the authoritative current arrears;
- reconstructed financial status equals the authoritative current status;
- reconstructed housing status equals the authoritative current status.

An unledgered balance edit therefore cannot be used as a hardship escape.

## Career freedom

Hardship does not change the player's employment, capabilities or identity.

The recovery boundary does not require ownership of a company and does not require an entrepreneur/CEO career. Employee, contractor and future profession paths can all use the same Personal Money recovery contract once their legitimate income path exists.

## Ownership boundaries

This slice does not own or modify:

- Save v2 / #566;
- `GameSessionState`;
- Mission Framework or authored mission rewards;
- dialogue rewards;
- capability/profession mutation;
- production/supply chain;
- Brăila visuals;
- Android UI;
- server/PostgreSQL;
- Railway or GitHub Actions workflows.

## Deterministic acceptance coverage

Tests cover:

- fully paid living cost;
- unpaid living cost;
- accumulating arrears;
- insolvency entry;
- Emergency Housing threshold and entry;
- no free money from Emergency Housing;
- deterministic day and transition IDs;
- duplicate/replay safety;
- wage-funded partial recovery;
- Emergency Housing exit;
- full arrears recovery;
- `Recovering` state;
- subsequent `Stable` recovery;
- preservation of identity, employment and capabilities;
- rejection of an unledgered Personal Money balance as a recovery source.

## Canonical rule

**Hardship is a consequence-and-recovery lifecycle, not a money source: C1 creates living obligations, unpaid Personal Money creates arrears and bounded safety states, and only existing ledger-backed Personal Money can clear those arrears on the path back to stability.**
