# Prototype v0.1 — Android HUD Obstruction Evidence

Date: 2026-09-02
Milestone: M-008 — Prototype v0.1 Verification & Release
Decision: HOLD

## Observed on public Android runtime

The Project Owner confirmed that the current camera and gameplay functions work on the Railway deployment, but the active-order HUD panel obscures too much of the playable map, particularly in landscape orientation.

This is a release-blocking mobile usability problem because the player cannot comfortably inspect the expanded world while the order is active.

## Verified owner-review items

- interactive camera behavior is working;
- repeated order generation is working (owner screenshot shows ORDER-004);
- expanded map and named areas are rendering;
- portrait and landscape runtime both launch and remain interactive.

## Remaining blocker

The fixed order-information panel must be made substantially more compact and moved away from the central map view while preserving readability, touch comfort, order information and input isolation.

## Planning boundary

This remains M-008 owner-review remediation linked to the existing HUD and mobile planning lineage. It does not authorize M-009 or RBATCH-018.
