# DROPi Tycoon — GAME LOGIC MASTER MODEL v0.1

Status: **RESEARCH SYNTHESIS — NON-CANONICAL**  
Parent: #423  
Inputs: R1–R8 working models and Phase-1 canon conflict/gap audit

## Purpose

Explain DROPi Tycoon end-to-end as one persistent multiplayer economic society before any new canonical reconciliation or large implementation program.

This version is a research synthesis, not final canon.

---

# 1. The game fantasy

DROPi Tycoon is not ultimately a game about clicking delivery missions and growing one numerical company level.

The mature fantasy is:

> **Start as one poor person inside a living world. Work to survive. Learn. Save. Buy better tools. Qualify for better work. Join or build organizations. Move real goods through real supply chains. Help cities and industries grow. Compete and cooperate with other people and companies. Invest in productive assets and infrastructure. Eventually influence regional, national and global economic development — while remaining one person inside the same society.**

The world continues to evolve whether one player is online or not.

---

# 2. The smallest complete gameplay loop

The first playable mature-economic loop should already contain the DNA of the endgame.

```text
HERO NEEDS FOOD / WATER / HOUSING
        |
        v
HERO NEEDS PERSONAL MONEY
        |
        v
INCUMBENT LOGISTICS EMPLOYER HAS REAL SERVICE DEMAND
        |
        v
HERO WORKS PEDESTRIAN SHIFT
        |
        v
WORK CONSUMES TIME + WORK CAPACITY
        |
        v
EMPLOYER PAYS DAILY/SHIFT WAGE
        |
        v
HERO BUYS BASIC GOODS / PAYS LIVING COSTS
        |
        v
MERCHANT INVENTORY FALLS
        |
        v
MERCHANT RESTOCKS
        |
        v
RESTOCKING CREATES NEW PROCUREMENT + LOGISTICS DEMAND
        |
        v
HERO SAVES SMALL SURPLUS
        |
        v
TRAINING / EQUIPMENT / TRANSPORT IMPROVES CAPABILITY
        |
        v
BETTER WORK BECOMES ELIGIBLE
```

Nothing in this loop requires the hero to own a company.

---

# 3. The hero

The hero is a persistent economic person, not a company account.

They have separate state families for:

- identity;
- Personal Money;
- location/travel;
- Work Capacity;
- food/water/living state;
- personal inventory/assets;
- qualifications/mastery;
- employment;
- company membership;
- operational permissions;
- external investments;
- reputation/history.

These are not one `PlayerRole` enum.

---

# 4. Starting state

Owner-directed research start:

- deliberately poor;
- pedestrian;
- basic phone/application access;
- limited carrying equipment;
- employee of a large incumbent delivery/logistics company;
- early work: flyers, letters/envelopes and very small/light items;
- primarily paid by completed day/shift, not per parcel;
- no personal company, industrial assets, advanced vehicle or specialist authorization.

The owner used Amazon as a concrete employer reference; shipping brand/legal treatment is unresolved.

---

# 5. The hero is both producer and consumer

The hero consumes:

- food;
- water;
- housing/basic living;
- time;
- personal Work Capacity;
- money;
- fuel/electricity/maintenance when operating assets.

They cannot work infinitely.

Rest and adequate consumption restore/support capacity. Equipment can replace human effort with capital/energy consumption.

---

# 6. Equipment economics

Transport/equipment changes the production function.

Example progression:

```text
walking
-> bicycle
-> e-scooter
-> motorcycle
-> car
-> delivery van
-> specialized commercial transport
-> multimodal professional operation
```

Each mode has different:

- purchase/lease cost;
- personal-energy cost;
- fuel/charge cost;
- maintenance;
- capacity;
- range;
- route access;
- qualification;
- infrastructure requirement.

A larger vehicle can reduce net profit on the wrong route.

---

# 7. Capability-gated work

No player can accept every job.

Eligibility can require:

```text
cargo compatibility
+ Work Capacity
+ equipment
+ vehicle capacity/range
+ fuel/charge
+ qualification
+ authorization
+ employer/company permission
+ infrastructure access
+ location/world access
+ time
+ operating money
```

Progression is therefore:

**earn → save → buy → study → practice → qualify → authorize → gain access → specialize → organize → own.**

---

# 8. Careers

The person can become a specialist without becoming an owner.

Career families include:

- courier/road logistics;
- warehouse/dispatch;
- maintenance/technical;
- drone;
- rail;
- maritime;
- air;
- agriculture;
- industrial production;
- energy/utilities/waste;
- construction/infrastructure;
- business/finance/management;
- research/education.

Professions are capability portfolios, not permanent class locks.

---

# 9. Labor market

Jobs exist because productive actors need labor.

```text
demand/production plan
-> capacity requirement
-> labor shortage
-> job opening
-> qualified worker matched
-> employment contract
-> work output
-> wage settlement
```

Wages connect Company Money to Personal Money.

Human and NPC workers use compatible economic rules.

---

# 10. Companies

A company is a separate economic organism with:

- Company Money;
- workforce;
- customers/contracts;
- inventory;
- fleet/equipment;
- facilities;
- productive capacity;
- fuel/energy/utilities;
- reputation;
- ownership/governance;
- risk/history.

It is not a menu or reward multiplier.

---

# 11. Company formation

A hero can later become an entrepreneur when requirements are met.

Conceptual formation:

```text
business qualification
+ legitimate startup capital
+ authorization/capacity slot
+ physical/administrative base
+ initial operating capability
-> company formed
-> explicit Personal Money/capital contribution settlement
-> separate Company Money ledger
```

Money alone cannot replace capability.

---

# 12. Company revenue

Revenue originates from real counterparties and services/products:

- transport contracts;
- business service agreements;
- product sales;
- infrastructure services;
- warehouse/terminal services;
- other authorized productive activities.

The mature model does not create revenue solely because a mission reached `Completed`.

---

# 13. Company costs

Companies can pay:

- wages;
- fuel/electricity;
- utilities;
- maintenance/repair;
- raw materials/inventory;
- packaging;
- rent/property;
- training;
- infrastructure;
- fees/taxes/finance only if later authorized;
- waste treatment;
- dividends from real distributable profit.

Cash flow matters as much as accounting profit.

---

# 14. Company evolution

Possible path:

```text
micro local operator
-> structured local company
-> competitive city company
-> specialist/productive business
-> regional multi-locality operator
-> national network / industrial owner
-> international multimodal corporation
-> global infrastructure/production network
```

A company can also decline, restructure, merge, be acquired or fail.

---

# 15. Industry relationships

A logistics company can build relationships progressively:

```text
one-off industrial delivery
-> repeated successful work
-> recurring contract/tender
-> dedicated capacity/warehouse
-> strategic partnership
-> investment
-> eligible acquisition / privatization / concession
```

This applies to farms, steelworks, chemical plants, paper mills, factories, utilities and infrastructure where rules permit.

---

# 16. Production economy

Production transforms constrained inputs:

```text
inputs
+ workers/specialists
+ facility/equipment
+ energy/water
+ time
-> outputs
+ waste/by-products
```

Examples:

- chemicals -> fertilizer;
- fertilizer + water + farm labor -> crops;
- crops -> food;
- iron/coal/scrap + energy -> steel;
- wood + chemicals + water/energy -> paper;
- construction materials + labor -> buildings/infrastructure.

---

# 17. Consumption creates demand

Demand is not a random number.

It emerges from:

- people eating/drinking/living;
- shops restocking;
- factories procuring inputs;
- farms procuring supplies;
- construction consuming materials;
- vehicles consuming fuel/energy;
- maintenance consuming parts;
- cities consuming utilities;
- waste requiring removal/treatment;
- trade responding to regional shortages/surpluses.

---

# 18. Inventory and custody

Physical goods exist somewhere and belong to someone/custodian.

Possible locations:

- person;
- store;
- warehouse;
- farm/factory;
- vehicle;
- port/terminal;
- construction site.

Transport changes location/custody through authoritative events. It does not duplicate inventory.

---

# 19. Delivery creation

A delivery is the transport leg of a real economic transaction/need.

```text
need
-> procurement/order/contract
-> goods reserved/produced
-> carrier selected
-> custody transferred
-> transport consumes capacity/time/energy
-> destination inventory changes
-> economic settlement
-> downstream consumption/production proceeds
```

---

# 20. Prices

Prices can respond to:

- inventory;
- consumption/demand;
- production/input cost;
- labor;
- energy;
- transport;
- storage/perishability;
- competition;
- shortage/surplus;
- contract terms.

The final economy should not use one permanent global price table.

---

# 21. Waste

People, companies and cities produce residual flows.

```text
consumption/production
-> waste/wastewater/by-product
-> collection
-> transport
-> treatment/recycling/disposal
-> recovered materials and/or cost
```

Waste creates legitimate industries, jobs and logistics demand.

---

# 22. The city

A city has stocks such as:

- people;
- housing;
- jobs;
- shops;
- industry;
- utilities;
- infrastructure;
- specialist labor;
- inventories;
- waste capacity.

It consumes food, water, energy, goods and services and produces waste.

---

# 23. City growth

```text
investment/industry
-> jobs
-> wages
-> migration
-> housing demand
-> construction
-> consumer demand
-> retail/services
-> logistics
-> infrastructure
-> greater productive capacity
```

Growth stops or reverses when constraints break the chain.

---

# 24. City decline

```text
industry/job loss
-> unemployment
-> lower income/demand
-> business closure
-> migration out
-> vacancies
-> weaker service/infrastructure investment
-> further decline
```

Recovery remains possible.

---

# 25. Urban and rural competition

Owner-directed target:

- urban locality: roughly max 5 meaningful last-mile delivery competitors;
- rural area/locality: normally 1–2.

Final capacity should arise from market size/authorization/infrastructure, not only a hard counter.

---

# 26. Rural world

Rural areas have different economics:

- agriculture;
- forestry;
- extraction;
- processing;
- tourism;
- low density;
- longer travel;
- fewer shops/services;
- stronger dependence on regional links.

They are not miniature cities.

---

# 27. New settlements

A new locality can emerge when a site obtains:

- economic anchor/resources;
- jobs;
- transport;
- utilities;
- housing;
- investment;
- migration.

Countries can therefore develop new cities over long World Instance history.

---

# 28. Country layer

All countries exist on the global map.

Detailed representation is sparse:

- capital;
- representative broad-direction urban hubs;
- representative smaller/rural localities;
- independent external economic nodes;
- aggregated background population/production for omitted territory.

Geography remains recognizable and based on real-world spatial relationships, while the economy evolves fictionally.

---

# 29. Country development

Countries evolve through:

- production/productivity;
- jobs/labor;
- resources;
- energy;
- infrastructure;
- education/specialists;
- domestic trade;
- imports/exports;
- investment;
- population/migration;
- city/rural development;
- events.

A country can become wealthy, stagnant or decline.

---

# 30. National currencies

Owner vision supports eventual national-currency strength as an economic consequence.

Research has not yet selected the final monetary model.

If national currencies are approved, exchange value must respond to explicit monetary/macro rules rather than random percentages or live real-world FX replication.

---

# 31. Global transport

The global economy uses real infrastructure layers:

- roads/highways;
- rail;
- river transport;
- maritime routes;
- airports/air cargo;
- ports;
- logistics hubs;
- future drone networks where appropriate.

The strategic map plans and exposes networks; it should not make infrastructure meaningless through free teleportation.

---

# 32. World time

The world has nested authoritative time:

- moment/active movement;
- work shift;
- operating day;
- market/production cycle;
- season;
- year/structural cycle.

Day/night affects traffic, shifts, demand, energy, business schedules and ambience.

---

# 33. Offline world

Logging out does not freeze the economy.

The hero may:

- recover Work Capacity through rest;
- continue paying legitimate recurring obligations;
- consume baseline living resources/costs;
- receive no starter wage without work;
- become insolvent if reserves are inadequate.

Companies/facilities continue only while they retain inputs, workers/automation, energy, storage and authority.

---

# 34. Insolvency and failure

Failure is state transition, not identity deletion.

Hero:

```text
stable -> pressure -> arrears/service loss -> asset pressure -> insolvency -> basic employment recovery
```

Company:

```text
healthy -> margin/cash stress -> service decline -> contract loss -> restructuring -> sale/acquisition/bankruptcy
```

World history remains.

---

# 35. Multiplayer society

Human and NPC actors share one economy.

Humans can:

- work;
- hire;
- trade;
- contract;
- invest;
- govern;
- cooperate;
- compete;
- build/operate infrastructure;
- specialize.

NPCs provide continuity and baseline population/labor/market participation.

---

# 36. Multiplayer authority

Shared contested state is trusted-server authoritative:

- identity;
- money;
- inventory;
- cargo custody;
- company membership/permissions;
- contracts;
- shares;
- markets;
- assets;
- world time.

Clients submit intent and render results.

---

# 37. Asynchronous design

Persistent orders, job listings, contracts, tenders, auctions, company delegation and offline summaries let players participate across time zones.

Normal progression does not require all relevant humans online together.

---

# 38. Anti-griefing / anti-monopoly

Economic dominance can be earned.

But no player/company can permanently remove every recovery/entry path by controlling essential infrastructure, all starter jobs or another human's identity.

Competition remains real through price, service, labor, contracts, infrastructure and strategy rather than arbitrary sabotage score theft.

---

# 39. World Instances

DROPi Tycoon can run many independent persistent global economies.

A new world starts from a versioned baseline.

Older worlds remain separate historical economies.

Economic power does not automatically transfer between them under the current recommended research model.

---

# 40. Mature-world endgame

There is no fixed ending.

Late-game meaning can come from:

- master professions;
- global logistics operations;
- industrial ownership;
- infrastructure;
- investment/governance;
- mergers/acquisitions;
- regional/country development;
- crisis recovery;
- research/technology;
- mentoring;
- historical legacy;
- fresh World Instance competition.

---

# 41. What the current runtime represents

The current playable city, starter company, per-delivery reward, HQ, employees, fleet and smartphone are **valuable prototype foundations**, not discarded work.

However the research identifies a required migration:

```text
CURRENT PROTOTYPE
order -> player delivery -> Company Money reward

FUTURE TARGET
real need -> goods/inventory -> employer/company contract
-> human/NPC work -> wage/company settlement
-> consumption/production -> new demand
```

Implementation must migrate in governed slices rather than rewrite everything at once.

---

# 42. Owner directions already established in research

- global world;
- all countries strategically represented;
- sparse representative cities/rural nodes;
- external industries/farms/facilities outside localities;
- poor pedestrian employee start;
- large incumbent delivery employer;
- early flyers/letters/light cargo;
- day/shift wage start;
- food/water/living consumption;
- finite work energy;
- fuel/charge/maintenance;
- capability-gated progression;
- active supply/demand economy;
- city/company/country resource consumption;
- waste;
- urban ~5 / rural 1–2 delivery competitor targets;
- industrial contracts progressing to potential acquisition;
- evolving cities/countries/migration;
- macro war/state transitions possible;
- multiple persistent World Instances.

---

# 43. Highest-impact open owner decisions

The research is not ready for canon until decisions are made on at least:

1. one hero/account/World Instance vs alts;
2. what knowledge/qualifications transfer between World Instances;
3. one primary internal company membership vs multiple memberships;
4. player aging/death vs persistent human identity;
5. exact principle for infrastructure-backed global travel;
6. prototype-save economic migration into future worlds;
7. universal gameplay currency vs national currencies;
8. homelessness/emergency-shelter depth;
9. debt/banking/credit availability;
10. taxes/public budgets depth;
11. private ownership vs concession-only for essential infrastructure;
12. whether one hero may control/found multiple companies;
13. Amazon/real-brand vs fictional incumbent employer;
14. high-level severity of offline economic consequences.

Many numeric values — wages, day length, food amount, fuel price, rent, energy capacity — are balancing parameters and do not require permanent canon yet.

---

# 44. Research exit test

For any major activity, we must be able to answer:

- who needs it;
- who owns it;
- what is consumed;
- what labor is required;
- what time passes;
- what equipment/infrastructure is required;
- who pays;
- where money comes from;
- where goods move;
- what waste/by-product appears;
- what happens on failure;
- who has authority;
- what happens if the human logs off.

If one of those answers is still `future system` with no model, the research is not closed.

---

## v0.1 synthesis rule

**DROPi Tycoon is a persistent global multiplayer economic society where people, companies, cities and countries are simultaneously producers and consumers. Scarcity, capability, labor, time, infrastructure and ownership transform real game resources into goods and services; logistics connects every layer; progression is the earned ability to participate in increasingly complex parts of that economy; and failure changes economic position without deleting human identity or world history.**
