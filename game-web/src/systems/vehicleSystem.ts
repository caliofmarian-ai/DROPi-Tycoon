import { BALANCING } from '../config/balancing'
import type {
  CompanyState,
  OwnedVehicleState,
  VehicleTypeId,
} from '../types/game'

export type VehicleCategory =
  | 'Personal Transportation'
  | 'Light Delivery Vehicle'
  | 'Delivery Van'

export interface VehicleDefinition {
  typeId: VehicleTypeId
  name: string
  category: VehicleCategory
  description: string
  purchaseCost: number
  speedLabel: 'Low' | 'Medium' | 'High'
  capacityLabel: 'Low' | 'Medium' | 'High'
  singleInstance: boolean
  /** RBATCH-023 daily maintenance cost. Centralized replaceable tuning value. */
  maintenanceCostPerDay: number
}

export const VEHICLE_CATALOG: readonly VehicleDefinition[] = [
  {
    typeId: 'Bicycle',
    name: 'Bicycle',
    category: 'Personal Transportation',
    description: 'Early company investment for faster personal deliveries.',
    purchaseCost: BALANCING.BICYCLE_COST,
    speedLabel: 'Low',
    capacityLabel: 'Low',
    singleInstance: true,
    maintenanceCostPerDay: BALANCING.BICYCLE_MAINTENANCE_COST_PER_DAY,
  },
  {
    typeId: 'ElectricScooter',
    name: 'Electric Scooter',
    category: 'Light Delivery Vehicle',
    description: 'Light urban vehicle for faster local delivery operations.',
    purchaseCost: BALANCING.ELECTRIC_SCOOTER_COST,
    speedLabel: 'Medium',
    capacityLabel: 'Low',
    singleInstance: true,
    maintenanceCostPerDay: BALANCING.ELECTRIC_SCOOTER_MAINTENANCE_COST_PER_DAY,
  },
  {
    typeId: 'Motorcycle',
    name: 'Motorcycle',
    category: 'Light Delivery Vehicle',
    description: 'Faster light-delivery vehicle for an expanding company.',
    purchaseCost: BALANCING.MOTORCYCLE_COST,
    speedLabel: 'High',
    capacityLabel: 'Low',
    singleInstance: true,
    maintenanceCostPerDay: BALANCING.MOTORCYCLE_MAINTENANCE_COST_PER_DAY,
  },
  {
    typeId: 'DeliveryVan',
    name: 'Delivery Van',
    category: 'Delivery Van',
    description: 'Professional logistics vehicle with higher cargo capacity.',
    purchaseCost: BALANCING.DELIVERY_VAN_COST,
    speedLabel: 'Medium',
    capacityLabel: 'High',
    singleInstance: true,
    maintenanceCostPerDay: BALANCING.DELIVERY_VAN_MAINTENANCE_COST_PER_DAY,
  },
] as const

export type PurchaseVehicleResult =
  | {
      purchased: true
      company: CompanyState
      definition: VehicleDefinition
      vehicle: OwnedVehicleState
      message: string
    }
  | {
      purchased: false
      company: CompanyState
      definition: VehicleDefinition | null
      reason: 'unknown-vehicle' | 'already-owned' | 'not-enough-money' | 'invalid-state'
      message: string
    }

const bicycleVehicle = (): OwnedVehicleState => ({
  vehicleId: 'VEHICLE-BICYCLE-001',
  typeId: 'Bicycle',
})

export const getVehicleDefinition = (typeId: VehicleTypeId): VehicleDefinition | null =>
  VEHICLE_CATALOG.find((vehicle) => vehicle.typeId === typeId) ?? null

export const ownsVehicleType = (company: CompanyState, typeId: VehicleTypeId): boolean =>
  company.vehicles.some((vehicle) => vehicle.typeId === typeId) ||
  (typeId === 'Bicycle' && company.purchasedUpgradeLevels.Bicycle > 0)

export const reconcileLegacyBicycleOwnership = (company: CompanyState): CompanyState => {
  const upgradeOwned = company.purchasedUpgradeLevels.Bicycle > 0
  const fleetOwned = company.vehicles.some((vehicle) => vehicle.typeId === 'Bicycle')

  if (upgradeOwned && !fleetOwned) {
    return { ...company, vehicles: [...company.vehicles, bicycleVehicle()] }
  }

  if (!upgradeOwned && fleetOwned) {
    return {
      ...company,
      purchasedUpgradeLevels: {
        ...company.purchasedUpgradeLevels,
        Bicycle: 1,
      },
    }
  }

  return company
}

export const addBicycleOwnershipForUpgrade = (company: CompanyState): CompanyState =>
  reconcileLegacyBicycleOwnership({
    ...company,
    purchasedUpgradeLevels: {
      ...company.purchasedUpgradeLevels,
      Bicycle: Math.max(1, company.purchasedUpgradeLevels.Bicycle),
    },
  })

const buildOwnedVehicle = (
  typeId: VehicleTypeId,
  existingVehicles: readonly OwnedVehicleState[],
): OwnedVehicleState => {
  const sameTypeCount = existingVehicles.filter((vehicle) => vehicle.typeId === typeId).length
  const sequence = String(sameTypeCount + 1).padStart(3, '0')
  return {
    vehicleId: `VEHICLE-${typeId.toUpperCase()}-${sequence}`,
    typeId,
  }
}

export const purchaseVehicle = (
  company: CompanyState,
  typeId: VehicleTypeId,
): PurchaseVehicleResult => {
  const definition = getVehicleDefinition(typeId)
  if (!definition) {
    return {
      purchased: false,
      company,
      definition: null,
      reason: 'unknown-vehicle',
      message: 'Vehicle is not available.',
    }
  }

  const normalized = reconcileLegacyBicycleOwnership(company)

  if (
    !Number.isSafeInteger(normalized.money) ||
    normalized.money < 0 ||
    !Array.isArray(normalized.vehicles)
  ) {
    return {
      purchased: false,
      company: normalized,
      definition,
      reason: 'invalid-state',
      message: 'Company vehicle state is invalid.',
    }
  }

  if (definition.singleInstance && ownsVehicleType(normalized, typeId)) {
    return {
      purchased: false,
      company: normalized,
      definition,
      reason: 'already-owned',
      message: `${definition.name} is already owned.`,
    }
  }

  if (normalized.money < definition.purchaseCost) {
    return {
      purchased: false,
      company: normalized,
      definition,
      reason: 'not-enough-money',
      message: `Not enough money. ${definition.name} costs ${definition.purchaseCost}.`,
    }
  }

  const money = normalized.money - definition.purchaseCost
  if (!Number.isSafeInteger(money) || money < 0) {
    return {
      purchased: false,
      company: normalized,
      definition,
      reason: 'invalid-state',
      message: 'Vehicle purchase result is invalid.',
    }
  }

  const vehicle = typeId === 'Bicycle'
    ? bicycleVehicle()
    : buildOwnedVehicle(typeId, normalized.vehicles)

  let purchasedCompany: CompanyState = {
    ...normalized,
    money,
    vehicles: [...normalized.vehicles, vehicle],
  }

  if (typeId === 'Bicycle') {
    purchasedCompany = addBicycleOwnershipForUpgrade(purchasedCompany)
  }

  return {
    purchased: true,
    company: purchasedCompany,
    definition,
    vehicle,
    message: `${definition.name} purchased for the company fleet.`,
  }
}

/**
 * RBATCH-023 — total daily maintenance owed for the current owned fleet.
 * Deterministic, centrally-tuned per VEHICLE_CATALOG.maintenanceCostPerDay.
 */
export const calculateDailyVehicleMaintenanceExpense = (company: CompanyState): number =>
  company.vehicles.reduce((total, vehicle) => {
    const definition = getVehicleDefinition(vehicle.typeId)
    return total + (definition?.maintenanceCostPerDay ?? 0)
  }, 0)

/**
 * Owner quality-gate presentation rule (Workstream D). There is no canonical
 * "active vehicle" selection mechanic yet, so the visible player/operator
 * representation deterministically uses the highest currently-owned
 * compatible personal delivery vehicle in this fixed progression order:
 *
 *   Delivery Van > Motorcycle > Electric Scooter > Bicycle > walking
 *
 * This selection is presentation-only. It does not change movement speed,
 * economy, or any other gameplay semantics, which remain governed solely by
 * existing systems (see bicycleSystem.ts).
 */
export const PLAYER_VISUAL_VEHICLE_PRIORITY: readonly VehicleTypeId[] = [
  'DeliveryVan',
  'Motorcycle',
  'ElectricScooter',
  'Bicycle',
]

export const selectActiveVehiclePresentation = (company: CompanyState): VehicleTypeId | null =>
  PLAYER_VISUAL_VEHICLE_PRIORITY.find((typeId) => ownsVehicleType(company, typeId)) ?? null
