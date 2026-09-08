import json
import textwrap
from pathlib import Path


def read_json(path):
    return json.loads(Path(path).read_text())


def write_json(path, value):
    Path(path).write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n")


def replace_one(path, old, new):
    p = Path(path)
    text = p.read_text()
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f"{path}: expected one occurrence of {old!r}, found {count}")
    p.write_text(text.replace(old, new, 1))


# Player-facing semantic/status data. No locality coordinates are changed.
semantic_path = "game-web/public/data/country-semantic-metadata-v1.json"
semantic = read_json(semantic_path)
if semantic["version"] != "1.4.0":
    raise RuntimeError(f"unexpected semantic metadata version {semantic['version']!r}")
semantic["version"] = "1.5.0"
semantic["sources"]["un-western-sahara-nsgt"] = {
    "publisher": "United Nations and Decolonization",
    "title": "Western Sahara",
    "url": "https://www.un.org/dppa/decolonization/en/nsgt/western-sahara",
    "accessedOn": "2026-09-08",
    "note": "The United Nations lists Western Sahara as a Non-Self-Governing Territory since 1963 and treats the question as an unfinished decolonization matter rather than a settled sovereignty outcome.",
}
semantic["sources"]["un-western-sahara-working-paper-2026"] = {
    "publisher": "United Nations Special Committee on Decolonization",
    "title": "Working papers on Non-Self-Governing Territories — Western Sahara, 2026 session",
    "url": "https://www.un.org/dppa/decolonization/en/Documents/Workingpapersonnon-self-governingterritories",
    "publishedOn": "2026-01-13",
    "accessedOn": "2026-09-08",
    "note": "The 2026 C-24 working-paper index lists A/AC.109/2026/17 for Western Sahara, confirming that the Territory remains on the Committee's active 2026 agenda.",
}
semantic["sources"]["un-minurso-current"] = {
    "publisher": "United Nations Peacekeeping",
    "title": "MINURSO Fact Sheet",
    "url": "https://peacekeeping.un.org/en/factsheet/minurso",
    "accessedOn": "2026-09-08",
    "note": "MINURSO remains the United Nations Mission for the Referendum in Western Sahara and continues operating with Morocco and Frente Polisario as parties to the unresolved settlement process.",
}
semantic["entries"]["732"] = {
    "issue": 462,
    "renderedName": "W. Sahara",
    "statusLabel": "UN Non-Self-Governing Territory",
    "statusSummary": "Western Sahara has remained on the United Nations list of Non-Self-Governing Territories since 1963. Its final status remains unresolved, and MINURSO continues operating in the Territory in the context of the settlement process involving Morocco and Frente Polisario. DROPi renders the geography and its source-backed locality without choosing a sovereignty or governance claim.",
    "territoryStatus": {
        "classification": "un-non-self-governing-territory",
        "label": "UN Non-Self-Governing Territory",
        "finalStatusResolved": False,
        "note": "Geographic chapter placement and sparse locality roles do not adjudicate sovereignty, recognition, administration or final status.",
    },
    "placeRoles": [
        {
            "locality": "Bir Lehlou",
            "role": "status-sensitive-representative-locality",
            "label": "Source-backed representative locality",
            "note": "The Natural Earth locality is retained for sparse geographic representation. DROPi does not surface its structural source capital flag as an uncontested national-capital claim.",
        }
    ],
    "sourceRefs": [
        "un-western-sahara-nsgt",
        "un-western-sahara-working-paper-2026",
        "un-minurso-current",
    ],
}
write_json(semantic_path, semantic)

# Review registry: implementation complete, owner runtime acceptance pending.
review_path = "04_World/Country_Catalog/COUNTRY_REVIEW_REGISTRY.json"
review = read_json(review_path)
if review["version"] != "1.6.0":
    raise RuntimeError(f"unexpected review registry version {review['version']!r}")
review["version"] = "1.7.0"
review["reviews"]["732"] = {
    "issue": 462,
    "reason": "UN Non-Self-Governing Territory semantics implemented; Bir Lehlou retained only as source-backed representative locality; owner Android Country Layer acceptance pending",
}
write_json(review_path, review)

# All existing semantic regression contracts move together.
for path in sorted(Path("game-web/tests").glob("*.test.ts")):
    text = path.read_text()
    if "expect(semanticCatalog.version).toBe('1.4.0')" in text:
        path.write_text(text.replace(
            "expect(semanticCatalog.version).toBe('1.4.0')",
            "expect(semanticCatalog.version).toBe('1.5.0')",
        ))

# Dedicated territory-status regression coverage.
Path("game-web/tests/western-sahara-status-semantics.test.ts").write_text(textwrap.dedent("""\
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  semanticEntryForCountry,
  semanticPlaceRoleForLocality,
  validateSemanticEntrySources,
  type CountrySemanticCatalog,
} from '../src/world/countrySemanticMetadata'

const localityCatalog = JSON.parse(readFileSync(
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
    sourceKind?: string
  }>>
}

const semanticCatalog = JSON.parse(readFileSync(
  new URL('../public/data/country-semantic-metadata-v1.json', import.meta.url),
  'utf8',
)) as CountrySemanticCatalog

const africaManifest = readFileSync(
  new URL('../../04_World/Country_Catalog/Continents/africa.md', import.meta.url),
  'utf8',
)
const specialLedger = readFileSync(
  new URL('../../04_World/Country_Catalog/SPECIAL_TERRITORY_CLASSIFICATION.md', import.meta.url),
  'utf8',
)

describe('Western Sahara neutral territory-status semantics #462', () => {
  it('keeps Bir Lehlou source-backed without changing the sparse locality catalog', () => {
    const nodes = localityCatalog.countries['732'] ?? []
    expect(localityCatalog.version).toBe('1.6.0')
    expect(nodes).toHaveLength(1)
    expect(nodes[0]?.name).toBe('Bir Lehlou')
    expect(Number.isFinite(nodes[0]?.longitude)).toBe(true)
    expect(Number.isFinite(nodes[0]?.latitude)).toBe(true)
    expect(nodes[0]?.sourceFeatureClass.length).toBeGreaterThan(0)
    expect(nodes[0]?.sourceKind).toBeUndefined()
  })

  it('classifies the geometry as a UN Non-Self-Governing Territory with unresolved final status', () => {
    const entry = semanticEntryForCountry(semanticCatalog, '732')
    expect(semanticCatalog.version).toBe('1.5.0')
    expect(entry?.issue).toBe(462)
    expect(entry?.statusLabel).toBe('UN Non-Self-Governing Territory')
    expect(entry?.territoryStatus).toEqual({
      classification: 'un-non-self-governing-territory',
      label: 'UN Non-Self-Governing Territory',
      finalStatusResolved: false,
      note: 'Geographic chapter placement and sparse locality roles do not adjudicate sovereignty, recognition, administration or final status.',
    })
    expect(entry?.statusSummary).toContain('since 1963')
    expect(entry?.statusSummary).toContain('final status remains unresolved')
    expect(entry?.statusSummary).toContain('MINURSO')
    expect(validateSemanticEntrySources(semanticCatalog, entry!)).toBe(true)
  })

  it('overrides the source capital semantics with a neutral representative-locality label', () => {
    const entry = semanticEntryForCountry(semanticCatalog, '732')
    const birLehlou = semanticPlaceRoleForLocality(entry, 'Bir Lehlou')
    expect(birLehlou?.role).toBe('status-sensitive-representative-locality')
    expect(birLehlou?.label).toBe('Source-backed representative locality')
    expect(birLehlou?.label.toLowerCase()).not.toContain('capital')
    expect(entry?.placeRoles.some(role => role.label === 'National capital')).toBe(false)
  })

  it('keeps geographic chapter placement separate from political/status semantics', () => {
    expect(africaManifest).toContain('| Structural capital slot |')
    expect(africaManifest).toContain('sparse-map data role only')
    expect(africaManifest).toContain('| 732 | W. Sahara | Bir Lehlou | 1 | CAPITAL | **REVIEW** | #462: UN Non-Self-Governing Territory semantics implemented')
    expect(specialLedger).toContain('| 732 | W. Sahara | Africa | UN Non-Self-Governing Territory / unresolved final status | REVIEW | #462')
    expect(specialLedger).toContain('Western Sahara and Somaliland remain geographically in Africa')
  })

  it('records current UN institutional sources rather than a partisan capital claim', () => {
    const entry = semanticEntryForCountry(semanticCatalog, '732')
    expect(entry?.sourceRefs).toEqual([
      'un-western-sahara-nsgt',
      'un-western-sahara-working-paper-2026',
      'un-minurso-current',
    ])
    expect(semanticCatalog.sources['un-western-sahara-nsgt']?.url).toBe(
      'https://www.un.org/dppa/decolonization/en/nsgt/western-sahara',
    )
    expect(semanticCatalog.sources['un-western-sahara-working-paper-2026']?.note).toContain('A/AC.109/2026/17')
    expect(semanticCatalog.sources['un-minurso-current']?.url).toBe('https://peacekeeping.un.org/en/factsheet/minurso')
  })
})
"""))

# Generated audit manifests must explicitly distinguish structural slot from political semantics.
builder = "scripts/build_country_catalog_chapters.py"
replace_one(
    builder,
    "        '- every node coordinate remains a source coordinate; this manifest does not reposition places.',\n",
    "        '- every node coordinate remains a source coordinate; this manifest does not reposition places.',\n        '- Structural capital slot is a sparse-map data role only; player-facing political/territory semantics are governed by `game-web/public/data/country-semantic-metadata-v1.json`.',\n",
)
replace_one(
    builder,
    "        '| ID | Country / territory | Capital | Nodes | Slots | State | Notes |',\n",
    "        '| ID | Country / territory | Structural capital slot | Nodes | Slots | State | Notes |',\n",
)
replace_one(
    builder,
    "        '- `PASS` means automated structural and pinned-source checks pass; it does not claim final economy/transport simulation is active.',\n",
    "        '- `PASS` means automated structural and pinned-source checks pass; it does not claim final economy/transport simulation is active.',\n        '- A structural `CAPITAL` slot is not automatically a player-facing national-capital claim; semantic metadata overrides the label where political, constitutional or territory status requires it.',\n",
)

# Canonical semantic contract: structured territory status + Western Sahara case.
semantic_doc = "04_World/Country_Catalog/COUNTRY_SEMANTIC_METADATA.md"
replace_one(
    semantic_doc,
    "Coordinates: #418 #459 #460 #461 #464 #465 #466 #473 #478 #481 #482",
    "Coordinates: #418 #453 #459 #460 #461 #462 #464 #465 #466 #473 #478 #481 #482",
)
replace_one(
    semantic_doc,
    "5. The runtime may display multiple place roles for one geometry when reality requires them.\n",
    "5. The runtime may display multiple place roles for one geometry when reality requires them.\n5a. `territoryStatus`, when present, records a source-governed territory classification separately from locality roles and must state whether final status is resolved.\n",
)
replace_one(
    semantic_doc,
    "## Current-reality capital corrections",
    """### Western Sahara (`732`) — #462

Western Sahara remains geographically in the Africa chapter under the one-geometry/one-chapter rule established by #453. The United Nations continues to list Western Sahara as a Non-Self-Governing Territory, and the 2026 C-24 working-paper index includes Western Sahara as A/AC.109/2026/17. MINURSO remains an active United Nations peacekeeping mission in the Territory.

DROPi therefore records a structured `territoryStatus` classification of `un-non-self-governing-territory` with `finalStatusResolved: false`. The runtime status label is `UN Non-Self-Governing Territory`. This is a source-governed UN classification, not a DROPi sovereignty decision.

The pinned Natural Earth locality catalog contains only Bir Lehlou for geometry `732` and assigns it the structural sparse-map capital slot. DROPi preserves that source-backed locality and coordinate, but semantic metadata overrides its player-facing role to `Source-backed representative locality`. The source structural flag must never be surfaced as an uncontested `National capital` claim.

This reconciles #462 with the Special Territory and Cross-Region Classification ledger from #453: special political/status governance does not require moving or duplicating a geometry into the generated `Special` continent chapter.

## Current-reality capital corrections""",
)

# Special-territory ledger: explicit UN classification while keeping Africa placement.
special_path = "04_World/Country_Catalog/SPECIAL_TERRITORY_CLASSIFICATION.md"
replace_one(
    special_path,
    "Coordinates: #418 #453 #480 #481 #482",
    "Coordinates: #418 #453 #462 #480 #481 #482",
)
replace_one(
    special_path,
    "| 732 | W. Sahara | Africa | indeterminate/disputed territory | REVIEW | #462 — neutral territory-status semantics required |",
    "| 732 | W. Sahara | Africa | UN Non-Self-Governing Territory / unresolved final status | REVIEW | #462 — UN territory-status semantics implemented; Bir Lehlou player-facing capital claim suppressed; owner Android acceptance pending |",
)

# Locality dataset contract: structural capital slot is not political semantics.
dataset_path = "04_World/COUNTRY_LAYER_LOCALITY_DATASET.md"
replace_one(
    dataset_path,
    "5. every stored coordinate must be source-backed either by the pinned Natural Earth feature or by an explicitly governed authoritative supplement; no locality point is manually invented, estimated from a map image or repositioned.\n",
    "5. every stored coordinate must be source-backed either by the pinned Natural Earth feature or by an explicitly governed authoritative supplement; no locality point is manually invented, estimated from a map image or repositioned.\n6. the structural `capital` slot is a sparse-map selection role, not automatically a player-facing sovereignty or national-capital assertion; `country-semantic-metadata-v1.json` must override that meaning for disputed, non-self-governing, treaty-governed or otherwise status-sensitive geometries.\n",
)
