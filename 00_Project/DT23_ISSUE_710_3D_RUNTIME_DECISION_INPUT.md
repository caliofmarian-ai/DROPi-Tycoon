# DT-23 — Issue #710 — Third-Person 3D Runtime Decision Input

Status: `DECISION SUPPORT — NOT ENGINE AUTHORITY`
Owner lane: DT-23 Creative Marketing / Advertising / Cinematics
For: DT-00 — Central Orchestrator
Issue: #710
Effective: 2026-09-12

Canonical inputs:

- `00_Project/THIRD_PERSON_OPEN_WORLD_VISUAL_EXPERIENCE_CANON.md`
- `00_Project/DT23_FULL_TARGET_CANON_FILM_V2_THIRD_PERSON.md`
- `00_Project/DT23_VISUAL_TARGET_RUNTIME_HANDOFF_V1.md`
- `00_Project/DT23_VISUAL_RUNTIME_GAP_AUDIT_2026-09-12.md`

## Purpose

Give DT-00 a bounded technical screening order for the architecture spike required by #710.

This document does **not** choose the production engine and does not move runtime ownership to DT-23.

The production decision must be based on exact prototype evidence, Android evidence, migration cost, licensing/commercial review, maintainability and preservation of canonical game authority.

## Current repository constraints

The current deployable runtime is already a web application built with:

- TypeScript;
- Vite;
- Phaser;
- browser/server deployment through `game-web`.

`game-mobile` is an Expo / React Native shell that hosts the bundled authoritative web runtime through `react-native-webview`.

The architecture already states that Phaser is a replaceable implementation detail rather than canonical DROPi Tycoon technology.

Therefore the first spike should favor approaches that can preserve the existing TypeScript domain/state systems and the current web-to-Android hosting boundary before considering a full runtime rewrite.

## Non-negotiable architecture invariants

Any candidate must be evaluated against these invariants:

1. There remains one authoritative gameplay runtime.
2. `game-mobile` must not become a second gameplay implementation.
3. Existing authoritative mission/order/economy/save/world-state semantics should be reused or adapted rather than casually rewritten.
4. Renderer-specific code may change substantially.
5. The selected path must support a genuine perspective third-person world, not a simulated isometric compromise.
6. The first proof must run in the actual Android-hosted product path, not only on a desktop editor.
7. Large-scale 3D art production should wait until the renderer/asset pipeline direction is sufficiently proven.
8. Licensing/commercial provenance must remain compatible with DT-13/DT-19 release gates.

## Candidate screening — recommended spike order

The order below is a **spike priority**, not a production selection.

### Candidate A — Babylon.js

Screening position: `PRIMARY WEB-NATIVE CANDIDATE`

Why it deserves the first spike:

- web-native JavaScript/TypeScript ecosystem;
- supports WebGL and WebGPU paths;
- provides a complete 3D scene graph rather than only low-level rendering;
- includes cameras, lights, materials, meshes, animation systems, collisions and physics integration;
- can be integrated through npm/ES modules into an existing TypeScript/Vite application;
- conceptually allows the current authoritative TypeScript game/domain code to remain in the same repository/runtime while the presentation layer changes.

Questions the spike must answer:

- Can a compact Brăila street slice achieve acceptable frame pacing in the current Android WebView shell?
- Can current player/world coordinates and interactions project cleanly into 3D without changing authoritative semantics?
- Can character animation, camera collision and loading/streaming reach the V2 experience family?
- What bundle/startup/memory cost does the engine add to the current mobile-hosted runtime?

### Candidate B — PlayCanvas Engine

Screening position: `PRIMARY WEB-NATIVE ALTERNATIVE`

Why it deserves a parallel or immediate second spike:

- web-native 3D game engine;
- current engine line supports WebGL2 and WebGPU;
- official browser support includes Android;
- distributed for JavaScript with TypeScript definitions;
- npm / ES-module usage is compatible with a code-first repository workflow;
- explicitly emphasizes a lightweight web runtime and mobile-browser execution.

Questions the spike must answer:

- Can the engine be consumed code-first without creating a second cloud/editor authority for the project?
- Does the mobile runtime remain small and predictable enough for the Android shell?
- How well do character controllers, cameras, animation and asset streaming fit the V2 slice?
- What repository/build changes would be required compared with Babylon.js?

### Candidate C — Three.js

Screening position: `LOWER-LEVEL WEB-NATIVE CONTROL`

Why it should be measured:

- mature browser 3D rendering ecosystem;
- supports WebGL2 and a WebGPU path;
- can fit directly into the existing TypeScript/Vite environment;
- gives maximum renderer control with minimal engine assumptions.

Trade-off to prove:

Three.js is primarily a rendering library rather than a full gameplay engine. DROPi Tycoon would need to own or integrate more of the higher-level stack itself, including character-controller conventions, camera collision, gameplay-friendly scene orchestration, physics choices, animation architecture, streaming/LOD conventions and tooling.

The spike should determine whether that extra engineering control is an advantage or unnecessary project cost.

### Candidate D — Godot Web export

Screening position: `MIGRATION CANDIDATE — ONLY IF WEB-NATIVE OPTIONS FAIL ACCEPTANCE`

Why it remains viable:

- full 3D game engine;
- supports browser export through WebAssembly and WebGL2;
- current Godot 4 web export supports a single-threaded mode intended to improve compatibility.

Why it is not the first spike:

- it introduces a separate engine/project/runtime model rather than naturally extending the current TypeScript/Vite application;
- existing authoritative TypeScript game logic would need a bridge, service boundary or porting strategy;
- web export adds WebAssembly/packaging constraints that must be validated inside the existing Android WebView shell;
- a renderer migration could become a gameplay rewrite unless the boundary is deliberately controlled.

Godot should move higher only if the web-native candidates cannot reach required third-person quality/performance or if DT-00 determines the long-term editor/tooling benefits outweigh migration cost.

### Candidate E — Unity 6 Web

Screening position: `MIGRATION CANDIDATE — HIGHER TOOLCHAIN / PORT COST`

Important current fact:

Modern Unity 6 Web documentation includes mobile-browser support and explicitly lists WebView embedding as a mobile option. Older assumptions that Unity Web is categorically desktop-only are stale for the current Unity 6 line.

Why it is still not the first path for this repository:

- production game logic would move toward a different language/toolchain/runtime model;
- preserving the current TypeScript authority would require a deliberate bridge or substantial port;
- build size, startup, memory and WebView behavior need exact Android measurement;
- repository automation and code-first maintenance would change materially.

Unity should only advance if its visual/runtime benefits clearly exceed the migration and operational cost demonstrated by the web-native candidates.

## Screening matrix

| Criterion | Babylon.js | PlayCanvas Engine | Three.js | Godot Web | Unity 6 Web |
|---|---|---|---|---|---|
| Fits existing TS/Vite runtime | `HIGH` | `HIGH` | `HIGH` | `LOW/MEDIUM` | `LOW` |
| True perspective 3D | `YES` | `YES` | `YES` | `YES` | `YES` |
| Full game-engine systems included | `HIGH` | `HIGH` | `LOW/MEDIUM` | `HIGH` | `HIGH` |
| Likely reuse of current domain code | `HIGH` | `HIGH` | `HIGH` | `MEDIUM/LOW` | `LOW` |
| Existing WebView architecture compatibility to test | `DIRECT` | `DIRECT` | `DIRECT` | `WASM/WEB EXPORT` | `WASM/WEB EXPORT` |
| Migration blast radius | `LOWER` | `LOWER` | `LOWER/MEDIUM` | `HIGHER` | `HIGHER` |
| First-spike priority | `1` | `2` | `3` | `4` | `5` |

These ratings are hypotheses for the spike, not acceptance evidence.

## Required common spike architecture

To compare candidates fairly, every prototype should consume the same domain contract.

Recommended boundary:

```text
canonical TypeScript state / systems
        |
        | authoritative state + commands
        v
renderer adapter
        |
        +--> hero transform / animation intent
        +--> locality geometry projection
        +--> interactable projection
        +--> NPC / vehicle presentation
        +--> HUD / phone presentation boundary
        |
        v
candidate 3D renderer
```

The renderer may visualize state and submit player intent, but must not independently award money, complete orders, create save authority or duplicate mission/economy rules.

## First comparative prototype

Use the same minimal Brăila graybox in every candidate.

Do not begin with expensive final art.

Required scene:

- one human-scale street segment;
- one cross street or junction;
- 4–8 full-height building shells;
- one enterable or threshold-proven HQ;
- one merchant pickup point;
- one customer handoff point;
- one third-person hero;
- one visible parcel;
- a small number of NPC/vehicle ambience actors;
- behind-hero camera with wall/geometry collision behavior;
- daylight lighting with readable contact/shadow cues.

Required gameplay path:

```text
spawn -> walk -> turn -> stop -> resume -> approach HQ
-> accept/continue canonical work state -> merchant pickup
-> carry parcel -> traverse street -> customer handoff
-> canonical result state
```

The spike does not need a complete city or final materials.

## Shared evidence package

For each candidate, capture the same evidence from the exact build:

### Source/build

- candidate package/version;
- exact commit SHA;
- production build result;
- added dependency footprint;
- production bundle size delta;
- startup/load timing notes;
- asset format used.

### Runtime visual

- behind-hero traversal video;
- camera turn/stop/resume video;
- wall/building camera-collision case;
- hero scale next to door/vehicle/NPC;
- parcel pickup/carry/handoff;
- one interior/threshold transition if included;
- visible lighting/material-depth proof.

### Android

- exact Android-hosted build identity;
- device/runtime context from DT-14;
- representative frame-time evidence;
- frame pacing under walking/turning;
- memory observation where tooling permits;
- loading/reload behavior;
- touch/control responsiveness;
- WebView errors/warnings if any.

Do not define a fake universal FPS threshold in this DT-23 document. DT-14/runtime owners should establish the device acceptance envelope, then DT-23 judges whether visual degradation still belongs to the approved experience family.

## Decision gates

A candidate is not acceptable merely because it can draw a 3D model.

It must pass:

### Gate 1 — Authority

- no duplicated gameplay authority;
- domain state remains canonical;
- economy/order/save semantics are preserved.

### Gate 2 — Presence

- hero reads as a person inside a human-scale world;
- camera is genuine third-person, not tilted top-down.

### Gate 3 — Motion

- no persistent camera jitter;
- no obvious foot sliding at ordinary traversal speed;
- acceptable input-to-motion response;
- camera collision does not routinely destroy framing.

### Gate 4 — World readability

- full-height buildings and street depth are convincing;
- materials/lighting can visually separate surfaces;
- NPC/vehicle/door/parcel scale is coherent.

### Gate 5 — Android viability

- actual `game-mobile` hosted build runs reliably;
- performance evidence is acceptable on DT-14's target device class;
- startup/bundle/memory cost is understood;
- visual optimization does not collapse back into miniature/isometric presentation.

### Gate 6 — Production viability

- DT-19 can define a stable asset pipeline;
- DT-13 can clear licensing/provenance requirements;
- CI/build automation can be deterministic;
- DT-00 can assign maintainable ownership.

## Recommended decision rule

Prefer the candidate that reaches the V2 experience family with the **least destructive change to authoritative game logic and Android hosting**, not necessarily the candidate with the most impressive desktop-editor demo.

A simpler 3D renderer that preserves state, tests, deployment and Android viability is preferable to a visually richer prototype that requires rebuilding core gameplay authority from scratch.

## DT-23 screening recommendation

Before any broad engine migration, DT-23 recommends DT-00 commission these proofs in order:

1. Babylon.js Brăila graybox spike.
2. PlayCanvas Engine Brăila graybox spike if Babylon evidence is insufficient or to provide a direct web-native comparison.
3. Three.js control spike only if the team needs to measure the cost/benefit of owning more of the stack.
4. Escalate to Godot or Unity only if web-native evidence fails the required experience/performance gates or the broader project architecture justifies the higher migration cost.

This is a spike order only. Final authority remains DT-00 / Project Owner after evidence.

## Current external capability check

Current official documentation reviewed on 2026-09-12 confirms the following screening facts:

- Babylon.js documents WebGL/WebGPU support plus cameras, materials, meshes, animations, collisions and physics-related systems.
- PlayCanvas documents WebGL2/WebGPU, Android browser support, npm/ES modules and TypeScript definitions.
- Three.js documents WebGL2 capability and a WebGPU path.
- Godot 4 documents Web export using WebAssembly/WebGL2 and a default single-threaded web export path in current 4.x documentation.
- Unity 6 documents supported mobile browsers for its Web platform and WebView as a mobile embedding option.

These capability statements are not proof that any candidate will satisfy DROPi Tycoon. Only the exact repository spike and Android evidence can do that.
