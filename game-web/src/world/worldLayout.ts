import layout from './brailaLayout.generated.json'
import type { WorldBuildingLayout, WorldDecorationLayout, WorldRectLayout, WorldRoutePoint, WorldZoneLayout } from './legacyCityLayout'
import {
  CITY_PLAYABLE_DISTANCE_SCALE_BASELINE,
  CITY_PLAYABLE_SCALE_VERSION,
  cityRoadAnchorForPoint,
  scaleCityBuilding,
  scaleCityBuildingFromAnchor,
  scaleCityContextBuilding,
  scaleCityExtent,
  scaleCityLandscapeFeature,
  scaleCityPoint,
  scaleCityRoad,
  scaleCityRoadAttachedPoint,
  scaleCityRoutePoint,
  scaleCityZone,
} from './worldScale'
import { distanceToSegment, surfaceContains } from './worldSurfaces'
export type { WorldBuildingLayout, WorldDecorationLayout, WorldRectLayout, WorldRoutePoint, WorldZoneId, WorldZoneLayout } from './legacyCityLayout'

type CompactContextBuilding = readonly [
  x: number,
  y: number,
  width: number,
  height: number,
  pointCoordinates: readonly number[],
]

declare const __BRAILA_CONTEXT_BUILDINGS__: readonly CompactContextBuilding[]

const unpackContextPoints = (coordinates: readonly number[]): Array<{ x: number; y: number }> => {
  const points: Array<{ x: number; y: number }> = []
  for (let index = 0; index < coordinates.length; index += 2) {
    points.push({ x: coordinates[index], y: coordinates[index + 1] })
  }
  return points
}

export const WORLD_SOURCE_WIDTH = layout.width
export const WORLD_SOURCE_HEIGHT = layout.height
export const WORLD_PLAYABLE_SCALE_VERSION = CITY_PLAYABLE_SCALE_VERSION
export const WORLD_PLAYABLE_DISTANCE_SCALE = CITY_PLAYABLE_DISTANCE_SCALE_BASELINE
export const WORLD_WIDTH = scaleCityExtent(WORLD_SOURCE_WIDTH)
export const WORLD_HEIGHT = scaleCityExtent(WORLD_SOURCE_HEIGHT)

export const WORLD_SOURCE_ZONES: readonly WorldZoneLayout[] = layout.zones as WorldZoneLayout[]
export const WORLD_ZONES: readonly WorldZoneLayout[] = WORLD_SOURCE_ZONES.map(zone => scaleCityZone(zone))

export const WORLD_SOURCE_ROADS: readonly WorldRectLayout[] = layout.roads as WorldRectLayout[]
export const WORLD_ROADS: readonly WorldRectLayout[] = WORLD_SOURCE_ROADS.map(road => scaleCityRoad(road))
export const WORLD_SIDEWALKS: readonly WorldRectLayout[] = WORLD_ROADS.map(road => ({
  ...road, id: `${road.id}-pavement`, width: road.width + 32, height: road.height + 32,
  roadWidth: (road.roadWidth ?? 32) + 32,
}))

const WORLD_SOURCE_PLAYER_START = { x: layout.playerStart.x, y: layout.playerStart.y }
const playerStartRoad = WORLD_SOURCE_ROADS
  .map(road => {
    const anchor = cityRoadAnchorForPoint(WORLD_SOURCE_PLAYER_START, road)
    const dx = WORLD_SOURCE_PLAYER_START.x - anchor.x
    const dy = WORLD_SOURCE_PLAYER_START.y - anchor.y
    return { road, distanceSquared: dx * dx + dy * dy }
  })
  .sort((a, b) => a.distanceSquared - b.distanceSquared || a.road.id.localeCompare(b.road.id))[0]?.road
export const PLAYER_START = playerStartRoad
  ? scaleCityRoadAttachedPoint(WORLD_SOURCE_PLAYER_START, playerStartRoad)
  : scaleCityPoint(WORLD_SOURCE_PLAYER_START)

export const WORLD_SOURCE_ROUTE_POINTS: readonly WorldRoutePoint[] = layout.routes as WorldRoutePoint[]
export const WORLD_ROUTE_POINTS: readonly WorldRoutePoint[] = WORLD_SOURCE_ROUTE_POINTS.map(point => {
  const sourceRoad = WORLD_SOURCE_ROADS.find(road => road.id === point.roadId)
  return scaleCityRoutePoint(point, sourceRoad)
})

export const WORLD_SOURCE_BUILDINGS: readonly WorldBuildingLayout[] = layout.buildings as WorldBuildingLayout[]
export const WORLD_BUILDINGS: readonly WorldBuildingLayout[] = WORLD_SOURCE_BUILDINGS.map(building => {
  const sourceAnchor = WORLD_SOURCE_ROUTE_POINTS.find(point => point.buildingId === building.id)
  const playableAnchor = sourceAnchor && WORLD_ROUTE_POINTS.find(point => point.label === sourceAnchor.label)
  return sourceAnchor && playableAnchor
    ? scaleCityBuildingFromAnchor(building, sourceAnchor, playableAnchor)
    : scaleCityBuilding(building)
})

/** #613 compact tuples remain the shipped representation; playable scaling occurs after lossless reconstruction. */
export const WORLD_SOURCE_CONTEXT_BUILDINGS = __BRAILA_CONTEXT_BUILDINGS__.map(([x, y, width, height, pointCoordinates]) => ({
  x, y, width, height, points: unpackContextPoints(pointCoordinates),
}))
export const WORLD_CONTEXT_BUILDINGS = WORLD_SOURCE_CONTEXT_BUILDINGS
  .map(building => scaleCityContextBuilding(building))

export const WORLD_LANDSCAPE = layout.landscape.map(feature => scaleCityLandscapeFeature(feature))
export const WORLD_MARKETPLACE = scaleCityPoint({ x: layout.marketplace.x, y: layout.marketplace.y })
export const WORLD_CITY_NAME = layout.name
/** Source geographic bounds remain factual; the 10x transform applies only to playable world units. */
export const WORLD_GEO_BOUNDS = layout.geoBounds

// Reusable nature sprites populate safe street edges; trunks never block a frontage or road.
export const WORLD_DECORATIONS: readonly WorldDecorationLayout[] = WORLD_ROADS.filter((_, i) => i % 3 === 0)
  .flatMap((road, i) => {
    const points = road.centerline!
    const p = points[Math.floor(points.length / 2)]
    return [-1, 1].map(side => ({ id: `braila-tree-${i}-${side}`, x: p.x + side * 80, y: p.y + 55,
      radius: 13 + i % 3, zoneId: WORLD_ZONES[i % WORLD_ZONES.length].id }))
  }).filter(tree => tree.x > 20 && tree.x < WORLD_WIDTH - 20 && tree.y > 20 && tree.y < WORLD_HEIGHT - 20 &&
    !WORLD_SIDEWALKS.some(surface => surfaceContains(surface, tree.x, tree.y, tree.radius + 10)) &&
    !WORLD_BUILDINGS.some(building => surfaceContains(building, tree.x, tree.y, tree.radius + 15)) &&
    !WORLD_CONTEXT_BUILDINGS.some(building => surfaceContains(building, tree.x, tree.y, tree.radius + 8)) &&
    !WORLD_ROUTE_POINTS.some(point => distanceToSegment(tree, point,
      WORLD_BUILDINGS.find(b => b.id === point.buildingId)!.door) < tree.radius + 20))

export const DELIVERY_ROUTE_POINTS = WORLD_ROUTE_POINTS.filter(point => point.kind === 'delivery')
export const findWorldRoutePoint = (label: string): WorldRoutePoint | undefined => WORLD_ROUTE_POINTS.find(point => point.label === label)
export const isPointInsideWorld = (x: number, y: number): boolean => Number.isFinite(x) && Number.isFinite(y) &&
  x >= 0 && x <= WORLD_WIDTH && y >= 0 && y <= WORLD_HEIGHT
export const isZoneInsideWorld = (zone: WorldZoneLayout): boolean => isPointInsideWorld(zone.x, zone.y) &&
  zone.width > 0 && zone.height > 0 && isPointInsideWorld(zone.x + zone.width, zone.y + zone.height)
