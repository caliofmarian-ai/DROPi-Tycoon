#!/usr/bin/env python3
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / 'game-web/public/data/europe-romania-regional-localities-v1.json'

payload = json.loads(DATA.read_text(encoding='utf-8'))
assert payload['version'] == '1.0.0'
assert payload['issue'] == 509
assert payload['continent'] == 'Europe'
assert payload['country']['geometryId'] == '642'
assert payload['country']['sourceCountryCode'] == 'RO'
assert payload['administrativeModel']['normalCountyCount'] == 41
assert payload['administrativeModel']['countyEquivalentCount'] == 1
assert payload['administrativeModel']['unitCount'] == 42
assert payload['source']['retainedRomaniaCandidateCount'] == 7149
assert payload['source']['publishedGameplayRepresentativeCount'] == 42
assert payload['developmentModel']['personalPlayerProgressionUnlock'] is False
assert payload['developmentModel']['numericThresholdsDefined'] is False

units = payload['units']
assert len(units) == 42
assert len({unit['admin1Code'] for unit in units}) == 42
assert len({unit['regionSourceRef'] for unit in units}) == 42
assert len({unit['representativeLocality']['localityId'] for unit in units}) == 42
assert len({unit['representativeLocality']['sourceRef'] for unit in units}) == 42
assert sum(unit['unitType'] == 'county' for unit in units) == 41
assert sum(unit['unitType'] == 'capital-municipality-county-equivalent' for unit in units) == 1
assert sum(unit['representativeLocality']['featureCode'] == 'PPLC' for unit in units) == 1
assert sum(unit['representativeLocality']['selectionBasis'] == 'source-first-order-seat-role' for unit in units) == 40
assert sum(unit['representativeLocality']['selectionBasis'] == 'fallback-largest-secondary-admin-place' for unit in units) == 2

for unit in units:
    locality = unit['representativeLocality']
    assert -90 <= locality['latitude'] <= 90
    assert -180 <= locality['longitude'] <= 180
    assert locality['localityId'].startswith('dropi:locality:geonames:')
    assert locality['sourceRef'].startswith('geonames:')
    assert unit['economicEmergence']['authority'] == 'shared-regional-national-multiplayer-economy'
    assert unit['economicEmergence']['personalPlayerProgressionUnlock'] is False
    assert unit['economicEmergence']['numericThresholdsDefined'] is False

bucharest = next(unit for unit in units if unit['admin1Code'] == '10')
assert bucharest['representativeLocality']['name'] == 'Bucharest'
assert bucharest['representativeLocality']['featureCode'] == 'PPLC'
assert bucharest['representativeLocality']['presentationRole'] == 'national-capital-and-regional-node'

print('PASS: Romania regional locality registry verified units=42 primary=40 fallback=2')
