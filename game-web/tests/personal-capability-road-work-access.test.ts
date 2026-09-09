import { describe, expect, it } from 'vitest'
import {
  PROTOTYPE_PLAYER_ECONOMY_POLICY,
  createFreshEmployeePlayerEconomy,
} from '../src/economy/playerEconomy'
import { createInitialWorldClockState } from '../src/systems/worldClockSystem'
import { createFreshLocalWorldIdentity } from '../src/systems/worldIdentitySystem'
import {
  createStarterCapabilityEvidence,
  type CapabilityEvidenceState,
} from '../src/capabilities/capabilityModel'
import {
  createEconomyBackedWorkActivityDefinitions,
  evaluateCarCourierWorkAccess,
  evaluateDeliveryVanCourierWorkAccess,
  evaluateElectricScooterCourierWorkAccess,
  evaluateMotorcycleCourierWorkAccess,
  type PlayerWorkAccessFacts,
} from '../src/capabilities/playerEconomyWorkAccess'

const freshEconomy = (worldInstanceId: string) => {
  const identity = createFreshLocalWorldIdentity(worldInstanceId)
  const clock = createInitialWorldClockState(identity.worldInstanceId)
  return createFreshEmployeePlayerEconomy(identity, clock)
}

const starterCapabilities = () => createStarterCapabilityEvidence().learnedCapabilityIds

const scooterEvidence = (): CapabilityEvidenceState => ({
  ...createStarterCapabilityEvidence(),
  learnedCapabilityIds: [...starterCapabilities(), 'ElectricScooterOperation'],
  theoryIds: ['powered-two-wheel-theory'],
  practicalTrainingIds: ['powered-two-wheel-practical'],
  qualificationIds: ['powered-two-wheel-qualification'],
})

const motorcycleEvidence = (): CapabilityEvidenceState => ({
  ...createStarterCapabilityEvidence(),
  learnedCapabilityIds: [
    ...starterCapabilities(),
    'ElectricScooterOperation',
    'MotorcycleOperation',
  ],
  theoryIds: ['powered-two-wheel-theory'],
  practicalTrainingIds: ['powered-two-wheel-practical', 'motorcycle-practical'],
  qualificationIds: ['powered-two-wheel-qualification', 'motorcycle-qualification'],
})

const carEvidence = (): CapabilityEvidenceState => ({
  ...createStarterCapabilityEvidence(),
  learnedCapabilityIds: [...starterCapabilities(), 'CarOperation'],
  theoryIds: ['road-vehicle-theory'],
  practicalTrainingIds: ['car-operation-practical'],
  qualificationIds: ['car-operation-qualification'],
})

const deliveryVanEvidence = (): CapabilityEvidenceState => ({
  ...createStarterCapabilityEvidence(),
  learnedCapabilityIds: [
    ...starterCapabilities(),
    'CarOperation',
    'DeliveryVanOperation',
  ],
  theoryIds: ['road-vehicle-theory'],
  practicalTrainingIds: ['car-operation-practical', 'van-cargo-practical'],
  qualificationIds: ['car-operation-qualification', 'delivery-van-qualification'],
  supervisedExperienceById: { 'road-delivery-supervised': 1 },
})

const vehicleFacts = (
  vehicle: 'ElectricScooter' | 'Motorcycle' | 'Car' | 'DeliveryVan',
  permission: string,
): PlayerWorkAccessFacts => ({
  availableEquipmentIds: [vehicle],
  availableVehicleClasses: [vehicle],
  cargoCapabilityIds: ['light-parcel'],
  employerPermissionIds: [permission],
  isActivityAvailableDuringCurrentShift: () => true,
})

describe('DT-06 powered two-wheel and road work access', () => {
  it('publishes governed work-access definitions for scooter, motorcycle, car and delivery van', () => {
    expect(createEconomyBackedWorkActivityDefinitions().map(activity => activity.id)).toEqual([
      'walking-light-document-delivery',
      'bicycle-light-parcel-delivery',
      'electric-scooter-light-parcel-delivery',
      'motorcycle-light-parcel-delivery',
      'car-light-parcel-delivery',
      'delivery-van-light-parcel-delivery',
    ])
  })

  it('allows fully qualified powered two-wheel work only with explicit vehicle, cargo and employer authorization', () => {
    const economy = freshEconomy('wi_dt06_powered_allowed')

    expect(evaluateElectricScooterCourierWorkAccess(
      scooterEvidence(),
      economy,
      vehicleFacts('ElectricScooter', 'electric-scooter-light-delivery'),
    )).toEqual({ eligible: true, blockers: [] })

    expect(evaluateMotorcycleCourierWorkAccess(
      motorcycleEvidence(),
      economy,
      vehicleFacts('Motorcycle', 'motorcycle-light-delivery'),
    )).toEqual({ eligible: true, blockers: [] })
  })

  it('allows fully qualified car and delivery-van work when the owning runtime supplies all access facts', () => {
    const economy = freshEconomy('wi_dt06_road_allowed')

    expect(evaluateCarCourierWorkAccess(
      carEvidence(),
      economy,
      vehicleFacts('Car', 'car-light-delivery'),
    )).toEqual({ eligible: true, blockers: [] })

    expect(evaluateDeliveryVanCourierWorkAccess(
      deliveryVanEvidence(),
      economy,
      vehicleFacts('DeliveryVan', 'delivery-van-light-delivery'),
    )).toEqual({ eligible: true, blockers: [] })
  })

  it('blocks qualification-without-equipment instead of treating training as vehicle ownership', () => {
    const economy = freshEconomy('wi_dt06_qualification_without_equipment')
    const result = evaluateElectricScooterCourierWorkAccess(
      scooterEvidence(),
      economy,
      {
        cargoCapabilityIds: ['light-parcel'],
        employerPermissionIds: ['electric-scooter-light-delivery'],
        isActivityAvailableDuringCurrentShift: () => true,
      },
    )

    expect(result).toEqual({
      eligible: false,
      blockers: [
        { code: 'wrong-equipment', message: 'Wrong or unavailable equipment: Electric Scooter.' },
        { code: 'vehicle-unavailable', message: 'Required vehicle is not owned or available: Electric Scooter.' },
      ],
    })
  })

  it('blocks equipment-without-qualification even when a learned capability ID is present', () => {
    const economy = freshEconomy('wi_dt06_equipment_without_qualification')
    const inconsistentEvidence: CapabilityEvidenceState = {
      ...createStarterCapabilityEvidence(),
      learnedCapabilityIds: [...starterCapabilities(), 'ElectricScooterOperation'],
    }

    const result = evaluateElectricScooterCourierWorkAccess(
      inconsistentEvidence,
      economy,
      vehicleFacts('ElectricScooter', 'electric-scooter-light-delivery'),
    )

    expect(result).toEqual({
      eligible: false,
      blockers: [
        { code: 'training-required', message: 'Training required: Powered two-wheel theory.' },
        { code: 'training-required', message: 'Training required: Powered two-wheel practice.' },
        { code: 'qualification-missing', message: 'Qualification missing: Powered two-wheel qualification.' },
      ],
    })
  })

  it('does not manufacture advanced employer authorization from starter LightDeliveryEmployee status', () => {
    const economy = freshEconomy('wi_dt06_no_invented_authorization')
    const result = evaluateMotorcycleCourierWorkAccess(
      motorcycleEvidence(),
      economy,
      {
        availableEquipmentIds: ['Motorcycle'],
        availableVehicleClasses: ['Motorcycle'],
        cargoCapabilityIds: ['light-parcel'],
        isActivityAvailableDuringCurrentShift: () => true,
      },
    )

    expect(result.blockers).toEqual([
      { code: 'employer-authorization-missing', message: 'Employer authorization missing: Motorcycle delivery authorization.' },
    ])
  })

  it('requires the authoritative Player Economy Work Capacity and current shift for road work', () => {
    const economy = freshEconomy('wi_dt06_capacity_shift')
    const lowCapacity = {
      ...economy,
      workCapacity: {
        ...economy.workCapacity,
        current: PROTOTYPE_PLAYER_ECONOMY_POLICY.starterDeliveryCapacityCost - 1,
      },
    }

    const result = evaluateDeliveryVanCourierWorkAccess(
      deliveryVanEvidence(),
      lowCapacity,
      {
        ...vehicleFacts('DeliveryVan', 'delivery-van-light-delivery'),
        isActivityAvailableDuringCurrentShift: () => false,
      },
    )

    expect(result.blockers).toEqual([
      { code: 'insufficient-work-capacity', message: 'Insufficient Work Capacity.' },
      { code: 'activity-unavailable-current-shift', message: 'Activity unavailable during the current shift.' },
    ])
  })

  it('keeps car availability fail-closed until a real Car fact exists in the owning runtime', () => {
    const economy = freshEconomy('wi_dt06_car_fail_closed')
    const result = evaluateCarCourierWorkAccess(
      carEvidence(),
      economy,
      {
        cargoCapabilityIds: ['light-parcel'],
        employerPermissionIds: ['car-light-delivery'],
        isActivityAvailableDuringCurrentShift: () => true,
      },
    )

    expect(result.blockers).toEqual([
      { code: 'wrong-equipment', message: 'Wrong or unavailable equipment: Car.' },
      { code: 'vehicle-unavailable', message: 'Required vehicle is not owned or available: Car.' },
    ])
  })
})
