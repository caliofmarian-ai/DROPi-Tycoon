#!/usr/bin/env python3
import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parents[1]
REGISTRY_PATH = ROOT / '04_World/Country_Catalog/EXPANDED_LOCALITY_SOURCE_REGISTRY.json'
CATALOG_ROOT = ROOT / 'game-web/public/data/expanded-localities-v1'
INDEX_PATH = CATALOG_ROOT / 'index.json'
EXPECTED_PILOT_CODES = {'RU', 'CA', 'AU', 'BR', 'DE'}


def load_json(path):
    return json.loads(path.read_text(encoding='utf-8'))


def longitude_inside(value, bounds):
    west = float(bounds['west'])
    east = float(bounds['east'])
    if bounds.get('wrapsAntimeridian'):
        return value >= west or value <= east
    return west <= value <= east


def bounds_contain(locality, bounds):
    return (
        float(bounds['south']) <= locality['latitude'] <= float(bounds['north'])
        and longitude_inside(locality['longitude'], bounds)
    )


def sort_key(item):
    return (
        item['importanceTier'],
        -item['population'],
        item['name'].casefold(),
        item['sourceId'],
    )


def main():
    registry = load_json(REGISTRY_PATH)
    if registry.get('version') != '1.1.0':
        raise SystemExit('FAIL: expanded locality source registry must be version 1.1.0')
    retained = registry.get('retainedSnapshot') or {}
    if retained.get('status') != 'RETAINED':
        raise SystemExit('FAIL: retained GeoNames snapshot is not canonical')
    if not INDEX_PATH.exists():
        raise SystemExit(f'FAIL: missing expanded locality index {INDEX_PATH}')
    index = load_json(INDEX_PATH)
    if index.get('version') != '1.0.0' or index.get('coverageMode') != 'pilot':
        raise SystemExit('FAIL: expanded locality pilot index has unexpected version/mode')
    if index.get('source', {}).get('registryVersion') != registry['version']:
        raise SystemExit('FAIL: catalog source registry version drift')
    if index.get('source', {}).get('releaseTag') != retained['releaseTag']:
        raise SystemExit('FAIL: catalog is not tied to retained GeoNames release')
    if index.get('source', {}).get('cities500Sha256') != retained['assets']['cities500.zip']['sha256']:
        raise SystemExit('FAIL: catalog source SHA drift')
    if index.get('ownership', {}).get('specialStatusProjectIdsIncluded') is not False:
        raise SystemExit('FAIL: pilot must not silently include special-status project geometries')

    countries = index.get('countries') or []
    codes = {entry.get('countryCode') for entry in countries}
    if codes != EXPECTED_PILOT_CODES:
        raise SystemExit(f'FAIL: pilot country set drift {sorted(codes)} != {sorted(EXPECTED_PILOT_CODES)}')
    expected_counts = registry['observedSnapshot']['cities500']['sampleCountryRecordCounts']

    all_locality_ids = set()
    all_source_refs = set()
    total_records = 0
    total_anchor_matches = 0

    for country_entry in countries:
        country_code = country_entry['countryCode']
        geometry_id = country_entry['geometryId']
        if geometry_id.startswith('X'):
            raise SystemExit(f'FAIL: pilot country {country_code} routed to special project geometry {geometry_id}')
        expected_count = int(expected_counts[country_code])
        if country_entry['recordCount'] != expected_count:
            raise SystemExit(f'FAIL: {country_code} count {country_entry["recordCount"]} != retained {expected_count}')
        country_index_path = CATALOG_ROOT / country_entry['indexFile']
        country_index = load_json(country_index_path)
        if country_index['geometryId'] != geometry_id or country_index['countryCode'] != country_code:
            raise SystemExit(f'FAIL: {country_code} country index identity drift')
        if country_index['recordCount'] != expected_count:
            raise SystemExit(f'FAIL: {country_code} country index count drift')

        listed_partition_files = []
        country_locality_ids = set()
        country_records = 0
        for partition in country_index.get('partitions') or []:
            listed_partition_files.append(partition['file'])
            partition_path = country_index_path.parent / partition['file']
            if not partition_path.exists():
                raise SystemExit(f'FAIL: missing partition {partition_path}')
            payload = load_json(partition_path)
            if payload['geometryId'] != geometry_id or payload['countryCode'] != country_code:
                raise SystemExit(f'FAIL: partition identity drift {partition_path}')
            if payload.get('admin1Code') != partition.get('admin1Code'):
                raise SystemExit(f'FAIL: admin1 code drift {partition_path}')
            localities = payload.get('localities') or []
            if payload['recordCount'] != len(localities) or partition['recordCount'] != len(localities):
                raise SystemExit(f'FAIL: record count mismatch {partition_path}')
            if localities != sorted(localities, key=sort_key):
                raise SystemExit(f'FAIL: nondeterministic locality ordering {partition_path}')
            if partition['bounds'] != payload['bounds']:
                raise SystemExit(f'FAIL: partition bounds metadata drift {partition_path}')
            if localities:
                if partition['bestImportanceTier'] != min(item['importanceTier'] for item in localities):
                    raise SystemExit(f'FAIL: best importance tier drift {partition_path}')
                if partition['maxPopulation'] != max(item['population'] for item in localities):
                    raise SystemExit(f'FAIL: max population drift {partition_path}')
            for locality in localities:
                source_id = locality['sourceId']
                expected_locality_id = f'dropi:locality:geonames:{source_id}'
                expected_source_ref = f'geonames:{source_id}'
                if locality['localityId'] != expected_locality_id or locality['sourceRef'] != expected_source_ref:
                    raise SystemExit(f'FAIL: locality/source identity drift for geonames:{source_id}')
                if locality['geometryId'] != geometry_id:
                    raise SystemExit(f'FAIL: geometry ownership drift for {locality["localityId"]}')
                if not (-90 <= locality['latitude'] <= 90 and -180 <= locality['longitude'] <= 180):
                    raise SystemExit(f'FAIL: coordinate bounds for {locality["localityId"]}')
                if not 0 <= locality['importanceTier'] <= 5:
                    raise SystemExit(f'FAIL: importance tier for {locality["localityId"]}')
                if not bounds_contain(locality, payload['bounds']):
                    raise SystemExit(f'FAIL: partition bounds do not contain {locality["localityId"]}')
                if locality['localityId'] in all_locality_ids or locality['sourceRef'] in all_source_refs:
                    raise SystemExit(f'FAIL: duplicate expanded locality identity {locality["localityId"]}')
                all_locality_ids.add(locality['localityId'])
                all_source_refs.add(locality['sourceRef'])
                country_locality_ids.add(locality['localityId'])
            country_records += len(localities)

        actual_partition_files = sorted(
            str(path.relative_to(country_index_path.parent))
            for path in (country_index_path.parent / 'admin1').glob('*.json')
        )
        if sorted(listed_partition_files) != actual_partition_files:
            raise SystemExit(f'FAIL: unindexed or missing admin1 partition in {country_code}')
        if country_records != expected_count:
            raise SystemExit(f'FAIL: {country_code} partitions total {country_records} != {expected_count}')
        if country_index['admin1PartitionCount'] != len(listed_partition_files):
            raise SystemExit(f'FAIL: {country_code} partition count drift')

        reconciliation = country_index.get('anchorReconciliation') or {}
        entries = reconciliation.get('entries') or []
        matched = [entry for entry in entries if entry.get('status') == 'MATCHED']
        if reconciliation.get('matchedCount') != len(matched):
            raise SystemExit(f'FAIL: {country_code} anchor matched-count drift')
        capital_matches = [
            entry for entry in matched
            if entry.get('anchorSector') == 'CAPITAL' and entry.get('localityId') in country_locality_ids
        ]
        if len(capital_matches) != 1:
            raise SystemExit(f'FAIL: {country_code} must reconcile exactly one Global LOD capital anchor')
        for entry in matched:
            if entry.get('localityId') not in country_locality_ids:
                raise SystemExit(f'FAIL: {country_code} anchor reconciliation references unknown locality')
            if float(entry.get('distanceKm', 9999)) > 40.0:
                raise SystemExit(f'FAIL: {country_code} anchor reconciliation exceeds governed proximity threshold')
        total_anchor_matches += len(matched)
        total_records += country_records

    if total_records != index.get('localityCount'):
        raise SystemExit(f'FAIL: global locality count {total_records} != index {index.get("localityCount")}')
    if total_anchor_matches != index.get('matchedGlobalAnchorCount'):
        raise SystemExit('FAIL: global anchor reconciliation count drift')
    if len(all_locality_ids) != total_records or len(all_source_refs) != total_records:
        raise SystemExit('FAIL: global expanded locality identities are not unique')

    forbidden = {
        ROOT / 'cities500.zip',
        ROOT / 'admin1CodesASCII.txt',
        ROOT / 'geonames-readme.txt',
        ROOT / 'game-web/public/data/cities500.zip',
    }
    if any(path.exists() for path in forbidden):
        raise SystemExit('FAIL: raw retained GeoNames source must not be committed into game source/assets')

    print(
        'PASS: expanded locality pilot verified '
        f'countries={len(countries)} localities={total_records} '
        f'anchorMatches={total_anchor_matches} partitions='
        f'{sum(entry["admin1PartitionCount"] for entry in countries)}'
    )


if __name__ == '__main__':
    main()
