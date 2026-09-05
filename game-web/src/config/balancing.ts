/**
 * Canonical prototype v0.1 balancing values plus replaceable Phase-2
 * implementation values. Numeric values introduced by runtime batches remain
 * centralized here and are not promoted to permanent game-design canon unless
 * explicitly approved later.
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
  // remaining a replaceable prototype value.
  BICYCLE_MOVEMENT_SPEED: 225,

  // Reachable after the current prototype's first successful delivery.
  BICYCLE_COST: 100,

  // RBATCH-018 implementation balancing. Hiring intentionally competes with
  // an early vehicle purchase so company growth begins to require choices.
  // These are tuning values, not permanent canonical prices.
  FIRST_COURIER_HIRE_COST: 100,
  FIRST_COURIER_SALARY_PER_CYCLE: 25,

  // RBATCH-019 implementation balancing. Daily operating cost is deliberately
  // simple and derived from authoritative company state. These values remain
  // replaceable tuning details; no real-time day cadence is implied here.
  DAILY_BASE_OPERATING_EXPENSE: 10,
  DAILY_ACTIVE_EMPLOYEE_OPERATING_EXPENSE: 5,

  // RBATCH-022 fleet purchasing values. VEHICLES.md defines the progression
  // families; these concrete prices are replaceable implementation tuning.
  ELECTRIC_SCOOTER_COST: 300,
  MOTORCYCLE_COST: 600,
  DELIVERY_VAN_COST: 1200,
} as const
