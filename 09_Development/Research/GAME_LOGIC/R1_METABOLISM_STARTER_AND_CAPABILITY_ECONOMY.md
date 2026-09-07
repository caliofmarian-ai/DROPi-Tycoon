# R1 — Metabolism, Starter Economy and Capability-Gated Work

Status: **RESEARCH WORKING PAPER — NON-CANONICAL**  
Parent: #423  
Track: #424  
Owner direction recorded: 2026-09-08

## Purpose

This paper specializes the human-player life-cycle with the owner's clarified requirement that the hero is both a producer and a consumer inside the same active economy.

The hero must consume resources, lose work capacity, pay recurring living/operating costs, choose equipment economically and remain exposed to insolvency when inactive or poorly managed. At the same time, the design must preserve a legitimate recovery path so bankruptcy is a state in the economy rather than account deletion.

---

## 1. First-life fantasy

The intended starting fantasy is deliberately constrained.

The hero begins as:

- a very poor person;
- a pedestrian courier / low-tier delivery employee;
- employed by a large incumbent logistics/delivery organization;
- paid primarily by completed work day / shift rather than by arbitrary per-parcel rewards;
- trusted initially only with low-risk, low-weight work such as flyers, letters/envelopes and other small/light items;
- equipped with only basic clothing, phone/application access and limited carrying capacity;
- unable to operate advanced vehicles, handle specialist cargo, own major infrastructure or access high-value commercial activities.

The owner named **Amazon** as the concrete reference employer. Brand/legal research must decide later whether the shipping build uses a licensed real brand, a clearly fictionalized equivalent or another permitted presentation. The economic role itself is the research requirement.

The player's first problem is not "how do I optimize a global corporation?" It is:

> Can I get through the day, preserve enough energy to work, cover basic consumption and begin saving enough money and capability to improve my position?

---

## 2. The personal metabolic-economic loop

The hero's day links physical capacity and finance:

```text
Food + Water + Rest + Housing/Basic Conditions
                  |
                  v
          Personal Work Capacity
                  |
                  v
       Work / Study / Travel / Tasks
                  |
           +------+------+----------------+
           |             |                |
           v             v                v
      Personal       Experience /     Fatigue / Energy
       Income        Qualifications      Consumption
           |                              |
           +-------------+----------------+
                         |
                         v
             Personal Money / Savings
                         |
          +--------------+----------------+
          |              |                |
          v              v                v
     Consumption      Equipment        Training /
     + Housing         / Vehicles       Authorization
          |              |                |
          +--------------+----------------+
                         |
                         v
              New Work Capability
```

The loop is deliberately circular. Better capability can improve income, but better capability also tends to create new operating costs, capital needs and responsibilities.

---

## 3. Personal consumption domains

The exact numeric rates are balancing data. R1 defines the categories and causal relationship.

### 3.1 Food

Food is a real economic good consumed by the hero.

It must originate from the wider production/trade system rather than from an isolated survival minigame.

Food availability and price therefore connect the hero to:

- agriculture;
- food processing;
- retail;
- transport;
- regional scarcity/surplus;
- city demand.

### 3.2 Water

Water is a consumed resource and may be represented through local utility access, purchased supply or other world-specific infrastructure abstractions.

Water systems create demand for extraction/treatment/distribution and later wastewater handling where the world simulation supports it.

### 3.3 Housing and basic living cost

Housing should influence recurring Personal Money expenditure, location, storage, travel time and quality of life.

A hero may start in low-cost/basic accommodation and later rent or own better property.

Housing must not become a free cosmetic disconnected from the economy.

### 3.4 Other living expenses

Later research may include appropriate recurring categories such as:

- basic household utilities;
- communications/service plan;
- clothing/equipment wear;
- local transport;
- hygiene/basic services;
- taxes/fees only if R4/R6 prove they improve the economy.

The design should aggregate tiny repetitive costs where necessary for usability instead of forcing dozens of nuisance clicks.

---

## 4. Personal Energy / Work Capacity

The hero has finite **Work Capacity**.

This is not simply a decorative stamina bar. It is a production constraint.

Work Capacity is consumed by activities such as:

- walking;
- carrying cargo;
- loading/unloading;
- cycling;
- manual work;
- long work shifts;
- selected study/training/practical assessments;
- other physically/mentally demanding activities when later modeled.

Capacity is restored through rest and adequate basic consumption according to future balancing rules.

### Design goals

Work Capacity must:

- prevent infinite manual delivery loops;
- make rest/time economically meaningful;
- make equipment choice economically meaningful;
- distinguish low-capital/manual work from capital-intensive/mechanized work;
- reward planning without becoming tedious micromanagement.

### Failure states

Low Work Capacity can reduce or block certain tasks. It should not randomly delete progress.

The player can recover through rest/consumption, subject to time and affordability.

---

## 5. Equipment as productivity substitution

Equipment changes the relationship between human energy, money, cargo and time.

A progression example:

| Mode | Capital cost | Personal energy | Operating resource | Capacity | Access/qualification | Typical use |
|---|---:|---|---|---|---|---|
| Walking | minimal | high | food/water/time | very low | basic | flyers, letters, very small parcels |
| Bicycle | low | medium-high | food/water + maintenance | low | basic cycling skill | local small parcels |
| E-scooter | low-medium | low-medium | electricity + maintenance | low | operation qualification where modeled | fast local light delivery |
| Motorcycle | medium | low | fuel/energy + maintenance | low-medium | license/qualification | longer urban/suburban work |
| Car | medium-high | low | fuel/energy + maintenance | medium | driving authorization | regional personal/light commercial use |
| Delivery van | high | low | fuel/energy + maintenance | high | commercial/company capability | multi-stop and heavier cargo |

The table is conceptual, not permanent balancing data.

A vehicle can therefore increase gross revenue while reducing net profitability if fuel, maintenance, finance, insurance/fees or underutilization exceed the value it creates.

---

## 6. Cargo eligibility

A job must not be accepted merely because the player clicked it.

A delivery opportunity checks a capability envelope including where relevant:

```text
cargo type / size / mass
+ required handling qualification
+ player work capacity
+ carrying equipment
+ vehicle payload/range
+ fuel/charge
+ route/infrastructure access
+ legal/game authorization abstraction
+ employer/company permission
+ geographic access
+ time window
+ operating money
= eligible service capability
```

Examples:

- flyers/letters: pedestrian starter work;
- food: time/handling constraints;
- medicine: reliability or medical/logistics authorization where designed;
- fragile electronics: handling/equipment constraints;
- pallets: warehouse/vehicle/forklift capacity;
- chemicals: specialist cargo and safety authorization;
- refrigerated goods: cold-chain equipment;
- containers: terminal/heavy infrastructure capability;
- rail/air/maritime freight: company + infrastructure + specialist workforce, not a personal starter unlock.

---

## 7. Progression is capability accumulation, not one level number

The owner direction can be summarized as:

**earn → save → buy → study → practice → qualify → obtain authorization → gain access → operate → specialize → organize → own.**

Some pathways are personal; others require a company or institution.

Examples:

### Pedestrian to bicycle courier
- earn wages;
- maintain food/water/basic living;
- save Personal Money;
- buy/obtain bicycle;
- gain required operating familiarity/qualification;
- access higher-efficiency delivery work.

### Courier to driver
- save/pay training;
- study;
- pass practical authorization abstraction;
- obtain/lease/receive access to vehicle;
- fund fuel/charge and maintenance;
- qualify for new jobs.

### Employee to founder
- build business knowledge;
- save or obtain legitimate startup capital;
- satisfy company-formation requirements;
- separate Personal Money from Company Money;
- register/form the organization through the governed world mechanism;
- obtain customers/contracts/capacity;
- accept company-level risk.

### Local logistics firm to railway/industrial owner
This is a late or very-late progression horizon and may require:

- major company capital/valuation;
- trained workforce and specialists;
- infrastructure projects or acquisitions;
- regional/national authorization or concession abstraction;
- contracts/market demand;
- depots/terminals/maintenance capability;
- energy/fuel/material inputs;
- governance approval where relevant;
- acquisition/privatization/bidding mechanics when R2/R6 define them.

No elapsed-time or single-level shortcut may replace the actual capability stack.

---

## 8. Starting employment and wage logic

The early employer provides the hero with work opportunities because the employer has real commercial demand/contracts.

The early loop should be conceptually:

```text
Customer/merchant demand
-> incumbent logistics company receives/owns service demand
-> company creates a shift/work route
-> hero accepts/works the shift
-> hero performs allowed tasks
-> employer records productive work
-> employer pays daily/shift wage
-> Company Money decreases
-> Personal Money increases
```

The wage must not appear from nowhere in the mature authoritative economy. R4 must identify the employer's revenue source, sinks and fallback liquidity rules.

### Daily pay vs per-delivery pay

For the owner's intended start:

- the hero's primary compensation is a day/shift wage;
- delivery count, quality and completion can affect performance, continued employment, bonus eligibility or promotion later;
- the first job is therefore experienced as **employment**, not an independent gig marketplace.

Independent/gig per-job pricing can unlock later as a separate employment/business model.

---

## 9. Offline time and insolvency

World time continues while the player is offline.

The research model must distinguish:

### Costs that may continue while inactive
- housing/rent where contractual;
- baseline consumption/living cost;
- subscriptions/services where designed;
- vehicle/property maintenance/storage obligations where designed;
- loan/debt service only after debt is separately authorized;
- taxes/fees only after R4/R6 authorization.

### Costs that depend on active use
- fuel consumed by driving;
- battery/energy consumed by operation;
- route tolls/travel tickets;
- work-specific consumables.

### Income while inactive
The starting human employee does **not** receive infinite wages while offline. Wage requires governed work/shift output unless a later salaried/asynchronous role explicitly defines passive compensation obligations.

Investments, company ownership or delegated operations may produce income while offline only through the same authoritative economic rules that would apply while online.

### Personal insolvency
If recurring costs exceed available Personal Money over time, the hero can become insolvent.

Possible consequences for later design:

- service suspension;
- loss of rented accommodation after due process/grace rules;
- inability to operate unfunded vehicles;
- forced sale/liquidation of eligible non-essential assets;
- employment disruption if the player cannot reach/work;
- personal bankruptcy state.

The balance should not become an infinite negative number simply because the user was away for months. Insolvency must settle obligations under explicit rules and then expose a recovery floor.

---

## 10. Bankruptcy and recovery

Bankruptcy is a serious economic setback, not character deletion.

The player retains:

- account identity;
- World Hero identity/history;
- lawful qualifications already earned unless a specific authorization expired/revoked under separate rules;
- non-seizable/non-economic identity items;
- the right to seek basic work.

The player may lose or be forced to surrender eligible economic privileges/assets according to later bankruptcy rules.

Recovery returns the hero to the lowest productive rung:

```text
poor / insolvent
-> basic subsistence
-> pedestrian starter employment
-> wage income
-> stabilize living costs
-> save again
-> rebuild equipment/capability
```

This preserves consequences without creating an unrecoverable multiplayer softlock.

---

## 11. City-scale metabolism discovered by R1

The owner's personal-consumption clarification exposes a larger R5/R4 requirement:

**the city must also be modeled as a consuming and waste-producing economic organism.**

A city/settlement can require and consume categories such as:

- food;
- potable water;
- electricity/energy;
- fuel;
- household goods;
- medicines;
- construction materials;
- industrial inputs;
- services.

Economic activity also creates outputs that require handling:

- solid waste;
- recyclable materials;
- wastewater/sewage;
- industrial waste/by-products;
- emissions/pollution abstractions where useful.

This creates additional legitimate logistics chains rather than decorative city bars:

```text
Consumption -> Waste Generation -> Collection -> Transport
-> Treatment / Recycling / Disposal -> Secondary Materials / Cost
```

Utilities and waste must therefore become research tracks under R4/R5, not be bolted onto the map as cosmetic buildings.

---

## 12. Comparative design evidence

### Workers & Resources: Soviet Republic

Its official documentation demonstrates the systemic value of connecting citizens, water, sewage, power, transport, education and service vehicles into one economy/simulation rather than treating them as independent decorative meters.

Useful lesson for DROPi:
- basic consumption can create infrastructure and transport demand;
- wastewater/waste can become physical logistics problems;
- vehicle choice can expose capacity and operating trade-offs.

This is a design reference only; DROPi should remain more accessible and player-centered rather than copying its city-builder complexity wholesale.

Reference family: Workers & Resources: Soviet Republic Official Wiki, Hooded Horse.

---

## 13. Cross-track consequences

This owner direction affects more than R1.

### R3 — professions
Must define work shifts, energy intensity, specialist labor, training and compensation.

### R4 — goods/economy
Must define food/water/fuel/energy production, consumption, pricing, employer revenue, money sources/sinks and waste markets.

### R5 — city/society
Must define population consumption, utilities, housing, waste, employment and city growth/decline.

### R6 — country
Must define strategic resource dependency, national energy, imports/exports and infrastructure.

### R7 — multiplayer
Must make wages, consumption, insolvency and asset custody server-authoritative where contested.

### R8 — time/world instances
Must define how offline consumption and obligations are settled through economic ticks and catch-up without producing unbounded debt or punitive login traps.

---

## Research rule established by owner direction

**Every productive actor is also a constrained consumer of time, resources and capacity. Every vehicle, facility, city and company must pay the real game-economy cost of the capability it uses. Progression means acquiring the knowledge, authorization, people, assets and infrastructure required to transform scarce resources into greater productive power; no player may jump from poor pedestrian worker to global industrial ownership through a simple level unlock.**
