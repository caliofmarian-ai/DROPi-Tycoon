import { describe, expect, it } from 'vitest'
import registry from '../public/data/europe-germany-regional-localities-v1.json'
import topology from '../public/data/world-atlas-countries-110m.json'
import config from '../../04_World/Country_Catalog/Continents/Europe/GERMANY_REGIONAL_CONFIG.json'

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

describe('Germany representative regional localities', () => {
  it('publishes one sparse representative for each of the 16 Länder', () => {
    expect(registry.units).toHaveLength(16)
    expect(config.administrativeModel.unitCount).toBe(16)
    expect(new Set(registry.units.map((unit) => unit.admin1Code)).size).toBe(16)
    expect(new Set(registry.units.map((unit) => unit.representativeLocality.localityId)).size).toBe(16)
    expect(registry.source.candidateCountryCodes).toEqual(['DE'])
    expect(registry.source.expectedCountryCandidateCount).toBe(11920)
    expect(registry.selectionModel.expectedPrimarySelections).toBe(16)
    expect(registry.selectionModel.expectedFallbackSelections).toBe(0)
    expect(registry.selectionModel.highDensityGameplayImport).toBe(false)
    expect(registry.selectionModel.hardcodedCoordinates).toBe(false)
  })

  it('keeps Berlin as the unique federal-capital and Land node', () => {
    const berlin = registry.units.find((unit) => unit.admin1Code === '16')
    expect(berlin?.regionName).toBe('Berlin')
    expect(berlin?.representativeLocality.name).toBe('Berlin')
    expect(berlin?.representativeLocality.sourceRef).toBe('geonames:2950159')
    expect(berlin?.representativeLocality.sourceCountryCode).toBe('DE')
    expect(berlin?.representativeLocality.featureCode).toBe('PPLC')
    expect(berlin?.representativeLocality.presentationRole).toBe('national-capital-and-regional-node')
    expect(registry.units.filter((unit) => unit.representativeLocality.presentationRole === 'national-capital-and-regional-node')).toHaveLength(1)
  })

  it('uses the source-backed Land capitals, including non-largest capitals', () => {
    const expected = {
      '01': ['Baden-Württemberg', 'Stuttgart', 'geonames:2825297'],
      '02': ['Bayern', 'Munich', 'geonames:2867714'],
      '03': ['Bremen', 'Bremen', 'geonames:2944388'],
      '04': ['Hamburg', 'Hamburg', 'geonames:2911298'],
      '05': ['Hessen', 'Wiesbaden', 'geonames:2809346'],
      '06': ['Niedersachsen', 'Hannover', 'geonames:2910831'],
      '07': ['Nordrhein-Westfalen', 'Düsseldorf', 'geonames:2934246'],
      '08': ['Rheinland-Pfalz', 'Mainz', 'geonames:2874225'],
      '09': ['Saarland', 'Saarbrücken', 'geonames:2842647'],
      '10': ['Schleswig-Holstein', 'Kiel', 'geonames:2891122'],
      '11': ['Brandenburg', 'Potsdam', 'geonames:2852458'],
      '12': ['Mecklenburg-Vorpommern', 'Schwerin', 'geonames:2834282'],
      '13': ['Sachsen', 'Dresden', 'geonames:2935022'],
      '14': ['Sachsen-Anhalt', 'Magdeburg', 'geonames:2874545'],
      '15': ['Thüringen', 'Erfurt', 'geonames:2929670'],
      '16': ['Berlin', 'Berlin', 'geonames:2950159'],
    } as const

    for (const [code, [regionName, localityName, sourceRef]] of Object.entries(expected)) {
      const unit = registry.units.find((candidate) => candidate.admin1Code === code)
      expect(unit?.regionName).toBe(regionName)
      expect(unit?.representativeLocality.name).toBe(localityName)
      expect(unit?.representativeLocality.sourceRef).toBe(sourceRef)
      expect(unit?.representativeLocality.sourceAdmin1Code).toBe(code)
      expect(unit?.representativeLocality.sourceScope).toBe('admin1')
      expect(['PPLC', 'PPLA']).toContain(unit?.representativeLocality.featureCode)
    }
  })

  it('preserves the three city-state cases and Bremen two-city Land semantics', () => {
    const specialTypes = new Set(config.administrativeModel.specialCases.map((entry) => entry.type))
    expect(specialTypes).toContain('three-city-states')
    expect(specialTypes).toContain('bremen-two-city-land')
    expect(specialTypes).toContain('berlin-federal-and-land-capital')

    const bremen = registry.units.find((unit) => unit.admin1Code === '03')
    const hamburg = registry.units.find((unit) => unit.admin1Code === '04')
    const berlin = registry.units.find((unit) => unit.admin1Code === '16')
    expect(bremen?.representativeLocality.presentationRole).toBe('city-state-capital-and-regional-node')
    expect(hamburg?.representativeLocality.presentationRole).toBe('city-state-capital-and-regional-node')
    expect(berlin?.representativeLocality.presentationRole).toBe('national-capital-and-regional-node')
    expect(registry.units.some((unit) => unit.representativeLocality.name === 'Bremerhaven')).toBe(false)
  })

  it('reconciles Germany geometry 276 without inventing internal Land polygons', () => {
    const countries = (topology as TopologyPayload).objects.countries.geometries
    const germany = countries.find((geometry) => String(geometry.id).padStart(3, '0') === '276')
    expect(germany?.type).toBe('Polygon')
    expect(germany?.arcs).toHaveLength(1)

    const geometryCase = config.administrativeModel.specialCases.find((entry) => entry.type === 'runtime-geometry-lod-reconciliation')
    expect(geometryCase?.geometryId).toBe('276')
    expect(geometryCase?.geometryType).toBe('Polygon')
    expect(geometryCase?.componentCount).toBe(1)
  })

  it('keeps representative prominence under shared-world economy authority', () => {
    for (const unit of registry.units) {
      expect(unit.economicEmergence.authority).toBe('shared-regional-national-multiplayer-economy')
      expect(unit.economicEmergence.personalPlayerProgressionUnlock).toBe(false)
      expect(unit.economicEmergence.numericThresholdsDefined).toBe(false)
    }
  })
})
