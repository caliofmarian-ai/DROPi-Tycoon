#!/usr/bin/env python3
import argparse
import collections
import io
import json
import pathlib
import unicodedata
import zipfile

ROOT = pathlib.Path(__file__).resolve().parents[1]
FIELDS = (
    'geonameid', 'name', 'asciiname', 'alternatenames', 'latitude', 'longitude',
    'feature_class', 'feature_code', 'country_code', 'cc2', 'admin1_code',
    'admin2_code', 'admin3_code', 'admin4_code', 'population', 'elevation',
    'dem', 'timezone', 'modification_date',
)


def norm(value):
    text = unicodedata.normalize('NFKD', str(value or ''))
    return ''.join(ch for ch in text.casefold() if not unicodedata.combining(ch) and ch.isalnum())


def load_admin1(path, country_code):
    result = {}
    prefix = f'{country_code}.'
    for line in path.read_text(encoding='utf-8').splitlines():
        if not line.startswith(prefix):
            continue
        fields = line.split('\t')
        if len(fields) < 4:
            raise RuntimeError(f'invalid admin1 row: {line!r}')
        code = fields[0].split('.', 1)[1]
        result[code] = {
            'sourceName': fields[1],
            'asciiName': fields[2],
            'sourceRef': f'geonames:{fields[3]}',
        }
    return result


def load_country_places(path, country_code):
    groups = collections.defaultdict(list)
    with zipfile.ZipFile(path) as archive:
        if 'cities500.txt' not in archive.namelist():
            raise RuntimeError('retained cities500.zip does not contain cities500.txt')
        with archive.open('cities500.txt') as raw, io.TextIOWrapper(raw, encoding='utf-8') as handle:
            for raw_line in handle:
                parts = raw_line.rstrip('\n').split('\t')
                if len(parts) != len(FIELDS):
                    raise RuntimeError(f'unexpected GeoNames field count: {len(parts)}')
                row = dict(zip(FIELDS, parts))
                if row['country_code'] == country_code:
                    groups[row['admin1_code']].append(row)
    return groups


def choose_representative(rows, primary_codes, fallback_codes):
    primary_rank = {code: index for index, code in enumerate(primary_codes)}
    primary = [row for row in rows if row['feature_code'] in primary_rank]
    primary.sort(key=lambda row: (
        primary_rank[row['feature_code']],
        -int(row['population'] or 0),
        row['name'].casefold(),
        int(row['geonameid']),
    ))
    if primary:
        return primary[0], 'source-first-order-seat-role'

    fallback_rank = {code: index for index, code in enumerate(fallback_codes)}
    fallback = [row for row in rows if row['feature_code'] in fallback_rank]
    fallback.sort(key=lambda row: (
        fallback_rank[row['feature_code']],
        -int(row['population'] or 0),
        row['name'].casefold(),
        int(row['geonameid']),
    ))
    if fallback:
        return fallback[0], 'source-admin-fallback'
    raise RuntimeError('region has no source-backed representative candidate under configured policy')


def build(config, cities_zip, admin1_path):
    country = config['country']
    country_code = country['sourceCountryCode']
    admin = load_admin1(admin1_path, country_code)
    groups = load_country_places(cities_zip, country_code)
    expected_regions = config['expectedRegions']
    expected_codes = [str(item['admin1Code']) for item in expected_regions]

    if len(expected_regions) != int(config['administrativeModel']['unitCount']):
        raise RuntimeError('expectedRegions count does not match administrativeModel.unitCount')
    if len(set(expected_codes)) != len(expected_codes):
        raise RuntimeError('expectedRegions contains duplicate admin1 codes')

    for expected in expected_regions:
        code = str(expected['admin1Code'])
        source = admin.get(code)
        if not source:
            raise RuntimeError(f'{country_code}.{code}: missing retained admin1 source row')
        if norm(source['sourceName']) != norm(expected['sourceName']):
            raise RuntimeError(
                f'{country_code}.{code}: retained admin1 name {source["sourceName"]!r} '
                f'does not match configured sourceName {expected["sourceName"]!r}'
            )
        if not groups.get(code):
            raise RuntimeError(f'{country_code}.{code}: no retained locality candidates')

    source_count = sum(len(rows) for rows in groups.values())
    expected_source_count = int(config['source']['expectedCountryCandidateCount'])
    if source_count != expected_source_count:
        raise RuntimeError(f'{country_code}: retained candidate count drift {source_count} != {expected_source_count}')

    policy = config['selectionPolicy']
    primary_codes = list(policy['primaryFeatureCodes'])
    fallback_codes = list(policy['fallbackFeatureCodes'])
    units = []
    for expected in expected_regions:
        code = str(expected['admin1Code'])
        chosen, basis = choose_representative(groups[code], primary_codes, fallback_codes)
        is_capital = chosen['feature_code'] == 'PPLC'
        units.append({
            'admin1Code': code,
            'regionName': expected['canonicalName'],
            'regionSourceName': admin[code]['sourceName'],
            'regionAsciiName': admin[code]['asciiName'],
            'regionSourceRef': admin[code]['sourceRef'],
            'representativeLocality': {
                'localityId': f"dropi:locality:geonames:{chosen['geonameid']}",
                'sourceRef': f"geonames:{chosen['geonameid']}",
                'name': chosen['name'],
                'asciiName': chosen['asciiname'] or chosen['name'],
                'latitude': round(float(chosen['latitude']), 6),
                'longitude': round(float(chosen['longitude']), 6),
                'featureCode': chosen['feature_code'],
                'populationSourceValue': int(chosen['population'] or 0),
                'selectionBasis': basis,
                'presentationRole': 'national-capital-and-regional-node' if is_capital else 'regional-representative-locality',
            },
            'economicEmergence': {
                'authority': config['economicEmergence']['authority'],
                'personalPlayerProgressionUnlock': bool(config['economicEmergence']['personalPlayerProgressionUnlock']),
                'numericThresholdsDefined': bool(config['economicEmergence']['numericThresholdsDefined']),
                'presentationState': 'economy-system-governed',
            },
        })

    if len({unit['representativeLocality']['localityId'] for unit in units}) != len(units):
        raise RuntimeError('representative locality identities must be unique')
    primary_count = sum(unit['representativeLocality']['selectionBasis'] == 'source-first-order-seat-role' for unit in units)
    fallback_count = len(units) - primary_count
    if primary_count != int(policy['expectedPrimarySelections']):
        raise RuntimeError(f'primary selection count drift {primary_count}')
    if fallback_count != int(policy['expectedFallbackSelections']):
        raise RuntimeError(f'fallback selection count drift {fallback_count}')

    return {
        'version': '1.0.0',
        'issue': config['issue'],
        'continent': config['continent'],
        'country': country,
        'administrativeModel': config['administrativeModel'],
        'source': {
            **config['source'],
            'publishedGameplayRepresentativeCount': len(units),
        },
        'selectionModel': {
            **policy,
            'rule': 'One source-backed representative locality per governed first-order region; retained high-density source remains reference-only.',
        },
        'developmentModel': {
            **config['economicEmergence'],
            'signalsPlanned': [
                'company-activity', 'employment-demand', 'production', 'logistics-throughput',
                'construction-investment', 'transport-connectivity', 'trade-volume',
                'population-economic-simulation', 'regional-national-policy',
            ],
            'rule': 'Representative locality prominence and development are shared-world economic outcomes, not personal progression rewards.',
        },
        'units': units,
    }


def write_doc(payload, output_path):
    model = payload['administrativeModel']
    source = payload['source']
    selection = payload['selectionModel']
    country = payload['country']['renderedName']
    primary_count = sum(unit['representativeLocality']['selectionBasis'] == 'source-first-order-seat-role' for unit in payload['units'])
    fallback_count = len(payload['units']) - primary_count
    lines = [
        f'# {country} Regional Representative Localities', '',
        f"Status: country slice for issue #{payload['issue']} under the Europe rollout.", '',
        '## Administrative model', '',
        f"- first-order term: `{model['nativeTermSingular']}` / `{model['nativeTermPlural']}`;",
        f"- English working term: `{model['englishTerm']}`;",
        f"- governed first-order units: **{model['unitCount']}**;",
        '- official references:',
        *[f"  - {url}" for url in model['officialReferences']], '',
        '## Gameplay density', '',
        f"- retained source candidates for {country}: **{source['expectedCountryCandidateCount']:,}**;",
        f"- published representative gameplay nodes: **{source['publishedGameplayRepresentativeCount']}**;",
        f"- direct source first-order-seat selections: **{primary_count}**;",
        f"- governed source fallbacks: **{fallback_count}**;",
        '- high-density source data remains reference/provenance infrastructure and is not the normal gameplay marker set.', '',
        '## Multiplayer economy rule', '',
        'Regional representative nodes belong to the shared world. Their prominence/development is governed by aggregate regional/national multiplayer economy, never by one player’s personal progression.', '',
        '## Representative set', '',
        '| Admin1 | Region | Representative locality | Source feature | Selection | Source ref |',
        '|---|---|---|---|---|---|',
    ]
    for unit in payload['units']:
        locality = unit['representativeLocality']
        lines.append(
            f"| {payload['country']['sourceCountryCode']}.{unit['admin1Code']} | {unit['regionName']} | "
            f"{locality['name']} | {locality['featureCode']} | {locality['selectionBasis']} | {locality['sourceRef']} |"
        )
    lines += [
        '', '## Runtime boundary', '',
        'This slice materializes representative regional identities and economy authority. It does not require every node to be rendered simultaneously and does not define arbitrary economic thresholds.', '',
    ]
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text('\n'.join(lines), encoding='utf-8')


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--config', required=True)
    parser.add_argument('--cities-zip', required=True)
    parser.add_argument('--admin1', required=True)
    parser.add_argument('--out', required=True)
    parser.add_argument('--doc', required=True)
    args = parser.parse_args()
    config = json.loads(pathlib.Path(args.config).read_text(encoding='utf-8'))
    payload = build(config, pathlib.Path(args.cities_zip), pathlib.Path(args.admin1))
    out = pathlib.Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    write_doc(payload, pathlib.Path(args.doc))
    print(json.dumps({
        'country': payload['country']['renderedName'],
        'regions': len(payload['units']),
        'sourceCandidates': payload['source']['expectedCountryCandidateCount'],
        'publishedRepresentatives': payload['source']['publishedGameplayRepresentativeCount'],
        'primarySelections': sum(unit['representativeLocality']['selectionBasis'] == 'source-first-order-seat-role' for unit in payload['units']),
        'fallbackSelections': sum(unit['representativeLocality']['selectionBasis'] != 'source-first-order-seat-role' for unit in payload['units']),
    }, indent=2))


if __name__ == '__main__':
    main()
