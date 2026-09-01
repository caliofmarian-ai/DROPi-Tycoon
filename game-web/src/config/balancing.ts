/**
 * Canonical prototype v0.1 balancing values.
 * Owner-approved RBATCH-009 values remain unchanged.
 * Upgrade costs are replaceable implementation details centralized here.
 */
export const BALANCING = {
  INITIAL_COMPANY_NAME: 'DROPi Local',
  INITIAL_COMPANY_LEVEL: 1,
  INITIAL_MONEY: 0,
  INITIAL_REPUTATION: 50,
  ORDER_REWARD: 100,
  REPUTATION_ON_SUCCESS: 2,
  REPUTATION_ON_FAILURE: -5,
  REPUTATION_MIN: 0,
  REPUTATION_MAX: 100,
  // Reachable after the current prototype's first successful delivery.
  // This is a replaceable balancing value, not a canonical fixed price.
  BICYCLE_COST: 100,
} as const
