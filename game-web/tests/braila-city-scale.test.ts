import { describe, expect, it } from 'vitest'
import rawLayout from '../src/world/brailaLayout.generated.json'
import rawContext from '../src/world/brailaContext.generated.json'
import { CAMERA_MIN_ZOOM, zoomByStep } from '../src/ui/cameraControls'
import {
  BRAILA_DETAIL_MIN_ZOOM,
  BRAILA_DETAIL_SECTOR_LIMIT,
  BRAILA_DETAIL_SECTOR_SIZE,
  BRAILA_PLAYABLE_DISTANCE_SCALE,
  BRAILA_PLAYABLE_SCALE_VERSION,
  brailaSectorForPoint,
  brailaTravelSeconds,
  classifyBrailaRoadDistance,
} from '../src/world/brailaPlayableScale'
import { CITY_DETAIL_MIN_ZOOM, CITY_DETAIL_TILE_LIMIT, CITY_DETAIL_TILE_SIZE, cityGroundTiles } from '../src/world/cityGroundDetail'
import { cityFitZoom, cityScaleLevel } from '../src/world/semanticMapCamera'
import {
  PLAYER_START,
  WORLD_BUILDINGS,
  WORLD_CONTEXT_BUILDINGS,
  WORLD_GEO_BOUNDS,
  WORLD_HEIGHT,
  WORLD_PLAYABLE_DISTANCE_SCALE,
  WORLD_PLAYABLE_SCALE_VERSION,
  WORLD_ROADS,
  WORLD_ROUTE_POINTS,
  WORLD_SOURCE_HEIGHT,
  WORLD_SOURCE_WIDTH,
  WORLD_WIDTH,
} from '../src/world/worldLayout'

describe('Brăila canonical playable city scale', () => {
  it('expands gameplay distance without falsifying the retained geographic bounds', () => {
    expect(BRAILA_PLAYABLE_SCALE_VERSION).toBe(2)
    expect(BRAILA_PLAYABLE_DISTANCE_SCALE).toBe(2.75)
    expect(WORLD_PLAYABLE_SCALE_VERSION).toBe(BRAILA_PLAYABLE_SCALE_VERSION)
    expect(WORLD_PLAYABLE_DISTANCE_SCALE).toBe(BRAILA_PLAYABLE_DISTANCE_SCALE)
    expect(WORLD_SOURCE_WIDTH).toBe(rawLayout.width)
    expect(WORLD_SOURCE_HEIGHT).toBe(rawLayout.height)
    expect(WORLD_WIDTH).toBe(Math.ceil(rawLayout.width * BRAILA_PLAYABLE_DISTANCE_SCALE))
    expect(WORLD_HEIGHT).toBe(Math.ceil(rawLayout.height * BRAILA_PLAYABLE_DISTANCE_SCALE))
    expect(WORLD_GEO_BOUNDS).toEqual(rawLayout.geoBounds)
  })

  it('moves source-backed anchors apart while keeping local gameplay building dimensions stable', () => {
    expect(PLAYER_START.x).toBeCloseTo(rawLayout.playerStart.x * BRAILA_PLAYABLE_DISTANCE_SCALE)
    expect(PLAYER_START.y).toBeCloseTo(rawLayout.playerStart.y * BRAILA_PLAYABLE_DISTANCE_SCALE)

    const raw = rawLayout.buildings.find(building => building.id === 'main-hq')!
    const scaled = WORLD_BUILDINGS.find(building => building.id === 'main-hq')!
    expect(scaled.x).toBeCloseTo(raw.x * BRAILA_PLAYABLE_DISTANCE_SCALE)
    expect(scaled.y).toBeCloseTo(raw.y * BRAILA_PLAYABLE_DISTANCE_SCALE)
    expect(scaled.width).toBe(raw.width)
    expect(scaled.height).toBe(raw.height)
    expect(scaled.door.x - scaled.x).toBeCloseTo(raw.door.x - raw.x)
    expect(scaled.door.y - scaled.y).toBeCloseTo(raw.door.y - raw.y)
  })

  it('preserves OSM road connectivity and carriageway width while increasing segment distance', () => {
    const raw = rawLayout.roads.find(road => road.centerline.length > 2)!
    const scaled = WORLD_ROADS.find(road => road.id === raw.id)!
    const rawLength = Math.hypot(
      raw.centerline[1].x - raw.centerline[0].x,
      raw.centerline[1].y - raw.centerline[0].y,
    )
    const scaledLength = Math.hypot(
      scaled.centerline![1].x - scaled.centerline![0].x,
      scaled.centerline![1].y - scaled.centerline![0].y,
    )
    expect(scaledLength / rawLength).toBeCloseTo(BRAILA_PLAYABLE_DISTANCE_SCALE, 5)
    expect(scaled.roadWidth).toBe(raw.roadWidth)
  })

  it('keeps real context footprints locally sized while separating their city positions', () => {
    const raw = rawContext.buildings[0]
    const scaled = WORLD_CONTEXT_BUILDINGS[0]
    const dx = scaled.x - raw.x
    const dy = scaled.y - raw.y
    expect(scaled.x).toBeCloseTo(raw.x * BRAILA_PLAYABLE_DISTANCE_SCALE)
    expect(scaled.y).toBeCloseTo(raw.y * BRAILA_PLAYABLE_DISTANCE_SCALE)
    expect(scaled.width).toBe(raw.width)
    expect(scaled.height).toBe(raw.height)
    expect(scaled.points[0].x - raw.points[0].x).toBeCloseTo(dx)
    expect(scaled.points[0].y - raw.points[0].y).toBeCloseTo(dy)
  })

  it('makes representative route separation materially larger without changing route identity', () => {
    const rawA = rawLayout.routes[0]
    const rawB = rawLayout.routes[rawLayout.routes.length - 1]
    const scaledA = WORLD_ROUTE_POINTS.find(point => point.label === rawA.label)!
    const scaledB = WORLD_ROUTE_POINTS.find(point => point.label === rawB.label)!
    const rawDistance = Math.hypot(rawB.x - rawA.x, rawB.y - rawA.y)
    const scaledDistance = Math.hypot(scaledB.x - scaledA.x, scaledB.y - scaledA.y)
    expect(scaledDistance / rawDistance).toBeCloseTo(BRAILA_PLAYABLE_DISTANCE_SCALE, 5)
    expect(WORLD_ROUTE_POINTS.map(point => point.label)).toEqual(rawLayout.routes.map(point => point.label))
  })

  it('restores a true City semantic overview on compact Android landscape', () => {
    const fit = cityFitZoom(800, 360, WORLD_WIDTH, WORLD_HEIGHT)
    expect(CAMERA_MIN_ZOOM).toBeLessThanOrEqual(fit * 1.3)
    expect(cityScaleLevel(CAMERA_MIN_ZOOM, fit)).toBe('City')
    expect(cityScaleLevel(0.3, fit)).toBe('District')
    expect(cityScaleLevel(0.5, fit)).toBe('Area')
    expect(cityScaleLevel(1, fit)).toBe('Hero')
    expect(zoomByStep(0.5, 'out')).toBeCloseTo(0.3)
    expect(zoomByStep(0.3, 'out')).toBeCloseTo(0.1)
    expect(zoomByStep(0.1, 'out')).toBe(CAMERA_MIN_ZOOM)
  })

  it('keeps Android detailed ground bounded to local sectors regardless of total city size', () => {
    expect(CITY_DETAIL_TILE_SIZE).toBe(BRAILA_DETAIL_SECTOR_SIZE)
    expect(CITY_DETAIL_TILE_LIMIT).toBe(BRAILA_DETAIL_SECTOR_LIMIT)
    expect(CITY_DETAIL_MIN_ZOOM).toBe(BRAILA_DETAIL_MIN_ZOOM)
    expect(cityGroundTiles({ x: 0, y: 0, width: WORLD_WIDTH, height: WORLD_HEIGHT }, 0.3)).toEqual([])
    expect(cityGroundTiles({ x: PLAYER_START.x - 900, y: PLAYER_START.y - 500, width: 1800, height: 1000 }, 1).length)
      .toBeLessThanOrEqual(BRAILA_DETAIL_SECTOR_LIMIT)
    expect(brailaSectorForPoint(PLAYER_START).id).toMatch(/^\d+-\d+$/)
  })

  it('provides #615 road-distance classes without pretending straight-line distance is authoritative', () => {
    expect(classifyBrailaRoadDistance(1200)).toBe('local')
    expect(classifyBrailaRoadDistance(3600)).toBe('adjacent-district')
    expect(classifyBrailaRoadDistance(9000)).toBe('cross-city')
    expect(brailaTravelSeconds(9000, 150)).toBe(60)
    expect(brailaTravelSeconds(9000, 0)).toBe(Number.POSITIVE_INFINITY)
  })

  it('turns the old sub-minute straight crossing into a multi-minute city-scale crossing at walking speed', () => {
    const walkingSpeed = 150
    expect(rawLayout.width / walkingSpeed).toBeLessThan(75)
    expect(WORLD_WIDTH / walkingSpeed).toBeGreaterThan(180)
  })
})
