import type { CompanyState, OrderStatus, WorldState } from '../types/game'

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
 * Accept Order button is shown only when the order is Available.
 * All other states (Created, Accepted, PickedUp, Completed, Failed) must hide/disable it.
 */
export const isAcceptButtonVisible = (status: OrderStatus): boolean => status === 'Available'

export interface HUDData {
  money: number
  reputation: number
  orderStatus: OrderStatus
  destination: string
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
    orderStatus: activeOrder.status,
    destination: activeOrder.destination,
    carryingPackage: player.carryingPackage,
    showActiveOrder: isActiveOrderStatus(activeOrder.status),
    showAcceptButton: isAcceptButtonVisible(activeOrder.status),
  }
}
