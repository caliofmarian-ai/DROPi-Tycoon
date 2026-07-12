# Document Information

Document: TDD.md
Project: DROPi Tycoon
Version: 1.0.0
Status: Canonical
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-07-12

---

# Test Driven Development

## Purpose

This document defines the testing methodology used during DROPi Tycoon development.

The purpose of TDD is to ensure that new gameplay systems are reliable, understandable, and compatible with the existing game architecture.

---

# TDD Philosophy

Development follows the principle:

## Define

Understand what the system should do.

↓

## Test

Create validation rules.

↓

## Implement

Build the system.

↓

## Improve

Optimize and expand safely.

---

# Testing Goals

Testing should verify:

- Gameplay correctness
- System stability
- Economic balance
- Player experience
- Compatibility between systems

---

# Testing Categories

## System Tests

Verify that individual game systems work correctly.

Examples:

- Order creation
- Vehicle movement
- Economy calculations
- Weather effects

---

## Integration Tests

Verify that systems work together.

Examples:

Order System

+

Vehicle System

+

Economy System

=

Successful Delivery Loop

---

## Gameplay Tests

Verify the player experience.

Questions:

- Is the mechanic understandable?
- Is it fun?
- Is the progression balanced?
- Does it create meaningful decisions?

---

## Balance Tests

Verify economic values.

Examples:

- Delivery rewards
- Vehicle costs
- Upgrade prices
- Company growth speed

---

# Test Before Expansion

Before adding a new feature:

Check:

- Existing gameplay still works
- New feature has a clear purpose
- Complexity is justified

---

# Example Testing Flow

Feature:

New Vehicle Type

---

Define:

The vehicle should improve delivery capacity.

---

Test:

- Purchase works
- Cost is balanced
- Performance is correct
- Economy remains stable

---

Implement:

Add the vehicle system.

---

Improve:

Adjust based on gameplay feedback.

---

# Automated Testing

Future versions may include automated tests.

Possible targets:

- Economy calculations
- Simulation rules
- AI behavior
- Save systems

---

# Manual Testing

Early development relies heavily on manual testing.

The developer should verify:

- Game flow
- User interaction
- Visual feedback
- Fun factor

---

# Regression Testing

After changes, verify that existing systems are not damaged.

Important areas:

- Core game loop
- Economy
- Logistics
- Progression

---

# MVP Testing Scope

The first playable version requires testing of:

- Basic delivery loop
- Company growth
- Economy feedback
- Player progression

---

# Testing Principles

Testing must:

- Support development speed
- Protect existing features
- Improve quality
- Avoid unnecessary complexity

---

# Canonical Rule

Testing exists to protect gameplay quality and ensure that every new system improves DROPi Tycoon.

---

End of Document