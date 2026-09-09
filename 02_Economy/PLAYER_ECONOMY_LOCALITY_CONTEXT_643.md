# Player Economy Locality Context Contract — #643

## Status

DT-03 locality-safe Player Economy integration contract for the global functional-locality program.

Coordinates:

- Player Economy parent: #436;
- merged GameSession Player Economy composition: #625;
- merged persistence handoff: #638;
- global start / relocation identity: #634;
- global functional-locality umbrella: #643;
- DT-06 citywide work-access authority: merged #639 and follow-up #644;
- DT-09 citywide delivery distribution: merged #627;
- DT-02 persistence composition/readiness: merged #630 / #636.

This slice is deliberately an adapter around existing authorities. It does not create a second economy, locality model, mission engine, capability engine, employer registry, Save schema, PostgreSQL writer or UI.

---

## 1. Canonical rule

**Personal economic history follows the hero inside one World Instance; local work authority follows the actual current locality. Changing locality must not mint/reset money, erase arrears, reset Work Capacity, duplicate work or wages, or import another locality's employer treasury.**

Brăila is a premium/reference locality under #643. It is not a special Player Economy authority and is never a fallback identity inside DT-03.

---

## 2. Ownership split

### World/locality owner supplies

`PlayerEconomyLocalityContext` is a read-only input containing:

- `worldInstanceId`;
- `currentCountryId`;
- `currentLocalityId`;
- `authorityRef`.

DT-03 does not infer, geolocate or validate Country Catalog membership from these strings. The World Instance / locality owner must first establish that the supplied current locality is legitimate and playable.

DT-03 therefore does **not** own:

- nationality/origin;
- home country/locality;
- starting locality;
- current locality mutation;
- relocation history;
- locality readiness;
- catalog -> playable-locality instantiation;
- map geometry, districts, roads or route classification.

### Employer/work owner supplies

`PlayerEconomyLocalEmployerAssignment` binds an existing employer relationship to an actual current locality/workplace using:

- world ID;
- locality ID;
- employer company ID;
- `employerLocationRef`;
- stable `assignmentRef`.

The same company may eventually operate in multiple localities only when the employer/work authority provides distinct legitimate assignments/workplace references. Player Economy does not create branches or transfers by seeing a new locality ID.

`PlayerEconomyLocalWorkSource` binds one already-existing order to:

- world ID;
- locality ID;
- employer company ID;
- employer workplace reference;
- the exact `orderId`;
- stable `workSourceRef`.

This prevents a caller from relabeling an already-settled delivery as work from another locality after the fact.

---

## 3. Hero-continuous economic state

The following remain bound to the Player Economy world+hero aggregate and are not re-created when current locality changes:

- Personal Money balance and ledger;
- Personal Money transaction IDs;
- productive-work receipts already earned;
- Work Capacity current/max;
- settled rest IDs;
- living arrears;
- financial/housing status;
- settled living-obligation IDs;
- employer treasury already held by the existing Player Economy aggregate;
- accrued wage settlement history.

A locality transition is not a fresh Player Economy constructor call.

The following are therefore forbidden merely because the locality changes:

- resetting Personal Money to zero;
- granting starter money again;
- re-running incumbent opening capital;
- resetting Work Capacity;
- deleting productive-work receipts;
- deleting arrears or living-obligation IDs;
- changing hardship state to `Stable` without a real economic recovery operation;
- importing another locality's employer treasury;
- copying another hero/world aggregate.

---

## 4. Local employer access is fail-closed

`evaluatePlayerEconomyLocalEmployerAccess(...)` is a read-only gate.

Existing Player Economy employment is locally usable only when all of these agree:

1. valid same-world locality context;
2. active Player Economy employment;
3. structurally valid employer assignment;
4. assignment World Instance = Player Economy World Instance;
5. assignment locality = authoritative current locality;
6. assignment employer company = existing Player Economy employment employer;
7. employer ledger owner = that same company.

Failure does not terminate employment, transfer the player, change money or replace the employer. It simply means the supplied local runtime has not proven that the existing employment is valid for work at that locality.

For presentation safety, employer treasury is exposed through the locality continuity projection only when this local assignment gate passes.

---

## 5. Local productive work

`recordLocalityScopedSettledDeliveryWork(...)` adds a locality/employer provenance gate around the already-merged real-delivery adapter.

A local work source must match:

- current World Instance;
- current locality;
- the authorized employer company;
- the authorized employer workplace;
- the exact settled `orderId`.

Only then does DT-03 delegate to:

`recordSettledUrbanDeliveryWork(...)`

The existing runtime adapter remains authoritative for:

- proof that the real delivery transition settled;
- order/cargo completion semantics;
- stable `runtime-delivery:<orderId>` provenance;
- cross-shift duplicate protection;
- productive minutes;
- Work Capacity consumption.

The locality adapter does not create an order, mission, demand signal, reward, parcel, employer, route class or capability.

### Cross-locality replay rule

One real order remains one productive-work receipt even if a caller later supplies another locality context.

Re-labeling the same `orderId` to another current locality cannot consume Work Capacity twice or create productive minutes for another wage.

---

## 6. Wages survive legitimate locality movement

An already-earned wage is not re-keyed to the player's current locality.

The canonical wage transaction remains:

`wage:<worldInstanceId>:<heroActorId>:<operatingDayIndex>:<shiftIndex>`

`settleEmployeeShiftWageAcrossLocalityContext(...)` validates that the caller still refers to the same World Instance, then delegates to the existing wage authority.

This is intentional: a player may perform legitimate work, move locality after the work, and only then cross the authoritative shift-settlement boundary. Moving must neither cancel already-earned wages nor pay them twice.

The employer debit and Personal Money credit remain conserved and exactly once.

Current locality may be returned as presentation context for the settlement call, but it is **not part of the wage transaction ID**.

---

## 7. Living costs / hardship and locality

Current Player Economy v1 owns only the generic `BasicLivingCost` / arrears / hardship lifecycle already merged.

It does not currently contain a governed locality-priced housing or local-obligation model.

Therefore #643 does not authorize DT-03, DT-02, missions, story or locality runtime to invent:

- a Brăila living-cost table;
- a Cluj living-cost table;
- per-country wages;
- relocation fees;
- housing deposits;
- locality taxes;
- fake local rewards or subsidies.

If a future authoritative housing/local-obligation domain supplies a legitimate locality-scoped source event, DT-03 may add a replay-safe economic operation in a separate governed slice. Until then, existing living obligations remain hero/world economic history and survive locality changes unchanged.

Hardship (`Insolvent`, `EmergencyHousing`, `Recovering`, `Stable`) never moves the hero or chooses a locality.

---

## 8. No Brăila assumptions

The locality integration contract contains no canonical Brăila ID, district ID, route ID or named employer location.

Tests use source-backed Brăila and Cluj-Napoca locality IDs only as two materially distinct context examples:

- Brăila: `dropi:locality:geonames:683902`;
- Cluj-Napoca: `dropi:locality:geonames:681290`.

Those IDs prove the adapter is not tied to one locality. They are test fixtures, not hardcoded runtime defaults.

The runtime contract is opaque to locality naming and works on stable authority-provided IDs.

---

## 9. DT-06 / DT-09 / DT-07 boundaries

### DT-06

Capability, qualification, equipment, vehicle, employer permission and route-compatible work eligibility remain DT-06 authority.

This slice does not duplicate #639/#644. A caller must still pass DT-06 work-access gates independently before work is offered/performed where required.

### DT-09

Mission/opportunity selection and citywide distribution remain DT-09 authority. DT-03 does not choose which local order should appear.

### DT-07

Production, supply, inventory and demand causes remain DT-07 authority. A locality ID alone never creates economic demand.

The correct composition is conceptually:

`legitimate local cause -> mission/order authority -> capability/work access -> local employer/work provenance -> real settled delivery -> DT-03 productive work -> later exact-once wage`

---

## 10. Persistence boundary

Merged #638 remains the only DT-03 persistence handoff.

This #643 runtime contract does **not** add locality identity to `PlayerEconomyState` or `GameSessionPlayerEconomyStatePort`.

DT-02 persists current locality through the locality/World Instance owner and persists Player Economy through #638 as separate authoritative families.

On restore/reconnect, the runtime composes them and re-evaluates local employer/work access. DT-02 must not copy `currentLocalityId` into the Player Economy ledger or infer Personal Money from locality data.

---

## 11. Player-visible status boundary

The Central Orchestrator separately requested a read-only player-status/economy presentation handoff for DT-10.

This locality contract does not implement UI. Its continuity projection is integration evidence for locality-safe economy only.

A later focused DT-03 presentation port may expose truthful employment, Personal Money, Work Capacity, current shift and hardship status to DT-10 without creating UI or mutation authority.

---

## 12. Deterministic acceptance coverage

The focused tests prove:

1. the same Player Economy state projected in Brăila and Cluj keeps Personal Money, Work Capacity, work history and arrears identical;
2. a stale Brăila employer assignment cannot expose employer treasury while current locality is Cluj;
3. another employer/company authority cannot be imported through locality context;
4. local work provenance must bind the exact settled order;
5. stale-locality work provenance fails without consuming Work Capacity or changing money;
6. one real delivery cannot become productive work twice by changing locality labels;
7. two earned deliveries can settle the same wage exactly once after the current locality changes, with money conserved;
8. cross-world locality context fails closed and cannot mutate the economic aggregate.

This proves the DT-03 invariants at the integration boundary. It does not claim that Cluj or every launch locality already has a complete playable urban runtime; that release truth belongs to #643 and its world/locality owners.

---

## Canonical locality-safe economy rule

**A locality may authorize where work belongs, but it never owns the hero's Personal Money history. A player may move; their economic history does not reset. Local employer/work provenance must match the authoritative current locality and exact work source, while existing world+hero replay identities continue to prevent duplicated work, wages, living obligations and recovery effects.**
