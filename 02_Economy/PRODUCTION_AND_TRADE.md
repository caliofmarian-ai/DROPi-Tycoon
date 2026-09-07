# Document Information

Document: PRODUCTION_AND_TRADE.md
Project: DROPi Tycoon
Version: 1.0.0
Status: Canonical — Economy Specialization
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-09-08

---

# Production and Trade Economy

## Purpose

This document defines how physical production, supply chains, contracts, product scarcity, logistics and trade create an active economy in DROPi Tycoon.

It specializes `02_Economy/ECONOMY.md`, `02_Economy/MARKET.md`, `00_Project/BUSINESS_DESIGN.md` and `00_Project/LOGISTICS_DESIGN.md`.

The economy is not a list of static prices. Products exist because productive nodes transform inputs into outputs, and logistics moves those outputs toward places that need them.

---

# 1. Productive Node Families

Productive activity may exist inside or outside localities.

Canonical families include:

- agriculture/farms;
- livestock and food production;
- forestry;
- mining/quarrying;
- steel/metallurgy;
- paper/pulp;
- chemicals;
- fertilizer;
- refinery/fuels;
- energy production;
- construction materials;
- machinery/components;
- consumer goods;
- medical/pharma where separately activated;
- electronics/technology where separately activated;
- food processing;
- warehousing/distribution;
- industrial ports/rail terminals and multimodal hubs.

Each productive node has explicit location, ownership/control, capacity, required inputs, outputs, inventory and logistics access.

---

# 2. Production Recipes

A production chain transforms one or more inputs into outputs over time.

Examples:

**Industrial chemicals -> fertilizer -> farms -> crops -> food processor -> marketplace/customer.**

**Iron/resource inputs + energy -> steel -> machinery/construction materials -> infrastructure/city growth.**

**Timber -> pulp/paper -> packaging -> merchants/factories -> logistics parcels.**

Recipes are fictionalized game abstractions. They should be recognizable enough to teach logistics dependency without becoming industrial engineering simulators.

---

# 3. Demand and Supply

Demand and supply are active state.

A locality, region, company or productive node may create demand for:

- production inputs;
- consumer goods;
- food;
- energy;
- construction materials;
- packaging;
- machinery;
- medical/essential supplies;
- specialist services;
- transport capacity.

Supply depends on actual modeled production, inventories, imports, transport access and disruptions.

Prices may react to:

- local inventory;
- demand pressure;
- production capacity;
- transport cost;
- distance;
- congestion;
- season/weather;
- shortages/surpluses;
- contract commitments;
- events;
- taxes/tariffs/currency abstractions when those systems are activated.

Price movement must remain bounded and understandable enough for gameplay.

---

# 4. Local Marketplaces

Local marketplaces aggregate goods available to a locality.

Marketplace supply can come from:

- local merchants;
- nearby farms/factories;
- regional warehouses;
- national suppliers;
- imports from other countries.

A product can be cheap in one area and expensive in another because of real simulated differences in supply, demand, transport and inventory.

This creates legitimate trade/arbitrage opportunities for logistics and production companies.

---

# 5. Delivery Company Progression With Producers

Delivery companies interact with productive nodes in stages.

## Early stage — Occasional Jobs

A farm, factory, steelworks, paper mill or chemical plant may publish individual/occasional transport jobs.

The player can accept work without owning the producer.

## Growth stage — Service Contracts

A delivery company may negotiate/earn recurring logistics contracts based on:

- capacity;
- reliability;
- price;
- reputation;
- specialist capability;
- vehicle/infrastructure suitability;
- geographic coverage.

Contracts may reserve recurring volume and create service-level expectations.

## Advanced stage — Strategic Logistics Partnerships

A mature company may become the primary/major logistics provider for a producer, operate dedicated routes, warehouses or multimodal legs, or invest in supporting infrastructure.

## Late stage — Productive Asset Ownership

Where company progression, finance, governance and world rules allow it, a mature company may acquire or control productive assets such as:

- farms;
- factories;
- processing plants;
- industrial complexes;
- warehouses;
- terminals;
- other eligible productive facilities.

Ownership turns the company from a transport provider into an integrated producer/logistics operator.

Acquisition does not create free output: the asset still requires workers/specialists, inputs, energy, maintenance, transport and demand.

---

# 6. Player-Controlled Trade

A company that owns or contracts production may choose where to send output.

Trade decisions may consider:

- sale price;
- demand;
- transport cost;
- time;
- capacity;
- route risk;
- tariffs/currency when activated;
- customer/contract commitments;
- storage constraints.

The best destination is not always the one with the highest nominal price if logistics cost or risk is too high.

---

# 7. Economic Dependency and Growth

Products can unlock or accelerate other economic activity.

Example chain:

1. A chemical producer supplies required inputs.
2. A fertilizer plant produces fertilizer.
3. Fertilizer improves/expands agricultural output where farms, land, workers and season permit.
4. Increased agricultural output supports food processors and local marketplaces.
5. More goods create more logistics demand, jobs, income and population support.
6. Growth increases construction, services and specialist demand.

No single product should automatically create prosperity. Growth must depend on multiple complementary systems.

---

# 8. City and Rural Consumption

Urban and rural areas have different economic profiles.

Urban demand tends to include:

- food/consumer goods;
- construction materials;
- services;
- industrial inputs;
- specialist products;
- high logistics volume.

Rural areas may specialize in:

- agriculture;
- forestry;
- extraction;
- food processing;
- small commerce;
- tourism;
- specialist local industry.

Rural areas can export primary/processed goods while importing machinery, consumer goods, chemicals, energy or specialized services.

---

# 9. Contracts

Business contracts are authoritative economic obligations rather than passive bonuses.

A contract may define:

- origin/destination;
- product/cargo category;
- volume;
- frequency;
- deadline/service window;
- price/revenue;
- penalties/reputation consequences;
- capacity reservation;
- duration;
- renewal/termination conditions.

Contracts must connect to real cargo and capacity where the logistics system supports it.

---

# 10. Ownership and Competition

Productive assets can change ownership over time through governed gameplay systems.

Ownership may be:

- private NPC/simulated company;
- player company;
- public/world institution;
- concession/lease/joint arrangement when separately designed.

Critical essential production should have recovery/alternative supply mechanisms so one owner cannot permanently starve an entire world.

---

# 11. Economy Update Frequencies

Production and trade do not require per-frame calculation.

Typical responsibility split:

- active cargo movement — route/local simulation frequency;
- inventory/production — operating-day or configured economic tick;
- contracts/market prices — economic/market cycle;
- investment/industrial expansion — slower strategic cycles;
- structural economic change — seasonal/yearly cycles.

Exact timing remains configuration/balance data.

---

# 12. Real-World Inspiration Boundary

The game may use recognizable geographic/economic specializations as inspiration, but:

- it does not claim live official production statistics;
- it does not reproduce confidential company data;
- generated companies and output values are fictional game state;
- real-world brands/industrial ownership are not required;
- future data refreshes must not silently rewrite the history of an existing World Instance.

---

# Canonical Rule

**Goods in DROPi Tycoon must come from productive capacity, inputs, people and time. Demand, supply, inventory, transport and ownership determine where those goods move and what they are worth. Logistics companies can evolve from occasional carriers to contracted networks and ultimately integrated producer-logistics corporations without bypassing real modeled costs and dependencies.**

---

End of Document