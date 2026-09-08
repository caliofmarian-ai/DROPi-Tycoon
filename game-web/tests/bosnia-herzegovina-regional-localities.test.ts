import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'

const payload = JSON.parse(readFileSync(
  new URL('../public/data/europe-bosnia-herzegovina-regional-localities-v1.json', import.meta.url),
  'utf8',
))

describe('Bosnia and Herzegovina territorial regional model', () => {
  it('accounts for two Entities plus Brčko District as three governed territorial surfaces', () => {
    expect(payload.country.geometryId).toBe('070')
    expect(payload.country.sourceCountryCode).toBe('BA')
    expect(payload.administrativeModel.unitCount).toBe(3)
    expect(payload.units).toHaveLength(3)
    expect(new Set(payload.units.map((unit: any) => unit.admin1Code))).toEqual(new Set(['01', '02', 'BRC']))
  })

  it('reduces 313 retained source places to three direct source-backed representatives', () => {
    expect(payload.source.expectedCountryCandidateCount).toBe(313)
    expect(payload.source.publishedGameplayRepresentativeCount).toBe(3)
    expect(new Set(payload.units.map((unit: any) => unit.representativeLocality.localityId)).size).toBe(3)
    expect(payload.units.every((unit: any) => unit.representativeLocality.selectionBasis === 'source-first-order-seat-role')).toBe(true)
  })

  it('preserves Sarajevo as national capital inside the Federation source ownership', () => {
    const federation = payload.units.find((unit: any) => unit.admin1Code === '01')
    expect(federation?.regionName).toBe('Federation of Bosnia and Herzegovina')
    expect(federation?.representativeLocality.name).toBe('Sarajevo')
    expect(federation?.representativeLocality.featureCode).toBe('PPLC')
    expect(federation?.representativeLocality.presentationRole).toBe('national-capital-and-regional-node')
  })

  it('uses Banja Luka as the direct Republika Srpska representative', () => {
    const rs = payload.units.find((unit: any) => unit.admin1Code === '02')
    expect(rs?.regionName).toBe('Republika Srpska')
    expect(rs?.representativeLocality.name).toBe('Banja Luka')
    expect(rs?.representativeLocality.featureCode).toBe('PPLA')
  })

  it('keeps Brčko District separate and explicitly not a third Entity', () => {
    const district = payload.units.find((unit: any) => unit.admin1Code === 'BRC')
    expect(district?.regionName).toBe('Brčko District of Bosnia and Herzegovina')
    expect(district?.representativeLocality.name).toBe('Brčko')
    expect(district?.representativeLocality.featureCode).toBe('PPLA')
    const specialCase = payload.administrativeModel.specialCases.find((entry: any) => entry.admin1Code === 'BRC')
    expect(specialCase?.type).toBe('self-governing-district-not-entity')
  })

  it('uses shared multiplayer economy rather than personal progression', () => {
    expect(payload.developmentModel.authority).toBe('shared-regional-national-multiplayer-economy')
    expect(payload.developmentModel.personalPlayerProgressionUnlock).toBe(false)
    expect(payload.developmentModel.numericThresholdsDefined).toBe(false)
  })
})
