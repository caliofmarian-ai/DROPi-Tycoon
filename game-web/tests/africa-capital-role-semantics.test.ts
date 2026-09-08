import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const roles = JSON.parse(readFileSync(new URL('../../04_World/Country_Catalog/COUNTRY_LOCALITY_ROLE_OVERRIDES.json', import.meta.url), 'utf8'))
const localities = JSON.parse(readFileSync(new URL('../public/data/country-representative-localities-v1.json', import.meta.url), 'utf8'))
const semantics = JSON.parse(readFileSync(new URL('../public/data/country-semantic-metadata-v1.json', import.meta.url), 'utf8'))

const node = (cid: string, name: string) => localities.countries[cid]?.find((value: any) => value.name === name)
const label = (cid: string, name: string) => semantics.entries[cid]?.placeRoles.find((value: any) => value.locality === name)?.label

describe('Africa capital-role semantics #456 #457 #458', () => {
  it('uses source-only role overrides with no hardcoded coordinates', () => {
    expect(roles.version).toBe('1.6.0')
    for (const cid of ['204', '108', '384']) {
      expect(JSON.stringify(roles.entries[cid])).not.toContain('longitude')
      expect(JSON.stringify(roles.entries[cid])).not.toContain('latitude')
    }
  })

  it('materializes the current political/national capitals and preserves prior major cities', () => {
    expect(localities.version).toBe('1.9.0')
    const cases = [
      ['204', 'Porto-Novo', 'Cotonou'],
      ['108', 'Gitega', 'Bujumbura'],
      ['384', 'Yamoussoukro', 'Abidjan'],
    ] as const
    for (const [cid, capital, secondary] of cases) {
      const nodes = localities.countries[cid] ?? []
      expect(nodes.filter((value: any) => value.role === 'capital')).toHaveLength(1)
      expect(nodes.find((value: any) => value.role === 'capital')?.name).toBe(capital)
      expect(node(cid, secondary)).toBeDefined()
      expect(node(cid, secondary)?.role).not.toBe('capital')
      expect(node(cid, capital)?.sourceKind).toBeUndefined()
      expect(node(cid, secondary)?.sourceKind).toBeUndefined()
      expect(nodes.length).toBeLessThanOrEqual(9)
    }
  })

  it('exposes player-facing multi-role capital semantics from official sources', () => {
    expect(semantics.version).toBe('1.8.0')
    expect(label('204', 'Porto-Novo')).toBe('National / political capital')
    expect(label('204', 'Cotonou')).toBe('Economic capital / government centre')
    expect(label('108', 'Gitega')).toBe('Political capital')
    expect(label('108', 'Bujumbura')).toBe('Economic capital')
    expect(label('384', 'Yamoussoukro')).toBe('Political capital')
    expect(label('384', 'Abidjan')).toBe('Economic capital / major metropolitan centre')
    for (const cid of ['204', '108', '384']) {
      expect(semantics.entries[cid].sourceRefs.length).toBeGreaterThan(0)
      for (const ref of semantics.entries[cid].sourceRefs) expect(semantics.sources[ref]?.url).toMatch(/^https:\/\//)
    }
  })
})
