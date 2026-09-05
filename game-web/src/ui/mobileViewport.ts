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
  const landscapeGrid = viewport.width > viewport.height && count >= 4
  const columns = landscapeGrid ? 2 : 1
  const rows = Math.ceil(count / columns)
  const topReserve = compact
    ? hasNotice
      ? 132
      : 108
    : hasNotice
      ? Math.min(270, Math.round(viewport.height * 0.36))
      : landscapeGrid
        ? Math.min(200, Math.round(viewport.height * 0.25))
        : Math.min(245, Math.round(viewport.height * 0.31))
  const availableHeight = Math.max(MIN_TOUCH_TARGET_PX, viewport.height - topReserve - edge)
  const minimumGap = 8
  const rowGap = landscapeGrid
    ? clamp(Math.round(viewport.height * 0.025), minimumGap, 16)
    : 0
  const maximumButtonHeight = Math.floor(
    (availableHeight - (landscapeGrid ? rowGap : minimumGap) * Math.max(0, rows - 1)) / rows,
  )
  const preferredButtonHeight = compact ? 52 : landscapeGrid ? 58 : 64
  const buttonHeight = clamp(
    Math.min(preferredButtonHeight, maximumButtonHeight),
    MIN_TOUCH_TARGET_PX,
    preferredButtonHeight,
  )
  const remaining = Math.max(0, availableHeight - buttonHeight * rows)
  const gap = rows > 1
    ? landscapeGrid
      ? rowGap
      : clamp(Math.floor(remaining / (rows - 1)), minimumGap, 24)
    : 0
  const totalActionsHeight = buttonHeight * rows + gap * Math.max(0, rows - 1)
  const startY = landscapeGrid
    ? topReserve + Math.min(12, Math.max(0, Math.floor((availableHeight - totalActionsHeight) / 2)))
    : topReserve + Math.max(0, Math.floor((availableHeight - totalActionsHeight) / 2))

  const columnGap = landscapeGrid
    ? clamp(Math.round(viewport.width * 0.025), 12, 24)
    : 0
  const buttonWidth = Math.max(
    MIN_TOUCH_TARGET_PX,
    Math.min(
      landscapeGrid ? 300 : compact ? 300 : 360,
      landscapeGrid
        ? Math.floor((viewport.width - edge * 2 - columnGap) / 2)
        : viewport.width - edge * 2,
    ),
  )
  const leftColumnX = centerX - (buttonWidth + columnGap) / 2
  const rightColumnX = centerX + (buttonWidth + columnGap) / 2

  const actionCenters = Array.from({ length: count }, (_, index) => {
    const row = Math.floor(index / columns)
    const isUnpairedLastAction = landscapeGrid && count % 2 === 1 && index === count - 1
    const x = isUnpairedLastAction
      ? centerX
      : landscapeGrid
        ? index % 2 === 0
          ? leftColumnX
          : rightColumnX
        : centerX

    return {
      x,
      y: startY + buttonHeight / 2 + row * (buttonHeight + gap),
    }
  })

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
    buttonFontSize: compact ? 18 : landscapeGrid ? 22 : 27,
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
  /** Identity dashboard strip spanning the top of the screen (Workstream B). */
  identityBar: LayoutRect
  title: LayoutPoint & { fontSize: number }
  companyInfo: LayoutPoint & { fontSize: number }
  /** Compact snapshot row (employees/vehicles/reviews) below the identity bar. */
  snapshot: LayoutPoint & { fontSize: number }
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
    const titleFontSize = 15
    const companyInfoFontSize = 14
    const snapshotFontSize = 12
    const barPadding = 8
    const lineGap = 4

    const identityBarTop = edge
    const titleY = identityBarTop + barPadding + titleFontSize / 2
    const companyInfoY = titleY + titleFontSize / 2 + lineGap + companyInfoFontSize / 2
    const snapshotY = companyInfoY + companyInfoFontSize / 2 + lineGap + snapshotFontSize / 2
    const identityBarBottom = snapshotY + snapshotFontSize / 2 + barPadding
    const identityBar: LayoutRect = {
      left: edge,
      top: identityBarTop,
      width: viewport.width - edge * 2,
      height: identityBarBottom - identityBarTop,
    }

    const cardLeft = edge
    const cardTop = Math.round(identityBarBottom + 10)
    const cardWidth = Math.max(250, viewport.width - rightColumnWidth - edge * 3)
    const cardHeight = Math.max(160, viewport.height - cardTop - edge)
    const card: LayoutRect = { left: cardLeft, top: cardTop, width: cardWidth, height: cardHeight }
    const cardCenterX = card.left + card.width / 2
    const navCenterX = viewport.width - edge - rightColumnWidth / 2
    const navWidth = Math.max(MIN_TOUCH_TARGET_PX, rightColumnWidth - edge * 2)
    const navHeight = 54

    return {
      compactLandscape: true,
      identityBar,
      title: { x: centerX, y: titleY, fontSize: titleFontSize },
      companyInfo: { x: centerX, y: companyInfoY, fontSize: companyInfoFontSize },
      snapshot: { x: centerX, y: snapshotY, fontSize: snapshotFontSize },
      card,
      upgradeName: { x: cardCenterX, y: card.top + 30, fontSize: 20 },
      description: {
        x: cardCenterX,
        y: card.top + 66,
        fontSize: 13,
        wrapWidth: Math.max(190, card.width - 30),
      },
      status: { x: cardCenterX, y: card.top + 108, fontSize: 15 },
      purchase: {
        ...centeredRect(
          cardCenterX,
          Math.min(card.top + 152, card.top + card.height - 56),
          Math.min(280, card.width - 28),
          48,
        ),
        fontSize: 18,
      },
      feedback: {
        x: cardCenterX,
        y: card.top + card.height - 20,
        fontSize: 12,
        wrapWidth: Math.max(190, card.width - 30),
      },
      returnButton: centeredRect(navCenterX, viewport.height / 2 - 38, navWidth, navHeight),
      menuButton: centeredRect(navCenterX, viewport.height / 2 + 38, navWidth, navHeight),
      navFontSize: 18,
    }
  }

  const navHeight = 58
  const navWidth = Math.max(MIN_TOUCH_TARGET_PX, Math.min(330, viewport.width - edge * 2))

  const titleFontSize = clamp(Math.round(viewport.width * 0.045), 20, 26)
  const companyInfoFontSize = clamp(Math.round(viewport.width * 0.038), 16, 20)
  const snapshotFontSize = clamp(Math.round(viewport.width * 0.03), 13, 16)
  const barPadding = 14
  const lineGap = 8

  const identityBarTop = edge
  const titleY = identityBarTop + barPadding + titleFontSize / 2
  const companyInfoY = titleY + titleFontSize / 2 + lineGap + companyInfoFontSize / 2
  const snapshotY = companyInfoY + companyInfoFontSize / 2 + lineGap + snapshotFontSize / 2
  const identityBarBottom = snapshotY + snapshotFontSize / 2 + barPadding
  const identityBar: LayoutRect = {
    left: edge,
    top: identityBarTop,
    width: viewport.width - edge * 2,
    height: identityBarBottom - identityBarTop,
  }

  const cardWidth = Math.max(260, viewport.width - edge * 2)
  const cardTop = Math.round(identityBarBottom + 18)
  const reservedForNavAndManagement = navHeight * 2 + 14 + 66
  const cardHeight = clamp(
    viewport.height - cardTop - edge - reservedForNavAndManagement,
    190,
    280,
  )
  const card: LayoutRect = {
    left: centerX - cardWidth / 2,
    top: cardTop,
    width: cardWidth,
    height: cardHeight,
  }
  const cardCenterX = centerX

  return {
    compactLandscape: false,
    identityBar,
    title: { x: centerX, y: titleY, fontSize: titleFontSize },
    companyInfo: { x: centerX, y: companyInfoY, fontSize: companyInfoFontSize },
    snapshot: { x: centerX, y: snapshotY, fontSize: snapshotFontSize },
    card,
    upgradeName: {
      x: cardCenterX,
      y: card.top + 32,
      fontSize: clamp(Math.round(viewport.width * 0.055), 20, 28),
    },
    description: {
      x: cardCenterX,
      y: card.top + 70,
      fontSize: clamp(Math.round(viewport.width * 0.038), 15, 17),
      wrapWidth: Math.max(220, card.width - 44),
    },
    status: {
      x: cardCenterX,
      y: card.top + 118,
      fontSize: clamp(Math.round(viewport.width * 0.04), 16, 19),
    },
    purchase: {
      ...centeredRect(
        cardCenterX,
        Math.min(card.top + 164, card.top + card.height - 42),
        Math.min(300, card.width - 30),
        52,
      ),
      fontSize: 20,
    },
    feedback: {
      x: cardCenterX,
      y: card.top + card.height - 20,
      fontSize: clamp(Math.round(viewport.width * 0.032), 13, 16),
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
