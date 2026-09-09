# Player Economy Persistence Handoff

## Status

DT-03 owning-domain persistence handoff following merged PR #625.

Coordinates:

- Player Economy parent: #436;
- merged GameSession composition: #625;
- merged World Instance persistence-composition contract: #630;
- active DT-02 persistence-readiness follow-up: #636;
- global start / locality / relocation requirement: #634.

This document is an owning-domain handoff to DT-02. It does not add or authorize a Save v2 field, PostgreSQL table, migration, public API, server route, browser/server dual write, UI, Android behavior, Railway change or World Clock persistence implementation.

---

## 1. Canonical authority being handed off

The persistence candidate is the exact live-session sidecar already merged in #625:

- `GameSessionPlayerEconomyComposition`;
- capture/restore envelope `GameSessionPlayerEconomyStatePort`;
- `PlayerEconomyState` as the economic aggregate inside that envelope.

Canonical implementation:

- `game-web/src/economy/gameSessionPlayerEconomyComposition.ts`;
- `game-web/src/economy/playerEconomy.ts`;
- `game-web/src/economy/playerEconomyRuntimeAdapter.ts`;
- `game-web/src/economy/playerEconomyFinanceLifecycle.ts`;
- `game-web/src/economy/playerEconomyHardshipLifecycle.ts`.

DT-03 remains the semantic owner of Personal Money, incumbent employer treasury inside this aggregate, employment state represented here, productive-work receipts, Work Capacity, living arrears and the wage/living/hardship settlement semantics.

DT-02 may own where a validated snapshot is stored and how authoritative persistence is cut over. DT-02 must not redefine the economic meaning of the aggregate.

---

## 2. Canonical version and envelope

Current canonical constants:

```text
GAMESESSION_PLAYER_ECONOMY_COMPOSITION_VERSION = 1
GAMESESSION_PLAYER_ECONOMY_STATE_PORT_KIND = GameSessionPlayerEconomyStatePort
PLAYER_ECONOMY_STATE_VERSION = 1
Player Economy policyId = phase1-player-economy-v1
```

The exact capture envelope is conceptually:

```text
GameSessionPlayerEconomyStatePort {
  kind
  version
  policyId
  clockPolicyId
  worldInstanceId
  heroActorId
  clock
  economy
}
```

`economy` is the complete `PlayerEconomyState` aggregate. Its current state families are:

- Personal Money account + ledger;
- incumbent employer Company Money account + ledger when in `FreshEmployee` mode;
- starter employment state when applicable;
- Work Capacity current/max + productive-work activity receipts + settled rest IDs;
- living financial/housing state + arrears + settled living-obligation IDs.

The persistence owner must preserve the envelope version, Player Economy policy ID and World Clock policy ID. A persisted snapshot created under another contract/policy is not silently upgraded into the current policy.

---

## 3. Aggregate owner keys

The Player Economy composition is owned by exactly one hero inside exactly one World Instance.

Canonical identity keys:

```text
worldInstanceId
heroActorId
```

All of the following must agree with those keys:

- GameSession World Identity;
- composition `worldInstanceId`;
- composition `heroActorId`;
- C1 clock `worldInstanceId`;
- Player Economy `worldInstanceId`;
- Player Economy `heroActorId`;
- Personal Money owner (`Person`, heroActorId);
- work receipts (`worldInstanceId`, `heroActorId`).

A state port from another world or hero is not importable merely because its JSON shape is valid.

No account ID, nationality, country or locality ID is part of the DT-03 Player Economy owner key.

---

## 4. Capture semantics

The only current owning-domain capture boundary is:

```text
captureGameSessionPlayerEconomyStatePort(session, composition, policy, clockPolicy)
```

Capture is permitted only after the composition passes the same live-session validation used by the read projection.

A successful capture returns a detached deep copy of:

- the C1 clock snapshot;
- Personal Money and its ledger;
- employer Company Money and its ledger when present;
- employment + capability ID list represented by this aggregate;
- Work Capacity + productive-work receipts + settled rest IDs;
- living state + settled obligation IDs.

The returned port is detached from runtime authority. Mutating the returned object must not mutate the live composition.

DT-02 must persist the successful captured port, not reassemble an economic snapshot from UI projections, `GameSession.company.money`, mission state or individually queried balances.

A failed capture (`session-mismatch` or `invalid-state`) is a hard persistence failure for that snapshot. The persistence layer must not manufacture a replacement balance or discard replay IDs to make the write succeed.

---

## 5. Restore semantics

The only current owning-domain restore boundary is:

```text
restoreGameSessionPlayerEconomyStatePort(session, port, policy, clockPolicy)
```

Restore is fail-closed.

The current restore contract rejects at least these classes:

- wrong/malformed port kind or version -> `invalid-port`;
- Player Economy policy ID mismatch -> `policy-mismatch`;
- World Clock policy ID mismatch -> `policy-mismatch`;
- world or hero mismatch against the active GameSession identity -> `session-mismatch`;
- composition/economy identity mismatch -> `invalid-state`;
- Fresh/Legacy mode inconsistent with GameSession World Identity -> `invalid-state`;
- C1 clock that requires sanitizer repair or belongs to another world -> `invalid-state`;
- Personal Money / living-hardship state that cannot be reconstructed consistently from authoritative ledger + settled-obligation identities -> `invalid-state`.

A successful restore returns a newly detached `GameSessionPlayerEconomyComposition`.

DT-02 must call the owning-domain restore boundary after loading. Database deserialization success is not gameplay restore success.

If the current restore boundary rejects a persisted record, persistence must fail closed, quarantine/report the invalid snapshot or use a separately approved migration path. It must not directly patch balances, delete duplicate IDs, rewrite world/hero identity or change Fresh/Legacy mode.

If stricter aggregate validation is later needed, it belongs in DT-03 first. DT-02 must not create a competing sanitizer whose accepted state differs from the owning-domain restore contract.

---

## 6. Stable replay and idempotency identities

Persistence must retain these IDs exactly. They are economic history, not cache metadata.

### 6.1 Incumbent opening capital

Current stable opening transaction:

```text
company-opening:<worldInstanceId>:<starterEmployerCompanyId>
```

For the current v1 starter employer this is created once by the fresh-state constructor. Persistence must never re-run opening capital on every reload.

### 6.2 Real delivery -> productive work

A real settled urban order is mapped to an activity ref:

```text
runtime-delivery:<orderId>
```

The stored work activity ID is:

```text
work:<worldInstanceId>:<heroActorId>:<operatingDayIndex>:<shiftIndex>:runtime-delivery:<orderId>
```

Runtime replay protection additionally scans for the stable `:runtime-delivery:<orderId>` suffix across shifts, so replaying one real order after clock advancement cannot manufacture another productive-work receipt.

Therefore persistence must retain all `workCapacity.activities[].activityId` values and the original order-derived suffixes.

### 6.3 Wage settlement

Current wage transaction identity:

```text
wage:<worldInstanceId>:<heroActorId>:<operatingDayIndex>:<shiftIndex>
```

The same transaction identity is written to both sides of the conserved employer -> person wage transfer.

Persistence must preserve both ledgers together. Restoring only the Personal Money credit or only the employer debit is invalid economic history.

### 6.4 Living obligation

Current living obligation / Personal Money transaction identity:

```text
living:<worldInstanceId>:<heroActorId>:<operatingDayIndex>
```

The same stable identity appears in `living.settledObligationIds` and, when Personal Money pays a positive amount, in the Personal Money ledger.

The obligation ID must remain persisted even when some or all of the obligation became arrears, because it is the exactly-once day marker.

### 6.5 Living-arrears recovery

Current arrears-payment transaction identity:

```text
living-arrears:<worldInstanceId>:<heroActorId>:<arrearsMinorBeforePayment>:<clockMinuteOrdinal>
```

The recovery transaction is retained in the Personal Money ledger and is part of deterministic hardship reconstruction.

### 6.6 Work Capacity rest IDs

`workCapacity.settledRestIds[]` are caller/domain-provided stable rest identities accepted exactly once by Player Economy.

Persistence must retain the complete set. It must not regenerate rest IDs from elapsed wall-clock time after reload.

### 6.7 Hardship transition IDs

Hardship transitions are deterministic derived history, not a second persisted authority.

They are reconstructed from economic source identities using:

```text
hardship:<worldInstanceId>:<heroActorId>:<sourceType>:<sourceId>:<transitionKind>
```

The persistence owner should persist the underlying Player Economy ledger/obligation state, not a second mutable hardship-transition table merely to resume this aggregate.

---

## 7. Fresh-world default

For a `FreshLocal` World Identity, the owning constructor is:

```text
createGameSessionPlayerEconomyComposition(...)
  -> createFreshEmployeePlayerEconomy(...)
```

The current `phase1-player-economy-v1` fresh aggregate is created with:

- mode `FreshEmployee`;
- Personal Money balance `0` and empty Personal Money ledger;
- incumbent employer Company Money opening balance `100000` minor units;
- one stable incumbent opening-capital ledger entry;
- active starter employment with the incumbent logistics employer;
- starter role `LightDeliveryEmployee`;
- transport mode `Walking`;
- smartphone available;
- current starter capability IDs represented by the employment aggregate;
- Work Capacity `1000 / 1000`;
- empty productive-work receipt list;
- empty settled-rest ID list;
- living financial status `Stable`;
- housing status `Housed`;
- arrears `0`;
- empty settled living-obligation IDs;
- `lastSettledOperatingDay` equal to the spawn operating day, which is the governed onboarding grace day.

The numeric values above describe the current policy. DT-02 must not encode them as an independent database policy. Fresh state must be materialized by the owning-domain constructor under the persisted/current matching `policyId`.

### 7.1 Fresh-world non-import rule

A fresh world must never derive Personal Money from:

- `GameSession.company.money`;
- another World Instance;
- another hero/account;
- a mature legacy save;
- mission rewards not already settled through Player Economy;
- locality/country defaults.

Fresh Player Economy starts from the owning-domain constructor only.

---

## 8. Legacy compatibility

For a legacy GameSession identity, the composition creates `LegacyCompatibility` mode.

Canonical rule:

- legacy `GameSession.company.money` remains legacy Company Money;
- it is not imported into Personal Money;
- `convertedToPersonalMoney=false`;
- the Player Economy Personal Money account starts at zero;
- the fresh-employee work/wage bridge is disabled in legacy mode.

`GameSessionPlayerEconomyStatePort` does not grant DT-02 permission to migrate legacy Company Money into the Personal Money ledger.

If a future product migration converts legacy economy into the employee-first model, DT-03 must first define a separate explicit migration operation and stable migration receipt. A database migration must not infer this conversion.

---

## 9. Atomicity expectations

### 9.1 Player Economy snapshot is one logical commit unit

At persistence boundaries, the following must represent one coherent economic revision:

- Personal Money balance + Personal Money ledger;
- employer Company Money balance + employer ledger when present;
- employment represented by this aggregate;
- Work Capacity current/max;
- work receipts;
- settled rest IDs;
- living arrears/status;
- settled living obligations;
- the C1 clock snapshot/reference used to prove which settlement boundaries have been processed.

A persistence write must not expose a state where one subset is durable and another subset still represents the previous revision.

### 9.2 Wage transfer is conserved

A wage is one logical employer-to-person transfer.

The employer debit and Personal Money credit share the same wage transaction ID and must survive or fail together. Persisting only one account side would manufacture or destroy money.

### 9.3 Clock-driven finance is coherent with its clock boundary

`advanceGameSessionPlayerEconomyThroughClock()` can process wages, living obligations, arrears recovery and hardship transitions for C1 boundaries.

The resulting economic aggregate and the clock point through which it has been processed must be committed coherently. A restart must not restore:

- a clock after a boundary with economy from before that boundary; or
- economy after a boundary with a clock snapshot that invites the same boundary to be processed as new.

This handoff does not authorize a per-player independent server clock. C1 remains the World Clock authority. Before shared/server-side time settlement, DT-02 must coordinate with the owning World Clock persistence/catch-up contract required by #630.

### 9.4 Cross-domain delivery effects

Player Economy records productive work only after the authoritative real delivery runtime has already proved a settled delivery transition.

For a future server-authoritative transaction where order/cargo settlement and economic work recording must become one durable outcome, the persistence/runtime owners must use either:

- one database transaction across the required state families; or
- an explicitly durable transactional workflow/outbox with stable receipts.

Two unrelated best-effort writes are not sufficient.

The stable order-derived productive-work identity must survive retry so a delivery cannot create work twice.

---

## 10. Concurrency expectations

The current Player Economy aggregate does not expose a domain-native persistence revision counter.

Therefore DT-02 must not use last-write-wins persistence for concurrent writes.

The safe persistence envelope must provide an external expected revision / compare-and-swap equivalent for one `(worldInstanceId, heroActorId, PlayerEconomy)` aggregate.

Required behavior:

1. load one authoritative revision;
2. run the economic command through DT-03 domain functions;
3. capture the resulting state port;
4. write only if the expected persistence revision still matches;
5. on revision conflict, do not merge balances/arrays manually;
6. reload the authoritative aggregate and re-evaluate the command through the owning domain using its original stable command/source identity.

Forbidden conflict repair includes:

- adding two independently computed balances;
- unioning ledgers without validating order/ownership;
- concatenating work receipts blindly;
- choosing the larger Work Capacity value;
- choosing the larger arrears value;
- dropping a duplicate ID to make a write pass;
- silently preferring browser state over server state or vice versa.

---

## 11. Single-writer cutover

This handoff follows merged #630.

For one `(worldInstanceId, heroActorId)` Player Economy family, exactly one persistence authority may be active:

- current local/session authority while no durable cutover exists; or
- a future authenticated `ServerWorldAuthority` after DT-02 explicitly activates that cutover.

The following is forbidden:

```text
Player Economy command
-> authoritative Save/browser write
-> authoritative PostgreSQL write
```

A diagnostic shadow copy is permitted only if it can never feed gameplay settlement or become fallback authority.

No `003_*` PostgreSQL migration is authorized by this handoff on its own. The broader #630/#636 prerequisites still apply, including trusted authenticated identity and durable World Clock requirements where relevant.

---

## 12. #634 locality / migration boundary

Player Economy does **not** own:

- nationality/origin identity;
- `homeCountryId`;
- `homeLocalityId`;
- `startingLocalityId`;
- `currentCountryId`;
- `currentLocalityId`;
- relocation/migration history;
- locality validity;
- playable-locality instantiation.

Those are World Instance / onboarding / locality authorities under #634 and coordinated owners.

Therefore the Player Economy state port must not be expanded by DT-02 with copied locality fields merely because relocation can have economic effects.

### 12.1 What Player Economy may consume

A legitimate relocation can later cause economic consequences only through owning-domain events, for example:

- a validated travel or relocation charge;
- a housing-cost context change;
- an employer/employment change;
- a shift/work context change.

DT-03 owns only the economic mutation once the responsible world/onboarding/employer authority provides a legitimate source event.

### 12.2 No invented relocation fee

The current Player Economy ledger reasons are:

- `IncumbentOpeningCapital`;
- `StarterShiftWage`;
- `BasicLivingCost`;
- `LivingArrearsPayment`.

There is currently no canonical `RelocationCost` transaction type or relocation settlement operation.

Therefore DT-02, missions, story and #634 implementation must not invent:

- fixed relocation fee tables;
- synthetic relocation ledger entries;
- fake Personal Money debits;
- migration transaction IDs;
- locality-specific wage/living numbers not supplied by an owning domain.

If relocation cost becomes executable, DT-03 must first add a governed replay-safe economic operation keyed by a stable authoritative relocation source event. Only then may DT-02 persist the resulting economic ledger history.

### 12.3 Recovery never moves the player

`Insolvent`, `EmergencyHousing`, `Recovering` and `Stable` are economic/housing-status facts inside Player Economy. They do not own the hero's current locality.

Hardship processing, arrears recovery or restore must never:

- teleport the hero to Brăila;
- reset `currentLocalityId` to home or starting locality;
- overwrite a legitimate relocation event;
- infer locality from employer or housing status.

On reload, DT-02 restores locality through the #634 owner and Player Economy through this handoff as distinct state families, then validates cross-domain references according to the persistence composition contract.

---

## 13. Restore ordering for a future composed World Instance

When DT-02 eventually composes durable state families, the safe conceptual order is:

1. authenticate the account/server identity through the trusted #560 boundary;
2. resolve authoritative World Instance + hero identity;
3. restore authoritative World Clock state/reference for the world when that persistence exists;
4. restore #634 home/start/current locality through its owning contract when implemented;
5. load the Player Economy port for the same world + hero;
6. invoke `restoreGameSessionPlayerEconomyStatePort(...)` with the expected Player Economy and clock policies;
7. restore referenced mission/logistics/capability/production families through their own owner contracts;
8. validate cross-domain references;
9. only then allow new commands/settlements.

This ordering does not transfer locality or World Clock ownership into Player Economy.

---

## 14. Required persistence acceptance evidence

Before DT-02 activates any durable Player Economy writer, acceptance must prove at minimum:

### Round-trip

- capture -> persist -> load -> owning restore returns the same canonical composition;
- captured state is detached from runtime state;
- no balance or replay ID changes during serialization.

### Restart / replay

- real delivery recorded before restart remains recorded after restore;
- replaying the same real order ID after restore returns duplicate/no-op behavior;
- a settled wage cannot be paid again after restart;
- a settled living obligation cannot be charged again after restart;
- an arrears recovery transaction cannot be applied again after restart;
- settled rest identities remain exactly once.

### Identity isolation

- world A state cannot restore into world B;
- hero A state cannot restore into hero B;
- FreshEmployee and LegacyCompatibility modes cannot be swapped by persistence;
- another account/world cannot obtain this hero's Personal Money by changing request/body IDs.

### Policy/version rejection

- wrong port kind/version fails;
- wrong Player Economy policy ID fails;
- wrong World Clock policy ID fails;
- unsupported future version is not interpreted as v1.

### Tamper / invalid-state rejection

- unledgered Personal Money balance tampering fails current owning restore;
- invalid clock requiring repair fails;
- identity mismatch fails;
- invalid living/hardship reconstruction fails;
- persistence never performs silent balance/ID repair.

### Fresh-world isolation

- new FreshLocal World Instance creates a fresh Player Economy via the owning constructor;
- no `GameSession.company.money` conversion;
- no state copied from another world or locality.

### #634 relocation isolation

Once #634 is implemented:

- Player Economy restore never changes current locality;
- locality restore never copies or rewrites Personal Money;
- same-country and international relocation replay does not duplicate any later DT-03 relocation economic consequence;
- stale/invalid locality refs fail in the locality owner, not by mutating the Player Economy aggregate;
- hardship/recovery restart never snaps the hero back to Brăila/home/starting locality.

---

## 15. What DT-02 may persist

DT-03 approves DT-02 to design persistence around the **exact successfully captured state port**, subject to #630 single-writer and cutover prerequisites.

DT-02 may add persistence-envelope metadata outside the domain aggregate when needed, such as:

- storage schema version;
- persistence revision / compare-and-swap token;
- server audit timestamps;
- transactional workflow metadata.

Such metadata must not become a second source for:

- Personal Money balance;
- employer treasury balance;
- Work Capacity;
- arrears;
- wage eligibility;
- productive minutes;
- financial/housing status.

Those values remain derived from / owned by the captured Player Economy aggregate.

---

## 16. What DT-02 must not infer

DT-02 must not infer a permanent persistence shape from individual TypeScript fields while bypassing the state port.

In particular, do not create independent authoritative columns/tables that can drift from the aggregate for:

- a separate `personal_money_balance` without its ledger;
- a second employer treasury balance;
- duplicate wage history;
- duplicate living obligation history;
- a second hardship transition store used as mutation authority;
- a second productive-work receipt list;
- a second Work Capacity counter;
- copied locality fields inside Player Economy;
- legacy Company Money converted into Personal Money.

Normalized physical storage is allowed only if DT-02 can reconstruct the exact canonical port atomically and all invariants/replay identities remain governed by DT-03 restore semantics.

---

## 17. Cutover blockers that remain outside this handoff

This handoff makes Player Economy **owner-handoff complete**, but it does not by itself make server persistence ready.

DT-02 must continue to respect the broader #630/#636 gates, including as applicable:

- trusted authenticated account/world identity (#560);
- one active writer for the state family;
- authoritative World Clock persistence/catch-up before shared server time settlement;
- cross-domain atomicity for order/cargo/economic effects;
- approved migration/cutover/rollback plan;
- owner handoffs for other state families referenced by the same transaction.

DT-03 does not authorize a new PostgreSQL migration merely because this handoff exists.

---

## 18. DT-02 consumption checklist

After this handoff is merged, DT-02 may update its readiness matrix from:

```text
Player Economy: OPEN + BLOCKING (#625)
```

to the repository truth appropriate at that later checkpoint:

```text
Player Economy domain + GameSession composition: MERGED
Owning persistence handoff: MERGED + CONSUMABLE
Active durable writer: NOT YET ACTIVATED
```

The first safe database cutover still depends on #630/#636 prerequisites and an explicit orchestrator-approved persistence implementation.

---

## Canonical handoff rule

**Persist Player Economy only as one world-and-hero-bound, versioned, policy-bound, replay-safe aggregate captured and restored through DT-03 authority. Preserve ledgers and exactly-once IDs atomically, never reinterpret legacy Company Money, never create browser/server dual authority, and never make Player Economy the owner of nationality, home, starting or current locality.**
