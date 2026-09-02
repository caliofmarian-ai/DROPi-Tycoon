import { describe, expect, it } from 'vitest'
import { buildCameraControlButtons } from '../src/ui/cameraControls'
import { buildHUDLayout, boundsIntersect } from '../src/ui/hudLayout'

describe('M-008 Android owner-review HUD acceptance', () => {
  it('anchors the full persistent HUD cluster to the upper-right on representative landscape', () => {
    const viewport = { width: 915, height: 412 }
    const layout = buildHUDLayout(viewport.width, viewport.height)
    const centralHorizontalBand = {
      left: viewport.width * 0.25,
      top: 0,
      width: viewport.width * 0.5,
      height: viewport.height,
    }

    expect(layout.orderPanel.width).toBeLessThanOrEqual(200)
    expect(layout.orderPanel.height).toBeLessThanOrEqual(62)
    expect(layout.orderPanel.left).toBeGreaterThanOrEqual(viewport.width * 0.75)
    expect(layout.companyPanel.left).toBeGreaterThanOrEqual(viewport.width * 0.75)
    expect(layout.acceptButton.left).toBeGreaterThanOrEqual(viewport.width * 0.75)

    expect(boundsIntersect(layout.orderPanel, centralHorizontalBand)).toBe(false)
    expect(boundsIntersect(layout.companyPanel, centralHorizontalBand)).toBe(false)
    expect(boundsIntersect(layout.acceptButton, centralHorizontalBand)).toBe(false)
  })

  it('keeps the camera-control column separate on the left edge', () => {
    const viewport = { width: 915, height: 412 }
    const layout = buildHUDLayout(viewport.width, viewport.height)
    const controls = buildCameraControlButtons(viewport.width, viewport.height)

    controls.forEach(({ bounds }) => {
      expect(bounds.left).toBeLessThan(viewport.width * 0.15)
      expect(boundsIntersect(bounds, layout.companyPanel)).toBe(false)
      expect(boundsIntersect(bounds, layout.orderPanel)).toBe(false)
      expect(boundsIntersect(bounds, layout.acceptButton)).toBe(false)
    })
  })

  it('keeps persistent HUD coverage materially below the first remediation', () => {
    const viewportArea = 915 * 412
    const layout = buildHUDLayout(915, 412)
    const persistentArea =
      layout.companyPanel.width * layout.companyPanel.height +
      layout.orderPanel.width * layout.orderPanel.height +
      layout.acceptButton.width * layout.acceptButton.height

    expect(persistentArea / viewportArea).toBeLessThan(0.06)
  })

  it('keeps portrait HUD right-anchored and narrow', () => {
    const viewport = { width: 360, height: 640 }
    const layout = buildHUDLayout(viewport.width, viewport.height)

    expect(layout.orderPanel.width).toBeLessThanOrEqual(168)
    expect(layout.orderPanel.left).toBeGreaterThan(viewport.width * 0.5)
    expect(layout.companyPanel.left).toBeGreaterThan(viewport.width * 0.5)
    expect(layout.acceptButton.left).toBeGreaterThan(viewport.width * 0.5)
  })
})
