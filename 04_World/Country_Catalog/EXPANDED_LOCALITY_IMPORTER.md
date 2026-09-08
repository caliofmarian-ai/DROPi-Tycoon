# Expanded Locality Importer Contract

Status: canonical implementation contract for issue #502.

Coordinates: #417 #446 #491 #498 #502 #503 #504

## Purpose

The current Natural Earth catalog remains the **Global LOD** foundation with 1,356 sparse representative anchors. This importer adds a separate, richer **Country/Region LOD** catalog generated from the retained GeoNames snapshot. It does not replace the Global LOD and it does not cause all imported localities to render simultaneously.

## Source boundary

Production import uses only the retained source release recorded in `EXPANDED_LOCALITY_SOURCE_REGISTRY.json`.

The importer must:

1. download the retained `cities500.zip`, `admin1CodesASCII.txt`, and GeoNames readme assets;
2. verify the canonical byte sizes and SHA-256 digests before parsing;
3. fail closed if the retained source metadata or checksum does not match;
4. never silently fall back to the moving GeoNames daily dump;
5. preserve GeoNames attribution and source identity on every generated locality.

The raw retained source remains a source-data release asset, not a game-bundle asset and not a Git source-tree blob.

## Pilot scope

The first importer slice deliberately validates four geographically large countries plus one dense country:

- Russia (`RU` / geometry `643`);
- Canada (`CA` / geometry `124`);
- Australia (`AU` / geometry `036`);
- Brazil (`BR` / geometry `076`);
- Germany (`DE` / geometry `276`).

This is a governed validation set, not a permanent global whitelist. The importer accepts an explicit comma-separated country selection and will be expanded globally after the pilot ownership, partition and query contracts are certified.

Special-status project geometries are intentionally excluded from this first pilot. They require explicit DROPi ownership rules rather than an automatic interpretation of source country codes.

## Stable identities

Every imported locality keeps two identities:

- `sourceRef = geonames:<geonameid>` — immutable source provenance;
- `localityId = dropi:locality:geonames:<geonameid>` — deterministic DROPi locality key for this source generation.

The generated locality also records its resolved DROPi `geometryId`. Duplicate GeoNames IDs, duplicate DROPi locality IDs or duplicate source refs are verifier failures.

GeoNames country/admin codes are source metadata. They do not override DROPi political/status semantics.

## Partition model

Generated files live under:

`game-web/public/data/expanded-localities-v1/`

Structure:

- `index.json` — pilot/global catalog manifest;
- `countries/<geometryId>/index.json` — one country manifest;
- `countries/<geometryId>/admin1/<code>.json` — first-order administrative partitions;
- `_none.json` — only when a retained source locality lacks an admin1 code.

Country and partition indices record bounds, record counts, source/admin provenance and relevance metadata so runtime queries do not need to enumerate the whole data tree.

Longitude bounds use an explicit `wrapsAntimeridian` flag. This prevents Russia or other dateline-adjacent coverage from being converted into an almost-worldwide bounding box.

## Importance tiers

`importanceTier` is a loading/display relevance hint, **not a political role**.

The deterministic tiers combine GeoNames feature code and population:

| Tier | Typical use |
|---:|---|
| 0 | source capital feature (`PPLC`) |
| 1 | first-order admin capital (`PPLA`) or population >= 1,000,000 |
| 2 | second-order admin capital (`PPLA2`) or population >= 250,000 |
| 3 | third-order admin capital (`PPLA3`) or population >= 50,000 |
| 4 | fourth-order admin capital (`PPLA4`) or population >= 10,000 |
| 5 | remaining supported cities/localities from `cities500` |

These tiers control marker eligibility at semantic zoom. They must never replace the existing source-governed `country-semantic-metadata-v1.json` labels for national capitals, government seats, disputed status or other political semantics.

## Global-anchor reconciliation

Country LOD must not double-render a real locality already visible as a Natural Earth Global LOD anchor.

The importer therefore performs deterministic reconciliation:

- normalize anchor names and GeoNames `name`, `asciiname`, and source-provided `alternatenames` without accents/case/punctuation;
- consider only candidates whose normalized primary or alternate source name matches in the same country;
- record whether a successful link used a `primary-name` or `alternate-name` match basis;
- require <= 40 km source-coordinate distance;
- choose the nearest candidate, then population and stable source ID as deterministic tie-breakers;
- record `MATCHED` or `UNMATCHED` rather than fabricating a relationship.

Each pilot country's Global LOD capital anchor must reconcile exactly once before generation is accepted.

A match means the two LOD records represent one gameplay locality identity transition; it does **not** mean GeoNames becomes the authority for the anchor's political role.

## Runtime query contract

`game-web/src/world/expandedLocalityCatalog.ts` provides a bounded query surface.

The caller supplies:

- active DROPi geometry ID;
- viewport bounds;
- maximum allowed importance tier;
- explicit marker budget.

The query layer:

1. loads only the selected country index;
2. selects admin1 partitions whose bounds intersect the viewport and whose best tier can satisfy the query;
3. loads only those partitions;
4. filters localities to the viewport/tier;
5. sorts deterministically by tier, population, name and source ID;
6. returns at most the caller's explicit marker budget;
7. returns reconciled Global-anchor locality IDs so the rendering layer can transition rather than duplicate them.

This PR does not wire these records into `GlobalMapScene`. Marker rendering remains a later acceptance slice after the data/query pilot is verified.

## Deterministic verification

`scripts/verify_expanded_locality_catalog.py` validates the committed generated pilot without network access.

It rejects:

- source release/checksum drift;
- pilot-country count drift from the retained snapshot;
- duplicate locality/source identities;
- geometry ownership mismatch;
- invalid coordinates or importance tiers;
- incorrect partition bounds/counts/sorting;
- unindexed partition files;
- broken Global-anchor references;
- missing capital-anchor reconciliation;
- accidental raw GeoNames source files inside the game repository.

The normal `Verify Country Catalog Chapters` GitHub gate runs this verifier alongside the existing one-geometry/one-chapter verifier.

## Next expansion boundary

After the pilot is green:

1. inspect pilot file sizes, partition counts and anchor match rates;
2. define explicit ownership mapping for special-status source codes/geometries;
3. expand the deterministic catalog globally;
4. add Country Layer marker clustering/transition behavior using the bounded query API;
5. perform Android landscape owner acceptance;
6. only then proceed to physical terrain under #492.
