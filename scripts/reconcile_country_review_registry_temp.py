from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def load(path: Path):
    return json.loads(path.read_text(encoding='utf-8'))


def write(path: Path, data):
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

semantic = load(ROOT / 'game-web/public/data/country-semantic-metadata-v1.json')
assert semantic['version'] == '1.9.0'
expected_entries = {
    '392': (464, 'Japan'),
    '104': (465, 'Myanmar'),
    '144': (466, 'Sri Lanka'),
    '152': (473, 'Chile'),
    'XKX': (478, 'Kosovo'),
    'XNC': (481, 'N. Cyprus'),
    'XSL': (482, 'Somaliland'),
}
for country_id, (issue, name) in expected_entries.items():
    entry = semantic['entries'].get(country_id)
    assert entry, f'missing semantic entry {country_id}'
    assert entry['issue'] == issue, (country_id, entry['issue'], issue)
    assert entry['renderedName'] == name, (country_id, entry['renderedName'], name)
    assert entry['sourceRefs'], f'missing sources {country_id}'
    for ref in entry['sourceRefs']:
        assert ref in semantic['sources'], (country_id, ref)

review_path = ROOT / '04_World/Country_Catalog/COUNTRY_REVIEW_REGISTRY.json'
review = load(review_path)
assert review['version'] == '1.10.0'
review['version'] = '1.11.0'
reasons = {
    '392': 'Tokyo current-capital override implemented; Kyoto retained as a non-capital representative city; owner Android Country Layer acceptance pending',
    '104': 'Nay Pyi Taw capital override implemented; Yangon retained as a major commercial city; owner Android Country Layer acceptance pending',
    '144': 'Sri Jayewardenepura Kotte administrative/national-capital and Colombo commercial-capital semantics implemented; owner Android Country Layer acceptance pending',
    '152': 'Santiago national-capital and Valparaíso National Congress-seat / representative-city semantics implemented; owner Android Country Layer acceptance pending',
    'XKX': 'Stable DROPi XKX geometry identity and neutral status-sensitive Kosovo semantics implemented; Pristina retained as capital / administrative centre without a DROPi sovereignty assertion; owner Android Country Layer acceptance pending',
    'XNC': 'Stable DROPi XNC geometry identity and neutral northern-Cyprus special-status semantics implemented; locality coverage intentionally remains empty rather than inventing source-unsafe nodes; owner Android Country Layer acceptance pending',
    'XSL': 'Stable DROPi XSL geometry identity, Hargeysa principal-administrative-centre role and current recognition-contested Somaliland semantics implemented; owner Android Country Layer acceptance pending',
}
for country_id, reason in reasons.items():
    assert country_id in review['reviews']
    review['reviews'][country_id]['reason'] = reason
write(review_path, review)

ledger_path = ROOT / '04_World/Country_Catalog/SPECIAL_TERRITORY_CLASSIFICATION.md'
ledger = ledger_path.read_text(encoding='utf-8')
replacements = {
    '| XSL | Somaliland | Africa | de facto administration / internationally contested status; stable DROPi project key | REVIEW | #482 — current neutral status semantics and updateable recognition metadata required |':
    '| XSL | Somaliland | Africa | de facto administration / recognition-contested status; stable DROPi project key | REVIEW | #482 — neutral status semantics implemented; Hargeysa retained as principal administrative centre; owner Android acceptance pending |',
    '| XNC | N. Cyprus | Asia | non-standard/disputed source geometry; stable DROPi project key | REVIEW | #481 — neutral status semantics required; geography must not imply uncontested sovereignty |':
    '| XNC | N. Cyprus | Asia | non-standard/disputed source geometry; stable DROPi project key | REVIEW | #481 — neutral special-status semantics implemented; no source-safe locality nodes are invented; owner Android acceptance pending |',
    '| XKX | Kosovo | Europe | disputed/non-standard source identity; stable DROPi project key | REVIEW | #478 — neutral status semantics still required |':
    '| XKX | Kosovo | Europe | status-sensitive/non-standard source identity; stable DROPi project key | REVIEW | #478 — neutral status semantics implemented; Pristina administrative role preserved without sovereignty assertion; owner Android acceptance pending |',
}
for old, new in replacements.items():
    assert old in ledger, f'missing ledger row: {old}'
    ledger = ledger.replace(old, new)
ledger_path.write_text(ledger, encoding='utf-8')

print('review registry', review['version'])
for country_id in expected_entries:
    print(country_id, semantic['entries'][country_id]['statusLabel'])
