import { MIN_TOUCH_TARGET_PX, type LayoutRect } from './mobileViewport'
import {
  buildGameWorldTopBarLayout,
  GAMEWORLD_TOP_BAR_GAP_PX,
} from './gameWorldTopBar'

export const CAMERA_MIN_ZOOM = 0.65
export const CAMERA_MAX_ZOOM = 2
export const CAMERA_DEFAULT_ZOOM = 1
export const CAMERA_ZOOM_STEP = 0.15
export const CAMERA_ROTATION_STEP_RADIANS = Math.PI / 12
export const CAMERA_PAN_THRESHOLD_PX = 10

export type CameraControlAction =
  | 'zoom-out'
  | 'zoom-in'
  | 'rotate-left'
  | 'rotate-right'
  | 'recenter'

export interface CameraControlButtonLayout {
  action: CameraControlAction
  label: string
  bounds: LayoutRect
}

export interface TouchPoint {
  x: number
  y: number
}

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value))

export const clampCameraZoom = (zoom: number): number =>
  clamp(Number.isFinite(zoom) ? zoom : CAMERA_DEFAULT_ZOOM, CAMERA_MIN_ZOOM, CAMERA_MAX_ZOOM)

export const zoomByStep = (zoom: number, direction: 'in' | 'out'): number =>
  clampCameraZoom(zoom + (direction === 'in' ? CAMERA_ZOOM_STEP : -CAMERA_ZOOM_STEP))

export const normalizeCameraRotation = (rotation: number): number => {
  if (!Number.isFinite(rotation)) {
    return 0
  }

  const twoPi = Math.PI * 2
  let normalized = rotation % twoPi
  if (normalized >= Math.PI) {
    normalized -= twoPi
  }
  if (normalized < -Math.PI) {
    normalized += twoPi
  }
  return normalized
}

export const rotateByStep = (rotation: number, direction: 'left' | 'right'): number =>
  normalizeCameraRotation(
    rotation + (direction === 'right' ? CAMERA_ROTATION_STEP_RADIANS : -CAMERA_ROTATION_STEP_RADIANS),
  )

export const touchDistance = (a: TouchPoint, b: TouchPoint): number =>
  Math.hypot(b.x - a.x, b.y - a.y)

export const touchAngle = (a: TouchPoint, b: TouchPoint): number =>
  Math.atan2(b.y - a.y, b.x - a.x)

export const touchCentroid = (a: TouchPoint, b: TouchPoint): TouchPoint => ({
  x: (a.x + b.x) / 2,
  y: (a.y + b.y) / 2,
})

export const zoomFromPinch = (
  currentZoom: number,
  previousDistance: number,
  currentDistance: number,
): number => {
  if (
    !Number.isFinite(previousDistance) ||
    !Number.isFinite(currentDistance) ||
    previousDistance <= 0 ||
    currentDistance <= 0
  ) {
    return clampCameraZoom(currentZoom)
  }

  return clampCameraZoom(currentZoom * (currentDistance / previousDistance))
}

export const rotationFromTwist = (
  currentRotation: number,
  previousAngle: number,
  currentAngle: number,
): number => {
  if (!Number.isFinite(previousAngle) || !Number.isFinite(currentAngle)) {
    return normalizeCameraRotation(currentRotation)
  }

  return normalizeCameraRotation(currentRotation + normalizeCameraRotation(currentAngle - previousAngle))
}

export const shouldPanCamera = (distancePx: number): boolean =>
  Number.isFinite(distancePx) && distancePx >= CAMERA_PAN_THRESHOLD_PX

/**
 * M-008 owner-review layout: all explicit camera controls live in one horizontal
 * top toolbar immediately after the navbar toggle. Touch targets remain 48 px;
 * the scene renders a smaller visual button inside each target.
 */
export const buildCameraControlButtons = (
  width: number,
  height: number,
): readonly CameraControlButtonLayout[] => {
  const topBar = buildGameWorldTopBarLayout(width, height)
  const size = MIN_TOUCH_TARGET_PX
  const actions: ReadonlyArray<readonly [CameraControlAction, string]> = [
    ['zoom-in', '+'],
    ['zoom-out', '−'],
    ['rotate-left', '↺'],
    ['rotate-right', '↻'],
    ['recenter', '⌖'],
  ]
  const startLeft =
    topBar.menuToggle.left + topBar.menuToggle.width + GAMEWORLD_TOP_BAR_GAP_PX

  return actions.map(([action, label], index) => ({
    action,
    label,
    bounds: {
      left: startLeft + index * (size + GAMEWORLD_TOP_BAR_GAP_PX),
      top: topBar.menuToggle.top,
      width: size,
      height: size,
    },
  }))
}
