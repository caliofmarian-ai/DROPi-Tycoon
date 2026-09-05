import type Phaser from 'phaser'
import { CITY_COLORS as C, COLORS } from '../ui/theme'
import {
  COURIER_DIRECTIONS, getCourierPose, type CourierFrame, type CourierPose, type CourierState,
} from './courierPose'

export const COURIER_CELL = 112
export const COURIER_ANCHOR = { x: 56, y: 78 } as const
const ink = C.shadow

export const drawParcel = (g: Phaser.GameObjects.Graphics, x: number, y: number, size = 15): void => {
  g.fillStyle(C.parcel).fillRoundedRect(x - size / 2, y - size / 2, size, size, 2)
  g.fillStyle(C.wallShade).fillTriangle(x - size / 2, y - size / 2,
    x + size / 2, y - size / 2, x + size / 2 - 4, y - size / 2 - 4)
  g.fillTriangle(x - size / 2, y - size / 2, x + size / 2 - 4, y - size / 2 - 4,
    x - size / 2 - 4, y - size / 2 - 4)
  g.fillStyle(C.tape).fillRect(x - 2, y - size / 2, 4, size)
  g.lineStyle(1, C.trunk, 0.7).strokeRoundedRect(x - size / 2, y - size / 2, size, size, 2)
  g.fillStyle(C.cream).fillRect(x + 3, y + 1, 3, 4)
}

const drawBackpack = (g: Phaser.GameObjects.Graphics, p: CourierPose): void => {
  const { x, y } = p.cargo
  const side = p.projection === 'profile'
  g.fillStyle(ink).fillRoundedRect(x - (side ? 7 : 9), y - 11, side ? 11 : 18, 22, 4)
  g.fillStyle(COLORS.accentStrong).fillRoundedRect(x - (side ? 7 : 8), y - 10, side ? 9 : 16, 18, 3)
  g.fillStyle(COLORS.accent).fillRoundedRect(x - (side ? 6 : 7), y - 9, side ? 7 : 14, 5, 2)
  g.fillStyle(C.cream).fillRect(x - (side ? 5 : 6), y + 1, side ? 6 : 12, 3)
  g.fillStyle(ink).fillRoundedRect(x - 3, y + 5, 6, 3, 1)
  if (p.carrying) drawParcel(g, x, y - 10, 12)
}

const drawRider = (g: Phaser.GameObjects.Graphics, p: CourierPose): void => {
  const side = p.projection === 'profile'
  const back = p.projection === 'back'
  const riding = p.state !== 'Walking'
  const sign = p.facing === 'left' ? -1 : 1
  const torsoY = (riding ? -31 : -26) + p.bob
  const hipY = riding ? -12 : -10
  if (side) drawBackpack(g, p)
  g.lineStyle(6, ink)
  p.feet.forEach((foot, i) => {
    const hipX = side ? 0 : i ? 4 : -4
    const fy = riding ? -3 - (i ? -1 : 1) * [0, 4, 0, -4][p.frame] : foot.y
    const fx = riding ? (side ? sign * 8 : i ? 8 : -8) : foot.x
    g.lineBetween(hipX, hipY, fx, fy - 2)
    g.fillStyle(C.metal).fillRoundedRect(fx - 4, fy - 2, side ? 10 : 7, 5, 2)
    g.fillStyle(C.cream).fillRect(fx - 3, fy + 2, side ? 9 : 6, 2)
  })
  g.fillStyle(C.cream).fillRoundedRect(-p.bodyWidth / 2 - 2, torsoY - 2, p.bodyWidth + 4, 20, 7)
  g.fillStyle(COLORS.accentStrong).fillRoundedRect(-p.bodyWidth / 2, torsoY, p.bodyWidth, 19, 5)
  g.fillStyle(COLORS.accent).fillRoundedRect(-p.bodyWidth / 2 + 1, torsoY + 1, p.bodyWidth / 2, 17, 3)
  g.fillStyle(C.cream).fillRect(-p.bodyWidth / 2, torsoY + 11, p.bodyWidth, 3)
  if (!back) {
    g.lineStyle(2, C.metal).lineBetween(side ? 4 * sign : 0, torsoY + 2,
      side ? 4 * sign : 0, torsoY + 17)
    if (!side) {
      g.lineStyle(2, C.cream).lineBetween(-5, torsoY, -5, torsoY + 8)
        .lineBetween(5, torsoY, 5, torsoY + 8)
    }
  }
  const armSwing = riding ? 0 : [0, 3, 0, -3][p.frame]
  g.lineStyle(5, C.skinShade)
  if (side) {
    g.lineBetween(sign * 2, torsoY + 5, sign * (riding ? 14 : 5) + armSwing, torsoY + 16)
    g.fillStyle(C.skin).fillCircle(sign * (riding ? 16 : 5) + armSwing, torsoY + 16, 3)
  } else {
    g.lineBetween(-11, torsoY + 5, -12, torsoY + 16 + armSwing)
      .lineBetween(11, torsoY + 5, 12, torsoY + 16 - armSwing)
    g.fillStyle(C.skin).fillCircle(-12, torsoY + 17 + armSwing, 3)
      .fillCircle(12, torsoY + 17 - armSwing, 3)
  }
  if (back) drawBackpack(g, p)
  if (p.carrying && !back && !side && !riding) drawParcel(g, -14, torsoY + 14, 13)

  const { x, y } = p.head
  g.fillStyle(C.skinShade).fillRoundedRect(x - 3, y + 5, 6, 7, 2)
  g.fillStyle(C.hair).fillEllipse(x, y - 1, side ? 16 : 20, 19)
  g.fillStyle(back ? C.hair : C.skin).fillRoundedRect(x - 8, y - 5, 16, 16, 6)
  if (p.faceVisible) {
    g.fillStyle(C.skin).fillCircle(x + (side ? sign * 8 : -8), y + 3, 3)
    if (!side) g.fillCircle(x + 8, y + 3, 3)
    g.fillStyle(ink).fillCircle(x + (side ? sign * 5 : -3), y + 1, 1.25)
    if (!side) g.fillCircle(x + 3, y + 1, 1.25)
    g.fillStyle(C.skinShade).fillEllipse(x + (side ? sign * 6 : 0), y + 5, 3, 2)
    g.lineStyle(1, C.hair, 0.7).lineBetween(x - (side ? -sign * 2 : 2), y + 8, x + 3, y + 8)
  }
  g.fillStyle(COLORS.accentStrong).fillRoundedRect(x - 9, y - 10, 18, 9, { tl: 7, tr: 7, bl: 1, br: 1 })
  g.fillStyle(COLORS.accent).fillRoundedRect(x - 7, y - 10, 9, 6, 3)
  g.fillStyle(C.metal)
  if (side) g.fillRoundedRect(x + (sign < 0 ? -15 : 4), y - 4, 12, 4, 2)
  else if (back) g.fillRoundedRect(x - 4, y - 3, 8, 3, 1)
  else {
    g.fillRoundedRect(x - 10, y - 3, 20, 4, 2)
    g.fillStyle(C.cream).fillRoundedRect(x - 2, y - 8, 4, 4, 1)
  }
}

const drawCycle = (g: Phaser.GameObjects.Graphics, p: CourierPose): void => {
  const side = p.wheelAxis === 'x'
  const scooter = p.state === 'ElectricScooter'
  const motor = p.state === 'Motorcycle'
  const sign = p.facing === 'left' || p.facing === 'up' ? -1 : 1
  const radius = scooter ? 6 : motor ? 11 : 12
  for (const wheel of p.wheels) {
    if (side) {
      g.fillStyle(ink).fillCircle(wheel.x, wheel.y, radius)
      g.fillStyle(C.cream).fillCircle(wheel.x, wheel.y, radius - 2)
      g.fillStyle(C.road).fillCircle(wheel.x, wheel.y, radius - 4)
      const spoke = p.frame % 2 ? 5 : 0
      g.lineStyle(1, C.curb, 0.85).lineBetween(wheel.x - radius + 4, wheel.y - spoke,
        wheel.x + radius - 4, wheel.y + spoke)
        .lineBetween(wheel.x, wheel.y - radius + 3, wheel.x, wheel.y + radius - 3)
      g.fillStyle(C.metal).fillCircle(wheel.x, wheel.y, 2.5)
    } else {
      g.fillStyle(ink).fillRoundedRect(wheel.x - (motor ? 5 : 3), wheel.y - radius,
        motor ? 10 : 6, radius * 2, 3)
      g.fillStyle(C.road).fillRoundedRect(wheel.x - 1, wheel.y - radius + 2, 2, radius * 2 - 4, 1)
      g.lineStyle(1, C.cream, 0.65).lineBetween(wheel.x - 3, wheel.y - 5, wheel.x - 3, wheel.y + 5)
    }
  }
  const frameColor = scooter ? COLORS.accent : motor ? C.roof : COLORS.gold
  if (side) {
    const front = p.wheels[sign > 0 ? 1 : 0]
    const rear = p.wheels[sign > 0 ? 0 : 1]
    g.lineStyle(3.5, frameColor).strokeTriangle(rear.x, -3, -2 * sign, -3, -8 * sign, -20)
      .lineBetween(-8 * sign, -20, 12 * sign, -20).lineBetween(-2 * sign, -3, 12 * sign, -20)
      .lineBetween(12 * sign, -20, front.x, -3)
    g.lineStyle(3, C.metal).lineBetween(12 * sign, -20, 12 * sign, -28)
      .lineBetween(12 * sign, -28, 19 * sign, -28)
      .lineBetween(-13 * sign, -22, -3 * sign, -22)
    if (motor) {
      g.fillStyle(C.roofShade).fillRoundedRect(-12, -19, 30, 15, 6)
      g.fillStyle(C.roof).fillEllipse(8 * sign, -19, 21, 12)
      g.fillStyle(C.windowLight).fillEllipse(front.x - sign * 3, -19, 7, 10)
      g.fillStyle(C.metal).fillRoundedRect(-16 * sign - 7, -6, 16, 4, 2)
    } else if (scooter) {
      g.fillStyle(C.metal).fillRoundedRect(-14, -3, 29, 5, 2)
      g.lineStyle(4, COLORS.accent).lineBetween(front.x, -3, 12 * sign, -28)
    }
    g.fillStyle(ink).fillRoundedRect(-15 * sign - 6, -25, 14, 5, 2)
  } else {
    g.lineStyle(motor ? 8 : 4, frameColor).lineBetween(0, -24, 0, 15)
    g.lineStyle(3, C.metal).lineBetween(-14, sign * 13 - 10, 14, sign * 13 - 10)
    g.fillStyle(C.cream).fillRoundedRect(-15, sign * 13 - 12, 5, 4, 1)
      .fillRoundedRect(10, sign * 13 - 12, 5, 4, 1)
    if (motor) {
      g.fillStyle(C.roofShade).fillRoundedRect(-10, -21, 20, 35, 8)
      g.fillStyle(C.roof).fillRoundedRect(-8, -20, 16, 30, 6)
      g.fillStyle(C.windowLight).fillRoundedRect(-6, sign > 0 ? 12 : -27, 12, 6, 2)
    }
    if (scooter) g.fillStyle(C.metal).fillRoundedRect(-6, -19, 12, 32, 4)
    g.fillStyle(ink).fillRoundedRect(-6, -11, 12, 16, 4)
  }
  if (p.carrying) drawParcel(g, p.cargo.x, p.cargo.y + (side ? -3 : 0), 18)
}

const drawCabinVehicle = (g: Phaser.GameObjects.Graphics, p: CourierPose): void => {
  const side = p.projection === 'profile'
  const van = p.state === 'DeliveryVan'
  const front = p.facing === 'down' || p.facing === 'right'
  const width = side ? p.bodyLength : p.bodyWidth
  const height = side ? p.bodyWidth : p.bodyLength
  const left = -width / 2
  const top = -height / 2 - 12
  for (const wheel of p.wheels) {
    g.fillStyle(ink).fillRoundedRect(wheel.x - 5, wheel.y - 9, side ? 12 : 7, 14, 3)
    if (side) g.fillStyle(C.cream).fillCircle(wheel.x + 1, wheel.y - 2, 3)
  }
  g.fillStyle(C.metal).fillRoundedRect(left - 1, top + 5, width + 2, height, 8)
  g.fillStyle(van ? C.cream : C.roof).fillRoundedRect(left, top, width, height - 1, 8)
  g.fillStyle(van ? C.wall : C.roofShade).fillRoundedRect(left + width - 7, top + 7, 7, height - 11, 3)
  const cabinX = side ? (front ? width / 2 - 21 : -width / 2 + 5) : left + 4
  const cabinY = side ? top + 5 : front ? top + height - 26 : top + 7
  g.fillStyle(C.glassShade).fillRoundedRect(cabinX, cabinY, side ? 17 : width - 8, side ? height - 14 : 18, 4)
  g.fillStyle(C.glass).fillRoundedRect(cabinX + 2, cabinY + 2, side ? 12 : width - 14, 8, 3)
  g.lineStyle(2, C.curb, 0.7).lineBetween(cabinX + 3, cabinY + 4, cabinX + 9, cabinY + 4)
  const roofX = side ? (front ? left + 6 : left + 26) : left + 5
  const roofY = side ? top + 3 : front ? top + 4 : top + 28
  g.fillStyle(van ? COLORS.accentStrong : C.flower).fillRoundedRect(roofX, roofY,
    side ? width - 34 : width - 10, side ? height - 10 : height - 35, 5)
  g.lineStyle(2, van ? COLORS.accent : C.wall).strokeRoundedRect(roofX + 3, roofY + 3,
    side ? width - 40 : width - 16, side ? height - 16 : height - 41, 3)
  if (van) {
    g.fillStyle(C.cream).fillRoundedRect(roofX + (side ? 12 : 4), roofY + 8, 12, 13, 3)
    g.fillStyle(COLORS.accentStrong).fillCircle(roofX + (side ? 17 : 9), roofY + 14, 3)
  }
  g.fillStyle(front ? C.windowLight : C.roofShade)
  if (side) {
    g.fillRoundedRect(front ? width / 2 - 4 : -width / 2, top + height - 13, 4, 8, 2)
  } else {
    g.fillRoundedRect(left + 4, front ? top + height - 6 : top, 7, 4, 1)
      .fillRoundedRect(width / 2 - 11, front ? top + height - 6 : top, 7, 4, 1)
  }
}

export const drawCourierFrame = (g: Phaser.GameObjects.Graphics, pose: CourierPose): void => {
  const enclosed = !pose.riderVisible
  const side = pose.projection === 'profile'
  g.fillStyle(C.shadow, 0.23).fillEllipse(3, 5,
    enclosed ? side ? 87 : 48 : pose.state === 'Walking' ? 30 : side ? 65 : 29,
    enclosed ? side ? 27 : 61 : pose.state === 'Walking' ? 12 : side ? 15 : 48)
  if (enclosed) drawCabinVehicle(g, pose)
  else {
    if (pose.state !== 'Walking') drawCycle(g, pose)
    drawRider(g, pose)
  }
}

/** One 448×896 RGBA atlas per used transport, shared by all couriers/scenes. */
export const ensureCourierAtlas = (scene: Phaser.Scene, state: CourierState): string => {
  const key = `dropi-original-courier-v2-${state}`
  if (scene.textures.exists(key)) return key
  const graphics = scene.make.graphics({ x: 0, y: 0 })
  for (const facing of COURIER_DIRECTIONS) {
    for (const carrying of [false, true]) {
      for (const frame of [0, 1, 2, 3] as const) {
        const pose = getCourierPose(state, facing, frame as CourierFrame, carrying)
        const x = pose.atlasFrame % 4 * COURIER_CELL
        const y = Math.floor(pose.atlasFrame / 4) * COURIER_CELL
        graphics.save().translateCanvas(x + COURIER_ANCHOR.x, y + COURIER_ANCHOR.y)
        drawCourierFrame(graphics, pose)
        graphics.restore()
      }
    }
  }
  graphics.generateTexture(key, COURIER_CELL * 4, COURIER_CELL * 8)
  graphics.destroy()
  const texture = scene.textures.get(key)
  for (let frame = 0; frame < 32; frame++) {
    texture.add(frame, 0, frame % 4 * COURIER_CELL,
      Math.floor(frame / 4) * COURIER_CELL, COURIER_CELL, COURIER_CELL)
  }
  return key
}
