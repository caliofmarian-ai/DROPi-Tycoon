export const ORDER_STATUSES = [
  'Created',
  'Available',
  'Accepted',
  'PickedUp',
  'Completed',
  'Failed',
] as const

export type OrderStatus = (typeof ORDER_STATUSES)[number]

export interface OrderState {
  orderId: string
  pickupLocation: string
  destination: string
  status: OrderStatus
  acceptRequested: boolean
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
}

export interface PickupContext {
  distanceToPackage: number
  expectedPickupLocation: string
  pickupRadius: number
}
