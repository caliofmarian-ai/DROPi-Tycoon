import { BALANCING } from '../config/balancing'
import type { OrderState } from '../types/game'
import { findWorldRoutePoint, WORLD_ROUTE_POINTS } from '../world/worldLayout'
import { CITY_LOCATIONS, getCityRouteDistance } from '../world/city'
import { CITY_PLAYABLE_DISTANCE_SCALE_BASELINE } from '../world/worldScale'
import { TRANSPORT_PROFILES, type GroundTransport } from './urbanLogistics'

export interface OrderRouteTemplate {
  routeId: string
  pickupLocation: string
  destination: string
}

const legacyRoutes: readonly OrderRouteTemplate[] = [
  {
    routeId: 'local-west-east',
    pickupLocation: 'PickupZone',
    destination: 'DeliveryZone',
  },
  {
    routeId: 'commercial-south',
    pickupLocation: 'CommercialPickup',
    destination: 'DeliveryPoint',
  },
  {
    routeId: 'residential-cross-town',
    pickupLocation: 'ResidentialPickup',
    destination: 'DeliveryZone',
  },
] as const

const pickups = CITY_LOCATIONS.filter(location => location.kind === 'pickup')
const customers = CITY_LOCATIONS.filter(location => location.kind === 'delivery')
const routeCandidates = customers.flatMap((_, round) => pickups.map((pickup, merchantIndex) => {
  const destination = customers[(round + merchantIndex * 3) % customers.length]
  return {
    routeId: `${pickup.label}:${destination.label}`, pickupLocation: pickup.label,
    destination: destination.label, distance: getCityRouteDistance(pickup.label, destination.label),
  }
}))

/** Transport tuning predates the enlarged playable coordinate space; preserve its semantic range class under the global scale contract. */
export const playableRangeForTransport = (transport: GroundTransport): number =>
  TRANSPORT_PROFILES[transport].range * CITY_PLAYABLE_DISTANCE_SCALE_BASELINE

export const MIN_PLAYABLE_ORDER_ROUTE_DISTANCE = 48 * CITY_PLAYABLE_DISTANCE_SCALE_BASELINE

const buildRoutePool = (range: number): readonly OrderRouteTemplate[] => {
  const eligible = routeCandidates.filter(route =>
    route.distance > MIN_PLAYABLE_ORDER_ROUTE_DISTANCE && route.distance <= range)
  const pool: OrderRouteTemplate[] = legacyRoutes.filter(route => eligible.some(candidate =>
    candidate.pickupLocation === route.pickupLocation && candidate.destination === route.destination))
  const remaining = eligible.filter(route => !pool.some(candidate =>
    candidate.pickupLocation === route.pickupLocation && candidate.destination === route.destination))
  // Bound the schedule by the catalog; no randomness or saved generator state.
  while (remaining.length > 0) {
    const previous = pool.at(-1)
    const index = remaining.findIndex(route => route.pickupLocation !== previous?.pickupLocation &&
      route.destination !== previous?.destination)
    if (index < 0) break
    const [route] = remaining.splice(index, 1)
    pool.push({ routeId: route.routeId, pickupLocation: route.pickupLocation, destination: route.destination })
  }
  while (pool.length > 3 && (pool.at(-1)!.pickupLocation === pool[0].pickupLocation ||
    pool.at(-1)!.destination === pool[0].destination)) pool.pop()
  return pool
}

/** Walking work remains feasible after world scaling; bicycle ownership opens longer connected trips. */
export const ORDER_ROUTE_TEMPLATES = buildRoutePool(playableRangeForTransport('walking'))
export const BICYCLE_ORDER_ROUTE_TEMPLATES = buildRoutePool(playableRangeForTransport('bicycle'))
const transportRoutes = new Map<GroundTransport, readonly OrderRouteTemplate[]>([
  ['walking', ORDER_ROUTE_TEMPLATES], ['bicycle', BICYCLE_ORDER_ROUTE_TEMPLATES],
])

export const orderRoutesForTransport = (transport: GroundTransport = 'walking'): readonly OrderRouteTemplate[] => {
  if (!transportRoutes.has(transport)) transportRoutes.set(transport, buildRoutePool(playableRangeForTransport(transport)))
  return transportRoutes.get(transport)!
}

const sanitizeSequence = (sequence: number): number =>
  Number.isSafeInteger(sequence) && sequence > 0 ? sequence : 1

export const formatOrderId = (sequence: number): string =>
  `ORDER-${String(sanitizeSequence(sequence)).padStart(3, '0')}`

export const parseOrderSequence = (orderId: string): number => {
  const match = /^ORDER-(\d+)$/.exec(orderId.trim())
  if (!match) return 0
  const sequence = Number(match[1])
  return Number.isSafeInteger(sequence) && sequence > 0 ? sequence : 0
}

const seedOffset = (seed: number, length: number): number => {
  if (!Number.isSafeInteger(seed) || seed === 0) return 0
  const mixed = Math.imul(seed ^ (seed >>> 16), 0x45d9f3b)
  return (mixed >>> 0) % length
}

/** A seed rotates the tested schedule without losing coverage or introducing adjacent repeats. */
export const routeForSequence = (
  sequence: number, transport: GroundTransport = 'walking', seed = 0,
): OrderRouteTemplate => {
  const safeSequence = sanitizeSequence(sequence)
  const routes = orderRoutesForTransport(transport)
  if (routes.length === 0) throw new Error(`No connected ${transport} order routes satisfy the governed playable range`)
  return routes[((safeSequence - 1) % routes.length + seedOffset(seed, routes.length)) % routes.length]
}

export const createOrderForSequence = (
  sequence: number, transport: GroundTransport = 'walking', seed = 0,
): OrderState => {
  const safeSequence = sanitizeSequence(sequence)
  const route = routeForSequence(safeSequence, transport, seed)
  return {
    orderId: formatOrderId(safeSequence),
    pickupLocation: route.pickupLocation,
    destination: route.destination,
    status: 'Available',
    acceptRequested: false,
    reward: BALANCING.ORDER_REWARD,
    economySettled: false,
  }
}

export const createNextOrder = (
  previousOrder: OrderState, transport: GroundTransport = 'walking', seed = 0,
): OrderState => {
  const parsed = parseOrderSequence(previousOrder.orderId)
  const nextSequence = parsed > 0 ? parsed + 1 : 1
  const next = createOrderForSequence(nextSequence, transport, seed)
  if (next.pickupLocation !== previousOrder.pickupLocation && next.destination !== previousOrder.destination) return next
  const routes = orderRoutesForTransport(transport)
  const start = (sanitizeSequence(nextSequence) - 1) % routes.length
  for (let offset = 1; offset < routes.length; offset++) {
    const route = routeForSequence(start + offset + 1, transport, seed)
    if (route.pickupLocation !== previousOrder.pickupLocation && route.destination !== previousOrder.destination) {
      return { ...next, pickupLocation: route.pickupLocation, destination: route.destination }
    }
  }
  return next
}

export const pickupPointForOrder = (order: OrderState): { x: number; y: number } => {
  const point = findWorldRoutePoint(order.pickupLocation)
  const fallback = WORLD_ROUTE_POINTS.find((candidate) => candidate.kind === 'pickup')
  if (point?.kind === 'pickup') return { x: point.x, y: point.y }
  if (fallback) return { x: fallback.x, y: fallback.y }
  return { x: 0, y: 0 }
}
