# R8 — Authoritative Time and Offline Settlement Working Model

Status: **RESEARCH WORKING PAPER — NON-CANONICAL**  
Parent: #423  
Track: #432

## Purpose

Define how one persistent multiplayer world can have meaningful days, nights, work shifts, production, consumption, contracts, seasons, years and offline consequences without simulating every inactive entity every frame or punishing players with impossible real-time obligations.

---

# 1. World time is authoritative economic state

Time is not a client visual effect.

When multiplayer economy is active, the trusted world authority owns:

- current World Instance time;
- calendar/day/night state;
- economic cycle IDs;
- contract deadlines;
- payroll/consumption settlement windows;
- production completion;
- season/year progression;
- offline catch-up interval.

Clients render and interact with authoritative time but cannot set it.

---

# 2. Nested time scales

Not every system should update at the same frequency.

Candidate layers:

## Immediate / frame layer
Used for:
- movement;
- controls;
- local visual feedback;
- collision/interaction;
- active loading/unloading presentation.

## Operational layer
Used for:
- active delivery travel;
- work tasks;
- vehicle fuel/charge use;
- Work Capacity consumption;
- facility active operations when nearby/important.

## Shift / work-session layer
Used for:
- attendance/work package;
- human employment output;
- wage eligibility;
- breaks/overtime;
- shift closure.

## Daily layer
Used for:
- baseline hero/household consumption;
- recurring living obligations;
- selected payroll/accounting;
- utility demand summaries;
- shop/restocking target updates;
- maintenance accumulation;
- waste generation summaries.

## Market / production layer
Used for:
- production lots;
- inventory planning;
- contract schedules;
- price/order-book updates;
- regional logistics demand.

## Seasonal layer
Used for:
- agriculture;
- tourism;
- weather-pattern demand;
- selected dividend/business cycles;
- broader price/demand changes.

## Structural/year layer
Used for:
- demographics;
- major construction/development;
- city growth/decline;
- national indicators;
- long-term migration;
- slow technology/infrastructure transitions.

---

# 3. Game time vs real time

The game needs time compression so economic evolution is visible during normal play.

Research must select a ratio later, but the principle is:

- one game day is shorter than one real day;
- enough active time exists to perform meaningful work and planning;
- days/seasons advance often enough for costs, agriculture and markets to matter;
- a player should not need years of real time to see city/country evolution.

The ratio must be versioned balancing data and should not be hardcoded into domain semantics.

---

# 4. Day/night cycle

Day/night has real consequences where relevant:

- businesses opening/closing schedules;
- traffic profiles;
- work shifts;
- residential/commercial demand patterns;
- energy demand;
- certain delivery windows;
- rest/recovery;
- nightlife/tourism/service patterns;
- visibility/presentation.

Not every facility needs strict closing hours; logistics and industry may operate in shifts 24/7 when staffed/capable.

---

# 5. Human work shift

A starting employee is paid for governed work, not continuous presence.

A shift can include:

```text
start eligibility
-> attendance/start
-> assigned work package
-> productive activity
-> breaks/rest
-> completion/closure
-> performance record
-> wage settlement
```

If the human logs off mid-shift, the employment design must define outcomes such as pause, handoff, partial credit or failure depending on job type. It cannot assume players remain online for long mandatory sessions.

---

# 6. Work Capacity and rest

Personal Work Capacity changes on operational time while active and can also recover through rest/offline intervals.

Key rule:

**offline time may restore physical work capacity but does not stop economic obligations.**

Therefore a player returning after inactivity may be rested but financially poorer or insolvent.

This separates biological recovery from money/cash-flow survival.

---

# 7. Daily personal consumption

The owner's requirement is that the hero consumes food, water and money over time, including inactivity.

Research baseline:

- recurring baseline consumption settles by economic day/cycle;
- active work may increase consumption/work-capacity needs;
- absence does not grant free stasis;
- consumption is aggregated enough to avoid excessive manual eating/drinking clicks;
- shortages/poverty have causal effects on living/work state;
- exact quantities and severity belong to balancing.

---

# 8. Offline financial obligations

Offline settlement can include only obligations that legitimately continue with time.

Examples:

- rent;
- subscriptions/services;
- baseline living consumption;
- storage/property costs;
- asset maintenance accrual;
- company fixed costs;
- contract schedules;
- debt service only if debt exists later.

Use-dependent costs do not continue without use:

- driving fuel;
- road tolls;
- active travel tickets;
- work consumables tied to actual tasks.

---

# 9. Offline income

Starting employment wages require actual governed work output and do not accumulate merely because the player is away.

Other income can occur offline only when its underlying economy genuinely operates:

- dividends from profitable companies;
- rent from property if that system exists and tenants/payments are real;
- company profit attributable to delegated/NPC/human operations;
- investment value changes;
- contract settlement already completed by authorized actors.

No generic `offline income` multiplier should exist.

---

# 10. Catch-up settlement

A player returning after absence should not force the server/client to replay every missed minute.

Candidate catch-up flow:

```text
lastSettledWorldTime
-> currentWorldTime
-> partition elapsed interval into authoritative cycle boundaries
-> apply summarized deterministic production/consumption/obligation rules
-> resolve contract/employment/company state transitions
-> stop/transition at insolvency or capacity boundaries when necessary
-> produce compact catch-up event summary
-> persist new settled revision/time
```

Catch-up must be idempotent so reconnect/retry cannot duplicate wages, costs, production or dividends.

---

# 11. Insolvency stop conditions

Offline settlement should not create absurd infinite negative balances.

When an actor cannot meet an obligation, the system transitions state rather than endlessly subtracting money.

Examples:

```text
rent cannot be paid
-> arrears/grace/default state
-> eventual lease termination/lower housing state
-> no further normal rent once lease is terminated
```

```text
company cannot pay fixed costs
-> arrears/service suspension
-> degraded operation
-> restructuring/insolvency state
```

This bounds catch-up while retaining consequences.

---

# 12. Production while offline

Factories/farms/companies can continue production only when all required inputs/capacities remain available across the elapsed interval.

Production catch-up must stop or reduce output when:

- input inventory runs out;
- storage fills;
- labor capacity disappears;
- energy/water fails;
- maintenance state blocks operation;
- contract/order limits are met.

No facility should generate unlimited output while the owner is absent merely because a timer elapsed.

---

# 13. NPC/human workforce offline behavior

A human employee who is offline contributes no magical manual labor unless a separate asynchronous job has explicitly reserved/proven work output.

Companies may remain productive through:

- NPC workers;
- other online humans;
- automation;
- preconfigured operations;
- delegated managers/dispatchers.

This makes staffing/resilience a company strategy.

---

# 14. Contract time

Contracts need explicit time semantics:

- start time;
- deadline/window;
- recurrence;
- grace/late state;
- cancellation/default conditions;
- settlement time;
- timezone-independent authoritative representation.

Player-facing UI localizes time, but the world contract uses one authoritative world timeline.

---

# 15. Asynchronous fairness

A persistent economy must not require all counterparties to be online simultaneously.

Systems should favor:

- posted orders;
- auctions/tenders with windows;
- scheduled contracts;
- persistent marketplace listings;
- delegated company authority;
- queued production/logistics planning;
- notifications/catch-up summaries.

Synchronous presence can create bonuses/social moments but should not be a prerequisite for ordinary economic life.

---

# 16. Construction and development time

Buildings, factories, infrastructure and city growth should consume real game time plus resources/labor.

Conceptual construction:

```text
approved project
+ land/site
+ materials
+ workers/equipment
+ money
+ time
-> completed capacity
```

Construction duration is a strategic cost and can create logistics demand during the build.

---

# 17. Seasons

Seasons can influence:

- agricultural yields/crop cycles;
- tourism;
- heating/cooling/energy demand;
- weather-related logistics;
- selected goods consumption;
- construction efficiency;
- transport reliability.

Season should not arbitrarily overwrite prices; it changes underlying supply/demand/capacity drivers.

---

# 18. Years and structural evolution

Slow cycles may update:

- population growth/decline;
- housing demand;
- migration;
- specialist generation;
- industrial openings/closures;
- city expansion;
- national prosperity indicators;
- infrastructure aging;
- long-term environmental/resource state.

A year is therefore a structural simulation boundary, not just a calendar label.

---

# 19. New World Instance cadence

New worlds can launch periodically, but cadence should depend on:

- active population;
- server/world maturity;
- economy saturation/concentration;
- progression speed;
- demand for fresh starts;
- operational capacity.

No current research fixes monthly/seasonal/annual cadence yet.

Old worlds remain persistent unless a separately approved archival policy exists.

---

# 20. Account vs world time

Account identity exists outside any one world.

Each World Instance owns its own:

- calendar age;
- economic history;
- market state;
- hero economic state;
- companies/assets;
- contracts;
- world events.

A player can later participate in multiple worlds without synchronizing their economies.

---

# 21. Simulation partitioning

For scalability:

```text
active player scene -> high-frequency local simulation
active logistics route/hub -> operational simulation
facility/market -> economic ticks
country/global trade -> strategic ticks
population/city evolution -> slow ticks
inactive areas -> summarized catch-up
```

The Android client should never be responsible for simulating the whole world.

---

# 22. Determinism and replay safety

Economic cycle settlement should use:

- stable cycle IDs;
- authoritative ordering;
- idempotent transaction/event IDs;
- revision checks;
- versioned balancing rules;
- auditable settlement history for high-value state.

A retried offline catch-up cannot apply the same daily costs or production twice.

---

# 23. Player-facing time UX

The user should be able to understand:

- current time/day/season;
- current Work Capacity;
- next shift/deadline;
- recurring costs due soon;
- travel arrival;
- production/contract completion;
- important offline changes.

Do not expose raw simulation complexity when a clear summary is enough.

---

# 24. Major unresolved R8 decisions

1. Game-time compression ratio.
2. Whether all World Instances use the same calendar speed.
3. Exact baseline personal daily-consumption settlement.
4. Maximum offline catch-up horizon per pass/service architecture.
5. Employment outcomes for disconnect mid-shift.
6. Grace periods before rent/service/company default.
7. Season length and agricultural cadence.
8. Whether players can voluntarily schedule vacations/inactive status to reduce selected obligations at the cost of access/benefits.
9. When/how recurring contracts auto-renew.
10. Interaction between wars/macroeconomic events and time cycles.

---

## Research rule

**Time must create economic consequence without demanding continuous login. Rest can restore the hero, but the world and legitimate obligations continue. Offline settlement is authoritative, bounded by real inventories/capacities/default states, idempotent and summarized rather than minute-by-minute replayed.**
