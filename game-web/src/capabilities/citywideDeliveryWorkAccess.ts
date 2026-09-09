import {
  PROTOTYPE_PLAYER_ECONOMY_POLICY,
  type PlayerEconomyPolicy,
  type PlayerEconomyState,
} from '../economy/playerEconomy'
import type {
  CapabilityBlocker,
  CapabilityBlockerCode,
  CapabilityEvidenceState,
} from './capabilityModel'
import {
  PLAYER_WORK_ACTIVITY_IDS,
  evaluatePlayerWorkAccess,
  type PlayerWorkAccessFacts,
  type PlayerWorkActivityId,
} from './playerEconomyWorkAccess'

export const CITYWIDE_WORK_ROUTE_CLASSES = [
  'local',
  'adjacent-district',
  'cross-city',
] as const

export type CitywideWorkRouteClass = (typeof CITYWIDE_WORK_ROUTE_CLASSES)[number]

export type CitywideWorkAccessClass =
  | 'local-walking'
  | 'bicycle'
  | 'powered-two-wheel'
  | 'car'
  | 'delivery-van'

export interface CitywideWorkActivityRoutePolicy {
  activityId: PlayerWorkActivityId
  accessClass: CitywideWorkAccessClass
  allowedRouteClasses: readonly CitywideWorkRouteClass[]
}

/**
 * Semantic work-access policy only. World/spatial authority still owns route classification,
 * geometry and distance thresholds; DT-06 only decides whether an already-classified route is
 * compatible with an existing work activity.
 */
export const CITYWIDE_WORK_ACTIVITY_ROUTE_POLICY: readonly CitywideWorkActivityRoutePolicy[] = [
  {
    activityId: 'walking-light-document-delivery',
    accessClass: 'local-walking',
    allowedRouteClasses: ['local'],
  },
  {
    activityId: 'bicycle-light-parcel-delivery',
    accessClass: 'bicycle',
    allowedRouteClasses: ['local', 'adjacent-district'],
  },
  {
    activityId: 'electric-scooter-light-parcel-delivery',
    accessClass: 'powered-two-wheel',
    allowedRouteClasses: ['local', 'adjacent-district', 'cross-city'],
  },
  {
    activityId: 'motorcycle-light-parcel-delivery',
    accessClass: 'powered-two-wheel',
    allowedRouteClasses: ['local', 'adjacent-district', 'cross-city'],
  },
  {
    activityId: 'car-light-parcel-delivery',
    accessClass: 'car',
    allowedRouteClasses: ['local', 'adjacent-district', 'cross-city'],
  },
  {
    activityId: 'delivery-van-light-parcel-delivery',
    accessClass: 'delivery-van',
    allowedRouteClasses: ['local', 'adjacent-district', 'cross-city'],
  },
] as const

export type CitywideDeliveryWorkAccessReasonCode =
  | 'invalid-route-class'
  | 'no-compatible-work-activity'
  | 'unknown-work-activity'
  | 'route-class-incompatible'
  | CapabilityBlockerCode

export interface CitywideWorkActivityEvaluation {
  activityId: string
  accessClass?: CitywideWorkAccessClass
  routeCompatible: boolean
  eligible: boolean
  reasonCodes: CitywideDeliveryWorkAccessReasonCode[]
  blockers: CapabilityBlocker[]
}

export interface CitywideDeliveryWorkAccessEvaluation {
  eligible: boolean
  routeClass?: CitywideWorkRouteClass
  eligibleWorkActivityIds: PlayerWorkActivityId[]
  reasonCodes: CitywideDeliveryWorkAccessReasonCode[]
  activityEvaluations: CitywideWorkActivityEvaluation[]
}

export interface CitywideDeliveryWorkAccessAdapter {
  /**
   * Structural match for the DT-09 citywide selector's read-only work-access port.
   * This verdict has no route semantics because DT-09 currently queries an already-declared
   * PlayerWorkActivityId. Use evaluateCandidateWorkAccess when route compatibility is required.
   */
  isWorkActivityEligible(activityId: PlayerWorkActivityId): boolean
  /**
   * Route-aware read-only evaluation for an authoritative candidate. The candidate supplies both
   * its spatial route class and existing compatible work activities; this adapter creates neither.
   */
  evaluateCandidateWorkAccess(input: {
    routeClass: string
    compatibleWorkActivityIds: readonly string[]
  }): CitywideDeliveryWorkAccessEvaluation
}

const routeClassIsKnown = (value: string): value is CitywideWorkRouteClass =>
  CITYWIDE_WORK_ROUTE_CLASSES.some(candidate => candidate === value)

const activityIsKnown = (value: string): value is PlayerWorkActivityId =>
  PLAYER_WORK_ACTIVITY_IDS.some(candidate => candidate === value)

const routePolicyFor = (activityId: PlayerWorkActivityId): CitywideWorkActivityRoutePolicy => {
  const policy = CITYWIDE_WORK_ACTIVITY_ROUTE_POLICY.find(candidate => candidate.activityId === activityId)
  if (!policy) throw new Error(`Missing citywide route policy for work activity: ${activityId}`)
  return policy
}

const unique = <T>(values: readonly T[]): T[] => [...new Set(values)]

const canonicalActivityOrder = (left: string, right: string): number => {
  const leftIndex = PLAYER_WORK_ACTIVITY_IDS.findIndex(candidate => candidate === left)
  const rightIndex = PLAYER_WORK_ACTIVITY_IDS.findIndex(candidate => candidate === right)
  if (leftIndex >= 0 && rightIndex >= 0) return leftIndex - rightIndex
  if (leftIndex >= 0) return -1
  if (rightIndex >= 0) return 1
  return left.localeCompare(right)
}

const evaluateActivityForRoute = (
  activityId: string,
  routeClass: CitywideWorkRouteClass,
  evidence: CapabilityEvidenceState,
  economyState: PlayerEconomyState,
  facts: PlayerWorkAccessFacts,
  economyPolicy: PlayerEconomyPolicy,
): CitywideWorkActivityEvaluation => {
  if (!activityIsKnown(activityId)) {
    return {
      activityId,
      routeCompatible: false,
      eligible: false,
      reasonCodes: ['unknown-work-activity'],
      blockers: [],
    }
  }

  const routePolicy = routePolicyFor(activityId)
  if (!routePolicy.allowedRouteClasses.includes(routeClass)) {
    return {
      activityId,
      accessClass: routePolicy.accessClass,
      routeCompatible: false,
      eligible: false,
      reasonCodes: ['route-class-incompatible'],
      blockers: [],
    }
  }

  const evaluation = evaluatePlayerWorkAccess(
    evidence,
    activityId,
    economyState,
    facts,
    economyPolicy,
  )

  return {
    activityId,
    accessClass: routePolicy.accessClass,
    routeCompatible: true,
    eligible: evaluation.eligible,
    reasonCodes: evaluation.blockers.map(blocker => blocker.code),
    blockers: evaluation.blockers.map(blocker => ({ ...blocker })),
  }
}

/**
 * Creates a mutation-free DT-06/DT-03 work-access adapter for citywide delivery selection.
 *
 * The adapter never chooses a mission, classifies route geometry, creates employer permission,
 * grants qualifications/capabilities, creates vehicles, consumes Work Capacity or mutates money.
 */
export const createCitywideDeliveryWorkAccessAdapter = (
  evidence: CapabilityEvidenceState,
  economyState: PlayerEconomyState,
  facts: PlayerWorkAccessFacts,
  economyPolicy: PlayerEconomyPolicy = PROTOTYPE_PLAYER_ECONOMY_POLICY,
): CitywideDeliveryWorkAccessAdapter => ({
  isWorkActivityEligible: activityId =>
    evaluatePlayerWorkAccess(
      evidence,
      activityId,
      economyState,
      facts,
      economyPolicy,
    ).eligible,

  evaluateCandidateWorkAccess: input => {
    if (!routeClassIsKnown(input.routeClass)) {
      return {
        eligible: false,
        eligibleWorkActivityIds: [],
        reasonCodes: ['invalid-route-class'],
        activityEvaluations: [],
      }
    }

    const routeClass = input.routeClass
    const activityIds = unique(input.compatibleWorkActivityIds).sort(canonicalActivityOrder)
    if (activityIds.length === 0) {
      return {
        eligible: false,
        routeClass,
        eligibleWorkActivityIds: [],
        reasonCodes: ['no-compatible-work-activity'],
        activityEvaluations: [],
      }
    }

    const activityEvaluations = activityIds.map(activityId => evaluateActivityForRoute(
      activityId,
      routeClass,
      evidence,
      economyState,
      facts,
      economyPolicy,
    ))

    const eligibleWorkActivityIds = activityEvaluations
      .filter((evaluation): evaluation is CitywideWorkActivityEvaluation & { activityId: PlayerWorkActivityId } =>
        evaluation.eligible && activityIsKnown(evaluation.activityId))
      .map(evaluation => evaluation.activityId)

    const eligible = eligibleWorkActivityIds.length > 0
    return {
      eligible,
      routeClass,
      eligibleWorkActivityIds,
      reasonCodes: eligible
        ? []
        : unique(activityEvaluations.flatMap(evaluation => evaluation.reasonCodes)),
      activityEvaluations,
    }
  },
})
