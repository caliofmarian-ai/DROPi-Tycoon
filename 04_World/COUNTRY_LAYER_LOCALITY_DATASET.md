# Country Layer Representative Locality Dataset

Status: Runtime data contract for Issue #442.

## Source
- baseline locality source: Natural Earth `ne_10m_populated_places_simple`
- upstream repository: `nvkelso/natural-earth-vector`
- pinned upstream commit: `ca96624a56bd078437bca8184e78163e5039ad19`
- Natural Earth license: Public Domain
- reviewed current-reality supplements: `04_World/Country_Catalog/COUNTRY_LOCALITY_AUTHORITATIVE_SUPPLEMENTS.json`

Natural Earth provides the baseline real city/town coordinates, capital classification, administrative context and population reference fields. DROPi Tycoon does not ship the full source layer at runtime. `scripts/build_country_locality_catalog.py` deterministically reduces it to a sparse catalog bounded to nine representative locality nodes per rendered geometry.

A reviewed authoritative locality supplement may be used only when a material current-reality locality needed by the product is absent from the pinned Natural Earth snapshot. A supplement does not mutate Natural Earth or masquerade as Natural Earth provenance; it carries its own institutional source, original coordinate text, effective date and review issue into the generated runtime node.

## Selection contract
Per geometry:
1. one structural capital slot where source coverage and current-reality governance support it;
2. up to four representative city nodes in N/E/S/W sectors;
3. up to four smaller secondary-locality nodes in NE/SE/SW/NW sectors;
4. fewer nodes are preserved honestly when source coverage is insufficient;
5. every stored coordinate must be source-backed either by the pinned Natural Earth feature or by an explicitly governed authoritative supplement; no locality point is manually invented, estimated from a map image or repositioned.

A cardinal `urban` candidate must be an Admin-1 capital or have a Natural Earth population reference of at least 15,000. Directional alignment and relative importance then select a representative city for the sector. If no truthful qualifying candidate exists, the sector may remain empty instead of promoting a tiny settlement merely to complete the pattern.

Secondary diagonal nodes intentionally permit smaller towns/localities because their purpose is to represent the rural/smaller-settlement layer requested by the product model.

Directional selection uses each geometry's governed settlement extent only to score geographic sectors. It does not move coordinates and it does not claim that the selected places are the only important settlements in that country or territory.

## Current-reality locality role overrides

Natural Earth's pinned snapshot remains the baseline locality dataset, but its capital flags are not treated as permanently authoritative current-reality semantics. Reviewed mismatches are governed by `04_World/Country_Catalog/COUNTRY_LOCALITY_ROLE_OVERRIDES.json`.

For an ordinary override, the registry stores source-name aliases and player-facing display names, never longitude or latitude. During regeneration the generator must resolve every governed locality to exactly one feature inside the already-mapped country/territory Natural Earth pool. If a capital or required representative cannot be resolved uniquely, generation fails rather than fabricating a point or silently choosing another settlement.

The source-backed governed corrections are:
- Japan (`392`): Tokyo receives the current structural capital role; source-backed Kyoto remains a representative city (#464).
- Myanmar (`104`): Nay Pyi Taw receives the current structural capital role; source-backed Yangon remains a commercial/representative city (#465).
- Sri Lanka (`144`): source-backed Sri Jayewardenepura Kotte receives the structural capital slot while Colombo remains represented separately; player-facing administrative/commercial distinctions live in the semantic metadata layer (#466).
- Chile (`152`): Santiago receives the current structural capital role; source-backed Valparaíso remains represented separately with its legislative-seat semantics (#473).
- South Africa (`710`): Pretoria receives the structural capital slot while source-backed Cape Town, Bloemfontein and Johannesburg are all retained as required representative nodes. Semantic metadata exposes Pretoria as administrative capital, Cape Town as legislative capital, Bloemfontein as judicial capital and Johannesburg as a major city hosting the Constitutional Court (#460).
- Tanzania (`834`): Dodoma receives the structural national-capital slot while source-backed Dar es Salaam is retained as the commercial capital / major seaport. The correction changes locality roles only and does not activate or alter logistics/economy simulation (#461).

`game-web/public/data/country-semantic-metadata-v1.json` governs the player-facing meaning of these roles. This separation permits constitutional, administrative, legislative, judicial, commercial, claimed-capital, research/logistics and special-status semantics without changing geographic coordinates or forcing reality into one generic `capital` label.

## Multi-capital structural rule

The sparse locality catalog deliberately permits only one structural `capital` slot because that field is used for deterministic map placement and legacy structural selection. It must not be interpreted as a claim that every country has only one capital function.

For a reviewed multi-capital country:
- one source-backed locality may occupy the structural `capital` slot for stable sparse-map behavior;
- every other official capital locality required for truthful presentation must be retained within the same <=9 node budget;
- `country-semantic-metadata-v1.json` is authoritative for the player-facing function of each capital locality;
- the structural slot must never cause a retained official capital or major city to be mislabeled as the sole national capital.

South Africa is the first explicit three-capital implementation of this rule. The pinned source resolves Pretoria, Cape Town, Bloemfontein and Johannesburg uniquely, so no authoritative supplement is needed.

## Authoritative locality supplement contract

`COUNTRY_LOCALITY_AUTHORITATIVE_SUPPLEMENTS.json` is the exceptional path for a reviewed current-reality locality that is required for truthful presentation but is absent from the pinned Natural Earth populated-place snapshot.

A supplement is valid only when:
- a named institutional source is recorded with an HTTPS source URL;
- the target DROPi geometry ID is explicit;
- the original coordinate text from the source is preserved;
- decimal longitude/latitude are an exact deterministic conversion of that source coordinate, not an approximate point selected visually;
- the review issue is recorded;
- any effective date governing the changed role is recorded;
- runtime output identifies the node as `sourceKind: authoritative-supplement` and carries the supplement/source references forward.

### Equatorial Guinea (`226`) — #459

The pinned Natural Earth snapshot contains Bata, Calatrava, Evinayong, Luba, Malabo and Mongomo for geometry `226`, but it does not contain Ciudad de la Paz / former Oyala. Decree-Law No. 1/2026 declared Ciudad de la Paz the capital on 2 January 2026, after the pinned snapshot. The UK Permanent Committee on Geographical Names (PCGN) factfile provides the locality name, former name and coordinate `01°35′33″N 10°49′25″E`.

The governed supplement `equatorial-guinea-ciudad-de-la-paz-2026` therefore supplies only the missing authoritative locality feature. Its decimal coordinate is the deterministic conversion of the recorded DMS coordinate. The role override assigns that supplement the structural `capital` slot and retains Natural Earth-backed Malabo as a non-capital representative city. Semantic metadata describes Malabo as the former capital / transition city rather than erasing it from the Country Layer.

This is not permission to replace stale or inconvenient Natural Earth values with arbitrary coordinates. The supplement path exists only for reviewed, source-documentable current-reality gaps.

## Geometry identity and coverage

The current rendered topology contains 177 distinct geometries. Three source-null geometries use stable DROPi-owned, non-ISO catalog keys defined in `04_World/Country_Catalog/GEOMETRY_ID_REGISTRY.json`: `XNC` (N. Cyprus), `XSL` (Somaliland) and `XKX` (Kosovo). These keys are serialization identities only and do not assert sovereignty or recognition.

Dataset v1.6.0 provides representative nodes for 175 of the 177 rendered geometries and 1,356 nodes in total, with at most nine per geometry. The two explicit coverage gaps are:
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

The generated runtime catalog records the geometry-identity registry version, locality-role-override registry/source commit and any authoritative supplement refs actually used. This makes the committed output traceable to every governing geographic input rather than presenting all coordinates as though they came from one source.
