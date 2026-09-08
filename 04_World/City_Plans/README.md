# Real-map city plans — Brăila pilot

Implementation record for #535, related to #491/#492/#493 and Owner Directive 006. The existing DROPi city art is reused. The Brăila scene is a bounded central-city adaptation with the Danube; it is not a complete municipal survey or a surveyed 3D reconstruction.

## What comes from the real map

Retained OpenStreetMap street centerlines preserve the Brăila pattern, including Piața Traian, Bulevardul Independenței, Calea Călărașilor and Calea Galați. River centerlines, park outlines and building footprints provide city massing. Streets connect at shared source vertices; overlapping bounding boxes never invent a junction.

Building roofs use the established warm game palette. Existing interactive shops, HQ, customers and merchant identities are fictional game placements on safe street frontages. They replace nearby context massing and retain their original gameplay IDs. Starter placements are clustered by connected street distance to preserve the walking delivery loop without changing transport ranges or economic rewards. Pavement access depth can vary with the angle of a real street; the roadside interaction points and their collision checks remain shared by routes and gameplay.

The six legacy district IDs are gameplay service groups, not surveyed Brăila neighborhood borders. Their labels use local streets/areas. The Danube ribbon has an illustrative width. Context buildings are decorative massing below the walkable street surface, without interactive interiors or separate economic simulation.

## Reproduce offline

Install the existing `game-web` dependencies. The generators use retained source records, not moving live APIs.

```sh
node scripts/export_legacy_city.cjs /tmp/dropi-city-seed.json
python scripts/build_map_inspired_city.py --config 04_World/City_Plans/BRAILA_CONFIG.json --seed /tmp/dropi-city-seed.json
python scripts/build_city_context.py --config 04_World/City_Plans/BRAILA_CONFIG.json
```

`legacyCityLayout.ts` supplies the former building/route inventory to the offline generator. Runtime imports only the generated Brăila plan and erased type exports, not a second active city.

Each retained source records request extents, retrieval date and source response checksums. No contributor usernames, node editor metadata, residents or address-owner information are retained.

## Visual scale and loading

Local zoom covers hero, area, district and city. Zooming past the city opens its geographic county. Country/region/county/locality inspection can return to the playable Brăila city view; other locality scenes are explicitly pending. The map sleeps and wakes the existing city scene, preserving the hero, active order and cargo.

Country zoom uses the existing sparse national anchors. Deeper levels lazily load the selected country's regional file through a build-time catalog index; new country files are discovered without edits to the map scene. The base catalog and political-role metadata remain authoritative.

Geographic labels use screen-space font sizes and collision suppression, at most 64 labels and 80 locality markers. Relief keeps at most six decoded detail tiles and two concurrent requests. The city has a 1536-pixel overview plus up to twelve 768-pixel local tiles, generated one per frame and discarded outside the visible area. Detail tiles are excluded from the fixed HUD camera.

## Compatibility and review

The legacy `braila` ID remains the save identity; the visible city is Brăila. Save v2 already regenerates transient world position/order state on disk load. The new reset point is the safe Brăila HQ frontage. Company money, assets, staff, progression and merchant/customer IDs are retained. Merely opening the strategic map does not trigger that reset.

#317 and Directive 004 retain owner Android review for this visible milestone. Automated checks cover source identity, street connectivity, traversable entrances, delivery loops, zoom math and bounded detail. A local build is not evidence of visual approval or Android frame rate.

The worldwide policy is in `CITY_PLAN_POLICY.json`. Bucharest and other capitals/major cities still need their own retained real-map plans and architectural adaptation. This pilot does not claim they have been rendered.

## OpenStreetMap attribution and data license

Street, park, river and building source data: © OpenStreetMap contributors, [Open Database License 1.0](https://www.openstreetmap.org/copyright).

The retained OSM databases in `Sources/` and the OSM-derived generated geographic/layout databases are provided under ODbL 1.0. The complete retained inputs, derived outputs and transformation scripts are included in this repository. The game HUD displays attribution and links to the copyright page. Existing original game artwork and code retain their existing licenses; this statement does not relicense them as OSM data.

OpenStreetMap reference: [central Brăila](https://www.openstreetmap.org/#map=14/45.272/27.960). Source-backed geographic anchoring uses the existing Romanian GeoNames catalog (CC BY 4.0).
