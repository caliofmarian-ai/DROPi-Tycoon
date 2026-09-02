import {
  MIN_TOUCH_TARGET_PX,
  normalizeViewport,
  viewportEdgeInset,
  type LayoutRect,
} from './mobileViewport'

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

export const buildCameraControlButtons = (
  width: number,
  height: number,
): readonly CameraControlButtonLayout[] => {
  const viewport = normalizeViewport(width, height)
  const edge = viewportEdgeInset(viewport.width, viewport.height)
  const size = MIN_TOUCH_TARGET_PX
  const gap = 7
  const actions: ReadonlyArray<readonly [CameraControlAction, string]> = [
    ['zoom-in', '+'],
    ['zoom-out', '−'],
    ['rotate-left', '↺'],
    ['rotate-right', '↻'],
    ['recenter', '⌖'],
  ]

  const totalHeight = actions.length * size + (actions.length - 1) * gap
  const maxTop = Math.max(edge, viewport.height - edge - totalHeight)
  const preferredTop = Math.round(viewport.height * 0.18)
  const top = clamp(preferredTop, edge, maxTop)
  const left = viewport.width - edge - size

  return actions.map(([action, label], index) => ({
    action,
    label,
    bounds: {
      left,
      top: top + index * (size + gap),
      width: size,
      height: size,
    },
  }))
}
