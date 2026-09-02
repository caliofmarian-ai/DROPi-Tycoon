import { describe, expect, it } from 'vitest'
import { buildCameraControlButtons } from '../src/ui/cameraControls'
import { buildGameWorldTopBarLayout } from '../src/ui/gameWorldTopBar'
import { buildHUDLayout, boundsIntersect } from '../src/ui/hudLayout'

describe('M-008 Android owner-review top-dock acceptance', () => {
  it('places the navigation toggle and every camera control in one horizontal top row', () => {
    const viewport = { width: 915, height: 412 }
    const topBar = buildGameWorldTopBarLayout(viewport.width, viewport.height)
    const controls = buildCameraControlButtons(viewport.width, viewport.height)

    expect(controls).toHaveLength(5)
    controls.forEach(({ bounds }) => {
      expect(bounds.top).toBe(topBar.menuToggle.top)
      expect(bounds.top + bounds.height).toBeLessThanOrEqual(topBar.controlBar.height)
      expect(boundsIntersect(bounds, topBar.menuToggle)).toBe(false)
    })

    for (let index = 1; index < controls.length; index += 1) {
      expect(controls[index].bounds.left).toBeGreaterThan(controls[index - 1].bounds.left)
      expect(controls[index].bounds.top).toBe(controls[index - 1].bounds.top)
    }
  })

  it('keeps company, active order and Accept together in one shallow row directly under the toolbar', () => {
    const viewport = { width: 915, height: 412 }
    const topBar = buildGameWorldTopBarLayout(viewport.width, viewport.height)
    const layout = buildHUDLayout(viewport.width, viewport.height)

    expect(layout.companyPanel.top).toBe(topBar.hudRowTop)
    expect(layout.orderPanel.top).toBe(topBar.hudRowTop)
    expect(layout.acceptButton.top).toBe(topBar.hudRowTop)
    expect(layout.companyPanel.height).toBe(topBar.hudRowHeight)
    expect(layout.orderPanel.height).toBe(topBar.hudRowHeight)
    expect(layout.acceptButton.height).toBe(topBar.hudRowHeight)

    expect(layout.companyPanel.left).toBeLessThan(layout.orderPanel.left)
    expect(layout.orderPanel.left).toBeLessThan(layout.acceptButton.left)
    expect(boundsIntersect(layout.companyPanel, layout.orderPanel)).toBe(false)
    expect(boundsIntersect(layout.orderPanel, layout.acceptButton)).toBe(false)
  })

  it('keeps the persistent top HUD footprint shallow in representative landscape', () => {
    const viewport = { width: 915, height: 412 }
    const layout = buildHUDLayout(viewport.width, viewport.height)
    const lowestPersistentHudEdge = Math.max(
      layout.companyPanel.top + layout.companyPanel.height,
      layout.orderPanel.top + layout.orderPanel.height,
      layout.acceptButton.top + layout.acceptButton.height,
    )

    expect(lowestPersistentHudEdge / viewport.height).toBeLessThan(0.32)
    expect(layout.orderPanel.width).toBeLessThanOrEqual(240)
  })

  it('keeps portrait controls consolidated at the top instead of scattering them down the screen', () => {
    const viewport = { width: 360, height: 640 }
    const topBar = buildGameWorldTopBarLayout(viewport.width, viewport.height)
    const layout = buildHUDLayout(viewport.width, viewport.height)
    const controls = buildCameraControlButtons(viewport.width, viewport.height)

    expect(topBar.menuToggle.top).toBeLessThan(viewport.height * 0.1)
    controls.forEach(({ bounds }) => {
      expect(bounds.top).toBe(topBar.menuToggle.top)
      expect(bounds.top + bounds.height).toBeLessThan(viewport.height * 0.12)
    })
    expect(layout.acceptButton.top + layout.acceptButton.height).toBeLessThan(viewport.height * 0.2)
  })
})
