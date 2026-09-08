import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'

const payload = JSON.parse(readFileSync(
  new URL('../public/data/europe-czechia-regional-localities-v1.json', import.meta.url),
  'utf8',
))

describe('Czechia 14-region model', () => {
  it('accounts for all 14 regions', () => {
    expect(payload.country.geometryId).toBe('203')
    expect(payload.country.sourceCountryCode).toBe('CZ')
    expect(payload.administrativeModel.unitCount).toBe(14)
    expect(payload.units).toHaveLength(14)
    expect(new Set(payload.units.map((unit: any) => unit.admin1Code)).size).toBe(14)
  })

  it('reduces 2772 retained source places to 14 source-backed representatives', () => {
    expect(payload.source.expectedCountryCandidateCount).toBe(2772)
    expect(payload.source.publishedGameplayRepresentativeCount).toBe(14)
    expect(new Set(payload.units.map((unit: any) => unit.representativeLocality.localityId)).size).toBe(14)
    const primary = payload.units.filter((unit: any) => unit.representativeLocality.selectionBasis === 'source-first-order-seat-role')
    const fallback = payload.units.filter((unit: any) => unit.representativeLocality.selectionBasis !== 'source-first-order-seat-role')
    expect(primary).toHaveLength(13)
    expect(fallback).toHaveLength(1)
  })

  it('keeps Prague as the unique national-capital locality under Prague region', () => {
    const prague = payload.units.find((unit: any) => unit.admin1Code === '52')
    expect(prague?.regionName).toBe('Prague, the Capital City')
    expect(prague?.representativeLocality.name).toBe('Prague')
    expect(prague?.representativeLocality.featureCode).toBe('PPLC')
    expect(prague?.representativeLocality.presentationRole).toBe('national-capital-and-regional-node')
  })

  it('uses Kladno only as the inside-region representative for Central Bohemia', () => {
    const central = payload.units.find((unit: any) => unit.admin1Code === '88')
    expect(central?.regionName).toBe('Central Bohemian Region')
    expect(central?.representativeLocality.name).toBe('Kladno')
    expect(central?.representativeLocality.featureCode).toBe('PPL')
    expect(central?.representativeLocality.selectionBasis).toBe('source-admin-fallback')
    expect(central?.representativeLocality.presentationRole).toBe('regional-representative-locality')
    const specialCase = payload.administrativeModel.specialCases.find((entry: any) => entry.admin1Code === '88')
    expect(specialCase?.type).toBe('administrative-seat-outside-source-ownership')
  })

  it('does not duplicate Prague into two representative locality identities', () => {
    const pragueNamed = payload.units.filter((unit: any) => unit.representativeLocality.name === 'Prague')
    expect(pragueNamed).toHaveLength(1)
    expect(pragueNamed[0].admin1Code).toBe('52')
  })

  it('uses shared multiplayer economy rather than personal progression', () => {
    expect(payload.developmentModel.authority).toBe('shared-regional-national-multiplayer-economy')
    expect(payload.developmentModel.personalPlayerProgressionUnlock).toBe(false)
    expect(payload.developmentModel.numericThresholdsDefined).toBe(false)
  })
})
