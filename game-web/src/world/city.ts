import {
  PLAYER_START, WORLD_BUILDINGS, WORLD_HEIGHT, WORLD_ROADS, WORLD_ROUTE_POINTS, WORLD_WIDTH,
  WORLD_ZONES, type WorldBuildingLayout, type WorldRectLayout, type WorldRoutePoint, type WorldZoneId, type WorldZoneLayout,
} from './worldLayout'
import { isUrbanWalkable } from './urbanWorld'
import { buildRoadNetwork, findRoadRoute, type RoadNetwork, type RoadPoint, type RoadRoute } from './cityNavigation'

export interface CityLocation extends WorldRoutePoint {
  districtId: WorldZoneId
  door: RoadPoint
}
export interface CityDistrict extends WorldZoneLayout {
  locations: readonly CityLocation[]
  roads: readonly WorldRectLayout[]
  buildings: readonly WorldBuildingLayout[]
}
export interface City {
  cityId: string
  name: string
  width: number
  height: number
  districts: readonly CityDistrict[]
}
export interface CityMerchant {
  merchantId: string
  npcId: string
  buildingId: string
  name: string
  position: RoadPoint
  pickupLocation: string
}

export const CITY_LOCATIONS: readonly CityLocation[] = WORLD_ROUTE_POINTS.map(point => ({
  ...point, districtId: point.zoneId,
  door: { ...WORLD_BUILDINGS.find(building => building.id === point.buildingId)!.door },
}))

export const CITY_DISTRICTS: readonly CityDistrict[] = WORLD_ZONES.map(zone => ({
  ...zone,
  locations: CITY_LOCATIONS.filter(location => location.districtId === zone.id),
  roads: WORLD_ROADS.filter(road =>
    road.x + road.width / 2 >= zone.x && road.x - road.width / 2 <= zone.x + zone.width &&
    road.y + road.height / 2 >= zone.y && road.y - road.height / 2 <= zone.y + zone.height),
  buildings: WORLD_BUILDINGS.filter(building => building.zoneId === zone.id),
}))

export const CITY: City = {
  cityId: 'cedar-city', name: 'Cedar City', width: WORLD_WIDTH, height: WORLD_HEIGHT, districts: CITY_DISTRICTS,
}

const merchantIds: Readonly<Record<string, string>> = {
  PickupZone: 'mara-market', CommercialPickup: 'cedar-bakery', ResidentialPickup: 'neighborhood-coop',
  CanalPickup: 'canal-grocers', HarborPickup: 'quayside-kitchen', DepotPickup: 'foundry-supplies',
  GardenPickup: 'garden-florist', StationPickup: 'station-books',
}

export const CITY_MERCHANTS: readonly CityMerchant[] = CITY_LOCATIONS.filter(location => location.kind === 'pickup')
  .map(location => ({
    merchantId: merchantIds[location.label], npcId: location.label === 'PickupZone' ? 'mara' : `merchant:${location.label}`,
    buildingId: location.buildingId, name: location.displayName,
    position: { x: location.x, y: location.y }, pickupLocation: location.label,
  }))

export const CITY_ROAD_NETWORK = buildRoadNetwork(
  WORLD_ROADS, [PLAYER_START, ...CITY_LOCATIONS], (x, y) => isUrbanWalkable(x, y, true),
)

export const findCityLocation = (label: string): CityLocation | undefined =>
  CITY_LOCATIONS.find(location => location.label === label)

export const isCityLocationReachable = (
  location: CityLocation, network: RoadNetwork = CITY_ROAD_NETWORK,
): boolean => {
  const building = WORLD_BUILDINGS.find(entry => entry.id === location.buildingId)
  const road = WORLD_ROADS.find(entry => entry.id === location.roadId)
  if (!building || !road || building.zoneId !== location.districtId || location.zoneId !== location.districtId ||
      location.door.x !== building.door.x || location.door.y !== building.door.y ||
      Math.abs(location.x - location.door.x) > 0 || Math.abs(location.y - location.door.y) > 48 ||
      Math.abs(location.x - road.x) > road.width / 2 || Math.abs(location.y - road.y) > road.height / 2 ||
      !isUrbanWalkable(location.x, location.y, true)) return false
  return findRoadRoute(network, PLAYER_START, location) !== null
}

// The physical catalog is static; HUD queries must not rerun three graph searches each frame.
const cityRoutes = new Map<string, RoadRoute | null>()

export const findCityRoute = (fromLabel: string, toLabel: string): RoadRoute | null => {
  const from = findCityLocation(fromLabel)
  const to = findCityLocation(toLabel)
  if (!from || !to) return null
  const routeKey = `${fromLabel}:${toLabel}`
  if (!cityRoutes.has(routeKey)) {
    cityRoutes.set(routeKey, isCityLocationReachable(from) && isCityLocationReachable(to)
      ? findRoadRoute(CITY_ROAD_NETWORK, from, to) : null)
  }
  return cityRoutes.get(routeKey)!
}

export const getCityRouteDistance = (fromLabel: string, toLabel: string): number =>
  findCityRoute(fromLabel, toLabel)?.distance ?? Infinity
