import type Phaser from 'phaser'
import { describe, expect, it } from 'vitest'
import { COURIER_ANCHOR, COURIER_CELL, drawCourierFrame } from '../src/world/courierArt'
import { COURIER_DIRECTIONS, COURIER_STATES, getCourierPose } from '../src/world/courierPose'
import { drawCityBuilding, drawNeighborFrame, NEIGHBOR_ANCHOR, NEIGHBOR_CELL } from '../src/world/cityArt'
import { URBAN_BUILDINGS } from '../src/world/urbanWorld'

const geometry = () => {
  const bounds = { left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity }
  let transform = { x: 0, y: 0, sx: 1, sy: 1 }
  let lineWidth = 0
  const stack: typeof transform[] = []
  const include = (x: number, y: number, padding = 0) => {
    expect(Number.isFinite(x) && Number.isFinite(y)).toBe(true)
    bounds.left = Math.min(bounds.left, transform.x + (x - padding) * transform.sx)
    bounds.right = Math.max(bounds.right, transform.x + (x + padding) * transform.sx)
    bounds.top = Math.min(bounds.top, transform.y + (y - padding) * transform.sy)
    bounds.bottom = Math.max(bounds.bottom, transform.y + (y + padding) * transform.sy)
  }
  const graphics = new Proxy({}, {
    get: (_target, method: string) => (...args: number[]) => {
      if (method === 'save') stack.push({ ...transform })
      else if (method === 'restore') transform = stack.pop()!
      else if (method === 'translateCanvas') {
        transform.x += args[0] * transform.sx
        transform.y += args[1] * transform.sy
      } else if (method === 'scaleCanvas') {
        transform.sx *= args[0]
        transform.sy *= args[1]
      } else if (method === 'lineStyle') lineWidth = args[0]
      else if (/^(fill|stroke)(RoundedRect|Rect|Ellipse|Circle|Triangle)$/.test(method) || method === 'lineBetween') {
        const padding = method.startsWith('stroke') || method === 'lineBetween' ? lineWidth / 2 : 0
        const [x, y, width, height] = args
        if (method.endsWith('Triangle') || method === 'lineBetween') {
          for (let i = 0; i < args.length; i += 2) include(args[i], args[i + 1], padding)
        } else if (method.endsWith('Circle')) {
          expect(width).toBeGreaterThan(0)
          include(x - width, y - width, padding)
          include(x + width, y + width, padding)
        } else {
          expect(width).toBeGreaterThan(0)
          expect(height).toBeGreaterThan(0)
          const centered = method.endsWith('Ellipse')
          include(centered ? x - width / 2 : x, centered ? y - height / 2 : y, padding)
          include(centered ? x + width / 2 : x + width, centered ? y + height / 2 : y + height, padding)
        }
      }
      return graphics
    },
  }) as Phaser.GameObjects.Graphics
  return { graphics, bounds }
}

describe('generated art keeps antialiasing inside its atlas cells', () => {
  it.each(COURIER_STATES)('%s has no clipping or neighboring-frame bleed in any load or direction', state => {
    for (const direction of COURIER_DIRECTIONS) for (const carrying of [false, true]) {
      for (const frame of [0, 1, 2, 3] as const) {
        const { graphics, bounds } = geometry()
        drawCourierFrame(graphics, getCourierPose(state, direction, frame, carrying))
        expect(bounds.left + COURIER_ANCHOR.x).toBeGreaterThanOrEqual(1)
        expect(bounds.top + COURIER_ANCHOR.y).toBeGreaterThanOrEqual(1)
        expect(bounds.right + COURIER_ANCHOR.x).toBeLessThanOrEqual(COURIER_CELL - 1)
        expect(bounds.bottom + COURIER_ANCHOR.y).toBeLessThanOrEqual(COURIER_CELL - 1)
      }
    }
  })

  it('fits merchant hats and every directional pedestrian stride into padded 64px cells', () => {
    for (let variant = 0; variant < 6; variant++) for (const merchant of [false, true]) {
      for (const direction of COURIER_DIRECTIONS) for (const frame of [0, 1, 2, 3] as const) {
        if (merchant && frame !== 0) continue
        const { graphics, bounds } = geometry()
        drawNeighborFrame(graphics, merchant, variant, getCourierPose('Walking', direction, frame))
        expect(bounds.left + NEIGHBOR_ANCHOR.x).toBeGreaterThanOrEqual(1)
        expect(bounds.top + NEIGHBOR_ANCHOR.y).toBeGreaterThanOrEqual(1)
        expect(bounds.right + NEIGHBOR_ANCHOR.x).toBeLessThanOrEqual(NEIGHBOR_CELL - 1)
        expect(bounds.bottom + NEIGHBOR_ANCHOR.y).toBeLessThanOrEqual(NEIGHBOR_CELL - 1)
      }
    }
  })

  it('uses finite positive geometry for every modeled building and growth stage', () => {
    for (const [index, building] of URBAN_BUILDINGS.entries()) for (const growthTier of [1, 2, 3]) {
      const { graphics, bounds } = geometry()
      drawCityBuilding(graphics, geometry().graphics, building, { name: 'Market', variant: index, growthTier })
      expect(bounds.left).toBeGreaterThanOrEqual(building.x - building.width / 2 - 5)
      expect(bounds.right).toBeLessThanOrEqual(building.x + building.width / 2 + 5)
      expect(bounds.top).toBeGreaterThanOrEqual(building.y - building.height / 2 - 5)
      expect(bounds.bottom).toBeLessThanOrEqual(building.y + building.height / 2 + 5)
    }
  })
})
