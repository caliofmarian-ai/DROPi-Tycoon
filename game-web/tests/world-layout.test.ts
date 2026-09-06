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
  it('quadruples the former 1600x1200 neighborhood footprint', () => {
    expect(WORLD_WIDTH).toBe(3200)
    expect(WORLD_HEIGHT).toBe(2400)
    expect(WORLD_WIDTH * WORLD_HEIGHT).toBe(1600 * 1200 * 4)
  })

  it('retains the four legacy zone IDs and adds two distinct districts inside world bounds', () => {
    expect(WORLD_ZONES.map(({ id }) => id).sort()).toEqual([
      'business',
      'company',
      'garden',
      'residential',
      'storage',
      'waterfront',
    ])
    expect(WORLD_ZONES.every(isZoneInsideWorld)).toBe(true)
    expect(new Set(WORLD_ZONES.map(({ label }) => label)).size).toBe(6)
  })

  it('contains a meaningful road and sidewalk network', () => {
    expect(WORLD_ROADS.length).toBeGreaterThanOrEqual(6)
    expect(WORLD_SIDEWALKS.length).toBeGreaterThanOrEqual(8)
    expect(WORLD_ROADS.every(({ x, y }) => isPointInsideWorld(x, y))).toBe(true)
    expect(WORLD_SIDEWALKS.every(({ x, y }) => isPointInsideWorld(x, y))).toBe(true)
  })

  it('populates at least eighty lightweight structures across all six districts', () => {
    expect(WORLD_BUILDINGS.length).toBeGreaterThanOrEqual(80)
    const representedZones = new Set(WORLD_BUILDINGS.map(({ zoneId }) => zoneId))
    expect(representedZones).toEqual(new Set(WORLD_ZONES.map(zone => zone.id)))
    expect(WORLD_BUILDINGS.every(({ x, y }) => isPointInsideWorld(x, y))).toBe(true)
  })

  it('includes lightweight decorative elements across all six districts', () => {
    expect(WORLD_DECORATIONS.length).toBeGreaterThanOrEqual(12)
    expect(new Set(WORLD_DECORATIONS.map(({ zoneId }) => zoneId))).toEqual(
      new Set(WORLD_ZONES.map(zone => zone.id)),
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
    const presentationSource = readFileSync(new URL('../src/world/urbanPresentation.ts', import.meta.url), 'utf8')
    const pavementSource = readFileSync(new URL('../src/world/cityGround.ts', import.meta.url), 'utf8')
    expect(sceneSource).toContain('renderUrbanNeighborhood(this, this.companyState)')
    for (const token of [
      'URBAN_ROADS',
      'URBAN_SIDEWALKS',
      'URBAN_BUILDINGS',
      'WORLD_DECORATIONS',
      'WORLD_ROUTE_POINTS',
    ]) {
      expect(presentationSource).toContain(token)
    }
    expect(presentationSource).toContain('ensureCityGroundTexture')
    expect(presentationSource).toContain('drawCityPavement(g, URBAN_ROADS, URBAN_SIDEWALKS)')
    const sidewalks = pavementSource.indexOf('for (const sidewalk of sidewalks)')
    const roads = pavementSource.indexOf('for (const road of roads)')
    expect(sidewalks).toBeGreaterThanOrEqual(0)
    expect(roads).toBeGreaterThan(sidewalks)
  })

  it('removes the old scene-local scaffold arrays', () => {
    expect(sceneSource).not.toContain('const ROAD_POSITIONS')
    expect(sceneSource).not.toContain('const BUILDINGS')
    expect(sceneSource).not.toContain('const DELIVERY_POINTS')
  })
})

describe('Workstream E — world uplift removes developer-style debug labels', () => {
  it('no longer pastes raw "Pickup:"/"Delivery:" text labels over route markers', () => {
    expect(sceneSource).not.toContain('Pickup: ${label}')
    expect(sceneSource).not.toContain('Delivery: ${label}')
    expect(sceneSource).not.toContain("kind === 'pickup' ? 'Pickup' : 'Delivery'")
  })

  it('draws catalog-backed signs and landmarks without downloading image assets', () => {
    const presentationSource = readFileSync(new URL('../src/world/urbanPresentation.ts', import.meta.url), 'utf8')
    for (const sign of ["'DROPi'", 'HEADQUARTERS', 'MAIN DRONEPORT', 'FUTURE · LOCKED']) {
      expect(presentationSource).toContain(sign)
    }
    expect(presentationSource).toContain('location.displayName')
    expect(presentationSource).toContain('zone.label.toUpperCase()')
    expect(findWorldRoutePoint('PickupZone')?.displayName).toBe("Mara's Market")
    expect(presentationSource).not.toContain('.load.image(')
    expect(sceneSource).not.toContain('.load.image(')
  })
})
