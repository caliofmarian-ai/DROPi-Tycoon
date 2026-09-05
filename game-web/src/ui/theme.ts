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
  backgroundTop: 0x07518a,
  backgroundBottom: 0x041c38,
  surface: 0x073354,
  surfaceRaised: 0x0b4972,
  surfaceBorder: 0x287dab,

  // Bright sky blue / cyan interaction accents.
  accent: 0x55dfff,
  accentStrong: 0x009ee8,
  accentSoft: 0x125486,

  // Green success/active states.
  success: 0x22c55e,
  successStrong: 0x15803d,

  // Gold economic/reward accents.
  gold: 0xf6c445,
  goldStrong: 0xb45309,

  // Danger / exit treatment.
  danger: 0xef4444,
  dangerStrong: 0x991b1b,
  review: 0xb695ff,

  textPrimary: '#f8fafc',
  textSecondary: '#c7d6ec',
  textMuted: '#8ba3c4',
  textGold: '#fde68a',
  textDanger: '#fecaca',
  textSuccess: '#bbf7d0',
} as const

/** Original, code-drawn city art shares the same warm daylight palette. */
export const CITY_COLORS = {
  grass: 0x80c95b,
  lawn: 0xa7df72,
  grassShade: 0x59aa53,
  road: 0x4b657e,
  roadEdge: 0x344e69,
  lane: 0xfff4ce,
  sidewalk: 0xf4dfb4,
  pavingLine: 0xd5ba90,
  curb: 0xfff5da,
  shadow: 0x123d55,
  water: 0x23bce0,
  waterLight: 0x85ebf5,
  leafDark: 0x247c48,
  leaf: 0x42aa4c,
  leafLight: 0x8fce45,
  leafSun: 0xc8e864,
  trunk: 0x855037,
  cream: 0xffedc5,
  wall: 0xf8ce92,
  wallShade: 0xe4a86b,
  roof: 0xe56848,
  roofShade: 0xba493b,
  roofBlue: 0x258acb,
  glass: 0x57d4e2,
  glassShade: 0x167ca7,
  windowLight: 0xffe98c,
  flower: 0xff8f6b,
  flowerPink: 0xf370b8,
  metal: 0x175574,
  parcel: 0xe6a644,
  tape: 0xffe1a0,
  skin: 0xf4c69b,
  skinShade: 0xd99568,
  hair: 0x493b36,
} as const

export const TYPOGRAPHY = { family: 'Arial, sans-serif', caption: 12, body: 16, title: 24, brand: 28 } as const
export const RADII = { small: 8, panel: 16, button: 14 } as const

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
