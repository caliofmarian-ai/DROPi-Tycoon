# Document Information

Document: ROUTING.md
Project: DROPi Tycoon
Version: 1.1.0
Status: Canonical
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-09-09

---

# Routing System

## Purpose

This document defines the route calculation system of DROPi Tycoon.

The routing system determines how delivery agents move between locations and how route decisions affect company performance.

Routing connects the world map, vehicles, delivery time, operational costs, customer satisfaction, infrastructure reachability and marketplace fulfillment.

---

# Routing Philosophy

A route is not only a path between two points.

A route represents a business decision and an executable physical connection.

Players must balance:

- Distance
- Time
- Cost
- Reliability
- Delivery priority
- Vehicle/transport range
- Payload and handling capability
- Infrastructure compatibility
- Transfer requirements

The shortest route is not always the best route, and a straight-line distance does not prove that a usable route exists.

---

# Route Feasibility and Transport Connectivity

Before a delivery leg can be assigned, the simulation must determine whether the chosen transport mode can physically and operationally connect the leg endpoints.

A route is executable only when the relevant combination of world connectivity, transport capability, operator/company capability and cargo requirements is satisfied.

Canonical rules:

- walking and terrestrial vehicles require traversable ground/road/path connectivity appropriate to that mode;
- bicycles, scooters, cars, vans, trucks and other road vehicles cannot cross an absent or unusable road connection merely because origin and destination are geographically close;
- every transport mode has governed range/endurance, payload, access and operating constraints;
- exact numeric ranges belong to balancing/runtime data and must not be improvised in canonical prose;
- drones may connect eligible points without a road path only when drone range, payload, energy, operator/automation, launch/landing or DronePort, airspace/game authorization and weather/safety constraints are satisfied;
- rail, maritime and air legs require compatible terminals/gateways and network connectivity;
- a route may be multi-leg and may change transport mode or operator at governed transfer points;
- every transfer must preserve cargo identity and custody.

If no executable route exists with the buyer's, seller's or their companies' current capability, the goods do not teleport. The unmet transport requirement may instead become legitimate logistics demand for another eligible player/company or another transport mode.

A marketplace transaction may therefore remain awaiting fulfillment, be rerouted, be outsourced, or fail/cancel under its contract rules when no feasible delivery chain can be formed.

---

# Core Routing Loop

The routing process follows:

Order Created

↓

Pickup Location

↓

Transport/Infrastructure Feasibility

↓

Route Calculation

↓

Vehicle / Operator / Carrier Assignment

↓

Travel / Transfer Legs

↓

Delivery Completion

↓

Performance Evaluation

---

# Route Attributes

Every route contains several attributes.

---

## Reachability

Represents whether the origin and destination are connected by at least one valid path for the selected transport mode or multi-leg chain.

Reachability is a feasibility gate, not merely a time/cost modifier.

---

## Distance

Represents the physical length traveled along the selected route or route leg.

Distance affects:

- Travel time
- Energy consumption
- Vehicle usage
- Delivery cost
- Whether a vehicle/mode remains within governed range/endurance

---

## Travel Time

Represents the estimated time required to complete a route.

Travel time depends on:

- Distance
- Vehicle type
- Traffic
- Weather
- Route efficiency
- Transfers/handling where applicable

---

## Route Efficiency

Measures how effectively resources are used.

Efficient routes reduce:

- Costs
- Delays
- Vehicle wear

---

# Map Structure

The city/world is represented through governed transport topology rather than an assumption that every pair of points is directly connected.

A locality may contain:

- Roads
- Paths
- Customers
- Businesses
- Delivery points
- Traffic conditions
- Transfer hubs
- Transport-mode-specific infrastructure

The map structure allows future expansion while preserving real route connectivity.

---

# Traffic System

Traffic affects delivery performance.

For MVP:

Traffic is represented by simple modifiers.

Examples:

Low traffic:

- Normal travel speed

High traffic:

- Increased delivery time

---

# Weather Impact

Weather may affect routes.

Examples:

Rain:

- Reduced bicycle efficiency

Extreme weather:

- Increased delivery time
- Possible temporary transport-mode infeasibility where governed

Future versions may introduce more detailed weather simulation.

---

# Route Selection

The player or system may select routes.

Options:

## Fastest Route

Prioritizes delivery speed.

Advantages:

- Higher customer satisfaction

Disadvantages:

- May increase operational cost

---

## Cheapest Route

Prioritizes efficiency.

Advantages:

- Lower operating cost

Disadvantages:

- May increase delivery time

---

## Balanced Route

Attempts to optimize both factors.

---

## Capability-Feasible Route

Filters candidate routes and transport legs by physical connectivity, vehicle/mode constraints, operator/company capability and cargo requirements before speed/cost optimization is applied.

An infeasible route must not be selected merely because it is cheaper or shorter.

---

# Automated Routing

Future versions may include AI-assisted routing.

The AI system may consider:

- Multiple active orders
- Vehicle availability
- Traffic
- Weather
- Customer priority
- Cost optimization
- Multi-company or outsourced carrier capacity
- Multi-leg transfer points
- Modal reachability

Automation may discover a valid third-party/multimodal solution, but it cannot create transport capacity or infrastructure that does not exist.

---

# Route Failures

Unexpected events may affect routes.

Examples:

- Road closure
- Vehicle breakdown
- Traffic accident
- Weather disruption
- Missing transfer capacity
- Carrier cancellation

Failures create strategic challenges and may generate rerouting or replacement-carrier demand.

---

# Marketplace Routing Boundary

A matched physical marketplace trade is a transport requirement, not a completed transfer.

The transaction may be fulfilled by:

- the seller/player/company when capable;
- the buyer/player/company when pickup/self-collection is contractually valid and capable;
- another logistics company/player;
- multiple carriers/modes in a coherent custody chain.

Example:

If two players are far apart, their companies use only road transport, and no usable road path connects the required endpoints, a road delivery is infeasible. If a governed drone route is feasible but neither company owns/controls usable drone capability, the marketplace/logistics system may expose a paid drone-delivery requirement to a third eligible player/company. Only after that service is accepted and completed may the physical marketplace item settle to the buyer.

This principle applies equally to ordinary goods, production inputs, outputs, collectibles and Specialist Card Fragments.

---

# MVP Routing Scope

The first playable version includes:

- Basic map
- Pickup and delivery points
- Distance calculation
- Travel time calculation
- Simple route selection

Advanced multimodal/marketplace carrier sourcing may be implemented later, but new code must not contradict the feasibility contract above.

---

# Future Expansion

Possible future systems:

- Real-time traffic simulation
- AI route optimization
- Multi-stop deliveries
- Fleet routing
- Autonomous navigation
- Drone flight paths
- Multi-company carrier sourcing
- Multi-leg multimodal routing

---

# Balance Principles

The routing system must:

- Be understandable
- Create meaningful choices
- Reward optimization
- Respect real world/network connectivity
- Respect transport capability and range
- Create economic demand when a missing route capability can legitimately be outsourced
- Support future complexity

---

# Canonical Rule

Routing exists to transform transportation into a strategic and physically constrained decision.

**Every route used for economic settlement must be executable through valid transport capability and world connectivity. If the parties cannot provide that capability themselves, another carrier or multimodal chain may satisfy the demand; if no valid chain exists, the goods do not teleport and the transaction cannot physically settle.**

---

End of Document