# Document Information

Document: LOGISTICS_DESIGN.md
Project: DROPi Tycoon
Version: 1.1.0
Status: Canonical — Logistics Design Authority
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-09-08

---

# DROPi Tycoon Logistics Design

## Purpose

This document is the canonical strategic Logistics Design owner for DROPi Tycoon.

It defines how real economic needs, goods, parcels, people, vehicles, hubs, facilities, infrastructure, qualifications, and transport modes form one coherent logistics network from local last-mile work to regional, international, and very-late-game off-world logistics.

Authority order:

`VISION` -> `UNIVERSE_DESIGN` -> `BUSINESS_DESIGN` -> `LOGISTICS_DESIGN` -> `GDD` -> `03_Logistics/*` specializations.

This document is reconciled with `00_Project/PHASE1_GAME_ARCHITECTURE_DECISION_BASELINE.md` and the stock-flow authority in `02_Economy/ECONOMY.md`.

Detailed order state machines, vehicle parameters, route algorithms, drone rules, DronePort rules, and implementation contracts remain owned by `03_Logistics/*` and Technical Design.

---

# 1. Logistics Identity

Logistics in DROPi Tycoon is the controlled movement and custody of economically meaningful goods through a living world.

A logistics service is not only movement from A to B. It coordinates:

- a real need/production/consumption requirement;
- demand/procurement;
- cargo/inventory;
- custody;
- qualified people or autonomous agents;
- vehicles;
- routes;
- transfer hubs;
- storage;
- time;
- cost;
- capacity;
- reliability;
- infrastructure;
- customer/recipient expectations;
- settlement and downstream consequence.

The strongest logistics network is not necessarily the fastest. It balances service quality, cost, capacity, resilience, compliance/capability and strategic reach.

---

# 2. Canonical Logistics Flow

The strategic logistics flow is:

**Need / Production / Consumption Requirement -> Demand / Procurement -> Order / Contract -> Cargo Definition -> Inventory Commitment -> Custody -> Assignment -> Route / Leg Plan -> Transport -> Transfer / Storage -> Final Delivery -> Settlement -> Consumption / Use / Production Input -> Feedback -> Economic / World Consequence.**

Where use/consumption creates waste or depleted inventory, that may generate the next logistics requirement.

Every advanced logistics system must extend this flow rather than create an unrelated transportation/reward economy.

A completed delivery must not create unexplained money merely because a waypoint was reached.

---

# 3. Cargo and Custody

Goods and parcels are physical/custody-bearing logistics entities.

At meaningful transfer points, the simulation must be able to answer:

- what is being moved;
- quantity/category/handling requirements;
- economic owner/counterparties where relevant;
- who currently has custody;
- where it is located;
- which vehicle/agent is responsible;
- which route leg is active;
- whether storage or transfer is occurring;
- what conditions/deadlines apply;
- what order/contract/need caused the movement.

Cargo must not silently teleport between unrelated locations merely because a management action occurred.

Abstraction is permitted for performance and game pacing, but custody transitions must remain deterministic and economically equivalent.

---

# 4. Cargo Capability Differences

Cargo categories should create different operating choices rather than only different labels.

Possible requirements include:

- mass/volume;
- parcel count;
- fragile handling;
- time sensitivity;
- refrigeration/cold-chain;
- security/value;
- hazardous/special handling;
- pallet/forklift/warehouse handling;
- medical priority;
- waste/reverse-logistics handling;
- legal/authorization abstractions where later modeled.

A job may therefore require the right combination of personal qualification, company specialist capability, equipment, vehicle, infrastructure and route access.

---

# 5. Delivery Legs

Complex logistics is represented as one or more connected delivery legs.

A leg may connect:

- household/customer to merchant;
- merchant to courier;
- supplier/farm/factory to warehouse;
- warehouse to regional gateway;
- airport/port/rail/highway gateway to a local company;
- DronePort to delivery point;
- city to city;
- country to country;
- future planetary gateway to another world.

Each leg may have its own transport mode, operator, vehicle, capacity, cost, time, risk and service requirement.

Multi-leg logistics must preserve one coherent cargo/custody chain.

---

# 6. Transport Progression

Transport grows from personal local movement toward coordinated multimodal networks.

Canonical families include:

## Human / Last-Mile

- walking;
- bicycle;
- electric scooter;
- motorcycle;
- car;
- delivery van;
- future specialized terrestrial vehicles.

## Company Fleet / Urban Logistics

- multiple assigned vehicles;
- employee-operated routes;
- fleet scheduling;
- maintenance;
- parcel staging;
- sorting;
- warehouse operations.

## Drone Logistics

- drone delivery;
- DronePort operations;
- launch/landing;
- battery/energy support;
- remote/autonomous routing;
- human operator oversight where required.

## Regional / Inter-City

- highway and road freight;
- public/contracted road transport;
- rail freight;
- regional distribution centers;
- inter-city transfer hubs.

## Air / Maritime

- airport cargo terminals;
- aircraft/air cargo;
- river ports;
- sea ports;
- ships and maritime cargo.

## International / Global

- customs/cross-border gameplay abstractions;
- international hubs;
- multimodal transfer chains;
- regional/world network coordination.

## Frontier / Off-World

- future space gateways;
- orbital/planetary transport;
- very-late-game interplanetary custody/infrastructure.

No transport family is automatically available merely because it appears in long-term canon.

---

# 7. Qualification + People + Equipment + Infrastructure Gate

Advanced logistics capability is unlocked by the intersection of:

**qualified people + valid equipment/vehicles + required infrastructure + valid economic demand/cargo.**

Examples:

- owning a drone does not automatically make drone operations usable without qualified operation and DronePort capability;
- owning an aircraft does not replace pilot/air-cargo qualifications and airport access;
- owning rail assets does not create a rail network without compatible infrastructure/operations;
- a warehouse does not create useful throughput without staff, inventory, routes, handling capacity and demand.

Money is necessary for many investments but cannot bypass all progression gates.

---

# 8. Human Operator / Autonomous Vehicle Separation

A human player/employee and an autonomous/remote vehicle are separate entities.

For drone operations in particular:

- the human operator remains at a valid operational context when required;
- the drone is the moving logistics actor;
- cargo belongs to the drone/custody chain while in flight;
- the game must not turn the human courier into a flying drone avatar.

The same principle applies to future remote/autonomous terrestrial, maritime, rail, air or frontier systems where appropriate.

---

# 9. Logistics Hubs

Hubs connect transport modes, custody, storage and company operations.

Canonical hub families may include:

- company HQ;
- parcel staging/sorting area;
- warehouse;
- distribution center;
- fixed/mobile DronePort where valid;
- highway/inter-city gateway;
- rail terminal;
- airport cargo terminal;
- river port;
- sea port;
- future space/planetary gateway.

A hub may provide storage, transfer capacity, sorting, vehicle assignment, charging/refueling/maintenance, customs/regulatory abstractions, route consolidation, specialist workstations and service revenue.

Hubs must exist as world/infrastructure entities where physical presence matters.

---

# 10. HQ and Warehouse Relationship

The HQ is a company's organizational/operational center when that company legitimately has one. It is not a starting entitlement of the poor employee phase.

As a company grows, an HQ may coordinate dispatch, fleet handoff, staff, parcel staging, maintenance, specialist departments, DronePort capability, and communication with warehouses/regional hubs.

Warehouses/distribution centers extend capacity beyond the HQ rather than replacing its organizational role.

---

# 11. Capacity

Every logistics network has finite capacity.

Capacity may depend on:

- people and Work Capacity/shift availability;
- vehicle payload/count;
- warehouse space;
- sorting/hub throughput;
- route congestion;
- energy/fuel;
- maintenance state;
- weather/restrictions;
- infrastructure access;
- cargo handling requirements.

Demand above capacity must create choices, delays, outsourcing, prioritization, expansion pressure or service-quality consequences rather than invisible infinite throughput.

---

# 12. Service Trade-Offs

Logistics decisions should create trade-offs among speed, cost, capacity, reliability, energy burden, handling quality, range, flexibility, infrastructure and specialist requirements.

No transport mode should permanently invalidate every earlier mode.

Walking, bicycles, vans, drones, rail, air, sea and future modes remain useful under different conditions.

---

# 13. Local Logistics

The local city remains the first complete logistics laboratory.

The player should first understand:

- obtaining valid work from the employer/work app;
- pickup;
- custody;
- route choice;
- physical Work Capacity constraints;
- delivery/handoff;
- recipient/world feedback;
- wage/settlement explanation;
- capacity and cost;
- the visible effect of satisfying a real need.

The early player is an employee, not automatically the owner of the paying company.

---

# 14. Regional and Multi-City Logistics

Multi-city growth must not be implemented as one giant always-running map.

The active area remains bounded while the wider network persists as lower-frequency strategic/economic state.

Example:

**external producer -> regional transport -> airport/rail/port terminal -> company pickup -> warehouse/HQ -> local courier/drone -> recipient/use.**

Every transfer preserves cargo identity/custody/economic semantics.

---

# 15. Travel vs Cargo Movement

Strategic map selection does not teleport the person or cargo economically.

People and cargo change location through valid transport/infrastructure with time, capacity and cost.

Time compression may be used for long-distance player travel where required for mobile usability, but the economic/logistics consequences remain.

---

# 16. Infrastructure Control and Fair Access

Companies may gain strategic logistics advantages by building, financing, leasing, operating, owning or holding concessions around infrastructure.

Benefits may include capacity, lower cost, route priority, service revenue, new transport access and greater reach.

Essential gateways remain subject to fair-access rules.

One company must not permanently prevent a locality/country from using essential roads, rail, airports, ports, utilities or progression gateways.

---

# 17. Products, Production and Trade

Goods create logistics demand through real production/consumption.

A product lifecycle may create movements such as:

**raw materials / farm / supplier -> production -> storage -> distribution -> merchant/consumer/industrial user -> consumption/use -> waste/recycling/replenishment demand.**

Regional scarcity/surplus can generate strategic routes and business opportunities.

Products must not become passive abstract income disconnected from inputs, inventory, physical logistics, capacity and buyers.

---

# 18. Reverse Logistics and Waste

The logistics network also moves goods backward or away from consumption sites.

Examples:

- returns;
- reusable packaging;
- damaged goods;
- waste;
- recycling materials;
- maintenance/repair parts;
- expired/controlled stock where later modeled.

Reverse logistics obeys custody, capacity, cost and destination rules like forward logistics.

---

# 19. Reliability and Recovery

Logistics networks can fail/degrade through congestion, insufficient capacity, maintenance problems, weather, staff shortages, infrastructure disruption, missed transfers, financial distress, routing mistakes, supply shortage or invalid cargo capability.

Failure should create consequences and recovery decisions.

No normal logistics failure should permanently delete human identity/core capability or create an unrecoverable world softlock.

---

# 20. Automation and AI

Automation improves coordination and scale but does not remove underlying logistics rules.

AI-assisted/autonomous systems may optimize assignment, routes, demand forecasting, sorting, fleet use, maintenance planning and multimodal transfers.

They still consume real capacity, infrastructure, vehicles, inventory, energy/cost and specialist capability where required.

Automation must not become unexplained unlimited passive income.

---

# 21. Multiplayer Logistics Authority

Shared-world cargo, vehicles, infrastructure, warehouses, markets or deliveries require trusted/server-authoritative state before multiple real players can contest/transfer ownership/custody.

Online authority must prevent duplicate cargo, double settlement, conflicting custody, fabricated vehicle/infrastructure state and client-authoritative money creation.

The local domain should be designed so online authority extends it rather than replacing it.

---

# 22. Real-World Boundary

Tycoon logistics is a fictional simulation.

The game may be inspired by recognizable logistics concepts, but it must not claim live carrier integrations, real airline/port/rail contracts, real customs compliance, real DronePort permissions, real-world delivery guarantees, or unconfirmed real DROPi infrastructure.

---

# 23. Specialization Ownership

Detailed owners include:

- `03_Logistics/LOGISTICS.md` — core logistics gameplay;
- `03_Logistics/ORDERS.md` — orders;
- `03_Logistics/ROUTING.md` — routing;
- `03_Logistics/VEHICLES.md` — vehicle rules;
- `03_Logistics/DRONES.md` — drone rules;
- `03_Logistics/DRONEPORTS.md` — DronePort rules;
- `02_Economy/*` — stock-flow, money, market/cost effects;
- `04_World/*` — physical world/infrastructure;
- `06_Technical/*` — implementation, performance, persistence and authority.

---

# Canonical Rule

**Every DROPi Tycoon logistics capability must preserve a coherent causal chain from real need through demand, inventory/cargo, custody, qualified operators, vehicles, infrastructure, capacity, transport legs, settlement and final use/consequence. Scale may grow from one walking employee to global multimodal networks, but logistics can never become an isolated waypoint-reward economy.**

---

End of Document
