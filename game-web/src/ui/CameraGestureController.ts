import {
  normalizeCameraRotation,
  rotationFromTwist,
  shouldPanCamera,
  touchAngle,
  touchCentroid,
  touchDistance,
  zoomFromPinch,
  type TouchPoint,
} from './cameraControls'

export interface CameraGestureCallbacks {
  getZoom: () => number
  setZoom: (zoom: number, focalPoint: TouchPoint) => void
  getRotation: () => number
  setRotation: (rotation: number) => void
  panByScreenDelta: (dx: number, dy: number) => void
  onManualCameraControl: () => void
}

interface PointerState extends TouchPoint {
  id: number
}

/**
 * Browser-pointer gesture adapter kept separate from game/domain state.
 *
 * One-pointer drag pans the map once cumulative movement crosses the threshold.
 * Two pointers combine centroid pan + pinch zoom + twist rotation.
 * The controller exposes whether the active pointer sequence moved enough to
 * count as a camera gesture so GameWorld can suppress tap-to-move.
 */
export class CameraGestureController {
  private readonly pointers = new Map<number, PointerState>()
  private readonly canvas: HTMLCanvasElement
  private readonly callbacks: CameraGestureCallbacks
  private previousSinglePoint: TouchPoint | null = null
  private singleStartPoint: TouchPoint | null = null
  private previousCentroid: TouchPoint | null = null
  private previousDistance = 0
  private previousAngle = 0
  private sequenceMoved = false
  private attached = false

  private readonly handlePointerDown = (event: PointerEvent): void => {
    if (this.pointers.size === 0) {
      this.sequenceMoved = false
      this.singleStartPoint = { x: event.clientX, y: event.clientY }
    }

    this.pointers.set(event.pointerId, {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
    })

    try {
      this.canvas.setPointerCapture(event.pointerId)
    } catch {
      // Pointer capture is a progressive enhancement; gesture tracking still works.
    }

    this.rebaseline()
  }

  private readonly handlePointerMove = (event: PointerEvent): void => {
    const existing = this.pointers.get(event.pointerId)
    if (!existing) {
      return
    }

    const next: PointerState = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
    }
    this.pointers.set(event.pointerId, next)

    const active = [...this.pointers.values()]
    if (active.length === 1) {
      const previous = this.previousSinglePoint
      if (previous) {
        const dx = next.x - previous.x
        const dy = next.y - previous.y
        const cumulativeDistance = this.singleStartPoint
          ? Math.hypot(next.x - this.singleStartPoint.x, next.y - this.singleStartPoint.y)
          : Math.hypot(dx, dy)
        if (this.sequenceMoved || shouldPanCamera(cumulativeDistance)) {
          this.sequenceMoved = true
          this.callbacks.onManualCameraControl()
          this.callbacks.panByScreenDelta(dx, dy)
        }
      }
      this.previousSinglePoint = { x: next.x, y: next.y }
      return
    }

    if (active.length >= 2) {
      const first = active[0]
      const second = active[1]
      const centroid = touchCentroid(first, second)
      const distance = touchDistance(first, second)
      const angle = touchAngle(first, second)

      if (this.previousCentroid) {
        const dx = centroid.x - this.previousCentroid.x
        const dy = centroid.y - this.previousCentroid.y
        if (Math.hypot(dx, dy) > 0) {
          this.callbacks.onManualCameraControl()
          this.callbacks.panByScreenDelta(dx, dy)
        }
      }

      if (this.previousDistance > 0 && distance > 0) {
        const currentZoom = this.callbacks.getZoom()
        const nextZoom = zoomFromPinch(currentZoom, this.previousDistance, distance)
        if (nextZoom !== currentZoom) {
          this.callbacks.onManualCameraControl()
          this.callbacks.setZoom(nextZoom, centroid)
        }
      }

      const currentRotation = this.callbacks.getRotation()
      const nextRotation = rotationFromTwist(currentRotation, this.previousAngle, angle)
      if (Math.abs(normalizeCameraRotation(nextRotation - currentRotation)) > 0.001) {
        this.callbacks.onManualCameraControl()
        this.callbacks.setRotation(nextRotation)
      }

      this.sequenceMoved = true
      this.singleStartPoint = null
      this.previousCentroid = centroid
      this.previousDistance = distance
      this.previousAngle = angle
      this.previousSinglePoint = null
    }
  }

  private readonly handlePointerUp = (event: PointerEvent): void => {
    this.pointers.delete(event.pointerId)
    try {
      this.canvas.releasePointerCapture(event.pointerId)
    } catch {
      // Safe fallback for browsers that already released capture.
    }
    this.rebaseline()
  }

  private readonly handlePointerCancel = (event: PointerEvent): void => {
    this.pointers.delete(event.pointerId)
    this.sequenceMoved = true
    this.singleStartPoint = null
    this.rebaseline()
  }

  constructor(canvas: HTMLCanvasElement, callbacks: CameraGestureCallbacks) {
    this.canvas = canvas
    this.callbacks = callbacks
  }

  attach(): void {
    if (this.attached) {
      return
    }
    this.attached = true
    this.canvas.style.touchAction = 'none'
    this.canvas.addEventListener('pointerdown', this.handlePointerDown)
    this.canvas.addEventListener('pointermove', this.handlePointerMove)
    this.canvas.addEventListener('pointerup', this.handlePointerUp)
    this.canvas.addEventListener('pointercancel', this.handlePointerCancel)
  }

  destroy(): void {
    if (!this.attached) {
      return
    }
    this.attached = false
    this.canvas.removeEventListener('pointerdown', this.handlePointerDown)
    this.canvas.removeEventListener('pointermove', this.handlePointerMove)
    this.canvas.removeEventListener('pointerup', this.handlePointerUp)
    this.canvas.removeEventListener('pointercancel', this.handlePointerCancel)
    this.pointers.clear()
    this.previousSinglePoint = null
    this.singleStartPoint = null
    this.previousCentroid = null
  }

  didCameraGestureMove(): boolean {
    return this.sequenceMoved
  }

  private rebaseline(): void {
    const active = [...this.pointers.values()]
    if (active.length === 1) {
      this.previousSinglePoint = { x: active[0].x, y: active[0].y }
      if (!this.singleStartPoint) {
        this.singleStartPoint = { x: active[0].x, y: active[0].y }
      }
      this.previousCentroid = null
      this.previousDistance = 0
      this.previousAngle = 0
      return
    }

    if (active.length >= 2) {
      const first = active[0]
      const second = active[1]
      this.previousSinglePoint = null
      this.singleStartPoint = null
      this.previousCentroid = touchCentroid(first, second)
      this.previousDistance = touchDistance(first, second)
      this.previousAngle = touchAngle(first, second)
      return
    }

    this.previousSinglePoint = null
    this.singleStartPoint = null
    this.previousCentroid = null
    this.previousDistance = 0
    this.previousAngle = 0
  }
}
