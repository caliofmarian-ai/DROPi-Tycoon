# GameSession Player Economy Composition

## Scope

This document defines the DT-03 GameSession composition adapter that follows the merged hardship lifecycle in PR #610.

Runtime implementation:

- `game-web/src/economy/gameSessionPlayerEconomyComposition.ts`

The adapter composes existing authoritative domains. It does not create another money ledger, clock, work system, hardship store, Save schema or UI economy.

## Existing authorities reused

The composition consumes, without redefining:

- World Identity B1 for `worldInstanceId` and `heroActorId`;
- World Clock C1 for all shift/day timing;
- `PlayerEconomyState` for Personal Money, employer treasury, Work Capacity, employment and living state;
- `playerEconomyRuntimeAdapter.ts` for real settled urban delivery -> productive-work evidence;
- `playerEconomyFinanceLifecycle.ts` for shift progress and wage/living boundary processing;
- `playerEconomyHardshipLifecycle.ts` for arrears, insolvency, Emergency Housing and recovery projection.

## Live-session sidecar

`GameSessionPlayerEconomyComposition` is a typed live-session sidecar containing:

- the bound World Instance;
- the bound hero actor;
- the current authoritative C1 clock;
- the authoritative Player Economy aggregate.

It is bound to `GameSessionState` through World Identity. Every read or mutation boundary verifies that the composition still belongs to the same world and hero.

The sidecar is deliberately not inserted into Save v2 by this slice.

## Fresh employee creation

When `GameSession.worldIdentity` is `FreshLocal`, composition creation materializes the existing fresh-employee Player Economy contract:

- Personal Money starts at zero;
- the hero is an employee of the fictional incumbent logistics company;
- employer treasury is separate Company Money owned by that employer;
- Work Capacity starts within the existing governed bounds;
- living state starts under the existing onboarding grace rule.

No value from legacy `GameSession.company.money` is copied into Personal Money.

## Legacy compatibility

When GameSession identity remains `LegacyLocal`, the composition uses the merged `LegacyCompatibility` Player Economy mode.

`GameSession.company.money` remains legacy Company Money. The read projection labels it explicitly:

- authority: `GameSession.CompanyState`;
- `isPersonalMoney=false`.

Legacy Company Money is never reinterpreted as Personal Money and does not enable employee wage/work mutation.

## Read-only presentation projection

`readGameSessionPlayerEconomy()` is the consumer boundary for future UI, mission and dialogue presentation.

It exposes detached values only:

- Personal Money balance;
- incumbent employer treasury balance when applicable;
- legacy Company Money explicitly marked non-personal;
- current/max Work Capacity and basic-delivery availability;
- productive-work receipt copies;
- current shift productive minutes and wage eligibility;
- financial/housing status, living arrears and settled-obligation count.

The projection exposes no money, work, wage, living or hardship mutator. Editing the returned projection cannot change authoritative state.

Mission, dialogue and UI code may present these values later but must continue to route any legitimate mutation through the owning domain boundary.

## Productive work

`recordGameSessionSettledDeliveryWork()` delegates to the already-merged runtime adapter.

Therefore one delivery becomes productive work only after the real urban delivery runtime proves a completed settled transition.

The composition does not:

- award the legacy order reward as Personal Money;
- mutate `GameSession.company.money`;
- invent work from mission/dialogue completion;
- duplicate productive minutes for replayed order IDs.

The returned receipt is a copy of the authoritative `BasicDeliveryWorkRecord` already stored in Player Economy.

## Shift, wage and living lifecycle

`advanceGameSessionPlayerEconomyThroughClock()` delegates to `processEmployeeHardshipLifecycleThroughClock()`.

This preserves the full C1 causal chain:

1. real productive-work receipts accumulate inside the active shift;
2. a C1 shift boundary evaluates real productive minutes;
3. an earned wage conserves value from employer treasury to Personal Money exactly once;
4. C1 operating-day boundaries settle living obligations exactly once;
5. insufficient Personal Money creates arrears instead of negative money;
6. arrears create insolvency and, at the governed threshold, Emergency Housing;
7. later legitimate Personal Money may repay arrears;
8. cleared arrears enter `Recovering`;
9. a subsequent fully funded living obligation returns the player to `Stable`.

The adapter never calculates an independent shift/day boundary and never writes a second transition history.

## Money authority bridge

The runtime currently contains older company-centric gameplay surfaces where `CompanyState.money` is visible.

This adapter creates the bridge needed to retire the assumption that this value is the player's wallet:

- `PlayerEconomy.PersonalMoney` is the personal-money authority;
- the incumbent employer treasury is a separate Player Economy Company Money account;
- legacy `GameSession.company.money` is exposed only as legacy Company Money with `isPersonalMoney=false`;
- wage settlement never credits legacy `GameSession.company.money`;
- Player Economy settlement never debits legacy `GameSession.company.money`.

A future visible integration may switch HUD/story consumers to the read-only projection without inventing another wallet.

## Persistence handoff boundary

`captureGameSessionPlayerEconomyStatePort()` returns a detached typed state port containing:

- contract version;
- Player Economy policy ID;
- World Clock policy ID;
- World Instance and hero identity;
- C1 clock state;
- a deep copy of the Player Economy aggregate.

`restoreGameSessionPlayerEconomyStatePort()` fails closed unless:

- contract and policy IDs match;
- GameSession world/hero identity matches;
- clock ownership matches;
- Fresh/Legacy mode matches the session identity;
- Player Economy identity matches;
- ledger-derived hardship reconstruction validates the aggregate.

This state port is only a handoff contract. This PR does **not** add it to `SaveGameV2`, does not change serialization, does not change autosave events and does not change browser/PostgreSQL persistence.

DT-02 or the owning persistence lane may later persist this exact state without redefining Personal Money authority.

## Replay guarantees

The composed path inherits and preserves the existing exactly-once identities:

- real order ID -> productive-work receipt;
- operating day / shift -> wage transaction;
- operating day -> living obligation;
- ledger transaction -> arrears recovery;
- authoritative source ID -> hardship transition.

Capturing and restoring the state port preserves those identities. Replaying the same settled delivery or the same C1 interval cannot legitimately create extra work, wages, living charges or hardship transitions.

## Ownership boundaries

This slice does not modify:

- Save v2 / `saveSystem.ts`;
- `GameSessionState` schema;
- PostgreSQL / World Instance B2 server persistence;
- mission runtime or dialogue rewards;
- capability/profession rules;
- production/supply chain;
- Brăila rendering;
- Android UI;
- Railway or GitHub Actions.

## Deterministic acceptance coverage

Tests prove:

- Personal Money is explicit while legacy Company Money is marked non-personal;
- presentation projections are detached and cannot mutate authority;
- real settled deliveries create replay-safe productive-work receipts;
- Work Capacity and current shift progress are visible through the composition;
- two real deliveries can earn one conserved wage without mutating legacy Company Money;
- C1 living obligations can exhaust Personal Money and create arrears/insolvency;
- a later legitimate wage repays arrears through the existing recovery path;
- `Recovering -> Stable` requires the later funded living boundary;
- repeated wage/living intervals do not duplicate settlement;
- captured/restored state retains delivery replay protection;
- unledgered Personal Money tampering fails restore;
- cross-world restore fails closed;
- legacy mode cannot enter the fresh-employee work bridge.

## Canonical rule

**Within a live GameSession composition, Player Economy is the sole Personal Money and employee-finance authority; legacy `CompanyState.money` remains Company Money only, while all work, wage, living and hardship changes flow through existing replay-safe C1 domain operations.**
