import { describe, expect, it } from 'vitest'
import {
  PROTOTYPE_PLAYER_ECONOMY_POLICY,
  createFreshEmployeePlayerEconomy,
  performBasicDeliveryWork,
  type PlayerEconomyState,
} from '../src/economy/playerEconomy'
import {
  processEmployeeHardshipLifecycleThroughClock,
  readPlayerHardshipTimeline,
  settleHardshipRecoveryFromAvailablePersonalMoney,
} from '../src/economy/playerEconomyHardshipLifecycle'
import {
  advanceWorldClock,
  createInitialWorldClockState,
} from '../src/systems/worldClockSystem'
import { createFreshLocalWorldIdentity } from '../src/systems/worldIdentitySystem'

const freshFixture = (worldInstanceId = 'wi_hardship_lifecycle') => {
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
  prefix: string,
): PlayerEconomyState => {
  let current = performWork(state, clock, `${prefix}-1`)
  current = performWork(current, clock, `${prefix}-2`)
  return current
}

describe('Player Economy hardship / arrears / recovery lifecycle', () => {
  it('records a fully paid living day without creating hardship or Emergency Housing', () => {
    const fixture = freshFixture('wi_hardship_paid_day')
    const worked = performFullStarterShift(fixture.state, fixture.clock, 'paid-day')
    const nextDay = advanceWorldClock(fixture.clock, 24 * 60).clock

    const result = processEmployeeHardshipLifecycleThroughClock(
      worked,
      fixture.clock,
      nextDay,
    )
    expect(result.processed).toBe(true)
    if (!result.processed) throw new Error(result.reason)

    expect(result.summary.days).toHaveLength(1)
    expect(result.summary.days[0]).toMatchObject({
      dayId: `living:${fixture.identity.worldInstanceId}:${fixture.identity.heroActorId}:1`,
      operatingDayIndex: 1,
      paidMinor: PROTOTYPE_PLAYER_ECONOMY_POLICY.basicLivingCostMinor,
      addedArrearsMinor: 0,
      arrearsBeforeMinor: 0,
      arrearsAfterMinor: 0,
      financialStatusAfter: 'Stable',
      housingStatusAfter: 'Housed',
    })
    expect(result.summary.transitions).toEqual([])
    expect(result.state.personalMoney.balanceMinor).toBe(
      PROTOTYPE_PLAYER_ECONOMY_POLICY.starterShiftWageMinor -
      PROTOTYPE_PLAYER_ECONOMY_POLICY.basicLivingCostMinor,
    )
    expect(result.summary.snapshotAfter).toMatchObject({
      financialStatus: 'Stable',
      housingStatus: 'Housed',
      arrearsMinor: 0,
      insolvent: false,
      emergencyHousingActive: false,
    })
  })

  it('turns one unpaid living obligation into deterministic arrears and insolvency', () => {
    const fixture = freshFixture('wi_hardship_unpaid_day')
    const nextDay = advanceWorldClock(fixture.clock, 24 * 60).clock

    const result = processEmployeeHardshipLifecycleThroughClock(
      fixture.state,
      fixture.clock,
      nextDay,
    )
    expect(result.processed).toBe(true)
    if (!result.processed) throw new Error(result.reason)

    const expectedDayId = `living:${fixture.identity.worldInstanceId}:${fixture.identity.heroActorId}:1`
    expect(result.summary.days).toEqual([
      expect.objectContaining({
        dayId: expectedDayId,
        paidMinor: 0,
        addedArrearsMinor: PROTOTYPE_PLAYER_ECONOMY_POLICY.basicLivingCostMinor,
        arrearsAfterMinor: PROTOTYPE_PLAYER_ECONOMY_POLICY.basicLivingCostMinor,
        financialStatusAfter: 'Insolvent',
        housingStatusAfter: 'Housed',
      }),
    ])
    expect(result.summary.transitions).toEqual([
      expect.objectContaining({
        transitionId:
          `hardship:${fixture.identity.worldInstanceId}:${fixture.identity.heroActorId}:day:${expectedDayId}:InsolvencyEntered`,
        kind: 'InsolvencyEntered',
        sourceId: expectedDayId,
      }),
    ])
    expect(result.state.personalMoney.balanceMinor).toBe(0)
    expect(result.state.living.arrearsMinor).toBe(PROTOTYPE_PLAYER_ECONOMY_POLICY.basicLivingCostMinor)
  })

  it('accumulates arrears across C1 days without duplicating the insolvency transition', () => {
    const fixture = freshFixture('wi_hardship_accumulation')
    const dayThree = advanceWorldClock(fixture.clock, 3 * 24 * 60).clock

    const result = processEmployeeHardshipLifecycleThroughClock(
      fixture.state,
      fixture.clock,
      dayThree,
    )
    expect(result.processed).toBe(true)
    if (!result.processed) throw new Error(result.reason)

    expect(result.summary.days).toHaveLength(3)
    expect(result.summary.days.map(day => day.operatingDayIndex)).toEqual([1, 2, 3])
    expect(result.state.living.arrearsMinor).toBe(
      3 * PROTOTYPE_PLAYER_ECONOMY_POLICY.basicLivingCostMinor,
    )
    expect(result.state.living.financialStatus).toBe('Insolvent')
    expect(result.state.living.housingStatus).toBe('Housed')
    expect(result.summary.transitions.filter(transition => transition.kind === 'InsolvencyEntered')).toHaveLength(1)
    expect(result.summary.transitions.filter(transition => transition.kind === 'EmergencyHousingEntered')).toHaveLength(0)
  })

  it('enters Emergency Housing exactly at the governed arrears threshold without granting free money', () => {
    const fixture = freshFixture('wi_hardship_emergency_housing')
    const dayFour = advanceWorldClock(fixture.clock, 4 * 24 * 60).clock
    const employerBefore = fixture.state.employerCompanyMoney?.balanceMinor

    const severe = processEmployeeHardshipLifecycleThroughClock(
      fixture.state,
      fixture.clock,
      dayFour,
    )
    expect(severe.processed).toBe(true)
    if (!severe.processed) throw new Error(severe.reason)

    expect(severe.state.living.arrearsMinor).toBe(
      PROTOTYPE_PLAYER_ECONOMY_POLICY.emergencyHousingArrearsMinor,
    )
    expect(severe.state.living.financialStatus).toBe('Insolvent')
    expect(severe.state.living.housingStatus).toBe('EmergencyHousing')
    expect(severe.state.personalMoney.balanceMinor).toBe(0)
    expect(severe.state.employerCompanyMoney?.balanceMinor).toBe(employerBefore)
    expect(severe.summary.transitions.filter(transition => transition.kind === 'EmergencyHousingEntered')).toEqual([
      expect.objectContaining({
        kind: 'EmergencyHousingEntered',
        arrearsAfterMinor: PROTOTYPE_PLAYER_ECONOMY_POLICY.emergencyHousingArrearsMinor,
      }),
    ])

    const noMoneyEscape = settleHardshipRecoveryFromAvailablePersonalMoney(severe.state, dayFour)
    expect(noMoneyEscape).toMatchObject({ recovered: false, reason: 'no-money' })
    expect(noMoneyEscape.state).toEqual(severe.state)
  })

  it('replays settled days without duplicate arrears or duplicate hardship transitions', () => {
    const fixture = freshFixture('wi_hardship_replay')
    const dayFour = advanceWorldClock(fixture.clock, 4 * 24 * 60).clock
    const first = processEmployeeHardshipLifecycleThroughClock(
      fixture.state,
      fixture.clock,
      dayFour,
    )
    expect(first.processed).toBe(true)
    if (!first.processed) throw new Error(first.reason)

    const beforeTimeline = readPlayerHardshipTimeline(first.state)
    expect(beforeTimeline.ok).toBe(true)
    if (!beforeTimeline.ok) throw new Error(beforeTimeline.reason)

    const replay = processEmployeeHardshipLifecycleThroughClock(
      first.state,
      fixture.clock,
      dayFour,
    )
    expect(replay.processed).toBe(true)
    if (!replay.processed) throw new Error(replay.reason)
    expect(replay.summary.days).toEqual([])
    expect(replay.summary.transitions).toEqual([])
    expect(replay.state.living.arrearsMinor).toBe(first.state.living.arrearsMinor)
    expect(replay.state.personalMoney.balanceMinor).toBe(first.state.personalMoney.balanceMinor)

    const afterTimeline = readPlayerHardshipTimeline(replay.state)
    expect(afterTimeline.ok).toBe(true)
    if (!afterTimeline.ok) throw new Error(afterTimeline.reason)
    expect(afterTimeline.timeline.transitions).toEqual(beforeTimeline.timeline.transitions)
    expect(new Set(afterTimeline.timeline.transitions.map(transition => transition.transitionId)).size).toBe(
      afterTimeline.timeline.transitions.length,
    )
  })

  it('uses earned wages for legitimate recovery, exits Emergency Housing, then reaches stable recovery', () => {
    const fixture = freshFixture('wi_hardship_stable_recovery')
    const dayFour = advanceWorldClock(fixture.clock, 4 * 24 * 60).clock
    const severe = processEmployeeHardshipLifecycleThroughClock(
      fixture.state,
      fixture.clock,
      dayFour,
    )
    expect(severe.processed).toBe(true)
    if (!severe.processed) throw new Error(severe.reason)

    const employerBeforeRecovery = severe.state.employerCompanyMoney?.balanceMinor ?? 0
    const firstShiftWorked = performFullStarterShift(severe.state, dayFour, 'recovery-shift-a')
    const shiftOneClose = advanceWorldClock(dayFour, 6 * 60).clock
    const partial = processEmployeeHardshipLifecycleThroughClock(
      firstShiftWorked,
      dayFour,
      shiftOneClose,
    )
    expect(partial.processed).toBe(true)
    if (!partial.processed) throw new Error(partial.reason)

    expect(employerBeforeRecovery - (partial.state.employerCompanyMoney?.balanceMinor ?? 0)).toBe(
      PROTOTYPE_PLAYER_ECONOMY_POLICY.starterShiftWageMinor,
    )
    expect(partial.state.personalMoney.balanceMinor).toBe(0)
    expect(partial.state.living.arrearsMinor).toBe(
      PROTOTYPE_PLAYER_ECONOMY_POLICY.emergencyHousingArrearsMinor -
      PROTOTYPE_PLAYER_ECONOMY_POLICY.starterShiftWageMinor,
    )
    expect(partial.state.living.financialStatus).toBe('Insolvent')
    expect(partial.state.living.housingStatus).toBe('Housed')
    expect(partial.summary.transitions.map(transition => transition.kind)).toEqual([
      'ArrearsRecoveryApplied',
      'EmergencyHousingExited',
    ])

    const secondShiftWorked = performFullStarterShift(partial.state, shiftOneClose, 'recovery-shift-b')
    const shiftTwoClose = advanceWorldClock(shiftOneClose, 8 * 60).clock
    const recovered = processEmployeeHardshipLifecycleThroughClock(
      secondShiftWorked,
      shiftOneClose,
      shiftTwoClose,
    )
    expect(recovered.processed).toBe(true)
    if (!recovered.processed) throw new Error(recovered.reason)

    expect(recovered.state.living.arrearsMinor).toBe(0)
    expect(recovered.state.living.financialStatus).toBe('Recovering')
    expect(recovered.state.living.housingStatus).toBe('Housed')
    expect(recovered.state.personalMoney.balanceMinor).toBe(
      PROTOTYPE_PLAYER_ECONOMY_POLICY.starterShiftWageMinor -
      (PROTOTYPE_PLAYER_ECONOMY_POLICY.emergencyHousingArrearsMinor -
        PROTOTYPE_PLAYER_ECONOMY_POLICY.starterShiftWageMinor),
    )
    expect(recovered.summary.transitions.map(transition => transition.kind)).toEqual([
      'ArrearsRecoveryApplied',
      'RecoveryStarted',
    ])

    const replayRecovery = processEmployeeHardshipLifecycleThroughClock(
      recovered.state,
      shiftOneClose,
      shiftTwoClose,
    )
    expect(replayRecovery.processed).toBe(true)
    if (!replayRecovery.processed) throw new Error(replayRecovery.reason)
    expect(replayRecovery.summary.transitions).toEqual([])
    expect(replayRecovery.state.personalMoney.balanceMinor).toBe(recovered.state.personalMoney.balanceMinor)
    expect(replayRecovery.state.living.arrearsMinor).toBe(0)

    const nextOperatingDay = advanceWorldClock(shiftTwoClose, 2 * 60).clock
    const stable = processEmployeeHardshipLifecycleThroughClock(
      recovered.state,
      shiftTwoClose,
      nextOperatingDay,
    )
    expect(stable.processed).toBe(true)
    if (!stable.processed) throw new Error(stable.reason)

    expect(stable.summary.days).toHaveLength(1)
    expect(stable.summary.days[0]).toMatchObject({
      paidMinor: PROTOTYPE_PLAYER_ECONOMY_POLICY.basicLivingCostMinor,
      addedArrearsMinor: 0,
      financialStatusBefore: 'Recovering',
      financialStatusAfter: 'Stable',
    })
    expect(stable.summary.transitions.map(transition => transition.kind)).toEqual([
      'StableRecoveryReached',
    ])
    expect(stable.state.living.financialStatus).toBe('Stable')
    expect(stable.state.living.housingStatus).toBe('Housed')
    expect(stable.state.living.arrearsMinor).toBe(0)
    expect(stable.state.personalMoney.balanceMinor).toBe(
      recovered.state.personalMoney.balanceMinor - PROTOTYPE_PLAYER_ECONOMY_POLICY.basicLivingCostMinor,
    )
    expect(stable.state.heroActorId).toBe(fixture.identity.heroActorId)
    expect(stable.state.employment).toEqual(fixture.state.employment)
    expect(stable.state.employment?.capabilityIds).toEqual(fixture.state.employment?.capabilityIds)
  })

  it('rejects an apparent hardship escape created by an unledgered Personal Money balance', () => {
    const fixture = freshFixture('wi_hardship_no_mint')
    const dayOne = advanceWorldClock(fixture.clock, 24 * 60).clock
    const indebted = processEmployeeHardshipLifecycleThroughClock(
      fixture.state,
      fixture.clock,
      dayOne,
    )
    expect(indebted.processed).toBe(true)
    if (!indebted.processed) throw new Error(indebted.reason)

    const tampered: PlayerEconomyState = {
      ...indebted.state,
      personalMoney: {
        ...indebted.state.personalMoney,
        balanceMinor: PROTOTYPE_PLAYER_ECONOMY_POLICY.basicLivingCostMinor,
      },
    }
    const recovery = settleHardshipRecoveryFromAvailablePersonalMoney(tampered, dayOne)
    expect(recovery).toMatchObject({ recovered: false, reason: 'invalid-hardship-state' })
    expect(recovery.state).toEqual(tampered)
  })
})
