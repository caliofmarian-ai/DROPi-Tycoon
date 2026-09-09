# Document Information

Document: SETTLEMENT_EVOLUTION.md
Project: DROPi Tycoon
Version: 1.0.0
Status: Canonical — World Specialization
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-09-09

---

# Economy-Driven Settlement Evolution

## Purpose

This document specializes `04_World/WORLD.md`, `04_World/MAP.md`, `00_Project/GLOBAL_WORLD_ECONOMY_CANON.md` and issue #651.

It defines how a governed locality can exist globally before it becomes an urban city, and how company/player/world investment can visibly transform it over time.

---

# 1. Stable Identity, Mutable Development

Every governed locality has a stable identity independent of its current settlement class.

Development state is mutable World Instance state.

Conceptual states:

`LATENT / UNDEVELOPED`
`-> RURAL_POINT`
`-> HAMLET`
`-> VILLAGE`
`-> SMALL_TOWN`
`-> TOWN`
`-> CITY`
`-> LARGE_CITY / METROPOLITAN`

Exact thresholds and enum names remain implementation/balance data.

A locality can decline as well as grow.

---

# 2. Separate State Axes

Do not conflate data/content readiness with urban development.

## Data/readiness

`CATALOGED -> SOURCE_READY -> PLAYABLE_CONTRACT_READY -> RELEASE_VERIFIED`

## Settlement development

`LATENT -> RURAL_POINT -> HAMLET -> VILLAGE -> TOWN -> CITY -> LARGE_CITY`

## Runtime activation

A third independent runtime axis may describe whether the locality is currently:

- summarized/inactive;
- strategically visible;
- locally streamable;
- actively rendered/simulated.

A locality may therefore be `RELEASE_VERIFIED + HAMLET + summarized` while no player is present.

---

# 3. Initial World Seeding

The world baseline may seed known localities with different starting development states based on governed product design and source-backed context.

Important existing real cities may begin as already-developed settlements in a new World Instance.

Other governed locality identities may begin as rural/small or latent development opportunities.

This is a game-world baseline, not a claim that a real city is literally a hamlet in current reality. When using a known real locality name, the game must distinguish the source-backed baseline from fictional World Instance evolution.

---

# 4. Growth Drivers

Development can be supported by combinations of:

- resource extraction;
- agriculture/forestry/fisheries;
- manufacturing/processing;
- warehousing/logistics;
- road/rail/port/airport access;
- utilities;
- jobs and wages;
- company investment;
- housing;
- shops/services;
- schools/training/research;
- healthcare/public-service capacity where modeled;
- tourism;
- regional/national investment;
- trade connectivity;
- migration;
- population retention;
- construction materials;
- specialist supply.

No single variable automatically upgrades a settlement.

---

# 5. Growth Evidence

A settlement-development transition should be supported by explicit evidence/reason codes from authoritative domains.

Examples:

- `EMPLOYMENT_CAPACITY_INCREASED`;
- `HOUSING_CAPACITY_INCREASED`;
- `PRIMARY_ROAD_CONNECTED`;
- `INDUSTRIAL_NODE_ACTIVATED`;
- `FARM_CLUSTER_EXPANDED`;
- `UTILITY_CAPACITY_AVAILABLE`;
- `SPECIALIST_CAPACITY_AVAILABLE`;
- `SCHOOL_OR_TRAINING_CAPACITY_ADDED`;
- `MARKET_DEMAND_SUSTAINED`;
- `TRADE_FLOW_SUSTAINED`;
- `POPULATION_INFLOW_SUSTAINED`.

These names are illustrative; implementation must use one governed contract.

---

# 6. Urbanized Footprint

Settlement class and urbanized footprint are related but not identical.

The urbanized footprint is the portion of governed locality/world space containing active built environment and supporting infrastructure.

Growth may add:

- streets;
- service roads;
- housing;
- workshops;
- farms;
- factories;
- warehouses;
- shops;
- schools;
- utilities;
- public/service facilities;
- transport terminals;
- districts/areas once scale justifies them.

Undeveloped surrounding land remains part of the world rather than being filled with fake city blocks.

---

# 7. Global 10x Scale

All newly created or expanded settlement geometry consumes the reusable global playable-distance scale contract.

`CITY_PLAYABLE_DISTANCE_SCALE_BASELINE = 10`

The baseline applies to playable positional separation, not indiscriminate object enlargement.

A village remains compact because it has fewer/shorter developed networks. A metropolis becomes vast because it has a much larger governed network and urbanized footprint.

Economic growth must not create a second differently scaled city system.

---

# 8. Local Visual Identity During Growth

New construction follows the canonical DROPi art language while remaining locally authentic.

Growth must select from governed regional/local archetypes and locality-specific variants appropriate to:

- climate;
- architecture;
- construction materials;
- street pattern;
- industrial/agricultural character;
- infrastructure;
- local visual references.

A newly built district in Dublin should not look like copied Brăila assets; a Romanian village should not become a generic North American suburb unless the simulation explicitly and plausibly creates such stylistic influence.

World Instance evolution may introduce new architecture over time, but it must evolve from governed construction choices and art families.

---

# 9. Economic Feedback Loop

Settlement growth creates new demand.

Examples:

- more residents -> food/housing/transport demand;
- new factory -> input/maintenance/logistics demand;
- new school -> teachers, supplies, housing and transport demand;
- new warehouse -> freight, workers and equipment demand;
- new road -> wider market access and new commercial sites;
- new port/rail terminal -> trade volume and specialist demand.

The resulting demand can support additional companies and further development.

---

# 10. Player and Company Construction

Players/groups/companies may stimulate growth through legitimate projects.

A project can require:

- site/land access;
- finance;
- materials;
- specialist workforce;
- qualifications;
- machinery/equipment;
- utilities;
- transport/logistics;
- time;
- operating plan/capacity.

Construction must consume real resources or governed aggregated equivalents and create persistent assets/state.

Money alone cannot spawn a road, factory or city.

---

# 11. External Economic Node to Settlement

A productive site can exist before a settlement.

Example:

`resource deposit`
`-> extraction site`
`-> access road`
`-> workers`
`-> temporary housing`
`-> service demand`
`-> permanent housing`
`-> shops/services`
`-> training need`
`-> village/town`

This is one way a new settlement can emerge without arbitrary placement.

---

# 12. Education and Specialist Effects

Education capacity can accelerate or enable development.

A training center/university/research facility may:

- create direct employment;
- attract students and specialists;
- supply qualified workers;
- support advanced companies;
- create housing/service demand;
- enable research/technology;
- increase local economic resilience.

A settlement without specialist capacity may depend on commuting, migration, external recruitment or company sponsorship.

---

# 13. Decline

Development may reverse when causal support disappears.

Possible causes:

- employer closure;
- resource depletion;
- route loss;
- infrastructure failure;
- housing/service shortage;
- prolonged unemployment;
- company relocation;
- population outflow;
- disaster/event disruption;
- loss of specialist capacity.

Visible consequences may include:

- closed facilities;
- reduced traffic;
- abandoned/underused buildings;
- lower service capacity;
- lower demand;
- deferred maintenance;
- population decline.

Recovery remains possible through new opportunity/investment/connectivity.

---

# 14. Missions and Opportunities

Settlement state affects legitimate work.

A rural point may offer:

- farm work;
- construction;
- resource-site logistics;
- local service deliveries;
- road/infrastructure projects.

A growing town may add:

- merchants;
- warehousing;
- maintenance;
- schools/services;
- industrial work;
- regional delivery.

A city may support much broader specialization and cross-city logistics.

Do not expose city-scale mission density where the settlement economy cannot support it.

---

# 15. Persistence and Determinism

Settlement evolution must be:

- keyed by stable locality ID;
- persisted;
- replay-safe/idempotent where authoritative events apply;
- independent of frame rate;
- governed by World Clock/economic cycles;
- version-aware;
- compatible with server/shared authority later;
- restorable without rerolling a different city after reload.

The same authoritative settlement state must feed map presentation, local runtime and economic opportunity.

---

# 16. Performance

Inactive settlements remain summarized.

Only relevant localities/areas are streamed/rendered at detailed frequency.

Large settlement growth must use:

- chunks/sectors;
- LOD;
- culling;
- bounded ambient actors;
- deterministic summarized catch-up;
- data streaming.

World expansion must not require every settlement to be resident on Android simultaneously.

---

# 17. Acceptance Proof

The first complete implementation must prove:

1. one governed low-tier locality exists without a fake mature city;
2. a legitimate economic investment creates jobs/infrastructure;
3. population/specialist/service state responds;
4. urbanized geometry expands using the global 10x scale;
5. new work/trade opportunities appear as consequences;
6. save/reload preserves the exact evolved state;
7. decline/recovery semantics remain possible;
8. the same architecture works outside Brăila.

---

# Canonical Rule

**Localities are persistent identities, not fixed city props. Economy, infrastructure, people, education and trade determine how much of a place becomes urbanized; players and companies can materially accelerate or redirect that development; and the resulting settlement creates new needs and opportunities that feed the same global economy.**

---

End of Document
