# Document Information

Document: MOBILE_UI_CONTROLS.md
Project: DROPi Tycoon
Version: 1.0.0
Status: Prototype Technical Design
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-07-12

---

# Mobile UI Controls

## Purpose

This document defines the mobile control system for DROPi Tycoon Prototype v0.1.

The goal is to create a simple and comfortable experience designed specifically for smartphone users.

---

# Mobile Design Philosophy

The game should feel natural on a touchscreen device.

Controls must be:

- Simple
- Fast
- Easy to understand
- Comfortable for long sessions

---

# Control Method

## Primary Control

Touch-based interaction.

The player interacts through:

- Screen taps
- Touch movement
- Buttons
- Menus

---

# Player Movement

## MVP Movement Option

The prototype uses simple mobile movement.

Possible controls:

### Virtual Joystick

The player moves using a touch joystick.

Advantages:

- Familiar to mobile players
- Precise control
- Easy implementation

---

### Tap To Move

The player taps a location and the character moves there.

Advantages:

- Simple
- Suitable for strategy gameplay

---

# Recommended MVP Choice

Prototype v0.1:

Use:

## Tap To Move

Reason:

- Easier for first prototype
- More suitable for management games
- Reduces control complexity

---

# Main Interface Layout

The screen contains:

```
+----------------------+
| Money   Level        |
|                      |
|                      |
|      GAME MAP        |
|                      |
|                      |
| Order Information    |
| Action Buttons       |
+----------------------+
```

---

# Information Display

The player should always see:

## Company Status

- Money
- Level
- Reputation

---

## Active Order

Display:

- Pickup location
- Destination
- Reward

---

# Action Buttons

Prototype buttons:

## Accept Order

Function:

Accept available delivery.

---

## Deliver

Function:

Complete delivery interaction.

---

## Upgrade

Function:

Open company upgrade menu.

---

# Interaction System

When the player touches an interactive object:

Examples:

Building:

Show:

- Building name
- Available action

Delivery point:

Show:

- Pickup or destination information

---

# Camera System

## MVP Camera

Features:

- Follow player
- Smooth movement
- Basic zoom

---

# Mobile Performance Rules

The interface should avoid:

- Too many animations
- Heavy effects
- Complex menus

---

# User Feedback

Every important action should provide feedback.

Examples:

Order accepted:

"New delivery started"

Delivery completed:

"Delivery successful +50 money"

Upgrade purchased:

"Company improved"

---

# Accessibility

The UI should consider:

- Different screen sizes
- Clear text
- Large touch targets

---

# Future Mobile Features

Possible additions:

- Gesture controls
- Notifications
- Mobile achievements
- Cloud save

---

# MVP Requirements

The first version requires:

- Touch interaction
- Simple navigation
- Clear information
- Basic buttons

---

# Canonical Rule

Mobile controls must make the player feel like a company manager, not a person fighting with the interface.

---

End of Document