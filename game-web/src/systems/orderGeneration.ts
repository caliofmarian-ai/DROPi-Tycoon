import { BALANCING } from '../config/balancing'
import type { OrderState } from '../types/game'
import { findWorldRoutePoint, WORLD_ROUTE_POINTS } from '../world/worldLayout'

export interface OrderRouteTemplate {
  routeId: string
  pickupLocation: string
  destination: string
}

/**
 * Prototype route pool. Rewards intentionally remain at the owner-approved
 * Prototype v0.1 value; route-based reward scaling belongs to a later economy
 * pass rather than being smuggled into this release remediation.
 *
 * Semantic route identifiers and sequence are preserved from #271. Physical
 * coordinates are owned by worldLayout.ts so the M-008 map remediation does
 * not rewrite already-validated order behavior.
 */
export const ORDER_ROUTE_TEMPLATES: readonly OrderRouteTemplate[] = [
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

export const routeForSequence = (sequence: number): OrderRouteTemplate => {
  const safeSequence = sanitizeSequence(sequence)
  return ORDER_ROUTE_TEMPLATES[(safeSequence - 1) % ORDER_ROUTE_TEMPLATES.length]
}

export const createOrderForSequence = (sequence: number): OrderState => {
  const safeSequence = sanitizeSequence(sequence)
  const route = routeForSequence(safeSequence)
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

export const createNextOrder = (previousOrder: OrderState): OrderState => {
  const parsed = parseOrderSequence(previousOrder.orderId)
  const nextSequence = parsed > 0 ? parsed + 1 : 1
  return createOrderForSequence(nextSequence)
}

export const pickupPointForOrder = (order: OrderState): { x: number; y: number } => {
  const point = findWorldRoutePoint(order.pickupLocation)
  const fallback = WORLD_ROUTE_POINTS.find((candidate) => candidate.kind === 'pickup')
  if (point?.kind === 'pickup') return { x: point.x, y: point.y }
  if (fallback) return { x: fallback.x, y: fallback.y }
  return { x: 0, y: 0 }
}
