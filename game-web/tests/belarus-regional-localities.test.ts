import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'

const payload = JSON.parse(readFileSync(
  new URL('../public/data/europe-belarus-regional-localities-v1.json', import.meta.url),
  'utf8',
))

describe('Belarus representative regional locality model', () => {
  it('accounts for six voblasts plus Minsk City as seven first-order units', () => {
    expect(payload.country.geometryId).toBe('112')
    expect(payload.country.sourceCountryCode).toBe('BY')
    expect(payload.administrativeModel.unitCount).toBe(7)
    expect(payload.units).toHaveLength(7)
    expect(new Set(payload.units.map((unit: any) => unit.admin1Code)).size).toBe(7)
  })

  it('reduces 314 retained source places to seven unambiguous regional representatives', () => {
    expect(payload.source.expectedCountryCandidateCount).toBe(314)
    expect(payload.source.publishedGameplayRepresentativeCount).toBe(7)
    expect(new Set(payload.units.map((unit: any) => unit.representativeLocality.localityId)).size).toBe(7)
    expect(payload.units.filter((unit: any) => unit.representativeLocality.selectionBasis === 'source-first-order-seat-role')).toHaveLength(6)
    expect(payload.units.filter((unit: any) => unit.representativeLocality.selectionBasis === 'source-admin-fallback')).toHaveLength(1)
  })

  it('keeps Minsk City as the unique national-capital regional node', () => {
    const minskCity = payload.units.find((unit: any) => unit.admin1Code === '04')
    expect(minskCity?.regionName).toBe('Minsk City')
    expect(minskCity?.representativeLocality.name).toBe('Minsk')
    expect(minskCity?.representativeLocality.featureCode).toBe('PPLC')
    expect(minskCity?.representativeLocality.presentationRole).toBe('national-capital-and-regional-node')
  })

  it('uses Barysaw as the inside-region representative for Minsk Voblast without duplicating Minsk', () => {
    const minskRegion = payload.units.find((unit: any) => unit.admin1Code === '05')
    expect(minskRegion?.regionName).toBe('Minsk Voblast')
    expect(minskRegion?.representativeLocality.name).toBe('Barysaw')
    expect(minskRegion?.representativeLocality.featureCode).toBe('PPLA2')
    expect(minskRegion?.representativeLocality.selectionBasis).toBe('source-admin-fallback')
    const specialCase = payload.administrativeModel.specialCases.find((entry: any) => entry.admin1Code === '05')
    expect(specialCase?.type).toBe('administrative-centre-outside-unit')
    expect(specialCase?.administrativeCenter).toBe('Minsk')
    expect(specialCase?.administrativeCenterUnitAdmin1Code).toBe('04')
  })

  it('uses shared multiplayer economy rather than personal progression', () => {
    expect(payload.developmentModel.authority).toBe('shared-regional-national-multiplayer-economy')
    expect(payload.developmentModel.personalPlayerProgressionUnlock).toBe(false)
    expect(payload.developmentModel.numericThresholdsDefined).toBe(false)
  })
})
