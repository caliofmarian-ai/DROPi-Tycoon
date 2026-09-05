import type Phaser from 'phaser'
import type { CompanyState } from '../types/game'
import type { buildManagementLayout } from './managementLayout'
import type { LayoutRect } from './mobileViewport'
import { COLORS, formatMoney } from './theme'
import { createThemedButton, drawPanel, fitText, paintBackdrop } from './themeControls'

type Shell = ReturnType<typeof buildManagementLayout>

export const drawManagementHeader = (
  scene: Phaser.Scene, shell: Shell, title: string, company: CompanyState, subtitle: string,
): void => {
  paintBackdrop(scene, scene.scale.width, scene.scale.height)
  const r = shell.header
  drawPanel(scene, r, { tone: 'accent', radius: 16 })
  fitText(scene, { left: r.left + 14, top: r.top + 7, width: 80, height: 28 },
    'DROPi', 26, '#ffffff', true)
  const moneyWidth = Math.min(240, r.width - 116)
  fitText(scene, { left: r.left + r.width - moneyWidth - 14, top: r.top + 8, width: moneyWidth, height: 26 },
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

/** Catalogs page on deliberate body swipes/scrolls; buttons remain the sole owners of their taps. */
export const bindManagementPaging = (
  scene: Phaser.Scene, getBody: () => LayoutRect, changePage: (delta: number) => void,
): void => {
  let gesture: { id: number; x: number; y: number } | null = null
  let lastWheelAt = -Infinity
  const inside = (pointer: Phaser.Input.Pointer) => {
    const rect = getBody()
    return pointer.x >= rect.left && pointer.x <= rect.left + rect.width
      && pointer.y >= rect.top && pointer.y <= rect.top + rect.height
  }
  const start = (pointer: Phaser.Input.Pointer) => {
    gesture = inside(pointer) ? { id: pointer.id, x: pointer.x, y: pointer.y } : null
  }
  const cancel = () => { gesture = null }
  const end = (pointer: Phaser.Input.Pointer) => {
    const origin = gesture
    gesture = null
    if (!origin || origin.id !== pointer.id || !inside(pointer)) return
    const dx = origin.x - pointer.x
    const dy = origin.y - pointer.y
    const distance = Math.abs(dx) > Math.abs(dy) ? dx : dy
    if (Math.abs(distance) >= 48) changePage(Math.sign(distance))
  }
  const wheel = (
    pointer: Phaser.Input.Pointer, _objects: Phaser.GameObjects.GameObject[], dx: number, dy: number,
  ) => {
    const distance = Math.abs(dx) > Math.abs(dy) ? dx : dy
    if (!inside(pointer) || Math.abs(distance) < 4 || scene.time.now - lastWheelAt < 180) return
    lastWheelAt = scene.time.now
    changePage(Math.sign(distance))
  }
  scene.input.on('pointerdown', start)
  scene.input.on('pointerup', end)
  scene.input.on('pointerupoutside', cancel)
  scene.input.on('wheel', wheel)
  scene.scale.on('resize', cancel)
  scene.events.once('shutdown', () => {
    scene.input.off('pointerdown', start)
    scene.input.off('pointerup', end)
    scene.input.off('pointerupoutside', cancel)
    scene.input.off('wheel', wheel)
    scene.scale.off('resize', cancel)
  })
}
