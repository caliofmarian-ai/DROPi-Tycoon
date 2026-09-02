import { describe, expect, it } from 'vitest'
import { buildCameraControlButtons } from '../src/ui/cameraControls'
import { buildGameWorldTopBarLayout } from '../src/ui/gameWorldTopBar'
import { buildHUDLayout, boundsIntersect } from '../src/ui/hudLayout'

describe('M-008 Android owner-review top-dock acceptance', () => {
  it('keeps navigation and camera controls in one compact horizontal toolbar', () => {
    const viewport = { width: 915, height: 412 }
    const topBar = buildGameWorldTopBarLayout(viewport.width, viewport.height)
    const controls = buildCameraControlButtons(viewport.width, viewport.height)

    expect(controls).toHaveLength(5)
    controls.forEach(({ bounds }) => {
      expect(bounds.top).toBe(topBar.menuToggle.top)
      expect(bounds.top + bounds.height).toBeLessThanOrEqual(topBar.controlBar.height)
      expect(boundsIntersect(bounds, topBar.menuToggle)).toBe(false)
    })
  })

  it('keeps status in one 28px row and Accept in the toolbar row', () => {
    const viewport = { width: 915, height: 412 }
    const topBar = buildGameWorldTopBarLayout(viewport.width, viewport.height)
    const layout = buildHUDLayout(viewport.width, viewport.height)

    expect(layout.companyPanel.top).toBe(topBar.hudRowTop)
    expect(layout.orderPanel.top).toBe(topBar.hudRowTop)
    expect(layout.companyPanel.height).toBe(28)
    expect(layout.orderPanel.height).toBe(28)
    expect(layout.acceptButton.top).toBe(topBar.menuToggle.top)
    expect(layout.acceptButton.height).toBe(44)
    expect(layout.orderPanel.width).toBeLessThanOrEqual(240)
    expect(boundsIntersect(layout.companyPanel, layout.orderPanel)).toBe(false)
  })

  it('reserves map rendering below the entire persistent dock', () => {
    const topBar = buildGameWorldTopBarLayout(915, 412)
    expect(topBar.worldViewportTop).toBe(84)
    expect(topBar.worldViewportTop).toBeGreaterThan(topBar.hudRowTop + topBar.hudRowHeight)
  })

  it('keeps portrait controls consolidated at the top', () => {
    const viewport = { width: 360, height: 640 }
    const topBar = buildGameWorldTopBarLayout(viewport.width, viewport.height)
    const controls = buildCameraControlButtons(viewport.width, viewport.height)
    controls.forEach(({ bounds }) => {
      expect(bounds.top).toBe(topBar.menuToggle.top)
      expect(bounds.top + bounds.height).toBeLessThan(viewport.height * 0.1)
    })
  })
})
