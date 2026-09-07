# Document Information

Document: LOGISTICS_DESIGN.md
Project: DROPi Tycoon
Version: 1.0.0
Status: Canonical — Logistics Design Authority
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-09-07

---

# DROPi Tycoon Logistics Design

## Purpose

This document is the canonical strategic Logistics Design owner for DROPi Tycoon.

It defines how goods, parcels, people, vehicles, hubs, facilities, infrastructure, qualifications, and transport modes form one coherent logistics network from local last-mile work to regional, international, and very-late-game off-world logistics.

Authority order:

`VISION` -> `UNIVERSE_DESIGN` -> `BUSINESS_DESIGN` -> `LOGISTICS_DESIGN` -> `GDD` -> `03_Logistics/*` specializations.

Detailed order state machines, vehicle parameters, route algorithms, drone rules, DronePort rules, and implementation contracts remain owned by `03_Logistics/*` and Technical Design.

---

# 1. Logistics Identity

Logistics in DROPi Tycoon is the controlled movement and custody of goods through a living economic world.

A logistics service is not only movement from A to B. It coordinates:

- demand;
- cargo;
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
- customer expectations.

The strongest logistics network is not necessarily the fastest. It is the network that balances service quality, cost, capacity, resilience, and strategic reach.

---

# 2. Canonical Logistics Flow

The strategic flow is:

**Demand -> Order/Contract -> Cargo Definition -> Custody -> Assignment -> Route/Leg Plan -> Transport -> Transfer/Storage -> Final Delivery -> Feedback -> Economic Consequence.**

Every advanced logistics system must extend this flow rather than create an unrelated transportation economy.

---

# 3. Cargo and Custody

Goods and parcels are physical logistics entities.

At meaningful transfer points, the simulation must be able to answer:

- what is being moved;
- who currently has custody;
- where it is located;
- which vehicle/agent is responsible;
- which route leg is active;
- whether storage or transfer is occurring;
- what conditions or deadlines apply.

Cargo must not silently teleport between unrelated locations merely because a management action occurred.

Abstraction is permitted for performance and game pacing, but custody transitions must remain deterministic and understandable.

---

# 4. Delivery Legs

Complex logistics is represented as one or more connected delivery legs.

A leg may connect:

- customer to local merchant;
- merchant to courier;
- hub to HQ;
- HQ to customer;
- warehouse to regional gateway;
- airport/port/rail/highway gateway to a local company;
- DronePort to delivery point;
- city to city;
- country/world to country/world;
- future planetary gateway to another world.

Each leg may have its own:

- transport mode;
- responsible agent/operator;
- vehicle;
- capacity;
- cost;
- time;
- risk;
- service requirement.

Multi-leg logistics must preserve one coherent cargo/custody chain.

---

# 5. Transport Progression

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
- very-late-game interplanetary custody and infrastructure.

No transport family is automatically available merely because it appears in long-term canon.

---

# 6. Qualification + People + Infrastructure Gate

Advanced logistics capability is unlocked by the intersection of three truths:

**Qualified people + valid equipment/vehicles + required infrastructure.**

Examples:

- owning a drone does not automatically make drone operations legal/usable in the game if no qualified operator or DronePort capability exists;
- owning an aircraft does not replace pilot/air-cargo qualifications and airport access;
- owning rail assets does not create a rail network without compatible infrastructure and qualified operations;
- a warehouse does not create useful throughput without staff, demand, routes, and handling capacity.

Money is necessary for many investments but cannot bypass all progression gates.

---

# 7. Human Operator / Autonomous Vehicle Separation

A human player or employee and an autonomous/remote vehicle are separate entities.

For drone operations in particular:

- the human operator remains at a valid operational context when required;
- the drone is the moving logistics actor;
- the parcel belongs to the drone/cargo chain while in flight;
- the game must not turn the human courier into a flying drone avatar.

The same principle applies to future remote/autonomous terrestrial, maritime, rail, or space systems where appropriate.

---

# 8. Logistics Hubs

Hubs connect transport modes, custody, storage, and company operations.

Canonical hub families may include:

- company HQ;
- parcel staging/sorting area;
- warehouse;
- distribution center;
- fixed DronePort;
- mobile DronePort where canonically valid;
- highway/inter-city gateway;
- rail terminal;
- airport cargo terminal;
- river port;
- sea port;
- future space/planetary gateway.

A hub may provide:

- storage;
- transfer capacity;
- sorting;
- vehicle assignment;
- charging/refueling/maintenance support;
- customs/regulatory abstractions;
- route consolidation;
- specialist workstations;
- service revenue.

Hubs must exist as world/infrastructure entities where their physical presence matters.

---

# 9. HQ and Warehouse Relationship

The HQ begins as the company's local operational center.

As the company grows, it may coordinate:

- dispatch;
- fleet handoff;
- staff;
- parcel staging;
- maintenance;
- specialist departments;
- local DronePort capability;
- communication with warehouses and regional hubs.

Warehouses and distribution centers extend capacity beyond the HQ rather than replacing the HQ's organizational role.

See `01_GameDesign/HQ_PROGRESSION.md` and `04_World/BUILDINGS.md`.

---

# 10. Capacity

Every logistics network has finite capacity.

Capacity may depend on:

- people;
- vehicle payload;
- vehicle count;
- shift/availability;
- warehouse space;
- sorting throughput;
- hub throughput;
- route congestion;
- energy/fuel;
- maintenance state;
- weather/restrictions;
- infrastructure access.

Demand above capacity must create operational choices, delays, outsourcing, prioritization, expansion pressure, or service-quality consequences rather than invisible infinite throughput.

---

# 11. Service Trade-Offs

Logistics decisions should create trade-offs among:

- speed;
- cost;
- capacity;
- reliability;
- environmental/energy burden where modeled;
- handling quality;
- range;
- flexibility;
- infrastructure requirements;
- specialist requirements.

No transport mode should permanently invalidate every earlier mode.

Walking, bicycles, vans, drones, rail, air, sea, and future modes remain useful under different operating conditions.

---

# 12. Local Logistics

The local city remains the first complete logistics laboratory.

The player should first understand:

- accepting work;
- pickup;
- custody;
- route choice;
- vehicle choice;
- delivery;
- customer feedback;
- capacity;
- money/reputation consequence.

Company management, employees, fleet, HQ departments, and local marketplace demand expand this same foundation.

---

# 13. Regional and Multi-City Logistics

Multi-city growth must not be implemented as one giant always-running map.

The active city/region remains bounded while the wider network persists as lower-frequency or abstract state where appropriate.

Inter-city cargo can arrive through transfer gateways and then continue through local company legs.

Example:

**External supplier -> regional transport -> airport cargo terminal -> company pickup -> HQ/warehouse -> local courier/drone -> customer.**

Every transfer preserves cargo identity/custody semantics.

Issue #344 is a staged implementation vehicle for this direction, not a mandate to implement the complete network at once.

---

# 14. Infrastructure Control and Fair Access

Companies may gain strategic logistics advantages by building, financing, leasing, operating, or holding concessions around infrastructure.

Benefits may include:

- additional capacity;
- lower cost;
- route priority;
- service revenue;
- new transport access;
- greater geographic reach.

Critical gateways remain subject to `UNIVERSE_DESIGN.md` fair-access rules.

One company must not permanently prevent an entire world from using airports, ports, rail, roads, or other essential progression infrastructure.

---

# 15. Products and Trade

Company-produced or merchant goods create logistics demand.

A product lifecycle may create movements such as:

**materials/supplier -> production -> storage -> distribution -> marketplace/merchant -> customer.**

Regional demand and scarcity can generate strategic routes and business opportunities.

Products must not become passive abstract income disconnected from physical logistics unless a clearly defined abstraction preserves equivalent cost/capacity consequences.

---

# 16. Reliability and Recovery

Logistics networks can fail or degrade through simulated causes such as:

- congestion;
- insufficient capacity;
- maintenance problems;
- weather;
- staff shortages;
- infrastructure disruption;
- missed transfers;
- financial distress;
- routing mistakes.

Failure should create consequences and recovery decisions.

No normal logistics failure should permanently destroy core player progression without a governed recovery path.

---

# 17. Automation and AI

Automation improves coordination and scale but does not remove the underlying logistics rules.

AI-assisted or autonomous systems may optimize:

- assignment;
- routes;
- demand forecasting;
- sorting;
- fleet use;
- maintenance planning;
- multimodal transfers.

They still consume real modeled capacity, infrastructure, vehicles, energy/cost, and specialist capability where required.

Automation must not become unexplained unlimited passive income.

---

# 18. Multiplayer Logistics Authority

Shared-world cargo, vehicles, infrastructure, warehouses, markets, or deliveries require server-authoritative state before multiple real players can contest or transfer ownership/custody.

Online authority must prevent:

- duplicate cargo;
- double settlement;
- conflicting custody;
- fabricated vehicle state;
- fabricated infrastructure access;
- client-authoritative money creation.

The local/single-player domain should be designed so online authority can extend it rather than replace it.

---

# 19. Real-World Boundary

Tycoon logistics is a fictional simulation.

The game may be inspired by recognizable logistics concepts, but it must not claim:

- live carrier integrations;
- real airline/port/rail contracts;
- real customs compliance;
- real DronePort permissions;
- real-world delivery guarantees;
- real DROPi infrastructure that has not been confirmed by real DROPi canon.

---

# 20. Specialization Ownership

This document owns strategic logistics truths.

Detailed owners include:

- `03_Logistics/LOGISTICS.md` — core logistics gameplay system;
- `03_Logistics/ORDERS.md` — orders;
- `03_Logistics/ROUTING.md` — routing;
- `03_Logistics/VEHICLES.md` — vehicle rules;
- `03_Logistics/DRONES.md` — drone rules;
- `03_Logistics/DRONEPORTS.md` — DronePort rules;
- `02_Economy/*` — money/cost/market effects;
- `04_World/*` — physical world and infrastructure;
- `06_Technical/*` — implementation, performance, persistence and server authority.

---

# Canonical Rule

**Every DROPi Tycoon logistics capability must preserve a coherent chain of demand, cargo, custody, qualified operators, vehicles, infrastructure, capacity, transport legs, transfer points, economic cost, and customer consequence. Scale may grow from one walking courier to planetary networks, but the underlying logistics truth must remain understandable.**

---

End of Document
