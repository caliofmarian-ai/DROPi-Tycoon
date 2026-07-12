# Document Information

Document: ROUTING.md
Project: DROPi Tycoon
Version: 1.0.0
Status: Canonical
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-07-12

---

# Routing System

## Purpose

This document defines the route calculation system of DROPi Tycoon.

The routing system determines how delivery agents move between locations and how route decisions affect company performance.

Routing connects the world map, vehicles, delivery time, operational costs, and customer satisfaction.

---

# Routing Philosophy

A route is not only a path between two points.

A route represents a business decision.

Players must balance:

- Distance
- Time
- Cost
- Reliability
- Delivery priority

The shortest route is not always the best route.

---

# Core Routing Loop

The routing process follows:

Order Created

↓

Pickup Location

↓

Route Calculation

↓

Vehicle Assignment

↓

Travel

↓

Delivery Completion

↓

Performance Evaluation

---

# Route Attributes

Every route contains several attributes.

---

## Distance

Represents the physical length between locations.

Distance affects:

- Travel time
- Energy consumption
- Vehicle usage
- Delivery cost

---

## Travel Time

Represents the estimated time required to complete a route.

Travel time depends on:

- Distance
- Vehicle type
- Traffic
- Weather
- Route efficiency

---

## Route Efficiency

Measures how effectively resources are used.

Efficient routes reduce:

- Costs
- Delays
- Vehicle wear

---

# Map Structure

The city is divided into zones.

Each zone contains:

- Roads
- Customers
- Businesses
- Delivery points
- Traffic conditions

The map structure allows future expansion.

---

# Traffic System

Traffic affects delivery performance.

For MVP:

Traffic is represented by simple modifiers.

Examples:

Low traffic:

- Normal travel speed

High traffic:

- Increased travel time

---

# Weather Impact

Weather may affect routes.

Examples:

Rain:

- Reduced bicycle efficiency

Extreme weather:

- Increased delivery time

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

# Automated Routing

Future versions may include AI-assisted routing.

The AI system may consider:

- Multiple active orders
- Vehicle availability
- Traffic
- Weather
- Customer priority
- Cost optimization

---

# Route Failures

Unexpected events may affect routes.

Examples:

- Road closure
- Vehicle breakdown
- Traffic accident
- Weather disruption

Failures create strategic challenges.

---

# MVP Routing Scope

The first playable version includes:

- Basic map
- Pickup and delivery points
- Distance calculation
- Travel time calculation
- Simple route selection

No advanced AI optimization is required initially.

---

# Future Expansion

Possible future systems:

- Real-time traffic simulation
- AI route optimization
- Multi-stop deliveries
- Fleet routing
- Autonomous navigation
- Drone flight paths

---

# Balance Principles

The routing system must:

- Be understandable
- Create meaningful choices
- Reward optimization
- Support future complexity

---

# Canonical Rule

Routing exists to transform transportation into a strategic decision.

Every route should have consequences that affect company performance.

---

End of Document