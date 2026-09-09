import { describe, expect, it } from 'vitest'
import {
  PROTOTYPE_PLAYER_ECONOMY_POLICY,
  createFreshEmployeePlayerEconomy,
  performBasicDeliveryWork,
  type PlayerEconomyState,
} from '../src/economy/playerEconomy'
import {
  completePracticalTraining,
  completeTheory,
  earnCapability,
} from '../src/capabilities/capabilityEngine'
import { createStarterCapabilityEvidence } from '../src/capabilities/capabilityModel'
import {
  createEconomyBackedCapabilityPolicy,
  createPlayerEconomyCapabilityPort,
  evaluateBicycleCourierWorkAccess,
  evaluateWalkingCourierWorkAccess,
} from '../src/capabilities/playerEconomyWorkAccess'
import { createInitialWorldClockState } from '../src/systems/worldClockSystem'
import { createFreshLocalWorldIdentity } from '../src/systems/worldIdentitySystem'

const freshFixture = (worldInstanceId = 'wi_capability_work_access') => {
  const identity = createFreshLocalWorldIdentity(worldInstanceId)
  const clock = createInitialWorldClockState(identity.worldInstanceId)
  const state = createFreshEmployeePlayerEconomy(identity, clock)
  return { clock, state }
}

const openShift = {
  isActivityAvailableDuringCurrentShift: () => true,
} as const

const bicycleQualifiedEvidence = () => {
  let evidence = createStarterCapabilityEvidence()
  evidence = completeTheory(evidence, 'bicycle-road-theory')
  evidence = completePracticalTraining(evidence, 'bicycle-handling-practical')
  const earned = earnCapability(evidence, 'BicycleOperation')
  if (!earned.earned) throw new Error('Bicycle Operation should be earnable after theory and practice')
  return earned.state
}

const performWork = (
  state: PlayerEconomyState,
  clock: ReturnType<typeof createInitialWorldClockState>,
  activityRef: string,
): PlayerEconomyState => {
  const result = performBasicDeliveryWork(state, clock, activityRef)
  if (!result.performed) throw new Error(`Expected productive work: ${result.reason}`)
  return result.state
}

describe('DT-06 Player Economy work-access integration', () => {
  it('makes the real fresh LightDeliveryEmployee eligible for starter walking work without duplicated runtime facts', () => {
    const { state } = freshFixture()

    expect(evaluateWalkingCourierWorkAccess(
      createStarterCapabilityEvidence(),
      state,
      openShift,
    )).toEqual({ eligible: true, blockers: [] })
  })

  it('reads employment, Personal Money and Work Capacity through a mutation-free economy port', () => {
    const { state } = freshFixture('wi_capability_port')
    const before = structuredClone(state)
    const port = createPlayerEconomyCapabilityPort(state)

    expect(port.isEmployee()).toBe(true)
    expect(port.hasWorkCapacity(PROTOTYPE_PLAYER_ECONOMY_POLICY.starterDeliveryCapacityCost)).toBe(true)
    expect(port.hasPersonalFunds(0)).toBe(true)
    expect(port.hasPersonalFunds(1)).toBe(false)
    expect(state).toEqual(before)
  })

  it('uses the authoritative Player Economy delivery-cost scale instead of the old 1/2 prototype scale', () => {
    const policy = createEconomyBackedCapabilityPolicy()

    expect(policy.starterWalkingWorkCapacityUnits)
      .toBe(PROTOTYPE_PLAYER_ECONOMY_POLICY.starterDeliveryCapacityCost)
    expect(policy.bicycleWorkCapacityUnits)
      .toBe(PROTOTYPE_PLAYER_ECONOMY_POLICY.starterDeliveryCapacityCost)
    expect(policy.starterWalkingWorkCapacityUnits).toBe(100)
  })

  it('blocks starter work immediately when real productive work exhausts Player Economy Work Capacity', () => {
    const fixture = freshFixture('wi_capability_capacity')
    let state = fixture.state

    for (let index = 0; index < 9; index += 1) {
      state = performWork(state, fixture.clock, `delivery-${index}`)
    }

    expect(state.workCapacity.current).toBe(PROTOTYPE_PLAYER_ECONOMY_POLICY.starterDeliveryCapacityCost)
    expect(evaluateWalkingCourierWorkAccess(
      createStarterCapabilityEvidence(),
      state,
      openShift,
    )).toEqual({ eligible: true, blockers: [] })

    state = performWork(state, fixture.clock, 'delivery-final')
    expect(state.workCapacity.current).toBe(0)
    expect(evaluateWalkingCourierWorkAccess(
      createStarterCapabilityEvidence(),
      state,
      openShift,
    )).toEqual({
      eligible: false,
      blockers: [{ code: 'insufficient-work-capacity', message: 'Insufficient Work Capacity.' }],
    })
  })

  it('keeps bicycle work locked behind real bicycle access facts after Bicycle Operation is earned', () => {
    const { state } = freshFixture('wi_bicycle_access')
    const evidence = bicycleQualifiedEvidence()

    expect(evaluateBicycleCourierWorkAccess(evidence, state, openShift).blockers).toEqual([
      { code: 'employer-authorization-missing', message: 'Employer authorization missing: Bicycle delivery authorization.' },
      { code: 'wrong-equipment', message: 'Wrong or unavailable equipment: Basic bicycle.' },
      { code: 'vehicle-unavailable', message: 'Required vehicle is not owned or available: Bicycle.' },
      { code: 'cargo-capability-insufficient', message: 'Insufficient cargo capability: Light-parcel handling.' },
    ])

    expect(evaluateBicycleCourierWorkAccess(evidence, state, {
      ...openShift,
      employerPermissionIds: ['bicycle-light-delivery'],
      availableEquipmentIds: ['basic-bicycle'],
      availableVehicleClasses: ['Bicycle'],
      cargoCapabilityIds: ['light-parcel'],
    })).toEqual({ eligible: true, blockers: [] })
  })

  it('does not convert a profession or capability into employment authorization', () => {
    const { state } = freshFixture('wi_no_employer')
    const unemployed: PlayerEconomyState = { ...state, employment: null }

    const result = evaluateWalkingCourierWorkAccess(
      createStarterCapabilityEvidence(),
      unemployed,
      openShift,
    )

    expect(result.eligible).toBe(false)
    expect(result.blockers).toContainEqual({
      code: 'employment-required',
      message: 'Active employment is required for this activity.',
    })
    expect(result.blockers).toContainEqual({
      code: 'employer-authorization-missing',
      message: 'Employer authorization missing: Light delivery authorization.',
    })
  })
})
