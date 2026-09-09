import type { OrderState } from '../types/game'
import type { UrbanInteractionResult } from '../systems/urbanInteractions'
import {
  PROTOTYPE_WORLD_CLOCK_POLICY,
  type WorldClockPolicy,
} from '../systems/worldClockSystem'
import type { WorldClockState } from '../world/globalWorld'
import {
  PROTOTYPE_PLAYER_ECONOMY_POLICY,
  type PlayerEconomyPolicy,
  type PlayerEconomyState,
  type WageSettlementResult,
} from './playerEconomy'
import {
  recordSettledUrbanDeliveryWork,
  settleRuntimeEmployeeShiftWage,
  type RuntimeProductiveWorkResult,
} from './playerEconomyRuntimeAdapter'

export const PLAYER_ECONOMY_LOCALITY_CONTEXT_VERSION = 1 as const

const MAX_LOCALITY_TOKEN_LENGTH = 200

const validToken = (value: unknown): value is string =>
  typeof value === 'string' &&
  value.trim().length > 0 &&
  value.trim().length <= MAX_LOCALITY_TOKEN_LENGTH

/**
 * Read-only context supplied by the World Instance / locality owner.
 *
 * DT-03 does not infer or validate catalog membership here. The owning global-world
 * runtime is responsible for proving that currentCountryId/currentLocalityId are a
 * legitimate playable-locality binding for this World Instance.
 */
export interface PlayerEconomyLocalityContext {
  version: typeof PLAYER_ECONOMY_LOCALITY_CONTEXT_VERSION
  worldInstanceId: string
  currentCountryId: string
  currentLocalityId: string
  authorityRef: string
}

/**
 * Read-only employer assignment supplied by the employer/work authority.
 * employerLocationRef distinguishes a legitimate local branch/workplace from the
 * same company ID appearing in another locality.
 */
export interface PlayerEconomyLocalEmployerAssignment {
  worldInstanceId: string
  localityId: string
  employerCompanyId: string
  employerLocationRef: string
  assignmentRef: string
}

/**
 * Stable provenance for one real local work source. It binds one already-existing
 * order to a locality/employer/workplace without creating work, reward or demand.
 */
export interface PlayerEconomyLocalWorkSource {
  worldInstanceId: string
  localityId: string
  employerCompanyId: string
  employerLocationRef: string
  orderId: string
  workSourceRef: string
}

export type LocalEmployerAccessReason =
  | 'authorized'
  | 'invalid-locality-context'
  | 'assignment-required'
  | 'invalid-assignment'
  | 'no-employment'
  | 'world-mismatch'
  | 'locality-mismatch'
  | 'employer-mismatch'
  | 'employer-ledger-mismatch'

export interface PlayerEconomyLocalEmployerAccess {
  authorized: boolean
  reason: LocalEmployerAccessReason
  employerCompanyId: string | null
  employerLocationRef: string | null
  assignmentRef: string | null
}

export interface PlayerEconomyLocalityContinuityProjection {
  worldInstanceId: string
  heroActorId: string
  currentCountryId: string
  currentLocalityId: string
  localityAuthorityRef: string
  personalMoney: {
    balanceMinor: number
    transactionIds: string[]
  }
  workCapacity: {
    current: number
    max: number
    productiveWorkActivityIds: string[]
    settledRestIds: string[]
  }
  living: {
    financialStatus: PlayerEconomyState['living']['financialStatus']
    housingStatus: PlayerEconomyState['living']['housingStatus']
    arrearsMinor: number
    settledObligationIds: string[]
  }
  employment: {
    employerCompanyId: string | null
    localAccess: PlayerEconomyLocalEmployerAccess
    /** Exposed only when the supplied local assignment matches current authority. */
    employerTreasuryBalanceMinor: number | null
  }
}

export type PlayerEconomyLocalityProjectionResult =
  | { ok: true; projection: PlayerEconomyLocalityContinuityProjection }
  | { ok: false; reason: 'invalid-locality-context' }

const localityContextIsValid = (
  state: PlayerEconomyState,
  context: PlayerEconomyLocalityContext,
): boolean =>
  context.version === PLAYER_ECONOMY_LOCALITY_CONTEXT_VERSION &&
  validToken(context.worldInstanceId) &&
  validToken(context.currentCountryId) &&
  validToken(context.currentLocalityId) &&
  validToken(context.authorityRef) &&
  context.worldInstanceId === state.worldInstanceId

const assignmentIsStructurallyValid = (
  assignment: PlayerEconomyLocalEmployerAssignment,
): boolean =>
  validToken(assignment.worldInstanceId) &&
  validToken(assignment.localityId) &&
  validToken(assignment.employerCompanyId) &&
  validToken(assignment.employerLocationRef) &&
  validToken(assignment.assignmentRef)

/**
 * Evaluates whether the existing Player Economy employment is legitimately usable
 * in the supplied current locality. It never grants employment or moves treasury.
 */
export const evaluatePlayerEconomyLocalEmployerAccess = (
  state: PlayerEconomyState,
  context: PlayerEconomyLocalityContext,
  assignment?: PlayerEconomyLocalEmployerAssignment,
): PlayerEconomyLocalEmployerAccess => {
  const employerCompanyId = state.employment?.status === 'Active'
    ? state.employment.employerCompanyId
    : null

  if (!localityContextIsValid(state, context)) {
    return {
      authorized: false,
      reason: 'invalid-locality-context',
      employerCompanyId,
      employerLocationRef: null,
      assignmentRef: null,
    }
  }
  if (!state.employment || state.employment.status !== 'Active') {
    return {
      authorized: false,
      reason: 'no-employment',
      employerCompanyId: null,
      employerLocationRef: assignment?.employerLocationRef ?? null,
      assignmentRef: assignment?.assignmentRef ?? null,
    }
  }
  if (!assignment) {
    return {
      authorized: false,
      reason: 'assignment-required',
      employerCompanyId,
      employerLocationRef: null,
      assignmentRef: null,
    }
  }
  if (!assignmentIsStructurallyValid(assignment)) {
    return {
      authorized: false,
      reason: 'invalid-assignment',
      employerCompanyId,
      employerLocationRef: null,
      assignmentRef: null,
    }
  }
  if (
    assignment.worldInstanceId !== state.worldInstanceId ||
    assignment.worldInstanceId !== context.worldInstanceId
  ) {
    return {
      authorized: false,
      reason: 'world-mismatch',
      employerCompanyId,
      employerLocationRef: assignment.employerLocationRef,
      assignmentRef: assignment.assignmentRef,
    }
  }
  if (assignment.localityId !== context.currentLocalityId) {
    return {
      authorized: false,
      reason: 'locality-mismatch',
      employerCompanyId,
      employerLocationRef: assignment.employerLocationRef,
      assignmentRef: assignment.assignmentRef,
    }
  }
  if (assignment.employerCompanyId !== state.employment.employerCompanyId) {
    return {
      authorized: false,
      reason: 'employer-mismatch',
      employerCompanyId,
      employerLocationRef: assignment.employerLocationRef,
      assignmentRef: assignment.assignmentRef,
    }
  }
  if (
    !state.employerCompanyMoney ||
    state.employerCompanyMoney.ownerKind !== 'Company' ||
    state.employerCompanyMoney.ownerId !== assignment.employerCompanyId
  ) {
    return {
      authorized: false,
      reason: 'employer-ledger-mismatch',
      employerCompanyId,
      employerLocationRef: assignment.employerLocationRef,
      assignmentRef: assignment.assignmentRef,
    }
  }

  return {
    authorized: true,
    reason: 'authorized',
    employerCompanyId,
    employerLocationRef: assignment.employerLocationRef,
    assignmentRef: assignment.assignmentRef,
  }
}

/**
 * Projects economic continuity for the current locality without changing any state.
 *
 * Personal Money, Work Capacity and hardship belong to world+hero continuity, not
 * to Brăila or any other locality. Employer treasury is exposed to local consumers
 * only when a matching external local assignment exists.
 */
export const projectPlayerEconomyLocalityContinuity = (
  state: PlayerEconomyState,
  context: PlayerEconomyLocalityContext,
  assignment?: PlayerEconomyLocalEmployerAssignment,
): PlayerEconomyLocalityProjectionResult => {
  if (!localityContextIsValid(state, context)) {
    return { ok: false, reason: 'invalid-locality-context' }
  }

  const localAccess = evaluatePlayerEconomyLocalEmployerAccess(state, context, assignment)
  return {
    ok: true,
    projection: {
      worldInstanceId: state.worldInstanceId,
      heroActorId: state.heroActorId,
      currentCountryId: context.currentCountryId,
      currentLocalityId: context.currentLocalityId,
      localityAuthorityRef: context.authorityRef,
      personalMoney: {
        balanceMinor: state.personalMoney.balanceMinor,
        transactionIds: state.personalMoney.ledger.map(entry => entry.transactionId),
      },
      workCapacity: {
        current: state.workCapacity.current,
        max: state.workCapacity.max,
        productiveWorkActivityIds: state.workCapacity.activities.map(record => record.activityId),
        settledRestIds: [...state.workCapacity.settledRestIds],
      },
      living: {
        financialStatus: state.living.financialStatus,
        housingStatus: state.living.housingStatus,
        arrearsMinor: state.living.arrearsMinor,
        settledObligationIds: [...state.living.settledObligationIds],
      },
      employment: {
        employerCompanyId: state.employment?.status === 'Active'
          ? state.employment.employerCompanyId
          : null,
        localAccess,
        employerTreasuryBalanceMinor: localAccess.authorized
          ? state.employerCompanyMoney?.balanceMinor ?? null
          : null,
      },
    },
  }
}

type RuntimeProductiveWorkFailureReason = Extract<
  RuntimeProductiveWorkResult,
  { applied: false }
>['reason']

export type LocalityScopedProductiveWorkResult =
  | {
      applied: true
      state: PlayerEconomyState
      localityId: string
      workSourceRef: string
      orderId: string
      activityId: string
      productiveMinutes: number
      capacityConsumed: number
    }
  | {
      applied: false
      state: PlayerEconomyState
      reason:
        | 'invalid-locality-context'
        | 'local-employer-not-authorized'
        | 'invalid-work-source'
        | 'work-source-world-mismatch'
        | 'work-source-locality-mismatch'
        | 'work-source-employer-mismatch'
        | 'work-source-location-mismatch'
        | 'work-source-order-mismatch'
        | RuntimeProductiveWorkFailureReason
    }

const workSourceIsStructurallyValid = (
  source: PlayerEconomyLocalWorkSource,
): boolean =>
  validToken(source.worldInstanceId) &&
  validToken(source.localityId) &&
  validToken(source.employerCompanyId) &&
  validToken(source.employerLocationRef) &&
  validToken(source.orderId) &&
  validToken(source.workSourceRef)

/**
 * Locality gate around the existing real-delivery -> productive-work adapter.
 *
 * The locality/work/employer authorities are evidence only. Existing order/cargo
 * settlement still proves that real work happened, and the existing DT-03 adapter
 * still owns Work Capacity and duplicate-order protection.
 */
export const recordLocalityScopedSettledDeliveryWork = (
  state: PlayerEconomyState,
  clock: WorldClockState,
  context: PlayerEconomyLocalityContext,
  assignment: PlayerEconomyLocalEmployerAssignment,
  workSource: PlayerEconomyLocalWorkSource,
  sourceOrder: OrderState,
  interaction: Pick<UrbanInteractionResult, 'settled' | 'world'>,
  policy: PlayerEconomyPolicy = PROTOTYPE_PLAYER_ECONOMY_POLICY,
  clockPolicy: WorldClockPolicy = PROTOTYPE_WORLD_CLOCK_POLICY,
): LocalityScopedProductiveWorkResult => {
  if (!localityContextIsValid(state, context) || clock.worldInstanceId !== state.worldInstanceId) {
    return { applied: false, state, reason: 'invalid-locality-context' }
  }

  const localEmployer = evaluatePlayerEconomyLocalEmployerAccess(state, context, assignment)
  if (!localEmployer.authorized) {
    return { applied: false, state, reason: 'local-employer-not-authorized' }
  }
  if (!workSourceIsStructurallyValid(workSource)) {
    return { applied: false, state, reason: 'invalid-work-source' }
  }
  if (workSource.worldInstanceId !== context.worldInstanceId) {
    return { applied: false, state, reason: 'work-source-world-mismatch' }
  }
  if (workSource.localityId !== context.currentLocalityId) {
    return { applied: false, state, reason: 'work-source-locality-mismatch' }
  }
  if (workSource.employerCompanyId !== assignment.employerCompanyId) {
    return { applied: false, state, reason: 'work-source-employer-mismatch' }
  }
  if (workSource.employerLocationRef !== assignment.employerLocationRef) {
    return { applied: false, state, reason: 'work-source-location-mismatch' }
  }
  if (workSource.orderId !== sourceOrder.orderId) {
    return { applied: false, state, reason: 'work-source-order-mismatch' }
  }

  const work = recordSettledUrbanDeliveryWork(
    state,
    clock,
    sourceOrder,
    interaction,
    policy,
    clockPolicy,
  )
  if (!work.applied) return work

  return {
    applied: true,
    state: work.state,
    localityId: context.currentLocalityId,
    workSourceRef: workSource.workSourceRef,
    orderId: work.orderId,
    activityId: work.activityId,
    productiveMinutes: work.productiveMinutes,
    capacityConsumed: work.capacityConsumed,
  }
}

type WageFailureReason = Extract<WageSettlementResult, { settled: false }>['reason']

export type LocalityInvariantWageSettlementResult =
  | {
      settled: true
      state: PlayerEconomyState
      localityId: string
      transactionId: string
      amountMinor: number
      operatingDayIndex: number
      shiftIndex: number
    }
  | {
      settled: false
      state: PlayerEconomyState
      reason: 'invalid-locality-context' | WageFailureReason
    }

/**
 * Settles already-earned work without re-keying wage identity to current locality.
 *
 * A player may legitimately cross a locality boundary after doing work but before
 * the completed shift is settled. The existing world+hero+day+shift transaction ID
 * therefore remains authoritative and exactly once; relocation neither cancels nor
 * duplicates the accrued wage.
 */
export const settleEmployeeShiftWageAcrossLocalityContext = (
  state: PlayerEconomyState,
  clock: WorldClockState,
  context: PlayerEconomyLocalityContext,
  policy: PlayerEconomyPolicy = PROTOTYPE_PLAYER_ECONOMY_POLICY,
  clockPolicy: WorldClockPolicy = PROTOTYPE_WORLD_CLOCK_POLICY,
): LocalityInvariantWageSettlementResult => {
  if (!localityContextIsValid(state, context) || clock.worldInstanceId !== state.worldInstanceId) {
    return { settled: false, state, reason: 'invalid-locality-context' }
  }

  const wage = settleRuntimeEmployeeShiftWage(state, clock, policy, clockPolicy)
  if (!wage.settled) return wage
  return {
    ...wage,
    localityId: context.currentLocalityId,
  }
}
