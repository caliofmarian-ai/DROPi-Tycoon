import type { BusinessCompanyId } from './business'

export interface CompanyValuationInput {
  companyId: BusinessCompanyId
  /** Liquid Company Money/cash available to the business. */
  cash: number
  /** Productive owned assets excluding cash, expressed in Company Money reference units. */
  tangibleAssets: number
  /** Outstanding company obligations/debt represented by the simulation. */
  liabilities: number
  /** Governed trailing-period operating metrics. */
  trailingRevenue: number
  trailingOperatingProfit: number
  trailingFreeCashFlow: number
  /** Signed trailing growth percentage. Example: 12 means +12%. */
  revenueGrowthPercent: number
  /** Market/customer fundamentals, each normalized to the inclusive range 0..100. */
  customerStrengthScore: number
  reputationScore: number
  demandStrengthScore: number
  /** Strategic capability fundamentals, each normalized to 0..100. */
  infrastructureScore: number
  technologyScore: number
  specialistCapabilityScore: number
  /** Operational health and material risk, each normalized to 0..100. */
  reliabilityScore: number
  operationalRiskScore: number
}

export interface CompanyValuationPolicy {
  version: string
  profitMultiple: number
  freeCashFlowMultiple: number
  revenueSupportMultiple: number
  marketComponentRevenueCapMultiple: number
  strategicComponentBaseCapPercent: number
  maxPositiveGrowthUpliftPercent: number
  maxNegativeGrowthPenaltyPercent: number
  maxOperationalRiskHaircutPercent: number
  marketWeights: {
    customerStrength: number
    reputation: number
    demandStrength: number
  }
  strategicWeights: {
    infrastructure: number
    technology: number
    specialistCapability: number
  }
}

export interface CompanyValuationBreakdown {
  companyId: BusinessCompanyId
  policyVersion: string
  netTangibleValue: number
  sustainableEarningsValue: number
  marketStrengthIndex: number
  marketStrengthValue: number
  strategicCapabilityIndex: number
  strategicCapabilityValue: number
  growthAdjustment: number
  riskDeduction: number
  totalReferenceValuation: number
  /** Reference only. This is not a live exchange quote or guaranteed transaction price. */
  referenceEquityUnitValue: number
}
