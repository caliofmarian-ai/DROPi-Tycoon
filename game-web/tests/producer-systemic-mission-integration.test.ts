import { describe, expect, it } from 'vitest'
import {
  availableInventoryQuantity,
  createInventory,
  inventoryQuantity,
} from '../src/inventory/inventory'
import {
  createMissionRuntimeState,
  startMission,
} from '../src/missions/missionEngine'
import type { MissionWorldFacts } from '../src/missions/missionModel'
import { PRODUCT_CATALOG } from '../src/production/productCatalog'
import {
  cancelProducerLogisticsContract,
  deliverProducerCargo,
  pickupProducerCargo,
} from '../src/trade/producerLogisticsContract'
import {
  materializeProducerSystemicMission,
  reconcileProducerSystemicMission,
  withProducerContractFacts,
} from '../src/trade/producerSystemicMission'
import {
  deriveInventoryDemand,
  deriveLogisticsOpportunities,
  deriveSupplyOffer,
  type LogisticsOpportunity,
} from '../src/trade/regionalSupplyDemand'

const location = {
  worldInstanceId: 'world:producer-mission-test',
  countryId: 'country:romania',
  administrativeRegionId: 'region:braila',
  localityId: 'locality:braila',
}

const sourceInventory = (quantity: number) => createInventory({
  inventoryId: 'inventory:producer-mission-source',
  nodeId: 'node:producer-mission-source',
  capacityUnits: 20,
  initial: quantity > 0
    ? [{ productId: PRODUCT_CATALOG.paperPackaging.productId, quantity }]
    : [],
})

const destinationInventory = (quantity: number) => createInventory({
  inventoryId: 'inventory:producer-mission-destination',
  nodeId: 'node:producer-mission-destination',
  capacityUnits: 20,
  initial: quantity > 0
    ? [{ productId: PRODUCT_CATALOG.paperPackaging.productId, quantity }]
    : [],
})

const opportunityFrom = (
  source = sourceInventory(5),
  destination = destinationInventory(1),
  transportCapacityUnits = 3,
): LogisticsOpportunity => {
  const supply = deriveSupplyOffer({
    supplyId: 'supply:producer-mission',
    sourceNodeId: source.nodeId,
    location,
    inventory: source,
    productId: PRODUCT_CATALOG.paperPackaging.productId,
  })
  const demand = deriveInventoryDemand({
    demandId: 'demand:producer-mission',
    destinationNodeId: destination.nodeId,
    location,
    inventory: destination,
    productId: PRODUCT_CATALOG.paperPackaging.productId,
    targetStockUnits: 6,
  })
  const [opportunity] = deriveLogisticsOpportunities([supply], [demand], transportCapacityUnits)
  if (!opportunity) throw new Error('Expected a real logistics opportunity')
  return opportunity
}

const materialize = (input?: {
  source?: ReturnType<typeof sourceInventory>
  destination?: ReturnType<typeof destinationInventory>
  opportunity?: LogisticsOpportunity
}) => {
  const source = input?.source ?? sourceInventory(5)
  const destination = input?.destination ?? destinationInventory(1)
  const opportunity = input?.opportunity ?? opportunityFrom(source, destination)
  return materializeProducerSystemicMission({
    missionId: 'mission:producer-packaging-1',
    contractId: 'contract:producer-packaging-1',
    cargoId: 'cargo:producer-packaging-1',
    opportunity,
    sourceInventory: source,
    destinationInventory: destination,
    producerActorId: 'company:paper-mill',
    recipientActorId: 'company:market',
    logisticsPayerActorId: 'company:paper-mill',
    logisticsProviderActorId: 'hero:carrier',
    transportCapacityUnits: 3,
  })
}

const facts = (worldMinute = 100): MissionWorldFacts => ({ worldMinute })

describe('#419 producer supply/demand -> systemic mission integration', () => {
  it('materializes a mission only after a real opportunity can reserve real producer stock', () => {
    const result = materialize()
    expect(result.status).toBe('applied')
    if (result.status === 'rejected') return

    expect(result.contract.opportunityId).toBe(result.missionDefinition.source.kind === 'Systemic'
      ? result.missionDefinition.source.causeRef
      : undefined)
    expect(result.missionDefinition).toMatchObject({
      category: 'ProducerSupplyChain',
      source: { kind: 'Systemic', causeRef: result.contract.opportunityId },
      prerequisites: [{
        kind: 'contractStatus',
        contractId: result.contract.contractId,
        status: 'Reserved',
      }],
      completionConsequences: [{
        kind: 'EconomicSettlementReference',
        settlementRef: `settlement-intent:${result.contract.contractId}`,
      }],
    })
    expect(result.contract.quantity).toBe(3)
    expect(availableInventoryQuantity(
      result.sourceInventory,
      PRODUCT_CATALOG.paperPackaging.productId,
    )).toBe(2)
    expect(result.contract.settlementIntents).toEqual([])
  })

  it('rejects stale opportunities whose producer stock is no longer available instead of creating a fake mission', () => {
    const originalSource = sourceInventory(5)
    const destination = destinationInventory(1)
    const staleOpportunity = opportunityFrom(originalSource, destination)
    const depletedSource = sourceInventory(1)

    const result = materialize({
      source: depletedSource,
      destination,
      opportunity: staleOpportunity,
    })

    expect(result).toMatchObject({
      status: 'rejected',
      reason: 'insufficient-available-inventory',
    })
    expect(availableInventoryQuantity(
      result.sourceInventory,
      PRODUCT_CATALOG.paperPackaging.productId,
    )).toBe(1)
  })

  it('drives the merged mission engine from contract custody and delivery state exactly once', () => {
    const materialized = materialize()
    expect(materialized.status).toBe('applied')
    if (materialized.status === 'rejected') return

    const definitions = [materialized.missionDefinition]
    const reservedFacts = withProducerContractFacts(facts(), materialized.contract)
    let state = createMissionRuntimeState(definitions, reservedFacts)
    expect(state.missions[materialized.missionDefinition.missionId].status).toBe('Available')

    const started = startMission(
      definitions,
      state,
      materialized.missionDefinition.missionId,
      reservedFacts,
    )
    expect(started.changed).toBe(true)
    state = started.state

    const picked = pickupProducerCargo(materialized.contract, materialized.sourceInventory)
    expect(picked.status).toBe('applied')
    if (picked.status !== 'applied' || !picked.sourceInventory) return

    const pickupMission = reconcileProducerSystemicMission({
      definitions,
      state,
      missionId: materialized.missionDefinition.missionId,
      contract: picked.contract,
      facts: facts(),
    })
    state = pickupMission.state
    expect(state.missions[materialized.missionDefinition.missionId]).toMatchObject({
      status: 'Active',
      stageId: 'producer-delivery',
    })
    expect(inventoryQuantity(
      picked.sourceInventory,
      PRODUCT_CATALOG.paperPackaging.productId,
    )).toBe(2)

    const delivered = deliverProducerCargo(picked.contract, materialized.destinationInventory)
    expect(delivered.status).toBe('applied')
    if (delivered.status !== 'applied' || !delivered.destinationInventory) return

    const deliveryMission = reconcileProducerSystemicMission({
      definitions,
      state,
      missionId: materialized.missionDefinition.missionId,
      contract: delivered.contract,
      facts: facts(101),
    })
    state = deliveryMission.state

    expect(state.missions[materialized.missionDefinition.missionId].status).toBe('Completed')
    expect(state.completionReceipts).toHaveLength(1)
    expect(deliveryMission.emittedConsequences).toEqual([
      expect.objectContaining({
        consequence: {
          kind: 'EconomicSettlementReference',
          settlementRef: `settlement-intent:${delivered.contract.contractId}`,
        },
      }),
    ])
    expect(delivered.contract.settlementIntents).toEqual([
      expect.objectContaining({
        eventId: `settlement-intent:${delivered.contract.contractId}`,
        monetarySettlement: 'ExternalLedgerRequired',
      }),
    ])
    expect(inventoryQuantity(
      delivered.destinationInventory,
      PRODUCT_CATALOG.paperPackaging.productId,
    )).toBe(4)

    const replay = reconcileProducerSystemicMission({
      definitions,
      state,
      missionId: materialized.missionDefinition.missionId,
      contract: delivered.contract,
      facts: facts(102),
    })
    expect(replay.emittedConsequences).toEqual([])
    expect(replay.state.completionReceipts).toHaveLength(1)
  })

  it('fails an active systemic mission when its reserved producer contract is cancelled before pickup', () => {
    const materialized = materialize()
    expect(materialized.status).toBe('applied')
    if (materialized.status === 'rejected') return

    const definitions = [materialized.missionDefinition]
    const reservedFacts = withProducerContractFacts(facts(), materialized.contract)
    let state = createMissionRuntimeState(definitions, reservedFacts)
    state = startMission(
      definitions,
      state,
      materialized.missionDefinition.missionId,
      reservedFacts,
    ).state

    const cancelled = cancelProducerLogisticsContract(materialized.contract, materialized.sourceInventory)
    expect(cancelled.status).toBe('applied')
    if (cancelled.status !== 'applied' || !cancelled.sourceInventory) return

    const reconciled = reconcileProducerSystemicMission({
      definitions,
      state,
      missionId: materialized.missionDefinition.missionId,
      contract: cancelled.contract,
      facts: facts(),
    })

    expect(reconciled.state.missions[materialized.missionDefinition.missionId].status).toBe('Failed')
    expect(reconciled.emittedConsequences).toEqual([])
    expect(cancelled.contract.settlementIntents).toEqual([])
    expect(availableInventoryQuantity(
      cancelled.sourceInventory,
      PRODUCT_CATALOG.paperPackaging.productId,
    )).toBe(5)
  })
})
