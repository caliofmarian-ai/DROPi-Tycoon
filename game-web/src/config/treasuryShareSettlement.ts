import type { InternalTreasuryPricingPolicy } from '../types/treasuryShareSettlement'

/**
 * Prototype treasury pricing policy.
 *
 * The valuation engine supplies a reference basis; this policy governs how that
 * basis becomes a whole Personal Money settlement amount. It is balancing policy,
 * not historical ownership state, and can therefore be versioned independently.
 */
export const INTERNAL_TREASURY_PRICING_POLICY_V1: InternalTreasuryPricingPolicy = {
  version: 'internal-treasury-v1',
  referenceValueMultiplier: 1,
  minimumTotalPrice: 1,
}
