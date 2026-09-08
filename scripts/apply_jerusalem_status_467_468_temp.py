import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ROLE = ROOT / '04_World/Country_Catalog/COUNTRY_LOCALITY_ROLE_OVERRIDES.json'
SEM = ROOT / 'game-web/public/data/country-semantic-metadata-v1.json'
REV = ROOT / '04_World/Country_Catalog/COUNTRY_REVIEW_REGISTRY.json'
GEN = ROOT / 'scripts/build_country_locality_catalog.py'
SEM_DOC = ROOT / '04_World/Country_Catalog/COUNTRY_SEMANTIC_METADATA.md'
SPECIAL = ROOT / '04_World/Country_Catalog/SPECIAL_TERRITORY_CLASSIFICATION.md'
DATA_DOC = ROOT / '04_World/COUNTRY_LAYER_LOCALITY_DATASET.md'
TEST = ROOT / 'game-web/tests/jerusalem-status-semantics.test.ts'
GLOBAL_TEST = ROOT / 'game-web/tests/global-map-runtime.test.ts'

role = json.loads(ROLE.read_text())
assert role['version'] == '1.5.0', role['version']
role['version'] = '1.6.0'
role['entries']['376'] = {
    'issue': 467,
    'country': 'Israel',
    'currentCapital': {'sourceNames': ['Jerusalem'], 'displayName': 'Jerusalem'},
    'requiredRepresentatives': [{'sourceNames': ['Tel Aviv-Yafo', 'Tel Aviv'], 'displayName': 'Tel Aviv-Yafo', 'role': 'urban'}],
}
role['entries']['275'] = {
    'issue': 468,
    'country': 'Palestine',
    'currentCapital': {'sourceNames': ['Ramallah'], 'displayName': 'Ramallah'},
    'requiredRepresentatives': [{'sourceNames': ['Gaza'], 'displayName': 'Gaza', 'role': 'urban'}],
}
ROLE.write_text(json.dumps(role, ensure_ascii=False, indent=2) + '\n')

sem = json.loads(SEM.read_text())
assert sem['version'] == '1.7.0', sem['version']
sem['version'] = '1.8.0'
sem['sources'].update({
    'israel-knesset-jerusalem-basic-law': {
        'publisher': 'Knesset',
        'title': 'Basic Laws of the State of Israel — Basic-Law: Jerusalem, the Capital of Israel',
        'url': 'https://main.knesset.gov.il/en/activity/pages/basiclaws.aspx',
        'accessedOn': '2026-09-08',
        'note': 'The Knesset states that Israeli Basic Law establishes Jerusalem as Israel’s capital and the seat of the President, Knesset, Government and Supreme Court.',
    },
    'un-sg-jerusalem-two-state-2026': {
        'publisher': 'United Nations Secretary-General',
        'title': 'Implementation of Security Council resolution 2334 (2016) — Report of the Secretary-General',
        'url': 'https://www.un.org/unispal/document/sg-report-24jun26/',
        'publishedOn': '2026-06-24',
        'accessedOn': '2026-09-08',
        'note': 'The Secretary-General reiterates the UN two-State vision based on pre-1967 lines with Jerusalem as the capital of both States, and the report treats East Jerusalem as part of the Palestinian territory occupied since 1967.',
    },
    'un-palestine-undata-capital': {
        'publisher': 'United Nations Statistics Division',
        'title': 'UNData country profile — State of Palestine',
        'url': 'https://data.un.org/CountryProfile.aspx?crName=State%20of%20Palestine',
        'accessedOn': '2026-09-08',
        'note': 'UNData lists East Jerusalem as the capital city designation provided by the State of Palestine and explicitly notes that the United Nations position on Jerusalem is governed by relevant General Assembly and Security Council resolutions.',
    },
    'palestine-basic-law-jerusalem': {
        'publisher': 'Palestinian Official Gazette / Bureau of Legal Opinion and Legislation',
        'title': 'Amended Basic Law',
        'url': 'https://mjr.ogb.gov.ps/Decrees/ViewText/26625/',
        'accessedOn': '2026-09-08',
        'note': 'Article 3 of the Palestinian Basic Law states that Jerusalem is the capital of Palestine.',
    },
    'palestine-cabinet-headquarters': {
        'publisher': 'Palestinian Official Gazette / Bureau of Legal Opinion and Legislation',
        'title': 'Council of Ministers Decision No. 21 of 2020 on the Prime Ministry system',
        'url': 'https://mjr.ogb.gov.ps/Decrees/ViewText/31874/',
        'publishedOn': '2020-10-26',
        'accessedOn': '2026-09-08',
        'note': 'Article 2 establishes the principal Council of Ministers headquarters in Jerusalem and temporary headquarters in Ramallah and Gaza; the decision was issued in Ramallah.',
    },
})
sem['entries']['376'] = {
    'issue': 467,
    'renderedName': 'Israel',
    'statusLabel': 'Jerusalem capital / final-status sensitive case',
    'statusSummary': 'Israeli Basic Law defines Jerusalem as Israel’s capital and seat of its principal state institutions. The United Nations continues to treat East Jerusalem as occupied Palestinian territory and supports a negotiated two-State outcome with Jerusalem as the capital of both States. DROPi records the Israeli institutional role without asserting a unilateral settlement of Jerusalem’s final territorial status.',
    'territoryStatus': {
        'classification': 'jerusalem-final-status-sensitive',
        'label': 'Jerusalem final-status sensitive geography',
        'finalStatusResolved': False,
        'note': 'The structural locality role is not a DROPi sovereignty determination.',
    },
    'placeRoles': [
        {'locality': 'Jerusalem', 'role': 'israeli-law-capital-institutional-seat', 'label': 'Capital under Israeli law / seat of state institutions', 'note': 'This label records Israel’s domestic legal and institutional role while the status summary preserves the UN final-status context.'},
        {'locality': 'Tel Aviv-Yafo', 'role': 'economic-metropolitan-centre', 'label': 'Major economic / metropolitan centre'},
    ],
    'sourceRefs': ['israel-knesset-jerusalem-basic-law', 'un-sg-jerusalem-two-state-2026'],
}
sem['entries']['275'] = {
    'issue': 468,
    'renderedName': 'Palestine',
    'statusLabel': 'East Jerusalem capital designation / final-status sensitive case',
    'statusSummary': 'Palestinian law identifies Jerusalem as the capital of Palestine, and UNData records East Jerusalem as the capital designation provided by the State of Palestine while noting the separate United Nations position on Jerusalem. Palestinian regulations provide temporary Council of Ministers headquarters in Ramallah and Gaza. DROPi represents these roles without asserting a unilateral settlement of Jerusalem’s final territorial status.',
    'territoryStatus': {
        'classification': 'east-jerusalem-final-status-sensitive',
        'label': 'East Jerusalem final-status sensitive geography',
        'finalStatusResolved': False,
        'note': 'The East Jerusalem role is semantic/status metadata and is not fabricated as a locality marker where the pinned country-locality source does not safely assign it to geometry 275.',
    },
    'placeRoles': [
        {'locality': 'East Jerusalem', 'role': 'palestinian-capital-designation', 'label': 'Capital designated by State of Palestine / status sensitive', 'note': 'Semantic role only; DROPi does not fabricate a duplicate marker for East Jerusalem.'},
        {'locality': 'Ramallah', 'role': 'temporary-government-administrative-seat', 'label': 'Temporary government / administrative seat'},
        {'locality': 'Gaza', 'role': 'major-urban-centre', 'label': 'Major urban centre'},
    ],
    'sourceRefs': ['un-palestine-undata-capital', 'palestine-basic-law-jerusalem', 'palestine-cabinet-headquarters', 'un-sg-jerusalem-two-state-2026'],
}
SEM.write_text(json.dumps(sem, ensure_ascii=False, indent=2) + '\n')

rev = json.loads(REV.read_text())
assert rev['version'] == '1.8.0', rev['version']
rev['version'] = '1.9.0'
rev['reviews']['376']['reason'] = 'Jerusalem source-backed structural role implemented with Israeli institutional semantics and UN final-status context; Tel Aviv-Yafo retained as major economic/metropolitan centre; owner Android acceptance pending'
rev['reviews']['275']['reason'] = 'Gaza capital flag removed; Ramallah retained as temporary government/administrative seat and East Jerusalem represented as source-governed semantic capital designation without fabricated marker; owner Android acceptance pending'
REV.write_text(json.dumps(rev, ensure_ascii=False, indent=2) + '\n')

gen = GEN.read_text()
gen = gen.replace("assert capital('068') == 'Sucre'", "assert capital('068') == 'Sucre'\nassert capital('376') == 'Jerusalem'\nassert capital('275') == 'Ramallah'")
gen = gen.replace("assert node('068', 'La Paz') and node('068', 'La Paz')['role'] != 'capital'", "assert node('068', 'La Paz') and node('068', 'La Paz')['role'] != 'capital'\nassert node('376', 'Tel Aviv-Yafo') and node('376', 'Tel Aviv-Yafo')['role'] != 'capital'\nassert node('275', 'Gaza') and node('275', 'Gaza')['role'] != 'capital'")
gen = gen.replace("'version': '1.8.0'", "'version': '1.9.0'", 1)
GEN.write_text(gen)

for p in (ROOT / 'game-web/tests').glob('*.test.ts'):
    text = p.read_text()
    text = text.replace("semanticCatalog.version).toBe('1.7.0')", "semanticCatalog.version).toBe('1.8.0')")
    text = text.replace("semantics.version).toBe('1.7.0')", "semantics.version).toBe('1.8.0')")
    text = text.replace("roleOverrideRegistry.version).toBe('1.5.0')", "roleOverrideRegistry.version).toBe('1.6.0')")
    text = text.replace("roles.version).toBe('1.5.0')", "roles.version).toBe('1.6.0')")
    text = text.replace("localityCatalog.version).toBe('1.8.0')", "localityCatalog.version).toBe('1.9.0')")
    text = text.replace("localities.version).toBe('1.8.0')", "localities.version).toBe('1.9.0')")
    text = text.replace("registryVersion).toBe('1.5.0')", "registryVersion).toBe('1.6.0')")
    p.write_text(text)

global_test = GLOBAL_TEST.read_text()
global_test = global_test.replace("const CAPITAL_ROLE_OVERRIDE_IDS = ['068', '104', '108', '144', '152', '204', '226', '384', '392', '710', '834']", "const CAPITAL_ROLE_OVERRIDE_IDS = ['068', '104', '108', '144', '152', '204', '226', '275', '376', '384', '392', '710', '834']")
GLOBAL_TEST.write_text(global_test)

TEST.write_text("""import { readFileSync } from 'node:fs'\nimport { describe, expect, it } from 'vitest'\n\nconst roles = JSON.parse(readFileSync(new URL('../../04_World/Country_Catalog/COUNTRY_LOCALITY_ROLE_OVERRIDES.json', import.meta.url), 'utf8'))\nconst localities = JSON.parse(readFileSync(new URL('../public/data/country-representative-localities-v1.json', import.meta.url), 'utf8'))\nconst semantics = JSON.parse(readFileSync(new URL('../public/data/country-semantic-metadata-v1.json', import.meta.url), 'utf8'))\n\nconst node = (cid: string, name: string) => localities.countries[cid]?.find((value: any) => value.name === name)\nconst label = (cid: string, name: string) => semantics.entries[cid]?.placeRoles.find((value: any) => value.locality === name)?.label\n\ndescribe('Jerusalem status semantics #467 #468', () => {\n  it('uses source-only locality overrides without hardcoded coordinates', () => {\n    expect(roles.version).toBe('1.6.0')\n    for (const cid of ['376', '275']) {\n      expect(JSON.stringify(roles.entries[cid])).not.toContain('longitude')\n      expect(JSON.stringify(roles.entries[cid])).not.toContain('latitude')\n    }\n  })\n\n  it('removes Tel Aviv and Gaza from structural capital roles using pinned-source localities', () => {\n    expect(localities.version).toBe('1.9.0')\n    const israel = localities.countries['376'] ?? []\n    const palestine = localities.countries['275'] ?? []\n    expect(israel.filter((value: any) => value.role === 'capital')).toHaveLength(1)\n    expect(israel.find((value: any) => value.role === 'capital')?.name).toBe('Jerusalem')\n    expect(node('376', 'Tel Aviv-Yafo')).toBeDefined()\n    expect(node('376', 'Tel Aviv-Yafo')?.role).not.toBe('capital')\n    expect(node('376', 'Jerusalem')?.sourceKind).toBeUndefined()\n    expect(palestine.filter((value: any) => value.role === 'capital')).toHaveLength(1)\n    expect(palestine.find((value: any) => value.role === 'capital')?.name).toBe('Ramallah')\n    expect(node('275', 'Gaza')).toBeDefined()\n    expect(node('275', 'Gaza')?.role).not.toBe('capital')\n    expect(node('275', 'Ramallah')?.sourceKind).toBeUndefined()\n    expect(israel.length).toBeLessThanOrEqual(9)\n    expect(palestine.length).toBeLessThanOrEqual(9)\n  })\n\n  it('keeps Jerusalem final-status semantics explicit and symmetric', () => {\n    expect(semantics.version).toBe('1.8.0')\n    expect(semantics.entries['376'].territoryStatus.finalStatusResolved).toBe(false)\n    expect(semantics.entries['275'].territoryStatus.finalStatusResolved).toBe(false)\n    expect(label('376', 'Jerusalem')).toBe('Capital under Israeli law / seat of state institutions')\n    expect(label('376', 'Tel Aviv-Yafo')).toBe('Major economic / metropolitan centre')\n    expect(label('275', 'East Jerusalem')).toBe('Capital designated by State of Palestine / status sensitive')\n    expect(label('275', 'Ramallah')).toBe('Temporary government / administrative seat')\n    expect(label('275', 'Gaza')).toBe('Major urban centre')\n    expect(node('275', 'East Jerusalem')).toBeUndefined()\n    expect(semantics.entries['275'].placeRoles.find((value: any) => value.locality === 'East Jerusalem')?.note).toContain('does not fabricate')\n  })\n\n  it('uses institutional and UN sources rather than DROPi sovereignty assertions', () => {\n    const israelRefs = semantics.entries['376'].sourceRefs\n    const palestineRefs = semantics.entries['275'].sourceRefs\n    expect(israelRefs).toContain('israel-knesset-jerusalem-basic-law')\n    expect(israelRefs).toContain('un-sg-jerusalem-two-state-2026')\n    expect(palestineRefs).toContain('un-palestine-undata-capital')\n    expect(palestineRefs).toContain('palestine-basic-law-jerusalem')\n    expect(palestineRefs).toContain('palestine-cabinet-headquarters')\n    expect(palestineRefs).toContain('un-sg-jerusalem-two-state-2026')\n    for (const ref of new Set([...israelRefs, ...palestineRefs])) expect(semantics.sources[ref]?.url.startsWith('https://')).toBe(true)\n    expect(semantics.entries['376'].statusSummary).toContain('without asserting')\n    expect(semantics.entries['275'].statusSummary).toContain('without asserting')\n  })\n})\n""")

append = """\n## Jerusalem final-status model — #467 #468\n\nIsrael and Palestine share one neutral Jerusalem semantic model. Israel’s source-backed Jerusalem marker records the capital/institutional role established by Israeli law while the status layer preserves the current United Nations final-status context. Palestine uses Ramallah as the source-backed sparse structural slot and Gaza as a retained urban node; East Jerusalem is represented in semantic metadata as the State of Palestine capital designation without fabricating or duplicating a locality marker where the pinned source does not safely assign it to geometry `275`. Structural map roles never settle sovereignty.\n"""
if 'Jerusalem final-status model — #467 #468' not in SEM_DOC.read_text():
    SEM_DOC.write_text(SEM_DOC.read_text().rstrip() + '\n' + append)

special = SPECIAL.read_text()
special = special.replace('| 376 | Israel | Asia | special disputed-status semantics in source | REVIEW | #467 — capital/status semantics require neutral handling |', '| 376 | Israel | Asia | Jerusalem final-status-sensitive semantics | REVIEW | #467 — neutral Israeli institutional role + UN final-status model implemented; Android acceptance pending |')
special = special.replace('| 275 | Palestine | Asia | indeterminate/disputed status in source | REVIEW | #468 — capital/status semantics require neutral handling |', '| 275 | Palestine | Asia | East Jerusalem final-status-sensitive semantics | REVIEW | #468 — East Jerusalem designation + Ramallah/Gaza role model implemented without fabricated marker; Android acceptance pending |')
SPECIAL.write_text(special)

if 'country locality catalog version `1.9.0`' not in DATA_DOC.read_text():
    DATA_DOC.write_text(DATA_DOC.read_text().rstrip() + '\n\n- Current country locality catalog version `1.9.0` replaces the misleading Tel Aviv-Yafo and Gaza structural capital flags with source-backed Jerusalem and Ramallah slots while preserving neutral player-facing Jerusalem status semantics.\n')
