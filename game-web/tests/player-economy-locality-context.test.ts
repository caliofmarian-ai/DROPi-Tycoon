import { describe, expect, it } from 'vitest'
import { createFreshLocalWorldIdentity } from '../src/systems/worldIdentitySystem'
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
  settleBasicLivingCostsThroughClock,
  type PlayerEconomyState,
} from '../src/economy/playerEconomy'
import {
  PLAYER_ECONOMY_LOCALITY_CONTEXT_VERSION,
  evaluatePlayerEconomyLocalEmployerAccess,
  projectPlayerEconomyLocalityContinuity,
  recordLocalityScopedSettledDeliveryWork,
  settleEmployeeShiftWageAcrossLocalityContext,
  type PlayerEconomyLocalEmployerAssignment,
  type PlayerEconomyLocalityContext,
  type PlayerEconomyLocalWorkSource,
} from '../src/economy/playerEconomyLocalityContext'

const ROMANIA_COUNTRY_ID = '642'
const BRAILA_LOCALITY_ID = 'dropi:locality:geonames:683902'
const CLUJ_LOCALITY_ID = 'dropi:locality:geonames:681290'

const freshFixture = (worldInstanceId = 'wi_locality_643') => {
  const identity = createFreshLocalWorldIdentity(worldInstanceId)
  const clock = createInitialWorldClockState(identity.worldInstanceId)
  const state = createFreshEmployeePlayerEconomy(identity, clock)
  return { identity, clock, state }
}

const localityContext = (
  worldInstanceId: string,
  localityId: string,
): PlayerEconomyLocalityContext => ({
  version: PLAYER_ECONOMY_LOCALITY_CONTEXT_VERSION,
  worldInstanceId,
  currentCountryId: ROMANIA_COUNTRY_ID,
  currentLocalityId: localityId,
  authorityRef: `test-locality-authority:${localityId}`,
})

const localAssignment = (
  state: PlayerEconomyState,
  localityId: string,
  suffix: string,
): PlayerEconomyLocalEmployerAssignment => {
  const employerCompanyId = state.employment?.employerCompanyId
  if (!employerCompanyId) throw new Error('Fresh employee assignment requires an employer')
  return {
    worldInstanceId: state.worldInstanceId,
    localityId,
    employerCompanyId,
    employerLocationRef: `test-employer-location:${localityId}:${suffix}`,
    assignmentRef: `test-employer-assignment:${localityId}:${suffix}`,
  }
}

const workSourceFor = (
  assignment: PlayerEconomyLocalEmployerAssignment,
  orderId: string,
): PlayerEconomyLocalWorkSource => ({
  worldInstanceId: assignment.worldInstanceId,
  localityId: assignment.localityId,
  employerCompanyId: assignment.employerCompanyId,
  employerLocationRef: assignment.employerLocationRef,
  orderId,
  workSourceRef: `test-work-source:${assignment.localityId}:${orderId}`,
})

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

const recordLocalDelivery = (
  state: PlayerEconomyState,
  clock: ReturnType<typeof createInitialWorldClockState>,
  localityId: string,
  sequence: number,
): PlayerEconomyState => {
  const context = localityContext(state.worldInstanceId, localityId)
  const assignment = localAssignment(state, localityId, `sequence-${sequence}`)
  const delivery = completeRealUrbanDelivery(sequence)
  const result = recordLocalityScopedSettledDeliveryWork(
    state,
    clock,
    context,
    assignment,
    workSourceFor(assignment, delivery.sourceOrder.orderId),
    delivery.sourceOrder,
    delivery.interaction,
  )
  expect(result.applied).toBe(true)
  if (!result.applied) throw new Error(`Expected local productive work: ${result.reason}`)
  return result.state
}

describe('Player Economy locality-safe integration #643', () => {
  it('preserves Personal Money, Work Capacity, work history and arrears when current locality changes', () => {
    const fixture = freshFixture('wi_locality_continuity')
    let state = recordLocalDelivery(fixture.state, fixture.clock, BRAILA_LOCALITY_ID, 1)
    const dayOneClock = advanceWorldClock(fixture.clock, 24 * 60).clock
    const living = settleBasicLivingCostsThroughClock(state, fixture.clock, dayOneClock)
    expect(living.settled).toBe(true)
    if (!living.settled) throw new Error(`Expected living settlement: ${living.reason}`)
    state = living.state

    const before = structuredClone(state)
    const braila = projectPlayerEconomyLocalityContinuity(
      state,
      localityContext(state.worldInstanceId, BRAILA_LOCALITY_ID),
      localAssignment(state, BRAILA_LOCALITY_ID, 'braila'),
    )
    const cluj = projectPlayerEconomyLocalityContinuity(
      state,
      localityContext(state.worldInstanceId, CLUJ_LOCALITY_ID),
      localAssignment(state, CLUJ_LOCALITY_ID, 'cluj'),
    )

    expect(braila.ok).toBe(true)
    expect(cluj.ok).toBe(true)
    if (!braila.ok || !cluj.ok) throw new Error('Expected valid locality projections')

    expect(cluj.projection.currentLocalityId).toBe(CLUJ_LOCALITY_ID)
    expect(cluj.projection.personalMoney).toEqual(braila.projection.personalMoney)
    expect(cluj.projection.workCapacity).toEqual(braila.projection.workCapacity)
    expect(cluj.projection.living).toEqual(braila.projection.living)
    expect(cluj.projection.living.arrearsMinor).toBe(
      PROTOTYPE_PLAYER_ECONOMY_POLICY.basicLivingCostMinor,
    )
    expect(state).toEqual(before)
  })

  it('does not expose an old-locality employer treasury after the player changes locality', () => {
    const fixture = freshFixture('wi_stale_local_employer')
    const clujContext = localityContext(fixture.state.worldInstanceId, CLUJ_LOCALITY_ID)
    const staleBrailaAssignment = localAssignment(fixture.state, BRAILA_LOCALITY_ID, 'stale')
    const before = structuredClone(fixture.state)

    const access = evaluatePlayerEconomyLocalEmployerAccess(
      fixture.state,
      clujContext,
      staleBrailaAssignment,
    )
    const projection = projectPlayerEconomyLocalityContinuity(
      fixture.state,
      clujContext,
      staleBrailaAssignment,
    )

    expect(access).toMatchObject({ authorized: false, reason: 'locality-mismatch' })
    expect(projection.ok).toBe(true)
    if (!projection.ok) throw new Error('Expected valid projection')
    expect(projection.projection.employment.employerTreasuryBalanceMinor).toBeNull()
    expect(projection.projection.personalMoney.balanceMinor).toBe(0)
    expect(fixture.state).toEqual(before)
  })

  it('rejects another locality/company employer authority instead of importing it', () => {
    const fixture = freshFixture('wi_foreign_employer')
    const context = localityContext(fixture.state.worldInstanceId, CLUJ_LOCALITY_ID)
    const assignment: PlayerEconomyLocalEmployerAssignment = {
      worldInstanceId: fixture.state.worldInstanceId,
      localityId: CLUJ_LOCALITY_ID,
      employerCompanyId: 'company_other_locality_authority',
      employerLocationRef: 'test-employer-location:foreign',
      assignmentRef: 'test-employer-assignment:foreign',
    }

    const result = evaluatePlayerEconomyLocalEmployerAccess(fixture.state, context, assignment)
    expect(result).toMatchObject({ authorized: false, reason: 'employer-mismatch' })

    const projection = projectPlayerEconomyLocalityContinuity(fixture.state, context, assignment)
    expect(projection.ok).toBe(true)
    if (!projection.ok) throw new Error('Expected valid projection')
    expect(projection.projection.employment.employerTreasuryBalanceMinor).toBeNull()
    expect(projection.projection.employment.employerCompanyId).toBe(
      PROTOTYPE_PLAYER_ECONOMY_POLICY.starterEmployerCompanyId,
    )
  })

  it('requires a local work source to bind the exact settled order before consuming Work Capacity', () => {
    const fixture = freshFixture('wi_work_source_order')
    const context = localityContext(fixture.state.worldInstanceId, CLUJ_LOCALITY_ID)
    const assignment = localAssignment(fixture.state, CLUJ_LOCALITY_ID, 'order-binding')
    const delivery = completeRealUrbanDelivery(1)
    const before = structuredClone(fixture.state)
    const wrongOrderSource = workSourceFor(assignment, 'order:not-the-settled-order')

    const result = recordLocalityScopedSettledDeliveryWork(
      fixture.state,
      fixture.clock,
      context,
      assignment,
      wrongOrderSource,
      delivery.sourceOrder,
      delivery.interaction,
    )

    expect(result).toMatchObject({ applied: false, reason: 'work-source-order-mismatch' })
    expect(result.state).toEqual(before)
  })

  it('rejects stale-locality work provenance even when the current local employer assignment is valid', () => {
    const fixture = freshFixture('wi_stale_work_source')
    const context = localityContext(fixture.state.worldInstanceId, CLUJ_LOCALITY_ID)
    const clujAssignment = localAssignment(fixture.state, CLUJ_LOCALITY_ID, 'valid')
    const delivery = completeRealUrbanDelivery(1)
    const staleSource: PlayerEconomyLocalWorkSource = {
      ...workSourceFor(clujAssignment, delivery.sourceOrder.orderId),
      localityId: BRAILA_LOCALITY_ID,
    }
    const before = structuredClone(fixture.state)

    const result = recordLocalityScopedSettledDeliveryWork(
      fixture.state,
      fixture.clock,
      context,
      clujAssignment,
      staleSource,
      delivery.sourceOrder,
      delivery.interaction,
    )

    expect(result).toMatchObject({ applied: false, reason: 'work-source-locality-mismatch' })
    expect(result.state).toEqual(before)
  })

  it('records legitimate local work once and cannot mint it again by relabeling the locality', () => {
    const fixture = freshFixture('wi_cross_locality_replay')
    const delivery = completeRealUrbanDelivery(1)
    const clujContext = localityContext(fixture.state.worldInstanceId, CLUJ_LOCALITY_ID)
    const clujAssignment = localAssignment(fixture.state, CLUJ_LOCALITY_ID, 'cluj')
    const first = recordLocalityScopedSettledDeliveryWork(
      fixture.state,
      fixture.clock,
      clujContext,
      clujAssignment,
      workSourceFor(clujAssignment, delivery.sourceOrder.orderId),
      delivery.sourceOrder,
      delivery.interaction,
    )
    expect(first.applied).toBe(true)
    if (!first.applied) throw new Error(`Expected first local work: ${first.reason}`)

    const brailaContext = localityContext(first.state.worldInstanceId, BRAILA_LOCALITY_ID)
    const brailaAssignment = localAssignment(first.state, BRAILA_LOCALITY_ID, 'braila')
    const replay = recordLocalityScopedSettledDeliveryWork(
      first.state,
      fixture.clock,
      brailaContext,
      brailaAssignment,
      workSourceFor(brailaAssignment, delivery.sourceOrder.orderId),
      delivery.sourceOrder,
      delivery.interaction,
    )

    expect(replay).toMatchObject({ applied: false, reason: 'duplicate-delivery' })
    expect(replay.state.workCapacity).toEqual(first.state.workCapacity)
    expect(replay.state.personalMoney).toEqual(first.state.personalMoney)
    expect(replay.state.employerCompanyMoney).toEqual(first.state.employerCompanyMoney)
  })

  it('pays accrued wages exactly once after moving locality without re-keying or minting money', () => {
    const fixture = freshFixture('wi_wage_after_move')
    let state = recordLocalDelivery(fixture.state, fixture.clock, BRAILA_LOCALITY_ID, 1)
    state = recordLocalDelivery(state, fixture.clock, BRAILA_LOCALITY_ID, 2)

    const employerBefore = state.employerCompanyMoney?.balanceMinor ?? 0
    const personalBefore = state.personalMoney.balanceMinor
    const combinedBefore = employerBefore + personalBefore
    const boundaryClock = advanceWorldClock(fixture.clock, 6 * 60).clock
    const clujContext = localityContext(state.worldInstanceId, CLUJ_LOCALITY_ID)

    const wage = settleEmployeeShiftWageAcrossLocalityContext(state, boundaryClock, clujContext)
    expect(wage.settled).toBe(true)
    if (!wage.settled) throw new Error(`Expected wage after locality change: ${wage.reason}`)

    expect(wage.localityId).toBe(CLUJ_LOCALITY_ID)
    expect(wage.transactionId).toBe(`wage:${state.worldInstanceId}:${state.heroActorId}:0:0`)
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

    const replay = settleEmployeeShiftWageAcrossLocalityContext(
      wage.state,
      boundaryClock,
      localityContext(wage.state.worldInstanceId, BRAILA_LOCALITY_ID),
    )
    expect(replay).toMatchObject({ settled: false, reason: 'already-settled' })
  })

  it('fails closed for cross-world locality context without changing economy state', () => {
    const fixture = freshFixture('wi_locality_world_a')
    const otherContext = localityContext('wi_locality_world_b', CLUJ_LOCALITY_ID)
    const before = structuredClone(fixture.state)

    const projection = projectPlayerEconomyLocalityContinuity(fixture.state, otherContext)
    expect(projection).toEqual({ ok: false, reason: 'invalid-locality-context' })

    const wage = settleEmployeeShiftWageAcrossLocalityContext(
      fixture.state,
      fixture.clock,
      otherContext,
    )
    expect(wage).toMatchObject({ settled: false, reason: 'invalid-locality-context' })
    expect(wage.state).toEqual(before)
  })
})
