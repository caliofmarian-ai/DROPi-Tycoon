import type Phaser from 'phaser'
import type { CompanyState } from '../types/game'
import type { buildManagementLayout } from './managementLayout'
import { COLORS, formatMoney } from './theme'
import { createThemedButton, drawPanel, fitText, paintBackdrop } from './themeControls'

type Shell = ReturnType<typeof buildManagementLayout>

export const drawManagementHeader = (
  scene: Phaser.Scene, shell: Shell, title: string, company: CompanyState, subtitle: string,
): void => {
  paintBackdrop(scene, scene.scale.width, scene.scale.height)
  const r = shell.header
  drawPanel(scene, r, { tone: 'accent', radius: 16 })
  fitText(scene, { left: r.left + 14, top: r.top + 7, width: 120, height: 28 },
    'DROPi', 26, '#ffffff', true)
  fitText(scene, { left: r.left + r.width - 164, top: r.top + 8, width: 150, height: 26 },
    formatMoney(company.money), 21, COLORS.textGold, true, 'right')
  const titleWidth = shell.compactLandscape ? r.width * 0.45 : r.width - 28
  fitText(scene, { left: r.left + 14, top: r.top + 36, width: titleWidth, height: 22 },
    title, 19, '#ffffff', true)
  fitText(scene, shell.compactLandscape
    ? { left: r.left + titleWidth + 24, top: r.top + 36, width: r.width - titleWidth - 38, height: 22 }
    : { left: r.left + 14, top: r.top + 61, width: r.width - 28, height: 19 },
  subtitle, 13, COLORS.textSecondary, false, shell.compactLandscape ? 'right' : 'left')
}

export const drawManagementFooter = (
  scene: Phaser.Scene, shell: Shell, primary: { label: string; action: () => void },
  menu: () => void,
  paging?: { page: number; pageCount: number; hasPrevious: boolean; hasNext: boolean; change: (delta: number) => void },
): void => {
  createThemedButton(scene, shell.navigation[0], primary.label, 'primary', primary.action)
  createThemedButton(scene, shell.navigation.at(-1)!, 'Menu', 'primary', menu)
  if (!paging) return
  createThemedButton(scene, shell.navigation[1], '‹', 'primary', () => paging.change(-1), { fontSize: 26 })
    .setEnabled(paging.hasPrevious)
  createThemedButton(scene, shell.navigation[2], '›', 'primary', () => paging.change(1), { fontSize: 26 })
    .setEnabled(paging.hasNext)
  fitText(scene, shell.pageLabel, `${paging.page + 1}/${paging.pageCount}`, 13, COLORS.textSecondary, false, 'center')
}
