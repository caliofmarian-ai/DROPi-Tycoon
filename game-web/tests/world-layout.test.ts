import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { ORDER_ROUTE_TEMPLATES } from '../src/systems/orderGeneration'
import {
  DELIVERY_ROUTE_POINTS,
  findWorldRoutePoint,
  isPointInsideWorld,
  isZoneInsideWorld,
  PLAYER_START,
  WORLD_BUILDINGS,
  WORLD_DECORATIONS,
  WORLD_HEIGHT,
  WORLD_ROADS,
  WORLD_ROUTE_POINTS,
  WORLD_SIDEWALKS,
  WORLD_WIDTH,
  WORLD_ZONES,
} from '../src/world/worldLayout'

const sceneSource = readFileSync(
  new URL('../src/scenes/GameWorldScene.ts', import.meta.url),
  'utf8',
)

describe('release blocker #273 — explorable first-map structure', () => {
  it('materially exceeds the old 800x600 scaffold', () => {
    expect(WORLD_WIDTH).toBeGreaterThan(800)
    expect(WORLD_HEIGHT).toBeGreaterThan(600)
    expect(WORLD_WIDTH * WORLD_HEIGHT).toBeGreaterThan(800 * 600 * 2)
  })

  it('defines exactly the four canonical prototype gameplay zones inside world bounds', () => {
    expect(WORLD_ZONES.map(({ id }) => id).sort()).toEqual([
      'business',
      'company',
      'residential',
      'storage',
    ])
    expect(WORLD_ZONES.every(isZoneInsideWorld)).toBe(true)
    expect(new Set(WORLD_ZONES.map(({ label }) => label)).size).toBe(4)
  })

  it('contains a meaningful road and sidewalk network', () => {
    expect(WORLD_ROADS.length).toBeGreaterThanOrEqual(6)
    expect(WORLD_SIDEWALKS.length).toBeGreaterThanOrEqual(8)
    expect(WORLD_ROADS.every(({ x, y }) => isPointInsideWorld(x, y))).toBe(true)
    expect(WORLD_SIDEWALKS.every(({ x, y }) => isPointInsideWorld(x, y))).toBe(true)
  })

  it('populates at least twenty lightweight structures across all four zones', () => {
    expect(WORLD_BUILDINGS.length).toBeGreaterThanOrEqual(20)
    const representedZones = new Set(WORLD_BUILDINGS.map(({ zoneId }) => zoneId))
    expect(representedZones).toEqual(new Set(['residential', 'business', 'storage', 'company']))
    expect(WORLD_BUILDINGS.every(({ x, y }) => isPointInsideWorld(x, y))).toBe(true)
  })

  it('includes lightweight decorative elements across all four zones', () => {
    expect(WORLD_DECORATIONS.length).toBeGreaterThanOrEqual(12)
    expect(new Set(WORLD_DECORATIONS.map(({ zoneId }) => zoneId))).toEqual(
      new Set(['residential', 'business', 'storage', 'company']),
    )
    expect(WORLD_DECORATIONS.every(({ x, y }) => isPointInsideWorld(x, y))).toBe(true)
  })

  it('keeps the player start inside the expanded map', () => {
    expect(isPointInsideWorld(PLAYER_START.x, PLAYER_START.y)).toBe(true)
  })

  it('distributes order route points across multiple zones and keeps them in bounds', () => {
    expect(WORLD_ROUTE_POINTS.length).toBeGreaterThanOrEqual(6)
    expect(new Set(WORLD_ROUTE_POINTS.map(({ zoneId }) => zoneId)).size).toBeGreaterThanOrEqual(3)
    expect(WORLD_ROUTE_POINTS.every(({ x, y }) => isPointInsideWorld(x, y))).toBe(true)
    expect(DELIVERY_ROUTE_POINTS.every(({ kind }) => kind === 'delivery')).toBe(true)
  })

  it('resolves every order route endpoint through centralized world-layout data', () => {
    for (const route of ORDER_ROUTE_TEMPLATES) {
      expect(findWorldRoutePoint(route.pickupLocation)?.kind).toBe('pickup')
      expect(findWorldRoutePoint(route.destination)?.kind).toBe('delivery')
    }
  })
})

describe('release blocker #273 — scene integration contract', () => {
  it('renders from centralized world-layout collections', () => {
    for (const token of [
      'WORLD_ZONES',
      'WORLD_ROADS',
      'WORLD_SIDEWALKS',
      'WORLD_BUILDINGS',
      'WORLD_DECORATIONS',
      'WORLD_ROUTE_POINTS',
      'DELIVERY_ROUTE_POINTS',
    ]) {
      expect(sceneSource).toContain(token)
    }
  })

  it('removes the old scene-local scaffold arrays', () => {
    expect(sceneSource).not.toContain('const ROAD_POSITIONS')
    expect(sceneSource).not.toContain('const BUILDINGS')
    expect(sceneSource).not.toContain('const DELIVERY_POINTS')
  })
})
