# Country Layer Representative Locality Dataset

Status: Runtime data contract for Issue #442.

## Source
- Natural Earth `ne_10m_populated_places_simple`
- upstream repository: `nvkelso/natural-earth-vector`
- pinned upstream commit: `ca96624a56bd078437bca8184e78163e5039ad19`
- license: Public Domain

Natural Earth provides real city/town coordinates, capital classification, administrative context and population reference fields. DROPi Tycoon does not ship the full source layer at runtime. `scripts/build_country_locality_catalog.py` deterministically reduces it to a sparse catalog bounded to nine representative locality nodes per rendered geometry.

## Selection contract
Per geometry:
1. one structural capital slot where source coverage and current-reality governance support it;
2. up to four representative city nodes in N/E/S/W sectors;
3. up to four smaller secondary-locality nodes in NE/SE/SW/NW sectors;
4. fewer nodes are preserved honestly when source coverage is insufficient;
5. every stored coordinate is a real pinned-source coordinate; no locality point is manually invented or repositioned.

A cardinal `urban` candidate must be an Admin-1 capital or have a Natural Earth population reference of at least 15,000. Directional alignment and relative importance then select a representative city for the sector. If no truthful qualifying candidate exists, the sector may remain empty instead of promoting a tiny settlement merely to complete the pattern.

Secondary diagonal nodes intentionally permit smaller towns/localities because their purpose is to represent the rural/smaller-settlement layer requested by the product model.

Directional selection uses each geometry's source settlement extent only to score geographic sectors. It does not move the source coordinates and it does not claim that the selected places are the only important settlements in that country or territory.

## Current-reality locality role overrides

Natural Earth's pinned snapshot remains authoritative for locality identity and coordinates, but its capital flags are not treated as permanently authoritative current-reality semantics. Reviewed mismatches are governed by `04_World/Country_Catalog/COUNTRY_LOCALITY_ROLE_OVERRIDES.json`.

The override registry stores source-name aliases and player-facing display names, never longitude or latitude. During regeneration the generator must resolve every governed locality to exactly one feature inside the already-mapped country/territory source pool. If a capital or required representative cannot be resolved uniquely, generation fails rather than fabricating a point or silently choosing another settlement.

The initial governed corrections are:
- Japan (`392`): Tokyo receives the current structural capital role; source-backed Kyoto remains a representative city (#464).
- Myanmar (`104`): Nay Pyi Taw receives the current structural capital role; source-backed Yangon remains a commercial/representative city (#465).
- Sri Lanka (`144`): source-backed Sri Jayewardenepura Kotte receives the structural capital slot while Colombo remains represented separately; player-facing administrative/commercial distinctions live in the semantic metadata layer (#466).
- Chile (`152`): Santiago receives the current structural capital role; source-backed Valparaíso remains represented separately with its legislative-seat semantics (#473).

`game-web/public/data/country-semantic-metadata-v1.json` governs the player-facing meaning of these roles. This separation permits constitutional, administrative, legislative, commercial, claimed-capital, research/logistics and special-status semantics without changing source coordinates or forcing reality into one generic `capital` label.

## Geometry identity and coverage

The current rendered topology contains 177 distinct geometries. Three source-null geometries use stable DROPi-owned, non-ISO catalog keys defined in `04_World/Country_Catalog/GEOMETRY_ID_REGISTRY.json`: `XNC` (N. Cyprus), `XSL` (Somaliland) and `XKX` (Kosovo). These keys are serialization identities only and do not assert sovereignty or recognition.

Dataset v1.3.0 provides representative nodes for 175 of the 177 rendered geometries and 1,355 nodes in total, with at most nine per geometry. The two explicit coverage gaps are:
- `260` — Fr. S. Antarctic Lands: the pinned populated-place source does not provide a truthful supported settlement node.
- `XNC` — N. Cyprus: the pinned source does not currently map representative localities safely to the separately rendered geometry.

The runtime preserves both gaps rather than inventing settlements. Coverage gaps are persisted in the generated JSON so they remain auditable.

## Runtime purpose
The catalog powers Country Map inspection. It is not yet an economy, route, travel or ownership model. Future administrative, transport, industry and economy overlays must attach authoritative simulation state to these or later-refined geographic entities rather than turning them into decorative traffic.

## Generator requirements
The committed runtime catalog has no Python/runtime dependency. Regeneration is an offline build-time maintenance task and requires Python plus `pycountry` to reconcile Natural Earth ISO alpha-2 values with the numeric ISO country IDs used by the pinned world-atlas topology.

A valid regeneration must run:
1. `python scripts/build_country_locality_catalog.py`
2. `python scripts/build_country_catalog_chapters.py --all`
3. `python scripts/verify_country_catalog_chapters.py --write-report`
4. `git diff --check`

The generated runtime catalog records both the geometry-identity registry version and locality-role-override registry/source commit so the committed output remains traceable to its governing inputs.
