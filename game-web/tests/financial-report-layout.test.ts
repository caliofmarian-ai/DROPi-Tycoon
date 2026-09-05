import { describe, expect, it } from 'vitest'
import { buildFinanceDashboardLayout } from '../src/ui/managementLayout'
import {
  MIN_TOUCH_TARGET_PX,
  SUPPORTED_ANDROID_VIEWPORTS,
  rectInsideViewport,
} from '../src/ui/mobileViewport'

describe('RBATCH-019 / Product Experience — financial report Android layout', () => {
  for (const viewport of SUPPORTED_ANDROID_VIEWPORTS) {
    it(`keeps financial cards and controls usable at ${viewport.width}x${viewport.height}`, () => {
      const layout = buildFinanceDashboardLayout(viewport.width, viewport.height)

      expect(rectInsideViewport(layout.body, viewport.width, viewport.height)).toBe(true)
      expect(rectInsideViewport(layout.operations, viewport.width, viewport.height)).toBe(true)
      expect(rectInsideViewport(layout.action, viewport.width, viewport.height)).toBe(true)
      for (const nav of layout.navigation) expect(rectInsideViewport(nav, viewport.width, viewport.height)).toBe(true)
      expect(layout.metrics).toHaveLength(4)

      for (const rect of layout.metrics) {
        expect(rectInsideViewport(rect, viewport.width, viewport.height)).toBe(true)
        expect(rect.left).toBeGreaterThanOrEqual(layout.body.left)
        expect(rect.left + rect.width).toBeLessThanOrEqual(layout.body.left + layout.body.width)
      }

      for (const rect of [layout.action, ...layout.navigation]) {
        expect(rect.height).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET_PX)
        expect(rect.width).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET_PX)
      }
    })
  }

  it('uses a compact content-driven portrait dashboard instead of a full-height report box', () => {
    const layout = buildFinanceDashboardLayout(360, 800)
    expect(layout.compactLandscape).toBe(false)
    expect(layout.operations.height).toBeLessThan(160)
    expect(layout.metrics[0]?.top).toBeLessThan(layout.operations.top)
    expect(layout.operations.top + layout.operations.height).toBeLessThan(layout.action.top)
  })

  it('uses the compact landscape contract on short Android landscape viewports', () => {
    expect(buildFinanceDashboardLayout(800, 360).compactLandscape).toBe(true)
    expect(buildFinanceDashboardLayout(360, 800).compactLandscape).toBe(false)
  })
})
