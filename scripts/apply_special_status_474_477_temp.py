from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def load_json(path: Path):
    return json.loads(path.read_text(encoding='utf-8'))


def write_json(path: Path, payload) -> None:
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


semantic_path = ROOT / 'game-web/public/data/country-semantic-metadata-v1.json'
semantic = load_json(semantic_path)
assert semantic['version'] == '1.8.0', semantic['version']
semantic['version'] = '1.9.0'
semantic['reviewedOn'] = '2026-09-08'

semantic['sources']['un-falkland-malvinas-status'] = {
    'publisher': 'United Nations and Decolonization',
    'title': 'Falkland Islands (Malvinas)',
    'url': 'https://www.un.org/dppa/decolonization/en/content/falkland-islands-malvinas',
    'accessedOn': '2026-09-08',
    'note': 'The United Nations lists the Falkland Islands (Malvinas) as a Non-Self-Governing Territory, identifies the United Kingdom as administering Power, and explicitly notes a sovereignty dispute between Argentina and the United Kingdom.',
}
semantic['sources']['un-c24-falkland-malvinas-2026'] = {
    'publisher': 'United Nations Special Committee on Decolonization',
    'title': 'C-24 2026 session — Question of the Falkland Islands (Malvinas)',
    'url': 'https://webtv.un.org/en/asset/k1s/k1sjz1in6d',
    'publishedOn': '2026-06-25',
    'accessedOn': '2026-09-08',
    'note': 'The 2026 C-24 session continued formal consideration of the Question of the Falkland Islands (Malvinas), including the sovereignty dispute between Argentina and the United Kingdom.',
}
semantic['sources']['antarctic-treaty-article-iv'] = {
    'publisher': 'Antarctic Treaty Secretariat',
    'title': 'The Antarctic Treaty — Article IV territorial-claim safeguards',
    'url': 'https://www.ats.aq/e/antarctictreaty.html?lang=en',
    'accessedOn': '2026-09-08',
    'note': 'Article IV safeguards existing positions on territorial claims, prevents Treaty-era activities from creating sovereignty rights, and bars new claims or enlargement of existing claims while the Treaty is in force.',
}
semantic['sources']['nsf-mcmurdo-station'] = {
    'publisher': 'U.S. National Science Foundation, Office of Polar Programs',
    'title': 'NSF McMurdo Station',
    'url': 'https://www.nsf.gov/geo/opp/ail/mcmurdo-station',
    'accessedOn': '2026-09-08',
    'note': 'NSF identifies McMurdo Station as the largest station on Antarctica and the central logistics hub for the U.S. Antarctic Program, supporting scientific research across the continent.',
}

semantic['entries']['238'] = {
    'issue': 474,
    'renderedName': 'Falkland Is.',
    'statusLabel': 'Falkland Islands (Malvinas) — unresolved sovereignty dispute',
    'statusSummary': 'The United Nations lists the Falkland Islands (Malvinas) as a Non-Self-Governing Territory administered by the United Kingdom and explicitly records an unresolved sovereignty dispute between Argentina and the United Kingdom. DROPi preserves the current geographic/locality layer without deciding final sovereignty.',
    'territoryStatus': {
        'classification': 'un-non-self-governing-territory-sovereignty-dispute',
        'label': 'UN Non-Self-Governing Territory / sovereignty dispute unresolved',
        'finalStatusResolved': False,
        'note': 'Geographic rendering, local administration and company activity do not constitute a DROPi sovereignty determination.',
    },
    'coverageNote': 'Stanley remains a source-backed locality and current administrative centre in the sparse map; that administrative role is not a final sovereignty judgment.',
    'placeRoles': [
        {
            'locality': 'Stanley',
            'role': 'current-administrative-centre',
            'label': 'Current administrative centre',
            'note': 'Administrative-centre labeling describes present local administration only and does not resolve the sovereignty dispute.',
        },
    ],
    'sourceRefs': ['un-falkland-malvinas-status', 'un-c24-falkland-malvinas-2026'],
}

semantic['entries']['010'] = {
    'issue': 477,
    'renderedName': 'Antarctica',
    'statusLabel': 'Antarctic Treaty geography / no national capital',
    'statusSummary': 'Antarctica has no sovereign national capital in DROPi. The Antarctic Treaty preserves Parties’ differing positions on territorial claims and prevents Treaty-era activities from creating new sovereignty rights. Research stations are scientific and logistics facilities, not national capitals.',
    'territoryStatus': {
        'classification': 'antarctic-treaty-status',
        'label': 'Antarctic Treaty System / sovereignty positions safeguarded',
        'finalStatusResolved': False,
        'note': 'DROPi does not adjudicate Antarctic territorial claims; station presence and operations do not alter sovereignty.',
    },
    'coverageNote': 'The sparse map keeps the pinned Natural Earth Antarctic facility/locality nodes and overrides their player-facing meaning without changing source coordinates.',
    'placeRoles': [
        {
            'locality': 'McMurdo Station',
            'role': 'research-logistics-station',
            'label': 'Research / logistics station',
            'note': 'NSF describes McMurdo as Antarctica’s largest station and the central logistics hub for the U.S. Antarctic Program.',
        },
        {
            'locality': "Dumont d'Urville Station",
            'role': 'research-station',
            'label': 'Research station',
        },
        {
            'locality': 'AmundseniScott South Pole Station',
            'role': 'research-station',
            'label': 'Research station',
            'note': 'The locality name is preserved exactly from the pinned Natural Earth source.',
        },
        {
            'locality': 'Sobral Base',
            'role': 'research-base',
            'label': 'Research base',
        },
        {
            'locality': 'Elephant Island',
            'role': 'source-backed-antarctic-locality',
            'label': 'Source-backed Antarctic locality',
        },
    ],
    'sourceRefs': ['antarctic-treaty-article-iv', 'nsf-mcmurdo-station'],
}
write_json(semantic_path, semantic)

review_path = ROOT / '04_World/Country_Catalog/COUNTRY_REVIEW_REGISTRY.json'
review = load_json(review_path)
assert review['version'] == '1.9.0', review['version']
review['version'] = '1.10.0'
review['reviews']['238']['reason'] = 'UN Non-Self-Governing Territory / unresolved Argentina–United Kingdom sovereignty-dispute semantics implemented; Stanley retained only as current administrative centre; owner Android acceptance pending'
review['reviews']['010']['reason'] = 'Antarctic Treaty semantics implemented; McMurdo and other source-backed Antarctic facilities/localities are not exposed as a sovereign national capital; owner Android acceptance pending'
write_json(review_path, review)

ledger_path = ROOT / '04_World/Country_Catalog/SPECIAL_TERRITORY_CLASSIFICATION.md'
ledger = ledger_path.read_text(encoding='utf-8')
ledger = ledger.replace(
    'Coordinates: #418 #453 #462 #480 #481 #482',
    'Coordinates: #418 #453 #462 #474 #477 #480 #481 #482',
)
ledger = ledger.replace(
    '| 238 | Falkland Is. / Malvinas | South America | disputed territory | REVIEW | #474 — neutral unresolved-sovereignty semantics required |',
    '| 238 | Falkland Is. / Malvinas | South America | UN Non-Self-Governing Territory / unresolved Argentina–United Kingdom sovereignty dispute | REVIEW | #474 — neutral UN status semantics implemented; Stanley retained as current administrative centre; owner Android acceptance pending |',
)
ledger = ledger.replace(
    '| 010 | Antarctica | Special | Antarctic Treaty / indeterminate sovereignty geometry | REVIEW | #477 — McMurdo is a research/logistics station, not a sovereign national capital |',
    '| 010 | Antarctica | Special | Antarctic Treaty System / sovereignty positions safeguarded | REVIEW | #477 — no national-capital semantics; McMurdo and other nodes use research/logistics/locality roles; owner Android acceptance pending |',
)
ledger_path.write_text(ledger, encoding='utf-8')

semantic_doc_path = ROOT / '04_World/Country_Catalog/COUNTRY_SEMANTIC_METADATA.md'
semantic_doc = semantic_doc_path.read_text(encoding='utf-8')
section = '''\n\n## Falkland Islands (Malvinas) — #474\n\nGeometry `238` remains geographically rendered in South America with pinned Natural Earth locality coordinates. Player-facing semantics follow the United Nations naming/status convention: the territory is listed as a Non-Self-Governing Territory, the United Kingdom is identified as administering Power, and the sovereignty dispute between Argentina and the United Kingdom remains unresolved. Stanley is presented only as the **current administrative centre**; this does not encode final sovereignty.\n\n## Antarctica — #477\n\nGeometry `010` must never expose a sovereign national-capital concept. The internal sparse-map structural slot is not a political claim. Player-facing semantic metadata labels McMurdo Station as a **Research / logistics station**, other source-backed stations/bases as research facilities, and Elephant Island as a source-backed Antarctic locality. Antarctic Treaty Article IV governs the neutral status contract: DROPi preserves differing positions on territorial claims and does not treat station presence or activity as creating sovereignty.\n'''
if '## Falkland Islands (Malvinas) — #474' not in semantic_doc:
    semantic_doc += section
semantic_doc_path.write_text(semantic_doc, encoding='utf-8')

dataset_path = ROOT / '04_World/COUNTRY_LAYER_LOCALITY_DATASET.md'
dataset = dataset_path.read_text(encoding='utf-8')
addition = '''\n- #474 Falkland Islands (Malvinas): Stanley remains source-backed but player-facing semantics describe it only as the current administrative centre under an unresolved UN-tracked sovereignty dispute.\n- #477 Antarctica: the sparse structural slot must never surface as a national-capital claim; McMurdo and other Antarctic nodes use research/logistics/locality semantics under the Antarctic Treaty status contract.\n'''
if '#474 Falkland Islands (Malvinas)' not in dataset:
    dataset += addition
dataset_path.write_text(dataset, encoding='utf-8')

locality = load_json(ROOT / 'game-web/public/data/country-representative-localities-v1.json')
assert locality['version'] == '1.9.0'
falkland_nodes = locality['countries']['238']
assert any(node['name'] == 'Stanley' for node in falkland_nodes)
antarctica_nodes = locality['countries']['010']
assert [node['name'] for node in antarctica_nodes] == [
    'McMurdo Station',
    "Dumont d'Urville Station",
    'AmundseniScott South Pole Station',
    'Sobral Base',
    'Elephant Island',
]
for node in antarctica_nodes:
    assert isinstance(node['longitude'], (int, float))
    assert isinstance(node['latitude'], (int, float))

# Keep all regression tests aligned with the shared semantic-catalog contract.
for test_path in (ROOT / 'game-web/tests').glob('*.test.ts'):
    text = test_path.read_text(encoding='utf-8')
    if 'country-semantic-metadata-v1.json' not in text:
        continue
    updated = text.replace("'1.8.0'", "'1.9.0'").replace('"1.8.0"', '"1.9.0"')
    if updated != text:
        test_path.write_text(updated, encoding='utf-8')

special_test_path = ROOT / 'game-web/tests/special-territory-status-semantics.test.ts'
special_test_path.write_text(r'''import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  semanticEntryForCountry,
  semanticPlaceRoleForLocality,
  validateSemanticEntrySources,
  type CountrySemanticCatalog,
} from '../src/world/countrySemanticMetadata'

const localities = JSON.parse(readFileSync(
  new URL('../public/data/country-representative-localities-v1.json', import.meta.url),
  'utf8',
)) as {
  version: string
  countries: Record<string, Array<{
    name: string
    role: string
    longitude: number
    latitude: number
    sourceFeatureClass: string
  }>>
}

const semantics = JSON.parse(readFileSync(
  new URL('../public/data/country-semantic-metadata-v1.json', import.meta.url),
  'utf8',
)) as CountrySemanticCatalog

const southAmericaManifest = readFileSync(
  new URL('../../04_World/Country_Catalog/Continents/southamerica.md', import.meta.url),
  'utf8',
)
const specialManifest = readFileSync(
  new URL('../../04_World/Country_Catalog/Continents/special.md', import.meta.url),
  'utf8',
)
const specialLedger = readFileSync(
  new URL('../../04_World/Country_Catalog/SPECIAL_TERRITORY_CLASSIFICATION.md', import.meta.url),
  'utf8',
)

describe('Falkland Islands (Malvinas) neutral sovereignty semantics #474', () => {
  it('keeps Stanley source-backed while suppressing an uncontested sovereignty implication', () => {
    const nodes = localities.countries['238'] ?? []
    const stanley = nodes.find(node => node.name === 'Stanley')
    expect(localities.version).toBe('1.9.0')
    expect(stanley).toBeDefined()
    expect(Number.isFinite(stanley?.longitude)).toBe(true)
    expect(Number.isFinite(stanley?.latitude)).toBe(true)

    const entry = semanticEntryForCountry(semantics, '238')
    expect(semantics.version).toBe('1.9.0')
    expect(entry?.issue).toBe(474)
    expect(entry?.territoryStatus?.finalStatusResolved).toBe(false)
    expect(entry?.statusLabel).toContain('Falkland Islands (Malvinas)')
    expect(entry?.statusSummary).toContain('Argentina')
    expect(entry?.statusSummary).toContain('United Kingdom')
    expect(validateSemanticEntrySources(semantics, entry!)).toBe(true)
  })

  it('labels Stanley only as the current administrative centre', () => {
    const entry = semanticEntryForCountry(semantics, '238')
    const stanley = semanticPlaceRoleForLocality(entry, 'Stanley')
    expect(stanley?.role).toBe('current-administrative-centre')
    expect(stanley?.label).toBe('Current administrative centre')
    expect(stanley?.label.toLowerCase()).not.toContain('national capital')
    expect(entry?.sourceRefs).toEqual([
      'un-falkland-malvinas-status',
      'un-c24-falkland-malvinas-2026',
    ])
  })

  it('keeps South America placement separate from sovereignty status', () => {
    expect(southAmericaManifest).toContain('| 238 | Falkland Is. | Stanley |')
    expect(southAmericaManifest).toContain('#474: UN Non-Self-Governing Territory / unresolved Argentina–United Kingdom sovereignty-dispute semantics implemented')
    expect(specialLedger).toContain('UN Non-Self-Governing Territory / unresolved Argentina–United Kingdom sovereignty dispute')
  })
})

describe('Antarctic Treaty and research-station semantics #477', () => {
  it('preserves all five source-backed Antarctic nodes without changing coordinates', () => {
    const nodes = localities.countries['010'] ?? []
    expect(nodes.map(node => node.name)).toEqual([
      'McMurdo Station',
      "Dumont d'Urville Station",
      'AmundseniScott South Pole Station',
      'Sobral Base',
      'Elephant Island',
    ])
    for (const node of nodes) {
      expect(Number.isFinite(node.longitude)).toBe(true)
      expect(Number.isFinite(node.latitude)).toBe(true)
      expect(node.sourceFeatureClass.length).toBeGreaterThan(0)
    }
  })

  it('exposes no national-capital concept for Antarctica', () => {
    const entry = semanticEntryForCountry(semantics, '010')
    expect(entry?.issue).toBe(477)
    expect(entry?.statusLabel).toBe('Antarctic Treaty geography / no national capital')
    expect(entry?.territoryStatus).toEqual({
      classification: 'antarctic-treaty-status',
      label: 'Antarctic Treaty System / sovereignty positions safeguarded',
      finalStatusResolved: false,
      note: 'DROPi does not adjudicate Antarctic territorial claims; station presence and operations do not alter sovereignty.',
    })
    expect(entry?.placeRoles.some(role => role.label === 'National capital')).toBe(false)
    expect(entry?.statusSummary).toContain('no sovereign national capital')
    expect(validateSemanticEntrySources(semantics, entry!)).toBe(true)
  })

  it('labels McMurdo and other Antarctic nodes as facilities/localities instead of a capital', () => {
    const entry = semanticEntryForCountry(semantics, '010')
    expect(semanticPlaceRoleForLocality(entry, 'McMurdo Station')?.label).toBe('Research / logistics station')
    expect(semanticPlaceRoleForLocality(entry, "Dumont d'Urville Station")?.label).toBe('Research station')
    expect(semanticPlaceRoleForLocality(entry, 'AmundseniScott South Pole Station')?.label).toBe('Research station')
    expect(semanticPlaceRoleForLocality(entry, 'Sobral Base')?.label).toBe('Research base')
    expect(semanticPlaceRoleForLocality(entry, 'Elephant Island')?.label).toBe('Source-backed Antarctic locality')
    expect(entry?.sourceRefs).toEqual(['antarctic-treaty-article-iv', 'nsf-mcmurdo-station'])
  })

  it('keeps the internal sparse structural slot explicitly non-political', () => {
    expect(specialManifest).toContain('| Structural capital slot |')
    expect(specialManifest).toContain('| 010 | Antarctica | McMurdo Station | 5 | CAPITAL, NE, SE, SW, NW | **REVIEW** | #477: Antarctic Treaty semantics implemented')
    expect(specialLedger).toContain('Antarctic Treaty System / sovereignty positions safeguarded')
    expect(specialLedger).toContain('Antarctica must not expose a national-capital concept')
  })
})
''', encoding='utf-8')

print('PATCHED semantic', semantic['version'])
print('FALKLAND', falkland_nodes)
print('ANTARCTICA', antarctica_nodes)
