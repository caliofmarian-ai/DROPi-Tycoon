# DROPi Tycoon — M-008 Android Review: HUD Obstruction

Date: 2026-09-02
Milestone: M-008 — Prototype v0.1 Verification & Release
Status: Owner-review remediation in progress

## Owner evidence

The Project Owner tested the current Railway build on a real Android phone in both portrait and landscape. The owner confirmed that the implemented functions work, including the newly added camera controls and continuous order loop, but reported that the active-order HUD panel blocks too much of the map view.

The supplied screenshots show:

- the expanded 1600×1200 map rendering on the public Railway build;
- visible Company Base, Business Area and Storage / Pickup Area labels;
- active generated orders including ORDER-004, demonstrating continued order generation beyond the initial order;
- camera zoom/rotation state changing across screenshots;
- the fixed order HUD occupying a large central horizontal area, especially in landscape;
- map labels, roads and gameplay space obscured behind the HUD.

## Planning traceability

This is corrective acceptance work inside M-008. It does not consume a future roadmap batch identifier.

Traceability:

- E-011 / RBATCH-010 — HUD & Notifications;
- E-016 / RBATCH-015 — Mobile Optimization;
- #269 — interactive map camera controls;
- #271 — continuous order generation and route variety;
- #273 — explorable first map.

M-009 remains dependent on M-008; RBATCH-018 must not start until the final owner gate is truthfully resolved.

## Owner verification result

- #269 camera controls: owner reports working on Android/public runtime.
- #271 continuous orders: owner reports working; screenshot shows ORDER-004.
- #273 expanded map: rendering/exploration is materially improved, but final verification remains blocked by HUD obstruction.

## Remediation requirement

The mobile HUD must preserve required information without covering the central map view.

Implementation direction:

- replace the near-full-width order panel with a compact edge-anchored card;
- use concise three-line order presentation;
- keep company status compact and separate from the order card in compact landscape;
- retain at least the existing touch-target floor for the Accept action;
- keep HUD fixed to camera and preserve pointer isolation;
- keep notification layout compact;
- add deterministic viewport regression tests preventing return to a near-full-width landscape HUD.

## Release state

Prototype v0.1 remains HOLD until the compact HUD is merged and the owner rechecks the public Android build.
