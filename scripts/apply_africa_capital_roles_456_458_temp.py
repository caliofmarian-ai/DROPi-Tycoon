import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ROLE = ROOT / '04_World/Country_Catalog/COUNTRY_LOCALITY_ROLE_OVERRIDES.json'
SEM = ROOT / 'game-web/public/data/country-semantic-metadata-v1.json'
REV = ROOT / '04_World/Country_Catalog/COUNTRY_REVIEW_REGISTRY.json'
GEN = ROOT / 'scripts/build_country_locality_catalog.py'
SEM_DOC = ROOT / '04_World/Country_Catalog/COUNTRY_SEMANTIC_METADATA.md'
DATA_DOC = ROOT / '04_World/COUNTRY_LAYER_LOCALITY_DATASET.md'
TEST = ROOT / 'game-web/tests/africa-capital-role-semantics.test.ts'

role = json.loads(ROLE.read_text())
role['version'] = '1.4.0'
role['entries'].update({
    '204': {
        'issue': 456,
        'country': 'Benin',
        'currentCapital': {'sourceNames': ['Porto-Novo', 'Porto Novo'], 'displayName': 'Porto-Novo'},
        'requiredRepresentatives': [{'sourceNames': ['Cotonou'], 'displayName': 'Cotonou', 'role': 'urban'}],
    },
    '108': {
        'issue': 457,
        'country': 'Burundi',
        'currentCapital': {'sourceNames': ['Gitega'], 'displayName': 'Gitega'},
        'requiredRepresentatives': [{'sourceNames': ['Bujumbura'], 'displayName': 'Bujumbura', 'role': 'urban'}],
    },
    '384': {
        'issue': 458,
        'country': "Côte d'Ivoire",
        'currentCapital': {'sourceNames': ['Yamoussoukro'], 'displayName': 'Yamoussoukro'},
        'requiredRepresentatives': [{'sourceNames': ['Abidjan'], 'displayName': 'Abidjan', 'role': 'urban'}],
    },
})
ROLE.write_text(json.dumps(role, ensure_ascii=False, indent=2) + '\n')

sem = json.loads(SEM.read_text())
sem['version'] = '1.6.0'
sem['sources'].update({
    'benin-porto-novo-capital': {
        'publisher': 'Ministry of Decentralization and Local Governance, Republic of Benin',
        'title': 'Porto-Novo',
        'url': 'https://www.decentralisation.gouv.bj/commune/62/porto-novo/',
        'accessedOn': '2026-09-08',
        'note': 'The official commune profile states that Porto-Novo retained its capital status after Benin independence and hosts major national political institutions.',
    },
    'benin-cotonou-economic-capital': {
        'publisher': 'Government of the Republic of Benin',
        'title': 'Cité ministérielle de Cotonou : Le nouveau symbole d’une administration moderne et intégrée',
        'url': 'https://www.gouv.bj/article/3321/cite-ministerielle-cotonou-nouveau-symbole-administration-moderne-integree/',
        'publishedOn': '2025-10-30',
        'accessedOn': '2026-09-08',
        'note': 'The Government describes Cotonou as Benin’s economic capital and records the ministerial city hosting sixteen ministerial cabinets and central services.',
    },
    'burundi-presidency-capitals': {
        'publisher': 'Presidency of the Republic of Burundi',
        'title': 'Le Pays',
        'url': 'https://presidence.gov.bi/le-pays/',
        'accessedOn': '2026-09-08',
        'note': 'The Presidency identifies Gitega as the political capital and Bujumbura as the economic capital.',
    },
    'cote-divoire-economic-diplomacy-capitals': {
        'publisher': "Ministry of Foreign Affairs and International Cooperation, Republic of Côte d’Ivoire",
        'title': 'Economic Diplomacy Platform — General data',
        'url': 'https://www.eco.diplomatie.gouv.ci/',
        'accessedOn': '2026-09-08',
        'note': 'The official economic-diplomacy profile identifies Yamoussoukro as the political capital and Abidjan as the economic capital.',
    },
})
sem['entries'].update({
    '204': {
        'issue': 456,
        'renderedName': 'Benin',
        'statusLabel': 'Capital and government/economic roles',
        'statusSummary': 'Porto-Novo is Benin’s national and political capital. Cotonou is the economic capital and hosts major central-government services, so DROPi represents both roles instead of treating Cotonou as the sole national capital.',
        'placeRoles': [
            {'locality': 'Porto-Novo', 'role': 'national-political-capital', 'label': 'National / political capital'},
            {'locality': 'Cotonou', 'role': 'economic-capital-government-centre', 'label': 'Economic capital / government centre'},
        ],
        'sourceRefs': ['benin-porto-novo-capital', 'benin-cotonou-economic-capital'],
    },
    '108': {
        'issue': 457,
        'renderedName': 'Burundi',
        'statusLabel': 'Political and economic capital roles',
        'statusSummary': 'Gitega is Burundi’s political capital and Bujumbura is its economic capital. DROPi keeps both cities visible with distinct roles.',
        'placeRoles': [
            {'locality': 'Gitega', 'role': 'political-capital', 'label': 'Political capital'},
            {'locality': 'Bujumbura', 'role': 'economic-capital', 'label': 'Economic capital'},
        ],
        'sourceRefs': ['burundi-presidency-capitals'],
    },
    '384': {
        'issue': 458,
        'renderedName': "Côte d'Ivoire",
        'statusLabel': 'Political and economic capital roles',
        'statusSummary': 'Yamoussoukro is Côte d’Ivoire’s political capital and Abidjan is its economic capital. DROPi represents the two roles separately rather than preserving Abidjan as the sole capital.',
        'placeRoles': [
            {'locality': 'Yamoussoukro', 'role': 'political-capital', 'label': 'Political capital'},
            {'locality': 'Abidjan', 'role': 'economic-capital', 'label': 'Economic capital / major metropolitan centre'},
        ],
        'sourceRefs': ['cote-divoire-economic-diplomacy-capitals'],
    },
})
SEM.write_text(json.dumps(sem, ensure_ascii=False, indent=2) + '\n')

rev = json.loads(REV.read_text())
rev['version'] = '1.7.0'
rev['reviews']['204']['reason'] = 'Porto-Novo national/political capital override implemented; Cotonou retained as economic capital / government centre; owner Android Country Layer acceptance pending'
rev['reviews']['108']['reason'] = 'Gitega political-capital override implemented; Bujumbura retained as economic capital; owner Android Country Layer acceptance pending'
rev['reviews']['384']['reason'] = 'Yamoussoukro political-capital override implemented; Abidjan retained as economic capital / major metropolitan centre; owner Android Country Layer acceptance pending'
REV.write_text(json.dumps(rev, ensure_ascii=False, indent=2) + '\n')

gen = GEN.read_text()
gen = gen.replace("assert capital('834') == 'Dodoma'", "assert capital('834') == 'Dodoma'\nassert capital('204') == 'Porto-Novo'\nassert capital('108') == 'Gitega'\nassert capital('384') == 'Yamoussoukro'")
gen = gen.replace("assert node('834', 'Dar es Salaam') and node('834', 'Dar es Salaam')['role'] != 'capital'", "assert node('834', 'Dar es Salaam') and node('834', 'Dar es Salaam')['role'] != 'capital'\nassert node('204', 'Cotonou') and node('204', 'Cotonou')['role'] != 'capital'\nassert node('108', 'Bujumbura') and node('108', 'Bujumbura')['role'] != 'capital'\nassert node('384', 'Abidjan') and node('384', 'Abidjan')['role'] != 'capital'")
gen = gen.replace("'version': '1.6.0'", "'version': '1.7.0'", 1)
GEN.write_text(gen)

for p in (ROOT / 'game-web/tests').glob('*.test.ts'):
    text = p.read_text()
    text = text.replace("semanticCatalog.version).toBe('1.5.0')", "semanticCatalog.version).toBe('1.6.0')")
    text = text.replace("roleOverrideRegistry.version).toBe('1.3.0')", "roleOverrideRegistry.version).toBe('1.4.0')")
    text = text.replace("localityCatalog.version).toBe('1.6.0')", "localityCatalog.version).toBe('1.7.0')")
    text = text.replace("registryVersion).toBe('1.3.0')", "registryVersion).toBe('1.4.0')")
    p.write_text(text)

TEST.write_text("""import { readFileSync } from 'node:fs'\nimport { describe, expect, it } from 'vitest'\n\nconst roles = JSON.parse(readFileSync(new URL('../../04_World/Country_Catalog/COUNTRY_LOCALITY_ROLE_OVERRIDES.json', import.meta.url), 'utf8'))\nconst localities = JSON.parse(readFileSync(new URL('../public/data/country-representative-localities-v1.json', import.meta.url), 'utf8'))\nconst semantics = JSON.parse(readFileSync(new URL('../public/data/country-semantic-metadata-v1.json', import.meta.url), 'utf8'))\n\nconst node = (cid: string, name: string) => localities.countries[cid]?.find((value: any) => value.name === name)\nconst label = (cid: string, name: string) => semantics.entries[cid]?.placeRoles.find((value: any) => value.locality === name)?.label\n\ndescribe('Africa capital-role semantics #456 #457 #458', () => {\n  it('uses source-only role overrides with no hardcoded coordinates', () => {\n    expect(roles.version).toBe('1.4.0')\n    for (const cid of ['204', '108', '384']) {\n      expect(JSON.stringify(roles.entries[cid])).not.toContain('longitude')\n      expect(JSON.stringify(roles.entries[cid])).not.toContain('latitude')\n    }\n  })\n\n  it('materializes the current political/national capitals and preserves prior major cities', () => {\n    expect(localities.version).toBe('1.7.0')\n    const cases = [\n      ['204', 'Porto-Novo', 'Cotonou'],\n      ['108', 'Gitega', 'Bujumbura'],\n      ['384', 'Yamoussoukro', 'Abidjan'],\n    ] as const\n    for (const [cid, capital, secondary] of cases) {\n      const nodes = localities.countries[cid] ?? []\n      expect(nodes.filter((value: any) => value.role === 'capital')).toHaveLength(1)\n      expect(nodes.find((value: any) => value.role === 'capital')?.name).toBe(capital)\n      expect(node(cid, secondary)).toBeDefined()\n      expect(node(cid, secondary)?.role).not.toBe('capital')\n      expect(node(cid, capital)?.sourceKind).toBeUndefined()\n      expect(node(cid, secondary)?.sourceKind).toBeUndefined()\n      expect(nodes.length).toBeLessThanOrEqual(9)\n    }\n  })\n\n  it('exposes player-facing multi-role capital semantics from official sources', () => {\n    expect(semantics.version).toBe('1.6.0')\n    expect(label('204', 'Porto-Novo')).toBe('National / political capital')\n    expect(label('204', 'Cotonou')).toBe('Economic capital / government centre')\n    expect(label('108', 'Gitega')).toBe('Political capital')\n    expect(label('108', 'Bujumbura')).toBe('Economic capital')\n    expect(label('384', 'Yamoussoukro')).toBe('Political capital')\n    expect(label('384', 'Abidjan')).toBe('Economic capital / major metropolitan centre')\n    for (const cid of ['204', '108', '384']) {\n      expect(semantics.entries[cid].sourceRefs.length).toBeGreaterThan(0)\n      for (const ref of semantics.entries[cid].sourceRefs) expect(semantics.sources[ref]?.url).toMatch(/^https:\/\//)\n    }\n  })\n})\n""")

append = """\n## Africa multi-role capital corrections — #456 #457 #458\n\nBenin, Burundi and Côte d’Ivoire use the governed locality-role override registry to distinguish the source-backed structural capital node from a separately retained economic/government city. Porto-Novo/Cotonou, Gitega/Bujumbura and Yamoussoukro/Abidjan remain source-backed Natural Earth localities; player-facing role labels are governed by official national sources.\n"""
if 'Africa multi-role capital corrections — #456 #457 #458' not in SEM_DOC.read_text():
    SEM_DOC.write_text(SEM_DOC.read_text().rstrip() + '\n' + append)

if 'country locality catalog version `1.7.0`' not in DATA_DOC.read_text():
    DATA_DOC.write_text(DATA_DOC.read_text().rstrip() + '\n\n- Current country locality catalog version `1.7.0` adds source-backed capital-role corrections for Benin, Burundi and Côte d’Ivoire without adding manual coordinates.\n')
