import type { CompanyValuationPolicy } from '../types/valuation'

/**
 * Prototype valuation tuning. These numbers are governed balancing parameters,
 * not immutable business canon and not real-world investment guidance.
 */
export const COMPANY_VALUATION_POLICY_V1: CompanyValuationPolicy = {
  version: '1.0.0',
  profitMultiple: 4,
  freeCashFlowMultiple: 2,
  revenueSupportMultiple: 0.2,
  marketComponentRevenueCapMultiple: 0.5,
  strategicComponentBaseCapPercent: 25,
  maxPositiveGrowthUpliftPercent: 20,
  maxNegativeGrowthPenaltyPercent: 30,
  maxOperationalRiskHaircutPercent: 45,
  marketWeights: {
    customerStrength: 0.4,
    reputation: 0.3,
    demandStrength: 0.3,
  },
  strategicWeights: {
    infrastructure: 0.4,
    technology: 0.3,
    specialistCapability: 0.3,
  },
  riskWeights: {
    operationalRisk: 0.6,
    reliabilityDeficit: 0.4,
  },
}
