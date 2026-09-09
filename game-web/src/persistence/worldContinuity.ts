import { ORDER_STATUSES, type OrderState, type WorldState } from '../types/game'
import { isPointInsideWorld, PLAYER_START } from '../world/worldLayout'

export const WORLD_CONTINUITY_SCHEMA_VERSION = 1 as const

const MAX_PERSISTED_ID_LENGTH = 180

export type SaveCargoCustody =
  | { custody: 'None' }
  | { custody: 'Player'; orderId: string }

export interface SaveWorldContinuityV1 {
  schemaVersion: typeof WORLD_CONTINUITY_SCHEMA_VERSION
  hero: {
    x: number
    y: number
  }
  activeOrder: OrderState
  cargo: SaveCargoCustody
}

export interface WorldContinuitySanitizeResult {
  continuity?: SaveWorldContinuityV1
  repaired: boolean
  reasons: string[]
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const validToken = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0 && value.trim().length <= MAX_PERSISTED_ID_LENGTH

const isOrderStatus = (value: unknown): value is OrderState['status'] =>
  typeof value === 'string' && ORDER_STATUSES.some(status => status === value)

const cloneOrderForContinuity = (order: OrderState): OrderState => ({
  orderId: order.orderId,
  pickupLocation: order.pickupLocation,
  destination: order.destination,
  status: order.status,
  acceptRequested: false,
  reward: order.reward,
  economySettled: order.economySettled,
})

const expectedCargoForOrder = (order: OrderState): SaveCargoCustody =>
  order.status === 'PickedUp'
    ? { custody: 'Player', orderId: order.orderId }
    : { custody: 'None' }

const sanitizeOrder = (value: unknown): { order?: OrderState; repaired: boolean; reasons: string[] } => {
  if (!isRecord(value)) {
    return { repaired: true, reasons: ['active-order-invalid'] }
  }

  if (
    !validToken(value.orderId) ||
    !validToken(value.pickupLocation) ||
    !validToken(value.destination) ||
    !isOrderStatus(value.status) ||
    typeof value.acceptRequested !== 'boolean' ||
    !Number.isSafeInteger(value.reward) ||
    (value.reward as number) < 0 ||
    typeof value.economySettled !== 'boolean'
  ) {
    return { repaired: true, reasons: ['active-order-invalid'] }
  }

  const reasons: string[] = []
  let economySettled = value.economySettled
  if (economySettled && value.status !== 'Completed' && value.status !== 'Failed') {
    economySettled = false
    reasons.push('non-terminal-settlement-marker-cleared')
  }
  if (value.acceptRequested) reasons.push('transient-accept-request-cleared')

  return {
    order: {
      orderId: value.orderId.trim(),
      pickupLocation: value.pickupLocation.trim(),
      destination: value.destination.trim(),
      status: value.status,
      acceptRequested: false,
      reward: value.reward as number,
      economySettled,
    },
    repaired: reasons.length > 0,
    reasons,
  }
}

const sanitizeHero = (value: unknown): { hero: SaveWorldContinuityV1['hero']; repaired: boolean } => {
  if (!isRecord(value) || typeof value.x !== 'number' || typeof value.y !== 'number' ||
      !isPointInsideWorld(value.x, value.y)) {
    return { hero: { ...PLAYER_START }, repaired: true }
  }
  return { hero: { x: value.x, y: value.y }, repaired: false }
}

const cargoMatches = (value: unknown, expected: SaveCargoCustody): boolean => {
  if (!isRecord(value) || typeof value.custody !== 'string') return false
  if (expected.custody === 'None') return value.custody === 'None'
  return value.custody === 'Player' && value.orderId === expected.orderId
}

/**
 * Save v2 continuity is deliberately bounded. It retains only the authoritative
 * local-loop facts needed to resume safely; pointer/movement intent is transient.
 */
export const captureWorldContinuity = (world: WorldState): SaveWorldContinuityV1 => {
  const order = cloneOrderForContinuity(world.activeOrder)
  const hero = isPointInsideWorld(world.player.x, world.player.y)
    ? { x: world.player.x, y: world.player.y }
    : { ...PLAYER_START }
  return {
    schemaVersion: WORLD_CONTINUITY_SCHEMA_VERSION,
    hero,
    activeOrder: order,
    cargo: expectedCargoForOrder(order),
  }
}

/**
 * Missing continuity is valid for historical Save v2 payloads. Malformed optional
 * continuity is dropped or repaired without making the whole save incompatible.
 */
export const sanitizeWorldContinuity = (value: unknown): WorldContinuitySanitizeResult => {
  if (value === undefined) return { repaired: false, reasons: [] }
  if (!isRecord(value) || value.schemaVersion !== WORLD_CONTINUITY_SCHEMA_VERSION) {
    return { repaired: true, reasons: ['world-continuity-structure-invalid'] }
  }

  const orderResult = sanitizeOrder(value.activeOrder)
  if (!orderResult.order) {
    return { repaired: true, reasons: orderResult.reasons }
  }

  const heroResult = sanitizeHero(value.hero)
  const expectedCargo = expectedCargoForOrder(orderResult.order)
  const cargoRepaired = !cargoMatches(value.cargo, expectedCargo)
  const reasons = [...orderResult.reasons]
  if (heroResult.repaired) reasons.push('hero-position-repaired')
  if (cargoRepaired) reasons.push('cargo-custody-repaired')

  return {
    continuity: {
      schemaVersion: WORLD_CONTINUITY_SCHEMA_VERSION,
      hero: heroResult.hero,
      activeOrder: orderResult.order,
      cargo: expectedCargo,
    },
    repaired: orderResult.repaired || heroResult.repaired || cargoRepaired,
    reasons,
  }
}

/**
 * Restores durable continuity onto a fresh bounded WorldState shell. Movement input,
 * pending destination selection and tap target never replay after process restart.
 * Player order/cargo flags are derived from the validated order stage, not trusted
 * independently from the serialized payload.
 */
export const restoreWorldContinuity = (
  baseWorld: WorldState,
  value: SaveWorldContinuityV1 | undefined,
): WorldState => {
  const sanitized = sanitizeWorldContinuity(value)
  if (!sanitized.continuity) return baseWorld

  const { hero, activeOrder } = sanitized.continuity
  const hasActiveAssignment = activeOrder.status === 'Accepted' || activeOrder.status === 'PickedUp'
  const carryingPackage = activeOrder.status === 'PickedUp'

  return {
    ...baseWorld,
    player: {
      ...baseWorld.player,
      x: hero.x,
      y: hero.y,
      currentOrder: hasActiveAssignment ? activeOrder.orderId : '',
      carryingPackage,
    },
    activeOrder: cloneOrderForContinuity(activeOrder),
    tapTarget: { x: hero.x, y: hero.y },
    isMoving: false,
    distanceToTarget: 0,
    pendingDeliveryDestination: '',
  }
}
