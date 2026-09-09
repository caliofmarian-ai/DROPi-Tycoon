import { describe, expect, it } from 'vitest'
import {
  CITY, CITY_DISTRICTS, CITY_LOCATIONS, CITY_MERCHANTS, CITY_ROAD_NETWORK, findCityLocation,
  findCityRoute, getCityRouteDistance, isCityLocationReachable,
} from '../src/world/city'
import { WORLD_ROUTE_POINTS as LEGACY_ROUTES } from '../src/world/legacyCityLayout'
import { surfaceContains } from '../src/world/worldSurfaces'
import { buildRoadNetwork, findRoadRoute } from '../src/world/cityNavigation'
import { isUrbanWalkable, URBAN_BUILDINGS, URBAN_ENTRANCE_PATHS } from '../src/world/urbanWorld'
import { WORLD_WIDTH, WORLD_HEIGHT, PLAYER_START, WORLD_DECORATIONS, WORLD_ROADS, WORLD_ZONES } from '../src/world/worldLayout'

describe('finite city and district catalog', () => {
  it('owns six distinct populated districts and preserves the initial reset position', () => {
    expect(CITY).toMatchObject({ cityId: 'braila', name: 'Brăila', width: WORLD_WIDTH, height: WORLD_HEIGHT })
    expect(CITY.districts).toBe(CITY_DISTRICTS)
    expect(CITY_DISTRICTS).toHaveLength(6)
    expect(isUrbanWalkable(PLAYER_START.x, PLAYER_START.y, true)).toBe(true)
    expect(new Set(CITY_DISTRICTS.map(district => district.label)).size).toBe(6)
    expect(new Set(CITY_DISTRICTS.map(district => district.fillColor)).size).toBe(6)
    for (const district of CITY_DISTRICTS) {
      expect(district.buildings.length).toBeGreaterThanOrEqual(6)
      expect(district.locations.filter(location => location.kind === 'pickup').length).toBeGreaterThanOrEqual(1)
      expect(district.locations.filter(location => location.kind === 'delivery').length).toBeGreaterThanOrEqual(2)
      expect(district.roads.length).toBeGreaterThanOrEqual(1)
      expect(district.locations.every(location => location.districtId === district.id)).toBe(true)
    }
    expect(CITY_DISTRICTS.flatMap(district => district.locations)).toHaveLength(CITY_LOCATIONS.length)
  })

  it('ties eight merchants and twenty-one customers to unique real buildings and accessible doors', () => {
    expect(CITY_MERCHANTS).toHaveLength(8)
    expect(CITY_LOCATIONS.filter(location => location.kind === 'delivery')).toHaveLength(21)
    expect(new Set(CITY_LOCATIONS.map(location => location.buildingId)).size).toBe(CITY_LOCATIONS.length)
    expect(new Set(CITY_MERCHANTS.map(merchant => merchant.merchantId)).size).toBe(8)
    expect(new Set(CITY_MERCHANTS.map(merchant => merchant.npcId)).size).toBe(8)
    for (const location of CITY_LOCATIONS) {
      const building = URBAN_BUILDINGS.find(entry => entry.id === location.buildingId)!
      expect(building, location.label).toBeDefined()
      expect(location.door).toEqual(building.door)
      expect(location.door.x).toBe(building.x)
      expect(Math.abs(location.door.y - building.y)).toBeCloseTo(building.height / 2, 8)
      expect(Math.abs(location.y - location.door.y)).toBeGreaterThanOrEqual(42)
      expect(URBAN_ENTRANCE_PATHS.find(path => path.id === `${location.label}-entrance`)).toBeDefined()
      const direction = Math.sign(location.y - location.door.y)
      for (let distance = 11; distance <= Math.abs(location.y - location.door.y); distance++) {
        expect(isUrbanWalkable(location.x, location.door.y + direction * distance), location.label).toBe(true)
      }
      expect(isCityLocationReachable(location), location.label).toBe(true)
    }
    for (const merchant of CITY_MERCHANTS) {
      const location = findCityLocation(merchant.pickupLocation)!
      expect(location.kind).toBe('pickup')
      expect(merchant.buildingId).toBe(location.buildingId)
      expect(merchant.position).toEqual({ x: location.x, y: location.y })
    }
  })

  it('keeps complete road, building and decoration footprints within bounds without overlapping streets', () => {
    for (const rect of [...WORLD_ROADS, ...URBAN_BUILDINGS]) {
      expect(rect.x - rect.width / 2, rect.id).toBeGreaterThanOrEqual(0)
      expect(rect.y - rect.height / 2, rect.id).toBeGreaterThanOrEqual(0)
      expect(rect.x + rect.width / 2, rect.id).toBeLessThanOrEqual(CITY.width)
      expect(rect.y + rect.height / 2, rect.id).toBeLessThanOrEqual(CITY.height)
    }
    for (const building of URBAN_BUILDINGS) {
      const district = CITY_DISTRICTS.find(entry => entry.id === building.zoneId)!
      expect(district.buildings.some(b => b.id === building.id)).toBe(true)
      // Check the entire source vertex set, but report once per building. Hundreds of thousands
      // of individual assertion objects can exceed CI's deadline despite cheap geometry checks.
      const blockedRoads = WORLD_ROADS.filter(road => (road.centerline ?? []).some(point =>
        surfaceContains(building, point.x, point.y, (road.roadWidth ?? 32) / 2))).map(road => road.id)
      expect(blockedRoads, `${building.id} blocks streets`).toEqual([])
      const overlaps = URBAN_BUILDINGS.filter(other => other.id !== building.id &&
        Math.abs(building.x - other.x) < (building.width + other.width) / 2 &&
        Math.abs(building.y - other.y) < (building.height + other.height) / 2).map(other => other.id)
      expect(overlaps, `${building.id} overlaps buildings`).toEqual([])
    }
    for (const tree of WORLD_DECORATIONS) {
      expect(tree.x - tree.radius).toBeGreaterThanOrEqual(0)
      expect(tree.y - tree.radius).toBeGreaterThanOrEqual(0)
      expect(tree.x + tree.radius).toBeLessThanOrEqual(CITY.width)
      expect(tree.y + tree.radius).toBeLessThanOrEqual(CITY.height)
      expect(isUrbanWalkable(tree.x, tree.y)).toBe(false)
    }
    expect(new Set(WORLD_DECORATIONS.map(tree => tree.zoneId))).toEqual(new Set(WORLD_ZONES.map(zone => zone.id)))
  })

  it('delivers to physical homes as well as businesses, including the new boroughs', () => {
    const homeAddresses = [
      'DeliveryZone', 'BrăilaApartments', 'WillowCourt', 'BakeryFlats',
      'CanalHouse', 'MarinaHouse', 'HarborLofts', 'StationFlats',
      'GardenCourt', 'ParkHouse', 'OrchardHouse', 'SouthCourt',
    ]
    for (const label of homeAddresses) {
      const location = findCityLocation(label)!
      expect(URBAN_BUILDINGS.find(building => building.id === location.buildingId)?.kind, label).toBe('home')
    }
    for (const label of ['ArcadeOffice', 'QuayOffice', 'FoundryOffice']) {
      const location = findCityLocation(label)!
      expect(URBAN_BUILDINGS.find(building => building.id === location.buildingId)?.kind, label).toBe('shop')
    }
    for (const merchant of CITY_MERCHANTS) {
      expect(URBAN_BUILDINGS.find(building => building.id === merchant.buildingId)?.kind).not.toBe('home')
    }
  })

  it('preserves every legacy route identity while reprojecting its physical frontage', () => {
    expect(CITY_LOCATIONS.map(p => p.label).sort()).toEqual(LEGACY_ROUTES.map(p => p.label).sort())
    for (const previous of LEGACY_ROUTES) {
      expect(findCityLocation(previous.label)).toMatchObject({ buildingId: previous.buildingId, kind: previous.kind, zoneId: previous.zoneId })
      expect(findCityLocation(previous.label)!.x).not.toBe(previous.x)
    }
  })

})

describe('connected street distance, not a central-avenue shortcut', () => {
  it('connects every road node and every district to HQ through the actual collision map', () => {
    expect(new Set(CITY_ROAD_NETWORK.edges.map(edge => edge.roadId))).toEqual(new Set(WORLD_ROADS.map(road => road.id)))
    const neighbors = new Map<string, string[]>()
    for (const edge of CITY_ROAD_NETWORK.edges) for (const [a, b] of [[edge.from, edge.to], [edge.to, edge.from]]) {
      const bucket = neighbors.get(a) ?? []; bucket.push(b); neighbors.set(a, bucket)
    }
    const visited = new Set<string>(), queue = [`${PLAYER_START.x},${PLAYER_START.y}`]
    for (let i = 0; i < queue.length; i++) {
      const id = queue[i]
      if (visited.has(id)) continue
      visited.add(id); queue.push(...(neighbors.get(id) ?? []))
    }
    for (const node of CITY_ROAD_NETWORK.nodes) {
      expect(isUrbanWalkable(node.x, node.y, true), node.id).toBe(true)
      expect(visited.has(node.id), node.id).toBe(true)
    }
    for (const location of CITY_LOCATIONS) {
      const route = findRoadRoute(CITY_ROAD_NETWORK, PLAYER_START, location)!
      expect(route.points[0]).toEqual(PLAYER_START)
      expect(route.points.at(-1)).toEqual({ x: location.x, y: location.y })
      let length = 0
      for (let i = 1; i < route.points.length; i++) {
        const a = route.points[i - 1]
        const b = route.points[i]
        const distance = Math.hypot(b.x - a.x, b.y - a.y)
        length += distance
        const steps = Math.ceil(distance / 8)
        for (let step = 0; step <= steps; step++) {
          expect(isUrbanWalkable(a.x + (b.x - a.x) * step / steps, a.y + (b.y - a.y) * step / steps, true))
            .toBe(true)
        }
      }
      expect(length).toBeCloseTo(route.distance, 8)
    }
  })

  it('uses source streets and returns symmetric distances', () => {
    const route = findCityRoute('CanalPickup', 'MarinaHouse')!
    expect(route.distance).toBeGreaterThan(0)
    expect(getCityRouteDistance('MarinaHouse', 'CanalPickup')).toBeCloseTo(route.distance, 7)
    expect(route.points.length).toBeGreaterThan(2)
    const a = route.points[0], b = route.points.at(-1)!
    expect(route.distance).toBeGreaterThanOrEqual(Math.hypot(a.x - b.x, a.y - b.y))
    expect(getCityRouteDistance('PickupZone', 'DeliveryZone')).toBeGreaterThan(0)
  })

  it('takes real detours even for endpoints at the same y coordinate and rejects blocked/disconnected roads', () => {
    const roads = [
      { id: 'west', x: 100, y: 200, width: 40, height: 240 },
      { id: 'east', x: 300, y: 200, width: 40, height: 240 },
      { id: 'detour', x: 200, y: 300, width: 240, height: 40 },
      { id: 'island', x: 600, y: 100, width: 120, height: 40 },
    ]
    const from = { x: 100, y: 100 }
    const to = { x: 300, y: 100 }
    const island = { x: 600, y: 100 }
    const graph = buildRoadNetwork(roads, [from, to, island])
    expect(findRoadRoute(graph, from, to)?.distance).toBe(600)
    expect(findRoadRoute(graph, from, island)).toBeNull()
    const blocked = buildRoadNetwork(roads, [from, to], (x, y) => !(x >= 190 && x <= 210 && y === 300))
    expect(findRoadRoute(blocked, from, to)).toBeNull()
    expect(findRoadRoute(graph, { x: NaN, y: 100 }, to)).toBeNull()
  })

  it('rejects unknown, unreachable, mislinked and off-road locations', () => {
    const valid = findCityLocation('CanalPickup')!
    expect(isCityLocationReachable(valid, { nodes: [], edges: [] })).toBe(false)
    expect(isCityLocationReachable({ ...valid, buildingId: 'missing-shop' })).toBe(false)
    expect(isCityLocationReachable({ ...valid, roadId: 'missing-road' })).toBe(false)
    expect(isCityLocationReachable({ ...valid, zoneId: 'garden' })).toBe(false)
    expect(isCityLocationReachable({ ...valid, door: { x: 0, y: 0 } })).toBe(false)
    expect(isCityLocationReachable({ ...valid, x: valid.x + 10, y: valid.y + 200 })).toBe(false)
    expect(findCityRoute('unknown-shop', 'DeliveryZone')).toBeNull()
    expect(getCityRouteDistance('PickupZone', 'unknown-customer')).toBe(Infinity)
  })

  it('does not create reachable self-routes at blocked road endpoints', () => {
    const navigable = (x: number) => x >= 30
    const graph = buildRoadNetwork(
      [{ id: 'partly-blocked', x: 50, y: 100, width: 100, height: 40 }],
      [{ x: 60, y: 100 }], navigable,
    )
    expect(graph.nodes.every(point => navigable(point.x))).toBe(true)
    expect(findRoadRoute(graph, { x: 10, y: 100 }, { x: 10, y: 100 })).toBeNull()
    expect(findRoadRoute(graph, { x: 60, y: 100 }, { x: 100, y: 100 })?.distance).toBe(40)
  })

  it('connects overlapping centerlines and off-center entrances without diagonal shortcuts', () => {
    const from = { x: 20, y: 105 }
    const to = { x: 250, y: 250 }
    const graph = buildRoadNetwork([
      { id: 'west', x: 100, y: 100, width: 200, height: 40 },
      { id: 'east', x: 220, y: 100, width: 160, height: 40 },
      { id: 'south', x: 250, y: 170, width: 40, height: 200 },
    ], [from, to])
    const route = findRoadRoute(graph, from, to)!
    expect(route.distance).toBe(385)
    expect(route.points[0]).toEqual(from)
    expect(route.points.at(-1)).toEqual(to)
    expect(findRoadRoute(graph, to, from)?.distance).toBe(route.distance)
  })
})
