/**
 * Canonical prototype v0.1 balancing values.
 * Owner-approved values for RBATCH-009.
 * All values are replaceable implementation details — change here, not in scenes or systems.
 */
export const BALANCING = {
  INITIAL_MONEY: 0,
  INITIAL_REPUTATION: 50,
  ORDER_REWARD: 100,
  REPUTATION_ON_SUCCESS: 2,
  REPUTATION_ON_FAILURE: -5,
  REPUTATION_MIN: 0,
  REPUTATION_MAX: 100,
} as const
