import { isCompactLandscape, normalizeViewport, type LayoutRect } from './mobileViewport'

export const insetRect = (rect: LayoutRect, inset: number): LayoutRect => ({
  left: rect.left + inset,
  top: rect.top + inset,
  width: rect.width - inset * 2,
  height: rect.height - inset * 2,
})

export const splitColumns = (rect: LayoutRect, count: number, gap = 12): LayoutRect[] =>
  Array.from({ length: count }, (_, index) => ({
    left: rect.left + index * ((rect.width - gap * (count - 1)) / count + gap),
    top: rect.top,
    width: (rect.width - gap * (count - 1)) / count,
    height: rect.height,
  }))

export const buildManagementLayout = (width: number, height: number, paged = false) => {
  const viewport = normalizeViewport(width, height)
  const compactLandscape = isCompactLandscape(width, height)
  const edge = 12
  const contentWidth = Math.min(1040, viewport.width - edge * 2)
  const left = (viewport.width - contentWidth) / 2
  const header = { left, top: edge, width: contentWidth, height: compactLandscape ? 64 : 88 }
  const footer = { left, top: viewport.height - 60, width: contentWidth, height: 48 }
  const body = { left, top: header.top + header.height + 12, width: contentWidth,
    height: footer.top - header.top - header.height - 24 }
  const backWidth = contentWidth < 320 ? 76 : 84
  const menuWidth = contentWidth < 320 ? 60 : 84
  const navigation = paged
    ? [
      { ...footer, width: backWidth },
      { ...footer, left: left + backWidth + 8, width: 48 },
      { ...footer, left: left + contentWidth - menuWidth - 56, width: 48 },
      { ...footer, left: left + contentWidth - menuWidth, width: menuWidth },
    ]
    : splitColumns(footer, 2)
  return { compactLandscape, header, body, footer, navigation,
    pageLabel: { left: left + backWidth + 64, top: footer.top,
      width: contentWidth - backWidth - menuWidth - 128, height: 48 } }
}

export const buildManagementCards = (width: number, height: number) => {
  const shell = buildManagementLayout(width, height, true)
  const columns = width >= 600 ? 2 : 1
  const rows = columns === 1 && shell.body.height >= 440 ? 2 : 1
  const rowHeight = (shell.body.height - (rows - 1) * 12) / rows
  const cards = Array.from({ length: rows }, (_, index) =>
    splitColumns({ ...shell.body, top: shell.body.top + index * (rowHeight + 12), height: rowHeight }, columns),
  ).flat()
  return { ...shell, cards, pageSize: cards.length }
}

export const buildVehicleCardLayout = (card: LayoutRect) => {
  const inner = insetRect(card, 12)
  const identityHeight = 58
  const artWidth = Math.min(102, inner.width * 0.34)
  const identity = { left: inner.left + artWidth + 10, top: inner.top,
    width: inner.width - artWidth - 10, height: identityHeight }
  const art = { left: inner.left, top: inner.top, width: artWidth, height: identityHeight }
  const purchase = { ...inner, top: inner.top + inner.height - 48, height: 48 }
  const economics = { ...inner, top: purchase.top - 29, height: 23 }
  const capabilities = splitColumns({ ...inner, top: inner.top + identityHeight + 8, height: 33 }, 2)
  return { art, identity, capabilities, economics, purchase }
}

export const buildCompanyDashboardLayout = (width: number, height: number) => {
  const shell = buildManagementLayout(width, height)
  const wide = width >= 600
  const hq = wide
    ? { ...shell.body, width: (shell.body.width - 12) * 0.46 }
    : { ...shell.body, height: Math.min(230, shell.body.height * 0.44) }
  const details = wide
    ? { ...shell.body, left: hq.left + hq.width + 12, width: shell.body.width - hq.width - 12 }
    : { ...shell.body, top: hq.top + hq.height + 12, height: shell.body.height - hq.height - 12 }
  const statsHeight = Math.min(100, details.height * 0.45)
  const stats = splitColumns({ ...details, height: statsHeight }, 2)
  const review = { ...details, top: details.top + statsHeight + 12, height: details.height - statsHeight - 12 }
  return { ...shell, hq, stats, review }
}

export const buildStaffCardLayout = (body: LayoutRect) => {
  const panel = { ...body, height: Math.min(380, body.height) }
  const inner = insetRect(panel, 12)
  const avatarSize = inner.height >= 260 ? 108 : 76
  const avatar = { ...inner, width: avatarSize, height: avatarSize }
  const identity = { left: avatar.left + avatar.width + 16, top: inner.top,
    width: inner.width - avatar.width - 16, height: avatar.height }
  const action = { ...inner, top: inner.top + inner.height - 48, height: 48 }
  const salary = { ...inner, top: avatar.top + avatar.height + 12, height: 22 }
  const note = { ...inner, top: salary.top + 30, height: Math.max(0, action.top - salary.top - 42) }
  return { panel, avatar, identity, salary, note, action }
}

export const buildFinanceDashboardLayout = (width: number, height: number) => {
  const shell = buildManagementLayout(width, height)
  const columns = shell.compactLandscape ? 4 : 2
  const rowHeight = shell.compactLandscape ? 72 : 86
  const metrics = Array.from({ length: 4 / columns }, (_, row) =>
    splitColumns({ ...shell.body, top: shell.body.top + row * (rowHeight + 12), height: rowHeight }, columns),
  ).flat()
  const metricsBottom = metrics.at(-1)!.top + rowHeight
  const remainder = { ...shell.body, top: metricsBottom + 12,
    height: shell.body.top + shell.body.height - metricsBottom - 12 }
  const operations = shell.compactLandscape
    ? { ...remainder, width: remainder.width * 0.59 }
    : { ...remainder, height: Math.min(144, remainder.height - 60) }
  const action = shell.compactLandscape
    ? { left: operations.left + operations.width + 12, top: remainder.top + remainder.height - 48,
      width: remainder.width - operations.width - 12, height: 48 }
    : { ...remainder, top: operations.top + operations.height + 12, height: 48 }
  return { ...shell, metrics, operations, action }
}
