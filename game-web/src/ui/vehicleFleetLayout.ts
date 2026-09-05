import {
  isCompactLandscape,
  MIN_TOUCH_TARGET_PX,
  normalizeViewport,
  type LayoutPoint,
  type LayoutRect,
} from './mobileViewport'

export interface VehicleFleetRowLayout {
  row: LayoutRect
  text: LayoutPoint & { fontSize: number; wrapWidth: number }
  purchaseButton: LayoutRect
  purchaseFontSize: number
}

export interface VehicleFleetLayout {
  compactLandscape: boolean
  title: LayoutPoint & { fontSize: number }
  summary: LayoutPoint & { fontSize: number }
  panel: LayoutRect
  rows: readonly VehicleFleetRowLayout[]
  feedback: LayoutPoint & { fontSize: number; wrapWidth: number }
  returnButton: LayoutRect
  menuButton: LayoutRect
  navFontSize: number
}

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value))

const centeredRect = (centerX: number, centerY: number, width: number, height: number): LayoutRect => ({
  left: centerX - width / 2,
  top: centerY - height / 2,
  width,
  height,
})

const buildRows = (
  panel: LayoutRect,
  count: number,
  compact: boolean,
): VehicleFleetRowLayout[] => {
  const inset = compact ? 8 : 10
  const gap = compact ? 5 : 8
  const availableHeight = panel.height - inset * 2 - gap * Math.max(0, count - 1)
  const rowHeight = Math.max(MIN_TOUCH_TARGET_PX, Math.floor(availableHeight / count))
  const purchaseWidth = compact
    ? Math.max(84, Math.min(108, Math.floor(panel.width * 0.24)))
    : Math.max(92, Math.min(122, Math.floor(panel.width * 0.29)))

  return Array.from({ length: count }, (_, index) => {
    const row: LayoutRect = {
      left: panel.left + inset,
      top: panel.top + inset + index * (rowHeight + gap),
      width: panel.width - inset * 2,
      height: rowHeight,
    }
    const buttonHeight = Math.max(
      MIN_TOUCH_TARGET_PX,
      Math.min(row.height - 8, compact ? 48 : 54),
    )
    const purchaseButton: LayoutRect = {
      left: row.left + row.width - purchaseWidth - 6,
      top: row.top + (row.height - buttonHeight) / 2,
      width: purchaseWidth,
      height: buttonHeight,
    }
    const textRight = purchaseButton.left - 8

    return {
      row,
      text: {
        x: row.left + 10,
        y: row.top + row.height / 2,
        fontSize: compact ? 13 : 15,
        wrapWidth: Math.max(100, textRight - (row.left + 10)),
      },
      purchaseButton,
      purchaseFontSize: compact ? 14 : 16,
    }
  })
}

export const buildVehicleFleetLayout = (
  width: number,
  height: number,
  vehicleCount = 4,
): VehicleFleetLayout => {
  const viewport = normalizeViewport(width, height)
  const compact = isCompactLandscape(viewport.width, viewport.height)
  const edge = clamp(Math.round(Math.min(viewport.width, viewport.height) * 0.03), 8, 20)
  const centerX = viewport.width / 2
  const count = Math.max(1, vehicleCount)

  if (compact) {
    const rightColumnWidth = clamp(Math.floor(viewport.width * 0.31), 190, 250)
    const panelTop = 64
    const panelWidth = Math.max(310, viewport.width - rightColumnWidth - edge * 3)
    const panelHeight = Math.max(250, viewport.height - panelTop - edge)
    const panel: LayoutRect = { left: edge, top: panelTop, width: panelWidth, height: panelHeight }
    const navCenterX = viewport.width - edge - rightColumnWidth / 2
    const navWidth = Math.max(MIN_TOUCH_TARGET_PX, rightColumnWidth - edge * 2)

    return {
      compactLandscape: true,
      title: { x: centerX, y: 21, fontSize: 25 },
      summary: { x: centerX, y: 48, fontSize: 14 },
      panel,
      rows: buildRows(panel, count, true),
      feedback: {
        x: navCenterX,
        y: viewport.height - edge - 22,
        fontSize: 12,
        wrapWidth: navWidth,
      },
      returnButton: centeredRect(navCenterX, viewport.height / 2 - 34, navWidth, 54),
      menuButton: centeredRect(navCenterX, viewport.height / 2 + 34, navWidth, 54),
      navFontSize: 18,
    }
  }

  const navHeight = 58
  const navTop = viewport.height - edge - navHeight
  const navWidth = Math.max(MIN_TOUCH_TARGET_PX, Math.floor((viewport.width - edge * 3) / 2))
  const panelTop = clamp(Math.round(viewport.height * 0.17), 102, 150)
  const feedbackReserve = 52
  const panelBottom = navTop - feedbackReserve
  const panelWidth = Math.max(270, viewport.width - edge * 2)
  const panelHeight = Math.max(300, panelBottom - panelTop)
  const panel: LayoutRect = {
    left: centerX - panelWidth / 2,
    top: panelTop,
    width: panelWidth,
    height: panelHeight,
  }

  return {
    compactLandscape: false,
    title: {
      x: centerX,
      y: clamp(Math.round(viewport.height * 0.055), 34, 50),
      fontSize: clamp(Math.round(viewport.width * 0.082), 29, 40),
    },
    summary: {
      x: centerX,
      y: clamp(Math.round(viewport.height * 0.115), 70, 102),
      fontSize: clamp(Math.round(viewport.width * 0.043), 15, 19),
    },
    panel,
    rows: buildRows(panel, count, false),
    feedback: {
      x: centerX,
      y: panel.top + panel.height + 22,
      fontSize: clamp(Math.round(viewport.width * 0.038), 13, 16),
      wrapWidth: Math.max(220, panel.width - 20),
    },
    returnButton: { left: edge, top: navTop, width: navWidth, height: navHeight },
    menuButton: {
      left: edge * 2 + navWidth,
      top: navTop,
      width: Math.max(MIN_TOUCH_TARGET_PX, viewport.width - edge * 3 - navWidth),
      height: navHeight,
    },
    navFontSize: 20,
  }
}
