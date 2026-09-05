import {
  isCompactLandscape,
  MIN_TOUCH_TARGET_PX,
  normalizeViewport,
  type LayoutPoint,
  type LayoutRect,
} from './mobileViewport'

export interface FinancialReportLayout {
  compactLandscape: boolean
  title: LayoutPoint & { fontSize: number }
  summary: LayoutPoint & { fontSize: number; wrapWidth: number }
  panel: LayoutRect
  metricRects: readonly LayoutRect[]
  metricLabelFontSize: number
  metricValueFontSize: number
  operationsCard: LayoutRect
  operationsFontSize: number
  actionButton: LayoutRect
  actionFontSize: number
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

const gridRects = (
  left: number,
  top: number,
  width: number,
  columns: number,
  rows: number,
  gap: number,
  rowHeight: number,
): LayoutRect[] => {
  const columnWidth = (width - gap * (columns - 1)) / columns
  return Array.from({ length: columns * rows }, (_, index) => {
    const column = index % columns
    const row = Math.floor(index / columns)
    return {
      left: left + column * (columnWidth + gap),
      top: top + row * (rowHeight + gap),
      width: columnWidth,
      height: rowHeight,
    }
  })
}

export const buildFinancialReportLayout = (width: number, height: number): FinancialReportLayout => {
  const viewport = normalizeViewport(width, height)
  const compact = isCompactLandscape(viewport.width, viewport.height)
  const edge = clamp(Math.round(Math.min(viewport.width, viewport.height) * 0.03), 8, 18)
  const centerX = viewport.width / 2

  if (compact) {
    const rightColumnWidth = clamp(Math.floor(viewport.width * 0.27), 176, 226)
    const panelTop = 60
    const panelWidth = Math.max(320, viewport.width - rightColumnWidth - edge * 3)
    const panelHeight = Math.max(270, viewport.height - panelTop - edge)
    const panel: LayoutRect = { left: edge, top: panelTop, width: panelWidth, height: panelHeight }
    const cardInset = 14
    const metricRects = gridRects(
      panel.left + cardInset,
      panel.top + cardInset,
      panel.width - cardInset * 2,
      4,
      1,
      7,
      66,
    )
    const operationsCard: LayoutRect = {
      left: panel.left + cardInset,
      top: panel.top + 88,
      width: panel.width - cardInset * 2,
      height: 66,
    }
    const navCenterX = viewport.width - edge - rightColumnWidth / 2
    const navWidth = Math.max(MIN_TOUCH_TARGET_PX, rightColumnWidth - edge * 2)

    return {
      compactLandscape: true,
      title: { x: centerX, y: 20, fontSize: 24 },
      summary: {
        x: centerX,
        y: 43,
        fontSize: 13,
        wrapWidth: Math.max(300, viewport.width - edge * 2),
      },
      panel,
      metricRects,
      metricLabelFontSize: 11,
      metricValueFontSize: 18,
      operationsCard,
      operationsFontSize: 13,
      actionButton: centeredRect(
        panel.left + panel.width / 2,
        panel.top + panel.height - 37,
        Math.min(320, panel.width - 28),
        50,
      ),
      actionFontSize: 17,
      feedback: {
        x: panel.left + panel.width / 2,
        y: panel.top + panel.height - 78,
        fontSize: 12,
        wrapWidth: Math.max(240, panel.width - 32),
      },
      returnButton: centeredRect(navCenterX, viewport.height / 2 - 34, navWidth, 52),
      menuButton: centeredRect(navCenterX, viewport.height / 2 + 34, navWidth, 52),
      navFontSize: 17,
    }
  }

  const navHeight = 56
  const navWidth = Math.max(MIN_TOUCH_TARGET_PX, Math.floor((viewport.width - edge * 3) / 2))
  const navTop = viewport.height - edge - navHeight
  const panelTop = clamp(Math.round(viewport.height * 0.15), 108, 126)
  const availablePanelHeight = navTop - panelTop - 14
  const preferredPanelHeight = clamp(Math.round(viewport.height * 0.49), 338, 430)
  const panelHeight = Math.min(preferredPanelHeight, Math.max(330, availablePanelHeight))
  const panelWidth = Math.max(280, viewport.width - edge * 2)
  const panel: LayoutRect = {
    left: centerX - panelWidth / 2,
    top: panelTop,
    width: panelWidth,
    height: panelHeight,
  }
  const cardInset = 14
  const cardGap = 9
  const metricRowHeight = clamp(Math.round(panel.height * 0.18), 62, 76)
  const metricRects = gridRects(
    panel.left + cardInset,
    panel.top + cardInset,
    panel.width - cardInset * 2,
    2,
    2,
    cardGap,
    metricRowHeight,
  )
  const metricsBottom = metricRects[metricRects.length - 1]?.top
    ? metricRects[metricRects.length - 1].top + metricRowHeight
    : panel.top + cardInset + metricRowHeight * 2 + cardGap
  const operationsCard: LayoutRect = {
    left: panel.left + cardInset,
    top: metricsBottom + 12,
    width: panel.width - cardInset * 2,
    height: clamp(Math.round(panel.height * 0.16), 58, 72),
  }

  return {
    compactLandscape: false,
    title: {
      x: centerX,
      y: clamp(Math.round(viewport.height * 0.055), 34, 44),
      fontSize: clamp(Math.round(viewport.width * 0.075), 27, 34),
    },
    summary: {
      x: centerX,
      y: clamp(Math.round(viewport.height * 0.105), 70, 86),
      fontSize: clamp(Math.round(viewport.width * 0.038), 13, 16),
      wrapWidth: Math.max(260, viewport.width - edge * 2 - 16),
    },
    panel,
    metricRects,
    metricLabelFontSize: clamp(Math.round(viewport.width * 0.034), 12, 14),
    metricValueFontSize: clamp(Math.round(viewport.width * 0.055), 18, 23),
    operationsCard,
    operationsFontSize: clamp(Math.round(viewport.width * 0.036), 12, 15),
    actionButton: centeredRect(
      centerX,
      panel.top + panel.height - 37,
      Math.min(320, panel.width - 28),
      52,
    ),
    actionFontSize: clamp(Math.round(viewport.width * 0.047), 16, 20),
    feedback: {
      x: centerX,
      y: panel.top + panel.height - 82,
      fontSize: clamp(Math.round(viewport.width * 0.032), 11, 13),
      wrapWidth: Math.max(240, panel.width - 34),
    },
    returnButton: {
      left: edge,
      top: navTop,
      width: navWidth,
      height: navHeight,
    },
    menuButton: {
      left: edge * 2 + navWidth,
      top: navTop,
      width: Math.max(MIN_TOUCH_TARGET_PX, viewport.width - edge * 3 - navWidth),
      height: navHeight,
    },
    navFontSize: 18,
  }
}
