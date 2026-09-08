import { describe, expect, it } from 'vitest'
import {
  createInitialWorldIdentityState,
  createFreshLocalWorldIdentity,
} from '../src/systems/worldIdentitySystem'
import {
  advanceWorldClock,
  createInitialWorldClockState,
} from '../src/systems/worldClockSystem'
import { createInitialCompanyState } from '../src/state/gameState'
import {
  PROTOTYPE_PLAYER_ECONOMY_POLICY,
  createFreshEmployeePlayerEconomy,
  createLegacyCompatibilityPlayerEconomy,
  performBasicDeliveryWork,
  recoverWorkCapacityByRest,
  settleBasicLivingCostsThroughClock,
  settleCompletedStarterShiftWage,
  settleLivingArrears,
  type PlayerEconomyState,
} from '../src/economy/playerEconomy'

const freshFixture = (worldInstanceId = 'wi_economy_test') => {
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
  if (!result.performed) throw new Error(`Expected work to succeed: ${result.reason}`)
  return result.state
}

describe('employee-first player economy', () => {
  it('creates a poor walking employee with Personal Money separate from employer Company Money', () => {
    const { identity, state } = freshFixture()

    expect(state.mode).toBe('FreshEmployee')
    expect(state.worldInstanceId).toBe(identity.worldInstanceId)
    expect(state.heroActorId).toBe(identity.heroActorId)
    expect(state.personalMoney).toMatchObject({
      ownerKind: 'Person',
      ownerId: identity.heroActorId,
      balanceMinor: 0,
      ledger: [],
    })
    expect(state.employerCompanyMoney?.ownerKind).toBe('Company')
    expect(state.employerCompanyMoney?.ownerId).toBe(PROTOTYPE_PLAYER_ECONOMY_POLICY.starterEmployerCompanyId)
    expect(state.employerCompanyMoney?.ownerId).not.toBe(identity.heroActorId)
    expect(state.employerCompanyMoney?.balanceMinor).toBe(PROTOTYPE_PLAYER_ECONOMY_POLICY.starterEmployerOpeningMoneyMinor)
    expect(state.employment).toMatchObject({
      employerCompanyId: PROTOTYPE_PLAYER_ECONOMY_POLICY.starterEmployerCompanyId,
      roleId: 'LightDeliveryEmployee',
      status: 'Active',
      transportMode: 'Walking',
      smartphoneAvailable: true,
    })
    expect(state.employment?.capabilityIds).toEqual([
      'DeliveryAppLiteracy',
      'WalkingCourierFundamentals',
    ])
    expect(state.workCapacity.current).toBe(PROTOTYPE_PLAYER_ECONOMY_POLICY.maxWorkCapacity)
  })

  it('conserves money across an exactly-once company-to-person wage settlement at a completed shift boundary', () => {
    const fixture = freshFixture()
    let state = performWork(fixture.state, fixture.clock, 'delivery-a')
    state = performWork(state, fixture.clock, 'delivery-b')

    const beforeCompany = state.employerCompanyMoney?.balanceMinor ?? 0
    const beforePerson = state.personalMoney.balanceMinor
    const beforeCombined = beforeCompany + beforePerson

    const beforeBoundary = settleCompletedStarterShiftWage(state, fixture.clock)
    expect(beforeBoundary).toMatchObject({ settled: false, reason: 'no-completed-shift' })

    const shiftBoundaryClock = advanceWorldClock(fixture.clock, 6 * 60).clock
    const paid = settleCompletedStarterShiftWage(state, shiftBoundaryClock)
    expect(paid.settled).toBe(true)
    if (!paid.settled) throw new Error(`Expected wage settlement: ${paid.reason}`)
    state = paid.state

    const afterCompany = state.employerCompanyMoney?.balanceMinor ?? 0
    const afterPerson = state.personalMoney.balanceMinor
    expect(afterPerson - beforePerson).toBe(PROTOTYPE_PLAYER_ECONOMY_POLICY.starterShiftWageMinor)
    expect(beforeCompany - afterCompany).toBe(PROTOTYPE_PLAYER_ECONOMY_POLICY.starterShiftWageMinor)
    expect(afterCompany + afterPerson).toBe(beforeCombined)

    const personEntry = state.personalMoney.ledger.find((entry) => entry.transactionId === paid.transactionId)
    const companyEntry = state.employerCompanyMoney?.ledger.find((entry) => entry.transactionId === paid.transactionId)
    expect(personEntry?.amountMinor).toBe(PROTOTYPE_PLAYER_ECONOMY_POLICY.starterShiftWageMinor)
    expect(companyEntry?.amountMinor).toBe(-PROTOTYPE_PLAYER_ECONOMY_POLICY.starterShiftWageMinor)
    expect(personEntry?.counterpartyId).toBe(state.employerCompanyMoney?.ownerId)
    expect(companyEntry?.counterpartyId).toBe(state.heroActorId)

    const duplicate = settleCompletedStarterShiftWage(state, shiftBoundaryClock)
    expect(duplicate).toMatchObject({ settled: false, reason: 'already-settled' })
    expect(duplicate.state).toEqual(state)
  })

  it('does not pay a shift with insufficient productive work', () => {
    const fixture = freshFixture('wi_not_enough_work')
    const state = performWork(fixture.state, fixture.clock, 'delivery-a')
    const shiftBoundaryClock = advanceWorldClock(fixture.clock, 6 * 60).clock

    const result = settleCompletedStarterShiftWage(state, shiftBoundaryClock)
    expect(result).toMatchObject({ settled: false, reason: 'not-enough-work' })
    expect(result.state.personalMoney.balanceMinor).toBe(0)
    expect(result.state.employerCompanyMoney?.balanceMinor).toBe(PROTOTYPE_PLAYER_ECONOMY_POLICY.starterEmployerOpeningMoneyMinor)
  })

  it('bounds Work Capacity, prevents duplicate work/rest settlement and recovers through rest', () => {
    const fixture = freshFixture('wi_capacity_test')
    let state = fixture.state
    const activityCount = Math.floor(
      PROTOTYPE_PLAYER_ECONOMY_POLICY.maxWorkCapacity /
      PROTOTYPE_PLAYER_ECONOMY_POLICY.starterDeliveryCapacityCost,
    )

    for (let index = 0; index < activityCount; index += 1) {
      state = performWork(state, fixture.clock, `capacity-${index}`)
    }
    expect(state.workCapacity.current).toBe(0)

    const exhausted = performBasicDeliveryWork(state, fixture.clock, 'capacity-overflow')
    expect(exhausted).toMatchObject({ performed: false, reason: 'insufficient-capacity' })
    expect(exhausted.state.workCapacity.current).toBe(0)

    const duplicateWork = performBasicDeliveryWork(state, fixture.clock, 'capacity-0')
    expect(duplicateWork).toMatchObject({ performed: false, reason: 'duplicate-activity' })
    expect(duplicateWork.state.workCapacity.current).toBe(0)

    const rest = recoverWorkCapacityByRest(state, fixture.clock, 'rest-1', 120)
    expect(rest.recovered).toBe(true)
    if (!rest.recovered) throw new Error(`Expected rest recovery: ${rest.reason}`)
    expect(rest.recoveredCapacity).toBe(500)
    state = rest.state
    expect(state.workCapacity.current).toBe(500)

    const duplicateRest = recoverWorkCapacityByRest(state, fixture.clock, 'rest-1', 120)
    expect(duplicateRest).toMatchObject({ recovered: false, reason: 'duplicate-rest' })
    expect(duplicateRest.state.workCapacity.current).toBe(500)

    const fullRest = recoverWorkCapacityByRest(state, fixture.clock, 'rest-2', 10_000)
    expect(fullRest.recovered).toBe(true)
    if (!fullRest.recovered) throw new Error(`Expected full rest recovery: ${fullRest.reason}`)
    expect(fullRest.state.workCapacity.current).toBe(PROTOTYPE_PLAYER_ECONOMY_POLICY.maxWorkCapacity)
  })

  it('settles basic living cost exactly once at authoritative operating-day boundaries without negative money', () => {
    const fixture = freshFixture('wi_living_test')
    const dayOneClock = advanceWorldClock(fixture.clock, 24 * 60).clock

    const first = settleBasicLivingCostsThroughClock(fixture.state, fixture.clock, dayOneClock)
    expect(first.settled).toBe(true)
    if (!first.settled) throw new Error(`Expected living settlement: ${first.reason}`)
    expect(first.summary).toMatchObject({
      processedOperatingDays: [1],
      paidMinor: 0,
      addedArrearsMinor: PROTOTYPE_PLAYER_ECONOMY_POLICY.basicLivingCostMinor,
      truncated: false,
    })
    expect(first.state.personalMoney.balanceMinor).toBe(0)
    expect(first.state.living.arrearsMinor).toBe(PROTOTYPE_PLAYER_ECONOMY_POLICY.basicLivingCostMinor)
    expect(first.state.living.financialStatus).toBe('Insolvent')

    const duplicate = settleBasicLivingCostsThroughClock(first.state, fixture.clock, dayOneClock)
    expect(duplicate.settled).toBe(true)
    if (!duplicate.settled) throw new Error(`Expected idempotent living settlement: ${duplicate.reason}`)
    expect(duplicate.summary.processedOperatingDays).toEqual([])
    expect(duplicate.state.living.arrearsMinor).toBe(first.state.living.arrearsMinor)

    const dayFourClock = advanceWorldClock(dayOneClock, 3 * 24 * 60).clock
    const severe = settleBasicLivingCostsThroughClock(first.state, dayOneClock, dayFourClock)
    expect(severe.settled).toBe(true)
    if (!severe.settled) throw new Error(`Expected severe living settlement: ${severe.reason}`)
    expect(severe.state.personalMoney.balanceMinor).toBe(0)
    expect(severe.state.living.arrearsMinor).toBe(4 * PROTOTYPE_PLAYER_ECONOMY_POLICY.basicLivingCostMinor)
    expect(severe.state.living.housingStatus).toBe('EmergencyHousing')
    expect(severe.state.heroActorId).toBe(fixture.identity.heroActorId)
    expect(severe.state.employment?.capabilityIds).toEqual(fixture.state.employment?.capabilityIds)
  })

  it('provides a productive recovery path from insolvency while preserving identity, employment and capability', () => {
    const fixture = freshFixture('wi_recovery_test')
    const dayOneClock = advanceWorldClock(fixture.clock, 24 * 60).clock
    const living = settleBasicLivingCostsThroughClock(fixture.state, fixture.clock, dayOneClock)
    expect(living.settled).toBe(true)
    if (!living.settled) throw new Error(`Expected living settlement: ${living.reason}`)

    let state = performWork(living.state, dayOneClock, 'recovery-a')
    state = performWork(state, dayOneClock, 'recovery-b')
    const boundaryClock = advanceWorldClock(dayOneClock, 6 * 60).clock
    const wage = settleCompletedStarterShiftWage(state, boundaryClock)
    expect(wage.settled).toBe(true)
    if (!wage.settled) throw new Error(`Expected recovery wage: ${wage.reason}`)

    const arrears = settleLivingArrears(wage.state, boundaryClock)
    expect(arrears.settled).toBe(true)
    if (!arrears.settled) throw new Error(`Expected arrears settlement: ${arrears.reason}`)
    expect(arrears.state.living.arrearsMinor).toBe(0)
    expect(arrears.state.living.financialStatus).toBe('Recovering')
    expect(arrears.state.living.housingStatus).toBe('Housed')
    expect(arrears.state.personalMoney.balanceMinor).toBe(
      PROTOTYPE_PLAYER_ECONOMY_POLICY.starterShiftWageMinor -
      PROTOTYPE_PLAYER_ECONOMY_POLICY.basicLivingCostMinor,
    )
    expect(arrears.state.heroActorId).toBe(fixture.identity.heroActorId)
    expect(arrears.state.employment).toEqual(fixture.state.employment)
  })

  it('allows authoritative offline living obligations without manufacturing wages or consuming active Work Capacity', () => {
    const fixture = freshFixture('wi_offline_test')
    const laterClock = advanceWorldClock(fixture.clock, 3 * 24 * 60).clock
    const employerBefore = fixture.state.employerCompanyMoney?.balanceMinor
    const capacityBefore = fixture.state.workCapacity.current

    const settled = settleBasicLivingCostsThroughClock(fixture.state, fixture.clock, laterClock)
    expect(settled.settled).toBe(true)
    if (!settled.settled) throw new Error(`Expected offline living settlement: ${settled.reason}`)

    expect(settled.summary.processedOperatingDays).toEqual([1, 2, 3])
    expect(settled.state.employerCompanyMoney?.balanceMinor).toBe(employerBefore)
    expect(settled.state.personalMoney.balanceMinor).toBe(0)
    expect(settled.state.personalMoney.ledger.filter((entry) => entry.reason === 'StarterShiftWage')).toEqual([])
    expect(settled.state.workCapacity.current).toBe(capacityBefore)
    expect(settled.state.workCapacity.activities).toEqual([])
  })

  it('keeps legacy Company Money untouched and never reinterprets it as Personal Money', () => {
    const identity = createInitialWorldIdentityState()
    const clock = createInitialWorldClockState(identity.worldInstanceId)
    const legacyCompanyMoney = createInitialCompanyState().money

    const legacy = createLegacyCompatibilityPlayerEconomy(identity, clock, legacyCompanyMoney)

    expect(legacy.convertedToPersonalMoney).toBe(false)
    expect(legacy.legacyCompanyMoneyMinor).toBe(legacyCompanyMoney)
    expect(legacy.state.mode).toBe('LegacyCompatibility')
    expect(legacy.state.personalMoney.balanceMinor).toBe(0)
    expect(legacy.state.personalMoney.ledger).toEqual([])
    expect(legacy.state.employerCompanyMoney).toBeNull()
    expect(legacy.state.employment).toBeNull()
  })

  it('rejects cross-world economic activity and binds fresh economy creation to B1/C1 world identity', () => {
    const fixture = freshFixture('wi_world_a')
    const otherIdentity = createFreshLocalWorldIdentity('wi_world_b')
    const otherClock = createInitialWorldClockState(otherIdentity.worldInstanceId)

    expect(() => createFreshEmployeePlayerEconomy(fixture.identity, otherClock)).toThrow(
      'World Identity and World Clock must belong to the same World Instance',
    )
    const work = performBasicDeliveryWork(fixture.state, otherClock, 'cross-world')
    expect(work).toMatchObject({ performed: false, reason: 'invalid-world' })
    expect(work.state).toEqual(fixture.state)
  })
})
