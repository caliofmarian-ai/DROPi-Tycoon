# DT-10 Runtime Visibility Root-Cause Audit

Date: 2026-09-09  
Canonical role: DT-10 — Characters & Dialogue / Visual Storytelling  
Base inspected: `main` at `81076dac1d10454f7ccc2e17571a41a5300205a3`  
Related merged visual PR: #558  
Related authorities: DT-08 Story canon, DT-09 Mission Framework, DT-02 World/Save identity, #560, #634

## Executive finding

The merged visual-storytelling implementation is present in the production TypeScript graph, but normal gameplay has no authoritative runtime bridge that can open it.

This is not primarily a rendering failure. It is an integration-boundary failure:

1. the narrative overlay exists;
2. canonical first-hour sequences exist;
3. DT-09 authored mission registries and stable signals exist;
4. Save can preserve an opaque Mission Runtime resume envelope;
5. `GameWorldScene` does not materialize or consume that Mission Runtime;
6. `GameWorldScene` deliberately contains no `narrative.present(...)` trigger;
7. world actor/location authority needed to bootstrap the authored Brăila registry is not currently exposed to DT-10.

Adding an unconditional popup on scene creation would hide this authority gap and would violate the Story/Mission ownership contracts.

## 1. Bundled runtime inclusion

The following merged runtime modules are imported by the executable GameWorld path:

- `game-web/src/narrative/visualStorytelling.ts`
- `game-web/src/ui/NarrativePresentation.ts`
- `game-web/src/scenes/GameWorldScene.ts`

`GameWorldScene` constructs `NarrativePresentationOverlay` on the fixed-screen UI layer. Therefore the overlay is part of the executable frontend bundle rather than documentation-only code.

Production art currently has one governed runtime asset in `game-web/public/assets/production/`: `icon-orders.webp`. This slice reuses its already-shipped texture key when available and does not promote files directly from `08_Assets/Approved_References/`.

## 2. Trigger path is intentionally absent

The merged DT-10 test lane explicitly required that `GameWorldScene` did not auto-fire `FIRST_SHIFT_OPENING_SEQUENCE`, `FIRST_DELIVERY_CONSEQUENCE_SEQUENCE` or `this.narrative.present(...)` from screen-open/economy heuristics.

That guard was correct for #558 while DT-09 authority was still being reconciled, but it also means the overlay cannot appear during the owner's ordinary fresh/continue flow.

Root cause classification: **presentation trigger absent by design**.

## 3. Mission authority exists but is not connected to GameWorld

DT-09 now provides:

- `brailaFirstHourAuthoredRegistry.ts`;
- `brailaAct1FamiliarRoutesRegistry.ts`;
- `missionEngine.ts`;
- `missionResumeContract.ts`;
- replay-safe `processedEventIds`;
- mission completion receipts;
- stable first-hour and Familiar Routes signals/facts.

`GameSessionState` can carry `missionResume?: unknown`, and Save can round-trip the Mission Resume contract. However the live `GameWorldScene`/`UrbanHUD` path does not call the Mission Resume restore/materialization contract and does not apply DT-09 mission events.

For a save that already contains a valid Mission Resume payload, presentation can safely read that state. For a fresh game with no payload, DT-10 cannot create mission progress from UI.

Root cause classification: **Mission Runtime projection/command port is not wired into the playable scene**.

## 4. World authority prevents a DT-10 bootstrap shortcut

The canonical narrative ID contract states that Story does not mint world geometry/location IDs. Mission/runtime owners must bind narrative places such as Station Commons, Brăila Commerce and Old Town to authoritative world location IDs.

The current world runtime exposes physical coordinates and legacy city identities, but it does not expose the authoritative first-hour actor/location binding object required by `buildBrailaFirstHourAuthoredMissionRegistry(...)`.

DT-09 unit-test values such as `actor:ana-runtime` and `location:station-commons-dispatch` are fixtures, not runtime authority. They must not be copied into production merely to satisfy prerequisites.

Root cause classification: **authoritative actor/location binding port missing from the playable integration path**.

## 5. Legacy merchant identity conflicts with Story canon

The current city/interaction runtime still uses the legacy merchant identity **Mara** (`mara`, `mara-market`) for the opening corner-shop interaction.

The merged Story/Mission canon uses **Mirela Stan** (`mirela-stan`) as the first recurring merchant/business customer.

DT-10 must not silently assert that Mara and Mirela are the same person, rename a world actor, or generate a false relationship fact. A world/content authority reconciliation is required before a Mirela presentation can be driven from that legacy interaction.

Root cause classification: **legacy world actor identity and canonical Story actor identity are not reconciled**.

## 6. Fresh versus continue path

### Fresh game

`startNewGameSession()` creates world, company, settings, personal progression, ownership/economy and local World Identity. It does not create first-hour Mission Runtime because the required authoritative Brăila actor/location bindings are not owned by that constructor.

Result: no authoritative story mission exists for DT-10 to present.

### Continue/load

Save can restore an opaque `missionResume` value and `gameSession.ts` preserves it. If a valid Mission Resume payload is present, DT-10 can safely expose a read-only story projection. The playable scene still lacks a command/event bridge for advancing it.

Result: saved mission state may exist but is not currently projected into normal story presentation.

## 7. Account/Profile visibility audit

The runtime already has a safe local/offline World Identity projection:

- local account reference;
- hero actor reference;
- World Instance reference;
- baseline/map dataset versions;
- `LegacyLocal` / `FreshLocal` mode.

It does **not** yet own the #634 locality/origin fields assigned to DT-02:

- `homeCountryId`;
- `homeLocalityId`;
- `startingLocalityId`;
- `currentCountryId`;
- `currentLocalityId`.

Therefore a truthful current prototype profile may display local/offline identity plus read-only Personal Money / Company funds / mobility, but must label authentication, cloud sync, origin and identity locality as not configured.

The rendered Brăila scene may be shown only as scene context. It is not evidence that Brăila is the player's home or authoritative current locality.

## 8. Visible shell implemented by this branch

This branch introduces a bounded read-only Story/Profile surface rather than inventing missing authority.

### Story

- discoverable from the normal GameWorld menu;
- reads only a valid DT-09 Mission Resume envelope;
- identifies the current first-hour/Familiar Routes mission when present;
- derives `One Small Thing` as `PENDING`, `CLEAN`, `RECOVERED` or `FAILED` only from Mission Runtime history;
- fails closed when mission authority is missing/incompatible;
- never calls `startMission(...)`, `applyMissionEvent(...)`, Save mutation or economy settlement.

### Account / Profile

- discoverable from the same normal GameWorld menu;
- clearly labeled `Local / offline prototype`;
- authentication and cloud sync explicitly `Not configured`;
- reads local World Identity only;
- reads Personal Money and Company funds separately;
- reads active transport/mobility;
- origin/home/current locality remain `Not configured by identity authority`;
- rendered Brăila context is clearly separated from identity locality.

### Input/camera safety

The surface is owned by `UrbanHUD` and participates in the existing `isMenuOpen()` modal contract. Therefore the established GameWorld movement/gesture guard remains the authority for joystick, keyboard, drag and zoom blocking. Android Back/Escape already calls `hud.toggleMenu()` when the narrative overlay does not consume Back; `toggleMenu()` now closes Story/Profile first.

## 9. Required owning-domain follow-up for fully automatic story presentation

A future integration may make First Shift/Ana/Radu/One Small Thing/consequence appear automatically only after these ports exist:

1. **DT-02 / World Instance:** safe authoritative current-locality identity, including #634 fields.
2. **World/content authority:** stable runtime actor/location bindings for the authored Brăila cast and places; explicit resolution of legacy Mara versus canonical Mirela.
3. **DT-09:** a playable-scene mission command/projection integration that materializes/restores the authored registry and applies real interaction/logistics signals exactly once.
4. **DT-10:** consume those proven mission states/signals and call the existing narrative overlay without minting facts or completion.

Until those conditions are met, a forced First Shift popup would be presentation fiction rather than authoritative storytelling.

## 10. Art-governance conclusion

No new portrait art is generated in this slice. The repository still lacks a promoted production-ready recurring NPC portrait family. Procedural character identities therefore remain the governed bridge for the existing narrative overlay.

The shell reuses the already production-ready delivery emblem texture when it is present in the global Phaser texture manager. It gracefully renders without that emblem if the texture is unavailable.

No approved-reference image is copied into runtime and no asset lifecycle state is silently promoted.
