import type { UrbanFacing } from './urbanWorld'

/**
 * DT-01 Hero-scale street camera contract.
 *
 * This intentionally stays inside the current Phaser 2D/2.5D runtime. It improves the player's
 * embodied street framing but must never be represented as a perspective-correct 3D renderer.
 */
export const HERO_STREET_CAMERA_VERSION = 1
export const HERO_STREET_TARGET_ZOOM = 1.6
export const HERO_STREET_MIN_ZOOM = 1.25
export const HERO_STREET_MAX_LOOK_AHEAD_PX = 132
export const HERO_STREET_MIN_LOOK_AHEAD_PX = 76

export interface HeroStreetCameraFraming {
  zoom: number
  offsetX: number
  offsetY: number
  lookAheadScreenPx: number
}

const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value))

/**
 * Phaser subtracts followOffset from the target position. Positive Y therefore moves the camera
 * centre above an upward-facing hero, placing the hero lower on screen and revealing more street
 * ahead. The same rule is applied to all four cardinal facings.
 */
export const heroStreetCameraFraming = (
  viewportWidth: number,
  viewportHeight: number,
  facing: UrbanFacing,
  requestedZoom = HERO_STREET_TARGET_ZOOM,
): HeroStreetCameraFraming => {
  const width = Number.isFinite(viewportWidth) && viewportWidth > 0 ? viewportWidth : 960
  const height = Number.isFinite(viewportHeight) && viewportHeight > 0 ? viewportHeight : 540
  const zoom = Math.max(HERO_STREET_MIN_ZOOM,
    Number.isFinite(requestedZoom) && requestedZoom > 0 ? requestedZoom : HERO_STREET_TARGET_ZOOM)
  const lookAheadScreenPx = clamp(
    Math.min(width, height) * 0.18,
    HERO_STREET_MIN_LOOK_AHEAD_PX,
    HERO_STREET_MAX_LOOK_AHEAD_PX,
  )
  const worldOffset = lookAheadScreenPx / zoom

  if (facing === 'up') return { zoom, offsetX: 0, offsetY: worldOffset, lookAheadScreenPx }
  if (facing === 'down') return { zoom, offsetX: 0, offsetY: -worldOffset, lookAheadScreenPx }
  if (facing === 'left') return { zoom, offsetX: worldOffset, offsetY: 0, lookAheadScreenPx }
  return { zoom, offsetX: -worldOffset, offsetY: 0, lookAheadScreenPx }
}

export const heroStreetCharacterScreenHeight = (
  sourceCellHeight: number,
  zoom = HERO_STREET_TARGET_ZOOM,
): number => Math.max(0, sourceCellHeight) * Math.max(HERO_STREET_MIN_ZOOM, zoom)
