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

const placeLabel = (locality: string) => semanticCatalog.entries['710']?.placeRoles.find(role => role.locality === locality)?.label

describe('South Africa three-capital semantics #460', () => {
  it('governs Pretoria and retains all three other required national cities without coordinates in the override', () => {
    const override = roleOverrideRegistry.entries['710']

    expect(roleOverrideRegistry.version).toBe('1.6.0')
    expect(override.issue).toBe(460)
    expect(override.currentCapital).toEqual({
      sourceNames: ['Pretoria'],
      displayName: 'Pretoria',
    })
    expect(override.requiredRepresentatives).toEqual([
      { sourceNames: ['Cape Town'], displayName: 'Cape Town', role: 'urban' },
      { sourceNames: ['Bloemfontein'], displayName: 'Bloemfontein', role: 'urban' },
      { sourceNames: ['Johannesburg'], displayName: 'Johannesburg', role: 'urban' },
    ])
    expect(JSON.stringify(override)).not.toContain('longitude')
    expect(JSON.stringify(override)).not.toContain('latitude')
  })

  it('materializes Pretoria as the structural capital and keeps the other three source-backed within the sparse budget', () => {
    const nodes = localityCatalog.countries['710'] ?? []
    const byName = Object.fromEntries(nodes.map(node => [node.name, node]))

    expect(localityCatalog.version).toBe('1.9.0')
    expect(localityCatalog.localityRoleOverrides?.registryVersion).toBe('1.6.0')
    expect(localityCatalog.localityRoleOverrides?.countryIds).toContain('710')
    expect(nodes.length).toBeLessThanOrEqual(9)
    expect(nodes.filter(node => node.role === 'capital')).toHaveLength(1)
    expect(nodes.find(node => node.role === 'capital')?.name).toBe('Pretoria')

    for (const locality of ['Pretoria', 'Cape Town', 'Bloemfontein', 'Johannesburg']) {
      const node = byName[locality]
      expect(node, `${locality} must remain in South Africa's sparse node set`).toBeDefined()
      expect(Number.isFinite(node.longitude)).toBe(true)
      expect(Number.isFinite(node.latitude)).toBe(true)
      expect(node.sourceFeatureClass.length).toBeGreaterThan(0)
      expect(node.sourceKind).toBeUndefined()
    }

    expect(byName['Cape Town'].role).not.toBe('capital')
    expect(byName.Bloemfontein.role).not.toBe('capital')
    expect(byName.Johannesburg.role).not.toBe('capital')
  })

  it('exposes the three official capital functions and Johannesburg Constitutional Court role', () => {
    const entry = semanticCatalog.entries['710']
    const source = semanticCatalog.sources['south-africa-government-capitals']

    expect(semanticCatalog.version).toBe('1.8.0')
    expect(entry.issue).toBe(460)
    expect(entry.statusLabel).toBe('Three national capital functions')
    expect(entry.statusSummary).toContain('Pretoria is the administrative capital')
    expect(entry.statusSummary).toContain('Cape Town is the legislative capital')
    expect(entry.statusSummary).toContain('Bloemfontein is the judicial capital')
    expect(entry.statusSummary).toContain('Constitutional Court')
    expect(placeLabel('Pretoria')).toBe('Administrative capital')
    expect(placeLabel('Cape Town')).toBe('Legislative capital / Parliament')
    expect(placeLabel('Bloemfontein')).toBe('Judicial capital / Supreme Court of Appeal')
    expect(placeLabel('Johannesburg')).toBe('Major city / Constitutional Court')
    expect(entry.sourceRefs).toEqual(['south-africa-government-capitals'])
    expect(source.publisher).toBe('South African Government')
    expect(source.url).toBe('https://www.gov.za/about-sa/south-africa-glance')
    expect(source.note).toContain('Pretoria')
    expect(source.note).toContain('Cape Town')
    expect(source.note).toContain('Bloemfontein')
    expect(source.note).toContain('Constitutional Court')
  })
})
