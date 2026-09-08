import {
  addInventory,
  consumeInventoryReservation,
  releaseInventoryReservation,
  remainingInventoryCapacity,
  reserveInventory,
  type InventoryState,
} from '../inventory/inventory'
import type { ProductId } from '../production/productCatalog'
import type { LogisticsOpportunity } from './regionalSupplyDemand'

export type ProducerLogisticsContractStatus = 'Reserved' | 'InCustody' | 'Delivered' | 'Cancelled' | 'Failed'

export interface CargoCustodyState {
  cargoId: string
  productId: ProductId
  quantity: number
  ownerActorId: string
  custodianActorId: string
  location: { kind: 'InTransit'; sourceNodeId: string; destinationNodeId: string }
    | { kind: 'Destination'; nodeId: string }
}

export interface ProducerLogisticsSettlementIntent {
  eventId: string
  contractId: string
  productId: ProductId
  quantity: number
  goodsPayerActorId: string
  goodsPayeeActorId: string
  logisticsPayerActorId: string
  logisticsPayeeActorId: string
  monetarySettlement: 'ExternalLedgerRequired'
}

export interface ProducerLogisticsContract {
  contractId: string
  opportunityId: string
  worldInstanceId: string
  productId: ProductId
  quantity: number
  sourceNodeId: string
  destinationNodeId: string
  producerActorId: string
  recipientActorId: string
  logisticsPayerActorId: string
  logisticsProviderActorId: string
  reservationId: string
  cargoId: string
  status: ProducerLogisticsContractStatus
  cargo?: CargoCustodyState
  settlementIntents: readonly ProducerLogisticsSettlementIntent[]
}

export type ContractResult =
  | { status: 'applied'; contract: ProducerLogisticsContract; sourceInventory?: InventoryState; destinationInventory?: InventoryState }
  | { status: 'duplicate'; contract: ProducerLogisticsContract; sourceInventory?: InventoryState; destinationInventory?: InventoryState }
  | { status: 'rejected'; contract?: ProducerLogisticsContract; sourceInventory?: InventoryState; destinationInventory?: InventoryState; reason: string }

const validId = (value: string): boolean => value.trim().length > 0 && value.trim().length <= 160

const inCustodyContract = (contract: ProducerLogisticsContract): ProducerLogisticsContract => ({
  ...contract,
  status: 'InCustody',
  cargo: {
    cargoId: contract.cargoId,
    productId: contract.productId,
    quantity: contract.quantity,
    ownerActorId: contract.producerActorId,
    custodianActorId: contract.logisticsProviderActorId,
    location: { kind: 'InTransit', sourceNodeId: contract.sourceNodeId, destinationNodeId: contract.destinationNodeId },
  },
})

const settlementIntentFor = (contract: ProducerLogisticsContract): ProducerLogisticsSettlementIntent => ({
  eventId: `settlement-intent:${contract.contractId}`,
  contractId: contract.contractId,
  productId: contract.productId,
  quantity: contract.quantity,
  goodsPayerActorId: contract.recipientActorId,
  goodsPayeeActorId: contract.producerActorId,
  logisticsPayerActorId: contract.logisticsPayerActorId,
  logisticsPayeeActorId: contract.logisticsProviderActorId,
  monetarySettlement: 'ExternalLedgerRequired',
})

const deliveredContract = (contract: ProducerLogisticsContract): ProducerLogisticsContract => {
  const intent = settlementIntentFor(contract)
  const settlementIntents = contract.settlementIntents.some(existing => existing.eventId === intent.eventId)
    ? [...contract.settlementIntents]
    : [...contract.settlementIntents, intent]
  return {
    ...contract,
    status: 'Delivered',
    cargo: {
      cargoId: contract.cargoId,
      productId: contract.productId,
      quantity: contract.quantity,
      ownerActorId: contract.recipientActorId,
      custodianActorId: contract.recipientActorId,
      location: { kind: 'Destination', nodeId: contract.destinationNodeId },
    },
    settlementIntents,
  }
}

export const createProducerLogisticsContract = (input: {
  contractId: string
  cargoId: string
  opportunity: LogisticsOpportunity
  sourceInventory: InventoryState
  destinationInventory: InventoryState
  producerActorId: string
  recipientActorId: string
  logisticsPayerActorId: string
  logisticsProviderActorId: string
  transportCapacityUnits: number
}): ContractResult => {
  if (![input.contractId, input.cargoId, input.producerActorId, input.recipientActorId, input.logisticsPayerActorId, input.logisticsProviderActorId].every(validId)) {
    return { status: 'rejected', reason: 'invalid-contract-identity' }
  }
  if (!Number.isSafeInteger(input.transportCapacityUnits) || input.transportCapacityUnits <= 0) {
    return { status: 'rejected', reason: 'invalid-transport-capacity' }
  }
  if (input.opportunity.quantity > input.transportCapacityUnits) return { status: 'rejected', reason: 'transport-capacity-exceeded' }
  if (input.opportunity.sourceNodeId !== input.sourceInventory.nodeId || input.opportunity.destinationNodeId !== input.destinationInventory.nodeId) {
    return { status: 'rejected', reason: 'inventory-node-mismatch' }
  }
  if (input.opportunity.quantity > remainingInventoryCapacity(input.destinationInventory)) {
    return { status: 'rejected', reason: 'destination-capacity-insufficient' }
  }
  const reservationId = `reservation:${input.contractId}`
  const contract: ProducerLogisticsContract = {
    contractId: input.contractId,
    opportunityId: input.opportunity.opportunityId,
    worldInstanceId: input.opportunity.worldInstanceId,
    productId: input.opportunity.productId,
    quantity: input.opportunity.quantity,
    sourceNodeId: input.opportunity.sourceNodeId,
    destinationNodeId: input.opportunity.destinationNodeId,
    producerActorId: input.producerActorId,
    recipientActorId: input.recipientActorId,
    logisticsPayerActorId: input.logisticsPayerActorId,
    logisticsProviderActorId: input.logisticsProviderActorId,
    reservationId,
    cargoId: input.cargoId,
    status: 'Reserved',
    settlementIntents: [],
  }
  const reserved = reserveInventory(input.sourceInventory, reservationId, input.opportunity.productId, input.opportunity.quantity)
  if (reserved.status === 'duplicate') {
    const existing = input.sourceInventory.reservations[reservationId]
    if (existing?.status === 'active' && existing.productId === input.opportunity.productId && existing.quantity === input.opportunity.quantity) {
      return { status: 'duplicate', contract, sourceInventory: input.sourceInventory, destinationInventory: input.destinationInventory }
    }
    return { status: 'rejected', contract, sourceInventory: input.sourceInventory, reason: 'reservation-id-already-used' }
  }
  if (reserved.status === 'rejected') {
    return { status: 'rejected', contract, sourceInventory: input.sourceInventory, reason: reserved.reason }
  }
  return { status: 'applied', contract, sourceInventory: reserved.inventory, destinationInventory: input.destinationInventory }
}

export const pickupProducerCargo = (contract: ProducerLogisticsContract, sourceInventory: InventoryState): ContractResult => {
  if (contract.status === 'InCustody' || contract.status === 'Delivered') return { status: 'duplicate', contract, sourceInventory }
  if (contract.status !== 'Reserved') return { status: 'rejected', contract, sourceInventory, reason: 'contract-not-pickup-ready' }
  const reservation = sourceInventory.reservations[contract.reservationId]
  if (reservation?.status === 'consumed') {
    return { status: 'duplicate', contract: inCustodyContract(contract), sourceInventory }
  }
  if (reservation?.status === 'released') {
    return { status: 'rejected', contract, sourceInventory, reason: 'reservation-already-released' }
  }
  const consumed = consumeInventoryReservation(sourceInventory, contract.reservationId)
  if (consumed.status === 'duplicate') return { status: 'duplicate', contract: inCustodyContract(contract), sourceInventory: consumed.inventory }
  if (consumed.status === 'rejected') return { status: 'rejected', contract, sourceInventory: consumed.inventory, reason: consumed.reason }
  return { status: 'applied', sourceInventory: consumed.inventory, contract: inCustodyContract(contract) }
}

export const deliverProducerCargo = (contract: ProducerLogisticsContract, destinationInventory: InventoryState): ContractResult => {
  if (contract.status === 'Delivered') return { status: 'duplicate', contract: deliveredContract(contract), destinationInventory }
  if (contract.status !== 'InCustody' || !contract.cargo) {
    return { status: 'rejected', contract, destinationInventory, reason: 'cargo-not-in-custody' }
  }
  const added = addInventory(destinationInventory, `delivery:${contract.contractId}`, contract.productId, contract.quantity)
  if (added.status === 'duplicate') {
    return { status: 'duplicate', contract: deliveredContract(contract), destinationInventory: added.inventory }
  }
  if (added.status === 'rejected') return { status: 'rejected', contract, destinationInventory: added.inventory, reason: added.reason }
  return { status: 'applied', destinationInventory: added.inventory, contract: deliveredContract(contract) }
}

const terminateReservedContract = (
  contract: ProducerLogisticsContract,
  sourceInventory: InventoryState,
  terminalStatus: 'Cancelled' | 'Failed',
): ContractResult => {
  if (contract.status === terminalStatus) return { status: 'duplicate', contract, sourceInventory }
  if (contract.status !== 'Reserved') {
    return { status: 'rejected', contract, sourceInventory, reason: 'cargo-already-moved-or-contract-terminal' }
  }
  const reservation = sourceInventory.reservations[contract.reservationId]
  if (reservation?.status === 'consumed') {
    return { status: 'rejected', contract, sourceInventory, reason: 'cargo-already-moved-or-contract-terminal' }
  }
  if (reservation?.status === 'released') {
    return { status: 'duplicate', contract: { ...contract, status: terminalStatus }, sourceInventory }
  }
  const released = releaseInventoryReservation(sourceInventory, contract.reservationId)
  if (released.status === 'duplicate') return { status: 'duplicate', contract: { ...contract, status: terminalStatus }, sourceInventory: released.inventory }
  if (released.status === 'rejected') return { status: 'rejected', contract, sourceInventory: released.inventory, reason: released.reason }
  return { status: 'applied', contract: { ...contract, status: terminalStatus }, sourceInventory: released.inventory }
}

export const cancelProducerLogisticsContract = (contract: ProducerLogisticsContract, sourceInventory: InventoryState): ContractResult =>
  terminateReservedContract(contract, sourceInventory, 'Cancelled')

export const failProducerLogisticsContract = (contract: ProducerLogisticsContract, sourceInventory: InventoryState): ContractResult =>
  terminateReservedContract(contract, sourceInventory, 'Failed')
