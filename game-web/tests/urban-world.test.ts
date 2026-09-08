import { describe, expect, it } from 'vitest'
import {
  URBAN_BUILDINGS, URBAN_CUSTOMER, URBAN_HQ, URBAN_MERCHANT, URBAN_ROADS,
  inInteractionRange, isUrbanWalkable, minimapPoint, movementFacing,
  moveUrbanPlayer, repairUrbanPosition,
} from '../src/world/urbanWorld'
import { CITY_LOCATIONS, isCityLocationReachable } from '../src/world/city'
import { CENTRAL_CONTROLLED_CROSSING, crossingPoint } from '../src/world/cityTrafficRules'
import { WORLD_HEIGHT, WORLD_ROUTE_POINTS, WORLD_WIDTH } from '../src/world/worldLayout'

describe('urban district navigation', () => {
  it('spawns on accessible ground outside a physical HQ building', () => {
    expect(isUrbanWalkable(URBAN_HQ.x, URBAN_HQ.y)).toBe(true)
    expect(URBAN_BUILDINGS.find(building => building.kind === 'hq')).toBeDefined()
    expect(repairUrbanPosition({ x: NaN, y: Infinity })).toEqual(URBAN_HQ)
    expect(repairUrbanPosition(URBAN_MERCHANT)).toEqual(URBAN_MERCHANT)
  })

  it('blocks building footprints, non-path scenery and world edges', () => {
    for (const building of URBAN_BUILDINGS) {
      expect(isUrbanWalkable(building.x, building.y)).toBe(false)
    }
    for (const point of [{ x: 0, y: 0 }, { x: -1, y: 290 }, { x: WORLD_WIDTH + 1, y: 290 },
      { x: 500, y: 480 }, { x: NaN, y: 290 }]) {
      expect(isUrbanWalkable(point.x, point.y)).toBe(false)
    }
  })

  it('permits source street centerlines and keeps motor vehicles off pavement', () => {
    for (const road of URBAN_ROADS) for (const point of road.centerline ?? []) expect(isUrbanWalkable(point.x, point.y, true)).toBe(true)
    const curb = crossingPoint(CENTRAL_CONTROLLED_CROSSING, 0, CENTRAL_CONTROLLED_CROSSING.halfLength)
    expect(isUrbanWalkable(curb.x, curb.y, false, 6)).toBe(true)
    expect(isUrbanWalkable(curb.x, curb.y, true, 6)).toBe(false)
    expect(isUrbanWalkable(curb.x, curb.y, false, -1)).toBe(false)
  })

  it('keeps every mission endpoint connected to HQ by source streets', () => {
    for (const point of CITY_LOCATIONS) expect(isCityLocationReachable(point), point.label).toBe(true)
  })

  it('cannot cross a building even after prolonged input or a stalled frame', () => {
    let point = { ...URBAN_HQ }
    for (let frame = 0; frame < 200; frame += 1) {
      point = moveUrbanPlayer(point, { x: 0, y: -1 }, 1 / 60, 230)
      expect(isUrbanWalkable(point.x, point.y)).toBe(true)
    }
    expect(point.y).toBeGreaterThan(244)
    const stalled = moveUrbanPlayer(URBAN_HQ, { x: 0, y: -1 }, 10000, 1e9)
    expect(isUrbanWalkable(stalled.x, stalled.y)).toBe(true)
  })

  it('normalizes diagonals, supports all directions and rejects invalid movement', () => {
    const origin = { ...URBAN_HQ }
    const straight = moveUrbanPlayer(origin, { x: 1, y: 0 }, 0.05, 150)
    const diagonal = moveUrbanPlayer(origin, { x: 1, y: 1 }, 0.05, 150)
    expect(Math.hypot(diagonal.x - origin.x, diagonal.y - origin.y))
      .toBeCloseTo(straight.x - origin.x)
    expect(movementFacing({ x: 0, y: -1 })).toBe('up')
    expect(movementFacing({ x: 0, y: 1 })).toBe('down')
    expect(movementFacing({ x: -1, y: 0 })).toBe('left')
    expect(movementFacing({ x: 1, y: 0 })).toBe('right')
    expect(movementFacing({ x: 0, y: 0 }, 'left')).toBe('left')
    expect(moveUrbanPlayer(origin, { x: NaN, y: 0 }, 0.1, 150)).toEqual(origin)
    expect(moveUrbanPlayer(origin, { x: 1, y: 0 }, -1, 150)).toEqual(origin)
  })
})

describe('navigation support', () => {
  it('maps world corners, center and invalid coordinates to a bounded minimap', () => {
    expect(minimapPoint({ x: 0, y: 0 }, 160, 120)).toEqual({ x: 0, y: 0 })
    expect(minimapPoint({ x: WORLD_WIDTH, y: WORLD_HEIGHT }, 160, 120)).toEqual({ x: 160, y: 120 })
    expect(minimapPoint({ x: WORLD_WIDTH / 2, y: WORLD_HEIGHT / 2 }, 160, 120)).toEqual({ x: 80, y: 60 })
    expect(minimapPoint({ x: -100, y: WORLD_HEIGHT + 100 }, 160, 120)).toEqual({ x: 0, y: 120 })
    expect(minimapPoint({ x: NaN, y: Infinity }, 160, 120)).toEqual({ x: 0, y: 0 })
  })

  it('gates NPC interactions by finite inclusive proximity', () => {
    expect(inInteractionRange(URBAN_MERCHANT, { x: URBAN_MERCHANT.x + 48, y: URBAN_MERCHANT.y })).toBe(true)
    expect(inInteractionRange(URBAN_MERCHANT, { x: URBAN_MERCHANT.x + 49, y: URBAN_MERCHANT.y })).toBe(false)
    expect(inInteractionRange(URBAN_HQ, URBAN_MERCHANT)).toBe(false)
    expect(inInteractionRange(URBAN_HQ, { x: NaN, y: 270 })).toBe(false)
  })
})
