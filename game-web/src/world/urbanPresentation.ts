import type Phaser from 'phaser'
import type { CompanyState } from '../types/game'
import { resolveActiveTransport } from '../systems/urbanLogistics'
import { URBAN_MERCHANT_PROFILES } from '../systems/urbanInteractions'
import { URBAN_BUILDINGS, URBAN_HQ, URBAN_ROADS, URBAN_SIDEWALKS } from './urbanWorld'
import { WORLD_DECORATIONS, WORLD_HEIGHT, WORLD_ROUTE_POINTS, WORLD_WIDTH } from './worldLayout'

export const HQ_EXPANSION_POINT = URBAN_HQ

export const getHQGrowth = (company?: CompanyState) => ({
  tier: Math.min(3, Math.max(1, Math.floor(company?.level ?? 1))),
  staffCount: company?.employees.length ?? 0,
  ownsBicycle: company ? resolveActiveTransport(company, 'bicycle') === 'bicycle' : false,
})

const label = (scene: Phaser.Scene, x: number, y: number, text: string, color = '#fff4da', size = 12) =>
  scene.add.text(x, y, text, {
    fontFamily: 'Arial, sans-serif', fontSize: `${size}px`, color, fontStyle: 'bold',
    backgroundColor: '#254d48', padding: { x: 7, y: 4 }, align: 'center',
  }).setOrigin(0.5)

export const drawNeighborhoodNPC = (
  scene: Phaser.Scene, x: number, y: number, merchant: boolean, index = 0,
): Phaser.GameObjects.Container => {
  const g = scene.add.graphics()
  g.fillStyle(0x27453a, 0.19).fillEllipse(0, 12, 28, 10)
  g.fillStyle(0x394653).fillRoundedRect(-7, 1, 5, 13, 2).fillRoundedRect(2, 1, 5, 13, 2)
  g.fillStyle(merchant ? 0xc86744 : [0x768db7, 0x9b78a8, 0xdfb04d][index % 3])
    .fillRoundedRect(-10, -14, 20, 21, 6)
  if (merchant) g.fillStyle(0xffedc9).fillRect(-6, -8, 12, 14)
  g.fillStyle(index % 2 ? 0xc48e67 : 0xefc8a0).fillCircle(0, -22, 8)
  g.fillStyle(0x493a33).fillRoundedRect(-8, -30, 16, 7, 3)
  g.fillStyle(0x263f3c).fillCircle(-3, -22, 1).fillCircle(3, -22, 1)
  if (merchant) g.fillStyle(0xffedc9).fillRoundedRect(-11, -33, 22, 6, 2)
  return scene.add.container(x, y, [g]).setDepth(12)
}

export const renderUrbanNeighborhood = (
  scene: Phaser.Scene, company?: CompanyState,
): Phaser.GameObjects.Graphics | null => {
  const growth = getHQGrowth(company)
  const ground = scene.add.graphics()
  ground.fillStyle(0xa9ca93).fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT)
  ground.fillStyle(0xb9d6a3).fillRoundedRect(80, 60, 620, 460, 40)
  ground.fillStyle(0xb9d6a3).fillRoundedRect(900, 700, 620, 430, 40)
  // All pavement and collision surfaces share the same center-based rectangles.
  URBAN_SIDEWALKS.forEach(s => {
    ground.fillStyle(0xe1d7bd).fillRect(s.x - s.width / 2, s.y - s.height / 2, s.width, s.height)
    ground.lineStyle(1, 0xc1bca5).strokeRect(s.x - s.width / 2, s.y - s.height / 2, s.width, s.height)
  })
  URBAN_ROADS.forEach(r => {
    const left = r.x - r.width / 2
    const top = r.y - r.height / 2
    ground.fillStyle(0x6c7773).fillRect(left, top, r.width, r.height)
    ground.lineStyle(2, 0xf4e8b4, 0.6)
    const horizontal = r.width >= r.height
    for (let offset = 14; offset < (horizontal ? r.width : r.height) - 12; offset += 48) {
      ground.lineBetween(
        horizontal ? left + offset : r.x, horizontal ? r.y : top + offset,
        horizontal ? Math.min(left + offset + 22, left + r.width) : r.x,
        horizontal ? r.y : Math.min(top + offset + 22, top + r.height),
      )
    }
  })
  for (const y of [290, 600, 910]) {
    ground.fillStyle(0xe8e6d6, 0.85)
    for (let i = 0; i < 6; i++) ground.fillRect(742 + i * 21, y - 44, 10, 17)
  }
  label(scene, 800, 494, 'CEDAR AVENUE', '#f4edce', 11).setAlpha(0.8)
  label(scene, 240, 346, 'OLD TOWN', '#f4edce', 11).setAlpha(0.8)
  label(scene, 1080, 970, 'EAST YARD', '#f4edce', 11).setAlpha(0.8)

  URBAN_BUILDINGS.forEach((b, index) => {
    const g = scene.add.graphics()
    const left = b.x - b.width / 2
    const top = b.y - b.height / 2
    const bottom = b.y + b.height / 2
    const isHQ = b.kind === 'hq'
    const cornerShop = b.id === 'storage-3'
    const shop = b.kind === 'shop' || cornerShop
    const depot = b.kind === 'depot' && !cornerShop
    const walls = isHQ ? 0xe8d9b1 : shop ? 0xf4d7a5 : depot ? 0xc7c8b8 : [0xf0dcc0, 0xe8c9ac, 0xe5e3c9][index % 3]
    const roof = isHQ ? 0x377c78 : shop ? 0xa55d49 : depot ? 0x7d8d8b : [0xb57255, 0x77959a, 0x9d7e75][index % 3]
    g.fillStyle(0x395345, 0.18).fillRoundedRect(left + 8, top + 9, b.width + 4, b.height + 4, 7)
    g.fillStyle(walls).fillRoundedRect(left, top, b.width, b.height, 5)
    g.lineStyle(2, 0x675a48, 0.7).strokeRoundedRect(left, top, b.width, b.height, 5)
    g.fillStyle(roof).fillRoundedRect(left - 4, top - 3, b.width + 8, b.height * 0.49, 5)
    g.lineStyle(2, 0xffffff, 0.12)
    for (let yy = top + 10; yy < top + b.height * 0.43; yy += 11) {
      g.lineBetween(left + 3, yy, left + b.width - 3, yy)
    }
    g.fillStyle(0x526763).fillRoundedRect(b.x - 11, bottom - 32, 22, 32, 2)
    g.fillStyle(0xebbd65).fillCircle(b.x + 5, bottom - 14, 2)
    for (const xx of [left + 13, left + b.width - 32]) {
      g.fillStyle(0x699b9c).fillRoundedRect(xx, bottom - 42, 19, 21, 2)
      g.lineStyle(2, 0xffebc6).strokeRect(xx, bottom - 42, 19, 21)
      g.lineBetween(xx + 9, bottom - 42, xx + 9, bottom - 21)
      if (!depot) {
        g.fillStyle(0x947357).fillRect(xx - 2, bottom - 18, 24, 6)
        g.fillStyle(0x698f52).fillEllipse(xx + 10, bottom - 21, 24, 9)
        g.fillStyle(0xe8a37a).fillCircle(xx + 5, bottom - 23, 3)
      }
    }
    if (depot) {
      g.fillStyle(0x899895).fillRect(b.x - 21, bottom - 36, 42, 36)
      g.lineStyle(2, 0x63736f)
      for (let yy = bottom - 32; yy < bottom; yy += 7) g.lineBetween(b.x - 19, yy, b.x + 19, yy)
    }
    if (shop || isHQ) {
      g.fillStyle(isHQ ? 0x377c78 : 0xbe6d51).fillRect(left - 4, bottom - 53, b.width + 8, 15)
      for (let xx = left; xx < left + b.width; xx += 24) {
        g.fillStyle(0xffedc7).fillRect(xx, bottom - 53, 12, 15)
      }
      label(scene, b.x, b.y - 4, isHQ ? 'DROPi · HQ' : cornerShop ? 'MARA’S MARKET' : ['BAKERY', 'CORNER GOODS', 'FLOWERS'][index % 3], '#fff4da', isHQ ? 15 : 10)
    }
    if (isHQ && growth.tier >= 2) {
      g.fillStyle(0xd9ba79).fillRect(b.x - 24, bottom - 35, 48, 6)
      g.fillStyle(0x80654a).fillRect(b.x - 24, bottom - 29, 4, 27).fillRect(b.x + 20, bottom - 29, 4, 27)
      if (growth.tier >= 3) {
        g.fillStyle(0xe8d9b1).fillRect(b.x + 35, top + 10, 24, 22)
        g.fillStyle(0x719d9c).fillRect(b.x + 40, top + 15, 14, 13)
        g.lineStyle(2, 0xffedc7).lineBetween(b.x + 47, top + 15, b.x + 47, top + 28)
      }
    }
    if (isHQ) label(scene, b.x, bottom - 13, 'Future Main DronePort', '#f1d9a5', 9)
  })

  WORLD_DECORATIONS.forEach((tree, index) => {
    const g = scene.add.graphics()
    g.fillStyle(0x446847, 0.16).fillEllipse(tree.x + 5, tree.y + 10, tree.radius * 2.3, tree.radius * 1.4)
    g.fillStyle(0x86664a).fillRect(tree.x - 4, tree.y, 8, tree.radius + 5)
    g.fillStyle(index % 2 ? 0x648e58 : 0x729c60).fillCircle(tree.x, tree.y, tree.radius)
    g.fillStyle(0x9bb976, 0.8).fillCircle(tree.x - tree.radius / 3, tree.y - tree.radius / 3, tree.radius * 0.6)
  })

  const staging = scene.add.graphics()
  staging.lineStyle(2, 0xeee0b2).strokeRect(URBAN_HQ.x - 79, 243, 48, 31)
  for (let i = 0; i < 3; i++) {
    staging.fillStyle(0xb78958).fillRect(URBAN_HQ.x - 76 + i * 13, 247, 11, 13)
    staging.fillStyle(0xf4dfab).fillRect(URBAN_HQ.x - 72 + i * 13, 247, 3, 13)
  }
  for (let row = 1; row < growth.tier; row++) {
    const shelfY = 247 - row * 12
    staging.fillStyle(0x8a6a4d).fillRect(URBAN_HQ.x - 79, shelfY + 11, 49, 3)
    for (let i = 0; i < 3; i++) {
      staging.fillStyle(0xc49a69).fillRect(URBAN_HQ.x - 76 + i * 15, shelfY, 12, 10)
      staging.fillStyle(0xf4dfab).fillRect(URBAN_HQ.x - 72 + i * 15, shelfY, 3, 10)
    }
  }
  if (growth.tier > 1) {
    staging.fillStyle(0x8a6a4d).fillRect(URBAN_HQ.x - 79, 217, 3, 46)
      .fillRect(URBAN_HQ.x - 33, 217, 3, 46)
  }
  const parkedBicycle = growth.ownsBicycle
    ? scene.add.graphics().setPosition(URBAN_HQ.x + 58, URBAN_HQ.y + 16).setDepth(10)
    : null
  if (parkedBicycle) {
    parkedBicycle.lineStyle(3, 0x314947).strokeCircle(-13, 6, 9).strokeCircle(13, 6, 9)
    parkedBicycle.lineStyle(3, 0xd7ae58).strokeTriangle(-13, 6, 0, 6, -6, -7)
      .lineBetween(-6, -7, 8, -7).lineBetween(8, -7, 0, 6).lineBetween(8, -7, 13, 6)
    parkedBicycle.lineStyle(3, 0x314947).lineBetween(-10, -10, -2, -10)
      .lineBetween(8, -7, 8, -14).lineBetween(8, -14, 14, -14)
  }
  if (growth.staffCount > 0) {
    const worker = drawNeighborhoodNPC(scene, URBAN_HQ.x + 100, URBAN_HQ.y, false, 2)
      .setName('hq-dispatch-staff')
    scene.tweens.add({ targets: worker, y: worker.y - 2, duration: 2200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
    label(scene, worker.x, worker.y - 49, `HQ staff · ${growth.staffCount}`, '#fff4da', 10)
  }
  label(scene, URBAN_HQ.x + 44, 255, 'P · TRANSPORT', '#fff4da', 10)
  label(scene, URBAN_HQ.x - 66, 292, 'PARCEL STAGING', '#fff4da', 9)
  WORLD_ROUTE_POINTS.forEach((point, index) => {
    const merchant = point.kind === 'pickup'
    const profile = URBAN_MERCHANT_PROFILES.find(candidate => candidate.pickupLocation === point.label)
    const npc = drawNeighborhoodNPC(scene, point.x + 17, point.y - 8, merchant, index)
      .setName(profile?.worldActorId ?? `customer:${point.label}`)
    scene.tweens.add({ targets: npc, y: npc.y - 2, duration: 1500 + index * 170, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
    const name = profile?.businessName ?? (point.label === 'DeliveryZone' ? 'Noah · Customer' : 'Customer')
    label(scene, point.x, point.y - (point.label === 'ResidentialPickup' ? 83 : 57), name, '#fff4da', 10).setDepth(13)
    const marker = scene.add.graphics().setDepth(2)
    marker.lineStyle(2, merchant ? 0xedc36f : 0x90ccb8, 0.8).strokeCircle(point.x, point.y, 23)
  })
  return parkedBicycle
}
