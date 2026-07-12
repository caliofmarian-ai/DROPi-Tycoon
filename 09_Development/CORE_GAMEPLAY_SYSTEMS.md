# Document Information

Document: CORE_GAMEPLAY_SYSTEMS.md
Project: DROPi Tycoon
Version: 1.0.0
Status: Prototype Design
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-07-12

---

# Core Gameplay Systems

## Purpose

This document defines the core gameplay systems required for DROPi Tycoon Prototype v0.1.

The goal is to create a simple but complete gameplay experience where the player can operate a small delivery company.

---

# Gameplay Philosophy

The first prototype focuses on one main question:

"Is managing a growing delivery company fun?"

Every system must support this experience.

---

# Core Gameplay Loop

The main gameplay cycle:

```
Create Order
      ↓
Accept Order
      ↓
Collect Package
      ↓
Deliver Package
      ↓
Receive Reward
      ↓
Improve Company
      ↓
Unlock Better Opportunities
      ↓
Repeat
```

---

# System 1: Order System

## Purpose

Creates delivery opportunities for the player.

---

## Order Data

Each order contains:

- Order ID
- Pickup location
- Delivery location
- Reward value
- Time requirement
- Status

---

## Order States

Possible states:

```
Created

↓

Available

↓

Accepted

↓

In Progress

↓

Completed
```

---

## MVP Order Rules

The prototype supports:

- Simple delivery requests
- One active order at a time
- Fixed rewards

---

# System 2: Delivery System

## Purpose

Controls package transportation and completion.

---

## Delivery Flow

1. Player accepts order.
2. Player goes to pickup location.
3. Package is collected.
4. Player travels to destination.
5. Package is delivered.
6. Reward is calculated.

---

## Delivery Success

A delivery succeeds when:

- Correct package is delivered.
- Correct destination is reached.
- Order conditions are fulfilled.

---

# System 3: Player Movement

## Purpose

Allows the player to interact with the world.

---

## MVP Movement

Initial implementation:

- Simple character movement
- Touch-friendly controls
- Map navigation

---

# System 4: Economy System

## Purpose

Controls company growth.

---

## Income

Money is earned from:

- Completed deliveries

---

## Expenses

Prototype expenses:

- Upgrades
- Equipment

---

## Economy Goal

The player should clearly understand:

More successful deliveries = More company growth.

---

# System 5: Upgrade System

## Purpose

Creates progression.

---

## Initial Upgrades

Prototype upgrades:

### Delivery Speed

Effect:

Faster completion.

---

### Carry Capacity

Effect:

Future ability to handle more packages.

---

### Company Efficiency

Effect:

Improved rewards.

---

# System 6: Reputation System

## Purpose

Represents customer trust.

---

## Reputation Changes

Increases:

- Successful deliveries
- Fast service

Decreases:

- Failed deliveries
- Poor service

---

# System 7: Progression System

## Purpose

Defines company growth.

---

## Progression Example

Level 1:

Small delivery service

↓

Level 2:

More orders available

↓

Level 3:

New vehicles unlocked

---

# MVP Exclusions

Not included:

- Drone delivery
- Complex AI
- Multiple cities
- Multiplayer
- Real-time economy

---

# Implementation Priority

Development order:

1. Player movement
2. Order creation
3. Package pickup
4. Delivery completion
5. Reward system
6. Upgrade system
7. UI feedback

---

# System Communication

Systems communicate through simple events.

Example:

Delivery Complete Event

↓

Economy receives event

↓

Reward added

↓

Progression updated

↓

UI displays feedback

---

# Design Principles

Systems must be:

- Simple
- Modular
- Easy to test
- Easy to expand

---

# Canonical Rule

The core gameplay systems exist to prove the delivery company fantasy.

The first goal is a fun gameplay loop, not maximum complexity.

---

End of Document