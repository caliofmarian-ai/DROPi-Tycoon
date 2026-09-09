import { describe, expect, it } from 'vitest'
import registry from '../public/data/europe-iceland-regional-localities-v1.json'
import topology from '../public/data/world-atlas-countries-110m.json'
import config from '../../04_World/Country_Catalog/Continents/Europe/ICELAND_REGIONAL_CONFIG.json'

type TopologyGeometry = {
  id?: string | number
  type: string
  arcs: unknown[]
}

type TopologyPayload = {
  objects: {
    countries: {
      geometries: TopologyGeometry[]
    }
  }
}

describe('Iceland representative statistical/economic regional localities', () => {
  it('publishes one sparse representative for each of the eight Country LOD surfaces', () => {
    expect(config.administrativeModel.unitCount).toBe(8)
    expect(registry.units).toHaveLength(8)
    expect(new Set(registry.units.map((unit) => unit.admin1Code)).size).toBe(8)
    expect(new Set(registry.units.map((unit) => unit.regionSourceRef)).size).toBe(8)
    expect(new Set(registry.units.map((unit) => unit.representativeLocality.localityId)).size).toBe(8)
    expect(registry.source.candidateCountryCodes).toEqual(['IS'])
    expect(registry.source.expectedCountryCandidateCount).toBe(50)
    expect(registry.source.publishedGameplayRepresentativeCount).toBe(8)
    expect(registry.selectionModel.expectedPrimarySelections).toBe(8)
    expect(registry.selectionModel.expectedFallbackSelections).toBe(0)
    expect(registry.selectionModel.highDensityGameplayImport).toBe(false)
    expect(registry.selectionModel.hardcodedCoordinates).toBe(false)
  })

  it('keeps Reykjavík as Iceland’s unique national-capital representative', () => {
    const capital = registry.units.find((unit) => unit.admin1Code === '39')
    expect(capital?.regionName).toBe('Capital Region')
    expect(capital?.representativeLocality.name).toBe('Reykjavík')
    expect(capital?.representativeLocality.sourceRef).toBe('geonames:3413829')
    expect(capital?.representativeLocality.sourceCountryCode).toBe('IS')
    expect(capital?.representativeLocality.sourceAdmin1Code).toBe('39')
    expect(capital?.representativeLocality.featureCode).toBe('PPLC')
    expect(capital?.representativeLocality.presentationRole).toBe('national-capital-and-regional-node')
    expect(registry.units.filter((unit) => unit.representativeLocality.presentationRole === 'national-capital-and-regional-node')).toHaveLength(1)
  })

  it('uses the retained GeoNames primary locality for every selected surface', () => {
    const expected = {
      '39': ['Capital Region', 'Capital Region', 'geonames:3426182', 'Reykjavík', 'geonames:3413829', 'PPLC'],
      '43': ['Southwest', 'Southern Peninsula', 'geonames:3426183', 'Keflavík', 'geonames:3415496', 'PPLA'],
      '45': ['West', 'West', 'geonames:3426184', 'Borgarnes', 'geonames:3418076', 'PPLA'],
      '44': ['Westfjords', 'Westfjords', 'geonames:3426185', 'Ísafjörður', 'geonames:3415667', 'PPLA'],
      '41': ['Northwest', 'Northwest', 'geonames:3337403', 'Sauðárkrókur', 'geonames:2627309', 'PPLA'],
      '40': ['Northeast', 'Northeast', 'geonames:3337404', 'Akureyri', 'geonames:2633274', 'PPLA'],
      '38': ['East', 'East', 'geonames:3337405', 'Egilsstaðir', 'geonames:2632132', 'PPLA'],
      '42': ['South', 'South', 'geonames:3337406', 'Selfoss', 'geonames:3413604', 'PPLA'],
    } as const

    for (const [code, [regionName, sourceName, regionSourceRef, localityName, localitySourceRef, featureCode]] of Object.entries(expected)) {
      const unit = registry.units.find((candidate) => candidate.admin1Code === code)
      expect(unit?.regionName).toBe(regionName)
      expect(unit?.regionSourceName).toBe(sourceName)
      expect(unit?.regionSourceRef).toBe(regionSourceRef)
      expect(unit?.representativeLocality.name).toBe(localityName)
      expect(unit?.representativeLocality.sourceRef).toBe(localitySourceRef)
      expect(unit?.representativeLocality.sourceAdmin1Code).toBe(code)
      expect(unit?.representativeLocality.sourceScope).toBe('admin1')
      expect(unit?.representativeLocality.featureCode).toBe(featureCode)
      expect(unit?.representativeLocality.selectionBasis).toBe('source-first-order-seat-role')
    }
  })

  it('preserves the Southwest current-name crosswalk without changing retained source identity', () => {
    const southwest = registry.units.find((unit) => unit.admin1Code === '43')
    expect(southwest?.regionName).toBe('Southwest')
    expect(southwest?.regionSourceName).toBe('Southern Peninsula')
    expect(southwest?.regionSourceRef).toBe('geonames:3426183')

    const specialCases = config.administrativeModel.specialCases as Array<Record<string, unknown>>
    const crosswalk = specialCases.find((entry) => entry.type === 'current-name-crosswalk')
    expect(crosswalk?.admin1Code).toBe('43')
    expect(crosswalk?.canonicalName).toBe('Southwest')
    expect(crosswalk?.sourceName).toBe('Southern Peninsula')
  })

  it('keeps Iceland government authority at state and municipality levels', () => {
    expect(config.administrativeModel.level).toBe('statistical-regional-lod-over-municipal-local-government')
    expect(config.administrativeModel.englishTerm).toContain('municipality is the local-government unit')

    const specialCases = config.administrativeModel.specialCases as Array<Record<string, unknown>>
    const governmentLevels = specialCases.find((entry) => entry.type === 'two-government-levels-state-and-municipalities')
    expect(governmentLevels).toBeDefined()

    const timing = specialCases.find((entry) => entry.type === 'municipality-count-2026-timing')
    expect(timing?.statisticsIcelandDate).toBe('2026-01-01')
    expect(timing?.statisticsIcelandMunicipalityCount).toBe(62)
    expect(timing?.postElectionReferenceDate).toBe('2026-05-16')
    expect(timing?.currentMunicipalityCount).toBe(61)
  })

  it('reconciles Iceland geometry 352 without inventing internal region polygons', () => {
    const countries = (topology as TopologyPayload).objects.countries.geometries
    const iceland = countries.find((geometry) => String(geometry.id).padStart(3, '0') === '352')
    expect(iceland?.type).toBe('Polygon')
    expect(iceland?.arcs).toHaveLength(1)

    const specialCases = config.administrativeModel.specialCases as Array<Record<string, unknown>>
    const geometryCase = specialCases.find((entry) => entry.type === 'runtime-geometry-lod-reconciliation')
    expect(geometryCase?.geometryId).toBe('352')
    expect(geometryCase?.geometryType).toBe('Polygon')
    expect(geometryCase?.componentCount).toBe(1)
  })

  it('keeps representative prominence under shared-world economy authority', () => {
    expect(registry.developmentModel.authority).toBe('shared-regional-national-multiplayer-economy')
    expect(registry.developmentModel.personalPlayerProgressionUnlock).toBe(false)
    expect(registry.developmentModel.numericThresholdsDefined).toBe(false)

    for (const unit of registry.units) {
      expect(unit.economicEmergence.authority).toBe('shared-regional-national-multiplayer-economy')
      expect(unit.economicEmergence.personalPlayerProgressionUnlock).toBe(false)
      expect(unit.economicEmergence.numericThresholdsDefined).toBe(false)
    }
  })
})
