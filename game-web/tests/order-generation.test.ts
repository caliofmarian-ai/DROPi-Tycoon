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
import { findWorldRoutePoint } from '../src/world/worldLayout'
import { createInitialCompanyState, createInitialWorldState } from '../src/state/gameState'

import { getUrbanObjective, performUrbanInteraction } from '../src/systems/urbanInteractions'

const gameStateSource = readFileSync(
  new URL('../src/state/gameState.ts', import.meta.url),
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

  it('resolves the visible pickup point from centralized world layout data', () => {
    for (let sequence = 1; sequence <= ORDER_ROUTE_TEMPLATES.length; sequence += 1) {
      const route = routeForSequence(sequence)
      const order = createOrderForSequence(sequence)
      const point = findWorldRoutePoint(route.pickupLocation)
      expect(point?.kind).toBe('pickup')
      expect(pickupPointForOrder(order)).toEqual({ x: point?.x, y: point?.y })
    }
  })
})

describe('release blocker #271 — runtime integration contract', () => {
  it('initializes ORDER-001 through the shared generator rather than a hardcoded object', () => {
    expect(gameStateSource).toContain('createOrderForSequence(1)')
    expect(gameStateSource).not.toContain("orderId: 'ORDER-001'")
  })

  it('generates a next order only after terminal settlement and updates the package position', () => {
    const world = createInitialWorldState()
    const company = createInitialCompanyState()
    world.activeOrder.status = 'PickedUp'
    world.player.currentOrder = world.activeOrder.orderId
    world.player.carryingPackage = true
    Object.assign(world.player, findWorldRoutePoint(world.activeOrder.destination))
    const result = performUrbanInteraction(world, company)
    expect(result.settled).toBe(true)
    expect(result.world.activeOrder.orderId).toBe('ORDER-002')
    expect(result.company.money).toBe(company.money + world.activeOrder.reward)
    const next = result.world.activeOrder
    expect(pickupPointForOrder(next)).toEqual({
      x: findWorldRoutePoint(next.pickupLocation)!.x,
      y: findWorldRoutePoint(next.pickupLocation)!.y,
    })
  })

  it('uses the active order pickup location instead of one hardcoded pickup name', () => {
    for (let sequence = 1; sequence <= ORDER_ROUTE_TEMPLATES.length; sequence++) {
      const world = createInitialWorldState()
      world.activeOrder = { ...createOrderForSequence(sequence), status: 'Accepted' }
      world.player.currentOrder = world.activeOrder.orderId
      const objective = getUrbanObjective(world)
      expect(objective.point).toEqual(pickupPointForOrder(world.activeOrder))
      Object.assign(world.player, objective.point)
      const result = performUrbanInteraction(world, createInitialCompanyState())
      expect(result.world.activeOrder.status).toBe('PickedUp')
    }
  })

  it('preserves exactly-once settlement before replacing the terminal order', () => {
    const world = createInitialWorldState()
    world.activeOrder.status = 'PickedUp'
    world.player.currentOrder = world.activeOrder.orderId
    world.player.carryingPackage = true
    Object.assign(world.player, findWorldRoutePoint(world.activeOrder.destination))
    const company = createInitialCompanyState()
    const first = performUrbanInteraction(world, company)
    const again = performUrbanInteraction(first.world, first.company)
    expect(first.settled).toBe(true)
    expect(again.settled).toBe(false)
    expect(again.company.money).toBe(first.company.money)
    expect(again.company.reviews).toHaveLength(1)
    expect(again.world.activeOrder.orderId).toBe(first.world.activeOrder.orderId)
  })
})
