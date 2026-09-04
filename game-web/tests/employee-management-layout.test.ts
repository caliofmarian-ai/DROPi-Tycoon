import { describe, expect, it } from 'vitest'
import { buildEmployeeManagementLayout } from '../src/ui/employeeManagementLayout'
import {
  MIN_TOUCH_TARGET_PX,
  rectInsideViewport,
  SUPPORTED_ANDROID_VIEWPORTS,
  type LayoutRect,
} from '../src/ui/mobileViewport'

const rectInsideRect = (inner: LayoutRect, outer: LayoutRect): boolean =>
  inner.left >= outer.left &&
  inner.top >= outer.top &&
  inner.left + inner.width <= outer.left + outer.width &&
  inner.top + inner.height <= outer.top + outer.height

describe('RBATCH-018 / Product Experience — employee management mobile layout', () => {
  it.each(SUPPORTED_ANDROID_VIEWPORTS)(
    'keeps employee controls and identity surfaces inside $width x $height',
    ({ width, height }) => {
      const layout = buildEmployeeManagementLayout(width, height)

      expect(rectInsideViewport(layout.panel, width, height)).toBe(true)
      expect(rectInsideViewport(layout.avatar, width, height)).toBe(true)
      expect(rectInsideViewport(layout.statusChip, width, height)).toBe(true)
      expect(rectInsideViewport(layout.actionButton, width, height)).toBe(true)
      expect(rectInsideViewport(layout.returnButton, width, height)).toBe(true)
      expect(rectInsideViewport(layout.menuButton, width, height)).toBe(true)
      expect(rectInsideRect(layout.avatar, layout.panel)).toBe(true)
      expect(rectInsideRect(layout.statusChip, layout.panel)).toBe(true)
    },
  )

  it.each(SUPPORTED_ANDROID_VIEWPORTS)(
    'keeps touch actions comfortable on $width x $height',
    ({ width, height }) => {
      const layout = buildEmployeeManagementLayout(width, height)
      for (const rect of [layout.actionButton, layout.returnButton, layout.menuButton]) {
        expect(rect.width).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET_PX)
        expect(rect.height).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET_PX)
      }
    },
  )

  it('uses a compact content-driven portrait card instead of filling the screen', () => {
    const layout = buildEmployeeManagementLayout(360, 800)
    expect(layout.compactLandscape).toBe(false)
    expect(layout.panel.height).toBeLessThan(800 * 0.55)
    expect(layout.avatar.width).toBeGreaterThanOrEqual(82)
    expect(layout.summary.wrapWidth).toBeLessThanOrEqual(360)
  })

  it('uses the available width in compact landscape while keeping a separate navigation column', () => {
    const layout = buildEmployeeManagementLayout(800, 360)
    expect(layout.compactLandscape).toBe(true)
    expect(layout.panel.width).toBeGreaterThan(400)
    expect(layout.menuButton.left).toBeGreaterThan(layout.panel.left + layout.panel.width)
  })

  it('does not encode one permanent orientation as canon', () => {
    expect(buildEmployeeManagementLayout(360, 800).compactLandscape).toBe(false)
    expect(buildEmployeeManagementLayout(800, 360).compactLandscape).toBe(true)
  })
})
