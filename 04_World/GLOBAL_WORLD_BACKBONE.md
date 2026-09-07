# DROPi Tycoon Global World Backbone

Status: Canonical execution bridge
Last Updated: 2026-09-08

## Purpose

This document ties the owner-approved global geography, active economy and evolving-world decisions into one implementation order.

## Canonical hierarchy

**Global -> Country -> First-order Administrative Region -> Representative Locality / External Economic Node -> Detailed Local Scene**

## Country representation

A normal country may expose up to nine representative locality nodes:

1. Capital
2. Urban North
3. Urban East
4. Urban South
5. Urban West
6. Rural/Small North-East
7. Rural/Small South-East
8. Rural/Small South-West
9. Rural/Small North-West

Fewer nodes are valid. Never invent settlements to fill slots.

## External economic geography

Factories, farms, steelworks, paper mills, chemical plants, mines, refineries, power plants, warehouses and other strategic productive sites can exist outside locality boundaries as independent nodes.

## Active economy

The world economy is driven by connected dependencies:

**Inputs -> Production -> Inventory -> Demand -> Contract/Order -> Logistics -> Marketplace/Industry -> Consumption/Investment -> New Demand**

Representative example:

**Chemicals -> Fertilizer -> Agriculture -> Food/Processing -> Local Marketplace -> Population/City Growth**

## Company evolution

A logistics company can progress through:

**Occasional producer jobs -> recurring delivery contracts -> strategic logistics partnership -> productive asset acquisition/ownership -> integrated production + logistics + trade.**

## Time and evolution

World time supports day/night, operating days, market cycles, seasons and long-term years.

Long-term simulation may change:

- population;
- specialist supply;
- migration/tourism;
- architecture and built density;
- production;
- infrastructure;
- localities/cities;
- national prosperity/decline;
- trade routes;
- country-state status through advanced fictional macro events.

## World Instances

New global economies may be launched periodically as separate persistent World Instances. Older worlds are not reset or deleted merely because a new world opens.

A World Instance is logical and may span many physical services/shards at scale.

## Runtime order

1. Pure world/economy/time contracts.
2. Global map geography dataset and renderer.
3. Country selection and drill-down.
4. Region and representative-node drill-down.
5. Existing detailed city becomes one locality destination.
6. Smartphone GPS uses the same hierarchy.
7. Global/national/regional transport flows.
8. Production nodes and active supply-demand.
9. Time/day-night and market cycles.
10. Demographic, urban, national and epoch evolution.

## Asset rule

Use existing approved visual assets whenever suitable. Generate new art only when a concrete runtime requirement proves the library insufficient.

## Canonical references

- `00_Project/UNIVERSE_DESIGN.md`
- `00_Project/BUSINESS_DESIGN.md`
- `00_Project/LOGISTICS_DESIGN.md`
- `02_Economy/PRODUCTION_AND_TRADE.md`
- `04_World/MAP.md`
- `04_World/WORLD.md`
- `06_Technical/WORLD_INSTANCES.md`

## Canonical Rule

The global world is the primary spatial/economic backbone of DROPi Tycoon. Local delivery gameplay is one high-detail layer inside that larger persistent world, not a separate game.