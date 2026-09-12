# Document Information

Document: PLAYER_WORLD_EMBODIED_TRAVEL_CANON.md
Project: DROPi Tycoon
Version: 1.0.0
Status: Canonical Candidate
Owner: DT-00 Central Orchestrator
Language: English
Last Updated: 2026-09-11

---

# Player World-Embodied Travel Canon

## Purpose

DROPi Tycoon is not played only through menus, abstract map markers or teleport-like mission selection. When a locality is playable, the player must have a world-embodied mode in which the hero/avatar exists visibly inside the local scene and can travel through the surrounding locality toward legitimate gameplay objectives.

This contract reconciles `04_World/MAP.md` Travel and Presence with `07_UI/UX.md` and the existing Phaser locality runtime.

---

# 1. World-Embodied Player Presence

Inside a playable locality, the hero/avatar is a visible world participant rather than only a hidden account/controller identity.

The normal local-play experience must support:

- a visibly anchored hero/avatar in the local world;
- movement along legitimate traversable local space;
- surrounding streets, buildings, facilities, traffic/ambient life and mission-relevant world context remaining visible around the hero according to camera/LOD limits;
- approach to mission-relevant pickup, delivery, work, company or story locations through world traversal where that mission contract requires physical presence;
- continuity between movement, mission state and local-world context.

A smartphone, HUD, GPS or map may assist navigation and management, but must not replace embodied local traversal by default.

---

# 2. Camera Experience

At hero/street scale, the camera should communicate the feeling that the player is moving through a place, not dragging a miniature board.

The camera may use a third-person-like or elevated follow presentation appropriate to the existing stylized 2D/2.5D runtime. It should:

- keep the hero readable;
- show useful surrounding street/locality context;
- provide stable forward/target awareness where justified by authored route or mission information;
- preserve semantic zoom transitions to area, locality, region and global views;
- remain frame-rate independent and mobile-performance bounded;
- avoid revealing hidden or unauthoritative route/economic/story information.

This requirement does **not** authorize a real-time 3D engine rewrite.

The canonical rendering direction remains **Stylized 3D Pre-Rendered Mobile World** implemented through the existing Phaser/locality architecture unless a future owner-approved architecture decision explicitly changes it.

---

# 3. Travel Is Not Teleportation

Opening the strategic map, accepting a mission or selecting a destination does not by itself move the hero, cargo or company assets.

For local missions that require physical action, the player must be able to traverse the governed local world toward the relevant location using allowed movement/transport modes.

Long-distance or cross-region travel may still use governed summarized/time-compressed presentation, as already allowed by `04_World/MAP.md`, but authoritative presence, custody, time and cost consequences remain intact.

---

# 4. Traversal Must Use Governed World Topology

World-embodied travel must consume legitimate locality geometry/topology. It must not fabricate roads, shortcuts, destinations or access rights merely to improve camera framing.

Where detailed route authority is incomplete, presentation must fail closed or use an explicitly governed simplified traversable contract rather than pretending unsupported topology is real.

Brăila is the premium calibration/reference locality, not a hardcoded exception. The same contract must be portable to other playable localities.

---

# 5. Mission Integration Boundary

World traversal is presentation/movement and mission approach. It does not create competing authorities.

- DT-09 owns mission/delivery materialization and legitimate mission-state transitions.
- DT-03 remains sole economic settlement authority for money/XP/loyalty/eligible fragments.
- DT-11 owns locality/geographic identity and playable-locality contracts.
- DT-01 owns local visual/runtime presentation and camera behavior.
- DT-14 owns Android/release verification.
- DT-19 owns governed asset inventory/derivative lineage.

A camera or movement system must not invent mission acceptance, cargo custody, payment, locality identity or economic evidence.

---

# 6. UI and Smartphone Continuity

Opening the smartphone, HUD or navigation overlay should preserve the player's legitimate world context unless a specific gameplay flow intentionally transitions scenes.

UI may pause, dim, overlay or summarize the world according to product decisions, but it should not silently create a different hero position, mission state or locality.

After closing transient UI, the player should return to the same authoritative world context.

---

# 7. Visual and IP Boundary

The desired experience may share broad genre qualities with open-world street-scale games: a visible character, camera following the character and movement through an explorable locality.

DROPi Tycoon must remain independently designed. Do not copy third-party game assets, characters, maps, UI, missions, dialogue, distinctive camera signatures, branding, criminal/combat mechanics or other protected expression.

The product identity remains logistics/economic simulation in DROPi Tycoon's own stylized pre-rendered world.

---

# 8. First Acceptance Proof

The first runtime proof of this canon should demonstrate, on the supported reference locality:

1. the hero is visible at street scale;
2. player movement changes authoritative local position through legitimate traversable space;
3. the camera follows smoothly and keeps useful surrounding locality context visible;
4. a mission-relevant destination can be approached through world movement rather than map teleportation;
5. smartphone/map access does not silently relocate the hero;
6. semantic zoom still works outside hero/street presentation;
7. Android/mobile performance remains within the existing release budget;
8. no fake topology, mission state, economy or asset/legal status is introduced.

Passing this proof means the capability exists. It does not mean every locality, transport mode or mission type is fully implemented.

---

# Canonical Rule

**A playable DROPi Tycoon locality must support a world-embodied player experience: the hero can be visibly present in the local world, travel through legitimate local space toward gameplay objectives, and see meaningful surrounding locality context while preserving the existing semantic-zoom, mission, economy, geography, persistence and mobile-performance authorities.**

---

End of Document
