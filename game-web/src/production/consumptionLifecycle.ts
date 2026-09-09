import {
  addInventory,
  availableInventoryQuantity,
  removeInventory,
  totalInventoryQuantity,
  type InventoryState,
} from '../inventory/inventory'
import type { ProductId } from './productCatalog'
import type { EconomicNodeLocation } from './production'
import {
  deriveInventoryDemand,
  deriveLogisticsOpportunities,
  type DemandRequirement,
  type LogisticsOpportunity,
  type SupplyOffer,
} from '../trade/regionalSupplyDemand'

export interface ConsumptionAmount {
  productId: ProductId
  quantity: number
}

export interface ConsumptionReplenishmentTarget {
  targetId: string
  productId: ProductId
  targetStockUnits: number
}

/**
 * A governed use/consumption process. Quantities are explicit simulation facts;
 * this layer never samples random output, byproduct or waste amounts.
 */
export interface GovernedConsumptionProcess {
  processDefinitionId: string
  inputs: readonly ConsumptionAmount[]
  outputs: readonly ConsumptionAmount[]
  byproducts: readonly ConsumptionAmount[]
  waste: readonly ConsumptionAmount[]
  replenishmentTargets: readonly ConsumptionReplenishmentTarget[]
}

export interface ConsumptionLifecycleState {
  nodeId: string
  location: EconomicNodeLocation
  inventory: InventoryState
  completedProcessIds: readonly string[]
  emittedOpportunityIds: readonly string[]
}

export type ConsumptionProcessResult =
  | {
      status: 'applied'
      state: ConsumptionLifecycleState
      demands: readonly DemandRequirement[]
      emittedOpportunities: readonly LogisticsOpportunity[]
    }
  | {
      status: 'duplicate'
      state: ConsumptionLifecycleState
      demands: readonly []
      emittedOpportunities: readonly []
    }
  | {
      status: 'rejected'
      state: ConsumptionLifecycleState
      demands: readonly []
      emittedOpportunities: readonly []
      reason: string
    }

const validId = (value: string): boolean => value.trim().length > 0 && value.trim().length <= 60
const validPositiveInteger = (value: number): boolean => Number.isSafeInteger(value) && value > 0
const validNonNegativeInteger = (value: number): boolean => Number.isSafeInteger(value) && value >= 0

const validateAmounts = (amounts: readonly ConsumptionAmount[]): void => {
  for (const amount of amounts) {
    if (!validId(amount.productId) || !validPositiveInteger(amount.quantity)) {
      throw new Error('Invalid consumption process amount')
    }
  }
}

const aggregateAmounts = (amounts: readonly ConsumptionAmount[]): ConsumptionAmount[] => {
  const quantities = new Map<ProductId, number>()
  for (const amount of amounts) {
    quantities.set(amount.productId, (quantities.get(amount.productId) ?? 0) + amount.quantity)
  }
  return [...quantities.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([productId, quantity]) => ({ productId, quantity }))
}

const totalAmount = (amounts: readonly ConsumptionAmount[]): number =>
  amounts.reduce((total, amount) => total + amount.quantity, 0)

export const createGovernedConsumptionProcess = (input: {
  processDefinitionId: string
  inputs: readonly ConsumptionAmount[]
  outputs?: readonly ConsumptionAmount[]
  byproducts?: readonly ConsumptionAmount[]
  waste?: readonly ConsumptionAmount[]
  replenishmentTargets?: readonly ConsumptionReplenishmentTarget[]
}): GovernedConsumptionProcess => {
  if (!validId(input.processDefinitionId)) throw new Error('Invalid consumption process identity')
  if (input.inputs.length === 0) throw new Error('Consumption process requires input')

  const outputs = input.outputs ?? []
  const byproducts = input.byproducts ?? []
  const waste = input.waste ?? []
  const replenishmentTargets = input.replenishmentTargets ?? []
  validateAmounts(input.inputs)
  validateAmounts(outputs)
  validateAmounts(byproducts)
  validateAmounts(waste)

  const inputProducts = new Set(input.inputs.map(amount => amount.productId))
  const targetIds = new Set<string>()
  for (const target of replenishmentTargets) {
    if (!validId(target.targetId) || targetIds.has(target.targetId)) {
      throw new Error('Invalid or duplicate replenishment target identity')
    }
    if (!inputProducts.has(target.productId)) {
      throw new Error('Replenishment target must be caused by a consumed input')
    }
    if (!validNonNegativeInteger(target.targetStockUnits)) {
      throw new Error('Invalid replenishment target stock')
    }
    targetIds.add(target.targetId)
  }

  return {
    processDefinitionId: input.processDefinitionId,
    inputs: input.inputs.map(amount => ({ ...amount })),
    outputs: outputs.map(amount => ({ ...amount })),
    byproducts: byproducts.map(amount => ({ ...amount })),
    waste: waste.map(amount => ({ ...amount })),
    replenishmentTargets: replenishmentTargets.map(target => ({ ...target })),
  }
}

export const createConsumptionLifecycleState = (input: {
  nodeId: string
  location: EconomicNodeLocation
  inventory: InventoryState
}): ConsumptionLifecycleState => {
  if (!validId(input.nodeId) || input.inventory.nodeId !== input.nodeId) {
    throw new Error('Consumption node does not own inventory')
  }
  if (!validId(input.location.worldInstanceId) || !validId(input.location.countryId)) {
    throw new Error('Invalid consumption node location')
  }
  return {
    nodeId: input.nodeId,
    location: { ...input.location },
    inventory: input.inventory,
    completedProcessIds: [],
    emittedOpportunityIds: [],
  }
}

const rejected = (state: ConsumptionLifecycleState, reason: string): ConsumptionProcessResult => ({
  status: 'rejected',
  state,
  demands: [],
  emittedOpportunities: [],
  reason,
})

const mutationId = (
  processId: string,
  role: 'input' | 'output' | 'byproduct' | 'waste',
  index: number,
): string => `use:${processId}:${role}:${index}`

/**
 * Applies one use/consumption event atomically from the caller's perspective.
 *
 * Input removal respects active inventory reservations, so stock committed to a
 * producer-logistics mission cannot be stolen by local consumption. Derived
 * replenishment demand is computed only after the real inventory mutation.
 */
export const settleConsumptionProcess = (input: {
  state: ConsumptionLifecycleState
  process: GovernedConsumptionProcess
  processId: string
  upstreamSupplies?: readonly SupplyOffer[]
  transportCapacityUnits?: number
}): ConsumptionProcessResult => {
  const { state, process } = input
  if (!validId(input.processId)) return rejected(state, 'invalid-process-id')
  if (state.completedProcessIds.includes(input.processId)) {
    return { status: 'duplicate', state, demands: [], emittedOpportunities: [] }
  }
  if (state.inventory.nodeId !== state.nodeId) return rejected(state, 'inventory-node-mismatch')

  const transportCapacityUnits = input.transportCapacityUnits ?? 0
  if (!validNonNegativeInteger(transportCapacityUnits)) {
    return rejected(state, 'invalid-transport-capacity')
  }

  const inputs = aggregateAmounts(process.inputs)
  const outputs = aggregateAmounts(process.outputs)
  const byproducts = aggregateAmounts(process.byproducts)
  const waste = aggregateAmounts(process.waste)

  for (const amount of inputs) {
    if (availableInventoryQuantity(state.inventory, amount.productId) < amount.quantity) {
      return rejected(state, `insufficient-unreserved-input:${amount.productId}`)
    }
  }

  const finalInventoryUnits = totalInventoryQuantity(state.inventory)
    - totalAmount(inputs)
    + totalAmount(outputs)
    + totalAmount(byproducts)
    + totalAmount(waste)
  if (finalInventoryUnits > state.inventory.capacityUnits) {
    return rejected(state, 'resulting-inventory-capacity-exceeded')
  }

  let inventory = state.inventory
  for (const [index, amount] of inputs.entries()) {
    const result = removeInventory(
      inventory,
      mutationId(input.processId, 'input', index),
      amount.productId,
      amount.quantity,
    )
    if (result.status !== 'applied') {
      return rejected(state, result.status === 'rejected' ? result.reason : 'duplicate-input-mutation')
    }
    inventory = result.inventory
  }

  const additions: readonly [
    'output' | 'byproduct' | 'waste',
    readonly ConsumptionAmount[],
  ][] = [
    ['output', outputs],
    ['byproduct', byproducts],
    ['waste', waste],
  ]
  for (const [role, amounts] of additions) {
    for (const [index, amount] of amounts.entries()) {
      const result = addInventory(
        inventory,
        mutationId(input.processId, role, index),
        amount.productId,
        amount.quantity,
      )
      if (result.status !== 'applied') {
        return rejected(state, result.status === 'rejected' ? result.reason : `duplicate-${role}-mutation`)
      }
      inventory = result.inventory
    }
  }

  const demands = process.replenishmentTargets
    .map(target => deriveInventoryDemand({
      demandId: `consumption:${input.processId}:${target.targetId}`,
      destinationNodeId: state.nodeId,
      location: state.location,
      inventory,
      productId: target.productId,
      targetStockUnits: target.targetStockUnits,
    }))
    .filter(demand => demand.requiredQuantity > 0)

  const derivedOpportunities = deriveLogisticsOpportunities(
    input.upstreamSupplies ?? [],
    demands,
    transportCapacityUnits,
  )
  const emittedOpportunities = derivedOpportunities.filter(
    opportunity => !state.emittedOpportunityIds.includes(opportunity.opportunityId),
  )

  return {
    status: 'applied',
    state: {
      ...state,
      inventory,
      completedProcessIds: [...state.completedProcessIds, input.processId],
      emittedOpportunityIds: [
        ...state.emittedOpportunityIds,
        ...emittedOpportunities.map(opportunity => opportunity.opportunityId),
      ],
    },
    demands,
    emittedOpportunities,
  }
}
