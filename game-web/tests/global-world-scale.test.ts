import { describe, expect, it } from 'vitest'
import type { WorldBuildingLayout, WorldRectLayout, WorldRoutePoint } from '../src/world/legacyCityLayout'
import {
  CITY_DETAIL_SECTOR_LIMIT,
  CITY_PLAYABLE_DISTANCE_SCALE_BASELINE,
  cityPlayableScaleForLocality,
  scaleCityBuilding,
  scaleCityExtent,
  scaleCityRoad,
  scaleCityRoutePoint,
} from '../src/world/worldScale'
import {
  WORLD_BUILDINGS,
  WORLD_HEIGHT,
  WORLD_PLAYABLE_DISTANCE_SCALE,
  WORLD_ROUTE_POINTS,
  WORLD_SOURCE_BUILDINGS,
  WORLD_SOURCE_HEIGHT,
  WORLD_SOURCE_ROUTE_POINTS,
  WORLD_SOURCE_WIDTH,
  WORLD_WIDTH,
} from '../src/world/worldLayout'
import { CITY_DETAIL_TILE_LIMIT } from '../src/world/cityGroundDetail'

describe('global playable city scale authority', () => {
  it('applies the same 10x baseline to non-Brăila/generated localities without equalizing their total size', () => {
    const generatedIrishLocality = cityPlayableScaleForLocality('IE-GENERATED-TEST-LOCALITY')
    const generatedRomanianLocality = cityPlayableScaleForLocality('RO-GENERATED-TEST-LOCALITY')

    expect(generatedIrishLocality.playableDistanceScale).toBe(CITY_PLAYABLE_DISTANCE_SCALE_BASELINE)
    expect(generatedRomanianLocality.playableDistanceScale).toBe(CITY_PLAYABLE_DISTANCE_SCALE_BASELINE)
    expect(CITY_PLAYABLE_DISTANCE_SCALE_BASELINE).toBe(10)

    expect(scaleCityExtent(120)).toBe(1200)
    expect(scaleCityExtent(420)).toBe(4200)
    expect(scaleCityExtent(120)).toBeLessThan(scaleCityExtent(420))
  })

  it('separates governed positions while preserving Hero-scale building footprint, door and route attachment', () => {
    const sourceBuilding: WorldBuildingLayout = {
      id: 'generated-workshop', x: 30, y: 40, width: 90, height: 108,
      texture: 'building_commercial', zoneId: 'business', kind: 'shop', entranceFacing: 'down',
      door: { x: 34, y: 94 },
    }
    const playableBuilding = scaleCityBuilding(sourceBuilding)
    expect(playableBuilding.x).toBe(300)
    expect(playableBuilding.y).toBe(400)
    expect(playableBuilding.width).toBe(sourceBuilding.width)
    expect(playableBuilding.height).toBe(sourceBuilding.height)
    expect(playableBuilding.door.x - playableBuilding.x).toBe(sourceBuilding.door.x - sourceBuilding.x)
    expect(playableBuilding.door.y - playableBuilding.y).toBe(sourceBuilding.door.y - sourceBuilding.y)

    const sourceRoute: WorldRoutePoint = {
      label: 'GeneratedPickup', displayName: 'Generated Workshop', buildingId: sourceBuilding.id,
      roadId: 'generated-road', kind: 'pickup', zoneId: 'business', x: 36, y: 92,
    }
    const playableRoute = scaleCityRoutePoint(sourceRoute, sourceBuilding, playableBuilding)
    expect(playableRoute.x - playableBuilding.x).toBe(sourceRoute.x - sourceBuilding.x)
    expect(playableRoute.y - playableBuilding.y).toBe(sourceRoute.y - sourceBuilding.y)
  })

  it('lengthens roads without multiplying carriageway width', () => {
    const sourceRoad: WorldRectLayout = {
      id: 'generated-road', x: 50, y: 20, width: 100, height: 32, roadWidth: 32,
      centerline: [{ x: 0, y: 20 }, { x: 100, y: 20 }],
    }
    const playableRoad = scaleCityRoad(sourceRoad)
    expect(playableRoad.centerline?.[1].x).toBe(1000)
    expect(playableRoad.roadWidth).toBe(32)
    expect(playableRoad.height).toBe(32)
  })

  it('makes the authored Brăila runtime consume the global authority without changing source identity or local attachments', () => {
    expect(WORLD_PLAYABLE_DISTANCE_SCALE).toBe(CITY_PLAYABLE_DISTANCE_SCALE_BASELINE)
    expect(WORLD_WIDTH).toBe(WORLD_SOURCE_WIDTH * CITY_PLAYABLE_DISTANCE_SCALE_BASELINE)
    expect(WORLD_HEIGHT).toBe(WORLD_SOURCE_HEIGHT * CITY_PLAYABLE_DISTANCE_SCALE_BASELINE)
    expect(WORLD_BUILDINGS.map(entry => entry.id)).toEqual(WORLD_SOURCE_BUILDINGS.map(entry => entry.id))
    expect(WORLD_ROUTE_POINTS.map(entry => entry.label)).toEqual(WORLD_SOURCE_ROUTE_POINTS.map(entry => entry.label))

    for (const sourcePoint of WORLD_SOURCE_ROUTE_POINTS) {
      const playablePoint = WORLD_ROUTE_POINTS.find(point => point.label === sourcePoint.label)!
      const sourceBuilding = WORLD_SOURCE_BUILDINGS.find(building => building.id === sourcePoint.buildingId)!
      const playableBuilding = WORLD_BUILDINGS.find(building => building.id === sourcePoint.buildingId)!
      expect(playablePoint.x - playableBuilding.x).toBeCloseTo(sourcePoint.x - sourceBuilding.x)
      expect(playablePoint.y - playableBuilding.y).toBeCloseTo(sourcePoint.y - sourceBuilding.y)
    }
  })

  it('bounds resident ground detail independently of total city extent', () => {
    expect(CITY_DETAIL_SECTOR_LIMIT).toBe(5)
    expect(CITY_DETAIL_TILE_LIMIT).toBe(CITY_DETAIL_SECTOR_LIMIT)
  })
})
