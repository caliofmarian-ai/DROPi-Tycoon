# Production, Inventory and Producer Logistics Runtime

Status: Phase-1 implementation foundation
Anchor: #419
Coordinates: #420, #417; future #493

## Purpose

This runtime slice establishes the first causal goods path in DROPi Tycoon:

`inputs -> production -> inventory -> demand -> logistics opportunity -> reservation -> custody -> delivery -> downstream settlement intent`.

The production and contract domains remain independent of Phaser presentation. A narrow adapter now materializes real producer opportunities into the merged systemic Mission Framework, while existing local deliveries remain legacy-compatible until a later governed runtime composition activates the new path in the player-facing loop.

## Reused canonical contracts

The implementation reuses the existing world model instead of creating an unrelated production vocabulary:

- `ProductGroup` remains the coarse product/category projection;
- `ExternalEconomicNodeKind` remains the productive-facility family vocabulary;
- the existing `ProductionRecipe` interface is specialized by `ExecutableProductionRecipe` with quantities, facility compatibility, capacity and authoritative processing time;
- World Clock C1 is the sole time boundary through `worldClockMinuteOrdinal`;
- country/region/locality identifiers are read-only location references on economic nodes.

`ExternalEconomicNode.inventoryIndex` remains a high-level world/map summary. It is not treated as authoritative stock. Exact quantities live in the new inventory domain.

## Product identity

The first catalog uses stable fictional/generic IDs:

- `product:raw-timber`;
- `product:wood-pulp`;
- `product:paper-packaging`.

These are simulation identities, not real-world brands or resource-location claims.

## Inventory invariants

Inventory is location-bound and capacity-bounded. Quantities are integer simulation units.

The domain rejects:

- NaN/non-integer/non-positive mutations;
- negative stock;
- removals that would consume reserved stock;
- additions above capacity;
- repeated mutation IDs;
- repeated reservation IDs.

Reservations remain recorded after consumption/release so a retry cannot silently recreate stock commitment.

## Production invariants

A production cycle is a pure deterministic settlement over a productive node, an executable recipe, a stable cycle ID and two authoritative World Clock states.

Production requires:

- matching World Instance;
- compatible facility kind;
- required facility throughput capacity;
- configured specialist/infrastructure indices;
- all unreserved inputs;
- enough elapsed C1 logical time;
- enough output inventory capacity.

Inputs are removed and outputs are added atomically from the caller's perspective. A completed cycle ID cannot produce output twice.

The canonical proof chain is:

`4 raw timber -> 3 wood pulp -> 2 paper packaging`.

This is a compact gameplay abstraction for validating stock conservation and throughput. It is not a claim about physical industrial yield.

## Supply and demand

Supply is derived from unreserved producer inventory. Demand is derived from a destination's target stock minus current stock.

Opportunity generation matches same-product supply and demand inside the same World Instance and bounds each movement by remaining supply, remaining demand and exposed transport capacity.

The returned `economicValueSignal` is a non-currency scarcity/volume signal. It intentionally does not mint money or promise profit. Monetary pricing/settlement remains a separate governed integration.

## Producer logistics contract

The first producer contract path is:

1. derive real producer supply;
2. derive real destination demand;
3. create a bounded logistics opportunity;
4. reserve producer inventory;
5. pickup consumes the reservation and moves the goods into explicit carrier custody;
6. delivery adds goods to destination inventory;
7. delivery emits one settlement intent naming goods payer/payee and logistics payer/payee.

The settlement intent contains no invented balance or reward. Agent 3's Personal Money/Work Capacity domain and existing/future Company Money authority remain separate.

Cancellation or failure before pickup releases the reservation exactly once. Once cargo is in custody, the termination helper rejects a synthetic reset because returning/disposing/re-routing that cargo must be represented by a later physical recovery flow rather than teleportation.

## Systemic Mission Framework integration

`game-web/src/trade/producerSystemicMission.ts` is the only production-owned bridge into the merged mission runtime. It does not create a second mission state machine.

A producer mission is materialized only when an existing `LogisticsOpportunity` can still create a real `ProducerLogisticsContract`. Contract creation reserves the real producer inventory first. If the opportunity is stale and stock can no longer be reserved, no systemic mission is materialized.

The resulting mission definition:

- uses `category: ProducerSupplyChain`;
- uses `source.kind: Systemic`;
- uses the real `opportunityId` as `causeRef`;
- requires the real contract to be `Reserved` before the mission becomes available;
- projects `InCustody` and `Delivered` contract state into stable Mission Framework signal events;
- projects `Cancelled` or `Failed` into the existing Mission Framework failure event;
- completes through the existing Mission Framework exactly-once receipt/consequence path;
- emits only an `EconomicSettlementReference` to the contract's stable `settlement-intent:<contractId>` identity.

No amount, wage, Company Money mutation, Personal Money mutation or guaranteed profit exists in the mission adapter. The real economic authority must consume the referenced settlement intent separately.

`reconcileProducerSystemicMission(...)` is intentionally a projection/reconciliation helper. A delivered contract projects the stable pickup event followed by the stable delivery event, allowing idempotent recovery if the mission runtime has already processed one transition. The canonical Mission Framework remains the sole owner of mission status, stages, processed event IDs, completion receipts and consequence intents.

This adapter is not yet wired into `GameWorldScene`, `PlayerSmartphone` or the current visible delivery loop. That composition belongs to a later orchestrated integration after capability/economy/save boundaries are ready.

## Authoritative mission reservation lifecycle

`game-web/src/trade/producerMissionReservationLifecycle.ts` composes the existing inventory, producer-contract and Mission Framework authorities without introducing a shadow mission engine or a second stock model.

The governed lifecycle is:

`real opportunity -> reserve producer stock -> accept existing systemic mission -> pickup/custody -> delivery result -> consumed reservation or safe release`.

Rules enforced by the lifecycle adapter:

- mission acceptance requires the real producer reservation to still be active;
- one reservation reduces `availableInventoryQuantity`, so another mission cannot claim the same stock;
- pickup consumes the existing reservation exactly once and moves the same quantity into explicit cargo custody;
- duplicate pickup/delivery events reuse existing idempotency and cannot consume or settle twice;
- cancellation before custody releases the reservation and does not move stock;
- failure before custody releases the reservation;
- failure after custody does **not** re-credit producer inventory or release consumed stock: the contract remains `InCustody` and reports `physical-recovery-required` so later recovery/reroute/return logic must represent the real cargo;
- delivery requires an active (or already-completed replay) producer mission and completes through the existing Mission Framework;
- the lifecycle creates no money and carries no settlement amount.

Stale reservation references are repaired only when the correction is physically unambiguous:

- a missing pre-custody reservation may be recreated only if the producer still has enough currently available stock;
- a `Reserved` contract pointing to an already-consumed reservation is advanced deterministically to `InCustody` without consuming stock again;
- an `InCustody`/`Delivered` contract with a still-active matching reservation consumes that reservation exactly once;
- a terminal `Cancelled`/`Failed` contract with a still-active matching reservation releases it;
- a missing or released reservation after cargo has moved is rejected rather than guessing whether stock should be removed or restored.

This lifecycle intentionally does not modify Save v2 (#566), PostgreSQL, Player Economy, UI, Android runtime or the Mission Framework implementation itself.

## Regional boundary

Economic nodes can carry stable:

- `worldInstanceId`;
- `countryId`;
- `administrativeRegionId`;
- `localityId`.

This slice does not modify Country Catalog/locality generation and does not infer natural-resource endowments from geography.

## Persistence and authority boundary

This PR is a pure local/domain foundation. It does not write Save v2, PostgreSQL, Railway or shared multiplayer state.

Before contested multiplayer use, B2/later authority work must persist and transactionally own:

- inventory quantities and reservations;
- completed production cycle IDs;
- contract/cargo custody states;
- settlement-intent consumption;
- authoritative world-clock progress.

The Mission Framework separately owns mission persistence/resume state. Production stores no shadow copy of mission progress.

The domain's stable IDs and idempotent transitions are designed to support that migration without changing causal rules.

## What remains before #493 resource-grounded global production

#493 should not begin by placing globally authoritative natural-resource output on top of this slice alone. The following are still required:

- governed resource/endowment datasets with provenance and World Instance baseline versioning;
- extraction/depletion/regeneration rules and units;
- facility-to-resource access rules and infrastructure requirements;
- workforce/qualification integration from the professions lane without duplicating it here;
- durable trusted persistence and transaction ownership for inventory/production/cargo;
- company/procurement money settlement integration without a second ledger;
- market pricing and transport-cost models;
- NPC continuity/recovery mechanisms for essential goods;
- economic instrumentation for production, inventories, shortages and regional trade.

Until those exist, productive nodes in this slice are fictional/generated economic actors used to prove causal local and regional flow, not real-world reserve claims.
