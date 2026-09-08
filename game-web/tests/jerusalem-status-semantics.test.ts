import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const roles = JSON.parse(readFileSync(new URL('../../04_World/Country_Catalog/COUNTRY_LOCALITY_ROLE_OVERRIDES.json', import.meta.url), 'utf8'))
const localities = JSON.parse(readFileSync(new URL('../public/data/country-representative-localities-v1.json', import.meta.url), 'utf8'))
const semantics = JSON.parse(readFileSync(new URL('../public/data/country-semantic-metadata-v1.json', import.meta.url), 'utf8'))

const node = (cid: string, name: string) => localities.countries[cid]?.find((value: any) => value.name === name)
const label = (cid: string, name: string) => semantics.entries[cid]?.placeRoles.find((value: any) => value.locality === name)?.label

describe('Jerusalem status semantics #467 #468', () => {
  it('uses source-only locality overrides without hardcoded coordinates', () => {
    expect(roles.version).toBe('1.6.0')
    for (const cid of ['376', '275']) {
      expect(JSON.stringify(roles.entries[cid])).not.toContain('longitude')
      expect(JSON.stringify(roles.entries[cid])).not.toContain('latitude')
    }
  })

  it('removes Tel Aviv and Gaza from structural capital roles using pinned-source localities', () => {
    expect(localities.version).toBe('1.9.0')
    const israel = localities.countries['376'] ?? []
    const palestine = localities.countries['275'] ?? []
    expect(israel.filter((value: any) => value.role === 'capital')).toHaveLength(1)
    expect(israel.find((value: any) => value.role === 'capital')?.name).toBe('Jerusalem')
    expect(node('376', 'Tel Aviv-Yafo')).toBeDefined()
    expect(node('376', 'Tel Aviv-Yafo')?.role).not.toBe('capital')
    expect(node('376', 'Jerusalem')?.sourceKind).toBeUndefined()
    expect(palestine.filter((value: any) => value.role === 'capital')).toHaveLength(1)
    expect(palestine.find((value: any) => value.role === 'capital')?.name).toBe('Ramallah')
    expect(node('275', 'Gaza')).toBeDefined()
    expect(node('275', 'Gaza')?.role).not.toBe('capital')
    expect(node('275', 'Ramallah')?.sourceKind).toBeUndefined()
    expect(israel.length).toBeLessThanOrEqual(9)
    expect(palestine.length).toBeLessThanOrEqual(9)
  })

  it('keeps Jerusalem final-status semantics explicit and symmetric', () => {
    expect(semantics.version).toBe('1.8.0')
    expect(semantics.entries['376'].territoryStatus.finalStatusResolved).toBe(false)
    expect(semantics.entries['275'].territoryStatus.finalStatusResolved).toBe(false)
    expect(label('376', 'Jerusalem')).toBe('Capital under Israeli law / seat of state institutions')
    expect(label('376', 'Tel Aviv-Yafo')).toBe('Major economic / metropolitan centre')
    expect(label('275', 'East Jerusalem')).toBe('Capital designated by State of Palestine / status sensitive')
    expect(label('275', 'Ramallah')).toBe('Temporary government / administrative seat')
    expect(label('275', 'Gaza')).toBe('Major urban centre')
    expect(node('275', 'East Jerusalem')).toBeUndefined()
    expect(semantics.entries['275'].placeRoles.find((value: any) => value.locality === 'East Jerusalem')?.note).toContain('does not fabricate')
  })

  it('uses institutional and UN sources rather than DROPi sovereignty assertions', () => {
    const israelRefs = semantics.entries['376'].sourceRefs
    const palestineRefs = semantics.entries['275'].sourceRefs
    expect(israelRefs).toContain('israel-knesset-jerusalem-basic-law')
    expect(israelRefs).toContain('un-sg-jerusalem-two-state-2026')
    expect(palestineRefs).toContain('un-palestine-undata-capital')
    expect(palestineRefs).toContain('palestine-basic-law-jerusalem')
    expect(palestineRefs).toContain('palestine-cabinet-headquarters')
    expect(palestineRefs).toContain('un-sg-jerusalem-two-state-2026')
    for (const ref of new Set([...israelRefs, ...palestineRefs])) expect(semantics.sources[ref]?.url.startsWith('https://')).toBe(true)
    expect(semantics.entries['376'].statusSummary).toContain('without asserting')
    expect(semantics.entries['275'].statusSummary).toContain('without asserting')
  })
})
