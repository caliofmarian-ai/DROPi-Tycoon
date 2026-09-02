import {
  buildNavigationButtonBounds,
  MIN_TOUCH_TARGET_PX,
  isCompactLandscape,
} from './mobileViewport'

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
 * Responsive HUD layout for the playable world.
 *
 * The order panel deliberately avoids the historical full-width layout. On compact
 * landscape phones it occupies only the left side while company status remains in
 * the top-right. On portrait/narrow screens it stays compact and is stacked below
 * company status so the map remains visible.
 */
export const buildHUDLayout = (canvasWidth: number, canvasHeight: number): HUDLayout => {
  const width = Math.max(1, Math.floor(canvasWidth))
  const height = Math.max(1, Math.floor(canvasHeight))
  const margin = clamp(Math.round(Math.min(width, height) * 0.02), 6, 10)
  const compactLandscape = isCompactLandscape(width, height)

  const companyWidth = compactLandscape
    ? clamp(Math.floor(width * 0.19), 150, 190)
    : clamp(Math.floor(width * 0.42), 145, 200)
  const companyHeight = compactLandscape ? 50 : 54
  const companyPanel: RectBounds = {
    left: Math.max(margin, width - companyWidth - margin),
    top: margin,
    width: Math.min(companyWidth, width - margin * 2),
    height: companyHeight,
  }

  const availableLeftWidth = Math.max(
    MIN_TOUCH_TARGET_PX,
    companyPanel.left - margin * 2,
  )
  const portraitOrderWidth = Math.min(330, width - margin * 2)
  const landscapeOrderWidth = Math.min(380, availableLeftWidth)
  const orderWidth = compactLandscape ? landscapeOrderWidth : portraitOrderWidth
  const orderHeight = compactLandscape ? 88 : 98
  const orderPanel: RectBounds = {
    left: margin,
    top: compactLandscape ? margin : companyPanel.top + companyPanel.height + 8,
    width: Math.max(MIN_TOUCH_TARGET_PX, orderWidth),
    height: orderHeight,
  }

  const acceptWidth = clamp(
    Math.floor(orderPanel.width * 0.3),
    MIN_TOUCH_TARGET_PX,
    112,
  )
  const acceptHeight = MIN_TOUCH_TARGET_PX
  const acceptButton: RectBounds = {
    left: orderPanel.left + orderPanel.width - acceptWidth - 6,
    top: orderPanel.top + Math.floor((orderPanel.height - acceptHeight) / 2),
    width: acceptWidth,
    height: acceptHeight,
  }

  return {
    companyPanel,
    orderPanel,
    acceptButton,
    orderTextWidth: Math.max(118, orderPanel.width - acceptButton.width - 26),
    companyFontSize: compactLandscape ? 15 : 16,
    orderFontSize: compactLandscape ? 14 : 15,
    acceptFontSize: compactLandscape ? 15 : 16,
  }
}

/**
 * Derives notification panel layout from runtime canvas and HUD dimensions.
 * The notification stays below the order panel and above bottom navigation.
 */
export const buildNotificationLayout = (canvasWidth: number, canvasHeight: number): RectBounds => {
  const width = Math.max(1, Math.floor(canvasWidth))
  const height = Math.max(1, Math.floor(canvasHeight))
  const hud = buildHUDLayout(width, height)
  const navBounds = buildNavigationButtonBounds(width, height)
  const notifHeight = MIN_TOUCH_TARGET_PX
  const margin = 10
  const notifWidth = Math.max(
    MIN_TOUCH_TARGET_PX,
    Math.min(width - 24, Math.floor(width * 0.72), 520),
  )
  const desiredTop = bottom(hud.orderPanel) + margin
  const navTop = Math.min(...navBounds.map((bounds) => bounds.top))
  const latestTop = navTop - margin - notifHeight
  const top = Math.max(hud.orderPanel.top, Math.min(desiredTop, latestTop))
  const cx = Math.floor(width / 2)

  return {
    left: cx - Math.floor(notifWidth / 2),
    top,
    width: notifWidth,
    height: notifHeight,
  }
}
