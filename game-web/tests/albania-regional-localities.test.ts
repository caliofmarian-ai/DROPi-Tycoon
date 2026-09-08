import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'

const payload = JSON.parse(readFileSync(
  new URL('../public/data/europe-albania-regional-localities-v1.json', import.meta.url),
  'utf8',
))

describe('Albania representative regional locality model', () => {
  it('publishes one shared-world representative node for each of 12 qarqe', () => {
    expect(payload.country.geometryId).toBe('008')
    expect(payload.country.sourceCountryCode).toBe('AL')
    expect(payload.administrativeModel.nativeTermSingular).toBe('qark')
    expect(payload.administrativeModel.unitCount).toBe(12)
    expect(payload.units).toHaveLength(12)
    expect(new Set(payload.units.map((unit: any) => unit.admin1Code)).size).toBe(12)
  })

  it('reduces the retained Albania source corpus to 12 direct administrative-seat representatives', () => {
    expect(payload.source.expectedCountryCandidateCount).toBe(419)
    expect(payload.source.publishedGameplayRepresentativeCount).toBe(12)
    expect(payload.units.every((unit: any) => unit.representativeLocality.selectionBasis === 'source-first-order-seat-role')).toBe(true)
    expect(new Set(payload.units.map((unit: any) => unit.representativeLocality.localityId)).size).toBe(12)
  })

  it('uses shared multiplayer economy rather than personal progression', () => {
    expect(payload.developmentModel.authority).toBe('shared-regional-national-multiplayer-economy')
    expect(payload.developmentModel.personalPlayerProgressionUnlock).toBe(false)
    expect(payload.developmentModel.numericThresholdsDefined).toBe(false)
    for (const unit of payload.units) {
      expect(unit.economicEmergence.personalPlayerProgressionUnlock).toBe(false)
    }
  })

  it('preserves Tirana as national-capital and regional node', () => {
    const tirana = payload.units.find((unit: any) => unit.admin1Code === '50')
    expect(tirana?.regionName).toBe('Tiranë')
    expect(tirana?.representativeLocality.name).toBe('Tirana')
    expect(tirana?.representativeLocality.featureCode).toBe('PPLC')
    expect(tirana?.representativeLocality.presentationRole).toBe('national-capital-and-regional-node')
  })
})
