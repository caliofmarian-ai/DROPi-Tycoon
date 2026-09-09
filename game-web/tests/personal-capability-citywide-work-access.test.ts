import { describe, expect, it } from 'vitest'
import {
  createFreshEmployeePlayerEconomy,
  type PlayerEconomyState,
} from '../src/economy/playerEconomy'
import {
  completePracticalTraining,
  completeTheory,
  earnCapability,
} from '../src/capabilities/capabilityEngine'
import {
  createStarterCapabilityEvidence,
  type CapabilityEvidenceState,
} from '../src/capabilities/capabilityModel'
import {
  CITYWIDE_WORK_ACTIVITY_ROUTE_POLICY,
  createCitywideDeliveryWorkAccessAdapter,
} from '../src/capabilities/citywideDeliveryWorkAccess'
import type { PlayerWorkAccessFacts } from '../src/capabilities/playerEconomyWorkAccess'
import { createInitialWorldClockState } from '../src/systems/worldClockSystem'
import { createFreshLocalWorldIdentity } from '../src/systems/worldIdentitySystem'

const freshEconomy = (worldInstanceId: string): PlayerEconomyState => {
  const identity = createFreshLocalWorldIdentity(worldInstanceId)
  const clock = createInitialWorldClockState(identity.worldInstanceId)
  return createFreshEmployeePlayerEconomy(identity, clock)
}

const openShift: PlayerWorkAccessFacts = {
  isActivityAvailableDuringCurrentShift: () => true,
}

const bicycleEvidence = (): CapabilityEvidenceState => {
  let evidence = createStarterCapabilityEvidence()
  evidence = completeTheory(evidence, 'bicycle-road-theory')
  evidence = completePracticalTraining(evidence, 'bicycle-handling-practical')
  const earned = earnCapability(evidence, 'BicycleOperation')
  if (!earned.earned) throw new Error('BicycleOperation should be earnable')
  return earned.state
}

const scooterEvidence = (): CapabilityEvidenceState => ({
  ...createStarterCapabilityEvidence(),
  learnedCapabilityIds: [
    ...createStarterCapabilityEvidence().learnedCapabilityIds,
    'ElectricScooterOperation',
  ],
  theoryIds: ['powered-two-wheel-theory'],
  practicalTrainingIds: ['powered-two-wheel-practical'],
  qualificationIds: ['powered-two-wheel-qualification'],
})

const carEvidence = (): CapabilityEvidenceState => ({
  ...createStarterCapabilityEvidence(),
  learnedCapabilityIds: [
    ...createStarterCapabilityEvidence().learnedCapabilityIds,
    'CarOperation',
  ],
  theoryIds: ['road-vehicle-theory'],
  practicalTrainingIds: ['car-operation-practical'],
  qualificationIds: ['car-operation-qualification'],
})

const deliveryVanEvidence = (): CapabilityEvidenceState => ({
  ...createStarterCapabilityEvidence(),
  learnedCapabilityIds: [
    ...createStarterCapabilityEvidence().learnedCapabilityIds,
    'CarOperation',
    'DeliveryVanOperation',
  ],
  theoryIds: ['road-vehicle-theory'],
  practicalTrainingIds: ['car-operation-practical', 'van-cargo-practical'],
  qualificationIds: ['car-operation-qualification', 'delivery-van-qualification'],
  supervisedExperienceById: { 'road-delivery-supervised': 1 },
})

const bicycleFacts: PlayerWorkAccessFacts = {
  availableEquipmentIds: ['basic-bicycle'],
  availableVehicleClasses: ['Bicycle'],
  cargoCapabilityIds: ['light-parcel'],
  employerPermissionIds: ['bicycle-light-delivery'],
  isActivityAvailableDuringCurrentShift: () => true,
}

const scooterFacts: PlayerWorkAccessFacts = {
  availableEquipmentIds: ['ElectricScooter'],
  availableVehicleClasses: ['ElectricScooter'],
  cargoCapabilityIds: ['light-parcel'],
  employerPermissionIds: ['electric-scooter-light-delivery'],
  isActivityAvailableDuringCurrentShift: () => true,
}

const deliveryVanFacts: PlayerWorkAccessFacts = {
  availableEquipmentIds: ['DeliveryVan'],
  availableVehicleClasses: ['DeliveryVan'],
  cargoCapabilityIds: ['light-parcel'],
  employerPermissionIds: ['delivery-van-light-delivery'],
  isActivityAvailableDuringCurrentShift: () => true,
}

const factsSnapshot = (facts: PlayerWorkAccessFacts) => ({
  availableEquipmentIds: [...(facts.availableEquipmentIds ?? [])],
  availableVehicleClasses: [...(facts.availableVehicleClasses ?? [])],
  cargoCapabilityIds: [...(facts.cargoCapabilityIds ?? [])],
  employerPermissionIds: [...(facts.employerPermissionIds ?? [])],
  companyCapabilityIds: [...(facts.companyCapabilityIds ?? [])],
  worldAccessIds: [...(facts.worldAccessIds ?? [])],
})

describe('DT-06 citywide delivery work-access adapter', () => {
  it('publishes deterministic route compatibility without owning geometry or distance thresholds', () => {
    expect(CITYWIDE_WORK_ACTIVITY_ROUTE_POLICY).toEqual([
      {
        activityId: 'walking-light-document-delivery',
        accessClass: 'local-walking',
        allowedRouteClasses: ['local'],
      },
      {
        activityId: 'bicycle-light-parcel-delivery',
        accessClass: 'bicycle',
        allowedRouteClasses: ['local', 'adjacent-district'],
      },
      {
        activityId: 'electric-scooter-light-parcel-delivery',
        accessClass: 'powered-two-wheel',
        allowedRouteClasses: ['local', 'adjacent-district', 'cross-city'],
      },
      {
        activityId: 'motorcycle-light-parcel-delivery',
        accessClass: 'powered-two-wheel',
        allowedRouteClasses: ['local', 'adjacent-district', 'cross-city'],
      },
      {
        activityId: 'car-light-parcel-delivery',
        accessClass: 'car',
        allowedRouteClasses: ['local', 'adjacent-district', 'cross-city'],
      },
      {
        activityId: 'delivery-van-light-parcel-delivery',
        accessClass: 'delivery-van',
        allowedRouteClasses: ['local', 'adjacent-district', 'cross-city'],
      },
    ])
  })

  it('keeps starter walking useful for local work and rejects wider route classes', () => {
    const adapter = createCitywideDeliveryWorkAccessAdapter(
      createStarterCapabilityEvidence(),
      freshEconomy('wi_citywide_walking'),
      openShift,
    )

    expect(adapter.evaluateCandidateWorkAccess({
      routeClass: 'local',
      compatibleWorkActivityIds: ['walking-light-document-delivery'],
    })).toMatchObject({
      eligible: true,
      routeClass: 'local',
      eligibleWorkActivityIds: ['walking-light-document-delivery'],
      reasonCodes: [],
    })

    expect(adapter.evaluateCandidateWorkAccess({
      routeClass: 'adjacent-district',
      compatibleWorkActivityIds: ['walking-light-document-delivery'],
    })).toEqual({
      eligible: false,
      routeClass: 'adjacent-district',
      eligibleWorkActivityIds: [],
      reasonCodes: ['route-class-incompatible'],
      activityEvaluations: [{
        activityId: 'walking-light-document-delivery',
        accessClass: 'local-walking',
        routeCompatible: false,
        eligible: false,
        reasonCodes: ['route-class-incompatible'],
        blockers: [],
      }],
    })
  })

  it('allows qualified bicycle work across adjacent districts but not cross-city', () => {
    const adapter = createCitywideDeliveryWorkAccessAdapter(
      bicycleEvidence(),
      freshEconomy('wi_citywide_bicycle'),
      bicycleFacts,
    )

    expect(adapter.evaluateCandidateWorkAccess({
      routeClass: 'adjacent-district',
      compatibleWorkActivityIds: ['bicycle-light-parcel-delivery'],
    })).toMatchObject({
      eligible: true,
      eligibleWorkActivityIds: ['bicycle-light-parcel-delivery'],
      reasonCodes: [],
    })

    expect(adapter.evaluateCandidateWorkAccess({
      routeClass: 'cross-city',
      compatibleWorkActivityIds: ['bicycle-light-parcel-delivery'],
    })).toMatchObject({
      eligible: false,
      eligibleWorkActivityIds: [],
      reasonCodes: ['route-class-incompatible'],
    })
  })

  it('preserves employer authorization as an authoritative bicycle blocker', () => {
    const adapter = createCitywideDeliveryWorkAccessAdapter(
      bicycleEvidence(),
      freshEconomy('wi_citywide_bicycle_permission'),
      {
        ...bicycleFacts,
        employerPermissionIds: [],
      },
    )

    const result = adapter.evaluateCandidateWorkAccess({
      routeClass: 'adjacent-district',
      compatibleWorkActivityIds: ['bicycle-light-parcel-delivery'],
    })

    expect(result.eligible).toBe(false)
    expect(result.reasonCodes).toEqual(['employer-authorization-missing'])
    expect(result.activityEvaluations[0]?.blockers).toEqual([
      {
        code: 'employer-authorization-missing',
        message: 'Employer authorization missing: Bicycle delivery authorization.',
      },
    ])
  })

  it('allows qualified powered two-wheel cross-city work only when real vehicle access exists', () => {
    const economy = freshEconomy('wi_citywide_scooter')
    const allowed = createCitywideDeliveryWorkAccessAdapter(
      scooterEvidence(),
      economy,
      scooterFacts,
    ).evaluateCandidateWorkAccess({
      routeClass: 'cross-city',
      compatibleWorkActivityIds: ['electric-scooter-light-parcel-delivery'],
    })

    expect(allowed).toMatchObject({
      eligible: true,
      eligibleWorkActivityIds: ['electric-scooter-light-parcel-delivery'],
      reasonCodes: [],
    })

    const noVehicle = createCitywideDeliveryWorkAccessAdapter(
      scooterEvidence(),
      economy,
      {
        cargoCapabilityIds: ['light-parcel'],
        employerPermissionIds: ['electric-scooter-light-delivery'],
        isActivityAvailableDuringCurrentShift: () => true,
      },
    ).evaluateCandidateWorkAccess({
      routeClass: 'cross-city',
      compatibleWorkActivityIds: ['electric-scooter-light-parcel-delivery'],
    })

    expect(noVehicle.eligible).toBe(false)
    expect(noVehicle.reasonCodes).toEqual(['wrong-equipment', 'vehicle-unavailable'])
  })

  it('does not let a learned powered-two-wheel capability bypass missing training and qualification', () => {
    const inconsistentEvidence: CapabilityEvidenceState = {
      ...createStarterCapabilityEvidence(),
      learnedCapabilityIds: [
        ...createStarterCapabilityEvidence().learnedCapabilityIds,
        'ElectricScooterOperation',
      ],
    }
    const adapter = createCitywideDeliveryWorkAccessAdapter(
      inconsistentEvidence,
      freshEconomy('wi_citywide_scooter_training'),
      scooterFacts,
    )

    expect(adapter.evaluateCandidateWorkAccess({
      routeClass: 'cross-city',
      compatibleWorkActivityIds: ['electric-scooter-light-parcel-delivery'],
    }).reasonCodes).toEqual([
      'training-required',
      'qualification-missing',
    ])
  })

  it('keeps car fail-closed without an owning-runtime Car fact and permits a fully governed van', () => {
    const economy = freshEconomy('wi_citywide_road')
    const car = createCitywideDeliveryWorkAccessAdapter(
      carEvidence(),
      economy,
      {
        cargoCapabilityIds: ['light-parcel'],
        employerPermissionIds: ['car-light-delivery'],
        isActivityAvailableDuringCurrentShift: () => true,
      },
    ).evaluateCandidateWorkAccess({
      routeClass: 'cross-city',
      compatibleWorkActivityIds: ['car-light-parcel-delivery'],
    })

    expect(car.eligible).toBe(false)
    expect(car.reasonCodes).toEqual(['wrong-equipment', 'vehicle-unavailable'])

    const van = createCitywideDeliveryWorkAccessAdapter(
      deliveryVanEvidence(),
      economy,
      deliveryVanFacts,
    ).evaluateCandidateWorkAccess({
      routeClass: 'cross-city',
      compatibleWorkActivityIds: ['delivery-van-light-parcel-delivery'],
    })

    expect(van).toMatchObject({
      eligible: true,
      eligibleWorkActivityIds: ['delivery-van-light-parcel-delivery'],
      reasonCodes: [],
    })
  })

  it('can accept a cross-city candidate when one declared activity is legitimate without promoting walking', () => {
    const adapter = createCitywideDeliveryWorkAccessAdapter(
      scooterEvidence(),
      freshEconomy('wi_citywide_multiple'),
      scooterFacts,
    )

    const result = adapter.evaluateCandidateWorkAccess({
      routeClass: 'cross-city',
      compatibleWorkActivityIds: [
        'walking-light-document-delivery',
        'electric-scooter-light-parcel-delivery',
      ],
    })

    expect(result.eligible).toBe(true)
    expect(result.eligibleWorkActivityIds).toEqual(['electric-scooter-light-parcel-delivery'])
    expect(result.reasonCodes).toEqual([])
    expect(result.activityEvaluations[0]).toMatchObject({
      activityId: 'walking-light-document-delivery',
      routeCompatible: false,
      eligible: false,
      reasonCodes: ['route-class-incompatible'],
    })
    expect(result.activityEvaluations[1]).toMatchObject({
      activityId: 'electric-scooter-light-parcel-delivery',
      routeCompatible: true,
      eligible: true,
      reasonCodes: [],
    })
  })

  it('fails closed for invalid route classes, empty compatibility and unknown activities', () => {
    const adapter = createCitywideDeliveryWorkAccessAdapter(
      createStarterCapabilityEvidence(),
      freshEconomy('wi_citywide_invalid'),
      openShift,
    )

    expect(adapter.evaluateCandidateWorkAccess({
      routeClass: 'unclassified',
      compatibleWorkActivityIds: ['walking-light-document-delivery'],
    })).toEqual({
      eligible: false,
      eligibleWorkActivityIds: [],
      reasonCodes: ['invalid-route-class'],
      activityEvaluations: [],
    })

    expect(adapter.evaluateCandidateWorkAccess({
      routeClass: 'local',
      compatibleWorkActivityIds: [],
    })).toEqual({
      eligible: false,
      routeClass: 'local',
      eligibleWorkActivityIds: [],
      reasonCodes: ['no-compatible-work-activity'],
      activityEvaluations: [],
    })

    expect(adapter.evaluateCandidateWorkAccess({
      routeClass: 'local',
      compatibleWorkActivityIds: ['fictional-hoverboard-delivery'],
    })).toEqual({
      eligible: false,
      routeClass: 'local',
      eligibleWorkActivityIds: [],
      reasonCodes: ['unknown-work-activity'],
      activityEvaluations: [{
        activityId: 'fictional-hoverboard-delivery',
        routeCompatible: false,
        eligible: false,
        reasonCodes: ['unknown-work-activity'],
        blockers: [],
      }],
    })
  })

  it('exposes the selector-compatible raw work-activity verdict without inventing route authority', () => {
    const adapter = createCitywideDeliveryWorkAccessAdapter(
      createStarterCapabilityEvidence(),
      freshEconomy('wi_citywide_selector_port'),
      openShift,
    )

    expect(adapter.isWorkActivityEligible('walking-light-document-delivery')).toBe(true)
    expect(adapter.isWorkActivityEligible('bicycle-light-parcel-delivery')).toBe(false)
  })

  it('is deterministic, input-order independent and mutation-free', () => {
    const evidence = scooterEvidence()
    const economy = freshEconomy('wi_citywide_deterministic')
    const facts = scooterFacts
    const evidenceBefore = structuredClone(evidence)
    const economyBefore = structuredClone(economy)
    const factsBefore = factsSnapshot(facts)
    const adapter = createCitywideDeliveryWorkAccessAdapter(evidence, economy, facts)

    const first = adapter.evaluateCandidateWorkAccess({
      routeClass: 'cross-city',
      compatibleWorkActivityIds: [
        'electric-scooter-light-parcel-delivery',
        'walking-light-document-delivery',
      ],
    })
    const second = adapter.evaluateCandidateWorkAccess({
      routeClass: 'cross-city',
      compatibleWorkActivityIds: [
        'walking-light-document-delivery',
        'electric-scooter-light-parcel-delivery',
      ],
    })

    expect(second).toEqual(first)
    expect(evidence).toEqual(evidenceBefore)
    expect(economy).toEqual(economyBefore)
    expect(factsSnapshot(facts)).toEqual(factsBefore)
  })
})
