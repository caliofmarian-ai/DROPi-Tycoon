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

/**
 * Runtime art-direction contract for Owner quality gates #317 / #327.
 * Approved reference boards are design targets only; gameplay remains real,
 * interactive geometry rendered by the authoritative Phaser runtime.
 */
export const CITY_ART_DIRECTION = {
  version: 2,
  referenceFamily: '08_Assets/Approved_References',
  identity: 'dropi-blue-cyan-warm-daylight',
  principles: {
    dropiBlueCyanIdentity: true,
    warmArchitecturalHighlights: true,
    coolDimensionalShadows: true,
    saturatedFoliage: true,
    warmReadableStreetSurfaces: true,
  },
} as const

/**
 * Code-drawn city art palette aligned to the approved gameplay references.
 * The cooler blue/cyan structural tones and warmer stone/facade highlights
 * deliberately replace the flatter prototype palette without changing
 * geometry, collision, locality identity or gameplay authority.
 */
export const CITY_COLORS = {
  grass: 0x73c867,
  lawn: 0xa8df78,
  grassShade: 0x3f9854,
  road: 0x355b72,
  roadEdge: 0x173b57,
  lane: 0xffeab7,
  sidewalk: 0xf2d7a8,
  pavingLine: 0xc9a979,
  curb: 0xffefcc,
  shadow: 0x0d3148,
  water: 0x00b4df,
  waterLight: 0x80ebff,
  leafDark: 0x1d7549,
  leaf: 0x36a955,
  leafLight: 0x78c957,
  leafSun: 0xc6e66a,
  trunk: 0x7a4a34,
  cream: 0xffedc8,
  wall: 0xf4c683,
  wallShade: 0xd59357,
  roof: 0xdf6a4c,
  roofShade: 0xa9443e,
  roofBlue: 0x0c92c8,
  glass: 0x5cdded,
  glassShade: 0x0a759d,
  windowLight: 0xffe39c,
  flower: 0xff8f6b,
  flowerPink: 0xf370b8,
  metal: 0x0f506e,
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
