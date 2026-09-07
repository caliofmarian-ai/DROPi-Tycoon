import { COMPANY_VALUATION_POLICY_V1 } from '../config/companyValuation'
import { COMPANY_EQUITY_TOTAL_UNITS } from '../types/equity'
import type {
  CompanyValuationBreakdown,
  CompanyValuationInput,
  CompanyValuationPolicy,
  CompanyValuationValidationResult,
} from '../types/valuation'

const isFiniteNumber = (value: number): boolean => Number.isFinite(value)
const isNonNegativeFinite = (value: number): boolean => isFiniteNumber(value) && value >= 0
const isScore = (value: number): boolean => isFiniteNumber(value) && value >= 0 && value <= 100
const roundMoney = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100
const roundIndex = (value: number): number => Math.round((value + Number.EPSILON) * 10_000) / 10_000
const roundUnitValue = (value: number): number => Math.round((value + Number.EPSILON) * 10_000) / 10_000

const weightGroupIsValid = (weights: number[]): boolean =>
  weights.every(weight => isFiniteNumber(weight) && weight >= 0) &&
  Math.abs(weights.reduce((sum, weight) => sum + weight, 0) - 1) < 1e-9

export const validateCompanyValuationInput = (
  input: CompanyValuationInput,
  policy: CompanyValuationPolicy = COMPANY_VALUATION_POLICY_V1,
): CompanyValuationValidationResult => {
  const errors: string[] = []

  if (!input.companyId.trim()) errors.push('companyId must be non-empty.')

  const nonNegativeFields: Array<[string, number]> = [
    ['cash', input.cash],
    ['tangibleAssets', input.tangibleAssets],
    ['liabilities', input.liabilities],
    ['trailingRevenue', input.trailingRevenue],
  ]
  for (const [name, value] of nonNegativeFields) {
    if (!isNonNegativeFinite(value)) errors.push(`${name} must be a non-negative finite number.`)
  }

  const signedFinancialFields: Array<[string, number]> = [
    ['trailingOperatingProfit', input.trailingOperatingProfit],
    ['trailingFreeCashFlow', input.trailingFreeCashFlow],
    ['revenueGrowthPercent', input.revenueGrowthPercent],
  ]
  for (const [name, value] of signedFinancialFields) {
    if (!isFiniteNumber(value)) errors.push(`${name} must be finite.`)
  }

  const scoreFields: Array<[string, number]> = [
    ['customerStrengthScore', input.customerStrengthScore],
    ['reputationScore', input.reputationScore],
    ['demandStrengthScore', input.demandStrengthScore],
    ['infrastructureScore', input.infrastructureScore],
    ['technologyScore', input.technologyScore],
    ['specialistCapabilityScore', input.specialistCapabilityScore],
    ['reliabilityScore', input.reliabilityScore],
    ['operationalRiskScore', input.operationalRiskScore],
  ]
  for (const [name, value] of scoreFields) {
    if (!isScore(value)) errors.push(`${name} must be within 0..100.`)
  }

  if (!policy.version.trim()) errors.push('Valuation policy version must be non-empty.')
  const nonNegativePolicyFields: Array<[string, number]> = [
    ['profitMultiple', policy.profitMultiple],
    ['freeCashFlowMultiple', policy.freeCashFlowMultiple],
    ['revenueSupportMultiple', policy.revenueSupportMultiple],
    ['marketComponentRevenueCapMultiple', policy.marketComponentRevenueCapMultiple],
    ['strategicComponentBaseCapPercent', policy.strategicComponentBaseCapPercent],
    ['maxPositiveGrowthUpliftPercent', policy.maxPositiveGrowthUpliftPercent],
    ['maxNegativeGrowthPenaltyPercent', policy.maxNegativeGrowthPenaltyPercent],
    ['maxOperationalRiskHaircutPercent', policy.maxOperationalRiskHaircutPercent],
  ]
  for (const [name, value] of nonNegativePolicyFields) {
    if (!isNonNegativeFinite(value)) errors.push(`${name} must be non-negative and finite.`)
  }

  if (policy.maxPositiveGrowthUpliftPercent > 100) errors.push('Positive growth uplift cap cannot exceed 100%.')
  if (policy.maxNegativeGrowthPenaltyPercent > 100) errors.push('Negative growth penalty cap cannot exceed 100%.')
  if (policy.maxOperationalRiskHaircutPercent > 100) errors.push('Risk haircut cap cannot exceed 100%.')

  if (!weightGroupIsValid(Object.values(policy.marketWeights))) {
    errors.push('Market weights must be non-negative and sum to 1.')
  }
  if (!weightGroupIsValid(Object.values(policy.strategicWeights))) {
    errors.push('Strategic weights must be non-negative and sum to 1.')
  }
  if (!weightGroupIsValid(Object.values(policy.riskWeights))) {
    errors.push('Risk weights must be non-negative and sum to 1.')
  }

  return { valid: errors.length === 0, errors }
}

const weightedMarketIndex = (input: CompanyValuationInput, policy: CompanyValuationPolicy): number =>
  (
    input.customerStrengthScore * policy.marketWeights.customerStrength +
    input.reputationScore * policy.marketWeights.reputation +
    input.demandStrengthScore * policy.marketWeights.demandStrength
  ) / 100

const weightedStrategicIndex = (input: CompanyValuationInput, policy: CompanyValuationPolicy): number =>
  (
    input.infrastructureScore * policy.strategicWeights.infrastructure +
    input.technologyScore * policy.strategicWeights.technology +
    input.specialistCapabilityScore * policy.strategicWeights.specialistCapability
  ) / 100

const weightedRiskIndex = (input: CompanyValuationInput, policy: CompanyValuationPolicy): number =>
  (
    input.operationalRiskScore * policy.riskWeights.operationalRisk +
    (100 - input.reliabilityScore) * policy.riskWeights.reliabilityDeficit
  ) / 100

export const calculateCompanyValuation = (
  input: CompanyValuationInput,
  policy: CompanyValuationPolicy = COMPANY_VALUATION_POLICY_V1,
): CompanyValuationBreakdown => {
  const validation = validateCompanyValuationInput(input, policy)
  if (!validation.valid) throw new Error(`Invalid company valuation input: ${validation.errors.join(' ')}`)

  const grossTangibleValue = input.cash + input.tangibleAssets
  const sustainableEarningsValue =
    input.trailingRevenue * policy.revenueSupportMultiple +
    input.trailingOperatingProfit * policy.profitMultiple +
    input.trailingFreeCashFlow * policy.freeCashFlowMultiple

  const marketStrengthIndex = weightedMarketIndex(input, policy)
  const marketStrengthValue =
    input.trailingRevenue * policy.marketComponentRevenueCapMultiple * marketStrengthIndex

  const strategicCapabilityIndex = weightedStrategicIndex(input, policy)
  const strategicBase = Math.max(0, grossTangibleValue + Math.max(0, sustainableEarningsValue))
  const strategicCapabilityValue =
    strategicBase * (policy.strategicComponentBaseCapPercent / 100) * strategicCapabilityIndex

  const preGrowthValue = Math.max(
    0,
    grossTangibleValue + sustainableEarningsValue + marketStrengthValue + strategicCapabilityValue,
  )

  const growthPercent = input.revenueGrowthPercent >= 0
    ? Math.min(input.revenueGrowthPercent, policy.maxPositiveGrowthUpliftPercent)
    : -Math.min(Math.abs(input.revenueGrowthPercent), policy.maxNegativeGrowthPenaltyPercent)
  const growthAdjustment = preGrowthValue * (growthPercent / 100)

  const beforeLiabilities = Math.max(0, preGrowthValue + growthAdjustment)
  const liabilityDeduction = Math.min(input.liabilities, beforeLiabilities)
  const afterLiabilities = beforeLiabilities - liabilityDeduction

  const riskIndex = weightedRiskIndex(input, policy)
  const riskDeduction =
    afterLiabilities * (policy.maxOperationalRiskHaircutPercent / 100) * riskIndex

  const totalReferenceValuation = Math.max(0, afterLiabilities - riskDeduction)

  return {
    companyId: input.companyId,
    policyVersion: policy.version,
    grossTangibleValue: roundMoney(grossTangibleValue),
    liabilityDeduction: roundMoney(liabilityDeduction),
    netTangibleValue: roundMoney(Math.max(0, grossTangibleValue - input.liabilities)),
    sustainableEarningsValue: roundMoney(sustainableEarningsValue),
    marketStrengthIndex: roundIndex(marketStrengthIndex),
    marketStrengthValue: roundMoney(marketStrengthValue),
    strategicCapabilityIndex: roundIndex(strategicCapabilityIndex),
    strategicCapabilityValue: roundMoney(strategicCapabilityValue),
    growthAdjustment: roundMoney(growthAdjustment),
    riskDeduction: roundMoney(riskDeduction),
    totalReferenceValuation: roundMoney(totalReferenceValuation),
    referenceEquityUnitValue: roundUnitValue(totalReferenceValuation / COMPANY_EQUITY_TOTAL_UNITS),
  }
}
