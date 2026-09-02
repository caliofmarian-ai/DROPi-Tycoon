import {
  buildNavigationButtonBounds,
  MIN_TOUCH_TARGET_PX,
  isCompactLandscape,
} from './mobileViewport'
import { buildGameWorldTopBarLayout } from './gameWorldTopBar'

export interface RectBounds {
  left: number
  top: number
  width: number
  height: number
}

export interface HUDLayout {
  companyPanel: RectBounds
  orderPanel: RectBounds
  acceptButton: RectBounds
  orderTextWidth: number
  companyFontSize: number
  orderFontSize: number
  acceptFontSize: number
}

/** Backward-compatible reference bounds for the historical 800×600 test canvas. */
export const NAV_BUTTON_BOUNDS: ReadonlyArray<RectBounds> = buildNavigationButtonBounds(800, 600)

const right = (rect: RectBounds): number => rect.left + rect.width
const bottom = (rect: RectBounds): number => rect.top + rect.height
const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value))

export const boundsContainPoint = (rect: RectBounds, x: number, y: number): boolean =>
  x >= rect.left && x <= right(rect) && y >= rect.top && y <= bottom(rect)

export const boundsIntersect = (a: RectBounds, b: RectBounds): boolean =>
  a.left < right(b) && right(a) > b.left && a.top < bottom(b) && bottom(a) > b.top

export const isBoundsInsideCanvas = (rect: RectBounds, width: number, height: number): boolean =>
  rect.left >= 0 && rect.top >= 0 && right(rect) <= width && bottom(rect) <= height

/**
 * M-008 owner-review top-dock remediation.
 *
 * Company status, active order and Accept now share one shallow horizontal row
 * directly below the fixed navigation/camera toolbar. Nothing persistent is
 * anchored to the bottom or scattered along the left/right edges of the map.
 */
export const buildHUDLayout = (canvasWidth: number, canvasHeight: number): HUDLayout => {
  const width = Math.max(1, Math.floor(canvasWidth))
  const height = Math.max(1, Math.floor(canvasHeight))
  const topBar = buildGameWorldTopBarLayout(width, height)
  const margin = topBar.menuToggle.left
  const compactLandscape = isCompactLandscape(width, height)
  const gap = 4
  const rightEdge = width - margin
  const rowTop = topBar.hudRowTop
  const rowHeight = topBar.hudRowHeight

  const companyWidth = compactLandscape ? 78 : 72
  const acceptWidth = compactLandscape ? 72 : 68
  const availableOrderWidth = Math.max(
    120,
    width - margin * 2 - companyWidth - acceptWidth - gap * 2,
  )
  const orderWidth = Math.min(compactLandscape ? 240 : 198, availableOrderWidth)

  const acceptButton: RectBounds = {
    left: rightEdge - acceptWidth,
    top: rowTop,
    width: acceptWidth,
    height: rowHeight,
  }
  const orderPanel: RectBounds = {
    left: acceptButton.left - gap - orderWidth,
    top: rowTop,
    width: orderWidth,
    height: rowHeight,
  }
  const companyPanel: RectBounds = {
    left: orderPanel.left - gap - companyWidth,
    top: rowTop,
    width: companyWidth,
    height: rowHeight,
  }

  return {
    companyPanel,
    orderPanel,
    acceptButton,
    orderTextWidth: Math.max(108, orderPanel.width - 12),
    companyFontSize: compactLandscape ? 11 : 10,
    orderFontSize: compactLandscape ? 10 : 10,
    acceptFontSize: 12,
  }
}

/**
 * Keeps transient feedback in the same top interaction zone while avoiding the
 * navbar dropdown on the left. The notification is therefore never a bottom or
 * center-screen obstruction.
 */
export const buildNotificationLayout = (canvasWidth: number, canvasHeight: number): RectBounds => {
  const width = Math.max(1, Math.floor(canvasWidth))
  const height = Math.max(1, Math.floor(canvasHeight))
  const topBar = buildGameWorldTopBarLayout(width, height)
  const margin = topBar.menuToggle.left
  const dropdownRight = right(topBar.dropdownItems[0])
  const notifHeight = MIN_TOUCH_TARGET_PX
  const availableRightWidth = Math.max(
    MIN_TOUCH_TARGET_PX,
    width - margin - (dropdownRight + margin),
  )
  const notifWidth = clamp(
    Math.min(Math.floor(width * 0.46), availableRightWidth),
    MIN_TOUCH_TARGET_PX,
    Math.min(320, availableRightWidth),
  )

  return {
    left: width - margin - notifWidth,
    top: topBar.dropdownItems[0].top,
    width: notifWidth,
    height: notifHeight,
  }
}
