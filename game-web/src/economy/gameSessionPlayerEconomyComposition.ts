import type { GameSessionState, OrderState } from '../types/game'
import type { UrbanInteractionResult } from '../systems/urbanInteractions'
import {
  PROTOTYPE_WORLD_CLOCK_POLICY,
  createInitialWorldClockState,
  sanitizeWorldClockState,
  type WorldClockPolicy,
} from '../systems/worldClockSystem'
import {
  sanitizeWorldIdentityState,
} from '../systems/worldIdentitySystem'
import type { WorldClockState } from '../world/globalWorld'
import {
  PROTOTYPE_PLAYER_ECONOMY_POLICY,
  createFreshEmployeePlayerEconomy,
  createLegacyCompatibilityPlayerEconomy,
  type BasicDeliveryWorkRecord,
  type PlayerEconomyPolicy,
  type PlayerEconomyState,
} from './playerEconomy'
import {
  readCurrentEmployeeShiftProgress,
  type EmployeeShiftProgress,
} from './playerEconomyFinanceLifecycle'
import {
  readPlayerEconomyWorkPort,
  recordSettledUrbanDeliveryWork,
} from './playerEconomyRuntimeAdapter'
import {
  processEmployeeHardshipLifecycleThroughClock,
  readPlayerHardshipTimeline,
  settleHardshipRecoveryFromAvailablePersonalMoney,
  type HardshipClockSummary,
  type HardshipTransitionRecord,
  type PlayerHardshipSnapshot,
} from './playerEconomyHardshipLifecycle'

export const GAMESESSION_PLAYER_ECONOMY_COMPOSITION_VERSION = 1 as const
export const GAMESESSION_PLAYER_ECONOMY_STATE_PORT_KIND = 'GameSessionPlayerEconomyStatePort' as const

export interface GameSessionPlayerEconomyComposition {
  version: typeof GAMESESSION_PLAYER_ECONOMY_COMPOSITION_VERSION
  worldInstanceId: string
  heroActorId: string
  clock: WorldClockState
  economy: PlayerEconomyState
}

/**
 * Typed handoff only. Save v2 does not serialize this port in this slice.
 * A future persistence owner may store/restore it without redefining money authority.
 */
export interface GameSessionPlayerEconomyStatePort {
  kind: typeof GAMESESSION_PLAYER_ECONOMY_STATE_PORT_KIND
  version: typeof GAMESESSION_PLAYER_ECONOMY_COMPOSITION_VERSION
  policyId: string
  clockPolicyId: string
  worldInstanceId: string
  heroActorId: string
  clock: WorldClockState
  economy: PlayerEconomyState
}

export interface GameSessionPlayerEconomyProjection {
  worldInstanceId: string
  heroActorId: string
  mode: PlayerEconomyState['mode']
  moneyAuthority: 'PlayerEconomy.PersonalMoney'
  personalMoneyBalanceMinor: number
  employerTreasuryBalanceMinor: number | null
  legacyCompanyMoney: {
    authority: 'GameSession.CompanyState'
    balance: number
    isPersonalMoney: false
  }
  workCapacity: {
    current: number
    max: number
    canPerformBasicDelivery: boolean
  }
  productiveWork: {
    receiptCount: number
    receipts: BasicDeliveryWorkRecord[]
  }
  currentShift: EmployeeShiftProgress | null
  living: {
    financialStatus: PlayerHardshipSnapshot['financialStatus']
    housingStatus: PlayerHardshipSnapshot['housingStatus']
    arrearsMinor: number
    settledObligationCount: number
    insolvent: boolean
    emergencyHousingActive: boolean
  }
}

export type CreateGameSessionPlayerEconomyResult =
  | { created: true; composition: GameSessionPlayerEconomyComposition }
  | {
      created: false
      reason: 'invalid-clock' | 'invalid-legacy-company-money'
    }

export type ReadGameSessionPlayerEconomyResult =
  | { ok: true; projection: GameSessionPlayerEconomyProjection }
  | { ok: false; reason: 'session-mismatch' | 'invalid-state' }

export type GameSessionProductiveWorkFailureReason =
  | 'session-mismatch'
  | 'invalid-state'
  | 'invalid-order'
  | 'runtime-not-settled'
  | 'invalid-runtime-transition'
  | 'duplicate-delivery'
  | 'legacy-mode'
  | 'invalid-world'
  | 'invalid-activity'
  | 'no-employment'
  | 'insufficient-capacity'

export type GameSessionProductiveWorkResult =
  | {
      applied: true
      composition: GameSessionPlayerEconomyComposition
      receipt: BasicDeliveryWorkRecord
    }
  | {
      applied: false
      composition: GameSessionPlayerEconomyComposition
      reason: GameSessionProductiveWorkFailureReason
    }

export type GameSessionClockAdvanceFailureReason =
  | 'session-mismatch'
  | 'invalid-state'
  | 'legacy-mode'
  | 'invalid-world'
  | 'clock-reversed'
  | 'interval-too-large'
  | 'invalid-shift-settlement'
  | 'invalid-living-settlement'
  | 'invalid-arrears-settlement'
  | 'invalid-hardship-state'

export type GameSessionClockAdvanceResult =
  | {
      processed: true
      composition: GameSessionPlayerEconomyComposition
      summary: HardshipClockSummary
    }
  | {
      processed: false
      composition: GameSessionPlayerEconomyComposition
      reason: GameSessionClockAdvanceFailureReason
    }

export type GameSessionHardshipRecoveryResult =
  | {
      recovered: true
      composition: GameSessionPlayerEconomyComposition
      paidMinor: number
      transactionId: string
      transitions: HardshipTransitionRecord[]
      snapshot: PlayerHardshipSnapshot
    }
  | {
      recovered: false
      composition: GameSessionPlayerEconomyComposition
      reason:
        | 'session-mismatch'
        | 'invalid-state'
        | 'invalid-world'
        | 'nothing-due'
        | 'no-money'
        | 'already-settled'
        | 'invalid-hardship-state'
    }

export type CaptureGameSessionPlayerEconomyStatePortResult =
  | { ok: true; port: GameSessionPlayerEconomyStatePort }
  | { ok: false; reason: 'session-mismatch' | 'invalid-state' }

export type RestoreGameSessionPlayerEconomyStatePortResult =
  | { restored: true; composition: GameSessionPlayerEconomyComposition }
  | {
      restored: false
      reason:
        | 'session-mismatch'
        | 'invalid-port'
        | 'policy-mismatch'
        | 'invalid-state'
    }

const validNonNegativeLegacyMoney = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value >= 0

const cloneClock = (clock: WorldClockState): WorldClockState => ({ ...clock })

const cloneEconomy = (state: PlayerEconomyState): PlayerEconomyState => ({
  ...state,
  personalMoney: {
    ...state.personalMoney,
    ledger: state.personalMoney.ledger.map(entry => ({ ...entry })),
  },
  employerCompanyMoney: state.employerCompanyMoney
    ? {
        ...state.employerCompanyMoney,
        ledger: state.employerCompanyMoney.ledger.map(entry => ({ ...entry })),
      }
    : null,
  employment: state.employment
    ? {
        ...state.employment,
        capabilityIds: [...state.employment.capabilityIds],
      }
    : null,
  workCapacity: {
    ...state.workCapacity,
    activities: state.workCapacity.activities.map(record => ({ ...record })),
    settledRestIds: [...state.workCapacity.settledRestIds],
  },
  living: {
    ...state.living,
    settledObligationIds: [...state.living.settledObligationIds],
  },
})

const expectedModeForSession = (session: GameSessionState): PlayerEconomyState['mode'] =>
  sanitizeWorldIdentityState(session.worldIdentity).state.mode === 'FreshLocal'
    ? 'FreshEmployee'
    : 'LegacyCompatibility'

const compositionMatchesSession = (
  session: GameSessionState,
  composition: GameSessionPlayerEconomyComposition,
  policy: PlayerEconomyPolicy,
  clockPolicy: WorldClockPolicy,
): boolean => {
  const identity = sanitizeWorldIdentityState(session.worldIdentity).state
  if (
    composition.version !== GAMESESSION_PLAYER_ECONOMY_COMPOSITION_VERSION ||
    composition.worldInstanceId !== identity.worldInstanceId ||
    composition.heroActorId !== identity.heroActorId ||
    composition.clock.worldInstanceId !== identity.worldInstanceId ||
    composition.economy.worldInstanceId !== identity.worldInstanceId ||
    composition.economy.heroActorId !== identity.heroActorId ||
    composition.economy.mode !== expectedModeForSession(session) ||
    composition.economy.policyId !== policy.policyId
  ) {
    return false
  }

  const clock = sanitizeWorldClockState(
    composition.clock,
    identity.worldInstanceId,
    clockPolicy,
  )
  if (clock.repaired || clock.clock.worldInstanceId !== identity.worldInstanceId) return false

  const hardship = readPlayerHardshipTimeline(composition.economy, policy, clockPolicy)
  return hardship.ok
}

/**
 * Materializes the authoritative live-session Player Economy sidecar from GameSession identity.
 * Existing CompanyState.money is never imported into Personal Money. Legacy sessions retain it
 * only as Company Money while receiving a zero-Personal-Money compatibility aggregate.
 */
export const createGameSessionPlayerEconomyComposition = (
  session: GameSessionState,
  proposedClock?: WorldClockState,
  policy: PlayerEconomyPolicy = PROTOTYPE_PLAYER_ECONOMY_POLICY,
  clockPolicy: WorldClockPolicy = PROTOTYPE_WORLD_CLOCK_POLICY,
): CreateGameSessionPlayerEconomyResult => {
  const identity = sanitizeWorldIdentityState(session.worldIdentity).state
  const rawClock = proposedClock ?? createInitialWorldClockState(identity.worldInstanceId)
  const clockResult = sanitizeWorldClockState(rawClock, identity.worldInstanceId, clockPolicy)
  if (clockResult.repaired || clockResult.clock.worldInstanceId !== identity.worldInstanceId) {
    return { created: false, reason: 'invalid-clock' }
  }

  if (identity.mode === 'FreshLocal') {
    const economy = createFreshEmployeePlayerEconomy(
      identity,
      clockResult.clock,
      policy,
      clockPolicy,
    )
    return {
      created: true,
      composition: {
        version: GAMESESSION_PLAYER_ECONOMY_COMPOSITION_VERSION,
        worldInstanceId: identity.worldInstanceId,
        heroActorId: identity.heroActorId,
        clock: cloneClock(clockResult.clock),
        economy,
      },
    }
  }

  if (!validNonNegativeLegacyMoney(session.company.money)) {
    return { created: false, reason: 'invalid-legacy-company-money' }
  }
  const legacy = createLegacyCompatibilityPlayerEconomy(
    identity,
    clockResult.clock,
    session.company.money,
    policy,
    clockPolicy,
  )
  return {
    created: true,
    composition: {
      version: GAMESESSION_PLAYER_ECONOMY_COMPOSITION_VERSION,
      worldInstanceId: identity.worldInstanceId,
      heroActorId: identity.heroActorId,
      clock: cloneClock(clockResult.clock),
      economy: legacy.state,
    },
  }
}

/** Read-only projection for UI, mission and dialogue consumers. No mutator is exposed. */
export const readGameSessionPlayerEconomy = (
  session: GameSessionState,
  composition: GameSessionPlayerEconomyComposition,
  policy: PlayerEconomyPolicy = PROTOTYPE_PLAYER_ECONOMY_POLICY,
  clockPolicy: WorldClockPolicy = PROTOTYPE_WORLD_CLOCK_POLICY,
): ReadGameSessionPlayerEconomyResult => {
  if (!compositionMatchesSession(session, composition, policy, clockPolicy)) {
    const identity = sanitizeWorldIdentityState(session.worldIdentity).state
    const identityMismatch =
      composition.worldInstanceId !== identity.worldInstanceId ||
      composition.heroActorId !== identity.heroActorId
    return { ok: false, reason: identityMismatch ? 'session-mismatch' : 'invalid-state' }
  }

  const workPort = readPlayerEconomyWorkPort(composition.economy, policy)
  const hardship = readPlayerHardshipTimeline(composition.economy, policy, clockPolicy)
  if (!hardship.ok) return { ok: false, reason: 'invalid-state' }

  const shift = readCurrentEmployeeShiftProgress(
    composition.economy,
    composition.clock,
    policy,
    clockPolicy,
  )
  const currentShift = shift.ok ? { ...shift.progress } : null

  return {
    ok: true,
    projection: {
      worldInstanceId: composition.worldInstanceId,
      heroActorId: composition.heroActorId,
      mode: composition.economy.mode,
      moneyAuthority: 'PlayerEconomy.PersonalMoney',
      personalMoneyBalanceMinor: workPort.personalMoneyBalanceMinor,
      employerTreasuryBalanceMinor: workPort.employerTreasuryBalanceMinor,
      legacyCompanyMoney: {
        authority: 'GameSession.CompanyState',
        balance: session.company.money,
        isPersonalMoney: false,
      },
      workCapacity: {
        current: workPort.workCapacityCurrent,
        max: workPort.workCapacityMax,
        canPerformBasicDelivery: workPort.canPerformBasicDelivery,
      },
      productiveWork: {
        receiptCount: composition.economy.workCapacity.activities.length,
        receipts: composition.economy.workCapacity.activities.map(record => ({ ...record })),
      },
      currentShift,
      living: {
        financialStatus: hardship.timeline.snapshot.financialStatus,
        housingStatus: hardship.timeline.snapshot.housingStatus,
        arrearsMinor: hardship.timeline.snapshot.arrearsMinor,
        settledObligationCount: composition.economy.living.settledObligationIds.length,
        insolvent: hardship.timeline.snapshot.insolvent,
        emergencyHousingActive: hardship.timeline.snapshot.emergencyHousingActive,
      },
    },
  }
}

/**
 * Accepts only an already-settled real delivery through the merged runtime adapter and
 * returns a new composition. GameSession.CompanyState is intentionally not mutated.
 */
export const recordGameSessionSettledDeliveryWork = (
  session: GameSessionState,
  composition: GameSessionPlayerEconomyComposition,
  sourceOrder: OrderState,
  interaction: Pick<UrbanInteractionResult, 'settled' | 'world'>,
  policy: PlayerEconomyPolicy = PROTOTYPE_PLAYER_ECONOMY_POLICY,
  clockPolicy: WorldClockPolicy = PROTOTYPE_WORLD_CLOCK_POLICY,
): GameSessionProductiveWorkResult => {
  if (!compositionMatchesSession(session, composition, policy, clockPolicy)) {
    const identity = sanitizeWorldIdentityState(session.worldIdentity).state
    const mismatch =
      composition.worldInstanceId !== identity.worldInstanceId ||
      composition.heroActorId !== identity.heroActorId
    return {
      applied: false,
      composition,
      reason: mismatch ? 'session-mismatch' : 'invalid-state',
    }
  }

  const work = recordSettledUrbanDeliveryWork(
    composition.economy,
    composition.clock,
    sourceOrder,
    interaction,
    policy,
    clockPolicy,
  )
  if (!work.applied) {
    return { applied: false, composition, reason: work.reason }
  }
  const receipt = work.state.workCapacity.activities.find(record => record.activityId === work.activityId)
  if (!receipt) return { applied: false, composition, reason: 'invalid-state' }

  return {
    applied: true,
    receipt: { ...receipt },
    composition: {
      ...composition,
      economy: work.state,
    },
  }
}

/**
 * Advances finance/hardship only through authoritative C1 clock boundaries. Wages,
 * living costs and automatic arrears recovery remain owned by the merged domain.
 */
export const advanceGameSessionPlayerEconomyThroughClock = (
  session: GameSessionState,
  composition: GameSessionPlayerEconomyComposition,
  toClock: WorldClockState,
  policy: PlayerEconomyPolicy = PROTOTYPE_PLAYER_ECONOMY_POLICY,
  clockPolicy: WorldClockPolicy = PROTOTYPE_WORLD_CLOCK_POLICY,
): GameSessionClockAdvanceResult => {
  if (!compositionMatchesSession(session, composition, policy, clockPolicy)) {
    const identity = sanitizeWorldIdentityState(session.worldIdentity).state
    const mismatch =
      composition.worldInstanceId !== identity.worldInstanceId ||
      composition.heroActorId !== identity.heroActorId
    return {
      processed: false,
      composition,
      reason: mismatch ? 'session-mismatch' : 'invalid-state',
    }
  }

  const finance = processEmployeeHardshipLifecycleThroughClock(
    composition.economy,
    composition.clock,
    toClock,
    policy,
    clockPolicy,
  )
  if (!finance.processed) {
    return { processed: false, composition, reason: finance.reason }
  }

  return {
    processed: true,
    summary: finance.summary,
    composition: {
      ...composition,
      clock: cloneClock(toClock),
      economy: finance.state,
    },
  }
}

/** Career-neutral manual recovery boundary; it can only spend existing Personal Money. */
export const recoverGameSessionHardshipFromPersonalMoney = (
  session: GameSessionState,
  composition: GameSessionPlayerEconomyComposition,
  policy: PlayerEconomyPolicy = PROTOTYPE_PLAYER_ECONOMY_POLICY,
  clockPolicy: WorldClockPolicy = PROTOTYPE_WORLD_CLOCK_POLICY,
): GameSessionHardshipRecoveryResult => {
  if (!compositionMatchesSession(session, composition, policy, clockPolicy)) {
    const identity = sanitizeWorldIdentityState(session.worldIdentity).state
    const mismatch =
      composition.worldInstanceId !== identity.worldInstanceId ||
      composition.heroActorId !== identity.heroActorId
    return {
      recovered: false,
      composition,
      reason: mismatch ? 'session-mismatch' : 'invalid-state',
    }
  }

  const recovery = settleHardshipRecoveryFromAvailablePersonalMoney(
    composition.economy,
    composition.clock,
    policy,
    clockPolicy,
  )
  if (!recovery.recovered) {
    return { recovered: false, composition, reason: recovery.reason }
  }

  return {
    recovered: true,
    paidMinor: recovery.paidMinor,
    transactionId: recovery.transactionId,
    transitions: recovery.transitions.map(transition => ({ ...transition })),
    snapshot: { ...recovery.snapshot },
    composition: {
      ...composition,
      economy: recovery.state,
    },
  }
}

/** Capture a detached state port for a future persistence owner. Save v2 is not involved. */
export const captureGameSessionPlayerEconomyStatePort = (
  session: GameSessionState,
  composition: GameSessionPlayerEconomyComposition,
  policy: PlayerEconomyPolicy = PROTOTYPE_PLAYER_ECONOMY_POLICY,
  clockPolicy: WorldClockPolicy = PROTOTYPE_WORLD_CLOCK_POLICY,
): CaptureGameSessionPlayerEconomyStatePortResult => {
  const read = readGameSessionPlayerEconomy(session, composition, policy, clockPolicy)
  if (!read.ok) return read

  return {
    ok: true,
    port: {
      kind: GAMESESSION_PLAYER_ECONOMY_STATE_PORT_KIND,
      version: GAMESESSION_PLAYER_ECONOMY_COMPOSITION_VERSION,
      policyId: policy.policyId,
      clockPolicyId: clockPolicy.policyId,
      worldInstanceId: composition.worldInstanceId,
      heroActorId: composition.heroActorId,
      clock: cloneClock(composition.clock),
      economy: cloneEconomy(composition.economy),
    },
  }
}

/**
 * Restores the typed sidecar only when identity, policy, clock and ledger-derived hardship
 * state all match. This is a persistence handoff boundary, not a Save v2 implementation.
 */
export const restoreGameSessionPlayerEconomyStatePort = (
  session: GameSessionState,
  port: GameSessionPlayerEconomyStatePort,
  policy: PlayerEconomyPolicy = PROTOTYPE_PLAYER_ECONOMY_POLICY,
  clockPolicy: WorldClockPolicy = PROTOTYPE_WORLD_CLOCK_POLICY,
): RestoreGameSessionPlayerEconomyStatePortResult => {
  if (
    port.kind !== GAMESESSION_PLAYER_ECONOMY_STATE_PORT_KIND ||
    port.version !== GAMESESSION_PLAYER_ECONOMY_COMPOSITION_VERSION ||
    typeof port.worldInstanceId !== 'string' ||
    typeof port.heroActorId !== 'string'
  ) {
    return { restored: false, reason: 'invalid-port' }
  }
  if (port.policyId !== policy.policyId || port.clockPolicyId !== clockPolicy.policyId) {
    return { restored: false, reason: 'policy-mismatch' }
  }

  const identity = sanitizeWorldIdentityState(session.worldIdentity).state
  if (
    port.worldInstanceId !== identity.worldInstanceId ||
    port.heroActorId !== identity.heroActorId
  ) {
    return { restored: false, reason: 'session-mismatch' }
  }

  const composition: GameSessionPlayerEconomyComposition = {
    version: GAMESESSION_PLAYER_ECONOMY_COMPOSITION_VERSION,
    worldInstanceId: port.worldInstanceId,
    heroActorId: port.heroActorId,
    clock: cloneClock(port.clock),
    economy: cloneEconomy(port.economy),
  }
  if (!compositionMatchesSession(session, composition, policy, clockPolicy)) {
    return { restored: false, reason: 'invalid-state' }
  }
  return { restored: true, composition }
}
