# MASTER OWNER DIRECTIVE 004 — THIRD-PERSON OPEN-WORLD VISUAL EXPERIENCE

Date: 2026-09-12
Project: DROPi Tycoon
Project Owner: Marian / caliofmarian-ai
Status: CANONICAL OWNER DIRECTIVE
Authority: Project Owner

## 1. Purpose

This directive defines the required player-facing visual experience for DROPi Tycoon and supersedes older local-gameplay instructions that describe the main playable city experience as `soft-isometric`, `elevated 3/4`, miniature-tycoon, board-game-like, Roblox-like, or equivalent top-down/isometric presentation.

The owner intent is an immersive third-person open-world game experience: the player sees the hero as a person inside a full-scale city world, with streets, buildings, vehicles, people, interiors and urban space perceived at human scale and with convincing three-dimensional depth.

The experiential reference is the spatial presence and third-person camera language associated with modern open-world games such as GTA. This is an experience/camera reference only. DROPi Tycoon must not copy GTA characters, missions, art, UI, brands, criminal themes, copyrighted assets or other protected expression.

## 2. Canonical Local Gameplay Camera

The default local gameplay experience is:

`THIRD-PERSON IMMERSIVE OPEN WORLD`

Required properties:

- the hero is visible in-world;
- camera follows behind and/or slightly above the hero at a natural human-scale third-person distance;
- buildings rise around the player instead of reading as miniature tokens on a board;
- streets have human-scale width, depth, perspective and travel distance;
- nearby NPCs read as people sharing the same world space;
- vehicles, doors, shops, parcels, street furniture and interiors are encountered at believable relative scale;
- camera movement is smooth and physically coherent;
- walking, cycling, driving and other transport should feel like movement through a real place represented inside a game;
- the player can visually look into the distance and understand streets, intersections, façades and destinations through perspective depth.

## 3. Visual Realism Target

DROPi Tycoon is not required to be photorealistic, but it must target grounded, believable 3D world presence rather than toy-like abstraction.

The canonical target is:

**Grounded stylized realism — a high-quality third-person 3D game world with believable human proportions, architectural scale, street depth, materials, lighting and environmental detail, optimized for the target platform.**

Stylization may simplify geometry, textures and lighting for performance and identity, but must not collapse the world into:

- Roblox-like blockiness;
- toy/minifigure proportions;
- chibi characters;
- board-game miniatures;
- fixed isometric diorama framing;
- flat top-down city presentation as the main local gameplay experience;
- exaggerated cartoon buildings that destroy human-scale immersion.

## 4. Hero Presentation

The hero must read as a real person represented in a game world.

Required direction:

- believable human proportions;
- recognizable body, clothing and equipment;
- grounded walking/running/carrying animation;
- visible parcel/cargo interaction when relevant;
- believable interaction distance with doors, counters, vehicles and NPCs;
- camera framing that lets the player identify with the hero rather than observe a small token from above.

## 5. City and Building Presentation

Brăila and future localities must be experienced as places the player inhabits.

Required direction:

- full-height building façades;
- readable doors, windows, shopfronts and entrances;
- street-level signage and urban furniture;
- perspective depth down roads and between blocks;
- believable pavement, road, curb, vegetation and waterfront scale;
- locality-specific architectural identity;
- interiors that preserve the same human-scale spatial language;
- visible verticality where appropriate.

Brăila remains inspired by real Brăila geography and identity, while gameplay layout may be adapted for readability, traversal and performance.

## 6. World Scale and Strategic Maps

This directive changes the local/player experience, not the semantic zoom hierarchy itself.

The world may still use:

`hero -> area/zone -> neighborhood -> city -> county -> region -> country -> continent -> globe`

Strategic map views may use elevated, map-like, satellite-like, schematic or stylized presentation where appropriate.

However, entering a playable locality must resolve into the canonical third-person human-scale experience. A strategic map view must not be mistaken for the main local gameplay camera.

## 7. UI Relationship

HUD and Player Phone remain overlays over the third-person world.

UI must not force the world back into miniature/isometric presentation.

The player should be able to:

- walk through the world;
- open the phone;
- inspect work/objectives;
- close the phone;
- continue moving in the same spatial scene;
- enter buildings/interiors where implemented;
- interact with people and cargo at believable scale.

## 8. Cinematics and Marketing

DT-23 trailers and promotional films must use this directive as their visual target.

A target-canon film should feel like the viewer is watching a real third-person game session or a cinematic extension of that same world.

Required trailer feeling:

`hero in street -> third-person movement -> city life -> job interaction -> pickup -> travel -> delivery -> result -> larger possibility`

Forbidden marketing direction:

- Roblox-like presentation;
- isometric diorama as the principal hero experience;
- toy city;
- top-down tycoon board as the main game fantasy;
- live-action actors pretending to be gameplay;
- fake gameplay claims.

## 9. Supersession

This directive supersedes conflicting visual instructions in earlier documents, including but not limited to statements requiring the main local gameplay experience to be `soft-isometric / elevated 3/4`.

Older asset/runtime contracts remain historical implementation evidence until migrated, but they are not the aesthetic destination.

When conflict exists:

`MASTER OWNER DIRECTIVE 004 > older soft-isometric visual wording`

Existing documents should be reconciled progressively to this authority.

## 10. Technical Non-Prescription

This directive defines the experience, not a mandatory engine choice.

DT-01 / runtime architecture specialists must determine the safest technical path to deliver the target while respecting Android performance, current authority boundaries and repository architecture.

No specialist may use the current Phaser prototype limitation as proof that the owner-approved experience should remain miniature/isometric.

## 11. Acceptance Test

A future local gameplay build is visually aligned only if a reasonable viewer can answer YES to all of these:

1. Does this look like a person standing inside a city rather than a token above a map?
2. Do buildings and streets feel human-scale?
3. Does the camera feel like a modern third-person open-world game?
4. Can the hero move through the world with smooth, grounded motion?
5. Do NPCs, vehicles, cargo and entrances share believable scale?
6. Would a viewer clearly distinguish this from Roblox-like or isometric mobile-tycoon presentation?

If any answer is NO, visual convergence is incomplete.
