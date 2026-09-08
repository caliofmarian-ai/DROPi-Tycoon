import type Phaser from 'phaser'
import { CITY_COLORS as C, COLORS } from '../ui/theme'
import { cityLabel } from './cityArt'
import {
  WORLD_BUILDINGS, WORLD_ROADS, WORLD_ROUTE_POINTS, WORLD_ZONES,
  type WorldBuildingLayout, type WorldZoneId, type WorldZoneLayout,
} from './worldLayout'

export type DistrictCueKind = 'courtyard' | 'commerce-plaza' | 'industrial-yard' | 'logistics-bays' | 'quays' | 'garden-walk'

export interface DistrictIdentityProfile {
  zoneId: WorldZoneId
  cueKind: DistrictCueKind
  accent: number
}

export const DISTRICT_IDENTITY_PROFILES: readonly DistrictIdentityProfile[] = [
  { zoneId: 'residential', cueKind: 'courtyard', accent: C.roof },
  { zoneId: 'business', cueKind: 'commerce-plaza', accent: COLORS.accentStrong },
  { zoneId: 'storage', cueKind: 'industrial-yard', accent: C.parcel },
  { zoneId: 'company', cueKind: 'logistics-bays', accent: C.roofBlue },
  { zoneId: 'waterfront', cueKind: 'quays', accent: C.water },
  { zoneId: 'garden', cueKind: 'garden-walk', accent: C.leafDark },
] as const

export const STREET_NAME_BY_ROAD_ID: Readonly<Record<string, string>> = {
  'central-horizontal': 'Cedar Avenue',
  'central-vertical': 'Station Street',
  'residential-lane': 'Willow Lane',
  'business-lane': 'Commerce Row',
  'storage-lane': 'Foundry Road',
  'company-lane': 'Dispatch Way',
  'canal-lane': 'Quayside Lane',
  'garden-lane': 'Garden Walk',
  'orchard-lane': 'Orchard Road',
  'south-esplanade': 'South Esplanade',
} as const

export interface CityStreetSign {
  roadId: string
  name: string
  x: number
  y: number
  horizontal: boolean
}

const roadSign = (roadId: string): CityStreetSign | undefined => {
  const road = WORLD_ROADS.find(candidate => candidate.id === roadId)
  const name = STREET_NAME_BY_ROAD_ID[roadId]
  if (!road || !name) return undefined
  const horizontal = road.width > road.height
  return {
    roadId,
    name,
    horizontal,
    x: horizontal ? road.x - road.width / 2 + Math.min(180, road.width * 0.28) : road.x + road.width / 2 + 52,
    y: horizontal ? road.y - road.height / 2 - 18 : road.y - road.height / 2 + Math.min(180, road.height * 0.2),
  }
}

export const CITY_STREET_SIGNS: readonly CityStreetSign[] = Object.keys(STREET_NAME_BY_ROAD_ID)
  .map(roadSign)
  .filter((sign): sign is CityStreetSign => Boolean(sign))

export interface CityAddressPlaque {
  buildingId: string
  number: number
  x: number
  y: number
}

const stableAddressNumber = (buildingId: string): number => {
  if (buildingId === 'main-hq') return 1
  if (buildingId === 'business-1') return 10
  let hash = 17
  for (const character of buildingId) hash = (hash * 31 + character.charCodeAt(0)) % 997
  return 2 + (hash % 97)
}

const plaqueFor = (building: WorldBuildingLayout): CityAddressPlaque => ({
  buildingId: building.id,
  number: stableAddressNumber(building.id),
  x: building.x - building.width / 2 + 12,
  y: building.y + (building.entranceFacing === 'up' ? -1 : 1) * (building.height / 2 - 14),
})

const addressedBuildingIds = (() => {
  const ids = new Set<string>(['main-hq', 'business-1'])
  for (const point of WORLD_ROUTE_POINTS) {
    if (ids.size >= 18) break
    ids.add(point.buildingId)
  }
  return ids
})()

export const CITY_ADDRESS_PLAQUES: readonly CityAddressPlaque[] = WORLD_BUILDINGS
  .filter(building => addressedBuildingIds.has(building.id))
  .map(plaqueFor)

const profileFor = (zoneId: WorldZoneId): DistrictIdentityProfile =>
  DISTRICT_IDENTITY_PROFILES.find(profile => profile.zoneId === zoneId)!

const drawCourtyard = (g: Phaser.GameObjects.Graphics, zone: WorldZoneLayout): void => {
  const left = zone.x + 28
  const top = zone.y + zone.height - 82
  g.fillStyle(C.pavingLine, 0.55).fillRoundedRect(left, top, 190, 48, 14)
  g.fillStyle(C.sidewalk, 0.9).fillRoundedRect(left + 5, top + 5, 180, 38, 11)
  for (let x = left + 20; x < left + 174; x += 31) {
    g.fillStyle(C.roof, 0.2).fillRect(x, top + 8, 2, 32)
  }
  g.fillStyle(C.leafDark).fillCircle(left + 27, top + 24, 8).fillCircle(left + 157, top + 24, 8)
}

const drawCommercePlaza = (g: Phaser.GameObjects.Graphics, zone: WorldZoneLayout): void => {
  const left = zone.x + zone.width - 232
  const top = zone.y + zone.height - 92
  g.fillStyle(C.cream, 0.82).fillRoundedRect(left, top, 198, 58, 10)
  g.lineStyle(1, COLORS.accentStrong, 0.35)
  for (let x = left + 12; x < left + 190; x += 24) g.lineBetween(x, top + 5, x, top + 53)
  for (let y = top + 12; y < top + 53; y += 20) g.lineBetween(left + 5, y, left + 193, y)
  g.fillStyle(C.roofBlue).fillCircle(left + 24, top + 29, 7).fillCircle(left + 174, top + 29, 7)
}

const drawIndustrialYard = (g: Phaser.GameObjects.Graphics, zone: WorldZoneLayout): void => {
  const left = zone.x + 28
  const top = zone.y + 270
  g.fillStyle(C.roadEdge, 0.52).fillRoundedRect(left, top, 210, 62, 8)
  for (let x = left + 8; x < left + 202; x += 22) {
    g.fillStyle((x / 22) % 2 < 1 ? C.parcel : C.cream, 0.62)
      .fillRect(x, top + 5, 11, 5)
  }
  g.lineStyle(2, C.metal, 0.55).strokeRoundedRect(left + 8, top + 18, 194, 35, 4)
}

const drawLogisticsBays = (g: Phaser.GameObjects.Graphics, zone: WorldZoneLayout): void => {
  const left = zone.x + zone.width - 244
  const top = zone.y + 270
  g.fillStyle(C.metal, 0.2).fillRoundedRect(left, top, 212, 68, 8)
  for (let bay = 0; bay < 4; bay++) {
    const x = left + 10 + bay * 49
    g.lineStyle(2, C.roofBlue, 0.75).strokeRoundedRect(x, top + 9, 39, 49, 3)
    g.fillStyle(C.cream, 0.55).fillRect(x + 15, top + 13, 9, 3)
  }
}

const drawQuays = (g: Phaser.GameObjects.Graphics, zone: WorldZoneLayout): void => {
  const left = zone.x + 80
  const top = zone.y + zone.height - 86
  g.fillStyle(C.trunk, 0.4).fillRoundedRect(left, top, 320, 45, 7)
  for (let x = left + 7; x < left + 314; x += 18) {
    g.lineStyle(1, C.cream, 0.38).lineBetween(x, top + 4, x, top + 41)
  }
  g.fillStyle(C.waterLight, 0.4).fillRoundedRect(left + 8, top + 48, 304, 11, 5)
}

const drawGardenWalk = (g: Phaser.GameObjects.Graphics, zone: WorldZoneLayout): void => {
  const left = zone.x + 80
  const top = zone.y + 260
  g.fillStyle(C.sidewalk, 0.72).fillRoundedRect(left, top, 330, 34, 17)
  for (let x = left + 15; x < left + 320; x += 34) {
    g.fillStyle(C.leaf, 0.85).fillCircle(x, top + 7, 8)
    g.fillStyle(C.flowerPink, 0.9).fillCircle(x + 2, top + 5, 3)
  }
}

/** Static, cached district storytelling only. It never changes collision or simulation state. */
export const drawDistrictIdentityGround = (
  g: Phaser.GameObjects.Graphics,
  zones: readonly WorldZoneLayout[] = WORLD_ZONES,
): void => {
  for (const zone of zones) {
    switch (profileFor(zone.id).cueKind) {
      case 'courtyard': drawCourtyard(g, zone); break
      case 'commerce-plaza': drawCommercePlaza(g, zone); break
      case 'industrial-yard': drawIndustrialYard(g, zone); break
      case 'logistics-bays': drawLogisticsBays(g, zone); break
      case 'quays': drawQuays(g, zone); break
      case 'garden-walk': drawGardenWalk(g, zone); break
    }
  }
}

/** Bounded crisp labels layered over cached world art. */
export const renderCityStreetAndAddressLabels = (scene: Phaser.Scene): void => {
  for (const sign of CITY_STREET_SIGNS) {
    const label = cityLabel(scene, sign.x, sign.y, sign.name.toUpperCase(), 9, '#fff4ce', '#175574')
      .setDepth(7).setAlpha(0.9).setName(`street-sign:${sign.roadId}`)
    if (!sign.horizontal && typeof label.setAngle === 'function') label.setAngle(-90)
  }
  for (const plaque of CITY_ADDRESS_PLAQUES) {
    cityLabel(scene, plaque.x, plaque.y, `${plaque.number}`, 8, '#175574', '#fff4ce')
      .setDepth(7).setName(`address:${plaque.buildingId}`)
  }
}
