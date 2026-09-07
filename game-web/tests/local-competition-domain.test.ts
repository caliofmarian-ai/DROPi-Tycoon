import { describe, expect, it } from 'vitest'
import type { LocalBusinessRegistryState, RegisteredBusinessIdentity } from '../src/types/business'
import type {
  CompanyMarketPerformanceProfile,
  LocalCompetitionFactorScores,
  LocalCompetitionFactorWeights,
} from '../src/types/competition'
import {
  DEFAULT_LOCAL_COMPETITION_FACTOR_WEIGHTS,
  allocateLocalMarketDemand,
  changedCompetitionFactors,
  eligibleLocalMarketParticipants,
  marketShareForCompany,
  normalizeCompetitionFactorScores,
  scoreLocalCompanyPerformance,
  validateCompetitionFactorWeights,
} from '../src/systems/localCompetitionSystem'

const AREA = 'area:cedar-city:central'
const OTHER_AREA = 'area:cedar-city:north'

const company = (
  id: string,
  status: RegisteredBusinessIdentity['authorizationStatus'] = 'Authorized',
  operatingAreaId = AREA,
): RegisteredBusinessIdentity => ({
  companyId: id,
  founderActorId: `founder:${id}`,
  displayName: id,
  serviceModelId: 'LocalCourier',
  operatingAreaId,
  authorizationStatus: status,
  foundedAtSequence: Number(id.replace(/\D/g, '')) || 1,
})

const registry = (...companies: RegisteredBusinessIdentity[]): LocalBusinessRegistryState => ({ companies })

const factors = (overrides: Partial<LocalCompetitionFactorScores> = {}): LocalCompetitionFactorScores => ({
  priceValue: 70,
  deliverySpeed: 70,
  reliability: 70,
  serviceQuality: 70,
  reputation: 70,
  coverage: 70,
  capability: 70,
  ...overrides,
})

const profile = (
  companyId: string,
  overrides: Partial<CompanyMarketPerformanceProfile> = {},
): CompanyMarketPerformanceProfile => ({
  companyId,
  controlSource: 'Simulated',
  factors: factors(),
  availableCapacityUnits: 100,
  ...overrides,
})

const demand = (demandUnits = 100) => ({
  operatingAreaId: AREA,
  serviceModelId: 'LocalCourier' as const,
  demandUnits,
})

describe('#374 local competition domain', () => {
  it('uses governed factor weights that are complete, non-negative and non-zero', () => {
    expect(Object.keys(DEFAULT_LOCAL_COMPETITION_FACTOR_WEIGHTS).sort()).toEqual([
      'capability', 'coverage', 'deliverySpeed', 'priceValue', 'reliability', 'reputation', 'serviceQuality',
    ].sort())
    const validation = validateCompetitionFactorWeights(DEFAULT_LOCAL_COMPETITION_FACTOR_WEIGHTS)
    expect(validation).toEqual({ valid: true, totalWeight: 100 })
  })

  it('rejects invalid or zero-sum factor-weight configurations', () => {
    const zero = Object.fromEntries(
      Object.keys(DEFAULT_LOCAL_COMPETITION_FACTOR_WEIGHTS).map(key => [key, 0]),
    ) as LocalCompetitionFactorWeights
    expect(validateCompetitionFactorWeights(zero)).toEqual({ valid: false, reason: 'ZeroTotalWeight' })

    const invalid = { ...DEFAULT_LOCAL_COMPETITION_FACTOR_WEIGHTS, reliability: -1 }
    expect(validateCompetitionFactorWeights(invalid)).toEqual({ valid: false, reason: 'InvalidWeight' })
  })

  it('normalizes malformed factor scores into the governed 0..100 domain', () => {
    const normalized = normalizeCompetitionFactorScores(factors({
      priceValue: -30,
      deliverySpeed: 150,
      reliability: Number.NaN,
    }))
    expect(normalized.priceValue).toBe(0)
    expect(normalized.deliverySpeed).toBe(100)
    expect(normalized.reliability).toBe(0)
  })

  it('scores attractiveness from service factors while keeping capacity outside the score', () => {
    const small = profile('company:1', { availableCapacityUnits: 2 })
    const large = profile('company:1', { availableCapacityUnits: 200 })
    expect(scoreLocalCompanyPerformance(small)).toBe(70)
    expect(scoreLocalCompanyPerformance(large)).toBe(70)
  })

  it('lets only Authorized companies in the requested area and service compete', () => {
    const state = registry(
      company('company:1', 'Authorized'),
      company('company:2', 'Pending'),
      company('company:3', 'Suspended'),
      company('company:4', 'Denied'),
      company('company:5', 'Closed'),
      company('company:6', 'Authorized', OTHER_AREA),
    )
    const profiles = state.companies.map(item => profile(item.companyId))
    expect(eligibleLocalMarketParticipants(state, profiles, demand()).map(item => item.companyId)).toEqual(['company:1'])
  })

  it('uses the same economic rules for simulated and player-controlled participants', () => {
    const state = registry(company('company:1'), company('company:2'))
    const result = allocateLocalMarketDemand(state, [
      profile('company:1', { controlSource: 'Player' }),
      profile('company:2', { controlSource: 'Simulated' }),
    ], demand(100))

    expect(result.allocations).toEqual([
      { companyId: 'company:1', compositeScore: 70, allocatedDemandUnits: 50, marketShareBasisPoints: 5000 },
      { companyId: 'company:2', compositeScore: 70, allocatedDemandUnits: 50, marketShareBasisPoints: 5000 },
    ])
  })

  it('allocates customer demand proportionally to understandable performance differences', () => {
    const state = registry(company('company:1'), company('company:2'))
    const strong = profile('company:1', { factors: factors({ reliability: 100, serviceQuality: 100 }) })
    const weak = profile('company:2', { factors: factors({ reliability: 20, serviceQuality: 20 }) })
    const result = allocateLocalMarketDemand(state, [strong, weak], demand(100))

    expect(marketShareForCompany(result, 'company:1')).toBeGreaterThan(marketShareForCompany(result, 'company:2'))
    expect(result.allocatedDemandUnits).toBe(100)
    expect(result.unservedDemandUnits).toBe(0)
  })

  it('hard-caps a strong company at real service capacity and redistributes excess demand', () => {
    const state = registry(company('company:1'), company('company:2'))
    const result = allocateLocalMarketDemand(state, [
      profile('company:1', { factors: factors({ reliability: 100 }), availableCapacityUnits: 10 }),
      profile('company:2', { factors: factors({ reliability: 30 }), availableCapacityUnits: 100 }),
    ], demand(60))

    expect(result.allocations.find(item => item.companyId === 'company:1')?.allocatedDemandUnits).toBe(10)
    expect(result.allocations.find(item => item.companyId === 'company:2')?.allocatedDemandUnits).toBe(50)
    expect(result.unservedDemandUnits).toBe(0)
  })

  it('reports unserved demand instead of inventing capacity when the market cannot satisfy customers', () => {
    const state = registry(company('company:1'), company('company:2'))
    const result = allocateLocalMarketDemand(state, [
      profile('company:1', { availableCapacityUnits: 12 }),
      profile('company:2', { availableCapacityUnits: 8 }),
    ], demand(50))

    expect(result.allocatedDemandUnits).toBe(20)
    expect(result.unservedDemandUnits).toBe(30)
    expect(result.allocations.reduce((sum, item) => sum + item.allocatedDemandUnits, 0)).toBe(20)
  })

  it('uses stable company-id ordering to resolve exact integer ties deterministically', () => {
    const state = registry(company('company:b'), company('company:a'))
    const result = allocateLocalMarketDemand(state, [profile('company:b'), profile('company:a')], demand(3))

    expect(result.allocations).toEqual([
      { companyId: 'company:a', compositeScore: 70, allocatedDemandUnits: 2, marketShareBasisPoints: 6667 },
      { companyId: 'company:b', compositeScore: 70, allocatedDemandUnits: 1, marketShareBasisPoints: 3333 },
    ])
  })

  it('allows market share to recover when a company improves modeled performance', () => {
    const state = registry(company('company:1'), company('company:2'))
    const competitor = profile('company:2', { factors: factors({ reliability: 80 }) })
    const before = profile('company:1', { factors: factors({ reliability: 20 }) })
    const after = profile('company:1', { factors: factors({ reliability: 100 }) })

    const beforeResult = allocateLocalMarketDemand(state, [before, competitor], demand(100))
    const afterResult = allocateLocalMarketDemand(state, [after, competitor], demand(100))

    expect(changedCompetitionFactors(before, after)).toEqual(['reliability'])
    expect(marketShareForCompany(afterResult, 'company:1')).toBeGreaterThan(marketShareForCompany(beforeResult, 'company:1'))
  })

  it('produces no allocation for zero demand, missing profiles, zero capacity or zero attractiveness', () => {
    const state = registry(company('company:1'), company('company:2'), company('company:3'))
    const zeroDemand = allocateLocalMarketDemand(state, [profile('company:1')], demand(0))
    expect(zeroDemand).toMatchObject({ totalDemandUnits: 0, allocatedDemandUnits: 0, unservedDemandUnits: 0, allocations: [] })

    const noEligible = allocateLocalMarketDemand(state, [
      profile('company:1', { availableCapacityUnits: 0 }),
      profile('company:2', { factors: factors({
        priceValue: 0, deliverySpeed: 0, reliability: 0, serviceQuality: 0,
        reputation: 0, coverage: 0, capability: 0,
      }) }),
    ], demand(25))
    expect(noEligible).toMatchObject({ allocatedDemandUnits: 0, unservedDemandUnits: 25, allocations: [] })
  })
})
