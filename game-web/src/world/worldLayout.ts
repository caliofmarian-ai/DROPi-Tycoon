import layout from './brailaLayout.generated.json'
import context from './brailaContext.generated.json'
import type { WorldBuildingLayout, WorldDecorationLayout, WorldRectLayout, WorldRoutePoint, WorldZoneLayout } from './legacyCityLayout'
import { distanceToSegment, surfaceContains } from './worldSurfaces'
export type { WorldBuildingLayout, WorldDecorationLayout, WorldRectLayout, WorldRoutePoint, WorldZoneId, WorldZoneLayout } from './legacyCityLayout'

export const WORLD_WIDTH = layout.width
export const WORLD_HEIGHT = layout.height
export const PLAYER_START = { x: layout.playerStart.x, y: layout.playerStart.y }
export const WORLD_ZONES: readonly WorldZoneLayout[] = layout.zones as WorldZoneLayout[]
export const WORLD_ROADS: readonly WorldRectLayout[] = layout.roads
export const WORLD_SIDEWALKS: readonly WorldRectLayout[] = WORLD_ROADS.map(road => ({
  ...road, id: `${road.id}-pavement`, width: road.width + 32, height: road.height + 32,
  roadWidth: (road.roadWidth ?? 32) + 32,
}))
export const WORLD_BUILDINGS: readonly WorldBuildingLayout[] = layout.buildings as WorldBuildingLayout[]
export const WORLD_ROUTE_POINTS: readonly WorldRoutePoint[] = layout.routes as WorldRoutePoint[]
export const WORLD_CONTEXT_BUILDINGS = context.buildings
export const WORLD_LANDSCAPE = layout.landscape
export const WORLD_MARKETPLACE = { x: layout.marketplace.x, y: layout.marketplace.y }
export const WORLD_CITY_NAME = layout.name
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
