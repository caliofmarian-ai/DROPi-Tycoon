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
