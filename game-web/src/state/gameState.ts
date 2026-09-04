import { BALANCING } from '../config/balancing'
import { createOrderForSequence } from '../systems/orderGeneration'
import type { CompanyState, GameSettingsState, WorldState } from '../types/game'
import { PLAYER_START } from '../world/worldLayout'

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
  employees: [],
  payroll: {
    lastProcessedCycle: 0,
  },
  financials: {
    lastProcessedDay: 0,
    totalRevenue: 0,
    totalOperatingExpenses: 0,
    totalSalaryExpenses: 0,
  },
  reviews: [],
  vehicles: [],
})

export const createInitialGameSettingsState = (): GameSettingsState => ({
  tutorialCompleted: false,
})

export const createInitialWorldState = (): WorldState => ({
  player: {
    x: PLAYER_START.x,
    y: PLAYER_START.y,
    currentOrder: '',
    carryingPackage: false,
    movementSpeed: BALANCING.WALKING_MOVEMENT_SPEED,
  },
  activeOrder: createOrderForSequence(1),
  tapTarget: {
    x: PLAYER_START.x,
    y: PLAYER_START.y,
  },
  isMoving: false,
  distanceToTarget: 0,
  arrivalThreshold: 5,
  pickupRadius: 32,
  deliveryRadius: 48,
  pendingDeliveryDestination: '',
})
