import { describe, expect, it } from 'vitest'
import { buildFinancialReportLayout } from '../src/ui/financialReportLayout'
import {
  MIN_TOUCH_TARGET_PX,
  SUPPORTED_ANDROID_VIEWPORTS,
  rectInsideViewport,
} from '../src/ui/mobileViewport'

describe('RBATCH-019 / Product Experience — financial report Android layout', () => {
  for (const viewport of SUPPORTED_ANDROID_VIEWPORTS) {
    it(`keeps financial cards and controls usable at ${viewport.width}x${viewport.height}`, () => {
      const layout = buildFinancialReportLayout(viewport.width, viewport.height)

      expect(rectInsideViewport(layout.panel, viewport.width, viewport.height)).toBe(true)
      expect(rectInsideViewport(layout.operationsCard, viewport.width, viewport.height)).toBe(true)
      expect(rectInsideViewport(layout.actionButton, viewport.width, viewport.height)).toBe(true)
      expect(rectInsideViewport(layout.returnButton, viewport.width, viewport.height)).toBe(true)
      expect(rectInsideViewport(layout.menuButton, viewport.width, viewport.height)).toBe(true)
      expect(layout.metricRects).toHaveLength(4)

      for (const rect of layout.metricRects) {
        expect(rectInsideViewport(rect, viewport.width, viewport.height)).toBe(true)
        expect(rect.left).toBeGreaterThanOrEqual(layout.panel.left)
        expect(rect.left + rect.width).toBeLessThanOrEqual(layout.panel.left + layout.panel.width)
      }

      expect(layout.actionButton.height).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET_PX)
      expect(layout.returnButton.height).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET_PX)
      expect(layout.menuButton.height).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET_PX)
      expect(layout.actionButton.width).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET_PX)
      expect(layout.summary.wrapWidth).toBeLessThanOrEqual(viewport.width)
    })
  }

  it('uses a compact content-driven portrait dashboard instead of a full-height report box', () => {
    const layout = buildFinancialReportLayout(360, 800)
    expect(layout.compactLandscape).toBe(false)
    expect(layout.panel.height).toBeLessThan(800 * 0.56)
    expect(layout.metricRects[0]?.top).toBeLessThan(layout.operationsCard.top)
    expect(layout.operationsCard.top + layout.operationsCard.height).toBeLessThan(layout.actionButton.top)
  })

  it('uses the compact landscape contract on short Android landscape viewports', () => {
    expect(buildFinancialReportLayout(800, 360).compactLandscape).toBe(true)
    expect(buildFinancialReportLayout(360, 800).compactLandscape).toBe(false)
  })
})
