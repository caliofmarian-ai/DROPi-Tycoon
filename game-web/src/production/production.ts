import {
  type ExternalEconomicNodeKind,
  type ProductGroup,
  type ProductionRecipe,
  type WorldClockState,
} from '../world/globalWorld'
import { worldClockMinuteOrdinal } from '../systems/worldClockSystem'
import {
  addInventory,
  availableInventoryQuantity,
  createInventory,
  removeInventory,
  totalInventoryQuantity,
  type InventoryState,
} from '../inventory/inventory'
import { PRODUCT_CATALOG, type ProductId } from './productCatalog'

export interface EconomicNodeLocation {
  worldInstanceId: string
  countryId: string
  administrativeRegionId?: string
  localityId?: string
}

export interface ProductAmount {
  productId: ProductId
  group: ProductGroup
  quantity: number
}

/** Runtime specialization of the existing global-world ProductionRecipe contract. */
export interface ExecutableProductionRecipe extends ProductionRecipe {
  inputs: readonly ProductAmount[]
  outputs: readonly ProductAmount[]
  compatibleFacilityKinds: readonly ExternalEconomicNodeKind[]
  capacityUnitsRequired: number
  processingMinutes: number
}

export interface ProductiveNodeState {
  nodeId: string
  kind: ExternalEconomicNodeKind
  location: EconomicNodeLocation
  inventory: InventoryState
  productionCapacityUnits: number
  specialistIndex: number
  infrastructureIndex: number
  completedCycleIds: readonly string[]
}

export type ProductionCycleResult =
  | { status: 'applied'; node: ProductiveNodeState }
  | { status: 'duplicate'; node: ProductiveNodeState }
  | { status: 'rejected'; node: ProductiveNodeState; reason: string }

const validPositiveInteger = (value: number): boolean => Number.isSafeInteger(value) && value > 0
const validIndex = (value: number): boolean => Number.isFinite(value) && value >= 0
const groupsFor = (items: readonly ProductAmount[]): ProductGroup[] => [...new Set(items.map(item => item.group))]

export const createExecutableProductionRecipe = (input: {
  recipeId: string
  inputs: readonly ProductAmount[]
  outputs: readonly ProductAmount[]
  compatibleFacilityKinds: readonly ExternalEconomicNodeKind[]
  capacityUnitsRequired: number
  processingMinutes: number
  minimumSpecialistIndex?: number
  minimumInfrastructureIndex?: number
}): ExecutableProductionRecipe => {
  if (input.recipeId.trim().length === 0) throw new Error('Invalid recipe identity')
  if (input.inputs.length === 0 || input.outputs.length === 0) throw new Error('Recipe requires inputs and outputs')
  if (input.compatibleFacilityKinds.length === 0) throw new Error('Recipe requires compatible facility')
  if (!validPositiveInteger(input.capacityUnitsRequired) || !validPositiveInteger(input.processingMinutes)) {
    throw new Error('Invalid recipe capacity/time')
  }
  for (const item of [...input.inputs, ...input.outputs]) {
    if (!validPositiveInteger(item.quantity)) throw new Error('Invalid recipe quantity')
  }
  const minimumSpecialistIndex = input.minimumSpecialistIndex ?? 0
  const minimumInfrastructureIndex = input.minimumInfrastructureIndex ?? 0
  if (!validIndex(minimumSpecialistIndex) || !validIndex(minimumInfrastructureIndex)) {
    throw new Error('Invalid recipe operating requirement')
  }
  return {
    recipeId: input.recipeId,
    inputGroups: groupsFor(input.inputs),
    outputGroups: groupsFor(input.outputs),
    minimumSpecialistIndex,
    minimumInfrastructureIndex,
    productionCycles: 1,
    inputs: input.inputs.map(item => ({ ...item })),
    outputs: input.outputs.map(item => ({ ...item })),
    compatibleFacilityKinds: [...input.compatibleFacilityKinds],
    capacityUnitsRequired: input.capacityUnitsRequired,
    processingMinutes: input.processingMinutes,
  }
}

export const createProductiveNode = (input: {
  nodeId: string
  kind: ExternalEconomicNodeKind
  location: EconomicNodeLocation
  inventoryCapacityUnits: number
  initialInventory?: readonly { productId: ProductId; quantity: number }[]
  productionCapacityUnits: number
  specialistIndex?: number
  infrastructureIndex?: number
}): ProductiveNodeState => {
  if (!validPositiveInteger(input.productionCapacityUnits)) throw new Error('Invalid production capacity')
  const specialistIndex = input.specialistIndex ?? 0
  const infrastructureIndex = input.infrastructureIndex ?? 0
  if (!validIndex(specialistIndex) || !validIndex(infrastructureIndex)) throw new Error('Invalid productive node index')
  return {
    nodeId: input.nodeId,
    kind: input.kind,
    location: { ...input.location },
    inventory: createInventory({
      inventoryId: `inventory:${input.nodeId}`,
      nodeId: input.nodeId,
      capacityUnits: input.inventoryCapacityUnits,
      initial: input.initialInventory,
    }),
    productionCapacityUnits: input.productionCapacityUnits,
    specialistIndex,
    infrastructureIndex,
    completedCycleIds: [],
  }
}

const clockMatchesNode = (clock: WorldClockState, node: ProductiveNodeState): boolean =>
  clock.worldInstanceId === node.location.worldInstanceId

export const settleProductionCycle = (
  node: ProductiveNodeState,
  recipe: ExecutableProductionRecipe,
  cycleId: string,
  startedAt: WorldClockState,
  completedAt: WorldClockState,
): ProductionCycleResult => {
  if (cycleId.trim().length === 0) return { status: 'rejected', node, reason: 'invalid-cycle-id' }
  if (node.completedCycleIds.includes(cycleId)) return { status: 'duplicate', node }
  if (!clockMatchesNode(startedAt, node) || !clockMatchesNode(completedAt, node)) {
    return { status: 'rejected', node, reason: 'world-instance-mismatch' }
  }
  if (!recipe.compatibleFacilityKinds.includes(node.kind)) return { status: 'rejected', node, reason: 'facility-incompatible' }
  if (node.productionCapacityUnits < recipe.capacityUnitsRequired) return { status: 'rejected', node, reason: 'production-capacity-insufficient' }
  if (node.specialistIndex < recipe.minimumSpecialistIndex) return { status: 'rejected', node, reason: 'specialist-capability-insufficient' }
  if (node.infrastructureIndex < recipe.minimumInfrastructureIndex) return { status: 'rejected', node, reason: 'infrastructure-insufficient' }

  const startMinute = worldClockMinuteOrdinal(startedAt)
  const completionMinute = worldClockMinuteOrdinal(completedAt)
  if (completionMinute - startMinute < recipe.processingMinutes) {
    return { status: 'rejected', node, reason: 'processing-time-incomplete' }
  }
  for (const input of recipe.inputs) {
    if (availableInventoryQuantity(node.inventory, input.productId) < input.quantity) {
      return { status: 'rejected', node, reason: `missing-input:${input.productId}` }
    }
  }
  const consumedUnits = recipe.inputs.reduce((total, item) => total + item.quantity, 0)
  const outputUnits = recipe.outputs.reduce((total, item) => total + item.quantity, 0)
  if (totalInventoryQuantity(node.inventory) - consumedUnits + outputUnits > node.inventory.capacityUnits) {
    return { status: 'rejected', node, reason: 'output-capacity-exceeded' }
  }

  let inventory = node.inventory
  for (const input of recipe.inputs) {
    const result = removeInventory(inventory, `production:${cycleId}:input:${input.productId}`, input.productId, input.quantity)
    if (result.status !== 'applied') return { status: 'rejected', node, reason: result.status === 'rejected' ? result.reason : 'duplicate-input-mutation' }
    inventory = result.inventory
  }
  for (const output of recipe.outputs) {
    const result = addInventory(inventory, `production:${cycleId}:output:${output.productId}`, output.productId, output.quantity)
    if (result.status !== 'applied') return { status: 'rejected', node, reason: result.status === 'rejected' ? result.reason : 'duplicate-output-mutation' }
    inventory = result.inventory
  }
  return {
    status: 'applied',
    node: { ...node, inventory, completedCycleIds: [...node.completedCycleIds, cycleId] },
  }
}

export const TIMBER_TO_PULP_RECIPE = createExecutableProductionRecipe({
  recipeId: 'recipe:timber-to-pulp:v1',
  inputs: [{ productId: PRODUCT_CATALOG.rawTimber.productId, group: PRODUCT_CATALOG.rawTimber.group, quantity: 4 }],
  outputs: [{ productId: PRODUCT_CATALOG.woodPulp.productId, group: PRODUCT_CATALOG.woodPulp.group, quantity: 3 }],
  compatibleFacilityKinds: ['PaperMill'],
  capacityUnitsRequired: 1,
  processingMinutes: 60,
})

export const PULP_TO_PACKAGING_RECIPE = createExecutableProductionRecipe({
  recipeId: 'recipe:pulp-to-packaging:v1',
  inputs: [{ productId: PRODUCT_CATALOG.woodPulp.productId, group: PRODUCT_CATALOG.woodPulp.group, quantity: 3 }],
  outputs: [{ productId: PRODUCT_CATALOG.paperPackaging.productId, group: PRODUCT_CATALOG.paperPackaging.group, quantity: 2 }],
  compatibleFacilityKinds: ['PaperMill'],
  capacityUnitsRequired: 1,
  processingMinutes: 60,
})
