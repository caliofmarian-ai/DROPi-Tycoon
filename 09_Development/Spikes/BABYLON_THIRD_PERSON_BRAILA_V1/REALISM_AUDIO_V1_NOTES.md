# DROPi Tycoon — Brăila Realism + Audio V1

Status: `NON-AUTHORITATIVE TECHNICAL SPIKE — NOT AUTHENTIC GAMEPLAY`

Coordinates: #720 #722 #710 #712

## Owner-approved reference direction

The visual target is the owner-approved grounded-stylized third-person direction represented by the three governed Runway reference clips already reviewed under #720. They are cinematic references, not gameplay evidence.

## V1 implementation intent

This bounded pass intentionally improves visual and acoustic presence without introducing a second gameplay authority or external ungoverned runtime assets.

### Visual

- stronger road/sidewalk/curb separation;
- one readable pedestrian crossing;
- differentiated façade/glass/asphalt/water/vegetation materials;
- HQ entrance depth and canopy;
- Mara storefront depth and awning;
- residence balconies/rails;
- sparse street furniture and lighting anchors;
- basic vehicle wheels/headlights;
- slightly softer atmosphere/fog calibration.

All additions are lightweight procedural geometry/materials so Android performance can be measured before adopting heavier governed assets.

### Audio

The first proof uses only runtime-synthesized Web Audio signals, therefore no third-party audio files are shipped in this slice.

- low-level city/wind ambience;
- restrained distant traffic bed;
- procedural bird chirps;
- movement-triggered footsteps;
- interaction/recenter UI feedback;
- one positional vehicle engine emitter;
- master audio toggle;
- logical bus structure for MUSIC / AMBIENCE / SFX / VEHICLES / VOICES / UI.

Music content and character voices remain separate governed follow-ups; this slice creates the routing architecture without inventing copyrighted or provenance-unknown content.

## Device acceptance

The owner Android test must verify together:

1. visual change is materially closer to grounded city realism;
2. joystick/free-look/GPS/route/signage remain functional;
3. audio is present but not overwhelming;
4. footsteps correspond to movement;
5. vehicle ambience has spatial direction/distance behavior;
6. AUDIO ON/OFF works;
7. frame pacing remains acceptable with audio enabled;
8. no renderer startup regression.

If the result is visually richer but materially slower, reduce geometry/material/audio concurrency before adding heavier assets.
