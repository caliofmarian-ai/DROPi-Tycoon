# Signage readability device finding

Status: `DEVICE EVIDENCE — MIRRORED WORLD SIGNAGE`

Parent architecture gate: #710
Related visual spike PR: #712
Expected issue: #718

Owner Android evidence on build `482c6ceb95e0eeb328ef45b50eaa6e3783d92db6` shows the façade text `DROPi HQ` horizontally mirrored from the intended street-facing player view.

The procedural building signs are created as planes rotated by `Math.PI` around Y so they face the street side. That rotation reverses the texture's local horizontal axis for the visible player-facing presentation. `src/signageReadabilityFix.ts` compensates once at texture level using a negative U scale and offset, and applies the correction to every `sign-plane-*` mesh rather than hardcoding only `DROPi HQ`.

Acceptance on Android:

- `DROPi HQ` reads left-to-right from the street-facing view;
- `MARA'S MARKET` and `RESIDENCES` also read left-to-right;
- no HUD, GPS, camera-control or movement regression;
- exact build SHA remains visible;
- world signage remains `NON-AUTHORITATIVE TECHNICAL SPIKE — NOT AUTHENTIC GAMEPLAY` until the renderer architecture is promoted.
