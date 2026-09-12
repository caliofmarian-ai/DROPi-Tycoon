import type { PlayerWorkActivityId } from '../capabilities/playerEconomyWorkAccess'
import type { settleLegitimateDeliveryProgression } from '../economy/deliveryProgressionSettlement'
import {
  getFirstHourStoryTrigger,
  resolveFirstHourStoryRoles,
  type FirstHourStoryRoleBinding,
  type FirstHourStoryRoleContext,
  type FirstHourStoryRoleId,
  type FirstHourStoryTriggerId,
} from '../narrative/firstHourStoryRuntimeHandoff'
import type { EconomicNodeCityEndpointRef } from '../production/production'
import {
  citywideEconomicEndpointIdentity,
  type CitywideEconomicEndpointAuthority,
  type GovernedCitywideEconomicEndpoint,
  type GeographicallyBoundLogisticsOpportunity,
} from '../trade/citywideEconomicEndpoints'
import {
  bindProducerLogisticsOpportunityToCitywideDelivery,
  selectCitywideDeliveryOpportunity,
  type CitywideDeliveryCandidateEvaluation,
  type CitywideDeliveryDistributionAuthorityPort,
  type CitywideDeliverySelection,
  type CitywideDeliverySelectionHistoryRecord,
  type CitywideDeliveryWorkExclusion,
} from './citywideDeliveryDistribution'
import { refreshMissionAvailability, startMission } from './missionEngine'
import type {
  MissionConsequenceIntent,
  MissionDefinition,
  MissionDeliveryReference,
  MissionRuntimeState,
  MissionWorldFacts,
} from './missionModel'

export const LOCALITY_DELIVERY_MATERIALIZATION_VERSION = 2 as const

export type LocalityDeliveryPurpose = 'starter' | 'normal'

type CanonicalDt03SettlementArgs = Parameters<typeof settleLegitimateDeliveryProgression>
export type CanonicalDt03SourceOrder = CanonicalDt03SettlementArgs[4]
export type CanonicalDt03SettledInteraction = CanonicalDt03SettlementArgs[5]
export type CanonicalDt03DeliveryEvidence = CanonicalDt03SettlementArgs[6]

export interface LocalityDeliveryWorkCandidate {
  /** Existing DT-07 cause already bound to one governed locality endpoint authority. */
  boundOpportunity: GeographicallyBoundLogisticsOpportunity
  /** Existing order/DeliveryMission authority. No delivery or parcel is created here. */
  delivery: MissionDeliveryReference
  /** Existing Mission Framework definition that will execute the selected work. */
  missionId: string
  purpose: LocalityDeliveryPurpose
  compatibleWorkActivityIds: readonly PlayerWorkActivityId[]
  /** Canonical #673 evidence shape. DT-09 carries it read-only and never settles it. */
  settlementEvidence: CanonicalDt03DeliveryEvidence
  /** Local cast requirements are resolved through the DT-08 handoff, never inferred by DT-09. */
  requiredStoryRoles?: readonly FirstHourStoryRoleId[]
  /** Optional existing DT-08 trigger. Current shipped trigger definitions are Brăila-authored. */
  storyTriggerId?: FirstHourStoryTriggerId
}

export type LocalityDeliveryCandidateBlocker =
  | 'invalid-candidate'
  | 'locality-mismatch'
  | 'world-instance-mismatch'
  | 'source-checkpoint-mismatch'
  | 'endpoint-authority-mismatch'
  | 'mission-binding-mismatch'
  | 'mission-not-available'
  | 'settlement-reference-missing'
  | 'settlement-reference-ambiguous'
  | 'settlement-evidence-mismatch'
  | 'story-context-missing'
  | 'story-locality-mismatch'
  | 'story-role-unavailable'
  | 'story-trigger-mismatch'

export interface LocalityDeliveryCandidateEvaluation {
  opportunityId: string
  missionId: string
  eligible: boolean
  blockers: readonly LocalityDeliveryCandidateBlocker[]
}

export interface LocalityDeliveryStoryAcknowledgementHandoff {
  receiptId: string
  signalType: string
  status: 'pending' | 'already-processed'
  referenceActorId?: string
}

export interface LocalityDeliveryStoryHandoff {
  triggerId?: FirstHourStoryTriggerId
  roleBindings: readonly FirstHourStoryRoleBinding[]
  acknowledgement?: LocalityDeliveryStoryAcknowledgementHandoff
}

/**
 * Immutable expectations carried from work materialization to delivery acceptance.
 * This is not a settlement request. It contains no reward amount, XP, loyalty or fragment grant.
 */
export interface LocalityDeliverySettlementBoundary {
  localityId: string
  worldInstanceId: string
  sourceCheckpoint: string
  opportunityId: string
  missionId: string
  delivery: MissionDeliveryReference
  settlementReference: string
  settlementEvidence: CanonicalDt03DeliveryEvidence
  acknowledgementReceiptId?: string
}

export type LocalityDeliveryMaterializationResult =
  | {
      status: 'materialized'
      selection: CitywideDeliverySelection
      missionId: string
      missionState: MissionRuntimeState
      settlementBoundary: LocalityDeliverySettlementBoundary
      storyHandoff?: LocalityDeliveryStoryHandoff
      candidateEvaluations: readonly LocalityDeliveryCandidateEvaluation[]
      citywideEvaluations: readonly CitywideDeliveryCandidateEvaluation[]
    }
  | {
      status: 'unavailable'
      reason:
        | 'invalid-runtime-context'
        | 'locality-authority-mismatch'
        | 'no-local-opportunities'
        | 'no-materializable-opportunities'
        | 'citywide-selection-unavailable'
        | 'mission-start-unavailable'
      candidateEvaluations: readonly LocalityDeliveryCandidateEvaluation[]
      citywideEvaluations: readonly CitywideDeliveryCandidateEvaluation[]
    }

export interface CanonicalDt03SettlementHandoff {
  /** Exact inputs consumed by canonical #673; downstream DT-03 supplies its own state, clock and governed grant. */
  sourceOrder: CanonicalDt03SourceOrder
  interaction: CanonicalDt03SettledInteraction
  evidence: CanonicalDt03DeliveryEvidence
}

export interface LocalityDeliverySettlementRequest {
  status: 'SETTLEMENT_REQUESTED'
  localityId: string
  worldInstanceId: string
  missionId: string
  missionCompletionReceiptId: string
  consequenceIntentId: string
  settlementRef: string
  delivery: MissionDeliveryReference
  dt03: CanonicalDt03SettlementHandoff
}

export type LocalityDeliverySettlementRequestResult =
  | LocalityDeliverySettlementRequest
  | {
      status: 'rejected'
      reason:
        | 'invalid-boundary'
        | 'locality-mismatch'
        | 'mission-mismatch'
        | 'acknowledgement-mismatch'
        | 'custody-mismatch'
        | 'cargo-mismatch'
        | 'payment-evidence-mismatch'
        | 'settlement-evidence-mismatch'
    }

interface CandidateResolution {
  candidate: LocalityDeliveryWorkCandidate
  evaluation: LocalityDeliveryCandidateEvaluation
  definition?: MissionDefinition
  storyHandoff?: LocalityDeliveryStoryHandoff
}

const validId = (value: string): boolean => value.trim().length > 0 && value.trim().length <= 180

const sameParcels = (left: readonly string[], right: readonly string[]): boolean => {
  const a = [...left].sort()
  const b = [...right].sort()
  return a.length === b.length && a.every((parcelId, index) => parcelId === b[index])
}

const sameDeliveryReference = (left: MissionDeliveryReference, right: MissionDeliveryReference): boolean =>
  left.deliveryMissionId === right.deliveryMissionId &&
  left.orderId === right.orderId &&
  sameParcels(left.parcelIds, right.parcelIds)

const cloneDeliveryReference = (delivery: MissionDeliveryReference): MissionDeliveryReference => ({
  deliveryMissionId: delivery.deliveryMissionId,
  orderId: delivery.orderId,
  parcelIds: [...delivery.parcelIds],
})

const cloneSettlementEvidence = (evidence: CanonicalDt03DeliveryEvidence): CanonicalDt03DeliveryEvidence => ({
  servedEntityId: evidence.servedEntityId,
  sourceKind: evidence.sourceKind,
  ...(evidence.marketplace ? { marketplace: { ...evidence.marketplace } } : {}),
})

const sameSettlementEvidence = (
  left: CanonicalDt03DeliveryEvidence,
  right: CanonicalDt03DeliveryEvidence,
): boolean =>
  left.servedEntityId === right.servedEntityId &&
  left.sourceKind === right.sourceKind &&
  (left.marketplace?.marketTransactionId ?? '') === (right.marketplace?.marketTransactionId ?? '') &&
  (left.marketplace?.buyerActorId ?? '') === (right.marketplace?.buyerActorId ?? '') &&
  (left.marketplace?.sellerActorId ?? '') === (right.marketplace?.sellerActorId ?? '') &&
  (left.marketplace?.itemKind ?? '') === (right.marketplace?.itemKind ?? '')

const authoredDefinitionOwnsDelivery = (
  definition: MissionDefinition,
  delivery: MissionDeliveryReference,
): boolean => definition.stages.some(stage => stage.objectives.some(objective =>
  objective.kind === 'delivery' && sameDeliveryReference(objective.delivery, delivery)))

const definitionOwnsCandidate = (
  definition: MissionDefinition,
  candidate: LocalityDeliveryWorkCandidate,
): boolean => definition.source.kind === 'Systemic'
  ? definition.source.causeRef === candidate.boundOpportunity.opportunity.opportunityId
  : authoredDefinitionOwnsDelivery(definition, candidate.delivery)

const settlementReferences = (definition: MissionDefinition): string[] => definition.completionConsequences
  .filter(consequence => consequence.kind === 'EconomicSettlementReference')
  .map(consequence => consequence.settlementRef)

const settlementEvidenceMatchesMission = (
  definition: MissionDefinition,
  evidence: CanonicalDt03DeliveryEvidence,
): boolean => {
  if (!validId(evidence.servedEntityId)) return false
  if (definition.category === 'ProducerSupplyChain') return evidence.sourceKind === 'ProducerLogistics'
  if (definition.category === 'Employer') return evidence.sourceKind === 'EmployerService'
  return true
}

const optionalEqual = (left: string | undefined, right: string | undefined): boolean => left === right

const endpointMatchesAuthority = (
  endpoint: GovernedCitywideEconomicEndpoint,
  authority: CitywideEconomicEndpointAuthority,
  expectedRole: EconomicNodeCityEndpointRef['role'],
): boolean => {
  const governed = authority.endpoints.filter(ref => ref.worldEndpointId === endpoint.worldEndpointId)
  if (governed.length !== 1) return false
  const ref = governed[0]
  return ref.localityId === endpoint.localityId &&
    ref.sourceCheckpoint === endpoint.sourceCheckpoint &&
    ref.role === expectedRole &&
    ref.districtId === endpoint.districtId &&
    optionalEqual(ref.areaId, endpoint.areaId) &&
    ref.locationRef === endpoint.locationRef &&
    optionalEqual(ref.roadRef, endpoint.roadRef)
}

const boundOpportunityMatchesRuntime = (input: {
  candidate: LocalityDeliveryWorkCandidate
  currentLocalityId: string
  worldInstanceId: string
  endpointAuthority: CitywideEconomicEndpointAuthority
}): LocalityDeliveryCandidateBlocker[] => {
  const { candidate, currentLocalityId, worldInstanceId, endpointAuthority } = input
  const bound = candidate.boundOpportunity
  const opportunity = bound.opportunity
  const blockers: LocalityDeliveryCandidateBlocker[] = []

  if (!validId(candidate.missionId) || !validId(opportunity.opportunityId) ||
      candidate.compatibleWorkActivityIds.length === 0 ||
      bound.origin.endpointId !== opportunity.sourceNodeId ||
      bound.destination.endpointId !== opportunity.destinationNodeId) {
    blockers.push('invalid-candidate')
  }
  if (bound.localityId !== currentLocalityId ||
      bound.origin.localityId !== currentLocalityId || bound.destination.localityId !== currentLocalityId ||
      bound.origin.sourceLocalityId !== currentLocalityId || bound.destination.sourceLocalityId !== currentLocalityId) {
    blockers.push('locality-mismatch')
  }
  if (opportunity.worldInstanceId !== worldInstanceId ||
      bound.origin.worldInstanceId !== worldInstanceId || bound.destination.worldInstanceId !== worldInstanceId) {
    blockers.push('world-instance-mismatch')
  }
  if (bound.sourceCheckpoint !== endpointAuthority.sourceCheckpoint ||
      bound.origin.sourceCheckpoint !== endpointAuthority.sourceCheckpoint ||
      bound.destination.sourceCheckpoint !== endpointAuthority.sourceCheckpoint) {
    blockers.push('source-checkpoint-mismatch')
  }
  if (!endpointMatchesAuthority(bound.origin, endpointAuthority, 'pickup') ||
      !endpointMatchesAuthority(bound.destination, endpointAuthority, 'delivery')) {
    blockers.push('endpoint-authority-mismatch')
  }

  return blockers
}

const resolveStoryHandoff = (input: {
  candidate: LocalityDeliveryWorkCandidate
  currentLocalityId: string
  storyRoleContext?: FirstHourStoryRoleContext
  processedStoryAckReceiptIds: ReadonlySet<string>
}): { blockers: LocalityDeliveryCandidateBlocker[]; handoff?: LocalityDeliveryStoryHandoff } => {
  const trigger = input.candidate.storyTriggerId
    ? getFirstHourStoryTrigger(input.candidate.storyTriggerId)
    : undefined
  const blockers: LocalityDeliveryCandidateBlocker[] = []
  if (input.candidate.storyTriggerId && (!trigger || trigger.gate.missionId !== input.candidate.missionId)) {
    blockers.push('story-trigger-mismatch')
  }

  const requiredRoles = [...new Set([
    ...(input.candidate.requiredStoryRoles ?? []),
    ...(trigger?.requiredRoles ?? []),
  ])]
  let roleBindings: FirstHourStoryRoleBinding[] = []
  let resolution: ReturnType<typeof resolveFirstHourStoryRoles> | undefined

  if (requiredRoles.length > 0) {
    if (!input.storyRoleContext) return { blockers: [...blockers, 'story-context-missing'] }
    if (input.storyRoleContext.currentLocalityId !== input.currentLocalityId) {
      return { blockers: [...blockers, 'story-locality-mismatch'] }
    }
    resolution = resolveFirstHourStoryRoles(input.storyRoleContext, requiredRoles)
    if (!resolution.eligible) return { blockers: [...blockers, 'story-role-unavailable'] }
    roleBindings = requiredRoles
      .map(roleId => resolution?.bindings[roleId])
      .filter((binding): binding is FirstHourStoryRoleBinding => binding !== undefined)
      .map(binding => ({ ...binding }))
  }

  if (!trigger && roleBindings.length === 0) return { blockers }
  const ack = trigger?.ack
  const referenceActorId = ack?.referenceRoleId
    ? resolution?.bindings[ack.referenceRoleId]?.actorId
    : undefined
  if (ack?.referenceRoleId && !referenceActorId) return { blockers: [...blockers, 'story-role-unavailable'] }
  const acknowledgement = ack
    ? {
        receiptId: ack.receiptId,
        signalType: ack.signalType,
        status: input.processedStoryAckReceiptIds.has(ack.receiptId)
          ? 'already-processed' as const
          : 'pending' as const,
        ...(referenceActorId ? { referenceActorId } : {}),
      }
    : undefined

  return {
    blockers,
    handoff: {
      ...(trigger ? { triggerId: trigger.triggerId } : {}),
      roleBindings,
      ...(acknowledgement ? { acknowledgement } : {}),
    },
  }
}

const evaluateCandidate = (input: {
  candidate: LocalityDeliveryWorkCandidate
  currentLocalityId: string
  worldInstanceId: string
  endpointAuthority: CitywideEconomicEndpointAuthority
  definitions: readonly MissionDefinition[]
  refreshedMissionState: MissionRuntimeState
  storyRoleContext?: FirstHourStoryRoleContext
  processedStoryAckReceiptIds: ReadonlySet<string>
}): CandidateResolution => {
  const blockers = boundOpportunityMatchesRuntime(input)
  const definition = input.definitions.find(item => item.missionId === input.candidate.missionId)
  if (!definition || !definitionOwnsCandidate(definition, input.candidate)) blockers.push('mission-binding-mismatch')
  if (definition && input.refreshedMissionState.missions[definition.missionId]?.status !== 'Available') {
    blockers.push('mission-not-available')
  }
  if (definition) {
    const references = settlementReferences(definition)
    if (references.length === 0) blockers.push('settlement-reference-missing')
    if (references.length > 1) blockers.push('settlement-reference-ambiguous')
    if (!settlementEvidenceMatchesMission(definition, input.candidate.settlementEvidence)) {
      blockers.push('settlement-evidence-mismatch')
    }
  }

  const story = resolveStoryHandoff({
    candidate: input.candidate,
    currentLocalityId: input.currentLocalityId,
    storyRoleContext: input.storyRoleContext,
    processedStoryAckReceiptIds: input.processedStoryAckReceiptIds,
  })
  blockers.push(...story.blockers)

  return {
    candidate: input.candidate,
    evaluation: {
      opportunityId: input.candidate.boundOpportunity.opportunity.opportunityId,
      missionId: input.candidate.missionId,
      eligible: blockers.length === 0,
      blockers: [...new Set(blockers)],
    },
    ...(definition ? { definition } : {}),
    ...(story.handoff ? { storyHandoff: story.handoff } : {}),
  }
}

/**
 * Locality-aware DT-09 work materialization. It starts an existing mission but does not
 * request or apply settlement. The returned boundary becomes eligible for settlement
 * request only after authoritative delivery completion/acceptance evidence exists.
 */
export const materializeDeliveryWorkForCurrentLocality = (input: {
  currentLocalityId: string
  worldInstanceId: string
  endpointAuthority: CitywideEconomicEndpointAuthority
  candidates: readonly LocalityDeliveryWorkCandidate[]
  distributionAuthority: CitywideDeliveryDistributionAuthorityPort
  missionDefinitions: readonly MissionDefinition[]
  missionState: MissionRuntimeState
  missionFacts: MissionWorldFacts
  history?: readonly CitywideDeliverySelectionHistoryRecord[]
  exclusion?: CitywideDeliveryWorkExclusion
  storyRoleContext?: FirstHourStoryRoleContext
  processedStoryAckReceiptIds?: readonly string[]
}): LocalityDeliveryMaterializationResult => {
  if (!validId(input.currentLocalityId) || !validId(input.worldInstanceId)) {
    return { status: 'unavailable', reason: 'invalid-runtime-context', candidateEvaluations: [], citywideEvaluations: [] }
  }
  if (input.endpointAuthority.localityId !== input.currentLocalityId) {
    return { status: 'unavailable', reason: 'locality-authority-mismatch', candidateEvaluations: [], citywideEvaluations: [] }
  }

  const refreshedMissionState = refreshMissionAvailability(input.missionDefinitions, input.missionState, input.missionFacts)
  const processedStoryAckReceiptIds = new Set(input.processedStoryAckReceiptIds ?? [])
  const resolutions = input.candidates.map(candidate => evaluateCandidate({
    candidate,
    currentLocalityId: input.currentLocalityId,
    worldInstanceId: input.worldInstanceId,
    endpointAuthority: input.endpointAuthority,
    definitions: input.missionDefinitions,
    refreshedMissionState,
    storyRoleContext: input.storyRoleContext,
    processedStoryAckReceiptIds,
  }))
  const candidateEvaluations = resolutions.map(resolution => resolution.evaluation)
  const notLocal = (evaluation: LocalityDeliveryCandidateEvaluation): boolean =>
    evaluation.blockers.some(blocker => [
      'locality-mismatch',
      'world-instance-mismatch',
      'source-checkpoint-mismatch',
      'endpoint-authority-mismatch',
    ].includes(blocker))
  const localCandidates = resolutions.filter(resolution => !notLocal(resolution.evaluation))
  if (input.candidates.length === 0 || localCandidates.length === 0) {
    return { status: 'unavailable', reason: 'no-local-opportunities', candidateEvaluations, citywideEvaluations: [] }
  }

  const eligible = resolutions.filter(resolution => resolution.evaluation.eligible && resolution.definition)
  if (eligible.length === 0) {
    return { status: 'unavailable', reason: 'no-materializable-opportunities', candidateEvaluations, citywideEvaluations: [] }
  }

  const citywideCandidates = eligible.map(resolution => {
    const bound = resolution.candidate.boundOpportunity
    return bindProducerLogisticsOpportunityToCitywideDelivery({
      opportunity: bound.opportunity,
      delivery: resolution.candidate.delivery,
      origin: citywideEconomicEndpointIdentity(bound.origin),
      destination: citywideEconomicEndpointIdentity(bound.destination),
      compatibleWorkActivityIds: resolution.candidate.compatibleWorkActivityIds,
    })
  })
  const selected = selectCitywideDeliveryOpportunity({
    opportunities: citywideCandidates,
    history: input.history,
    exclusion: input.exclusion,
    authority: input.distributionAuthority,
  })
  if (selected.status !== 'selected') {
    return {
      status: 'unavailable', reason: 'citywide-selection-unavailable', candidateEvaluations,
      citywideEvaluations: selected.evaluations,
    }
  }

  const selectedResolution = eligible.find(resolution =>
    resolution.candidate.boundOpportunity.opportunity.opportunityId === selected.selection.opportunity.opportunityId)
  if (!selectedResolution?.definition) {
    return {
      status: 'unavailable', reason: 'no-materializable-opportunities', candidateEvaluations,
      citywideEvaluations: selected.evaluations,
    }
  }

  const started = startMission(
    input.missionDefinitions,
    refreshedMissionState,
    selectedResolution.definition.missionId,
    input.missionFacts,
  )
  if (!started.changed || started.state.missions[selectedResolution.definition.missionId]?.status !== 'Active') {
    return {
      status: 'unavailable', reason: 'mission-start-unavailable', candidateEvaluations,
      citywideEvaluations: selected.evaluations,
    }
  }

  const references = settlementReferences(selectedResolution.definition)
  if (references.length !== 1) {
    return {
      status: 'unavailable', reason: 'no-materializable-opportunities', candidateEvaluations,
      citywideEvaluations: selected.evaluations,
    }
  }
  const bound = selectedResolution.candidate.boundOpportunity
  const acknowledgementReceiptId = selectedResolution.storyHandoff?.acknowledgement?.receiptId

  return {
    status: 'materialized',
    selection: selected.selection,
    missionId: selectedResolution.definition.missionId,
    missionState: started.state,
    settlementBoundary: {
      localityId: input.currentLocalityId,
      worldInstanceId: input.worldInstanceId,
      sourceCheckpoint: bound.sourceCheckpoint,
      opportunityId: bound.opportunity.opportunityId,
      missionId: selectedResolution.definition.missionId,
      delivery: cloneDeliveryReference(selectedResolution.candidate.delivery),
      settlementReference: references[0],
      settlementEvidence: cloneSettlementEvidence(selectedResolution.candidate.settlementEvidence),
      ...(acknowledgementReceiptId ? { acknowledgementReceiptId } : {}),
    },
    ...(selectedResolution.storyHandoff ? { storyHandoff: selectedResolution.storyHandoff } : {}),
    candidateEvaluations,
    citywideEvaluations: selected.evaluations,
  }
}

const completedMissionReceipt = (
  state: MissionRuntimeState,
  missionId: string,
): string | undefined => {
  const instance = state.missions[missionId]
  if (instance?.status !== 'Completed' || !instance.completionReceiptId) return undefined
  return state.completionReceipts.some(receipt =>
    receipt.receiptId === instance.completionReceiptId && receipt.missionId === missionId)
    ? instance.completionReceiptId
    : undefined
}

const matchingSettlementIntent = (input: {
  emittedConsequences: readonly MissionConsequenceIntent[]
  boundary: LocalityDeliverySettlementBoundary
  completionReceiptId: string
}): MissionConsequenceIntent | undefined => {
  const economic = input.emittedConsequences.filter(intent =>
    intent.missionId === input.boundary.missionId &&
    intent.receiptId === input.completionReceiptId &&
    intent.consequence.kind === 'EconomicSettlementReference')
  if (economic.length !== 1) return undefined
  const intent = economic[0]
  return intent.consequence.kind === 'EconomicSettlementReference' &&
    intent.consequence.settlementRef === input.boundary.settlementReference
    ? intent
    : undefined
}

/**
 * Final DT-09 boundary: verifies that the selected mission really completed through the
 * selected delivery and that canonical payment evidence was emitted. It then requests
 * settlement by handing #673 its exact sourceOrder/interaction/evidence input types.
 *
 * This function deliberately does NOT call settleLegitimateDeliveryProgression().
 * Money, XP, loyalty, fragments, grants, receipt creation and replay settlement remain DT-03.
 */
export const requestCanonicalDt03DeliverySettlement = (input: {
  boundary: LocalityDeliverySettlementBoundary
  currentLocalityId: string
  worldInstanceId: string
  missionState: MissionRuntimeState
  emittedConsequences: readonly MissionConsequenceIntent[]
  acceptedDelivery: MissionDeliveryReference
  sourceOrder: CanonicalDt03SourceOrder
  interaction: CanonicalDt03SettledInteraction
  settlementEvidence: CanonicalDt03DeliveryEvidence
  acknowledgementReceiptId?: string
}): LocalityDeliverySettlementRequestResult => {
  const boundary = input.boundary
  if (![boundary.localityId, boundary.worldInstanceId, boundary.sourceCheckpoint, boundary.opportunityId,
    boundary.missionId, boundary.settlementReference].every(validId)) {
    return { status: 'rejected', reason: 'invalid-boundary' }
  }
  if (boundary.localityId !== input.currentLocalityId || boundary.worldInstanceId !== input.worldInstanceId) {
    return { status: 'rejected', reason: 'locality-mismatch' }
  }
  if (!sameDeliveryReference(boundary.delivery, input.acceptedDelivery)) {
    return { status: 'rejected', reason: 'mission-mismatch' }
  }

  const completionReceiptId = completedMissionReceipt(input.missionState, boundary.missionId)
  if (!completionReceiptId) return { status: 'rejected', reason: 'mission-mismatch' }

  const expectedAck = boundary.acknowledgementReceiptId
  if (expectedAck !== input.acknowledgementReceiptId) {
    return { status: 'rejected', reason: 'acknowledgement-mismatch' }
  }

  if (input.sourceOrder.orderId !== boundary.delivery.orderId ||
      input.sourceOrder.status !== 'PickedUp' || input.sourceOrder.economySettled) {
    return { status: 'rejected', reason: 'custody-mismatch' }
  }
  if (!input.interaction.settled ||
      input.interaction.world.activeOrder.orderId === input.sourceOrder.orderId) {
    return { status: 'rejected', reason: 'custody-mismatch' }
  }
  if (input.interaction.world.player.currentOrder !== '' || input.interaction.world.player.carryingPackage) {
    return { status: 'rejected', reason: 'cargo-mismatch' }
  }

  const intent = matchingSettlementIntent({
    emittedConsequences: input.emittedConsequences,
    boundary,
    completionReceiptId,
  })
  if (!intent) return { status: 'rejected', reason: 'payment-evidence-mismatch' }
  if (!sameSettlementEvidence(boundary.settlementEvidence, input.settlementEvidence)) {
    return { status: 'rejected', reason: 'settlement-evidence-mismatch' }
  }

  return {
    status: 'SETTLEMENT_REQUESTED',
    localityId: boundary.localityId,
    worldInstanceId: boundary.worldInstanceId,
    missionId: boundary.missionId,
    missionCompletionReceiptId: completionReceiptId,
    consequenceIntentId: intent.intentId,
    settlementRef: boundary.settlementReference,
    delivery: cloneDeliveryReference(boundary.delivery),
    dt03: {
      sourceOrder: input.sourceOrder,
      interaction: input.interaction,
      evidence: cloneSettlementEvidence(input.settlementEvidence),
    },
  }
}
