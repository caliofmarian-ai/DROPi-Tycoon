import type Phaser from 'phaser'
import type { CompanyState, WorldState } from '../types/game'
import { getUrbanCargo, type UrbanObjective } from '../systems/urbanInteractions'
import {
  URBAN_BUILDINGS, URBAN_ROADS, URBAN_HQ, minimapPoint, inInteractionRange,
} from '../world/urbanWorld'
import { findWorldRoutePoint, WORLD_HEIGHT, WORLD_WIDTH, WORLD_ZONES } from '../world/worldLayout'
import { CITY_COLORS, COLORS, formatMoney, RADII, TYPOGRAPHY } from './theme'

type Direction = 'up' | 'down' | 'left' | 'right'
interface HUDCallbacks {
  action: () => void
  transport: () => void
  company: () => void
  menu: () => void
  save: () => void
  audio: () => void
  zoom: (direction: 'in' | 'out') => void
}

export const urbanHUDLayout = (width: number, height: number) => {
  const portrait = width < 600
  const headerHeight = portrait ? 80 : 52
  const size = Math.max(48, Math.min(72, Math.floor(Math.min(width, height) * 0.11)))
  const pad = { x: 14, y: height - size * 3 - 14, size }
  const actionWidth = Math.min(190, Math.max(156, width * 0.16))
  const action = { x: width - actionWidth / 2 - 12, y: height - 42, width: actionWidth, height: 56 }
  const mapWidth = Math.max(100, Math.min(210, Math.round(width * 0.16)))
  const minimap = { x: width - mapWidth - 16, y: headerHeight + 16, width: mapWidth, height: mapWidth * 0.75 }
  const gapLeft = pad.x + 3 * pad.size + 12
  const gapRight = action.x - action.width / 2 - 12
  const useBottomGap = gapRight - gapLeft >= 180
  return {
    headerHeight, portrait, pad, action,
    transport: { x: action.x, y: height - 104, width: action.width, height: 48 },
    minimap,
    zoom: { x: minimap.x + minimap.width / 2, y: minimap.y + minimap.height + 46, size: 44 },
    objective: { x: 12, y: headerHeight + 12, width: Math.min(560, minimap.x - 30), height: portrait ? 124 : 84 },
    menu: { x: width - 106, y: headerHeight + 24, width: 184, rowHeight: 44 },
    toast: {
      x: useBottomGap ? (gapLeft + gapRight) / 2 : width / 2,
      y: useBottomGap ? height - 94 : pad.y - 88,
      width: useBottomGap ? Math.min(430, gapRight - gapLeft) : width - 32,
      height: 72,
    },
  }
}

export const urbanStatusText = (world: WorldState, company: CompanyState): string => {
  const transport = world.urban?.activeTransport === 'bicycle' ? 'Bicycle' : 'Walking'
  const cargo = getUrbanCargo(world)
  return `${formatMoney(company.money)}  Rep ${company.reputation}  ${transport}  Cargo ${cargo.parcels.length}/${cargo.capacity}`
}

export const isUrbanHUDPoint = (width: number, height: number, x: number, y: number, menuOpen = false): boolean => {
  const l = urbanHUDLayout(width, height)
  const inside = (left: number, top: number, w: number, h: number) =>
    x >= left && x <= left + w && y >= top && y <= top + h
  return y <= l.headerHeight ||
    inside(l.objective.x, l.objective.y, l.objective.width, l.objective.height) ||
    inside(l.minimap.x - 6, l.minimap.y - 6, l.minimap.width + 12, l.minimap.height + 78) ||
    inside(l.pad.x - 6, l.pad.y - 6, l.pad.size * 3 + 12, l.pad.size * 3 + 12) ||
    inside(l.action.x - l.action.width / 2, l.transport.y - 24, l.action.width, 114) ||
    (menuOpen && inside(l.menu.x - l.menu.width / 2, l.menu.y - 22, l.menu.width, l.menu.rowHeight * 4))
}

export const urbanMapMarkers = (world: WorldState, objective: UrbanObjective, width: number, height: number) => ({
  player: minimapPoint(world.player, width, height),
  target: minimapPoint(objective.point, width, height),
  pickup: minimapPoint(findWorldRoutePoint(world.activeOrder.pickupLocation) ?? URBAN_HQ, width, height),
  hq: minimapPoint(URBAN_HQ, width, height),
})

export const urbanMapViewport = (
  view: { x: number; y: number; width: number; height: number }, width: number, height: number,
) => {
  const topLeft = minimapPoint(view, width, height)
  const bottomRight = minimapPoint({ x: view.x + view.width, y: view.y + view.height }, width, height)
  return { ...topLeft, width: Math.max(0, bottomRight.x - topLeft.x), height: Math.max(0, bottomRight.y - topLeft.y) }
}

export const urbanDistrictCaption = (point: { x: number; y: number }): string =>
  (WORLD_ZONES.find(zone => point.x >= zone.x && point.x <= zone.x + zone.width &&
    point.y >= zone.y && point.y <= zone.y + zone.height)?.label ?? 'Cedar City').toUpperCase()

/** Pointer ownership keeps releasing one finger from cancelling a second finger. */
export class UrbanDPadInput {
  private readonly held = new Map<number, Direction>()
  press(pointer: number, direction: Direction): void { this.held.set(pointer, direction) }
  release(pointer: number, direction?: Direction): void {
    if (direction === undefined || this.held.get(pointer) === direction) this.held.delete(pointer)
  }
  isHeld(direction: Direction): boolean { return [...this.held.values()].includes(direction) }
  clear(): void { this.held.clear() }
  value(): { x: number; y: number } {
    const directions = new Set(this.held.values())
    return {
      x: Number(directions.has('right')) - Number(directions.has('left')),
      y: Number(directions.has('down')) - Number(directions.has('up')),
    }
  }
}

interface HUDButton {
  button: Phaser.GameObjects.Graphics
  label: Phaser.GameObjects.Text
  paint: (active?: boolean) => void
}

export class UrbanHUD {
  private readonly scene: Phaser.Scene
  private readonly layer: Phaser.GameObjects.Layer
  private readonly layout
  private readonly pad = new UrbanDPadInput()
  private readonly stats: Phaser.GameObjects.Text
  private readonly objective: Phaser.GameObjects.Text
  private readonly hint: Phaser.GameObjects.Text
  private readonly actionControl: HUDButton
  private readonly transportControl: HUDButton
  private readonly toast: Phaser.GameObjects.Text
  private readonly mapPlayer: Phaser.GameObjects.Arc
  private readonly mapTarget: Phaser.GameObjects.Arc
  private readonly mapPickup: Phaser.GameObjects.Arc
  private readonly mapCaption: Phaser.GameObjects.Text
  private readonly mapViewport: Phaser.GameObjects.Graphics
  private readonly menuButtons: HUDButton[] = []
  private readonly directionButtons: { direction: Direction; control: HUDButton }[] = []
  private transportAvailable?: boolean
  private nearby?: boolean
  private open = false
  private toastTimer?: Phaser.Time.TimerEvent

  constructor(scene: Phaser.Scene, layer: Phaser.GameObjects.Layer, callbacks: HUDCallbacks) {
    this.scene = scene
    this.layer = layer
    const { width, height } = scene.scale
    this.layout = urbanHUDLayout(width, height)
    const { headerHeight, portrait } = this.layout
    this.panel(0, -14, width, headerHeight + 14)
    this.text(14, 5, 'DROPi', 26, COLORS.textPrimary).setFontStyle('bold')
      .setStroke('#07518a', 3)
    this.text(94, 13, 'Tycoon', 18, COLORS.textGold).setFontStyle('bold')
    this.stats = this.text(portrait ? 14 : 177, portrait ? 51 : 19, '', portrait ? 12 : 14, COLORS.textPrimary)
    this.button(width - 53, 25, 90, 44, '☰  Menu', () => this.toggleMenu())
    const mission = this.layout.objective
    this.panel(mission.x, mission.y, mission.width, mission.height)
    const parcel = this.add(scene.add.graphics()).setPosition(mission.x + 27, mission.y + 29)
    parcel.fillStyle(CITY_COLORS.parcel).fillRoundedRect(-16, -12, 32, 28, 4)
    parcel.fillStyle(CITY_COLORS.tape).fillRect(-3, -12, 7, 28)
    parcel.fillStyle(CITY_COLORS.cream).fillTriangle(-16, -12, 0, -20, 16, -12)
    parcel.lineStyle(2, COLORS.gold).strokeRoundedRect(-16, -12, 32, 28, 4)
    const textLeft = mission.x + 53
    this.objective = this.text(textLeft, mission.y + 12, '', portrait ? 14 : 17, COLORS.textPrimary)
      .setFontStyle('bold').setWordWrapWidth(mission.width - 62)
    this.hint = this.text(textLeft, mission.y + mission.height - (portrait ? 42 : 31), '', portrait ? 11 : 13, '#a5eaff')
      .setWordWrapWidth(mission.width - 62)
    this.drawMinimap()
    const map = this.layout.minimap
    this.mapViewport = this.add(scene.add.graphics())
    this.mapPickup = this.add(scene.add.circle(0, 0, 3, COLORS.accent).setStrokeStyle(1, COLORS.surface))
    this.mapTarget = this.add(scene.add.circle(0, 0, 5, COLORS.gold).setStrokeStyle(2, COLORS.surface))
    this.mapPlayer = this.add(scene.add.circle(0, 0, 4, CITY_COLORS.curb))
      .setStrokeStyle(2, COLORS.accentStrong)
    this.mapCaption = this.text(map.x + map.width / 2, map.y + map.height + 7, 'CEDAR CITY', 10, COLORS.textPrimary)
      .setOrigin(0.5, 0).setFontStyle('bold')
    const zoom = this.layout.zoom
    this.button(zoom.x - 26, zoom.y, zoom.size, zoom.size, '−', () => callbacks.zoom('out'))
    this.button(zoom.x + 26, zoom.y, zoom.size, zoom.size, '+', () => callbacks.zoom('in'))
    this.createDPad()
    const a = this.layout.action
    this.actionControl = this.button(a.x, a.y, a.width, a.height, '◉  Action', callbacks.action)
    this.actionControl.label.setFontSize(18)
    const t = this.layout.transport
    this.transportControl = this.button(t.x, t.y, t.width, t.height, 'Take bicycle', callbacks.transport)
    const toast = this.layout.toast
    this.toast = this.text(toast.x, toast.y, '', 12, COLORS.textPrimary)
      .setOrigin(0.5, 0).setAlign('center')
      .setWordWrapWidth(toast.width - 20).setFixedSize(toast.width, toast.height)
      .setBackgroundColor('#073354').setPadding(10, 7).setVisible(false)
    const rows: [string, () => void][] = [
      ['Company', callbacks.company], ['Save progress', callbacks.save],
      ['Toggle sound', callbacks.audio], ['Main menu', callbacks.menu],
    ]
    rows.forEach(([label, onTap], index) => {
      const m = this.layout.menu
      const entry = this.button(m.x, m.y + index * m.rowHeight, m.width, m.rowHeight, label, () => {
        this.toggleMenu()
        onTap()
      })
      entry.button.setVisible(false).disableInteractive()
      entry.label.setVisible(false)
      this.menuButtons.push(entry)
    })
    scene.input.on('pointerup', this.releasePointer)
    scene.input.on('pointerupoutside', this.releasePointer)
    scene.input.on('gameout', this.clearMovement)
  }

  private add<T extends Phaser.GameObjects.GameObject>(object: T): T {
    this.layer.add(object)
    return object
  }

  private text(x: number, y: number, value: string, size: number, color: string): Phaser.GameObjects.Text {
    return this.add(this.scene.add.text(x, y, value, { fontFamily: TYPOGRAPHY.family, fontSize: `${size}px`, color }))
  }

  private panel(x: number, y: number, width: number, height: number): void {
    const g = this.add(this.scene.add.graphics())
    g.fillStyle(CITY_COLORS.shadow, 0.3).fillRoundedRect(x + 2, y + 4, width, height, RADII.panel)
    g.fillStyle(COLORS.surface, 0.97).fillRoundedRect(x, y, width, height, RADII.panel)
    g.lineStyle(2, COLORS.accent, 0.9).strokeRoundedRect(x, y, width, height, RADII.panel)
    g.lineStyle(1, COLORS.accent, 0.2).lineBetween(x + 16, y + 4, x + width - 16, y + 4)
  }

  private button(x: number, y: number, width: number, height: number, label: string, callback: () => void): HUDButton {
    const button = this.add(this.scene.add.graphics()).setPosition(x, y)
    const paint = (active = false): void => {
      button.clear().fillStyle(CITY_COLORS.shadow, 0.3).fillRoundedRect(-width / 2 + 2, -height / 2 + 3, width, height, RADII.button)
      button.fillStyle(active ? COLORS.accentStrong : COLORS.surfaceRaised, 0.98)
        .fillRoundedRect(-width / 2, -height / 2, width, height, RADII.button)
      button.lineStyle(2, active ? COLORS.gold : COLORS.accent).strokeRoundedRect(-width / 2, -height / 2, width, height, RADII.button)
      button.lineStyle(1, COLORS.accent, 0.3).lineBetween(-width / 2 + 12, -height / 2 + 4, width / 2 - 12, -height / 2 + 4)
    }
    paint()
    button.setInteractive(
      { x: -width / 2, y: -height / 2, width, height },
      (area: { x: number; y: number; width: number; height: number }, px: number, py: number) =>
        px >= area.x && px <= area.x + area.width && py >= area.y && py <= area.y + area.height,
    )
    const text = this.text(x, y, label, 14, COLORS.textPrimary).setOrigin(0.5).setAlign('center')
      .setFontStyle('bold').setWordWrapWidth(width - 12)
    button.on('pointerdown', (_pointer: Phaser.Input.Pointer, _x: number, _y: number, event: Phaser.Types.Input.EventData) => {
      event.stopPropagation()
      callback()
    })
    return { button, label: text, paint }
  }

  private createDPad(): void {
    const { x, y, size } = this.layout.pad
    const center = size * 1.5
    this.add(this.scene.add.circle(x + center, y + center, center + 5, COLORS.surface, 0.35))
      .setStrokeStyle(2, COLORS.accent, 0.6)
    const directions: [Direction, number, number, string][] = [
      ['up', 1, 0, '▲'], ['left', 0, 1, '◀'], ['right', 2, 1, '▶'], ['down', 1, 2, '▼'],
    ]
    directions.forEach(([direction, col, row, label]) => {
      const b = this.button(x + col * size + size / 2, y + row * size + size / 2, size - 2, size - 2, label, () => {})
      this.directionButtons.push({ direction, control: b })
      b.label.setFontSize(23)
      const press = (pointer: Phaser.Input.Pointer): void => {
        if (!this.open) { this.pad.press(pointer.id, direction); this.paintDirections() }
      }
      b.button.on('pointerdown', press)
      b.button.on('pointerover', (pointer: Phaser.Input.Pointer) => { if (pointer.isDown) press(pointer) })
      b.button.on('pointerout', (pointer: Phaser.Input.Pointer) => {
        this.pad.release(pointer.id, direction)
        this.paintDirections()
      })
      b.button.on('pointerup', this.releasePointer)
    })
    this.add(this.scene.add.circle(x + center, y + center, size * 0.26, COLORS.accent, 0.24))
      .setStrokeStyle(2, CITY_COLORS.curb)
  }

  private drawMinimap(): void {
    const { x, y, width, height } = this.layout.minimap
    this.panel(x - 5, y - 5, width + 10, height + 30)
    const g = this.add(this.scene.add.graphics())
    g.fillStyle(CITY_COLORS.grass).fillRect(x, y, width, height)
    for (const district of WORLD_ZONES) {
      const p = minimapPoint(district, width, height)
      g.fillStyle(district.fillColor, 0.5)
        .fillRect(x + p.x, y + p.y, district.width / WORLD_WIDTH * width, district.height / WORLD_HEIGHT * height)
    }
    for (const road of URBAN_ROADS) {
      const p = minimapPoint(road, width, height)
      const w = road.width / WORLD_WIDTH * width
      const h = road.height / WORLD_HEIGHT * height
      g.fillStyle(CITY_COLORS.sidewalk).fillRect(x + p.x - w / 2 - 1, y + p.y - h / 2 - 1, w + 2, h + 2)
      g.fillStyle(CITY_COLORS.road).fillRect(x + p.x - w / 2, y + p.y - h / 2, w, h)
    }
    for (const building of URBAN_BUILDINGS) {
      const p = minimapPoint(building, width, height)
      const w = building.width / WORLD_WIDTH * width
      const h = building.height / WORLD_HEIGHT * height
      g.fillStyle(building.kind === 'hq' ? COLORS.accentStrong : CITY_COLORS.cream)
        .fillRect(x + p.x - w / 2, y + p.y - h / 2, w, h)
    }
    const hq = minimapPoint(URBAN_HQ, width, height)
    this.text(x + hq.x - 6, y + hq.y - 14, 'H', 11, COLORS.textPrimary).setFontStyle('bold').setStroke('#073354', 3)
    this.text(x + width - 8, y + 3, 'N', 11, COLORS.textPrimary).setOrigin(0.5, 0).setStroke('#073354', 3)
  }

  update(
    world: WorldState, company: CompanyState, objective: UrbanObjective,
    cameraView?: { x: number; y: number; width: number; height: number },
  ): void {
    this.stats.setText(urbanStatusText(world, company))
    const available = this.layout.portrait ? this.scene.scale.width - 28 : this.scene.scale.width - 285
    this.stats.setScale(Math.min(1, available / Math.max(1, this.stats.width)))
    this.objective.setText(objective.title.toUpperCase())
    const dx = objective.point.x - world.player.x
    const dy = objective.point.y - world.player.y
    const nearby = inInteractionRange(world.player, objective.point)
    const bearing = `${dy < -35 ? 'N' : dy > 35 ? 'S' : ''}${dx < -35 ? 'W' : dx > 35 ? 'E' : ''}`
    this.hint.setText(nearby ? 'You are here • Action' : `${bearing} • ${Math.round(Math.hypot(dx, dy))} units\nFollow streets`)
    this.actionControl.label.setText('◉  Action')
    if (nearby !== this.nearby) {
      this.nearby = nearby
      this.actionControl.paint(nearby)
    }
    const atHQ = inInteractionRange(world.player, URBAN_HQ)
    this.transportControl.label.setText(world.urban?.activeTransport === 'bicycle' ? 'Park bicycle' : 'Take bicycle')
    if (atHQ !== this.transportAvailable) {
      this.transportAvailable = atHQ
      this.transportControl.button.setVisible(atHQ)
      this.transportControl.label.setVisible(atHQ)
      if (this.transportControl.button.input) this.transportControl.button.input.enabled = atHQ
    }
    const map = this.layout.minimap
    const markers = urbanMapMarkers(world, objective, map.width, map.height)
    this.mapPlayer.setPosition(map.x + markers.player.x, map.y + markers.player.y)
    this.mapTarget.setPosition(map.x + markers.target.x, map.y + markers.target.y)
    this.mapPickup.setPosition(map.x + markers.pickup.x, map.y + markers.pickup.y)
      .setVisible(world.activeOrder.status === 'Accepted')
    this.mapCaption.setText(urbanDistrictCaption(world.player))
    this.mapCaption.setScale(Math.min(1, map.width / Math.max(1, this.mapCaption.width)))
    if (cameraView) {
      const view = urbanMapViewport(cameraView, map.width, map.height)
      this.mapViewport.clear().lineStyle(1, CITY_COLORS.curb, 0.9)
        .strokeRect(map.x + view.x, map.y + view.y, view.width, view.height)
    }
  }

  notify(message: string): void {
    this.toastTimer?.remove()
    this.toast.setText(message).setVisible(true)
    this.toastTimer = this.scene.time.delayedCall(4800, () => this.toast.setVisible(false))
  }

  toggleMenu(): void {
    this.open = !this.open
    this.clearMovement()
    this.menuButtons.forEach(({ button, label }) => {
      button.setVisible(this.open)
      label.setVisible(this.open)
      if (button.input) button.input.enabled = this.open
    })
  }

  isMenuOpen(): boolean { return this.open }
  movement(): { x: number; y: number } { return this.pad.value() }
  readonly clearMovement = (): void => {
    this.pad.clear()
    this.paintDirections()
  }
  private paintDirections(): void {
    this.directionButtons.forEach(({ direction, control }) => control.paint(this.pad.isHeld(direction)))
  }
  private readonly releasePointer = (pointer: Phaser.Input.Pointer): void => {
    this.pad.release(pointer.id)
    this.paintDirections()
  }

  destroy(): void {
    this.clearMovement()
    this.toastTimer?.remove()
    this.scene.input.off('pointerup', this.releasePointer)
    this.scene.input.off('pointerupoutside', this.releasePointer)
    this.scene.input.off('gameout', this.clearMovement)
  }
}
