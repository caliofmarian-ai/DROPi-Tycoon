import { describe, expect, it } from 'vitest'
import registry from '../public/data/europe-france-regional-localities-v1.json'
import topology from '../public/data/world-atlas-countries-110m.json'
import config from '../../04_World/Country_Catalog/Continents/Europe/FRANCE_REGIONAL_CONFIG.json'

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

describe('France representative regional localities', () => {
  it('publishes the 18 current COG regional-level surfaces without a settlement dump', () => {
    expect(registry.units).toHaveLength(18)
    expect(config.administrativeModel.unitCount).toBe(18)
    expect(new Set(registry.units.map((unit) => unit.admin1Code)).size).toBe(18)
    expect(new Set(registry.units.map((unit) => unit.representativeLocality.localityId)).size).toBe(18)
    expect(registry.source.candidateCountryCodes).toEqual(['FR', 'GF', 'GP', 'MQ', 'RE', 'YT'])
    expect(registry.source.expectedCountryCandidateCount).toBe(15525)
    expect(registry.selectionModel.expectedPrimarySelections).toBe(18)
    expect(registry.selectionModel.expectedFallbackSelections).toBe(0)
    expect(registry.selectionModel.highDensityGameplayImport).toBe(false)
    expect(registry.selectionModel.hardcodedCoordinates).toBe(false)
  })

  it('keeps Paris as France unique national-capital node', () => {
    const paris = registry.units.find((unit) => unit.representativeLocality.name === 'Paris')
    expect(paris?.admin1Code).toBe('11')
    expect(paris?.regionName).toBe('Île-de-France')
    expect(paris?.representativeLocality.sourceRef).toBe('geonames:2988507')
    expect(paris?.representativeLocality.sourceCountryCode).toBe('FR')
    expect(paris?.representativeLocality.presentationRole).toBe('national-capital-and-regional-node')
    expect(registry.units.filter((unit) => unit.representativeLocality.presentationRole === 'national-capital-and-regional-node')).toHaveLength(1)
  })

  it('crosswalks overseas regional surfaces to their retained source-country corpora', () => {
    const expected = {
      '01': { country: 'GP', name: 'Basse-Terre', ref: 'geonames:3579732' },
      '02': { country: 'MQ', name: 'Fort-de-France', ref: 'geonames:3570675' },
      '03': { country: 'GF', name: 'Cayenne', ref: 'geonames:3382160' },
      '04': { country: 'RE', name: 'Saint-Denis', ref: 'geonames:935264' },
      '06': { country: 'YT', name: 'Mamoudzou', ref: 'geonames:921815' },
    } as const

    for (const [code, target] of Object.entries(expected)) {
      const unit = registry.units.find((candidate) => candidate.admin1Code === code)
      expect(unit?.representativeLocality.sourceCountryCode).toBe(target.country)
      expect(unit?.representativeLocality.sourceScope).toBe('country')
      expect(unit?.representativeLocality.name).toBe(target.name)
      expect(unit?.representativeLocality.sourceRef).toBe(target.ref)
      expect(unit?.representativeLocality.featureCode).toBe('PPLC')
      expect(unit?.representativeLocality.presentationRole).not.toBe('national-capital-and-regional-node')
    }
  })

  it('preserves Corsica, single-collectivity and Mayotte 2026 institutional distinctions', () => {
    const specialTypes = new Set(config.administrativeModel.specialCases.map((entry) => entry.type))
    expect(specialTypes).toContain('corsica-special-status-collectivity')
    expect(specialTypes).toContain('martinique-guyane-single-territorial-collectivities')
    expect(specialTypes).toContain('mayotte-departement-region-2026')
    expect(specialTypes).toContain('overseas-cross-source-locality-ownership')

    const mayotte = config.administrativeModel.specialCases.find((entry) => entry.type === 'mayotte-departement-region-2026')
    expect(mayotte?.canonicalRegionCode).toBe('06')
    expect(mayotte?.legalCollectivityCode).toBe('976R')
    expect(mayotte?.effectiveDate).toBe('2026-01-01')

    const corsica = registry.units.find((unit) => unit.admin1Code === '94')
    expect(corsica?.representativeLocality.name).toBe('Ajaccio')
    expect(corsica?.representativeLocality.sourceRef).toBe('geonames:3038334')
    expect(corsica?.representativeLocality.presentationRole).toBe('special-status-collectivity-capital-and-regional-node')
  })

  it('reconciles France geometry 250 without inventing missing overseas polygons', () => {
    const countries = (topology as TopologyPayload).objects.countries.geometries
    const france = countries.find((geometry) => String(geometry.id).padStart(3, '0') === '250')
    expect(france?.type).toBe('MultiPolygon')
    expect(france?.arcs).toHaveLength(3)

    const geometryCase = config.administrativeModel.specialCases.find((entry) => entry.type === 'runtime-geometry-lod-reconciliation')
    expect(geometryCase?.componentCount).toBe(3)
    expect(geometryCase?.representedComponents.map((entry) => entry.surface)).toEqual([
      'Guyane',
      'Metropolitan France',
      'Corse',
    ])
    expect(geometryCase?.notSeparatelyRenderedAtThisLod).toEqual([
      'Guadeloupe',
      'Martinique',
      'La Réunion',
      'Mayotte',
    ])
  })

  it('keeps representative prominence under shared-world economy authority', () => {
    for (const unit of registry.units) {
      expect(unit.economicEmergence.authority).toBe('shared-regional-national-multiplayer-economy')
      expect(unit.economicEmergence.personalPlayerProgressionUnlock).toBe(false)
      expect(unit.economicEmergence.numericThresholdsDefined).toBe(false)
    }
  })
})
