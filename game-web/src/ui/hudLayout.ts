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

export const NAV_BUTTON_BOUNDS: ReadonlyArray<RectBounds> = [
  { left: 32, top: 521, width: 156, height: 54 },
  { left: 212, top: 521, width: 156, height: 54 },
]

const MIN_TOUCH = 44

const right = (rect: RectBounds): number => rect.left + rect.width
const bottom = (rect: RectBounds): number => rect.top + rect.height

export const boundsContainPoint = (rect: RectBounds, x: number, y: number): boolean =>
  x >= rect.left && x <= right(rect) && y >= rect.top && y <= bottom(rect)

export const boundsIntersect = (a: RectBounds, b: RectBounds): boolean =>
  a.left < right(b) && right(a) > b.left && a.top < bottom(b) && bottom(a) > b.top

export const isBoundsInsideCanvas = (rect: RectBounds, width: number, height: number): boolean =>
  rect.left >= 0 && rect.top >= 0 && right(rect) <= width && bottom(rect) <= height

export const buildHUDLayout = (canvasWidth: number, canvasHeight: number): HUDLayout => {
  const margin = 8
  const companyWidth = Math.min(240, Math.max(200, Math.floor(canvasWidth * 0.28)))
  const companyHeight = 62
  const companyPanel: RectBounds = {
    left: canvasWidth - companyWidth - margin,
    top: margin,
    width: companyWidth,
    height: companyHeight,
  }

  const orderTop = companyPanel.top + companyPanel.height + 10
  const orderWidth = Math.min(canvasWidth - margin * 2, Math.max(380, Math.floor(canvasWidth * 0.74)))
  const orderHeight = Math.max(132, Math.floor(canvasHeight * 0.22))
  const orderPanel: RectBounds = {
    left: margin,
    top: orderTop,
    width: orderWidth,
    height: orderHeight,
  }

  const acceptWidth = Math.max(MIN_TOUCH, Math.floor(orderPanel.width * 0.24))
  const acceptHeight = Math.max(MIN_TOUCH, 52)
  const acceptButton: RectBounds = {
    left: orderPanel.left + orderPanel.width - acceptWidth - 10,
    top: orderPanel.top + Math.floor((orderPanel.height - acceptHeight) / 2),
    width: acceptWidth,
    height: acceptHeight,
  }

  return {
    companyPanel,
    orderPanel,
    acceptButton,
    orderTextWidth: orderPanel.width - acceptButton.width - 38,
  }
}
