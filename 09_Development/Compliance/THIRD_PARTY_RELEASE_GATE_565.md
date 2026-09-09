# Issue #565 — Third-Party Release Gate Implementation

Status: IMPLEMENTED ENGINEERING GATE — COMMERCIAL RELEASE REMAINS BLOCKED
Date: 2026-09-09
Baseline: `65413103c7ae4e1951ac63aacc8e1232643e0bd0`
Owner lane: DT-13 Legal / Privacy / IP

## Purpose

Operationalize the canonical requirements in `00_Project/THIRD_PARTY_LICENSE_REGISTER.md` without claiming legal clearance that the repository cannot prove.

This slice adds reproducible release evidence and a deterministic gate. It does not change gameplay, monetization, authentication, save state, geographic source data or asset binaries.

## Implemented evidence

### User-accessible notices

`game-web/public/legal/third-party-notices.html` is shipped through the Phaser/Vite `public/` surface and is reachable from Main Menu → Information → Third-party notices.

It records:

- OpenStreetMap contributor attribution and ODbL 1.0 reference;
- GeoNames attribution, CC BY 4.0 reference, transformation notice and retained source snapshot identity;
- Natural Earth public-domain provenance;
- `world-atlas@2.0.2` ISC notice;
- Phaser 3.90.0 MIT notice;
- EventEmitter3 5.0.4 MIT notice;
- Postgres.js 3.4.9 Unlicense notice.

### Production npm inventory

`game-web/public/legal/dependency-license-inventory.json` records the exact current production dependency closure derived from `game-web/package-lock.json`:

| Package | Version | Relationship | License |
|---|---:|---|---|
| phaser | 3.90.0 | direct | MIT |
| eventemitter3 | 5.0.4 | transitive via Phaser | MIT |
| postgres | 3.4.9 | direct | Unlicense |

Development-only dependencies are explicitly outside this shipped production inventory.

### Runtime provenance manifest

`game-web/public/legal/runtime-provenance.json` records all current files under `game-web/public/assets/**` plus governed runtime data families.

The manifest deliberately distinguishes:

- project-generated legacy placeholder sprites;
- branding that has owner/source-hash evidence but still needs commercial chain-of-title/trademark clearance;
- `icon-orders.webp`, which has visual/runtime approval but lacks the exact generation provider/tool/terms/input chain required for commercial clearance;
- Natural Earth runtime data;
- GeoNames regional-locality outputs;
- OpenStreetMap-derived Brăila geography.

The manifest sets `commercialReleaseReady` to `false`. This is intentional and truthful.

## Deterministic verification

`game-web/scripts/verify-third-party-release.mjs` validates:

1. the production npm dependency closure against the machine-readable inventory;
2. required software/data notice sections;
3. complete registration of every current `public/assets/**` file;
4. required Natural Earth / GeoNames / OSM data-family records;
5. GeoNames source/license metadata on every current Europe regional-locality runtime file;
6. Natural Earth source/license metadata on the sparse global locality runtime file;
7. presence of the audited world-atlas country-boundary runtime file.

Commands:

```text
npm run compliance:verify
npm run compliance:release-gate
```

`compliance:verify` is the consistency check and should pass in normal CI.

`compliance:release-gate` is intentionally strict. It exits non-zero while `commercialReleaseReady` is false, so a future commercial-release workflow cannot silently treat documentation presence as legal clearance.

The Vitest suite exercises both paths: consistency must pass and the commercial gate must fail while blockers remain.

## Current blocker register

### `generated-orders-icon-chain-of-title`

`game-web/public/assets/production/icon-orders.webp` remains blocked for commercial release until the exact generation provider/tool, generation date, applicable provider terms/account entitlement, input/reference provenance and derivative lineage are linked to the runtime asset.

Engineering must not invent those facts.

### `branding-chain-of-title-and-trademark`

The DROPi Tycoon logo has canonical owner approval and a source SHA-256 in `08_Assets/ASSETS.md`, but the repository does not yet prove the complete commercial creation/provider chain or qualified trademark clearance for the product identity.

### `osm-commercial-distribution-characterization`

OpenStreetMap attribution is already visible in the runtime and is now also present in the packaged legal notice. Source snapshots and transformation evidence exist. Qualified legal review is still required to determine the exact ODbL Database / Derivative Database / Produced Work characterization and the corresponding source-availability/share-alike mechanism for the final commercial distribution.

## What this slice closes technically

- missing packaged third-party notices surface;
- missing exact production npm dependency inventory;
- missing machine-readable runtime asset/data provenance gate;
- missing user navigation from the app to the notices;
- missing deterministic drift detection between the lockfile, public assets, runtime data and release evidence.

## What this slice does not claim

It does not mark #565 complete and does not assert qualified legal clearance for:

- DROPi / DROPi Tycoon trademarks;
- generated-art chain of title where provider/terms evidence is absent;
- final ODbL distribution characterization.

Those are real commercial-release blockers, not test failures to bypass.

## Android integration dependency

Issue #567 owns bundling the authoritative Phaser runtime inside production Android. When that work lands, the `public/legal/**` files are part of the same authoritative runtime bundle and must remain included. Android packaging must not omit the legal directory while copying runtime assets.
