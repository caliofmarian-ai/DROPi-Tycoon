import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { BALANCING } from '../src/config/balancing'
import {
  createNextOrder,
  createOrderForSequence,
  formatOrderId,
  ORDER_ROUTE_TEMPLATES,
  parseOrderSequence,
  pickupPointForOrder,
  routeForSequence,
} from '../src/systems/orderGeneration'

const gameStateSource = readFileSync(
  new URL('../src/state/gameState.ts', import.meta.url),
  'utf8',
)
const sceneSource = readFileSync(
  new URL('../src/scenes/GameWorldScene.ts', import.meta.url),
  'utf8',
)

describe('release blocker #271 — order sequence generation', () => {
  it('provides at least three route templates', () => {
    expect(ORDER_ROUTE_TEMPLATES.length).toBeGreaterThanOrEqual(3)
    expect(new Set(ORDER_ROUTE_TEMPLATES.map(({ routeId }) => routeId)).size).toBe(
      ORDER_ROUTE_TEMPLATES.length,
    )
  })

  it('uses sequential unique IDs with stable formatting', () => {
    expect(formatOrderId(1)).toBe('ORDER-001')
    expect(formatOrderId(2)).toBe('ORDER-002')
    expect(formatOrderId(12)).toBe('ORDER-012')
    expect(parseOrderSequence('ORDER-012')).toBe(12)
    expect(parseOrderSequence('not-an-order')).toBe(0)
  })

  it('rotates routes deterministically without immediate identical repetition', () => {
    const routes = [1, 2, 3, 4].map(routeForSequence)
    expect(routes[0].routeId).not.toBe(routes[1].routeId)
    expect(routes[1].routeId).not.toBe(routes[2].routeId)
    expect(routes[2].routeId).not.toBe(routes[3].routeId)
    expect(routes[3].routeId).toBe(routes[0].routeId)
  })

  it('creates a fresh Available order with owner-approved reward', () => {
    const order = createOrderForSequence(2)
    expect(order).toMatchObject({
      orderId: 'ORDER-002',
      status: 'Available',
      acceptRequested: false,
      reward: BALANCING.ORDER_REWARD,
      economySettled: false,
    })
  })

  it('creates the next order from both completed and failed terminal orders', () => {
    const completed = { ...createOrderForSequence(7), status: 'Completed' as const, economySettled: true }
    const failed = { ...createOrderForSequence(8), status: 'Failed' as const, economySettled: true }

    const afterCompleted = createNextOrder(completed)
    const afterFailed = createNextOrder(failed)

    expect(afterCompleted.orderId).toBe('ORDER-008')
    expect(afterCompleted.status).toBe('Available')
    expect(afterCompleted.economySettled).toBe(false)
    expect(afterFailed.orderId).toBe('ORDER-009')
    expect(afterFailed.status).toBe('Available')
  })

  it('resolves the visible pickup point from the generated route', () => {
    for (let sequence = 1; sequence <= ORDER_ROUTE_TEMPLATES.length; sequence += 1) {
      const route = routeForSequence(sequence)
      const order = createOrderForSequence(sequence)
      expect(pickupPointForOrder(order)).toEqual(route.pickupPoint)
    }
  })
})

describe('release blocker #271 — runtime integration contract', () => {
  it('initializes ORDER-001 through the shared generator rather than a hardcoded object', () => {
    expect(gameStateSource).toContain('createOrderForSequence(1)')
    expect(gameStateSource).not.toContain("orderId: 'ORDER-001'")
  })

  it('generates a next order only after terminal settlement and updates the package position', () => {
    expect(sceneSource).toContain('createNextOrder')
    expect(sceneSource).toContain('spawnNextAvailableOrder')
    expect(sceneSource).toContain('pickupPointForOrder')
    expect(sceneSource).toContain('this.packageSprite.setPosition')
  })

  it('uses the active order pickup location instead of one hardcoded pickup name', () => {
    expect(sceneSource).toContain('expectedPickupLocation: this.worldState.activeOrder.pickupLocation')
    expect(sceneSource).not.toContain("expectedPickupLocation: 'PickupZone'")
  })

  it('preserves exactly-once settlement before replacing the terminal order', () => {
    const settlementIndex = sceneSource.indexOf('settleDeliveryOutcome(')
    const nextOrderIndex = sceneSource.indexOf('this.spawnNextAvailableOrder()')
    expect(settlementIndex).toBeGreaterThan(-1)
    expect(nextOrderIndex).toBeGreaterThan(settlementIndex)
  })
})
