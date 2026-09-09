import { availableInventoryQuantity, inventoryQuantity, type InventoryState } from '../inventory/inventory'
import type { EconomicNodeLocation } from '../production/production'
import type { ProductId } from '../production/productCatalog'

export interface SupplyOffer {
  supplyId: string
  sourceNodeId: string
  location: EconomicNodeLocation
  productId: ProductId
  availableQuantity: number
}

export interface DemandRequirement {
  demandId: string
  destinationNodeId: string
  location: EconomicNodeLocation
  productId: ProductId
  targetStockUnits: number
  currentStockUnits: number
  requiredQuantity: number
}

export interface LogisticsOpportunity {
  opportunityId: string
  supplyId: string
  demandId: string
  worldInstanceId: string
  productId: ProductId
  sourceNodeId: string
  destinationNodeId: string
  quantity: number
  demandPressure: number
  economicValueSignal: number
}

const validNonNegativeInteger = (value: number): boolean => Number.isSafeInteger(value) && value >= 0
const cloneLocation = (location: EconomicNodeLocation): EconomicNodeLocation => ({
  ...location,
  ...(location.cityEndpoint ? { cityEndpoint: { ...location.cityEndpoint } } : {}),
})

export const deriveSupplyOffer = (input: {
  supplyId: string
  sourceNodeId: string
  location: EconomicNodeLocation
  inventory: InventoryState
  productId: ProductId
  retainQuantity?: number
}): SupplyOffer => {
  const retainQuantity = input.retainQuantity ?? 0
  if (input.sourceNodeId !== input.inventory.nodeId) throw new Error('Supply node does not own inventory')
  if (!validNonNegativeInteger(retainQuantity)) throw new Error('Invalid retained supply quantity')
  return {
    supplyId: input.supplyId,
    sourceNodeId: input.sourceNodeId,
    location: cloneLocation(input.location),
    productId: input.productId,
    availableQuantity: Math.max(0, availableInventoryQuantity(input.inventory, input.productId) - retainQuantity),
  }
}

export const deriveInventoryDemand = (input: {
  demandId: string
  destinationNodeId: string
  location: EconomicNodeLocation
  inventory: InventoryState
  productId: ProductId
  targetStockUnits: number
}): DemandRequirement => {
  if (input.destinationNodeId !== input.inventory.nodeId) throw new Error('Demand node does not own inventory')
  if (!validNonNegativeInteger(input.targetStockUnits)) throw new Error('Invalid target stock')
  const currentStockUnits = inventoryQuantity(input.inventory, input.productId)
  return {
    demandId: input.demandId,
    destinationNodeId: input.destinationNodeId,
    location: cloneLocation(input.location),
    productId: input.productId,
    targetStockUnits: input.targetStockUnits,
    currentStockUnits,
    requiredQuantity: Math.max(0, input.targetStockUnits - currentStockUnits),
  }
}

export const deriveLogisticsOpportunities = (
  supplies: readonly SupplyOffer[],
  demands: readonly DemandRequirement[],
  transportCapacityUnits: number,
): LogisticsOpportunity[] => {
  if (!validNonNegativeInteger(transportCapacityUnits) || transportCapacityUnits === 0) return []
  const remainingSupply = new Map(supplies.map(supply => [supply.supplyId, supply.availableQuantity]))
  const opportunities: LogisticsOpportunity[] = []
  const orderedDemands = [...demands].sort((a, b) => a.demandId.localeCompare(b.demandId))
  const orderedSupplies = [...supplies].sort((a, b) => a.supplyId.localeCompare(b.supplyId))

  for (const demand of orderedDemands) {
    let remainingDemand = demand.requiredQuantity
    if (remainingDemand <= 0) continue
    for (const supply of orderedSupplies) {
      if (remainingDemand <= 0) break
      if (supply.productId !== demand.productId || supply.location.worldInstanceId !== demand.location.worldInstanceId) continue
      if (supply.sourceNodeId === demand.destinationNodeId) continue
      const supplyRemaining = remainingSupply.get(supply.supplyId) ?? 0
      const quantity = Math.min(supplyRemaining, remainingDemand, transportCapacityUnits)
      if (quantity <= 0) continue
      const demandPressure = demand.targetStockUnits === 0 ? 0 : demand.requiredQuantity / demand.targetStockUnits
      opportunities.push({
        opportunityId: `opportunity:${supply.supplyId}:${demand.demandId}`,
        supplyId: supply.supplyId,
        demandId: demand.demandId,
        worldInstanceId: demand.location.worldInstanceId,
        productId: demand.productId,
        sourceNodeId: supply.sourceNodeId,
        destinationNodeId: demand.destinationNodeId,
        quantity,
        demandPressure,
        economicValueSignal: Number((quantity * demandPressure).toFixed(6)),
      })
      remainingSupply.set(supply.supplyId, supplyRemaining - quantity)
      remainingDemand -= quantity
    }
  }
  return opportunities
}
