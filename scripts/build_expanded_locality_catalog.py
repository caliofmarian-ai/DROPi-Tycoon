#!/usr/bin/env python3
import argparse
import hashlib
import io
import json
import math
import pathlib
import re
import shutil
import tempfile
import unicodedata
import urllib.request
import zipfile

import pycountry

from country_geometry_identity import load_geometry_id_registry, topology_names

ROOT = pathlib.Path(__file__).resolve().parents[1]
REGISTRY_PATH = ROOT / '04_World/Country_Catalog/EXPANDED_LOCALITY_SOURCE_REGISTRY.json'
TOPOLOGY_PATH = ROOT / 'game-web/public/data/world-atlas-countries-110m.json'
ANCHORS_PATH = ROOT / 'game-web/public/data/country-representative-localities-v1.json'
DEFAULT_OUT = ROOT / 'game-web/public/data/expanded-localities-v1'
DEFAULT_PILOT_CODES = ('RU', 'CA', 'AU', 'BR', 'DE')
SCHEMA_VERSION = '1.0.0'

GEONAMES_FIELDS = (
    'geonameid', 'name', 'asciiname', 'alternatenames', 'latitude', 'longitude',
    'feature_class', 'feature_code', 'country_code', 'cc2', 'admin1_code',
    'admin2_code', 'admin3_code', 'admin4_code', 'population', 'elevation',
    'dem', 'timezone', 'modification_date',
)


def norm(value):
    text = unicodedata.normalize('NFKD', str(value or ''))
    return ''.join(ch for ch in text.casefold() if not unicodedata.combining(ch) and ch.isalnum())


def sha256_file(path):
    digest = hashlib.sha256()
    with path.open('rb') as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b''):
            digest.update(chunk)
    return digest.hexdigest()


def download_verified_asset(registry, asset_name, directory):
    retained = registry.get('retainedSnapshot') or {}
    if retained.get('status') != 'RETAINED':
        raise RuntimeError('expanded locality importer requires retainedSnapshot.status=RETAINED')
    if not registry.get('governance', {}).get('productionImporterMustUseRetainedSnapshot'):
        raise RuntimeError('production importer must be governed to use retained snapshot only')
    asset = (retained.get('assets') or {}).get(asset_name)
    if not asset:
        raise RuntimeError(f'missing retained snapshot asset metadata: {asset_name}')
    url = str(asset.get('url') or '')
    expected_sha = str(asset.get('sha256') or '')
    expected_bytes = int(asset.get('bytes') or 0)
    if not url.startswith('https://github.com/caliofmarian-ai/DROPi-Tycoon/releases/download/'):
        raise RuntimeError(f'{asset_name}: retained URL must point at DROPi Tycoon release assets')
    target = directory / asset_name
    request = urllib.request.Request(url, headers={'User-Agent': 'DROPi-Tycoon-expanded-locality-importer/1.0'})
    with urllib.request.urlopen(request, timeout=120) as response, target.open('wb') as output:
        shutil.copyfileobj(response, output)
    actual_sha = sha256_file(target)
    actual_bytes = target.stat().st_size
    if actual_sha != expected_sha:
        raise RuntimeError(f'{asset_name}: checksum mismatch {actual_sha} != {expected_sha}')
    if actual_bytes != expected_bytes:
        raise RuntimeError(f'{asset_name}: byte-size mismatch {actual_bytes} != {expected_bytes}')
    return target


def load_admin1(path):
    result = {}
    with path.open('r', encoding='utf-8') as handle:
        for raw in handle:
            line = raw.rstrip('\n')
            if not line:
                continue
            fields = line.split('\t')
            if len(fields) < 4 or '.' not in fields[0]:
                raise RuntimeError(f'invalid admin1CodesASCII row: {line!r}')
            country_code, admin1_code = fields[0].split('.', 1)
            result[(country_code, admin1_code)] = {
                'name': fields[1],
                'asciiName': fields[2],
                'sourceRef': f'geonames:{fields[3]}',
            }
    return result


def importance_tier(feature_code, population):
    population_tier = 5
    if population >= 1_000_000:
        population_tier = 1
    elif population >= 250_000:
        population_tier = 2
    elif population >= 50_000:
        population_tier = 3
    elif population >= 10_000:
        population_tier = 4
    feature_tier = {
        'PPLC': 0,
        'PPLA': 1,
        'PPLA2': 2,
        'PPLA3': 3,
        'PPLA4': 4,
    }.get(feature_code, 5)
    return min(population_tier, feature_tier)


def canonical_locality_id(geonameid):
    return f'dropi:locality:geonames:{geonameid}'


def geometry_for_country_code(country_code, rendered):
    country = pycountry.countries.get(alpha_2=country_code)
    if not country or not country.numeric:
        raise RuntimeError(f'{country_code}: no ISO numeric identity available for standard pilot mapping')
    geometry_id = str(country.numeric)
    if geometry_id not in rendered:
        raise RuntimeError(f'{country_code}: ISO numeric geometry {geometry_id} is not rendered by DROPi topology')
    return geometry_id


def longitude_bounds(longitudes):
    values = sorted(((float(value) + 360.0) % 360.0) for value in longitudes)
    if not values:
        raise ValueError('longitude bounds require at least one value')
    if len(values) == 1:
        value = values[0]
        lon = value if value <= 180 else value - 360
        return round(lon, 6), round(lon, 6), False

    gaps = []
    for index, value in enumerate(values):
        next_value = values[(index + 1) % len(values)]
        if index == len(values) - 1:
            next_value += 360.0
        gaps.append((next_value - value, index))
    _, gap_index = max(gaps)
    start = values[(gap_index + 1) % len(values)]
    end = values[gap_index]

    def signed(value):
        normalized = value % 360.0
        return normalized if normalized <= 180.0 else normalized - 360.0

    west = signed(start)
    east = signed(end)
    wraps = west > east
    return round(west, 6), round(east, 6), wraps


def bounds_for(localities):
    if not localities:
        return None
    west, east, wraps = longitude_bounds([item['longitude'] for item in localities])
    return {
        'west': west,
        'south': round(min(item['latitude'] for item in localities), 6),
        'east': east,
        'north': round(max(item['latitude'] for item in localities), 6),
        'wrapsAntimeridian': wraps,
    }


def haversine_km(lon1, lat1, lon2, lat2):
    radius = 6371.0088
    p1 = math.radians(lat1)
    p2 = math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dlambda / 2) ** 2
    return 2 * radius * math.asin(min(1.0, math.sqrt(a)))


def reconcile_anchors(anchors, localities):
    by_name = {}
    for locality in localities:
        primary_keys = {norm(locality['name']), norm(locality['asciiName'])}
        for candidate in locality.get('_matchNames', primary_keys):
            if not candidate:
                continue
            basis = 'primary-name' if candidate in primary_keys else 'alternate-name'
            by_name.setdefault(candidate, []).append((locality, basis))

    reconciliations = []
    for anchor in anchors:
        key = norm(anchor.get('name'))
        candidates = by_name.get(key, [])
        ranked = []
        for candidate, basis in candidates:
            distance = haversine_km(
                float(anchor['longitude']), float(anchor['latitude']),
                candidate['longitude'], candidate['latitude'],
            )
            if distance <= 40.0:
                ranked.append((distance, candidate, basis))
        ranked.sort(key=lambda item: (item[0], -item[1]['population'], item[1]['localityId'], item[2]))
        base = {
            'anchorName': anchor.get('name'),
            'anchorSector': anchor.get('sector'),
            'anchorRole': anchor.get('role'),
        }
        if ranked:
            distance, locality, basis = ranked[0]
            base.update({
                'status': 'MATCHED',
                'localityId': locality['localityId'],
                'sourceRef': locality['sourceRef'],
                'distanceKm': round(distance, 3),
                'matchBasis': basis,
            })
        else:
            base['status'] = 'UNMATCHED'
        reconciliations.append(base)
    return reconciliations


def safe_partition_name(admin1_code):
    if not admin1_code:
        return '_none'
    value = re.sub(r'[^A-Za-z0-9_-]+', '_', admin1_code)
    if not value:
        raise RuntimeError(f'unsafe admin1 code {admin1_code!r}')
    return value


def write_json(path, payload, compact=False):
    path.parent.mkdir(parents=True, exist_ok=True)
    if compact:
        text = json.dumps(payload, ensure_ascii=False, separators=(',', ':')) + '\n'
    else:
        text = json.dumps(payload, ensure_ascii=False, indent=2) + '\n'
    path.write_text(text, encoding='utf-8')


def parse_source(cities_zip, wanted_codes, geometry_by_code, expected_snapshot):
    grouped = {code: [] for code in wanted_codes}
    all_ids = set()
    total_records = 0
    inner_name = str(expected_snapshot.get('innerFile') or 'cities500.txt')
    with zipfile.ZipFile(cities_zip) as archive:
        if inner_name not in archive.namelist():
            raise RuntimeError(f'{cities_zip.name}: missing expected inner file {inner_name}')
        with archive.open(inner_name) as raw, io.TextIOWrapper(raw, encoding='utf-8') as handle:
            for raw_line in handle:
                line = raw_line.rstrip('\n')
                if not line:
                    continue
                fields = line.split('\t')
                if len(fields) != len(GEONAMES_FIELDS):
                    raise RuntimeError(f'GeoNames row has {len(fields)} fields, expected {len(GEONAMES_FIELDS)}')
                row = dict(zip(GEONAMES_FIELDS, fields))
                source_id = int(row['geonameid'])
                if source_id in all_ids:
                    raise RuntimeError(f'duplicate GeoNames id {source_id}')
                all_ids.add(source_id)
                total_records += 1
                country_code = row['country_code']
                if country_code not in grouped:
                    continue
                latitude = float(row['latitude'])
                longitude = float(row['longitude'])
                if not (-90 <= latitude <= 90 and -180 <= longitude <= 180):
                    raise RuntimeError(f'geonames:{source_id}: coordinates out of range')
                population = int(row['population'] or 0)
                locality = {
                    'localityId': canonical_locality_id(source_id),
                    'sourceRef': f'geonames:{source_id}',
                    'sourceId': source_id,
                    'name': row['name'],
                    'asciiName': row['asciiname'] or row['name'],
                    '_matchNames': sorted({
                        key for key in (
                            norm(row['name']),
                            norm(row['asciiname']),
                            *(norm(alias) for alias in row['alternatenames'].split(',') if alias),
                        ) if key
                    }),
                    'latitude': round(latitude, 6),
                    'longitude': round(longitude, 6),
                    'featureCode': row['feature_code'],
                    'population': population,
                    'timezone': row['timezone'],
                    'modifiedOn': row['modification_date'],
                    'admin1Code': row['admin1_code'],
                    'importanceTier': importance_tier(row['feature_code'], population),
                    'geometryId': geometry_by_code[country_code],
                }
                grouped[country_code].append(locality)

    if total_records != int(expected_snapshot['records']):
        raise RuntimeError(f'source record count drift: {total_records} != {expected_snapshot["records"]}')
    if len(all_ids) != int(expected_snapshot['uniqueGeonameIds']):
        raise RuntimeError('source GeoNames IDs are not globally unique as retained contract requires')
    return grouped


def build(args):
    registry = json.loads(REGISTRY_PATH.read_text(encoding='utf-8'))
    if registry.get('version') != '1.1.0':
        raise RuntimeError('expanded locality importer requires source registry version 1.1.0')
    topology = json.loads(TOPOLOGY_PATH.read_text(encoding='utf-8'))
    _, identity_by_name = load_geometry_id_registry()
    rendered = topology_names(topology, identity_by_name)
    anchors_catalog = json.loads(ANCHORS_PATH.read_text(encoding='utf-8'))
    wanted_codes = tuple(dict.fromkeys(code.strip().upper() for code in args.countries.split(',') if code.strip()))
    if not wanted_codes:
        raise RuntimeError('at least one country code is required')
    for code in wanted_codes:
        if code.startswith('X'):
            raise RuntimeError('country selection must use GeoNames ISO alpha-2 source codes, not DROPi geometry IDs')

    geometry_by_code = {code: geometry_for_country_code(code, rendered) for code in wanted_codes}
    if any(geometry_id.startswith('X') for geometry_id in geometry_by_code.values()):
        raise RuntimeError('pilot importer must not route standard source codes through special-status project IDs')

    retained = registry['retainedSnapshot']
    expected_snapshot = registry['observedSnapshot']['cities500']
    out_dir = pathlib.Path(args.out).resolve() if args.out else DEFAULT_OUT
    if out_dir.exists():
        shutil.rmtree(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    with tempfile.TemporaryDirectory(prefix='dropi-geonames-') as tmp:
        tmp_dir = pathlib.Path(tmp)
        cities_zip = download_verified_asset(registry, 'cities500.zip', tmp_dir)
        admin1_path = download_verified_asset(registry, 'admin1CodesASCII.txt', tmp_dir)
        download_verified_asset(registry, 'geonames-readme.txt', tmp_dir)
        admin1_registry = load_admin1(admin1_path)
        grouped = parse_source(cities_zip, wanted_codes, geometry_by_code, expected_snapshot)

    country_entries = []
    total_localities = 0
    total_anchor_matches = 0
    expected_counts = expected_snapshot.get('sampleCountryRecordCounts') or {}

    for country_code in wanted_codes:
        geometry_id = geometry_by_code[country_code]
        rendered_name = rendered[geometry_id]
        localities = grouped[country_code]
        expected_count = expected_counts.get(country_code)
        if expected_count is not None and len(localities) != int(expected_count):
            raise RuntimeError(f'{country_code}: retained count drift {len(localities)} != {expected_count}')
        total_localities += len(localities)
        reconciliations = reconcile_anchors(
            anchors_catalog.get('countries', {}).get(geometry_id, []),
            localities,
        )
        for locality in localities:
            locality.pop('_matchNames', None)
        partitions = {}
        for locality in localities:
            partitions.setdefault(locality['admin1Code'], []).append(locality)

        country_dir = out_dir / 'countries' / geometry_id
        partition_meta = []
        for admin1_code in sorted(partitions, key=lambda value: (value == '', value)):
            records = partitions[admin1_code]
            records.sort(key=lambda item: (
                item['importanceTier'], -item['population'], item['name'].casefold(), item['sourceId'],
            ))
            admin1_meta = admin1_registry.get((country_code, admin1_code)) if admin1_code else None
            filename = f'admin1/{safe_partition_name(admin1_code)}.json'
            partition_payload = {
                'version': SCHEMA_VERSION,
                'geometryId': geometry_id,
                'renderedName': rendered_name,
                'countryCode': country_code,
                'admin1Code': admin1_code or None,
                'admin1Name': admin1_meta['name'] if admin1_meta else None,
                'admin1SourceRef': admin1_meta['sourceRef'] if admin1_meta else None,
                'recordCount': len(records),
                'bounds': bounds_for(records),
                'localities': records,
            }
            write_json(country_dir / filename, partition_payload, compact=True)
            partition_meta.append({
                'admin1Code': admin1_code or None,
                'admin1Name': admin1_meta['name'] if admin1_meta else None,
                'admin1SourceRef': admin1_meta['sourceRef'] if admin1_meta else None,
                'recordCount': len(records),
                'bestImportanceTier': min(item['importanceTier'] for item in records),
                'maxPopulation': max(item['population'] for item in records),
                'bounds': bounds_for(records),
                'file': filename,
            })

        matched_count = sum(item['status'] == 'MATCHED' for item in reconciliations)
        total_anchor_matches += matched_count
        if not any(item.get('anchorSector') == 'CAPITAL' and item['status'] == 'MATCHED' for item in reconciliations):
            raise RuntimeError(f'{country_code}: current Global LOD capital anchor failed exact-name proximity reconciliation')

        country_index = {
            'version': SCHEMA_VERSION,
            'issue': 502,
            'coverageMode': 'pilot',
            'geometryId': geometry_id,
            'renderedName': rendered_name,
            'countryCode': country_code,
            'recordCount': len(localities),
            'admin1PartitionCount': len(partition_meta),
            'bounds': bounds_for(localities),
            'partitions': partition_meta,
            'anchorReconciliation': {
                'globalAnchorCount': len(reconciliations),
                'matchedCount': matched_count,
                'unmatchedCount': len(reconciliations) - matched_count,
                'entries': reconciliations,
            },
        }
        write_json(country_dir / 'index.json', country_index)
        country_entries.append({
            'geometryId': geometry_id,
            'renderedName': rendered_name,
            'countryCode': country_code,
            'recordCount': len(localities),
            'admin1PartitionCount': len(partition_meta),
            'bounds': bounds_for(localities),
            'indexFile': f'countries/{geometry_id}/index.json',
            'matchedGlobalAnchors': matched_count,
        })

    country_entries.sort(key=lambda item: item['geometryId'])
    index = {
        'version': SCHEMA_VERSION,
        'issue': 502,
        'coverageMode': 'pilot',
        'purpose': 'Country/Region LOD locality partitions generated deterministically from the retained GeoNames snapshot.',
        'source': {
            'registryVersion': registry['version'],
            'releaseTag': retained['releaseTag'],
            'cities500Sha256': retained['assets']['cities500.zip']['sha256'],
            'license': retained['license'],
            'attributionText': retained['attributionText'],
        },
        'ownership': {
            'model': 'GeoNames ISO alpha-2 -> ISO numeric DROPi geometry for standard pilot countries',
            'specialStatusProjectIdsIncluded': False,
            'sourceCountryCodeIsMetadataNotSovereigntyAssertion': True,
        },
        'globalLodAnchorCatalogVersion': anchors_catalog['version'],
        'countryCount': len(country_entries),
        'localityCount': total_localities,
        'matchedGlobalAnchorCount': total_anchor_matches,
        'countries': country_entries,
    }
    write_json(out_dir / 'index.json', index)
    print(json.dumps({
        'countries': len(country_entries),
        'localities': total_localities,
        'matchedGlobalAnchors': total_anchor_matches,
        'countryCounts': {item['countryCode']: item['recordCount'] for item in country_entries},
        'admin1Partitions': {item['countryCode']: item['admin1PartitionCount'] for item in country_entries},
    }, indent=2))


def main():
    parser = argparse.ArgumentParser(description='Build source-backed Country/Region LOD locality partitions.')
    parser.add_argument(
        '--countries',
        default=','.join(DEFAULT_PILOT_CODES),
        help='Comma-separated GeoNames ISO alpha-2 codes. Defaults to the governed pilot set.',
    )
    parser.add_argument('--out', default=str(DEFAULT_OUT), help='Output directory for generated locality partitions.')
    args = parser.parse_args()
    build(args)


if __name__ == '__main__':
    main()
