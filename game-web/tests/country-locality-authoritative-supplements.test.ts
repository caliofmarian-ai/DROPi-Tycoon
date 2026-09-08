import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const supplementRegistry = JSON.parse(readFileSync(
  new URL('../../04_World/Country_Catalog/COUNTRY_LOCALITY_AUTHORITATIVE_SUPPLEMENTS.json', import.meta.url),
  'utf8',
)) as {
  version: string
  governance: Record<string, boolean>
  sources: Record<string, { publisher: string; url: string; updatedOn?: string }>
  entries: Record<string, {
    issue: number
    countryId: string
    name: string
    formerNames: string[]
    longitude: number
    latitude: number
    sourceCoordinateText: string
    sourceRef: string
    effectiveOn: string
  }>
}

const roleOverrideRegistry = JSON.parse(readFileSync(
  new URL('../../04_World/Country_Catalog/COUNTRY_LOCALITY_ROLE_OVERRIDES.json', import.meta.url),
  'utf8',
)) as {
  version: string
  entries: Record<string, {
    issue: number
    currentCapital: { supplementRef?: string; displayName: string }
    requiredRepresentatives?: Array<{ sourceNames: string[]; displayName: string; role: string }>
  }>
}

const localityCatalog = JSON.parse(readFileSync(
  new URL('../public/data/country-representative-localities-v1.json', import.meta.url),
  'utf8',
)) as {
  version: string
  localityAuthoritativeSupplements?: { registryVersion: string; refs: string[] }
  countries: Record<string, Array<{
    name: string
    role: string
    longitude: number
    latitude: number
    sourceKind?: string
    supplementRef?: string
    sourceRef?: string
    sourceCoordinateText?: string
    effectiveOn?: string
  }>>
}

const semanticCatalog = JSON.parse(readFileSync(
  new URL('../public/data/country-semantic-metadata-v1.json', import.meta.url),
  'utf8',
)) as {
  version: string
  entries: Record<string, {
    issue: number
    statusSummary: string
    placeRoles: Array<{ locality: string; label: string }>
    sourceRefs: string[]
  }>
}

describe('authoritative locality supplements', () => {
  it('proves the PCGN DMS coordinate converts exactly to the governed decimal coordinate', () => {
    const supplement = supplementRegistry.entries['equatorial-guinea-ciudad-de-la-paz-2026']
    const expectedLatitude = 1 + 35 / 60 + 33 / 3600
    const expectedLongitude = 10 + 49 / 60 + 25 / 3600

    expect(supplementRegistry.version).toBe('1.0.0')
    expect(supplementRegistry.governance.institutionalSourceRequired).toBe(true)
    expect(supplementRegistry.governance.sourceCoordinateTextRequired).toBe(true)
    expect(supplementRegistry.governance.decimalCoordinatesMustBeExactConversion).toBe(true)
    expect(supplement.issue).toBe(459)
    expect(supplement.countryId).toBe('226')
    expect(supplement.name).toBe('Ciudad de la Paz')
    expect(supplement.formerNames).toContain('Oyala')
    expect(supplement.sourceCoordinateText).toBe('01°35′33″N 10°49′25″E')
    expect(supplement.latitude).toBeCloseTo(expectedLatitude, 12)
    expect(supplement.longitude).toBeCloseTo(expectedLongitude, 12)
    expect(supplement.effectiveOn).toBe('2026-01-02')

    const source = supplementRegistry.sources[supplement.sourceRef]
    expect(source.publisher).toContain('Permanent Committee on Geographical Names')
    expect(source.url).toMatch(/^https:\/\/assets\.publishing\.service\.gov\.uk\//)
    expect(source.updatedOn).toBe('2026-01-08')
  })

  it('uses the supplement only through the governed Equatorial Guinea capital override', () => {
    const override = roleOverrideRegistry.entries['226']

    expect(roleOverrideRegistry.version).toBe('1.6.0')
    expect(override.issue).toBe(459)
    expect(override.currentCapital.supplementRef).toBe('equatorial-guinea-ciudad-de-la-paz-2026')
    expect(override.currentCapital.displayName).toBe('Ciudad de la Paz')
    expect(override.requiredRepresentatives).toContainEqual({
      sourceNames: ['Malabo'],
      displayName: 'Malabo',
      role: 'urban',
    })
    expect(JSON.stringify(override)).not.toContain('longitude')
    expect(JSON.stringify(override)).not.toContain('latitude')
  })

  it('materializes Ciudad de la Paz as the effective-dated capital and keeps Malabo non-capital', () => {
    const nodes = localityCatalog.countries['226'] ?? []
    const capital = nodes.find(node => node.role === 'capital')
    const malabo = nodes.find(node => node.name === 'Malabo')

    expect(localityCatalog.version).toBe('1.9.0')
    expect(localityCatalog.localityAuthoritativeSupplements?.registryVersion).toBe(supplementRegistry.version)
    expect(localityCatalog.localityAuthoritativeSupplements?.refs).toEqual([
      'equatorial-guinea-ciudad-de-la-paz-2026',
    ])
    expect(capital?.name).toBe('Ciudad de la Paz')
    expect(capital?.sourceKind).toBe('authoritative-supplement')
    expect(capital?.supplementRef).toBe('equatorial-guinea-ciudad-de-la-paz-2026')
    expect(capital?.sourceRef).toBe('uk-pcgn-equatorial-guinea-2026')
    expect(capital?.sourceCoordinateText).toBe('01°35′33″N 10°49′25″E')
    expect(capital?.effectiveOn).toBe('2026-01-02')
    expect(capital?.latitude).toBeCloseTo(1.5925, 6)
    expect(capital?.longitude).toBeCloseTo(10.823611, 6)
    expect(malabo).toBeDefined()
    expect(malabo?.role).not.toBe('capital')
  })

  it('keeps the legal-capital and transition-city semantics explicit', () => {
    const entry = semanticCatalog.entries['226']

    expect(semanticCatalog.version).toBe('1.8.0')
    expect(entry.issue).toBe(459)
    expect(entry.statusSummary).toContain('2 January 2026')
    expect(entry.statusSummary).toContain('one-year transition')
    expect(entry.placeRoles.find(role => role.locality === 'Ciudad de la Paz')?.label).toBe('National capital')
    expect(entry.placeRoles.find(role => role.locality === 'Malabo')?.label).toBe('Former capital / transition city')
    expect(entry.sourceRefs).toEqual([
      'equatorial-guinea-decree-2026',
      'uk-pcgn-equatorial-guinea-2026',
    ])
  })
})
