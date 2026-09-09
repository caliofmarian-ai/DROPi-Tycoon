# Document Information

Document: MARKET.md
Project: DROPi Tycoon
Version: 2.1.0
Status: Canonical — Market Specialization
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-09-09

---

# Market System

## Purpose

This document defines how supply, demand, buyers, sellers, service providers, prices, procurement and competition interact inside the stock-flow economy defined by `02_Economy/ECONOMY.md`.

The market exists to expose real economic needs/opportunities and strategic choices. It is not an independent mission generator.

---

# 1. Market Philosophy

The market should feel alive because the underlying world changes.

Demand and supply may change through:

- consumption;
- production/input requirements;
- inventory depletion/replenishment;
- population and migration;
- time/season;
- weather/events;
- business openings/closures;
- infrastructure/capacity;
- local income/employment;
- logistics cost/reliability;
- regional shortage/surplus;
- competition and reputation.

A number called `demand` must not be disconnected from the stocks/flows it represents.

---

# 2. Market Participants

Participants may include:

- people/households or population cohorts;
- merchants/shops/restaurants/pharmacies;
- service companies;
- logistics companies;
- farms;
- factories/processing facilities;
- warehouses/distributors;
- utilities/energy providers;
- construction/projects;
- infrastructure operators;
- public/institutional buyers when later modeled;
- NPC and human economic actors.

Actors may buy, sell, procure, contract, bid, supply, consume or provide capacity according to their actual state.

---

# 3. Demand Formation

Demand is caused by a real requirement such as:

- household consumption;
- shop inventory below target;
- business/industrial input requirement;
- construction material requirement;
- maintenance/fuel/energy requirement;
- medical/service stock requirement;
- warehouse rebalancing;
- waste/reverse-logistics requirement;
- regional shortage;
- event/recovery need.

Demand may be aggregated for performance, but any resulting order/contract/procurement opportunity must correspond to a modeled payer, quantity/capacity need, or governed public source.

---

# 4. Supply Formation

Supply comes from actual available capability such as:

- merchant/warehouse inventory;
- farm/factory output;
- service-company capacity;
- transport capacity;
- infrastructure capacity;
- imports/other regions;
- recovered/recycled material where valid.

NPC fallback may provide bounded market continuity, but it obeys inventories, costs and production. It cannot create infinite free supply.

---

# 5. Procurement and Opportunity Creation

When a buyer/consumer requires supply, the market may create or surface:

- purchase requests;
- delivery/logistics orders;
- service requests;
- recurring contracts;
- tenders/bids;
- supplier relationships;
- emergency/recovery procurement.

The market may aggregate/queue these opportunities for usability, but it cannot invent economic value unrelated to the underlying requirement.

---

# 6. Pricing

Prices may respond to a governed combination of:

- available inventory/supply;
- demand intensity;
- production/procurement cost;
- transport/logistics cost;
- service quality/reliability;
- scarcity;
- competitor offers;
- contract volume/duration;
- local income/economic conditions;
- disruption/events;
- later currency/inflation/FX effects.

Exact formulas belong to `02_Economy/PRICING.md` and balancing data.

The market should not permit trivial infinite arbitrage caused by disconnected local prices or free teleportation.

---

# 7. Competition and Market Capacity

Companies compete by offering real value/capability, including:

- price;
- availability;
- quality;
- speed;
- reliability;
- capacity;
- specialization;
- geographic coverage;
- infrastructure;
- reputation/trust.

For last-mile delivery, roughly five meaningful competitors is an urban design target and normally one to two is a rural target.

These are not universal hardcoded caps. Entry/exit should respond to locality demand, population, infrastructure, company viability and authorization rules while preserving recovery and alternative opportunities.

---

# 8. Market Information

The player should receive information appropriate to their role.

Useful market surfaces may show:

- what is scarce and why;
- current/expected inventory pressure;
- buyer requirements;
- supply sources;
- price/cost ranges;
- route/logistics burden;
- competitor capacity;
- contract opportunities;
- regional surplus/deficit;
- historical trend;
- uncertainty/limitations where information is incomplete.

The interface should help the player make decisions without revealing omniscient perfect future knowledge.

---

# 9. Local, Regional and Global Markets

Markets are geographically connected rather than independent random tables.

A local shortage may be addressed by:

- another local supplier;
- nearby rural production;
- another city/region;
- national supply;
- international trade.

The delivered price/opportunity should reflect relevant production, inventory, distance, transport, infrastructure, time and risk.

Strategic map selection does not teleport goods; trade requires logistics capacity.

---

# 10. Contracts and Relationships

Repeated successful exchange may develop into stronger commercial relationships, including recurring contracts, preferred-supplier relationships, strategic partnerships, investment and, where eligible, acquisition/concession.

Contracts must define real counterparties, obligations, quantities/service capacity, settlement, deadlines/quality conditions and failure consequences.

---

# 11. Player Marketplace, Tradable Fragments and Physical Fulfillment

The player-facing marketplace may support governed listings for eligible:

- physical consumer/business goods;
- raw materials and production inputs;
- produced items/resources;
- collectible inventory items;
- **Specialist Card Fragments** defined by `04_World/NPC.md`;
- other explicitly tradable World-Instance inventory.

A marketplace listing is an offer to transact. It is not authorization to teleport inventory from seller to buyer.

For any physical marketplace item, including tradable Specialist Card Fragments when represented as inventory objects, a successful match must create or bind to a governed logistics/custody lifecycle:

`listing -> buyer/seller commitment -> inventory reservation -> pickup -> custody -> transport -> delivery/acceptance -> market settlement`.

The authoritative buyer inventory must not receive the physical item until the delivery/custody contract reaches its valid acceptance/settlement boundary.

Same-locality, inter-city, national and later international marketplace trades therefore generate real logistics demand according to available transport/infrastructure rather than instant remote transfer.

A seller, buyer, employed courier, independent courier or logistics company may participate only where the applicable capability/market rules allow it. The market does not grant free transport capacity.

## Specialist Card Fragment trading

Specialist Card Fragments may be bought, sold or exchanged as governed in-game inventory.

Trading an already-existing fragment transfers inventory; it does not create a new fragment merely because the item was transported again.

Completing a fragment set unlocks the recruitment/discovery consequence defined by `04_World/NPC.md`. A market purchase therefore cannot bypass wages, locality, availability, training, facility or company capability requirements associated with the specialist person.

The fragment marketplace is an in-game progression/economic system. It does not imply blockchain, NFT ownership, cryptocurrency or real-money value.

## Anti-farming and wash-trade boundary

Marketplace activity must not create infinite progression through self-dealing or circular resale.

In particular:

- the same fragment cannot exist in two inventories after settlement;
- repeated resale does not remint source-earned fragments;
- self-to-self or collusive wash trades must not mint unexplained XP, entity loyalty, fragments or money;
- marketplace delivery rewards must derive from legitimate delivery/work settlement, not from the resale price alone;
- contested multiplayer transactions must become server-authoritative before real-player trading is enabled.

Exact fees, listing limits, exchange ratios, fragment prices and delivery charges are balancing data.

---

# 12. Events and Market Change

Events may alter real market state through:

- demand changes;
- supply loss/surplus;
- transport disruption;
- labor shortage;
- infrastructure failure;
- seasonal production;
- tourism/festival demand;
- reconstruction/emergency needs.

Events do not simply multiply mission rewards. They change the causal economy from which opportunities emerge.

---

# 13. World Instance Isolation

Each World Instance owns its own market history, prices, inventories, companies, contracts and productive capacity.

A mature world's market power cannot be imported into a fresh world.

Future national currencies/FX remain World-Instance-local economic state.

---

# 14. Historical Prototype Boundary

Early Prototype scopes used limited zones, basic customer demand and static market values.

Those remain historical/legacy implementation assumptions only.

The target canonical market is dynamic and stock-flow driven. Runtime migration must occur in staged tested slices rather than silently reinterpreting old save data.

---

# 15. Playability Boundary

The market exists to create meaningful choices, not compulsory spreadsheet analysis.

Early players should see simple work/need information. Advanced procurement, pricing, regional trade and analytics should become visible when the player's profession/company capability requires them.

---

# Canonical Rule

**DROPi Tycoon markets expose and match real modeled supply, demand, inventory, production, service and logistics capacity. Opportunities arise because economic actors need or offer something; prices and competition respond to actual conditions; and the market may surface opportunities but may not invent unexplained rewards, infinite supply, infinite demand or teleported trade. Physical marketplace goods — including tradable Specialist Card Fragments — change authoritative ownership only through a valid custody/delivery settlement.**

---

End of Document