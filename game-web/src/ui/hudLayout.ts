import {
  buildNavigationButtonBounds,
  MIN_TOUCH_TARGET_PX,
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

export const buildHUDLayout = (canvasWidth: number, canvasHeight: number): HUDLayout => {
  const width = Math.max(1, Math.floor(canvasWidth))
  const height = Math.max(1, Math.floor(canvasHeight))
  const margin = clamp(Math.round(Math.min(width, height) * 0.02), 6, 10)
  const compactHeight = height <= 440

  const companyWidth = Math.min(240, Math.max(150, Math.floor(width * 0.46)))
  const companyHeight = compactHeight ? 54 : 62
  const companyPanel: RectBounds = {
    left: Math.max(margin, width - companyWidth - margin),
    top: margin,
    width: Math.min(companyWidth, width - margin * 2),
    height: companyHeight,
  }

  const orderTop = companyPanel.top + companyPanel.height + 8
  const orderWidth = Math.max(MIN_TOUCH_TARGET_PX, width - margin * 2)
  const orderHeight = compactHeight
    ? clamp(Math.floor(height * 0.34), 118, 132)
    : clamp(Math.floor(height * 0.2), 132, 160)
  const orderPanel: RectBounds = {
    left: margin,
    top: orderTop,
    width: orderWidth,
    height: orderHeight,
  }

  const acceptWidth = clamp(
    Math.floor(orderPanel.width * 0.28),
    MIN_TOUCH_TARGET_PX,
    140,
  )
  const acceptHeight = clamp(
    Math.floor(orderPanel.height * 0.4),
    MIN_TOUCH_TARGET_PX,
    56,
  )
  const acceptButton: RectBounds = {
    left: orderPanel.left + orderPanel.width - acceptWidth - 8,
    top: orderPanel.top + Math.floor((orderPanel.height - acceptHeight) / 2),
    width: acceptWidth,
    height: acceptHeight,
  }

  return {
    companyPanel,
    orderPanel,
    acceptButton,
    orderTextWidth: Math.max(120, orderPanel.width - acceptButton.width - 34),
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
    Math.min(width - 24, Math.floor(width * 0.88)),
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
