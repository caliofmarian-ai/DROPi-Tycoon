import type { WorldRectLayout } from './legacyCityLayout'
export interface SurfacePoint { x: number; y: number }
export const projectOnSegment = (point: SurfacePoint, a: SurfacePoint, b: SurfacePoint): SurfacePoint => {
  const dx = b.x - a.x, dy = b.y - a.y
  const t = Math.max(0, Math.min(1, ((point.x - a.x) * dx + (point.y - a.y) * dy) / (dx * dx + dy * dy || 1)))
  return { x: a.x + t * dx, y: a.y + t * dy }
}
export const distanceToSegment = (point: SurfacePoint, a: SurfacePoint, b: SurfacePoint): number => {
  const p = projectOnSegment(point, a, b)
  return Math.hypot(point.x - p.x, point.y - p.y)
}
export const surfaceContains = (rect: WorldRectLayout, x: number, y: number, padding = 0): boolean => {
  if (Math.abs(x - rect.x) > rect.width / 2 + padding || Math.abs(y - rect.y) > rect.height / 2 + padding) return false
  if (!rect.centerline) return true
  const distance = (rect.roadWidth ?? 32) / 2 + padding
  return rect.centerline.some((b, i, points) => i > 0 && distanceToSegment({ x, y }, points[i - 1], b) <= distance)
}
