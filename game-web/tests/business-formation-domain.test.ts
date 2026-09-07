import { describe, expect, it } from 'vitest'
import {
  BUSINESS_SERVICE_MODEL_DEFINITIONS,
  countCapacityOccupants,
  createInitialLocalBusinessRegistryState,
  createLocalBusinessCompanyId,
  createLocalEconomicActorId,
  evaluateLocalBusinessFormation,
  historicalFounderCompanyIds,
  isIndependentEconomicActor,
  sanitizeLocalBusinessRegistry,
  submitLocalBusinessFormation,
  transitionBusinessAuthorization,
} from '../src/systems/businessFormationSystem'
import type { LocalBusinessCapacityRule, LocalBusinessRegistryState } from '../src/types/business'
import { BUSINESS_SERVICE_MODEL_IDS } from '../src/types/business'
import { createInitialPersonalProgressionState } from '../src/systems/personalCapabilitySystem'

const AREA = 'area:cedar-city:central'
const capacityRules: readonly LocalBusinessCapacityRule[] = [
  { operatingAreaId: AREA, serviceModelId: 'LocalCourier', maxActiveCompanies: 1 },
]

const qualifiedProgression = () => ({
  ...createInitialPersonalProgressionState(),
  progressionPoints: 3,
  learnedCapabilityIds: [
    'DeliveryAppLiteracy',
    'WalkingCourierFundamentals',
    'Entrepreneurship',
  ] as const,
})

const request = (actorSequence = 1, companySequence = 1) => ({
  applicantActorId: createLocalEconomicActorId(actorSequence),
  proposedCompanyId: createLocalBusinessCompanyId(companySequence),
  proposedDisplayName: `Courier Company ${companySequence}`,
  serviceModelId: 'LocalCourier' as const,
  operatingAreaId: AREA,
  foundedAtSequence: companySequence,
})

describe('#372 local business formation domain', () => {
  it('defines one governed service model for every stable service-model id', () => {
    expect(BUSINESS_SERVICE_MODEL_DEFINITIONS.map(item => item.id)).toEqual(BUSINESS_SERVICE_MODEL_IDS)
    expect(new Set(BUSINESS_SERVICE_MODEL_DEFINITIONS.map(item => item.id)).size).toBe(BUSINESS_SERVICE_MODEL_IDS.length)
  })

  it('issues deterministic collision-resistant local simulation ids without constraining future server id formats', () => {
    expect(createLocalEconomicActorId(1)).toBe('actor:local:000001')
    expect(createLocalBusinessCompanyId(12)).toBe('company:local:000012')
    expect(() => createLocalEconomicActorId(0)).toThrow()
    expect(() => createLocalBusinessCompanyId(-1)).toThrow()
  })

  it('represents a player as independent when the local registry has no active founded company', () => {
    const registry = createInitialLocalBusinessRegistryState()
    const actorId = createLocalEconomicActorId(1)
    expect(isIndependentEconomicActor(registry, actorId)).toBe(true)
    expect(historicalFounderCompanyIds(registry, actorId)).toEqual([])
  })

  it('blocks formation on capability and resource prerequisites instead of allowing money-only bypass', () => {
    const personalProgression = createInitialPersonalProgressionState()
    const evaluation = evaluateLocalBusinessFormation(request(), {
      personalProgression,
      availableGameResources: 1_000_000,
      registry: createInitialLocalBusinessRegistryState(),
      capacityRules,
    })

    expect(evaluation.eligible).toBe(false)
    expect(evaluation.blockReasons).toContain('MissingEntrepreneurship')
    expect(evaluation.missingCapabilityIds).toContain('Entrepreneurship')
    expect(evaluation.resourceShortfall).toBe(0)
  })

  it('requires enough governed game resources even when personal qualifications are present', () => {
    const evaluation = evaluateLocalBusinessFormation(request(), {
      personalProgression: { ...qualifiedProgression(), learnedCapabilityIds: [...qualifiedProgression().learnedCapabilityIds] },
      availableGameResources: 499,
      registry: createInitialLocalBusinessRegistryState(),
      capacityRules,
    })

    expect(evaluation.eligible).toBe(false)
    expect(evaluation.blockReasons).toContain('InsufficientResources')
    expect(evaluation.resourceShortfall).toBe(1)
  })

  it('submits a qualified company as Pending without rewriting the existing CompanyState runtime', () => {
    const initial = createInitialLocalBusinessRegistryState()
    const result = submitLocalBusinessFormation(request(), {
      personalProgression: { ...qualifiedProgression(), learnedCapabilityIds: [...qualifiedProgression().learnedCapabilityIds] },
      availableGameResources: 500,
      registry: initial,
      capacityRules,
    })

    expect(result.submitted).toBe(true)
    if (!result.submitted) throw new Error('Expected formation submission')
    expect(initial.companies).toHaveLength(0)
    expect(result.registry.companies).toHaveLength(1)
    expect(result.company.authorizationStatus).toBe('Pending')
    expect(result.company.founderActorId).toBe('actor:local:000001')
    expect(isIndependentEconomicActor(result.registry, result.company.founderActorId)).toBe(false)
  })

  it('blocks a second company when bounded local service capacity is occupied', () => {
    const first = submitLocalBusinessFormation(request(1, 1), {
      personalProgression: { ...qualifiedProgression(), learnedCapabilityIds: [...qualifiedProgression().learnedCapabilityIds] },
      availableGameResources: 500,
      registry: createInitialLocalBusinessRegistryState(),
      capacityRules,
    })
    if (!first.submitted) throw new Error('Expected first submission')

    const second = evaluateLocalBusinessFormation(request(2, 2), {
      personalProgression: { ...qualifiedProgression(), learnedCapabilityIds: [...qualifiedProgression().learnedCapabilityIds] },
      availableGameResources: 500,
      registry: first.registry,
      capacityRules,
    })

    expect(second.eligible).toBe(false)
    expect(second.blockReasons).toContain('LocalCapacityFull')
    expect(second.capacity).toEqual({ occupied: 1, maximum: 1, available: false })
  })

  it('makes capacity denial recoverable when the occupying company closes', () => {
    const first = submitLocalBusinessFormation(request(1, 1), {
      personalProgression: { ...qualifiedProgression(), learnedCapabilityIds: [...qualifiedProgression().learnedCapabilityIds] },
      availableGameResources: 500,
      registry: createInitialLocalBusinessRegistryState(),
      capacityRules,
    })
    if (!first.submitted) throw new Error('Expected first submission')

    const authorized = transitionBusinessAuthorization(first.registry, first.company.companyId, 'Authorized')
    expect(authorized.changed).toBe(true)
    if (!authorized.changed) throw new Error('Expected authorization')
    const closed = transitionBusinessAuthorization(authorized.registry, first.company.companyId, 'Closed')
    expect(closed.changed).toBe(true)
    if (!closed.changed) throw new Error('Expected closure')

    expect(countCapacityOccupants(closed.registry, AREA, 'LocalCourier')).toBe(0)
    const second = evaluateLocalBusinessFormation(request(2, 2), {
      personalProgression: { ...qualifiedProgression(), learnedCapabilityIds: [...qualifiedProgression().learnedCapabilityIds] },
      availableGameResources: 500,
      registry: closed.registry,
      capacityRules,
    })
    expect(second.eligible).toBe(true)
  })

  it('preserves founder history after closure while allowing the actor to operate independently again', () => {
    const registry: LocalBusinessRegistryState = {
      companies: [{
        companyId: createLocalBusinessCompanyId(1),
        founderActorId: createLocalEconomicActorId(1),
        displayName: 'Historic Courier',
        serviceModelId: 'LocalCourier',
        operatingAreaId: AREA,
        authorizationStatus: 'Closed',
        foundedAtSequence: 1,
      }],
    }
    const actorId = createLocalEconomicActorId(1)

    expect(isIndependentEconomicActor(registry, actorId)).toBe(true)
    expect(historicalFounderCompanyIds(registry, actorId)).toEqual([createLocalBusinessCompanyId(1)])
  })

  it('rejects invalid authorization transitions deterministically', () => {
    const registry: LocalBusinessRegistryState = {
      companies: [{
        companyId: createLocalBusinessCompanyId(1),
        founderActorId: createLocalEconomicActorId(1),
        displayName: 'Denied Courier',
        serviceModelId: 'LocalCourier',
        operatingAreaId: AREA,
        authorizationStatus: 'Denied',
        foundedAtSequence: 1,
      }],
    }

    const transition = transitionBusinessAuthorization(registry, createLocalBusinessCompanyId(1), 'Authorized')
    expect(transition).toMatchObject({ changed: false, reason: 'InvalidTransition' })
  })

  it('sanitizes malformed registry entries and duplicate company ids while preserving valid history', () => {
    const result = sanitizeLocalBusinessRegistry({
      companies: [
        {
          companyId: 'server-company-opaque-abc',
          founderActorId: 'server-actor-opaque-xyz',
          displayName: 'Valid Company',
          serviceModelId: 'LocalCourier',
          operatingAreaId: 'world-area-opaque-1',
          authorizationStatus: 'Authorized',
          foundedAtSequence: 7,
        },
        {
          companyId: 'server-company-opaque-abc',
          founderActorId: 'another-founder',
          displayName: 'Duplicate',
          serviceModelId: 'LocalCourier',
          operatingAreaId: 'world-area-opaque-1',
          authorizationStatus: 'Authorized',
          foundedAtSequence: 8,
        },
        { companyId: '', founderActorId: '', displayName: '', serviceModelId: 'BAD' },
      ],
    })

    expect(result.repaired).toBe(true)
    expect(result.businessRegistry.companies).toHaveLength(1)
    expect(result.businessRegistry.companies[0].companyId).toBe('server-company-opaque-abc')
  })
})
