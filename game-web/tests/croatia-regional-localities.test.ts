import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'

const payload = JSON.parse(readFileSync(
  new URL('../public/data/europe-croatia-regional-localities-v1.json', import.meta.url),
  'utf8',
))

describe('Croatia county-level regional model', () => {
  it('accounts for 20 counties plus the City of Zagreb', () => {
    expect(payload.country.geometryId).toBe('191')
    expect(payload.country.sourceCountryCode).toBe('HR')
    expect(payload.administrativeModel.unitCount).toBe(21)
    expect(payload.units).toHaveLength(21)
    expect(new Set(payload.units.map((unit: any) => unit.admin1Code)).size).toBe(21)
  })

  it('reduces 1215 retained source places to 21 source-backed representatives', () => {
    expect(payload.source.expectedCountryCandidateCount).toBe(1215)
    expect(payload.source.publishedGameplayRepresentativeCount).toBe(21)
    expect(new Set(payload.units.map((unit: any) => unit.representativeLocality.localityId)).size).toBe(21)
    const primary = payload.units.filter((unit: any) => unit.representativeLocality.selectionBasis === 'source-first-order-seat-role')
    const fallback = payload.units.filter((unit: any) => unit.representativeLocality.selectionBasis !== 'source-first-order-seat-role')
    expect(primary).toHaveLength(20)
    expect(fallback).toHaveLength(1)
  })

  it('keeps Zagreb as the unique national-capital locality under the City of Zagreb', () => {
    const city = payload.units.find((unit: any) => unit.admin1Code === '21')
    expect(city?.regionName).toBe('City of Zagreb')
    expect(city?.representativeLocality.name).toBe('Zagreb')
    expect(city?.representativeLocality.featureCode).toBe('PPLC')
    expect(city?.representativeLocality.presentationRole).toBe('national-capital-and-regional-node')
  })

  it('uses Velika Gorica only as the inside-county representative for Zagreb County', () => {
    const county = payload.units.find((unit: any) => unit.admin1Code === '20')
    expect(county?.regionName).toBe('County of Zagreb')
    expect(county?.representativeLocality.name).toBe('Velika Gorica')
    expect(county?.representativeLocality.featureCode).toBe('PPLA2')
    expect(county?.representativeLocality.selectionBasis).toBe('source-admin-fallback')
    expect(county?.representativeLocality.presentationRole).toBe('regional-representative-locality')
    const specialCase = payload.administrativeModel.specialCases.find((entry: any) => entry.admin1Code === '20')
    expect(specialCase?.type).toBe('administrative-seat-outside-source-ownership')
  })

  it('does not duplicate Zagreb into two representative locality identities', () => {
    const zagrebNamed = payload.units.filter((unit: any) => unit.representativeLocality.name === 'Zagreb')
    expect(zagrebNamed).toHaveLength(1)
    expect(zagrebNamed[0].admin1Code).toBe('21')
  })

  it('uses shared multiplayer economy rather than personal progression', () => {
    expect(payload.developmentModel.authority).toBe('shared-regional-national-multiplayer-economy')
    expect(payload.developmentModel.personalPlayerProgressionUnlock).toBe(false)
    expect(payload.developmentModel.numericThresholdsDefined).toBe(false)
  })
})
