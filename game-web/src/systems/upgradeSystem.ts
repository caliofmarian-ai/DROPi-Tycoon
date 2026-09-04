import { BALANCING } from '../config/balancing'
import { canAfford } from './economySettlement'
import { addBicycleOwnershipForUpgrade } from './vehicleSystem'
import type { CompanyState, UpgradeId } from '../types/game'

export interface UpgradeDefinition {
  id: UpgradeId
  name: string
  description: string
  cost: number
  maxLevel: number
  availableForPurchase: boolean
}

export const UPGRADE_CATALOG: readonly UpgradeDefinition[] = [
  {
    id: 'DeliverySpeed',
    name: 'Delivery Speed',
    description: 'Canonical upgrade type reserved for a later effect implementation.',
    cost: 0,
    maxLevel: 1,
    availableForPurchase: false,
  },
  {
    id: 'Capacity',
    name: 'Capacity',
    description: 'Canonical upgrade type reserved for a later effect implementation.',
    cost: 0,
    maxLevel: 1,
    availableForPurchase: false,
  },
  {
    id: 'Efficiency',
    name: 'Efficiency',
    description: 'Canonical upgrade type reserved for a later effect implementation.',
    cost: 0,
    maxLevel: 1,
    availableForPurchase: false,
  },
  {
    id: 'Bicycle',
    name: 'Bicycle',
    description: 'First purchasable vehicle. Increases player movement speed after purchase.',
    cost: BALANCING.BICYCLE_COST,
    maxLevel: 1,
    availableForPurchase: true,
  },
] as const

export type PurchaseUpgradeResult =
  | {
      purchased: true
      company: CompanyState
      upgrade: UpgradeDefinition
      message: string
    }
  | {
      purchased: false
      company: CompanyState
      upgrade: UpgradeDefinition | null
      reason: 'unknown-upgrade' | 'unavailable' | 'max-level' | 'not-enough-money' | 'invalid-state'
      message: string
    }

export const getUpgradeDefinition = (upgradeId: UpgradeId): UpgradeDefinition | null =>
  UPGRADE_CATALOG.find((upgrade) => upgrade.id === upgradeId) ?? null

export const getAvailableUpgrades = (): readonly UpgradeDefinition[] =>
  UPGRADE_CATALOG.filter((upgrade) => upgrade.availableForPurchase)

export const purchaseUpgrade = (
  company: CompanyState,
  upgradeId: UpgradeId,
): PurchaseUpgradeResult => {
  const upgrade = getUpgradeDefinition(upgradeId)
  if (!upgrade) {
    return {
      purchased: false,
      company,
      upgrade: null,
      reason: 'unknown-upgrade',
      message: 'Upgrade is not available.',
    }
  }

  if (!upgrade.availableForPurchase) {
    return {
      purchased: false,
      company,
      upgrade,
      reason: 'unavailable',
      message: `${upgrade.name} is not available yet.`,
    }
  }

  const currentLevel = company.purchasedUpgradeLevels[upgradeId]
  if (
    !Number.isSafeInteger(company.money) ||
    company.money < 0 ||
    !Number.isSafeInteger(currentLevel) ||
    currentLevel < 0
  ) {
    return {
      purchased: false,
      company,
      upgrade,
      reason: 'invalid-state',
      message: 'Company upgrade state is invalid.',
    }
  }

  if (currentLevel >= upgrade.maxLevel) {
    return {
      purchased: false,
      company,
      upgrade,
      reason: 'max-level',
      message: `${upgrade.name} is already owned.`,
    }
  }

  if (!canAfford(company.money, upgrade.cost)) {
    return {
      purchased: false,
      company,
      upgrade,
      reason: 'not-enough-money',
      message: `Not enough money. ${upgrade.name} costs ${upgrade.cost}.`,
    }
  }

  const money = company.money - upgrade.cost
  if (!Number.isSafeInteger(money) || money < 0) {
    return {
      purchased: false,
      company,
      upgrade,
      reason: 'invalid-state',
      message: 'Purchase result is invalid.',
    }
  }

  const updated: CompanyState = {
    ...company,
    money,
    purchasedUpgradeLevels: {
      ...company.purchasedUpgradeLevels,
      [upgradeId]: currentLevel + 1,
    },
  }

  return {
    purchased: true,
    upgrade,
    company: upgradeId === 'Bicycle' ? addBicycleOwnershipForUpgrade(updated) : updated,
    message: 'Company improved! Bicycle purchased.',
  }
}
