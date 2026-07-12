# Document Information

Document: PROTOTYPE_V0.1.md
Project: DROPi Tycoon
Version: 1.0.0
Status: Development Milestone Definition
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-07-12

---

# DROPi Tycoon Prototype v0.1

## Purpose

This document defines the first playable prototype of DROPi Tycoon.

The purpose of Prototype v0.1 is to validate the core gameplay experience before adding advanced systems.

The prototype should prove that the main game loop is fun, understandable, and expandable.

---

# Prototype Vision

The player starts as a small delivery company owner.

The objective is to complete deliveries, earn money, improve operations, and grow the company.

The prototype focuses on the feeling of:

"Starting small and building a logistics empire."

---

# Prototype Scope

## Included Systems

Prototype v0.1 contains:

- Basic game world
- Player company
- Delivery orders
- Simple transportation
- Basic economy
- Company progression
- Local Save & Load system (minimal; see `06_Technical/SAVE_SYSTEM.md`)

---

# Core Gameplay Loop

**Canonical Ownership:** This document (PROTOTYPE_V0.1.md) is the single canonical owner of the Prototype v0.1 gameplay loop.

- `09_Development/CORE_GAMEPLAY_SYSTEMS.md` describes the systems that participate in this loop; it does not independently define a competing canonical loop.
- `09_Development/GAMEPLAY_EVENTS_FLOW.md` describes the technical event representation of this loop; it does not redefine Prototype v0.1 gameplay scope.
- `09_Development/FIRST_PLAYABLE_EXPERIENCE.md` describes the tutorial and first-session presentation of this loop; it does not replace or redefine it.
- `01_GameDesign/GAMEPLAY.md` owns the general and long-term gameplay loop; it does not govern Prototype v0.1 scope.

---

## Happy Path

```
Receive Order
[Order is Available and presented to the player]
      ↓
Accept Order
[Available → Accepted]
      ↓
Navigate to Pickup Location
      ↓
Pick Up Package
[Accepted → PickedUp]
      ↓
Navigate to Destination
      ↓
Deliver Package
[PickedUp → Completed]
      ↓
Receive Payment
      ↓
Repeat
```

Order lifecycle state transitions follow the canonical definition in `03_Logistics/ORDERS.md`.

---

## Failure Branch

```
PickedUp
      ↓
Delivery fails
[PickedUp → Failed]
      ↓
Display existing failure and reputation consequences
      ↓
Return to Receive Order
```

No numeric penalties or failure thresholds are defined here; those are balancing decisions.

---

## Optional Management Branch

After Receive Payment, the player may optionally open Company Management:

```
Receive Payment
      ↓
Optional: Open CompanyManagement
      ↓
Optional: Purchase an available upgrade
      ↓
Return to Repeat
```

Company management is not a mandatory step in every delivery cycle.

---

## Bicycle Relationship

The Bicycle is:

- not a mandatory core-loop step;
- not starting equipment;
- a one-time progression milestone purchased through the optional management branch after sufficient on-foot delivery income;
- used to increase movement speed during navigation after purchase.

Price and persistence details are governed by `09_Development/PROTOTYPE_V0.1.md` (Transportation System section) and `09_Development/GAME_BALANCING_RULES.md`.

---

## Save & Load Relationship

Save & Load is background technical behavior and is not a visible mandatory gameplay-loop step.

Autosave occurs according to `06_Technical/SAVE_SYSTEM.md`, including after meaningful completed actions such as delivery completion, upgrade purchase, and progression changes.

---

# Player Experience

The player should understand:

- How to complete a delivery
- How money is earned
- How improvements are purchased
- How the company grows

---

# World Prototype

The first world contains:

- One small city area
- Basic roads
- Delivery locations
- Simple buildings

The world exists to support gameplay, not realism.

---

# Delivery System

Prototype deliveries include:

## Order Creation

The game generates simple delivery requests.

Example:

- Pickup location
- Destination
- Reward

---

## Delivery Completion

A delivery is completed when:

- The player reaches the destination
- The package is delivered
- The order conditions are satisfied

---

# Transportation System

Prototype includes:

## Starting Transport

The player begins Prototype v0.1 on foot.

Walking is the only transportation method at the start of the game.

The Bicycle is not starting equipment.

---

## Bicycle — First Purchasable Vehicle

The Bicycle is included in Prototype v0.1 as the first purchasable vehicle and the first vehicle progression milestone.

Progression:

```
Player starts on foot
      ↓
Player completes initial deliveries
      ↓
Player earns money
      ↓
Player purchases the Bicycle
      ↓
Bicycle becomes owned persistently
      ↓
Bicycle increases movement speed
```

Rules:

- The player earns money through initial on-foot deliveries.
- The Bicycle is purchased using earned money through the existing upgrade/shop interaction.
- After purchase, the player moves faster, improving delivery efficiency.
- Bicycle ownership is persisted through Save & Load using the existing upgrade purchase persistence system (see `06_Technical/SAVE_SYSTEM.md`).
- No exact purchase price is defined here; price is set during the balancing phase consistent with `09_Development/GAME_BALANCING_RULES.md`.
- No advanced vehicle mechanics (maintenance, fuel, damage, enter/exit animation) are required for Prototype v0.1.

No further vehicles are required for Prototype v0.1.

---

# Economy System

Prototype economy includes:

## Income

Player receives money from completed deliveries.

## Expenses

Basic costs may include:

- Vehicle cost
- Upgrade cost

---

# Company Progression

The player can improve the company.

Prototype upgrades:

- Faster delivery
- More capacity
- Better efficiency

---

# UI Requirements

Prototype UI should display:

- Current money
- Active order
- Delivery status
- Available upgrades

The interface should remain simple.

---

# AI Scope

Prototype AI includes only:

- Basic order generation
- Simple customer behavior

Advanced AI systems are not included.

---

# Systems Not Included

The following are intentionally excluded:

- Drone delivery
- DronePorts
- Multiple cities
- Multiplayer
- Advanced economy
- Complex AI agents
- Real-world logistics simulation

These systems remain future expansion ideas.

---

# Prototype Success Criteria

Prototype v0.1 is successful if:

The player can:

1. Start a company.
2. Receive an order.
3. Complete a delivery.
4. Earn money.
5. Upgrade the company.
6. Repeat the gameplay loop.

---

# Development Priority

The priority order is:

1. Gameplay loop
2. Delivery system
3. Economy feedback
4. Basic UI
5. Progression

Visual quality is secondary.

---

# Canonical Rule

Prototype v0.1 exists to prove the core DROPi Tycoon gameplay loop.

Do not add complexity until the basic experience is enjoyable.

---

End of Document