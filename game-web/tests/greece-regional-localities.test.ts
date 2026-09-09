import { describe, expect, it } from 'vitest'
import registry from '../public/data/europe-greece-regional-localities-v1.json'
import topology from '../public/data/world-atlas-countries-110m.json'
import config from '../../04_World/Country_Catalog/Continents/Europe/GREECE_REGIONAL_CONFIG.json'

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

describe('Greece representative regional localities', () => {
  it('publishes one sparse representative for each of the 13 Περιφέρειες', () => {
    expect(registry.units).toHaveLength(13)
    expect(config.administrativeModel.unitCount).toBe(13)
    expect(new Set(registry.units.map((unit) => unit.admin1Code)).size).toBe(13)
    expect(new Set(registry.units.map((unit) => unit.representativeLocality.localityId)).size).toBe(13)
    expect(registry.source.candidateCountryCodes).toEqual(['GR'])
    expect(registry.source.expectedCountryCandidateCount).toBe(1986)
    expect(registry.selectionModel.expectedPrimarySelections).toBe(13)
    expect(registry.selectionModel.expectedFallbackSelections).toBe(0)
    expect(registry.selectionModel.highDensityGameplayImport).toBe(false)
    expect(registry.selectionModel.hardcodedCoordinates).toBe(false)
  })

  it('keeps Athens as the unique national-capital and Attica node', () => {
    const athens = registry.units.find((unit) => unit.admin1Code === 'ESYE31')
    expect(athens?.regionName).toBe('Attica')
    expect(athens?.representativeLocality.name).toBe('Athens')
    expect(athens?.representativeLocality.sourceRef).toBe('geonames:264371')
    expect(athens?.representativeLocality.sourceCountryCode).toBe('GR')
    expect(athens?.representativeLocality.featureCode).toBe('PPLC')
    expect(athens?.representativeLocality.presentationRole).toBe('national-capital-and-regional-node')
    expect(registry.units.filter((unit) => unit.representativeLocality.presentationRole === 'national-capital-and-regional-node')).toHaveLength(1)
  })

  it('uses the retained first-order seats for all 13 ordinary Regions', () => {
    const expected = {
      ESYE31: ['Attica', 'Athens', 'geonames:264371'],
      ESYE24: ['Central Greece', 'Lamía', 'geonames:258620'],
      ESYE12: ['Central Macedonia', 'Thessaloníki', 'geonames:734077'],
      ESYE43: ['Crete', 'Irákleion', 'geonames:261745'],
      ESYE11: ['Eastern Macedonia and Thrace', 'Komotiní', 'geonames:735640'],
      ESYE21: ['Epirus', 'Ioánnina', 'geonames:261779'],
      ESYE22: ['Ionian Islands', 'Corfu', 'geonames:2463679'],
      ESYE41: ['North Aegean', 'Mytilene', 'geonames:256866'],
      ESYE25: ['Peloponnese', 'Trípoli', 'geonames:252601'],
      ESYE42: ['Southern Aegean', 'Ermoúpolis', 'geonames:262603'],
      ESYE14: ['Thessaly', 'Lárisa', 'geonames:258576'],
      ESYE23: ['Western Greece', 'Pátra', 'geonames:255683'],
      ESYE13: ['Western Macedonia', 'Kozáni', 'geonames:735563'],
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

  it('preserves Mount Athos as a constitutional special territory instead of a fourteenth Region', () => {
    const special = config.administrativeModel.specialCases.find((entry) => entry.type === 'mount-athos-constitutional-self-government')
    expect(special?.sourceAdmin1Code).toBe('736572')
    expect(special?.sourceRef).toBe('geonames:736572')
    expect(special?.sourceSeatRef).toBe('geonames:735972')
    expect(registry.units.some((unit) => unit.admin1Code === '736572')).toBe(false)
    expect(registry.units.some((unit) => unit.representativeLocality.sourceRef === 'geonames:735972')).toBe(false)
  })

  it('reconciles Greece geometry 300 without inventing internal Region polygons', () => {
    const countries = (topology as TopologyPayload).objects.countries.geometries
    const greece = countries.find((geometry) => String(geometry.id).padStart(3, '0') === '300')
    expect(greece?.type).toBe('MultiPolygon')
    expect(greece?.arcs).toHaveLength(2)

    const geometryCase = config.administrativeModel.specialCases.find((entry) => entry.type === 'runtime-geometry-lod-reconciliation')
    expect(geometryCase?.geometryId).toBe('300')
    expect(geometryCase?.geometryType).toBe('MultiPolygon')
    expect(geometryCase?.componentCount).toBe(2)
  })

  it('keeps representative prominence under shared-world economy authority', () => {
    for (const unit of registry.units) {
      expect(unit.economicEmergence.authority).toBe('shared-regional-national-multiplayer-economy')
      expect(unit.economicEmergence.personalPlayerProgressionUnlock).toBe(false)
      expect(unit.economicEmergence.numericThresholdsDefined).toBe(false)
    }
  })
})
