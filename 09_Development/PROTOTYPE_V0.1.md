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

The main gameplay cycle:

```
Receive Order
      ↓
Choose Delivery Method
      ↓
Complete Delivery
      ↓
Receive Payment
      ↓
Upgrade Company
      ↓
Accept More Opportunities
      ↓
Repeat
```

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

## Basic Transport

Initial option:

- Walking or basic vehicle

Future vehicles are not required.

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