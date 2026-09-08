#!/usr/bin/env python3
import argparse
import json
from pathlib import Path


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--config', required=True)
    parser.add_argument('--data', required=True)
    args = parser.parse_args()

    config = json.loads(Path(args.config).read_text(encoding='utf-8'))
    payload = json.loads(Path(args.data).read_text(encoding='utf-8'))

    assert payload['version'] == '1.0.0'
    assert payload['issue'] == config['issue']
    assert payload['continent'] == config['continent']
    assert payload['country'] == config['country']
    assert payload['administrativeModel'] == config['administrativeModel']
    assert payload['source']['provider'] == config['source']['provider']
    assert payload['source']['releaseTag'] == config['source']['releaseTag']
    assert payload['source']['cities500Sha256'] == config['source']['cities500Sha256']
    assert payload['source']['admin1Sha256'] == config['source']['admin1Sha256']
    assert payload['source']['expectedCountryCandidateCount'] == config['source']['expectedCountryCandidateCount']
    assert payload['source']['publishedGameplayRepresentativeCount'] == config['administrativeModel']['unitCount']
    assert payload['developmentModel']['authority'] == 'shared-regional-national-multiplayer-economy'
    assert payload['developmentModel']['personalPlayerProgressionUnlock'] is False
    assert payload['developmentModel']['numericThresholdsDefined'] is False

    units = payload['units']
    expected_regions = config['expectedRegions']
    assert len(units) == config['administrativeModel']['unitCount'] == len(expected_regions)
    assert len({unit['admin1Code'] for unit in units}) == len(units)
    assert len({unit['regionSourceRef'] for unit in units}) == len(units)
    assert len({unit['representativeLocality']['localityId'] for unit in units}) == len(units)
    assert len({unit['representativeLocality']['sourceRef'] for unit in units}) == len(units)

    by_code = {unit['admin1Code']: unit for unit in units}
    for expected in expected_regions:
        code = str(expected['admin1Code'])
        unit = by_code[code]
        assert unit['regionName'] == expected['canonicalName']
        assert unit['regionSourceName'] == expected['sourceName']
        locality = unit['representativeLocality']
        assert -90 <= locality['latitude'] <= 90
        assert -180 <= locality['longitude'] <= 180
        assert locality['localityId'].startswith('dropi:locality:geonames:')
        assert locality['sourceRef'].startswith('geonames:')
        assert unit['economicEmergence']['authority'] == 'shared-regional-national-multiplayer-economy'
        assert unit['economicEmergence']['personalPlayerProgressionUnlock'] is False
        assert unit['economicEmergence']['numericThresholdsDefined'] is False

    primary = sum(unit['representativeLocality']['selectionBasis'] == 'source-first-order-seat-role' for unit in units)
    fallback = len(units) - primary
    assert primary == config['selectionPolicy']['expectedPrimarySelections']
    assert fallback == config['selectionPolicy']['expectedFallbackSelections']
    capitals = [unit for unit in units if unit['representativeLocality']['featureCode'] == 'PPLC']
    assert len(capitals) == 1
    assert capitals[0]['representativeLocality']['presentationRole'] == 'national-capital-and-regional-node'

    print(
        f"PASS: {payload['country']['renderedName']} representative regional registry "
        f"verified units={len(units)} primary={primary} fallback={fallback}"
    )


if __name__ == '__main__':
    main()
