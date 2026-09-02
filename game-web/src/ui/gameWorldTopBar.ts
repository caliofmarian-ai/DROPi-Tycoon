import {
  normalizeViewport,
  viewportEdgeInset,
  type LayoutRect,
} from './mobileViewport'

/**
 * M-008 owner-review implementation details for the fixed GameWorld top dock.
 * These values are deliberately not gameplay canon and can be tuned later.
 */
export const GAMEWORLD_TOP_BAR_GAP_PX = 3
export const GAMEWORLD_TOP_BAR_TOUCH_TARGET_PX = 40
export const GAMEWORLD_TOP_BAR_VISUAL_BUTTON_PX = 28
export const GAMEWORLD_STATUS_ROW_HEIGHT_PX = 28

export interface GameWorldTopBarLayout {
  controlBar: LayoutRect
  menuToggle: LayoutRect
  dropdownItems: readonly [LayoutRect, LayoutRect]
  hudRowTop: number
  hudRowHeight: number
  worldViewportTop: number
}

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value))

/**
 * Consolidates persistent GameWorld controls into a compact reserved top dock.
 *
 * Row 1 is the fixed navigation/camera toolbar. Row 2 is a shallow, non-interactive
 * status strip. The world camera begins below `worldViewportTop`, so persistent UI
 * never covers the explorable map. Main Menu and Company remain hidden in a dropdown.
 */
export const buildGameWorldTopBarLayout = (
  width: number,
  height: number,
): GameWorldTopBarLayout => {
  const viewport = normalizeViewport(width, height)
  const edge = clamp(viewportEdgeInset(viewport.width, viewport.height), 4, 6)
  const controlSize = GAMEWORLD_TOP_BAR_TOUCH_TARGET_PX
  const controlBarHeight = edge * 2 + controlSize
  const hudRowTop = controlBarHeight + 2
  const hudRowHeight = GAMEWORLD_STATUS_ROW_HEIGHT_PX
  const worldViewportTop = hudRowTop + hudRowHeight + 2
  const dropdownTop = worldViewportTop + GAMEWORLD_TOP_BAR_GAP_PX
  const dropdownWidth = clamp(Math.round(viewport.width * 0.42), 126, 164)

  const menuToggle: LayoutRect = {
    left: edge,
    top: edge,
    width: controlSize,
    height: controlSize,
  }

  const dropdownItems: readonly [LayoutRect, LayoutRect] = [
    {
      left: edge,
      top: dropdownTop,
      width: dropdownWidth,
      height: GAMEWORLD_TOP_BAR_TOUCH_TARGET_PX,
    },
    {
      left: edge,
      top: dropdownTop + GAMEWORLD_TOP_BAR_TOUCH_TARGET_PX + GAMEWORLD_TOP_BAR_GAP_PX,
      width: dropdownWidth,
      height: GAMEWORLD_TOP_BAR_TOUCH_TARGET_PX,
    },
  ]

  return {
    controlBar: {
      left: 0,
      top: 0,
      width: viewport.width,
      height: controlBarHeight,
    },
    menuToggle,
    dropdownItems,
    hudRowTop,
    hudRowHeight,
    worldViewportTop,
  }
}
