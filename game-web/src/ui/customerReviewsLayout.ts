import {
  isCompactLandscape,
  MIN_TOUCH_TARGET_PX,
  normalizeViewport,
  type LayoutPoint,
  type LayoutRect,
} from './mobileViewport'

export interface CustomerReviewsLayout {
  compactLandscape: boolean
  title: LayoutPoint & { fontSize: number }
  summary: LayoutPoint & { fontSize: number; wrapWidth: number }
  panel: LayoutRect
  rowRects: readonly LayoutRect[]
  rowFontSize: number
  rowTextWrapWidth: number
  emptyText: LayoutPoint & { fontSize: number; wrapWidth: number }
  previousButton: LayoutRect
  nextButton: LayoutRect
  pageText: LayoutPoint & { fontSize: number }
  returnButton: LayoutRect
  menuButton: LayoutRect
  navFontSize: number
  rowsPerPage: number
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
  rowsPerPage: number,
  pagingReserve: number,
  gap: number,
): LayoutRect[] => {
  const inset = 12
  const rowsTop = panel.top + inset
  const rowsBottom = panel.top + panel.height - pagingReserve
  const availableHeight = Math.max(
    rowsPerPage * MIN_TOUCH_TARGET_PX,
    rowsBottom - rowsTop - gap * Math.max(0, rowsPerPage - 1),
  )
  const rowHeight = Math.max(
    MIN_TOUCH_TARGET_PX,
    Math.floor(availableHeight / rowsPerPage),
  )

  return Array.from({ length: rowsPerPage }, (_, index) => ({
    left: panel.left + inset,
    top: rowsTop + index * (rowHeight + gap),
    width: Math.max(MIN_TOUCH_TARGET_PX, panel.width - inset * 2),
    height: rowHeight,
  }))
}

export const buildCustomerReviewsLayout = (
  width: number,
  height: number,
): CustomerReviewsLayout => {
  const viewport = normalizeViewport(width, height)
  const compact = isCompactLandscape(viewport.width, viewport.height)
  const edge = clamp(Math.round(Math.min(viewport.width, viewport.height) * 0.03), 8, 18)
  const centerX = viewport.width / 2

  if (compact) {
    const rightColumnWidth = clamp(Math.floor(viewport.width * 0.27), 176, 226)
    const panelTop = 64
    const panelWidth = Math.max(320, viewport.width - rightColumnWidth - edge * 3)
    const panelHeight = Math.max(260, viewport.height - panelTop - edge)
    const panel: LayoutRect = { left: edge, top: panelTop, width: panelWidth, height: panelHeight }
    const panelCenterX = panel.left + panel.width / 2
    const navCenterX = viewport.width - edge - rightColumnWidth / 2
    const navWidth = Math.max(MIN_TOUCH_TARGET_PX, rightColumnWidth - edge * 2)
    const rowsPerPage = 3
    const rowRects = buildRows(panel, rowsPerPage, 62, 6)
    const pagerY = panel.top + panel.height - 29
    const pagerButtonWidth = Math.max(72, Math.min(110, Math.floor((panel.width - 150) / 2)))

    return {
      compactLandscape: true,
      title: { x: centerX, y: 20, fontSize: 24 },
      summary: {
        x: centerX,
        y: 44,
        fontSize: 12,
        wrapWidth: Math.max(300, viewport.width - edge * 2),
      },
      panel,
      rowRects,
      rowFontSize: 13,
      rowTextWrapWidth: Math.max(180, panel.width - 44),
      emptyText: {
        x: panelCenterX,
        y: panel.top + panel.height / 2 - 18,
        fontSize: 15,
        wrapWidth: Math.max(190, panel.width - 40),
      },
      previousButton: centeredRect(panel.left + 12 + pagerButtonWidth / 2, pagerY, pagerButtonWidth, 48),
      nextButton: centeredRect(panel.left + panel.width - 12 - pagerButtonWidth / 2, pagerY, pagerButtonWidth, 48),
      pageText: { x: panelCenterX, y: pagerY, fontSize: 13 },
      returnButton: centeredRect(navCenterX, viewport.height / 2 - 34, navWidth, 52),
      menuButton: centeredRect(navCenterX, viewport.height / 2 + 34, navWidth, 52),
      navFontSize: 17,
      rowsPerPage,
    }
  }

  const navHeight = 56
  const navWidth = Math.max(MIN_TOUCH_TARGET_PX, Math.floor((viewport.width - edge * 3) / 2))
  const navTop = viewport.height - edge - navHeight
  const panelTop = clamp(Math.round(viewport.height * 0.17), 122, 146)
  const panelBottom = navTop - 14
  const panelWidth = Math.max(280, viewport.width - edge * 2)
  const panelHeight = Math.max(330, panelBottom - panelTop)
  const panel: LayoutRect = {
    left: centerX - panelWidth / 2,
    top: panelTop,
    width: panelWidth,
    height: panelHeight,
  }
  const rowsPerPage = 4
  const rowRects = buildRows(panel, rowsPerPage, 68, 8)
  const pagerY = panel.top + panel.height - 31
  const pagerButtonWidth = Math.max(86, Math.min(130, Math.floor((panel.width - 138) / 2)))

  return {
    compactLandscape: false,
    title: {
      x: centerX,
      y: clamp(Math.round(viewport.height * 0.055), 34, 44),
      fontSize: clamp(Math.round(viewport.width * 0.075), 27, 34),
    },
    summary: {
      x: centerX,
      y: clamp(Math.round(viewport.height * 0.11), 76, 96),
      fontSize: clamp(Math.round(viewport.width * 0.036), 12, 15),
      wrapWidth: Math.max(260, viewport.width - edge * 2 - 16),
    },
    panel,
    rowRects,
    rowFontSize: clamp(Math.round(viewport.width * 0.035), 12, 15),
    rowTextWrapWidth: Math.max(220, panel.width - 44),
    emptyText: {
      x: centerX,
      y: panel.top + panel.height / 2 - 20,
      fontSize: clamp(Math.round(viewport.width * 0.043), 15, 19),
      wrapWidth: Math.max(220, panel.width - 42),
    },
    previousButton: centeredRect(panel.left + 14 + pagerButtonWidth / 2, pagerY, pagerButtonWidth, 50),
    nextButton: centeredRect(panel.left + panel.width - 14 - pagerButtonWidth / 2, pagerY, pagerButtonWidth, 50),
    pageText: { x: centerX, y: pagerY, fontSize: 14 },
    returnButton: { left: edge, top: navTop, width: navWidth, height: navHeight },
    menuButton: {
      left: edge * 2 + navWidth,
      top: navTop,
      width: Math.max(MIN_TOUCH_TARGET_PX, viewport.width - edge * 3 - navWidth),
      height: navHeight,
    },
    navFontSize: 18,
    rowsPerPage,
  }
}
