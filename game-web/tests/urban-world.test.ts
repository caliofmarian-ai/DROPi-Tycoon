import { describe, expect, it } from 'vitest'
import {
  URBAN_BUILDINGS, URBAN_CUSTOMER, URBAN_HQ, URBAN_MERCHANT, URBAN_ROADS,
  inInteractionRange, isUrbanWalkable, minimapPoint, movementFacing,
  moveUrbanPlayer, repairUrbanPosition,
} from '../src/world/urbanWorld'
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

  it('permits roads and pavement, but keeps motor vehicles off pavement', () => {
    for (const road of URBAN_ROADS) expect(isUrbanWalkable(road.x, road.y, true)).toBe(true)
    expect(isUrbanWalkable(700, 340)).toBe(false) // radius must fit entirely
    expect(isUrbanWalkable(700, 334)).toBe(true)
    expect(isUrbanWalkable(700, 334, true)).toBe(false)
    expect(isUrbanWalkable(700, 334, false, -1)).toBe(false)
  })

  it('keeps every mission endpoint connected to HQ by roads', () => {
    const visited = new Set<string>()
    const queue = [{ x: 380, y: 290 }]
    for (let i = 0; i < queue.length; i += 1) {
      const point = queue[i]
      for (const [dx, dy] of [[10, 0], [-10, 0], [0, 10], [0, -10]]) {
        const next = { x: point.x + dx, y: point.y + dy }
        const key = `${next.x},${next.y}`
        if (!visited.has(key) && isUrbanWalkable(next.x, next.y, true)) {
          visited.add(key)
          queue.push(next)
        }
      }
    }
    for (const point of [...WORLD_ROUTE_POINTS, URBAN_MERCHANT, URBAN_CUSTOMER]) {
      expect(visited.has(`${point.x},${point.y}`), JSON.stringify(point)).toBe(true)
    }
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
    const origin = { x: 800, y: 600 }
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
    expect(minimapPoint({ x: -100, y: 3000 }, 160, 120)).toEqual({ x: 0, y: 120 })
    expect(minimapPoint({ x: NaN, y: Infinity }, 160, 120)).toEqual({ x: 0, y: 0 })
  })

  it('gates NPC interactions by finite inclusive proximity', () => {
    expect(inInteractionRange(URBAN_MERCHANT, { x: 668, y: 910 })).toBe(true)
    expect(inInteractionRange(URBAN_MERCHANT, { x: 669, y: 910 })).toBe(false)
    expect(inInteractionRange(URBAN_HQ, URBAN_MERCHANT)).toBe(false)
    expect(inInteractionRange(URBAN_HQ, { x: NaN, y: 270 })).toBe(false)
  })
})
