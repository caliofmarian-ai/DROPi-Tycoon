import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'

const payload = JSON.parse(readFileSync(
  new URL('../public/data/europe-bulgaria-regional-localities-v1.json', import.meta.url),
  'utf8',
))

describe('Bulgaria 28-district regional model', () => {
  it('accounts for all 28 administrative districts', () => {
    expect(payload.country.geometryId).toBe('100')
    expect(payload.country.sourceCountryCode).toBe('BG')
    expect(payload.administrativeModel.unitCount).toBe(28)
    expect(payload.units).toHaveLength(28)
    expect(new Set(payload.units.map((unit: any) => unit.admin1Code)).size).toBe(28)
  })

  it('reduces 333 retained source places to 28 source-backed gameplay representatives', () => {
    expect(payload.source.expectedCountryCandidateCount).toBe(333)
    expect(payload.source.publishedGameplayRepresentativeCount).toBe(28)
    expect(new Set(payload.units.map((unit: any) => unit.representativeLocality.localityId)).size).toBe(28)
    const primary = payload.units.filter((unit: any) => unit.representativeLocality.selectionBasis === 'source-first-order-seat-role')
    const fallback = payload.units.filter((unit: any) => unit.representativeLocality.selectionBasis !== 'source-first-order-seat-role')
    expect(primary).toHaveLength(27)
    expect(fallback).toHaveLength(1)
  })

  it('keeps Sofia as the unique national-capital locality under Sofia-Capital', () => {
    const capital = payload.units.find((unit: any) => unit.admin1Code === '42')
    expect(capital?.regionName).toBe('Sofia-Capital')
    expect(capital?.representativeLocality.name).toBe('Sofia')
    expect(capital?.representativeLocality.featureCode).toBe('PPLC')
    expect(capital?.representativeLocality.presentationRole).toBe('national-capital-and-regional-node')
  })

  it('uses Samokov only as the inside-district representative for Sofia district', () => {
    const sofiaDistrict = payload.units.find((unit: any) => unit.admin1Code === '58')
    expect(sofiaDistrict?.regionName).toBe('Sofia')
    expect(sofiaDistrict?.representativeLocality.name).toBe('Samokov')
    expect(sofiaDistrict?.representativeLocality.featureCode).toBe('PPL')
    expect(sofiaDistrict?.representativeLocality.selectionBasis).toBe('source-admin-fallback')
    expect(sofiaDistrict?.representativeLocality.presentationRole).toBe('regional-representative-locality')

    const specialCase = payload.administrativeModel.specialCases.find((entry: any) => entry.admin1Code === '58')
    expect(specialCase?.type).toBe('administrative-centre-outside-source-ownership')
  })

  it('does not duplicate Sofia into two representative locality identities', () => {
    const sofiaNamed = payload.units.filter((unit: any) => unit.representativeLocality.name === 'Sofia')
    expect(sofiaNamed).toHaveLength(1)
    expect(sofiaNamed[0].admin1Code).toBe('42')
  })

  it('uses shared multiplayer economy rather than personal progression', () => {
    expect(payload.developmentModel.authority).toBe('shared-regional-national-multiplayer-economy')
    expect(payload.developmentModel.personalPlayerProgressionUnlock).toBe(false)
    expect(payload.developmentModel.numericThresholdsDefined).toBe(false)
  })
})
