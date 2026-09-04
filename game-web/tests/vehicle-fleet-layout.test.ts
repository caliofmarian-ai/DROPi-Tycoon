import { describe, expect, it } from 'vitest'
import { buildVehicleFleetLayout } from '../src/ui/vehicleFleetLayout'
import {
  MIN_TOUCH_TARGET_PX,
  SUPPORTED_ANDROID_VIEWPORTS,
  rectInsideViewport,
} from '../src/ui/mobileViewport'

describe('RBATCH-022 — vehicle fleet Android layout', () => {
  for (const viewport of SUPPORTED_ANDROID_VIEWPORTS) {
    it(`keeps vehicle catalog controls usable at ${viewport.width}x${viewport.height}`, () => {
      const layout = buildVehicleFleetLayout(viewport.width, viewport.height, 4)

      expect(rectInsideViewport(layout.panel, viewport.width, viewport.height)).toBe(true)
      expect(rectInsideViewport(layout.returnButton, viewport.width, viewport.height)).toBe(true)
      expect(rectInsideViewport(layout.menuButton, viewport.width, viewport.height)).toBe(true)
      expect(layout.rows).toHaveLength(4)

      for (const row of layout.rows) {
        expect(rectInsideViewport(row.row, viewport.width, viewport.height)).toBe(true)
        expect(rectInsideViewport(row.purchaseButton, viewport.width, viewport.height)).toBe(true)
        expect(row.purchaseButton.width).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET_PX)
        expect(row.purchaseButton.height).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET_PX)
        expect(row.text.wrapWidth).toBeGreaterThanOrEqual(100)
        expect(row.purchaseButton.left).toBeGreaterThan(row.text.x)
      }
    })
  }

  it('uses compact landscape contract on short Android landscape viewports', () => {
    expect(buildVehicleFleetLayout(800, 360, 4).compactLandscape).toBe(true)
    expect(buildVehicleFleetLayout(360, 800, 4).compactLandscape).toBe(false)
  })
})
