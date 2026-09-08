#!/usr/bin/env python3
import argparse
import collections
import io
import json
import pathlib
import zipfile

ROOT = pathlib.Path(__file__).resolve().parents[1]
DEFAULT_OUT = ROOT / 'game-web/public/data/europe-romania-regional-localities-v1.json'
DEFAULT_DOC = ROOT / '04_World/Country_Catalog/Continents/Europe/ROMANIA_REGIONAL_LOCALITIES.md'
FIELDS = (
    'geonameid', 'name', 'asciiname', 'alternatenames', 'latitude', 'longitude',
    'feature_class', 'feature_code', 'country_code', 'cc2', 'admin1_code',
    'admin2_code', 'admin3_code', 'admin4_code', 'population', 'elevation',
    'dem', 'timezone', 'modification_date',
)


def load_admin1(path: pathlib.Path):
    result = {}
    for line in path.read_text(encoding='utf-8').splitlines():
        if not line.startswith('RO.'):
            continue
        fields = line.split('\t')
        code = fields[0].split('.', 1)[1]
        result[code] = {
            'sourceName': fields[1],
            'asciiName': fields[2],
            'sourceRef': f'geonames:{fields[3]}',
        }
    if len(result) != 42:
        raise RuntimeError(f'expected 42 Romanian admin1 units, got {len(result)}')
    return result


def load_romania_places(path: pathlib.Path):
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
                if row['country_code'] == 'RO':
                    groups[row['admin1_code']].append(row)
    total = sum(map(len, groups.values()))
    if total != 7149:
        raise RuntimeError(f'retained Romania source count drift: {total} != 7149')
    return groups


def choose_representative(rows):
    primary = [row for row in rows if row['feature_code'] in {'PPLC', 'PPLA'}]
    primary.sort(key=lambda row: (
        0 if row['feature_code'] == 'PPLC' else 1,
        -int(row['population'] or 0),
        row['name'].casefold(),
        int(row['geonameid']),
    ))
    if primary:
        return primary[0], 'source-first-order-seat-role'

    secondary = [row for row in rows if row['feature_code'] == 'PPLA2']
    if not secondary:
        raise RuntimeError('admin1 has no PPLC/PPLA and no PPLA2 fallback')
    secondary.sort(key=lambda row: (
        -int(row['population'] or 0),
        row['name'].casefold(),
        int(row['geonameid']),
    ))
    return secondary[0], 'fallback-largest-secondary-admin-place'


def build(cities_zip: pathlib.Path, admin1_path: pathlib.Path):
    admin = load_admin1(admin1_path)
    groups = load_romania_places(cities_zip)
    if any(code not in groups for code in admin):
        missing = sorted(code for code in admin if code not in groups)
        raise RuntimeError(f'Romanian admin1 units without locality coverage: {missing}')

    units = []
    for code in sorted(admin, key=lambda value: int(value)):
        chosen, basis = choose_representative(groups[code])
        unit_type = 'capital-municipality-county-equivalent' if code == '10' else 'county'
        presentation_role = (
            'national-capital-and-regional-node'
            if chosen['feature_code'] == 'PPLC'
            else 'regional-representative-locality'
        )
        units.append({
            'admin1Code': code,
            'regionSourceName': admin[code]['sourceName'],
            'regionAsciiName': admin[code]['asciiName'],
            'regionSourceRef': admin[code]['sourceRef'],
            'unitType': unit_type,
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
                'presentationRole': presentation_role,
            },
            'economicEmergence': {
                'authority': 'shared-regional-national-multiplayer-economy',
                'personalPlayerProgressionUnlock': False,
                'numericThresholdsDefined': False,
                'presentationState': 'economy-system-governed',
            },
        })

    if len(units) != 42:
        raise RuntimeError('generated Romania unit count must equal 42')
    if len({unit['admin1Code'] for unit in units}) != 42:
        raise RuntimeError('Romania admin1 codes are not unique')
    if len({unit['representativeLocality']['localityId'] for unit in units}) != 42:
        raise RuntimeError('Romania representative locality identities are not unique')
    primary_count = sum(
        unit['representativeLocality']['selectionBasis'] == 'source-first-order-seat-role'
        for unit in units
    )
    fallback_count = len(units) - primary_count
    if (primary_count, fallback_count) != (40, 2):
        raise RuntimeError(f'unexpected selection counts: primary={primary_count} fallback={fallback_count}')

    return {
        'version': '1.0.0',
        'issue': 509,
        'continent': 'Europe',
        'country': {
            'geometryId': '642',
            'sourceCountryCode': 'RO',
            'renderedName': 'Romania',
        },
        'administrativeModel': {
            'level': 'first-order',
            'nativeTerm': 'județ',
            'normalCountyCount': 41,
            'countyEquivalentCount': 1,
            'unitCount': 42,
            'countyEquivalent': 'Municipality of Bucharest',
            'officialStructureReference': 'https://schengen.mai.gov.ro/English/index10.htm',
        },
        'source': {
            'provider': 'GeoNames',
            'license': 'Creative Commons Attribution 4.0',
            'releaseTag': 'source-geonames-cities500-2026-09-08-f3cda4f9',
            'cities500Sha256': 'f3cda4f9d256d90045121fb8eebad3ed91695c32370ed93b50fbe0cb616e2bbd',
            'admin1Sha256': '590651498043f674accda2b7f46d21286cda0e290b02f8561c5005eee9a5448c',
            'retainedRomaniaCandidateCount': 7149,
            'publishedGameplayRepresentativeCount': 42,
        },
        'developmentModel': {
            'authority': 'shared-regional-national-multiplayer-economy',
            'personalPlayerProgressionUnlock': False,
            'numericThresholdsDefined': False,
            'signalsPlanned': [
                'company-activity',
                'employment-demand',
                'production',
                'logistics-throughput',
                'construction-investment',
                'transport-connectivity',
                'trade-volume',
                'population-economic-simulation',
                'regional-national-policy',
            ],
            'rule': 'Representative locality prominence and development are shared-world economic outcomes, not personal progression rewards.',
        },
        'selectionModel': {
            'primary': 'Choose the retained GeoNames PPLC/PPLA locality inside each Romanian admin1 unit.',
            'fallback': 'If no PPLC/PPLA exists, choose the highest-population retained PPLA2 locality and label it representative rather than claiming a first-order-seat role.',
            'hardcodedCoordinates': False,
            'highDensityGameplayImport': False,
        },
        'units': units,
    }


def write_doc(payload, path: pathlib.Path):
    rows = []
    for unit in payload['units']:
        locality = unit['representativeLocality']
        rows.append(
            f"| RO.{unit['admin1Code']} | {unit['regionSourceName']} | {locality['name']} | "
            f"{locality['featureCode']} | {locality['selectionBasis']} | {locality['sourceRef']} |"
        )
    lines = [
        '# Romania Regional Representative Localities',
        '',
        'Status: country pilot for issues #502, #507, #508 and #509.',
        '',
        '## Owner model',
        '',
        'Romania is built as **41 counties plus Bucharest as a county-equivalent capital municipality**, for **42 first-order shared-world regional nodes**.',
        '',
        'Official administrative-structure reference: Romanian Ministry of Internal Affairs — https://schengen.mai.gov.ro/English/index10.htm',
        '',
        'Representative localities are not personal-player unlocks. Their prominence and future physical/economic development are governed by the aggregate multiplayer economy of the region and country.',
        '',
        '## Source and selection',
        '',
        '- retained source: GeoNames `cities500` release `source-geonames-cities500-2026-09-08-f3cda4f9`;',
        '- source Romania corpus: 7,149 places;',
        '- gameplay representative set: 42 places;',
        '- 40 selections use a source `PPLC`/`PPLA` first-order-seat role;',
        '- 2 selections use the deterministic highest-population `PPLA2` fallback and are labeled only as representative localities;',
        '- no coordinate is invented or manually scattered;',
        '- numerical economic-emergence thresholds are intentionally not defined before the shared economy system is designed.',
        '',
        '## Representative set',
        '',
        '| Admin1 | Region source name | Representative locality | Source feature | Selection basis | Source ref |',
        '|---|---|---|---|---|---|',
        *rows,
        '',
        '## Runtime boundary',
        '',
        'This country slice materializes the governed 42-node Romania data model. It does **not** yet render all 42 nodes simultaneously or implement economic thresholds. Country/Region LOD integration must keep Android render counts bounded.',
        '',
        '## Reuse rule',
        '',
        'Romania is the first pattern for Europe. Other countries reuse the concept — one representative locality per appropriate first-order region — while preserving each country’s real administrative terminology and exceptions.',
        '',
    ]
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text('\n'.join(lines), encoding='utf-8')


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--cities-zip', required=True)
    parser.add_argument('--admin1', required=True)
    parser.add_argument('--out', default=str(DEFAULT_OUT))
    parser.add_argument('--doc', default=str(DEFAULT_DOC))
    args = parser.parse_args()
    payload = build(pathlib.Path(args.cities_zip), pathlib.Path(args.admin1))
    out_path = pathlib.Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    write_doc(payload, pathlib.Path(args.doc))
    print(json.dumps({
        'country': 'Romania',
        'units': len(payload['units']),
        'sourceCandidates': payload['source']['retainedRomaniaCandidateCount'],
        'publishedRepresentatives': payload['source']['publishedGameplayRepresentativeCount'],
        'primarySelections': sum(unit['representativeLocality']['selectionBasis'] == 'source-first-order-seat-role' for unit in payload['units']),
        'fallbackSelections': sum(unit['representativeLocality']['selectionBasis'] == 'fallback-largest-secondary-admin-place' for unit in payload['units']),
    }, indent=2))


if __name__ == '__main__':
    main()
