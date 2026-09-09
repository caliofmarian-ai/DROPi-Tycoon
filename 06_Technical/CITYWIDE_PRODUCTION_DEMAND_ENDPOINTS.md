# Citywide Production / Demand Endpoint Contract

Status: DT-07 production/supply support for #615, coordinated with #614.

## Purpose

Citywide delivery distribution must be downstream of real economic causes. DT-07 therefore exposes stable semantic origin/destination identity for existing supply and demand without creating work merely to populate the map.

Canonical path:

`real inventory state -> real supply/deficit -> governed economic node location -> governed world endpoint validation -> logistics opportunity -> mission-side citywide selection`

This contract does not select missions, classify route distance, create map geometry or settle money.

## Economic node city identity

`EconomicNodeLocation` may carry an optional `cityEndpoint` containing only stable semantic references:

- `routeLabel`
- `districtId`
- optional `areaId`
- `locationRef`
- `roadRef`

Coordinates are intentionally absent. The citywide adapter validates these references against the current governed `WORLD_ROUTE_POINTS` catalogue before exposing them. A stale or fictional district/building/road relabel fails closed.

`deriveSupplyOffer(...)` and `deriveInventoryDemand(...)` copy the nested city endpoint by value so later caller mutation cannot rewrite an already-derived economic snapshot.

## Brăila / #614 scale coordination

`governedBrailaEconomicCityEndpointRef(...)` resolves the existing stable route catalogue rather than copying x/y coordinates. Current Brăila identities use the route's existing:

- `zoneId` as district identity;
- route label as the current fine-grained area identity;
- building ID as location ref;
- road ID as road ref.

Therefore moving buildings, widening the playable city or changing route distances under #614 does not by itself rewrite the economic cause.

#614 remains authoritative for geometry and route classification (`local`, `adjacent-district`, `cross-city`). If #614 later changes a semantic identity rather than only geometry, the economic node binding must be updated to the new governed identity; stale bindings are rejected rather than guessed.

## Real-cause gate

A citywide supply endpoint requires positive currently available stock.

A citywide demand endpoint requires a positive current deficit.

A geographically bound logistics opportunity must still match the exact authoritative:

- supply ID;
- demand ID;
- source node;
- destination node;
- product;
- world instance;
- quantity bounded by current available supply and current required demand.

The adapter cannot create a supply offer, demand requirement or logistics opportunity.

## Outer / industrial / logistics areas

There is no HQ/center preference or geographic quota in DT-07. Any existing governed pickup/delivery endpoint can participate when a real supply/demand cause owns that location.

This includes existing outer/industrial/logistics-capable route identities such as storage, waterfront, company/station and garden/peripheral surfaces. Their presence alone does not generate work.

## Mission-side handoff

`citywideEconomicEndpointIdentity(...)` returns only:

- `endpointId`
- `districtId`
- optional `areaId`

This is intentionally the same structural information required by the DT-09 #615 citywide distribution port, without importing or owning that mission implementation. `endpointId` remains the real economic source/destination node ID.

DT-09 remains responsible for candidate selection/diversity and requires existing order/DeliveryMission authority. DT-07 supplies only truthful economic causes and their governed spatial identities.

## Service demand boundary

The reusable `EconomicNodeLocation.cityEndpoint` contract can also be attached by a future authoritative merchant/service domain. This slice does not fabricate service demand where no real service-demand authority exists. Its executable binding is limited to existing `SupplyOffer`, `DemandRequirement` and `LogisticsOpportunity` causes.

## Reservation / custody / consumption invariants

This adapter is read-only with respect to inventory and contract lifecycle. Existing #598/#608 behavior remains authoritative:

- reservations remain finite and exactly once;
- pickup consumes the reservation once;
- custody is not rolled back synthetically;
- delivery is exactly once;
- consumption/replenishment stays cause-driven;
- no money is minted.

The geographic binding wraps the existing `LogisticsOpportunity`; it does not replace or mutate reservation, custody, delivery, consumption or settlement state.

## Deterministic acceptance coverage

`game-web/tests/citywide-production-demand-endpoints.test.ts` proves:

- real industrial/peripheral supply and demand bind to stable semantic refs;
- bound endpoint objects contain no x/y coordinates;
- nested location refs are snapshot-copied;
- zero supply and zero deficit fail closed;
- pickup/delivery role swaps fail closed;
- fictional district relabeling fails closed;
- outer/waterfront/peripheral causes remain deterministic without center quotas;
- stale/relabelled opportunities cannot change authoritative source/destination identity;
- the existing systemic-mission reservation authority still receives the unchanged real opportunity and reserves stock normally.

## Non-ownership

DT-07 does not own in this slice:

- #614 playable-city geometry or distance thresholds;
- #615 mission selection/materialization policy;
- Save v2 / PostgreSQL;
- Personal Money / Company Money;
- capability or transport eligibility;
- UI / Android presentation;
- Country Catalog;
- a second mission engine.
