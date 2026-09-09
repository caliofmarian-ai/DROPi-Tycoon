import { describe, expect, it } from 'vitest'
import {
  availableInventoryQuantity,
  createInventory,
} from '../src/inventory/inventory'
import { PRODUCT_CATALOG } from '../src/production/productCatalog'
import type {
  EconomicNodeCityEndpointRef,
  EconomicNodeLocation,
} from '../src/production/production'
import {
  bindDemandRequirementToCitywideEndpoint,
  bindLogisticsOpportunityToCitywideEndpoints,
  bindSupplyOfferToCitywideEndpoint,
  citywideEconomicEndpointIdentity,
  createCitywideEconomicEndpointAuthority,
} from '../src/trade/citywideEconomicEndpoints'
import { materializeProducerSystemicMission } from '../src/trade/producerSystemicMission'
import {
  deriveInventoryDemand,
  deriveLogisticsOpportunities,
  deriveSupplyOffer,
} from '../src/trade/regionalSupplyDemand'

const productId = PRODUCT_CATALOG.paperPackaging.productId
const worldInstanceId = 'world:generated-locality:citywide-demand-test'
const localityId = 'locality:generated:test-001'
const sourceCheckpoint = 'checkpoint:generated-locality:test-v1'

const endpoints: EconomicNodeCityEndpointRef[] = [
  {
    localityId,
    sourceCheckpoint,
    worldEndpointId: 'endpoint:producer-west',
    role: 'pickup',
    districtId: 'production-west',
    areaId: 'producer-cluster',
    locationRef: 'location:producer-west',
    roadRef: 'road:west-spine',
  },
  {
    localityId,
    sourceCheckpoint,
    worldEndpointId: 'endpoint:recipient-east',
    role: 'delivery',
    districtId: 'residential-east',
    areaId: 'recipient-cluster',
    locationRef: 'location:recipient-east',
    roadRef: 'road:east-spine',
  },
  {
    localityId,
    sourceCheckpoint,
    worldEndpointId: 'endpoint:recipient-south',
    role: 'delivery',
    districtId: 'peripheral-south',
    areaId: 'south-cluster',
    locationRef: 'location:recipient-south',
    roadRef: 'road:south-spine',
  },
]

const authority = createCitywideEconomicEndpointAuthority({
  localityId,
  sourceCheckpoint,
  endpoints,
})

const location = (worldEndpointId: string): EconomicNodeLocation => {
  const cityEndpoint = authority.endpoints.find(endpoint => endpoint.worldEndpointId === worldEndpointId)
  if (!cityEndpoint) throw new Error(`Unknown test endpoint:${worldEndpointId}`)
  return {
    worldInstanceId,
    countryId: 'country:test',
    administrativeRegionId: 'region:test',
    localityId,
    cityEndpoint: { ...cityEndpoint },
  }
}

const causalPair = (input?: {
  sourceQuantity?: number
  destinationQuantity?: number
  targetStockUnits?: number
  destinationEndpoint?: string
}) => {
  const source = createInventory({
    inventoryId: 'inventory:citywide-source',
    nodeId: 'node:citywide-source',
    capacityUnits: 30,
    initial: (input?.sourceQuantity ?? 8) > 0
      ? [{ productId, quantity: input?.sourceQuantity ?? 8 }]
      : [],
  })
  const destination = createInventory({
    inventoryId: 'inventory:citywide-destination',
    nodeId: 'node:citywide-destination',
    capacityUnits: 30,
    initial: (input?.destinationQuantity ?? 1) > 0
      ? [{ productId, quantity: input?.destinationQuantity ?? 1 }]
      : [],
  })
  const sourceLocation = location('endpoint:producer-west')
  const destinationLocation = location(input?.destinationEndpoint ?? 'endpoint:recipient-east')
  const supply = deriveSupplyOffer({
    supplyId: 'supply:citywide-packaging',
    sourceNodeId: source.nodeId,
    location: sourceLocation,
    inventory: source,
    productId,
  })
  const demand = deriveInventoryDemand({
    demandId: 'demand:citywide-packaging',
    destinationNodeId: destination.nodeId,
    location: destinationLocation,
    inventory: destination,
    productId,
    targetStockUnits: input?.targetStockUnits ?? 7,
  })
  const [opportunity] = deriveLogisticsOpportunities([supply], [demand], 4)
  return { source, destination, sourceLocation, destinationLocation, supply, demand, opportunity }
}

describe('#615/#643 locality-scoped production/demand endpoints', () => {
  it('binds real supply and deficit to a generated non-Brăila locality authority with source checkpoint', () => {
    const { supply, demand, opportunity } = causalPair()
    expect(opportunity).toBeDefined()
    if (!opportunity) return

    const bound = bindLogisticsOpportunityToCitywideEndpoints({ opportunity, supply, demand, authority })

    expect(bound.localityId).toBe(localityId)
    expect(bound.sourceCheckpoint).toBe(sourceCheckpoint)
    expect(citywideEconomicEndpointIdentity(bound.origin)).toEqual({
      endpointId: 'node:citywide-source',
      localityId,
      sourceCheckpoint,
      districtId: 'production-west',
      areaId: 'producer-cluster',
    })
    expect(citywideEconomicEndpointIdentity(bound.destination)).toEqual({
      endpointId: 'node:citywide-destination',
      localityId,
      sourceCheckpoint,
      districtId: 'residential-east',
      areaId: 'recipient-cluster',
    })
    expect(bound.origin.sourceLocalityId).toBe(localityId)
    expect(bound.destination.sourceLocalityId).toBe(localityId)
    expect('x' in bound.origin).toBe(false)
    expect('y' in bound.destination).toBe(false)
  })

  it('preserves governed endpoint identity by value when supply/demand snapshots are derived', () => {
    const source = createInventory({
      inventoryId: 'inventory:clone-source',
      nodeId: 'node:clone-source',
      capacityUnits: 10,
      initial: [{ productId, quantity: 4 }],
    })
    const mutableLocation = location('endpoint:producer-west')
    const supply = deriveSupplyOffer({
      supplyId: 'supply:clone',
      sourceNodeId: source.nodeId,
      location: mutableLocation,
      inventory: source,
      productId,
    })

    expect(supply.location.cityEndpoint).not.toBe(mutableLocation.cityEndpoint)
    if (!mutableLocation.cityEndpoint || !supply.location.cityEndpoint) return
    mutableLocation.cityEndpoint.districtId = 'mutated-district'
    expect(supply.location.cityEndpoint.districtId).toBe('production-west')
  })

  it('fails closed when stock or deficit is not real instead of creating geographic work', () => {
    const noSupply = causalPair({ sourceQuantity: 0 })
    expect(() => bindSupplyOfferToCitywideEndpoint({ supply: noSupply.supply, authority }))
      .toThrow('Citywide supply endpoint requires real available stock')

    const noDemand = causalPair({ destinationQuantity: 1, targetStockUnits: 1 })
    expect(noDemand.demand.requiredQuantity).toBe(0)
    expect(() => bindDemandRequirementToCitywideEndpoint({ demand: noDemand.demand, authority }))
      .toThrow('Citywide demand endpoint requires a real positive deficit')
  })

  it('rejects role swaps, stale checkpoints and cross-locality relabeling', () => {
    const pair = causalPair()
    const roleSwap = {
      ...pair.supply,
      location: location('endpoint:recipient-east'),
    }
    expect(() => bindSupplyOfferToCitywideEndpoint({ supply: roleSwap, authority }))
      .toThrow('Citywide endpoint role mismatch:endpoint:recipient-east:pickup')

    const staleCheckpoint = {
      ...pair.demand,
      location: {
        ...pair.demand.location,
        cityEndpoint: pair.demand.location.cityEndpoint
          ? { ...pair.demand.location.cityEndpoint, sourceCheckpoint: 'checkpoint:stale' }
          : undefined,
      },
    }
    expect(() => bindDemandRequirementToCitywideEndpoint({ demand: staleCheckpoint, authority }))
      .toThrow('Economic node city endpoint authority mismatch')

    const otherLocality = {
      ...pair.demand,
      location: { ...pair.demand.location, localityId: 'locality:other' },
    }
    expect(() => bindDemandRequirementToCitywideEndpoint({ demand: otherLocality, authority }))
      .toThrow('Economic node locality does not match citywide authority')
  })

  it('keeps peripheral causal endpoints eligible without center quotas', () => {
    const { supply, demand, opportunity } = causalPair({ destinationEndpoint: 'endpoint:recipient-south' })
    expect(opportunity).toBeDefined()
    if (!opportunity) return

    const first = bindLogisticsOpportunityToCitywideEndpoints({ opportunity, supply, demand, authority })
    const replay = bindLogisticsOpportunityToCitywideEndpoints({ opportunity, supply, demand, authority })

    expect(first).toEqual(replay)
    expect(first.origin.districtId).toBe('production-west')
    expect(first.destination.districtId).toBe('peripheral-south')
  })

  it('rejects stale opportunities that no longer match the authoritative economic cause', () => {
    const { supply, demand, opportunity } = causalPair()
    expect(opportunity).toBeDefined()
    if (!opportunity) return

    expect(() => bindLogisticsOpportunityToCitywideEndpoints({
      opportunity: { ...opportunity, sourceNodeId: 'node:fictional-source' },
      supply,
      demand,
      authority,
    })).toThrow('Citywide logistics opportunity does not match authoritative supply/demand nodes')

    expect(() => bindLogisticsOpportunityToCitywideEndpoints({
      opportunity: { ...opportunity, quantity: supply.availableQuantity + 1 },
      supply,
      demand,
      authority,
    })).toThrow('Citywide logistics opportunity exceeds current real supply/demand')
  })

  it('leaves reservation/systemic-mission authority unchanged after locality binding', () => {
    const { source, destination, supply, demand, opportunity } = causalPair()
    expect(opportunity).toBeDefined()
    if (!opportunity) return

    const bound = bindLogisticsOpportunityToCitywideEndpoints({ opportunity, supply, demand, authority })
    expect(availableInventoryQuantity(source, productId)).toBe(8)

    const materialized = materializeProducerSystemicMission({
      missionId: 'mission:citywide-real-cause',
      contractId: 'contract:citywide-real-cause',
      cargoId: 'cargo:citywide-real-cause',
      opportunity: bound.opportunity,
      sourceInventory: source,
      destinationInventory: destination,
      producerActorId: 'company:outer-producer',
      recipientActorId: 'company:outer-recipient',
      logisticsPayerActorId: 'company:outer-producer',
      logisticsProviderActorId: 'hero:carrier',
      transportCapacityUnits: 4,
    })

    expect(materialized.status).toBe('applied')
    if (materialized.status === 'rejected') return
    expect(availableInventoryQuantity(materialized.sourceInventory, productId)).toBe(4)
    expect(materialized.contract.opportunityId).toBe(bound.opportunity.opportunityId)
    expect(materialized.contract.settlementIntents).toEqual([])
  })
})
