import type { WorldState } from '../types/game'

export const WORLD_WIDTH = 800
export const WORLD_HEIGHT = 600

export const createInitialWorldState = (): WorldState => ({
  player: {
    x: 380,
    y: 270,
    currentOrder: '',
    carryingPackage: false,
    movementSpeed: 150,
  },
  activeOrder: {
    orderId: 'ORDER-001',
    pickupLocation: 'PickupZone',
    destination: 'DeliveryZone',
    status: 'Available',
    acceptRequested: false,
  },
  tapTarget: {
    x: 380,
    y: 270,
  },
  isMoving: false,
  distanceToTarget: 0,
  arrivalThreshold: 5,
  pickupRadius: 32,
})
