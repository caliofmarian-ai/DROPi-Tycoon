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
 * Second M-008 owner-review HUD remediation.
 *
 * The persistent company/order cluster is deliberately small and anchored to the
 * upper-right edge in both orientations. The Accept button sits directly below the
 * order card instead of consuming horizontal map space inside the card.
 */
export const buildHUDLayout = (canvasWidth: number, canvasHeight: number): HUDLayout => {
  const width = Math.max(1, Math.floor(canvasWidth))
  const height = Math.max(1, Math.floor(canvasHeight))
  const margin = clamp(Math.round(Math.min(width, height) * 0.02), 6, 10)
  const compactLandscape = isCompactLandscape(width, height)
  const rightEdge = width - margin

  const orderWidth = compactLandscape
    ? clamp(Math.floor(width * 0.22), 150, 200)
    : clamp(Math.floor(width * 0.4), 144, 168)
  const companyWidth = Math.min(orderWidth, compactLandscape ? 126 : 132)
  const companyHeight = compactLandscape ? 32 : 36
  const companyPanel: RectBounds = {
    left: rightEdge - companyWidth,
    top: margin,
    width: companyWidth,
    height: companyHeight,
  }

  const orderHeight = compactLandscape ? 58 : 62
  const orderPanel: RectBounds = {
    left: rightEdge - orderWidth,
    top: bottom(companyPanel) + 4,
    width: orderWidth,
    height: orderHeight,
  }

  const acceptWidth = compactLandscape ? 74 : 78
  const acceptHeight = MIN_TOUCH_TARGET_PX
  const acceptButton: RectBounds = {
    left: rightEdge - acceptWidth,
    top: bottom(orderPanel) + 4,
    width: acceptWidth,
    height: acceptHeight,
  }

  return {
    companyPanel,
    orderPanel,
    acceptButton,
    orderTextWidth: Math.max(120, orderPanel.width - 14),
    companyFontSize: compactLandscape ? 12 : 13,
    orderFontSize: compactLandscape ? 11 : 12,
    acceptFontSize: 13,
  }
}

/**
 * Derives notification panel layout from runtime canvas and HUD dimensions.
 * The notification stays below the complete upper-right HUD cluster and above
 * bottom navigation while preserving the existing responsive-width contract.
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
    Math.min(width - 24, Math.floor(width * 0.62), 620),
  )
  const desiredTop = bottom(hud.acceptButton) + margin
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
