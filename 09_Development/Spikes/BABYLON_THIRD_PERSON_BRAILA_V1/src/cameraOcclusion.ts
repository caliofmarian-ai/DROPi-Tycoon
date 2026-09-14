export type CameraPoint = { x: number; y: number; z: number }
export type CameraBox = { id: string; min: CameraPoint; max: CameraPoint }
export type BoomResult = { radius: number; blocker: string | null; status: 'CLEAR' | 'SHORTENED' | 'TARGET_BLOCKED' }

const finitePoint = (point: CameraPoint): boolean => [point.x, point.y, point.z].every(Number.isFinite)
export const insideCameraBox = (point: CameraPoint, box: CameraBox, padding = 0): boolean =>
  point.x >= box.min.x - padding && point.x <= box.max.x + padding &&
  point.y >= box.min.y - padding && point.y <= box.max.y + padding &&
  point.z >= box.min.z - padding && point.z <= box.max.z + padding

/** Slab intersection of the full focus-to-eye segment, not just its endpoint. */
export const cameraBoxEntry = (origin: CameraPoint, direction: CameraPoint, radius: number, box: CameraBox, padding = .20): number | null => {
  if (!finitePoint(origin) || !finitePoint(direction) || !finitePoint(box.min) || !finitePoint(box.max) || !Number.isFinite(radius) || radius <= 0 || !Number.isFinite(padding) || padding < 0) throw new Error('Invalid camera collision geometry')
  let near = 0, far = radius
  for (const axis of ['x', 'y', 'z'] as const) {
    if (box.min[axis] > box.max[axis]) throw new Error('Inverted camera blocker bounds')
    const low = box.min[axis] - padding, high = box.max[axis] + padding
    if (Math.abs(direction[axis]) < 1e-9) {
      if (origin[axis] < low || origin[axis] > high) return null
      continue
    }
    let start = (low - origin[axis]) / direction[axis], end = (high - origin[axis]) / direction[axis]
    if (start > end) [start, end] = [end, start]
    near = Math.max(near, start); far = Math.min(far, end)
    if (near > far) return null
  }
  return far >= 0 && near <= radius ? Math.max(0, near) : null
}

/** ArcRotate's default +Y-up spherical frame. Player yaw/pitch are unchanged. */
export const cameraBoomDirection = (alpha: number, beta: number): CameraPoint => {
  if (![alpha, beta].every(Number.isFinite)) throw new Error('Non-finite camera angle')
  return { x: Math.cos(alpha) * Math.sin(beta), y: Math.cos(beta), z: Math.sin(alpha) * Math.sin(beta) }
}
export const resolveCameraBoom = (origin: CameraPoint, direction: CameraPoint, requestedRadius: number, boxes: CameraBox[], padding = .20): BoomResult => {
  if (!finitePoint(direction) || Math.abs(Math.hypot(direction.x, direction.y, direction.z) - 1) > .001) throw new Error('Camera boom direction must be a unit vector')
  if (!Number.isFinite(requestedRadius) || requestedRadius <= 0) throw new Error('Invalid requested camera radius')
  let radius = requestedRadius, blocker: string | null = null
  for (const box of boxes) {
    const entry = cameraBoxEntry(origin, direction, requestedRadius, box, padding)
    if (entry === null) continue
    if (entry <= .04) return { radius: .01, blocker: box.id, status: 'TARGET_BLOCKED' }
    if (entry - .035 < radius) { radius = entry - .035; blocker = box.id }
  }
  return { radius, blocker, status: blocker === null ? 'CLEAR' : 'SHORTENED' }
}

/** Pull inward immediately; recover requested distance slowly without wall pops. */
export const recoverCameraRadius = (current: number, safe: number, dt: number): number => {
  if (![current, safe, dt].every(Number.isFinite) || safe <= 0) throw new Error('Invalid camera recovery input')
  if (safe <= current || current <= 0) return safe
  return Math.min(safe, current + (safe - current) * (1 - Math.exp(-7 * Math.max(0, Math.min(dt, .1)))))
}
