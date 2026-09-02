import { describe, expect, it } from 'vitest'
import { buildHUDLayout, boundsIntersect } from '../src/ui/hudLayout'

describe('M-008 Android owner-review HUD acceptance', () => {
  it('keeps the landscape map center clear enough for exploration', () => {
    const viewport = { width: 915, height: 412 }
    const layout = buildHUDLayout(viewport.width, viewport.height)
    const centerBand = {
      left: viewport.width * 0.32,
      top: viewport.height * 0.24,
      width: viewport.width * 0.36,
      height: viewport.height * 0.52,
    }

    expect(boundsIntersect(layout.orderPanel, centerBand)).toBe(false)
    expect(boundsIntersect(layout.companyPanel, centerBand)).toBe(false)
  })

  it('limits persistent HUD coverage on the representative landscape viewport', () => {
    const viewportArea = 915 * 412
    const layout = buildHUDLayout(915, 412)
    const persistentArea =
      layout.companyPanel.width * layout.companyPanel.height +
      layout.orderPanel.width * layout.orderPanel.height

    expect(persistentArea / viewportArea).toBeLessThan(0.13)
  })
})
