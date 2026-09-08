import { clampCameraZoom, touchDistance, zoomByStep, type TouchPoint } from './cameraControls'

/** Only world-owned fingers participate; controls never become pinch anchors. */
export class UrbanZoomGesture {
  private readonly pointers = new Map<number, TouchPoint>()
  private distance = 0
  private readonly clampZoom: (zoom: number) => number
  constructor(clampZoom: (zoom: number) => number = clampCameraZoom) { this.clampZoom = clampZoom }

  press(id: number, point: TouchPoint): void {
    if (this.pointers.size >= 2 || !Number.isFinite(point.x) || !Number.isFinite(point.y)) return
    this.pointers.set(id, { x: point.x, y: point.y })
    this.rebase()
  }

  move(id: number, point: TouchPoint, zoom: number): number {
    const previous = this.pointers.get(id)
    if (!previous || !Number.isFinite(point.x) || !Number.isFinite(point.y)) return this.clampZoom(zoom)
    previous.x = point.x
    previous.y = point.y
    const oldDistance = this.distance
    this.rebase()
    return this.distance >= 24 && oldDistance >= 24
      ? this.clampZoom(zoom * this.distance / oldDistance)
      : this.clampZoom(zoom)
  }

  release(id: number): void { this.pointers.delete(id); this.rebase() }
  clear(): void { this.pointers.clear(); this.distance = 0 }
  isPinching(): boolean { return this.pointers.size === 2 }
  owns(id: number): boolean { return this.pointers.has(id) }
  pointerCount(): number { return this.pointers.size }

  center(): TouchPoint | undefined {
    const points = [...this.pointers.values()]
    return points.length === 2 ? { x: (points[0].x + points[1].x) / 2, y: (points[0].y + points[1].y) / 2 } : undefined
  }

  private rebase(): void {
    if (this.pointers.size !== 2) { this.distance = 0; return }
    const iterator = this.pointers.values()
    this.distance = touchDistance(iterator.next().value!, iterator.next().value!)
  }
}

export const urbanZoomStep = (zoom: number, direction: 'in' | 'out'): number => zoomByStep(zoom, direction)
