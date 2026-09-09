import { applyMissionEvent, validateMissionGraph } from '../missions/missionEngine'
import type {
  MissionDefinition,
  MissionEvent,
  MissionRuntimeState,
  MissionTransitionResult,
  MissionWorldFacts,
} from '../missions/missionModel'
import type { InventoryState } from '../inventory/inventory'
import { productDefinition } from '../production/productCatalog'
import {
  createProducerLogisticsContract,
  type ProducerLogisticsContract,
} from './producerLogisticsContract'
import type { LogisticsOpportunity } from './regionalSupplyDemand'

export const PRODUCER_SYSTEMIC_MISSION_SIGNALS = Object.freeze({
  inCustody: 'producer-logistics:in-custody',
  delivered: 'producer-logistics:delivered',
})

export interface ProducerSystemicMissionInput {
  missionId: string
  missionLabel?: string
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
}

export type ProducerSystemicMissionMaterialization =
  | {
      status: 'applied' | 'duplicate'
      missionDefinition: MissionDefinition
      contract: ProducerLogisticsContract
      sourceInventory: InventoryState
      destinationInventory: InventoryState
    }
  | {
      status: 'rejected'
      reason: string
      sourceInventory: InventoryState
      destinationInventory: InventoryState
    }

const validId = (value: string): boolean => value.trim().length > 0 && value.trim().length <= 180
const validPositiveInteger = (value: number): boolean => Number.isSafeInteger(value) && value > 0

const opportunityIsValid = (opportunity: LogisticsOpportunity): boolean =>
  validId(opportunity.opportunityId) &&
  validId(opportunity.supplyId) &&
  validId(opportunity.demandId) &&
  validId(opportunity.worldInstanceId) &&
  validId(opportunity.productId) &&
  validId(opportunity.sourceNodeId) &&
  validId(opportunity.destinationNodeId) &&
  opportunity.sourceNodeId !== opportunity.destinationNodeId &&
  validPositiveInteger(opportunity.quantity)

const settlementRefFor = (contractId: string): string => `settlement-intent:${contractId}`

export const buildProducerSystemicMissionDefinition = (input: {
  missionId: string
  contractId: string
  opportunity: LogisticsOpportunity
  missionLabel?: string
}): MissionDefinition => {
  const product = productDefinition(input.opportunity.productId)
  const productLabel = product?.name ?? 'Goods'

  return {
    missionId: input.missionId,
    category: 'ProducerSupplyChain',
    source: { kind: 'Systemic', causeRef: input.opportunity.opportunityId },
    label: input.missionLabel ?? `${productLabel} supply run`,
    prerequisites: [{ kind: 'contractStatus', contractId: input.contractId, status: 'Reserved' }],
    availability: 'Prerequisites',
    startStageId: 'producer-pickup',
    stages: [
      {
        stageId: 'producer-pickup',
        label: 'Collect producer cargo',
        objectives: [{
          objectiveId: 'producer-pickup-complete',
          kind: 'signal',
          signalType: PRODUCER_SYSTEMIC_MISSION_SIGNALS.inCustody,
          referenceId: input.contractId,
          label: `Collect ${input.opportunity.quantity} ${productLabel.toLowerCase()} units`,
        }],
        next: { stageId: 'producer-delivery' },
      },
      {
        stageId: 'producer-delivery',
        label: 'Deliver producer cargo',
        objectives: [{
          objectiveId: 'producer-delivery-complete',
          kind: 'signal',
          signalType: PRODUCER_SYSTEMIC_MISSION_SIGNALS.delivered,
          referenceId: input.contractId,
          label: 'Deliver the reserved cargo to real destination demand',
        }],
      },
    ],
    completionConsequences: [{
      kind: 'EconomicSettlementReference',
      settlementRef: settlementRefFor(input.contractId),
    }],
    failurePolicy: { kind: 'FailedBranch', unlocks: [] },
  }
}

export const materializeProducerSystemicMission = (
  input: ProducerSystemicMissionInput,
): ProducerSystemicMissionMaterialization => {
  if (!validId(input.missionId) || !validId(input.contractId) || !opportunityIsValid(input.opportunity)) {
    return {
      status: 'rejected',
      reason: 'invalid-systemic-mission-identity-or-opportunity',
      sourceInventory: input.sourceInventory,
      destinationInventory: input.destinationInventory,
    }
  }

  const missionDefinition = buildProducerSystemicMissionDefinition(input)
  const graph = validateMissionGraph([missionDefinition])
  if (!graph.valid) {
    return {
      status: 'rejected',
      reason: `invalid-systemic-mission-definition:${graph.errors.join('|')}`,
      sourceInventory: input.sourceInventory,
      destinationInventory: input.destinationInventory,
    }
  }

  const created = createProducerLogisticsContract({
    contractId: input.contractId,
    cargoId: input.cargoId,
    opportunity: input.opportunity,
    sourceInventory: input.sourceInventory,
    destinationInventory: input.destinationInventory,
    producerActorId: input.producerActorId,
    recipientActorId: input.recipientActorId,
    logisticsPayerActorId: input.logisticsPayerActorId,
    logisticsProviderActorId: input.logisticsProviderActorId,
    transportCapacityUnits: input.transportCapacityUnits,
  })

  if (created.status === 'rejected') {
    return {
      status: 'rejected',
      reason: created.reason,
      sourceInventory: created.sourceInventory ?? input.sourceInventory,
      destinationInventory: created.destinationInventory ?? input.destinationInventory,
    }
  }

  return {
    status: created.status,
    missionDefinition,
    contract: created.contract,
    sourceInventory: created.sourceInventory ?? input.sourceInventory,
    destinationInventory: created.destinationInventory ?? input.destinationInventory,
  }
}

export const withProducerContractFacts = (
  facts: MissionWorldFacts,
  contract: ProducerLogisticsContract,
): MissionWorldFacts => ({
  ...facts,
  contractStatuses: {
    ...facts.contractStatuses,
    [contract.contractId]: contract.status,
  },
})

export const producerContractMissionEvents = (
  contract: ProducerLogisticsContract,
): readonly MissionEvent[] => {
  const pickup: MissionEvent = {
    eventId: `producer-mission:${contract.contractId}:in-custody`,
    kind: 'Signal',
    signalType: PRODUCER_SYSTEMIC_MISSION_SIGNALS.inCustody,
    referenceId: contract.contractId,
  }
  const delivered: MissionEvent = {
    eventId: `producer-mission:${contract.contractId}:delivered`,
    kind: 'Signal',
    signalType: PRODUCER_SYSTEMIC_MISSION_SIGNALS.delivered,
    referenceId: contract.contractId,
  }

  switch (contract.status) {
    case 'Reserved':
      return []
    case 'InCustody':
      return [pickup]
    case 'Delivered':
      return [pickup, delivered]
    case 'Cancelled':
    case 'Failed':
      return [{
        eventId: `producer-mission:${contract.contractId}:terminal:${contract.status}`,
        kind: 'Fail',
        reason: `producer-contract-${contract.status.toLowerCase()}`,
      }]
  }
}

const definitionMatchesContract = (
  definition: MissionDefinition | undefined,
  contract: ProducerLogisticsContract,
): boolean =>
  definition?.category === 'ProducerSupplyChain' &&
  definition.source.kind === 'Systemic' &&
  definition.source.causeRef === contract.opportunityId &&
  definition.prerequisites.some(prerequisite =>
    prerequisite.kind === 'contractStatus' &&
    prerequisite.contractId === contract.contractId &&
    prerequisite.status === 'Reserved')

export const reconcileProducerSystemicMission = (input: {
  definitions: readonly MissionDefinition[]
  state: MissionRuntimeState
  missionId: string
  contract: ProducerLogisticsContract
  facts: MissionWorldFacts
}): MissionTransitionResult => {
  const definition = input.definitions.find(candidate => candidate.missionId === input.missionId)
  if (!definitionMatchesContract(definition, input.contract)) {
    return {
      state: input.state,
      changed: false,
      reason: 'producer-mission-binding-mismatch',
      emittedConsequences: [],
    }
  }

  const facts = withProducerContractFacts(input.facts, input.contract)
  let state = input.state
  let changed = false
  let reason: string | undefined
  const emittedConsequences: MissionTransitionResult['emittedConsequences'] = []

  for (const event of producerContractMissionEvents(input.contract)) {
    const result = applyMissionEvent(
      input.definitions,
      state,
      input.missionId,
      event,
      facts,
    )
    state = result.state
    changed = changed || result.changed
    emittedConsequences.push(...result.emittedConsequences)
    if (result.reason && result.reason !== 'duplicate-event') reason = result.reason
  }

  return reason
    ? { state, changed, reason, emittedConsequences }
    : { state, changed, emittedConsequences }
}
