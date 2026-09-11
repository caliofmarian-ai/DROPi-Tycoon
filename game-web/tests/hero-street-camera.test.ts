import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  HERO_STREET_CAMERA_VERSION,
  HERO_STREET_TARGET_ZOOM,
  heroStreetCameraFraming,
  heroStreetCharacterScreenHeight,
} from '../src/world/heroStreetCamera'
import { COURIER_CELL } from '../src/world/courierArt'

const gameWorldSource = readFileSync(new URL('../src/scenes/GameWorldScene.ts', import.meta.url), 'utf8')

describe('DT-01 Hero street camera presentation', () => {
  it('keeps the hero large enough to read clearly on landscape Android', () => {
    expect(HERO_STREET_CAMERA_VERSION).toBe(1)
    expect(HERO_STREET_TARGET_ZOOM).toBeGreaterThanOrEqual(1.5)
    expect(heroStreetCharacterScreenHeight(COURIER_CELL)).toBeGreaterThanOrEqual(168)
  })

  it.each([
    ['up', 0, 1],
    ['down', 0, -1],
    ['left', 1, 0],
    ['right', -1, 0],
  ] as const)('creates directional look-ahead for %s travel', (facing, xSign, ySign) => {
    const framing = heroStreetCameraFraming(960, 540, facing)
    expect(Math.sign(framing.offsetX)).toBe(xSign)
    expect(Math.sign(framing.offsetY)).toBe(ySign)
    expect(framing.lookAheadScreenPx).toBeGreaterThanOrEqual(76)
    expect(framing.lookAheadScreenPx).toBeLessThanOrEqual(132)
  })

  it('converts the screen-space look-ahead to world units so composition stays stable across zoom', () => {
    const near = heroStreetCameraFraming(1280, 720, 'up', 2)
    const defaultView = heroStreetCameraFraming(1280, 720, 'up', 1.6)
    expect(near.lookAheadScreenPx).toBe(defaultView.lookAheadScreenPx)
    expect(near.offsetY).toBeLessThan(defaultView.offsetY)
  })

  it('is wired into the ordinary GameWorld follow path instead of being a detached helper', () => {
    expect(gameWorldSource).toContain("from '../world/heroStreetCamera'")
    expect(gameWorldSource).toContain('heroStreetCameraFraming(')
    expect(gameWorldSource).toContain('.setFollowOffset(')
    expect(gameWorldSource).toContain('HERO_STREET_TARGET_ZOOM')
  })
})
