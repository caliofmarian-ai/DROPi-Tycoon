import type Phaser from 'phaser'
import { CITY_COLORS as C, COLORS, RADII, TYPOGRAPHY } from '../ui/theme'
import type { UrbanBuilding } from './urbanWorld'
import { drawParcel } from './courierArt'
import { COURIER_DIRECTIONS, getCourierPose, type CourierPose } from './courierPose'

type Graphics = Phaser.GameObjects.Graphics
export type StorefrontIdentity = 'market' | 'cafe' | 'pharmacy' | 'bakery' | 'flowers' | 'goods'

export const storefrontIdentity = (name: string): StorefrontIdentity => {
  const value = name.toLowerCase()
  if (/mara|market|grocer|pantry|co-op/.test(value)) return 'market'
  if (/caf[eé]|coffee|kitchen/.test(value)) return 'cafe'
  if (/pharma|health/.test(value)) return 'pharmacy'
  if (/bake|bread/.test(value)) return 'bakery'
  if (/flower|bloom|florist/.test(value)) return 'flowers'
  return 'goods'
}

export const cityLabel = (
  scene: Phaser.Scene, x: number, y: number, text: string, size: number = TYPOGRAPHY.caption,
  color: string = COLORS.textPrimary, background?: string,
): Phaser.GameObjects.Text => scene.add.text(x, y, text, {
  fontFamily: TYPOGRAPHY.family, fontSize: `${size}px`, fontStyle: 'bold', color,
  ...(background ? { backgroundColor: background, padding: { x: 7, y: 4 } } : {}),
  align: 'center', resolution: 2,
}).setOrigin(0.5)

export const drawFlowerBox = (g: Graphics, x: number, y: number, width = 26): void => {
  g.fillStyle(C.roofShade).fillRoundedRect(x - width / 2, y - 3, width, 10, 3)
  g.fillStyle(C.wallShade).fillRect(x - width / 2 - 2, y - 3, width + 4, 3)
  g.fillStyle(C.leafDark).fillEllipse(x, y - 4, width + 3, 10)
  for (let i = 0; i < 5; i++) {
    const px = x - width / 2 + 3 + i * (width - 6) / 4
    g.fillStyle(i % 2 ? C.flowerPink : C.flower).fillCircle(px, y - 6 - i % 2 * 2, 3)
    g.fillStyle(C.windowLight).fillCircle(px - 1, y - 7 - i % 2 * 2, 1)
  }
}

const window = (
  g: Graphics, x: number, y: number, width: number, height: number, lit = false,
): void => {
  g.fillStyle(C.wallShade).fillRoundedRect(x - 2, y - 2, width + 5, height + 5, 3)
  g.fillStyle(C.metal).fillRoundedRect(x, y, width, height, 2)
  g.fillStyle(lit ? C.windowLight : C.glassShade).fillRect(x + 2, y + 2, width - 4, height - 4)
  g.fillStyle(lit ? C.cream : C.glass).fillTriangle(x + 2, y + 2, x + width - 2, y + 2, x + 2, y + height - 2)
  g.lineStyle(2, C.cream).strokeRect(x, y, width, height)
    .lineBetween(x + width / 2, y, x + width / 2, y + height)
  g.lineStyle(1, C.curb, 0.7).lineBetween(x + 4, y + 5, x + width / 2 - 3, y + 5)
  g.fillStyle(C.cream).fillRect(x - 3, y + height, width + 6, 3)
}

const drawAwning = (g: Graphics, x: number, y: number, width: number, color: number): void => {
  g.fillStyle(C.shadow, 0.16).fillRect(x + 3, y + 9, width, 15)
  g.fillStyle(C.roofShade).fillRect(x + 3, y - 3, width - 6, 5)
  const stripe = width / Math.max(4, Math.round(width / 14))
  for (let i = 0; i < width / stripe - 0.01; i++) {
    const sx = x + i * stripe
    g.fillStyle(i % 2 ? C.cream : color).fillTriangle(sx + 3, y, sx + stripe, y,
      sx + stripe, y + 13).fillTriangle(sx + 3, y, sx + stripe, y + 13, sx, y + 13)
    g.fillRoundedRect(sx, y + 11, stripe + 0.5, 7, { tl: 0, tr: 0, bl: 4, br: 4 })
  }
  g.lineStyle(2, C.cream, 0.8).lineBetween(x + 3, y, x + width - 3, y)
}

export const drawShopIcon = (g: Graphics, x: number, y: number, identity: StorefrontIdentity): void => {
  g.fillStyle(C.cream)
  if (identity === 'pharmacy') {
    g.fillRoundedRect(x - 3, y - 9, 6, 18, 1).fillRoundedRect(x - 9, y - 3, 18, 6, 1)
  } else if (identity === 'cafe') {
    g.fillRoundedRect(x - 7, y - 5, 12, 11, 3)
    g.lineStyle(3, C.cream).strokeCircle(x + 6, y - 1, 4)
    g.lineStyle(2, C.cream).lineBetween(x - 10, y + 8, x + 10, y + 8)
      .lineBetween(x - 3, y - 9, x - 1, y - 13)
  } else if (identity === 'bakery') {
    g.fillEllipse(x, y, 24, 13)
    g.lineStyle(2, C.roof).lineBetween(x - 6, y - 4, x - 9, y + 2)
      .lineBetween(x + 1, y - 5, x - 2, y + 2).lineBetween(x + 8, y - 4, x + 5, y + 2)
  } else if (identity === 'flowers') {
    for (const [dx, dy] of [[-5, -3], [5, -3], [0, -8], [-3, 4], [4, 4]]) {
      g.fillCircle(x + dx, y + dy, 4)
    }
    g.fillStyle(COLORS.gold).fillCircle(x, y - 1, 3)
  } else {
    g.fillRoundedRect(x - 9, y - 5, 18, 14, 2)
    g.lineStyle(2, C.cream).strokeCircle(x, y - 5, 5)
    g.lineStyle(2, C.roof).lineBetween(x - 4, y - 1, x - 4, y + 5)
      .lineBetween(x + 3, y - 1, x + 3, y + 5)
  }
}

export interface BuildingArtOptions {
  name: string
  identity?: StorefrontIdentity
  variant: number
  growthTier?: number
}

export const cityBuildingSign = (b: UrbanBuilding, options: BuildingArtOptions) => {
  const identity = options.identity ?? storefrontIdentity(options.name)
  const hq = b.kind === 'hq'
  return {
    signX: b.x,
    signY: b.y - b.height / 2 + b.height * (b.kind === 'home' ? 0.53 : 0.48) + (hq ? 3 : -10),
    signWidth: b.width - 29,
    signColor: hq ? COLORS.accentStrong : identity === 'pharmacy' ? C.leafDark :
      identity === 'cafe' ? C.metal : C.roofShade,
  }
}

/** The masonry outer edges match the model footprint; only light/shadows overhang. */
export const drawCityBuilding = (
  g: Graphics, shadow: Graphics, b: UrbanBuilding, options: BuildingArtOptions,
): { signX: number; signY: number; signWidth: number; signColor: number } => {
  const { variant, identity = storefrontIdentity(options.name) } = options
  const left = b.x - b.width / 2
  const top = b.y - b.height / 2
  const right = left + b.width
  const bottom = top + b.height
  const hq = b.kind === 'hq'
  const shop = b.kind === 'shop' || b.id === 'storage-3'
  const depot = b.kind === 'depot' && !shop
  const home = b.kind === 'home'
  const roofBottom = top + b.height * (home ? 0.53 : 0.48)
  const roofColor = hq ? C.roofBlue : depot ? C.metal : [C.roof, C.roofBlue, C.roofShade][variant % 3]
  const side = Math.min(13, b.width * 0.11)
  const { signColor } = cityBuildingSign(b, options)
  const awningColor = hq ? COLORS.accentStrong : {
    market: C.roof, cafe: C.metal, pharmacy: C.leafDark,
    bakery: C.roofShade, flowers: C.flowerPink, goods: C.roofBlue,
  }[identity]
  shadow.fillStyle(C.shadow, 0.13).fillRoundedRect(left + 9, top + 13, b.width + 4, b.height + 3, RADII.small)
  shadow.fillStyle(C.shadow, 0.08).fillRoundedRect(left + 3, top + 6, b.width + 10, b.height + 10, RADII.small)
  g.fillStyle(C.wallShade).fillRoundedRect(left, top + 5, b.width, b.height - 5, 4)
  g.fillStyle(hq ? C.cream : home && variant % 3 === 1 ? C.curb : C.wall)
    .fillRect(left + 2, roofBottom, b.width - side - 2, bottom - roofBottom - 3)
  g.fillStyle(depot ? C.road : C.wallShade).fillRect(right - side, roofBottom, side, bottom - roofBottom - 1)
  g.fillStyle(C.cream).fillRect(left, bottom - 5, b.width, 5)
  g.fillStyle(C.shadow, 0.15).fillRect(left + 3, roofBottom, b.width - side, 7)
  if (home) {
    g.fillStyle(C.roofShade).fillTriangle(left, roofBottom, b.x - 6, top, right, roofBottom)
    g.fillStyle(roofColor).fillTriangle(left + 1, roofBottom - 4, b.x - 6, top + 1, right - side, roofBottom - 4)
    g.fillStyle(roofColor).fillTriangle(b.x - 6, top + 1, right - 4, top + 20, right - side, roofBottom - 4)
    g.lineStyle(3, C.wall).lineBetween(left, roofBottom, b.x - 6, top)
      .lineBetween(b.x - 6, top, right, roofBottom)
    for (let row = 1; row <= 4; row++) {
      const y = top + (roofBottom - top) * row / 5
      const half = b.width * row / 10
      g.lineStyle(1, C.cream, 0.2).lineBetween(b.x - 6 - half + 4, y, b.x - 6 + half - 4, y)
    }
    g.fillStyle(C.roofShade).fillRect(right - 29, top + 8, 12, 21)
    g.fillStyle(C.wall).fillRect(right - 31, top + 6, 16, 5)
    const dormerY = roofBottom - 19
    g.fillStyle(C.cream).fillRoundedRect(b.x - 15, dormerY - 7, 23, 24, 2)
    window(g, b.x - 11, dormerY - 3, 15, 15, variant % 2 === 0)
    g.fillStyle(C.roofShade).fillTriangle(b.x - 19, dormerY - 6, b.x - 4, dormerY - 19, b.x + 12, dormerY - 6)
  } else {
    g.fillStyle(C.cream).fillRoundedRect(left, top, b.width, roofBottom - top + 2, 4)
    g.fillStyle(roofColor).fillRoundedRect(left + 5, top + 5, b.width - 10, roofBottom - top - 6, 3)
    g.fillStyle(C.shadow, 0.18).fillRect(right - 12, top + 7, 7, roofBottom - top - 9)
    g.lineStyle(2, C.curb, 0.26).lineBetween(left + 9, top + 9, right - 13, top + 9)
    if (hq) {
      const tier = Math.min(3, Math.max(1, Math.floor(options.growthTier ?? 1)))
      for (let row = 0; row < tier; row++) {
        const y = top + 12 + row * 12
        g.fillStyle(C.glassShade).fillRoundedRect(left + 13, y, b.width - 55, 9, 2)
        g.lineStyle(1, COLORS.accent).strokeRoundedRect(left + 13, y, b.width - 55, 9, 2)
        for (let x = left + 20; x < right - 45; x += 19) {
          g.lineStyle(1, C.glass).lineBetween(x, y + 1, x, y + 8)
        }
      }
      g.fillStyle(C.cream).fillRoundedRect(right - 35, top + 12, 20, 20, 3)
      g.fillStyle(C.metal).fillCircle(right - 25, top + 22, 6)
      g.lineStyle(1, C.glass).strokeCircle(right - 25, top + 22, 3)
    } else if (depot) {
      for (let x = left + 13; x < right - 21; x += 22) {
        g.fillStyle(C.glassShade).fillRoundedRect(x, top + 12, 16, 22, 2)
        g.lineStyle(1, C.glass).strokeRect(x + 2, top + 14, 12, 18)
          .lineBetween(x + 8, top + 14, x + 8, top + 32)
      }
    } else {
      g.fillStyle(C.cream).fillRoundedRect(right - 33, top + 10, 21, 16, 2)
      g.fillStyle(C.road).fillRoundedRect(right - 30, top + 13, 15, 10, 1)
      g.lineStyle(1, C.curb).lineBetween(right - 27, top + 14, right - 27, top + 22)
        .lineBetween(right - 22, top + 14, right - 22, top + 22)
      if (shop) {
        g.fillStyle(signColor).fillCircle(left + 20, top + 23, 13)
        g.lineStyle(1.5, C.cream).strokeCircle(left + 20, top + 23, 13)
        g.save().translateCanvas(left + 20, top + 24).scaleCanvas(0.8, 0.8)
        drawShopIcon(g, 0, 0, identity)
        g.restore()
      } else {
        g.fillStyle(C.wallShade).fillRect(left + 14, top + 10, 8, 13)
        g.fillStyle(C.cream).fillRect(left + 12, top + 9, 12, 4)
      }
    }
  }
  const doorWidth = hq ? 29 : home ? 19 : 24
  const doorHeight = Math.min(32, bottom - roofBottom - 7)
  g.fillStyle(C.metal).fillRoundedRect(b.x - doorWidth / 2, bottom - doorHeight - 5, doorWidth, doorHeight, 3)
  g.fillStyle(C.glassShade).fillRect(b.x - doorWidth / 2 + 3, bottom - doorHeight - 2, doorWidth - 6, doorHeight - 8)
  g.fillStyle(C.glass).fillTriangle(b.x - doorWidth / 2 + 3, bottom - doorHeight - 2,
    b.x + doorWidth / 2 - 3, bottom - doorHeight - 2, b.x - doorWidth / 2 + 3, bottom - 13)
  g.fillStyle(C.windowLight).fillCircle(b.x + doorWidth / 2 - 5, bottom - 17, 1.5)
  g.fillStyle(C.wallShade).fillRect(b.x - doorWidth / 2 - 5, bottom - 5, doorWidth + 10, 5)
  if (depot) {
    const garageWidth = b.width * 0.5
    g.fillStyle(C.roadEdge).fillRect(b.x - garageWidth / 2, bottom - 39, garageWidth, 34)
    g.fillStyle(C.road).fillRect(b.x - garageWidth / 2 + 3, bottom - 36, garageWidth - 6, 30)
    for (let y = bottom - 33; y < bottom - 6; y += 6) {
      g.lineStyle(1, C.curb, 0.35).lineBetween(b.x - garageWidth / 2 + 4, y, b.x + garageWidth / 2 - 4, y)
    }
    drawParcel(g, left + 15, bottom - 13, 15)
    drawParcel(g, right - 18, bottom - 12, 18)
  } else {
    const ww = Math.max(16, (b.width - doorWidth - 35) / 2)
    const wy = bottom - (shop || hq ? 38 : 33)
    window(g, left + 9, wy, ww, shop || hq ? 27 : 21, home && variant % 2 === 0)
    window(g, right - side - ww - 6, wy, ww, shop || hq ? 27 : 21, home)
    if (home) {
      drawFlowerBox(g, left + 9 + ww / 2, bottom - 10, ww + 3)
      drawFlowerBox(g, right - side - ww / 2 - 6, bottom - 10, ww + 3)
      g.fillStyle(C.metal).fillRoundedRect(left + 4, bottom - 21, 5, 8, 2)
    } else {
      drawAwning(g, left + 1, bottom - 49, b.width - side, awningColor)
      g.fillStyle(C.leafDark).fillEllipse(left + 8, bottom - 12, 11, 21)
      g.fillStyle(C.roof).fillRoundedRect(left + 2, bottom - 12, 13, 10, 2)
      if (identity === 'market') {
        g.fillStyle(C.trunk).fillRect(right - 32, bottom - 19, 19, 15)
        for (let i = 0; i < 4; i++) g.fillStyle(i % 2 ? C.leafLight : C.flower).fillCircle(right - 29 + i * 4, bottom - 19, 3)
      } else if (identity === 'bakery') {
        g.fillStyle(C.trunk).fillRoundedRect(right - 29, bottom - 27, 19, 23, 2)
        g.fillStyle(C.metal).fillRect(right - 26, bottom - 24, 13, 16)
        g.lineStyle(1, C.cream).lineBetween(right - 23, bottom - 20, right - 16, bottom - 20)
          .lineBetween(right - 23, bottom - 15, right - 18, bottom - 15)
      } else if (identity === 'flowers') drawFlowerBox(g, right - 24, bottom - 13, 24)
    }
  }
  const signY = hq ? roofBottom + 1 : roofBottom - 10
  if (shop || hq || depot) {
    const signWidth = b.width - (hq ? 18 : 23)
    g.fillStyle(C.shadow, 0.2).fillRoundedRect(b.x - signWidth / 2 + 1, signY - 10 + 3, signWidth, hq ? 25 : 20, 3)
    g.fillStyle(signColor).fillRoundedRect(b.x - signWidth / 2, signY - 10, signWidth, hq ? 25 : 20, 3)
    g.lineStyle(1.5, hq ? COLORS.accent : C.cream, 0.85).strokeRoundedRect(b.x - signWidth / 2 + 2,
      signY - 8, signWidth - 4, hq ? 21 : 16, 2)
  }
  if (b.entranceFacing === 'up') {
    g.fillStyle(C.cream).fillRect(b.x - 15, top, 30, 20)
    g.fillStyle(C.metal).fillRoundedRect(b.x - 10, top, 20, 16, { tl: 0, tr: 0, bl: 3, br: 3 })
    g.fillStyle(C.glass).fillRect(b.x - 7, top + 2, 14, 9)
    g.fillStyle(C.wallShade).fillRect(b.x - 16, top - 2, 32, 4)
    g.lineStyle(2, C.cream).lineBetween(b.x, top + 1, b.x, top + 14)
  }
  return cityBuildingSign(b, options)
}

/** Small shared facades avoid replaying the entire city's vector commands each frame. */
export const ensureBuildingTexture = (
  scene: Phaser.Scene, building: UrbanBuilding, options: BuildingArtOptions,
): string => {
  const variant = building.kind === 'home' ? ((options.variant % 6) + 6) % 6 :
    building.kind === 'shop' ? ((options.variant % 3) + 3) % 3 : 0
  const identity = options.identity ?? storefrontIdentity(options.name)
  const tier = building.kind === 'hq' ? Math.min(3, Math.max(1, Math.floor(options.growthTier ?? 1))) : 1
  const key = `dropi-original-building-v3-${building.kind}-${building.width}x${building.height}-${building.entranceFacing}-${variant}-${building.kind === 'home' ? '' : identity}-${tier}`
  if (scene.textures.exists(key)) return key
  const padding = 24
  const g = scene.make.graphics({ x: 0, y: 0 })
  drawCityBuilding(g, g, {
    ...building, x: building.width / 2 + padding, y: building.height / 2 + padding,
  }, { ...options, variant, identity, growthTier: tier })
  g.generateTexture(key, building.width + padding * 2, building.height + padding * 2)
  g.destroy()
  return key
}

export const drawBench = (g: Graphics, x: number, y: number): void => {
  g.fillStyle(C.shadow, 0.15).fillEllipse(x + 3, y + 7, 48, 12)
  g.fillStyle(C.metal).fillRoundedRect(x - 18, y - 3, 4, 15, 1).fillRoundedRect(x + 14, y - 3, 4, 15, 1)
  for (let i = 0; i < 3; i++) {
    g.fillStyle(i === 1 ? C.wall : C.wallShade).fillRoundedRect(x - 23, y - 12 + i * 5, 46, 4, 1)
  }
  g.fillStyle(C.trunk).fillRoundedRect(x - 23, y + 4, 46, 5, 1)
  g.lineStyle(2, C.metal).lineBetween(x - 20, y - 3, x - 20, y + 5)
    .lineBetween(x + 20, y - 3, x + 20, y + 5)
}

export const drawLamp = (g: Graphics, x: number, y: number): void => {
  g.fillStyle(C.shadow, 0.12).fillEllipse(x + 9, y + 3, 28, 9)
  g.fillStyle(C.metal).fillRoundedRect(x - 4, y - 2, 8, 7, 2)
  g.lineStyle(3, C.metal).lineBetween(x, y, x, y - 43)
    .lineBetween(x, y - 43, x + 13, y - 43)
  g.fillStyle(C.metal).fillRoundedRect(x + 7, y - 46, 14, 5, 2)
  g.fillStyle(C.windowLight).fillRoundedRect(x + 10, y - 41, 8, 7, 2)
  g.fillStyle(C.cream).fillRect(x + 10, y - 41, 8, 2)
}

export const ensureTreeTexture = (scene: Phaser.Scene, variant: number): string => {
  const key = `dropi-original-tree-v2-${variant % 4}`
  if (scene.textures.exists(key)) return key
  const g = scene.make.graphics({ x: 0, y: 0 })
  g.fillStyle(C.trunk).fillRoundedRect(44, 63, 9, 31, 3)
  g.fillStyle(C.wallShade).fillRect(45, 67, 3, 23)
  g.lineStyle(5, C.trunk).lineBetween(49, 76, 32, 59).lineBetween(49, 74, 66, 57)
  const lobes = [[26, 53, 20], [65, 53, 22], [48, 65, 23], [30, 31, 21], [62, 30, 22], [47, 22, 21]]
  lobes.forEach(([x, y, r], index) => {
    g.fillStyle(C.leafDark).fillCircle(x, y + 3, r + 1)
    g.fillStyle((index + variant) % 3 ? C.leaf : C.grassShade).fillCircle(x, y, r)
    g.fillStyle(C.leafLight).fillEllipse(x - 5, y - 6, r * 1.35, r)
    g.fillStyle(C.leafSun, 0.62).fillEllipse(x - 8, y - 9, r * 0.64, r * 0.36)
  })
  for (const [x, y] of [[18, 44], [46, 40], [56, 67], [76, 39], [31, 13], [68, 18]]) {
    g.fillStyle(C.leafSun, 0.85).fillEllipse(x, y, 5, 3)
  }
  if (variant % 4 === 3) {
    for (const [x, y] of [[21, 47], [42, 32], [66, 50], [48, 64]]) {
      g.fillStyle(C.flower).fillCircle(x, y, 3)
      g.fillStyle(C.windowLight).fillCircle(x - 1, y - 1, 1)
    }
  }
  g.generateTexture(key, 96, 104)
  g.destroy()
  return key
}

export const NEIGHBOR_CELL = 64
export const NEIGHBOR_ANCHOR = { x: 32, y: 57 } as const

export const drawNeighborFrame = (
  g: Graphics, merchant: boolean, index: number, pose: CourierPose,
): void => {
  const variant = ((index % 6) + 6) % 6
  const side = pose.projection === 'profile'
  const back = pose.projection === 'back'
  const sign = pose.facing === 'left' ? -1 : 1
  const stride = [0, 1, 0, -1][pose.frame]
  const bob = pose.bob
  const skin = variant % 3 === 0 ? C.skinShade : C.skin
  const shirt = merchant ? [C.roof, C.metal, C.leafDark][variant % 3]
    : [C.flowerPink, C.roofBlue, C.roof, C.leafDark, C.metal, C.wallShade][variant]
  g.fillStyle(C.shadow, 0.2).fillEllipse(2, 1, 29, 10)
  pose.feet.forEach((foot, leg) => {
    g.lineStyle(6, C.metal).lineBetween(side ? 0 : leg ? 5 : -5, -12, foot.x, foot.y)
    const shoeX = foot.x - (side && sign < 0 ? 6 : 3)
    g.fillStyle(C.shadow).fillRoundedRect(shoeX, foot.y - 1, 9, 5, 2)
    g.fillStyle(C.cream).fillRect(shoeX + 1, foot.y + 2, 7, 2)
  })
  g.fillStyle(shirt).fillRoundedRect(side ? -8 : -11, -31 + bob, side ? 16 : 23, 23, 6)
  const arms = side ? [sign] : [-1, 1]
  for (const arm of arms) {
    const handY = -13 + bob + arm * stride * 3
    const handX = side ? sign * 4 + stride * 3 : arm * 14
    g.lineStyle(5, skin).lineBetween(arm * (side ? 2 : 12), -25 + bob, handX, handY)
    g.fillStyle(skin).fillCircle(handX, handY, 3)
  }
  if (merchant && !back) {
    g.fillStyle(C.cream).fillRoundedRect(side ? sign * 4 - 3 : -7, -25 + bob, side ? 6 : 14, 18, 2)
    if (!side) {
      g.lineStyle(2, C.cream).lineBetween(-5, -30 + bob, -5, -24 + bob).lineBetween(5, -30 + bob, 5, -24 + bob)
      g.fillStyle(C.wallShade).fillRoundedRect(-4, -17 + bob, 8, 5, 1)
    }
  } else {
    g.lineStyle(2, C.cream, 0.8).lineBetween(side ? -6 : -7, -18 + bob, side ? 6 : 8, -18 + bob)
    if (variant % 2) {
      const bagX = side ? -sign * 10 - 5 : -13
      g.lineStyle(2, C.trunk).lineBetween(side ? sign * 4 : 8, -29 + bob, bagX + 5, -11 + bob)
      g.fillStyle(C.parcel).fillRoundedRect(bagX, -17 + bob, 10, 11, 3)
    }
  }
  const hx = side ? sign * 2 : 0
  g.fillStyle(C.hair).fillEllipse(hx, -39 + bob, side ? 19 : 22, 22)
  g.fillStyle(back ? C.hair : skin).fillRoundedRect(hx - 9, -44 + bob, 18, 19, 7)
  if (!back) {
    g.fillCircle(hx + (side ? sign * 9 : -9), -35 + bob, 3)
    if (!side) g.fillCircle(hx + 9, -35 + bob, 3)
  }
  g.fillStyle(C.hair).fillRoundedRect(hx - 10, -47 + bob, 21, 8, 4)
  if (variant % 2) g.fillRoundedRect(hx + (side ? -sign * 7 - 2 : 6), -44 + bob, 5, 14, 2)
  else g.fillTriangle(hx - 8, -43 + bob, hx + 4, -43 + bob, hx - 8, -36 + bob)
  if (!back) {
    g.fillStyle(C.shadow).fillCircle(hx + (side ? sign * 5 : -3), -35 + bob, 1.2)
    if (!side) g.fillCircle(hx + 4, -35 + bob, 1.2)
    g.lineStyle(1, C.hair).lineBetween(hx + (side ? sign * 2 : -2), -29 + bob,
      hx + (side ? sign * 5 : 3), -29 + bob)
    g.fillStyle(C.flower, 0.35).fillEllipse(hx + (side ? sign * 3 : -6), -31 + bob, 4, 2)
  }
  if (merchant) {
    g.fillStyle(C.cream).fillRoundedRect(hx - 12, -49 + bob, 25, 6, 3)
    g.fillRoundedRect(hx - 8, -55 + bob, 17, 9, 4)
    g.fillStyle(C.wall).fillRect(hx - 8, -48 + bob, 17, 2)
  }
}

export const ensureNeighborTexture = (scene: Phaser.Scene, merchant: boolean, index: number): string => {
  const variant = ((index % 6) + 6) % 6
  const key = `dropi-original-neighbor-v3-${merchant ? 'shop' : 'home'}-${variant}`
  if (scene.textures.exists(key)) return key
  const g = scene.make.graphics({ x: 0, y: 0 })
  g.save().translateCanvas(NEIGHBOR_ANCHOR.x, NEIGHBOR_ANCHOR.y)
  drawNeighborFrame(g, merchant, variant, getCourierPose('Walking', 'down'))
  g.restore()
  g.generateTexture(key, NEIGHBOR_CELL, NEIGHBOR_CELL)
  g.destroy()
  return key
}

/** Six reusable 256×256 walking atlases; no per-pedestrian animation objects. */
export const ensureNeighborAtlas = (scene: Phaser.Scene, index: number): string => {
  const variant = ((index % 6) + 6) % 6
  const key = `dropi-original-neighbor-walk-v3-${variant}`
  if (scene.textures.exists(key)) return key
  const g = scene.make.graphics({ x: 0, y: 0 })
  for (const direction of COURIER_DIRECTIONS) for (const frame of [0, 1, 2, 3] as const) {
    const pose = getCourierPose('Walking', direction, frame)
    g.save().translateCanvas(frame * NEIGHBOR_CELL + NEIGHBOR_ANCHOR.x,
      Math.floor(pose.atlasFrame / 4) * NEIGHBOR_CELL + NEIGHBOR_ANCHOR.y)
    drawNeighborFrame(g, false, variant, pose)
    g.restore()
  }
  g.generateTexture(key, NEIGHBOR_CELL * 4, NEIGHBOR_CELL * 4)
  g.destroy()
  const texture = scene.textures.get(key)
  for (let frame = 0; frame < 16; frame++) {
    texture.add(frame, 0, frame % 4 * NEIGHBOR_CELL,
      Math.floor(frame / 4) * NEIGHBOR_CELL, NEIGHBOR_CELL, NEIGHBOR_CELL)
  }
  return key
}
