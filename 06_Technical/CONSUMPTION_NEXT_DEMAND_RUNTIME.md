# Consumption, Output, Waste and Next-Demand Runtime

## Scope

This DT-07 slice extends the merged production/logistics chain after successful delivery.

Canonical causal path:

`delivery / real stock -> governed consumption or use -> output / byproduct / waste -> finite inventory mutation -> real replenishment demand -> logistics opportunity -> existing systemic mission bridge`

The runtime is domain-first and does not add UI, Save-v2 ownership, PostgreSQL ownership, a money ledger, or a second mission engine.

## Authority boundary

`game-web/src/production/consumptionLifecycle.ts` owns only the deterministic use/consumption transition for an economic node.

It reuses:

- authoritative finite `InventoryState` mutations from `inventory.ts`;
- reservation-aware available-stock checks from the merged producer-logistics domain;
- `deriveInventoryDemand(...)` and `deriveLogisticsOpportunities(...)` for downstream supply/demand;
- the existing `materializeProducerSystemicMission(...)` bridge when a generated logistics opportunity becomes playable work.

It does not settle currency. Any later logistics settlement remains an external ledger concern exactly as in the merged producer contract runtime.

## Governed process definition

A `GovernedConsumptionProcess` declares explicit simulation quantities for:

- consumed inputs;
- primary outputs;
- byproducts;
- waste;
- replenishment targets.

Output, byproduct and waste quantities are never sampled randomly and are never inferred as free resources. A replenishment target may reference only a product that the same process actually consumes. This prevents unrelated demand from being invented by the use layer.

## Finite inventory and atomicity

Before any mutation, the runtime verifies:

1. the process instance has not already completed;
2. the node owns the inventory;
3. all required input is available and unreserved;
4. the final inventory total after consumption/output/byproduct/waste fits the finite capacity;
5. transport capacity input is valid.

Only after all prechecks pass are deterministic inventory mutations applied. Input removals happen before additions, and every mutation receives a stable process-scoped ID.

If any precheck fails, the original lifecycle state is returned unchanged.

## Reservation and custody compatibility

Consumption uses `availableInventoryQuantity(...)`, not raw stock quantity. Active reservations therefore remain unavailable to local use.

The merged #598 delivery lifecycle remains authoritative for cargo custody:

- producer reservation becomes consumed at pickup;
- cargo moves into carrier custody;
- successful delivery adds destination inventory exactly once;
- only then can a separate consumption process use destination stock.

Consumption never releases or recreates the source reservation and never re-credits cargo already moved.

## Idempotency

`ConsumptionLifecycleState.completedProcessIds` makes a repeated completion/use call a no-op.

A duplicate process call:

- does not consume input twice;
- does not emit output twice;
- does not emit byproduct/waste twice;
- does not recreate downstream demand or logistics opportunities.

`emittedOpportunityIds` records the exact opportunities emitted by completed processes. Demand IDs include the process-instance identity, so a later genuinely distinct consumption cycle may create a new causal replenishment opportunity while replay of the same cycle cannot.

## Next demand

Replenishment demand is calculated after the real inventory transition from the resulting stock level and a governed target stock level.

Example causal logic:

- node has 4 packaging units;
- governed use consumes 2;
- resulting packaging stock is 2;
- governed target remains 4;
- resulting demand is exactly 2.

If matching upstream unreserved supply exists in the same World Instance, the existing regional supply/demand matcher may emit a logistics opportunity. That opportunity is already compatible with the merged systemic producer mission materializer; no duplicate mission authority is introduced.

## Deliberately not implemented

This slice does not add:

- global resource/endowment geography (#493);
- real-world reserve claims;
- pricing or monetary settlement;
- Save-v2 serialization (#566 ownership remains external);
- PostgreSQL persistence;
- UI or Android presentation;
- random yield/resource generation;
- a second mission engine.

Durable persistence/materialization of this runtime remains a later authority integration once the owning persistence lane exposes the appropriate contract.
