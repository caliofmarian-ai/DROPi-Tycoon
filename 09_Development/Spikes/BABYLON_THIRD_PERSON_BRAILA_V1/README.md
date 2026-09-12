# Babylon Third-Person Brăila Spike v1

Status: `NON-AUTHORITATIVE TECHNICAL SPIKE`
Issue: #710
Target: `OWNER-APPROVED VISUAL NORTH STAR — TARGET CANON`

## Purpose

This isolated browser spike tests whether a web-native Babylon.js renderer can establish the visual family required by the owner-approved V2 film without replacing DROPi Tycoon's authoritative gameplay systems.

It is **not** production gameplay and must not be marketed as `AUTHENTIC GAMEPLAY`.

## What this proves

The spike intentionally uses only procedural geometry and deterministic text. No external art assets are required.

It provides:

- perspective 3D rendering;
- human-scale hero (~1.78 m visual scale);
- behind-hero third-person follow camera;
- full-height buildings and streets;
- a Brăila-inspired quay/urban graybox;
- DROPi HQ, Mara's Market and customer destinations;
- visible parcel pickup/carry/handoff state;
- simple pedestrians, parked vehicles, trees and street depth;
- keyboard and Android-friendly touch controls;
- player/building collision boundaries;
- FPS telemetry exposed in the HUD and `window.__DROPiBabylonSpike`.

Camera collision/clipping is **not yet an accepted capability in v1** and must be evaluated/fixed in a later spike before production promotion.

## What this does NOT prove

- production art quality;
- final character animation;
- accepted camera collision behavior;
- authoritative mission/economy settlement;
- save/load integration;
- locality persistence;
- final Android performance;
- production renderer selection;
- final asset pipeline.

## Run locally

```bash
cd 09_Development/Spikes/BABYLON_THIRD_PERSON_BRAILA_V1
npm install
npm run dev
```

Build:

```bash
npm run build
```

For the owner's Android/Termux path see:

`RUN_ON_ANDROID_TERMUX.md`

## Controls

Desktop:

- `W` / `ArrowUp`: forward
- `S` / `ArrowDown`: backward
- `A` / `ArrowLeft`: turn left
- `D` / `ArrowRight`: turn right
- `E` / `Space`: interact

Android/touch:

- on-screen directional controls;
- `INTERACT` button.

## Technical boundary

This package is deliberately isolated under `09_Development/Spikes/`.

It does not import or modify production Phaser rendering code and does not create a second canonical gameplay authority. If Babylon passes the architecture spike, DT-00 must still define how the renderer consumes existing authoritative domain/state systems before production integration.

The current TypeScript configuration uses `noCheck` only for the initial rendering graybox because Babylon 9.26 typing differences were intentionally not allowed to block visual-family evaluation. Full type-safe integration is required before any production promotion.

## CI evidence boundary

CI proves that the static Babylon build is reproducible and records bundle size. GitHub-hosted headless Chromium in the current runner cannot initialize a usable WebGL/ANGLE device, so CI screenshots are **not** accepted as visual evidence for this spike.

Real visual acceptance must be performed in a WebGL-capable browser/device, beginning with the owner's Android handset.

## Initial acceptance questions

1. Does the camera immediately read as third-person rather than map/isometric?
2. Does the hero feel physically present at believable human scale?
3. Do full-height buildings and streets surround the hero convincingly?
4. Does movement remain stable and understandable with touch controls?
5. Can the browser build maintain acceptable frame pacing on the owner's Android test device?
6. Can this rendering family move materially closer to the V2 target without rewriting economy/mission/save authority?

A `PASS` here only advances Babylon to the next architecture step. It does not select Babylon as the production engine by itself.
