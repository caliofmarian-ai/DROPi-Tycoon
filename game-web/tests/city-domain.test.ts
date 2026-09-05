import { describe, expect, it } from 'vitest'
import {
  CITY, CITY_DISTRICTS, CITY_LOCATIONS, CITY_MERCHANTS, CITY_ROAD_NETWORK, findCityLocation,
  findCityRoute, getCityRouteDistance, isCityLocationReachable,
} from '../src/world/city'
import { buildRoadNetwork, findRoadRoute } from '../src/world/cityNavigation'
import { isUrbanWalkable, URBAN_BUILDINGS, URBAN_ENTRANCE_PATHS } from '../src/world/urbanWorld'
import { PLAYER_START, WORLD_DECORATIONS, WORLD_ROADS, WORLD_ZONES } from '../src/world/worldLayout'

describe('finite city and district catalog', () => {
  it('owns six distinct populated districts and preserves the initial reset position', () => {
    expect(CITY).toMatchObject({ cityId: 'cedar-city', width: 3200, height: 2400 })
    expect(CITY.districts).toBe(CITY_DISTRICTS)
    expect(CITY_DISTRICTS).toHaveLength(6)
    expect(PLAYER_START).toEqual({ x: 380, y: 270 })
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
      expect(Math.abs(location.door.y - building.y)).toBe(building.height / 2)
      expect(Math.abs(location.y - location.door.y)).toBeLessThanOrEqual(48)
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
      expect(building.x - building.width / 2).toBeGreaterThanOrEqual(district.x)
      expect(building.x + building.width / 2).toBeLessThanOrEqual(district.x + district.width)
      expect(building.y - building.height / 2).toBeGreaterThanOrEqual(district.y)
      expect(building.y + building.height / 2).toBeLessThanOrEqual(district.y + district.height)
      for (const other of [...WORLD_ROADS, ...URBAN_BUILDINGS.filter(entry => entry.id !== building.id)]) {
        const overlap = Math.abs(building.x - other.x) < (building.width + other.width) / 2 &&
          Math.abs(building.y - other.y) < (building.height + other.height) / 2
        expect(overlap, `${building.id} overlaps ${other.id}`).toBe(false)
      }
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
      'DeliveryZone', 'CedarApartments', 'WillowCourt', 'BakeryFlats',
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

  it('preserves all six legacy route labels and coordinates', () => {
    for (const [label, x, y] of [
      ['PickupZone', 620, 910], ['CommercialPickup', 1100, 290], ['ResidentialPickup', 620, 290],
      ['DeliveryZone', 560, 290], ['DeliveryPoint', 1360, 290], ['CompanyDelivery', 1360, 910],
    ] as const) expect(findCityLocation(label)).toMatchObject({ x, y })
  })
})

describe('connected street distance, not a central-avenue shortcut', () => {
  it('connects every road node and every district to HQ through the actual collision map', () => {
    expect(new Set(CITY_ROAD_NETWORK.edges.map(edge => edge.roadId))).toEqual(new Set(WORLD_ROADS.map(road => road.id)))
    for (const node of CITY_ROAD_NETWORK.nodes) {
      expect(isUrbanWalkable(node.x, node.y, true), node.id).toBe(true)
      expect(findRoadRoute(CITY_ROAD_NETWORK, PLAYER_START, node), node.id).not.toBeNull()
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
        expect(a.x === b.x || a.y === b.y).toBe(true)
        length += distance
        const steps = Math.ceil(distance / 8)
        for (let step = 0; step <= steps; step++) {
          expect(isUrbanWalkable(a.x + (b.x - a.x) * step / steps, a.y + (b.y - a.y) * step / steps, true))
            .toBe(true)
        }
      }
      expect(length).toBe(route.distance)
    }
  })

  it('uses nearby new avenues and returns symmetric distances', () => {
    expect(getCityRouteDistance('CanalPickup', 'MarinaHouse')).toBe(1380)
    expect(getCityRouteDistance('MarinaHouse', 'CanalPickup')).toBe(1380)
    expect(findCityRoute('CanalPickup', 'MarinaHouse')!.points.some(point => point.x === 2400)).toBe(true)
    expect(findCityRoute('CanalPickup', 'MarinaHouse')!.points.some(point => point.x === 800)).toBe(false)
    expect(getCityRouteDistance('PickupZone', 'DeliveryZone')).toBe(1040)
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
