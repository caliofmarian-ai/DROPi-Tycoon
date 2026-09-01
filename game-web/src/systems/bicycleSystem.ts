import { BALANCING } from '../config/balancing'
import type { CompanyState, WorldState } from '../types/game'

/**
 * Bicycle ownership is represented exclusively by the purchased-upgrade state.
 * No parallel ownership flag is permitted by RBATCH-013.
 */
export const isBicycleOwned = (company: CompanyState): boolean => {
  const level = company.purchasedUpgradeLevels.Bicycle
  return Number.isSafeInteger(level) && level > 0
}

/**
 * Resolve the effective player movement speed from canonical company ownership.
 * The exact numeric values are centralized balancing implementation details.
 */
export const getMovementSpeedForCompany = (company: CompanyState): number =>
  isBicycleOwned(company)
    ? BALANCING.BICYCLE_MOVEMENT_SPEED
    : BALANCING.WALKING_MOVEMENT_SPEED

/**
 * Return a WorldState whose Player movement speed matches current company state.
 * This is pure: neither input object is mutated.
 */
export const synchronizePlayerMovementSpeed = (
  world: WorldState,
  company: CompanyState,
): WorldState => {
  const movementSpeed = getMovementSpeedForCompany(company)

  if (world.player.movementSpeed === movementSpeed) {
    return world
  }

  return {
    ...world,
    player: {
      ...world.player,
      movementSpeed,
    },
  }
}
