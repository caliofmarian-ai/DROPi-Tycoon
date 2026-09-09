import { describe, expect, it } from 'vitest'
import type { WorldBuildingLayout, WorldRectLayout, WorldRoutePoint } from '../src/world/legacyCityLayout'
import { surfaceContains } from '../src/world/worldSurfaces'
import {
  CITY_DETAIL_SECTOR_LIMIT,
  CITY_PLAYABLE_DISTANCE_SCALE_BASELINE,
  cityPlayableScaleForLocality,
  scaleCityBuilding,
  scaleCityBuildingFromAnchor,
  scaleCityExtent,
  scaleCityRoad,
  scaleCityRoutePoint,
} from '../src/world/worldScale'
import {
  PLAYER_START,
  WORLD_BUILDINGS,
  WORLD_HEIGHT,
  WORLD_MARKETPLACE,
  WORLD_PLAYABLE_DISTANCE_SCALE,
  WORLD_ROADS,
  WORLD_ROUTE_POINTS,
  WORLD_SOURCE_BUILDINGS,
  WORLD_SOURCE_HEIGHT,
  WORLD_SOURCE_MARKETPLACE,
  WORLD_SOURCE_PLAYER_START,
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

  it('separates city road anchors while preserving Hero-scale frontage, building and door attachment', () => {
    const sourceRoad: WorldRectLayout = {
      id: 'generated-road', x: 50, y: 100, width: 100, height: 32, roadWidth: 32,
      centerline: [{ x: 0, y: 100 }, { x: 100, y: 100 }],
    }
    const playableRoad = scaleCityRoad(sourceRoad)

    const sourceRoute: WorldRoutePoint = {
      label: 'GeneratedPickup', displayName: 'Generated Workshop', buildingId: 'generated-workshop',
      roadId: sourceRoad.id, kind: 'pickup', zoneId: 'business', x: 36, y: 100,
    }
    const playableRoute = scaleCityRoutePoint(sourceRoute, sourceRoad)

    const sourceBuilding: WorldBuildingLayout = {
      id: sourceRoute.buildingId, x: 36, y: 40, width: 90, height: 108,
      texture: 'building_commercial', zoneId: 'business', kind: 'shop', entranceFacing: 'down',
      door: { x: 36, y: 94 },
    }
    const playableBuilding = scaleCityBuildingFromAnchor(sourceBuilding, sourceRoute, playableRoute)

    expect(playableRoute.x).toBe(360)
    expect(playableRoute.y).toBe(1000)
    expect(surfaceContains(playableRoad, playableRoute.x, playableRoute.y)).toBe(true)
    expect(playableBuilding.width).toBe(sourceBuilding.width)
    expect(playableBuilding.height).toBe(sourceBuilding.height)
    expect(playableBuilding.x - playableRoute.x).toBe(sourceBuilding.x - sourceRoute.x)
    expect(playableBuilding.y - playableRoute.y).toBe(sourceBuilding.y - sourceRoute.y)
    expect(playableBuilding.door.x - playableBuilding.x).toBe(sourceBuilding.door.x - sourceBuilding.x)
    expect(playableBuilding.door.y - playableBuilding.y).toBe(sourceBuilding.door.y - sourceBuilding.y)
    expect(playableRoute.x).toBe(playableBuilding.door.x)
    expect(Math.abs(playableRoute.y - playableBuilding.door.y)).toBe(6)

    const unboundBuilding = scaleCityBuilding({ ...sourceBuilding, id: 'generated-unbound', x: 30 })
    expect(unboundBuilding.x).toBe(300)
    expect(unboundBuilding.width).toBe(sourceBuilding.width)
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

  it('makes the authored Brăila runtime consume the global authority while preserving road and building attachments', () => {
    expect(WORLD_PLAYABLE_DISTANCE_SCALE).toBe(CITY_PLAYABLE_DISTANCE_SCALE_BASELINE)
    expect(WORLD_WIDTH).toBe(WORLD_SOURCE_WIDTH * CITY_PLAYABLE_DISTANCE_SCALE_BASELINE)
    expect(WORLD_HEIGHT).toBe(WORLD_SOURCE_HEIGHT * CITY_PLAYABLE_DISTANCE_SCALE_BASELINE)
    expect(WORLD_BUILDINGS.map(entry => entry.id)).toEqual(WORLD_SOURCE_BUILDINGS.map(entry => entry.id))
    expect(WORLD_ROUTE_POINTS.map(entry => entry.label)).toEqual(WORLD_SOURCE_ROUTE_POINTS.map(entry => entry.label))

    for (const sourcePoint of WORLD_SOURCE_ROUTE_POINTS) {
      const playablePoint = WORLD_ROUTE_POINTS.find(point => point.label === sourcePoint.label)!
      const sourceBuilding = WORLD_SOURCE_BUILDINGS.find(building => building.id === sourcePoint.buildingId)!
      const playableBuilding = WORLD_BUILDINGS.find(building => building.id === sourcePoint.buildingId)!
      const playableRoad = WORLD_ROADS.find(road => road.id === sourcePoint.roadId)!

      expect(surfaceContains(playableRoad, playablePoint.x, playablePoint.y), sourcePoint.label).toBe(true)
      expect(playablePoint.x - playableBuilding.x).toBeCloseTo(sourcePoint.x - sourceBuilding.x)
      expect(playablePoint.y - playableBuilding.y).toBeCloseTo(sourcePoint.y - sourceBuilding.y)
      expect(playableBuilding.door.x - playableBuilding.x).toBeCloseTo(sourceBuilding.door.x - sourceBuilding.x)
      expect(playableBuilding.door.y - playableBuilding.y).toBeCloseTo(sourceBuilding.door.y - sourceBuilding.y)
    }
  })

  it('keeps authored HQ and Marketplace frontages attached to roads and their buildings', () => {
    const sourceHq = WORLD_SOURCE_BUILDINGS.find(building => building.id === 'main-hq')!
    const playableHq = WORLD_BUILDINGS.find(building => building.id === 'main-hq')!
    const sourceMarketplace = WORLD_SOURCE_BUILDINGS.find(building => building.id === 'business-1')!
    const playableMarketplace = WORLD_BUILDINGS.find(building => building.id === 'business-1')!

    expect(WORLD_ROADS.some(road => surfaceContains(road, PLAYER_START.x, PLAYER_START.y))).toBe(true)
    expect(WORLD_ROADS.some(road => surfaceContains(road, WORLD_MARKETPLACE.x, WORLD_MARKETPLACE.y))).toBe(true)

    expect(PLAYER_START.x - playableHq.x).toBeCloseTo(WORLD_SOURCE_PLAYER_START.x - sourceHq.x)
    expect(PLAYER_START.y - playableHq.y).toBeCloseTo(WORLD_SOURCE_PLAYER_START.y - sourceHq.y)
    expect(WORLD_MARKETPLACE.x - playableMarketplace.x).toBeCloseTo(WORLD_SOURCE_MARKETPLACE.x - sourceMarketplace.x)
    expect(WORLD_MARKETPLACE.y - playableMarketplace.y).toBeCloseTo(WORLD_SOURCE_MARKETPLACE.y - sourceMarketplace.y)
  })

  it('bounds resident ground detail independently of total city extent', () => {
    expect(CITY_DETAIL_SECTOR_LIMIT).toBe(5)
    expect(CITY_DETAIL_TILE_LIMIT).toBe(CITY_DETAIL_SECTOR_LIMIT)
  })
})
