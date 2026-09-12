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
- keyboard and Android-friendly touch controls with stuck-input recovery;
- touch camera orbit/pinch plus an explicit behind-hero recenter control;
- player/building collision boundaries with corner sliding;
- a collision-aware `ArcRotateCamera` with clipping-risk telemetry;
- strict TypeScript checking for the spike source;
- rolling average FPS, p95 frame time, slow-frame percentage, render size,
  orientation, camera state and exact build SHA in the HUD and
  `window.__DROPiBabylonSpike`.

Camera collision/clipping is implemented for this spike, but its truth status is
`DEVICE EVIDENCE PENDING`. Source/build success does not make it an accepted
capability; it must be exercised beside building corners and façades on the
owner's Android device before any production promotion.

## What this does NOT prove

- production art quality;
- final character animation;
- owner-accepted camera collision behavior;
- authoritative mission/economy settlement;
- save/load integration;
- locality persistence;
- final Android performance;
- production renderer selection;
- final asset pipeline.

## Run locally

```bash
cd 09_Development/Spikes/BABYLON_THIRD_PERSON_BRAILA_V1
npm ci
npm run dev
```

Build:

```bash
npm run build
```

For the owner's GitHub-built Android evaluation APK path see:

`INSTALL_ANDROID_EVALUATION_APK.md`

## Controls

Desktop:

- `W` / `ArrowUp`: forward
- `S` / `ArrowDown`: backward
- `A` / `ArrowLeft`: turn left
- `D` / `ArrowRight`: turn right
- `E` / `Space`: interact

Android/touch:

- on-screen directional controls;
- drag the open scene to orbit the camera;
- pinch to inspect the allowed camera-distance range;
- `RECENTER CAMERA` to restore the canonical behind-hero view;
- `INTERACT` button.

## Technical boundary

This package is deliberately isolated under `09_Development/Spikes/`.

It does not import or modify production Phaser rendering code and does not create a second canonical gameplay authority. If Babylon passes the architecture spike, DT-00 must still define how the renderer consumes existing authoritative domain/state systems before production integration.

The initial `noCheck` escape hatch has been removed. The spike now runs strict
TypeScript checking, including unchecked-array-index protection, before Vite
builds the artifact. `package-lock.json` pins the full dependency graph and CI
uses `npm ci`.

## CI evidence boundary

CI proves that the static Babylon build is reproducible and records bundle size. GitHub-hosted headless Chromium in the current runner cannot initialize a usable WebGL/ANGLE device, so CI screenshots are **not** accepted as visual evidence for this spike.

Real visual acceptance must be performed in a WebGL-capable browser/device,
beginning with the owner's Android handset. The artifact HUD shows the exact
commit prefix so device feedback can be tied to one immutable build.

The draft-PR workflow also packages the exact spike into the existing
`game-mobile` WebView/loopback architecture under the isolated Android package
`com.dropi.tycoon.babyloneval`. The CI-only overlay does not modify the tracked
production shell, use production signing or create another gameplay authority.

## Initial acceptance questions

1. Does the camera immediately read as third-person rather than map/isometric?
2. Does the hero feel physically present at believable human scale?
3. Do full-height buildings and streets surround the hero convincingly?
4. Does movement remain stable and understandable with touch controls?
5. Can the browser build maintain acceptable frame pacing on the owner's Android test device?
6. Can this rendering family move materially closer to the V2 target without rewriting economy/mission/save authority?

A `PASS` here only advances Babylon to the next architecture step. It does not select Babylon as the production engine by itself.
