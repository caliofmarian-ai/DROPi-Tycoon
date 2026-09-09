import {
  PROTOTYPE_WORLD_CLOCK_POLICY,
  type WorldClockPolicy,
} from '../systems/worldClockSystem'
import type { WorldClockState } from '../world/globalWorld'
import {
  PROTOTYPE_PLAYER_ECONOMY_POLICY,
  settleLivingArrears,
  type MoneyLedgerEntry,
  type PersonalFinancialStatus,
  type PersonalHousingStatus,
  type PlayerEconomyPolicy,
  type PlayerEconomyState,
} from './playerEconomy'
import {
  processEmployeeFinanceLifecycleThroughClock,
  type EmployeeFinanceLifecycleSummary,
} from './playerEconomyFinanceLifecycle'

const MINUTES_PER_DAY = 24 * 60

export type HardshipTransitionKind =
  | 'InsolvencyEntered'
  | 'EmergencyHousingEntered'
  | 'ArrearsRecoveryApplied'
  | 'EmergencyHousingExited'
  | 'RecoveryStarted'
  | 'StableRecoveryReached'

export interface HardshipTransitionRecord {
  transitionId: string
  kind: HardshipTransitionKind
  sourceId: string
  clockMinuteOrdinal: number
  operatingDayIndex: number
  arrearsBeforeMinor: number
  arrearsAfterMinor: number
  financialStatusBefore: PersonalFinancialStatus
  financialStatusAfter: PersonalFinancialStatus
  housingStatusBefore: PersonalHousingStatus
  housingStatusAfter: PersonalHousingStatus
}

export interface HardshipDayRecord {
  dayId: string
  operatingDayIndex: number
  clockMinuteOrdinal: number
  paidMinor: number
  addedArrearsMinor: number
  arrearsBeforeMinor: number
  arrearsAfterMinor: number
  financialStatusBefore: PersonalFinancialStatus
  financialStatusAfter: PersonalFinancialStatus
  housingStatusBefore: PersonalHousingStatus
  housingStatusAfter: PersonalHousingStatus
}

export interface HardshipRecoveryRecord {
  transactionId: string
  clockMinuteOrdinal: number
  operatingDayIndex: number
  paidMinor: number
  arrearsBeforeMinor: number
  arrearsAfterMinor: number
  financialStatusBefore: PersonalFinancialStatus
  financialStatusAfter: PersonalFinancialStatus
  housingStatusBefore: PersonalHousingStatus
  housingStatusAfter: PersonalHousingStatus
}

export interface PlayerHardshipSnapshot {
  financialStatus: PersonalFinancialStatus
  housingStatus: PersonalHousingStatus
  arrearsMinor: number
  personalMoneyBalanceMinor: number
  insolvent: boolean
  emergencyHousingActive: boolean
  transitionCount: number
}

export interface PlayerHardshipTimeline {
  days: HardshipDayRecord[]
  recoveries: HardshipRecoveryRecord[]
  transitions: HardshipTransitionRecord[]
  snapshot: PlayerHardshipSnapshot
}

export type PlayerHardshipTimelineResult =
  | { ok: true; timeline: PlayerHardshipTimeline }
  | { ok: false; reason: 'invalid-state' }

type FinanceFailureReason =
  | 'legacy-mode'
  | 'invalid-world'
  | 'clock-reversed'
  | 'interval-too-large'
  | 'invalid-shift-settlement'
  | 'invalid-living-settlement'
  | 'invalid-arrears-settlement'

type ArrearsFailureReason =
  | 'invalid-world'
  | 'nothing-due'
  | 'no-money'
  | 'already-settled'
  | 'invalid-state'

export interface HardshipClockSummary {
  finance: EmployeeFinanceLifecycleSummary
  days: HardshipDayRecord[]
  transitions: HardshipTransitionRecord[]
  snapshotBefore: PlayerHardshipSnapshot
  snapshotAfter: PlayerHardshipSnapshot
}

export type HardshipClockProcessResult =
  | {
      processed: true
      state: PlayerEconomyState
      summary: HardshipClockSummary
    }
  | {
      processed: false
      state: PlayerEconomyState
      reason: FinanceFailureReason | 'invalid-hardship-state'
    }

export type HardshipRecoveryResult =
  | {
      recovered: true
      state: PlayerEconomyState
      paidMinor: number
      transactionId: string
      recovery: HardshipRecoveryRecord
      transitions: HardshipTransitionRecord[]
      snapshot: PlayerHardshipSnapshot
    }
  | {
      recovered: false
      state: PlayerEconomyState
      reason: ArrearsFailureReason | 'invalid-hardship-state'
    }

type DerivedHardshipEvent =
  | {
      kind: 'day'
      ordinal: number
      tieOrder: 1
      dayId: string
      operatingDayIndex: number
      paidMinor: number
    }
  | {
      kind: 'recovery'
      ordinal: number
      tieOrder: 0
      ledgerIndex: number
      entry: MoneyLedgerEntry
    }

const validNonNegativeMoney = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value >= 0

const validClockOrdinal = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value >= 0

const validFinancialStatus = (value: unknown): value is PersonalFinancialStatus =>
  value === 'Stable' || value === 'Insolvent' || value === 'Recovering'

const validHousingStatus = (value: unknown): value is PersonalHousingStatus =>
  value === 'Housed' || value === 'EmergencyHousing'

const transitionedTo = <T extends string>(before: T, after: T, target: T): boolean =>
  before !== target && after === target

const transitionedFromTo = <T extends string>(
  before: T,
  after: T,
  from: T,
  to: T,
): boolean => before === from && after === to

const dayBoundaryOrdinal = (
  operatingDay: number,
  clockPolicy: WorldClockPolicy,
): number => operatingDay * MINUTES_PER_DAY + clockPolicy.operatingDayStartMinute

const operatingDayForOrdinal = (
  ordinal: number,
  clockPolicy: WorldClockPolicy,
): number => Math.floor((ordinal - clockPolicy.operatingDayStartMinute) / MINUTES_PER_DAY)

const transitionIdFor = (
  state: PlayerEconomyState,
  sourceType: 'day' | 'recovery',
  sourceId: string,
  kind: HardshipTransitionKind,
): string => `hardship:${state.worldInstanceId}:${state.heroActorId}:${sourceType}:${sourceId}:${kind}`

const transitionRecord = (
  state: PlayerEconomyState,
  sourceType: 'day' | 'recovery',
  sourceId: string,
  kind: HardshipTransitionKind,
  clockMinuteOrdinal: number,
  operatingDayIndex: number,
  arrearsBeforeMinor: number,
  arrearsAfterMinor: number,
  financialStatusBefore: PersonalFinancialStatus,
  financialStatusAfter: PersonalFinancialStatus,
  housingStatusBefore: PersonalHousingStatus,
  housingStatusAfter: PersonalHousingStatus,
): HardshipTransitionRecord => ({
  transitionId: transitionIdFor(state, sourceType, sourceId, kind),
  kind,
  sourceId,
  clockMinuteOrdinal,
  operatingDayIndex,
  arrearsBeforeMinor,
  arrearsAfterMinor,
  financialStatusBefore,
  financialStatusAfter,
  housingStatusBefore,
  housingStatusAfter,
})

const validatePersonalLedger = (
  state: PlayerEconomyState,
): Map<string, { entry: MoneyLedgerEntry; index: number }> | null => {
  if (
    state.personalMoney.ownerKind !== 'Person' ||
    state.personalMoney.ownerId !== state.heroActorId ||
    !validNonNegativeMoney(state.personalMoney.balanceMinor)
  ) {
    return null
  }

  let derivedBalance = 0
  const entries = new Map<string, { entry: MoneyLedgerEntry; index: number }>()
  for (let index = 0; index < state.personalMoney.ledger.length; index += 1) {
    const entry = state.personalMoney.ledger[index]
    if (
      typeof entry.transactionId !== 'string' ||
      entry.transactionId.length === 0 ||
      entries.has(entry.transactionId) ||
      entry.worldInstanceId !== state.worldInstanceId ||
      entry.ownerKind !== 'Person' ||
      entry.ownerId !== state.heroActorId ||
      !Number.isSafeInteger(entry.amountMinor) ||
      !validClockOrdinal(entry.clockMinuteOrdinal)
    ) {
      return null
    }
    derivedBalance += entry.amountMinor
    if (!validNonNegativeMoney(derivedBalance)) return null
    entries.set(entry.transactionId, { entry, index })
  }

  return derivedBalance === state.personalMoney.balanceMinor ? entries : null
}

const parseSettledLivingDays = (
  state: PlayerEconomyState,
  ledger: Map<string, { entry: MoneyLedgerEntry; index: number }>,
  policy: PlayerEconomyPolicy,
  clockPolicy: WorldClockPolicy,
): DerivedHardshipEvent[] | null => {
  const prefix = `living:${state.worldInstanceId}:${state.heroActorId}:`
  const seenDayIds = new Set<string>()
  const seenDayIndexes = new Set<number>()
  const events: DerivedHardshipEvent[] = []

  for (const dayId of state.living.settledObligationIds) {
    if (typeof dayId !== 'string' || !dayId.startsWith(prefix) || seenDayIds.has(dayId)) {
      return null
    }
    const dayToken = dayId.slice(prefix.length)
    if (!/^-?\d+$/.test(dayToken)) return null
    const operatingDayIndex = Number(dayToken)
    if (!Number.isSafeInteger(operatingDayIndex) || operatingDayIndex < 0 || seenDayIndexes.has(operatingDayIndex)) {
      return null
    }

    const payment = ledger.get(dayId)?.entry
    let paidMinor = 0
    if (payment) {
      if (
        payment.reason !== 'BasicLivingCost' ||
        payment.amountMinor >= 0 ||
        -payment.amountMinor > policy.basicLivingCostMinor
      ) {
        return null
      }
      paidMinor = -payment.amountMinor
    }

    const ordinal = dayBoundaryOrdinal(operatingDayIndex, clockPolicy)
    if (!validClockOrdinal(ordinal)) return null
    events.push({
      kind: 'day',
      ordinal,
      tieOrder: 1,
      dayId,
      operatingDayIndex,
      paidMinor,
    })
    seenDayIds.add(dayId)
    seenDayIndexes.add(operatingDayIndex)
  }

  if (events.length > 0) {
    const maxDay = Math.max(...events.map(event => event.kind === 'day' ? event.operatingDayIndex : -1))
    if (maxDay !== state.living.lastSettledOperatingDay) return null
  }

  return events
}

const parseArrearsRecoveryEvents = (
  state: PlayerEconomyState,
): DerivedHardshipEvent[] | null => {
  const prefix = `living-arrears:${state.worldInstanceId}:${state.heroActorId}:`
  const events: DerivedHardshipEvent[] = []
  for (let index = 0; index < state.personalMoney.ledger.length; index += 1) {
    const entry = state.personalMoney.ledger[index]
    if (entry.reason !== 'LivingArrearsPayment') continue
    if (
      !entry.transactionId.startsWith(prefix) ||
      entry.amountMinor >= 0 ||
      !validClockOrdinal(entry.clockMinuteOrdinal)
    ) {
      return null
    }
    events.push({
      kind: 'recovery',
      ordinal: entry.clockMinuteOrdinal,
      tieOrder: 0,
      ledgerIndex: index,
      entry,
    })
  }
  return events
}

const newTransitionsSince = (
  before: PlayerHardshipTimeline,
  after: PlayerHardshipTimeline,
): HardshipTransitionRecord[] => {
  const previousIds = new Set(before.transitions.map(transition => transition.transitionId))
  return after.transitions.filter(transition => !previousIds.has(transition.transitionId))
}

const newDaysSince = (
  before: PlayerHardshipTimeline,
  after: PlayerHardshipTimeline,
): HardshipDayRecord[] => {
  const previousIds = new Set(before.days.map(day => day.dayId))
  return after.days.filter(day => !previousIds.has(day.dayId))
}

/**
 * Reconstructs hardship history from the existing authoritative Personal Money ledger
 * and settled living-obligation IDs. No second money ledger or transition store exists.
 * Identical economic state therefore produces identical day and transition IDs.
 */
export const readPlayerHardshipTimeline = (
  state: PlayerEconomyState,
  policy: PlayerEconomyPolicy = PROTOTYPE_PLAYER_ECONOMY_POLICY,
  clockPolicy: WorldClockPolicy = PROTOTYPE_WORLD_CLOCK_POLICY,
): PlayerHardshipTimelineResult => {
  if (
    !validNonNegativeMoney(state.living.arrearsMinor) ||
    !Number.isSafeInteger(state.living.lastSettledOperatingDay) ||
    !Array.isArray(state.living.settledObligationIds) ||
    !validFinancialStatus(state.living.financialStatus) ||
    !validHousingStatus(state.living.housingStatus)
  ) {
    return { ok: false, reason: 'invalid-state' }
  }

  const ledger = validatePersonalLedger(state)
  if (!ledger) return { ok: false, reason: 'invalid-state' }
  const dayEvents = parseSettledLivingDays(state, ledger, policy, clockPolicy)
  const recoveryEvents = parseArrearsRecoveryEvents(state)
  if (!dayEvents || !recoveryEvents) return { ok: false, reason: 'invalid-state' }

  const events = [...dayEvents, ...recoveryEvents].sort((left, right) =>
    left.ordinal - right.ordinal ||
    left.tieOrder - right.tieOrder ||
    (left.kind === 'recovery' && right.kind === 'recovery'
      ? left.ledgerIndex - right.ledgerIndex
      : left.kind === 'day' && right.kind === 'day'
        ? left.operatingDayIndex - right.operatingDayIndex
        : 0))

  let arrearsMinor = 0
  let financialStatus: PersonalFinancialStatus = 'Stable'
  let housingStatus: PersonalHousingStatus = 'Housed'
  const days: HardshipDayRecord[] = []
  const recoveries: HardshipRecoveryRecord[] = []
  const transitions: HardshipTransitionRecord[] = []

  for (const event of events) {
    const arrearsBeforeMinor = arrearsMinor
    const financialStatusBefore: PersonalFinancialStatus = financialStatus
    const housingStatusBefore: PersonalHousingStatus = housingStatus

    if (event.kind === 'day') {
      const addedArrearsMinor = policy.basicLivingCostMinor - event.paidMinor
      if (!validNonNegativeMoney(addedArrearsMinor)) return { ok: false, reason: 'invalid-state' }
      arrearsMinor += addedArrearsMinor
      if (!validNonNegativeMoney(arrearsMinor)) return { ok: false, reason: 'invalid-state' }

      financialStatus = arrearsMinor > 0
        ? 'Insolvent'
        : financialStatusBefore === 'Recovering' ? 'Stable' : financialStatusBefore
      housingStatus = arrearsMinor >= policy.emergencyHousingArrearsMinor
        ? 'EmergencyHousing'
        : housingStatusBefore

      days.push({
        dayId: event.dayId,
        operatingDayIndex: event.operatingDayIndex,
        clockMinuteOrdinal: event.ordinal,
        paidMinor: event.paidMinor,
        addedArrearsMinor,
        arrearsBeforeMinor,
        arrearsAfterMinor: arrearsMinor,
        financialStatusBefore,
        financialStatusAfter: financialStatus,
        housingStatusBefore,
        housingStatusAfter: housingStatus,
      })

      if (transitionedTo(financialStatusBefore, financialStatus, 'Insolvent')) {
        transitions.push(transitionRecord(
          state,
          'day',
          event.dayId,
          'InsolvencyEntered',
          event.ordinal,
          event.operatingDayIndex,
          arrearsBeforeMinor,
          arrearsMinor,
          financialStatusBefore,
          financialStatus,
          housingStatusBefore,
          housingStatus,
        ))
      }
      if (transitionedTo(housingStatusBefore, housingStatus, 'EmergencyHousing')) {
        transitions.push(transitionRecord(
          state,
          'day',
          event.dayId,
          'EmergencyHousingEntered',
          event.ordinal,
          event.operatingDayIndex,
          arrearsBeforeMinor,
          arrearsMinor,
          financialStatusBefore,
          financialStatus,
          housingStatusBefore,
          housingStatus,
        ))
      }
      if (transitionedFromTo(financialStatusBefore, financialStatus, 'Recovering', 'Stable')) {
        transitions.push(transitionRecord(
          state,
          'day',
          event.dayId,
          'StableRecoveryReached',
          event.ordinal,
          event.operatingDayIndex,
          arrearsBeforeMinor,
          arrearsMinor,
          financialStatusBefore,
          financialStatus,
          housingStatusBefore,
          housingStatus,
        ))
      }
      continue
    }

    const paidMinor = -event.entry.amountMinor
    if (!validNonNegativeMoney(paidMinor) || paidMinor === 0 || paidMinor > arrearsMinor) {
      return { ok: false, reason: 'invalid-state' }
    }
    arrearsMinor -= paidMinor
    financialStatus = arrearsMinor === 0 ? 'Recovering' : 'Insolvent'
    housingStatus = arrearsMinor < policy.emergencyHousingArrearsMinor
      ? 'Housed'
      : housingStatusBefore
    const recoveryDay = operatingDayForOrdinal(event.ordinal, clockPolicy)

    recoveries.push({
      transactionId: event.entry.transactionId,
      clockMinuteOrdinal: event.ordinal,
      operatingDayIndex: recoveryDay,
      paidMinor,
      arrearsBeforeMinor,
      arrearsAfterMinor: arrearsMinor,
      financialStatusBefore,
      financialStatusAfter: financialStatus,
      housingStatusBefore,
      housingStatusAfter: housingStatus,
    })

    transitions.push(transitionRecord(
      state,
      'recovery',
      event.entry.transactionId,
      'ArrearsRecoveryApplied',
      event.ordinal,
      recoveryDay,
      arrearsBeforeMinor,
      arrearsMinor,
      financialStatusBefore,
      financialStatus,
      housingStatusBefore,
      housingStatus,
    ))
    if (transitionedFromTo(housingStatusBefore, housingStatus, 'EmergencyHousing', 'Housed')) {
      transitions.push(transitionRecord(
        state,
        'recovery',
        event.entry.transactionId,
        'EmergencyHousingExited',
        event.ordinal,
        recoveryDay,
        arrearsBeforeMinor,
        arrearsMinor,
        financialStatusBefore,
        financialStatus,
        housingStatusBefore,
        housingStatus,
      ))
    }
    if (transitionedTo(financialStatusBefore, financialStatus, 'Recovering')) {
      transitions.push(transitionRecord(
        state,
        'recovery',
        event.entry.transactionId,
        'RecoveryStarted',
        event.ordinal,
        recoveryDay,
        arrearsBeforeMinor,
        arrearsMinor,
        financialStatusBefore,
        financialStatus,
        housingStatusBefore,
        housingStatus,
      ))
    }
  }

  if (
    arrearsMinor !== state.living.arrearsMinor ||
    financialStatus !== state.living.financialStatus ||
    housingStatus !== state.living.housingStatus
  ) {
    return { ok: false, reason: 'invalid-state' }
  }

  const transitionIds = new Set<string>()
  for (const transition of transitions) {
    if (transitionIds.has(transition.transitionId)) return { ok: false, reason: 'invalid-state' }
    transitionIds.add(transition.transitionId)
  }

  return {
    ok: true,
    timeline: {
      days,
      recoveries,
      transitions,
      snapshot: {
        financialStatus,
        housingStatus,
        arrearsMinor,
        personalMoneyBalanceMinor: state.personalMoney.balanceMinor,
        insolvent: financialStatus === 'Insolvent',
        emergencyHousingActive: housingStatus === 'EmergencyHousing',
        transitionCount: transitions.length,
      },
    },
  }
}

/**
 * Runs the already-merged C1 finance lifecycle, then reports the newly materialized
 * hardship days/transitions by deterministic reconstruction. The wrapper never mints
 * money and never modifies Save, mission, UI, career or company authority.
 */
export const processEmployeeHardshipLifecycleThroughClock = (
  state: PlayerEconomyState,
  fromClock: WorldClockState,
  toClock: WorldClockState,
  policy: PlayerEconomyPolicy = PROTOTYPE_PLAYER_ECONOMY_POLICY,
  clockPolicy: WorldClockPolicy = PROTOTYPE_WORLD_CLOCK_POLICY,
): HardshipClockProcessResult => {
  const before = readPlayerHardshipTimeline(state, policy, clockPolicy)
  if (before.ok === false) return { processed: false, state, reason: 'invalid-hardship-state' }

  const finance = processEmployeeFinanceLifecycleThroughClock(
    state,
    fromClock,
    toClock,
    policy,
    clockPolicy,
  )
  if (finance.processed === false) return { processed: false, state, reason: finance.reason }

  const after = readPlayerHardshipTimeline(finance.state, policy, clockPolicy)
  if (after.ok === false) return { processed: false, state, reason: 'invalid-hardship-state' }

  return {
    processed: true,
    state: finance.state,
    summary: {
      finance: finance.summary,
      days: newDaysSince(before.timeline, after.timeline),
      transitions: newTransitionsSince(before.timeline, after.timeline),
      snapshotBefore: before.timeline.snapshot,
      snapshotAfter: after.timeline.snapshot,
    },
  }
}

/**
 * Career-neutral recovery boundary. It can only spend Personal Money that already
 * exists in the validated ledger; it never credits Personal Money or Company Money.
 * This allows future legitimate income sources to use the same hardship recovery path
 * without forcing entrepreneurship or a CEO progression branch.
 */
export const settleHardshipRecoveryFromAvailablePersonalMoney = (
  state: PlayerEconomyState,
  clock: WorldClockState,
  policy: PlayerEconomyPolicy = PROTOTYPE_PLAYER_ECONOMY_POLICY,
  clockPolicy: WorldClockPolicy = PROTOTYPE_WORLD_CLOCK_POLICY,
): HardshipRecoveryResult => {
  const before = readPlayerHardshipTimeline(state, policy, clockPolicy)
  if (before.ok === false) return { recovered: false, state, reason: 'invalid-hardship-state' }

  const settled = settleLivingArrears(state, clock, policy, clockPolicy)
  if (settled.settled === false) return { recovered: false, state, reason: settled.reason }

  const after = readPlayerHardshipTimeline(settled.state, policy, clockPolicy)
  if (after.ok === false) return { recovered: false, state, reason: 'invalid-hardship-state' }
  const recovery = after.timeline.recoveries.find(item => item.transactionId === settled.transactionId)
  if (!recovery) return { recovered: false, state, reason: 'invalid-hardship-state' }

  return {
    recovered: true,
    state: settled.state,
    paidMinor: settled.paidMinor,
    transactionId: settled.transactionId,
    recovery,
    transitions: newTransitionsSince(before.timeline, after.timeline),
    snapshot: after.timeline.snapshot,
  }
}
