# Document Information

Document: MOBILE_APPLICATION_PLATFORM.md
Project: DROPi Tycoon
Version: 1.0.0
Status: Canonical
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-09-05

---

# Mobile Application Platform

## Purpose

This document is the canonical platform-runtime specification for DROPi Tycoon.

It exists to prevent future development sessions, AI agents, tools, and contributors from confusing the browser preview with the intended player product.

This document owns the mobile application delivery direction, the relationship between the Phaser game runtime and the native application shell, the role of Railway, the Android build/review workflow, and the minimum camera/viewport behavior required for the installed game experience.

If implementation notes, historical reports, old migration plans, or previous Web-First wording conflict with this document, the current canonical Project Vision and this document govern.

---

# Canonical Product Runtime Direction

DROPi Tycoon is a global mobile game.

The primary player-facing and Project Owner review runtime is an **installed mobile application**, beginning with Android.

The public browser/Railway version is a secondary surface used for development, smoke testing, rapid preview, diagnostics, and optional web access. It is not the canonical quality bar for the final game experience.

The game must remain valuable and fully enjoyable even for players who never use the real-world DROPi application or live in a location where DROPi does not operate.

---

# Platform Chain

## Primary mobile chain

```text
GitHub
→ Authoritative Phaser Game Runtime
→ Mobile Application Shell
→ Development / Release Build
→ Installed Android Game
→ Google Play Distribution
```

## Secondary web chain

```text
GitHub
→ Web Build
→ Railway Deployment
→ Browser Preview / Smoke Test
```

Railway remains useful infrastructure, but a browser tab must not be treated as the final owner-facing gameplay surface.

---

# Runtime Ownership Boundaries

## Authoritative Game Runtime

The existing Phaser runtime owns the game itself, including:

- world rendering;
- map and camera behavior;
- gameplay scenes;
- delivery mechanics;
- company simulation;
- economy;
- employees;
- reviews and reputation;
- vehicles;
- game HUD and management surfaces;
- deterministic game-state rules.

The mobile migration must not duplicate or silently rewrite authoritative gameplay rules in a separate application framework.

## Mobile Application Shell

The mobile shell owns native application concerns, including:

- app startup and lifecycle;
- Android orientation policy;
- immersive/fullscreen presentation where supported;
- safe-area and system-bar handling;
- Android Back behavior;
- native build metadata;
- app icon and splash experience;
- native permissions and platform integration when later required;
- the bridge/container used to present the Phaser runtime.

The shell is a host for the game, not a second game implementation.

---

# Approved Implementation Baseline

The current Project Owner-approved implementation baseline is:

- Phaser remains the game renderer/runtime;
- an Expo / React Native mobile shell is added to this repository;
- `expo-dev-client` development builds are used for physical-device development;
- EAS Build is used to create installable Android development and release artifacts;
- `react-native-webview` is approved as the first-stage bridge for hosting the Phaser runtime without rewriting the game;
- the first development stage may load the Railway-hosted game URL to accelerate iteration;
- the production target is to package/bundle the Phaser game with the application so normal game startup does not depend on the public Railway page;
- Railway remains available as preview and backend-capable infrastructure where justified by future systems.

These technologies are the approved implementation baseline, not eternal product doctrine. Replacing a major element of this baseline requires explicit Project Owner approval and a canonical update before migration work begins.

---

# Repository Runtime Structure

The intended repository separation is:

```text
game-web/
  Authoritative Phaser game runtime and web build

game-mobile/
  Expo / React Native Android application shell
```

`game-mobile/` must consume or host the authoritative game runtime rather than reimplement its domain rules.

Shared contracts may later be extracted if technically useful, but no new abstraction layer should be invented without a concrete need.

---

# Android Experience Requirements

The installed Android game must:

- open directly into the DROPi Tycoon application experience without browser chrome;
- use the intended game orientation, landscape-first for the active game experience unless a later canonical UX decision changes it;
- use the actual available application surface when laying out the world and UI;
- keep interactive content inside the intended app viewport and safe regions;
- preserve touch interaction without mouse, keyboard, or hover dependencies;
- handle application resize/orientation/lifecycle changes safely;
- provide readable, touch-friendly management surfaces;
- make owner visual review representative of the product players will receive.

The browser URL bar, browser tabs, and browser-specific viewport behavior must not define the final game composition.

---

# Camera and World Viewport Contract

Moving the game into an installed application does not by itself solve map/camera problems. Camera behavior is part of the product experience and must be implemented explicitly.

The game-world camera must support the following concepts:

## Follow Mode

The camera follows the player during normal gameplay while respecting world bounds and the actual visible game surface.

## Free Camera

The player may inspect the world using bounded pan and pinch zoom. Camera movement must not expose meaningless space outside the intended world presentation.

## Fit / Overview

A fit/overview action must compute an appropriate zoom from the current viewport dimensions and relevant world bounds.

Fit behavior must not rely on one hardcoded zoom value for every device.

## Camera Safety

- zoom must remain within tested bounds;
- pan must remain bounded;
- HUD/fixed UI must remain screen-fixed and isolated from world-camera transformations;
- map/world rendering must not spill outside the intended world viewport;
- camera gestures must not accidentally trigger gameplay actions underneath them.

---

# Railway Role

Railway is retained as an important project service, but its role is explicitly secondary to the installed-game experience.

Approved Railway uses include:

- web preview;
- CI/deployment smoke validation;
- rapid remote testing;
- future APIs or backend services when canonically justified;
- temporary remote game loading during the first mobile-shell development stage.

Railway must not become an accidental requirement for offline/local game startup once the production mobile bundling stage is complete, unless a future online feature explicitly requires network connectivity.

---

# Save and Persistence Boundary

The Save System remains authoritative for what game data means and when it is persisted.

Platform storage is an adapter concern.

During mobile migration:

- existing save semantics must be preserved;
- browser storage must not be treated as permanent canonical storage technology;
- the mobile shell/runtime may introduce a mobile-appropriate local persistence adapter;
- save migration must avoid silent loss of game state;
- any account/cloud synchronization is future scope unless separately approved.

See `06_Technical/SAVE_SYSTEM.md` for canonical save semantics.

---

# Development and Owner Review Workflow

The preferred owner-facing workflow is:

```text
GitHub
→ Pull Request
→ CI
→ EAS Development Build
→ Install on physical Android device
→ Project Owner functional review
→ Project Owner visual/experience review
→ Feedback / remediation
→ Acceptance
```

Railway remains part of automated web verification and fast previews, but owner acceptance for mobile presentation should be based on the installed application whenever an installable build exists for the changed surface.

Functional acceptance and visual/experience acceptance must be recorded separately when useful.

---

# Relationship to the Real DROPi Application

DROPi Tycoon and the real DROPi application are separate products.

DROPi Tycoon is global and must stand on its own as an excellent game.

The real DROPi application may initially operate only in selected cities or regions.

The game may teach players recognizable logistics, company-management, delivery, customer, fleet, employee, reputation, and operational concepts inspired by reality. Future DROPi training/onboarding scenarios may reuse the game's conceptual language, but the entertainment game must not depend on access to the real DROPi service.

Simulation outcomes must not be presented as guarantees of real-world financial success.

---

# AI Session Continuity Rule

Before proposing or implementing a major platform, runtime, packaging, camera, viewport, mobile-shell, deployment, or distribution change, an AI agent must reconcile at least:

1. `00_Project/VISION.md`;
2. `06_Technical/ARCHITECTURE.md`;
3. `06_Technical/MOBILE_APPLICATION_PLATFORM.md`;
4. `06_Technical/SAVE_SYSTEM.md` when persistence is affected;
5. `00_Project/PROJECT_STATUS.md` and the currently active GitHub issue/PR.

AI agents must not infer the following outdated assumptions:

- that the browser is still the primary product runtime;
- that Railway/Chrome is the final owner-review surface;
- that the Phaser game should be rewritten in React Native merely because an Expo shell exists;
- that a fixed browser viewport or fixed zoom is acceptable across Android devices;
- that native-shell migration authorizes gameplay/economy redesign;
- that Vehicle Fleet PR #288 should be resumed before the current Android application/camera foundation receives Project Owner acceptance.

When an old document or historical report contains Web-First wording, agents must check its authority level and date before treating it as current direction.

---

# Change Control

This document is canonical.

A material change to any of the following requires explicit Project Owner approval and an update to the relevant canonical documents:

- primary product runtime;
- mobile/web ownership boundary;
- authoritative game runtime ownership;
- native-shell strategy;
- distribution strategy;
- Railway's platform role;
- owner acceptance workflow;
- fundamental camera/viewport contract.

Implementation details may evolve within these boundaries when they do not change the canonical product/runtime direction.

---

# Canonical Rule

**DROPi Tycoon is built and judged as an installed mobile game first. The Phaser game remains authoritative; the mobile shell provides the native application experience; Railway/browser remains a secondary development and preview surface.**

---

End of Document
