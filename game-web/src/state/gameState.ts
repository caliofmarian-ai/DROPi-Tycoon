import { BALANCING } from '../config/balancing'
import type { CompanyState, WorldState } from '../types/game'

export const WORLD_WIDTH = 800
export const WORLD_HEIGHT = 600

export const createInitialCompanyState = (): CompanyState => ({
  companyName: BALANCING.INITIAL_COMPANY_NAME,
  money: BALANCING.INITIAL_MONEY,
  level: BALANCING.INITIAL_COMPANY_LEVEL,
  reputation: BALANCING.INITIAL_REPUTATION,
  purchasedUpgradeLevels: {
    DeliverySpeed: 0,
    Capacity: 0,
    Efficiency: 0,
    Bicycle: 0,
  },
})

export const createInitialWorldState = (): WorldState => ({
  player: {
    x: 380,
    y: 270,
    currentOrder: '',
    carryingPackage: false,
    movementSpeed: BALANCING.WALKING_MOVEMENT_SPEED,
  },
  activeOrder: {
    orderId: 'ORDER-001',
    pickupLocation: 'PickupZone',
    destination: 'DeliveryZone',
    status: 'Available',
    acceptRequested: false,
    reward: BALANCING.ORDER_REWARD,
    economySettled: false,
  },
  tapTarget: {
    x: 380,
    y: 270,
  },
  isMoving: false,
  distanceToTarget: 0,
  arrivalThreshold: 5,
  pickupRadius: 32,
  deliveryRadius: 48,
  pendingDeliveryDestination: '',
})
