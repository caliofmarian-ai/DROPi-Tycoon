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
  summary: LayoutPoint & { fontSize: number; wrapWidth: number }
  panel: LayoutRect
  avatar: LayoutRect
  identity: LayoutPoint & { fontSize: number; wrapWidth: number }
  statusChip: LayoutRect
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
  const edge = clamp(Math.round(Math.min(viewport.width, viewport.height) * 0.03), 8, 18)
  const centerX = viewport.width / 2

  if (compact) {
    const rightColumnWidth = clamp(Math.floor(viewport.width * 0.27), 176, 226)
    const panelLeft = edge
    const panelTop = 58
    const panelWidth = Math.max(300, viewport.width - rightColumnWidth - edge * 3)
    const panelHeight = Math.max(250, viewport.height - panelTop - edge)
    const panel: LayoutRect = {
      left: panelLeft,
      top: panelTop,
      width: panelWidth,
      height: panelHeight,
    }
    const avatarSize = clamp(Math.round(panelHeight * 0.36), 86, 108)
    const avatar: LayoutRect = {
      left: panel.left + 18,
      top: panel.top + 20,
      width: avatarSize,
      height: avatarSize,
    }
    const identityLeft = avatar.left + avatar.width + 18
    const navCenterX = viewport.width - edge - rightColumnWidth / 2
    const navWidth = Math.max(MIN_TOUCH_TARGET_PX, rightColumnWidth - edge * 2)
    const navHeight = 52

    return {
      compactLandscape: true,
      title: { x: centerX, y: 20, fontSize: 24 },
      summary: {
        x: centerX,
        y: 43,
        fontSize: 13,
        wrapWidth: Math.max(280, viewport.width - edge * 2),
      },
      panel,
      avatar,
      identity: {
        x: identityLeft,
        y: panel.top + 22,
        fontSize: 19,
        wrapWidth: Math.max(160, panel.left + panel.width - identityLeft - 18),
      },
      statusChip: {
        left: identityLeft,
        top: panel.top + 76,
        width: clamp(panel.width * 0.23, 96, 128),
        height: 32,
      },
      details: {
        x: panel.left + 18,
        y: panel.top + avatar.height + 34,
        fontSize: 14,
        wrapWidth: Math.max(260, panel.width - 36),
      },
      actionButton: centeredRect(
        panel.left + panel.width / 2,
        panel.top + panel.height - 40,
        Math.min(300, panel.width - 32),
        50,
      ),
      actionFontSize: 18,
      feedback: {
        x: panel.left + 18,
        y: panel.top + panel.height - 82,
        fontSize: 12,
        wrapWidth: Math.max(260, panel.width - 36),
      },
      returnButton: centeredRect(navCenterX, viewport.height / 2 - 34, navWidth, navHeight),
      menuButton: centeredRect(navCenterX, viewport.height / 2 + 34, navWidth, navHeight),
      navFontSize: 17,
    }
  }

  const navHeight = 56
  const navWidth = Math.max(MIN_TOUCH_TARGET_PX, Math.floor((viewport.width - edge * 3) / 2))
  const navTop = viewport.height - edge - navHeight
  const panelTop = clamp(Math.round(viewport.height * 0.15), 104, 126)
  const availablePanelHeight = navTop - panelTop - 14
  const panelHeight = clamp(Math.round(viewport.height * 0.48), 330, 410)
  const safePanelHeight = Math.min(panelHeight, Math.max(300, availablePanelHeight))
  const panelWidth = Math.max(280, viewport.width - edge * 2)
  const panel: LayoutRect = {
    left: centerX - panelWidth / 2,
    top: panelTop,
    width: panelWidth,
    height: safePanelHeight,
  }
  const avatarSize = clamp(Math.round(panel.width * 0.27), 82, 100)
  const avatar: LayoutRect = {
    left: panel.left + 16,
    top: panel.top + 18,
    width: avatarSize,
    height: avatarSize,
  }
  const identityLeft = avatar.left + avatar.width + 14
  const statusWidth = clamp(panel.width * 0.31, 104, 132)

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
    avatar,
    identity: {
      x: identityLeft,
      y: panel.top + 22,
      fontSize: clamp(Math.round(viewport.width * 0.052), 18, 21),
      wrapWidth: Math.max(140, panel.left + panel.width - identityLeft - 14),
    },
    statusChip: {
      left: identityLeft,
      top: panel.top + 76,
      width: statusWidth,
      height: 32,
    },
    details: {
      x: panel.left + 16,
      y: panel.top + avatar.height + 36,
      fontSize: clamp(Math.round(viewport.width * 0.041), 14, 17),
      wrapWidth: Math.max(240, panel.width - 32),
    },
    actionButton: centeredRect(
      centerX,
      panel.top + panel.height - 42,
      Math.min(320, panel.width - 28),
      52,
    ),
    actionFontSize: clamp(Math.round(viewport.width * 0.049), 17, 21),
    feedback: {
      x: panel.left + 16,
      y: panel.top + panel.height - 88,
      fontSize: clamp(Math.round(viewport.width * 0.034), 12, 14),
      wrapWidth: Math.max(240, panel.width - 32),
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
