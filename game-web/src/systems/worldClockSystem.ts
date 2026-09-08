import { timeOfDay, type WorldClockState } from '../world/globalWorld'

export const WORLD_SEASONS = ['Spring', 'Summer', 'Autumn', 'Winter'] as const
export type WorldSeason = (typeof WORLD_SEASONS)[number]
export type WorldDayPart = ReturnType<typeof timeOfDay>

export interface WorldClockPolicy {
  policyId: string
  daysPerSeason: number
  marketCycleDays: number
  operatingDayStartMinute: number
  shiftStartMinutes: readonly number[]
  maxAdvanceMinutes: number
}

/**
 * Phase-1 C1 tuning only. These values are replaceable balance/configuration, not historical canon.
 * Calendar arithmetic and boundary semantics are the stable contract.
 */
export const PROTOTYPE_WORLD_CLOCK_POLICY: WorldClockPolicy = Object.freeze({
  policyId: 'phase1-world-clock-v1',
  daysPerSeason: 28,
  marketCycleDays: 7,
  operatingDayStartMinute: 0,
  shiftStartMinutes: Object.freeze([6 * 60, 14 * 60, 22 * 60]),
  maxAdvanceMinutes: 14 * 24 * 60,
})

export interface WorldClockBoundarySummary {
  hourTicks: number
  operatingDays: number
  marketCycles: number
  seasons: number
  years: number
  shiftTransitions: number
}

export interface WorldClockAdvanceResult {
  clock: WorldClockState
  requestedMinutes: number
  appliedMinutes: number
  truncated: boolean
  boundaries: WorldClockBoundarySummary
}

export interface WorldClockSanitizeResult {
  clock: WorldClockState
  repaired: boolean
  reasons: string[]
}

const MINUTES_PER_HOUR = 60
const MINUTES_PER_DAY = 24 * MINUTES_PER_HOUR
const MAX_SAFE_YEAR = 1_000_000

const validInteger = (value: unknown, min: number, max: number): value is number =>
  Number.isInteger(value) && (value as number) >= min && (value as number) <= max

const validWorldInstanceId = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0 && value.trim().length <= 128

const validPolicy = (policy: WorldClockPolicy): boolean => {
  if (!policy || typeof policy.policyId !== 'string' || policy.policyId.trim().length === 0) return false
  if (!validInteger(policy.daysPerSeason, 1, 366)) return false
  if (!validInteger(policy.marketCycleDays, 1, 366)) return false
  if (!validInteger(policy.operatingDayStartMinute, 0, MINUTES_PER_DAY - 1)) return false
  if (!validInteger(policy.maxAdvanceMinutes, 1, 366 * MINUTES_PER_DAY)) return false
  if (!Array.isArray(policy.shiftStartMinutes) || policy.shiftStartMinutes.length === 0) return false
  const unique = new Set<number>()
  for (const minute of policy.shiftStartMinutes) {
    if (!validInteger(minute, 0, MINUTES_PER_DAY - 1) || unique.has(minute)) return false
    unique.add(minute)
  }
  return true
}

const assertPolicy = (policy: WorldClockPolicy): void => {
  if (!validPolicy(policy)) throw new Error('Invalid WorldClockPolicy')
}

export const createInitialWorldClockState = (worldInstanceId: string): WorldClockState => ({
  worldInstanceId: validWorldInstanceId(worldInstanceId) ? worldInstanceId.trim() : 'wi_local_legacy_v1',
  year: 1,
  season: 'Spring',
  dayOfSeason: 1,
  hour: 8,
  minute: 0,
})

export const sanitizeWorldClockState = (
  value: unknown,
  fallbackWorldInstanceId = 'wi_local_legacy_v1',
  policy: WorldClockPolicy = PROTOTYPE_WORLD_CLOCK_POLICY,
): WorldClockSanitizeResult => {
  assertPolicy(policy)
  const fallback = createInitialWorldClockState(fallbackWorldInstanceId)
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { clock: fallback, repaired: value !== undefined, reasons: value === undefined ? [] : ['clock-not-object'] }
  }
  const source = value as Record<string, unknown>
  const reasons: string[] = []
  const worldInstanceId = validWorldInstanceId(source.worldInstanceId)
    ? source.worldInstanceId.trim()
    : fallback.worldInstanceId
  if (!validWorldInstanceId(source.worldInstanceId)) reasons.push('invalid-world-instance-id')
  const year = validInteger(source.year, 1, MAX_SAFE_YEAR) ? source.year : fallback.year
  if (!validInteger(source.year, 1, MAX_SAFE_YEAR)) reasons.push('invalid-year')
  const season = WORLD_SEASONS.includes(source.season as WorldSeason)
    ? source.season as WorldSeason
    : fallback.season
  if (!WORLD_SEASONS.includes(source.season as WorldSeason)) reasons.push('invalid-season')
  const dayOfSeason = validInteger(source.dayOfSeason, 1, policy.daysPerSeason)
    ? source.dayOfSeason
    : fallback.dayOfSeason
  if (!validInteger(source.dayOfSeason, 1, policy.daysPerSeason)) reasons.push('invalid-day-of-season')
  const hour = validInteger(source.hour, 0, 23) ? source.hour : fallback.hour
  if (!validInteger(source.hour, 0, 23)) reasons.push('invalid-hour')
  const minute = validInteger(source.minute, 0, 59) ? source.minute : fallback.minute
  if (!validInteger(source.minute, 0, 59)) reasons.push('invalid-minute')
  return {
    clock: { worldInstanceId, year, season, dayOfSeason, hour, minute },
    repaired: reasons.length > 0,
    reasons,
  }
}

export const isWorldClockStateValid = (
  value: unknown,
  policy: WorldClockPolicy = PROTOTYPE_WORLD_CLOCK_POLICY,
): value is WorldClockState => sanitizeWorldClockState(value, 'wi_local_legacy_v1', policy).repaired === false

const daysPerYear = (policy: WorldClockPolicy): number => policy.daysPerSeason * WORLD_SEASONS.length

export const worldClockDayOrdinal = (
  clock: WorldClockState,
  policy: WorldClockPolicy = PROTOTYPE_WORLD_CLOCK_POLICY,
): number => {
  assertPolicy(policy)
  const safe = sanitizeWorldClockState(clock, clock.worldInstanceId, policy).clock
  return (safe.year - 1) * daysPerYear(policy)
    + WORLD_SEASONS.indexOf(safe.season as WorldSeason) * policy.daysPerSeason
    + (safe.dayOfSeason - 1)
}

export const worldClockMinuteOrdinal = (
  clock: WorldClockState,
  policy: WorldClockPolicy = PROTOTYPE_WORLD_CLOCK_POLICY,
): number => {
  assertPolicy(policy)
  const safe = sanitizeWorldClockState(clock, clock.worldInstanceId, policy).clock
  return ((safe.year - 1) * daysPerYear(policy)
    + WORLD_SEASONS.indexOf(safe.season as WorldSeason) * policy.daysPerSeason
    + (safe.dayOfSeason - 1)) * MINUTES_PER_DAY
    + safe.hour * MINUTES_PER_HOUR
    + safe.minute
}

export const worldClockFromMinuteOrdinal = (
  worldInstanceId: string,
  ordinalMinute: number,
  policy: WorldClockPolicy = PROTOTYPE_WORLD_CLOCK_POLICY,
): WorldClockState => {
  assertPolicy(policy)
  const safeMinute = Number.isSafeInteger(ordinalMinute) && ordinalMinute >= 0 ? ordinalMinute : 0
  const dayOrdinal = Math.floor(safeMinute / MINUTES_PER_DAY)
  const minuteOfDay = safeMinute % MINUTES_PER_DAY
  const yearIndex = Math.floor(dayOrdinal / daysPerYear(policy))
  const dayOfYear = dayOrdinal % daysPerYear(policy)
  const seasonIndex = Math.floor(dayOfYear / policy.daysPerSeason)
  return {
    worldInstanceId: validWorldInstanceId(worldInstanceId) ? worldInstanceId.trim() : 'wi_local_legacy_v1',
    year: yearIndex + 1,
    season: WORLD_SEASONS[seasonIndex],
    dayOfSeason: dayOfYear % policy.daysPerSeason + 1,
    hour: Math.floor(minuteOfDay / MINUTES_PER_HOUR),
    minute: minuteOfDay % MINUTES_PER_HOUR,
  }
}

export const worldDayPart = (clock: WorldClockState): WorldDayPart => timeOfDay(clock)

export const operatingDayIndex = (
  clock: WorldClockState,
  policy: WorldClockPolicy = PROTOTYPE_WORLD_CLOCK_POLICY,
): number => {
  assertPolicy(policy)
  const ordinal = worldClockMinuteOrdinal(clock, policy)
  return Math.floor((ordinal - policy.operatingDayStartMinute) / MINUTES_PER_DAY)
}

export interface WorkShiftPosition {
  operatingDayIndex: number
  shiftIndex: number
  shiftStartedAtMinuteOfDay: number
}

export const workShiftPosition = (
  clock: WorldClockState,
  policy: WorldClockPolicy = PROTOTYPE_WORLD_CLOCK_POLICY,
): WorkShiftPosition => {
  assertPolicy(policy)
  const starts = [...policy.shiftStartMinutes].sort((a, b) => a - b)
  const minuteOfDay = clock.hour * MINUTES_PER_HOUR + clock.minute
  let shiftIndex = -1
  for (let index = 0; index < starts.length; index += 1) {
    if (starts[index] <= minuteOfDay) shiftIndex = index
    else break
  }
  let dayIndex = operatingDayIndex(clock, policy)
  if (shiftIndex < 0) {
    shiftIndex = starts.length - 1
    dayIndex -= 1
  }
  return { operatingDayIndex: dayIndex, shiftIndex, shiftStartedAtMinuteOfDay: starts[shiftIndex] }
}

const boundariesCrossed = (startExclusive: number, endInclusive: number, interval: number, offset = 0): number => {
  if (endInclusive <= startExclusive) return 0
  return Math.floor((endInclusive - offset) / interval) - Math.floor((startExclusive - offset) / interval)
}

const shiftTransitionsCrossed = (
  startMinute: number,
  endMinute: number,
  policy: WorldClockPolicy,
): number => {
  if (endMinute <= startMinute) return 0
  return policy.shiftStartMinutes.reduce((total, start) =>
    total + boundariesCrossed(startMinute, endMinute, MINUTES_PER_DAY, start), 0)
}

export const advanceWorldClock = (
  clock: WorldClockState,
  requestedMinutes: number,
  policy: WorldClockPolicy = PROTOTYPE_WORLD_CLOCK_POLICY,
): WorldClockAdvanceResult => {
  assertPolicy(policy)
  const safeClock = sanitizeWorldClockState(clock, clock.worldInstanceId, policy).clock
  const requested = Number.isFinite(requestedMinutes) && requestedMinutes > 0
    ? Math.floor(requestedMinutes)
    : 0
  const applied = Math.min(requested, policy.maxAdvanceMinutes)
  const startMinute = worldClockMinuteOrdinal(safeClock, policy)
  const endMinute = startMinute + applied
  const startDay = Math.floor(startMinute / MINUTES_PER_DAY)
  const endDay = Math.floor(endMinute / MINUTES_PER_DAY)
  const seasonMinutes = policy.daysPerSeason * MINUTES_PER_DAY
  const yearMinutes = daysPerYear(policy) * MINUTES_PER_DAY
  return {
    clock: worldClockFromMinuteOrdinal(safeClock.worldInstanceId, endMinute, policy),
    requestedMinutes: requested,
    appliedMinutes: applied,
    truncated: applied < requested,
    boundaries: {
      hourTicks: boundariesCrossed(startMinute, endMinute, MINUTES_PER_HOUR),
      operatingDays: boundariesCrossed(startMinute, endMinute, MINUTES_PER_DAY, policy.operatingDayStartMinute),
      marketCycles: boundariesCrossed(startDay, endDay, policy.marketCycleDays),
      seasons: boundariesCrossed(startMinute, endMinute, seasonMinutes),
      years: boundariesCrossed(startMinute, endMinute, yearMinutes),
      shiftTransitions: shiftTransitionsCrossed(startMinute, endMinute, policy),
    },
  }
}

/**
 * Wall-clock time is only an input proposal. The returned value must still be submitted to the
 * authoritative world-clock owner; callers must never mutate economic state directly from Date.now().
 */
export const requestedGameMinutesFromElapsedMs = (
  elapsedMs: number,
  realMillisecondsPerGameMinute: number,
  policy: WorldClockPolicy = PROTOTYPE_WORLD_CLOCK_POLICY,
): { requestedMinutes: number; boundedMinutes: number; truncated: boolean } => {
  assertPolicy(policy)
  if (!Number.isFinite(elapsedMs) || elapsedMs <= 0 ||
      !Number.isFinite(realMillisecondsPerGameMinute) || realMillisecondsPerGameMinute <= 0) {
    return { requestedMinutes: 0, boundedMinutes: 0, truncated: false }
  }
  const requestedMinutes = Math.floor(elapsedMs / realMillisecondsPerGameMinute)
  const boundedMinutes = Math.min(requestedMinutes, policy.maxAdvanceMinutes)
  return { requestedMinutes, boundedMinutes, truncated: boundedMinutes < requestedMinutes }
}
