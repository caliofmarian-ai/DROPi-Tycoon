export interface CameraPoint { x: number; y: number }
export interface CameraPanDelta { x: number; y: number; activated: boolean }

const finitePoint = (point: CameraPoint): boolean => Number.isFinite(point.x) && Number.isFinite(point.y)

/**
 * Pointer-owned one-finger free-look gesture. A small threshold prevents accidental camera drift,
 * then every subsequent move returns screen-pixel drag deltas until the same pointer releases.
 */
export class UrbanCameraPan {
  private pointerId: number | null = null
  private start: CameraPoint = { x: 0, y: 0 }
  private last: CameraPoint = { x: 0, y: 0 }
  private active = false

  begin(pointerId: number, point: CameraPoint): void {
    if (this.pointerId !== null || !finitePoint(point)) return
    this.pointerId = pointerId
    this.start = { ...point }
    this.last = { ...point }
    this.active = false
  }

  move(pointerId: number, point: CameraPoint, thresholdPx = 8): CameraPanDelta | null {
    if (this.pointerId !== pointerId || !finitePoint(point)) return null
    const dx = point.x - this.last.x
    const dy = point.y - this.last.y
    this.last = { ...point }
    if (!this.active) {
      const distance = Math.hypot(point.x - this.start.x, point.y - this.start.y)
      if (!Number.isFinite(distance) || distance < Math.max(0, thresholdPx)) return null
      this.active = true
    }
    return { x: dx, y: dy, activated: this.active }
  }

  release(pointerId?: number): void {
    if (pointerId !== undefined && this.pointerId !== pointerId) return
    this.clear()
  }

  clear(): void {
    this.pointerId = null
    this.active = false
    this.start = { x: 0, y: 0 }
    this.last = { x: 0, y: 0 }
  }

  owns(pointerId: number): boolean { return this.pointerId === pointerId }
  isActive(): boolean { return this.active }
}

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value))

/** Convert a screen drag into a bounded camera scroll change. Dragging right moves the world right. */
export const cameraScrollFromDrag = (
  scroll: CameraPoint,
  drag: CameraPoint,
  zoom: number,
  viewport: { width: number; height: number },
  world: { width: number; height: number },
): CameraPoint => {
  const safeZoom = Number.isFinite(zoom) && zoom > 0 ? zoom : 1
  const viewWidth = Math.max(1, viewport.width / safeZoom)
  const viewHeight = Math.max(1, viewport.height / safeZoom)
  const maxX = Math.max(0, world.width - viewWidth)
  const maxY = Math.max(0, world.height - viewHeight)
  const nextX = scroll.x - (Number.isFinite(drag.x) ? drag.x : 0) / safeZoom
  const nextY = scroll.y - (Number.isFinite(drag.y) ? drag.y : 0) / safeZoom
  return { x: clamp(nextX, 0, maxX), y: clamp(nextY, 0, maxY) }
}
