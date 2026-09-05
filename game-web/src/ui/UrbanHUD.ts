import type Phaser from 'phaser'
import type { CompanyState, WorldState } from '../types/game'
import type { UrbanObjective } from '../scenes/GameWorldScene'
import {
  URBAN_BUILDINGS, URBAN_ROADS, URBAN_HQ, URBAN_MERCHANT, minimapPoint, inInteractionRange,
} from '../world/urbanWorld'
import { WORLD_HEIGHT, WORLD_WIDTH } from '../world/worldLayout'

type Direction = 'up' | 'down' | 'left' | 'right'
interface HUDCallbacks {
  action: () => void
  transport: () => void
  company: () => void
  menu: () => void
  save: () => void
  audio: () => void
}

export const urbanHUDLayout = (width: number, height: number) => ({
  pad: { x: 14, y: height - 158, size: 48 },
  action: { x: width - 90, y: height - 42, width: 156, height: 56 },
  transport: { x: width - 90, y: height - 104, width: 156, height: 48 },
  minimap: { x: width - 132, y: 54, width: 116, height: 87 },
  objective: { x: 16, y: 52, width: Math.max(130, width - 166) },
  menu: { x: width - 106, y: 70, width: 184, rowHeight: 36 },
})

/** Pointer ownership keeps releasing one finger from cancelling a second finger. */
export class UrbanDPadInput {
  private readonly held = new Map<number, Direction>()
  press(pointer: number, direction: Direction): void { this.held.set(pointer, direction) }
  release(pointer: number): void { this.held.delete(pointer) }
  clear(): void { this.held.clear() }
  value(): { x: number; y: number } {
    const directions = new Set(this.held.values())
    return {
      x: Number(directions.has('right')) - Number(directions.has('left')),
      y: Number(directions.has('down')) - Number(directions.has('up')),
    }
  }
}

export class UrbanHUD {
  private readonly scene: Phaser.Scene
  private readonly layer: Phaser.GameObjects.Layer
  private readonly layout
  private readonly pad = new UrbanDPadInput()
  private readonly stats: Phaser.GameObjects.Text
  private readonly objective: Phaser.GameObjects.Text
  private readonly hint: Phaser.GameObjects.Text
  private readonly actionLabel: Phaser.GameObjects.Text
  private readonly actionButton: Phaser.GameObjects.Rectangle
  private readonly transportLabel: Phaser.GameObjects.Text
  private readonly transportButton: Phaser.GameObjects.Rectangle
  private readonly toast: Phaser.GameObjects.Text
  private readonly mapPlayer: Phaser.GameObjects.Arc
  private readonly mapTarget: Phaser.GameObjects.Arc
  private readonly menuObjects: Phaser.GameObjects.GameObject[] = []
  private readonly menuButtons: Phaser.GameObjects.Rectangle[] = []
  private open = false
  private toastTimer?: Phaser.Time.TimerEvent

  constructor(
    scene: Phaser.Scene,
    layer: Phaser.GameObjects.Layer,
    callbacks: HUDCallbacks,
  ) {
    this.scene = scene
    this.layer = layer
    const width = scene.scale.width
    const height = scene.scale.height
    this.layout = urbanHUDLayout(width, height)
    this.add(scene.add.rectangle(width / 2, 21, width, 42, 0x183b40, 0.98))
    this.stats = this.text(16, 13, '', 14, '#fff0ca')
    const menu = this.button(width - 51, 21, 82, 36, 'Menu', () => this.toggleMenu())
    menu.label.setFontSize(14)
    const objectiveWidth = Math.min(this.layout.objective.width, 440)
    this.add(scene.add.rectangle(12 + objectiveWidth / 2, 84, objectiveWidth + 8, 72, 0x183b40, 0.90))
    this.objective = this.text(20, 55, '', 14, '#fff0ca').setWordWrapWidth(objectiveWidth - 16)
    this.hint = this.text(20, 94, '', 12, '#d5e9dd')
    this.drawMinimap()
    this.mapTarget = this.add(scene.add.circle(0, 0, 4, 0xffcf66).setStrokeStyle(1, 0x183b40))
    this.mapPlayer = this.add(scene.add.circle(0, 0, 3, 0xffffff).setStrokeStyle(1, 0x183b40))
    this.text(width - 132, 146, 'YOU · white   GO · gold', 10, '#183b40')
    this.createDPad()
    const a = this.layout.action
    const action = this.button(a.x, a.y, a.width, a.height, 'E · Action', callbacks.action)
    this.actionButton = action.button
    this.actionLabel = action.label
    const t = this.layout.transport
    const transport = this.button(t.x, t.y, t.width, t.height, 'T · Transport', callbacks.transport)
    this.transportButton = transport.button
    this.transportLabel = transport.label
    const toastY = height < 480 ? 124 : height - 184
    this.toast = this.text(width / 2, toastY, '', 13, '#fff6dc')
      .setOrigin(0.5, 0).setAlign('center')
      .setWordWrapWidth(Math.min(width - 36, 430))
      .setBackgroundColor('#183b40').setPadding(10, 7).setVisible(false)
    const rows: [string, () => void][] = [
      ['Company / Fleet', callbacks.company],
      ['Save progress', callbacks.save],
      ['Toggle sound', callbacks.audio],
      ['Main menu', callbacks.menu],
    ]
    rows.forEach(([label, onTap], index) => {
      const m = this.layout.menu
      const entry = this.button(m.x, m.y + index * m.rowHeight, m.width, m.rowHeight - 2, label, () => {
        this.toggleMenu()
        onTap()
      })
      entry.button.setVisible(false).disableInteractive()
      entry.label.setVisible(false)
      this.menuButtons.push(entry.button)
      this.menuObjects.push(entry.button, entry.label)
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
    return this.add(this.scene.add.text(x, y, value, { fontFamily: 'Arial, sans-serif', fontSize: `${size}px`, color }))
  }

  private button(x: number, y: number, width: number, height: number, label: string, callback: () => void) {
    const button = this.add(this.scene.add.rectangle(x, y, width, height, 0x244f52, 0.96))
      .setStrokeStyle(2, 0x9fbaa4).setInteractive({ useHandCursor: true })
    const text = this.text(x, y, label, 13, '#fff4d6').setOrigin(0.5).setAlign('center')
      .setWordWrapWidth(width - 12)
    button.on('pointerdown', callback)
    return { button, label: text }
  }

  private createDPad(): void {
    const { x, y, size } = this.layout.pad
    this.add(this.scene.add.circle(x + 72, y + 72, 76, 0x183b40, 0.32))
    const directions: [Direction, number, number, string][] = [
      ['up', 1, 0, '▲'], ['left', 0, 1, '◀'], ['right', 2, 1, '▶'], ['down', 1, 2, '▼'],
    ]
    directions.forEach(([direction, col, row, label]) => {
      const b = this.button(x + col * size + size / 2, y + row * size + size / 2, size - 2, size - 2, label, () => {})
      b.label.setFontSize(20)
      const press = (pointer: Phaser.Input.Pointer): void => {
        if (!this.open) {
          this.pad.press(pointer.id, direction)
          b.button.setFillStyle(0x568e77, 1)
        }
      }
      b.button.on('pointerdown', press)
      b.button.on('pointerover', (pointer: Phaser.Input.Pointer) => { if (pointer.isDown) press(pointer) })
      b.button.on('pointerout', (pointer: Phaser.Input.Pointer) => {
        this.pad.release(pointer.id)
        b.button.setFillStyle(0x244f52, 0.96)
      })
      b.button.on('pointerup', () => b.button.setFillStyle(0x244f52, 0.96))
    })
    this.text(x + 72, y + 72, 'MOVE', 9, '#fff4d6').setOrigin(0.5)
  }

  private drawMinimap(): void {
    const { x, y, width, height } = this.layout.minimap
    const g = this.add(this.scene.add.graphics())
    g.fillStyle(0xb1cba0, 0.97).fillRoundedRect(x - 4, y - 4, width + 8, height + 8, 6)
    g.lineStyle(2, 0x183b40).strokeRoundedRect(x - 4, y - 4, width + 8, height + 8, 6)
    for (const road of URBAN_ROADS) {
      const p = minimapPoint(road, width, height)
      const w = road.width / WORLD_WIDTH * width
      const h = road.height / WORLD_HEIGHT * height
      g.fillStyle(0x6c7773).fillRect(x + p.x - w / 2, y + p.y - h / 2, w, h)
    }
    for (const building of URBAN_BUILDINGS) {
      const p = minimapPoint(building, width, height)
      const w = building.width / WORLD_WIDTH * width
      const h = building.height / WORLD_HEIGHT * height
      g.fillStyle(building.kind === 'hq' ? 0x326e79 : 0xb78c70)
        .fillRect(x + p.x - w / 2, y + p.y - h / 2, w, h)
    }
    for (const [point, label] of [[URBAN_HQ, 'H'], [URBAN_MERCHANT, 'M']] as const) {
      const p = minimapPoint(point, width, height)
      this.text(x + p.x, y + p.y - 9, label, 9, '#183b40').setOrigin(0.5)
    }
  }

  update(world: WorldState, company: CompanyState, objective: UrbanObjective): void {
    const transport = world.urban?.activeTransport === 'bicycle' ? 'Bicycle' : 'Walking'
    this.stats.setText(`$${company.money}   Rep ${company.reputation}   ${transport}${world.player.carryingPackage ? ' · Parcel' : ''}`)
    this.objective.setText(objective.title)
    const dx = objective.point.x - world.player.x
    const dy = objective.point.y - world.player.y
    const nearby = inInteractionRange(world.player, objective.point)
    const bearing = `${dy < -35 ? 'N' : dy > 35 ? 'S' : ''}${dx < -35 ? 'W' : dx > 35 ? 'E' : ''}`
    this.hint.setText(nearby ? 'You are here · Press E / Action' : `${bearing} · ${Math.round(Math.hypot(dx, dy))} m · Follow streets`)
    this.actionLabel.setText(nearby ? `E · ${objective.action}` : 'E · Action')
    this.actionButton.setFillStyle(nearby ? 0x397b60 : 0x244f52, 0.96)
    const atHQ = inInteractionRange(world.player, URBAN_HQ)
    this.transportButton.setVisible(atHQ)
    this.transportLabel.setVisible(atHQ).setText(world.urban?.activeTransport === 'bicycle' ? 'T · Park bicycle' : 'T · Take bicycle')
    if (atHQ) this.transportButton.setInteractive({ useHandCursor: true })
    else this.transportButton.disableInteractive()
    const map = this.layout.minimap
    const player = minimapPoint(world.player, map.width, map.height)
    const target = minimapPoint(objective.point, map.width, map.height)
    this.mapPlayer.setPosition(map.x + player.x, map.y + player.y)
    this.mapTarget.setPosition(map.x + target.x, map.y + target.y)
  }

  notify(message: string): void {
    this.toastTimer?.remove()
    this.toast.setText(message).setVisible(true)
    this.toastTimer = this.scene.time.delayedCall(4800, () => this.toast.setVisible(false))
  }

  toggleMenu(): void {
    this.open = !this.open
    this.clearMovement()
    this.menuObjects.forEach(object => (object as Phaser.GameObjects.Rectangle).setVisible(this.open))
    this.menuButtons.forEach(button => {
      if (this.open) button.setInteractive({ useHandCursor: true })
      else button.disableInteractive()
    })
  }

  isMenuOpen(): boolean { return this.open }
  movement(): { x: number; y: number } { return this.pad.value() }
  readonly clearMovement = (): void => { this.pad.clear() }
  private readonly releasePointer = (pointer: Phaser.Input.Pointer): void => { this.pad.release(pointer.id) }

  destroy(): void {
    this.clearMovement()
    this.toastTimer?.remove()
    this.scene.input.off('pointerup', this.releasePointer)
    this.scene.input.off('pointerupoutside', this.releasePointer)
    this.scene.input.off('gameout', this.clearMovement)
  }
}
