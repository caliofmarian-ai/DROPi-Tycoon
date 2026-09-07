import { describe, expect, it } from 'vitest'
import { COMPANY_VALUATION_POLICY_V1 } from '../src/config/companyValuation'
import {
  calculateCompanyValuation,
  validateCompanyValuationInput,
} from '../src/systems/companyValuationSystem'
import type { CompanyValuationInput, CompanyValuationPolicy } from '../src/types/valuation'

const baseInput = (): CompanyValuationInput => ({
  companyId: 'company:alpha',
  cash: 1_000,
  tangibleAssets: 4_000,
  liabilities: 1_000,
  trailingRevenue: 2_000,
  trailingOperatingProfit: 300,
  trailingFreeCashFlow: 250,
  revenueGrowthPercent: 10,
  customerStrengthScore: 70,
  reputationScore: 80,
  demandStrengthScore: 60,
  infrastructureScore: 60,
  technologyScore: 50,
  specialistCapabilityScore: 40,
  reliabilityScore: 90,
  operationalRiskScore: 20,
})

describe('company valuation domain', () => {
  it('produces an explainable deterministic reference valuation', () => {
    const valuation = calculateCompanyValuation(baseInput())

    expect(valuation.policyVersion).toBe('1.0.0')
    expect(valuation.grossTangibleValue).toBe(5_000)
    expect(valuation.netTangibleValue).toBe(4_000)
    expect(valuation.liabilityDeduction).toBe(1_000)
    expect(valuation.sustainableEarningsValue).toBe(2_100)
    expect(valuation.marketStrengthIndex).toBe(0.7)
    expect(valuation.marketStrengthValue).toBe(700)
    expect(valuation.strategicCapabilityIndex).toBe(0.51)
    expect(valuation.strategicCapabilityValue).toBe(905.25)
    expect(valuation.growthAdjustment).toBe(870.53)
    expect(valuation.riskDeduction).toBe(617.46)
    expect(valuation.totalReferenceValuation).toBe(7_958.32)
    expect(valuation.referenceEquityUnitValue).toBe(0.7958)
  })

  it('raises valuation when sustainable profit and free cash flow improve', () => {
    const weak = calculateCompanyValuation(baseInput())
    const stronger = calculateCompanyValuation({
      ...baseInput(),
      trailingOperatingProfit: 500,
      trailingFreeCashFlow: 400,
    })

    expect(stronger.totalReferenceValuation).toBeGreaterThan(weak.totalReferenceValuation)
    expect(stronger.sustainableEarningsValue).toBeGreaterThan(weak.sustainableEarningsValue)
  })

  it('reduces valuation when liabilities increase', () => {
    const baseline = calculateCompanyValuation(baseInput())
    const indebted = calculateCompanyValuation({ ...baseInput(), liabilities: 4_500 })

    expect(indebted.liabilityDeduction).toBeGreaterThan(baseline.liabilityDeduction)
    expect(indebted.totalReferenceValuation).toBeLessThan(baseline.totalReferenceValuation)
  })

  it('reduces valuation when operational risk rises and reliability falls', () => {
    const healthy = calculateCompanyValuation(baseInput())
    const stressed = calculateCompanyValuation({
      ...baseInput(),
      operationalRiskScore: 90,
      reliabilityScore: 30,
    })

    expect(stressed.riskDeduction).toBeGreaterThan(healthy.riskDeduction)
    expect(stressed.totalReferenceValuation).toBeLessThan(healthy.totalReferenceValuation)
  })

  it('caps positive growth uplift so extreme growth cannot dominate fundamentals', () => {
    const capped = calculateCompanyValuation({ ...baseInput(), revenueGrowthPercent: 20 })
    const extreme = calculateCompanyValuation({ ...baseInput(), revenueGrowthPercent: 1_000 })

    expect(extreme.growthAdjustment).toBe(capped.growthAdjustment)
    expect(extreme.totalReferenceValuation).toBe(capped.totalReferenceValuation)
  })

  it('caps negative growth penalty and never creates a negative valuation', () => {
    const capped = calculateCompanyValuation({ ...baseInput(), revenueGrowthPercent: -30 })
    const extreme = calculateCompanyValuation({ ...baseInput(), revenueGrowthPercent: -1_000 })

    expect(extreme.growthAdjustment).toBe(capped.growthAdjustment)
    expect(extreme.totalReferenceValuation).toBe(capped.totalReferenceValuation)
    expect(extreme.totalReferenceValuation).toBeGreaterThanOrEqual(0)
  })

  it('does not let reputation alone dominate the company valuation', () => {
    const lowReputation = calculateCompanyValuation({ ...baseInput(), reputationScore: 0 })
    const perfectReputation = calculateCompanyValuation({ ...baseInput(), reputationScore: 100 })
    const difference = perfectReputation.totalReferenceValuation - lowReputation.totalReferenceValuation

    expect(difference).toBeGreaterThan(0)
    expect(difference).toBeLessThan(baseInput().trailingRevenue * 0.2)
  })

  it('does not let technology alone create value without an economic base', () => {
    const startup: CompanyValuationInput = {
      ...baseInput(),
      cash: 0,
      tangibleAssets: 0,
      liabilities: 0,
      trailingRevenue: 0,
      trailingOperatingProfit: 0,
      trailingFreeCashFlow: 0,
      revenueGrowthPercent: 100,
      customerStrengthScore: 0,
      reputationScore: 0,
      demandStrengthScore: 0,
      infrastructureScore: 0,
      technologyScore: 100,
      specialistCapabilityScore: 0,
      reliabilityScore: 100,
      operationalRiskScore: 0,
    }

    const valuation = calculateCompanyValuation(startup)
    expect(valuation.strategicCapabilityIndex).toBe(0.3)
    expect(valuation.strategicCapabilityValue).toBe(0)
    expect(valuation.totalReferenceValuation).toBe(0)
  })

  it('allows sustained losses to offset revenue support instead of rewarding revenue alone', () => {
    const losing = calculateCompanyValuation({
      ...baseInput(),
      trailingOperatingProfit: -500,
      trailingFreeCashFlow: -400,
    })
    const profitable = calculateCompanyValuation(baseInput())

    expect(losing.sustainableEarningsValue).toBeLessThan(0)
    expect(losing.totalReferenceValuation).toBeLessThan(profitable.totalReferenceValuation)
  })

  it('derives reference unit value from the canonical 10,000-unit equity supply', () => {
    const valuation = calculateCompanyValuation(baseInput())
    expect(valuation.referenceEquityUnitValue).toBe(
      Math.round((valuation.totalReferenceValuation / 10_000) * 10_000) / 10_000,
    )
  })

  it('rejects invalid scores and negative balance-sheet inputs', () => {
    const invalid = validateCompanyValuationInput({
      ...baseInput(),
      cash: -1,
      reputationScore: 101,
    })

    expect(invalid.valid).toBe(false)
    expect(invalid.errors.some(error => error.includes('cash'))).toBe(true)
    expect(invalid.errors.some(error => error.includes('reputationScore'))).toBe(true)
  })

  it('rejects malformed valuation policies whose weight groups do not sum to one', () => {
    const malformed: CompanyValuationPolicy = {
      ...COMPANY_VALUATION_POLICY_V1,
      marketWeights: {
        customerStrength: 0.9,
        reputation: 0.9,
        demandStrength: 0.9,
      },
    }

    const result = validateCompanyValuationInput(baseInput(), malformed)
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Market weights must be non-negative and sum to 1.')
  })
})
