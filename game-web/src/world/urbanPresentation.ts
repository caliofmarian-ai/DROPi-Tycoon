import type Phaser from 'phaser'
import type { CompanyState } from '../types/game'
import { resolveActiveTransport } from '../systems/urbanLogistics'
import { URBAN_MERCHANT_PROFILES } from '../systems/urbanInteractions'
import { CITY_COLORS as C, COLORS } from '../ui/theme'
import {
  URBAN_BUILDINGS, URBAN_HQ, URBAN_MARKETPLACE, URBAN_MARKETPLACE_BUILDING_ID, URBAN_ROADS, URBAN_SIDEWALKS,
} from './urbanWorld'
import {
  WORLD_DECORATIONS, WORLD_HEIGHT, WORLD_ROUTE_POINTS, WORLD_WIDTH, WORLD_ZONES, WORLD_LANDSCAPE, WORLD_ROADS, WORLD_CONTEXT_BUILDINGS,
} from './worldLayout'
import {
  cityBuildingSign, cityLabel, drawBench, drawFlowerBox, drawLamp,
  ensureBuildingTexture, ensureNeighborTexture, ensureTreeTexture, NEIGHBOR_ANCHOR, NEIGHBOR_CELL, storefrontIdentity,
} from './cityArt'
import { drawCityPavement } from './cityGround'
import { drawParcel } from './courierArt'

export const HQ_EXPANSION_POINT = URBAN_HQ

/**
 * Ground art is intentionally rasterized below world resolution. Buildings, characters and trees
 * remain crisp independent sprites. The old implementation kept thousands of world-wide Graphics
 * commands alive, so Phaser had to submit the complete city road/grass geometry every frame even
 * when the camera only showed one neighborhood.
 */
export const CITY_GROUND_TEXTURE_SCALE = Math.min(0.5, 1536 / WORLD_WIDTH, 1536 / WORLD_HEIGHT)
const CITY_GROUND_TEXTURE_KEY = 'dropi-braila-static-ground-v1'

export const getHQGrowth = (company?: CompanyState) => ({
  level: company?.level ?? 1,
  tier: Math.min(3, Math.max(1, Math.floor(company?.level ?? 1))),
  staffCount: company?.employees.length ?? 0,
  ownsBicycle: company ? resolveActiveTransport(company, 'bicycle') === 'bicycle' : false,
})

export const drawNeighborhoodNPC = (
  scene: Phaser.Scene, x: number, y: number, merchant: boolean, index = 0,
): Phaser.GameObjects.Container => {
  const person = scene.add.image(0, 0, ensureNeighborTexture(scene, merchant, index))
    .setOrigin(NEIGHBOR_ANCHOR.x / NEIGHBOR_CELL, NEIGHBOR_ANCHOR.y / NEIGHBOR_CELL)
  return scene.add.container(x, y, [person]).setDepth(12)
}

const fallbackShopNames = ['SUNBEAM CAFÉ', 'CITY PHARMACY', 'CORNER GOODS', 'BLOOM & STEM', 'BAKERY', 'PANTRY']

export interface GroundBounds { left: number; top: number; right: number; bottom: number }
export const drawCityGround = (g: Phaser.GameObjects.Graphics, bounds?: GroundBounds): void => {
  const visible = (r: { x: number; y: number; width: number; height: number }): boolean => !bounds ||
    r.x + r.width / 2 + 100 >= bounds.left && r.x - r.width / 2 - 100 <= bounds.right &&
    r.y + r.height / 2 + 100 >= bounds.top && r.y - r.height / 2 - 100 <= bounds.bottom
  g.fillStyle(C.grass).fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT)
  for (const feature of WORLD_LANDSCAPE) {
    if (feature.kind === 'river') {
      g.lineStyle(820, C.water, 1).strokePoints(feature.points, false)
      g.lineStyle(360, C.waterLight, .22).strokePoints(feature.points, false)
    } else if (feature.points.length > 2) g.fillStyle(C.lawn, .9).fillPoints(feature.points, true)
  }
  for (const [index, building] of WORLD_CONTEXT_BUILDINGS.entries()) {
    if (!visible(building)) continue
    const roof = [0xc98862, 0xa56f58, 0xcab394, 0xd9bc90, 0x9caca3][index % 5]
    g.fillStyle(C.shadow, .19).fillPoints(building.points.map(p => ({ x: p.x + 9, y: p.y + 12 })), true)
    g.fillStyle(0xe1cdaa).fillPoints(building.points, true)
    const raised = building.points.map(p => ({ x: p.x, y: p.y - 7 }))
    g.fillStyle(roof).fillPoints(raised, true)
    g.lineStyle(1.4, 0x805d48, .65).strokePoints(raised, true)
  }
  // Real city water and parks replace the former artificial canal pockets.
  drawCityPavement(g, bounds ? URBAN_ROADS.filter(visible) : URBAN_ROADS, bounds ? URBAN_SIDEWALKS.filter(visible) : URBAN_SIDEWALKS)

  // Shadows and low street furniture are static ground decoration and are therefore baked too.
  WORLD_DECORATIONS.forEach((tree, index) => {
    if (!visible({ ...tree, width: 100, height: 100 })) return;
    g.fillStyle(C.shadow, 0.13).fillEllipse(tree.x + tree.radius * 0.4,
      tree.y + 3, tree.radius * 4.6, tree.radius * 1.5)
    if (index % 4 === 0) drawFlowerBox(g, tree.x + tree.radius + 12, tree.y + tree.radius * 0.65, 24)
  })
  for (const zone of WORLD_ZONES) {
    if (!visible({ ...zone, x: zone.x + zone.width / 2, y: zone.y + zone.height / 2 })) continue
    const x = zone.x + zone.width / 2
    const y = zone.y + 34
    drawBench(g, x, y)
    drawLamp(g, x + 38, y + 2)
  }

  // Door markers are static. The active objective remains a separate dynamic marker in GameWorld.
  WORLD_ROUTE_POINTS.forEach(point => {
    if (!visible({ ...point, width: 100, height: 100 })) return
    const merchant = point.kind === 'pickup'
    g.fillStyle(merchant ? COLORS.gold : COLORS.accent, 0.16).fillEllipse(point.x, point.y + 2, 40, 25)
    g.lineStyle(2, merchant ? COLORS.gold : COLORS.accent, 0.85).strokeEllipse(point.x, point.y + 2, 40, 25)
    if (merchant) {
      g.fillStyle(C.parcel).fillRoundedRect(point.x - 5, point.y - 3, 10, 9, 1)
      g.fillStyle(C.cream).fillRect(point.x - 1, point.y - 3, 2, 9)
    } else {
      g.fillStyle(C.curb, 0.85).fillCircle(point.x, point.y + 2, 3)
    }
  })
 }

/**
 * Produce one reusable static ground texture. This work occurs once for the Phaser texture manager;
 * scene restarts reuse the cached texture instead of retaining/replaying the full vector command list.
 */
export const ensureCityGroundTexture = (scene: Phaser.Scene): string => {
  if (scene.textures.exists(CITY_GROUND_TEXTURE_KEY)) return CITY_GROUND_TEXTURE_KEY
  const g = scene.make.graphics({ x: 0, y: 0 })
  g.save().scaleCanvas(CITY_GROUND_TEXTURE_SCALE, CITY_GROUND_TEXTURE_SCALE)
  drawCityGround(g)
  g.restore()
  g.generateTexture(
    CITY_GROUND_TEXTURE_KEY,
    Math.ceil(WORLD_WIDTH * CITY_GROUND_TEXTURE_SCALE),
    Math.ceil(WORLD_HEIGHT * CITY_GROUND_TEXTURE_SCALE),
  )
  g.destroy()
  return CITY_GROUND_TEXTURE_KEY
}

export const renderUrbanNeighborhood = (
  scene: Phaser.Scene, company?: CompanyState,
): Phaser.GameObjects.Graphics | null => {
  const growth = getHQGrowth(company)
  scene.add.image(0, 0, ensureCityGroundTexture(scene))
    .setOrigin(0, 0)
    .setScale(1 / CITY_GROUND_TEXTURE_SCALE)
    .setDepth(0)
    .setName('city-ground-cache')

  // Only company-dependent HQ decoration remains Graphics at runtime; its bounds stay local to HQ.
  const props = scene.add.graphics().setDepth(6).setName('city-hq-dynamic-details')

  URBAN_BUILDINGS.forEach((building, index) => {
    const location = WORLD_ROUTE_POINTS.find(point => point.buildingId === building.id)
    const hq = building.kind === 'hq'
    const marketplace = building.id === URBAN_MARKETPLACE_BUILDING_ID
    const name = hq ? 'DROPi' : marketplace ? 'DROPi Marketplace' : location?.kind === 'pickup' ? location.displayName
      : building.kind === 'depot' ? ['DISPATCH', 'PARCEL WORKS', 'CITY LOGISTICS'][index % 3]
        : fallbackShopNames[index % fallbackShopNames.length]
    const art = {
      name, identity: storefrontIdentity(name), variant: index, growthTier: hq ? growth.tier : undefined,
    }
    scene.add.image(building.x, building.y, ensureBuildingTexture(scene, building, art)).setDepth(5)
    const sign = cityBuildingSign(building, art)
    if (hq || marketplace || building.kind === 'shop' || building.kind === 'depot') {
      const text = cityLabel(scene, sign.signX, sign.signY, name, hq ? 23 : marketplace ? 12 : 10).setDepth(7)
      if (text.width > sign.signWidth) text.setScale(sign.signWidth / text.width)
    }
    if (hq) {
      cityLabel(scene, building.x, building.y + building.height / 2 + 13, 'LOCAL DELIVERY · HEADQUARTERS', 9,
        '#175574').setDepth(7)
    }
    if (marketplace) {
      cityLabel(scene, building.x, building.y + building.height / 2 + 13, 'ENTER · MARKETPLACE', 9,
        '#175574').setDepth(7)
    }
  })

  WORLD_DECORATIONS.forEach((tree, index) => {
    // The collision disk covers the trunk; the substantial canopy hangs above it.
    scene.add.image(tree.x, tree.y, ensureTreeTexture(scene, index % 4))
      .setOrigin(0.5, 94 / 104).setScale(tree.radius / 16).setDepth(8)
  })
  for (const zone of WORLD_ZONES) {
    const x = zone.x + zone.width / 2
    const y = zone.y + 34
    cityLabel(scene, x, y - 48, zone.label.toUpperCase(), 13, '#247c48').setDepth(2).setAlpha(0.8)
  }
  const streetNames = new Set<string>()
  for (const road of WORLD_ROADS) {
    if (!road.name || streetNames.has(road.name) || (road.roadWidth ?? 0) < 42) continue
    streetNames.add(road.name)
    cityLabel(scene, road.x, road.y - 30, road.name, 12, '#fff4ce', '#344e69').setDepth(4)
  }

  const hq = URBAN_BUILDINGS.find(building => building.kind === 'hq')!
  const padX = hq.x - hq.width / 2 - 47
  const padY = hq.y + 5
  props.fillStyle(C.shadow, 0.18).fillRoundedRect(padX - 39 + 5, padY - 31 + 7, 78, 62, 12)
  props.fillStyle(C.pavingLine).fillRoundedRect(padX - 39, padY - 31, 78, 62, 12)
  props.fillStyle(C.sidewalk).fillRoundedRect(padX - 35, padY - 27, 70, 54, 10)
  props.lineStyle(2, C.cream).strokeEllipse(padX, padY, 51, 40)
  props.fillStyle(C.road).fillRoundedRect(padX - 8, padY - 4, 16, 13, 3)
  props.lineStyle(3, C.road).strokeCircle(padX, padY - 5, 6)
  props.fillStyle(C.windowLight).fillCircle(padX, padY + 2, 2)
  for (const x of [padX - 31, padX + 31]) {
    props.fillStyle(C.metal).fillRoundedRect(x - 2, padY + 18, 4, 12, 1)
    props.fillStyle(C.parcel).fillRect(x - 2, padY + 19, 4, 3)
  }
  cityLabel(scene, padX, padY - 17, 'MAIN DRONEPORT', 7, '#175574').setDepth(7)
  cityLabel(scene, padX, padY + 21, 'FUTURE · LOCKED', 7, '#175574').setDepth(7)
  const stageX = hq.x - 65
  const stageY = hq.y + hq.height / 2 + 15
  props.fillStyle(C.cream, 0.7).fillRoundedRect(stageX - 29, stageY - 9, 57, 30, 4)
  props.lineStyle(1, C.pavingLine).strokeRoundedRect(stageX - 29, stageY - 9, 57, 30, 4)
  for (let row = 0; row < growth.tier; row++) {
    for (let box = 0; box < 3; box++) {
      drawParcel(props, stageX - 17 + box * 17, stageY + 7 - row * 13, 14)
    }
  }
  cityLabel(scene, stageX, stageY + 31, 'PARCEL STAGING', 8, '#fff4ce', '#175574').setDepth(7)
  if (growth.tier > 1) {
    props.fillStyle(C.metal).fillRect(stageX - 28, stageY - growth.tier * 13 + 4, 3, growth.tier * 13 + 13)
      .fillRect(stageX + 25, stageY - growth.tier * 13 + 4, 3, growth.tier * 13 + 13)
    cityLabel(scene, hq.x, hq.y - 12, `LEVEL ${growth.level} DEPOT`, 8).setDepth(7)
  }

  // Issue #325: purchased vehicles live inside the physical HQ Fleet Bay. The street no longer
  // receives a parked bicycle as a side effect of ownership.
  cityLabel(scene, URBAN_HQ.x + 68, URBAN_HQ.y + 25, 'FLEET · INSIDE HQ', 8, '#fff4ce', '#175574').setDepth(7)
  props.fillStyle(COLORS.accentStrong, 0.16).fillCircle(URBAN_HQ.x, URBAN_HQ.y, 25)
  props.lineStyle(2, COLORS.accentStrong, 0.8).strokeCircle(URBAN_HQ.x, URBAN_HQ.y, 25)
  cityLabel(scene, URBAN_HQ.x, URBAN_HQ.y + 33, 'ENTER HQ', 8, '#fff4ce', '#175574').setDepth(7)

  props.fillStyle(COLORS.accent, 0.14).fillCircle(URBAN_MARKETPLACE.x, URBAN_MARKETPLACE.y, 24)
  props.lineStyle(2, COLORS.accent, 0.82).strokeCircle(URBAN_MARKETPLACE.x, URBAN_MARKETPLACE.y, 24)
  cityLabel(scene, URBAN_MARKETPLACE.x, URBAN_MARKETPLACE.y + 31, 'ENTER MARKETPLACE', 8, '#fff4ce', '#175574').setDepth(7)

  if (growth.staffCount > 0) {
    const worker = drawNeighborhoodNPC(scene, URBAN_HQ.x + 108, URBAN_HQ.y, false, 2)
      .setName('hq-dispatch-staff')
    cityLabel(scene, worker.x, worker.y + 14, `HQ STAFF · ${growth.staffCount}`, 8, '#175574').setDepth(13)
  }
  WORLD_ROUTE_POINTS.forEach((point, index) => {
    const merchant = point.kind === 'pickup'
    const profile = URBAN_MERCHANT_PROFILES.find(candidate => candidate.pickupLocation === point.label)
    const building = URBAN_BUILDINGS.find(candidate => candidate.id === point.buildingId)!
    const north = building.entranceFacing === 'up'
    const npcX = point.x + 19
    const npcY = point.y + (north ? 8 : -9)
    drawNeighborhoodNPC(scene, npcX, npcY, merchant, index)
      .setName(profile?.worldActorId ?? `customer:${point.label}`)
    const name = point.displayName.split(' · ')[0]
    const text = cityLabel(scene, point.x, point.y + (north ? 27 : 24),
      name, 9, '#fff4ce', '#175574').setDepth(13)
    if (text.width > 115) text.setScale(115 / text.width)
  })
  return null
}
