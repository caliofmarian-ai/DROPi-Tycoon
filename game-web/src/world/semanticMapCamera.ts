import type { MapBounds, MapPoint } from './globalMapTopology'

export const SEMANTIC_MAP_LEVELS = ['World', 'Continent', 'Country', 'Region', 'County', 'City', 'District', 'Area', 'Hero'] as const
export type SemanticMapLevel = typeof SEMANTIC_MAP_LEVELS[number]
export interface MapCamera { x: number; y: number; scale: number }
export interface MapViewport { left: number; top: number; width: number; height: number }
export const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value))

/** Zoom keeps the geographic point under a finger/mouse stationary. */
export const zoomMapCamera = (camera: MapCamera, focal: MapPoint, factor: number, min: number, max: number): MapCamera => {
  if (!Number.isFinite(factor) || factor <= 0 || !Number.isFinite(focal.x + focal.y)) return camera
  const scale = clamp(camera.scale * factor, min, max)
  return { scale, x: focal.x - (focal.x - camera.x) * scale / camera.scale,
    y: focal.y - (focal.y - camera.y) * scale / camera.scale }
}

export const cameraForBounds = (bounds: MapBounds, viewport: MapViewport, padding = 1.25): MapCamera => {
  const scale = Math.min(viewport.width / (Math.max(0.001, bounds.right - bounds.left) * padding),
    viewport.height / (Math.max(0.001, bounds.bottom - bounds.top) * padding))
  return { scale, x: viewport.left + viewport.width / 2 - (bounds.left + bounds.right) / 2 * scale,
    y: viewport.top + viewport.height / 2 - (bounds.top + bounds.bottom) / 2 * scale }
}

export const visibleMapBounds = (camera: MapCamera, viewport: MapViewport): MapBounds => ({
  left: (viewport.left - camera.x) / camera.scale, top: (viewport.top - camera.y) / camera.scale,
  right: (viewport.left + viewport.width - camera.x) / camera.scale,
  bottom: (viewport.top + viewport.height - camera.y) / camera.scale,
})

export const boundsOverlap = (a: MapBounds, b: MapBounds): boolean =>
  a.left <= b.right && a.right >= b.left && a.top <= b.bottom && a.bottom >= b.top

/** The local city camera uses the same scale vocabulary; the current viewport determines full-city fit. */
export const cityFitZoom = (width: number, height: number, cityWidth: number, cityHeight: number): number =>
  Math.min(Math.max(120, width - 220) / cityWidth, Math.max(120, height - 100) / cityHeight) * 0.94
export const cityScaleLevel = (zoom: number, fit: number): SemanticMapLevel =>
  zoom <= fit * 1.3 ? 'City' : zoom < 0.35 ? 'District' : zoom < 0.85 ? 'Area' : 'Hero'

/** Screen-space label collision, shared by geographic and city labels. */
export const reserveLabel = (occupied: MapBounds[], box: MapBounds, viewport: MapViewport): boolean => {
  if (box.left < viewport.left || box.top < viewport.top || box.right > viewport.left + viewport.width ||
      box.bottom > viewport.top + viewport.height || occupied.some(other => boundsOverlap(other, box))) return false
  occupied.push(box)
  return true
}
