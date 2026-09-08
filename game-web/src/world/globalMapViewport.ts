export interface GlobalMapViewportRect {
  left: number
  top: number
  width: number
  height: number
}

const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value))

export const GLOBAL_MAP_WIDTH = 1440
export const GLOBAL_MAP_HEIGHT = 720

export const globalMapViewport = (width: number, height: number): GlobalMapViewportRect => {
  const sideWidth = clamp(Math.round(width * 0.27), 228, 316)
  return {
    left: 12,
    top: 62,
    width: Math.max(240, width - sideWidth - 36),
    height: Math.max(160, height - 74),
  }
}

export const fitGlobalMapScale = (
  viewport: GlobalMapViewportRect,
  mapWidth = GLOBAL_MAP_WIDTH,
  mapHeight = GLOBAL_MAP_HEIGHT,
): number => Math.min(viewport.width / mapWidth, viewport.height / mapHeight)
