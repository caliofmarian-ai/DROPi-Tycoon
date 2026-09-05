/**
 * DROPi Tycoon product visual system (Owner Quality Gate #317, Workstream A).
 *
 * Pure color/spacing/typography tokens and helpers shared by every visible
 * scene. This module intentionally has no Phaser dependency so it stays
 * trivially unit-testable; Phaser-drawing helpers built on top of these
 * tokens live in themeControls.ts.
 */

export const COLORS = {
  // Deep navy foundation.
  backgroundTop: 0x0a1729,
  backgroundBottom: 0x050b16,
  surface: 0x0f1f36,
  surfaceRaised: 0x142a47,
  surfaceBorder: 0x24405f,

  // Bright sky blue / cyan interaction accents.
  accent: 0x38bdf8,
  accentStrong: 0x0ea5e9,
  accentSoft: 0x1e3a5f,

  // Green success/active states.
  success: 0x22c55e,
  successStrong: 0x15803d,

  // Gold economic/reward accents.
  gold: 0xf6c445,
  goldStrong: 0xb45309,

  // Danger / exit treatment.
  danger: 0xef4444,
  dangerStrong: 0x991b1b,

  textPrimary: '#f8fafc',
  textSecondary: '#c7d6ec',
  textMuted: '#8ba3c4',
  textGold: '#fde68a',
  textDanger: '#fecaca',
  textSuccess: '#bbf7d0',
} as const

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 18,
  xl: 26,
} as const

/** Implementation-level touch comfort floor. See mobileViewport.ts. */
export const TOUCH_TARGET_MIN_PX = 48

export interface RectShape {
  left: number
  top: number
  width: number
  height: number
}

export const rectCenterX = (rect: RectShape): number => rect.left + rect.width / 2
export const rectCenterY = (rect: RectShape): number => rect.top + rect.height / 2

export type PanelTone = 'default' | 'accent' | 'success' | 'gold' | 'danger'

export const panelBorderColor = (tone: PanelTone): number => {
  switch (tone) {
    case 'accent':
      return COLORS.accent
    case 'success':
      return COLORS.success
    case 'gold':
      return COLORS.gold
    case 'danger':
      return COLORS.danger
    default:
      return COLORS.surfaceBorder
  }
}

export type ButtonTone = 'primary' | 'secondary' | 'success' | 'gold' | 'danger'

export interface ButtonPalette {
  fill: number
  fillHover: number
  border: number
  text: string
}

export const buttonPalette = (tone: ButtonTone): ButtonPalette => {
  switch (tone) {
    case 'success':
      return { fill: COLORS.successStrong, fillHover: COLORS.success, border: 0x86efac, text: '#f0fdf4' }
    case 'gold':
      return { fill: COLORS.goldStrong, fillHover: COLORS.gold, border: 0xfcd34d, text: '#fffbeb' }
    case 'danger':
      return { fill: COLORS.dangerStrong, fillHover: COLORS.danger, border: 0xfca5a5, text: '#fef2f2' }
    case 'secondary':
      return { fill: 0x14532d, fillHover: 0x166534, border: 0x99f6e4, text: '#ecfeff' }
    default:
      return { fill: COLORS.accentStrong, fillHover: COLORS.accent, border: 0x93c5fd, text: '#eff6ff' }
  }
}

export type ChipTone = 'accent' | 'success' | 'gold' | 'danger' | 'neutral'

export interface ChipPalette {
  fill: number
  border: number
  text: string
}

export const chipPalette = (tone: ChipTone): ChipPalette => {
  switch (tone) {
    case 'success':
      return { fill: 0x0f2e1c, border: COLORS.success, text: COLORS.textSuccess }
    case 'gold':
      return { fill: 0x2c210a, border: COLORS.gold, text: COLORS.textGold }
    case 'danger':
      return { fill: 0x2c1414, border: COLORS.danger, text: COLORS.textDanger }
    case 'neutral':
      return { fill: 0x1e293b, border: 0x64748b, text: COLORS.textSecondary }
    default:
      return { fill: 0x0c2436, border: COLORS.accent, text: '#dbeafe' }
  }
}

/** Formats an economic value with thousands separators for readable HUD/report text. */
export const formatMoney = (value: number): string => `$${Math.round(value).toLocaleString('en-US')}`

export const capabilityLevelFromLabel = (label: 'Low' | 'Medium' | 'High'): 1 | 2 | 3 =>
  label === 'Low' ? 1 : label === 'Medium' ? 2 : 3
