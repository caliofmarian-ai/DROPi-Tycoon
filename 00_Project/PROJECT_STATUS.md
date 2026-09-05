# Document Information

Document: PROJECT_STATUS.md
Project: DROPi Tycoon
Version: 1.3.0
Status: Active Development
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-09-05

---

# Project Status

## Current Phase

DROPi Tycoon has a working Phaser-based prototype with delivery gameplay, economy, company management, employees, financial reporting, customer reviews/reputation, save/load support, and mobile-oriented UI work already implemented.

The project is now entering a **mobile application foundation checkpoint** before further feature expansion.

---

# Current Objective

Implement GitHub Issue #295:

**Android application foundation with Expo Dev Client + Phaser runtime**

The immediate objective is to move Project Owner gameplay evaluation from Chrome/Railway to an installed Android development build while preserving the existing authoritative game runtime and gameplay rules.

This checkpoint also owns the companion camera/viewport corrections required for a real mobile-game experience.

---

# Canonical Platform Direction

DROPi Tycoon is a global mobile game and must stand on its own independently of the real DROPi application.

Primary product/review surface:

```text
Installed Android application
```

Secondary development/preview surface:

```text
Railway browser deployment
```

Current platform authority:

- `00_Project/VISION.md`
- `06_Technical/ARCHITECTURE.md`
- `06_Technical/MOBILE_APPLICATION_PLATFORM.md`

AI agents must not revive historical Web-First assumptions when they conflict with these live canonical documents.

---

# Current Runtime and Technology

## Authoritative Game Runtime

`game-web/`

Current implementation:

- Phaser 3
- TypeScript
- Vite
- deterministic game/domain systems and tests

The Phaser runtime remains the authoritative game implementation during the mobile migration.

## Current Web Deployment

Railway hosts the active browser build for preview, smoke testing, rapid remote checks, and development support.

The Railway/Chrome experience is no longer the final Project Owner quality bar for mobile gameplay presentation.

## Approved Mobile Application Baseline

Issue #295 is authorized to introduce:

- `game-mobile/` as the mobile application shell;
- Expo / React Native shell architecture;
- `expo-dev-client` development builds;
- EAS Build for Android development/release artifacts;
- `react-native-webview` as the first-stage bridge to the Phaser runtime;
- temporary Railway-hosted game loading during early mobile-shell iteration;
- later bundling of the Phaser game into the installed application for normal production startup.

Gameplay/domain logic must not be duplicated in React Native.

---

# Owner Experience Decision

Project Owner physical-device review established that the browser experience is not an acceptable final mobile-game surface because browser chrome and browser viewport behavior materially degrade composition, map framing, zoom, and the overall feeling of playing a real game.

Therefore future visual acceptance should move to installed Android development builds as soon as the mobile foundation exists.

Railway remains valuable but secondary.

---

# Camera / Viewport Checkpoint

The Android foundation must include or unblock a robust game-world camera contract:

- player Follow mode;
- bounded Free Camera pan;
- pinch zoom within tested bounds;
- Fit / Overview behavior computed from actual viewport and world dimensions;
- no world/map spill outside the intended game surface;
- fixed HUD isolation from world-camera transforms;
- gesture isolation so camera gestures do not trigger gameplay actions underneath them.

A fixed zoom value is not sufficient as the only fit strategy across Android devices.

---

# Recently Completed / Verified Work

The current prototype includes the following recently completed owner-visible systems:

- Employee Hiring & Onboarding;
- Financial Report and operating-day cost flow;
- Customer Review generation and reputation integration;
- Customer Reviews display;
- mobile visual remediation for Employees, Financial Report, and Reviews merged in PR #294;
- canonical Product Experience direction establishing richer, more human, reality-inspired game presentation.

The owner confirmed that these systems function, while also establishing that future visual evaluation must happen in the installed mobile game rather than treating Chrome as the final product surface.

---

# Active Holds

## Vehicle Fleet — PR #288

PR #288 remains on HOLD / Draft.

Do not resume or merge Vehicle Fleet merely because its code is available.

Resume it only after the Android application/camera foundation has reached Project Owner acceptance or the Project Owner explicitly changes this hold.

---

# Relationship with Real DROPi

DROPi Tycoon is global; the real DROPi application may initially exist only in selected cities/regions.

The game must be excellent even for users who never access real DROPi.

At the same time, the game should use believable real-world logistics, employee, customer, fleet, economy, environmental, and company-management concepts so that it can naturally introduce people to the DROPi ecosystem and may later support dedicated training/onboarding scenarios.

The game is not a guarantee of real-world profit or financial success.

See `00_Project/VISION.md` for canonical product intent.

---

# Immediate Next Steps

1. Merge the canonical mobile-platform documentation alignment for Issue #295 after CI passes.
2. Create the `game-mobile/` Expo application shell.
3. Configure Expo Dev Client and EAS development-build profiles.
4. Host the existing Phaser runtime in the shell without rewriting gameplay logic.
5. Establish landscape-first installed-game presentation, safe-area/system UI behavior, and Android Back handling.
6. Implement/validate Follow, Free Camera, pinch zoom, and computed Fit/Overview behavior.
7. Produce the first installable Android development build.
8. Project Owner installs and tests DROPi Tycoon on a physical Android phone.
9. Record Functional PASS/HOLD and Visual/Experience PASS/HOLD.
10. Only then decide whether Vehicle Fleet PR #288 resumes.

---

# Development Rule

Gameplay before unnecessary complexity, but **player experience is part of gameplay**.

Passing automated tests is necessary but does not by itself constitute Project Owner visual acceptance.

Major owner-visible merges should be followed by explicit instructions describing where the Project Owner can see and test the change.

---

# Project Health

Architecture: **ACTIVE / MOBILE PLATFORM REALIGNMENT APPROVED**

Documentation: **ACTIVE / CANONICAL PLATFORM ALIGNMENT IN PROGRESS**

Gameplay prototype: **WORKING**

Browser preview: **WORKING / SECONDARY SURFACE**

Android installed application: **NEXT ACTIVE FOUNDATION**

Vehicle Fleet expansion: **HOLD**

---

# Canonical Continuity Rule

For current project direction, future AI sessions must prefer live canonical documents and current GitHub state over historical AI reports, old Web-First migration notes, stale task descriptions, or chat assumptions.

When current status and an older implementation report disagree, inspect authority and current GitHub state before acting.

---

End of Document