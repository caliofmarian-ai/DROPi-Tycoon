# Locality LOD Architecture

Status: Canonical locality-scale architecture for #491 and #502.

Coordinates: #417 #446 #491 #498 #502

## World locality layers

DROPi uses one locality identity graph presented at different levels of detail. LOD is a loading/presentation decision, not a second fictional world.

### LOD 0 — Global anchors

- existing `country-representative-localities-v1.json`;
- current sparse strategic anchors only;
- bounded whole-world marker count;
- capitals/status-sensitive roles remain governed by semantic metadata;
- this layer is retained, not regenerated from GeoNames.

### LOD 1 — Country localities

- important cities and administrative centres from the expanded source;
- queried only for the selected/visible country and viewport;
- importance thresholds and clustering bound marker count;
- all records retain source provenance and stable locality identity.

### LOD 2 — Region localities

- smaller cities/towns/settlements in the active first-order region;
- loaded from spatial/admin partitions;
- no global fixed nine-locality ceiling;
- source density, viewport and zoom determine visibility.

### LOD 3 — City

- selected locality becomes a city/world node with districts, facilities, economy and transport links;
- a locality may exist in aggregate simulation before a detailed city scene is materialized.

### LOD 4 — Street / active area

- roads, buildings, vehicles, pedestrians and player-character scale;
- only active areas receive high-frequency simulation/rendering.

## Identity contract

Every expanded source row has a source identity such as `geonames:<geonameid>`.

DROPi must maintain a canonical locality identity that can link multiple source records/LOD appearances to the same real place. Natural Earth Global anchors and GeoNames Country/Region records must be reconciled rather than displayed as duplicate cities.

Required identity fields for expanded records:

- canonical DROPi locality ID;
- source ID and source dataset version/snapshot;
- canonical display name;
- source name / ASCII name;
- WGS84 coordinates;
- feature code;
- source country code (metadata only);
- resolved DROPi geometry ID;
- admin1 source code and resolved region identity where supported;
- population reference where available;
- source modification date;
- LOD/importance metadata;
- provenance flags and review state.

## Ownership resolution

A GeoNames country code must never directly become authoritative gameplay sovereignty.

Importer ownership flow:

1. ingest source coordinates and metadata;
2. resolve point against DROPi rendered geography / country ownership contract;
3. associate first-order region where trustworthy data exists;
4. compare source country/admin metadata with resolved geometry;
5. route conflicts, border ambiguity and special-status cases to governed review;
6. never fabricate or move a point just to force assignment.

## Spatial loading contract

The expanded catalog must be partitionable by country/region and spatially queryable. Runtime APIs must request only relevant records for current country/region/viewport/zoom.

The data store may contain hundreds of thousands of localities while the active Phaser scene renders a bounded marker set.

Required controls:

- viewport filtering;
- zoom/importance thresholds;
- marker clustering/suppression;
- maximum active marker budget;
- deterministic ordering for ties;
- lazy partition loading;
- no street-level simulation for inactive cities.

## Sparse land is still game territory

A locality catalog describes settlements, not every square kilometre. Areas with no visible locality marker remain meaningful country territory under #498 and later physical geography #492.

Expanded settlement coverage and developable territory are complementary systems.

## Sequence boundary

1. source contract (#502) — this slice;
2. deterministic expanded importer + geometry ownership;
3. partition/index generation;
4. Country/Region query API;
5. progressive marker integration and Android performance limits;
6. global coverage verification;
7. then physical geography/transport #492, followed by resources/economy #493.
