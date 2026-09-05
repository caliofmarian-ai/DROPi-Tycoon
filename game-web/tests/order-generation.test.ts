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
  BICYCLE_ORDER_ROUTE_TEMPLATES,
  orderRoutesForTransport,
} from '../src/systems/orderGeneration'
import { findWorldRoutePoint } from '../src/world/worldLayout'
import { createInitialCompanyState, createInitialWorldState } from '../src/state/gameState'

import { getUrbanObjective, performUrbanInteraction } from '../src/systems/urbanInteractions'
import { CITY_LOCATIONS, findCityRoute, getCityRouteDistance } from '../src/world/city'
import { TRANSPORT_PROFILES } from '../src/systems/urbanLogistics'

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
    const routes = [1, 2, 3, 4].map(sequence => routeForSequence(sequence))
    expect(routes[0].routeId).not.toBe(routes[1].routeId)
    expect(routes[1].routeId).not.toBe(routes[2].routeId)
    expect(routes[2].routeId).not.toBe(routes[3].routeId)
    expect(routes[3].routeId).not.toBe(routes[0].routeId)
    expect(routeForSequence(ORDER_ROUTE_TEMPLATES.length + 1)).toEqual(routes[0])
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

  it('varies real merchants and customers early instead of waiting for a catalog cycle', () => {
    const opening = Array.from({ length: 24 }, (_, index) => createOrderForSequence(index + 1))
    expect(new Set(opening.map(order => order.pickupLocation)).size).toBeGreaterThanOrEqual(6)
    expect(new Set(opening.map(order => order.destination)).size).toBeGreaterThanOrEqual(12)
    expect(new Set(ORDER_ROUTE_TEMPLATES.map(route => route.pickupLocation)).size).toBe(8)
    expect(new Set(ORDER_ROUTE_TEMPLATES.map(route => route.destination)).size).toBe(21)
    expect(ORDER_ROUTE_TEMPLATES.length).toBeGreaterThanOrEqual(40)
  })

  it.each(['walking', 'bicycle'] as const)('generates only connected %s jobs, with varied distances and no adjacent endpoint repeats', transport => {
    const routes = orderRoutesForTransport(transport)
    const distances = new Set<number>()
    for (let index = 0; index < routes.length; index++) {
      const order = createOrderForSequence(index + 1, transport)
      const again = createOrderForSequence(index + 1, transport)
      const next = createOrderForSequence(index + 2, transport)
      expect(order).toEqual(again)
      expect(order.pickupLocation).not.toBe(next.pickupLocation)
      expect(order.destination).not.toBe(next.destination)
      expect(findCityRoute(order.pickupLocation, order.destination)).not.toBeNull()
      const distance = getCityRouteDistance(order.pickupLocation, order.destination)
      expect(distance).toBeGreaterThan(48)
      expect(distance).toBeLessThanOrEqual(TRANSPORT_PROFILES[transport].range)
      expect(order.reward).toBe(BALANCING.ORDER_REWARD)
      distances.add(distance)
    }
    expect(distances.size).toBeGreaterThan(12)
    expect(Math.min(...distances)).toBeLessThan(300)
    expect(Math.max(...distances)).toBeGreaterThan(1500)
  })

  it('adds bicycle-range work without handing walking couriers an impossible listing', () => {
    expect(BICYCLE_ORDER_ROUTE_TEMPLATES.length).toBeGreaterThan(ORDER_ROUTE_TEMPLATES.length)
    expect(BICYCLE_ORDER_ROUTE_TEMPLATES.some(route =>
      getCityRouteDistance(route.pickupLocation, route.destination) > TRANSPORT_PROFILES.walking.range)).toBe(true)
    expect(CITY_LOCATIONS.filter(location => location.kind === 'pickup')).toHaveLength(8)
  })

  it.each(['scooter', 'motorcycle', 'car', 'van'] as const)('respects the existing %s profile instead of capping it to bicycle range', transport => {
    const routes = orderRoutesForTransport(transport)
    const distances = routes.map(route => getCityRouteDistance(route.pickupLocation, route.destination))
    expect(Math.max(...distances)).toBeGreaterThan(TRANSPORT_PROFILES.bicycle.range)
    expect(distances.every(distance => distance > 48 && distance <= TRANSPORT_PROFILES[transport].range)).toBe(true)
    expect(orderRoutesForTransport(transport)).toBe(routes)
  })

  it('avoids repeated origins and customers after legacy jobs or a transport change without changing IDs', () => {
    const nextTemplate = createOrderForSequence(2)
    const previous = { ...nextTemplate, orderId: 'ORDER-001', status: 'Completed' as const }
    const next = createNextOrder(previous)
    expect(next.orderId).toBe('ORDER-002')
    expect(next.pickupLocation).not.toBe(previous.pickupLocation)
    expect(next.destination).not.toBe(previous.destination)
    expect(createNextOrder(previous)).toEqual(next)
    const cycling = createNextOrder({ ...previous, ...createOrderForSequence(14), status: 'Completed' }, 'bicycle')
    expect(getCityRouteDistance(cycling.pickupLocation, cycling.destination)).toBeLessThanOrEqual(3200)
  })

  it.each(['walking', 'bicycle'] as const)('supports reproducible seeded %s schedules without new saved state', transport => {
    const routes = orderRoutesForTransport(transport)
    const seeds = [1, 7, 42, 2026, -9]
    expect(new Set(seeds.map(seed => routeForSequence(1, transport, seed).routeId)).size).toBeGreaterThan(2)
    for (const seed of seeds) {
      const generated = Array.from({ length: routes.length }, (_, index) =>
        createOrderForSequence(index + 1, transport, seed))
      expect(generated).toEqual(Array.from({ length: routes.length }, (_, index) =>
        createOrderForSequence(index + 1, transport, seed)))
      expect(new Set(generated.map(order => `${order.pickupLocation}:${order.destination}`)).size).toBe(routes.length)
      expect(new Set(generated.map(order => order.pickupLocation)).size).toBe(8)
      expect(new Set(generated.map(order => order.destination)).size).toBe(21)
      for (let index = 0; index < generated.length; index++) {
        const order = generated[index]
        const next = generated[(index + 1) % generated.length]
        expect(order.orderId).toBe(formatOrderId(index + 1))
        expect(order.pickupLocation).not.toBe(next.pickupLocation)
        expect(order.destination).not.toBe(next.destination)
        expect(createNextOrder({ ...order, status: 'Completed' }, transport, seed))
          .toEqual({ ...next, orderId: formatOrderId(index + 2) })
      }
    }
    expect(createOrderForSequence(1, transport, 0)).toEqual(createOrderForSequence(1, transport))
  })

  it.each([NaN, Infinity, 1.5])('falls back to the original schedule for invalid seed %s', seed => {
    expect(createOrderForSequence(10, 'walking', seed)).toEqual(createOrderForSequence(10))
  })

  it.each([NaN, Infinity, -1, 0, 1.5])('sanitizes invalid sequence %s deterministically', sequence => {
    expect(createOrderForSequence(sequence)).toEqual(createOrderForSequence(1))
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
