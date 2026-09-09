import { describe, expect, it } from 'vitest'
import {
  CITY_PLAYABLE_DISTANCE_SCALE_BASELINE,
  CITY_PLAYABLE_SCALE_VERSION,
  PLAYABLE_CITY_DETAIL_SECTOR_LIMIT,
  classifyPlayableCityRouteDistance,
  expandPlayableCityBuilding,
  expandPlayableCityExtent,
  expandPlayableCityPoint,
  expandPlayableCityRoad,
  expandPlayableCityZone,
} from '../src/world/playableCityScale'

/**
 * Deliberately synthetic locality fixture. It proves reusable game translation without making any
 * factual claim about a real non-Brăila place or inventing source geography.
 */
const syntheticZones = [
  { id: 'north', x: 0, y: 0, width: 40, height: 40 },
  { id: 'centre', x: 100, y: 0, width: 40, height: 40 },
  { id: 'south', x: 1000, y: 0, width: 40, height: 40 },
  { id: 'edge', x: 1100, y: 0, width: 40, height: 40 },
] as const

describe('global playable-city scale authority', () => {
  it('owns the canonical 10x baseline independently of Brăila', () => {
    expect(CITY_PLAYABLE_SCALE_VERSION).toBe(3)
    expect(CITY_PLAYABLE_DISTANCE_SCALE_BASELINE).toBe(10)
    expect(PLAYABLE_CITY_DETAIL_SECTOR_LIMIT).toBe(5)
  })

  it('applies the same separation baseline while preserving different locality source extents', () => {
    const smallSourceWidth = 240
    const majorSourceWidth = 1200
    expect(expandPlayableCityExtent(smallSourceWidth)).toBe(2400)
    expect(expandPlayableCityExtent(majorSourceWidth)).toBe(12000)
    expect(expandPlayableCityExtent(majorSourceWidth)).toBeGreaterThan(expandPlayableCityExtent(smallSourceWidth))
  })

  it('separates governed anchors without blindly enlarging Hero-scale widths', () => {
    const road = {
      id: 'synthetic-road', x: 50, y: 10, width: 100, height: 24, roadWidth: 24,
      centerline: [{ x: 0, y: 10 }, { x: 100, y: 10 }],
    }
    const scaledRoad = expandPlayableCityRoad(road)
    expect(scaledRoad.centerline![1].x - scaledRoad.centerline![0].x).toBe(1000)
    expect(scaledRoad.roadWidth).toBe(24)

    const building = { x: 20, y: 30, width: 80, height: 60, door: { x: 20, y: 60 } }
    const scaledBuilding = expandPlayableCityBuilding(building)
    expect(scaledBuilding.x).toBe(200)
    expect(scaledBuilding.y).toBe(300)
    expect(scaledBuilding.width).toBe(80)
    expect(scaledBuilding.height).toBe(60)
    expect(scaledBuilding.door.x - scaledBuilding.x).toBe(building.door.x - building.x)
    expect(scaledBuilding.door.y - scaledBuilding.y).toBe(building.door.y - building.y)
  })

  it('translates generic points and zones without attaching a Brăila identity', () => {
    expect(expandPlayableCityPoint({ x: 7, y: 11 })).toEqual({ x: 70, y: 110 })
    const zone = expandPlayableCityZone({ id: 'synthetic-zone', x: 10, y: 20, width: 100, height: 80 })
    expect(zone.id).toBe('synthetic-zone')
    expect(zone.width).toBe(100)
    expect(zone.height).toBe(80)
  })

  it('derives route class from generic governed topology rather than Brăila functions or quotas', () => {
    const zones = syntheticZones.map(zone => expandPlayableCityZone(zone))
    expect(classifyPlayableCityRouteDistance({
      originZoneId: 'north', destinationZoneId: 'north', roadDistance: 400,
    }, zones).spatialClass).toBe('local')
    expect(classifyPlayableCityRouteDistance({
      originZoneId: 'north', destinationZoneId: 'centre', roadDistance: 1200,
    }, zones).spatialClass).toBe('adjacent-district')
    expect(classifyPlayableCityRouteDistance({
      originZoneId: 'north', destinationZoneId: 'edge', roadDistance: 9800,
    }, zones).spatialClass).toBe('cross-city')
    expect(classifyPlayableCityRouteDistance({
      originZoneId: 'north', destinationZoneId: 'edge', roadDistance: Number.NaN,
    }, zones).routeDistanceValid).toBe(false)
  })
})
