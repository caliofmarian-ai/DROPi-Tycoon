import type { WorldState } from '../types/game'
import { flagAcceptRequested, isOrderAcceptanceEligible, requestOrderAcceptance } from './orderSystem'

/**
 * Transactional acceptance path shared by all acceptance entry points.
 */
export const applyOrderAcceptanceRequest = (
  worldState: WorldState,
  requestedOrderId: string,
): { worldState: WorldState; accepted: boolean } => {
  const flaggedOrder =
    worldState.activeOrder.status === 'Available' &&
    requestedOrderId === worldState.activeOrder.orderId
      ? flagAcceptRequested(worldState.activeOrder)
      : worldState.activeOrder

  const result = requestOrderAcceptance(flaggedOrder, worldState.player, requestedOrderId)

  return {
    worldState: {
      ...worldState,
      activeOrder: result.order,
      player: result.player,
    },
    accepted: result.accepted,
  }
}

/**
 * Acceptance UI eligibility (same canonical rule as transactional acceptance,
 * without requiring acceptRequested to already be true).
 */
export const canRequestOrderAcceptance = (
  worldState: WorldState,
  requestedOrderId: string,
): boolean => isOrderAcceptanceEligible(worldState.activeOrder, worldState.player, requestedOrderId)
