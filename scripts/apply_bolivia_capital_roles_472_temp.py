import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ROLE = ROOT / '04_World/Country_Catalog/COUNTRY_LOCALITY_ROLE_OVERRIDES.json'
SEM = ROOT / 'game-web/public/data/country-semantic-metadata-v1.json'
REV = ROOT / '04_World/Country_Catalog/COUNTRY_REVIEW_REGISTRY.json'
GEN = ROOT / 'scripts/build_country_locality_catalog.py'
SEM_DOC = ROOT / '04_World/Country_Catalog/COUNTRY_SEMANTIC_METADATA.md'
DATA_DOC = ROOT / '04_World/COUNTRY_LAYER_LOCALITY_DATASET.md'
TEST = ROOT / 'game-web/tests/bolivia-capital-semantics.test.ts'
GLOBAL_TEST = ROOT / 'game-web/tests/global-map-runtime.test.ts'

role = json.loads(ROLE.read_text())
assert role['version'] == '1.4.0', role['version']
role['version'] = '1.5.0'
role['entries']['068'] = {
    'issue': 472,
    'country': 'Bolivia',
    'currentCapital': {'sourceNames': ['Sucre'], 'displayName': 'Sucre'},
    'requiredRepresentatives': [{'sourceNames': ['La Paz'], 'displayName': 'La Paz', 'role': 'urban'}],
}
ROLE.write_text(json.dumps(role, ensure_ascii=False, indent=2) + '\n')

sem = json.loads(SEM.read_text())
assert sem['version'] == '1.6.0', sem['version']
sem['version'] = '1.7.0'
sem['sources'].update({
    'bolivia-oep-constitution': {
        'publisher': 'Órgano Electoral Plurinacional de Bolivia',
        'title': 'Constitución Política del Estado',
        'url': 'https://web.oep.org.bo/marco-normativo/constitucion-politica-del-estado/',
        'accessedOn': '2026-09-08',
        'note': 'The OEP publishes the current 2009 Constitution as Bolivia’s fundamental legal norm; current Bolivian institutional material identifies Sucre as the constitutional capital.',
    },
    'bolivia-deputies-sucre-capital': {
        'publisher': 'Cámara de Diputados, Asamblea Legislativa Plurinacional de Bolivia',
        'title': 'Autoridades nacionales participan de actos protocolares conmemorando los 199 años de independencia de Bolivia',
        'url': 'https://diputados.gob.bo/noticias/autoridades-nacionales-participan-de-actos-protocolares-conmemorando-los-199-anos-de-independencia-de-bolivia/',
        'publishedOn': '2024-08-06',
        'accessedOn': '2026-09-08',
        'note': 'The Chamber of Deputies explicitly describes Sucre as the constitutional capital of Bolivia.',
    },
    'bolivia-legislative-government-seat': {
        'publisher': 'Cámara de Diputados, Asamblea Legislativa Plurinacional de Bolivia',
        'title': 'Memoria histórica del nuevo edificio de la Asamblea Legislativa Plurinacional',
        'url': 'https://diputados.gob.bo/wp-content/uploads/2022/05/Formato-editable-libro-Memoria-historica-del-nuevo-edificio-de-la-Asamblea-Legislativa-Plurinacional.pdf',
        'publishedOn': '2022-05-01',
        'accessedOn': '2026-09-08',
        'note': 'The legislative institutional history identifies La Paz as Bolivia’s political centre, locating the Executive and Legislative branches and the President’s residence there, while Sucre is the capital and judicial seat.',
    },
})
sem['entries']['068'] = {
    'issue': 472,
    'renderedName': 'Bolivia',
    'statusLabel': 'Constitutional capital and government-seat roles',
    'statusSummary': 'Sucre is Bolivia’s constitutional/national capital. La Paz is the principal seat of government and political centre where the Executive and Legislative branches operate. DROPi represents both roles instead of treating La Paz as the sole national capital.',
    'placeRoles': [
        {'locality': 'Sucre', 'role': 'constitutional-national-capital', 'label': 'Constitutional / national capital'},
        {'locality': 'La Paz', 'role': 'government-seat', 'label': 'Government seat / executive & legislative centre'},
    ],
    'sourceRefs': ['bolivia-oep-constitution', 'bolivia-deputies-sucre-capital', 'bolivia-legislative-government-seat'],
}
SEM.write_text(json.dumps(sem, ensure_ascii=False, indent=2) + '\n')

rev = json.loads(REV.read_text())
assert rev['version'] == '1.7.0', rev['version']
rev['version'] = '1.8.0'
rev['reviews']['068']['reason'] = 'Sucre constitutional/national-capital override implemented; La Paz retained as government seat / executive and legislative centre; owner Android Country Layer acceptance pending'
REV.write_text(json.dumps(rev, ensure_ascii=False, indent=2) + '\n')

gen = GEN.read_text()
gen = gen.replace("assert capital('384') == 'Yamoussoukro'", "assert capital('384') == 'Yamoussoukro'\nassert capital('068') == 'Sucre'")
gen = gen.replace("assert node('384', 'Abidjan') and node('384', 'Abidjan')['role'] != 'capital'", "assert node('384', 'Abidjan') and node('384', 'Abidjan')['role'] != 'capital'\nassert node('068', 'La Paz') and node('068', 'La Paz')['role'] != 'capital'")
gen = gen.replace("'version': '1.7.0'", "'version': '1.8.0'", 1)
GEN.write_text(gen)

for p in (ROOT / 'game-web/tests').glob('*.test.ts'):
    text = p.read_text()
    text = text.replace("semanticCatalog.version).toBe('1.6.0')", "semanticCatalog.version).toBe('1.7.0')")
    text = text.replace("semanticCatalog.version).toBe('1.6.0')", "semanticCatalog.version).toBe('1.7.0')")
    text = text.replace("semantics.version).toBe('1.6.0')", "semantics.version).toBe('1.7.0')")
    text = text.replace("roleOverrideRegistry.version).toBe('1.4.0')", "roleOverrideRegistry.version).toBe('1.5.0')")
    text = text.replace("roles.version).toBe('1.4.0')", "roles.version).toBe('1.5.0')")
    text = text.replace("localityCatalog.version).toBe('1.7.0')", "localityCatalog.version).toBe('1.8.0')")
    text = text.replace("localities.version).toBe('1.7.0')", "localities.version).toBe('1.8.0')")
    text = text.replace("registryVersion).toBe('1.4.0')", "registryVersion).toBe('1.5.0')")
    p.write_text(text)

global_test = GLOBAL_TEST.read_text()
global_test = global_test.replace("const CAPITAL_ROLE_OVERRIDE_IDS = ['104', '108', '144', '152', '204', '226', '384', '392', '710', '834']", "const CAPITAL_ROLE_OVERRIDE_IDS = ['068', '104', '108', '144', '152', '204', '226', '384', '392', '710', '834']")
GLOBAL_TEST.write_text(global_test)

TEST.write_text("""import { readFileSync } from 'node:fs'\nimport { describe, expect, it } from 'vitest'\n\nconst roles = JSON.parse(readFileSync(new URL('../../04_World/Country_Catalog/COUNTRY_LOCALITY_ROLE_OVERRIDES.json', import.meta.url), 'utf8'))\nconst localities = JSON.parse(readFileSync(new URL('../public/data/country-representative-localities-v1.json', import.meta.url), 'utf8'))\nconst semantics = JSON.parse(readFileSync(new URL('../public/data/country-semantic-metadata-v1.json', import.meta.url), 'utf8'))\n\nconst node = (name: string) => localities.countries['068']?.find((value: any) => value.name === name)\nconst label = (name: string) => semantics.entries['068']?.placeRoles.find((value: any) => value.locality === name)?.label\n\ndescribe('Bolivia capital semantics #472', () => {\n  it('uses a source-only role override with no hardcoded coordinates', () => {\n    expect(roles.version).toBe('1.5.0')\n    expect(roles.entries['068'].issue).toBe(472)\n    expect(roles.entries['068'].currentCapital).toEqual({ sourceNames: ['Sucre'], displayName: 'Sucre' })\n    expect(JSON.stringify(roles.entries['068'])).not.toContain('longitude')\n    expect(JSON.stringify(roles.entries['068'])).not.toContain('latitude')\n  })\n\n  it('materializes Sucre as the structural capital and preserves La Paz from Natural Earth', () => {\n    const nodes = localities.countries['068'] ?? []\n    expect(localities.version).toBe('1.8.0')\n    expect(nodes.filter((value: any) => value.role === 'capital')).toHaveLength(1)\n    expect(nodes.find((value: any) => value.role === 'capital')?.name).toBe('Sucre')\n    expect(node('La Paz')).toBeDefined()\n    expect(node('La Paz')?.role).not.toBe('capital')\n    expect(node('Sucre')?.sourceKind).toBeUndefined()\n    expect(node('La Paz')?.sourceKind).toBeUndefined()\n    expect(nodes.length).toBeLessThanOrEqual(9)\n  })\n\n  it('exposes constitutional-capital and government-seat roles from Bolivian institutional sources', () => {\n    const entry = semantics.entries['068']\n    expect(semantics.version).toBe('1.7.0')\n    expect(entry.issue).toBe(472)\n    expect(label('Sucre')).toBe('Constitutional / national capital')\n    expect(label('La Paz')).toBe('Government seat / executive & legislative centre')\n    expect(entry.statusSummary).toContain('Sucre')\n    expect(entry.statusSummary).toContain('La Paz')\n    expect(entry.sourceRefs).toContain('bolivia-oep-constitution')\n    expect(entry.sourceRefs).toContain('bolivia-legislative-government-seat')\n    for (const ref of entry.sourceRefs) expect(semantics.sources[ref]?.url).toMatch(/^https:\/\//)\n  })\n})\n""")

append = """\n## Bolivia capital-role correction — #472\n\nBolivia is governed as a multi-role capital case: Sucre is the constitutional/national capital and La Paz remains the principal government seat and executive/legislative centre. Both localities remain Natural Earth-backed; the role override contains no manual coordinates.\n"""
if 'Bolivia capital-role correction — #472' not in SEM_DOC.read_text():
    SEM_DOC.write_text(SEM_DOC.read_text().rstrip() + '\n' + append)

if 'country locality catalog version `1.8.0`' not in DATA_DOC.read_text():
    DATA_DOC.write_text(DATA_DOC.read_text().rstrip() + '\n\n- Current country locality catalog version `1.8.0` adds the source-backed Bolivia Sucre/La Paz capital-role correction without manual coordinates.\n')
