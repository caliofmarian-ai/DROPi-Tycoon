import Phaser from 'phaser'
import { getBrowserSaveStorage } from '../persistence/browserSaveStorage'
import { autosaveIfApproved } from '../persistence/saveSystem'
import { getOrCreateGameSession, replaceGameSession } from '../state/gameSession'
import {
  ACTIVE_TRANSPORT_LABELS,
  availableActiveTransports,
  nextActiveTransport,
} from '../systems/activeTransportSystem'
import { performUrbanInteraction } from '../systems/urbanInteractions'
import { MARKETPLACE_LISTINGS } from '../systems/urbanMarketplace'
import type { CompanyState, WorldState } from '../types/game'
import { CITY_COLORS, COLORS } from '../ui/theme'
import {
  INTERIOR_LOCATIONS,
  moveInteriorPlayer,
  nearestInteriorInteraction,
  transportBayLabel,
  type InteriorInteraction,
  type InteriorLocationDefinition,
  type InteriorLocationId,
  type InteriorPoint,
} from '../world/interiorLocations'
import { movementFacing, type UrbanFacing } from '../world/urbanWorld'
import { createPlayerVisual, type PlayerVisual } from '../world/playerVisual'

const PAD_EXTENT = 96
const WALK_SPEED = 185

const padDirection = (x: number, y: number): InteriorPoint => {
  if (!Number.isFinite(x) || !Number.isFinite(y) || x < 0 || y < 0 || x > PAD_EXTENT || y > PAD_EXTENT) {
    return { x: 0, y: 0 }
  }
  const center = PAD_EXTENT / 2
  const dx = x - center
  const dy = y - center
  if (Math.hypot(dx, dy) <= PAD_EXTENT * 0.16) return { x: 0, y: 0 }
  return Math.abs(dx) > Math.abs(dy)
    ? { x: dx < 0 ? -1 : 1, y: 0 }
    : { x: 0, y: dy < 0 ? -1 : 1 }
}

export abstract class BaseInteriorScene extends Phaser.Scene {
  private readonly locationId: InteriorLocationId
  private location!: InteriorLocationDefinition
  private worldState!: WorldState
  private companyState!: CompanyState
  private position!: InteriorPoint
  private playerVisual!: PlayerVisual
  private keys: Record<string, Phaser.Input.Keyboard.Key> = {}
  private facing: UrbanFacing = 'up'
  private touchVector: InteriorPoint = { x: 0, y: 0 }
  private touchPointerId: number | null = null
  private padHit!: Phaser.GameObjects.Rectangle
  private padChrome!: Phaser.GameObjects.Graphics
  private actionHit!: Phaser.GameObjects.Rectangle
  private actionChrome!: Phaser.GameObjects.Graphics
  private actionLabel!: Phaser.GameObjects.Text
  private prompt!: Phaser.GameObjects.Text
  private toast!: Phaser.GameObjects.Text
  private activeText!: Phaser.GameObjects.Text
  private fleetText?: Phaser.GameObjects.Text
  private toastTimer?: Phaser.Time.TimerEvent

  protected constructor(sceneKey: string, locationId: InteriorLocationId) {
    super(sceneKey)
    this.locationId = locationId
  }

  create(): void {
    const session = getOrCreateGameSession()
    this.worldState = session.world
    this.companyState = session.company
    this.location = INTERIOR_LOCATIONS[this.locationId]
    this.position = { ...this.location.spawn }
    this.cameras.main
      .setBackgroundColor(COLORS.backgroundBottom)
      .setBounds(0, 0, this.location.width, this.location.height)
      .setZoom(1)

    this.drawInterior()
    this.playerVisual = createPlayerVisual(this, this.position.x, this.position.y)
    this.playerVisual.setState('Walking')
    this.playerVisual.setFacing(this.facing)
    this.playerVisual.container.setDepth(20)
    this.cameras.main.startFollow(this.playerVisual.container, false, 0.16, 0.16)

    this.createControls()
    this.keys = (this.input.keyboard?.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,E,ESC') ?? {}) as typeof this.keys
    this.input.keyboard?.on('keydown-ESC', this.exitInterior)
    this.scale.on(Phaser.Scale.Events.RESIZE, this.layoutControls)
    this.game.events.on(Phaser.Core.Events.BLUR, this.clearInput)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdown, this)
    this.refreshStateLabels()
    this.refreshPrompt()
    this.notify(this.locationId === 'hq'
      ? 'Walk to a highlighted zone · Action to use it · Exit through the south door.'
      : 'Walk to a counter · Action to inspect · Exit through the south door.')
  }

  update(_time: number, delta: number): void {
    const down = (key: string): number => this.keys[key]?.isDown ? 1 : 0
    const input = {
      x: this.touchVector.x + down('D') + down('RIGHT') - down('A') - down('LEFT'),
      y: this.touchVector.y + down('S') + down('DOWN') - down('W') - down('UP'),
    }
    const before = { ...this.position }
    this.position = moveInteriorPlayer(this.location, this.position, input, Math.min(delta / 1000, 0.05), WALK_SPEED)
    const displacement = { x: this.position.x - before.x, y: this.position.y - before.y }
    const moving = displacement.x !== 0 || displacement.y !== 0
    this.playerVisual.container.setPosition(this.position.x, this.position.y)
    if (moving) {
      this.facing = movementFacing(displacement, this.facing)
      this.playerVisual.setFacing(this.facing)
    }
    this.playerVisual.setMoving(moving)
    this.playerVisual.update(delta)
    this.refreshPrompt()
    if (this.keys.E && Phaser.Input.Keyboard.JustDown(this.keys.E)) this.onAction()
  }

  private drawInterior(): void {
    const { width, height } = this.location
    this.add.rectangle(width / 2, height / 2, width, height, CITY_COLORS.cream).setDepth(0)
    this.add.rectangle(width / 2, 46, width - 34, 72, COLORS.surface).setStrokeStyle(3, COLORS.accent).setDepth(1)
    this.add.text(52, 24, this.location.title, {
      fontFamily: 'Arial, sans-serif', fontSize: '26px', fontStyle: 'bold', color: '#ffffff',
    }).setDepth(3)
    this.add.text(52, 54, this.location.subtitle, {
      fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#9feaff',
    }).setDepth(3)

    if (this.locationId === 'hq') this.drawHQInterior()
    else this.drawMarketplaceInterior()

    this.location.interactions.forEach(interaction => this.drawInteractionMarker(interaction))
  }

  private drawHQInterior(): void {
    this.zonePanel(90, 105, 290, 405, 'FLEET BAY', 'Owned vehicles · active handoff', COLORS.accent)
    this.zonePanel(90, 100, 290, 145, 'EMPLOYEE AREA', 'Staff presence · future desks', COLORS.accentStrong)
    this.zonePanel(760, 100, 350, 145, 'OPERATIONS & DISPATCH', 'Accept work · route operations', COLORS.gold)
    this.zonePanel(760, 335, 350, 155, 'PARCEL STAGING', 'Sorting · handoff · cargo status', COLORS.accentStrong)
    this.zonePanel(435, 118, 270, 126, 'FUTURE EXPANSION', 'Main DronePort · maintenance · lockers', 0x6d7d91)
    this.add.text(470, 182, 'FUTURE · NOT YET OPERATIONAL', {
      fontFamily: 'Arial, sans-serif', fontSize: '12px', fontStyle: 'bold', color: '#6a7685',
    }).setDepth(3)

    const owned = availableActiveTransports(this.companyState).filter(transport => transport !== 'walking')
    const labels = owned.length ? owned.map(transportBayLabel) : ['No vehicles owned yet']
    labels.slice(0, 4).forEach((label, index) => {
      const y = 255 + index * 54
      this.add.rectangle(235, y, 230, 42, 0xffffff, 0.72).setStrokeStyle(2, COLORS.accent).setDepth(3)
      this.add.text(132, y - 9, label, {
        fontFamily: 'Arial, sans-serif', fontSize: '14px', fontStyle: 'bold', color: '#123f5d',
      }).setDepth(4)
    })
    this.fleetText = this.add.text(118, 470, '', {
      fontFamily: 'Arial, sans-serif', fontSize: '13px', fontStyle: 'bold', color: '#123f5d',
      wordWrap: { width: 240 },
    }).setDepth(4)
  }

  private drawMarketplaceInterior(): void {
    this.zonePanel(125, 135, 390, 260, 'LOCAL MARKET STALLS', 'Merchant goods · local delivery economy', COLORS.gold)
    this.zonePanel(685, 135, 390, 260, 'PLAYER LISTINGS', 'Future player-to-player item economy', COLORS.accent)
    this.add.text(175, 218, `Local catalog foundation: ${MARKETPLACE_LISTINGS.length} listing templates`, {
      fontFamily: 'Arial, sans-serif', fontSize: '15px', color: '#123f5d',
    }).setDepth(4)
    this.add.text(735, 218, 'ONLINE TRADING · FUTURE / NOT YET IMPLEMENTED', {
      fontFamily: 'Arial, sans-serif', fontSize: '13px', fontStyle: 'bold', color: '#47687b',
      wordWrap: { width: 300 },
    }).setDepth(4)
    ;['FOOD', 'HOME', 'TOOLS', 'FASHION'].forEach((label, index) => {
      const x = 200 + index * 85
      this.add.rectangle(x, 325, 72, 64, 0xffffff, 0.76).setStrokeStyle(2, COLORS.gold).setDepth(3)
      this.add.text(x, 325, label, {
        fontFamily: 'Arial, sans-serif', fontSize: '10px', fontStyle: 'bold', color: '#123f5d',
      }).setOrigin(0.5).setDepth(4)
    })
  }

  private zonePanel(x: number, y: number, width: number, height: number, title: string, subtitle: string, accent: number): void {
    this.add.rectangle(x + width / 2, y + height / 2, width, height, 0xffffff, 0.58)
      .setStrokeStyle(3, accent, 0.9).setDepth(2)
    this.add.text(x + 18, y + 15, title, {
      fontFamily: 'Arial, sans-serif', fontSize: '18px', fontStyle: 'bold', color: '#123f5d',
    }).setDepth(3)
    this.add.text(x + 18, y + 42, subtitle, {
      fontFamily: 'Arial, sans-serif', fontSize: '11px', color: '#47687b',
    }).setDepth(3)
  }

  private drawInteractionMarker(interaction: InteriorInteraction): void {
    const color = interaction.id === 'exit' ? 0x3e9e65 : interaction.id === 'operations' ? COLORS.gold : COLORS.accent
    this.add.circle(interaction.x, interaction.y, 24, color, 0.17).setStrokeStyle(2, color, 0.92).setDepth(5)
    this.add.text(interaction.x, interaction.y + 28, interaction.label, {
      fontFamily: 'Arial, sans-serif', fontSize: '11px', fontStyle: 'bold', color: '#123f5d',
    }).setOrigin(0.5, 0).setDepth(5)
  }

  private createControls(): void {
    this.padChrome = this.add.graphics().setScrollFactor(0).setDepth(100)
    this.padHit = this.add.rectangle(0, 0, PAD_EXTENT, PAD_EXTENT, 0xffffff, 0.001)
      .setScrollFactor(0).setDepth(101).setInteractive({ useHandCursor: true })
    this.padHit.on('pointerdown', this.pressPad)
    this.padHit.on('pointermove', this.movePad)
    this.padHit.on('pointerup', this.releasePad)
    this.padHit.on('pointerout', this.releasePad)

    this.actionChrome = this.add.graphics().setScrollFactor(0).setDepth(100)
    this.actionHit = this.add.rectangle(0, 0, 128, 48, 0xffffff, 0.001)
      .setScrollFactor(0).setDepth(101).setInteractive({ useHandCursor: true })
    this.actionHit.on('pointerdown', () => this.onAction())
    this.actionLabel = this.add.text(0, 0, '• Action', {
      fontFamily: 'Arial, sans-serif', fontSize: '15px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(102)

    this.prompt = this.add.text(0, 0, '', {
      fontFamily: 'Arial, sans-serif', fontSize: '13px', fontStyle: 'bold', color: '#ffffff',
      backgroundColor: '#073354', padding: { x: 10, y: 6 },
    }).setOrigin(0.5).setScrollFactor(0).setDepth(102)
    this.toast = this.add.text(0, 0, '', {
      fontFamily: 'Arial, sans-serif', fontSize: '12px', color: '#ffffff', align: 'center',
      backgroundColor: '#073354', padding: { x: 10, y: 7 }, wordWrap: { width: 430 },
    }).setOrigin(0.5).setScrollFactor(0).setDepth(102).setVisible(false)
    this.activeText = this.add.text(0, 0, '', {
      fontFamily: 'Arial, sans-serif', fontSize: '12px', fontStyle: 'bold', color: '#ffffff',
      backgroundColor: '#0b4b70', padding: { x: 8, y: 5 },
    }).setScrollFactor(0).setDepth(102)
    this.layoutControls()
  }

  private readonly layoutControls = (): void => {
    const width = this.scale.width
    const height = this.scale.height
    const padX = 16 + PAD_EXTENT / 2
    const padY = height - 16 - PAD_EXTENT / 2
    this.padHit?.setPosition(padX, padY)
    this.padChrome?.clear()
      .fillStyle(COLORS.surface, 0.66).fillCircle(padX, padY, PAD_EXTENT / 2)
      .lineStyle(2, COLORS.accent, 0.85).strokeCircle(padX, padY, PAD_EXTENT / 2)
      .lineStyle(5, COLORS.accentStrong, 0.92)
      .lineBetween(padX, padY - 32, padX, padY - 16)
      .lineBetween(padX, padY + 16, padX, padY + 32)
      .lineBetween(padX - 32, padY, padX - 16, padY)
      .lineBetween(padX + 16, padY, padX + 32, padY)

    const actionX = width - 78
    const actionY = height - 42
    this.actionHit?.setPosition(actionX, actionY)
    this.actionLabel?.setPosition(actionX, actionY)
    this.actionChrome?.clear()
      .fillStyle(COLORS.surfaceRaised, 0.95).fillRoundedRect(actionX - 64, actionY - 24, 128, 48, 12)
      .lineStyle(2, COLORS.accent).strokeRoundedRect(actionX - 64, actionY - 24, 128, 48, 12)
    this.prompt?.setPosition(width / 2, height - 28)
    this.toast?.setPosition(width / 2, 86)
    this.activeText?.setPosition(12, 10)
  }

  private readonly pressPad = (pointer: Phaser.Input.Pointer): void => {
    this.touchPointerId = pointer.id
    this.touchVector = padDirection(pointer.x - (this.padHit.x - PAD_EXTENT / 2), pointer.y - (this.padHit.y - PAD_EXTENT / 2))
  }

  private readonly movePad = (pointer: Phaser.Input.Pointer): void => {
    if (!pointer.isDown || this.touchPointerId !== pointer.id) return
    this.touchVector = padDirection(pointer.x - (this.padHit.x - PAD_EXTENT / 2), pointer.y - (this.padHit.y - PAD_EXTENT / 2))
  }

  private readonly releasePad = (pointer: Phaser.Input.Pointer): void => {
    if (this.touchPointerId !== pointer.id) return
    this.touchPointerId = null
    this.touchVector = { x: 0, y: 0 }
  }

  private readonly clearInput = (): void => {
    this.touchPointerId = null
    this.touchVector = { x: 0, y: 0 }
    this.input.keyboard?.resetKeys()
  }

  private refreshPrompt(): void {
    const nearby = nearestInteriorInteraction(this.location, this.position)
    this.prompt.setText(nearby ? `Action · ${nearby.label}` : 'Walk to a highlighted zone')
    this.actionChrome.clear()
      .fillStyle(nearby ? COLORS.accentStrong : COLORS.surfaceRaised, 0.95)
      .fillRoundedRect(this.actionHit.x - 64, this.actionHit.y - 24, 128, 48, 12)
      .lineStyle(2, nearby ? COLORS.gold : COLORS.accent)
      .strokeRoundedRect(this.actionHit.x - 64, this.actionHit.y - 24, 128, 48, 12)
  }

  private onAction(): void {
    const interaction = nearestInteriorInteraction(this.location, this.position)
    if (!interaction) {
      this.notify('Move closer to a highlighted interior zone.')
      return
    }
    switch (interaction.id) {
      case 'exit':
        this.exitInterior()
        return
      case 'fleet':
        this.cycleOwnedFleet()
        return
      case 'employees':
        this.notify(`${this.companyState.employees.length} employee${this.companyState.employees.length === 1 ? '' : 's'} assigned to the company. Detailed staff management remains available from Company.`)
        return
      case 'operations':
        this.useOperationsDesk()
        return
      case 'staging':
        this.notify(this.worldState.player.carryingPackage
          ? 'Parcel staging: courier currently carries an active parcel.'
          : 'Parcel staging ready. No parcel is currently carried by the courier.')
        return
      case 'market-stalls':
        this.notify(`Local Marketplace: ${MARKETPLACE_LISTINGS.length} merchant listing templates are available to the Tycoon simulation.`)
        return
      case 'player-listings':
        this.notify('Player listings are reserved for the future online marketplace. No fake online trading is enabled yet.')
        return
    }
  }

  private cycleOwnedFleet(): void {
    const available = availableActiveTransports(this.companyState)
    if (available.length <= 1) {
      this.notify('Fleet Bay: no owned vehicle yet. Purchase one through Company → Vehicles.')
      return
    }
    const urban = this.worldState.urban ??= { merchantOnboarded: false, activeTransport: 'walking' }
    urban.activeTransport = nextActiveTransport(this.companyState, urban.activeTransport)
    this.persist('progression-changed')
    this.refreshStateLabels()
    this.notify(`${ACTIVE_TRANSPORT_LABELS[urban.activeTransport]} is now the active vehicle. It will be handed off when you exit HQ.`)
  }

  private useOperationsDesk(): void {
    const result = performUrbanInteraction(this.worldState, this.companyState)
    this.worldState = result.world
    this.companyState = result.company
    this.persist(result.settled ? 'delivery-completed' : 'progression-changed')
    this.refreshStateLabels()
    this.notify(result.message)
  }

  private refreshStateLabels(): void {
    const active = this.worldState.urban?.activeTransport ?? 'walking'
    this.activeText.setText(`${this.location.title}\nActive: ${ACTIVE_TRANSPORT_LABELS[active]}`)
    if (this.fleetText) {
      const owned = availableActiveTransports(this.companyState).filter(transport => transport !== 'walking')
      this.fleetText.setText(`ACTIVE VEHICLE\n${ACTIVE_TRANSPORT_LABELS[active]}\n\nOWNED: ${owned.length ? owned.map(transportBayLabel).join(' · ') : 'None'}`)
    }
  }

  private persist(event: 'delivery-completed' | 'progression-changed'): boolean {
    const session = replaceGameSession(this.worldState, this.companyState)
    const storage = getBrowserSaveStorage()
    return storage ? autosaveIfApproved(storage, session, event).saved : false
  }

  private notify(message: string): void {
    this.toastTimer?.remove()
    this.toast.setText(message).setVisible(true)
    this.toastTimer = this.time.delayedCall(4400, () => this.toast.setVisible(false))
  }

  private readonly exitInterior = (): void => {
    this.clearInput()
    this.persist('progression-changed')
    if (this.scene.isSleeping('GameWorld')) this.scene.wake('GameWorld')
    else this.scene.start('GameWorld')
    this.scene.stop()
  }

  private shutdown(): void {
    this.clearInput()
    this.toastTimer?.remove()
    this.scale.off(Phaser.Scale.Events.RESIZE, this.layoutControls)
    this.game.events.off(Phaser.Core.Events.BLUR, this.clearInput)
    this.input.keyboard?.off('keydown-ESC', this.exitInterior)
    this.playerVisual?.destroy()
  }
}
