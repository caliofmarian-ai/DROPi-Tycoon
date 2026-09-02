import { describe, expect, it } from 'vitest'
import { buildHUDLayout, boundsIntersect, isBoundsInsideCanvas } from '../src/ui/hudLayout'
import { SUPPORTED_ANDROID_VIEWPORTS, isCompactLandscape } from '../src/ui/mobileViewport'

describe('M-008 mobile HUD obstruction remediation', () => {
  for (const viewport of SUPPORTED_ANDROID_VIEWPORTS) {
    it(`keeps compact HUD panels inside ${viewport.width}x${viewport.height}`, () => {
      const layout = buildHUDLayout(viewport.width, viewport.height)
      expect(isBoundsInsideCanvas(layout.companyPanel, viewport.width, viewport.height)).toBe(true)
      expect(isBoundsInsideCanvas(layout.orderPanel, viewport.width, viewport.height)).toBe(true)
      expect(isBoundsInsideCanvas(layout.acceptButton, viewport.width, viewport.height)).toBe(true)
    })

    it(`does not use a near-full-width order panel at ${viewport.width}x${viewport.height}`, () => {
      const layout = buildHUDLayout(viewport.width, viewport.height)
      expect(layout.orderPanel.width).toBeLessThanOrEqual(Math.min(380, viewport.width - 12))
      if (viewport.width >= 640) {
        expect(layout.orderPanel.width / viewport.width).toBeLessThanOrEqual(0.6)
      }
    })

    if (isCompactLandscape(viewport.width, viewport.height)) {
      it(`separates order and company panels in compact landscape ${viewport.width}x${viewport.height}`, () => {
        const layout = buildHUDLayout(viewport.width, viewport.height)
        expect(boundsIntersect(layout.orderPanel, layout.companyPanel)).toBe(false)
      })
    }
  }

  it('keeps order content to a shallow overlay in representative landscape', () => {
    const layout = buildHUDLayout(915, 412)
    expect(layout.orderPanel.height).toBeLessThanOrEqual(96)
    expect(layout.orderPanel.width).toBeLessThanOrEqual(380)
  })
})
