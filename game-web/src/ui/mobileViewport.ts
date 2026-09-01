export interface ViewportSize {
  width: number
  height: number
}

export interface LayoutPoint {
  x: number
  y: number
}

export interface LayoutRect {
  left: number
  top: number
  width: number
  height: number
}

/**
 * Implementation-level touch comfort floor measured in actual canvas/CSS pixels.
 * This value is deliberately not project canon; RBATCH-015 may tune it without
 * changing gameplay rules.
 */
export const MIN_TOUCH_TARGET_PX = 48

/**
 * Representative Android viewport matrix used by deterministic RBATCH-015 tests.
 * Both orientations are represented so no permanent portrait/landscape canon is
 * implied by the prototype implementation.
 */
export const SUPPORTED_ANDROID_VIEWPORTS: readonly ViewportSize[] = [
  { width: 360, height: 640 },
  { width: 360, height: 800 },
  { width: 412, height: 915 },
  { width: 640, height: 360 },
  { width: 800, height: 360 },
  { width: 915, height: 412 },
  { width: 1280, height: 720 },
]

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value))

const safeDimension = (value: number): number =>
  Number.isFinite(value) ? Math.max(1, Math.floor(value)) : 1

export const normalizeViewport = (width: number, height: number): ViewportSize => ({
  width: safeDimension(width),
  height: safeDimension(height),
})

export const isCompactLandscape = (width: number, height: number): boolean =>
  width > height && height <= 440

export const viewportEdgeInset = (width: number, height: number): number => {
  const viewport = normalizeViewport(width, height)
  return clamp(Math.round(Math.min(viewport.width, viewport.height) * 0.03), 8, 20)
}

export interface MainMenuLayout {
  title: LayoutPoint & { fontSize: number }
  subtitle: LayoutPoint & { fontSize: number }
  tagline: LayoutPoint & { fontSize: number }
  notice: LayoutPoint & { fontSize: number; wrapWidth: number }
  buttonWidth: number
  buttonHeight: number
  buttonFontSize: number
  actionCenters: LayoutPoint[]
  modal: {
    panel: LayoutRect
    textCenter: LayoutPoint
    textFontSize: number
    textWrapWidth: number
    actionY: number
    actionHeight: number
    closeWidth: number
    dualWidth: number
    confirmX: number
    cancelX: number
  }
}

export const buildMainMenuLayout = (
  width: number,
  height: number,
  actionCount: number,
  hasNotice: boolean,
): MainMenuLayout => {
  const viewport = normalizeViewport(width, height)
  const compact = isCompactLandscape(viewport.width, viewport.height)
  const edge = viewportEdgeInset(viewport.width, viewport.height)
  const centerX = viewport.width / 2

  const title = {
    x: centerX,
    y: compact ? edge + 18 : clamp(Math.round(viewport.height * 0.09), 48, 78),
    fontSize: compact ? 28 : clamp(Math.round(viewport.width * 0.09), 34, 52),
  }
  const subtitle = {
    x: centerX,
    y: compact ? edge + 50 : title.y + 58,
    fontSize: compact ? 14 : clamp(Math.round(viewport.width * 0.045), 16, 22),
  }
  const tagline = {
    x: centerX,
    y: compact ? edge + 78 : subtitle.y + 58,
    fontSize: compact ? 14 : clamp(Math.round(viewport.width * 0.045), 17, 22),
  }
  const notice = {
    x: centerX,
    y: compact ? edge + 105 : tagline.y + 52,
    fontSize: compact ? 13 : clamp(Math.round(viewport.width * 0.038), 15, 18),
    wrapWidth: Math.max(180, viewport.width - edge * 4),
  }

  const count = Math.max(1, Math.floor(actionCount))
  const topReserve = compact
    ? hasNotice
      ? 132
      : 108
    : hasNotice
      ? Math.min(270, Math.round(viewport.height * 0.36))
      : Math.min(245, Math.round(viewport.height * 0.31))
  const availableHeight = Math.max(MIN_TOUCH_TARGET_PX, viewport.height - topReserve - edge)
  const minimumGap = 8
  const maximumButtonHeight = Math.floor(
    (availableHeight - minimumGap * Math.max(0, count - 1)) / count,
  )
  const preferredButtonHeight = compact ? 52 : 64
  const buttonHeight = clamp(
    Math.min(preferredButtonHeight, maximumButtonHeight),
    MIN_TOUCH_TARGET_PX,
    preferredButtonHeight,
  )
  const remaining = Math.max(0, availableHeight - buttonHeight * count)
  const gap = count > 1 ? clamp(Math.floor(remaining / (count - 1)), minimumGap, 24) : 0
  const totalActionsHeight = buttonHeight * count + gap * Math.max(0, count - 1)
  const startY = topReserve + Math.max(0, Math.floor((availableHeight - totalActionsHeight) / 2))
  const actionCenters = Array.from({ length: count }, (_, index) => ({
    x: centerX,
    y: startY + buttonHeight / 2 + index * (buttonHeight + gap),
  }))

  const buttonWidth = Math.max(
    MIN_TOUCH_TARGET_PX,
    Math.min(compact ? 300 : 360, viewport.width - edge * 2),
  )

  const panelWidth = Math.min(640, viewport.width - edge * 2)
  const panelHeight = Math.min(compact ? viewport.height - edge * 2 : 360, viewport.height - edge * 2)
  const panel: LayoutRect = {
    left: centerX - panelWidth / 2,
    top: viewport.height / 2 - panelHeight / 2,
    width: panelWidth,
    height: panelHeight,
  }
  const actionHeight = MIN_TOUCH_TARGET_PX
  const modalGap = 10
  const dualWidth = Math.max(
    MIN_TOUCH_TARGET_PX,
    Math.min(190, Math.floor((panelWidth - modalGap * 3) / 2)),
  )
  const actionY = panel.top + panel.height - edge - actionHeight / 2

  return {
    title,
    subtitle,
    tagline,
    notice,
    buttonWidth,
    buttonHeight,
    buttonFontSize: compact ? 18 : 27,
    actionCenters,
    modal: {
      panel,
      textCenter: { x: centerX, y: viewport.height / 2 - actionHeight / 2 },
      textFontSize: compact ? 16 : 22,
      textWrapWidth: Math.max(160, panelWidth - edge * 4),
      actionY,
      actionHeight,
      closeWidth: Math.min(180, panelWidth - edge * 2),
      dualWidth,
      confirmX: centerX - dualWidth / 2 - modalGap / 2,
      cancelX: centerX + dualWidth / 2 + modalGap / 2,
    },
  }
}

export interface CompanyManagementLayout {
  compactLandscape: boolean
  title: LayoutPoint & { fontSize: number }
  companyInfo: LayoutPoint & { fontSize: number }
  card: LayoutRect
  upgradeName: LayoutPoint & { fontSize: number }
  description: LayoutPoint & { fontSize: number; wrapWidth: number }
  status: LayoutPoint & { fontSize: number }
  purchase: LayoutRect & { fontSize: number }
  feedback: LayoutPoint & { fontSize: number; wrapWidth: number }
  returnButton: LayoutRect
  menuButton: LayoutRect
  navFontSize: number
}

const centeredRect = (centerX: number, centerY: number, width: number, height: number): LayoutRect => ({
  left: centerX - width / 2,
  top: centerY - height / 2,
  width,
  height,
})

export const buildCompanyManagementLayout = (
  width: number,
  height: number,
): CompanyManagementLayout => {
  const viewport = normalizeViewport(width, height)
  const compact = isCompactLandscape(viewport.width, viewport.height)
  const edge = viewportEdgeInset(viewport.width, viewport.height)
  const centerX = viewport.width / 2

  if (compact) {
    const rightColumnWidth = clamp(Math.floor(viewport.width * 0.31), 190, 250)
    const cardLeft = edge
    const cardTop = 72
    const cardWidth = Math.max(250, viewport.width - rightColumnWidth - edge * 3)
    const cardHeight = Math.max(240, viewport.height - cardTop - edge)
    const card: LayoutRect = { left: cardLeft, top: cardTop, width: cardWidth, height: cardHeight }
    const cardCenterX = card.left + card.width / 2
    const navCenterX = viewport.width - edge - rightColumnWidth / 2
    const navWidth = Math.max(MIN_TOUCH_TARGET_PX, rightColumnWidth - edge * 2)
    const navHeight = 54

    return {
      compactLandscape: true,
      title: { x: centerX, y: 24, fontSize: 26 },
      companyInfo: { x: centerX, y: 52, fontSize: 14 },
      card,
      upgradeName: { x: cardCenterX, y: card.top + 34, fontSize: 23 },
      description: {
        x: cardCenterX,
        y: card.top + 76,
        fontSize: 14,
        wrapWidth: Math.max(190, card.width - 30),
      },
      status: { x: cardCenterX, y: card.top + 132, fontSize: 16 },
      purchase: {
        ...centeredRect(cardCenterX, card.top + 188, Math.min(300, card.width - 28), 54),
        fontSize: 20,
      },
      feedback: {
        x: cardCenterX,
        y: card.top + card.height - 30,
        fontSize: 14,
        wrapWidth: Math.max(190, card.width - 30),
      },
      returnButton: centeredRect(navCenterX, viewport.height / 2 - 38, navWidth, navHeight),
      menuButton: centeredRect(navCenterX, viewport.height / 2 + 38, navWidth, navHeight),
      navFontSize: 18,
    }
  }

  const navHeight = 58
  const navWidth = Math.max(MIN_TOUCH_TARGET_PX, Math.min(330, viewport.width - edge * 2))
  const cardWidth = Math.max(260, viewport.width - edge * 2)
  const cardHeight = Math.min(280, Math.max(250, viewport.height - 360))
  const cardTop = clamp(Math.round(viewport.height * 0.22), 132, 170)
  const card: LayoutRect = {
    left: centerX - cardWidth / 2,
    top: cardTop,
    width: cardWidth,
    height: cardHeight,
  }
  const cardCenterX = centerX

  return {
    compactLandscape: false,
    title: {
      x: centerX,
      y: clamp(Math.round(viewport.height * 0.065), 38, 52),
      fontSize: clamp(Math.round(viewport.width * 0.09), 30, 42),
    },
    companyInfo: {
      x: centerX,
      y: clamp(Math.round(viewport.height * 0.14), 82, 112),
      fontSize: clamp(Math.round(viewport.width * 0.052), 17, 22),
    },
    card,
    upgradeName: {
      x: cardCenterX,
      y: card.top + 38,
      fontSize: clamp(Math.round(viewport.width * 0.075), 24, 32),
    },
    description: {
      x: cardCenterX,
      y: card.top + 82,
      fontSize: clamp(Math.round(viewport.width * 0.045), 16, 18),
      wrapWidth: Math.max(220, card.width - 44),
    },
    status: {
      x: cardCenterX,
      y: card.top + 142,
      fontSize: clamp(Math.round(viewport.width * 0.05), 17, 21),
    },
    purchase: {
      ...centeredRect(cardCenterX, card.top + 198, Math.min(330, card.width - 30), 58),
      fontSize: 24,
    },
    feedback: {
      x: cardCenterX,
      y: card.top + card.height - 24,
      fontSize: clamp(Math.round(viewport.width * 0.043), 15, 19),
      wrapWidth: Math.max(220, card.width - 36),
    },
    returnButton: centeredRect(centerX, viewport.height - 116, navWidth, navHeight),
    menuButton: centeredRect(centerX, viewport.height - 48, navWidth, navHeight),
    navFontSize: 23,
  }
}

export const buildNavigationButtonBounds = (
  width: number,
  height: number,
): readonly LayoutRect[] => {
  const viewport = normalizeViewport(width, height)
  const edge = viewportEdgeInset(viewport.width, viewport.height)
  const buttonHeight = clamp(Math.round(viewport.height * 0.12), MIN_TOUCH_TARGET_PX, 56)
  const buttonWidth = clamp(
    Math.floor((viewport.width - edge * 3) / 2),
    120,
    180,
  )
  const top = viewport.height - edge - buttonHeight

  return [
    { left: edge, top, width: buttonWidth, height: buttonHeight },
    { left: edge * 2 + buttonWidth, top, width: buttonWidth, height: buttonHeight },
  ]
}

export const rectInsideViewport = (rect: LayoutRect, width: number, height: number): boolean => {
  const viewport = normalizeViewport(width, height)
  return (
    rect.left >= 0 &&
    rect.top >= 0 &&
    rect.left + rect.width <= viewport.width &&
    rect.top + rect.height <= viewport.height
  )
}
