# Document Information

Document: PROTOTYPE_RELEASE_CHECKLIST.md
Project: DROPi Tycoon
Version: 1.0.0
Status: Prototype Validation
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-07-12

---

# Prototype Release Checklist

## Purpose

This document defines the requirements that must be completed before releasing DROPi Tycoon Prototype v0.1.

The purpose is to verify that the prototype delivers a complete and understandable gameplay experience.

---

## Canonical Completion Gate Authority

**This document is the authoritative final completion gate for Prototype v0.1.**

- Prototype v0.1 is complete only when the required checklist items in this document are satisfied and human approval is recorded where required.
- Completing milestones alone does not declare the prototype complete.
- Passing individual tests alone does not declare the prototype complete.
- Meeting scope or success criteria alone does not declare the prototype complete.
- The final readiness decision is made here, not in any other document.

Cross-references:

- `09_Development/PROTOTYPE_V0.1.md` owns Prototype v0.1 scope and feature inclusion.
- `09_Development/PROTOTYPE_TESTING_PLAN.md` owns test procedures and validation evidence.
- `09_Development/PROTOTYPE_MILESTONES.md` owns implementation milestone sequencing.

---

---

# Release Philosophy

A prototype release does not need to be a finished game.

It must prove that:

- The main idea works.
- The gameplay loop is functional.
- The player understands the experience.
- The project can continue expanding.

---

# 1. Project Stability

## Checklist

- [ ] Project opens correctly in GDevelop
- [ ] No critical errors
- [ ] Game launches successfully
- [ ] Main scene loads correctly
- [ ] No broken references

---

# 2. Core Gameplay Checklist

## Player

- [ ] Player can enter the game world
- [ ] Player can move
- [ ] Player can interact with objects

---

## Orders

- [ ] Orders can be generated
- [ ] Player can accept an order
- [ ] Active order is displayed

---

## Delivery

- [ ] Package can be collected
- [ ] Destination can be reached
- [ ] Delivery can be completed

---

## Economy

- [ ] Player receives rewards
- [ ] Money value updates correctly
- [ ] Upgrade costs work

---

# 3. User Interface Checklist

Verify:

- [ ] Money is visible
- [ ] Active order is visible
- [ ] Buttons are functional
- [ ] Messages are understandable
- [ ] Interface works on mobile screens

---

# 4. Mobile Experience Checklist

Verify:

- [ ] Touch controls work
- [ ] Buttons are easy to press
- [ ] Text is readable
- [ ] Performance is acceptable
- [ ] Game works on different screen sizes

---

# 5. Balance Checklist

Verify:

- [ ] Starting resources are reasonable
- [ ] First delivery is achievable
- [ ] Rewards feel meaningful
- [ ] First upgrade is reachable
- [ ] Progress feels motivating

---

# 6. Quality Checklist

Verify:

- [ ] No gameplay-breaking bugs
- [ ] No confusing interactions
- [ ] Player understands the objective
- [ ] The first five minutes are enjoyable

---

# 7. Save & Load Checklist

Verify (see `06_Technical/SAVE_SYSTEM.md` for specification):

- [ ] Progress is saved after delivery completion
- [ ] Progress is saved after upgrade purchase
- [ ] Game restores correct state on next launch (Continue)
- [ ] Closing and reopening the game does not lose earned money or upgrades
- [ ] Start New Game when no save exists works without error
- [ ] Start New Game when a valid save exists requires confirmation before overwriting
- [ ] Corrupted or unreadable save does not crash the game
- [ ] Player is informed when progress cannot be restored
- [ ] Confirmation is required before replacing an invalid save with a new game

---

# Prototype Completion Criteria

DROPi Tycoon Prototype v0.1 is ready when:

The player can:

1. Start a company.
2. Enter the world.
3. Receive an order.
4. Complete a delivery.
5. Earn money.
6. Upgrade the company.
7. Continue playing.

---

# Not Required For Prototype Release

The following are intentionally excluded:

- Drone delivery
- DronePorts
- Multiple cities
- Multiplayer
- Advanced AI agents
- Complex economy simulation

---

# Final Review Questions

Before release, ask:

## Gameplay

Is the core loop fun?

## Clarity

Does the player understand what to do?

## Progression

Does improvement feel rewarding?

## Future

Can the project expand without rebuilding the foundation?

---

# Canonical Rule

A successful prototype proves the idea.

It does not need to contain the entire vision.

---

End of Document