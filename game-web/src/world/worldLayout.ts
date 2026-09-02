export type WorldZoneId = 'residential' | 'business' | 'storage' | 'company'

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

export interface WorldBuildingLayout {
  id: string
  x: number
  y: number
  texture: 'building_company_small' | 'building_residential' | 'building_commercial'
  zoneId: WorldZoneId
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
}

export const WORLD_WIDTH = 1600
export const WORLD_HEIGHT = 1200

export const PLAYER_START = { x: 1120, y: 900 } as const

export const WORLD_ZONES: readonly WorldZoneLayout[] = [
  {
    id: 'residential',
    label: 'Residential Area',
    x: 80,
    y: 80,
    width: 640,
    height: 420,
    fillColor: 0xc7f9cc,
  },
  {
    id: 'business',
    label: 'Business Area',
    x: 880,
    y: 80,
    width: 640,
    height: 420,
    fillColor: 0xfff1b8,
  },
  {
    id: 'storage',
    label: 'Storage / Pickup Area',
    x: 80,
    y: 700,
    width: 640,
    height: 420,
    fillColor: 0xdbeafe,
  },
  {
    id: 'company',
    label: 'Company Base',
    x: 880,
    y: 700,
    width: 640,
    height: 420,
    fillColor: 0xffedd5,
  },
] as const

export const WORLD_ROADS: readonly WorldRectLayout[] = [
  { id: 'central-horizontal', x: 800, y: 600, width: 1440, height: 120 },
  { id: 'central-vertical', x: 800, y: 600, width: 120, height: 1040 },
  { id: 'residential-lane', x: 400, y: 290, width: 560, height: 64 },
  { id: 'business-lane', x: 1200, y: 290, width: 560, height: 64 },
  { id: 'storage-lane', x: 400, y: 910, width: 560, height: 64 },
  { id: 'company-lane', x: 1200, y: 910, width: 560, height: 64 },
] as const

export const WORLD_SIDEWALKS: readonly WorldRectLayout[] = [
  { id: 'horizontal-north', x: 800, y: 525, width: 1440, height: 24 },
  { id: 'horizontal-south', x: 800, y: 675, width: 1440, height: 24 },
  { id: 'vertical-west', x: 725, y: 600, width: 24, height: 1040 },
  { id: 'vertical-east', x: 875, y: 600, width: 24, height: 1040 },
  { id: 'residential-walk', x: 400, y: 342, width: 560, height: 18 },
  { id: 'business-walk', x: 1200, y: 342, width: 560, height: 18 },
  { id: 'storage-walk', x: 400, y: 962, width: 560, height: 18 },
  { id: 'company-walk', x: 1200, y: 962, width: 560, height: 18 },
] as const

const residentialBuildings: WorldBuildingLayout[] = [
  [160, 160], [290, 160], [420, 160], [550, 160],
  [160, 410], [290, 410], [420, 410], [550, 410],
].map(([x, y], index) => ({
  id: `residential-${index + 1}`,
  x,
  y,
  texture: 'building_residential',
  zoneId: 'residential',
}))

const businessBuildings: WorldBuildingLayout[] = [
  [960, 160], [1090, 160], [1220, 160], [1350, 160],
  [960, 410], [1090, 410], [1220, 410], [1350, 410],
].map(([x, y], index) => ({
  id: `business-${index + 1}`,
  x,
  y,
  texture: 'building_commercial',
  zoneId: 'business',
}))

const storageBuildings: WorldBuildingLayout[] = [
  [180, 790], [360, 790], [540, 790], [360, 1040],
].map(([x, y], index) => ({
  id: `storage-${index + 1}`,
  x,
  y,
  texture: 'building_company_small',
  zoneId: 'storage',
}))

const companyBuildings: WorldBuildingLayout[] = [
  [980, 790], [1160, 790], [1340, 790], [1160, 1040],
].map(([x, y], index) => ({
  id: `company-${index + 1}`,
  x,
  y,
  texture: 'building_company_small',
  zoneId: 'company',
}))

export const WORLD_BUILDINGS: readonly WorldBuildingLayout[] = [
  ...residentialBuildings,
  ...businessBuildings,
  ...storageBuildings,
  ...companyBuildings,
]

export const WORLD_DECORATIONS: readonly WorldDecorationLayout[] = [
  { id: 'tree-r-1', x: 100, y: 120, radius: 14, zoneId: 'residential' },
  { id: 'tree-r-2', x: 650, y: 120, radius: 14, zoneId: 'residential' },
  { id: 'tree-r-3', x: 100, y: 460, radius: 14, zoneId: 'residential' },
  { id: 'tree-r-4', x: 650, y: 460, radius: 14, zoneId: 'residential' },
  { id: 'tree-b-1', x: 900, y: 120, radius: 13, zoneId: 'business' },
  { id: 'tree-b-2', x: 1480, y: 120, radius: 13, zoneId: 'business' },
  { id: 'tree-b-3', x: 900, y: 460, radius: 13, zoneId: 'business' },
  { id: 'tree-b-4', x: 1480, y: 460, radius: 13, zoneId: 'business' },
  { id: 'tree-s-1', x: 100, y: 740, radius: 15, zoneId: 'storage' },
  { id: 'tree-s-2', x: 650, y: 740, radius: 15, zoneId: 'storage' },
  { id: 'tree-s-3', x: 100, y: 1080, radius: 15, zoneId: 'storage' },
  { id: 'tree-s-4', x: 650, y: 1080, radius: 15, zoneId: 'storage' },
  { id: 'tree-c-1', x: 900, y: 740, radius: 15, zoneId: 'company' },
  { id: 'tree-c-2', x: 1480, y: 740, radius: 15, zoneId: 'company' },
  { id: 'tree-c-3', x: 900, y: 1080, radius: 15, zoneId: 'company' },
  { id: 'tree-c-4', x: 1480, y: 1080, radius: 15, zoneId: 'company' },
] as const

export const WORLD_ROUTE_POINTS: readonly WorldRoutePoint[] = [
  { label: 'CompanyPickup', x: 960, y: 850, zoneId: 'company', kind: 'pickup' },
  { label: 'CommercialPickup', x: 980, y: 430, zoneId: 'business', kind: 'pickup' },
  { label: 'ResidentialPickup', x: 620, y: 430, zoneId: 'residential', kind: 'pickup' },
  { label: 'DeliveryZone', x: 560, y: 390, zoneId: 'residential', kind: 'delivery' },
  { label: 'DeliveryPoint', x: 1360, y: 390, zoneId: 'business', kind: 'delivery' },
  { label: 'CompanyDelivery', x: 1360, y: 850, zoneId: 'company', kind: 'delivery' },
] as const

export const DELIVERY_ROUTE_POINTS = WORLD_ROUTE_POINTS.filter(
  (point): point is WorldRoutePoint => point.kind === 'delivery',
)

export const findWorldRoutePoint = (label: string): WorldRoutePoint | undefined =>
  WORLD_ROUTE_POINTS.find((point) => point.label === label)

export const isPointInsideWorld = (x: number, y: number): boolean =>
  x >= 0 && x <= WORLD_WIDTH && y >= 0 && y <= WORLD_HEIGHT

export const isZoneInsideWorld = (zone: WorldZoneLayout): boolean =>
  zone.x >= 0 &&
  zone.y >= 0 &&
  zone.x + zone.width <= WORLD_WIDTH &&
  zone.y + zone.height <= WORLD_HEIGHT
