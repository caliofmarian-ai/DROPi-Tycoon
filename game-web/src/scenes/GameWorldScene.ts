import Phaser from 'phaser'
import { getBrowserSaveStorage } from '../persistence/browserSaveStorage'
import { autosaveIfApproved } from '../persistence/saveSystem'
import {
  DELIVERY_ROUTE_POINTS,
  WORLD_BUILDINGS,
  WORLD_DECORATIONS,
  WORLD_HEIGHT,
  WORLD_ROADS,
  WORLD_ROUTE_POINTS,
  WORLD_SIDEWALKS,
  WORLD_WIDTH,
  WORLD_ZONES,
} from '../world/worldLayout'
import { getOrCreateGameSession, replaceGameSession } from '../state/gameSession'
import {
  attemptDelivery,
  attemptPickup,
} from '../systems/orderSystem'
import { applyOrderAcceptanceRequest } from '../systems/orderAcceptance'
import { settleDeliveryOutcome } from '../systems/economySettlement'
import { createNextOrder, pickupPointForOrder } from '../systems/orderGeneration'
import { synchronizePlayerMovementSpeed } from '../systems/bicycleSystem'
import type { CompanyState, WorldState } from '../types/game'
import { GameHUD } from '../ui/GameHUD'
import { NotificationDisplay } from '../ui/NotificationDisplay'
import { buildHUDData } from '../ui/HUDViewModel'
import {
  clearNotification,
  createNotificationState,
  updateNotification,
  type NotificationState,
} from '../ui/NotificationController'
import { isPointerOnInteractiveUI } from '../ui/pointerIsolation'
import { CameraGestureController } from '../ui/CameraGestureController'
import {
  CAMERA_DEFAULT_ZOOM,
  buildCameraControlButtons,
  rotateByStep,
  zoomByStep,
  type CameraControlAction,
  type TouchPoint,
} from '../ui/cameraControls'
import { boundsContainPoint, type RectBounds } from '../ui/hudLayout'
import { type LayoutRect } from '../ui/mobileViewport'
import {
  buildGameWorldTopBarLayout,
  GAMEWORLD_TOP_BAR_VISUAL_BUTTON_PX,
} from '../ui/gameWorldTopBar'
import { selectActiveVehiclePresentation } from '../systems/vehicleSystem'
import { createPlayerVisual, type PlayerVisual } from '../world/playerVisual'
import { selectDeliveryIntentFromTap } from '../utils/deliveryIntent'

const DELIVERY_MARKER_TAP_RADIUS = 36

const rectCenterX = (rect: LayoutRect): number => rect.left + rect.width / 2
const rectCenterY = (rect: LayoutRect): number => rect.top + rect.height / 2

export class GameWorldScene extends Phaser.Scene {
  private worldState!: WorldState

  private companyState!: CompanyState

  private player!: Phaser.GameObjects.Container
  private playerVisual!: PlayerVisual

  private readonly packagePosition = new Phaser.Math.Vector2(0, 0)

  private packageSprite!: Phaser.GameObjects.Image

  private fixedUiLayer!: Phaser.GameObjects.Layer

  private fixedUiCamera!: Phaser.Cameras.Scene2D.Camera

  private gameHUD!: GameHUD

  private notificationDisplay!: NotificationDisplay

  private notificationState!: NotificationState

  private readonly menuButtons: Phaser.GameObjects.Rectangle[] = []
  private readonly menuDropdownButtons: Phaser.GameObjects.Rectangle[] = []
  private readonly menuDropdownLabels: Phaser.GameObjects.Text[] = []
  private readonly menuDropdownBounds: RectBounds[] = []
  private readonly menuButtonBounds: RectBounds[] = []
  private menuToggleBounds: RectBounds | null = null
  private topControlBarBounds: RectBounds | null = null
  private navigationMenuOpen = false
  private readonly cameraControlButtons: Phaser.GameObjects.Rectangle[] = []
  private readonly cameraControlBounds: RectBounds[] = []
  private cameraGestureController: CameraGestureController | null = null
  private cameraRotation = 0
  private pointerUpHandler: ((pointer: Phaser.Input.Pointer) => void) | null = null

  private readonly handleResize = (): void => {
    if (this.worldState && this.companyState) {
      this.syncRuntimeSession()
    }
    this.scene.restart()
  }

  constructor() {
    super('GameWorld')
  }

  preload(): void {
    this.load.image('building_company_small', '/assets/sprites/building_company_small.png')
    this.load.image('building_residential', '/assets/sprites/building_residential.png')
    this.load.image('building_commercial', '/assets/sprites/building_commercial.png')
    this.load.image('delivery_point_marker', '/assets/sprites/delivery_point_marker.png')
    this.load.image('package_delivery', '/assets/sprites/package_delivery.png')
  }

  create(): void {
    const session = getOrCreateGameSession()
    this.companyState = session.company
    this.worldState = synchronizePlayerMovementSpeed(session.world, this.companyState)
    replaceGameSession(this.worldState, this.companyState)

    const initialPickupPoint = pickupPointForOrder(this.worldState.activeOrder)
    this.packagePosition.set(initialPickupPoint.x, initialPickupPoint.y)

    this.cameras.main.setBackgroundColor('#91d0ff')
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT)
    const topDockLayout = buildGameWorldTopBarLayout(this.scale.width, this.scale.height)
    this.cameras.main.setViewport(
      0,
      topDockLayout.worldViewportTop,
      this.scale.width,
      Math.max(1, this.scale.height - topDockLayout.worldViewportTop),
    )

    this.renderWorldLayout()

    this.packageSprite = this.add.image(
      this.packagePosition.x,
      this.packagePosition.y,
      'package_delivery',
    )

    const activeVehiclePresentation = selectActiveVehiclePresentation(this.companyState)
    this.playerVisual = createPlayerVisual(
      this,
      this.worldState.player.x,
      this.worldState.player.y,
    )
    this.playerVisual.setState(activeVehiclePresentation ?? 'Walking')
    this.player = this.playerVisual.container

    this.cameras.main.setZoom(CAMERA_DEFAULT_ZOOM)
    this.cameras.main.startFollow(this.player, false, 1, 1)

    const worldRenderObjects = [...this.children.list]
    this.fixedUiLayer = this.add.layer()
    this.fixedUiCamera = this.cameras.add(
      0,
      0,
      this.scale.width,
      this.scale.height,
      false,
      'FixedScreenUI',
    )
    this.fixedUiCamera.setScroll(0, 0)
    this.fixedUiCamera.setZoom(1)
    this.fixedUiCamera.setRotation(0)
    this.fixedUiCamera.setBackgroundColor('rgba(0,0,0,0)')
    this.fixedUiCamera.ignore(worldRenderObjects)
    this.cameras.main.ignore(this.fixedUiLayer)

    this.notificationState = createNotificationState(this.worldState.activeOrder.status)
    this.createNavigationButtons()
    this.createCameraControlButtons()
    this.gameHUD = new GameHUD(this, () => this.onAcceptButtonPressed(), this.fixedUiLayer)
    this.notificationDisplay = new NotificationDisplay(
      this,
      () => {
        this.notificationState = clearNotification(this.notificationState)
      },
      this.fixedUiLayer,
    )
    this.gameHUD.update(buildHUDData(this.worldState, this.companyState))
    this.attachCameraGestures()

    this.pointerUpHandler = (pointer: Phaser.Input.Pointer) => {
      if (this.cameraGestureController?.didCameraGestureMove()) {
        return
      }

      if (this.navigationMenuOpen && !this.isPointOnNavigationMenu(pointer.x, pointer.y)) {
        this.setNavigationMenuOpen(false)
        return
      }

      const fixedHudBounds = [
        ...(this.topControlBarBounds ? [this.topControlBarBounds] : []),
        ...this.gameHUD.getScreenBlockingBounds(),
        ...(this.notificationDisplay.isVisible()
          ? [this.notificationDisplay.getScreenBounds()]
          : []),
      ]
      if (
        isPointerOnInteractiveUI(pointer.x, pointer.y, {
          menuButtonBounds: this.menuButtonBounds,
          hudControlBounds: fixedHudBounds,
          cameraControlBounds: this.cameraControlBounds,
        })
      ) {
        return
      }

      // Resolve gameplay coordinates explicitly through the transformable world camera.
      const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y)
      this.worldState.tapTarget = { x: worldPoint.x, y: worldPoint.y }
      this.worldState.isMoving = true

      if (
        this.worldState.activeOrder.status === 'Available' &&
        Phaser.Math.Distance.Between(
          worldPoint.x,
          worldPoint.y,
          this.packagePosition.x,
          this.packagePosition.y,
        ) <= 28
      ) {
        this.applyAcceptance(this.worldState.activeOrder.orderId)
      }

      if (this.worldState.activeOrder.status === 'PickedUp' && this.worldState.player.carryingPackage) {
        this.worldState.pendingDeliveryDestination = selectDeliveryIntentFromTap(
          worldPoint.x,
          worldPoint.y,
          DELIVERY_ROUTE_POINTS,
          DELIVERY_MARKER_TAP_RADIUS,
        )
      }

      this.gameHUD.update(buildHUDData(this.worldState, this.companyState))
    }
    this.input.on('pointerup', this.pointerUpHandler)
    this.scale.on(Phaser.Scale.Events.RESIZE, this.handleResize)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.handleSceneShutdown, this)
  }

  private onAcceptButtonPressed(): void {
    this.applyAcceptance(this.worldState.activeOrder.orderId)
    this.gameHUD.update(buildHUDData(this.worldState, this.companyState))
  }

  private applyAcceptance(requestedOrderId: string): void {
    const previousStatus = this.worldState.activeOrder.status
    const accepted = applyOrderAcceptanceRequest(this.worldState, requestedOrderId)
    this.worldState = accepted.worldState
    this.emitNotificationIfTransitioned(previousStatus, this.worldState.activeOrder.status)
  }

  update(_: number, delta: number): void {
    this.updateMovement(delta / 1000)
    this.updatePickupState()
    this.updateDeliveryState()
    this.gameHUD.update(buildHUDData(this.worldState, this.companyState))
  }

  private updateMovement(deltaSeconds: number): void {
    if (!this.worldState.isMoving) {
      return
    }

    const distanceToTarget = Phaser.Math.Distance.Between(
      this.player.x,
      this.player.y,
      this.worldState.tapTarget.x,
      this.worldState.tapTarget.y,
    )

    this.worldState.distanceToTarget = distanceToTarget

    if (distanceToTarget > this.worldState.arrivalThreshold) {
      const angle = Phaser.Math.Angle.Between(
        this.player.x,
        this.player.y,
        this.worldState.tapTarget.x,
        this.worldState.tapTarget.y,
      )

      this.player.x += Math.cos(angle) * this.worldState.player.movementSpeed * deltaSeconds
      this.player.y += Math.sin(angle) * this.worldState.player.movementSpeed * deltaSeconds
      this.worldState.player.x = this.player.x
      this.worldState.player.y = this.player.y
      this.playerVisual.setFacing(Math.cos(angle) < 0)
      this.playerVisual.setMoving(true)
      return
    }

    this.player.setPosition(this.worldState.tapTarget.x, this.worldState.tapTarget.y)
    this.worldState.player.x = this.player.x
    this.worldState.player.y = this.player.y
    this.worldState.isMoving = false
    this.playerVisual.setMoving(false)
  }

  private updatePickupState(): void {
    const previousStatus = this.worldState.activeOrder.status
    const pickupAttempt = attemptPickup(this.worldState.activeOrder, this.worldState.player, {
      distanceToPackage: Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        this.packagePosition.x,
        this.packagePosition.y,
      ),
      expectedPickupLocation: this.worldState.activeOrder.pickupLocation,
      pickupRadius: this.worldState.pickupRadius,
    })

    this.worldState.activeOrder = pickupAttempt.order
    this.worldState.player = pickupAttempt.player
    if (previousStatus !== 'PickedUp' && this.worldState.activeOrder.status === 'PickedUp') {
      this.packageSprite.setVisible(false)
    }
    this.emitNotificationIfTransitioned(previousStatus, this.worldState.activeOrder.status)
  }

  private updateDeliveryState(): void {
    if (
      !this.worldState.pendingDeliveryDestination ||
      this.worldState.activeOrder.status !== 'PickedUp'
    ) {
      return
    }

    const targetPoint = DELIVERY_ROUTE_POINTS.find(
      (pt) => pt.label === this.worldState.pendingDeliveryDestination,
    )
    if (!targetPoint) {
      return
    }

    const distanceToDestination = Phaser.Math.Distance.Between(
      this.player.x,
      this.player.y,
      targetPoint.x,
      targetPoint.y,
    )

    const previousOrder = this.worldState.activeOrder
    const deliveryResult = attemptDelivery(
      previousOrder,
      this.worldState.player,
      {
        selectedDestination: this.worldState.pendingDeliveryDestination,
        distanceToDestination,
        deliveryRadius: this.worldState.deliveryRadius,
        orderConditionsMet: true,
      },
    )

    if (deliveryResult.order.status !== previousOrder.status) {
      const settlement = settleDeliveryOutcome(
        previousOrder,
        deliveryResult.order,
        this.companyState,
      )
      if (settlement.applied) {
        this.companyState = settlement.company
        this.worldState.activeOrder = settlement.order
      } else {
        this.worldState.activeOrder = deliveryResult.order
      }
      this.worldState.player = deliveryResult.player
      this.worldState.pendingDeliveryDestination = ''
      this.emitNotificationIfTransitioned(previousOrder.status, this.worldState.activeOrder.status)

      if (settlement.applied) {
        const session = replaceGameSession(this.worldState, this.companyState)
        const storage = getBrowserSaveStorage()
        if (storage) {
          const autosaveEvent =
            this.worldState.activeOrder.status === 'Completed'
              ? 'delivery-completed'
              : 'progression-changed'
          autosaveIfApproved(storage, session, autosaveEvent)
        }
        this.spawnNextAvailableOrder()
      }
    }
  }

  private spawnNextAvailableOrder(): void {
    const terminalOrder = this.worldState.activeOrder
    if (
      (terminalOrder.status !== 'Completed' && terminalOrder.status !== 'Failed') ||
      !terminalOrder.economySettled
    ) {
      return
    }

    const nextOrder = createNextOrder(terminalOrder)
    const pickupPoint = pickupPointForOrder(nextOrder)
    this.worldState.activeOrder = nextOrder
    this.worldState.player = {
      ...this.worldState.player,
      currentOrder: '',
      carryingPackage: false,
    }
    this.worldState.pendingDeliveryDestination = ''
    this.packagePosition.set(pickupPoint.x, pickupPoint.y)
    this.packageSprite.setPosition(pickupPoint.x, pickupPoint.y).setVisible(true)

    const notificationReset = updateNotification(this.notificationState, 'Available')
    this.notificationState = notificationReset.state
    replaceGameSession(this.worldState, this.companyState)
    this.gameHUD.update(buildHUDData(this.worldState, this.companyState))
  }

  private emitNotificationIfTransitioned(
    _previousStatus: string,
    currentStatus: string,
  ): void {
    const result = updateNotification(
      this.notificationState,
      currentStatus as import('../types/game').OrderStatus,
      this.worldState.activeOrder,
    )
    this.notificationState = result.state
    if (result.newMessage !== null) {
      this.notificationDisplay.show(result.newMessage)
    }
  }

  private renderWorldLayout(): void {
    this.add.rectangle(
      WORLD_WIDTH / 2,
      WORLD_HEIGHT / 2,
      WORLD_WIDTH,
      WORLD_HEIGHT,
      0xa7f3d0,
    )

    WORLD_ZONES.forEach((zone) => {
      this.add
        .rectangle(
          zone.x + zone.width / 2,
          zone.y + zone.height / 2,
          zone.width,
          zone.height,
          zone.fillColor,
          0.45,
        )
        .setStrokeStyle(3, 0x475569, 0.45)

      this.add.text(zone.x + 18, zone.y + 14, zone.label, {
        fontFamily: 'Arial',
        fontSize: '22px',
        color: '#0f172a',
        fontStyle: 'bold',
      })
    })

    WORLD_ROADS.forEach((road) => {
      this.add.rectangle(road.x, road.y, road.width, road.height, 0x64748b)
    })

    WORLD_SIDEWALKS.forEach((sidewalk) => {
      this.add.rectangle(
        sidewalk.x,
        sidewalk.y,
        sidewalk.width,
        sidewalk.height,
        0xe2e8f0,
      )
    })

    WORLD_BUILDINGS.forEach(({ x, y, texture }) => {
      this.add.image(x, y, texture).setScale(1.4)
    })

    WORLD_DECORATIONS.forEach(({ x, y, radius }) => {
      this.add.rectangle(x, y + radius, 7, radius * 1.4, 0x7c4a21)
      this.add.circle(x, y, radius, 0x15803d)
    })

    WORLD_ROUTE_POINTS.forEach(({ x, y, label, kind }) => {
      this.add.image(x, y, 'delivery_point_marker')
      this.add
        .text(x, y + 28, `${kind === 'pickup' ? 'Pickup' : 'Delivery'}: ${label}`, {
          fontFamily: 'Arial',
          fontSize: '15px',
          color: '#0f172a',
          backgroundColor: '#f8fafccc',
          padding: { x: 4, y: 2 },
        })
        .setOrigin(0.5, 0)
    })
  }

  private createNavigationButtons(): void {
    const layout = buildGameWorldTopBarLayout(this.scale.width, this.scale.height)
    this.topControlBarBounds = { ...layout.controlBar }

    const controlBarBg = this.add
      .rectangle(
        rectCenterX(layout.controlBar),
        rectCenterY(layout.controlBar),
        layout.controlBar.width,
        layout.controlBar.height,
        0x0f172a,
        0.78,
      )
      .setScrollFactor(0)
      .setDepth(18)
    this.fixedUiLayer.add(controlBarBg)

    const menuToggle = this.createTopIconButton(layout.menuToggle, '☰', () => {
      this.setNavigationMenuOpen(!this.navigationMenuOpen)
    })
    this.menuButtons.push(menuToggle)
    this.menuToggleBounds = { ...layout.menuToggle }

    const dropdownActions: ReadonlyArray<readonly [LayoutRect, string, () => void]> = [
      [layout.dropdownItems[0], 'Main Menu', () => this.openMainMenu()],
      [layout.dropdownItems[1], 'Company', () => this.openCompanyManagement()],
    ]

    dropdownActions.forEach(([bounds, label, onTap]) => {
      const created = this.createMenuButton(bounds, label, onTap)
      this.menuButtons.push(created.button)
      this.menuDropdownButtons.push(created.button)
      this.menuDropdownLabels.push(created.label)
      this.menuDropdownBounds.push({ ...bounds })
    })

    this.setNavigationMenuOpen(false)
  }

  private createCameraControlButtons(): void {
    const controls = buildCameraControlButtons(this.scale.width, this.scale.height)
    controls.forEach(({ action, label, bounds }) => {
      const button = this.createTopIconButton(bounds, label, () => this.applyCameraControl(action))
      this.cameraControlButtons.push(button)
      this.cameraControlBounds.push({ ...bounds })
    })
  }

  private applyCameraControl(action: CameraControlAction): void {
    const camera = this.cameras.main
    switch (action) {
      case 'zoom-in':
        this.setCameraZoom(zoomByStep(camera.zoom, 'in'), {
          x: this.scale.width / 2,
          y: this.scale.height / 2,
        })
        return
      case 'zoom-out':
        this.setCameraZoom(zoomByStep(camera.zoom, 'out'), {
          x: this.scale.width / 2,
          y: this.scale.height / 2,
        })
        return
      case 'rotate-left':
        this.cameraRotation = rotateByStep(this.cameraRotation, 'left')
        camera.setRotation(this.cameraRotation)
        return
      case 'rotate-right':
        this.cameraRotation = rotateByStep(this.cameraRotation, 'right')
        camera.setRotation(this.cameraRotation)
        return
      case 'recenter':
        this.cameraRotation = 0
        camera.setRotation(0)
        camera.startFollow(this.player, false, 1, 1)
        return
    }
  }

  private attachCameraGestures(): void {
    this.cameraGestureController = new CameraGestureController(this.game.canvas, {
      getZoom: () => this.cameras.main.zoom,
      setZoom: (zoom, focalPoint) => this.setCameraZoom(zoom, focalPoint),
      getRotation: () => this.cameraRotation,
      setRotation: (rotation) => {
        this.cameraRotation = rotation
        this.cameras.main.setRotation(rotation)
      },
      panByScreenDelta: (dx, dy) => this.panCameraByScreenDelta(dx, dy),
      onManualCameraControl: () => this.cameras.main.stopFollow(),
      shouldIgnorePointer: (point) => this.isPointOnFixedScreenUI(point.x, point.y),
    })
    this.cameraGestureController.attach()
  }

  private isPointOnFixedScreenUI(x: number, y: number): boolean {
    const bounds = [
      ...(this.topControlBarBounds ? [this.topControlBarBounds] : []),
      ...this.menuButtonBounds,
      ...this.cameraControlBounds,
      ...this.gameHUD.getScreenBlockingBounds(),
      ...(this.notificationDisplay.isVisible()
        ? [this.notificationDisplay.getScreenBounds()]
        : []),
    ]
    return bounds.some((rect) => boundsContainPoint(rect, x, y))
  }

  private isPointOnNavigationMenu(x: number, y: number): boolean {
    return this.menuButtonBounds.some((rect) => boundsContainPoint(rect, x, y))
  }

  private setNavigationMenuOpen(open: boolean): void {
    this.navigationMenuOpen = open
    this.menuDropdownButtons.forEach((button) => {
      button.setVisible(open)
      if (open) {
        button.setInteractive({ useHandCursor: true })
      } else {
        button.disableInteractive()
      }
    })
    this.menuDropdownLabels.forEach((label) => label.setVisible(open))

    this.menuButtonBounds.length = 0
    if (this.menuToggleBounds) {
      this.menuButtonBounds.push({ ...this.menuToggleBounds })
    }
    if (open) {
      this.menuButtonBounds.push(...this.menuDropdownBounds.map((bounds) => ({ ...bounds })))
    }
  }

  private setCameraZoom(zoom: number, focalPoint: TouchPoint): void {
    const camera = this.cameras.main
    const before = camera.getWorldPoint(focalPoint.x, focalPoint.y)
    camera.setZoom(zoom)
    const after = camera.getWorldPoint(focalPoint.x, focalPoint.y)
    camera.scrollX += before.x - after.x
    camera.scrollY += before.y - after.y
  }

  private panCameraByScreenDelta(dx: number, dy: number): void {
    const camera = this.cameras.main
    const cos = Math.cos(this.cameraRotation)
    const sin = Math.sin(this.cameraRotation)
    const worldDx = (dx * cos + dy * sin) / camera.zoom
    const worldDy = (-dx * sin + dy * cos) / camera.zoom
    camera.scrollX -= worldDx
    camera.scrollY -= worldDy
  }

  private openMainMenu(): void {
    this.syncRuntimeSession()
    this.scene.start('MainMenu')
  }

  private openCompanyManagement(): void {
    this.syncRuntimeSession()
    this.scene.start('CompanyManagement')
  }

  private syncRuntimeSession(): void {
    replaceGameSession(this.worldState, this.companyState)
  }

  private createTopIconButton(
    bounds: LayoutRect,
    label: string,
    onTap: () => void,
  ): Phaser.GameObjects.Rectangle {
    const x = rectCenterX(bounds)
    const y = rectCenterY(bounds)
    const visualSize = Math.min(
      GAMEWORLD_TOP_BAR_VISUAL_BUTTON_PX,
      bounds.width - 4,
      bounds.height - 4,
    )

    const hitButton = this.add
      .rectangle(x, y, bounds.width, bounds.height, 0x0f172a, 0.001)
      .setScrollFactor(0)
      .setDepth(29)
      .setInteractive({ useHandCursor: true })

    const visualButton = this.add
      .rectangle(x, y, visualSize, visualSize, 0x1e293b, 0.96)
      .setStrokeStyle(1, 0x94a3b8, 0.85)
      .setScrollFactor(0)
      .setDepth(30)

    const labelText = this.add
      .text(x, y, label, {
        fontFamily: 'Arial',
        fontSize: label === '☰' ? '19px' : '18px',
        color: '#f8fafc',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(31)

    this.fixedUiLayer.add([hitButton, visualButton, labelText])
    hitButton.on('pointerdown', onTap)
    return hitButton
  }

  private createMenuButton(
    bounds: LayoutRect,
    label: string,
    onTap: () => void,
  ): { button: Phaser.GameObjects.Rectangle; label: Phaser.GameObjects.Text } {
    const x = rectCenterX(bounds)
    const y = rectCenterY(bounds)
    const button = this.add
      .rectangle(x, y, bounds.width, bounds.height, 0x1e293b, 0.97)
      .setStrokeStyle(1, 0x94a3b8, 0.9)
      .setScrollFactor(0)
      .setDepth(40)
      .setInteractive({ useHandCursor: true })

    const labelText = this.add
      .text(x, y, label, {
        fontFamily: 'Arial',
        fontSize: '15px',
        color: '#f8fafc',
        fontStyle: 'bold',
        align: 'center',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(41)

    this.fixedUiLayer.add([button, labelText])
    button.on('pointerdown', onTap)
    return { button, label: labelText }
  }

  private handleSceneShutdown(): void {
    if (this.pointerUpHandler) {
      this.input.off('pointerup', this.pointerUpHandler)
      this.pointerUpHandler = null
    }
    this.cameraGestureController?.destroy()
    this.cameraGestureController = null
    this.scale.off(Phaser.Scale.Events.RESIZE, this.handleResize)
    this.notificationDisplay.destroy()
    this.menuButtons.length = 0
    this.menuDropdownButtons.length = 0
    this.menuDropdownLabels.length = 0
    this.menuDropdownBounds.length = 0
    this.menuButtonBounds.length = 0
    this.menuToggleBounds = null
    this.topControlBarBounds = null
    this.navigationMenuOpen = false
    this.cameraControlButtons.length = 0
    this.cameraControlBounds.length = 0
  }
}
