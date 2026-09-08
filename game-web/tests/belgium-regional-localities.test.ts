import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'

const payload = JSON.parse(readFileSync(
  new URL('../public/data/europe-belgium-regional-localities-v1.json', import.meta.url),
  'utf8',
))

describe('Belgium representative territorial-region model', () => {
  it('publishes the three constitutional territorial Regions', () => {
    expect(payload.country.geometryId).toBe('056')
    expect(payload.country.sourceCountryCode).toBe('BE')
    expect(payload.administrativeModel.unitCount).toBe(3)
    expect(payload.units).toHaveLength(3)
    expect(new Set(payload.units.map((unit: any) => unit.admin1Code))).toEqual(new Set(['BRU', 'VLG', 'WAL']))
  })

  it('reduces 2256 retained source places to three unique territorial representatives', () => {
    expect(payload.source.expectedCountryCandidateCount).toBe(2256)
    expect(payload.source.publishedGameplayRepresentativeCount).toBe(3)
    expect(new Set(payload.units.map((unit: any) => unit.representativeLocality.localityId)).size).toBe(3)
    expect(payload.units.filter((unit: any) => unit.representativeLocality.selectionBasis === 'source-first-order-seat-role')).toHaveLength(2)
    expect(payload.units.filter((unit: any) => unit.representativeLocality.selectionBasis === 'source-admin-fallback')).toHaveLength(1)
  })

  it('keeps Brussels as the national-capital Brussels-Capital node', () => {
    const brussels = payload.units.find((unit: any) => unit.admin1Code === 'BRU')
    expect(brussels?.regionName).toBe('Brussels-Capital Region')
    expect(brussels?.representativeLocality.name).toBe('Brussels')
    expect(brussels?.representativeLocality.featureCode).toBe('PPLC')
    expect(brussels?.representativeLocality.presentationRole).toBe('national-capital-and-regional-node')
  })

  it('uses Antwerp inside Flanders without falsely labeling it capital', () => {
    const flanders = payload.units.find((unit: any) => unit.admin1Code === 'VLG')
    expect(flanders?.regionName).toBe('Flemish Region')
    expect(flanders?.representativeLocality.name).toBe('Antwerp')
    expect(flanders?.representativeLocality.featureCode).toBe('PPL')
    expect(flanders?.representativeLocality.selectionBasis).toBe('source-admin-fallback')
    expect(flanders?.representativeLocality.presentationRole).toBe('regional-representative-locality')
    const specialCase = payload.administrativeModel.specialCases.find((entry: any) => entry.admin1Code === 'VLG')
    expect(specialCase?.type).toBe('regional-capital-outside-unit')
    expect(specialCase?.administrativeCenter).toBe('Brussels')
    expect(specialCase?.administrativeCenterUnitAdmin1Code).toBe('BRU')
  })

  it('keeps Namur as the direct Walloon regional node', () => {
    const wallonia = payload.units.find((unit: any) => unit.admin1Code === 'WAL')
    expect(wallonia?.regionName).toBe('Walloon Region')
    expect(wallonia?.representativeLocality.name).toBe('Namur')
    expect(wallonia?.representativeLocality.featureCode).toBe('PPLA')
  })

  it('uses shared multiplayer economy rather than personal progression', () => {
    expect(payload.developmentModel.authority).toBe('shared-regional-national-multiplayer-economy')
    expect(payload.developmentModel.personalPlayerProgressionUnlock).toBe(false)
    expect(payload.developmentModel.numericThresholdsDefined).toBe(false)
  })
})
