import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { buildManagementCards, buildVehicleCardLayout } from '../src/ui/managementLayout'
import {
  MIN_TOUCH_TARGET_PX,
  SUPPORTED_ANDROID_VIEWPORTS,
  rectInsideViewport,
} from '../src/ui/mobileViewport'

describe('RBATCH-022 — vehicle fleet Android layout', () => {
  for (const viewport of SUPPORTED_ANDROID_VIEWPORTS) {
    it(`keeps vehicle catalog controls usable at ${viewport.width}x${viewport.height}`, () => {
      const layout = buildManagementCards(viewport.width, viewport.height)

      expect(rectInsideViewport(layout.body, viewport.width, viewport.height)).toBe(true)
      for (const nav of layout.navigation) expect(rectInsideViewport(nav, viewport.width, viewport.height)).toBe(true)
      expect(layout.cards).toHaveLength(layout.pageSize)

      for (const card of layout.cards) {
        const row = buildVehicleCardLayout(card)
        expect(rectInsideViewport(card, viewport.width, viewport.height)).toBe(true)
        expect(rectInsideViewport(row.purchase, viewport.width, viewport.height)).toBe(true)
        expect(row.purchase.width).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET_PX)
        expect(row.purchase.height).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET_PX)
        expect(row.identity.width).toBeGreaterThanOrEqual(140)
        expect(row.capabilities[0].top).toBeGreaterThan(row.identity.top + row.identity.height)
        expect(row.economics.top).toBeGreaterThanOrEqual(row.capabilities[0].top + row.capabilities[0].height)
        expect(row.purchase.top).toBeGreaterThan(row.economics.top + row.economics.height)
      }
    })
  }

  it('uses compact landscape contract on short Android landscape viewports', () => {
    expect(buildManagementCards(800, 360).compactLandscape).toBe(true)
    expect(buildManagementCards(360, 800).compactLandscape).toBe(false)
  })
})

describe('Workstream F — VehicleFleetScene plays purchase audio cues', () => {
  it('plays a purchase cue on success and a negative cue on failure', () => {
    const vehicleFleetSource = readFileSync(
      new URL('../src/scenes/VehicleFleetScene.ts', import.meta.url),
      'utf8',
    )
    expect(vehicleFleetSource).toContain("import { getAudioController } from '../systems/audioSystem'")
    expect(vehicleFleetSource).toContain("getAudioController().play(result.purchased ? 'purchase' : 'negative')")
  })
})
