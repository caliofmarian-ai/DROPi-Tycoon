import type { PersonalCapabilityId } from '../types/game'
import type { WorldIdentityState } from '../types/worldIdentity'
import type { WorldClockState } from '../world/globalWorld'
import {
  PROTOTYPE_WORLD_CLOCK_POLICY,
  operatingDayIndex,
  workShiftPosition,
  worldClockMinuteOrdinal,
  type WorldClockPolicy,
} from '../systems/worldClockSystem'

export const PLAYER_ECONOMY_STATE_VERSION = 1 as const

export const PLAYER_ECONOMY_MODES = ['FreshEmployee', 'LegacyCompatibility'] as const
export type PlayerEconomyMode = (typeof PLAYER_ECONOMY_MODES)[number]

export const PERSONAL_FINANCIAL_STATUSES = ['Stable', 'Insolvent', 'Recovering'] as const
export type PersonalFinancialStatus = (typeof PERSONAL_FINANCIAL_STATUSES)[number]

export const PERSONAL_HOUSING_STATUSES = ['Housed', 'EmergencyHousing'] as const
export type PersonalHousingStatus = (typeof PERSONAL_HOUSING_STATUSES)[number]

export interface PlayerEconomyPolicy {
  policyId: string
  starterEmployerCompanyId: string
  starterEmployerName: string
  starterEmployerOpeningMoneyMinor: number
  starterShiftWageMinor: number
  starterShiftRequiredProductiveMinutes: number
  starterDeliveryProductiveMinutes: number
  maxWorkCapacity: number
  starterDeliveryCapacityCost: number
  restRecoveryPerHour: number
  basicLivingCostMinor: number
  emergencyHousingArrearsMinor: number
}

/**
 * Phase-1 balancing values only. The ownership/settlement semantics are the contract;
 * exact wages, living costs and Work Capacity values remain replaceable balance data.
 */
export const PROTOTYPE_PLAYER_ECONOMY_POLICY: Readonly<PlayerEconomyPolicy> = Object.freeze({
  policyId: 'phase1-player-economy-v1',
  starterEmployerCompanyId: 'company_incumbent_logistics_v1',
  starterEmployerName: 'Northstar Parcel Logistics',
  starterEmployerOpeningMoneyMinor: 100_000,
  starterShiftWageMinor: 1_500,
  starterShiftRequiredProductiveMinutes: 60,
  starterDeliveryProductiveMinutes: 30,
  maxWorkCapacity: 1_000,
  starterDeliveryCapacityCost: 100,
  restRecoveryPerHour: 250,
  basicLivingCostMinor: 500,
  emergencyHousingArrearsMinor: 2_000,
})

export type MoneyOwnerKind = 'Person' | 'Company'
export type MoneyLedgerReason =
  | 'IncumbentOpeningCapital'
  | 'StarterShiftWage'
  | 'BasicLivingCost'
  | 'LivingArrearsPayment'

export interface MoneyLedgerEntry {
  transactionId: string
  worldInstanceId: string
  ownerKind: MoneyOwnerKind
  ownerId: string
  amountMinor: number
  reason: MoneyLedgerReason
  counterpartyId?: string
  clockMinuteOrdinal: number
}

export interface MoneyAccountState {
  ownerKind: MoneyOwnerKind
  ownerId: string
  balanceMinor: number
  ledger: MoneyLedgerEntry[]
}

export interface StarterEmploymentState {
  employerCompanyId: string
  employerName: string
  roleId: 'LightDeliveryEmployee'
  status: 'Active'
  transportMode: 'Walking'
  smartphoneAvailable: true
  capabilityIds: PersonalCapabilityId[]
}

export interface BasicDeliveryWorkRecord {
  activityId: string
  worldInstanceId: string
  heroActorId: string
  employerCompanyId: string
  operatingDayIndex: number
  shiftIndex: number
  productiveMinutes: number
  capacityConsumed: number
  clockMinuteOrdinal: number
}

export interface WorkCapacityState {
  current: number
  max: number
  activities: BasicDeliveryWorkRecord[]
  settledRestIds: string[]
}

export interface PersonalLivingState {
  financialStatus: PersonalFinancialStatus
  housingStatus: PersonalHousingStatus
  arrearsMinor: number
  lastSettledOperatingDay: number
  settledObligationIds: string[]
}

export interface PlayerEconomyState {
  version: typeof PLAYER_ECONOMY_STATE_VERSION
  policyId: string
  mode: PlayerEconomyMode
  worldInstanceId: string
  heroActorId: string
  personalMoney: MoneyAccountState
  employerCompanyMoney: MoneyAccountState | null
  employment: StarterEmploymentState | null
  workCapacity: WorkCapacityState
  living: PersonalLivingState
}

export interface LegacyCompatibilityResult {
  state: PlayerEconomyState
  /** Legacy Company Money remains owned by the legacy CompanyState and is never imported here. */
  legacyCompanyMoneyMinor: number
  convertedToPersonalMoney: false
}

export type BasicDeliveryWorkResult =
  | { performed: true; state: PlayerEconomyState; record: BasicDeliveryWorkRecord }
  | { performed: false; state: PlayerEconomyState; reason: 'legacy-mode' | 'invalid-world' | 'invalid-activity' | 'duplicate-activity' | 'no-employment' | 'insufficient-capacity' }

export type RestRecoveryResult =
  | { recovered: true; state: PlayerEconomyState; recoveredCapacity: number }
  | { recovered: false; state: PlayerEconomyState; reason: 'invalid-world' | 'invalid-rest' | 'duplicate-rest' }

export type WageSettlementResult =
  | { settled: true; state: PlayerEconomyState; transactionId: string; amountMinor: number; operatingDayIndex: number; shiftIndex: number }
  | { settled: false; state: PlayerEconomyState; reason: 'legacy-mode' | 'invalid-world' | 'no-employment' | 'no-completed-shift' | 'not-enough-work' | 'already-settled' | 'employer-insolvent' | 'invalid-state' }

export interface LivingCostSettlementSummary {
  processedOperatingDays: number[]
  paidMinor: number
  addedArrearsMinor: number
  truncated: boolean
}

export type LivingCostSettlementResult =
  | { settled: true; state: PlayerEconomyState; summary: LivingCostSettlementSummary }
  | { settled: false; state: PlayerEconomyState; reason: 'invalid-world' | 'clock-reversed' | 'invalid-state' }

export type LivingArrearsSettlementResult =
  | { settled: true; state: PlayerEconomyState; paidMinor: number; transactionId: string }
  | { settled: false; state: PlayerEconomyState; reason: 'invalid-world' | 'nothing-due' | 'no-money' | 'already-settled' | 'invalid-state' }

const STARTER_CAPABILITIES: PersonalCapabilityId[] = [
  'DeliveryAppLiteracy',
  'WalkingCourierFundamentals',
]

const BASIC_LIVING_COUNTERPARTY_ID = 'living_provider_basic_v1'
const MAX_TOKEN_LENGTH = 160

const validToken = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0 && value.trim().length <= MAX_TOKEN_LENGTH

const validNonNegativeMoney = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value >= 0

const validPositiveInteger = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value > 0

const validCapacity = (value: unknown, max: number): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 && value <= max

const validPolicy = (policy: PlayerEconomyPolicy): boolean =>
  validToken(policy.policyId) &&
  validToken(policy.starterEmployerCompanyId) &&
  validToken(policy.starterEmployerName) &&
  validNonNegativeMoney(policy.starterEmployerOpeningMoneyMinor) &&
  validPositiveInteger(policy.starterShiftWageMinor) &&
  validPositiveInteger(policy.starterShiftRequiredProductiveMinutes) &&
  validPositiveInteger(policy.starterDeliveryProductiveMinutes) &&
  validPositiveInteger(policy.maxWorkCapacity) &&
  validPositiveInteger(policy.starterDeliveryCapacityCost) &&
  policy.starterDeliveryCapacityCost <= policy.maxWorkCapacity &&
  validPositiveInteger(policy.restRecoveryPerHour) &&
  validPositiveInteger(policy.basicLivingCostMinor) &&
  validPositiveInteger(policy.emergencyHousingArrearsMinor)

const assertPolicy = (policy: PlayerEconomyPolicy): void => {
  if (!validPolicy(policy)) throw new Error('Invalid PlayerEconomyPolicy')
}

const sameWorld = (state: PlayerEconomyState, clock: WorldClockState): boolean =>
  state.worldInstanceId === clock.worldInstanceId

const identityMatchesClock = (identity: WorldIdentityState, clock: WorldClockState): boolean =>
  identity.worldInstanceId === clock.worldInstanceId

const ledgerHas = (account: MoneyAccountState, transactionId: string): boolean =>
  account.ledger.some((entry) => entry.transactionId === transactionId)

const accountIsValid = (account: MoneyAccountState): boolean => {
  if (!validNonNegativeMoney(account.balanceMinor) || !validToken(account.ownerId)) return false
  let derived = 0
  const seen = new Set<string>()
  for (const entry of account.ledger) {
    if (!validToken(entry.transactionId) || seen.has(entry.transactionId)) return false
    if (entry.ownerKind !== account.ownerKind || entry.ownerId !== account.ownerId) return false
    if (!Number.isSafeInteger(entry.amountMinor) || !Number.isSafeInteger(entry.clockMinuteOrdinal) || entry.clockMinuteOrdinal < 0) return false
    derived += entry.amountMinor
    if (!Number.isSafeInteger(derived) || derived < 0) return false
    seen.add(entry.transactionId)
  }
  return derived === account.balanceMinor
}

const appendMoneyEntry = (
  account: MoneyAccountState,
  entry: MoneyLedgerEntry,
): MoneyAccountState | null => {
  if (ledgerHas(account, entry.transactionId)) return null
  if (entry.ownerKind !== account.ownerKind || entry.ownerId !== account.ownerId) return null
  const balanceMinor = account.balanceMinor + entry.amountMinor
  if (!validNonNegativeMoney(balanceMinor)) return null
  const next = { ...account, balanceMinor, ledger: [...account.ledger, entry] }
  return accountIsValid(next) ? next : null
}

const createEmptyPersonalAccount = (identity: WorldIdentityState): MoneyAccountState => ({
  ownerKind: 'Person',
  ownerId: identity.heroActorId,
  balanceMinor: 0,
  ledger: [],
})

const createIncumbentEmployerAccount = (
  identity: WorldIdentityState,
  clock: WorldClockState,
  policy: PlayerEconomyPolicy,
  clockPolicy: WorldClockPolicy,
): MoneyAccountState => {
  const opening: MoneyLedgerEntry = {
    transactionId: `company-opening:${identity.worldInstanceId}:${policy.starterEmployerCompanyId}`,
    worldInstanceId: identity.worldInstanceId,
    ownerKind: 'Company',
    ownerId: policy.starterEmployerCompanyId,
    amountMinor: policy.starterEmployerOpeningMoneyMinor,
    reason: 'IncumbentOpeningCapital',
    clockMinuteOrdinal: worldClockMinuteOrdinal(clock, clockPolicy),
  }
  return {
    ownerKind: 'Company',
    ownerId: policy.starterEmployerCompanyId,
    balanceMinor: policy.starterEmployerOpeningMoneyMinor,
    ledger: [opening],
  }
}

const createBaseState = (
  identity: WorldIdentityState,
  clock: WorldClockState,
  mode: PlayerEconomyMode,
  policy: PlayerEconomyPolicy,
  clockPolicy: WorldClockPolicy,
): PlayerEconomyState => ({
  version: PLAYER_ECONOMY_STATE_VERSION,
  policyId: policy.policyId,
  mode,
  worldInstanceId: identity.worldInstanceId,
  heroActorId: identity.heroActorId,
  personalMoney: createEmptyPersonalAccount(identity),
  employerCompanyMoney: mode === 'FreshEmployee'
    ? createIncumbentEmployerAccount(identity, clock, policy, clockPolicy)
    : null,
  employment: mode === 'FreshEmployee'
    ? {
        employerCompanyId: policy.starterEmployerCompanyId,
        employerName: policy.starterEmployerName,
        roleId: 'LightDeliveryEmployee',
        status: 'Active',
        transportMode: 'Walking',
        smartphoneAvailable: true,
        capabilityIds: [...STARTER_CAPABILITIES],
      }
    : null,
  workCapacity: {
    current: policy.maxWorkCapacity,
    max: policy.maxWorkCapacity,
    activities: [],
    settledRestIds: [],
  },
  living: {
    financialStatus: 'Stable',
    housingStatus: 'Housed',
    arrearsMinor: 0,
    // The spawn operating day is a governed onboarding grace day; no hidden Company Money conversion occurs.
    lastSettledOperatingDay: operatingDayIndex(clock, clockPolicy),
    settledObligationIds: [],
  },
})

export const createFreshEmployeePlayerEconomy = (
  identity: WorldIdentityState,
  clock: WorldClockState,
  policy: PlayerEconomyPolicy = PROTOTYPE_PLAYER_ECONOMY_POLICY,
  clockPolicy: WorldClockPolicy = PROTOTYPE_WORLD_CLOCK_POLICY,
): PlayerEconomyState => {
  assertPolicy(policy)
  if (identity.mode !== 'FreshLocal') throw new Error('Fresh employee economy requires a FreshLocal World Identity')
  if (!identityMatchesClock(identity, clock)) throw new Error('World Identity and World Clock must belong to the same World Instance')
  return createBaseState(identity, clock, 'FreshEmployee', policy, clockPolicy)
}

export const createLegacyCompatibilityPlayerEconomy = (
  identity: WorldIdentityState,
  clock: WorldClockState,
  legacyCompanyMoneyMinor: number,
  policy: PlayerEconomyPolicy = PROTOTYPE_PLAYER_ECONOMY_POLICY,
  clockPolicy: WorldClockPolicy = PROTOTYPE_WORLD_CLOCK_POLICY,
): LegacyCompatibilityResult => {
  assertPolicy(policy)
  if (!identityMatchesClock(identity, clock)) throw new Error('World Identity and World Clock must belong to the same World Instance')
  if (!validNonNegativeMoney(legacyCompanyMoneyMinor)) throw new Error('Legacy Company Money must be a non-negative safe integer')
  return {
    state: createBaseState(identity, clock, 'LegacyCompatibility', policy, clockPolicy),
    legacyCompanyMoneyMinor,
    convertedToPersonalMoney: false,
  }
}

const activityIdFor = (
  state: PlayerEconomyState,
  clock: WorldClockState,
  activityRef: string,
  clockPolicy: WorldClockPolicy,
): { activityId: string; dayIndex: number; shiftIndex: number } => {
  const shift = workShiftPosition(clock, clockPolicy)
  return {
    activityId: `work:${state.worldInstanceId}:${state.heroActorId}:${shift.operatingDayIndex}:${shift.shiftIndex}:${activityRef.trim()}`,
    dayIndex: shift.operatingDayIndex,
    shiftIndex: shift.shiftIndex,
  }
}

export const performBasicDeliveryWork = (
  state: PlayerEconomyState,
  clock: WorldClockState,
  activityRef: string,
  policy: PlayerEconomyPolicy = PROTOTYPE_PLAYER_ECONOMY_POLICY,
  clockPolicy: WorldClockPolicy = PROTOTYPE_WORLD_CLOCK_POLICY,
): BasicDeliveryWorkResult => {
  assertPolicy(policy)
  if (state.mode !== 'FreshEmployee') return { performed: false, state, reason: 'legacy-mode' }
  if (!sameWorld(state, clock)) return { performed: false, state, reason: 'invalid-world' }
  if (!validToken(activityRef)) return { performed: false, state, reason: 'invalid-activity' }
  if (!state.employment || state.employment.status !== 'Active') return { performed: false, state, reason: 'no-employment' }
  if (!validCapacity(state.workCapacity.current, state.workCapacity.max) || state.workCapacity.max !== policy.maxWorkCapacity) {
    return { performed: false, state, reason: 'insufficient-capacity' }
  }

  const identity = activityIdFor(state, clock, activityRef, clockPolicy)
  if (state.workCapacity.activities.some((record) => record.activityId === identity.activityId)) {
    return { performed: false, state, reason: 'duplicate-activity' }
  }
  if (state.workCapacity.current < policy.starterDeliveryCapacityCost) {
    return { performed: false, state, reason: 'insufficient-capacity' }
  }

  const record: BasicDeliveryWorkRecord = {
    activityId: identity.activityId,
    worldInstanceId: state.worldInstanceId,
    heroActorId: state.heroActorId,
    employerCompanyId: state.employment.employerCompanyId,
    operatingDayIndex: identity.dayIndex,
    shiftIndex: identity.shiftIndex,
    productiveMinutes: policy.starterDeliveryProductiveMinutes,
    capacityConsumed: policy.starterDeliveryCapacityCost,
    clockMinuteOrdinal: worldClockMinuteOrdinal(clock, clockPolicy),
  }
  return {
    performed: true,
    record,
    state: {
      ...state,
      workCapacity: {
        ...state.workCapacity,
        current: state.workCapacity.current - policy.starterDeliveryCapacityCost,
        activities: [...state.workCapacity.activities, record],
      },
    },
  }
}

export const recoverWorkCapacityByRest = (
  state: PlayerEconomyState,
  clock: WorldClockState,
  restId: string,
  restMinutes: number,
  policy: PlayerEconomyPolicy = PROTOTYPE_PLAYER_ECONOMY_POLICY,
): RestRecoveryResult => {
  assertPolicy(policy)
  if (!sameWorld(state, clock)) return { recovered: false, state, reason: 'invalid-world' }
  if (!validToken(restId) || !validPositiveInteger(restMinutes)) return { recovered: false, state, reason: 'invalid-rest' }
  if (state.workCapacity.settledRestIds.includes(restId)) return { recovered: false, state, reason: 'duplicate-rest' }
  if (!validCapacity(state.workCapacity.current, state.workCapacity.max)) return { recovered: false, state, reason: 'invalid-rest' }

  const requestedRecovery = Math.floor((restMinutes * policy.restRecoveryPerHour) / 60)
  if (!Number.isSafeInteger(requestedRecovery) || requestedRecovery < 0) return { recovered: false, state, reason: 'invalid-rest' }
  const nextCapacity = Math.min(state.workCapacity.max, state.workCapacity.current + requestedRecovery)
  const recoveredCapacity = nextCapacity - state.workCapacity.current
  return {
    recovered: true,
    recoveredCapacity,
    state: {
      ...state,
      workCapacity: {
        ...state.workCapacity,
        current: nextCapacity,
        settledRestIds: [...state.workCapacity.settledRestIds, restId],
      },
    },
  }
}

const previousShift = (
  clock: WorldClockState,
  clockPolicy: WorldClockPolicy,
): { operatingDayIndex: number; shiftIndex: number } | null => {
  const current = workShiftPosition(clock, clockPolicy)
  const shiftCount = clockPolicy.shiftStartMinutes.length
  if (shiftCount <= 0) return null
  if (current.shiftIndex > 0) return { operatingDayIndex: current.operatingDayIndex, shiftIndex: current.shiftIndex - 1 }
  return { operatingDayIndex: current.operatingDayIndex - 1, shiftIndex: shiftCount - 1 }
}

const wageTransactionId = (
  state: PlayerEconomyState,
  dayIndex: number,
  shiftIndex: number,
): string => `wage:${state.worldInstanceId}:${state.heroActorId}:${dayIndex}:${shiftIndex}`

export const settleCompletedStarterShiftWage = (
  state: PlayerEconomyState,
  clock: WorldClockState,
  policy: PlayerEconomyPolicy = PROTOTYPE_PLAYER_ECONOMY_POLICY,
  clockPolicy: WorldClockPolicy = PROTOTYPE_WORLD_CLOCK_POLICY,
): WageSettlementResult => {
  assertPolicy(policy)
  if (state.mode !== 'FreshEmployee') return { settled: false, state, reason: 'legacy-mode' }
  if (!sameWorld(state, clock)) return { settled: false, state, reason: 'invalid-world' }
  if (!state.employment || !state.employerCompanyMoney) return { settled: false, state, reason: 'no-employment' }
  if (!accountIsValid(state.personalMoney) || !accountIsValid(state.employerCompanyMoney)) {
    return { settled: false, state, reason: 'invalid-state' }
  }

  const completedShift = previousShift(clock, clockPolicy)
  if (!completedShift || completedShift.operatingDayIndex < 0) return { settled: false, state, reason: 'no-completed-shift' }
  const productiveMinutes = state.workCapacity.activities
    .filter((record) => record.operatingDayIndex === completedShift.operatingDayIndex && record.shiftIndex === completedShift.shiftIndex)
    .reduce((total, record) => total + record.productiveMinutes, 0)
  if (!Number.isSafeInteger(productiveMinutes) || productiveMinutes < policy.starterShiftRequiredProductiveMinutes) {
    return { settled: false, state, reason: 'not-enough-work' }
  }

  const transactionId = wageTransactionId(state, completedShift.operatingDayIndex, completedShift.shiftIndex)
  const personHas = ledgerHas(state.personalMoney, transactionId)
  const companyHas = ledgerHas(state.employerCompanyMoney, transactionId)
  if (personHas && companyHas) return { settled: false, state, reason: 'already-settled' }
  if (personHas !== companyHas) return { settled: false, state, reason: 'invalid-state' }
  if (state.employerCompanyMoney.balanceMinor < policy.starterShiftWageMinor) {
    return { settled: false, state, reason: 'employer-insolvent' }
  }

  const clockOrdinal = worldClockMinuteOrdinal(clock, clockPolicy)
  const company = appendMoneyEntry(state.employerCompanyMoney, {
    transactionId,
    worldInstanceId: state.worldInstanceId,
    ownerKind: 'Company',
    ownerId: state.employerCompanyMoney.ownerId,
    amountMinor: -policy.starterShiftWageMinor,
    reason: 'StarterShiftWage',
    counterpartyId: state.heroActorId,
    clockMinuteOrdinal: clockOrdinal,
  })
  const person = appendMoneyEntry(state.personalMoney, {
    transactionId,
    worldInstanceId: state.worldInstanceId,
    ownerKind: 'Person',
    ownerId: state.heroActorId,
    amountMinor: policy.starterShiftWageMinor,
    reason: 'StarterShiftWage',
    counterpartyId: state.employerCompanyMoney.ownerId,
    clockMinuteOrdinal: clockOrdinal,
  })
  if (!company || !person) return { settled: false, state, reason: 'invalid-state' }

  return {
    settled: true,
    transactionId,
    amountMinor: policy.starterShiftWageMinor,
    operatingDayIndex: completedShift.operatingDayIndex,
    shiftIndex: completedShift.shiftIndex,
    state: { ...state, employerCompanyMoney: company, personalMoney: person },
  }
}

const settleOneLivingDay = (
  state: PlayerEconomyState,
  dayIndex: number,
  clockOrdinal: number,
  policy: PlayerEconomyPolicy,
): { state: PlayerEconomyState; paidMinor: number; addedArrearsMinor: number } | null => {
  const obligationId = `living:${state.worldInstanceId}:${state.heroActorId}:${dayIndex}`
  if (state.living.settledObligationIds.includes(obligationId)) {
    return { state, paidMinor: 0, addedArrearsMinor: 0 }
  }
  if (!accountIsValid(state.personalMoney) || !validNonNegativeMoney(state.living.arrearsMinor)) return null

  const paidMinor = Math.min(state.personalMoney.balanceMinor, policy.basicLivingCostMinor)
  const addedArrearsMinor = policy.basicLivingCostMinor - paidMinor
  const nextArrears = state.living.arrearsMinor + addedArrearsMinor
  if (!validNonNegativeMoney(nextArrears)) return null

  let personalMoney = state.personalMoney
  if (paidMinor > 0) {
    const next = appendMoneyEntry(personalMoney, {
      transactionId: obligationId,
      worldInstanceId: state.worldInstanceId,
      ownerKind: 'Person',
      ownerId: state.heroActorId,
      amountMinor: -paidMinor,
      reason: 'BasicLivingCost',
      counterpartyId: BASIC_LIVING_COUNTERPARTY_ID,
      clockMinuteOrdinal: clockOrdinal,
    })
    if (!next) return null
    personalMoney = next
  }

  const financialStatus: PersonalFinancialStatus = nextArrears > 0
    ? 'Insolvent'
    : state.living.financialStatus === 'Recovering' ? 'Stable' : state.living.financialStatus
  const housingStatus: PersonalHousingStatus = nextArrears >= policy.emergencyHousingArrearsMinor
    ? 'EmergencyHousing'
    : state.living.housingStatus

  return {
    paidMinor,
    addedArrearsMinor,
    state: {
      ...state,
      personalMoney,
      living: {
        ...state.living,
        financialStatus,
        housingStatus,
        arrearsMinor: nextArrears,
        lastSettledOperatingDay: dayIndex,
        settledObligationIds: [...state.living.settledObligationIds, obligationId],
      },
    },
  }
}

export const settleBasicLivingCostsThroughClock = (
  state: PlayerEconomyState,
  fromClock: WorldClockState,
  toClock: WorldClockState,
  policy: PlayerEconomyPolicy = PROTOTYPE_PLAYER_ECONOMY_POLICY,
  clockPolicy: WorldClockPolicy = PROTOTYPE_WORLD_CLOCK_POLICY,
): LivingCostSettlementResult => {
  assertPolicy(policy)
  if (!sameWorld(state, fromClock) || !sameWorld(state, toClock)) return { settled: false, state, reason: 'invalid-world' }
  const fromMinute = worldClockMinuteOrdinal(fromClock, clockPolicy)
  const toMinute = worldClockMinuteOrdinal(toClock, clockPolicy)
  if (toMinute < fromMinute) return { settled: false, state, reason: 'clock-reversed' }
  if (!accountIsValid(state.personalMoney) || !validNonNegativeMoney(state.living.arrearsMinor)) {
    return { settled: false, state, reason: 'invalid-state' }
  }

  const fromDay = operatingDayIndex(fromClock, clockPolicy)
  const toDay = operatingDayIndex(toClock, clockPolicy)
  const authoritativeMaxDays = Math.ceil(clockPolicy.maxAdvanceMinutes / (24 * 60))
  const firstDueDay = Math.max(state.living.lastSettledOperatingDay + 1, fromDay + 1)
  const requestedLastDay = toDay
  const boundedLastDay = Math.min(requestedLastDay, firstDueDay + authoritativeMaxDays - 1)
  const truncated = requestedLastDay > boundedLastDay

  let currentState = state
  let paidMinor = 0
  let addedArrearsMinor = 0
  const processedOperatingDays: number[] = []
  for (let dayIndex = firstDueDay; dayIndex <= boundedLastDay; dayIndex += 1) {
    const result = settleOneLivingDay(currentState, dayIndex, toMinute, policy)
    if (!result) return { settled: false, state, reason: 'invalid-state' }
    currentState = result.state
    paidMinor += result.paidMinor
    addedArrearsMinor += result.addedArrearsMinor
    processedOperatingDays.push(dayIndex)
  }

  return {
    settled: true,
    state: currentState,
    summary: { processedOperatingDays, paidMinor, addedArrearsMinor, truncated },
  }
}

export const settleLivingArrears = (
  state: PlayerEconomyState,
  clock: WorldClockState,
  policy: PlayerEconomyPolicy = PROTOTYPE_PLAYER_ECONOMY_POLICY,
  clockPolicy: WorldClockPolicy = PROTOTYPE_WORLD_CLOCK_POLICY,
): LivingArrearsSettlementResult => {
  assertPolicy(policy)
  if (!sameWorld(state, clock)) return { settled: false, state, reason: 'invalid-world' }
  if (!accountIsValid(state.personalMoney) || !validNonNegativeMoney(state.living.arrearsMinor)) {
    return { settled: false, state, reason: 'invalid-state' }
  }
  if (state.living.arrearsMinor === 0) return { settled: false, state, reason: 'nothing-due' }
  if (state.personalMoney.balanceMinor === 0) return { settled: false, state, reason: 'no-money' }

  const paidMinor = Math.min(state.personalMoney.balanceMinor, state.living.arrearsMinor)
  const transactionId = `living-arrears:${state.worldInstanceId}:${state.heroActorId}:${state.living.arrearsMinor}:${worldClockMinuteOrdinal(clock, clockPolicy)}`
  if (ledgerHas(state.personalMoney, transactionId)) return { settled: false, state, reason: 'already-settled' }
  const personalMoney = appendMoneyEntry(state.personalMoney, {
    transactionId,
    worldInstanceId: state.worldInstanceId,
    ownerKind: 'Person',
    ownerId: state.heroActorId,
    amountMinor: -paidMinor,
    reason: 'LivingArrearsPayment',
    counterpartyId: BASIC_LIVING_COUNTERPARTY_ID,
    clockMinuteOrdinal: worldClockMinuteOrdinal(clock, clockPolicy),
  })
  if (!personalMoney) return { settled: false, state, reason: 'invalid-state' }

  const arrearsMinor = state.living.arrearsMinor - paidMinor
  const financialStatus: PersonalFinancialStatus = arrearsMinor === 0 ? 'Recovering' : 'Insolvent'
  const housingStatus: PersonalHousingStatus = arrearsMinor < policy.emergencyHousingArrearsMinor
    ? 'Housed'
    : state.living.housingStatus
  return {
    settled: true,
    paidMinor,
    transactionId,
    state: {
      ...state,
      personalMoney,
      living: { ...state.living, arrearsMinor, financialStatus, housingStatus },
    },
  }
}
