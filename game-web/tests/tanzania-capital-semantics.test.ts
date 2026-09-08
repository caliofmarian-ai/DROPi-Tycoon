import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const roleOverrideRegistry = JSON.parse(readFileSync(
  new URL('../../04_World/Country_Catalog/COUNTRY_LOCALITY_ROLE_OVERRIDES.json', import.meta.url),
  'utf8',
)) as {
  version: string
  entries: Record<string, {
    issue: number
    currentCapital: { sourceNames?: string[]; displayName: string }
    requiredRepresentatives?: Array<{ sourceNames: string[]; displayName: string; role: string }>
  }>
}

const localityCatalog = JSON.parse(readFileSync(
  new URL('../public/data/country-representative-localities-v1.json', import.meta.url),
  'utf8',
)) as {
  version: string
  localityRoleOverrides?: { registryVersion: string; countryIds: string[] }
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
)) as {
  version: string
  sources: Record<string, { publisher: string; url: string; note: string }>
  entries: Record<string, {
    issue: number
    statusLabel: string
    statusSummary: string
    placeRoles: Array<{ locality: string; role: string; label: string }>
    sourceRefs: string[]
  }>
}

const labelFor = (locality: string) =>
  semanticCatalog.entries['834']?.placeRoles.find(role => role.locality === locality)?.label

describe('Tanzania Dodoma capital semantics #461', () => {
  it('governs Dodoma and retains Dar es Salaam without embedding coordinates', () => {
    const override = roleOverrideRegistry.entries['834']

    expect(roleOverrideRegistry.version).toBe('1.6.0')
    expect(override.issue).toBe(461)
    expect(override.currentCapital).toEqual({ sourceNames: ['Dodoma'], displayName: 'Dodoma' })
    expect(override.requiredRepresentatives).toEqual([
      { sourceNames: ['Dar es Salaam'], displayName: 'Dar es Salaam', role: 'urban' },
    ])
    expect(JSON.stringify(override)).not.toContain('longitude')
    expect(JSON.stringify(override)).not.toContain('latitude')
  })

  it('materializes Dodoma as the single structural capital and keeps Dar es Salaam source-backed', () => {
    const nodes = localityCatalog.countries['834'] ?? []
    const dodoma = nodes.find(node => node.name === 'Dodoma')
    const dar = nodes.find(node => node.name === 'Dar es Salaam')

    expect(localityCatalog.version).toBe('1.9.0')
    expect(localityCatalog.localityRoleOverrides?.registryVersion).toBe('1.6.0')
    expect(localityCatalog.localityRoleOverrides?.countryIds).toContain('834')
    expect(nodes.length).toBeLessThanOrEqual(9)
    expect(nodes.filter(node => node.role === 'capital')).toHaveLength(1)
    expect(dodoma?.role).toBe('capital')
    expect(dar).toBeDefined()
    expect(dar?.role).not.toBe('capital')
    for (const node of [dodoma, dar]) {
      expect(node).toBeDefined()
      expect(Number.isFinite(node?.longitude)).toBe(true)
      expect(Number.isFinite(node?.latitude)).toBe(true)
      expect(node?.sourceFeatureClass.length).toBeGreaterThan(0)
      expect(node?.sourceKind).toBeUndefined()
    }
  })

  it('exposes official national and commercial-capital semantics', () => {
    const entry = semanticCatalog.entries['834']
    const act = semanticCatalog.sources['tanzania-dodoma-capital-act']
    const profile = semanticCatalog.sources['tanzania-government-country-profile']

    expect(semanticCatalog.version).toBe('1.8.0')
    expect(entry.issue).toBe(461)
    expect(entry.statusLabel).toBe('National and commercial capital roles')
    expect(entry.statusSummary).toContain('Dodoma')
    expect(entry.statusSummary).toContain('Dar es Salaam')
    expect(labelFor('Dodoma')).toBe('National capital')
    expect(labelFor('Dar es Salaam')).toBe('Commercial capital / major seaport')
    expect(entry.sourceRefs).toEqual(['tanzania-dodoma-capital-act', 'tanzania-government-country-profile'])
    expect(act.publisher).toContain('Attorney General')
    expect(act.url).toBe('https://oagmis.oag.go.tz/portal/acts/52')
    expect(profile.url).toBe('https://www.un.tzembassy.go.tz/tanzania/about-tanzania')
    expect(profile.note).toContain('commercial capital and major seaport')
  })
})
