import {
  consumeInventoryReservation,
  releaseInventoryReservation,
  reserveInventory,
  type InventoryReservation,
  type InventoryState,
} from '../inventory/inventory'
import { applyMissionEvent, startMission } from '../missions/missionEngine'
import type {
  MissionConsequenceIntent,
  MissionDefinition,
  MissionRuntimeState,
  MissionWorldFacts,
} from '../missions/missionModel'
import {
  cancelProducerLogisticsContract,
  deliverProducerCargo,
  failProducerLogisticsContract,
  pickupProducerCargo,
  type ProducerLogisticsContract,
} from './producerLogisticsContract'
import {
  reconcileProducerSystemicMission,
  withProducerContractFacts,
} from './producerSystemicMission'

export type ProducerReservationRepairStatus = 'clean' | 'repaired' | 'rejected'

export interface ProducerReservationRepairResult {
  status: ProducerReservationRepairStatus
  contract: ProducerLogisticsContract
  sourceInventory: InventoryState
  reason?: string
}

export type ProducerMissionLifecycleStatus =
  | 'applied'
  | 'duplicate'
  | 'released'
  | 'repaired'
  | 'physical-recovery-required'
  | 'rejected'

export interface ProducerMissionLifecycleResult {
  status: ProducerMissionLifecycleStatus
  contract: ProducerLogisticsContract
  sourceInventory: InventoryState
  destinationInventory: InventoryState
  missionState: MissionRuntimeState
  emittedConsequences: MissionConsequenceIntent[]
  reason?: string
}

export interface ProducerMissionLifecycleContext {
  definitions: readonly MissionDefinition[]
  state: MissionRuntimeState
  missionId: string
  contract: ProducerLogisticsContract
  sourceInventory: InventoryState
  destinationInventory: InventoryState
  facts: MissionWorldFacts
}

const reservationMatchesContract = (
  reservation: InventoryReservation,
  contract: ProducerLogisticsContract,
): boolean =>
  reservation.reservationId === contract.reservationId &&
  reservation.productId === contract.productId &&
  reservation.quantity === contract.quantity

const missionMatchesContract = (
  definitions: readonly MissionDefinition[],
  missionId: string,
  contract: ProducerLogisticsContract,
): boolean => {
  const definition = definitions.find(candidate => candidate.missionId === missionId)
  return definition?.category === 'ProducerSupplyChain' &&
    definition.source.kind === 'Systemic' &&
    definition.source.causeRef === contract.opportunityId &&
    definition.prerequisites.some(prerequisite =>
      prerequisite.kind === 'contractStatus' &&
      prerequisite.contractId === contract.contractId &&
      prerequisite.status === 'Reserved')
}

const rejectedLifecycle = (
  input: ProducerMissionLifecycleContext,
  contract: ProducerLogisticsContract,
  sourceInventory: InventoryState,
  reason: string,
): ProducerMissionLifecycleResult => ({
  status: 'rejected',
  contract,
  sourceInventory,
  destinationInventory: input.destinationInventory,
  missionState: input.state,
  emittedConsequences: [],
  reason,
})

const repairTerminalReservation = (
  contract: ProducerLogisticsContract,
  sourceInventory: InventoryState,
  reservation: InventoryReservation | undefined,
): ProducerReservationRepairResult => {
  if (!reservation || reservation.status === 'released') {
    return { status: 'clean', contract, sourceInventory }
  }
  if (!reservationMatchesContract(reservation, contract)) {
    return { status: 'rejected', contract, sourceInventory, reason: 'reservation-contract-mismatch' }
  }
  if (reservation.status === 'consumed') {
    return {
      status: 'rejected',
      contract,
      sourceInventory,
      reason: 'terminal-contract-has-consumed-reservation',
    }
  }
  const released = releaseInventoryReservation(sourceInventory, contract.reservationId)
  if (released.status === 'rejected') {
    return { status: 'rejected', contract, sourceInventory, reason: released.reason }
  }
  return { status: 'repaired', contract, sourceInventory: released.inventory }
}

/**
 * Repairs only state that can be reconstructed without inventing stock or teleporting cargo.
 * Ambiguous post-custody gaps are rejected for a higher authority to resolve.
 */
export const repairProducerReservationReference = (
  contract: ProducerLogisticsContract,
  sourceInventory: InventoryState,
): ProducerReservationRepairResult => {
  if (sourceInventory.nodeId !== contract.sourceNodeId) {
    return { status: 'rejected', contract, sourceInventory, reason: 'source-inventory-node-mismatch' }
  }

  const reservation = sourceInventory.reservations[contract.reservationId]
  if (reservation && !reservationMatchesContract(reservation, contract)) {
    return { status: 'rejected', contract, sourceInventory, reason: 'reservation-contract-mismatch' }
  }

  if (contract.status === 'Cancelled' || contract.status === 'Failed') {
    return repairTerminalReservation(contract, sourceInventory, reservation)
  }

  if (contract.status === 'Reserved') {
    if (!reservation) {
      const restored = reserveInventory(
        sourceInventory,
        contract.reservationId,
        contract.productId,
        contract.quantity,
      )
      if (restored.status === 'rejected') {
        return {
          status: 'rejected',
          contract,
          sourceInventory,
          reason: `stale-reservation-cannot-repair:${restored.reason}`,
        }
      }
      return { status: 'repaired', contract, sourceInventory: restored.inventory }
    }
    if (reservation.status === 'active') return { status: 'clean', contract, sourceInventory }
    if (reservation.status === 'released') {
      return { status: 'rejected', contract, sourceInventory, reason: 'reserved-contract-points-to-released-stock' }
    }

    const repairedContract = pickupProducerCargo(contract, sourceInventory)
    if (repairedContract.status === 'rejected' || !repairedContract.contract) {
      return {
        status: 'rejected',
        contract,
        sourceInventory,
        reason: repairedContract.reason ?? 'consumed-reservation-contract-repair-failed',
      }
    }
    return {
      status: 'repaired',
      contract: repairedContract.contract,
      sourceInventory: repairedContract.sourceInventory ?? sourceInventory,
    }
  }

  if (contract.status === 'InCustody' || contract.status === 'Delivered') {
    if (!reservation) {
      return {
        status: 'rejected',
        contract,
        sourceInventory,
        reason: contract.status === 'InCustody'
          ? 'reservation-missing-after-custody'
          : 'reservation-missing-after-delivery',
      }
    }
    if (reservation.status === 'consumed') return { status: 'clean', contract, sourceInventory }
    if (reservation.status === 'released') {
      return { status: 'rejected', contract, sourceInventory, reason: 'moved-cargo-points-to-released-reservation' }
    }

    const consumed = consumeInventoryReservation(sourceInventory, contract.reservationId)
    if (consumed.status === 'rejected') {
      return { status: 'rejected', contract, sourceInventory, reason: consumed.reason }
    }
    return { status: 'repaired', contract, sourceInventory: consumed.inventory }
  }

  return { status: 'clean', contract, sourceInventory }
}

const synchronizeMission = (
  input: ProducerMissionLifecycleContext,
  contract: ProducerLogisticsContract,
  state: MissionRuntimeState,
): { state: MissionRuntimeState; emittedConsequences: MissionConsequenceIntent[]; reason?: string } => {
  const reconciled = reconcileProducerSystemicMission({
    definitions: input.definitions,
    state,
    missionId: input.missionId,
    contract,
    facts: input.facts,
  })
  return {
    state: reconciled.state,
    emittedConsequences: reconciled.emittedConsequences,
    ...(reconciled.reason ? { reason: reconciled.reason } : {}),
  }
}

export const acceptProducerMissionReservation = (
  input: ProducerMissionLifecycleContext,
): ProducerMissionLifecycleResult => {
  if (!missionMatchesContract(input.definitions, input.missionId, input.contract)) {
    return rejectedLifecycle(input, input.contract, input.sourceInventory, 'producer-mission-binding-mismatch')
  }

  const repaired = repairProducerReservationReference(input.contract, input.sourceInventory)
  if (repaired.status === 'rejected') {
    return rejectedLifecycle(
      input,
      repaired.contract,
      repaired.sourceInventory,
      repaired.reason ?? 'reservation-repair-failed',
    )
  }
  if (repaired.contract.status !== 'Reserved' ||
    repaired.sourceInventory.reservations[repaired.contract.reservationId]?.status !== 'active') {
    return rejectedLifecycle(
      input,
      repaired.contract,
      repaired.sourceInventory,
      'reservation-not-active-for-mission-acceptance',
    )
  }

  const current = input.state.missions[input.missionId]
  if (current?.status === 'Active') {
    return {
      status: repaired.status === 'repaired' ? 'repaired' : 'duplicate',
      contract: repaired.contract,
      sourceInventory: repaired.sourceInventory,
      destinationInventory: input.destinationInventory,
      missionState: input.state,
      emittedConsequences: [],
    }
  }

  const facts = withProducerContractFacts(input.facts, repaired.contract)
  const started = startMission(input.definitions, input.state, input.missionId, facts)
  if (started.state.missions[input.missionId]?.status !== 'Active') {
    return {
      status: 'rejected',
      contract: repaired.contract,
      sourceInventory: repaired.sourceInventory,
      destinationInventory: input.destinationInventory,
      missionState: started.state,
      emittedConsequences: [],
      reason: started.reason ?? 'mission-not-accepted',
    }
  }

  return {
    status: 'applied',
    contract: repaired.contract,
    sourceInventory: repaired.sourceInventory,
    destinationInventory: input.destinationInventory,
    missionState: started.state,
    emittedConsequences: [],
  }
}

export const pickupAcceptedProducerMissionCargo = (
  input: ProducerMissionLifecycleContext,
): ProducerMissionLifecycleResult => {
  if (!missionMatchesContract(input.definitions, input.missionId, input.contract)) {
    return rejectedLifecycle(input, input.contract, input.sourceInventory, 'producer-mission-binding-mismatch')
  }
  if (input.state.missions[input.missionId]?.status !== 'Active') {
    return rejectedLifecycle(input, input.contract, input.sourceInventory, 'producer-mission-not-active')
  }

  const repaired = repairProducerReservationReference(input.contract, input.sourceInventory)
  if (repaired.status === 'rejected') {
    return rejectedLifecycle(
      input,
      repaired.contract,
      repaired.sourceInventory,
      repaired.reason ?? 'reservation-repair-failed',
    )
  }

  if (repaired.contract.status === 'InCustody') {
    const synced = synchronizeMission(input, repaired.contract, input.state)
    return {
      status: repaired.status === 'repaired' ? 'repaired' : 'duplicate',
      contract: repaired.contract,
      sourceInventory: repaired.sourceInventory,
      destinationInventory: input.destinationInventory,
      missionState: synced.state,
      emittedConsequences: synced.emittedConsequences,
      ...(synced.reason ? { reason: synced.reason } : {}),
    }
  }
  if (repaired.contract.status !== 'Reserved') {
    return rejectedLifecycle(input, repaired.contract, repaired.sourceInventory, 'contract-not-pickup-ready')
  }

  const picked = pickupProducerCargo(repaired.contract, repaired.sourceInventory)
  if (picked.status === 'rejected' || !picked.contract) {
    return rejectedLifecycle(
      input,
      repaired.contract,
      picked.sourceInventory ?? repaired.sourceInventory,
      picked.reason ?? 'producer-pickup-failed',
    )
  }

  const sourceInventory = picked.sourceInventory ?? repaired.sourceInventory
  const synced = synchronizeMission(input, picked.contract, input.state)
  return {
    status: picked.status === 'duplicate' ? 'duplicate' : 'applied',
    contract: picked.contract,
    sourceInventory,
    destinationInventory: input.destinationInventory,
    missionState: synced.state,
    emittedConsequences: synced.emittedConsequences,
    ...(synced.reason ? { reason: synced.reason } : {}),
  }
}

export const completeProducerMissionDelivery = (
  input: ProducerMissionLifecycleContext,
): ProducerMissionLifecycleResult => {
  if (!missionMatchesContract(input.definitions, input.missionId, input.contract)) {
    return rejectedLifecycle(input, input.contract, input.sourceInventory, 'producer-mission-binding-mismatch')
  }

  const repaired = repairProducerReservationReference(input.contract, input.sourceInventory)
  if (repaired.status === 'rejected') {
    return rejectedLifecycle(
      input,
      repaired.contract,
      repaired.sourceInventory,
      repaired.reason ?? 'reservation-repair-failed',
    )
  }

  if (repaired.contract.status === 'Delivered') {
    const synced = synchronizeMission(input, repaired.contract, input.state)
    return {
      status: repaired.status === 'repaired' ? 'repaired' : 'duplicate',
      contract: repaired.contract,
      sourceInventory: repaired.sourceInventory,
      destinationInventory: input.destinationInventory,
      missionState: synced.state,
      emittedConsequences: synced.emittedConsequences,
      ...(synced.reason ? { reason: synced.reason } : {}),
    }
  }
  if (repaired.contract.status !== 'InCustody') {
    return rejectedLifecycle(input, repaired.contract, repaired.sourceInventory, 'cargo-not-in-custody')
  }

  const delivered = deliverProducerCargo(repaired.contract, input.destinationInventory)
  if (delivered.status === 'rejected' || !delivered.contract) {
    return rejectedLifecycle(
      input,
      repaired.contract,
      repaired.sourceInventory,
      delivered.reason ?? 'producer-delivery-failed',
    )
  }

  const destinationInventory = delivered.destinationInventory ?? input.destinationInventory
  const synced = synchronizeMission(input, delivered.contract, input.state)
  return {
    status: delivered.status === 'duplicate' ? 'duplicate' : 'applied',
    contract: delivered.contract,
    sourceInventory: repaired.sourceInventory,
    destinationInventory,
    missionState: synced.state,
    emittedConsequences: synced.emittedConsequences,
    ...(synced.reason ? { reason: synced.reason } : {}),
  }
}

export const cancelProducerMissionReservation = (
  input: ProducerMissionLifecycleContext,
): ProducerMissionLifecycleResult => {
  if (!missionMatchesContract(input.definitions, input.missionId, input.contract)) {
    return rejectedLifecycle(input, input.contract, input.sourceInventory, 'producer-mission-binding-mismatch')
  }

  const repaired = repairProducerReservationReference(input.contract, input.sourceInventory)
  if (repaired.status === 'rejected') {
    return rejectedLifecycle(
      input,
      repaired.contract,
      repaired.sourceInventory,
      repaired.reason ?? 'reservation-repair-failed',
    )
  }
  if (repaired.contract.status === 'InCustody') {
    return {
      status: 'physical-recovery-required',
      contract: repaired.contract,
      sourceInventory: repaired.sourceInventory,
      destinationInventory: input.destinationInventory,
      missionState: input.state,
      emittedConsequences: [],
      reason: 'cargo-already-in-custody',
    }
  }
  if (repaired.contract.status === 'Delivered') {
    return rejectedLifecycle(input, repaired.contract, repaired.sourceInventory, 'contract-already-delivered')
  }
  if (repaired.contract.status === 'Cancelled') {
    const synced = synchronizeMission(input, repaired.contract, input.state)
    return {
      status: repaired.status === 'repaired' ? 'repaired' : 'duplicate',
      contract: repaired.contract,
      sourceInventory: repaired.sourceInventory,
      destinationInventory: input.destinationInventory,
      missionState: synced.state,
      emittedConsequences: synced.emittedConsequences,
      ...(synced.reason ? { reason: synced.reason } : {}),
    }
  }
  if (repaired.contract.status === 'Failed') {
    return rejectedLifecycle(input, repaired.contract, repaired.sourceInventory, 'contract-already-failed')
  }

  const cancelled = cancelProducerLogisticsContract(repaired.contract, repaired.sourceInventory)
  if (cancelled.status === 'rejected' || !cancelled.contract) {
    return rejectedLifecycle(
      input,
      repaired.contract,
      cancelled.sourceInventory ?? repaired.sourceInventory,
      cancelled.reason ?? 'producer-cancellation-failed',
    )
  }
  const sourceInventory = cancelled.sourceInventory ?? repaired.sourceInventory
  const synced = synchronizeMission(input, cancelled.contract, input.state)
  return {
    status: 'released',
    contract: cancelled.contract,
    sourceInventory,
    destinationInventory: input.destinationInventory,
    missionState: synced.state,
    emittedConsequences: synced.emittedConsequences,
    ...(synced.reason ? { reason: synced.reason } : {}),
  }
}

export const failProducerMissionReservation = (
  input: ProducerMissionLifecycleContext,
): ProducerMissionLifecycleResult => {
  if (!missionMatchesContract(input.definitions, input.missionId, input.contract)) {
    return rejectedLifecycle(input, input.contract, input.sourceInventory, 'producer-mission-binding-mismatch')
  }

  const repaired = repairProducerReservationReference(input.contract, input.sourceInventory)
  if (repaired.status === 'rejected') {
    return rejectedLifecycle(
      input,
      repaired.contract,
      repaired.sourceInventory,
      repaired.reason ?? 'reservation-repair-failed',
    )
  }

  if (repaired.contract.status === 'Reserved') {
    const failed = failProducerLogisticsContract(repaired.contract, repaired.sourceInventory)
    if (failed.status === 'rejected' || !failed.contract) {
      return rejectedLifecycle(
        input,
        repaired.contract,
        failed.sourceInventory ?? repaired.sourceInventory,
        failed.reason ?? 'producer-failure-release-failed',
      )
    }
    const sourceInventory = failed.sourceInventory ?? repaired.sourceInventory
    const synced = synchronizeMission(input, failed.contract, input.state)
    return {
      status: 'released',
      contract: failed.contract,
      sourceInventory,
      destinationInventory: input.destinationInventory,
      missionState: synced.state,
      emittedConsequences: synced.emittedConsequences,
      ...(synced.reason ? { reason: synced.reason } : {}),
    }
  }

  if (repaired.contract.status === 'InCustody') {
    const synced = synchronizeMission(input, repaired.contract, input.state)
    const facts = withProducerContractFacts(input.facts, repaired.contract)
    const failedMission = applyMissionEvent(
      input.definitions,
      synced.state,
      input.missionId,
      {
        eventId: `producer-mission:${repaired.contract.contractId}:custody-failure`,
        kind: 'Fail',
        reason: 'producer-cargo-requires-physical-recovery',
      },
      facts,
    )
    return {
      status: 'physical-recovery-required',
      contract: repaired.contract,
      sourceInventory: repaired.sourceInventory,
      destinationInventory: input.destinationInventory,
      missionState: failedMission.state,
      emittedConsequences: [...synced.emittedConsequences, ...failedMission.emittedConsequences],
      reason: 'cargo-already-in-custody',
    }
  }

  if (repaired.contract.status === 'Delivered') {
    return rejectedLifecycle(input, repaired.contract, repaired.sourceInventory, 'contract-already-delivered')
  }

  const synced = synchronizeMission(input, repaired.contract, input.state)
  return {
    status: repaired.status === 'repaired' ? 'repaired' : 'duplicate',
    contract: repaired.contract,
    sourceInventory: repaired.sourceInventory,
    destinationInventory: input.destinationInventory,
    missionState: synced.state,
    emittedConsequences: synced.emittedConsequences,
    ...(synced.reason ? { reason: synced.reason } : {}),
  }
}
