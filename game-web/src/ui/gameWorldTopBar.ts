import {
  MIN_TOUCH_TARGET_PX,
  normalizeViewport,
  viewportEdgeInset,
  type LayoutRect,
} from './mobileViewport'

/**
 * M-008 owner-review implementation details for the fixed GameWorld top dock.
 * These values are deliberately not gameplay canon and can be tuned later.
 */
export const GAMEWORLD_TOP_BAR_GAP_PX = 4
export const GAMEWORLD_TOP_BAR_VISUAL_BUTTON_PX = 38

export interface GameWorldTopBarLayout {
  controlBar: LayoutRect
  menuToggle: LayoutRect
  dropdownItems: readonly [LayoutRect, LayoutRect]
  hudRowTop: number
  hudRowHeight: number
}

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value))

/**
 * Consolidates persistent GameWorld controls at the top of the screen.
 *
 * Row 1 is the fixed navigation/camera toolbar. Row 2 is reserved for the
 * compact company/order/Accept HUD. The Main Menu and Company destinations are
 * hidden by default and appear as a dropdown below the top dock.
 */
export const buildGameWorldTopBarLayout = (
  width: number,
  height: number,
): GameWorldTopBarLayout => {
  const viewport = normalizeViewport(width, height)
  const edge = clamp(viewportEdgeInset(viewport.width, viewport.height), 6, 8)
  const controlSize = MIN_TOUCH_TARGET_PX
  const controlBarHeight = edge * 2 + controlSize
  const hudRowTop = controlBarHeight + GAMEWORLD_TOP_BAR_GAP_PX
  const hudRowHeight = MIN_TOUCH_TARGET_PX
  const dropdownTop = hudRowTop + hudRowHeight + GAMEWORLD_TOP_BAR_GAP_PX
  const dropdownWidth = clamp(Math.round(viewport.width * 0.42), 132, 168)

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
      height: MIN_TOUCH_TARGET_PX,
    },
    {
      left: edge,
      top: dropdownTop + MIN_TOUCH_TARGET_PX + GAMEWORLD_TOP_BAR_GAP_PX,
      width: dropdownWidth,
      height: MIN_TOUCH_TARGET_PX,
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
  }
}
