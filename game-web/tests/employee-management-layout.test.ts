import { describe, expect, it } from 'vitest'
import { buildEmployeeManagementLayout } from '../src/ui/employeeManagementLayout'
import {
  MIN_TOUCH_TARGET_PX,
  rectInsideViewport,
  SUPPORTED_ANDROID_VIEWPORTS,
} from '../src/ui/mobileViewport'

describe('RBATCH-018 — employee management mobile layout', () => {
  it.each(SUPPORTED_ANDROID_VIEWPORTS)(
    'keeps employee controls inside $width x $height',
    ({ width, height }) => {
      const layout = buildEmployeeManagementLayout(width, height)

      expect(rectInsideViewport(layout.panel, width, height)).toBe(true)
      expect(rectInsideViewport(layout.actionButton, width, height)).toBe(true)
      expect(rectInsideViewport(layout.returnButton, width, height)).toBe(true)
      expect(rectInsideViewport(layout.menuButton, width, height)).toBe(true)
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

  it('does not encode one permanent orientation as canon', () => {
    expect(buildEmployeeManagementLayout(360, 800).compactLandscape).toBe(false)
    expect(buildEmployeeManagementLayout(800, 360).compactLandscape).toBe(true)
  })
})
