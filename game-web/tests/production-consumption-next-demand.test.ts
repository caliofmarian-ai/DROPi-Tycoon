import { describe, expect, it } from 'vitest'
import {
  availableInventoryQuantity,
  createInventory,
  inventoryQuantity,
  reserveInventory,
} from '../src/inventory/inventory'
import { createMissionRuntimeState } from '../src/missions/missionEngine'
import type { MissionWorldFacts } from '../src/missions/missionModel'
import {
  createConsumptionLifecycleState,
  createGovernedConsumptionProcess,
  settleConsumptionProcess,
} from '../src/production/consumptionLifecycle'
import { PRODUCT_CATALOG, type ProductId } from '../src/production/productCatalog'
import {
  acceptProducerMissionReservation,
  completeProducerMissionDelivery,
  pickupAcceptedProducerMissionCargo,
  type ProducerMissionLifecycleContext,
} from '../src/trade/producerMissionReservationLifecycle'
import {
  materializeProducerSystemicMission,
  withProducerContractFacts,
} from '../src/trade/producerSystemicMission'
import {
  deriveInventoryDemand,
  deriveLogisticsOpportunities,
  deriveSupplyOffer,
} from '../src/trade/regionalSupplyDemand'

const OUTPUT_PRODUCT = 'product:handled-goods' satisfies ProductId
const BYPRODUCT_PRODUCT = 'product:recovered-fiber' satisfies ProductId
const WASTE_PRODUCT = 'product:packaging-waste' satisfies ProductId

const location = {
  worldInstanceId: 'world:consumption-lifecycle',
  countryId: 'country:romania',
  administrativeRegionId: 'region:braila',
  localityId: 'locality:braila',
}

const process = createGovernedConsumptionProcess({
  processDefinitionId: 'process:packaging-use:v1',
  inputs: [{ productId: PRODUCT_CATALOG.paperPackaging.productId, quantity: 2 }],
  outputs: [{ productId: OUTPUT_PRODUCT, quantity: 1 }],
  byproducts: [{ productId: BYPRODUCT_PRODUCT, quantity: 1 }],
  waste: [{ productId: WASTE_PRODUCT, quantity: 1 }],
  replenishmentTargets: [{
    targetId: 'packaging-replenishment',
    productId: PRODUCT_CATALOG.paperPackaging.productId,
    targetStockUnits: 4,
  }],
})

const consumerInventory = (packaging = 4) => createInventory({
  inventoryId: 'inventory:consumer',
  nodeId: 'node:consumer',
  capacityUnits: 12,
  initial: packaging > 0
    ? [{ productId: PRODUCT_CATALOG.paperPackaging.productId, quantity: packaging }]
    : [],
})

const supplierInventory = (packaging = 5) => createInventory({
  inventoryId: 'inventory:supplier',
  nodeId: 'node:supplier',
  capacityUnits: 12,
  initial: [{ productId: PRODUCT_CATALOG.paperPackaging.productId, quantity: packaging }],
})

const supplyFrom = (inventory = supplierInventory()) => deriveSupplyOffer({
  supplyId: 'supply:packaging:upstream',
  sourceNodeId: inventory.nodeId,
  location,
  inventory,
  productId: PRODUCT_CATALOG.paperPackaging.productId,
})

describe('causal consumption/output/waste/next-demand lifecycle', () => {
  it('consumes finite stock and creates governed output, byproduct and waste deterministically', () => {
    const state = createConsumptionLifecycleState({
      nodeId: 'node:consumer',
      location,
      inventory: consumerInventory(),
    })

    const result = settleConsumptionProcess({
      state,
      process,
      processId: 'use:001',
      upstreamSupplies: [supplyFrom()],
      transportCapacityUnits: 4,
    })

    expect(result.status).toBe('applied')
    expect(inventoryQuantity(result.state.inventory, PRODUCT_CATALOG.paperPackaging.productId)).toBe(2)
    expect(inventoryQuantity(result.state.inventory, OUTPUT_PRODUCT)).toBe(1)
    expect(inventoryQuantity(result.state.inventory, BYPRODUCT_PRODUCT)).toBe(1)
    expect(inventoryQuantity(result.state.inventory, WASTE_PRODUCT)).toBe(1)
    expect(result.demands).toEqual([
      expect.objectContaining({
        productId: PRODUCT_CATALOG.paperPackaging.productId,
        currentStockUnits: 2,
        targetStockUnits: 4,
        requiredQuantity: 2,
      }),
    ])
    expect(result.emittedOpportunities).toEqual([
      expect.objectContaining({
        productId: PRODUCT_CATALOG.paperPackaging.productId,
        sourceNodeId: 'node:supplier',
        destinationNodeId: 'node:consumer',
        quantity: 2,
      }),
    ])
  })

  it('rejects insufficient or actively reserved stock without partial mutation', () => {
    const insufficient = createConsumptionLifecycleState({
      nodeId: 'node:consumer',
      location,
      inventory: consumerInventory(1),
    })
    const rejected = settleConsumptionProcess({
      state: insufficient,
      process,
      processId: 'use:insufficient',
    })

    expect(rejected).toMatchObject({
      status: 'rejected',
      reason: `insufficient-unreserved-input:${PRODUCT_CATALOG.paperPackaging.productId}`,
    })
    expect(rejected.state.inventory).toEqual(insufficient.inventory)

    const reservedBase = consumerInventory(3)
    const reserved = reserveInventory(
      reservedBase,
      'reservation:other-logistics-work',
      PRODUCT_CATALOG.paperPackaging.productId,
      2,
    )
    expect(reserved.status).toBe('applied')
    const reservedState = createConsumptionLifecycleState({
      nodeId: 'node:consumer',
      location,
      inventory: reserved.inventory,
    })
    expect(availableInventoryQuantity(reservedState.inventory, PRODUCT_CATALOG.paperPackaging.productId)).toBe(1)

    const protectedResult = settleConsumptionProcess({
      state: reservedState,
      process,
      processId: 'use:reserved',
    })
    expect(protectedResult.status).toBe('rejected')
    expect(protectedResult.state.inventory).toEqual(reservedState.inventory)
    expect(protectedResult.state.inventory.reservations['reservation:other-logistics-work']?.status).toBe('active')
  })

  it('makes duplicate completion a no-op for inputs, outputs, waste and next opportunities', () => {
    const initial = createConsumptionLifecycleState({
      nodeId: 'node:consumer',
      location,
      inventory: consumerInventory(),
    })
    const first = settleConsumptionProcess({
      state: initial,
      process,
      processId: 'use:duplicate-safe',
      upstreamSupplies: [supplyFrom()],
      transportCapacityUnits: 4,
    })
    expect(first.status).toBe('applied')

    const replay = settleConsumptionProcess({
      state: first.state,
      process,
      processId: 'use:duplicate-safe',
      upstreamSupplies: [supplyFrom()],
      transportCapacityUnits: 4,
    })

    expect(replay.status).toBe('duplicate')
    expect(replay.state.inventory).toEqual(first.state.inventory)
    expect(replay.demands).toEqual([])
    expect(replay.emittedOpportunities).toEqual([])
    expect(replay.state.completedProcessIds).toEqual(['use:duplicate-safe'])
    expect(replay.state.emittedOpportunityIds).toEqual(first.state.emittedOpportunityIds)
  })

  it('creates downstream demand from real inventory depletion and feeds the existing systemic mission bridge exactly once', () => {
    const upstream = supplierInventory()
    const initial = createConsumptionLifecycleState({
      nodeId: 'node:consumer',
      location,
      inventory: consumerInventory(),
    })
    const processed = settleConsumptionProcess({
      state: initial,
      process,
      processId: 'use:bridge',
      upstreamSupplies: [supplyFrom(upstream)],
      transportCapacityUnits: 4,
    })
    expect(processed.status).toBe('applied')
    expect(processed.emittedOpportunities).toHaveLength(1)

    const opportunity = processed.emittedOpportunities[0]
    if (!opportunity) throw new Error('Expected downstream logistics opportunity')
    const materialized = materializeProducerSystemicMission({
      missionId: 'mission:replenish-after-use',
      contractId: 'contract:replenish-after-use',
      cargoId: 'cargo:replenish-after-use',
      opportunity,
      sourceInventory: upstream,
      destinationInventory: processed.state.inventory,
      producerActorId: 'company:upstream',
      recipientActorId: 'company:consumer',
      logisticsPayerActorId: 'company:consumer',
      logisticsProviderActorId: 'hero:carrier',
      transportCapacityUnits: 4,
    })

    expect(materialized.status).toBe('applied')
    if (materialized.status === 'rejected') throw new Error(materialized.reason)
    expect(materialized.contract.opportunityId).toBe(opportunity.opportunityId)
    expect(materialized.sourceInventory.reservations[materialized.contract.reservationId]).toMatchObject({
      productId: PRODUCT_CATALOG.paperPackaging.productId,
      quantity: 2,
      status: 'active',
    })

    const replay = settleConsumptionProcess({
      state: processed.state,
      process,
      processId: 'use:bridge',
      upstreamSupplies: [supplyFrom(upstream)],
      transportCapacityUnits: 4,
    })
    expect(replay.status).toBe('duplicate')
    expect(replay.emittedOpportunities).toEqual([])
  })

  it('stays consistent with merged reservation/custody delivery before downstream consumption', () => {
    const producer = createInventory({
      inventoryId: 'inventory:delivery-producer',
      nodeId: 'node:delivery-producer',
      capacityUnits: 12,
      initial: [{ productId: PRODUCT_CATALOG.paperPackaging.productId, quantity: 4 }],
    })
    const consumer = consumerInventory(0)
    const supply = deriveSupplyOffer({
      supplyId: 'supply:delivery-before-use',
      sourceNodeId: producer.nodeId,
      location,
      inventory: producer,
      productId: PRODUCT_CATALOG.paperPackaging.productId,
    })
    const demand = deriveInventoryDemand({
      demandId: 'demand:delivery-before-use',
      destinationNodeId: consumer.nodeId,
      location,
      inventory: consumer,
      productId: PRODUCT_CATALOG.paperPackaging.productId,
      targetStockUnits: 4,
    })
    const [opportunity] = deriveLogisticsOpportunities([supply], [demand], 4)
    if (!opportunity) throw new Error('Expected delivery opportunity')

    const materialized = materializeProducerSystemicMission({
      missionId: 'mission:delivery-before-use',
      contractId: 'contract:delivery-before-use',
      cargoId: 'cargo:delivery-before-use',
      opportunity,
      sourceInventory: producer,
      destinationInventory: consumer,
      producerActorId: 'company:producer',
      recipientActorId: 'company:consumer',
      logisticsPayerActorId: 'company:consumer',
      logisticsProviderActorId: 'hero:carrier',
      transportCapacityUnits: 4,
    })
    if (materialized.status === 'rejected') throw new Error(materialized.reason)

    const definitions = [materialized.missionDefinition]
    const baseFacts: MissionWorldFacts = { worldMinute: 240 }
    const facts = withProducerContractFacts(baseFacts, materialized.contract)
    const runtime = createMissionRuntimeState(definitions, facts)
    const context: ProducerMissionLifecycleContext = {
      definitions,
      state: runtime,
      missionId: materialized.missionDefinition.missionId,
      contract: materialized.contract,
      sourceInventory: materialized.sourceInventory,
      destinationInventory: materialized.destinationInventory,
      facts: baseFacts,
    }

    const accepted = acceptProducerMissionReservation(context)
    const picked = pickupAcceptedProducerMissionCargo({
      ...context,
      state: accepted.missionState,
      contract: accepted.contract,
      sourceInventory: accepted.sourceInventory,
      destinationInventory: accepted.destinationInventory,
    })
    const delivered = completeProducerMissionDelivery({
      ...context,
      state: picked.missionState,
      contract: picked.contract,
      sourceInventory: picked.sourceInventory,
      destinationInventory: picked.destinationInventory,
    })

    expect(delivered.status).toBe('applied')
    expect(delivered.contract.status).toBe('Delivered')
    expect(delivered.sourceInventory.reservations[delivered.contract.reservationId]?.status).toBe('consumed')
    expect(inventoryQuantity(delivered.sourceInventory, PRODUCT_CATALOG.paperPackaging.productId)).toBe(0)
    expect(inventoryQuantity(delivered.destinationInventory, PRODUCT_CATALOG.paperPackaging.productId)).toBe(4)

    const consumptionState = createConsumptionLifecycleState({
      nodeId: delivered.destinationInventory.nodeId,
      location,
      inventory: delivered.destinationInventory,
    })
    const consumed = settleConsumptionProcess({
      state: consumptionState,
      process,
      processId: 'use:after-delivery',
    })

    expect(consumed.status).toBe('applied')
    expect(inventoryQuantity(consumed.state.inventory, PRODUCT_CATALOG.paperPackaging.productId)).toBe(2)
    expect(delivered.contract.status).toBe('Delivered')
    expect(delivered.sourceInventory.reservations[delivered.contract.reservationId]?.status).toBe('consumed')
  })
})
