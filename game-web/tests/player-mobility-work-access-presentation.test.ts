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
  projectPlayerMobilityMissionOffer,
  projectPlayerMobilityWorkAccess,
} from '../src/capabilities/playerMobilityWorkAccessPresentation'
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

const scooterCapabilityOnlyEvidence = (): CapabilityEvidenceState => ({
  ...createStarterCapabilityEvidence(),
  learnedCapabilityIds: [
    ...createStarterCapabilityEvidence().learnedCapabilityIds,
    'ElectricScooterOperation',
  ],
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

const vanFacts: PlayerWorkAccessFacts = {
  availableEquipmentIds: ['DeliveryVan'],
  availableVehicleClasses: ['DeliveryVan'],
  cargoCapabilityIds: ['light-parcel'],
  employerPermissionIds: ['delivery-van-light-delivery'],
  isActivityAvailableDuringCurrentShift: () => true,
}

const reasonCodes = (reasons: readonly { code: string }[]): string[] =>
  reasons.map(reason => reason.code)

describe('DT-06 player mobility/work-access presentation projection', () => {
  it('projects canonical mobility state with locality as context only', () => {
    const evidence = createStarterCapabilityEvidence()
    const economy = freshEconomy('wi_mobility_profile')
    const braila = projectPlayerMobilityWorkAccess(
      evidence,
      economy,
      openShift,
      { localityId: 'locality:braila' },
    )
    const dublin = projectPlayerMobilityWorkAccess(
      evidence,
      economy,
      openShift,
      { localityId: 'locality:dublin' },
    )

    expect(braila).toMatchObject({
      version: 1,
      worldInstanceId: economy.worldInstanceId,
      heroActorId: economy.heroActorId,
      currentLocalityId: 'locality:braila',
    })
    expect(braila.activities.map(activity => activity.activityId)).toEqual([
      'walking-light-document-delivery',
      'bicycle-light-parcel-delivery',
      'electric-scooter-light-parcel-delivery',
      'motorcycle-light-parcel-delivery',
      'car-light-parcel-delivery',
      'delivery-van-light-parcel-delivery',
    ])
    expect(braila.routes.map(route => [route.routeClass, route.eligible])).toEqual([
      ['local', true],
      ['adjacent-district', false],
      ['cross-city', false],
    ])
    expect(dublin.activities).toEqual(braila.activities)
    expect(dublin.routes).toEqual(braila.routes)
    expect(dublin.currentLocalityId).toBe('locality:dublin')
  })

  it('explains why starter wider work is blocked without granting anything', () => {
    const evidence = createStarterCapabilityEvidence()
    const projection = projectPlayerMobilityWorkAccess(
      evidence,
      freshEconomy('wi_mobility_starter_blockers'),
      openShift,
    )
    const bicycle = projection.activities.find(
      activity => activity.activityId === 'bicycle-light-parcel-delivery',
    )

    expect(bicycle?.eligible).toBe(false)
    expect(reasonCodes(bicycle?.blockers ?? [])).toEqual([
      'capability-missing',
      'training-required',
      'training-required',
      'employer-authorization-missing',
      'wrong-equipment',
      'vehicle-unavailable',
      'cargo-capability-insufficient',
    ])
    expect(bicycle?.blockers).toContainEqual({
      code: 'employer-authorization-missing',
      message: 'Employer authorization missing: Bicycle delivery authorization.',
    })
    expect(evidence.learnedCapabilityIds).not.toContain('BicycleOperation')
  })

  it('shows bicycle as an adjacent-district expansion but not a cross-city bypass', () => {
    const projection = projectPlayerMobilityWorkAccess(
      bicycleEvidence(),
      freshEconomy('wi_mobility_bicycle'),
      bicycleFacts,
    )

    const adjacent = projectPlayerMobilityMissionOffer(projection, {
      routeClass: 'adjacent-district',
      compatibleWorkActivityIds: ['bicycle-light-parcel-delivery'],
    })
    expect(adjacent).toMatchObject({
      eligible: true,
      eligibleWorkActivityIds: ['bicycle-light-parcel-delivery'],
      blockingReasons: [],
    })

    const crossCity = projectPlayerMobilityMissionOffer(projection, {
      routeClass: 'cross-city',
      compatibleWorkActivityIds: ['bicycle-light-parcel-delivery'],
    })
    expect(crossCity.eligible).toBe(false)
    expect(reasonCodes(crossCity.blockingReasons)).toEqual(['route-class-incompatible'])
    expect(crossCity.blockingReasons[0]?.message).toContain('classified cross-city route')
  })

  it('surfaces missing powered-two-wheel training, qualification, permission and vehicle facts truthfully', () => {
    const economy = freshEconomy('wi_mobility_scooter_blockers')
    const trainingMissing = projectPlayerMobilityWorkAccess(
      scooterCapabilityOnlyEvidence(),
      economy,
      scooterFacts,
    ).activities.find(activity => activity.activityId === 'electric-scooter-light-parcel-delivery')

    expect(reasonCodes(trainingMissing?.blockers ?? [])).toEqual([
      'training-required',
      'training-required',
      'qualification-missing',
    ])

    const accessMissing = projectPlayerMobilityWorkAccess(
      scooterEvidence(),
      economy,
      {
        cargoCapabilityIds: ['light-parcel'],
        employerPermissionIds: [],
        isActivityAvailableDuringCurrentShift: () => true,
      },
    ).activities.find(activity => activity.activityId === 'electric-scooter-light-parcel-delivery')

    expect(reasonCodes(accessMissing?.blockers ?? [])).toEqual([
      'employer-authorization-missing',
      'wrong-equipment',
      'vehicle-unavailable',
    ])
  })

  it('keeps Work Capacity and shift availability visible and authoritative', () => {
    const economy = freshEconomy('wi_mobility_capacity_shift')
    const exhausted: PlayerEconomyState = {
      ...economy,
      workCapacity: {
        ...economy.workCapacity,
        current: 0,
      },
    }
    const projection = projectPlayerMobilityWorkAccess(
      deliveryVanEvidence(),
      exhausted,
      {
        ...vanFacts,
        isActivityAvailableDuringCurrentShift: () => false,
      },
    )
    const van = projection.activities.find(
      activity => activity.activityId === 'delivery-van-light-parcel-delivery',
    )

    expect(reasonCodes(van?.blockers ?? [])).toEqual([
      'insufficient-work-capacity',
      'activity-unavailable-current-shift',
    ])
    expect(van?.blockers).toContainEqual({
      code: 'insufficient-work-capacity',
      message: 'Insufficient Work Capacity.',
    })
  })

  it('projects a cross-city offer through the legitimate powered mode without promoting walking', () => {
    const projection = projectPlayerMobilityWorkAccess(
      scooterEvidence(),
      freshEconomy('wi_mobility_offer'),
      scooterFacts,
    )
    const offer = projectPlayerMobilityMissionOffer(projection, {
      routeClass: 'cross-city',
      compatibleWorkActivityIds: [
        'walking-light-document-delivery',
        'electric-scooter-light-parcel-delivery',
      ],
    })

    expect(offer.eligible).toBe(true)
    expect(offer.eligibleWorkActivityIds).toEqual(['electric-scooter-light-parcel-delivery'])
    expect(offer.blockingReasons).toEqual([])
    expect(offer.activityEvaluations[0]).toMatchObject({
      activityId: 'walking-light-document-delivery',
      routeCompatible: false,
      eligible: false,
    })
    expect(reasonCodes(offer.activityEvaluations[0]?.reasons ?? [])).toEqual([
      'route-class-incompatible',
    ])
  })

  it('fails presentation closed for unclassified routes and unknown work activities', () => {
    const projection = projectPlayerMobilityWorkAccess(
      createStarterCapabilityEvidence(),
      freshEconomy('wi_mobility_invalid_offer'),
      openShift,
    )

    expect(projectPlayerMobilityMissionOffer(projection, {
      routeClass: 'unclassified',
      compatibleWorkActivityIds: ['walking-light-document-delivery'],
    })).toEqual({
      eligible: false,
      eligibleWorkActivityIds: [],
      blockingReasons: [{
        code: 'invalid-route-class',
        message: 'The route is not classified by the authoritative world/spatial system.',
      }],
      activityEvaluations: [],
    })

    const unknown = projectPlayerMobilityMissionOffer(projection, {
      routeClass: 'local',
      compatibleWorkActivityIds: ['fictional-hoverboard-delivery'],
    })
    expect(unknown.eligible).toBe(false)
    expect(reasonCodes(unknown.blockingReasons)).toEqual(['unknown-work-activity'])
  })

  it('is deterministic and mutation-free across profile and offer projection', () => {
    const evidence = scooterEvidence()
    const economy = freshEconomy('wi_mobility_deterministic')
    const facts = scooterFacts
    const evidenceBefore = structuredClone(evidence)
    const economyBefore = structuredClone(economy)
    const factsBefore = {
      availableEquipmentIds: [...(facts.availableEquipmentIds ?? [])],
      availableVehicleClasses: [...(facts.availableVehicleClasses ?? [])],
      cargoCapabilityIds: [...(facts.cargoCapabilityIds ?? [])],
      employerPermissionIds: [...(facts.employerPermissionIds ?? [])],
    }

    const first = projectPlayerMobilityWorkAccess(
      evidence,
      economy,
      facts,
      { localityId: 'locality:braila' },
    )
    const second = projectPlayerMobilityWorkAccess(
      evidence,
      economy,
      facts,
      { localityId: 'locality:braila' },
    )
    expect(second).toEqual(first)

    const offerA = projectPlayerMobilityMissionOffer(first, {
      routeClass: 'cross-city',
      compatibleWorkActivityIds: [
        'electric-scooter-light-parcel-delivery',
        'walking-light-document-delivery',
      ],
    })
    const offerB = projectPlayerMobilityMissionOffer(first, {
      routeClass: 'cross-city',
      compatibleWorkActivityIds: [
        'walking-light-document-delivery',
        'electric-scooter-light-parcel-delivery',
      ],
    })
    expect(offerB).toEqual(offerA)

    expect(evidence).toEqual(evidenceBefore)
    expect(economy).toEqual(economyBefore)
    expect({
      availableEquipmentIds: [...(facts.availableEquipmentIds ?? [])],
      availableVehicleClasses: [...(facts.availableVehicleClasses ?? [])],
      cargoCapabilityIds: [...(facts.cargoCapabilityIds ?? [])],
      employerPermissionIds: [...(facts.employerPermissionIds ?? [])],
    }).toEqual(factsBefore)
  })
})
