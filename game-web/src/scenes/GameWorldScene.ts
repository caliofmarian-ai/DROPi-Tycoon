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
import { getUrbanObjective, performUrbanInteraction, type UrbanObjective } from '../systems/urbanInteractions'
import type { ActiveTransport, CompanyState, WorldState } from '../types/game'
import { NarrativePresentationOverlay } from '../ui/NarrativePresentation'
import { UrbanHUD, isUrbanHUDPoint, urbanHUDLayout } from '../ui/UrbanHUD'
import { UrbanCameraPan, cameraScrollFromDrag } from '../ui/UrbanCameraPan'
import { UrbanZoomGesture } from '../ui/urbanZoom'
import { cityFitZoom, clamp } from '../world/semanticMapCamera'
import { CITY_COLORS, COLORS } from '../ui/theme'
import { createPlayerVisual, type PlayerVisual, type PlayerVisualState } from '../world/playerVisual'
import { renderUrbanNeighborhood } from '../world/urbanPresentation'
import {
  URBAN_HQ, URBAN_MARKETPLACE, inInteractionRange, moveUrbanPlayer, movementFacing, repairUrbanPosition,
  type UrbanFacing,
} from '../world/urbanWorld'
import { WORLD_CITY_NAME, WORLD_HEIGHT, WORLD_WIDTH } from '../world/worldLayout'
import { CityGroundDetail } from '../world/cityGroundDetail'
import { AmbientCity } from '../world/ambientCity'
import {
  chooseRecoveryHeroPresentation,
  deliverRecoveryMariaTest,
  ensureRecoveryOpeningRuntime,
  enterRecoveryMariaShop,
  recoveryMariaWorldPoint,
  recoveryOpeningObjective,
  recoveryOpeningStatusText,
  startRecoveryWorkSearch,
} from '../missions/recoveryOpeningRuntime'
import { RECOVERY_OPENING_MISSION_IDS } from '../missions/recoveryOpeningAuthoredRegistry'
import {
  RECOVERY_AUTHORED_REFS,
  buildRecoveryPrologueSequence,
} from '../narrative/recoveryOpeningV2'
import {
  buildRecoveryPresentationSelectionSequence,
  heroPresentationSexFromChoiceResult,
} from '../narrative/recoveryOpeningSelection'

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
  private narrative!: NarrativePresentationOverlay
  private objectiveMarker!: Phaser.GameObjects.Container
  private parcel!: Phaser.GameObjects.Container
  private parkedBicycle: Phaser.GameObjects.Graphics | null = null
  private fixedUiLayer!: Phaser.GameObjects.Layer
  private fixedUiCamera!: Phaser.Cameras.Scene2D.Camera
  private recoveryHudGate?: Phaser.GameObjects.Container
  private recoveryHudStatus?: Phaser.GameObjects.Text
  private recoveryHudBlockers: Phaser.GameObjects.Rectangle[] = []
  private keys: Record<string, Phaser.Input.Keyboard.Key> = {}
  private lastHudUpdate = 0
  private ambientUpdateAccumulator = 0
  private facing: UrbanFacing = 'down'
  private readonly zoomGesture = new UrbanZoomGesture(zoom => clamp(zoom, this.cityFit() * 0.7, 2.5))
  private readonly cameraPan = new UrbanCameraPan()
  private cameraFreeLook = false
  private ambient?: AmbientCity
  private groundDetail?: CityGroundDetail
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
    this.recenterCamera(false)
    this.ambient = new AmbientCity(this)
    this.groundDetail = new CityGroundDetail(this)

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
      menu: () => this.navigate('MainMenu'),
      save: () => this.saveProgress(),
      audio: () => this.toggleAudio(),
      zoom: direction => this.setWorldZoom(this.cameras.main.zoom * (direction === 'in' ? 1.45 : 1 / 1.45)),
      recenter: () => this.recenterCamera(),
      worldMap: () => this.openGlobalMap(),
    })
    this.createRecoveryHudGate()
    // Created after ordinary HUD overlays and the no-phone gate so story presentation stays topmost.
    this.narrative = new NarrativePresentationOverlay(this, this.fixedUiLayer)
    this.input.addPointer(Math.max(0, 4 - this.input.manager.pointers.length))
    this.keys = (this.input.keyboard?.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,E,T,ESC') ?? {}) as typeof this.keys
    this.input.on('pointerdown', this.unlockAudio)
    this.input.on('pointerdown', this.beginWorldGesture)
    this.input.on('pointermove', this.moveWorldGesture)
    this.input.on('pointerup', this.endWorldGesture)
    this.input.on('pointerupoutside', this.endWorldGesture)
    this.input.on('wheel', this.zoomWorldWheel)
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
    this.applyMapReturnView()
    if (!this.presentRecoveryOpeningIfNeeded()) {
      this.hud.notify('Joystick / WASD to move · Drag the city to explore · ⌖ returns to courier')
    }
  }

  update(time: number, delta: number): void {
    if (!this.hud) return
    this.groundDetail?.update(this.cameras.main.worldView, this.cameras.main.zoom)
    const down = (key: string): number => this.keys[key]?.isDown ? 1 : 0
    const touch = this.hud.movement()
    const input = this.hud.isMenuOpen() || this.zoomGesture.isPinching() ? { x: 0, y: 0 }
      : (this.narrative?.isOpen() ?? false) ? { x: 0, y: 0 }
      : {
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
    if (this.keys.ESC && Phaser.Input.Keyboard.JustDown(this.keys.ESC)) {
      if (!this.narrative.handleBack()) this.hud.toggleMenu()
      this.clearInput()
    }
    if (this.keys.E && Phaser.Input.Keyboard.JustDown(this.keys.E) && !this.isModalOpen()) this.onAction()
    if (this.keys.T && Phaser.Input.Keyboard.JustDown(this.keys.T) && !this.isModalOpen()) this.switchTransport()
    if (time - this.lastHudUpdate > HUD_REFRESH_MS) {
      this.refreshPresentation()
      this.lastHudUpdate = time
    }
  }

  private onAction(): void {
    if (this.isModalOpen()) return

    const session = getOrCreateGameSession()
    const recovery = ensureRecoveryOpeningRuntime(session)
    if (recovery.active) {
      const mariaPoint = recoveryMariaWorldPoint()
      const nearMaria = mariaPoint ? inInteractionRange(this.worldState.player, mariaPoint) : false
      if (nearMaria && ['search-work', 'maria-dialogue', 'return-maria'].includes(recovery.phase)) {
        if (recovery.phase === 'search-work') {
          const entered = enterRecoveryMariaShop(session)
          if (!entered.changed || entered.phase !== 'maria-dialogue') {
            this.hud.notify(`Maria's shop is not ready yet: ${entered.reason ?? 'mission authority blocked'}.`)
            return
          }
        }
        this.worldState = session.world
        this.companyState = session.company
        this.persist('progression-changed')
        this.enterInterior('MariaShopInterior')
        return
      }

      if (recovery.phase === 'deliver-first') {
        const deliveryObjective = getUrbanObjective(this.worldState)
        const distance = Math.hypot(
          deliveryObjective.point.x - this.worldState.player.x,
          deliveryObjective.point.y - this.worldState.player.y,
        )
        const delivered = deliverRecoveryMariaTest(session, distance)
        if (!delivered.changed) {
          this.hud.notify(delivered.reason === 'recovery-delivery-not-in-range'
            ? 'Bring Maria\'s parcel to the marked recipient first.'
            : `Delivery cannot complete yet: ${delivered.reason ?? 'authority not ready'}.`)
          return
        }
        this.worldState = session.world
        this.companyState = session.company
        this.persist('progression-changed')
        getAudioController().play('delivery-success')
        this.refreshPresentation()
        this.hud.notify('Delivery complete. No fake company money was created. Return to Maria and report back.')
        return
      }

      if (recovery.phase === 'trial-ready') {
        this.hud.notify("Maria's five-delivery trial is unlocked. The next recovery slice will materialize those governed jobs.")
        return
      }

      this.hud.notify('Keep following the recovery objective. You do not have a company, vehicle or phone yet.')
      return
    }

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

  private isModalOpen(): boolean { return this.hud.isMenuOpen() || (this.narrative?.isOpen() ?? false) }

  private enterInterior(scene: 'HQInterior' | 'MarketplaceInterior' | 'MariaShopInterior'): void {
    this.clearInput()
    this.persist('progression-changed')
    this.scene.launch(scene)
    this.scene.sleep()
  }

  private switchTransport(): void {
    if (this.isModalOpen()) return
    if (ensureRecoveryOpeningRuntime(getOrCreateGameSession()).active) {
      this.hud.notify('You are still rebuilding on foot. Vehicles unlock later through legitimate ownership.')
      return
    }
    if (!inInteractionRange(this.worldState.player, URBAN_HQ)) {
      this.hud.notify('Change transport at the HQ Fleet Bay.')
      return
    }
    const urban = this.worldState.urban!
    const available = availableActiveTransports(this.companyState)
    if (available.length <= 1) {
      this.hud.notify('Enter HQ and purchase a vehicle at the Fleet Bay terminal.')
      return
    }
    urban.activeTransport = nextActiveTransport(this.companyState, urban.activeTransport)
    const profile = TRANSPORT_PROFILES[urban.activeTransport]
    this.worldState.player.movementSpeed = profile.speed
    this.hud.notify(`${ACTIVE_TRANSPORT_LABELS[urban.activeTransport]} selected from your owned fleet.`)
    this.persist('progression-changed')
    this.refreshPresentation()
  }

  private currentObjective(): UrbanObjective {
    const session = getOrCreateGameSession()
    const recovery = ensureRecoveryOpeningRuntime(session)
    const authored = recoveryOpeningObjective(session)
    if (authored) return authored
    if (recovery.active) {
      const mariaPoint = recoveryMariaWorldPoint()
      if (mariaPoint && recovery.phase === 'maria-dialogue') {
        return { point: mariaPoint, title: 'Talk to Maria at the counter', action: 'Enter shop' }
      }
      if (mariaPoint && recovery.phase === 'trial-ready') {
        return { point: mariaPoint, title: "Maria's five-delivery trial is ready", action: 'Continue with Maria' }
      }
      if (recovery.phase === 'choose-presentation') {
        return { point: { x: this.worldState.player.x, y: this.worldState.player.y }, title: 'Choose your hero', action: 'Continue story' }
      }
      if (recovery.phase === 'prologue') {
        return { point: { x: this.worldState.player.x, y: this.worldState.player.y }, title: 'Get up and keep going', action: 'Continue story' }
      }
    }
    return getUrbanObjective(this.worldState)
  }

  private refreshPresentation(): void {
    const objective = this.currentObjective()
    const session = getOrCreateGameSession()
    const recovery = ensureRecoveryOpeningRuntime(session)
    this.objectiveMarker.setPosition(objective.point.x, objective.point.y)
    const pickup = pickupPointForOrder(this.worldState.activeOrder)
    this.parcel.setPosition(pickup.x, pickup.y).setVisible(this.worldState.activeOrder.status === 'Accepted')
    const transport = this.worldState.urban!.activeTransport
    this.playerVisual.setState(PLAYER_VISUAL_BY_TRANSPORT[transport])
    this.parkedBicycle?.setVisible(!recovery.active && transport !== 'bicycle')
    this.playerVisual.setCarrying(this.worldState.player.carryingPackage)
    this.hud.update(this.worldState, this.companyState, objective, this.cameras.main.worldView)
    this.updateRecoveryHudGate(recoveryOpeningStatusText(session))
  }

  private persist(event: 'delivery-completed' | 'progression-changed' | 'settings-changed'): boolean {
    const session = replaceGameSession(this.worldState, this.companyState)
    const storage = getBrowserSaveStorage()
    return storage ? autosaveIfApproved(storage, session, event).saved : false
  }

  private saveProgress(): void {
    const recoveryActive = ensureRecoveryOpeningRuntime(getOrCreateGameSession()).active
    const saved = this.persist('progression-changed')
    this.hud.notify(saved
      ? recoveryActive ? 'Recovery progress saved.' : 'Company + preferences saved. Loading starts a fresh job at HQ.'
      : 'Storage unavailable. Progress remains in this session.')
  }

  private toggleAudio(): void {
    const session = getOrCreateGameSession()
    session.settings.soundEnabled = !session.settings.soundEnabled
    getAudioController().setEnabled(session.settings.soundEnabled)
    this.persist('settings-changed')
    this.hud.notify(session.settings.soundEnabled ? 'Sound on' : 'Sound off')
  }

  private openGlobalMap(focus?: string): void {
    if (this.isModalOpen()) return
    if (ensureRecoveryOpeningRuntime(getOrCreateGameSession()).active) {
      this.hud.notify('No GPS yet. Your first phone is an earned personal asset later in the recovery story.')
      return
    }
    this.clearInput()
    this.syncRuntimeSession()
    this.scene.launch('GlobalMap', { focus })
    this.scene.sleep()
  }

  private navigate(scene: string): void {
    if (this.narrative.isOpen()) return
    this.clearInput()
    this.persist('progression-changed')
    this.scene.start(scene)
  }

  private syncRuntimeSession(): void {
    replaceGameSession(this.worldState, this.companyState)
  }

  private getWorldVisualSignature(company: CompanyState): string {
    const ownsBicycle = resolveActiveTransport(company, 'bicycle') === 'bicycle' ? 1 : 0
    return `${company.level}:${company.employees.length}:${ownsBicycle}`
  }

  private presentRecoveryOpeningIfNeeded(): boolean {
    if (this.narrative?.isOpen()) return true
    const session = getOrCreateGameSession()
    const recovery = ensureRecoveryOpeningRuntime(session)
    if (!recovery.active) return false

    const riseAuthority = {
      missionId: RECOVERY_OPENING_MISSION_IDS.riseAndSearch,
      authoredRef: RECOVERY_AUTHORED_REFS.rise,
    }

    if (recovery.phase === 'choose-presentation') {
      return this.narrative.present(
        buildRecoveryPresentationSelectionSequence(WORLD_CITY_NAME, riseAuthority),
        {
          onChoice: choice => {
            const sex = heroPresentationSexFromChoiceResult(choice.resultRef)
            if (!sex) return
            const live = getOrCreateGameSession()
            const selected = chooseRecoveryHeroPresentation(live, sex)
            if (!selected.changed) return
            this.worldState = live.world
            this.companyState = live.company
            this.persist('progression-changed')
            this.refreshPresentation()
          },
          onComplete: () => { this.presentRecoveryOpeningIfNeeded() },
        },
      )
    }

    if (recovery.phase === 'prologue' && recovery.selectedSex) {
      return this.narrative.present(
        buildRecoveryPrologueSequence(recovery.selectedSex, WORLD_CITY_NAME, riseAuthority),
        {
          onComplete: () => {
            const live = getOrCreateGameSession()
            const started = startRecoveryWorkSearch(live)
            if (!started.changed) {
              this.hud.notify(`Recovery opening could not start: ${started.reason ?? 'mission authority blocked'}.`)
              return
            }
            this.worldState = live.world
            this.companyState = live.company
            this.persist('progression-changed')
            this.refreshPresentation()
            this.hud.notify('Walk the streets and look for legitimate work. You have no phone, vehicle or company yet.')
          },
        },
      )
    }

    return false
  }

  private createRecoveryHudGate(): void {
    const layout = urbanHUDLayout(this.scale.width, this.scale.height)
    const { width } = this.scale
    const gate = this.add.container(0, 0).setVisible(false)
    const elements: Phaser.GameObjects.GameObject[] = []

    const statusWidth = Math.min(Math.max(210, width - (layout.portrait ? 28 : 410)), 470)
    const statusY = layout.portrait ? 55 : 22
    const statusBackground = this.add.rectangle(width / 2, statusY, statusWidth, 28, 0x073354, 0.98)
      .setStrokeStyle(2, COLORS.gold, 0.8)
    this.recoveryHudStatus = this.add.text(width / 2, statusY, '', {
      fontFamily: 'Arial, sans-serif', fontSize: '11px', fontStyle: 'bold', color: '#ffffff',
      align: 'center',
    }).setOrigin(0.5)
    elements.push(statusBackground, this.recoveryHudStatus)

    const phone = layout.phone
    const phoneBlocker = this.add.rectangle(phone.x, phone.y, phone.width, Math.max(44, phone.height), 0x122b3d, 1)
      .setStrokeStyle(2, 0x6f8794).setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.hud.notify('No phone yet. Earn and buy the first handset later in the recovery story.'))
    const phoneLabel = this.add.text(phone.x, phone.y, 'NO PHONE', {
      fontFamily: 'Arial, sans-serif', fontSize: '10px', fontStyle: 'bold', color: '#d7e0e5',
    }).setOrigin(0.5)
    elements.push(phoneBlocker, phoneLabel)

    const map = layout.minimap
    const mapBlocker = this.add.rectangle(
      map.x + map.width / 2,
      map.y + map.height / 2 + 8,
      map.width + 10,
      map.height + 34,
      0x122b3d,
      0.98,
    ).setStrokeStyle(2, 0x6f8794).setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.hud.notify('No GPS yet. Learn the nearby streets and landmarks on foot.'))
    const mapLabel = this.add.text(map.x + map.width / 2, map.y + map.height / 2 + 2, 'NO GPS\nLEARN THE STREETS', {
      fontFamily: 'Arial, sans-serif', fontSize: '9px', fontStyle: 'bold', color: '#d7e0e5', align: 'center',
    }).setOrigin(0.5)
    elements.push(mapBlocker, mapLabel)

    const zoom = layout.zoom
    const worldMapBlocker = this.add.rectangle(zoom.x, zoom.y + 48, 112, 44, 0x122b3d, 1)
      .setStrokeStyle(2, 0x6f8794).setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.hud.notify('World map is locked until the phone and later network progression are earned.'))
    const worldMapLabel = this.add.text(zoom.x, zoom.y + 48, 'MAP LOCKED', {
      fontFamily: 'Arial, sans-serif', fontSize: '9px', fontStyle: 'bold', color: '#d7e0e5',
    }).setOrigin(0.5)
    elements.push(worldMapBlocker, worldMapLabel)

    gate.add(elements)
    this.fixedUiLayer.add(gate)
    this.recoveryHudGate = gate
    this.recoveryHudBlockers = [phoneBlocker, mapBlocker, worldMapBlocker]
    this.updateRecoveryHudGate(null)
  }

  private updateRecoveryHudGate(statusText: string | null): void {
    const active = statusText !== null
    this.recoveryHudGate?.setVisible(active)
    this.recoveryHudStatus?.setText(statusText ?? '')
    this.recoveryHudBlockers.forEach(blocker => {
      if (blocker.input) blocker.input.enabled = active
    })
  }

  private readonly unlockAudio = (): void => { getAudioController().unlock() }

  private readonly clearInput = (): void => {
    this.hud?.clearMovement()
    this.input.keyboard?.resetKeys()
    this.zoomGesture.clear()
    this.cameraPan.clear()
  }

  private setWorldZoom(zoom: number, focal?: { x: number; y: number }): void {
    if (this.isModalOpen()) return
    if (zoom < this.cityFit() * 0.82) { this.openGlobalMap('home'); return }
    const camera = this.cameras.main, previousZoom = camera.zoom
    const worldFocal = focal ? { x: camera.scrollX + camera.width / 2 + (focal.x - camera.width / 2) / previousZoom,
      y: camera.scrollY + camera.height / 2 + (focal.y - camera.height / 2) / previousZoom } : undefined
    this.cameras.main.setZoom(clamp(zoom, this.cityFit(), 2.5))
    if (worldFocal && focal) {
      camera.stopFollow(); this.cameraFreeLook = true
      camera.setScroll(worldFocal.x - camera.width / 2 - (focal.x - camera.width / 2) / camera.zoom,
        worldFocal.y - camera.height / 2 - (focal.y - camera.height / 2) / camera.zoom)
    } else if (zoom > previousZoom && previousZoom < .4) {
      camera.centerOn(this.worldState.player.x, this.worldState.player.y)
    }
    if (zoom < 0.4) {
      this.cameras.main.stopFollow(); this.cameraFreeLook = true
      if (zoom <= this.cityFit() * 1.3) this.cameras.main.centerOn(WORLD_WIDTH / 2, WORLD_HEIGHT / 2)
    }
  }

  private cityFit(): number { return cityFitZoom(this.scale.width, this.scale.height, WORLD_WIDTH, WORLD_HEIGHT) }

  private readonly zoomWorldWheel = (pointer: Phaser.Input.Pointer, _objects: unknown, _dx: number, dy: number): void => {
    if (isUrbanHUDPoint(this.scale.width, this.scale.height, pointer.x, pointer.y)) return
    this.setWorldZoom(this.cameras.main.zoom * Math.exp(-clamp(dy, -200, 200) * .003), pointer)
  }

  private readonly beginWorldGesture = (pointer: Phaser.Input.Pointer): void => {
    if (this.isModalOpen() || isUrbanHUDPoint(this.scale.width, this.scale.height, pointer.x, pointer.y)) return
    this.zoomGesture.press(pointer.id, pointer)
    if (this.zoomGesture.isPinching()) {
      this.cameraPan.clear()
      return
    }
    this.cameraPan.begin(pointer.id, pointer)
  }

  private readonly moveWorldGesture = (pointer: Phaser.Input.Pointer): void => {
    if (!pointer.isDown || !this.zoomGesture.owns(pointer.id)) return
    const focal = this.zoomGesture.center()
    const zoom = this.zoomGesture.move(pointer.id, pointer, this.cameras.main.zoom)
    if (this.zoomGesture.isPinching()) {
      this.cameraPan.clear()
      this.setWorldZoom(zoom, focal)
      return
    }
    if (!this.cameraPan.owns(pointer.id)) return
    const drag = this.cameraPan.move(pointer.id, pointer)
    if (!drag) return
    if (!this.cameraFreeLook) {
      this.cameras.main.stopFollow()
      this.cameraFreeLook = true
      this.hud.notify('Free-look camera · drag to inspect the city · tap ⌖ to follow the courier again')
    }
    const next = cameraScrollFromDrag(
      { x: this.cameras.main.scrollX, y: this.cameras.main.scrollY },
      drag,
      this.cameras.main.zoom,
      { width: this.cameras.main.width, height: this.cameras.main.height },
      { width: WORLD_WIDTH, height: WORLD_HEIGHT },
    )
    this.cameras.main.setScroll(next.x, next.y)
  }

  private readonly endWorldGesture = (pointer: Phaser.Input.Pointer): void => {
    this.zoomGesture.release(pointer.id)
    this.cameraPan.release(pointer.id)
  }

  private recenterCamera(notify = true): void {
    if (!this.playerVisual) return
    this.zoomGesture.clear()
    this.cameraPan.clear()
    this.cameraFreeLook = false
    if (notify && this.cameras.main.zoom < .45) this.cameras.main.setZoom(1)
    this.cameras.main.startFollow(this.playerVisual.container, false, 0.18, 0.18)
    if (notify && this.hud) this.hud.notify('Camera centered on courier · drag the city to enter free-look again')
  }

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
    this.groundDetail?.destroy()
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
    this.recenterCamera(false)
    this.applyMapReturnView()
    this.refreshPresentation()
    this.presentRecoveryOpeningIfNeeded()
  }

  private applyMapReturnView(): void {
    const view = this.registry.get('map-local-view')
    if (!view) return
    this.registry.remove('map-local-view')
    this.setWorldZoom(view === 'City' ? this.cityFit() : 1)
    if (view !== 'City') this.recenterCamera(false)
  }

  private shutdown(): void {
    this.clearInput()
    this.resizeRestartTimer?.remove()
    this.resizeRestartTimer = undefined
    this.recoveryHudGate?.destroy(true)
    this.recoveryHudGate = undefined
    this.recoveryHudBlockers = []
    this.narrative.destroy()
    this.hud.destroy()
    this.scale.off(Phaser.Scale.Events.RESIZE, this.handleResize)
    this.game.events.off(Phaser.Core.Events.BLUR, this.clearInput)
    this.events.off(Phaser.Scenes.Events.SLEEP, this.handleSleep, this)
    this.events.off(Phaser.Scenes.Events.WAKE, this.handleWake, this)
    this.input.off('pointerdown', this.unlockAudio)
    this.input.off('pointerdown', this.beginWorldGesture)
    this.input.off('pointermove', this.moveWorldGesture)
    this.input.off('pointerup', this.endWorldGesture)
    this.input.off('pointerupoutside', this.endWorldGesture)
    this.input.off('wheel', this.zoomWorldWheel)
    this.input.off('gameout', this.clearInput)
    this.input.keyboard?.off('keydown', this.unlockAudio)
    this.ambient = undefined
    this.groundDetail?.destroy(); this.groundDetail = undefined
  }
}
