import { describe, expect, it } from 'vitest'
import registry from '../public/data/europe-finland-regional-localities-v1.json'
import config from '../../04_World/Country_Catalog/Continents/Europe/FINLAND_REGIONAL_CONFIG.json'

describe('Finland representative regional localities', () => {
  it('publishes all 19 official 2026 regions with stable unique source identities', () => {
    expect(registry.units).toHaveLength(19)
    expect(config.administrativeModel.unitCount).toBe(19)
    expect(new Set(registry.units.map((unit) => unit.admin1Code)).size).toBe(19)
    expect(new Set(registry.units.map((unit) => unit.representativeLocality.localityId)).size).toBe(19)
    expect(registry.source.expectedCountryCandidateCount).toBe(951)
    expect(registry.selectionModel.expectedPrimarySelections).toBe(19)
    expect(registry.selectionModel.expectedFallbackSelections).toBe(0)
  })

  it('keeps Helsinki national while crosswalking autonomous Åland to source-backed Mariehamn', () => {
    const helsinki = registry.units.find((unit) => unit.representativeLocality.name === 'Helsinki')
    const aland = registry.units.find((unit) => unit.admin1Code === '21')
    expect(helsinki?.regionName).toBe('Uusimaa')
    expect(helsinki?.representativeLocality.presentationRole).toBe('national-capital-and-regional-node')
    expect(aland?.regionName).toBe('Åland')
    expect(aland?.representativeLocality.name).toBe('Mariehamn')
    expect(aland?.representativeLocality.sourceRef).toBe('geonames:3041732')
    expect(aland?.representativeLocality.sourceCountryCode).toBe('AX')
    expect(aland?.representativeLocality.presentationRole).toBe('autonomous-region-capital-and-regional-node')
    expect(registry.units.filter((unit) => unit.representativeLocality.presentationRole === 'national-capital-and-regional-node')).toHaveLength(1)
  })

  it('keeps development controlled by shared multiplayer economy', () => {
    for (const unit of registry.units) {
      expect(unit.economicEmergence.authority).toBe('shared-regional-national-multiplayer-economy')
      expect(unit.economicEmergence.personalPlayerProgressionUnlock).toBe(false)
      expect(unit.economicEmergence.numericThresholdsDefined).toBe(false)
    }
  })
})
