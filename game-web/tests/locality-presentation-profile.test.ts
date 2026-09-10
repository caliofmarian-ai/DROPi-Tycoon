import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  LOCALITY_ANDROID_PRESENTATION_BUDGET,
  LOCALITY_PRESENTATION_BASELINE,
  isLocalityLabelVisibleAtLevel,
  localityLabelScaleCompensation,
  selectLocalityScreenLabels,
  type LocalityPresentationProfile,
  type LocalityScreenLabelCandidate,
} from '../src/world/localityPresentationProfile'
import {
  PLAYABLE_CITY_DETAIL_MIN_ZOOM,
  PLAYABLE_CITY_DETAIL_SECTOR_LIMIT,
  PLAYABLE_CITY_DETAIL_SECTOR_SIZE,
} from '../src/world/playableCityScale'
import {
  BRAILA_LABEL_MAX_SCREEN_COMPENSATION,
  BRAILA_LABEL_RULES,
  BRAILA_PRESENTATION_PROFILE,
} from '../src/world/brailaLabelPresentation'
import {
  CITY_DETAIL_MATERIALIZE_PER_FRAME,
  CITY_DETAIL_MIN_ZOOM,
  CITY_DETAIL_TILE_LIMIT,
  CITY_DETAIL_TILE_SIZE,
} from '../src/world/cityGroundDetail'

describe('reusable locality semantic presentation profile', () => {
  it('defines locality-neutral label visibility across city, district, area and hero semantics', () => {
    expect(isLocalityLabelVisibleAtLevel(LOCALITY_PRESENTATION_BASELINE, 'district', 'City')).toBe(true)
    expect(isLocalityLabelVisibleAtLevel(LOCALITY_PRESENTATION_BASELINE, 'district', 'Hero')).toBe(false)
    expect(isLocalityLabelVisibleAtLevel(LOCALITY_PRESENTATION_BASELINE, 'street', 'District')).toBe(true)
    expect(isLocalityLabelVisibleAtLevel(LOCALITY_PRESENTATION_BASELINE, 'landmark', 'Area')).toBe(true)
    expect(isLocalityLabelVisibleAtLevel(LOCALITY_PRESENTATION_BASELINE, 'interaction', 'Area')).toBe(false)
    expect(isLocalityLabelVisibleAtLevel(LOCALITY_PRESENTATION_BASELINE, 'interaction', 'Hero')).toBe(true)
  })

  it('selects screen labels by supplied profile priority without locality identity or topology', () => {
    const viewport = { left: 0, top: 0, width: 900, height: 500 }
    const samePlace = { left: 410, top: 230, right: 490, bottom: 250 }
    const candidates: LocalityScreenLabelCandidate[] = [
      { id: 'street-label', role: 'street', box: samePlace },
      { id: 'storefront-label', role: 'storefront', box: samePlace },
      { id: 'interaction-label', role: 'interaction', box: samePlace },
    ]
    expect(selectLocalityScreenLabels(LOCALITY_PRESENTATION_BASELINE, candidates, 'Hero', viewport))
      .toEqual(['interaction-label'])

    const locallyTunedProfile: LocalityPresentationProfile = {
      ...LOCALITY_PRESENTATION_BASELINE,
      labelRules: {
        ...LOCALITY_PRESENTATION_BASELINE.labelRules,
        landmark: { ...LOCALITY_PRESENTATION_BASELINE.labelRules.landmark, priority: 60 },
        street: { ...LOCALITY_PRESENTATION_BASELINE.labelRules.street, priority: 115 },
      },
    }
    const areaCandidates: LocalityScreenLabelCandidate[] = [
      { id: 'landmark-label', role: 'landmark', box: samePlace },
      { id: 'street-label', role: 'street', box: samePlace },
    ]
    expect(selectLocalityScreenLabels(locallyTunedProfile, areaCandidates, 'Area', viewport))
      .toEqual(['street-label'])
  })

  it('keeps fixed-screen compensation profile-driven and bounded', () => {
    expect(localityLabelScaleCompensation(LOCALITY_PRESENTATION_BASELINE, 'street', 0.2)).toBe(5)
    expect(localityLabelScaleCompensation(LOCALITY_PRESENTATION_BASELINE, 'street', 4)).toBe(
      LOCALITY_PRESENTATION_BASELINE.minScreenCompensation,
    )
    expect(localityLabelScaleCompensation(LOCALITY_PRESENTATION_BASELINE, 'street', Number.NaN)).toBe(1)
  })

  it('consumes the existing playable-city Android detail authority instead of duplicating scale policy', () => {
    expect(LOCALITY_ANDROID_PRESENTATION_BUDGET).toEqual({
      detailSectorSize: PLAYABLE_CITY_DETAIL_SECTOR_SIZE,
      maxResidentDetailSectors: PLAYABLE_CITY_DETAIL_SECTOR_LIMIT,
      minDetailZoom: PLAYABLE_CITY_DETAIL_MIN_ZOOM,
      maxMaterializedDetailSectorsPerFrame: 1,
    })
    expect(CITY_DETAIL_TILE_SIZE).toBe(LOCALITY_ANDROID_PRESENTATION_BUDGET.detailSectorSize)
    expect(CITY_DETAIL_TILE_LIMIT).toBe(LOCALITY_ANDROID_PRESENTATION_BUDGET.maxResidentDetailSectors)
    expect(CITY_DETAIL_MIN_ZOOM).toBe(LOCALITY_ANDROID_PRESENTATION_BUDGET.minDetailZoom)
    expect(CITY_DETAIL_MATERIALIZE_PER_FRAME).toBe(1)
    expect(CITY_DETAIL_TILE_LIMIT * CITY_DETAIL_TILE_SIZE ** 2 * 4).toBeLessThanOrEqual(27 * 1024 * 1024)
  })

  it('keeps Brăila as a compatibility/calibration adapter over the generic profile', () => {
    expect(BRAILA_PRESENTATION_PROFILE).toBe(LOCALITY_PRESENTATION_BASELINE)
    expect(BRAILA_LABEL_RULES).toBe(LOCALITY_PRESENTATION_BASELINE.labelRules)
    expect(BRAILA_LABEL_MAX_SCREEN_COMPENSATION).toBe(LOCALITY_PRESENTATION_BASELINE.maxScreenCompensation)
  })

  it('keeps the generic presentation authority free of locality-specific naming and routing authority', () => {
    const source = readFileSync(new URL('../src/world/localityPresentationProfile.ts', import.meta.url), 'utf8')
    expect(source).not.toMatch(/Brăila|Braila|Cedar City/i)
    expect(source).not.toMatch(/adjacentPlayableCityZoneIds|classifyPlayableCityRouteDistance|playableCityTravelSeconds/)
  })
})
