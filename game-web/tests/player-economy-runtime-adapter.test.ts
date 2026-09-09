import { describe, expect, it } from 'vitest'
import {
  createFreshLocalWorldIdentity,
  createInitialWorldIdentityState,
} from '../src/systems/worldIdentitySystem'
import {
  advanceWorldClock,
  createInitialWorldClockState,
} from '../src/systems/worldClockSystem'
import { createInitialCompanyState, createInitialWorldState } from '../src/state/gameState'
import { createOrderForSequence } from '../src/systems/orderGeneration'
import { performUrbanInteraction, type UrbanInteractionResult } from '../src/systems/urbanInteractions'
import { findWorldRoutePoint } from '../src/world/worldLayout'
import type { CompanyState, OrderState, WorldState } from '../src/types/game'
import {
  PROTOTYPE_PLAYER_ECONOMY_POLICY,
  createFreshEmployeePlayerEconomy,
  createLegacyCompatibilityPlayerEconomy,
  type PlayerEconomyState,
} from '../src/economy/playerEconomy'
import {
  readPlayerEconomyWorkPort,
  recordSettledUrbanDeliveryWork,
  settleRuntimeEmployeeShiftWage,
} from '../src/economy/playerEconomyRuntimeAdapter'

const freshEconomyFixture = (worldInstanceId = 'wi_runtime_economy') => {
  const identity = createFreshLocalWorldIdentity(worldInstanceId)
  const clock = createInitialWorldClockState(identity.worldInstanceId)
  const state = createFreshEmployeePlayerEconomy(identity, clock)
  return { identity, clock, state }
}

const completeRealUrbanDelivery = (
  sequence: number,
  company: CompanyState = createInitialCompanyState(),
): {
  sourceOrder: OrderState
  interaction: UrbanInteractionResult
} => {
  const world: WorldState = createInitialWorldState()
  world.urban = { merchantOnboarded: true, activeTransport: 'walking' }
  world.activeOrder = {
    ...createOrderForSequence(sequence),
    status: 'PickedUp',
    economySettled: false,
  }
  world.player.currentOrder = world.activeOrder.orderId
  world.player.carryingPackage = true
  const destination = findWorldRoutePoint(world.activeOrder.destination)
  if (!destination) throw new Error(`Missing destination ${world.activeOrder.destination}`)
  world.player.x = destination.x
  world.player.y = destination.y

  const sourceOrder = { ...world.activeOrder }
  const interaction = performUrbanInteraction(world, company)
  expect(interaction.settled).toBe(true)
  expect(interaction.world.player.currentOrder).toBe('')
  expect(interaction.world.player.carryingPackage).toBe(false)
  expect(interaction.world.activeOrder.orderId).not.toBe(sourceOrder.orderId)
  return { sourceOrder, interaction }
}

const recordDelivery = (
  state: PlayerEconomyState,
  clock: ReturnType<typeof createInitialWorldClockState>,
  sequence: number,
): PlayerEconomyState => {
  const realDelivery = completeRealUrbanDelivery(sequence)
  const result = recordSettledUrbanDeliveryWork(
    state,
    clock,
    realDelivery.sourceOrder,
    realDelivery.interaction,
  )
  expect(result.applied).toBe(true)
  if (!result.applied) throw new Error(`Expected productive work: ${result.reason}`)
  return result.state
}

describe('Player Economy runtime adapter', () => {
  it('turns a real settled urban delivery into productive work and consumes Work Capacity once', () => {
    const fixture = freshEconomyFixture()
    const realDelivery = completeRealUrbanDelivery(1)
    const beforeCapacity = fixture.state.workCapacity.current

    const result = recordSettledUrbanDeliveryWork(
      fixture.state,
      fixture.clock,
      realDelivery.sourceOrder,
      realDelivery.interaction,
    )

    expect(result.applied).toBe(true)
    if (!result.applied) throw new Error(`Expected productive work: ${result.reason}`)
    expect(result.orderId).toBe(realDelivery.sourceOrder.orderId)
    expect(result.productiveMinutes).toBe(PROTOTYPE_PLAYER_ECONOMY_POLICY.starterDeliveryProductiveMinutes)
    expect(result.capacityConsumed).toBe(PROTOTYPE_PLAYER_ECONOMY_POLICY.starterDeliveryCapacityCost)
    expect(result.state.workCapacity.current).toBe(
      beforeCapacity - PROTOTYPE_PLAYER_ECONOMY_POLICY.starterDeliveryCapacityCost,
    )
    expect(result.state.personalMoney.balanceMinor).toBe(0)
    expect(result.state.employerCompanyMoney?.balanceMinor).toBe(
      PROTOTYPE_PLAYER_ECONOMY_POLICY.starterEmployerOpeningMoneyMinor,
    )
  })

  it('prevents the same real delivery from creating productive work again after the clock moves', () => {
    const fixture = freshEconomyFixture('wi_runtime_replay')
    const realDelivery = completeRealUrbanDelivery(1)
    const first = recordSettledUrbanDeliveryWork(
      fixture.state,
      fixture.clock,
      realDelivery.sourceOrder,
      realDelivery.interaction,
    )
    expect(first.applied).toBe(true)
    if (!first.applied) throw new Error(`Expected productive work: ${first.reason}`)

    const laterClock = advanceWorldClock(fixture.clock, 8 * 60).clock
    const replay = recordSettledUrbanDeliveryWork(
      first.state,
      laterClock,
      realDelivery.sourceOrder,
      realDelivery.interaction,
    )

    expect(replay).toMatchObject({ applied: false, reason: 'duplicate-delivery' })
    expect(replay.state.workCapacity).toEqual(first.state.workCapacity)
    expect(replay.state.personalMoney).toEqual(first.state.personalMoney)
    expect(replay.state.employerCompanyMoney).toEqual(first.state.employerCompanyMoney)
  })

  it('pays a completed shift from employer treasury to Personal Money after two real deliveries', () => {
    const fixture = freshEconomyFixture('wi_runtime_wage')
    let state = recordDelivery(fixture.state, fixture.clock, 1)
    state = recordDelivery(state, fixture.clock, 2)

    const employerBefore = state.employerCompanyMoney?.balanceMinor ?? 0
    const personalBefore = state.personalMoney.balanceMinor
    const combinedBefore = employerBefore + personalBefore
    const boundaryClock = advanceWorldClock(fixture.clock, 6 * 60).clock

    const wage = settleRuntimeEmployeeShiftWage(state, boundaryClock)
    expect(wage.settled).toBe(true)
    if (!wage.settled) throw new Error(`Expected runtime wage: ${wage.reason}`)

    expect(wage.state.personalMoney.balanceMinor - personalBefore).toBe(
      PROTOTYPE_PLAYER_ECONOMY_POLICY.starterShiftWageMinor,
    )
    expect(employerBefore - (wage.state.employerCompanyMoney?.balanceMinor ?? 0)).toBe(
      PROTOTYPE_PLAYER_ECONOMY_POLICY.starterShiftWageMinor,
    )
    expect(
      wage.state.personalMoney.balanceMinor +
      (wage.state.employerCompanyMoney?.balanceMinor ?? 0),
    ).toBe(combinedBefore)

    const duplicateWage = settleRuntimeEmployeeShiftWage(wage.state, boundaryClock)
    expect(duplicateWage).toMatchObject({ settled: false, reason: 'already-settled' })
  })

  it('does not count unsuccessful or malformed runtime transitions as productive work', () => {
    const fixture = freshEconomyFixture('wi_runtime_invalid')
    const realDelivery = completeRealUrbanDelivery(1)
    const unsuccessful = {
      ...realDelivery.interaction,
      settled: false,
    }

    const notSettled = recordSettledUrbanDeliveryWork(
      fixture.state,
      fixture.clock,
      realDelivery.sourceOrder,
      unsuccessful,
    )
    expect(notSettled).toMatchObject({ applied: false, reason: 'runtime-not-settled' })
    expect(notSettled.state).toEqual(fixture.state)

    const malformed = recordSettledUrbanDeliveryWork(
      fixture.state,
      fixture.clock,
      { ...realDelivery.sourceOrder, status: 'Available' },
      realDelivery.interaction,
    )
    expect(malformed).toMatchObject({ applied: false, reason: 'invalid-runtime-transition' })
    expect(malformed.state).toEqual(fixture.state)
  })

  it('keeps legacy mode outside the employee runtime bridge', () => {
    const identity = createInitialWorldIdentityState()
    const clock = createInitialWorldClockState(identity.worldInstanceId)
    const legacyMoney = createInitialCompanyState().money
    const legacy = createLegacyCompatibilityPlayerEconomy(identity, clock, legacyMoney)
    const realDelivery = completeRealUrbanDelivery(1)

    const result = recordSettledUrbanDeliveryWork(
      legacy.state,
      clock,
      realDelivery.sourceOrder,
      realDelivery.interaction,
    )

    expect(result).toMatchObject({ applied: false, reason: 'legacy-mode' })
    expect(result.state.personalMoney.balanceMinor).toBe(0)
    expect(legacy.legacyCompanyMoneyMinor).toBe(legacyMoney)
  })

  it('exposes a read-only work port without duplicating capability or Save authority', () => {
    const fixture = freshEconomyFixture('wi_runtime_port')
    const before = structuredClone(fixture.state)

    const port = readPlayerEconomyWorkPort(fixture.state)

    expect(port).toEqual({
      worldInstanceId: fixture.identity.worldInstanceId,
      heroActorId: fixture.identity.heroActorId,
      mode: 'FreshEmployee',
      employerCompanyId: PROTOTYPE_PLAYER_ECONOMY_POLICY.starterEmployerCompanyId,
      transportMode: 'Walking',
      personalMoneyBalanceMinor: 0,
      employerTreasuryBalanceMinor: PROTOTYPE_PLAYER_ECONOMY_POLICY.starterEmployerOpeningMoneyMinor,
      workCapacityCurrent: PROTOTYPE_PLAYER_ECONOMY_POLICY.maxWorkCapacity,
      workCapacityMax: PROTOTYPE_PLAYER_ECONOMY_POLICY.maxWorkCapacity,
      canPerformBasicDelivery: true,
    })
    expect(fixture.state).toEqual(before)
  })
})
