import { clampCameraZoom, touchDistance, zoomByStep, zoomFromPinch, type TouchPoint } from './cameraControls'

/** Only world-owned fingers participate; controls never become pinch anchors. */
export class UrbanZoomGesture {
  private readonly pointers = new Map<number, TouchPoint>()
  private distance = 0

  press(id: number, point: TouchPoint): void {
    if (this.pointers.size >= 2 || !Number.isFinite(point.x) || !Number.isFinite(point.y)) return
    this.pointers.set(id, { x: point.x, y: point.y })
    this.rebase()
  }

  move(id: number, point: TouchPoint, zoom: number): number {
    const previous = this.pointers.get(id)
    if (!previous || !Number.isFinite(point.x) || !Number.isFinite(point.y)) return clampCameraZoom(zoom)
    previous.x = point.x
    previous.y = point.y
    const oldDistance = this.distance
    this.rebase()
    return this.distance >= 24 && oldDistance >= 24
      ? zoomFromPinch(zoom, oldDistance, this.distance)
      : clampCameraZoom(zoom)
  }

  release(id: number): void { this.pointers.delete(id); this.rebase() }
  clear(): void { this.pointers.clear(); this.distance = 0 }
  isPinching(): boolean { return this.pointers.size === 2 }

  private rebase(): void {
    if (this.pointers.size !== 2) { this.distance = 0; return }
    const iterator = this.pointers.values()
    this.distance = touchDistance(iterator.next().value!, iterator.next().value!)
  }
}

export const urbanZoomStep = (zoom: number, direction: 'in' | 'out'): number => zoomByStep(zoom, direction)
