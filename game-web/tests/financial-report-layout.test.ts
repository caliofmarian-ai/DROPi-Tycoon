import { describe, expect, it } from 'vitest'
import { buildFinancialReportLayout } from '../src/ui/financialReportLayout'
import {
  MIN_TOUCH_TARGET_PX,
  SUPPORTED_ANDROID_VIEWPORTS,
  rectInsideViewport,
} from '../src/ui/mobileViewport'

describe('RBATCH-019 — financial report Android layout', () => {
  for (const viewport of SUPPORTED_ANDROID_VIEWPORTS) {
    it(`keeps financial controls usable at ${viewport.width}x${viewport.height}`, () => {
      const layout = buildFinancialReportLayout(viewport.width, viewport.height)

      expect(rectInsideViewport(layout.panel, viewport.width, viewport.height)).toBe(true)
      expect(rectInsideViewport(layout.actionButton, viewport.width, viewport.height)).toBe(true)
      expect(rectInsideViewport(layout.returnButton, viewport.width, viewport.height)).toBe(true)
      expect(rectInsideViewport(layout.menuButton, viewport.width, viewport.height)).toBe(true)

      expect(layout.actionButton.height).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET_PX)
      expect(layout.returnButton.height).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET_PX)
      expect(layout.menuButton.height).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET_PX)
      expect(layout.actionButton.width).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET_PX)
      expect(layout.reportText.wrapWidth).toBeGreaterThanOrEqual(210)
    })
  }

  it('uses the compact landscape contract on short Android landscape viewports', () => {
    expect(buildFinancialReportLayout(800, 360).compactLandscape).toBe(true)
    expect(buildFinancialReportLayout(360, 800).compactLandscape).toBe(false)
  })
})
