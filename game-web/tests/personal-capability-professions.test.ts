import { describe, expect, it } from 'vitest'
import type { PersonalCapabilityId } from '../src/types/game'
import {
  CAPABILITY_DEFINITIONS,
  PROTOTYPE_CAPABILITY_POLICY,
  createWorkActivityDefinitions,
} from '../src/capabilities/capabilityCatalog'
import {
  awardQualification,
  completePracticalTraining,
  completeTheory,
  earnCapability,
  evaluateCapabilityAcquisition,
  evaluateWorkActivity,
  recordSupervisedExperience,
  validateCapabilityConfiguration,
  validateCapabilityPolicy,
} from '../src/capabilities/capabilityEngine'
import {
  capabilityEvidenceFromPersonalProgression,
  createStarterCapabilityEvidence,
  type CapabilityEconomyPort,
  type CapabilityRuntimeContext,
} from '../src/capabilities/capabilityModel'
import {
  changeProfession,
  createStarterCareerState,
} from '../src/progression/professions'

const economy = (
  employee = true,
  workCapacity = 100,
  personalFundsMinor = 0,
): CapabilityEconomyPort => ({
  isEmployee: () => employee,
  hasWorkCapacity: requiredUnits => workCapacity >= requiredUnits,
  hasPersonalFunds: requiredMinor => personalFundsMinor >= requiredMinor,
})

const starterContext = (workCapacity = 100): CapabilityRuntimeContext => ({
  economy: economy(true, workCapacity),
  availableEquipmentIds: ['smartphone'],
  cargoCapabilityIds: ['light-document'],
  employerPermissionIds: ['light-delivery'],
  isActivityAvailableDuringCurrentShift: () => true,
})

const bicycleQualifiedState = () => {
  let state = createStarterCapabilityEvidence()
  state = completeTheory(state, 'bicycle-road-theory')
  state = completePracticalTraining(state, 'bicycle-handling-practical')
  const result = earnCapability(state, 'BicycleOperation')
  if (!result.earned) throw new Error('Bicycle Operation should be earnable after training')
  return result.state
}

describe('#437/#359 personal capability and profession domain', () => {
  it('validates the governed capability graph, work activities and balancing policy', () => {
    expect(validateCapabilityPolicy(PROTOTYPE_CAPABILITY_POLICY)).toEqual({ valid: true, errors: [] })
    expect(validateCapabilityConfiguration()).toEqual({ valid: true, errors: [] })
  })

  it('does not use arbitrary player level or progression points as the new capability gate', () => {
    const encoded = JSON.stringify(CAPABILITY_DEFINITIONS)
    expect(encoded).not.toContain('minimumProgressionPoints')
    expect(encoded).not.toContain('playerLevel')
    expect(CAPABILITY_DEFINITIONS.flatMap(definition => definition.acquisitionRequirements).map(requirement => requirement.kind))
      .not.toContain('level')
  })

  it('evaluates the same capability state deterministically', () => {
    const state = createStarterCapabilityEvidence()
    expect(evaluateCapabilityAcquisition(state, 'BicycleOperation'))
      .toEqual(evaluateCapabilityAcquisition(state, 'BicycleOperation'))
  })

  it('makes canonical starter walking/light-document work eligible through explicit starter facts', () => {
    const evaluation = evaluateWorkActivity(
      createStarterCapabilityEvidence(),
      'walking-light-document-delivery',
      starterContext(),
    )
    expect(evaluation).toEqual({ eligible: true, blockers: [] })
  })

  it('keeps bicycle theory and practical training as separate evidence before capability is earned', () => {
    let state = createStarterCapabilityEvidence()
    expect(evaluateCapabilityAcquisition(state, 'BicycleOperation').blockers).toEqual([
      { code: 'training-required', message: 'Training required: Bicycle road theory.' },
      { code: 'training-required', message: 'Training required: Bicycle handling practice.' },
    ])

    state = completeTheory(state, 'bicycle-road-theory')
    expect(evaluateCapabilityAcquisition(state, 'BicycleOperation').blockers).toEqual([
      { code: 'training-required', message: 'Training required: Bicycle handling practice.' },
    ])

    state = completePracticalTraining(state, 'bicycle-handling-practical')
    expect(evaluateCapabilityAcquisition(state, 'BicycleOperation')).toEqual({ eligible: true, blockers: [] })
  })

  it('requires bicycle capability, compatible equipment/vehicle and cargo capability for bicycle work', () => {
    const state = bicycleQualifiedState()
    const blocked = evaluateWorkActivity(state, 'bicycle-light-parcel-delivery', {
      economy: economy(),
      employerPermissionIds: ['bicycle-light-delivery'],
      isActivityAvailableDuringCurrentShift: () => true,
    })
    expect(blocked.blockers).toEqual([
      { code: 'wrong-equipment', message: 'Wrong or unavailable equipment: Basic bicycle.' },
      { code: 'vehicle-unavailable', message: 'Required vehicle is not owned or available: Bicycle.' },
      { code: 'cargo-capability-insufficient', message: 'Insufficient cargo capability: Light-parcel handling.' },
    ])

    const eligible = evaluateWorkActivity(state, 'bicycle-light-parcel-delivery', {
      economy: economy(),
      employerPermissionIds: ['bicycle-light-delivery'],
      availableEquipmentIds: ['basic-bicycle'],
      availableVehicleClasses: ['Bicycle'],
      cargoCapabilityIds: ['light-parcel'],
      isActivityAvailableDuringCurrentShift: () => true,
    })
    expect(eligible).toEqual({ eligible: true, blockers: [] })
  })

  it('returns exact player-readable employer, Work Capacity and shift blockers without exposing raw IDs', () => {
    const blocked = evaluateWorkActivity(
      createStarterCapabilityEvidence(),
      'walking-light-document-delivery',
      {
        economy: economy(true, 0),
        availableEquipmentIds: ['smartphone'],
        cargoCapabilityIds: ['light-document'],
        isActivityAvailableDuringCurrentShift: () => false,
      },
    )
    expect(blocked.blockers).toEqual([
      { code: 'employer-authorization-missing', message: 'Employer authorization missing: Light delivery authorization.' },
      { code: 'insufficient-work-capacity', message: 'Insufficient Work Capacity.' },
      { code: 'activity-unavailable-current-shift', message: 'Activity unavailable during the current shift.' },
    ])
    expect(blocked.blockers.map(item => item.message).join(' ')).not.toContain('light-delivery')
  })

  it('supports qualification, facility and supervised-experience requirements as distinct reusable dimensions', () => {
    let state = bicycleQualifiedState()
    state = completeTheory(state, 'bicycle-maintenance-theory')
    state = completePracticalTraining(state, 'bicycle-maintenance-practical')
    let maintenance = earnCapability(state, 'BicycleMaintenance')
    if (!maintenance.earned) throw new Error('Bicycle Maintenance should be earnable')
    state = maintenance.state
    state = completePracticalTraining(state, 'technical-maintenance-practical')
    const blockedMaintenance = evaluateCapabilityAcquisition(state, 'VehicleMaintenance')
    expect(blockedMaintenance.blockers).toEqual([
      { code: 'facility-unavailable', message: 'Company facility unavailable: Maintenance workshop.' },
      { code: 'qualification-missing', message: 'Qualification missing: Technical maintenance qualification.' },
    ])

    state = awardQualification(state, 'technical-maintenance-qualification')
    expect(evaluateCapabilityAcquisition(state, 'VehicleMaintenance', {
      availableInfrastructureIds: ['maintenance-workshop'],
    })).toEqual({ eligible: true, blockers: [] })

    const vanReady = {
      ...state,
      learnedCapabilityIds: [...state.learnedCapabilityIds, 'CarOperation' as const],
      practicalTrainingIds: [...state.practicalTrainingIds, 'van-cargo-practical'],
      qualificationIds: [...state.qualificationIds, 'delivery-van-qualification'],
    }
    expect(evaluateCapabilityAcquisition(vanReady, 'DeliveryVanOperation').blockers).toEqual([
      { code: 'training-required', message: 'Supervised experience required: Supervised road-delivery experience.' },
    ])
    expect(evaluateCapabilityAcquisition(
      recordSupervisedExperience(vanReady, 'road-delivery-supervised', 1),
      'DeliveryVanOperation',
    )).toEqual({ eligible: true, blockers: [] })
  })

  it('preserves legacy learned capability history without treating old progression points as a new prerequisite', () => {
    const migrated = capabilityEvidenceFromPersonalProgression({
      learnedCapabilityIds: ['DeliveryAppLiteracy', 'WalkingCourierFundamentals', 'BicycleOperation'],
    })
    expect(migrated.learnedCapabilityIds).toEqual([
      'DeliveryAppLiteracy',
      'WalkingCourierFundamentals',
      'BicycleOperation',
    ])
    expect(evaluateCapabilityAcquisition(migrated, 'BicycleOperation')).toEqual({ eligible: true, blockers: [] })
  })

  it('changing profession preserves career history and does not grant or delete earned capabilities', () => {
    const capabilityState = bicycleQualifiedState()
    const beforeCapabilities = [...capabilityState.learnedCapabilityIds]
    let career = createStarterCareerState()

    const bicycle = changeProfession(career, 'BicycleCourier', 1)
    expect(bicycle.changed).toBe(true)
    if (!bicycle.changed) throw new Error('Bicycle career change should succeed')
    career = bicycle.state
    const dispatch = changeProfession(career, 'DispatchOperator', 2)
    expect(dispatch.changed).toBe(true)
    if (!dispatch.changed) throw new Error('Dispatch career change should succeed')

    expect(dispatch.state.history).toEqual([
      { professionId: 'WalkingCourier', changeOrdinal: 0 },
      { professionId: 'BicycleCourier', changeOrdinal: 1 },
      { professionId: 'DispatchOperator', changeOrdinal: 2 },
    ])
    expect(capabilityState.learnedCapabilityIds).toEqual(beforeCapabilities)
    expect(capabilityState.learnedCapabilityIds).toContain('BicycleOperation')
    expect(capabilityState.learnedCapabilityIds).not.toContain('DispatchOperations')
  })

  it('fails safely for unknown capability, activity and profession identifiers', () => {
    expect(evaluateCapabilityAcquisition(createStarterCapabilityEvidence(), 'not-a-capability')).toEqual({
      eligible: false,
      blockers: [{ code: 'unknown-capability', message: 'This capability is not available.' }],
    })
    expect(evaluateWorkActivity(createStarterCapabilityEvidence(), 'not-an-activity', starterContext())).toEqual({
      eligible: false,
      blockers: [{ code: 'unknown-activity', message: 'This work activity is not available.' }],
    })
    expect(changeProfession(createStarterCareerState(), 'not-a-profession', 1)).toMatchObject({
      changed: false,
      reason: 'unknown-profession',
    })
  })

  it('rejects circular prerequisite graphs and invalid balancing configuration', () => {
    const first = CAPABILITY_DEFINITIONS.find(item => item.id === 'DeliveryAppLiteracy')
    const second = CAPABILITY_DEFINITIONS.find(item => item.id === 'WalkingCourierFundamentals')
    if (!first || !second) throw new Error('Expected foundation definitions')
    const circular = [
      {
        ...first,
        acquisitionRequirements: [
          { kind: 'capability', capabilityId: 'WalkingCourierFundamentals', label: 'Walking Courier Fundamentals' },
        ],
      },
      {
        ...second,
        acquisitionRequirements: [
          { kind: 'capability', capabilityId: 'DeliveryAppLiteracy', label: 'Delivery App Literacy' },
        ],
      },
    ] as const
    expect(validateCapabilityConfiguration(circular, [])).toEqual({
      valid: false,
      errors: ['Capability prerequisite cycle detected: DeliveryAppLiteracy -> WalkingCourierFundamentals -> DeliveryAppLiteracy'],
    })
    expect(validateCapabilityPolicy({
      ...PROTOTYPE_CAPABILITY_POLICY,
      bicycleWorkCapacityUnits: 0,
    })).toEqual({
      valid: false,
      errors: ['Capability policy has invalid bicycle Work Capacity'],
    })
  })

  it('validates every capability reference in activity configuration', () => {
    const activities = createWorkActivityDefinitions().map(activity => ({
      ...activity,
      requirements: [...activity.requirements],
    }))
    activities[0]?.requirements.push({
      kind: 'capability',
      capabilityId: 'not-a-capability' as PersonalCapabilityId,
      label: 'Invalid capability',
    })
    const result = validateCapabilityConfiguration(CAPABILITY_DEFINITIONS, activities)
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Activity Walking / light-document delivery references unknown capability not-a-capability')
  })
})
