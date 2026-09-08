# Country Catalog — Continent → Country Maintenance Model

Status: Maintenance and audit structure for the runtime representative-locality catalog.

Parent: #446

## Why this exists

The runtime already has a deterministic global sparse catalog generated from pinned Natural Earth data. That global file remains the single runtime aggregate.

Maintenance is intentionally smaller-grained:

`Global catalog → Continent chapter → Country entry → anomaly issue only when needed`

This avoids treating ~175 country/territory geometries as one monolithic task and avoids creating ~175 GitHub issues before a problem exists.

## Continent chapters

- Europe — #447
- Africa — #448
- Asia — #449
- North America — #450
- South America — #451
- Oceania — #452
- Special / Antarctic territories — #453

Each chapter has one generated Markdown manifest under `Continents/` with one row per country/territory.

## Country-level work

Country-specific files under `Countries/` are generated only when focused inspection is needed. A dedicated GitHub issue is opened only when a country has a real mismatch, source ambiguity, coverage gap requiring policy, or a correction that should not be mixed with the rest of its continent.

## Audit states

- `PASS` — structural/source-contract checks pass.
- `REVIEW` — a country requires focused investigation.
- `GAP` — the pinned source has no truthful locality coverage; no synthetic place is invented.

A PASS here does not mean country economy, routes, trade or travel simulation are already implemented. It only certifies the sparse geographic catalog entry against the current source/selection contract.

## Reproducible commands

```bash
python scripts/build_country_catalog_chapters.py --continent Europe
python scripts/build_country_catalog_chapters.py --country 642
python scripts/build_country_catalog_chapters.py --all
```

The generator reads the committed runtime catalog and pinned global geometry, and uses Natural Earth admin-0 metadata at the same pinned upstream commit to classify continent chapters.
