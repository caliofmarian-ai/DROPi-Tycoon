import { CITY_COLORS } from '../ui/theme'

export type WorldZoneId = 'residential' | 'business' | 'storage' | 'company' | 'waterfront' | 'garden'

export interface WorldZoneLayout {
  id: WorldZoneId
  label: string
  x: number
  y: number
  width: number
  height: number
  fillColor: number
}

export interface WorldRectLayout {
  id: string
  x: number
  y: number
  width: number
  height: number
}

export interface WorldBuildingLayout extends WorldRectLayout {
  texture: 'building_company_small' | 'building_residential' | 'building_commercial'
  zoneId: WorldZoneId
  kind: 'home' | 'shop' | 'hq' | 'depot'
  entranceFacing: 'up' | 'down'
  door: { x: number; y: number }
}

export interface WorldDecorationLayout {
  id: string
  x: number
  y: number
  radius: number
  zoneId: WorldZoneId
}

export interface WorldRoutePoint {
  label: string
  x: number
  y: number
  zoneId: WorldZoneId
  kind: 'pickup' | 'delivery'
  buildingId: string
  roadId: string
  displayName: string
}

export const WORLD_WIDTH = 3200
export const WORLD_HEIGHT = 2400

/** Player position is regenerated, not persisted (ODR-001=A). */
export const PLAYER_START = { x: 380, y: 270 } as const

export const WORLD_ZONES: readonly WorldZoneLayout[] = [
  { id: 'residential', label: 'Old Town', x: 80, y: 80, width: 640, height: 420, fillColor: CITY_COLORS.lawn },
  { id: 'business', label: 'Cedar Commerce', x: 880, y: 80, width: 640, height: 420, fillColor: CITY_COLORS.cream },
  { id: 'storage', label: 'Foundry Quarter', x: 80, y: 700, width: 640, height: 1620, fillColor: CITY_COLORS.wallShade },
  { id: 'company', label: 'Station Commons', x: 880, y: 700, width: 640, height: 1620, fillColor: CITY_COLORS.sidewalk },
  { id: 'waterfront', label: 'Canal & Quays', x: 1680, y: 80, width: 1440, height: 1020, fillColor: CITY_COLORS.waterLight },
  { id: 'garden', label: 'Garden Borough', x: 1680, y: 1300, width: 1440, height: 1020, fillColor: CITY_COLORS.leafSun },
]

export const WORLD_ROADS: readonly WorldRectLayout[] = [
  { id: 'central-horizontal', x: 1600, y: 600, width: 3040, height: 120 },
  { id: 'central-vertical', x: 800, y: 1200, width: 120, height: 2240 },
  { id: 'residential-lane', x: 450, y: 290, width: 700, height: 64 },
  { id: 'business-lane', x: 1200, y: 290, width: 800, height: 64 },
  { id: 'storage-lane', x: 450, y: 910, width: 700, height: 64 },
  { id: 'company-lane', x: 1200, y: 910, width: 800, height: 64 },
  { id: 'canal-avenue', x: 1600, y: 1200, width: 120, height: 2240 },
  { id: 'garden-avenue', x: 2400, y: 1200, width: 96, height: 2240 },
  { id: 'market-boulevard', x: 1600, y: 1200, width: 3040, height: 100 },
  { id: 'garden-boulevard', x: 1600, y: 1800, width: 3040, height: 100 },
  { id: 'south-esplanade', x: 1600, y: 2300, width: 3040, height: 64 },
  { id: 'canal-lane', x: 2360, y: 290, width: 1520, height: 64 },
  { id: 'quay-lane', x: 2360, y: 910, width: 1520, height: 64 },
  { id: 'foundry-lane', x: 450, y: 1490, width: 700, height: 64 },
  { id: 'station-lane', x: 1200, y: 1490, width: 800, height: 64 },
  { id: 'garden-lane', x: 2360, y: 1490, width: 1520, height: 64 },
  { id: 'workshop-lane', x: 450, y: 2090, width: 700, height: 64 },
  { id: 'terminal-lane', x: 1200, y: 2090, width: 800, height: 64 },
  { id: 'orchard-lane', x: 2360, y: 2090, width: 1520, height: 64 },
]

/** Pavement continues through intersections rather than leaving impassable seams. */
export const WORLD_SIDEWALKS: readonly WorldRectLayout[] = WORLD_ROADS.map(road => ({
  ...road, id: `${road.id}-pavement`, width: road.width + 48, height: road.height + 48,
}))

const building = (
  id: string, x: number, y: number, zoneId: WorldZoneId,
  kind: WorldBuildingLayout['kind'] = 'home', entranceFacing: 'up' | 'down' = 'down',
): WorldBuildingLayout => {
  const width = kind === 'hq' ? 160 : kind === 'depot' ? 116 : 90
  const height = kind === 'hq' ? 128 : 108
  return {
    id, x, y, zoneId, kind, width, height, entranceFacing,
    texture: kind === 'home' ? 'building_residential' : kind === 'shop' ? 'building_commercial' : 'building_company_small',
    door: { x, y: y + (entranceFacing === 'up' ? -height : height) / 2 },
  }
}

const block = (
  zoneId: WorldZoneId, xs: readonly number[], ys: readonly number[],
  kind: WorldBuildingLayout['kind'], homes: readonly string[] = [],
): WorldBuildingLayout[] => ys.flatMap((y, row) => xs.map((x, column) => {
  const address = `${row + 1}-${column + 1}`
  return building(`${zoneId}-block-${address}`, x, y, zoneId,
    row % 2 === 0 && !homes.includes(address) ? kind : 'home')
}))

export const WORLD_BUILDINGS: readonly WorldBuildingLayout[] = [
  building('residential-1', 160, 194, 'residential'),
  building('residential-4', 560, 194, 'residential'),
  building('residential-5', 160, 410, 'residential'),
  building('residential-6', 290, 386, 'residential', 'home', 'up'),
  building('residential-7', 420, 410, 'residential'),
  building('residential-8', 620, 386, 'residential', 'shop', 'up'),
  building('main-hq', 380, 170, 'residential', 'hq'),
  building('business-1', 960, 160, 'business', 'shop'),
  building('business-2', 1100, 194, 'business', 'shop'),
  building('business-3', 1220, 194, 'business', 'shop'),
  building('business-4', 1360, 194, 'business', 'shop'),
  building('business-5', 960, 386, 'business', 'home', 'up'),
  building('business-6', 1090, 410, 'business', 'shop'),
  building('business-7', 1220, 410, 'business', 'shop'),
  building('business-8', 1350, 410, 'business', 'shop'),
  building('storage-1', 180, 814, 'storage', 'depot'),
  building('storage-2', 360, 814, 'storage', 'depot'),
  building('storage-3', 620, 814, 'storage', 'shop'),
  building('storage-4', 360, 1040, 'storage', 'depot'),
  building('company-1', 980, 814, 'company', 'depot'),
  building('company-2', 1160, 790, 'company', 'depot'),
  building('company-3', 1360, 814, 'company', 'depot'),
  building('company-4', 1160, 1040, 'company', 'depot'),
  ...block('storage', [180, 360, 540], [1394, 1620, 1994, 2190], 'depot'),
  ...block('company', [980, 1160, 1340], [1394, 1620, 1994, 2190], 'shop', ['3-1']),
  ...block('waterfront', [1820, 2020, 2220, 2580, 2800, 3020], [194, 410, 814, 1040], 'shop', ['1-3', '3-3', '3-6']),
  ...block('garden', [1820, 2020, 2220, 2580, 2800, 3020], [1394, 1620, 1994, 2190], 'shop', ['1-1', '1-5', '3-3', '3-6']),
]

export const WORLD_DECORATIONS: readonly WorldDecorationLayout[] = WORLD_ZONES.flatMap(zone => {
  const rows = Math.max(2, Math.floor(zone.height / 240))
  return Array.from({ length: rows }, (_, row) => [zone.x + 20, zone.x + zone.width - 40]
    .map((x, side) => ({
      id: `tree-${zone.id}-${row + 1}-${side}`, x,
      y: zone.y + 40 + row * (zone.height - 80) / (rows - 1),
      radius: 13 + row % 3, zoneId: zone.id,
    }))).flat()
}).filter(tree => !WORLD_SIDEWALKS.some(surface =>
  Math.abs(tree.x - surface.x) < surface.width / 2 + tree.radius + 12 &&
  Math.abs(tree.y - surface.y) < surface.height / 2 + tree.radius + 12,
) && !WORLD_BUILDINGS.some(entry =>
  Math.abs(tree.x - entry.x) < entry.width / 2 + tree.radius &&
  Math.abs(tree.y - entry.y) < entry.height / 2 + tree.radius,
))

const location = (
  label: string, displayName: string, buildingId: string, roadId: string,
  kind: WorldRoutePoint['kind'],
): WorldRoutePoint => {
  const site = WORLD_BUILDINGS.find(entry => entry.id === buildingId)!
  const road = WORLD_ROADS.find(entry => entry.id === roadId)!
  return { label, displayName, buildingId, roadId, kind, x: site.x, y: road.y, zoneId: site.zoneId }
}

/** Legacy route identifiers and their coordinates remain valid for accepted work. */
export const WORLD_ROUTE_POINTS: readonly WorldRoutePoint[] = [
  location('PickupZone', "Mara's Market", 'storage-3', 'storage-lane', 'pickup'),
  location('CommercialPickup', 'Cedar Bakery', 'business-2', 'business-lane', 'pickup'),
  location('ResidentialPickup', 'Neighborhood Co-op', 'residential-8', 'residential-lane', 'pickup'),
  location('DeliveryZone', 'Noah · Cedar House', 'residential-4', 'residential-lane', 'delivery'),
  location('DeliveryPoint', 'Ada · Commerce House', 'business-4', 'business-lane', 'delivery'),
  location('CompanyDelivery', 'East Yard Reception', 'company-3', 'company-lane', 'delivery'),
  location('CanalPickup', 'Canal Grocers', 'waterfront-block-1-1', 'canal-lane', 'pickup'),
  location('HarborPickup', 'Quayside Kitchen', 'waterfront-block-3-5', 'quay-lane', 'pickup'),
  location('DepotPickup', 'Foundry Supplies', 'storage-block-1-2', 'foundry-lane', 'pickup'),
  location('GardenPickup', 'Garden Florist', 'garden-block-1-2', 'garden-lane', 'pickup'),
  location('StationPickup', 'Station Books', 'company-block-3-2', 'terminal-lane', 'pickup'),
  location('CedarApartments', 'Cedar Apartments', 'residential-1', 'residential-lane', 'delivery'),
  location('WillowCourt', 'Willow Court', 'residential-6', 'residential-lane', 'delivery'),
  location('BakeryFlats', 'Bakery Flats', 'business-5', 'business-lane', 'delivery'),
  location('ArcadeOffice', 'Arcade Office', 'business-3', 'business-lane', 'delivery'),
  location('WarehouseLofts', 'Warehouse Lofts', 'storage-1', 'storage-lane', 'delivery'),
  location('MakersStudio', 'Makers Studio', 'storage-2', 'storage-lane', 'delivery'),
  location('DispatchOffice', 'Dispatch Office', 'company-1', 'company-lane', 'delivery'),
  location('CanalHouse', 'Canal House', 'waterfront-block-1-3', 'canal-lane', 'delivery'),
  location('QuayOffice', 'Quay Office', 'waterfront-block-1-4', 'canal-lane', 'delivery'),
  location('HarborLofts', 'Harbor Lofts', 'waterfront-block-3-6', 'quay-lane', 'delivery'),
  location('MarinaHouse', 'Marina House', 'waterfront-block-3-3', 'quay-lane', 'delivery'),
  location('FreightHouse', 'Freight House', 'storage-block-1-1', 'foundry-lane', 'delivery'),
  location('FoundryOffice', 'Foundry Office', 'company-block-1-3', 'station-lane', 'delivery'),
  location('GardenCourt', 'Garden Court', 'garden-block-1-1', 'garden-lane', 'delivery'),
  location('ParkHouse', 'Park House', 'garden-block-1-5', 'garden-lane', 'delivery'),
  location('StationFlats', 'Station Flats', 'company-block-3-1', 'terminal-lane', 'delivery'),
  location('OrchardHouse', 'Orchard House', 'garden-block-3-3', 'orchard-lane', 'delivery'),
  location('SouthCourt', 'South Court', 'garden-block-3-6', 'orchard-lane', 'delivery'),
]

export const DELIVERY_ROUTE_POINTS = WORLD_ROUTE_POINTS.filter(point => point.kind === 'delivery')

export const findWorldRoutePoint = (label: string): WorldRoutePoint | undefined =>
  WORLD_ROUTE_POINTS.find(point => point.label === label)

export const isPointInsideWorld = (x: number, y: number): boolean =>
  Number.isFinite(x) && Number.isFinite(y) && x >= 0 && x <= WORLD_WIDTH && y >= 0 && y <= WORLD_HEIGHT

export const isZoneInsideWorld = (zone: WorldZoneLayout): boolean =>
  isPointInsideWorld(zone.x, zone.y) && zone.width > 0 && zone.height > 0 &&
  isPointInsideWorld(zone.x + zone.width, zone.y + zone.height)
