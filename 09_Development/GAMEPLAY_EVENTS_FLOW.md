# Document Information

Document: GAMEPLAY_EVENTS_FLOW.md
Project: DROPi Tycoon
Version: 1.0.0
Status: Prototype Technical Design
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-07-12

---

# Gameplay Events Flow

## Purpose

This document defines how gameplay events communicate inside DROPi Tycoon Prototype v0.1.

The goal is to create a clear event-based structure suitable for implementation in GDevelop.

---

## Scope and Ownership

This document describes the technical event representation of the canonical Prototype v0.1 gameplay loop.

It does not independently redefine Prototype v0.1 gameplay scope.

The canonical ordered Prototype v0.1 loop is defined in and owned by `09_Development/PROTOTYPE_V0.1.md`.

---

# Event System Philosophy

Gameplay systems should communicate through events.

A system should not directly control another system.

Example:

Delivery System does not directly add money.

Instead:

Delivery Completed Event

↓

Economy System receives event

↓

Reward is added

---

# Main Event Flow

The core gameplay sequence:

```
Player Action

↓

Game Event Created

↓

Relevant System Processes Event

↓

Game State Updated

↓

UI Feedback Displayed
```

---

# Order Creation Flow

## Event

New Order Generated

---

## Process

1. Game creates delivery request.
2. Order receives unique ID.
3. Order becomes available.
4. UI displays order information.

---

## Result

Player can accept the order.

---

# Order Acceptance Flow

## Event

Player Accepts Order

---

## Process

1. Check if player can accept order.
2. Change order status.
3. Assign package.
4. Update player objective.

---

## Result

Delivery mission starts.

---

# Package Pickup Flow

## Event

Player Reaches Pickup Location

---

## Process

1. Check active order.
2. Verify correct location.
3. Change package status.

---

## Result

Package is now carried by player.

---

# Delivery Completion Flow

## Event

Player Reaches Destination

---

## Process

1. Verify package.
2. Verify destination.
3. Complete order.
4. Calculate reward.

---

## Result

Delivery Completed Event is created.

---

# Economy Event Flow

## Event

Delivery Completed

---

## Process

1. Add money reward.
2. Increase company reputation.
3. Update statistics.

---

## Result

Player receives feedback.

---

# Upgrade Flow

## Event

Player Purchases Upgrade

---

## Process

1. Check available money.
2. Remove cost.
3. Apply upgrade effect.
4. Update company data.

---

## Result

Company improves.

---

# UI Event Flow

UI receives information from systems.

Examples:

Delivery Completed:

```
Delivery System

↓

UI Notification

↓

"Delivery Completed +50 money"
```

---

# Error Events

The game should also handle failures.

Examples:

## Delivery Failed

Possible reasons:

- Wrong destination
- Cancelled order
- Time exceeded

---

## Purchase Failed

Possible reason:

- Not enough money

---

# Event Naming Rules

Events should use clear names.

Examples:

Good:

```
OrderAccepted
DeliveryCompleted
UpgradePurchased
```

Bad:

```
Event1
ActionDone
Update
```

---

# MVP Event List

Required events:

```
GameStarted

OrderCreated

OrderAccepted

PackagePickedUp

DeliveryCompleted

DeliveryFailed

MoneyReceived

UpgradePurchased
```

---

# Order Lifecycle Event-to-Transition Mapping

The following maps each Order lifecycle event to its canonical state transition.

| Event | Source State | Target State | Notes |
|---|---|---|---|
| `OrderCreated` | — | `Created` | Initializes the Order in Created state. |
| (system-driven) | `Created` | `Available` | The Created → Available transition is system-driven in Prototype v0.1. No separate named event exists. The Order becomes Available immediately after creation. |
| `OrderAccepted` | `Available` | `Accepted` | Player accepts the order. |
| `PackagePickedUp` | `Accepted` | `PickedUp` | Player reaches pickup location and collects the package. |
| `DeliveryCompleted` | `PickedUp` | `Completed` | Player delivers the package to the correct destination. |
| `DeliveryFailed` | `PickedUp` | `Failed` | Order cannot be completed (time exceeded, wrong destination, or system failure). |

Terminal states: `Completed`, `Failed`. No cancellation events or assignment events exist in Prototype v0.1.

See `03_Logistics/ORDERS.md` for the canonical Order lifecycle definition.

---

# Future Events

Possible additions:

```
DroneActivated

WeatherChanged

CityExpanded

AIRecommendationCreated
```

---

# Development Rules

Events should:

- Have one clear purpose
- Be easy to debug
- Avoid unnecessary complexity

---

# Canonical Rule

Events are the communication language of DROPi Tycoon systems.

A clear event structure keeps the game scalable.

---

End of Document