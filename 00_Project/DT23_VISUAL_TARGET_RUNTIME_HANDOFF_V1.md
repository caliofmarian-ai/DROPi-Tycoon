# DT-23 — Visual Target Runtime Handoff v1

Status: `OWNER-APPROVED VISUAL NORTH STAR`
Owner: Marian / caliofmarian-ai
Owner lane: DT-23 Creative Marketing / Advertising / Cinematics
Effective: 2026-09-12
Visual authority: `00_Project/THIRD_PERSON_OPEN_WORLD_VISUAL_EXPERIENCE_CANON.md`
Reference film contract: `00_Project/DT23_FULL_TARGET_CANON_FILM_V2_THIRD_PERSON.md`

## Owner decision

The owner approved the third-person V2 target film as the visual direction DROPi Tycoon should pursue in the real game.

The runtime objective is:

> Make the playable game look and feel as close as technically practical to the approved V2 film while preserving gameplay authority, mobile viability and truthful runtime evidence.

The V2 film remains `CINEMATIC / NON-GAMEPLAY — TARGET CANON` until an exact runtime capture is proven as gameplay. Approval of the film does not relabel cinematic footage as gameplay.

## Non-negotiable experience

Local playable runtime must converge on:

- hero visible in-world;
- third-person camera behind/slightly above the hero;
- believable human scale;
- full-height streets and buildings;
- natural perspective depth and readable horizon;
- grounded stylized realism;
- smooth movement and camera follow;
- believable NPC, vehicle, parcel and doorway scale;
- physical interaction with shops, HQ, merchants, customers and interiors;
- coherent transition from street movement to interaction and back;
- Brăila identity expressed through real-world-inspired urban structure and locality details.

The primary local experience must not read as:

- Roblox-like;
- blocky toy world;
- isometric diorama;
- miniature tycoon board;
- top-down local gameplay;
- chibi or minifigure presentation.

Strategic/world views remain separate and may use elevated/map-like presentation.

## Runtime translation

### 1. Camera and player presence

The approved film establishes the target camera language, not a fixed numeric implementation.

Required behavior:

- camera follows behind the hero at human scale;
- mild elevation is allowed, but normal local play must never become aerial/isometric;
- street horizon and building height remain readable;
- camera rotation and follow are damped and stable;
- camera does not visibly jitter during locomotion or interaction;
- interaction framing may move closer;
- vehicle traversal may move wider while preserving third-person spatial presence;
- camera collisions must not routinely clip through walls, characters or geometry.

Numeric FOV, distance, damping and collision values belong to the implementation owner and must be tuned against captured evidence rather than invented here.

### 2. Hero and character presentation

Characters must read as people occupying the same physical world as streets, vehicles and doors.

Required:

- believable adult human proportions;
- stable scale between shots/areas;
- locomotion synchronized to movement speed;
- no visible foot sliding in normal traversal;
- turns, stops and interaction poses transition smoothly;
- parcel handling has believable hand/arm/body relationship;
- NPCs do not move like low-frame-rate sprites or rigid board pieces;
- interaction distance must look physically plausible.

Character identity, authored cast and dialogue remain under their canonical owner lanes.

### 3. City geometry and scale

The local city must surround the hero rather than sit underneath the hero as a miniature map.

Required:

- roads, sidewalks, crossings and entrances sized for human/vehicle use;
- façades rise above the hero with believable floor rhythm;
- doors, counters, shelves, windows, street furniture and parcels have coherent relative scale;
- long enough sight lines to communicate street depth where the locality supports them;
- shops and HQ read as places the hero can approach and enter, not floating menu nodes;
- locality composition may be compressed for gameplay, but must preserve believable human-scale relationships.

### 4. Materials and surface readability

At normal gameplay distance, the player should visually distinguish:

- asphalt;
- concrete/paving;
- brick/plaster/stone façades;
- glass;
- metal;
- vegetation;
- water where present;
- parcel/cardboard materials;
- vehicle bodywork and glazing.

Grounded stylization and performance optimization are allowed. Flat toy-like surfaces that destroy scale perception are not the target.

### 5. Lighting and atmosphere

The target is believable game lighting, not live-action photorealism.

Required:

- readable hero silhouette against the environment;
- believable daylight/interior hierarchy;
- sufficient contact/shadow cues to anchor characters and objects to the ground;
- façades and road surfaces retain material readability;
- lighting should support Brăila atmosphere without crushing gameplay visibility;
- future day/night states must preserve camera readability and interaction clarity.

### 6. Motion quality

The approved film makes smoothness part of the visual target.

FAIL conditions include:

- visible camera jitter;
- locomotion stutter;
- foot sliding;
- abrupt animation snapping;
- NPC motion that looks robotic or sprite-like;
- frame pacing that makes traversal feel broken;
- scale popping or severe asset pop-in at normal player distance;
- interaction poses occurring at implausible distance.

A high-detail still frame is not sufficient evidence if movement fails.

### 7. Interaction presentation

The target first-hour presentation is physical and spatial:

`hero -> phone/job -> city traversal -> HQ -> merchant pickup -> route -> customer handoff -> result`

UI supports the world; it must not replace the world with a floating tycoon board during local play.

Canonical economic and mission semantics remain owned by their respective specialist lanes. DT-23 defines visual truth only.

### 8. UI and result presentation

Target UI principles:

- readable without dominating the 3D world;
- phone/HUD appears attached to player actions and state;
- critical result categories may show canonical states such as Personal Money credited, XP progressed and Loyalty increased;
- do not fabricate numeric rewards for cinematic or implementation evidence;
- branding must be rendered deterministically as `DROPi Tycoon` / `DROPi TYCOON`, never delegated to generative text when exact spelling matters.

## Mobile and Android constraint

The visual north star is a target, not permission to make Android unusable.

The implementation must preserve the visual hierarchy while scaling technical cost through appropriate techniques such as:

- LOD and distance-aware detail;
- occlusion/culling;
- texture/material budgeting;
- lighting/shadow quality tiers;
- animation update budgeting outside the immediate player focus;
- density scaling for NPCs, vehicles and props;
- streaming/loading boundaries that do not break local spatial coherence.

Optimization must reduce cost before it changes the experience family. A lower-detail third-person human-scale world is closer to canon than a high-detail return to miniature/isometric local play.

DT-14 owns Android release evidence. Relevant runtime/visual specialists own implementation and profiling.

## Fidelity ladder

Runtime progress should be evaluated in this order:

1. `PRESENCE` — hero visibly exists in a human-scale third-person world.
2. `SCALE` — streets, buildings, doors, vehicles, NPCs and props have coherent proportions.
3. `CAMERA` — follow, rotation and collision feel stable and grounded.
4. `MOTION` — hero/NPC locomotion and interactions are smooth and believable.
5. `WORLD READABILITY` — architecture, streets, materials, lighting and depth read clearly.
6. `LIFE` — NPCs, vehicles, props and environmental activity make the locality feel inhabited.
7. `POLISH` — higher material fidelity, atmosphere, effects and cinematic refinement.

A later layer must not conceal failure in an earlier layer.

## Evidence contract

A claim that runtime is converging on this target requires player-visible evidence captured from the exact build under test.

Minimum evidence set for a visual acceptance pass:

- behind-hero street traversal;
- turn/stop/resume camera behavior;
- approach to a full-scale building entrance;
- one NPC interaction at plausible distance;
- parcel pickup/carry/handoff or equivalent physical object interaction;
- one interior/exterior transition where available;
- representative Android capture when the lane reaches Android validation;
- frame-time/performance evidence from the implementation owner when performance is part of the claim.

Screenshots alone cannot prove motion quality.

## Acceptance states

Use these states for visual convergence:

- `TARGET CANON` — approved destination represented by the V2 film/contract.
- `SOURCE IMPLEMENTED` — relevant code/assets exist in the source tree.
- `RUNTIME VERIFIED` — exact build evidence shows the behavior in running gameplay.
- `ANDROID VERIFIED` — DT-14 evidence proves acceptable behavior in the Android-hosted authoritative runtime.
- `AUTHENTIC GAMEPLAY` — DT-23 may use the exact verified runtime capture as gameplay marketing material.

No earlier state automatically implies a later state.

## Specialist handoff boundaries

DT-23 does not seize implementation ownership.

Expected consumers:

- `DT-01 / player-visible visual runtime`: third-person camera, local presentation, visible integration and visual acceptance evidence;
- `DT-10 / characters`: character visual requirements, locomotion/interactions where assigned by DT-00;
- `DT-11 / world/localities`: locality identity, geographic/world-to-locality handoff and spatial source truth;
- `DT-14 / Android`: device-hosted runtime and performance/release evidence;
- `DT-19 / art asset pipeline`: asset inventory, production lineage, geometry/material/prop pipeline and provenance handoff;
- relevant gameplay owners: authoritative mission, economy, inventory, interaction and simulation semantics.

DT-00 decides sequencing and may re-route implementation ownership.

## Brăila first acceptance slice

The first locality acceptance slice should prove the experience family before attempting full-city breadth:

- one believable Brăila-inspired street cluster;
- hero at correct human scale;
- third-person traversal;
- one HQ/operations destination;
- one merchant pickup destination;
- one customer destination;
- coherent roads/sidewalks/entrances;
- enough NPC/vehicle/environment activity to establish life;
- one complete visible work interaction path.

The slice may be geographically compact. It must not be visually miniature.

## Marketing truth boundary

Until runtime evidence satisfies the relevant acceptance level:

- V2 remains `CINEMATIC / NON-GAMEPLAY — TARGET CANON`;
- current verified runtime captures remain `AUTHENTIC GAMEPLAY` only for what they actually show;
- target-film frames must not be represented as current screenshots;
- store/public claims must remain truthful about current build capability.

## Final owner-facing rule

When deciding between two implementation directions, prefer the one that makes the real playable build feel more like the approved V2 third-person film **without breaking authoritative gameplay, truthful evidence or viable Android performance**.
