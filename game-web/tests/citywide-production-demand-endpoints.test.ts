import { describe, expect, it } from 'vitest'
import {
  availableInventoryQuantity,
  createInventory,
} from '../src/inventory/inventory'
import { PRODUCT_CATALOG } from '../src/production/productCatalog'
import type { EconomicNodeLocation } from '../src/production/production'
import {
  bindDemandRequirementToCitywideEndpoint,
  bindLogisticsOpportunityToCitywideEndpoints,
  bindSupplyOfferToCitywideEndpoint,
  citywideEconomicEndpointIdentity,
  governedBrailaEconomicCityEndpointRef,
} from '../src/trade/citywideEconomicEndpoints'
import { materializeProducerSystemicMission } from '../src/trade/producerSystemicMission'
import {
  deriveInventoryDemand,
  deriveLogisticsOpportunities,
  deriveSupplyOffer,
} from '../src/trade/regionalSupplyDemand'

const productId = PRODUCT_CATALOG.paperPackaging.productId
const worldInstanceId = 'world:braila:citywide-demand-test'

const location = (
  routeLabel: string,
  kind: 'pickup' | 'delivery',
): EconomicNodeLocation => ({
  worldInstanceId,
  countryId: 'country:romania',
  administrativeRegionId: 'region:braila',
  localityId: 'locality:braila',
  cityEndpoint: governedBrailaEconomicCityEndpointRef(routeLabel, kind),
})

const causalPair = (input?: {
  sourceQuantity?: number
  destinationQuantity?: number
  targetStockUnits?: number
  sourceRoute?: string
  destinationRoute?: string
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
  const sourceLocation = location(input?.sourceRoute ?? 'DepotPickup', 'pickup')
  const destinationLocation = location(input?.destinationRoute ?? 'GardenCourt', 'delivery')
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

describe('#615 DT-07 governed citywide production/demand endpoints', () => {
  it('binds a real industrial supply and outer-area deficit to stable semantic identities without coordinates', () => {
    const { supply, demand, opportunity } = causalPair()
    expect(opportunity).toBeDefined()
    if (!opportunity) return

    const bound = bindLogisticsOpportunityToCitywideEndpoints({ opportunity, supply, demand })

    expect(citywideEconomicEndpointIdentity(bound.origin)).toEqual({
      endpointId: 'node:citywide-source',
      districtId: 'storage',
      areaId: 'DepotPickup',
    })
    expect(citywideEconomicEndpointIdentity(bound.destination)).toEqual({
      endpointId: 'node:citywide-destination',
      districtId: 'garden',
      areaId: 'GardenCourt',
    })
    expect(bound.origin).toMatchObject({
      locationRef: 'storage-block-1-2',
      roadRef: 'foundry-lane',
      routeLabel: 'DepotPickup',
      role: 'supply-origin',
    })
    expect(bound.destination).toMatchObject({
      locationRef: 'garden-block-1-1',
      roadRef: 'garden-lane',
      routeLabel: 'GardenCourt',
      role: 'demand-destination',
    })
    expect('x' in bound.origin).toBe(false)
    expect('y' in bound.origin).toBe(false)
    expect('x' in bound.destination).toBe(false)
    expect('y' in bound.destination).toBe(false)
  })

  it('preserves governed city endpoint refs by value when supply/demand snapshots are derived', () => {
    const source = createInventory({
      inventoryId: 'inventory:clone-source',
      nodeId: 'node:clone-source',
      capacityUnits: 10,
      initial: [{ productId, quantity: 4 }],
    })
    const mutableLocation = location('HarborPickup', 'pickup')
    const supply = deriveSupplyOffer({
      supplyId: 'supply:clone',
      sourceNodeId: source.nodeId,
      location: mutableLocation,
      inventory: source,
      productId,
    })

    expect(supply.location.cityEndpoint).not.toBe(mutableLocation.cityEndpoint)
    if (!mutableLocation.cityEndpoint || !supply.location.cityEndpoint) return
    mutableLocation.cityEndpoint.districtId = 'fictional-district'
    expect(supply.location.cityEndpoint.districtId).toBe('waterfront')
  })

  it('fails closed when stock or deficit is not real instead of creating geographic work', () => {
    const noSupply = causalPair({ sourceQuantity: 0 })
    expect(() => bindSupplyOfferToCitywideEndpoint({ supply: noSupply.supply }))
      .toThrow('Citywide supply endpoint requires real available stock')

    const noDemand = causalPair({ destinationQuantity: 1, targetStockUnits: 1 })
    expect(noDemand.demand.requiredQuantity).toBe(0)
    expect(() => bindDemandRequirementToCitywideEndpoint({ demand: noDemand.demand }))
      .toThrow('Citywide demand endpoint requires a real positive deficit')
  })

  it('rejects pickup/delivery role swaps and fictional spatial relabeling', () => {
    const pair = causalPair()
    const deliveryAsSupply = {
      ...pair.supply,
      location: location('GardenCourt', 'delivery'),
    }
    expect(() => bindSupplyOfferToCitywideEndpoint({ supply: deliveryAsSupply }))
      .toThrow('Citywide route role mismatch:GardenCourt:pickup')

    const relabeledSupply = {
      ...pair.supply,
      location: {
        ...pair.supply.location,
        cityEndpoint: pair.supply.location.cityEndpoint
          ? { ...pair.supply.location.cityEndpoint, districtId: 'business' }
          : undefined,
      },
    }
    expect(() => bindSupplyOfferToCitywideEndpoint({ supply: relabeledSupply }))
      .toThrow('Economic node city endpoint does not match governed world identity')
  })

  it('lets legitimate waterfront/peripheral causes expose diverse endpoints without center quotas', () => {
    const { supply, demand, opportunity } = causalPair({
      sourceRoute: 'HarborPickup',
      destinationRoute: 'SouthCourt',
    })
    expect(opportunity).toBeDefined()
    if (!opportunity) return

    const first = bindLogisticsOpportunityToCitywideEndpoints({ opportunity, supply, demand })
    const replay = bindLogisticsOpportunityToCitywideEndpoints({ opportunity, supply, demand })

    expect(first).toEqual(replay)
    expect(first.origin.districtId).toBe('waterfront')
    expect(first.destination.districtId).toBe('garden')
    expect(first.origin.areaId).toBe('HarborPickup')
    expect(first.destination.areaId).toBe('SouthCourt')
  })

  it('rejects stale or relabeled opportunities that no longer match the authoritative cause', () => {
    const { supply, demand, opportunity } = causalPair()
    expect(opportunity).toBeDefined()
    if (!opportunity) return

    expect(() => bindLogisticsOpportunityToCitywideEndpoints({
      opportunity: { ...opportunity, sourceNodeId: 'node:fictional-source' },
      supply,
      demand,
    })).toThrow('Citywide logistics opportunity does not match authoritative supply/demand nodes')

    expect(() => bindLogisticsOpportunityToCitywideEndpoints({
      opportunity: { ...opportunity, quantity: supply.availableQuantity + 1 },
      supply,
      demand,
    })).toThrow('Citywide logistics opportunity exceeds current real supply/demand')
  })

  it('leaves the existing reservation/systemic-mission authority unchanged after geographic binding', () => {
    const { source, destination, supply, demand, opportunity } = causalPair()
    expect(opportunity).toBeDefined()
    if (!opportunity) return

    const bound = bindLogisticsOpportunityToCitywideEndpoints({ opportunity, supply, demand })
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
