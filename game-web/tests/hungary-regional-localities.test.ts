import { describe, expect, it } from 'vitest'
import registry from '../public/data/europe-hungary-regional-localities-v1.json'
import topology from '../public/data/world-atlas-countries-110m.json'
import config from '../../04_World/Country_Catalog/Continents/Europe/HUNGARY_REGIONAL_CONFIG.json'

type TopologyGeometry = {
  id?: string | number
  type: string
}

type TopologyPayload = {
  objects: {
    countries: {
      geometries: TopologyGeometry[]
    }
  }
}

describe('Hungary Budapest plus 19 vármegye regional model', () => {
  it('publishes exactly 20 governed top-level territorial representatives', () => {
    expect(config.country.geometryId).toBe('348')
    expect(config.country.sourceCountryCode).toBe('HU')
    expect(config.administrativeModel.unitCount).toBe(20)
    expect(registry.units).toHaveLength(20)
    expect(registry.source.expectedCountryCandidateCount).toBe(1226)
    expect(registry.source.publishedGameplayRepresentativeCount).toBe(20)
    expect(new Set(registry.units.map((unit) => unit.admin1Code)).size).toBe(20)
    expect(new Set(registry.units.map((unit) => unit.representativeLocality.localityId)).size).toBe(20)
  })

  it('keeps Budapest as the unique national-capital and territorial node', () => {
    const budapest = registry.units.find((unit) => unit.admin1Code === '05')
    expect(budapest?.regionName).toBe('Budapest')
    expect(budapest?.representativeLocality.name).toBe('Budapest')
    expect(budapest?.representativeLocality.sourceRef).toBe('geonames:3054643')
    expect(budapest?.representativeLocality.featureCode).toBe('PPLC')
    expect(budapest?.representativeLocality.presentationRole).toBe('national-capital-and-regional-node')
    expect(registry.units.filter((unit) => unit.representativeLocality.presentationRole === 'national-capital-and-regional-node')).toHaveLength(1)
  })

  it('uses direct first-order seats for 19 surfaces and one governed Pest fallback', () => {
    const primary = registry.units.filter((unit) => unit.representativeLocality.selectionBasis === 'source-first-order-seat-role')
    const fallback = registry.units.filter((unit) => unit.representativeLocality.selectionBasis === 'source-admin-fallback')
    expect(primary).toHaveLength(19)
    expect(fallback).toHaveLength(1)

    const pest = registry.units.find((unit) => unit.admin1Code === '16')
    expect(pest?.regionName).toBe('Pest vármegye')
    expect(pest?.representativeLocality.name).toBe('Érd')
    expect(pest?.representativeLocality.sourceRef).toBe('geonames:3053281')
    expect(pest?.representativeLocality.featureCode).toBe('PPLA2')
    expect(pest?.representativeLocality.presentationRole).toBe('regional-representative-locality')

    const special = config.administrativeModel.specialCases.find((entry) => entry.type === 'administrative-seat-outside-source-ownership')
    expect(special?.admin1Code).toBe('16')
    expect(registry.units.filter((unit) => unit.representativeLocality.name === 'Budapest')).toHaveLength(1)
  })

  it('preserves current vármegye naming independently from retained GeoNames labels', () => {
    expect(config.administrativeModel.nativeTermPlural).toContain('19 vármegye')
    const csongrad = registry.units.find((unit) => unit.admin1Code === '06')
    expect(csongrad?.regionName).toBe('Csongrád-Csanád vármegye')
    expect(csongrad?.regionSourceName).toBe('Csongrád')

    const bekes = registry.units.find((unit) => unit.admin1Code === '03')
    expect(bekes?.regionName).toBe('Békés vármegye')
    expect(bekes?.regionSourceName).toBe('Bekes County')
  })

  it('retains the expected direct representative seats across the country', () => {
    const expected: Record<string, string> = {
      '01': 'Kecskemét',
      '02': 'Pécs',
      '03': 'Békéscsaba',
      '04': 'Miskolc',
      '05': 'Budapest',
      '06': 'Szeged',
      '08': 'Székesfehérvár',
      '09': 'Győr',
      '10': 'Debrecen',
      '11': 'Eger',
      '12': 'Tatabánya',
      '14': 'Salgótarján',
      '16': 'Érd',
      '17': 'Kaposvár',
      '18': 'Nyíregyháza',
      '20': 'Szolnok',
      '21': 'Szekszárd',
      '22': 'Szombathely',
      '23': 'Veszprém',
      '24': 'Zalaegerszeg',
    }

    for (const [code, localityName] of Object.entries(expected)) {
      const unit = registry.units.find((candidate) => candidate.admin1Code === code)
      expect(unit?.representativeLocality.name).toBe(localityName)
      expect(unit?.representativeLocality.sourceCountryCode).toBe('HU')
      expect(unit?.representativeLocality.sourceAdmin1Code).toBe(code)
      expect(unit?.representativeLocality.sourceScope).toBe('admin1')
    }
  })

  it('reconciles runtime geometry 348 without inventing internal vármegye polygons', () => {
    const countries = (topology as TopologyPayload).objects.countries.geometries
    const hungary = countries.find((geometry) => String(geometry.id).padStart(3, '0') === '348')
    expect(hungary?.type).toBe('Polygon')

    const geometryCase = config.administrativeModel.specialCases.find((entry) => entry.type === 'runtime-geometry-lod-reconciliation')
    expect(geometryCase?.geometryId).toBe('348')
    expect(geometryCase?.geometryType).toBe('Polygon')
  })

  it('keeps representative prominence under shared-world economy authority', () => {
    for (const unit of registry.units) {
      expect(unit.economicEmergence.authority).toBe('shared-regional-national-multiplayer-economy')
      expect(unit.economicEmergence.personalPlayerProgressionUnlock).toBe(false)
      expect(unit.economicEmergence.numericThresholdsDefined).toBe(false)
    }
  })
})
