/**
 * Canonical prototype v0.1 balancing values.
 * Owner-approved RBATCH-009 values remain unchanged.
 * Upgrade costs and movement values introduced later are replaceable
 * implementation details centralized here rather than embedded in scenes.
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

  // RBATCH-006 established the walking baseline at 150 px/s.
  WALKING_MOVEMENT_SPEED: 150,

  // RBATCH-013 implementation balancing: clearly faster than walking while
  // remaining a replaceable prototype value. Canon requires an increase but
  // does not prescribe an exact numeric Bicycle speed.
  BICYCLE_MOVEMENT_SPEED: 225,

  // Reachable after the current prototype's first successful delivery.
  // This is a replaceable balancing value, not a canonical fixed price.
  BICYCLE_COST: 100,
} as const
