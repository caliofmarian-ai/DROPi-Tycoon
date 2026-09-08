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
    expect(localityCatalog.version).toBe('1.8.0')
    expect(nodes).toHaveLength(1)
    expect(nodes[0]?.name).toBe('Bir Lehlou')
    expect(Number.isFinite(nodes[0]?.longitude)).toBe(true)
    expect(Number.isFinite(nodes[0]?.latitude)).toBe(true)
    expect(nodes[0]?.sourceFeatureClass.length).toBeGreaterThan(0)
    expect(nodes[0]?.sourceKind).toBeUndefined()
  })

  it('classifies the geometry as a UN Non-Self-Governing Territory with unresolved final status', () => {
    const entry = semanticEntryForCountry(semanticCatalog, '732')
    expect(semanticCatalog.version).toBe('1.7.0')
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
