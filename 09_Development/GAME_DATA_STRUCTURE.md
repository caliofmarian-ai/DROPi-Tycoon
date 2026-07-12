# Document Information

Document: GAME_DATA_STRUCTURE.md
Project: DROPi Tycoon
Version: 1.0.0
Status: Prototype Technical Design
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-07-12

---

# Game Data Structure

## Purpose

This document defines the internal data organization for DROPi Tycoon Prototype v0.1.

The goal is to create a simple but expandable data system for the game.

---

# Data Philosophy

Game data should be:

- Organized
- Easy to modify
- Easy to balance
- Ready for future expansion

---

# Main Data Categories

The prototype uses five main data groups:

```
PlayerData

CompanyData

OrderData

WorldData

GameSettings
```

---

# Player Data

## Purpose

Stores information about the player character.

---

## PlayerData Structure

Example:

```
PlayerData

Name

Position

CurrentOrder

CarryingPackage

MovementSpeed
```

---

## MVP Player Data

Required:

- Position
- Current active order
- Movement speed

Persistence: Position is persisted only if required for the chosen prototype flow. Current active order is not restored on load; it is cancelled and reset. See `06_Technical/SAVE_SYSTEM.md`.

---

# Company Data

## Purpose

Stores company progression information.

---

## CompanyData Structure

Example:

```
CompanyData

CompanyName

Money

Level

Experience

Reputation

UpgradeList
```

---

## MVP Company Data

Required:

- Company name
- Money
- Level
- Reputation

Persistence: These fields are persisted to the local save. See `06_Technical/SAVE_SYSTEM.md`.

---

# Order Data

## Purpose

Stores delivery requests.

---

## OrderData Structure

Example:

```
OrderData

OrderID

PickupLocation

Destination

Reward

Status

Difficulty
```

---

## Order Status

Possible values:

```
Created

Available

Accepted

PickedUp

Completed

Failed
```

---

# World Data

## Purpose

Stores information about the game environment.

---

## WorldData Structure

Example:

```
WorldData

CurrentMap

Buildings

DeliveryPoints

ActiveCustomers
```

---

## MVP World Data

Required:

- Delivery locations
- Interactive buildings

Persistence: WorldData is not persisted. It is regenerated on load. See `06_Technical/SAVE_SYSTEM.md`.

---

# Upgrade Data

## Purpose

Stores company improvements.

---

## Upgrade Structure

Example:

```
Upgrade

Name

Cost

Level

Effect
```

---

## MVP Upgrades

Initial upgrades:

```
DeliverySpeed

Capacity

Efficiency
```

Persistence: Purchased upgrade levels are persisted to the local save. See `06_Technical/SAVE_SYSTEM.md`.

---

# Game Settings

## Purpose

Stores general game configuration.

---

## GameSettings

Contains:

```
Language

Sound

Music

Difficulty

TutorialStatus
```

Persistence: TutorialStatus is persisted to the local save. Language, Sound, Music, and Difficulty settings persistence is defined in `06_Technical/SAVE_SYSTEM.md`.

---

# Data Communication

Systems should read and update data through defined structures.

Example:

Delivery Completed:

```
Delivery System

↓

OrderData Updated

↓

CompanyData Money Increased

↓

UI Updated
```

---

# Variable Naming Rules

Use clear names.

Good:

```
CompanyMoney

CurrentOrder

DeliveryReward
```

Bad:

```
Value1

Data2

Number
```

---

# MVP Data Priority

Required first:

1. PlayerData
2. OrderData
3. CompanyData
4. WorldData

---

# Future Data Expansion

Possible additions:

- VehicleData
- DroneData
- EmployeeData
- CityData
- MarketData

---

# Data Safety Rules

Avoid:

- Duplicate information
- Unclear variables
- Hard-coded values everywhere

---

# Canonical Rule

A clean data structure allows DROPi Tycoon to grow from a simple prototype into a larger simulation game.

---

End of Document