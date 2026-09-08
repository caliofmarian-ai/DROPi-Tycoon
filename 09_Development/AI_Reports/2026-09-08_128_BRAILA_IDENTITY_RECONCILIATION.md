# AI Report 128 — Brăila Identity Reconciliation

**Date:** 2026-09-08
**PR:** #540
**Coordinates:** #539 #541 #327 #406

## Result

The playable city now has one canonical identity: **Brăila**.

This reconciliation rebuilds the visual-identity slice on top of the real-map Brăila runtime merged in #541. It removes the retired prototype city naming from repository text/data identifiers, keeps OSM-backed Brăila street names as the street-label authority, and preserves the useful bounded district/address presentation work without restoring a fictional street grid.

## Visible scope

- six gameplay districts keep distinct cached environmental cues;
- real OSM street names remain the only street-name source;
- up to 18 representative physical buildings receive stable address plaques;
- HQ remains address 1 and DROPi Marketplace remains address 10;
- roads, source centerlines, collisions, entrances, deliveries, hero state and semantic zoom remain owned by the Brăila runtime from #541.

## Identity boundary

Repository text/data identifiers use `braila` for the playable city. Brăila remains mapped to Romania and the source-backed locality identity already established by the world/country catalog.

## Acceptance

Automated gates must pass before merge. After the canonical Railway deployment, owner Android review should verify district readability, real street labels, address plaques, navigation, active-delivery preservation and hero-position preservation across zoom levels.
