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
  cityLabel, drawBench, drawCityBuilding, drawFlowerBox, drawLamp,
  ensureNeighborTexture, ensureTreeTexture, storefrontIdentity,
} from './cityArt'
import { drawCityPavement } from './cityGround'
import { drawParcel } from './courierArt'
import { getCourierPose } from './courierPose'

export const HQ_EXPANSION_POINT = URBAN_HQ

export const getHQGrowth = (company?: CompanyState) => ({
  tier: Math.min(3, Math.max(1, Math.floor(company?.level ?? 1))),
  staffCount: company?.employees.length ?? 0,
  ownsBicycle: company ? resolveActiveTransport(company, 'bicycle') === 'bicycle' : false,
})

export const drawNeighborhoodNPC = (
  scene: Phaser.Scene, x: number, y: number, merchant: boolean, index = 0,
): Phaser.GameObjects.Container => {
  const person = scene.add.image(0, 0, ensureNeighborTexture(scene, merchant, index))
    .setOrigin(0.5, 54 / 62)
  return scene.add.container(x, y, [person]).setDepth(12)
}

const fallbackShopNames = ['SUNBEAM CAFÉ', 'CITY PHARMACY', 'CORNER GOODS', 'BLOOM & STEM', 'BAKERY', 'PANTRY']

export const renderUrbanNeighborhood = (
  scene: Phaser.Scene, company?: CompanyState,
): Phaser.GameObjects.Graphics | null => {
  const growth = getHQGrowth(company)
  const terrain = scene.add.graphics().setDepth(0).setName('city-terrain')
  terrain.fillStyle(C.grass).fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT)
  for (const zone of WORLD_ZONES) {
    terrain.fillStyle(C.lawn).fillRoundedRect(zone.x - 8, zone.y - 8, zone.width + 16, zone.height + 16, 36)
    terrain.fillStyle(C.grass, 0.3).fillRoundedRect(zone.x + 10, zone.y + 15, zone.width - 20, zone.height - 30, 26)
    // Very sparse, deterministic blades: texture, not a noisy repeating tile.
    terrain.lineStyle(2, C.grassShade, 0.23)
    for (let x = zone.x + 34; x < zone.x + zone.width - 20; x += 73) {
      for (let y = zone.y + 29; y < zone.y + zone.height - 20; y += 91) {
        const shift = Math.floor(x / 73) % 2 * 23
        terrain.lineBetween(x, y + shift, x + 2, y + shift - 4)
          .lineBetween(x + 5, y + shift, x + 7, y + shift - 3)
      }
    }
  }
  const pavement = scene.add.graphics().setDepth(1).setName('city-pavement')
  drawCityPavement(pavement, URBAN_ROADS, URBAN_SIDEWALKS)
  const shadow = scene.add.graphics().setDepth(3).setName('city-cast-shadows')
  const masonry = scene.add.graphics().setDepth(5).setName('city-architecture')
  const props = scene.add.graphics().setDepth(6).setName('city-street-furniture')
  const markers = scene.add.graphics().setDepth(2).setName('city-front-doors')

  URBAN_BUILDINGS.forEach((building, index) => {
    const location = WORLD_ROUTE_POINTS.find(point => point.buildingId === building.id)
    const hq = building.kind === 'hq'
    const name = hq ? 'DROPi' : location?.kind === 'pickup' ? location.displayName
      : building.kind === 'depot' ? ['DISPATCH', 'PARCEL WORKS', 'CITY LOGISTICS'][index % 3]
        : fallbackShopNames[index % fallbackShopNames.length]
    const sign = drawCityBuilding(masonry, shadow, building, {
      name, identity: storefrontIdentity(name), variant: index, growthTier: hq ? growth.tier : undefined,
    })
    if (hq || building.kind === 'shop' || building.kind === 'depot') {
      const text = cityLabel(scene, sign.signX, sign.signY, name, hq ? 23 : 10).setDepth(7)
      if (text.width > sign.signWidth) text.setScale(sign.signWidth / text.width)
    }
    if (hq) {
      cityLabel(scene, building.x, building.y + building.height / 2 + 13, 'LOCAL DELIVERY · HEADQUARTERS', 9,
        '#175574').setDepth(7)
    }
    if (building.kind === 'home') {
      const left = building.x - building.width / 2
      const bottom = building.y + building.height / 2
      masonry.fillStyle(C.cream).fillRoundedRect(left + 5, bottom - 34, 11, 10, 2)
      cityLabel(scene, left + 10, bottom - 29, `${12 + index}`, 6, '#175574').setDepth(7)
    }
  })

  WORLD_DECORATIONS.forEach((tree, index) => {
    shadow.fillStyle(C.shadow, 0.13).fillEllipse(tree.x + tree.radius * 0.28,
      tree.y + tree.radius * 0.6, tree.radius * 2.3, tree.radius * 1.1)
    scene.add.image(tree.x, tree.y, ensureTreeTexture(scene, index % 4))
      .setOrigin(0.5, 0.48).setScale(tree.radius / 36).setDepth(8)
    if (index % 4 === 0) drawFlowerBox(props, tree.x + tree.radius + 12, tree.y + tree.radius * 0.65, 24)
  })
  // Furniture remains on non-traversable verge, never in the street/collision corridor.
  for (const zone of WORLD_ZONES) {
    const x = zone.x + zone.width / 2
    const y = zone.y + 34
    drawBench(props, x, y)
    drawLamp(props, x + 38, y + 2)
    cityLabel(scene, x, y - 48, zone.label.toUpperCase(), 13, '#247c48').setDepth(2).setAlpha(0.8)
  }
  const hq = URBAN_BUILDINGS.find(building => building.kind === 'hq')!
  const padX = hq.x - hq.width / 2 - 47
  const padY = hq.y + 5
  shadow.fillStyle(C.shadow, 0.18).fillRoundedRect(padX - 39 + 5, padY - 31 + 7, 78, 62, 12)
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
  pavement.fillStyle(C.cream, 0.7).fillRoundedRect(stageX - 29, stageY - 9, 57, 30, 4)
  pavement.lineStyle(1, C.pavingLine).strokeRoundedRect(stageX - 29, stageY - 9, 57, 30, 4)
  for (let row = 0; row < growth.tier; row++) {
    for (let box = 0; box < 3; box++) {
      drawParcel(props, stageX - 17 + box * 17, stageY + 7 - row * 13, 14)
    }
  }
  cityLabel(scene, stageX, stageY + 31, 'PARCEL STAGING', 8, '#fff4ce', '#175574').setDepth(7)
  if (growth.tier > 1) {
    props.fillStyle(C.metal).fillRect(stageX - 28, stageY - growth.tier * 13 + 4, 3, growth.tier * 13 + 13)
      .fillRect(stageX + 25, stageY - growth.tier * 13 + 4, 3, growth.tier * 13 + 13)
    cityLabel(scene, hq.x, hq.y - 12, `LEVEL ${growth.tier} DEPOT`, 8).setDepth(7)
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
  pavement.lineStyle(1, C.curb, 0.8).strokeRoundedRect(URBAN_HQ.x + 43, URBAN_HQ.y - 15, 52, 28, 4)
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
    markers.fillStyle(merchant ? COLORS.gold : COLORS.accent, 0.16).fillEllipse(point.x, point.y + 2, 40, 25)
    markers.lineStyle(2, merchant ? COLORS.gold : COLORS.accent, 0.85).strokeEllipse(point.x, point.y + 2, 40, 25)
    if (merchant) {
      markers.fillStyle(C.parcel).fillRoundedRect(point.x - 5, point.y - 3, 10, 9, 1)
      markers.fillStyle(C.cream).fillRect(point.x - 1, point.y - 3, 2, 9)
    } else {
      markers.fillStyle(C.curb, 0.85).fillCircle(point.x, point.y + 2, 3)
    }
    const name = point.displayName.split(' · ')[0]
    const text = cityLabel(scene, point.x, point.y + (north ? 27 : 24),
      name, 9, '#fff4ce', '#175574').setDepth(13)
    if (text.width > 115) text.setScale(115 / text.width)
  })
  return parkedBicycle
}
