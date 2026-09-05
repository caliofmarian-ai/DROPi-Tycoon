import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { buildManagementLayout, buildStaffCardLayout } from '../src/ui/managementLayout'
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
      const shell = buildManagementLayout(width, height, true)
      const layout = buildStaffCardLayout(shell.body)

      expect(rectInsideViewport(layout.panel, width, height)).toBe(true)
      expect(rectInsideViewport(layout.avatar, width, height)).toBe(true)
      expect(rectInsideViewport(layout.identity, width, height)).toBe(true)
      expect(rectInsideViewport(layout.action, width, height)).toBe(true)
      for (const nav of shell.navigation) expect(rectInsideViewport(nav, width, height)).toBe(true)
      expect(rectInsideRect(layout.avatar, layout.panel)).toBe(true)
      expect(rectInsideRect(layout.identity, layout.panel)).toBe(true)
      expect(layout.salary.top + layout.salary.height).toBeLessThan(layout.action.top)
    },
  )

  it.each(SUPPORTED_ANDROID_VIEWPORTS)(
    'keeps touch actions comfortable on $width x $height',
    ({ width, height }) => {
      const shell = buildManagementLayout(width, height, true)
      const layout = buildStaffCardLayout(shell.body)
      for (const rect of [layout.action, ...shell.navigation]) {
        expect(rect.width).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET_PX)
        expect(rect.height).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET_PX)
      }
    },
  )

  it('uses a compact content-driven portrait card instead of filling the screen', () => {
    const shell = buildManagementLayout(360, 800, true)
    const layout = buildStaffCardLayout(shell.body)
    expect(shell.compactLandscape).toBe(false)
    expect(layout.panel.height).toBeLessThan(800 * 0.55)
    expect(layout.avatar.width).toBeGreaterThanOrEqual(82)
    expect(layout.identity.width).toBeLessThan(360)
  })

  it('uses available landscape width with a separate touch-sized footer', () => {
    const shell = buildManagementLayout(800, 360, true)
    const layout = buildStaffCardLayout(shell.body)
    expect(shell.compactLandscape).toBe(true)
    expect(layout.panel.width).toBeGreaterThan(400)
    expect(shell.footer.top).toBeGreaterThan(layout.panel.top + layout.panel.height)
  })

  it('does not encode one permanent orientation as canon', () => {
    expect(buildManagementLayout(360, 800).compactLandscape).toBe(false)
    expect(buildManagementLayout(800, 360).compactLandscape).toBe(true)
  })
})

describe('Workstream F — EmployeeManagementScene plays hire/onboarding audio cues', () => {
  const employeeManagementSource = readFileSync(
    new URL('../src/scenes/EmployeeManagementScene.ts', import.meta.url),
    'utf8',
  )

  it('imports the shared audio controller', () => {
    expect(employeeManagementSource).toContain("import { getAudioController } from '../systems/audioSystem'")
  })

  it('plays an employee-hired cue on successful hire and negative on failure', () => {
    expect(employeeManagementSource).toContain("getAudioController().play(result.hired ? 'employee-hired' : 'negative')")
  })

  it('plays a positive cue when onboarding completes and negative otherwise', () => {
    expect(employeeManagementSource).toContain("getAudioController().play(result.activated ? 'positive' : 'negative')")
  })
})
