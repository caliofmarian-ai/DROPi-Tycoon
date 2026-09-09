import { describe, expect, it } from 'vitest'
import {
  availableInventoryQuantity,
  createInventory,
  inventoryQuantity,
} from '../src/inventory/inventory'
import { createMissionRuntimeState } from '../src/missions/missionEngine'
import type { MissionWorldFacts } from '../src/missions/missionModel'
import { PRODUCT_CATALOG } from '../src/production/productCatalog'
import {
  acceptProducerMissionReservation,
  cancelProducerMissionReservation,
  completeProducerMissionDelivery,
  failProducerMissionReservation,
  pickupAcceptedProducerMissionCargo,
  repairProducerReservationReference,
  type ProducerMissionLifecycleContext,
} from '../src/trade/producerMissionReservationLifecycle'
import { materializeProducerSystemicMission, withProducerContractFacts } from '../src/trade/producerSystemicMission'
import { deriveInventoryDemand, deriveLogisticsOpportunities, deriveSupplyOffer, type LogisticsOpportunity } from '../src/trade/regionalSupplyDemand'

const location = {
  worldInstanceId: 'world:reservation-lifecycle',
  countryId: 'country:romania',
  administrativeRegionId: 'region:braila',
  localityId: 'locality:braila',
}

const baseFacts = (): MissionWorldFacts => ({ worldMinute: 120 })

const sourceInventory = (quantity = 5) => createInventory({
  inventoryId: 'inventory:producer',
  nodeId: 'node:producer',
  capacityUnits: 20,
  initial: [{ productId: PRODUCT_CATALOG.paperPackaging.productId, quantity }],
})

const destinationInventory = () => createInventory({
  inventoryId: 'inventory:recipient',
  nodeId: 'node:recipient',
  capacityUnits: 20,
})

const opportunityFrom = (
  source = sourceInventory(),
  destination = destinationInventory(),
  transportCapacityUnits = 4,
): LogisticsOpportunity => {
  const supply = deriveSupplyOffer({
    supplyId: 'supply:producer:packaging',
    sourceNodeId: source.nodeId,
    location,
    inventory: source,
    productId: PRODUCT_CATALOG.paperPackaging.productId,
  })
  const demand = deriveInventoryDemand({
    demandId: 'demand:recipient:packaging',
    destinationNodeId: destination.nodeId,
    location,
    inventory: destination,
    productId: PRODUCT_CATALOG.paperPackaging.productId,
    targetStockUnits: 4,
  })
  const [opportunity] = deriveLogisticsOpportunities([supply], [demand], transportCapacityUnits)
  if (!opportunity) throw new Error('Expected logistics opportunity')
  return opportunity
}

const materializedFixture = () => {
  const source = sourceInventory()
  const destination = destinationInventory()
  const materialized = materializeProducerSystemicMission({
    missionId: 'mission:producer:packaging',
    contractId: 'contract:producer:packaging',
    cargoId: 'cargo:producer:packaging',
    opportunity: opportunityFrom(source, destination),
    sourceInventory: source,
    destinationInventory: destination,
    producerActorId: 'company:producer',
    recipientActorId: 'company:recipient',
    logisticsPayerActorId: 'company:producer',
    logisticsProviderActorId: 'hero:carrier',
    transportCapacityUnits: 4,
  })
  if (materialized.status === 'rejected') throw new Error(materialized.reason)

  const definitions = [materialized.missionDefinition]
  const facts = withProducerContractFacts(baseFacts(), materialized.contract)
  const state = createMissionRuntimeState(definitions, facts)
  const context: ProducerMissionLifecycleContext = {
    definitions,
    state,
    missionId: materialized.missionDefinition.missionId,
    contract: materialized.contract,
    sourceInventory: materialized.sourceInventory,
    destinationInventory: materialized.destinationInventory,
    facts: baseFacts(),
  }
  return { context, materialized }
}

const acceptedFixture = () => {
  const fixture = materializedFixture()
  const accepted = acceptProducerMissionReservation(fixture.context)
  expect(accepted.status).toBe('applied')
  return {
    ...fixture,
    accepted,
    context: {
      ...fixture.context,
      state: accepted.missionState,
      contract: accepted.contract,
      sourceInventory: accepted.sourceInventory,
      destinationInventory: accepted.destinationInventory,
    },
  }
}

describe('producer systemic mission reservation lifecycle', () => {
  it('refuses to reserve above currently available producer stock', () => {
    const source = sourceInventory(3)
    const destination = destinationInventory()
    const impossibleOpportunity: LogisticsOpportunity = {
      opportunityId: 'opportunity:oversubscribed',
      supplyId: 'supply:oversubscribed',
      demandId: 'demand:oversubscribed',
      worldInstanceId: location.worldInstanceId,
      productId: PRODUCT_CATALOG.paperPackaging.productId,
      sourceNodeId: source.nodeId,
      destinationNodeId: destination.nodeId,
      quantity: 4,
      demandPressure: 1,
      economicValueSignal: 4,
    }

    const result = materializeProducerSystemicMission({
      missionId: 'mission:oversubscribed',
      contractId: 'contract:oversubscribed',
      cargoId: 'cargo:oversubscribed',
      opportunity: impossibleOpportunity,
      sourceInventory: source,
      destinationInventory: destination,
      producerActorId: 'company:producer',
      recipientActorId: 'company:recipient',
      logisticsPayerActorId: 'company:producer',
      logisticsProviderActorId: 'hero:carrier',
      transportCapacityUnits: 4,
    })

    expect(result).toMatchObject({ status: 'rejected', reason: 'insufficient-available-inventory' })
    expect(availableInventoryQuantity(source, PRODUCT_CATALOG.paperPackaging.productId)).toBe(3)
  })

  it('prevents another systemic mission from claiming stock already reserved by the first mission', () => {
    const first = materializedFixture().materialized
    expect(availableInventoryQuantity(first.sourceInventory, PRODUCT_CATALOG.paperPackaging.productId)).toBe(1)

    const secondOpportunity: LogisticsOpportunity = {
      ...opportunityFrom(sourceInventory(), destinationInventory(), 2),
      opportunityId: 'opportunity:second-mission',
      supplyId: 'supply:second-mission',
      demandId: 'demand:second-mission',
      quantity: 2,
    }
    const second = materializeProducerSystemicMission({
      missionId: 'mission:producer:second',
      contractId: 'contract:producer:second',
      cargoId: 'cargo:producer:second',
      opportunity: secondOpportunity,
      sourceInventory: first.sourceInventory,
      destinationInventory: first.destinationInventory,
      producerActorId: 'company:producer',
      recipientActorId: 'company:recipient',
      logisticsPayerActorId: 'company:producer',
      logisticsProviderActorId: 'hero:carrier:2',
      transportCapacityUnits: 2,
    })

    expect(second).toMatchObject({ status: 'rejected', reason: 'insufficient-available-inventory' })
    expect(availableInventoryQuantity(first.sourceInventory, PRODUCT_CATALOG.paperPackaging.productId)).toBe(1)
  })

  it('accepts only while the real reservation remains active, then consumes pickup exactly once', () => {
    const fixture = acceptedFixture()
    expect(fixture.accepted.missionState.missions[fixture.context.missionId].status).toBe('Active')
    expect(fixture.accepted.sourceInventory.reservations[fixture.accepted.contract.reservationId]?.status).toBe('active')

    const picked = pickupAcceptedProducerMissionCargo(fixture.context)
    expect(picked.status).toBe('applied')
    expect(picked.contract.status).toBe('InCustody')
    expect(picked.sourceInventory.reservations[picked.contract.reservationId]?.status).toBe('consumed')
    expect(inventoryQuantity(picked.sourceInventory, PRODUCT_CATALOG.paperPackaging.productId)).toBe(1)
    expect(picked.missionState.missions[fixture.context.missionId].stageId).toBe('producer-delivery')

    const duplicate = pickupAcceptedProducerMissionCargo({
      ...fixture.context,
      state: picked.missionState,
      contract: picked.contract,
      sourceInventory: picked.sourceInventory,
      destinationInventory: picked.destinationInventory,
    })
    expect(duplicate.status).toBe('duplicate')
    expect(inventoryQuantity(duplicate.sourceInventory, PRODUCT_CATALOG.paperPackaging.productId)).toBe(1)
    expect(duplicate.sourceInventory.reservations[duplicate.contract.reservationId]?.status).toBe('consumed')
  })

  it('releases cancellation before custody and fails the accepted mission without moving stock', () => {
    const fixture = acceptedFixture()
    const cancelled = cancelProducerMissionReservation(fixture.context)

    expect(cancelled.status).toBe('released')
    expect(cancelled.contract.status).toBe('Cancelled')
    expect(cancelled.sourceInventory.reservations[cancelled.contract.reservationId]?.status).toBe('released')
    expect(inventoryQuantity(cancelled.sourceInventory, PRODUCT_CATALOG.paperPackaging.productId)).toBe(5)
    expect(cancelled.missionState.missions[fixture.context.missionId].status).toBe('Failed')
    expect(cancelled.emittedConsequences).toEqual([])
  })

  it('releases safe failure before custody but never re-credits stock after cargo entered custody', () => {
    const beforePickup = acceptedFixture()
    const safeFailure = failProducerMissionReservation(beforePickup.context)
    expect(safeFailure.status).toBe('released')
    expect(safeFailure.contract.status).toBe('Failed')
    expect(safeFailure.sourceInventory.reservations[safeFailure.contract.reservationId]?.status).toBe('released')
    expect(inventoryQuantity(safeFailure.sourceInventory, PRODUCT_CATALOG.paperPackaging.productId)).toBe(5)

    const afterPickup = acceptedFixture()
    const picked = pickupAcceptedProducerMissionCargo(afterPickup.context)
    const custodyFailure = failProducerMissionReservation({
      ...afterPickup.context,
      state: picked.missionState,
      contract: picked.contract,
      sourceInventory: picked.sourceInventory,
      destinationInventory: picked.destinationInventory,
    })

    expect(custodyFailure.status).toBe('physical-recovery-required')
    expect(custodyFailure.contract.status).toBe('InCustody')
    expect(custodyFailure.sourceInventory.reservations[custodyFailure.contract.reservationId]?.status).toBe('consumed')
    expect(inventoryQuantity(custodyFailure.sourceInventory, PRODUCT_CATALOG.paperPackaging.productId)).toBe(1)
    expect(custodyFailure.missionState.missions[afterPickup.context.missionId].status).toBe('Failed')
  })

  it('delivers and completes through the existing mission engine with one settlement reference only', () => {
    const fixture = acceptedFixture()
    const picked = pickupAcceptedProducerMissionCargo(fixture.context)
    const delivered = completeProducerMissionDelivery({
      ...fixture.context,
      state: picked.missionState,
      contract: picked.contract,
      sourceInventory: picked.sourceInventory,
      destinationInventory: picked.destinationInventory,
    })

    expect(delivered.status).toBe('applied')
    expect(delivered.contract.status).toBe('Delivered')
    expect(delivered.sourceInventory.reservations[delivered.contract.reservationId]?.status).toBe('consumed')
    expect(inventoryQuantity(delivered.sourceInventory, PRODUCT_CATALOG.paperPackaging.productId)).toBe(1)
    expect(inventoryQuantity(delivered.destinationInventory, PRODUCT_CATALOG.paperPackaging.productId)).toBe(4)
    expect(delivered.missionState.missions[fixture.context.missionId].status).toBe('Completed')
    expect(delivered.emittedConsequences).toEqual([
      expect.objectContaining({
        consequence: {
          kind: 'EconomicSettlementReference',
          settlementRef: `settlement-intent:${delivered.contract.contractId}`,
        },
      }),
    ])
    expect(delivered.contract.settlementIntents).toHaveLength(1)

    const replay = completeProducerMissionDelivery({
      ...fixture.context,
      state: delivered.missionState,
      contract: delivered.contract,
      sourceInventory: delivered.sourceInventory,
      destinationInventory: delivered.destinationInventory,
    })
    expect(replay.status).toBe('duplicate')
    expect(replay.emittedConsequences).toEqual([])
    expect(replay.contract.settlementIntents).toHaveLength(1)
    expect(inventoryQuantity(replay.destinationInventory, PRODUCT_CATALOG.paperPackaging.productId)).toBe(4)
  })

  it('repairs a missing pre-custody reservation deterministically only when stock can still support it', () => {
    const fixture = materializedFixture()
    const missingReservation = {
      ...fixture.materialized.sourceInventory,
      reservations: {},
    }
    const repaired = repairProducerReservationReference(fixture.materialized.contract, missingReservation)

    expect(repaired.status).toBe('repaired')
    expect(repaired.contract.status).toBe('Reserved')
    expect(repaired.sourceInventory.reservations[repaired.contract.reservationId]).toMatchObject({
      productId: PRODUCT_CATALOG.paperPackaging.productId,
      quantity: 4,
      status: 'active',
    })
    expect(availableInventoryQuantity(repaired.sourceInventory, PRODUCT_CATALOG.paperPackaging.productId)).toBe(1)

    const impossible = repairProducerReservationReference(
      fixture.materialized.contract,
      createInventory({
        inventoryId: 'inventory:producer',
        nodeId: 'node:producer',
        capacityUnits: 20,
        initial: [{ productId: PRODUCT_CATALOG.paperPackaging.productId, quantity: 2 }],
      }),
    )
    expect(impossible).toMatchObject({
      status: 'rejected',
      reason: 'stale-reservation-cannot-repair:insufficient-available-inventory',
    })
  })

  it('repairs stale contract/reservation direction without consuming stock twice', () => {
    const fixture = acceptedFixture()
    const originalReservedContract = fixture.context.contract
    const picked = pickupAcceptedProducerMissionCargo(fixture.context)

    const repairedContract = repairProducerReservationReference(originalReservedContract, picked.sourceInventory)
    expect(repairedContract.status).toBe('repaired')
    expect(repairedContract.contract.status).toBe('InCustody')
    expect(repairedContract.sourceInventory.reservations[originalReservedContract.reservationId]?.status).toBe('consumed')
    expect(inventoryQuantity(repairedContract.sourceInventory, PRODUCT_CATALOG.paperPackaging.productId)).toBe(1)

    const staleInCustodySource = {
      ...fixture.context.sourceInventory,
      reservations: {
        ...fixture.context.sourceInventory.reservations,
      },
    }
    const repairedInventory = repairProducerReservationReference(picked.contract, staleInCustodySource)
    expect(repairedInventory.status).toBe('repaired')
    expect(repairedInventory.sourceInventory.reservations[picked.contract.reservationId]?.status).toBe('consumed')
    expect(inventoryQuantity(repairedInventory.sourceInventory, PRODUCT_CATALOG.paperPackaging.productId)).toBe(1)
  })
})
