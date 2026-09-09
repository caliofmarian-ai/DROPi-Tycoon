import { describe, expect, it } from 'vitest'
import {
  PROTOTYPE_PLAYER_ECONOMY_POLICY,
  createFreshEmployeePlayerEconomy,
  createLegacyCompatibilityPlayerEconomy,
  performBasicDeliveryWork,
  type PlayerEconomyState,
} from '../src/economy/playerEconomy'
import {
  processEmployeeFinanceLifecycleThroughClock,
  readCurrentEmployeeShiftProgress,
} from '../src/economy/playerEconomyFinanceLifecycle'
import {
  PROTOTYPE_WORLD_CLOCK_POLICY,
  advanceWorldClock,
  createInitialWorldClockState,
} from '../src/systems/worldClockSystem'
import {
  createFreshLocalWorldIdentity,
  createInitialWorldIdentityState,
} from '../src/systems/worldIdentitySystem'
import { createInitialCompanyState } from '../src/state/gameState'

const freshFixture = (worldInstanceId = 'wi_finance_lifecycle') => {
  const identity = createFreshLocalWorldIdentity(worldInstanceId)
  const clock = createInitialWorldClockState(identity.worldInstanceId)
  const state = createFreshEmployeePlayerEconomy(identity, clock)
  return { identity, clock, state }
}

const performWork = (
  state: PlayerEconomyState,
  clock: ReturnType<typeof createInitialWorldClockState>,
  activityRef: string,
): PlayerEconomyState => {
  const result = performBasicDeliveryWork(state, clock, activityRef)
  expect(result.performed).toBe(true)
  if (!result.performed) throw new Error(`Expected productive work: ${result.reason}`)
  return result.state
}

const performFullStarterShift = (
  state: PlayerEconomyState,
  clock: ReturnType<typeof createInitialWorldClockState>,
  prefix = 'delivery',
): PlayerEconomyState => {
  let current = performWork(state, clock, `${prefix}-1`)
  current = performWork(current, clock, `${prefix}-2`)
  return current
}

describe('employee-first finance lifecycle', () => {
  it('projects productive work into deterministic shift progress and rejects duplicate work counting', () => {
    const fixture = freshFixture('wi_shift_progress')
    const initial = readCurrentEmployeeShiftProgress(fixture.state, fixture.clock)
    expect(initial).toMatchObject({
      ok: true,
      progress: {
        productiveMinutes: 0,
        remainingProductiveMinutes: PROTOTYPE_PLAYER_ECONOMY_POLICY.starterShiftRequiredProductiveMinutes,
        wageEligibleAtClose: false,
        workCapacityCurrent: PROTOTYPE_PLAYER_ECONOMY_POLICY.maxWorkCapacity,
      },
    })

    const afterOne = performWork(fixture.state, fixture.clock, 'real-work-1')
    const duplicate = performBasicDeliveryWork(afterOne, fixture.clock, 'real-work-1')
    expect(duplicate).toMatchObject({ performed: false, reason: 'duplicate-activity' })
    expect(duplicate.state).toEqual(afterOne)

    const oneProgress = readCurrentEmployeeShiftProgress(afterOne, fixture.clock)
    expect(oneProgress).toMatchObject({
      ok: true,
      progress: {
        productiveMinutes: PROTOTYPE_PLAYER_ECONOMY_POLICY.starterDeliveryProductiveMinutes,
        remainingProductiveMinutes:
          PROTOTYPE_PLAYER_ECONOMY_POLICY.starterShiftRequiredProductiveMinutes -
          PROTOTYPE_PLAYER_ECONOMY_POLICY.starterDeliveryProductiveMinutes,
        wageEligibleAtClose: false,
        workCapacityCurrent:
          PROTOTYPE_PLAYER_ECONOMY_POLICY.maxWorkCapacity -
          PROTOTYPE_PLAYER_ECONOMY_POLICY.starterDeliveryCapacityCost,
      },
    })

    const afterTwo = performWork(afterOne, fixture.clock, 'real-work-2')
    const twoProgress = readCurrentEmployeeShiftProgress(afterTwo, fixture.clock)
    expect(twoProgress).toMatchObject({
      ok: true,
      progress: {
        productiveMinutes: PROTOTYPE_PLAYER_ECONOMY_POLICY.starterShiftRequiredProductiveMinutes,
        remainingProductiveMinutes: 0,
        wageEligibleAtClose: true,
      },
    })
  })

  it('enforces no work = no wage at the C1 shift boundary', () => {
    const fixture = freshFixture('wi_no_work_no_wage')
    const shiftBoundary = advanceWorldClock(fixture.clock, 6 * 60).clock
    const result = processEmployeeFinanceLifecycleThroughClock(
      fixture.state,
      fixture.clock,
      shiftBoundary,
    )

    expect(result.processed).toBe(true)
    if (!result.processed) throw new Error(result.reason)
    expect(result.state.personalMoney.balanceMinor).toBe(0)
    expect(result.state.employerCompanyMoney?.balanceMinor).toBe(
      PROTOTYPE_PLAYER_ECONOMY_POLICY.starterEmployerOpeningMoneyMinor,
    )
    expect(result.summary.wagesPaidMinor).toBe(0)
    expect(result.summary.events).toContainEqual(expect.objectContaining({
      kind: 'ShiftClosed',
      wageOutcome: 'not-earned',
      wagePaidMinor: 0,
    }))
  })

  it('closes earned work into one conserved employer-to-person wage and cannot pay the same shift twice', () => {
    const fixture = freshFixture('wi_conserved_wage')
    const worked = performFullStarterShift(fixture.state, fixture.clock)
    const shiftBoundary = advanceWorldClock(fixture.clock, 6 * 60).clock
    const beforeEmployer = worked.employerCompanyMoney?.balanceMinor ?? 0
    const beforePerson = worked.personalMoney.balanceMinor
    const combinedBefore = beforeEmployer + beforePerson

    const first = processEmployeeFinanceLifecycleThroughClock(
      worked,
      fixture.clock,
      shiftBoundary,
    )
    expect(first.processed).toBe(true)
    if (!first.processed) throw new Error(first.reason)

    expect(first.summary.wagesPaidMinor).toBe(PROTOTYPE_PLAYER_ECONOMY_POLICY.starterShiftWageMinor)
    expect(first.state.personalMoney.balanceMinor - beforePerson).toBe(
      PROTOTYPE_PLAYER_ECONOMY_POLICY.starterShiftWageMinor,
    )
    expect(beforeEmployer - (first.state.employerCompanyMoney?.balanceMinor ?? 0)).toBe(
      PROTOTYPE_PLAYER_ECONOMY_POLICY.starterShiftWageMinor,
    )
    expect(
      first.state.personalMoney.balanceMinor +
      (first.state.employerCompanyMoney?.balanceMinor ?? 0),
    ).toBe(combinedBefore)

    const duplicate = processEmployeeFinanceLifecycleThroughClock(
      first.state,
      fixture.clock,
      shiftBoundary,
    )
    expect(duplicate.processed).toBe(true)
    if (!duplicate.processed) throw new Error(duplicate.reason)
    expect(duplicate.summary.wagesPaidMinor).toBe(0)
    expect(duplicate.state.personalMoney.balanceMinor).toBe(first.state.personalMoney.balanceMinor)
    expect(duplicate.state.employerCompanyMoney?.balanceMinor).toBe(
      first.state.employerCompanyMoney?.balanceMinor,
    )
    expect(duplicate.summary.events).toContainEqual(expect.objectContaining({
      kind: 'ShiftClosed',
      wageOutcome: 'already-settled',
    }))
  })

  it('processes wage before a later living-cost boundary and preserves chronology across a C1 day', () => {
    const fixture = freshFixture('wi_wage_then_living')
    const worked = performFullStarterShift(fixture.state, fixture.clock)
    const nextDaySameTime = advanceWorldClock(fixture.clock, 24 * 60).clock

    const result = processEmployeeFinanceLifecycleThroughClock(
      worked,
      fixture.clock,
      nextDaySameTime,
    )
    expect(result.processed).toBe(true)
    if (!result.processed) throw new Error(result.reason)

    expect(result.summary.wagesPaidMinor).toBe(PROTOTYPE_PLAYER_ECONOMY_POLICY.starterShiftWageMinor)
    expect(result.summary.livingCostsPaidMinor).toBe(PROTOTYPE_PLAYER_ECONOMY_POLICY.basicLivingCostMinor)
    expect(result.summary.livingArrearsAddedMinor).toBe(0)
    expect(result.state.personalMoney.balanceMinor).toBe(
      PROTOTYPE_PLAYER_ECONOMY_POLICY.starterShiftWageMinor -
      PROTOTYPE_PLAYER_ECONOMY_POLICY.basicLivingCostMinor,
    )
    expect(result.state.living.arrearsMinor).toBe(0)

    const wageEventIndex = result.summary.events.findIndex(event =>
      event.kind === 'ShiftClosed' && event.wageOutcome === 'wage-paid')
    const livingEventIndex = result.summary.events.findIndex(event =>
      event.kind === 'LivingDayClosed' && event.outcome === 'charged')
    expect(wageEventIndex).toBeGreaterThanOrEqual(0)
    expect(livingEventIndex).toBeGreaterThan(wageEventIndex)
  })

  it('charges a crossed operating day exactly once and creates arrears instead of negative Personal Money', () => {
    const fixture = freshFixture('wi_living_once')
    const nextDaySameTime = advanceWorldClock(fixture.clock, 24 * 60).clock

    const first = processEmployeeFinanceLifecycleThroughClock(
      fixture.state,
      fixture.clock,
      nextDaySameTime,
    )
    expect(first.processed).toBe(true)
    if (!first.processed) throw new Error(first.reason)
    expect(first.state.personalMoney.balanceMinor).toBe(0)
    expect(first.state.living.arrearsMinor).toBe(PROTOTYPE_PLAYER_ECONOMY_POLICY.basicLivingCostMinor)
    expect(first.state.living.financialStatus).toBe('Insolvent')
    expect(first.summary.livingArrearsAddedMinor).toBe(PROTOTYPE_PLAYER_ECONOMY_POLICY.basicLivingCostMinor)

    const duplicate = processEmployeeFinanceLifecycleThroughClock(
      first.state,
      fixture.clock,
      nextDaySameTime,
    )
    expect(duplicate.processed).toBe(true)
    if (!duplicate.processed) throw new Error(duplicate.reason)
    expect(duplicate.state.living.arrearsMinor).toBe(first.state.living.arrearsMinor)
    expect(duplicate.summary.livingCostsPaidMinor).toBe(0)
    expect(duplicate.summary.livingArrearsAddedMinor).toBe(0)
    expect(duplicate.summary.events).toContainEqual(expect.objectContaining({
      kind: 'LivingDayClosed',
      outcome: 'already-processed',
    }))
  })

  it('recovers existing living arrears from the next earned wage without changing identity or capability', () => {
    const fixture = freshFixture('wi_arrears_recovery')
    const nextDaySameTime = advanceWorldClock(fixture.clock, 24 * 60).clock
    const indebted = processEmployeeFinanceLifecycleThroughClock(
      fixture.state,
      fixture.clock,
      nextDaySameTime,
    )
    expect(indebted.processed).toBe(true)
    if (!indebted.processed) throw new Error(indebted.reason)
    expect(indebted.state.living.arrearsMinor).toBe(PROTOTYPE_PLAYER_ECONOMY_POLICY.basicLivingCostMinor)

    const worked = performFullStarterShift(indebted.state, nextDaySameTime, 'recovery')
    const nextShiftBoundary = advanceWorldClock(nextDaySameTime, 6 * 60).clock
    const recovered = processEmployeeFinanceLifecycleThroughClock(
      worked,
      nextDaySameTime,
      nextShiftBoundary,
    )
    expect(recovered.processed).toBe(true)
    if (!recovered.processed) throw new Error(recovered.reason)

    expect(recovered.summary.wagesPaidMinor).toBe(PROTOTYPE_PLAYER_ECONOMY_POLICY.starterShiftWageMinor)
    expect(recovered.summary.livingArrearsRecoveredMinor).toBe(PROTOTYPE_PLAYER_ECONOMY_POLICY.basicLivingCostMinor)
    expect(recovered.state.living.arrearsMinor).toBe(0)
    expect(recovered.state.living.financialStatus).toBe('Recovering')
    expect(recovered.state.personalMoney.balanceMinor).toBe(
      PROTOTYPE_PLAYER_ECONOMY_POLICY.starterShiftWageMinor -
      PROTOTYPE_PLAYER_ECONOMY_POLICY.basicLivingCostMinor,
    )
    expect(recovered.state.heroActorId).toBe(fixture.identity.heroActorId)
    expect(recovered.state.employment).toEqual(fixture.state.employment)
    expect(recovered.summary.events).toContainEqual(expect.objectContaining({
      kind: 'ArrearsRecovered',
      paidMinor: PROTOTYPE_PLAYER_ECONOMY_POLICY.basicLivingCostMinor,
      arrearsAfterMinor: 0,
    }))
  })

  it('rejects reversed, cross-world and over-bounded clock intervals without mutating finance state', () => {
    const fixture = freshFixture('wi_clock_guard')
    const later = advanceWorldClock(fixture.clock, 60).clock
    const reversed = processEmployeeFinanceLifecycleThroughClock(
      fixture.state,
      later,
      fixture.clock,
    )
    expect(reversed).toMatchObject({ processed: false, reason: 'clock-reversed' })
    expect(reversed.state).toEqual(fixture.state)

    const otherClock = createInitialWorldClockState('wi_other_world')
    const crossWorld = processEmployeeFinanceLifecycleThroughClock(
      fixture.state,
      fixture.clock,
      otherClock,
    )
    expect(crossWorld).toMatchObject({ processed: false, reason: 'invalid-world' })
    expect(crossWorld.state).toEqual(fixture.state)

    const maxClock = advanceWorldClock(
      fixture.clock,
      PROTOTYPE_WORLD_CLOCK_POLICY.maxAdvanceMinutes,
    ).clock
    const beyond = advanceWorldClock(maxClock, 1).clock
    const overBounded = processEmployeeFinanceLifecycleThroughClock(
      fixture.state,
      fixture.clock,
      beyond,
    )
    expect(overBounded).toMatchObject({ processed: false, reason: 'interval-too-large' })
    expect(overBounded.state).toEqual(fixture.state)
  })

  it('keeps legacy Company Money outside the employee finance lifecycle', () => {
    const identity = createInitialWorldIdentityState()
    const clock = createInitialWorldClockState(identity.worldInstanceId)
    const legacyCompanyMoneyMinor = createInitialCompanyState().money
    const legacy = createLegacyCompatibilityPlayerEconomy(
      identity,
      clock,
      legacyCompanyMoneyMinor,
    )
    const later = advanceWorldClock(clock, 24 * 60).clock

    const progress = readCurrentEmployeeShiftProgress(legacy.state, clock)
    expect(progress).toEqual({ ok: false, reason: 'legacy-mode' })

    const result = processEmployeeFinanceLifecycleThroughClock(
      legacy.state,
      clock,
      later,
    )
    expect(result).toMatchObject({ processed: false, reason: 'legacy-mode' })
    expect(result.state).toEqual(legacy.state)
    expect(legacy.legacyCompanyMoneyMinor).toBe(legacyCompanyMoneyMinor)
    expect(legacy.convertedToPersonalMoney).toBe(false)
  })
})
