import type Phaser from 'phaser'
import type { CompanyState } from '../types/game'
import { resolveActiveTransport } from '../systems/urbanLogistics'
import { URBAN_MERCHANT_PROFILES } from '../systems/urbanInteractions'
import { CITY_COLORS as C, COLORS } from '../ui/theme'
import { URBAN_BUILDINGS, URBAN_HQ, URBAN_ROADS, URBAN_SIDEWALKS } from './urbanWorld'
import {
  WORLD_DECORATIONS, WORLD_HEIGHT, WORLD_ROUTE_POINTS, WORLD_WIDTH, WORLD_ZONES,
} from './worldLayout'
import {
  cityBuildingSign, cityLabel, drawBench, drawFlowerBox, drawLamp,
  ensureBuildingTexture, ensureNeighborTexture, ensureTreeTexture, NEIGHBOR_ANCHOR, NEIGHBOR_CELL, storefrontIdentity,
} from './cityArt'
import { cityDistrictAccents, drawCityDistrictAccents, drawCityPavement } from './cityGround'
import { drawParcel } from './courierArt'
import { getCourierPose } from './courierPose'

export const HQ_EXPANSION_POINT = URBAN_HQ

/**
 * Ground art is intentionally rasterized below world resolution. Buildings, characters and trees
 * remain crisp independent sprites. The old implementation kept thousands of world-wide Graphics
 * commands alive, so Phaser had to submit the complete city road/grass geometry every frame even
 * when the camera only showed one neighborhood.
 */
export const CITY_GROUND_TEXTURE_SCALE = 0.5
const CITY_GROUND_TEXTURE_KEY = 'dropi-city-static-ground-v1'

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

/**
 * Produce one reusable static ground texture. This work occurs once for the Phaser texture manager;
 * scene restarts reuse the cached texture instead of retaining/replaying the full vector command list.
 */
export const ensureCityGroundTexture = (scene: Phaser.Scene): string => {
  if (scene.textures.exists(CITY_GROUND_TEXTURE_KEY)) return CITY_GROUND_TEXTURE_KEY
  const g = scene.make.graphics({ x: 0, y: 0 })
  g.save().scaleCanvas(CITY_GROUND_TEXTURE_SCALE, CITY_GROUND_TEXTURE_SCALE)
  g.fillStyle(C.grass).fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT)
  for (const zone of WORLD_ZONES) {
    g.fillStyle(C.lawn).fillRoundedRect(zone.x - 8, zone.y - 8, zone.width + 16, zone.height + 16, 36)
    g.fillStyle(zone.fillColor, 0.35).fillRoundedRect(zone.x + 10, zone.y + 15, zone.width - 20, zone.height - 30, 26)
  }
  drawCityDistrictAccents(g,
    cityDistrictAccents(WORLD_ZONES, URBAN_SIDEWALKS, URBAN_BUILDINGS, WORLD_DECORATIONS))
  drawCityPavement(g, URBAN_ROADS, URBAN_SIDEWALKS)

  // Shadows and low street furniture are static ground decoration and are therefore baked too.
  WORLD_DECORATIONS.forEach((tree, index) => {
    g.fillStyle(C.shadow, 0.13).fillEllipse(tree.x + tree.radius * 0.4,
      tree.y + 3, tree.radius * 4.6, tree.radius * 1.5)
    if (index % 4 === 0) drawFlowerBox(g, tree.x + tree.radius + 12, tree.y + tree.radius * 0.65, 24)
  })
  for (const zone of WORLD_ZONES) {
    const x = zone.x + zone.width / 2
    const y = zone.y + 34
    drawBench(g, x, y)
    drawLamp(g, x + 38, y + 2)
  }

  // Door markers are static. The active objective remains a separate dynamic marker in GameWorld.
  WORLD_ROUTE_POINTS.forEach(point => {
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
    const name = hq ? 'DROPi' : location?.kind === 'pickup' ? location.displayName
      : building.kind === 'depot' ? ['DISPATCH', 'PARCEL WORKS', 'CITY LOGISTICS'][index % 3]
        : fallbackShopNames[index % fallbackShopNames.length]
    const art = {
      name, identity: storefrontIdentity(name), variant: index, growthTier: hq ? growth.tier : undefined,
    }
    scene.add.image(building.x, building.y, ensureBuildingTexture(scene, building, art)).setDepth(5)
    const sign = cityBuildingSign(building, art)
    if (hq || building.kind === 'shop' || building.kind === 'depot') {
      const text = cityLabel(scene, sign.signX, sign.signY, name, hq ? 23 : 10).setDepth(7)
      if (text.width > sign.signWidth) text.setScale(sign.signWidth / text.width)
    }
    if (hq) {
      cityLabel(scene, building.x, building.y + building.height / 2 + 13, 'LOCAL DELIVERY · HEADQUARTERS', 9,
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
  const parkedBicycle = growth.ownsBicycle
    ? scene.add.graphics().setPosition(URBAN_HQ.x + 70, URBAN_HQ.y + 7).setDepth(10)
    : null
  if (parkedBicycle) {
    // Use the same physical projection as the rider, with the person omitted below.
    const pose = getCourierPose('Bicycle', 'right')
    const [rear, front] = pose.wheels
    parkedBicycle.lineStyle(3, C.metal).strokeCircle(rear.x, rear.y, 11).strokeCircle(front.x, front.y, 11)
    parkedBicycle.lineStyle(3, COLORS.gold).strokeTriangle(rear.x, rear.y, -2, -3, -8, -20)
      .lineBetween(-8, -20, 12, -20).lineBetween(-2, -3, 12, -20).lineBetween(12, -20, front.x, front.y)
    parkedBicycle.lineStyle(3, C.metal).lineBetween(-13, -22, -3, -22)
      .lineBetween(12, -20, 12, -28).lineBetween(12, -28, 19, -28)
  }
  props.lineStyle(1, C.curb, 0.8).strokeRoundedRect(URBAN_HQ.x + 43, URBAN_HQ.y - 15, 52, 28, 4)
  cityLabel(scene, URBAN_HQ.x + 68, URBAN_HQ.y + 25, 'BICYCLE BAY', 8, '#fff4ce', '#175574').setDepth(7)
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
  return parkedBicycle
}
