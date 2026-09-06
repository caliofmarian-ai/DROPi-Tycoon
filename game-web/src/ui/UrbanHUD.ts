import type Phaser from 'phaser'
import type { CompanyState, WorldState } from '../types/game'
import {
  ACTIVE_TRANSPORT_LABELS, availableActiveTransports, nextActiveTransport,
} from '../systems/activeTransportSystem'
import { getUrbanCargo, type UrbanObjective } from '../systems/urbanInteractions'
import {
  URBAN_BUILDINGS, URBAN_ROADS, URBAN_HQ, minimapPoint, inInteractionRange,
} from '../world/urbanWorld'
import { findWorldRoutePoint, WORLD_HEIGHT, WORLD_WIDTH, WORLD_ZONES } from '../world/worldLayout'
import { AnalogJoystickInput } from './AnalogJoystick'
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

/**
 * Issue #338: the compact 96-108 px footprint now contains a true analog thumb joystick.
 * One Android-safe Rectangle owns touch input while the circular chrome/knob remain visual only.
 */
export const urbanHUDLayout = (width: number, height: number) => {
  const portrait = width < 600
  const headerHeight = portrait ? 72 : 44
  const size = Math.max(32, Math.min(36, Math.floor(Math.min(width, height) * 0.09)))
  const pad = { x: 10, y: height - size * 3 - 10, size }
  const actionWidth = Math.min(150, Math.max(124, width * 0.15))
  const action = { x: width - actionWidth / 2 - 10, y: height - 34, width: actionWidth, height: 46 }
  const mapWidth = Math.max(88, Math.min(150, Math.round(width * 0.13)))
  const minimap = { x: width - mapWidth - 12, y: headerHeight + 10, width: mapWidth, height: mapWidth * 0.75 }
  const objectiveWidth = portrait
    ? Math.max(150, minimap.x - 30)
    : Math.min(360, Math.max(220, minimap.x - 32))
  const objectiveHeight = portrait ? 82 : 52
  const gapLeft = pad.x + 3 * pad.size + 10
  const gapRight = action.x - action.width / 2 - 10
  const useBottomGap = gapRight - gapLeft >= 170
  return {
    headerHeight, portrait, pad, action,
    transport: { x: action.x, y: height - 82, width: action.width, height: 44 },
    minimap,
    zoom: { x: minimap.x + minimap.width / 2, y: minimap.y + minimap.height + 34, size: 36 },
    objective: { x: 10, y: headerHeight + 6, width: objectiveWidth, height: objectiveHeight },
    menu: { x: width - 94, y: headerHeight + 22, width: 160, rowHeight: 44 },
    toast: {
      x: useBottomGap ? (gapLeft + gapRight) / 2 : width / 2,
      y: useBottomGap ? height - 76 : pad.y - 72,
      width: useBottomGap ? Math.min(400, gapRight - gapLeft) : width - 28,
      height: 60,
    },
  }
}

export const urbanStatusText = (world: WorldState, company: CompanyState): string => {
  const transport = ACTIVE_TRANSPORT_LABELS[world.urban?.activeTransport ?? 'walking']
  const cargo = getUrbanCargo(world)
  return `${formatMoney(company.money)}  Rep ${company.reputation}  ${transport}  Cargo ${cargo.parcels.length}/${cargo.capacity}`
}

export const isUrbanHUDPoint = (width: number, height: number, x: number, y: number, menuOpen = false): boolean => {
  const l = urbanHUDLayout(width, height)
  const inside = (left: number, top: number, w: number, h: number) =>
    x >= left && x <= left + w && y >= top && y <= top + h
  return y <= l.headerHeight ||
    inside(l.objective.x, l.objective.y, l.objective.width, l.objective.height) ||
    inside(l.minimap.x - 5, l.minimap.y - 5, l.minimap.width + 10, l.minimap.height + 62) ||
    inside(l.pad.x - 5, l.pad.y - 5, l.pad.size * 3 + 10, l.pad.size * 3 + 10) ||
    inside(l.action.x - l.action.width / 2, l.transport.y - 22, l.action.width, 94) ||
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

/** Legacy exported cardinal model retained only for backward compatibility/tests; Android runtime uses analog input. */
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

/** Legacy cardinal helper retained for Save/test compatibility; runtime joystick no longer calls it. */
export const directionFromDPadPoint = (x: number, y: number, extent: number): Direction | null => {
  if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(extent) || extent <= 0 ||
      x < 0 || y < 0 || x > extent || y > extent) return null
  const center = extent / 2
  const dx = x - center
  const dy = y - center
  if (Math.hypot(dx, dy) <= extent * 0.14) return null
  return Math.abs(dx) > Math.abs(dy)
    ? dx < 0 ? 'left' : 'right'
    : dy < 0 ? 'up' : 'down'
}

interface HUDButton {
  button: Phaser.GameObjects.Rectangle
  chrome: Phaser.GameObjects.Graphics
  label: Phaser.GameObjects.Text
  paint: (active?: boolean) => void
  setVisible: (visible: boolean) => void
  setEnabled: (enabled: boolean) => void
}

export class UrbanHUD {
  private readonly scene: Phaser.Scene
  private readonly layer: Phaser.GameObjects.Layer
  private readonly layout
  private readonly pad = new AnalogJoystickInput()
  private joystickKnob!: Phaser.GameObjects.Arc
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
    const dropi = this.text(14, 4, 'DROPi', portrait ? 23 : 24, COLORS.textPrimary).setFontStyle('bold')
      .setStroke('#07518a', 3)
    const tycoon = this.text(dropi.x + dropi.width + 7, portrait ? 10 : 9, 'Tycoon', portrait ? 15 : 16, COLORS.textGold)
      .setFontStyle('bold')
    const statsLeft = tycoon.x + tycoon.width + 20
    this.stats = this.text(portrait ? 14 : statsLeft, portrait ? 44 : 15, '', portrait ? 11 : 12, COLORS.textPrimary)
    this.button(width - 47, headerHeight / 2, 78, 36, '☰  Menu', () => this.toggleMenu())

    const mission = this.layout.objective
    this.panel(mission.x, mission.y, mission.width, mission.height)
    const parcel = this.add(scene.add.graphics()).setPosition(mission.x + 21, mission.y + mission.height / 2)
    parcel.fillStyle(CITY_COLORS.parcel).fillRoundedRect(-11, -9, 22, 19, 3)
    parcel.fillStyle(CITY_COLORS.tape).fillRect(-2, -9, 4, 19)
    parcel.fillStyle(CITY_COLORS.cream).fillTriangle(-11, -9, 0, -14, 11, -9)
    parcel.lineStyle(1, COLORS.gold).strokeRoundedRect(-11, -9, 22, 19, 3)
    const textLeft = mission.x + 41
    this.objective = this.text(textLeft, mission.y + 7, '', portrait ? 12 : 14, COLORS.textPrimary)
      .setFontStyle('bold').setWordWrapWidth(mission.width - 49)
    this.hint = this.text(textLeft, mission.y + mission.height - (portrait ? 31 : 18), '', 10, '#a5eaff')
      .setWordWrapWidth(mission.width - 49)

    this.drawMinimap()
    const map = this.layout.minimap
    this.mapViewport = this.add(scene.add.graphics())
    this.mapPickup = this.add(scene.add.circle(0, 0, 3, COLORS.accent).setStrokeStyle(1, COLORS.surface))
    this.mapTarget = this.add(scene.add.circle(0, 0, 5, COLORS.gold).setStrokeStyle(2, COLORS.surface))
    this.mapPlayer = this.add(scene.add.circle(0, 0, 4, CITY_COLORS.curb))
      .setStrokeStyle(2, COLORS.accentStrong)
    this.mapCaption = this.text(map.x + map.width / 2, map.y + map.height + 5, 'CEDAR CITY', 9, COLORS.textPrimary)
      .setOrigin(0.5, 0).setFontStyle('bold')
    const zoom = this.layout.zoom
    this.button(zoom.x - 22, zoom.y, zoom.size, zoom.size, '−', () => callbacks.zoom('out'))
    this.button(zoom.x + 22, zoom.y, zoom.size, zoom.size, '+', () => callbacks.zoom('in'))

    this.createDPad()
    const a = this.layout.action
    this.actionControl = this.button(a.x, a.y, a.width, a.height, '• Action', callbacks.action)
    this.actionControl.label.setFontSize(15)
    const t = this.layout.transport
    this.transportControl = this.button(t.x, t.y, t.width, t.height, 'Switch vehicle', callbacks.transport)
    this.transportControl.label.setFontSize(11)
    this.transportControl.setVisible(false)
    this.transportControl.setEnabled(false)

    const toast = this.layout.toast
    this.toast = this.text(toast.x, toast.y, '', 11, COLORS.textPrimary)
      .setOrigin(0.5, 0).setAlign('center')
      .setWordWrapWidth(toast.width - 18).setFixedSize(toast.width, toast.height)
      .setBackgroundColor('#073354').setPadding(9, 6).setVisible(false)
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
      entry.setVisible(false)
      entry.setEnabled(false)
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
    g.fillStyle(CITY_COLORS.shadow, 0.26).fillRoundedRect(x + 2, y + 3, width, height, RADII.panel)
    g.fillStyle(COLORS.surface, 0.93).fillRoundedRect(x, y, width, height, RADII.panel)
    g.lineStyle(2, COLORS.accent, 0.88).strokeRoundedRect(x, y, width, height, RADII.panel)
  }

  /**
   * Android WebView touch input uses a native Rectangle hit target. Visual chrome stays on Graphics,
   * but Graphics are never responsible for hit testing. Keep this #323 recovery contract intact.
   * Ordinary compact buttons still expose a minimum 44x44 logical-pixel hit target.
   */
  private button(
    x: number, y: number, width: number, height: number, label: string,
    callback?: () => void, interactive = true,
  ): HUDButton {
    const chrome = this.add(this.scene.add.graphics()).setPosition(x, y)
    const paint = (active = false): void => {
      chrome.clear().fillStyle(CITY_COLORS.shadow, 0.25).fillRoundedRect(-width / 2 + 2, -height / 2 + 2, width, height, RADII.button)
      chrome.fillStyle(active ? COLORS.accentStrong : COLORS.surfaceRaised, 0.95)
        .fillRoundedRect(-width / 2, -height / 2, width, height, RADII.button)
      chrome.lineStyle(2, active ? COLORS.gold : COLORS.accent).strokeRoundedRect(-width / 2, -height / 2, width, height, RADII.button)
    }
    paint()
    const hitWidth = interactive ? Math.max(44, width) : width
    const hitHeight = interactive ? Math.max(44, height) : height
    const button = this.add(this.scene.add.rectangle(x, y, hitWidth, hitHeight, 0xffffff, 0.001))
    if (interactive) button.setInteractive({ useHandCursor: true })
    const text = this.text(x, y, label, 12, COLORS.textPrimary).setOrigin(0.5).setAlign('center')
      .setFontStyle('bold').setWordWrapWidth(width - 10)
    if (interactive && callback) button.on('pointerdown', callback)
    const setVisible = (visible: boolean): void => {
      chrome.setVisible(visible)
      button.setVisible(visible)
      text.setVisible(visible)
    }
    const setEnabled = (enabled: boolean): void => {
      if (button.input) button.input.enabled = enabled
    }
    return { button, chrome, label: text, paint, setVisible, setEnabled }
  }

  /** Runtime name retained to minimize churn; visually/behaviorally this is the #338 analog joystick. */
  private createDPad(): void {
    const { x, y, size } = this.layout.pad
    const extent = size * 3
    const center = extent / 2
    const centerX = x + center
    const centerY = y + center
    const radius = center - 5
    this.add(this.scene.add.circle(centerX, centerY, radius + 3, COLORS.surface, 0.42))
      .setStrokeStyle(2, COLORS.accent, 0.72)
    this.add(this.scene.add.circle(centerX, centerY, radius * 0.63, COLORS.surfaceRaised, 0.32))
      .setStrokeStyle(1, CITY_COLORS.curb, 0.7)
    this.joystickKnob = this.add(this.scene.add.circle(centerX, centerY, Math.max(13, size * 0.43), COLORS.accentStrong, 0.96))
      .setStrokeStyle(2, COLORS.gold, 0.92)

    // #323/#339 invariant: a native Rectangle owns joystick touch input; Graphics never hit-test.
    const hit = this.add(this.scene.add.rectangle(x + center, y + center, extent, extent, 0xffffff, 0.001))
      .setInteractive({ useHandCursor: true })
    const press = (pointer: Phaser.Input.Pointer): void => {
      if (this.open) return
      this.pad.begin(pointer.id, pointer.x - centerX, pointer.y - centerY, radius)
      this.paintJoystick(centerX, centerY)
    }
    hit.on('pointerdown', press)
    hit.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (!pointer.isDown || !this.pad.owns(pointer.id)) return
      this.pad.move(pointer.id, pointer.x - centerX, pointer.y - centerY, radius)
      this.paintJoystick(centerX, centerY)
    })
    hit.on('pointerout', this.releasePointer)
    hit.on('pointerup', this.releasePointer)
  }

  private paintJoystick(centerX?: number, centerY?: number): void {
    if (!this.joystickKnob) return
    const { x, y, size } = this.layout.pad
    const center = size * 1.5
    const baseX = centerX ?? x + center
    const baseY = centerY ?? y + center
    const knob = this.pad.knobOffset()
    this.joystickKnob.setPosition(baseX + knob.x, baseY + knob.y)
  }

  private drawMinimap(): void {
    const { x, y, width, height } = this.layout.minimap
    this.panel(x - 4, y - 4, width + 8, height + 24)
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
    this.text(x + hq.x - 5, y + hq.y - 12, 'H', 9, COLORS.textPrimary).setFontStyle('bold').setStroke('#073354', 2)
    this.text(x + width - 7, y + 2, 'N', 9, COLORS.textPrimary).setOrigin(0.5, 0).setStroke('#073354', 2)
  }

  update(
    world: WorldState, company: CompanyState, objective: UrbanObjective,
    cameraView?: { x: number; y: number; width: number; height: number },
  ): void {
    this.stats.setText(urbanStatusText(world, company))
    const availableStatsWidth = this.layout.portrait ? this.scene.scale.width - 28 : this.scene.scale.width - this.stats.x - 105
    this.stats.setScale(Math.min(1, availableStatsWidth / Math.max(1, this.stats.width)))
    this.objective.setText(objective.title.toUpperCase())
    const dx = objective.point.x - world.player.x
    const dy = objective.point.y - world.player.y
    const nearby = inInteractionRange(world.player, objective.point)
    const bearing = `${dy < -35 ? 'N' : dy > 35 ? 'S' : ''}${dx < -35 ? 'W' : dx > 35 ? 'E' : ''}`
    this.hint.setText(nearby ? 'Here • Action' : `${bearing || '•'} · ${Math.round(Math.hypot(dx, dy))}u · Follow streets`)
    this.actionControl.label.setText('• Action')
    if (nearby !== this.nearby) {
      this.nearby = nearby
      this.actionControl.paint(nearby)
    }
    const owned = availableActiveTransports(company)
    const canSwitch = inInteractionRange(world.player, URBAN_HQ) && owned.length > 1
    const next = nextActiveTransport(company, world.urban?.activeTransport)
    this.transportControl.label.setText(`Next: ${ACTIVE_TRANSPORT_LABELS[next]}`)
    if (canSwitch !== this.transportAvailable) {
      this.transportAvailable = canSwitch
      this.transportControl.setVisible(canSwitch)
      this.transportControl.setEnabled(canSwitch)
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
    this.toastTimer = this.scene.time.delayedCall(4200, () => this.toast.setVisible(false))
  }

  toggleMenu(): void {
    this.open = !this.open
    this.clearMovement()
    this.menuButtons.forEach(control => {
      control.setVisible(this.open)
      control.setEnabled(this.open)
    })
  }

  isMenuOpen(): boolean { return this.open }
  movement(): { x: number; y: number } { return this.pad.value() }
  readonly clearMovement = (): void => {
    this.pad.clear()
    this.paintJoystick()
  }
  private readonly releasePointer = (pointer: Phaser.Input.Pointer): void => {
    this.pad.release(pointer.id)
    this.paintJoystick()
  }

  destroy(): void {
    this.clearMovement()
    this.toastTimer?.remove()
    this.scene.input.off('pointerup', this.releasePointer)
    this.scene.input.off('pointerupoutside', this.releasePointer)
    this.scene.input.off('gameout', this.clearMovement)
  }
}
