import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'

const payload = JSON.parse(readFileSync(
  new URL('../public/data/europe-denmark-regional-localities-v1.json', import.meta.url),
  'utf8',
))

describe('Denmark current five-region model and 2027 transition', () => {
  it('accounts for the five regions active in 2026', () => {
    expect(payload.country.geometryId).toBe('208')
    expect(payload.country.sourceCountryCode).toBe('DK')
    expect(payload.administrativeModel.unitCount).toBe(5)
    expect(payload.administrativeModel.effectiveUntil).toBe('2026-12-31')
    expect(payload.units).toHaveLength(5)
    expect(new Set(payload.units.map((unit: any) => unit.admin1Code)).size).toBe(5)
  })

  it('reduces 507 retained source places to five direct source-backed representatives', () => {
    expect(payload.source.expectedCountryCandidateCount).toBe(507)
    expect(payload.source.publishedGameplayRepresentativeCount).toBe(5)
    const primary = payload.units.filter((unit: any) => unit.representativeLocality.selectionBasis === 'source-first-order-seat-role')
    const fallback = payload.units.filter((unit: any) => unit.representativeLocality.selectionBasis !== 'source-first-order-seat-role')
    expect(primary).toHaveLength(5)
    expect(fallback).toHaveLength(0)
  })

  it('uses the governed current representative set', () => {
    const expected = new Map([
      ['17', ['Capital Region of Denmark', 'Copenhagen', 'PPLC']],
      ['18', ['Central Denmark Region', 'Viborg', 'PPLA']],
      ['19', ['North Denmark Region', 'Aalborg', 'PPLA']],
      ['20', ['Region Zealand', 'Sorø', 'PPLA']],
      ['21', ['Region of Southern Denmark', 'Vejle', 'PPLA']],
    ])
    for (const unit of payload.units) {
      expect([unit.regionName, unit.representativeLocality.name, unit.representativeLocality.featureCode]).toEqual(expected.get(unit.admin1Code))
    }
  })

  it('keeps Copenhagen as the unique national-capital representative', () => {
    const capitals = payload.units.filter((unit: any) => unit.representativeLocality.featureCode === 'PPLC')
    expect(capitals).toHaveLength(1)
    expect(capitals[0].admin1Code).toBe('17')
    expect(capitals[0].representativeLocality.name).toBe('Copenhagen')
    expect(capitals[0].representativeLocality.presentationRole).toBe('national-capital-and-regional-node')
  })

  it('records East Denmark as a future transition instead of a sixth live 2026 region', () => {
    const transition = payload.administrativeModel.futureTransitions?.[0]
    expect(transition?.type).toBe('legislated-region-merger')
    expect(transition?.effectiveFrom).toBe('2027-01-01')
    expect(transition?.sourceAdmin1Codes).toEqual(['17', '20'])
    expect(transition?.futureCanonicalName).toBe('Region Østdanmark')
    expect(transition?.status).toBe('future-not-yet-active')
    expect(payload.units.some((unit: any) => unit.regionName === 'Region Østdanmark')).toBe(false)
  })

  it('uses shared multiplayer economy rather than personal progression', () => {
    expect(payload.developmentModel.authority).toBe('shared-regional-national-multiplayer-economy')
    expect(payload.developmentModel.personalPlayerProgressionUnlock).toBe(false)
    expect(payload.developmentModel.numericThresholdsDefined).toBe(false)
  })
})
