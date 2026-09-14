# Governed Resource Extraction Runtime

Status: DT-07 first resource-grounding slice  
Anchor: #493  
Coordinates: #419 #651 #420 #643

## Purpose

This slice extends the existing DT-07 production/supply authority upstream without creating a second economy:

`governed source evidence -> explicit World Instance simulation allocation -> extraction/harvest -> existing bounded inventory -> existing supply/deficit -> existing systemic logistics job -> custody/delivery -> existing production -> stored output -> locality-scoped completed-production fact`.

The final completed-production fact is an economic cause that DT-18 may consume as settlement-development evidence. DT-07 does not decide a settlement tier, population change, housing growth, road construction or city geometry.

## Existing authorities reused

This implementation composes the already-merged authorities instead of replacing them:

- `game-web/src/production/production.ts` owns productive nodes, processing recipes and completed production cycle IDs;
- `game-web/src/inventory/inventory.ts` owns exact bounded inventory and idempotent stock mutation;
- `game-web/src/trade/regionalSupplyDemand.ts` derives real supply, deficit and bounded logistics opportunities;
- `game-web/src/trade/producerSystemicMission.ts` materializes real producer opportunities through the existing Mission Framework;
- `game-web/src/trade/producerLogisticsContract.ts` owns reservation, custody, delivery and external monetary-settlement intent;
- World Clock C1 remains the sole logical time arithmetic through `worldClockMinuteOrdinal`.

No second inventory, mission engine, money ledger, clock or settlement-evolution engine is introduced.

## Source evidence is not gameplay stock

`GovernedResourceEvidence` records a source/provenance handoff with:

- stable evidence and resource identities;
- resource category;
- occurrence state (`Present`, `Absent`, `Unknown`);
- geographic resolution;
- source authority;
- source dataset version;
- source record reference;
- provenance reference;
- optional measurement semantic/value/unit.

A measurement may represent reserve/recoverable quantity, annual extraction/production, theoretical potential or installed productive capacity. These semantics are deliberately distinct.

The runtime never converts that measurement directly into inventory or assumes the measurement unit equals a gameplay unit.

## Geographic precision is fail-closed

Supported source resolutions are:

- `Country`;
- `AdministrativeRegion`;
- `Locality`;
- `Site`.

A country-level source cannot carry a fabricated region/locality/site precision. A regional source may only authorize extraction by a productive node in that same country/region. Locality-scoped evidence also requires the same locality. Site-scoped evidence additionally requires the exact governed `resourceAccessRef`.

This prevents country totals or broad occurrence data from being silently sprayed across arbitrary facilities.

No factual country/resource table is added by this slice. The deterministic tests use explicit test-only identities and make no real-world resource claim.

## World Instance simulation allocation

Source-backed evidence seeds a separate `ResourceSimulationState` only through an explicit:

- `worldInstanceId`;
- `worldBaselineVersion`;
- `allocationPolicyId`;
- integer `initialSimulationUnits`.

`availableSimulationUnits` are fictional World Instance balancing units. Their meaning is not the source measurement unit.

A positive allocation is forbidden when governed occurrence is `Absent` or `Unknown`.

The allocation policy itself is supplied by a governed world/economy baseline owner. This slice does not invent a formula that turns a real reserve, annual-output or theoretical-potential number into simulation stock.

## Extraction / harvest settlement

`ResourceExtractionProcess` is data-driven and defines:

- process identity;
- resource category;
- required simulation resource units;
- output product and quantity;
- compatible existing productive-node kinds;
- required throughput capacity;
- logical processing minutes.

`settleResourceExtraction(...)` requires:

- governed `Present` occurrence;
- matching World Instance;
- node location covered by the source evidence resolution;
- exact site access reference for site evidence;
- matching resource category;
- compatible existing productive-node kind;
- sufficient existing production capacity;
- sufficient remaining simulation resource units;
- sufficient C1 logical time;
- sufficient existing inventory capacity.

A successful extraction consumes simulation resource units and adds the output to the productive node's existing inventory atomically from the caller's perspective.

Every successful extraction emits one stable `ResourceExtractionReceipt` containing the resource evidence ID, allocation policy ID, productive node, product, consumed simulation units, output units and authoritative completion minute.

## Replay and depletion

`extractionId` is the idempotency identity.

Replaying a completed extraction returns the existing receipt without consuming resource or adding inventory again.

If the inventory mutation ID exists but the resource state lacks the corresponding extraction receipt, the operation fails closed rather than guessing whether to consume resource again. This is an integrity guard for future DT-02 persistence composition.

The first implementation supports finite depletion through `availableSimulationUnits`. Regeneration is intentionally not implemented: regeneration requires a separately governed policy and must not be assumed for every resource family.

## Specialist / infrastructure authority boundary

This slice intentionally does **not** use `ProductiveNodeState.specialistIndex` or `infrastructureIndex` as proof that a legitimate DT-06 specialist, qualification, Work Capacity fact, DT-20 physical facility or company capability exists.

The extraction gate consumes only the existing productive node kind/capacity plus resource geography and time. Future specialist/facility requirements must consume stable facts from DT-06/DT-20 when the Central Orchestrator assigns that integration.

Production-model tuning indices remain tuning/proxy data only.

## Proof chain

The deterministic end-to-end test constructs a source-backed test fixture and proves:

1. governed present-occurrence evidence creates a bounded World Instance resource allocation only through an explicit allocation policy;
2. a compatible Forestry node extracts finite simulation units into the existing `product:raw-timber` inventory;
3. duplicate extraction cannot mint another output;
4. existing DT-07 supply/deficit logic creates a logistics opportunity because real timber stock and a real destination deficit exist;
5. the existing systemic Mission Framework adapter materializes the producer job and reserves the same finite stock;
6. existing custody/delivery physically moves the stock and emits only `ExternalLedgerRequired` for money authority;
7. the existing PaperMill recipe consumes the delivered timber and creates stored wood-pulp output;
8. the productive node retains the locality-scoped completed production cycle ID that a downstream DT-18 authority may consume as economic evidence.

The test does not claim the fixture represents a real forest, real reserve, real company or real industrial yield.

## Persistence / multiplayer boundary

No Save v2, Save v3, PostgreSQL, Railway or server writer is activated.

DT-02 remains the persistence single-writer owner. A future persistence handoff must preserve at least:

- resource state/world/baseline/allocation identity;
- available simulation units;
- extraction receipts/idempotency;
- existing inventory mutation/reservation state;
- existing production cycle IDs and contract/custody state.

For contested shared worlds, DT-17 must establish authenticated server authority before clients can authoritatively submit or mutate resource/extraction state.

## Relationship to #651

DT-07 provides causal economic facts only.

A completed extraction or production cycle does not directly change `LATENT`, `RURAL_POINT`, `VILLAGE`, `TOWN` or any other settlement-development state. DT-18 owns evidence aggregation, structural tick rules and settlement transitions.

The safe boundary is:

`DT-07 resource/production fact -> DT-18 evidence consumer -> DT-18 structural evaluation`.

The open DT-18 implementation branch is not imported as canonical by this slice.

## Known limitations

This is not full #493 completion.

Still required in later orchestrated slices:

- real governed resource datasets and legal/provenance qualification;
- versioned allocation/transform policies for actual source families;
- resource-family-specific depletion/regeneration semantics where appropriate;
- DT-06 workforce/qualification integration;
- DT-20 physical facility/infrastructure capability integration;
- DT-02 durable persistence;
- DT-03 procurement/payment/pricing settlement;
- multimodal transport-cost/capacity integration;
- aggregate distant-world production simulation;
- essential-supply recovery/substitution policy;
- more than one source family and cross-country/locality release proof.

## Canonical rule

**Source evidence authorizes where a resource may exist; an explicit governed World Instance allocation determines fictional simulation units; extraction creates real bounded inventory; logistics and production consume that inventory through the existing authorities; settlement evolution remains a downstream DT-18 decision.**
