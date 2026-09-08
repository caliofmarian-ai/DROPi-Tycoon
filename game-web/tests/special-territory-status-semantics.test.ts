import { readFileSync } from 'node:fs'
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
