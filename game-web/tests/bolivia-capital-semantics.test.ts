import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const roles = JSON.parse(readFileSync(new URL('../../04_World/Country_Catalog/COUNTRY_LOCALITY_ROLE_OVERRIDES.json', import.meta.url), 'utf8'))
const localities = JSON.parse(readFileSync(new URL('../public/data/country-representative-localities-v1.json', import.meta.url), 'utf8'))
const semantics = JSON.parse(readFileSync(new URL('../public/data/country-semantic-metadata-v1.json', import.meta.url), 'utf8'))

const node = (name: string) => localities.countries['068']?.find((value: any) => value.name === name)
const label = (name: string) => semantics.entries['068']?.placeRoles.find((value: any) => value.locality === name)?.label

describe('Bolivia capital semantics #472', () => {
  it('uses a source-only role override with no hardcoded coordinates', () => {
    expect(roles.version).toBe('1.6.0')
    expect(roles.entries['068'].issue).toBe(472)
    expect(roles.entries['068'].currentCapital).toEqual({ sourceNames: ['Sucre'], displayName: 'Sucre' })
    expect(JSON.stringify(roles.entries['068'])).not.toContain('longitude')
    expect(JSON.stringify(roles.entries['068'])).not.toContain('latitude')
  })

  it('materializes Sucre as the structural capital and preserves La Paz from Natural Earth', () => {
    const nodes = localities.countries['068'] ?? []
    expect(localities.version).toBe('1.9.0')
    expect(nodes.filter((value: any) => value.role === 'capital')).toHaveLength(1)
    expect(nodes.find((value: any) => value.role === 'capital')?.name).toBe('Sucre')
    expect(node('La Paz')).toBeDefined()
    expect(node('La Paz')?.role).not.toBe('capital')
    expect(node('Sucre')?.sourceKind).toBeUndefined()
    expect(node('La Paz')?.sourceKind).toBeUndefined()
    expect(nodes.length).toBeLessThanOrEqual(9)
  })

  it('exposes constitutional-capital and government-seat roles from Bolivian institutional sources', () => {
    const entry = semantics.entries['068']
    expect(semantics.version).toBe('1.9.0')
    expect(entry.issue).toBe(472)
    expect(label('Sucre')).toBe('Constitutional / national capital')
    expect(label('La Paz')).toBe('Government seat / executive & legislative centre')
    expect(entry.statusSummary).toContain('Sucre')
    expect(entry.statusSummary).toContain('La Paz')
    expect(entry.sourceRefs).toContain('bolivia-oep-constitution')
    expect(entry.sourceRefs).toContain('bolivia-legislative-government-seat')
    for (const ref of entry.sourceRefs) expect(semantics.sources[ref]?.url).toMatch(/^https:\/\//)
  })
})
