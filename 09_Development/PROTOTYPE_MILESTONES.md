# Document Information

Document: PROTOTYPE_MILESTONES.md
Project: DROPi Tycoon
Version: 1.0.0
Status: Development Roadmap
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-07-12

---

# Prototype Milestones

## Purpose

This document defines the development milestones for DROPi Tycoon Prototype v0.1.

The purpose is to transform the game concept into a playable experience through small, controlled steps.

---

# Development Philosophy

Each milestone should create a working improvement.

Do not build future systems before the current milestone is functional.

---

# Milestone 0 — Project Foundation

## Goal

Create a clean and working GDevelop project.

---

## Tasks

- Create GDevelop project
- Configure mobile orientation
- Create basic folder structure
- Import initial assets
- Verify project runs

---

## Completion Criteria

The empty game launches successfully.

---

# Milestone 1 — First World

## Goal

Create the first playable environment.

---

## Tasks

- Create GameWorld scene
- Add basic map
- Add buildings
- Add player object
- Add camera system

---

## Completion Criteria

The player can enter the world and move around.

---

# Milestone 2 — Delivery Prototype

## Goal

Create the first complete delivery interaction.

---

## Tasks

- Create order object
- Create pickup point
- Create destination point
- Add package interaction
- Complete delivery

---

## Completion Criteria

The player can successfully complete one delivery.

---

# Milestone 3 — Economy System

## Goal

Introduce company growth.

---

## Tasks

- Add money system
- Add delivery rewards
- Add upgrade costs
- Display company balance

---

## Completion Criteria

The player earns and spends money.

---

# Milestone 4 — Progression System

## Goal

Create motivation for continued play.

---

## Tasks

- Add company levels
- Add upgrades
- Add reputation system
- Add progression feedback

---

## Completion Criteria

The player can improve the company.

---

# Milestone 5 — Mobile Experience

## Goal

Optimize the game for smartphone users.

---

## Tasks

- Improve touch controls
- Adjust UI layout
- Test different screens
- Improve performance

---

## Completion Criteria

The game feels comfortable on mobile.

---

# Milestone 5.5 — Save & Load

## Goal

Implement the minimal local Save & Load system before prototype completion.

---

## Tasks

- Implement autosave after delivery completion
- Implement autosave after upgrade purchase
- Implement autosave after progression state change
- Implement load on Continue
- Implement new game guard (confirmation before overwriting valid save)
- Implement corrupted/missing save handling
- Verify all save/load test cases pass

See `06_Technical/SAVE_SYSTEM.md` for the canonical save/load specification.

---

## Completion Criteria

- Player progress is restored correctly after closing and reopening the game.
- No crash or data loss occurs due to missing or invalid save data.

---

# Milestone 6 — Prototype Complete

## Goal

Create the first complete playable version.

> **Milestone authority note:** This milestone represents implementation progress — the point at which all planned prototype features are implemented. It does not independently declare Prototype v0.1 complete for release. Final Prototype v0.1 completion is determined by `09_Development/PROTOTYPE_RELEASE_CHECKLIST.md`.

---

## Final Prototype Features

The player can:

- Start a company
- Receive orders
- Complete deliveries
- Earn money
- Upgrade the company
- Continue playing

---

# Excluded From Prototype

The following remain future features:

- Drone delivery
- DronePorts
- Multiple cities
- Advanced AI
- Multiplayer
- Complex economy

---

# Milestone Review Rules

After each milestone:

Check:

- Does it work?
- Does it improve gameplay?
- Is it stable?
- Is it necessary?

---

# Canonical Rule

Small completed steps create a stronger game than large unfinished systems.

---

End of Document