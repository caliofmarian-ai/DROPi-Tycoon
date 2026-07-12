# Document Information

Document: PROTOTYPE_TESTING_PLAN.md
Project: DROPi Tycoon
Version: 1.0.0
Status: Prototype Quality Assurance
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-07-12

---

# Prototype Testing Plan

## Purpose

This document defines the testing strategy for DROPi Tycoon Prototype v0.1.

The purpose of testing is to verify that the first playable version is:

- Functional
- Understandable
- Stable
- Enjoyable

---

# Testing Philosophy

Testing is not only about finding bugs.

Testing should answer:

"Does the player experience the game as intended?"

---

# Testing Categories

The prototype will be tested in several areas.

---

# 1. Gameplay Testing

## Purpose

Verify that the main gameplay loop works.

---

## Test Flow

The tester should be able to:

1. Start the game.
2. Create or receive an order.
3. Accept the order.
4. Pick up the package.
5. Deliver the package.
6. Receive payment.
7. Purchase an upgrade.

---

## Success Criteria

The complete gameplay loop works without interruption.

---

# 2. System Testing

## Order System

Verify:

- Orders are created correctly.
- Orders can be accepted.
- Order status changes correctly.

---

## Delivery System

Verify:

- Pickup works.
- Delivery works.
- Completion is detected.

---

## Economy System

Verify:

- Rewards are added.
- Costs are removed.
- Money values update correctly.

---

## Upgrade System

Verify:

- Upgrades can be purchased.
- Upgrade effects are applied.

---

# 3. Persistence Testing

## Purpose

Verify that player progress is correctly saved and restored.

See `06_Technical/SAVE_SYSTEM.md` for the canonical save/load specification.

---

## Test Cases

- Save after delivery completion: close and reopen game; verify money and progression are restored.
- Save after upgrade purchase: close and reopen game; verify upgrade state is restored.
- Close game without a save trigger: verify last saved state is restored on next launch.
- Start new game when no save exists: verify game initializes correctly without error.
- Start new game when a valid save exists: verify confirmation is required; verify no silent overwrite occurs.
- Corrupted save file: verify game does not crash; verify player is informed; verify confirmation is required before new game.
- Missing save file: verify game starts new game without error or crash.

---

## Success Criteria

- Player progress is never lost due to normal game exit.
- No crash or undefined behavior occurs from missing or invalid save data.

---

# 4. User Experience Testing

## Purpose

Verify that players understand the game.

Questions:

- Is the objective clear?
- Are controls easy?
- Are notifications understandable?
- Does progression feel rewarding?

---

# 5. Mobile Testing

## Devices

Test different:

- Screen sizes
- Performance levels
- Touch responses

---

## Mobile Requirements

Verify:

- Buttons are easy to press.
- Text is readable.
- Controls feel natural.
- Performance is acceptable.

---

# 6. Balance Testing

Verify:

- Starting money is appropriate.
- Rewards feel meaningful.
- Upgrades are achievable.
- Progression speed is enjoyable.

---

# 7. Bug Classification

Bugs are classified as:

## Critical

Game cannot continue.

Example:

- Crash
- Lost progress
- Broken gameplay loop

---

## Major

Important feature does not work correctly.

Example:

- Delivery cannot complete

---

## Minor

Small issues.

Example:

- Visual problems
- Text errors

---

# Testing Reports

Each discovered issue should include:

- Description
- Steps to reproduce
- Expected result
- Actual result
- Priority

---

# Prototype Completion Criteria

DROPi Tycoon Prototype v0.1 is considered complete when:

## Gameplay

- Core delivery loop works.

## Economy

- Rewards and upgrades function.

## UI

- Player understands the game.

## Stability

- No critical bugs remain.

---

# Testing Order

Recommended order:

1. Core gameplay
2. Delivery system
3. Economy
4. UI
5. Save & Load persistence
6. Mobile performance
7. Final player experience

---

# Future Testing Expansion

Possible future systems:

- Automated testing
- Player analytics
- A/B testing
- Community feedback

---

# Canonical Rule

Testing exists to protect the player experience.

A feature is not complete until it works and feels right.

---

End of Document