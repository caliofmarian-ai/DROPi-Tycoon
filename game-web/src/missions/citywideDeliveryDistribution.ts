import {
  PLAYER_WORK_ACTIVITY_IDS,
  type PlayerWorkActivityId,
} from '../capabilities/playerEconomyWorkAccess'
import type { LogisticsOpportunity } from '../trade/regionalSupplyDemand'
import {
  deliveryReferenceMatches,
  type MissionDeliveryResolver,
} from './missionEngine'
import type { MissionDeliveryReference } from './missionModel'

export const CITYWIDE_DELIVERY_DISTRIBUTION_VERSION = 1 as const
export const CITYWIDE_ROUTE_CLASSES = ['local', 'adjacent-district', 'cross-city'] as const
export type CitywideRouteClass = (typeof CITYWIDE_ROUTE_CLASSES)[number]

export interface CitywideDeliveryEndpointIdentity {
  /** Stable source/destination node or service endpoint owned by world/economy authority. */
  endpointId: string
  /** Stable district identity supplied by the governed playable-city spatial authority. */
  districtId: string
  /** Optional finer-grained governed area identity. No geometry is inferred from this string. */
  areaId?: string
}

export interface CitywideDeliveryOpportunity {
  /** Stable candidate identity. This is not a MissionDefinition ID. */
  opportunityId: string
  /** Real demand/order/producer cause. DT-09 never manufactures this value. */
  causeRef: string
  worldInstanceId: string
  /** Exact existing logistics authority identity; cargo objects are never copied here. */
  delivery: MissionDeliveryReference
  origin: CitywideDeliveryEndpointIdentity
  destination: CitywideDeliveryEndpointIdentity
  /**
   * Opaque read-only causal priority supplied by the owning demand authority.
   * Higher means more authoritative urgency. DT-09 does not derive this from rewards or money.
   */
  authorityPriority: number
  /** Candidate materialization is allowed only if at least one of these real work-access activities is eligible. */
  compatibleWorkActivityIds: readonly PlayerWorkActivityId[]
}

export interface CitywideDeliverySpatialClassificationInput {
  worldInstanceId: string
  origin: CitywideDeliveryEndpointIdentity
  destination: CitywideDeliveryEndpointIdentity
}

export interface CitywideDeliveryDistributionAuthorityPort {
  /** Read-only order existence check against the current authoritative order domain. */
  hasOrder(orderId: string): boolean
  /** Exact DeliveryMission resolver used by the merged Mission Framework. */
  resolveDeliveryMission: MissionDeliveryResolver
  /**
   * #614 / world spatial authority classifies the route. DT-09 deliberately owns no distance thresholds.
   * Returning undefined fails the candidate closed until spatial authority can classify it.
   */
  classifyRoute(input: CitywideDeliverySpatialClassificationInput): CitywideRouteClass | undefined
  /** Read-only DT-06/DT-03 work-access verdict. No capability, permission or Work Capacity is created here. */
  isWorkActivityEligible(activityId: PlayerWorkActivityId): boolean
}

export interface CitywideDeliveryWorkExclusion {
  activeOpportunityIds?: readonly string[]
  reservedOpportunityIds?: readonly string[]
  activeCauseRefs?: readonly string[]
  reservedCauseRefs?: readonly string[]
  activeOrderIds?: readonly string[]
  reservedOrderIds?: readonly string[]
  activeDeliveryMissionIds?: readonly string[]
  reservedDeliveryMissionIds?: readonly string[]
}

export interface CitywideDeliverySelectionHistoryRecord {
  selectionId: string
  selectionOrdinal: number
  opportunityId: string
  causeRef: string
  deliveryMissionId: string
  orderId: string
  originEndpointId: string
  destinationEndpointId: string
  originDistrictId: string
  destinationDistrictId: string
  originAreaId?: string
  destinationAreaId?: string
  routeClass: CitywideRouteClass
}

export type CitywideDeliveryCandidateRejectionCode =
  | 'invalid-opportunity'
  | 'duplicate-opportunity-id'
  | 'order-missing'
  | 'delivery-reference-mismatch'
  | 'delivery-endpoint-mismatch'
  | 'route-unclassified'
  | 'work-access-ineligible'
  | 'already-active-or-reserved'

export interface CitywideDeliveryCandidateEvaluation {
  opportunityId: string
  eligible: boolean
  rejectionCodes: CitywideDeliveryCandidateRejectionCode[]
  routeClass?: CitywideRouteClass
  eligibleWorkActivityIds: PlayerWorkActivityId[]
}

export interface CitywideDeliverySelection {
  selectionId: string
  opportunity: CitywideDeliveryOpportunity
  routeClass: CitywideRouteClass
  eligibleWorkActivityIds: PlayerWorkActivityId[]
}

export type CitywideDeliverySelectionResult =
  | {
      status: 'selected'
      selection: CitywideDeliverySelection
      evaluations: CitywideDeliveryCandidateEvaluation[]
    }
  | {
      status: 'none'
      reason: 'no-candidates' | 'no-eligible-candidates' | 'invalid-history'
      evaluations: CitywideDeliveryCandidateEvaluation[]
    }

const validId = (value: string): boolean => value.trim().length > 0 && value.trim().length <= 180
const validSelectionId = (value: string): boolean => value.trim().length > 0 && value.trim().length <= 256
const validPriority = (value: number): boolean => Number.isFinite(value) && value >= 0
const validOrdinal = (value: number): boolean => Number.isSafeInteger(value) && value >= 0
const routeClass = (value: unknown): value is CitywideRouteClass =>
  typeof value === 'string' && CITYWIDE_ROUTE_CLASSES.some(candidate => candidate === value)
const workActivityId = (value: string): value is PlayerWorkActivityId =>
  PLAYER_WORK_ACTIVITY_IDS.some(candidate => candidate === value)

const validEndpoint = (endpoint: CitywideDeliveryEndpointIdentity): boolean =>
  validId(endpoint.endpointId) &&
  validId(endpoint.districtId) &&
  (endpoint.areaId === undefined || validId(endpoint.areaId))

const validDeliveryReference = (delivery: MissionDeliveryReference): boolean =>
  validId(delivery.deliveryMissionId) &&
  validId(delivery.orderId) &&
  delivery.parcelIds.length > 0 &&
  delivery.parcelIds.every(validId) &&
  new Set(delivery.parcelIds).size === delivery.parcelIds.length

const validOpportunity = (opportunity: CitywideDeliveryOpportunity): boolean =>
  validId(opportunity.opportunityId) &&
  validId(opportunity.causeRef) &&
  validId(opportunity.worldInstanceId) &&
  validEndpoint(opportunity.origin) &&
  validEndpoint(opportunity.destination) &&
  opportunity.origin.endpointId !== opportunity.destination.endpointId &&
  validPriority(opportunity.authorityPriority) &&
  validDeliveryReference(opportunity.delivery) &&
  opportunity.compatibleWorkActivityIds.length > 0 &&
  opportunity.compatibleWorkActivityIds.every(workActivityId) &&
  new Set(opportunity.compatibleWorkActivityIds).size === opportunity.compatibleWorkActivityIds.length

const validHistoryRecord = (record: CitywideDeliverySelectionHistoryRecord): boolean =>
  validSelectionId(record.selectionId) &&
  validOrdinal(record.selectionOrdinal) &&
  validId(record.opportunityId) &&
  validId(record.causeRef) &&
  validId(record.deliveryMissionId) &&
  validId(record.orderId) &&
  validId(record.originEndpointId) &&
  validId(record.destinationEndpointId) &&
  validId(record.originDistrictId) &&
  validId(record.destinationDistrictId) &&
  (record.originAreaId === undefined || validId(record.originAreaId)) &&
  (record.destinationAreaId === undefined || validId(record.destinationAreaId)) &&
  routeClass(record.routeClass)

const validHistory = (history: readonly CitywideDeliverySelectionHistoryRecord[]): boolean => {
  if (!history.every(validHistoryRecord)) return false
  if (new Set(history.map(record => record.selectionId)).size !== history.length) return false
  if (new Set(history.map(record => record.selectionOrdinal)).size !== history.length) return false
  return true
}

const stringSet = (values: readonly string[] | undefined): ReadonlySet<string> =>
  new Set((values ?? []).filter(validId))

const blockedByWorkState = (
  opportunity: CitywideDeliveryOpportunity,
  exclusion: CitywideDeliveryWorkExclusion,
): boolean => {
  const activeOpportunities = stringSet(exclusion.activeOpportunityIds)
  const reservedOpportunities = stringSet(exclusion.reservedOpportunityIds)
  const activeCauses = stringSet(exclusion.activeCauseRefs)
  const reservedCauses = stringSet(exclusion.reservedCauseRefs)
  const activeOrders = stringSet(exclusion.activeOrderIds)
  const reservedOrders = stringSet(exclusion.reservedOrderIds)
  const activeDeliveries = stringSet(exclusion.activeDeliveryMissionIds)
  const reservedDeliveries = stringSet(exclusion.reservedDeliveryMissionIds)

  return activeOpportunities.has(opportunity.opportunityId) ||
    reservedOpportunities.has(opportunity.opportunityId) ||
    activeCauses.has(opportunity.causeRef) ||
    reservedCauses.has(opportunity.causeRef) ||
    activeOrders.has(opportunity.delivery.orderId) ||
    reservedOrders.has(opportunity.delivery.orderId) ||
    activeDeliveries.has(opportunity.delivery.deliveryMissionId) ||
    reservedDeliveries.has(opportunity.delivery.deliveryMissionId)
}

const evaluateCandidate = (
  opportunity: CitywideDeliveryOpportunity,
  duplicatedOpportunityIds: ReadonlySet<string>,
  authority: CitywideDeliveryDistributionAuthorityPort,
  exclusion: CitywideDeliveryWorkExclusion,
): CitywideDeliveryCandidateEvaluation => {
  const rejectionCodes: CitywideDeliveryCandidateRejectionCode[] = []
  if (!validOpportunity(opportunity)) {
    return {
      opportunityId: opportunity.opportunityId,
      eligible: false,
      rejectionCodes: ['invalid-opportunity'],
      eligibleWorkActivityIds: [],
    }
  }
  if (duplicatedOpportunityIds.has(opportunity.opportunityId)) rejectionCodes.push('duplicate-opportunity-id')
  if (!authority.hasOrder(opportunity.delivery.orderId)) rejectionCodes.push('order-missing')

  const resolvedDelivery = authority.resolveDeliveryMission(opportunity.delivery.deliveryMissionId)
  const exactDelivery = deliveryReferenceMatches(opportunity.delivery, authority.resolveDeliveryMission)
  if (!exactDelivery) {
    rejectionCodes.push('delivery-reference-mismatch')
  } else if (resolvedDelivery) {
    const firstLeg = resolvedDelivery.legs[0]
    const lastLeg = resolvedDelivery.legs[resolvedDelivery.legs.length - 1]
    if (firstLeg?.from !== opportunity.origin.endpointId || lastLeg?.to !== opportunity.destination.endpointId) {
      rejectionCodes.push('delivery-endpoint-mismatch')
    }
  }

  const classified = authority.classifyRoute({
    worldInstanceId: opportunity.worldInstanceId,
    origin: { ...opportunity.origin },
    destination: { ...opportunity.destination },
  })
  if (!classified || !routeClass(classified)) rejectionCodes.push('route-unclassified')

  const eligibleWorkActivityIds = opportunity.compatibleWorkActivityIds
    .filter(activityId => authority.isWorkActivityEligible(activityId))
  if (eligibleWorkActivityIds.length === 0) rejectionCodes.push('work-access-ineligible')
  if (blockedByWorkState(opportunity, exclusion)) rejectionCodes.push('already-active-or-reserved')

  return {
    opportunityId: opportunity.opportunityId,
    eligible: rejectionCodes.length === 0,
    rejectionCodes,
    ...(classified && routeClass(classified) ? { routeClass: classified } : {}),
    eligibleWorkActivityIds,
  }
}

const lastOrdinal = (
  history: readonly CitywideDeliverySelectionHistoryRecord[],
  predicate: (record: CitywideDeliverySelectionHistoryRecord) => boolean,
): number => history.reduce((latest, record) => predicate(record) ? Math.max(latest, record.selectionOrdinal) : latest, -1)

const areaKey = (districtId: string, areaId: string | undefined): string =>
  `${districtId}::${areaId ?? '<district>'}`
const districtPairKey = (originDistrictId: string, destinationDistrictId: string): string =>
  `${originDistrictId}->${destinationDistrictId}`
const endpointPairKey = (originEndpointId: string, destinationEndpointId: string): string =>
  `${originEndpointId}->${destinationEndpointId}`

interface CandidateRank {
  opportunityId: string
  spatialNoveltyLastOrdinal: number
  districtPairLastOrdinal: number
  routeClassLastOrdinal: number
  endpointPairLastOrdinal: number
  opportunityLastOrdinal: number
}

const rankCandidate = (
  opportunity: CitywideDeliveryOpportunity,
  classified: CitywideRouteClass,
  history: readonly CitywideDeliverySelectionHistoryRecord[],
): CandidateRank => {
  const originAreaKey = areaKey(opportunity.origin.districtId, opportunity.origin.areaId)
  const destinationAreaKey = areaKey(opportunity.destination.districtId, opportunity.destination.areaId)
  const originLast = lastOrdinal(history, record =>
    areaKey(record.originDistrictId, record.originAreaId) === originAreaKey ||
    areaKey(record.destinationDistrictId, record.destinationAreaId) === originAreaKey)
  const destinationLast = lastOrdinal(history, record =>
    areaKey(record.originDistrictId, record.originAreaId) === destinationAreaKey ||
    areaKey(record.destinationDistrictId, record.destinationAreaId) === destinationAreaKey)

  return {
    opportunityId: opportunity.opportunityId,
    // If either endpoint touches a less-recently-used governed area, it gets diversity credit.
    spatialNoveltyLastOrdinal: Math.min(originLast, destinationLast),
    districtPairLastOrdinal: lastOrdinal(
      history,
      record => districtPairKey(record.originDistrictId, record.destinationDistrictId) ===
        districtPairKey(opportunity.origin.districtId, opportunity.destination.districtId),
    ),
    routeClassLastOrdinal: lastOrdinal(history, record => record.routeClass === classified),
    endpointPairLastOrdinal: lastOrdinal(
      history,
      record => endpointPairKey(record.originEndpointId, record.destinationEndpointId) ===
        endpointPairKey(opportunity.origin.endpointId, opportunity.destination.endpointId),
    ),
    opportunityLastOrdinal: lastOrdinal(history, record => record.opportunityId === opportunity.opportunityId),
  }
}

const compareRank = (left: CandidateRank, right: CandidateRank): number =>
  left.spatialNoveltyLastOrdinal - right.spatialNoveltyLastOrdinal ||
  left.districtPairLastOrdinal - right.districtPairLastOrdinal ||
  left.routeClassLastOrdinal - right.routeClassLastOrdinal ||
  left.endpointPairLastOrdinal - right.endpointPairLastOrdinal ||
  left.opportunityLastOrdinal - right.opportunityLastOrdinal ||
  left.opportunityId.localeCompare(right.opportunityId)

const cloneOpportunity = (opportunity: CitywideDeliveryOpportunity): CitywideDeliveryOpportunity => ({
  ...opportunity,
  delivery: {
    deliveryMissionId: opportunity.delivery.deliveryMissionId,
    orderId: opportunity.delivery.orderId,
    parcelIds: [...opportunity.delivery.parcelIds],
  },
  origin: { ...opportunity.origin },
  destination: { ...opportunity.destination },
  compatibleWorkActivityIds: [...opportunity.compatibleWorkActivityIds],
})

/**
 * Deterministically selects one real delivery opportunity without creating demand, money, cargo,
 * capability, permission or geometry. Causal priority is respected first. Spatial diversity is
 * applied only among equally authoritative candidates, so repeat suppression never overrides a
 * genuinely higher-priority demand cause.
 */
export const selectCitywideDeliveryOpportunity = (input: {
  opportunities: readonly CitywideDeliveryOpportunity[]
  history?: readonly CitywideDeliverySelectionHistoryRecord[]
  exclusion?: CitywideDeliveryWorkExclusion
  authority: CitywideDeliveryDistributionAuthorityPort
}): CitywideDeliverySelectionResult => {
  const history = input.history ?? []
  if (!validHistory(history)) return { status: 'none', reason: 'invalid-history', evaluations: [] }
  if (input.opportunities.length === 0) return { status: 'none', reason: 'no-candidates', evaluations: [] }

  const counts = new Map<string, number>()
  for (const opportunity of input.opportunities) {
    counts.set(opportunity.opportunityId, (counts.get(opportunity.opportunityId) ?? 0) + 1)
  }
  const duplicatedOpportunityIds = new Set(
    [...counts.entries()].filter(([, count]) => count > 1).map(([opportunityId]) => opportunityId),
  )

  const evaluations = input.opportunities
    .map(opportunity => evaluateCandidate(
      opportunity,
      duplicatedOpportunityIds,
      input.authority,
      input.exclusion ?? {},
    ))
    .sort((left, right) => left.opportunityId.localeCompare(right.opportunityId))

  const eligible = input.opportunities
    .map(opportunity => ({
      opportunity,
      evaluation: evaluations.find(candidate => candidate.opportunityId === opportunity.opportunityId),
    }))
    .filter((entry): entry is {
      opportunity: CitywideDeliveryOpportunity
      evaluation: CitywideDeliveryCandidateEvaluation & { routeClass: CitywideRouteClass }
    } => entry.evaluation?.eligible === true && entry.evaluation.routeClass !== undefined)

  if (eligible.length === 0) return { status: 'none', reason: 'no-eligible-candidates', evaluations }

  const topPriority = Math.max(...eligible.map(entry => entry.opportunity.authorityPriority))
  const equivalentTopPriority = eligible.filter(entry => entry.opportunity.authorityPriority === topPriority)
  const selected = [...equivalentTopPriority]
    .sort((left, right) => compareRank(
      rankCandidate(left.opportunity, left.evaluation.routeClass, history),
      rankCandidate(right.opportunity, right.evaluation.routeClass, history),
    ))[0]

  return {
    status: 'selected',
    selection: {
      selectionId: `citywide-delivery-selection:${selected.opportunity.opportunityId}`,
      opportunity: cloneOpportunity(selected.opportunity),
      routeClass: selected.evaluation.routeClass,
      eligibleWorkActivityIds: [...selected.evaluation.eligibleWorkActivityIds],
    },
    evaluations,
  }
}

/**
 * Creates a JSON-safe history record that a World Instance / work-history owner may persist.
 * This helper owns no Save schema and does not mutate the supplied selection.
 */
export const createCitywideDeliverySelectionHistoryRecord = (
  selection: CitywideDeliverySelection,
  selectionOrdinal: number,
): CitywideDeliverySelectionHistoryRecord => {
  if (!validOrdinal(selectionOrdinal)) throw new Error('Invalid citywide delivery selection ordinal')
  const opportunity = selection.opportunity
  return {
    selectionId: `${selection.selectionId}:${selectionOrdinal}`,
    selectionOrdinal,
    opportunityId: opportunity.opportunityId,
    causeRef: opportunity.causeRef,
    deliveryMissionId: opportunity.delivery.deliveryMissionId,
    orderId: opportunity.delivery.orderId,
    originEndpointId: opportunity.origin.endpointId,
    destinationEndpointId: opportunity.destination.endpointId,
    originDistrictId: opportunity.origin.districtId,
    destinationDistrictId: opportunity.destination.districtId,
    ...(opportunity.origin.areaId ? { originAreaId: opportunity.origin.areaId } : {}),
    ...(opportunity.destination.areaId ? { destinationAreaId: opportunity.destination.areaId } : {}),
    routeClass: selection.routeClass,
  }
}

/**
 * Narrow DT-07 adapter. It binds a real LogisticsOpportunity to an already-existing DeliveryMission
 * reference and governed spatial identities. Demand pressure is consumed directly as the causal
 * priority signal; DT-09 adds no economic/reward multiplier or threshold.
 */
export const bindProducerLogisticsOpportunityToCitywideDelivery = (input: {
  opportunity: LogisticsOpportunity
  delivery: MissionDeliveryReference
  origin: CitywideDeliveryEndpointIdentity
  destination: CitywideDeliveryEndpointIdentity
  compatibleWorkActivityIds: readonly PlayerWorkActivityId[]
}): CitywideDeliveryOpportunity => {
  if (input.origin.endpointId !== input.opportunity.sourceNodeId) {
    throw new Error('Producer citywide origin must match the authoritative source node')
  }
  if (input.destination.endpointId !== input.opportunity.destinationNodeId) {
    throw new Error('Producer citywide destination must match the authoritative destination node')
  }
  if (!Number.isFinite(input.opportunity.demandPressure) || input.opportunity.demandPressure < 0) {
    throw new Error('Producer citywide opportunity requires valid demand pressure')
  }

  return {
    opportunityId: input.opportunity.opportunityId,
    causeRef: input.opportunity.opportunityId,
    worldInstanceId: input.opportunity.worldInstanceId,
    delivery: {
      deliveryMissionId: input.delivery.deliveryMissionId,
      orderId: input.delivery.orderId,
      parcelIds: [...input.delivery.parcelIds],
    },
    origin: { ...input.origin },
    destination: { ...input.destination },
    authorityPriority: input.opportunity.demandPressure,
    compatibleWorkActivityIds: [...input.compatibleWorkActivityIds],
  }
}
