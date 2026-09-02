import {
  isCompactLandscape,
  MIN_TOUCH_TARGET_PX,
  normalizeViewport,
  type LayoutPoint,
  type LayoutRect,
} from './mobileViewport'

export interface EmployeeManagementLayout {
  compactLandscape: boolean
  title: LayoutPoint & { fontSize: number }
  summary: LayoutPoint & { fontSize: number }
  panel: LayoutRect
  details: LayoutPoint & { fontSize: number; wrapWidth: number }
  actionButton: LayoutRect
  actionFontSize: number
  feedback: LayoutPoint & { fontSize: number; wrapWidth: number }
  returnButton: LayoutRect
  menuButton: LayoutRect
  navFontSize: number
}

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value))

const centeredRect = (
  centerX: number,
  centerY: number,
  width: number,
  height: number,
): LayoutRect => ({
  left: centerX - width / 2,
  top: centerY - height / 2,
  width,
  height,
})

export const buildEmployeeManagementLayout = (
  width: number,
  height: number,
): EmployeeManagementLayout => {
  const viewport = normalizeViewport(width, height)
  const compact = isCompactLandscape(viewport.width, viewport.height)
  const edge = clamp(Math.round(Math.min(viewport.width, viewport.height) * 0.03), 8, 20)
  const centerX = viewport.width / 2

  if (compact) {
    const rightColumnWidth = clamp(Math.floor(viewport.width * 0.31), 190, 250)
    const panelLeft = edge
    const panelTop = 66
    const panelWidth = Math.max(250, viewport.width - rightColumnWidth - edge * 3)
    const panelHeight = Math.max(250, viewport.height - panelTop - edge)
    const panel: LayoutRect = {
      left: panelLeft,
      top: panelTop,
      width: panelWidth,
      height: panelHeight,
    }
    const panelCenterX = panel.left + panel.width / 2
    const navCenterX = viewport.width - edge - rightColumnWidth / 2
    const navWidth = Math.max(MIN_TOUCH_TARGET_PX, rightColumnWidth - edge * 2)
    const navHeight = 54

    return {
      compactLandscape: true,
      title: { x: centerX, y: 22, fontSize: 25 },
      summary: { x: centerX, y: 49, fontSize: 14 },
      panel,
      details: {
        x: panelCenterX,
        y: panel.top + 74,
        fontSize: 16,
        wrapWidth: Math.max(210, panel.width - 32),
      },
      actionButton: centeredRect(
        panelCenterX,
        panel.top + panel.height - 48,
        Math.min(310, panel.width - 28),
        54,
      ),
      actionFontSize: 19,
      feedback: {
        x: panelCenterX,
        y: panel.top + panel.height - 92,
        fontSize: 13,
        wrapWidth: Math.max(210, panel.width - 30),
      },
      returnButton: centeredRect(navCenterX, viewport.height / 2 - 36, navWidth, navHeight),
      menuButton: centeredRect(navCenterX, viewport.height / 2 + 36, navWidth, navHeight),
      navFontSize: 18,
    }
  }

  const navHeight = 58
  const navGap = 10
  const navWidth = Math.max(
    MIN_TOUCH_TARGET_PX,
    Math.floor((viewport.width - edge * 3) / 2),
  )
  const panelTop = clamp(Math.round(viewport.height * 0.18), 110, 150)
  const navTop = viewport.height - edge - navHeight
  const panelBottom = navTop - 14
  const panelHeight = Math.max(260, panelBottom - panelTop)
  const panelWidth = Math.max(260, viewport.width - edge * 2)
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
      y: clamp(Math.round(viewport.height * 0.06), 36, 50),
      fontSize: clamp(Math.round(viewport.width * 0.082), 29, 40),
    },
    summary: {
      x: centerX,
      y: clamp(Math.round(viewport.height * 0.125), 76, 104),
      fontSize: clamp(Math.round(viewport.width * 0.045), 16, 20),
    },
    panel,
    details: {
      x: centerX,
      y: panel.top + Math.min(100, panel.height * 0.32),
      fontSize: clamp(Math.round(viewport.width * 0.049), 17, 21),
      wrapWidth: Math.max(220, panel.width - 40),
    },
    actionButton: centeredRect(
      centerX,
      panel.top + panel.height - 52,
      Math.min(340, panel.width - 28),
      58,
    ),
    actionFontSize: clamp(Math.round(viewport.width * 0.055), 19, 24),
    feedback: {
      x: centerX,
      y: panel.top + panel.height - 106,
      fontSize: clamp(Math.round(viewport.width * 0.04), 14, 17),
      wrapWidth: Math.max(220, panel.width - 36),
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
    navFontSize: 20,
  }
}
