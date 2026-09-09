# Document Information

Document: VEHICLES.md
Project: DROPi Tycoon
Version: 1.1.0
Status: Canonical
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-09-09

---

# Vehicle System

## Purpose

This document defines the vehicle system of DROPi Tycoon.

Vehicles represent transportation tools used by people and companies to complete logistics work.

The vehicle system connects logistics efficiency, company growth, operating costs, route reachability, infrastructure access, marketplace fulfillment and strategic decisions.

---

# Vehicle Philosophy

Vehicles are not only transportation methods.

Each vehicle represents a business decision and a bounded logistics capability.

Players must consider:

- Purchase cost
- Operating cost
- Speed
- Capacity
- Range/endurance
- Reliability
- Maintenance
- Required infrastructure/path type
- Operator/qualification requirements
- Suitable delivery types

The best vehicle depends on the company's strategy and on whether the vehicle can actually execute the route.

---

# Vehicle Progression

Vehicle progression follows personal/company evolution.

Early vehicles provide accessibility.

Advanced vehicles provide greater reach, efficiency, payload, specialization and scalability.

A more advanced vehicle does not automatically invalidate earlier modes; short urban trips, narrow access, cost, energy, terrain and infrastructure can keep walking, bicycles and small vehicles useful.

---

# Vehicle Categories

## Personal Transportation

Used during the early game.

Purpose:

Allow the player to perform deliveries personally within the mode's governed reach and network access.

Examples:

- Walking
- Bicycle

Advantages:

- Low cost
- Easy access

Disadvantages:

- Limited speed
- Limited capacity
- Limited practical delivery range

---

## Light Delivery Vehicles

Used when capability expands.

Examples:

- Electric scooter
- Small motorcycle

Advantages:

- Faster deliveries
- Increased daily capacity
- Greater practical delivery reach than walking/bicycle where roads/paths permit

Disadvantages:

- Higher operating costs
- Infrastructure/access restrictions

---

## Cars and Delivery Vans

Used for professional road logistics operations.

Advantages:

- Higher capacity
- Longer routes
- Business contracts

Disadvantages:

- Higher purchase/operating cost
- Maintenance requirements
- Dependence on usable road connectivity/access

---

## Heavy / Specialized Road Vehicles

Future trucks and specialized cargo vehicles extend payload and long-distance road capability.

They require compatible roads, access, handling infrastructure, operators and cargo conditions. A truck cannot reach a destination that has no compatible road path merely because it has long range.

---

## Drones and Other Non-Road Modes

Drones are a distinct transport family rather than a faster road vehicle.

A drone may serve an eligible origin/destination pair without a road path when all governed constraints are met, including range/endurance, payload, energy, operator/automation capability, launch/landing or DronePort requirements, weather and game authorization.

Rail, maritime and air vehicles similarly require their own network, gateway and operator capabilities.

---

# Vehicle Attributes

Every vehicle has common or mode-specific attributes.

## Purchase Cost

Initial investment required to acquire the vehicle.

---

## Speed

Determines travel time when the route is otherwise feasible.

Higher speed may improve delivery efficiency.

---

## Capacity

Determines how much compatible cargo can be transported.

Capacity may include package count, mass, volume and handling constraints.

---

## Range / Endurance

Represents the maximum governed operating reach before charging, refueling, rest, maintenance or another required replenishment/transfer.

Range is a feasibility constraint, not just a cosmetic statistic.

A bicycle, scooter, car, van, truck or drone may therefore be suitable for different route lengths. Exact numeric limits are balancing/runtime data and must be tuned with map scale, time compression, energy and playability rather than hardcoded into this canonical document.

A route beyond one vehicle's single-leg range may still be possible through a governed transfer, hub, recharge/refuel or multi-leg chain.

---

## Infrastructure Compatibility

Each transport mode requires compatible physical/network access.

Examples:

- terrestrial road vehicles require a usable connected road/path graph appropriate to that vehicle;
- rail vehicles require rail network and terminal access;
- maritime vehicles require navigable waterways/ports where applicable;
- air vehicles require compatible air/airport infrastructure;
- drones require valid launch/landing/DronePort and flight capability under the drone authority.

Straight-line geographical proximity does not override missing infrastructure.

---

## Operating Cost

Continuous cost generated during usage.

Examples:

- Energy
- Fuel
- Maintenance
- Tolls/access/service charges where later governed

---

## Reliability

Represents operational reliability and risk.

Lower reliability increases breakdown/delay risk.

---

## Condition

Vehicle condition decreases through usage.

Poor condition affects:

- Speed
- Reliability
- Range/efficiency where modeled
- Customer satisfaction

---

# Vehicle Maintenance

Vehicles require maintenance.

Maintenance prevents or reduces:

- Breakdowns
- Delivery delays
- Increased operating costs
- Range/capability degradation where modeled

Players must balance repair expenses versus vehicle replacement or fleet expansion.

---

# Vehicle Assignment

Vehicles can be assigned to:

- Player
- Employees
- NPC workers
- Future automated systems

Assignment requires the assigned operator/system and company to satisfy the relevant capability rules.

A marketplace buyer or seller does not need to personally own the delivery vehicle if a legitimate third-party logistics provider supplies the required transport service.

---

# Third-Party Logistics Capability

Vehicle ownership and transaction ownership are separate.

When a seller and buyer cannot physically move marketplace cargo with their own available fleet/capability, the unmet movement can create legitimate paid work for another logistics provider.

Examples:

- two local parties may contract a bicycle/scooter/van courier when within that mode's feasible network/range;
- a longer road movement may require a car, van, truck or multi-leg road chain;
- if there is no usable road connection but a valid drone route exists, an eligible drone company may become the carrier;
- if no single provider can cover the entire path, multiple carriers/modes may be chained through valid custody transfers.

The transport service has its own cost/revenue/capacity. It is not free simply because the marketplace transaction exists.

---

# Vehicle Upgrades

Future versions may introduce upgrades.

Examples:

- Better batteries
- Larger storage
- Improved navigation
- Safety systems
- Energy efficiency

Upgrades may improve capability within governed limits but cannot bypass missing physical infrastructure or required qualifications.

---

# MVP Vehicle Scope

The first playable version includes:

## Walking

Starting transportation method.

Purpose:

Tutorial and first deliveries.

---

## Bicycle

Early earned/purchased transport progression.

Purpose:

Increase personal delivery reach and capacity.

---

No advanced vehicle systems are required for the first prototype.

The canonical reachability/range model above may be introduced incrementally but later implementations must not assume every vehicle can serve every pair of locations.

---

# Future Expansion

Possible future vehicles:

- Electric scooters
- Motorcycles
- Cars
- Vans
- Trucks
- Autonomous vehicles
- Delivery robots
- Drones
- Specialized cargo vehicles
- Rail/air/maritime fleets under their respective authorities

---

# Balance Principles

Vehicle systems must:

- Create meaningful investment decisions
- Support different strategies
- Scale with company growth
- Preserve distinct range/capacity/infrastructure niches
- Generate outsourcing opportunities when a company lacks the needed mode
- Avoid unnecessary complexity

---

# Canonical Rule

Vehicles are bounded logistics capabilities, not universal movement permissions.

**A vehicle may execute a delivery leg only when its range/endurance, payload, operator/company capability and required infrastructure/path are valid. Missing capability may be supplied by another legitimate carrier or multi-leg chain, but no vehicle or marketplace action may bypass an absent route by teleporting cargo.**

---

End of Document