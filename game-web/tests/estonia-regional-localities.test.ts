import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'

const payload = JSON.parse(readFileSync(
  new URL('../public/data/europe-estonia-regional-localities-v1.json', import.meta.url),
  'utf8',
))

describe('Estonia 15-county territorial regional model', () => {
  it('accounts for all 15 county territories', () => {
    expect(payload.country.geometryId).toBe('233')
    expect(payload.country.sourceCountryCode).toBe('EE')
    expect(payload.administrativeModel.unitCount).toBe(15)
    expect(payload.units).toHaveLength(15)
    expect(new Set(payload.units.map((unit: any) => unit.admin1Code)).size).toBe(15)
  })

  it('reduces 218 retained source places to 15 direct representatives', () => {
    expect(payload.source.expectedCountryCandidateCount).toBe(218)
    expect(payload.source.publishedGameplayRepresentativeCount).toBe(15)
    expect(payload.units.every((unit: any) => unit.representativeLocality.selectionBasis === 'source-first-order-seat-role')).toBe(true)
  })

  it('keeps Tallinn as Estonia national-capital and Harju regional node', () => {
    const harju = payload.units.find((unit: any) => unit.admin1Code === '01')
    expect(harju.regionName).toBe('Harju County')
    expect(harju.representativeLocality.name).toBe('Tallinn')
    expect(harju.representativeLocality.featureCode).toBe('PPLC')
    expect(harju.representativeLocality.presentationRole).toBe('national-capital-and-regional-node')
    const capitals = payload.units.filter((unit: any) => unit.representativeLocality.featureCode === 'PPLC')
    expect(capitals).toHaveLength(1)
  })

  it('uses the direct county representative set', () => {
    const expected = new Map([
      ['01', 'Tallinn'], ['02', 'Kärdla'], ['03', 'Jõhvi'], ['04', 'Paide'], ['05', 'Jõgeva'],
      ['07', 'Haapsalu'], ['08', 'Rakvere'], ['11', 'Pärnu'], ['12', 'Põlva'], ['13', 'Rapla'],
      ['14', 'Kuressaare'], ['18', 'Tartu'], ['19', 'Valga'], ['20', 'Viljandi'], ['21', 'Võru'],
    ])
    for (const unit of payload.units) {
      expect(unit.representativeLocality.name).toBe(expected.get(unit.admin1Code))
      expect(['PPLC', 'PPLA']).toContain(unit.representativeLocality.featureCode)
    }
  })

  it('records counties as territorial/statistical rather than fabricated duplicate local government', () => {
    expect(payload.administrativeModel.level).toBe('first-order-territorial-statistical-region')
    expect(payload.administrativeModel.specialCases?.[0]?.type).toBe('county-territorial-layer-not-duplicate-local-government-tier')
  })

  it('uses shared multiplayer economy rather than personal progression', () => {
    expect(payload.developmentModel.authority).toBe('shared-regional-national-multiplayer-economy')
    expect(payload.developmentModel.personalPlayerProgressionUnlock).toBe(false)
    expect(payload.developmentModel.numericThresholdsDefined).toBe(false)
  })
})
