import { describe, expect, it } from 'vitest'
import type { WorldClockState } from '../src/world/globalWorld'
import {
  PROTOTYPE_WORLD_CLOCK_POLICY,
  advanceWorldClock,
  createInitialWorldClockState,
  isWorldClockStateValid,
  operatingDayIndex,
  requestedGameMinutesFromElapsedMs,
  sanitizeWorldClockState,
  workShiftPosition,
  worldClockFromMinuteOrdinal,
  worldClockMinuteOrdinal,
  worldDayPart,
} from '../src/systems/worldClockSystem'

const clock = (overrides: Partial<WorldClockState> = {}): WorldClockState => ({
  worldInstanceId: 'world-test',
  year: 1,
  season: 'Spring',
  dayOfSeason: 1,
  hour: 8,
  minute: 0,
  ...overrides,
})

describe('Phase-1 authoritative world clock C1', () => {
  it('creates a deterministic world-local starting clock', () => {
    expect(createInitialWorldClockState(' world-a ')).toEqual({
      worldInstanceId: 'world-a', year: 1, season: 'Spring', dayOfSeason: 1, hour: 8, minute: 0,
    })
    expect(createInitialWorldClockState('')).toMatchObject({ worldInstanceId: 'wi_local_legacy_v1' })
  })

  it('keeps the existing global day-part semantics as the authoritative projection', () => {
    expect(worldDayPart(clock({ hour: 2 }))).toBe('Night')
    expect(worldDayPart(clock({ hour: 6 }))).toBe('Morning')
    expect(worldDayPart(clock({ hour: 11 }))).toBe('Day')
    expect(worldDayPart(clock({ hour: 18 }))).toBe('Evening')
    expect(worldDayPart(clock({ hour: 22 }))).toBe('Night')
  })

  it('advances minutes deterministically without depending on frame cadence', () => {
    const once = advanceWorldClock(clock(), 90)
    let stepped = clock()
    for (let minute = 0; minute < 90; minute += 1) stepped = advanceWorldClock(stepped, 1).clock
    expect(once.clock).toEqual(clock({ hour: 9, minute: 30 }))
    expect(stepped).toEqual(once.clock)
    expect(once.boundaries.hourTicks).toBe(1)
    expect(once.truncated).toBe(false)
  })

  it('rolls deterministically from the last day of one season into the next', () => {
    const result = advanceWorldClock(clock({ dayOfSeason: 28, hour: 23, minute: 30 }), 60)
    expect(result.clock).toEqual(clock({ season: 'Summer', dayOfSeason: 1, hour: 0, minute: 30 }))
    expect(result.boundaries.operatingDays).toBe(1)
    expect(result.boundaries.seasons).toBe(1)
    expect(result.boundaries.years).toBe(0)
  })

  it('rolls winter into a new year exactly once', () => {
    const result = advanceWorldClock(clock({ season: 'Winter', dayOfSeason: 28, hour: 23, minute: 59 }), 1)
    expect(result.clock).toEqual(clock({ year: 2, season: 'Spring', dayOfSeason: 1, hour: 0, minute: 0 }))
    expect(result.boundaries.operatingDays).toBe(1)
    expect(result.boundaries.seasons).toBe(1)
    expect(result.boundaries.years).toBe(1)
  })

  it('exposes operating-day and work-shift positions for later wage/life settlement', () => {
    expect(operatingDayIndex(clock({ hour: 5, minute: 59 }))).toBe(0)
    expect(workShiftPosition(clock({ hour: 5, minute: 59 }))).toEqual({
      operatingDayIndex: -1, shiftIndex: 2, shiftStartedAtMinuteOfDay: 22 * 60,
    })
    expect(workShiftPosition(clock({ hour: 6, minute: 0 }))).toEqual({
      operatingDayIndex: 0, shiftIndex: 0, shiftStartedAtMinuteOfDay: 6 * 60,
    })
    expect(workShiftPosition(clock({ hour: 15 }))).toMatchObject({ shiftIndex: 1, shiftStartedAtMinuteOfDay: 14 * 60 })
    expect(workShiftPosition(clock({ hour: 23 }))).toMatchObject({ shiftIndex: 2, shiftStartedAtMinuteOfDay: 22 * 60 })
  })

  it('reports shift and market-cycle crossings without replaying every minute', () => {
    const shift = advanceWorldClock(clock({ hour: 5, minute: 30 }), 9 * 60)
    expect(shift.boundaries.shiftTransitions).toBe(2) // 06:00 and 14:00
    const market = advanceWorldClock(clock({ dayOfSeason: 7, hour: 23 }), 2 * 60)
    expect(market.clock).toEqual(clock({ dayOfSeason: 8, hour: 1 }))
    expect(market.boundaries.marketCycles).toBe(1)
  })

  it('round-trips logical minute ordinals across seasons and years', () => {
    const source = clock({ year: 17, season: 'Autumn', dayOfSeason: 13, hour: 21, minute: 47 })
    const ordinal = worldClockMinuteOrdinal(source)
    expect(Number.isSafeInteger(ordinal)).toBe(true)
    expect(worldClockFromMinuteOrdinal(source.worldInstanceId, ordinal)).toEqual(source)
  })

  it('repairs malformed clock fields deterministically instead of allowing NaN calendar state', () => {
    const repaired = sanitizeWorldClockState({
      worldInstanceId: '', year: Number.NaN, season: 'Monsoon', dayOfSeason: 90, hour: 40, minute: -1,
    }, 'world-fallback')
    expect(repaired.repaired).toBe(true)
    expect(repaired.clock).toEqual(createInitialWorldClockState('world-fallback'))
    expect(repaired.reasons).toEqual([
      'invalid-world-instance-id', 'invalid-year', 'invalid-season', 'invalid-day-of-season', 'invalid-hour', 'invalid-minute',
    ])
    expect(isWorldClockStateValid(repaired.clock)).toBe(true)
  })

  it('normalizes malformed input before ordinal arithmetic', () => {
    const malformed = clock({ hour: 99, minute: 99 })
    expect(worldClockMinuteOrdinal(malformed)).toBe(worldClockMinuteOrdinal(createInitialWorldClockState('world-test')))
  })

  it('bounds large catch-up requests and reports truncation explicitly', () => {
    const requested = PROTOTYPE_WORLD_CLOCK_POLICY.maxAdvanceMinutes + 5 * 24 * 60
    const result = advanceWorldClock(clock(), requested)
    expect(result.requestedMinutes).toBe(requested)
    expect(result.appliedMinutes).toBe(PROTOTYPE_WORLD_CLOCK_POLICY.maxAdvanceMinutes)
    expect(result.truncated).toBe(true)
    expect(result.boundaries.operatingDays).toBe(14)
    expect(result.boundaries.marketCycles).toBe(2)
  })

  it('treats wall time only as a bounded advancement proposal', () => {
    expect(requestedGameMinutesFromElapsedMs(90_000, 1_000)).toEqual({
      requestedMinutes: 90, boundedMinutes: 90, truncated: false,
    })
    const huge = requestedGameMinutesFromElapsedMs(999_999_999, 1)
    expect(huge.requestedMinutes).toBe(999_999_999)
    expect(huge.boundedMinutes).toBe(PROTOTYPE_WORLD_CLOCK_POLICY.maxAdvanceMinutes)
    expect(huge.truncated).toBe(true)
    expect(requestedGameMinutesFromElapsedMs(Number.NaN, 1_000)).toEqual({
      requestedMinutes: 0, boundedMinutes: 0, truncated: false,
    })
  })
})
