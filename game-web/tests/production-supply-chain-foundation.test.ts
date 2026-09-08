import { describe, expect, it } from 'vitest'
import type { WorldClockState } from '../src/world/globalWorld'
import {
  addInventory,
  availableInventoryQuantity,
  createInventory,
  inventoryQuantity,
  releaseInventoryReservation,
  reserveInventory,
  totalInventoryQuantity,
} from '../src/inventory/inventory'
import {
  createExecutableProductionRecipe,
  createProductiveNode,
  PULP_TO_PACKAGING_RECIPE,
  settleProductionCycle,
  TIMBER_TO_PULP_RECIPE,
} from '../src/production/production'
import { PRODUCT_CATALOG } from '../src/production/productCatalog'
import {
  cancelProducerLogisticsContract,
  createProducerLogisticsContract,
  deliverProducerCargo,
  failProducerLogisticsContract,
  pickupProducerCargo,
} from '../src/trade/producerLogisticsContract'
import {
  deriveInventoryDemand,
  deriveLogisticsOpportunities,
  deriveSupplyOffer,
} from '../src/trade/regionalSupplyDemand'

const location = {
  worldInstanceId: 'world-production-test',
  countryId: 'country:romania',
  administrativeRegionId: 'region:braila',
  localityId: 'locality:braila',
}

const clock = (hour: number, minute = 0): WorldClockState => ({
  worldInstanceId: location.worldInstanceId,
  year: 1,
  season: 'Spring',
  dayOfSeason: 1,
  hour,
  minute,
})

const producerInventory = (packagingQuantity: number) => createInventory({
  inventoryId: 'inventory:paper-mill',
  nodeId: 'node:paper-mill',
  capacityUnits: 20,
  initial: packagingQuantity > 0
    ? [{ productId: PRODUCT_CATALOG.paperPackaging.productId, quantity: packagingQuantity }]
    : [],
})

const marketInventory = (packagingQuantity = 0) => createInventory({
  inventoryId: 'inventory:market',
  nodeId: 'node:market',
  capacityUnits: 20,
  initial: packagingQuantity > 0
    ? [{ productId: PRODUCT_CATALOG.paperPackaging.productId, quantity: packagingQuantity }]
    : [],
})

describe('production / inventory / regional supply-demand foundation', () => {
  it('keeps inventory finite, bounded and non-negative', () => {
    const inventory = createInventory({
      inventoryId: 'inventory:test',
      nodeId: 'node:test',
      capacityUnits: 5,
      initial: [{ productId: PRODUCT_CATALOG.rawTimber.productId, quantity: 3 }],
    })

    expect(addInventory(inventory, 'add:nan', PRODUCT_CATALOG.rawTimber.productId, Number.NaN)).toMatchObject({
      status: 'rejected', reason: 'invalid-addition',
    })
    expect(addInventory(inventory, 'add:overflow', PRODUCT_CATALOG.rawTimber.productId, 3)).toMatchObject({
      status: 'rejected', reason: 'capacity-exceeded',
    })
    expect(totalInventoryQuantity(inventory)).toBe(3)
    expect(inventoryQuantity(inventory, PRODUCT_CATALOG.rawTimber.productId)).toBe(3)
  })

  it('reserves inventory exactly once and releases it exactly once', () => {
    const initial = producerInventory(6)
    const first = reserveInventory(initial, 'reservation:r1', PRODUCT_CATALOG.paperPackaging.productId, 4)
    expect(first.status).toBe('applied')
    if (first.status !== 'applied') return
    expect(availableInventoryQuantity(first.inventory, PRODUCT_CATALOG.paperPackaging.productId)).toBe(2)

    const duplicate = reserveInventory(first.inventory, 'reservation:r1', PRODUCT_CATALOG.paperPackaging.productId, 4)
    expect(duplicate.status).toBe('duplicate')
    expect(duplicate.inventory).toEqual(first.inventory)

    const released = releaseInventoryReservation(first.inventory, 'reservation:r1')
    expect(released.status).toBe('applied')
    if (released.status !== 'applied') return
    expect(availableInventoryQuantity(released.inventory, PRODUCT_CATALOG.paperPackaging.productId)).toBe(6)
    expect(releaseInventoryReservation(released.inventory, 'reservation:r1').status).toBe('duplicate')
  })

  it('runs a deterministic timber -> pulp -> packaging chain only with inputs and elapsed world time', () => {
    let node = createProductiveNode({
      nodeId: 'node:paper-mill',
      kind: 'PaperMill',
      location,
      inventoryCapacityUnits: 20,
      initialInventory: [{ productId: PRODUCT_CATALOG.rawTimber.productId, quantity: 8 }],
      productionCapacityUnits: 1,
    })

    expect(settleProductionCycle(node, TIMBER_TO_PULP_RECIPE, 'cycle:too-early', clock(8), clock(8, 59))).toMatchObject({
      status: 'rejected', reason: 'processing-time-incomplete',
    })

    const pulp = settleProductionCycle(node, TIMBER_TO_PULP_RECIPE, 'cycle:pulp', clock(8), clock(9))
    expect(pulp.status).toBe('applied')
    if (pulp.status !== 'applied') return
    node = pulp.node
    expect(inventoryQuantity(node.inventory, PRODUCT_CATALOG.rawTimber.productId)).toBe(4)
    expect(inventoryQuantity(node.inventory, PRODUCT_CATALOG.woodPulp.productId)).toBe(3)

    const packaging = settleProductionCycle(node, PULP_TO_PACKAGING_RECIPE, 'cycle:packaging', clock(9), clock(10))
    expect(packaging.status).toBe('applied')
    if (packaging.status !== 'applied') return
    expect(inventoryQuantity(packaging.node.inventory, PRODUCT_CATALOG.woodPulp.productId)).toBe(0)
    expect(inventoryQuantity(packaging.node.inventory, PRODUCT_CATALOG.paperPackaging.productId)).toBe(2)
    expect(totalInventoryQuantity(packaging.node.inventory)).toBe(6)

    expect(settleProductionCycle(packaging.node, PULP_TO_PACKAGING_RECIPE, 'cycle:packaging', clock(9), clock(10))).toMatchObject({
      status: 'duplicate',
    })
    expect(settleProductionCycle(packaging.node, PULP_TO_PACKAGING_RECIPE, 'cycle:no-input', clock(10), clock(11))).toMatchObject({
      status: 'rejected', reason: `missing-input:${PRODUCT_CATALOG.woodPulp.productId}`,
    })
  })

  it('rejects production that would exceed output capacity', () => {
    const expandingRecipe = createExecutableProductionRecipe({
      recipeId: 'recipe:capacity-test',
      inputs: [{ productId: PRODUCT_CATALOG.rawTimber.productId, group: 'RawMaterials', quantity: 1 }],
      outputs: [{ productId: PRODUCT_CATALOG.paperPackaging.productId, group: 'PaperPackaging', quantity: 4 }],
      compatibleFacilityKinds: ['PaperMill'],
      capacityUnitsRequired: 1,
      processingMinutes: 60,
    })
    const node = createProductiveNode({
      nodeId: 'node:capacity-test',
      kind: 'PaperMill',
      location,
      inventoryCapacityUnits: 3,
      initialInventory: [{ productId: PRODUCT_CATALOG.rawTimber.productId, quantity: 1 }],
      productionCapacityUnits: 1,
    })
    const result = settleProductionCycle(node, expandingRecipe, 'cycle:capacity', clock(8), clock(9))
    expect(result).toMatchObject({ status: 'rejected', reason: 'output-capacity-exceeded' })
    expect(result.node.inventory).toEqual(node.inventory)
  })

  it('is independent of rendering cadence because only authoritative logical clocks define production completion', () => {
    const node = createProductiveNode({
      nodeId: 'node:fps-test',
      kind: 'PaperMill',
      location,
      inventoryCapacityUnits: 10,
      initialInventory: [{ productId: PRODUCT_CATALOG.rawTimber.productId, quantity: 4 }],
      productionCapacityUnits: 1,
    })
    const first = settleProductionCycle(node, TIMBER_TO_PULP_RECIPE, 'cycle:fps', clock(8), clock(9))
    const second = settleProductionCycle(node, TIMBER_TO_PULP_RECIPE, 'cycle:fps', clock(8), clock(9))
    expect(second).toEqual(first)
  })

  it('derives different logistics opportunities from different supply/demand state rather than a fixed job reward', () => {
    const lowSupply = deriveSupplyOffer({
      supplyId: 'supply:a-low', sourceNodeId: 'node:paper-mill', location,
      inventory: producerInventory(2), productId: PRODUCT_CATALOG.paperPackaging.productId,
    })
    const highSupply = deriveSupplyOffer({
      supplyId: 'supply:b-high', sourceNodeId: 'node:paper-mill-2', location,
      inventory: createInventory({
        inventoryId: 'inventory:paper-mill-2', nodeId: 'node:paper-mill-2', capacityUnits: 20,
        initial: [{ productId: PRODUCT_CATALOG.paperPackaging.productId, quantity: 8 }],
      }),
      productId: PRODUCT_CATALOG.paperPackaging.productId,
    })
    const emptyMarket = deriveInventoryDemand({
      demandId: 'demand:empty', destinationNodeId: 'node:market', location,
      inventory: marketInventory(), productId: PRODUCT_CATALOG.paperPackaging.productId, targetStockUnits: 6,
    })
    const stockedMarket = deriveInventoryDemand({
      demandId: 'demand:stocked', destinationNodeId: 'node:market-2', location,
      inventory: createInventory({
        inventoryId: 'inventory:market-2', nodeId: 'node:market-2', capacityUnits: 20,
        initial: [{ productId: PRODUCT_CATALOG.paperPackaging.productId, quantity: 5 }],
      }),
      productId: PRODUCT_CATALOG.paperPackaging.productId, targetStockUnits: 6,
    })

    const opportunities = deriveLogisticsOpportunities([lowSupply, highSupply], [emptyMarket, stockedMarket], 4)
    expect(opportunities.map(item => item.quantity)).toEqual([2, 4, 1])
    expect(opportunities[0].economicValueSignal).toBeGreaterThan(opportunities[2].economicValueSignal)
    expect(opportunities.every(item => item.worldInstanceId === location.worldInstanceId)).toBe(true)
  })

  it('moves reserved producer stock into custody and then destination inventory exactly once', () => {
    const source = producerInventory(5)
    const destination = marketInventory(1)
    const supply = deriveSupplyOffer({
      supplyId: 'supply:contract', sourceNodeId: source.nodeId, location,
      inventory: source, productId: PRODUCT_CATALOG.paperPackaging.productId,
    })
    const demand = deriveInventoryDemand({
      demandId: 'demand:contract', destinationNodeId: destination.nodeId, location,
      inventory: destination, productId: PRODUCT_CATALOG.paperPackaging.productId, targetStockUnits: 6,
    })
    const [opportunity] = deriveLogisticsOpportunities([supply], [demand], 3)
    const created = createProducerLogisticsContract({
      contractId: 'contract:packaging-1',
      cargoId: 'cargo:packaging-1',
      opportunity,
      sourceInventory: source,
      destinationInventory: destination,
      producerActorId: 'company:paper-mill',
      recipientActorId: 'company:merchant',
      logisticsPayerActorId: 'company:paper-mill',
      logisticsProviderActorId: 'company:carrier',
      transportCapacityUnits: 3,
    })
    expect(created.status).toBe('applied')
    if (created.status !== 'applied' || !created.sourceInventory || !created.destinationInventory) return
    expect(created.contract.quantity).toBe(3)
    expect(availableInventoryQuantity(created.sourceInventory, PRODUCT_CATALOG.paperPackaging.productId)).toBe(2)

    const picked = pickupProducerCargo(created.contract, created.sourceInventory)
    expect(picked.status).toBe('applied')
    if (picked.status !== 'applied' || !picked.sourceInventory) return
    expect(inventoryQuantity(picked.sourceInventory, PRODUCT_CATALOG.paperPackaging.productId)).toBe(2)
    expect(picked.contract.cargo?.location.kind).toBe('InTransit')

    const duplicatePickup = pickupProducerCargo(picked.contract, picked.sourceInventory)
    expect(duplicatePickup.status).toBe('duplicate')
    expect(duplicatePickup.sourceInventory).toEqual(picked.sourceInventory)

    const stalePickupRetry = pickupProducerCargo(created.contract, picked.sourceInventory)
    expect(stalePickupRetry.status).toBe('duplicate')
    expect(stalePickupRetry.contract.status).toBe('InCustody')

    const delivered = deliverProducerCargo(picked.contract, destination)
    expect(delivered.status).toBe('applied')
    if (delivered.status !== 'applied' || !delivered.destinationInventory) return
    expect(inventoryQuantity(delivered.destinationInventory, PRODUCT_CATALOG.paperPackaging.productId)).toBe(4)
    expect(delivered.contract.status).toBe('Delivered')
    expect(delivered.contract.settlementIntents).toEqual([expect.objectContaining({
      goodsPayerActorId: 'company:merchant',
      goodsPayeeActorId: 'company:paper-mill',
      logisticsPayerActorId: 'company:paper-mill',
      logisticsPayeeActorId: 'company:carrier',
      monetarySettlement: 'ExternalLedgerRequired',
    })])

    const duplicateDelivery = deliverProducerCargo(delivered.contract, delivered.destinationInventory)
    expect(duplicateDelivery.status).toBe('duplicate')
    expect(duplicateDelivery.destinationInventory).toEqual(delivered.destinationInventory)
    expect(duplicateDelivery.contract.settlementIntents).toHaveLength(1)

    const staleDeliveryRetry = deliverProducerCargo(picked.contract, delivered.destinationInventory)
    expect(staleDeliveryRetry.status).toBe('duplicate')
    expect(staleDeliveryRetry.contract.status).toBe('Delivered')
    expect(staleDeliveryRetry.contract.settlementIntents).toHaveLength(1)
  })

  it('releases reserved stock on cancellation or pre-pickup failure without teleporting cargo', () => {
    const makeReserved = (contractId: string) => {
      const source = producerInventory(4)
      const destination = marketInventory()
      const [opportunity] = deriveLogisticsOpportunities(
        [deriveSupplyOffer({ supplyId: `supply:${contractId}`, sourceNodeId: source.nodeId, location, inventory: source, productId: PRODUCT_CATALOG.paperPackaging.productId })],
        [deriveInventoryDemand({ demandId: `demand:${contractId}`, destinationNodeId: destination.nodeId, location, inventory: destination, productId: PRODUCT_CATALOG.paperPackaging.productId, targetStockUnits: 4 })],
        4,
      )
      const result = createProducerLogisticsContract({
        contractId, cargoId: `cargo:${contractId}`, opportunity, sourceInventory: source, destinationInventory: destination,
        producerActorId: 'company:producer', recipientActorId: 'company:merchant',
        logisticsPayerActorId: 'company:producer', logisticsProviderActorId: 'company:carrier', transportCapacityUnits: 4,
      })
      if (result.status !== 'applied' || !result.sourceInventory) throw new Error('contract setup failed')
      return { contract: result.contract, source: result.sourceInventory }
    }

    const cancelledSetup = makeReserved('contract:cancel')
    const cancelled = cancelProducerLogisticsContract(cancelledSetup.contract, cancelledSetup.source)
    expect(cancelled.status).toBe('applied')
    if (cancelled.status !== 'applied' || !cancelled.sourceInventory) return
    expect(cancelled.contract.status).toBe('Cancelled')
    expect(availableInventoryQuantity(cancelled.sourceInventory, PRODUCT_CATALOG.paperPackaging.productId)).toBe(4)

    const failedSetup = makeReserved('contract:fail')
    const failed = failProducerLogisticsContract(failedSetup.contract, failedSetup.source)
    expect(failed.status).toBe('applied')
    if (failed.status !== 'applied' || !failed.sourceInventory) return
    expect(failed.contract.status).toBe('Failed')
    expect(availableInventoryQuantity(failed.sourceInventory, PRODUCT_CATALOG.paperPackaging.productId)).toBe(4)
  })
})
