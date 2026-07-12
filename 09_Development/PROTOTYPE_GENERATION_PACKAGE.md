# Document Information

Document: PROTOTYPE_GENERATION_PACKAGE.md
Project: DROPi Tycoon
Version: 1.0.0
Status: AI Generation Specification
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-07-12

---

# Prototype Generation Package

## Purpose

This document defines the content required to generate the first automated DROPi Tycoon Prototype package.

The objective is to create a complete foundation that can be opened and expanded in GDevelop.

---

# Generation Philosophy

The first generated package is not the final game.

It is a functional prototype foundation.

Priority:

1. Working gameplay
2. Clean structure
3. Easy expansion
4. Visual improvement later

---

# Prototype Package Contents

The generated package should contain:

```
DROPi_Tycoon_Prototype/

Project Files

Scenes

Objects

Events

Variables

Assets

Documentation
```

---

# Scene Package

## MainMenu Scene

Purpose:

Entry point of the game.

Contains:

- Game title
- Start button
- Settings button

---

## GameWorld Scene

Purpose:

Main playable environment.

Contains:

- Map
- Player
- Buildings
- Delivery points
- Camera

---

## CompanyManagement Scene

Purpose:

Company interface.

Contains:

- Money display
- Upgrades
- Company information

---

# Object Package

Required objects:

## Player

Contains:

- Position
- Movement behavior
- Interaction ability

---

## Package

Contains:

- Package state
- Pickup status
- Delivery status

---

## Building

Contains:

- Location type
- Interaction point

---

## DeliveryPoint

Contains:

- Pickup location
- Destination location

---

# Event Package

Required event groups:

```
PlayerEvents

OrderEvents

DeliveryEvents

EconomyEvents

UIEvents
```

---

# Variable Package

Required variables:

## Player Data

```
PlayerPosition

CurrentOrder

CarryingPackage
```

---

## Company Data

```
CompanyMoney

CompanyLevel

CompanyReputation
```

---

## Order Data

```
OrderID

OrderStatus

OrderReward

PickupPoint

Destination
```

---

# First Prototype Gameplay

The generated package must allow:

1. Start game.
2. Enter world.
3. Receive order.
4. Accept order.
5. Pick up package.
6. Deliver package.
7. Receive reward.

---

# Generation Restrictions

The first package must not include:

- Drone systems
- Multiplayer
- Advanced AI
- Large cities
- Complex economy

These belong to future versions.

---

# Validation Before Acceptance

The generated prototype must be checked for:

## Structure

- Files organized correctly
- No missing components

## Gameplay

- Delivery loop works

## Performance

- Mobile friendly

## Documentation

- Changes recorded

---

# Version Output

The first generated version:

```
DROPi Tycoon Prototype v0.1
```

---

# Future Expansion Compatibility

The package should allow future additions:

- Vehicles
- Drone delivery
- DronePorts
- Larger maps
- Advanced simulation

without rebuilding the foundation.

---

# Canonical Rule

The first generated package must prove the gameplay idea before expanding the vision.

---

End of Document