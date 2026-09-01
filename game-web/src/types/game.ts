export const ORDER_STATUSES = [
  'Created',
  'Available',
  'Accepted',
  'PickedUp',
  'Completed',
  'Failed',
] as const

export type OrderStatus = (typeof ORDER_STATUSES)[number]

export const UPGRADE_IDS = [
  'DeliverySpeed',
  'Capacity',
  'Efficiency',
  'Bicycle',
] as const

export type UpgradeId = (typeof UPGRADE_IDS)[number]
export type PurchasedUpgradeLevels = Record<UpgradeId, number>

export interface OrderState {
  orderId: string
  pickupLocation: string
  destination: string
  status: OrderStatus
  acceptRequested: boolean
  reward: number
  economySettled: boolean
}

export interface CompanyState {
  companyName: string
  money: number
  level: number
  reputation: number
  purchasedUpgradeLevels: PurchasedUpgradeLevels
}

export interface GameSettingsState {
  /**
   * Prototype v0.1 persists only tutorial completion from GameSettings.
   * Language, sound, music and difficulty intentionally remain outside the
   * v0.1 save contract per ODR-003 = B.
   */
  tutorialCompleted: boolean
}

export interface PlayerState {
  x: number
  y: number
  currentOrder: string
  carryingPackage: boolean
  movementSpeed: number
}

export interface WorldState {
  player: PlayerState
  activeOrder: OrderState
  tapTarget: {
    x: number
    y: number
  }
  isMoving: boolean
  distanceToTarget: number
  arrivalThreshold: number
  pickupRadius: number
  deliveryRadius: number
  pendingDeliveryDestination: string
}

export interface GameSessionState {
  world: WorldState
  company: CompanyState
  settings: GameSettingsState
}

export interface PickupContext {
  distanceToPackage: number
  expectedPickupLocation: string
  pickupRadius: number
}

export interface DeliveryContext {
  selectedDestination: string
  distanceToDestination: number
  deliveryRadius: number
  orderConditionsMet: boolean
}
