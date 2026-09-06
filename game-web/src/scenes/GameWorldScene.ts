import Phaser from 'phaser'
import { getBrowserSaveStorage } from '../persistence/browserSaveStorage'
import { autosaveIfApproved } from '../persistence/saveSystem'
import { getOrCreateGameSession, replaceGameSession } from '../state/gameSession'
import { createNextOrder, pickupPointForOrder } from '../systems/orderGeneration'
import { getAudioController } from '../systems/audioSystem'
import {
  ACTIVE_TRANSPORT_LABELS, availableActiveTransports, nextActiveTransport, resolveActiveTransport,
} from '../systems/activeTransportSystem'
import { TRANSPORT_PROFILES } from '../systems/urbanLogistics'
import { getUrbanObjective, performUrbanInteraction } from '../systems/urbanInteractions'
import type { ActiveTransport, CompanyState, WorldState } from '../types/game'
import { UrbanHUD, isUrbanHUDPoint } from '../ui/UrbanHUD'
import { UrbanZoomGesture, urbanZoomStep } from '../ui/urbanZoom'
import { clampCameraZoom } from '../ui/cameraControls'
import { CITY_COLORS, COLORS } from '../ui/theme'
import { createPlayerVisual, type PlayerVisual, type PlayerVisualState } from '../world/playerVisual'
import { renderUrbanNeighborhood } from '../world/urbanPresentation'
import {
  URBAN_HQ, URBAN_MARKETPLACE, inInteractionRange, moveUrbanPlayer, movementFacing, repairUrbanPosition,
  type UrbanFacing,
} from '../world/urbanWorld'
import { WORLD_HEIGHT, WORLD_WIDTH } from '../world/worldLayout'
import { AmbientCity } from '../world/ambientCity'

const HUD_REFRESH_MS = 150
const AMBIENT_UPDATE_MS = 33
const RESIZE_SETTLE_MS = 280

const PLAYER_VISUAL_BY_TRANSPORT: Readonly<Record<ActiveTransport, PlayerVisualState>> = {
  walking: 'Walking',
  bicycle: 'Bicycle',
  scooter: 'ElectricScooter',
  motorcycle: 'Motorcycle',
  van: 'DeliveryVan',
}

export class GameWorldScene extends Phaser.Scene {
  private worldState!: WorldState
  private companyState!: CompanyState
  private playerVisual!: PlayerVisual
  private hud!: UrbanHUD
  private objectiveMarker!: Phaser.GameObjects.Container
  private parcel!: Phaser.GameObjects.Container
  private parkedBicycle: Phaser.GameObjects.Graphics | null = null
  private fixedUiLayer!: Phaser.GameObjects.Layer
  private fixedUiCamera!: Phaser.Cameras.Scene2D.Camera
  private keys: Record<string, Phaser.Input.Keyboard.Key> = {}
  private lastHudUpdate = 0
  private ambientUpdateAccumulator = 0
  private facing: UrbanFacing = 'down'
  private readonly zoomGesture = new UrbanZoomGesture()
  private ambient?: AmbientCity
  private resizeRestartTimer?: Phaser.Time.TimerEvent
  private lastViewportWidth = 0
  private lastViewportHeight = 0
  private pendingLayoutRebuild = false
  private worldVisualSignature = ''

  constructor() {
    super('GameWorld')
  }

  create(): void {
    const session = getOrCreateGameSession()
    this.companyState = session.company
    this.worldState = session.world
    this.worldState.urban ??= { merchantOnboarded: false, activeTransport: 'walking' }
    this.worldState.urban.activeTransport = resolveActiveTransport(this.companyState, this.worldState.urban.activeTransport)
    Object.assign(this.worldState.player, repairUrbanPosition(this.worldState.player))
    this.worldState.isMoving = false
    this.worldState.pendingDeliveryDestination = ''
    this.worldState.tapTarget = { x: this.worldState.player.x, y: this.worldState.player.y }
    if (this.worldState.activeOrder.economySettled &&
        ['Completed', 'Failed'].includes(this.worldState.activeOrder.status)) {
      this.worldState.activeOrder = createNextOrder(this.worldState.activeOrder)
      this.worldState.player.currentOrder = ''
      this.worldState.player.carryingPackage = false
    }
    this.syncRuntimeSession()
    getAudioController().setEnabled(session.settings.soundEnabled)
    this.cameras.main.setBackgroundColor(CITY_COLORS.grass).setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT)
    this.worldVisualSignature = this.getWorldVisualSignature(this.companyState)
    this.parkedBicycle = renderUrbanNeighborhood(this, this.companyState)

    const ring = this.add.circle(0, 0, 30, COLORS.gold, 0.16).setStrokeStyle(3, COLORS.gold)
    const pin = this.add.triangle(0, -41, 0, 0, 18, 0, 9, 12, COLORS.gold)
    this.objectiveMarker = this.add.container(0, 0, [ring, pin]).setDepth(8)
    const box = this.add.rectangle(0, 0, 17, 14, CITY_COLORS.parcel).setStrokeStyle(2, CITY_COLORS.trunk)
    const tape = this.add.rectangle(0, 0, 4, 14, CITY_COLORS.tape)
    this.parcel = this.add.container(0, 0, [box, tape]).setDepth(9)
    this.playerVisual = createPlayerVisual(this, this.worldState.player.x, this.worldState.player.y)
    this.playerVisual.container.setDepth(20)
    this.cameras.main.setRotation(0).setZoom(1)
    this.cameras.main.startFollow(this.playerVisual.container, false, 1, 1)
    this.ambient = new AmbientCity(this)

    const worldRenderObjects = [...this.children.list]
    this.fixedUiLayer = this.add.layer()
    this.fixedUiCamera = this.cameras.add(0, 0, this.scale.width, this.scale.height, false, 'FixedScreenUI')
    this.fixedUiCamera.setScroll(0, 0)
    this.fixedUiCamera.setZoom(1)
    this.fixedUiCamera.setRotation(0)
    this.fixedUiCamera.setBackgroundColor('rgba(0,0,0,0)')
    this.fixedUiCamera.ignore(worldRenderObjects)
    this.cameras.main.ignore(this.fixedUiLayer)
    this.hud = new UrbanHUD(this, this.fixedUiLayer, {
      action: () => this.onAction(),
      transport: () => this.switchTransport(),
      company: () => this.navigate('CompanyManagement'),
      menu: () => this.navigate('MainMenu'),
      save: () => this.saveProgress(),
      audio: () => this.toggleAudio(),
      zoom: direction => this.setWorldZoom(urbanZoomStep(this.cameras.main.zoom, direction)),
    })
    this.input.addPointer(Math.max(0, 4 - this.input.manager.pointers.length))
    this.keys = (this.input.keyboard?.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,E,T,ESC') ?? {}) as typeof this.keys
    this.input.on('pointerdown', this.unlockAudio)
    this.input.on('pointerdown', this.beginZoom)
    this.input.on('pointermove', this.moveZoom)
    this.input.on('pointerup', this.endZoom)
    this.input.on('pointerupoutside', this.endZoom)
    this.input.on('gameout', this.clearInput)
    this.input.keyboard?.on('keydown', this.unlockAudio)
    this.scale.on(Phaser.Scale.Events.RESIZE, this.handleResize)
    this.game.events.on(Phaser.Core.Events.BLUR, this.clearInput)
    this.events.on(Phaser.Scenes.Events.SLEEP, this.handleSleep, this)
    this.events.on(Phaser.Scenes.Events.WAKE, this.handleWake, this)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdown, this)
    this.lastViewportWidth = Math.round(this.scale.width)
    this.lastViewportHeight = Math.round(this.scale.height)
    this.pendingLayoutRebuild = false
    this.resizeRestartTimer = undefined
    this.lastHudUpdate = 0
    this.ambientUpdateAccumulator = 0
    this.facing = 'down'
    this.refreshPresentation()
    this.hud.notify('D-pad / WASD to move · E to interact · Gold = objective')
  }

  update(time: number, delta: number): void {
    if (!this.hud) return
    const down = (key: string): number => this.keys[key]?.isDown ? 1 : 0
    const touch = this.hud.movement()
    const input = this.hud.isMenuOpen() || this.zoomGesture.isPinching() ? { x: 0, y: 0 } : {
      x: touch.x + down('D') + down('RIGHT') - down('A') - down('LEFT'),
      y: touch.y + down('S') + down('DOWN') - down('W') - down('UP'),
    }
    const transport = this.worldState.urban!.activeTransport
    const profile = TRANSPORT_PROFILES[transport]
    const before = this.worldState.player
    const next = moveUrbanPlayer(before, input, Math.min(delta / 1000, 0.05), profile.speed, profile.roadOnly)
    const moving = next.x !== before.x || next.y !== before.y
    const displacement = { x: next.x - before.x, y: next.y - before.y }
    Object.assign(this.worldState.player, next, { movementSpeed: profile.speed })
    this.worldState.isMoving = moving
    this.worldState.tapTarget = { ...next }
    this.playerVisual.container.setPosition(next.x, next.y)
    if (moving) {
      this.facing = movementFacing(displacement, this.facing)
      this.playerVisual.setFacing(this.facing)
    }
    this.playerVisual.setMoving(moving)
    this.playerVisual.update(delta)
    this.ambientUpdateAccumulator += Math.max(0, Math.min(Number.isFinite(delta) ? delta : 0, 100))
    if (this.ambientUpdateAccumulator >= AMBIENT_UPDATE_MS) {
      this.ambient?.update(this.ambientUpdateAccumulator, this.cameras.main.worldView)
      this.ambientUpdateAccumulator = 0
    }
    if (this.keys.ESC && Phaser.Input.Keyboard.JustDown(this.keys.ESC)) this.hud.toggleMenu()
    if (this.keys.E && Phaser.Input.Keyboard.JustDown(this.keys.E) && !this.hud.isMenuOpen()) this.onAction()
    if (this.keys.T && Phaser.Input.Keyboard.JustDown(this.keys.T) && !this.hud.isMenuOpen()) this.switchTransport()
    if (time - this.lastHudUpdate > HUD_REFRESH_MS) {
      this.refreshPresentation()
      this.lastHudUpdate = time
    }
  }

  private onAction(): void {
    if (this.hud.isMenuOpen()) return
    if (inInteractionRange(this.worldState.player, URBAN_HQ)) {
      this.enterInterior('HQInterior')
      return
    }
    if (inInteractionRange(this.worldState.player, URBAN_MARKETPLACE)) {
      this.enterInterior('MarketplaceInterior')
      return
    }
    const result = performUrbanInteraction(this.worldState, this.companyState)
    this.worldState = result.world
    this.companyState = result.company
    this.hud.notify(result.message)
    if (result.cue) getAudioController().play(result.cue)
    this.persist(result.settled ? 'delivery-completed' : 'progression-changed')
    this.refreshPresentation()
  }

  private enterInterior(scene: 'HQInterior' | 'MarketplaceInterior'): void {
    this.clearInput()
    this.persist('progression-changed')
    this.scene.launch(scene)
    this.scene.sleep()
  }

  private switchTransport(): void {
    if (this.hud.isMenuOpen()) return
    if (!inInteractionRange(this.worldState.player, URBAN_HQ)) {
      this.hud.notify('Change transport at the HQ fleet bay.')
      return
    }
    const urban = this.worldState.urban!
    const available = availableActiveTransports(this.companyState)
    if (available.length <= 1) {
      this.hud.notify('Buy a vehicle in Company → Vehicles, then collect it at HQ.')
      return
    }
    urban.activeTransport = nextActiveTransport(this.companyState, urban.activeTransport)
    const profile = TRANSPORT_PROFILES[urban.activeTransport]
    this.worldState.player.movementSpeed = profile.speed
    this.hud.notify(`${ACTIVE_TRANSPORT_LABELS[urban.activeTransport]} selected from your owned fleet.`)
    this.persist('progression-changed')
    this.refreshPresentation()
  }

  private refreshPresentation(): void {
    const objective = getUrbanObjective(this.worldState)
    this.objectiveMarker.setPosition(objective.point.x, objective.point.y)
    const pickup = pickupPointForOrder(this.worldState.activeOrder)
    this.parcel.setPosition(pickup.x, pickup.y).setVisible(this.worldState.activeOrder.status === 'Accepted')
    const transport = this.worldState.urban!.activeTransport
    this.playerVisual.setState(PLAYER_VISUAL_BY_TRANSPORT[transport])
    this.parkedBicycle?.setVisible(transport !== 'bicycle')
    this.playerVisual.setCarrying(this.worldState.player.carryingPackage)
    this.hud.update(this.worldState, this.companyState, objective, this.cameras.main.worldView)
  }

  private persist(event: 'delivery-completed' | 'progression-changed' | 'settings-changed'): boolean {
    const session = replaceGameSession(this.worldState, this.companyState)
    const storage = getBrowserSaveStorage()
    return storage ? autosaveIfApproved(storage, session, event).saved : false
  }

  private saveProgress(): void {
    this.hud.notify(this.persist('progression-changed') ? 'Company + preferences saved. Loading starts a fresh job at HQ.' : 'Storage unavailable. Progress remains in this session.')
  }

  private toggleAudio(): void {
    const session = getOrCreateGameSession()
    session.settings.soundEnabled = !session.settings.soundEnabled
    getAudioController().setEnabled(session.settings.soundEnabled)
    this.persist('settings-changed')
    this.hud.notify(session.settings.soundEnabled ? 'Sound on' : 'Sound off')
  }

  private navigate(scene: string): void {
    this.clearInput()
    this.persist('progression-changed')
    if (scene === 'CompanyManagement') {
      // Keep the expensive city scene resident while management is open. Returning without
      // structural company changes can now wake it instead of rebuilding the full city.
      this.scene.launch(scene)
      this.scene.sleep()
      return
    }
    this.scene.start(scene)
  }

  private syncRuntimeSession(): void {
    replaceGameSession(this.worldState, this.companyState)
  }

  private getWorldVisualSignature(company: CompanyState): string {
    const ownsBicycle = resolveActiveTransport(company, 'bicycle') === 'bicycle' ? 1 : 0
    return `${company.level}:${company.employees.length}:${ownsBicycle}`
  }

  private readonly unlockAudio = (): void => { getAudioController().unlock() }
  private readonly clearInput = (): void => {
    this.hud?.clearMovement()
    this.input.keyboard?.resetKeys()
    this.zoomGesture.clear()
  }
  private setWorldZoom(zoom: number): void {
    if (this.hud.isMenuOpen()) return
    this.cameras.main.setZoom(clampCameraZoom(zoom))
  }
  private readonly beginZoom = (pointer: Phaser.Input.Pointer): void => {
    if (!this.hud.isMenuOpen() && !isUrbanHUDPoint(this.scale.width, this.scale.height, pointer.x, pointer.y)) {
      this.zoomGesture.press(pointer.id, pointer)
    }
  }
  private readonly moveZoom = (pointer: Phaser.Input.Pointer): void => {
    if (this.hud.isMenuOpen() || isUrbanHUDPoint(this.scale.width, this.scale.height, pointer.x, pointer.y)) {
      this.zoomGesture.release(pointer.id)
      return
    }
    if (pointer.isDown) this.setWorldZoom(this.zoomGesture.move(pointer.id, pointer, this.cameras.main.zoom))
  }
  private readonly endZoom = (pointer: Phaser.Input.Pointer): void => { this.zoomGesture.release(pointer.id) }

  private scheduleResizeRestart(): void {
    this.resizeRestartTimer?.remove()
    this.resizeRestartTimer = this.time.delayedCall(RESIZE_SETTLE_MS, () => {
      this.resizeRestartTimer = undefined
      if (!this.scene.isActive()) {
        this.pendingLayoutRebuild = true
        return
      }
      this.syncRuntimeSession()
      this.scene.restart()
    })
  }

  private readonly handleResize = (): void => {
    const width = Math.round(this.scale.width)
    const height = Math.round(this.scale.height)
    if (width === this.lastViewportWidth && height === this.lastViewportHeight) return
    this.lastViewportWidth = width
    this.lastViewportHeight = height
    this.fixedUiCamera?.setSize(width, height)
    this.clearInput()
    if (!this.scene.isActive()) {
      this.pendingLayoutRebuild = true
      return
    }
    this.scheduleResizeRestart()
  }

  private readonly handleSleep = (): void => {
    this.clearInput()
    this.resizeRestartTimer?.remove()
    this.resizeRestartTimer = undefined
  }

  private readonly handleWake = (): void => {
    const session = getOrCreateGameSession()
    const needsWorldRebuild = this.pendingLayoutRebuild ||
      this.getWorldVisualSignature(session.company) !== this.worldVisualSignature
    this.pendingLayoutRebuild = false
    if (needsWorldRebuild) {
      this.scene.restart()
      return
    }
    this.worldState = session.world
    this.companyState = session.company
    this.worldState.urban ??= { merchantOnboarded: false, activeTransport: 'walking' }
    this.worldState.urban.activeTransport = resolveActiveTransport(this.companyState, this.worldState.urban.activeTransport)
    this.worldState.isMoving = false
    this.ambientUpdateAccumulator = 0
    getAudioController().setEnabled(session.settings.soundEnabled)
    this.clearInput()
    this.refreshPresentation()
  }

  private shutdown(): void {
    this.clearInput()
    this.resizeRestartTimer?.remove()
    this.resizeRestartTimer = undefined
    this.hud.destroy()
    this.scale.off(Phaser.Scale.Events.RESIZE, this.handleResize)
    this.game.events.off(Phaser.Core.Events.BLUR, this.clearInput)
    this.events.off(Phaser.Scenes.Events.SLEEP, this.handleSleep, this)
    this.events.off(Phaser.Scenes.Events.WAKE, this.handleWake, this)
    this.input.off('pointerdown', this.unlockAudio)
    this.input.off('pointerdown', this.beginZoom)
    this.input.off('pointermove', this.moveZoom)
    this.input.off('pointerup', this.endZoom)
    this.input.off('pointerupoutside', this.endZoom)
    this.input.off('gameout', this.clearInput)
    this.input.keyboard?.off('keydown', this.unlockAudio)
    this.ambient = undefined
  }
}
