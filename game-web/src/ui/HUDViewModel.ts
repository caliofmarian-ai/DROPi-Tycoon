import type { CompanyState, OrderStatus, WorldState } from '../types/game'
import { isOrderAcceptanceEligible } from '../systems/orderSystem'

/**
 * Canonical active-order states: statuses for which the active-order HUD panel is shown.
 * Terminal (Completed, Failed) and pre-active (Created) must not leave a stale panel.
 */
export const ACTIVE_ORDER_STATUSES: ReadonlyArray<OrderStatus> = ['Available', 'Accepted', 'PickedUp']

/**
 * Returns true if the order status warrants showing the active-order HUD panel.
 */
export const isActiveOrderStatus = (status: OrderStatus): boolean =>
  (ACTIVE_ORDER_STATUSES as ReadonlyArray<string>).includes(status)

/**
 * Accept Order button is shown only when the canonical acceptance-eligibility
 * rule allows accepting the currently active order.
 */
export const isAcceptButtonVisible = (worldState: WorldState): boolean =>
  isOrderAcceptanceEligible(
    worldState.activeOrder,
    worldState.player,
    worldState.activeOrder.orderId,
  )

export interface HUDData {
  money: number
  reputation: number
  orderId: string
  orderStatus: OrderStatus
  pickupLocation: string
  destination: string
  reward: number
  carryingPackage: boolean
  showActiveOrder: boolean
  showAcceptButton: boolean
}

/**
 * Derives the complete HUD display state from world and company state.
 * Pure function — no Phaser dependency.
 */
export const buildHUDData = (worldState: WorldState, companyState: CompanyState): HUDData => {
  const { activeOrder, player } = worldState
  return {
    money: companyState.money,
    reputation: companyState.reputation,
    orderId: activeOrder.orderId,
    orderStatus: activeOrder.status,
    pickupLocation: activeOrder.pickupLocation,
    destination: activeOrder.destination,
    reward: activeOrder.reward,
    carryingPackage: player.carryingPackage,
    showActiveOrder: isActiveOrderStatus(activeOrder.status),
    showAcceptButton: isAcceptButtonVisible(worldState),
  }
}
