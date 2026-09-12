# DT-23 — Visual Runtime Gap Audit — 2026-09-12

Status: `CURRENT GAP EVIDENCE`
Owner lane: DT-23 Creative Marketing / Advertising / Cinematics
Target authority: `00_Project/THIRD_PERSON_OPEN_WORLD_VISUAL_EXPERIENCE_CANON.md`
Runtime handoff: `00_Project/DT23_VISUAL_TARGET_RUNTIME_HANDOFF_V1.md`
Reference film: `00_Project/DT23_FULL_TARGET_CANON_FILM_V2_THIRD_PERSON.md`

## Purpose

Record the verified gap between the current player-visible runtime architecture and the owner-approved V2 third-person visual north star.

This is an audit/handoff, not an engine-selection decision and not an implementation takeover by DT-23.

## Verified current runtime facts

### Current local scene is Phaser Scene2D

`game-web/src/scenes/GameWorldScene.ts` uses Phaser's 2D camera/runtime model.

Current evidence includes:

- `Phaser.Cameras.Scene2D.Camera` for fixed-screen UI separation;
- `this.cameras.main.setRotation(0).setZoom(1)`;
- 2D camera zoom controls;
- draggable/free-look city camera behavior;
- `camera.worldView`-based presentation updates;
- a bounded X/Y world with `WORLD_WIDTH` and `WORLD_HEIGHT`;
- player movement represented as X/Y translation of a Phaser container.

The current scene is therefore not merely a low-detail version of the approved third-person target. It belongs to a different visual/spatial presentation family.

### Current hero is sprite-atlas based

`game-web/src/world/playerVisual.ts` currently represents the hero using:

- a Phaser container;
- an image sourced from a courier sprite atlas;
- directional facing states;
- frame-based courier animation;
- state swaps for walking/bicycle/scooter/motorcycle/van.

This implementation is useful for the present prototype but cannot by itself provide the full volumetric human character, perspective, animation and camera relationship shown by the approved V2 film.

### Current world geometry is 2D urban-layout authority

`06_Technical/ARCHITECTURE.md` documents `game-web/src/world/urbanWorld.ts` as the owner of:

- playable roads;
- pavement slabs;
- building footprints;
- HQ/merchant locations;
- deterministic collision queries.

It also documents the current main camera as following the ground actor with fixed orientation.

The gameplay/world state authority is valuable and should be preserved where possible. The rendering/presentation layer is the gap.

### Phaser is explicitly replaceable

`09_Development/Engine_Migration/WEB_RUNTIME_MIGRATION_MILESTONE_001.md` explicitly states:

- Phaser is an HTML5 2D runtime;
- Phaser is an implementation detail;
- Phaser is replaceable;
- Phaser is not canonical DROPi Tycoon technology.

Therefore the project is not canonically required to keep a 2D renderer if doing so prevents the owner-approved third-person experience.

## Gap verdict

Current status against the fidelity ladder:

- `PRESENCE`: `FAIL` for target family — current hero is represented in a 2D map-style world rather than behind-hero volumetric third-person space.
- `SCALE`: `FAIL` for target family — current presentation does not establish full-height architectural perspective around the hero.
- `CAMERA`: `FAIL` for target family — current camera is a Scene2D zoom/pan/follow system, not the approved behind-hero spatial camera.
- `MOTION`: `PARTIAL` — prototype movement/animation exists, but it is sprite/frame based and does not prove target locomotion quality.
- `WORLD READABILITY`: `PARTIAL` — roads/buildings/locality information exist, but are presented through the current 2D visual family.
- `LIFE`: `PARTIAL` — ambient systems exist, but target-scale 3D inhabitation is not proven.
- `POLISH`: `NOT APPLICABLE` until earlier layers converge.

Overall: `MAJOR RUNTIME VISUAL ARCHITECTURE GAP`.

## Critical conclusion

**Do not treat this as a camera-tuning-only task.**

Changing zoom, follow damping, sprite size or map textures cannot honestly turn the current Scene2D presentation into the owner-approved V2 experience.

The project needs an explicit technical decision about the rendering path capable of providing:

- perspective 3D camera;
- volumetric human-scale geometry;
- 3D character representation/animation;
- depth-aware buildings, streets and interiors;
- lighting/material cues consistent with the V2 target;
- Android-compatible performance.

## Architecture decision gate for DT-00

DT-00 should route a bounded technical spike before large-scale art production.

The spike should compare viable approaches without changing gameplay/economy/story authority.

At minimum, the decision must answer:

1. Can the current web runtime be extended with a true 3D rendering layer while preserving the authoritative domain/state systems?
2. If not, which replaceable rendering/runtime technology can host the existing authoritative game logic with the least destructive migration?
3. Can `game-mobile` continue to host the authoritative web runtime path without becoming a second gameplay authority?
4. What is the smallest Brăila slice that can prove third-person presence, scale, camera and motion on Android?
5. What asset format/pipeline should DT-19 target so art production is not wasted on a renderer that will be replaced?
6. What measurable Android performance envelope is acceptable for the first third-person slice?

## What should be preserved

The visual transition should avoid rewriting unrelated authoritative systems merely for presentation.

Preserve or adapt where technically possible:

- canonical player/company/world state;
- save/persistence contracts;
- mission/order lifecycle;
- economy settlement authority;
- world/locality identity contracts;
- interaction semantics;
- Android shell authority boundary;
- tests that validate domain behavior independently of renderer implementation.

Rendering-specific code may need replacement or adaptation.

## Recommended first technical proof

Before full-city production, prove one compact Brăila-inspired vertical slice:

- third-person hero;
- one street cluster;
- full-height building façades;
- one HQ entrance;
- one merchant entrance/pickup;
- one customer handoff;
- one parcel carried visibly;
- basic pedestrian/vehicle ambience;
- behind-hero camera collision/follow;
- Android-hosted exact-build capture;
- representative frame-time evidence.

This slice should use canonical mission/economy semantics but does not need the breadth of the full city.

## Stop conditions

Do not claim visual convergence merely because:

- higher-resolution 2D textures are added;
- the current top-down camera is tilted/zoomed differently;
- sprite atlases receive more frames;
- cinematic film assets are inserted into gameplay UI;
- screenshots look attractive while motion remains map-like;
- a separate mobile demo duplicates gameplay outside the authoritative runtime.

## Routing recommendation

DT-23 recommends DT-00 assign the architecture spike to the appropriate technical/runtime owner(s), with consultation from:

- DT-01 for player-visible visual/runtime acceptance;
- DT-11 for locality/world spatial authority;
- DT-14 for Android hosting and device evidence;
- DT-19 for 3D asset pipeline implications;
- any engine/runtime architecture specialist designated by DT-00.

DT-23 remains responsible for comparing player-visible evidence against the approved V2 visual north star and for truthful marketing classification.
