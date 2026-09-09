import {
  PROTOTYPE_PLAYER_ECONOMY_POLICY,
  type PlayerEconomyPolicy,
  type PlayerEconomyState,
} from '../economy/playerEconomy'
import type { CapabilityEvidenceState } from './capabilityModel'
import {
  CITYWIDE_WORK_ACTIVITY_ROUTE_POLICY,
  CITYWIDE_WORK_ROUTE_CLASSES,
  type CitywideDeliveryWorkAccessReasonCode,
  type CitywideWorkAccessClass,
  type CitywideWorkRouteClass,
} from './citywideDeliveryWorkAccess'
import {
  createEconomyBackedWorkActivityDefinitions,
  evaluatePlayerWorkAccess,
  type PlayerWorkAccessFacts,
  type PlayerWorkActivityId,
} from './playerEconomyWorkAccess'

export const PLAYER_MOBILITY_WORK_ACCESS_PRESENTATION_VERSION = 1 as const

export const PLAYER_MOBILITY_PRESENTATION_SURFACES = [
  'ACCOUNT',
  'PROFILE',
  'MISSION_OFFER',
] as const

export type PlayerMobilityPresentationSurface =
  (typeof PLAYER_MOBILITY_PRESENTATION_SURFACES)[number]

export interface PlayerMobilityPresentationContext {
  /**
   * Optional current-locality identity supplied by the owning world/location runtime.
   * It is presentation context only and never becomes a capability requirement.
   */
  localityId?: string | null
}

export interface PlayerMobilityPresentationReason {
  code: CitywideDeliveryWorkAccessReasonCode
  message: string
}

export interface PlayerMobilityActivityPresentation {
  activityId: PlayerWorkActivityId
  label: string
  accessClass: CitywideWorkAccessClass
  eligible: boolean
  allowedRouteClasses: readonly CitywideWorkRouteClass[]
  blockers: readonly PlayerMobilityPresentationReason[]
}

export interface PlayerMobilityRoutePresentation {
  routeClass: CitywideWorkRouteClass
  eligible: boolean
  eligibleWorkActivityIds: readonly PlayerWorkActivityId[]
  blockingReasons: readonly PlayerMobilityPresentationReason[]
}

export interface PlayerMobilityWorkAccessPresentationProjection {
  version: typeof PLAYER_MOBILITY_WORK_ACCESS_PRESENTATION_VERSION
  worldInstanceId: string
  heroActorId: string
  currentLocalityId: string | null
  activities: readonly PlayerMobilityActivityPresentation[]
  routes: readonly PlayerMobilityRoutePresentation[]
}

export interface PlayerMobilityOfferActivityPresentation {
  activityId: string
  label: string
  accessClass?: CitywideWorkAccessClass
  routeCompatible: boolean
  eligible: boolean
  reasons: readonly PlayerMobilityPresentationReason[]
}

export interface PlayerMobilityMissionOfferPresentation {
  eligible: boolean
  routeClass?: CitywideWorkRouteClass
  eligibleWorkActivityIds: readonly PlayerWorkActivityId[]
  blockingReasons: readonly PlayerMobilityPresentationReason[]
  activityEvaluations: readonly PlayerMobilityOfferActivityPresentation[]
}

const MAX_CONTEXT_ID_LENGTH = 180

const normalizeContextId = (value: string | null | undefined): string | null =>
  typeof value === 'string' &&
  value.trim() === value &&
  value.length > 0 &&
  value.length <= MAX_CONTEXT_ID_LENGTH
    ? value
    : null

const knownRouteClass = (value: string): value is CitywideWorkRouteClass =>
  CITYWIDE_WORK_ROUTE_CLASSES.some(candidate => candidate === value)

const uniqueReasons = (
  reasons: readonly PlayerMobilityPresentationReason[],
): PlayerMobilityPresentationReason[] => {
  const seen = new Set<string>()
  const result: PlayerMobilityPresentationReason[] = []
  for (const reason of reasons) {
    const key = `${reason.code}\u0000${reason.message}`
    if (seen.has(key)) continue
    seen.add(key)
    result.push({ ...reason })
  }
  return result
}

const routeIncompatibleReason = (
  activity: PlayerMobilityActivityPresentation,
  routeClass: CitywideWorkRouteClass,
): PlayerMobilityPresentationReason => ({
  code: 'route-class-incompatible',
  message: `${activity.label} is not compatible with the classified ${routeClass} route.`,
})

const unknownActivityReason = (): PlayerMobilityPresentationReason => ({
  code: 'unknown-work-activity',
  message: 'This offer references an unknown work activity.',
})

const invalidRouteReason = (): PlayerMobilityPresentationReason => ({
  code: 'invalid-route-class',
  message: 'The route is not classified by the authoritative world/spatial system.',
})

const noCompatibleActivityReason = (): PlayerMobilityPresentationReason => ({
  code: 'no-compatible-work-activity',
  message: 'This offer declares no compatible work activity.',
})

const evaluateOfferFromActivities = (
  activities: readonly PlayerMobilityActivityPresentation[],
  routeClassInput: string,
  compatibleWorkActivityIds: readonly string[],
): PlayerMobilityMissionOfferPresentation => {
  if (!knownRouteClass(routeClassInput)) {
    return {
      eligible: false,
      eligibleWorkActivityIds: [],
      blockingReasons: [invalidRouteReason()],
      activityEvaluations: [],
    }
  }

  const routeClass = routeClassInput
  if (compatibleWorkActivityIds.length === 0) {
    return {
      eligible: false,
      routeClass,
      eligibleWorkActivityIds: [],
      blockingReasons: [noCompatibleActivityReason()],
      activityEvaluations: [],
    }
  }

  const activityById = new Map(activities.map(activity => [activity.activityId, activity] as const))
  const canonicalOrder = new Map(activities.map((activity, index) => [activity.activityId, index] as const))
  const uniqueActivityIds = [...new Set(compatibleWorkActivityIds)].sort((left, right) => {
    const leftOrder = canonicalOrder.get(left as PlayerWorkActivityId)
    const rightOrder = canonicalOrder.get(right as PlayerWorkActivityId)
    if (leftOrder !== undefined && rightOrder !== undefined) return leftOrder - rightOrder
    if (leftOrder !== undefined) return -1
    if (rightOrder !== undefined) return 1
    return left.localeCompare(right)
  })

  const activityEvaluations: PlayerMobilityOfferActivityPresentation[] = []
  const eligibleWorkActivityIds: PlayerWorkActivityId[] = []

  for (const activityId of uniqueActivityIds) {
    const activity = activityById.get(activityId as PlayerWorkActivityId)
    if (!activity) {
      activityEvaluations.push({
        activityId,
        label: 'Unknown work activity',
        routeCompatible: false,
        eligible: false,
        reasons: [unknownActivityReason()],
      })
      continue
    }

    const routeCompatible = activity.allowedRouteClasses.some(candidate => candidate === routeClass)
    if (!routeCompatible) {
      activityEvaluations.push({
        activityId: activity.activityId,
        label: activity.label,
        accessClass: activity.accessClass,
        routeCompatible: false,
        eligible: false,
        reasons: [routeIncompatibleReason(activity, routeClass)],
      })
      continue
    }

    const reasons = activity.blockers.map(reason => ({ ...reason }))
    activityEvaluations.push({
      activityId: activity.activityId,
      label: activity.label,
      accessClass: activity.accessClass,
      routeCompatible: true,
      eligible: activity.eligible,
      reasons,
    })
    if (activity.eligible) eligibleWorkActivityIds.push(activity.activityId)
  }

  const eligible = eligibleWorkActivityIds.length > 0
  return {
    eligible,
    routeClass,
    eligibleWorkActivityIds,
    blockingReasons: eligible
      ? []
      : uniqueReasons(activityEvaluations.flatMap(evaluation => evaluation.reasons)),
    activityEvaluations,
  }
}

/**
 * Builds one mutation-free presentation snapshot for Account/Profile and mission-offer consumers.
 * The projection reads existing capability, employment, equipment, cargo, Work Capacity and shift
 * authority. It does not grant anything and locality identity never changes capability truth.
 */
export const projectPlayerMobilityWorkAccess = (
  evidence: CapabilityEvidenceState,
  economyState: PlayerEconomyState,
  facts: PlayerWorkAccessFacts,
  context: PlayerMobilityPresentationContext = {},
  economyPolicy: PlayerEconomyPolicy = PROTOTYPE_PLAYER_ECONOMY_POLICY,
): PlayerMobilityWorkAccessPresentationProjection => {
  const definitions = new Map(
    createEconomyBackedWorkActivityDefinitions(economyPolicy)
      .map(definition => [definition.id, definition] as const),
  )

  const activities: PlayerMobilityActivityPresentation[] = CITYWIDE_WORK_ACTIVITY_ROUTE_POLICY.map(
    routePolicy => {
      const evaluation = evaluatePlayerWorkAccess(
        evidence,
        routePolicy.activityId,
        economyState,
        facts,
        economyPolicy,
      )
      const definition = definitions.get(routePolicy.activityId)
      return {
        activityId: routePolicy.activityId,
        label: definition?.label ?? routePolicy.activityId,
        accessClass: routePolicy.accessClass,
        eligible: evaluation.eligible,
        allowedRouteClasses: [...routePolicy.allowedRouteClasses],
        blockers: evaluation.blockers.map(blocker => ({
          code: blocker.code,
          message: blocker.message,
        })),
      }
    },
  )

  const allActivityIds = activities.map(activity => activity.activityId)
  const routes: PlayerMobilityRoutePresentation[] = CITYWIDE_WORK_ROUTE_CLASSES.map(routeClass => {
    const offer = evaluateOfferFromActivities(activities, routeClass, allActivityIds)
    return {
      routeClass,
      eligible: offer.eligible,
      eligibleWorkActivityIds: [...offer.eligibleWorkActivityIds],
      blockingReasons: offer.blockingReasons.map(reason => ({ ...reason })),
    }
  })

  return {
    version: PLAYER_MOBILITY_WORK_ACCESS_PRESENTATION_VERSION,
    worldInstanceId: economyState.worldInstanceId,
    heroActorId: economyState.heroActorId,
    currentLocalityId: normalizeContextId(context.localityId),
    activities,
    routes,
  }
}

/**
 * Projects one already-classified mission offer from a fresh authority-derived mobility snapshot.
 * This helper performs no mission selection and no capability/economy mutation.
 */
export const projectPlayerMobilityMissionOffer = (
  projection: PlayerMobilityWorkAccessPresentationProjection,
  input: {
    routeClass: string
    compatibleWorkActivityIds: readonly string[]
  },
): PlayerMobilityMissionOfferPresentation =>
  evaluateOfferFromActivities(
    projection.activities,
    input.routeClass,
    input.compatibleWorkActivityIds,
  )
