# Czechia Administrative Context

Status: governed country context for issue #528 under the Europe country-by-country rollout.

## Current regional structure

The Czech Statistical Office reports that Czechia is divided into **14 regions**. Prague, the Capital City, has a specific region-level position.

Official references:
- https://csu.gov.cz/territorial-units
- https://csu.gov.cz/produkty/regions-of-the-czech-republic-2024

DROPi therefore uses the 14 regions as Czechia's first-order Country/Region gameplay layer.

## Central Bohemian Region seat exception

The Central Bohemian Regional Authority is seated at Zborovská 11, Prague 5. Prague is itself a separate region-level unit.

Official regional reference:
- https://idzsck.stredoceskykraj.cz/en/web/idz/kontakty

The retained GeoNames snapshot source-owns Prague (`geonames:3067696`) under `CZ.52 Prague`. `CZ.88 Central Bohemia` contains no `PPLC` or `PPLA` because the real regional authority is seated outside its territorial source surface.

DROPi therefore keeps one unambiguous Prague locality identity:
- `CZ.52 Prague, the Capital City` → Prague (`PPLC`), retaining national-capital semantics;
- `CZ.88 Central Bohemian Region` → Kladno (`PPL`) as the deterministic source-backed representative inside the region.

Kladno is **not** relabeled as the capital or administrative seat of Central Bohemia. It is only the representative gameplay locality used to avoid duplicating Prague into two regional ownership slots. The true Prague institutional relationship remains explicit in country metadata.

## Density boundary

The retained GeoNames corpus contains 2,772 Czechia candidate localities. The normal regional gameplay layer publishes 14 representatives, one per region. Remaining source localities stay available as provenance/reference infrastructure for future deeper city/locality LOD.

## Multiplayer economy rule

Regional nodes belong to the shared Czech world economy. Their development and prominence are governed by aggregate company activity, employment, production, logistics, construction/investment, transport connectivity, trade, population-economic simulation and regional/national policy.

Personal player progression does not unlock regional development and this country slice defines no arbitrary numeric thresholds.
