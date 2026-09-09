import {
  PROTOTYPE_WORLD_CLOCK_POLICY,
  workShiftPosition,
  worldClockFromMinuteOrdinal,
  worldClockMinuteOrdinal,
  type WorldClockPolicy,
} from '../systems/worldClockSystem'
import type { WorldClockState } from '../world/globalWorld'
import {
  PROTOTYPE_PLAYER_ECONOMY_POLICY,
  settleBasicLivingCostsThroughClock,
  settleCompletedStarterShiftWage,
  settleLivingArrears,
  type PlayerEconomyPolicy,
  type PlayerEconomyState,
} from './playerEconomy'

const MINUTES_PER_DAY = 24 * 60

export interface EmployeeShiftProgress {
  operatingDayIndex: number
  shiftIndex: number
  productiveMinutes: number
  requiredProductiveMinutes: number
  remainingProductiveMinutes: number
  wageEligibleAtClose: boolean
  workCapacityCurrent: number
  workCapacityMax: number
}

export type EmployeeShiftProgressResult =
  | { ok: true; progress: EmployeeShiftProgress }
  | { ok: false; reason: 'legacy-mode' | 'invalid-world' }

export type ShiftWageCloseOutcome =
  | 'wage-paid'
  | 'not-earned'
  | 'already-settled'
  | 'employer-insolvent'

export interface ShiftClosedFinanceEvent {
  kind: 'ShiftClosed'
  clockMinuteOrdinal: number
  progress: EmployeeShiftProgress
  wageOutcome: ShiftWageCloseOutcome
  wagePaidMinor: number
}

export interface LivingDayFinanceEvent {
  kind: 'LivingDayClosed'
  clockMinuteOrdinal: number
  operatingDayIndex: number
  outcome: 'charged' | 'already-processed'
  paidMinor: number
  addedArrearsMinor: number
  arrearsAfterMinor: number
}

export interface ArrearsRecoveryFinanceEvent {
  kind: 'ArrearsRecovered'
  clockMinuteOrdinal: number
  paidMinor: number
  arrearsAfterMinor: number
  transactionId: string
}

export type EmployeeFinanceLifecycleEvent =
  | ShiftClosedFinanceEvent
  | LivingDayFinanceEvent
  | ArrearsRecoveryFinanceEvent

export interface EmployeeFinanceLifecycleSummary {
  events: EmployeeFinanceLifecycleEvent[]
  shiftClosures: number
  wagesPaidMinor: number
  livingCostsPaidMinor: number
  livingArrearsAddedMinor: number
  livingArrearsRecoveredMinor: number
}

export type EmployeeFinanceLifecycleResult =
  | {
      processed: true
      state: PlayerEconomyState
      summary: EmployeeFinanceLifecycleSummary
    }
  | {
      processed: false
      state: PlayerEconomyState
      reason:
        | 'legacy-mode'
        | 'invalid-world'
        | 'clock-reversed'
        | 'interval-too-large'
        | 'invalid-shift-settlement'
        | 'invalid-living-settlement'
        | 'invalid-arrears-settlement'
    }

type FinanceBoundary =
  | { kind: 'shift'; ordinal: number }
  | { kind: 'day'; ordinal: number }

const firstBoundaryAfter = (startExclusive: number, offset: number): number =>
  (Math.floor((startExclusive - offset) / MINUTES_PER_DAY) + 1) * MINUTES_PER_DAY + offset

const boundariesBetween = (
  startExclusive: number,
  endInclusive: number,
  clockPolicy: WorldClockPolicy,
): FinanceBoundary[] => {
  const boundaries: FinanceBoundary[] = []
  for (const shiftStart of [...clockPolicy.shiftStartMinutes].sort((a, b) => a - b)) {
    for (
      let ordinal = firstBoundaryAfter(startExclusive, shiftStart);
      ordinal <= endInclusive;
      ordinal += MINUTES_PER_DAY
    ) {
      boundaries.push({ kind: 'shift', ordinal })
    }
  }
  for (
    let ordinal = firstBoundaryAfter(startExclusive, clockPolicy.operatingDayStartMinute);
    ordinal <= endInclusive;
    ordinal += MINUTES_PER_DAY
  ) {
    boundaries.push({ kind: 'day', ordinal })
  }
  return boundaries.sort((left, right) =>
    left.ordinal - right.ordinal || (left.kind === 'shift' ? -1 : 1))
}

const previousShiftAtBoundary = (
  boundaryClock: WorldClockState,
  clockPolicy: WorldClockPolicy,
): { operatingDayIndex: number; shiftIndex: number } | null => {
  const current = workShiftPosition(boundaryClock, clockPolicy)
  const shiftCount = clockPolicy.shiftStartMinutes.length
  if (shiftCount <= 0) return null
  if (current.shiftIndex > 0) {
    return {
      operatingDayIndex: current.operatingDayIndex,
      shiftIndex: current.shiftIndex - 1,
    }
  }
  return {
    operatingDayIndex: current.operatingDayIndex - 1,
    shiftIndex: shiftCount - 1,
  }
}

const progressForShift = (
  state: PlayerEconomyState,
  operatingDayIndex: number,
  shiftIndex: number,
  policy: PlayerEconomyPolicy,
): EmployeeShiftProgress => {
  const productiveMinutes = state.workCapacity.activities
    .filter(record =>
      record.operatingDayIndex === operatingDayIndex &&
      record.shiftIndex === shiftIndex)
    .reduce((total, record) => total + record.productiveMinutes, 0)
  const safeProductiveMinutes = Number.isSafeInteger(productiveMinutes) && productiveMinutes >= 0
    ? productiveMinutes
    : 0
  const remainingProductiveMinutes = Math.max(
    0,
    policy.starterShiftRequiredProductiveMinutes - safeProductiveMinutes,
  )
  return {
    operatingDayIndex,
    shiftIndex,
    productiveMinutes: safeProductiveMinutes,
    requiredProductiveMinutes: policy.starterShiftRequiredProductiveMinutes,
    remainingProductiveMinutes,
    wageEligibleAtClose: remainingProductiveMinutes === 0,
    workCapacityCurrent: state.workCapacity.current,
    workCapacityMax: state.workCapacity.max,
  }
}

export const readCurrentEmployeeShiftProgress = (
  state: PlayerEconomyState,
  clock: WorldClockState,
  policy: PlayerEconomyPolicy = PROTOTYPE_PLAYER_ECONOMY_POLICY,
  clockPolicy: WorldClockPolicy = PROTOTYPE_WORLD_CLOCK_POLICY,
): EmployeeShiftProgressResult => {
  if (state.mode !== 'FreshEmployee') return { ok: false, reason: 'legacy-mode' }
  if (state.worldInstanceId !== clock.worldInstanceId) return { ok: false, reason: 'invalid-world' }
  const shift = workShiftPosition(clock, clockPolicy)
  return {
    ok: true,
    progress: progressForShift(
      state,
      shift.operatingDayIndex,
      shift.shiftIndex,
      policy,
    ),
  }
}

const emptySummary = (): EmployeeFinanceLifecycleSummary => ({
  events: [],
  shiftClosures: 0,
  wagesPaidMinor: 0,
  livingCostsPaidMinor: 0,
  livingArrearsAddedMinor: 0,
  livingArrearsRecoveredMinor: 0,
})

/**
 * Processes employee finance only at authoritative C1 boundaries.
 *
 * Shift boundaries close productive work and attempt exactly-once wage settlement.
 * Operating-day boundaries charge exactly-once living costs. If a newly paid wage
 * becomes available while arrears already exist, that same C1 boundary provides the
 * deterministic recovery path by applying available Personal Money to arrears.
 *
 * Events are processed chronologically. If a shift and operating-day boundary share
 * the same minute under a future policy, wage settlement runs first, then living cost.
 * This module owns no Save schema, UI, mission reward, dialogue reward or legacy
 * CompanyState mutation.
 */
export const processEmployeeFinanceLifecycleThroughClock = (
  state: PlayerEconomyState,
  fromClock: WorldClockState,
  toClock: WorldClockState,
  policy: PlayerEconomyPolicy = PROTOTYPE_PLAYER_ECONOMY_POLICY,
  clockPolicy: WorldClockPolicy = PROTOTYPE_WORLD_CLOCK_POLICY,
): EmployeeFinanceLifecycleResult => {
  if (state.mode !== 'FreshEmployee') {
    return { processed: false, state, reason: 'legacy-mode' }
  }
  if (
    state.worldInstanceId !== fromClock.worldInstanceId ||
    state.worldInstanceId !== toClock.worldInstanceId
  ) {
    return { processed: false, state, reason: 'invalid-world' }
  }

  const fromMinute = worldClockMinuteOrdinal(fromClock, clockPolicy)
  const toMinute = worldClockMinuteOrdinal(toClock, clockPolicy)
  if (toMinute < fromMinute) {
    return { processed: false, state, reason: 'clock-reversed' }
  }
  if (toMinute - fromMinute > clockPolicy.maxAdvanceMinutes) {
    return { processed: false, state, reason: 'interval-too-large' }
  }

  const boundaries = boundariesBetween(fromMinute, toMinute, clockPolicy)
  const summary = emptySummary()
  let currentState = state

  for (const boundary of boundaries) {
    const boundaryClock = worldClockFromMinuteOrdinal(
      state.worldInstanceId,
      boundary.ordinal,
      clockPolicy,
    )

    if (boundary.kind === 'shift') {
      const completed = previousShiftAtBoundary(boundaryClock, clockPolicy)
      if (!completed || completed.operatingDayIndex < 0) continue
      const progress = progressForShift(
        currentState,
        completed.operatingDayIndex,
        completed.shiftIndex,
        policy,
      )
      const wage = settleCompletedStarterShiftWage(
        currentState,
        boundaryClock,
        policy,
        clockPolicy,
      )

      let wageOutcome: ShiftWageCloseOutcome
      let wagePaidMinor = 0
      if (wage.settled) {
        if (!progress.wageEligibleAtClose) {
          return { processed: false, state, reason: 'invalid-shift-settlement' }
        }
        currentState = wage.state
        wageOutcome = 'wage-paid'
        wagePaidMinor = wage.amountMinor
        summary.wagesPaidMinor += wage.amountMinor
      } else if (wage.reason === 'not-enough-work') {
        if (progress.wageEligibleAtClose) {
          return { processed: false, state, reason: 'invalid-shift-settlement' }
        }
        wageOutcome = 'not-earned'
      } else if (wage.reason === 'already-settled') {
        wageOutcome = 'already-settled'
      } else if (wage.reason === 'employer-insolvent') {
        wageOutcome = 'employer-insolvent'
      } else {
        return { processed: false, state, reason: 'invalid-shift-settlement' }
      }

      summary.shiftClosures += 1
      summary.events.push({
        kind: 'ShiftClosed',
        clockMinuteOrdinal: boundary.ordinal,
        progress,
        wageOutcome,
        wagePaidMinor,
      })

      if (
        wageOutcome === 'wage-paid' &&
        currentState.living.arrearsMinor > 0 &&
        currentState.personalMoney.balanceMinor > 0
      ) {
        const recovered = settleLivingArrears(
          currentState,
          boundaryClock,
          policy,
          clockPolicy,
        )
        if (!recovered.settled) {
          return { processed: false, state, reason: 'invalid-arrears-settlement' }
        }
        currentState = recovered.state
        summary.livingArrearsRecoveredMinor += recovered.paidMinor
        summary.events.push({
          kind: 'ArrearsRecovered',
          clockMinuteOrdinal: boundary.ordinal,
          paidMinor: recovered.paidMinor,
          arrearsAfterMinor: currentState.living.arrearsMinor,
          transactionId: recovered.transactionId,
        })
      }
      continue
    }

    const beforeBoundary = worldClockFromMinuteOrdinal(
      state.worldInstanceId,
      Math.max(0, boundary.ordinal - 1),
      clockPolicy,
    )
    const living = settleBasicLivingCostsThroughClock(
      currentState,
      beforeBoundary,
      boundaryClock,
      policy,
      clockPolicy,
    )
    if (!living.settled || living.summary.processedOperatingDays.length > 1) {
      return { processed: false, state, reason: 'invalid-living-settlement' }
    }
    currentState = living.state
    const processedDay = living.summary.processedOperatingDays[0]
    summary.livingCostsPaidMinor += living.summary.paidMinor
    summary.livingArrearsAddedMinor += living.summary.addedArrearsMinor
    summary.events.push({
      kind: 'LivingDayClosed',
      clockMinuteOrdinal: boundary.ordinal,
      operatingDayIndex: processedDay ?? currentState.living.lastSettledOperatingDay,
      outcome: processedDay === undefined ? 'already-processed' : 'charged',
      paidMinor: living.summary.paidMinor,
      addedArrearsMinor: living.summary.addedArrearsMinor,
      arrearsAfterMinor: currentState.living.arrearsMinor,
    })
  }

  return { processed: true, state: currentState, summary }
}
