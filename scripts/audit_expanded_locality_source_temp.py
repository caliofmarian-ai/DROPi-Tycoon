from __future__ import annotations

import hashlib
import io
import json
import math
import urllib.request
import zipfile
from collections import Counter
from email.utils import parsedate_to_datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REVIEWED_ON = '2026-09-08'
CITIES_URL = 'https://download.geonames.org/export/dump/cities500.zip'
ADMIN1_URL = 'https://download.geonames.org/export/dump/admin1CodesASCII.txt'
README_URL = 'https://download.geonames.org/export/dump/readme.txt'


def download(url: str) -> tuple[bytes, dict[str, str]]:
    req = urllib.request.Request(url, headers={'User-Agent': 'DROPi-Tycoon-source-audit/1.0'})
    with urllib.request.urlopen(req, timeout=120) as response:
        data = response.read()
        headers = {k.lower(): v for k, v in response.headers.items()}
    if not data:
        raise RuntimeError(f'empty download: {url}')
    return data, headers


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def normalized_last_modified(headers: dict[str, str]) -> str | None:
    value = headers.get('last-modified')
    if not value:
        return None
    return parsedate_to_datetime(value).astimezone().isoformat()


cities_zip, cities_headers = download(CITIES_URL)
admin1_bytes, admin1_headers = download(ADMIN1_URL)
readme_bytes, readme_headers = download(README_URL)

with zipfile.ZipFile(io.BytesIO(cities_zip)) as archive:
    names = archive.namelist()
    assert len(names) == 1, names
    inner_name = names[0]
    assert inner_name.endswith('.txt'), inner_name
    cities_text = archive.read(inner_name).decode('utf-8')

records = []
ids: set[int] = set()
country_counts: Counter[str] = Counter()
feature_counts: Counter[str] = Counter()
admin1_present = 0
population_positive = 0
for line_no, line in enumerate(cities_text.splitlines(), start=1):
    if not line:
        continue
    cols = line.split('\t')
    assert len(cols) == 19, (line_no, len(cols))
    geoname_id = int(cols[0])
    assert geoname_id not in ids, f'duplicate geonameid {geoname_id}'
    ids.add(geoname_id)
    lat = float(cols[4])
    lon = float(cols[5])
    assert math.isfinite(lat) and -90 <= lat <= 90, (line_no, lat)
    assert math.isfinite(lon) and -180 <= lon <= 180, (line_no, lon)
    feature_class = cols[6]
    feature_code = cols[7]
    country_code = cols[8]
    admin1 = cols[10]
    population = int(cols[14] or '0')
    assert feature_class == 'P', (line_no, feature_class, feature_code)
    assert country_code, (line_no, geoname_id, cols[1])
    country_counts[country_code] += 1
    feature_counts[feature_code] += 1
    if admin1:
        admin1_present += 1
    if population > 0:
        population_positive += 1
    records.append((geoname_id, cols[1], lat, lon, feature_code, country_code, admin1, population, cols[18]))

admin1_lines = [line for line in admin1_bytes.decode('utf-8').splitlines() if line.strip()]
assert all(len(line.split('\t')) == 4 for line in admin1_lines)

sample_codes = ['RU', 'CA', 'AU', 'BR', 'US', 'IN', 'DE', 'RO', 'IE']
sample_counts = {code: country_counts[code] for code in sample_codes}
assert all(count > 0 for count in sample_counts.values()), sample_counts

registry = {
    'version': '1.0.0',
    'issue': 502,
    'reviewedOn': REVIEWED_ON,
    'purpose': 'Govern the source and licensing contract for the expanded Country/Region locality LOD without replacing the existing Natural Earth sparse Global LOD anchors.',
    'selectedSourceId': 'geonames-cities500',
    'sources': {
        'geonames-cities500': {
            'publisher': 'GeoNames',
            'dataset': 'cities500.zip',
            'url': CITIES_URL,
            'documentationUrl': 'https://www.geonames.org/export/',
            'readmeUrl': README_URL,
            'license': 'Creative Commons Attribution 4.0',
            'licenseUrl': 'https://creativecommons.org/licenses/by/4.0/',
            'commercialUseAllowed': True,
            'attributionRequired': True,
            'attributionText': 'GeoNames',
            'selectionRule': 'Cities with population greater than 500 or seats of administrative divisions down to PPLA4, as defined by the GeoNames dump readme.',
            'sourceIdentityField': 'geonameid',
            'coordinateReference': 'WGS84 decimal degrees',
            'fieldsUsed': [
                'geonameid', 'name', 'asciiname', 'latitude', 'longitude',
                'feature class', 'feature code', 'country code', 'admin1 code',
                'admin2 code', 'admin3 code', 'admin4 code', 'population',
                'timezone', 'modification date',
            ],
        },
        'geonames-admin1-codes-ascii': {
            'publisher': 'GeoNames',
            'dataset': 'admin1CodesASCII.txt',
            'url': ADMIN1_URL,
            'license': 'Creative Commons Attribution 4.0',
            'licenseUrl': 'https://creativecommons.org/licenses/by/4.0/',
            'attributionRequired': True,
            'purpose': 'Resolve GeoNames first-order administrative codes to display names and source geoname IDs.',
        },
        'natural-earth-sparse-anchors': {
            'publisher': 'Natural Earth',
            'dataset': '1:10m populated places simple (pinned project snapshot)',
            'upstreamCommit': 'ca96624a56bd078437bca8184e78163e5039ad19',
            'license': 'Public domain',
            'termsUrl': 'https://www.naturalearthdata.com/about/terms-of-use/',
            'role': 'Existing Global LOD sparse anchors remain authoritative and are not replaced by this source selection.',
        },
    },
    'observedSnapshot': {
        'observedOn': REVIEWED_ON,
        'cities500': {
            'sha256': sha256(cities_zip),
            'bytes': len(cities_zip),
            'httpLastModified': normalized_last_modified(cities_headers),
            'innerFile': inner_name,
            'records': len(records),
            'uniqueGeonameIds': len(ids),
            'countriesOrTerritoriesWithRecords': len(country_counts),
            'recordsWithAdmin1Code': admin1_present,
            'recordsWithPositivePopulation': population_positive,
            'sampleCountryRecordCounts': sample_counts,
            'topFeatureCodes': dict(feature_counts.most_common(12)),
        },
        'admin1CodesASCII': {
            'sha256': sha256(admin1_bytes),
            'bytes': len(admin1_bytes),
            'httpLastModified': normalized_last_modified(admin1_headers),
            'records': len(admin1_lines),
        },
        'readme': {
            'sha256': sha256(readme_bytes),
            'bytes': len(readme_bytes),
            'httpLastModified': normalized_last_modified(readme_headers),
        },
    },
    'governance': {
        'rawUpstreamArchiveCommittedInThisSlice': False,
        'rawSnapshotRetentionRequiredBeforeProductionCatalogMerge': True,
        'sourceRefreshMustBeExplicitVersionedChange': True,
        'sourceCountryCodeIsMetadataNotSovereigntyAssertion': True,
        'dropiGeometryOwnershipMustBeResolvedAndAuditedSeparately': True,
        'specialStatusSemanticsRemainAuthoritative': True,
        'currentSparseCatalogRemainsGlobalLod': True,
        'noInventedLocalities': True,
        'boundedAndroidRenderObjects': True,
    },
}

registry_path = ROOT / '04_World/Country_Catalog/EXPANDED_LOCALITY_SOURCE_REGISTRY.json'
registry_path.write_text(json.dumps(registry, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

sample_lines = '\n'.join(f'- `{code}`: **{sample_counts[code]:,}** records' for code in sample_codes)
source_audit = f'''# Expanded Locality Source Audit — #502

Status: Canonical source-selection and licensing decision for the richer Country/Region locality catalog.

Coordinates: #417 #446 #491 #498 #502

Reviewed: {REVIEWED_ON}

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
- selected dump: <{CITIES_URL}>
- license: <https://creativecommons.org/licenses/by/4.0/>

## Observed source snapshot

The 2026-09-08 audit downloaded the live source and recorded exact hashes in `EXPANDED_LOCALITY_SOURCE_REGISTRY.json`.

- `cities500.zip` records: **{len(records):,}**
- unique `geonameid` values: **{len(ids):,}**
- countries/territories represented by source country code: **{len(country_counts):,}**
- records with admin1 code: **{admin1_present:,}**
- records with positive population: **{population_positive:,}**
- compressed snapshot SHA-256: `{sha256(cities_zip)}`

Sample coverage counts:
{sample_lines}

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
'''
(ROOT / '04_World/Country_Catalog/EXPANDED_LOCALITY_SOURCE_AUDIT.md').write_text(source_audit, encoding='utf-8')

architecture = '''# Locality LOD Architecture

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
'''
(ROOT / '04_World/LOCALITY_LOD_ARCHITECTURE.md').write_text(architecture, encoding='utf-8')

# Regression contract for the source/LOD slice.
test = r'''import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const registry = JSON.parse(readFileSync(
  new URL('../../04_World/Country_Catalog/EXPANDED_LOCALITY_SOURCE_REGISTRY.json', import.meta.url),
  'utf8',
)) as any

const architecture = readFileSync(
  new URL('../../04_World/LOCALITY_LOD_ARCHITECTURE.md', import.meta.url),
  'utf8',
)

const sparseCatalog = JSON.parse(readFileSync(
  new URL('../public/data/country-representative-localities-v1.json', import.meta.url),
  'utf8',
)) as { version: string; countries: Record<string, unknown[]> }

describe('expanded locality source contract #502', () => {
  it('selects GeoNames cities500 under an explicit commercial-use attribution license', () => {
    expect(registry.version).toBe('1.0.0')
    expect(registry.issue).toBe(502)
    expect(registry.selectedSourceId).toBe('geonames-cities500')
    const source = registry.sources['geonames-cities500']
    expect(source.license).toBe('Creative Commons Attribution 4.0')
    expect(source.commercialUseAllowed).toBe(true)
    expect(source.attributionRequired).toBe(true)
    expect(source.sourceIdentityField).toBe('geonameid')
    expect(source.url).toBe('https://download.geonames.org/export/dump/cities500.zip')
  })

  it('records a validated large global snapshot without committing the raw archive in this slice', () => {
    const snapshot = registry.observedSnapshot.cities500
    expect(snapshot.records).toBeGreaterThan(150_000)
    expect(snapshot.uniqueGeonameIds).toBe(snapshot.records)
    expect(snapshot.countriesOrTerritoriesWithRecords).toBeGreaterThan(150)
    expect(snapshot.sha256).toMatch(/^[0-9a-f]{64}$/)
    for (const code of ['RU', 'CA', 'AU', 'BR', 'US', 'IN', 'DE', 'RO', 'IE']) {
      expect(snapshot.sampleCountryRecordCounts[code]).toBeGreaterThan(0)
    }
    expect(registry.governance.rawUpstreamArchiveCommittedInThisSlice).toBe(false)
    expect(registry.governance.rawSnapshotRetentionRequiredBeforeProductionCatalogMerge).toBe(true)
  })

  it('preserves Natural Earth sparse anchors as Global LOD instead of replacing them', () => {
    expect(sparseCatalog.version).toBe('1.9.0')
    const total = Object.values(sparseCatalog.countries).reduce((sum, nodes) => sum + nodes.length, 0)
    expect(total).toBe(1356)
    expect(registry.governance.currentSparseCatalogRemainsGlobalLod).toBe(true)
    expect(registry.sources['natural-earth-sparse-anchors'].role).toContain('not replaced')
    expect(architecture).toContain('LOD 0 — Global anchors')
    expect(architecture).toContain('LOD 2 — Region localities')
  })

  it('keeps source country codes subordinate to DROPi geometry and special-status governance', () => {
    expect(registry.governance.sourceCountryCodeIsMetadataNotSovereigntyAssertion).toBe(true)
    expect(registry.governance.dropiGeometryOwnershipMustBeResolvedAndAuditedSeparately).toBe(true)
    expect(registry.governance.specialStatusSemanticsRemainAuthoritative).toBe(true)
    expect(architecture).toContain('must never directly become authoritative gameplay sovereignty')
  })
})
'''
(ROOT / 'game-web/tests/expanded-locality-source-contract.test.ts').write_text(test, encoding='utf-8')

print(json.dumps({
    'records': len(records),
    'countries': len(country_counts),
    'sha256': sha256(cities_zip),
    'bytes': len(cities_zip),
    'lastModified': normalized_last_modified(cities_headers),
    'sampleCounts': sample_counts,
}, indent=2))
