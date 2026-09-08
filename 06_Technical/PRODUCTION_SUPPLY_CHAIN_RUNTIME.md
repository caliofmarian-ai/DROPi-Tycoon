# Production, Inventory and Producer Logistics Runtime

Status: Phase-1 implementation foundation
Anchor: #419
Coordinates: #420, #417; future #493

## Purpose

This runtime slice establishes the first causal goods path in DROPi Tycoon:

`inputs -> production -> inventory -> demand -> logistics opportunity -> reservation -> custody -> delivery -> downstream settlement intent`.

It is deliberately domain-first and dormant from the current Phaser mission loop. Existing local deliveries therefore remain legacy-compatible while new economic work can be migrated onto real stock state incrementally.

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
