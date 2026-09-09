import type { OrderState } from '../types/game'
import type { UrbanInteractionResult } from '../systems/urbanInteractions'
import {
  PROTOTYPE_WORLD_CLOCK_POLICY,
  type WorldClockPolicy,
} from '../systems/worldClockSystem'
import type { WorldClockState } from '../world/globalWorld'
import {
  PROTOTYPE_PLAYER_ECONOMY_POLICY,
  performBasicDeliveryWork,
  settleCompletedStarterShiftWage,
  type BasicDeliveryWorkResult,
  type PlayerEconomyPolicy,
  type PlayerEconomyState,
  type WageSettlementResult,
} from './playerEconomy'

const RUNTIME_DELIVERY_ACTIVITY_PREFIX = 'runtime-delivery:'
const MAX_RUNTIME_ORDER_ID_LENGTH = 120

type BasicDeliveryWorkFailureReason = Extract<
  BasicDeliveryWorkResult,
  { performed: false }
>['reason']

export interface PlayerEconomyWorkPort {
  worldInstanceId: string
  heroActorId: string
  mode: PlayerEconomyState['mode']
  employerCompanyId: string | null
  transportMode: 'Walking' | null
  personalMoneyBalanceMinor: number
  employerTreasuryBalanceMinor: number | null
  workCapacityCurrent: number
  workCapacityMax: number
  canPerformBasicDelivery: boolean
}

export type RuntimeProductiveWorkResult =
  | {
      applied: true
      state: PlayerEconomyState
      orderId: string
      activityId: string
      productiveMinutes: number
      capacityConsumed: number
    }
  | {
      applied: false
      state: PlayerEconomyState
      reason:
        | 'invalid-order'
        | 'runtime-not-settled'
        | 'invalid-runtime-transition'
        | 'duplicate-delivery'
        | Exclude<BasicDeliveryWorkFailureReason, 'duplicate-activity'>
    }

const validRuntimeOrderId = (orderId: unknown): orderId is string =>
  typeof orderId === 'string' &&
  orderId.trim().length > 0 &&
  orderId.trim().length <= MAX_RUNTIME_ORDER_ID_LENGTH

const runtimeActivityRefFor = (orderId: string): string =>
  `${RUNTIME_DELIVERY_ACTIVITY_PREFIX}${orderId.trim()}`

const hasRecordedRuntimeDelivery = (
  state: PlayerEconomyState,
  orderId: string,
): boolean => {
  const suffix = `:${runtimeActivityRefFor(orderId)}`
  return state.workCapacity.activities.some((activity) => activity.activityId.endsWith(suffix))
}

const isCompletedRuntimeTransition = (
  sourceOrder: OrderState,
  interaction: Pick<UrbanInteractionResult, 'settled' | 'world'>,
): boolean =>
  sourceOrder.status === 'PickedUp' &&
  !sourceOrder.economySettled &&
  interaction.settled &&
  interaction.world.activeOrder.orderId !== sourceOrder.orderId &&
  interaction.world.player.currentOrder === '' &&
  !interaction.world.player.carryingPackage

/**
 * Read-only port for runtime eligibility/presentation consumers.
 *
 * It deliberately exposes no mutation callback and does not depend on the
 * Personal Capability engine. DT-06 may consume this port while retaining
 * ownership of profession/capability eligibility rules.
 */
export const readPlayerEconomyWorkPort = (
  state: PlayerEconomyState,
  policy: PlayerEconomyPolicy = PROTOTYPE_PLAYER_ECONOMY_POLICY,
): PlayerEconomyWorkPort => ({
  worldInstanceId: state.worldInstanceId,
  heroActorId: state.heroActorId,
  mode: state.mode,
  employerCompanyId: state.employment?.status === 'Active'
    ? state.employment.employerCompanyId
    : null,
  transportMode: state.employment?.status === 'Active'
    ? state.employment.transportMode
    : null,
  personalMoneyBalanceMinor: state.personalMoney.balanceMinor,
  employerTreasuryBalanceMinor: state.employerCompanyMoney?.balanceMinor ?? null,
  workCapacityCurrent: state.workCapacity.current,
  workCapacityMax: state.workCapacity.max,
  canPerformBasicDelivery:
    state.mode === 'FreshEmployee' &&
    state.employment?.status === 'Active' &&
    state.workCapacity.current >= policy.starterDeliveryCapacityCost,
})

/**
 * Convert one already-settled real urban delivery into employee productive work.
 *
 * The authoritative delivery path remains `performUrbanInteraction()` ->
 * `settleDeliveryOutcome()`. This adapter never awards the legacy per-order reward
 * and never edits CompanyState. It only accepts the post-settlement runtime result
 * as evidence that real pickup/cargo/delivery work completed, then records that
 * work through the Player Economy domain.
 *
 * Duplicate protection is deliberately independent of C1 shift/day. Replaying the
 * same order ID after time advances must not consume Work Capacity or manufacture
 * additional productive minutes for a later wage settlement.
 */
export const recordSettledUrbanDeliveryWork = (
  state: PlayerEconomyState,
  clock: WorldClockState,
  sourceOrder: OrderState,
  interaction: Pick<UrbanInteractionResult, 'settled' | 'world'>,
  policy: PlayerEconomyPolicy = PROTOTYPE_PLAYER_ECONOMY_POLICY,
  clockPolicy: WorldClockPolicy = PROTOTYPE_WORLD_CLOCK_POLICY,
): RuntimeProductiveWorkResult => {
  if (!validRuntimeOrderId(sourceOrder.orderId)) {
    return { applied: false, state, reason: 'invalid-order' }
  }
  if (!interaction.settled) {
    return { applied: false, state, reason: 'runtime-not-settled' }
  }
  if (!isCompletedRuntimeTransition(sourceOrder, interaction)) {
    return { applied: false, state, reason: 'invalid-runtime-transition' }
  }
  if (hasRecordedRuntimeDelivery(state, sourceOrder.orderId)) {
    return { applied: false, state, reason: 'duplicate-delivery' }
  }

  const work = performBasicDeliveryWork(
    state,
    clock,
    runtimeActivityRefFor(sourceOrder.orderId),
    policy,
    clockPolicy,
  )
  if (!work.performed) {
    return {
      applied: false,
      state: work.state,
      reason: work.reason === 'duplicate-activity' ? 'duplicate-delivery' : work.reason,
    }
  }

  return {
    applied: true,
    state: work.state,
    orderId: sourceOrder.orderId,
    activityId: work.record.activityId,
    productiveMinutes: work.record.productiveMinutes,
    capacityConsumed: work.record.capacityConsumed,
  }
}

/**
 * Runtime-facing wage boundary. Real productive work recorded above is the input;
 * the Player Economy domain remains the sole owner of company -> person transfer,
 * conservation, completed-shift checks and exactly-once transaction identity.
 */
export const settleRuntimeEmployeeShiftWage = (
  state: PlayerEconomyState,
  clock: WorldClockState,
  policy: PlayerEconomyPolicy = PROTOTYPE_PLAYER_ECONOMY_POLICY,
  clockPolicy: WorldClockPolicy = PROTOTYPE_WORLD_CLOCK_POLICY,
): WageSettlementResult =>
  settleCompletedStarterShiftWage(state, clock, policy, clockPolicy)
