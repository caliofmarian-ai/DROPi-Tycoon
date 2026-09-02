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
 * Coordinates are owned by worldLayout.ts so map expansion and later art
 * replacement do not require rewriting order lifecycle logic.
 */
export const ORDER_ROUTE_TEMPLATES: readonly OrderRouteTemplate[] = [
  {
    routeId: 'company-to-residential',
    pickupLocation: 'CompanyPickup',
    destination: 'DeliveryZone',
  },
  {
    routeId: 'commercial-to-company',
    pickupLocation: 'CommercialPickup',
    destination: 'CompanyDelivery',
  },
  {
    routeId: 'residential-to-business',
    pickupLocation: 'ResidentialPickup',
    destination: 'DeliveryPoint',
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
