import { describe, expect, it } from 'vitest'
import {
  capabilityLevelFromLabel,
  COLORS,
  formatMoney,
  SPACING,
  TOUCH_TARGET_MIN_PX,
} from '../src/ui/theme'

describe('Workstream A — DROPi Tycoon product visual system tokens', () => {
  it('exposes a coherent navy/cyan/green/gold token palette instead of ad-hoc colors', () => {
    expect(COLORS.backgroundTop).toBeTypeOf('number')
    expect(COLORS.accent).toBeTypeOf('number')
    expect(COLORS.success).toBeTypeOf('number')
    expect(COLORS.gold).toBeTypeOf('number')
    expect(COLORS.danger).toBeTypeOf('number')
  })

  it('exposes an ordered spacing scale', () => {
    expect(SPACING.xs).toBeLessThan(SPACING.sm)
    expect(SPACING.sm).toBeLessThan(SPACING.md)
    expect(SPACING.md).toBeLessThan(SPACING.lg)
    expect(SPACING.lg).toBeLessThan(SPACING.xl)
  })

  it('keeps the shared touch target floor aligned with mobileViewport canon', () => {
    expect(TOUCH_TARGET_MIN_PX).toBe(48)
  })

  it('formats economic values with thousands separators', () => {
    expect(formatMoney(0)).toBe('$0')
    expect(formatMoney(1240)).toBe('$1,240')
    expect(formatMoney(1234567)).toBe('$1,234,567')
  })

  it('maps capability labels to a 1-3 bar level for visual bars instead of raw text only', () => {
    expect(capabilityLevelFromLabel('Low')).toBe(1)
    expect(capabilityLevelFromLabel('Medium')).toBe(2)
    expect(capabilityLevelFromLabel('High')).toBe(3)
  })
})
