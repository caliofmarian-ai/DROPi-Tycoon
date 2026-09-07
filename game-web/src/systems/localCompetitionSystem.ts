import { BALANCING } from '../config/balancing'
import type { BusinessCompanyId, LocalBusinessRegistryState } from '../types/business'
import type {
  CompanyMarketPerformanceProfile,
  LocalCompetitionFactorId,
  LocalCompetitionFactorScores,
  LocalCompetitionFactorWeights,
  LocalMarketAllocationResult,
  LocalMarketDemand,
} from '../types/competition'
import { LOCAL_COMPETITION_FACTOR_IDS } from '../types/competition'

export const DEFAULT_LOCAL_COMPETITION_FACTOR_WEIGHTS: LocalCompetitionFactorWeights = {
  priceValue: BALANCING.LOCAL_COMPETITION_PRICE_VALUE_WEIGHT,
  deliverySpeed: BALANCING.LOCAL_COMPETITION_DELIVERY_SPEED_WEIGHT,
  reliability: BALANCING.LOCAL_COMPETITION_RELIABILITY_WEIGHT,
  serviceQuality: BALANCING.LOCAL_COMPETITION_SERVICE_QUALITY_WEIGHT,
  reputation: BALANCING.LOCAL_COMPETITION_REPUTATION_WEIGHT,
  coverage: BALANCING.LOCAL_COMPETITION_COVERAGE_WEIGHT,
  capability: BALANCING.LOCAL_COMPETITION_CAPABILITY_WEIGHT,
}

const clampScore = (value: number): number => {
  if (!Number.isFinite(value)) return 0
  return Math.min(100, Math.max(0, value))
}

const normalizeCapacity = (value: number): number =>
  Number.isSafeInteger(value) && value > 0 ? value : 0

const normalizeDemand = (value: number): number =>
  Number.isSafeInteger(value) && value > 0 ? value : 0

export const normalizeCompetitionFactorScores = (
  factors: LocalCompetitionFactorScores,
): LocalCompetitionFactorScores => LOCAL_COMPETITION_FACTOR_IDS.reduce<LocalCompetitionFactorScores>(
  (normalized, factorId) => {
    normalized[factorId] = clampScore(factors[factorId])
    return normalized
  },
  {} as LocalCompetitionFactorScores,
)

export const validateCompetitionFactorWeights = (
  weights: LocalCompetitionFactorWeights,
): { valid: true; totalWeight: number } | { valid: false; reason: 'InvalidWeight' | 'ZeroTotalWeight' } => {
  let totalWeight = 0
  for (const factorId of LOCAL_COMPETITION_FACTOR_IDS) {
    const weight = weights[factorId]
    if (!Number.isFinite(weight) || weight < 0) return { valid: false, reason: 'InvalidWeight' }
    totalWeight += weight
  }
  if (totalWeight <= 0) return { valid: false, reason: 'ZeroTotalWeight' }
  return { valid: true, totalWeight }
}

/**
 * Returns a normalized 0..100 attractiveness score. Capacity is deliberately excluded:
 * capacity limits how much demand can be served rather than making a company look better.
 */
export const scoreLocalCompanyPerformance = (
  profile: CompanyMarketPerformanceProfile,
  weights: LocalCompetitionFactorWeights = DEFAULT_LOCAL_COMPETITION_FACTOR_WEIGHTS,
): number => {
  const weightCheck = validateCompetitionFactorWeights(weights)
  if (!weightCheck.valid) throw new Error(`Invalid local competition weights: ${weightCheck.reason}`)
  const normalized = normalizeCompetitionFactorScores(profile.factors)
  const weighted = LOCAL_COMPETITION_FACTOR_IDS.reduce(
    (sum, factorId) => sum + normalized[factorId] * weights[factorId],
    0,
  )
  return weighted / weightCheck.totalWeight
}

interface EligibleParticipant {
  companyId: BusinessCompanyId
  score: number
  capacity: number
  allocated: number
}

export const eligibleLocalMarketParticipants = (
  registry: LocalBusinessRegistryState,
  profiles: readonly CompanyMarketPerformanceProfile[],
  demand: LocalMarketDemand,
  weights: LocalCompetitionFactorWeights = DEFAULT_LOCAL_COMPETITION_FACTOR_WEIGHTS,
): EligibleParticipant[] => {
  const profileByCompanyId = new Map<BusinessCompanyId, CompanyMarketPerformanceProfile>()
  for (const profile of profiles) {
    if (!profileByCompanyId.has(profile.companyId)) profileByCompanyId.set(profile.companyId, profile)
  }

  return registry.companies
    .filter(company =>
      company.authorizationStatus === 'Authorized' &&
      company.operatingAreaId === demand.operatingAreaId &&
      company.serviceModelId === demand.serviceModelId,
    )
    .map(company => {
      const profile = profileByCompanyId.get(company.companyId)
      if (!profile) return null
      const capacity = normalizeCapacity(profile.availableCapacityUnits)
      const score = scoreLocalCompanyPerformance(profile, weights)
      if (capacity <= 0 || score <= 0) return null
      return { companyId: company.companyId, score, capacity, allocated: 0 }
    })
    .filter((participant): participant is EligibleParticipant => participant !== null)
    .sort((a, b) => a.companyId.localeCompare(b.companyId))
}

/**
 * Deterministic bounded allocation. Each round assigns proportional integer base shares.
 * Capacity-capped excess demand is then redistributed among remaining eligible companies.
 * If less than one whole proportional unit is available, the highest score wins one unit;
 * stable companyId ordering resolves exact ties.
 */
export const allocateLocalMarketDemand = (
  registry: LocalBusinessRegistryState,
  profiles: readonly CompanyMarketPerformanceProfile[],
  demand: LocalMarketDemand,
  weights: LocalCompetitionFactorWeights = DEFAULT_LOCAL_COMPETITION_FACTOR_WEIGHTS,
): LocalMarketAllocationResult => {
  const totalDemandUnits = normalizeDemand(demand.demandUnits)
  const participants = eligibleLocalMarketParticipants(registry, profiles, demand, weights)
  let remainingDemand = totalDemandUnits

  while (remainingDemand > 0) {
    const active = participants.filter(participant => participant.allocated < participant.capacity)
    if (active.length === 0) break
    const totalScore = active.reduce((sum, participant) => sum + participant.score, 0)
    if (totalScore <= 0) break

    let assignedThisRound = 0
    for (const participant of active) {
      const remainingCapacity = participant.capacity - participant.allocated
      const proportional = Math.floor(remainingDemand * participant.score / totalScore)
      const assignment = Math.min(remainingCapacity, proportional)
      if (assignment <= 0) continue
      participant.allocated += assignment
      assignedThisRound += assignment
    }

    if (assignedThisRound > 0) {
      remainingDemand -= assignedThisRound
      continue
    }

    const winner = [...active].sort((a, b) =>
      b.score - a.score || a.companyId.localeCompare(b.companyId),
    )[0]
    winner.allocated += 1
    remainingDemand -= 1
  }

  const allocatedDemandUnits = participants.reduce((sum, participant) => sum + participant.allocated, 0)
  const allocations = participants
    .filter(participant => participant.allocated > 0)
    .map(participant => ({
      companyId: participant.companyId,
      compositeScore: participant.score,
      allocatedDemandUnits: participant.allocated,
      marketShareBasisPoints: totalDemandUnits > 0
        ? Math.round(participant.allocated * 10_000 / totalDemandUnits)
        : 0,
    }))
    .sort((a, b) => a.companyId.localeCompare(b.companyId))

  return {
    operatingAreaId: demand.operatingAreaId,
    serviceModelId: demand.serviceModelId,
    totalDemandUnits,
    allocatedDemandUnits,
    unservedDemandUnits: totalDemandUnits - allocatedDemandUnits,
    allocations,
  }
}

export const marketShareForCompany = (
  result: LocalMarketAllocationResult,
  companyId: BusinessCompanyId,
): number => result.allocations.find(line => line.companyId === companyId)?.marketShareBasisPoints ?? 0

/**
 * Helper for explanation surfaces: reports which factor changes between two profiles.
 * It does not assign causality beyond the explicit modeled factor values.
 */
export const changedCompetitionFactors = (
  before: CompanyMarketPerformanceProfile,
  after: CompanyMarketPerformanceProfile,
): LocalCompetitionFactorId[] => LOCAL_COMPETITION_FACTOR_IDS.filter(
  factorId => clampScore(before.factors[factorId]) !== clampScore(after.factors[factorId]),
)
