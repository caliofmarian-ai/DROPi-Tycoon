import { describe, expect, it } from 'vitest'
import {
  MAX_REPRESENTATIVE_LOCALITIES_PER_COUNTRY,
  localityCompetitionCap,
  timeOfDay,
  validateCountryNodePolicy,
  type CountryWorldState,
  type EconomicSummary,
  type TransportSummary,
} from '../src/world/globalWorld'

const economy: EconomicSummary = {
  population: 1_000_000,
  populationTrend: 'Stable',
  demandIndex: 50,
  supplyIndex: 50,
  employmentDemandIndex: 50,
  specialistAvailabilityIndex: 50,
  infrastructureIndex: 50,
}

const transport: TransportSummary = {
  modes: ['Road', 'Rail'],
  capacityIndex: 50,
  congestionIndex: 50,
  reliabilityIndex: 50,
}

const country = (overrides: Partial<CountryWorldState> = {}): CountryWorldState => ({
  countryId: 'example-country',
  isoCode: 'EX',
  name: 'Example Country',
  position: { latitude: 45, longitude: 25 },
  administrativeDivisionLabel: 'Region',
  regions: [],
  representativeLocalities: [
    {
      nodeId: 'capital',
      name: 'Capital',
      role: 'Capital',
      kind: 'Capital',
      position: { latitude: 44.5, longitude: 26 },
      economy,
      transport,
    },
  ],
  externalEconomicNodes: [],
  economy,
  transport,
  ...overrides,
})

describe('global world model', () => {
  it('supports country-neutral administrative terminology', () => {
    expect(validateCountryNodePolicy(country({ administrativeDivisionLabel: 'Județ' })).valid).toBe(true)
    expect(validateCountryNodePolicy(country({ administrativeDivisionLabel: 'Province' })).valid).toBe(true)
    expect(validateCountryNodePolicy(country({ administrativeDivisionLabel: 'State' })).valid).toBe(true)
  })

  it('allows fewer than nine nodes and never requires fabricated directional settlements', () => {
    const result = validateCountryNodePolicy(country())
    expect(result.valid).toBe(true)
    expect(country().representativeLocalities.length).toBeLessThan(MAX_REPRESENTATIVE_LOCALITIES_PER_COUNTRY)
  })

  it('rejects duplicate representative roles and more than nine locality nodes', () => {
    const base = country().representativeLocalities[0]
    const tooMany = Array.from({ length: 10 }, (_, index) => ({
      ...base,
      nodeId: `node-${index}`,
      role: index === 0 ? 'Capital' as const : 'UrbanNorth' as const,
      kind: index === 0 ? 'Capital' as const : 'Urban' as const,
    }))
    const result = validateCountryNodePolicy(country({ representativeLocalities: tooMany }))
    expect(result.valid).toBe(false)
    expect(result.reasons.some(reason => reason.includes('maximum'))).toBe(true)
    expect(result.reasons.some(reason => reason.includes('duplicate'))).toBe(true)
  })

  it('permits external factories and farms as independent economic nodes', () => {
    const result = validateCountryNodePolicy(country({
      externalEconomicNodes: [
        {
          nodeId: 'steelworks-1',
          name: 'Regional Steelworks',
          kind: 'Steelworks',
          position: { latitude: 45.1, longitude: 24.9 },
          inputGroups: ['RawMaterials', 'Energy'],
          outputGroups: ['Steel'],
          capacityIndex: 60,
          inventoryIndex: 35,
          transport,
        },
        {
          nodeId: 'farm-1',
          name: 'North-East Farm',
          kind: 'Farm',
          position: { latitude: 46.2, longitude: 27.1 },
          inputGroups: ['Fertilizer'],
          outputGroups: ['Agriculture', 'Food'],
          capacityIndex: 45,
          inventoryIndex: 25,
          transport,
        },
      ],
    }))
    expect(result.valid).toBe(true)
  })

  it('applies the owner competition caps by locality type', () => {
    expect(localityCompetitionCap('Capital')).toBe(5)
    expect(localityCompetitionCap('Urban')).toBe(5)
    expect(localityCompetitionCap('RuralSmall')).toBe(2)
  })

  it('separates day/night behavior from slower world cycles', () => {
    expect(timeOfDay({ worldInstanceId: 'w1', year: 1, season: 'Spring', dayOfSeason: 1, hour: 2, minute: 0 })).toBe('Night')
    expect(timeOfDay({ worldInstanceId: 'w1', year: 1, season: 'Spring', dayOfSeason: 1, hour: 8, minute: 0 })).toBe('Morning')
    expect(timeOfDay({ worldInstanceId: 'w1', year: 1, season: 'Spring', dayOfSeason: 1, hour: 14, minute: 0 })).toBe('Day')
    expect(timeOfDay({ worldInstanceId: 'w1', year: 1, season: 'Spring', dayOfSeason: 1, hour: 20, minute: 0 })).toBe('Evening')
  })
})
