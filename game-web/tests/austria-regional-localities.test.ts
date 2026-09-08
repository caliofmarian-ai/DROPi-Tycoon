import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'

const payload = JSON.parse(readFileSync(
  new URL('../public/data/europe-austria-regional-localities-v1.json', import.meta.url),
  'utf8',
))

describe('Austria representative regional locality model', () => {
  it('publishes one shared-world representative node for each of nine Bundesländer', () => {
    expect(payload.country.geometryId).toBe('040')
    expect(payload.country.sourceCountryCode).toBe('AT')
    expect(payload.administrativeModel.nativeTermSingular).toBe('Bundesland')
    expect(payload.administrativeModel.unitCount).toBe(9)
    expect(payload.units).toHaveLength(9)
    expect(new Set(payload.units.map((unit: any) => unit.admin1Code)).size).toBe(9)
  })

  it('reduces the retained Austria source corpus to nine direct administrative-seat representatives', () => {
    expect(payload.source.expectedCountryCandidateCount).toBe(3045)
    expect(payload.source.publishedGameplayRepresentativeCount).toBe(9)
    expect(payload.units.every((unit: any) => unit.representativeLocality.selectionBasis === 'source-first-order-seat-role')).toBe(true)
    expect(new Set(payload.units.map((unit: any) => unit.representativeLocality.localityId)).size).toBe(9)
  })

  it('uses shared multiplayer economy rather than personal progression', () => {
    expect(payload.developmentModel.authority).toBe('shared-regional-national-multiplayer-economy')
    expect(payload.developmentModel.personalPlayerProgressionUnlock).toBe(false)
    expect(payload.developmentModel.numericThresholdsDefined).toBe(false)
    for (const unit of payload.units) {
      expect(unit.economicEmergence.personalPlayerProgressionUnlock).toBe(false)
    }
  })

  it('preserves Vienna as national-capital and regional node', () => {
    const vienna = payload.units.find((unit: any) => unit.admin1Code === '09')
    expect(vienna?.regionName).toBe('Wien')
    expect(vienna?.representativeLocality.name).toBe('Vienna')
    expect(vienna?.representativeLocality.featureCode).toBe('PPLC')
    expect(vienna?.representativeLocality.presentationRole).toBe('national-capital-and-regional-node')
  })

  it('keeps the nine audited state-capital representatives source-backed', () => {
    const expected = new Map([
      ['01', 'Eisenstadt'],
      ['02', 'Klagenfurt am Wörthersee'],
      ['03', 'Sankt Pölten'],
      ['04', 'Linz'],
      ['05', 'Salzburg'],
      ['06', 'Graz'],
      ['07', 'Innsbruck'],
      ['08', 'Bregenz'],
      ['09', 'Vienna'],
    ])
    for (const unit of payload.units) {
      expect(unit.representativeLocality.name).toBe(expected.get(unit.admin1Code))
      expect(unit.representativeLocality.sourceRef.startsWith('geonames:')).toBe(true)
    }
  })
})
