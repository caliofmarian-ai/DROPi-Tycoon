import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'

const payload = JSON.parse(readFileSync(
  new URL('../public/data/europe-romania-regional-localities-v1.json', import.meta.url),
  'utf8',
))

describe('Romania representative regional locality model', () => {
  it('publishes 41 counties plus Bucharest as 42 first-order shared-world nodes', () => {
    expect(payload.country.geometryId).toBe('642')
    expect(payload.administrativeModel.normalCountyCount).toBe(41)
    expect(payload.administrativeModel.countyEquivalentCount).toBe(1)
    expect(payload.administrativeModel.unitCount).toBe(42)
    expect(payload.units).toHaveLength(42)
    expect(new Set(payload.units.map((unit: any) => unit.admin1Code)).size).toBe(42)
  })

  it('reduces the retained source corpus to one deterministic representative per region', () => {
    expect(payload.source.retainedRomaniaCandidateCount).toBe(7149)
    expect(payload.source.publishedGameplayRepresentativeCount).toBe(42)
    expect(new Set(payload.units.map((unit: any) => unit.representativeLocality.localityId)).size).toBe(42)
    expect(payload.units.filter((unit: any) => unit.representativeLocality.selectionBasis === 'source-first-order-seat-role')).toHaveLength(40)
    expect(payload.units.filter((unit: any) => unit.representativeLocality.selectionBasis === 'fallback-largest-secondary-admin-place')).toHaveLength(2)
  })

  it('makes locality emergence a shared multiplayer-economic concern, never personal progression', () => {
    expect(payload.developmentModel.authority).toBe('shared-regional-national-multiplayer-economy')
    expect(payload.developmentModel.personalPlayerProgressionUnlock).toBe(false)
    expect(payload.developmentModel.numericThresholdsDefined).toBe(false)
    for (const unit of payload.units) {
      expect(unit.economicEmergence.personalPlayerProgressionUnlock).toBe(false)
      expect(unit.economicEmergence.numericThresholdsDefined).toBe(false)
    }
  })

  it('preserves Bucharest as the national-capital regional node', () => {
    const bucharest = payload.units.find((unit: any) => unit.admin1Code === '10')
    expect(bucharest?.unitType).toBe('capital-municipality-county-equivalent')
    expect(bucharest?.representativeLocality.name).toBe('Bucharest')
    expect(bucharest?.representativeLocality.featureCode).toBe('PPLC')
    expect(bucharest?.representativeLocality.presentationRole).toBe('national-capital-and-regional-node')
  })
})
