# Living City Simulation

Status: Phase-1 bounded simulation foundation
Issues: #326, #336

## Scope

This subsystem governs pedestrian route legality, controlled crossings, vehicle right-of-way and bounded high-footfall actor budgets independently from Phaser rendering wherever practical.

It does not attempt city-scale traffic simulation, per-frame global pathfinding, mission rewards, institution generation or production/world persistence.

## Modules

- `game-web/src/simulation/pedestrians/pedestrianRules.ts`
  - sidewalk/promenade/crossing route legality;
  - ordinary road segments are never valid pedestrian route nodes;
  - road entry requires a known controlled-crossing identity.
- `game-web/src/simulation/crossings/crossingControl.ts`
  - deterministic stop/go cycle;
  - pedestrian request and presence input;
  - vehicle stop/go authority;
  - explicit all-stop transition buffers;
  - future traffic-officer override surface.
- `game-web/src/simulation/traffic/trafficRules.ts`
  - deterministic vehicle go/yield decision;
  - never pulls a vehicle that already cleared a crossing backwards;
  - consumes high-footfall caution semantics.
- `game-web/src/simulation/pedestrians/footfall.ts`
  - school, hospital, station/terminal, marketplace and generic high-footfall policies;
  - bounded pedestrian additions;
  - controlled-crossing requirement and caution level;
  - future traffic-officer eligibility;
  - global actor caps remain authoritative.

## Brăila adapter

`game-web/src/world/cityTrafficRules.ts` remains the narrow world adapter. It chooses one safe source-road segment near the player start, materializes `central-station-crossing`, and delegates signal/right-of-way decisions to the pure simulation modules.

The existing visible crossing is in the central Station Commons / HQ-area intersection. It is a game traffic-control primitive on a validated road segment; it is not a claim that the corresponding real Brăila street has the same signal installation.

The current crossing carries the `station-terminal` high-footfall semantic. No school, hospital or other institution is invented by this slice.

## Performance and determinism

- Ambient actor count remains capped by the existing `AMBIENT_ACTOR_LIMIT` of 22.
- High-footfall policies can request additional pedestrian capacity only through a bounded budget resolver; configuration volume cannot bypass the global cap.
- Crossing decisions depend only on explicit state and time input.
- Invalid/non-finite time is sanitized to a deterministic zero-cycle state.
- No simulation module depends on Phaser.
- The existing ambient renderer keeps low-frequency updates, culling and predefined routes.

## Owner Android verification

After this change is deployed from an owner-approved merge:

1. Open the game and choose **Continue**.
2. Stay in **Brăila** and move toward the **Station Commons / HQ-area central intersection** near the starting area.
3. Observe the zebra crossing and the small red/green signal.
4. Verify the pedestrian waits at the curb, enters the road only through the zebra and remains smaller than the courier.
5. Verify the approaching ambient vehicle stops at the stop line while the pedestrian owns the crossing and then resumes.
6. Move around the area for 1–2 minutes and confirm no material Android stutter, freeze or pedestrian/vehicle overlap.

Issues #326 and #336 remain open until the owner completes visible Android acceptance; this foundation does not self-merge or self-accept.
