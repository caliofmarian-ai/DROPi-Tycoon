import type {
  BusinessCompanyId,
  BusinessServiceModelId,
  OperatingAreaId,
} from './business'

export const LOCAL_COMPETITION_FACTOR_IDS = [
  'priceValue',
  'deliverySpeed',
  'reliability',
  'serviceQuality',
  'reputation',
  'coverage',
  'capability',
] as const
export type LocalCompetitionFactorId = (typeof LOCAL_COMPETITION_FACTOR_IDS)[number]

export type LocalCompetitionFactorScores = Record<LocalCompetitionFactorId, number>
export type LocalCompetitionFactorWeights = Record<LocalCompetitionFactorId, number>

/** Control source is descriptive only and must never change allocation rules. */
export const MARKET_PARTICIPANT_CONTROL_SOURCES = ['Simulated', 'Player'] as const
export type MarketParticipantControlSource = (typeof MARKET_PARTICIPANT_CONTROL_SOURCES)[number]

export interface CompanyMarketPerformanceProfile {
  companyId: BusinessCompanyId
  controlSource: MarketParticipantControlSource
  factors: LocalCompetitionFactorScores
  /** Maximum demand units the company can serve in this allocation period. */
  availableCapacityUnits: number
}

export interface LocalMarketDemand {
  operatingAreaId: OperatingAreaId
  serviceModelId: BusinessServiceModelId
  demandUnits: number
}

export interface LocalMarketAllocationLine {
  companyId: BusinessCompanyId
  compositeScore: number
  allocatedDemandUnits: number
  /** Share of total original demand, expressed in integer basis points (10000 = 100%). */
  marketShareBasisPoints: number
}

export interface LocalMarketAllocationResult {
  operatingAreaId: OperatingAreaId
  serviceModelId: BusinessServiceModelId
  totalDemandUnits: number
  allocatedDemandUnits: number
  unservedDemandUnits: number
  allocations: LocalMarketAllocationLine[]
}
