# Document Information

Document: MARKET.md
Project: DROPi Tycoon
Version: 2.2.0
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

A missing logistics capability may itself create a legitimate service requirement. For example, a committed buyer/seller pair that cannot move the goods with its own feasible transport capacity may create demand for another eligible carrier.

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

A transaction that needs a third-party or multi-leg carrier must account for that logistics service as a real economic cost/revenue flow rather than silently absorbing the transport cost.

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

Transport companies may also compete to fulfill marketplace-generated delivery requirements that the buyer/seller cannot serve themselves.

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
- route feasibility or unresolved transport requirement;
- competitor/carrier capacity;
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

Different transport modes have different governed reach and infrastructure requirements under `03_Logistics/ROUTING.md` and `03_Logistics/VEHICLES.md`.

---

# 10. Contracts and Relationships

Repeated successful exchange may develop into stronger commercial relationships, including recurring contracts, preferred-supplier relationships, strategic partnerships, investment and, where eligible, acquisition/concession.

Contracts must define real counterparties, obligations, quantities/service capacity, settlement, deadlines/quality conditions and failure consequences.

A physical trade may therefore include more than two economic counterparties: buyer, seller and one or more logistics providers may each have separate obligations and settlement.

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

`listing -> buyer/seller commitment -> inventory reservation -> route/capability feasibility -> carrier/leg assignment -> pickup -> custody -> transport/transfers -> delivery/acceptance -> market settlement`.

The authoritative buyer inventory must not receive the physical item until the delivery/custody contract reaches its valid acceptance/settlement boundary.

Same-locality, inter-city, national and later international marketplace trades therefore generate real logistics demand according to available transport/infrastructure rather than instant remote transfer.

A seller, buyer, employed courier, independent courier or logistics company may participate only where the applicable capability/market rules allow it. The market does not grant free transport capacity.

## Transport feasibility before physical settlement

A matched trade is physically fulfillable only when at least one executable delivery chain can connect the source inventory to the recipient.

Feasibility may depend on:

- actual origin/destination;
- road/path/rail/water/air/drone network connectivity;
- vehicle/mode range/endurance;
- payload/handling compatibility;
- required operator/specialist capability;
- available company/worker capacity;
- transfer hubs/DronePorts/terminals where required;
- time/deadline;
- weather/restrictions where governed.

Canonical examples:

- a bicycle may serve only a bounded practical range and valid path network;
- a scooter may extend reach but still depends on its valid terrestrial network;
- a car/van/truck may serve longer road routes but cannot cross a missing road connection;
- a drone may serve some disconnected terrestrial points only when the full drone capability contract is valid;
- long-distance movement may require multiple vehicles, companies, hubs or modes.

Exact range values are balancing/runtime data, not universal prose constants.

If no executable delivery chain currently exists, the marketplace must not finalize physical ownership transfer. The transaction may remain awaiting carrier assignment, be rerouted, be cancelled/expire under its contract, or expose the missing transport requirement to the logistics market.

## Third-party carrier and multi-company fulfillment

The buyer and seller do not need to belong to the same delivery company, and neither must necessarily own the required transport mode.

A physical marketplace trade may be fulfilled by:

- seller-operated delivery;
- buyer pickup/self-collection where valid;
- the buyer's or seller's company;
- an independent courier;
- another player/company contracted specifically for the movement;
- several carriers/modes in a multi-leg custody chain.

Example:

Two players trade an item while operating in different companies and their locations are not connected by a usable road route. Neither company has valid drone capability. If a governed drone route is feasible, the unmet transport need may become a paid delivery opportunity for a third player/company that does have the necessary drone, operator/automation and infrastructure capability. The buyer receives the item only after that third-party logistics leg, and any other required legs, complete valid custody/acceptance settlement.

This is an intended source of emergent demand: marketplace exchange creates work for logistics providers when the trading parties lack the needed reach.

## Multi-leg settlement integrity

Each logistics leg may have a different carrier, mode, price, deadline and failure risk, but all legs must belong to one coherent cargo/custody plan.

A transfer point changes custody only through an explicit valid handoff. Failure of an intermediate leg must not duplicate the item or settle the buyer as though delivery succeeded.

Carrier fees/revenues and buyer/seller payment are separate economic flows and must be accounted for once.

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
- third-party delivery cannot duplicate buyer/seller settlement or source-earned progression rewards;
- contested multiplayer transactions must become server-authoritative before real-player trading is enabled.

Exact fees, listing limits, exchange ratios, fragment prices, transport ranges and delivery charges are balancing data.

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

Early players should see simple work/need information. Advanced procurement, pricing, regional trade, carrier sourcing and analytics should become visible when the player's profession/company capability requires them.

A player should be able to understand why a trade cannot currently be delivered and what capability/provider could make it possible.

---

# Canonical Rule

**DROPi Tycoon markets expose and match real modeled supply, demand, inventory, production, service and logistics capacity. Opportunities arise because economic actors need or offer something; prices and competition respond to actual conditions; and the market may surface opportunities but may not invent unexplained rewards, infinite supply, infinite demand or teleported trade. Physical marketplace goods — including tradable Specialist Card Fragments — change authoritative ownership only after a valid, executable custody/delivery chain completes; when buyer/seller capability is insufficient, the missing movement may become legitimate paid demand for third-party or multi-leg logistics providers.**

---

End of Document