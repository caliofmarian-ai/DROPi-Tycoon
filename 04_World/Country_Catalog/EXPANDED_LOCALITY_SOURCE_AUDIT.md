# Expanded Locality Source Audit — #502

Status: Canonical source-selection and licensing decision for the richer Country/Region locality catalog.

Coordinates: #417 #446 #491 #498 #502

Reviewed: 2026-09-08

## Decision

Use **GeoNames `cities500.zip`** as the selected primary source for the expanded locality catalog beneath the existing sparse Global LOD.

Do **not** replace the current Natural Earth sparse anchor catalog. Natural Earth remains the Global LOD identity/provenance foundation; GeoNames supplies the much denser Country/Region discovery layer.

## Why GeoNames `cities500`

The GeoNames dump contract provides the properties required by DROPi:

- stable integer `geonameid` source identifiers;
- WGS84 latitude/longitude;
- city/village feature class and detailed feature codes;
- ISO country-code metadata;
- admin1 through admin4 codes;
- population where available;
- timezone and modification date;
- a separate admin1 code table;
- approximately 185,000 cities with population >500 or administrative seats down to PPLA4 by the upstream definition.

The upstream readme licenses the Gazetteer extracts under **Creative Commons Attribution 4.0**. GeoNames states that commercial use is allowed and attribution is required.

Canonical URLs:
- data export: <https://www.geonames.org/export/>
- dump readme: <https://download.geonames.org/export/dump/readme.txt>
- selected dump: <https://download.geonames.org/export/dump/cities500.zip>
- license: <https://creativecommons.org/licenses/by/4.0/>

## Observed source snapshot

The 2026-09-08 audit downloaded the live source and recorded exact hashes in `EXPANDED_LOCALITY_SOURCE_REGISTRY.json`.

- `cities500.zip` records: **235,694**
- unique `geonameid` values: **235,694**
- countries/territories represented by source country code: **246**
- records with admin1 code: **235,577**
- records with positive population: **205,080**
- compressed snapshot SHA-256: `f3cda4f9d256d90045121fb8eebad3ed91695c32370ed93b50fbe0cb616e2bbd`

Sample coverage counts:
- `RU`: **5,323** records
- `CA`: **3,296** records
- `AU`: **4,901** records
- `BR`: **5,897** records
- `US`: **21,784** records
- `IN`: **7,112** records
- `DE`: **11,920** records
- `RO`: **7,149** records
- `IE`: **566** records

These counts are an upstream snapshot observation, not gameplay quotas.

## Alternative source assessment

### Natural Earth

Keep for **Global LOD**. It is public domain, already pinned and deeply integrated with the current Country Catalog. Its populated-place coverage is intentionally sparse and therefore cannot by itself solve country-interior locality density.

### OpenStreetMap

Do not use OSM as the primary expanded locality registry in this slice. OSM is extremely valuable for later street/road/rail/facility geography, but its ODbL database share-alike and attribution obligations require a broader derived-database distribution design. Reserve that decision for the physical geography / transport work (#492) rather than unnecessarily coupling the city-identity catalog to ODbL now.

## Snapshot / reproducibility rule

GeoNames publishes changing extracts rather than a project-owned immutable release. Therefore:

1. every accepted DROPi import must record source URL, observed date, upstream HTTP metadata and SHA-256;
2. source refresh is an explicit versioned repository change, never a silent CI download;
3. normalized generated catalog partitions must be committed or otherwise durably versioned;
4. the raw source snapshot must be durably retained before a production expanded-catalog merge so the exact import can be audited later;
5. a changed upstream SHA must fail a pinned refresh unless a governed source-update change explicitly approves it.

This source-contract PR does **not** commit the raw GeoNames archive.

## Political/status boundary

GeoNames `country code` and administrative codes are source metadata. They are not DROPi sovereignty decisions.

Expanded locality assignment must resolve every gameplay locality to the project-owned rendered geometry/region hierarchy and then pass existing special-status governance. Kosovo (`XKX`), N. Cyprus (`XNC`), Somaliland (`XSL`), Western Sahara, Israel/Palestine, Falkland Islands/Malvinas, Antarctica and any later sensitive geometry retain their explicit semantic contracts.

No point is silently reassigned to make a source country code fit a political assumption.

## Next implementation slice

Build a deterministic importer that converts the selected source into partitioned Country/Region LOD data, with:

- canonical DROPi locality identity + GeoNames source identity;
- audited geometry ownership;
- admin1 linkage where supported;
- importance/zoom metadata;
- spatial partitioning;
- no duplicate marker for a Natural Earth anchor that resolves to the same real locality;
- review queues for ambiguous/border/status-sensitive cases;
- no requirement to render the whole catalog at once.

## Durable snapshot retention

The exact 2026-09-08 audited inputs are retained outside the Git source tree as GitHub Release assets under tag `source-geonames-cities500-2026-09-08-f3cda4f9`.

Retained assets:
- `cities500.zip` — SHA-256 `f3cda4f9d256d90045121fb8eebad3ed91695c32370ed93b50fbe0cb616e2bbd`;
- `admin1CodesASCII.txt` — SHA-256 `590651498043f674accda2b7f46d21286cda0e290b02f8561c5005eee9a5448c`;
- `geonames-readme.txt` — SHA-256 `b1957379b6c1242c700c98ac9a8aa0a09f56c3c0a50ee72175527005f48ef2c5`.

Production catalog generation must consume this retained snapshot, verify checksums before parsing, and must not silently fall back to the moving upstream daily dump. A future GeoNames refresh requires a new explicit snapshot/version rather than mutation of this retained source contract.
