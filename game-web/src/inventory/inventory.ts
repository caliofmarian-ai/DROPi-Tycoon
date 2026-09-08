import type { ProductId } from '../production/productCatalog'

export interface InventoryReservation {
  reservationId: string
  productId: ProductId
  quantity: number
  status: 'active' | 'consumed' | 'released'
}

export interface InventoryState {
  inventoryId: string
  nodeId: string
  capacityUnits: number
  quantities: Readonly<Record<string, number>>
  reservations: Readonly<Record<string, InventoryReservation>>
  appliedMutationIds: readonly string[]
}

export type InventoryResult =
  | { status: 'applied'; inventory: InventoryState }
  | { status: 'duplicate'; inventory: InventoryState }
  | { status: 'rejected'; inventory: InventoryState; reason: string }

const validId = (value: string): boolean => value.trim().length > 0 && value.trim().length <= 160
const validQuantity = (value: number): boolean => Number.isSafeInteger(value) && value > 0
const validCapacity = (value: number): boolean => Number.isSafeInteger(value) && value >= 0

const cloneReservations = (reservations: InventoryState['reservations']): Record<string, InventoryReservation> =>
  Object.fromEntries(Object.entries(reservations).map(([key, value]) => [key, { ...value }]))

const withMutation = (inventory: InventoryState, mutationId: string): InventoryState => ({
  ...inventory,
  appliedMutationIds: [...inventory.appliedMutationIds, mutationId],
})

export const totalInventoryQuantity = (inventory: InventoryState): number =>
  Object.values(inventory.quantities).reduce((total, quantity) => total + quantity, 0)

export const remainingInventoryCapacity = (inventory: InventoryState): number =>
  Math.max(0, inventory.capacityUnits - totalInventoryQuantity(inventory))

export const reservedInventoryQuantity = (inventory: InventoryState, productId: ProductId): number =>
  Object.values(inventory.reservations).reduce((total, reservation) =>
    reservation.status === 'active' && reservation.productId === productId
      ? total + reservation.quantity
      : total, 0)

export const inventoryQuantity = (inventory: InventoryState, productId: ProductId): number =>
  inventory.quantities[productId] ?? 0

export const availableInventoryQuantity = (inventory: InventoryState, productId: ProductId): number =>
  Math.max(0, inventoryQuantity(inventory, productId) - reservedInventoryQuantity(inventory, productId))

export const createInventory = (input: {
  inventoryId: string
  nodeId: string
  capacityUnits: number
  initial?: readonly { productId: ProductId; quantity: number }[]
}): InventoryState => {
  if (!validId(input.inventoryId) || !validId(input.nodeId)) throw new Error('Invalid inventory identity')
  if (!validCapacity(input.capacityUnits)) throw new Error('Invalid inventory capacity')

  const quantities: Record<string, number> = {}
  for (const item of input.initial ?? []) {
    if (!validId(item.productId) || !validQuantity(item.quantity)) throw new Error('Invalid initial inventory item')
    quantities[item.productId] = (quantities[item.productId] ?? 0) + item.quantity
  }
  const inventory: InventoryState = {
    inventoryId: input.inventoryId.trim(),
    nodeId: input.nodeId.trim(),
    capacityUnits: input.capacityUnits,
    quantities,
    reservations: {},
    appliedMutationIds: [],
  }
  if (totalInventoryQuantity(inventory) > inventory.capacityUnits) throw new Error('Initial inventory exceeds capacity')
  return inventory
}

export const addInventory = (
  inventory: InventoryState,
  mutationId: string,
  productId: ProductId,
  quantity: number,
): InventoryResult => {
  if (!validId(mutationId) || !validId(productId) || !validQuantity(quantity)) {
    return { status: 'rejected', inventory, reason: 'invalid-addition' }
  }
  if (inventory.appliedMutationIds.includes(mutationId)) return { status: 'duplicate', inventory }
  if (quantity > remainingInventoryCapacity(inventory)) {
    return { status: 'rejected', inventory, reason: 'capacity-exceeded' }
  }
  const updated: InventoryState = {
    ...inventory,
    quantities: { ...inventory.quantities, [productId]: inventoryQuantity(inventory, productId) + quantity },
  }
  return { status: 'applied', inventory: withMutation(updated, mutationId) }
}

export const removeInventory = (
  inventory: InventoryState,
  mutationId: string,
  productId: ProductId,
  quantity: number,
): InventoryResult => {
  if (!validId(mutationId) || !validId(productId) || !validQuantity(quantity)) {
    return { status: 'rejected', inventory, reason: 'invalid-removal' }
  }
  if (inventory.appliedMutationIds.includes(mutationId)) return { status: 'duplicate', inventory }
  if (quantity > availableInventoryQuantity(inventory, productId)) {
    return { status: 'rejected', inventory, reason: 'insufficient-unreserved-inventory' }
  }
  const nextQuantity = inventoryQuantity(inventory, productId) - quantity
  const quantities = { ...inventory.quantities }
  if (nextQuantity === 0) delete quantities[productId]
  else quantities[productId] = nextQuantity
  return { status: 'applied', inventory: withMutation({ ...inventory, quantities }, mutationId) }
}

export const reserveInventory = (
  inventory: InventoryState,
  reservationId: string,
  productId: ProductId,
  quantity: number,
): InventoryResult => {
  if (!validId(reservationId) || !validId(productId) || !validQuantity(quantity)) {
    return { status: 'rejected', inventory, reason: 'invalid-reservation' }
  }
  if (inventory.reservations[reservationId]) return { status: 'duplicate', inventory }
  if (quantity > availableInventoryQuantity(inventory, productId)) {
    return { status: 'rejected', inventory, reason: 'insufficient-available-inventory' }
  }
  return {
    status: 'applied',
    inventory: {
      ...inventory,
      reservations: {
        ...cloneReservations(inventory.reservations),
        [reservationId]: { reservationId, productId, quantity, status: 'active' },
      },
    },
  }
}

export const releaseInventoryReservation = (inventory: InventoryState, reservationId: string): InventoryResult => {
  const existing = inventory.reservations[reservationId]
  if (!existing) return { status: 'rejected', inventory, reason: 'reservation-not-found' }
  if (existing.status !== 'active') return { status: 'duplicate', inventory }
  return {
    status: 'applied',
    inventory: {
      ...inventory,
      reservations: {
        ...cloneReservations(inventory.reservations),
        [reservationId]: { ...existing, status: 'released' },
      },
    },
  }
}

export const consumeInventoryReservation = (inventory: InventoryState, reservationId: string): InventoryResult => {
  const existing = inventory.reservations[reservationId]
  if (!existing) return { status: 'rejected', inventory, reason: 'reservation-not-found' }
  if (existing.status !== 'active') return { status: 'duplicate', inventory }
  const current = inventoryQuantity(inventory, existing.productId)
  if (existing.quantity > current) return { status: 'rejected', inventory, reason: 'reservation-invariant-broken' }
  const quantities = { ...inventory.quantities }
  const nextQuantity = current - existing.quantity
  if (nextQuantity === 0) delete quantities[existing.productId]
  else quantities[existing.productId] = nextQuantity
  return {
    status: 'applied',
    inventory: {
      ...inventory,
      quantities,
      reservations: {
        ...cloneReservations(inventory.reservations),
        [reservationId]: { ...existing, status: 'consumed' },
      },
    },
  }
}
