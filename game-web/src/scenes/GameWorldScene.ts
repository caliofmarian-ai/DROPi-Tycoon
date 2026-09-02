import Phaser from 'phaser'
import { getBrowserSaveStorage } from '../persistence/browserSaveStorage'
import { autosaveIfApproved } from '../persistence/saveSystem'
import { WORLD_HEIGHT, WORLD_WIDTH } from '../state/gameState'
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
import type { RectBounds } from '../ui/hudLayout'
import {
  buildNavigationButtonBounds,
  type LayoutRect,
} from '../ui/mobileViewport'
import { selectDeliveryIntentFromTap } from '../utils/deliveryIntent'

const ROAD_POSITIONS = [
  { x: 240, y: 200 },
  { x: 272, y: 200 },
  { x: 304, y: 200 },
  { x: 336, y: 200 },
  { x: 432, y: 200 },
  { x: 464, y: 200 },
]

const BUILDINGS = [
  { x: 368, y: 182, texture: 'building_company_small' },
  { x: 80, y: 60, texture: 'building_residential' },
  { x: 160, y: 60, texture: 'building_residential' },
  { x: 580, y: 60, texture: 'building_commercial' },
  { x: 660, y: 60, texture: 'building_commercial' },
]

const DELIVERY_POINTS = [
  { x: 120, y: 490, label: 'PickupZone' },
  { x: 580, y: 470, label: 'DeliveryZone' },
  { x: 660, y: 510, label: 'DeliveryPoint' },
]

const DELIVERY_MARKER_TAP_RADIUS = 36

const rectCenterX = (rect: LayoutRect): number => rect.left + rect.width / 2
const rectCenterY = (rect: LayoutRect): number => rect.top + rect.height / 2

export class GameWorldScene extends Phaser.Scene {
  private worldState!: WorldState

  private companyState!: CompanyState

  private player!: Phaser.GameObjects.Sprite

  private readonly packagePosition = new Phaser.Math.Vector2(120, 440)

  private packageSprite!: Phaser.GameObjects.Image

  private gameHUD!: GameHUD

  private notificationDisplay!: NotificationDisplay

  private notificationState!: NotificationState

  private readonly menuButtons: Phaser.GameObjects.Rectangle[] = []
  private readonly menuButtonBounds: RectBounds[] = []
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
    this.load.image('environment_road_tile', '/assets/sprites/environment_road_tile.png')
    this.load.image('package_delivery', '/assets/sprites/package_delivery.png')
    this.load.image('player_character_idle', '/assets/sprites/player_character_idle.png')
    this.load.image('player_character_move', '/assets/sprites/player_character_move.png')
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

    this.add.rectangle(WORLD_WIDTH / 2, WORLD_HEIGHT / 2, WORLD_WIDTH, WORLD_HEIGHT, 0xa7f3d0)

    ROAD_POSITIONS.forEach(({ x, y }) => {
      this.add.image(x, y, 'environment_road_tile')
    })

    BUILDINGS.forEach(({ x, y, texture }) => {
      this.add.image(x, y, texture)
    })

    this.packageSprite = this.add.image(
      this.packagePosition.x,
      this.packagePosition.y,
      'package_delivery',
    )

    DELIVERY_POINTS.forEach(({ x, y, label }) => {
      this.add.image(x, y, 'delivery_point_marker')
      this.add
        .text(x, y + 28, label, {
          fontFamily: 'Arial',
          fontSize: '16px',
          color: '#0f172a',
        })
        .setOrigin(0.5, 0)
    })

    this.player = this.add.sprite(
      this.worldState.player.x,
      this.worldState.player.y,
      'player_character_idle',
    )

    this.cameras.main.setZoom(CAMERA_DEFAULT_ZOOM)
    this.cameras.main.startFollow(this.player, false, 1, 1)

    this.notificationState = createNotificationState(this.worldState.activeOrder.status)
    this.createNavigationButtons()
    this.createCameraControlButtons()
    this.attachCameraGestures()
    this.gameHUD = new GameHUD(this, () => this.onAcceptButtonPressed())
    this.notificationDisplay = new NotificationDisplay(this, () => {
      this.notificationState = clearNotification(this.notificationState)
    })
    this.gameHUD.update(buildHUDData(this.worldState, this.companyState))

    this.pointerUpHandler = (pointer: Phaser.Input.Pointer) => {
      if (this.cameraGestureController?.didCameraGestureMove()) {
        return
      }

      if (
        isPointerOnInteractiveUI(pointer.x, pointer.y, {
          menuButtonBounds: this.menuButtonBounds,
          hudControlBounds: this.gameHUD.getInteractiveBounds(),
          cameraControlBounds: this.cameraControlBounds,
        })
      ) {
        return
      }

      this.worldState.tapTarget = { x: pointer.worldX, y: pointer.worldY }
      this.worldState.isMoving = true

      if (
        this.worldState.activeOrder.status === 'Available' &&
        Phaser.Math.Distance.Between(
          pointer.worldX,
          pointer.worldY,
          this.packagePosition.x,
          this.packagePosition.y,
        ) <= 28
      ) {
        this.applyAcceptance(this.worldState.activeOrder.orderId)
      }

      if (this.worldState.activeOrder.status === 'PickedUp' && this.worldState.player.carryingPackage) {
        this.worldState.pendingDeliveryDestination = selectDeliveryIntentFromTap(
          pointer.worldX,
          pointer.worldY,
          DELIVERY_POINTS,
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
      this.player.setTexture('player_character_move')
      return
    }

    this.player.setPosition(this.worldState.tapTarget.x, this.worldState.tapTarget.y)
    this.worldState.player.x = this.player.x
    this.worldState.player.y = this.player.y
    this.worldState.isMoving = false
    this.player.setTexture('player_character_idle')
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

    const targetPoint = DELIVERY_POINTS.find(
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
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      currentStatus as import('../types/game').OrderStatus,
    )
    this.notificationState = result.state
    if (result.newMessage !== null) {
      this.notificationDisplay.show(result.newMessage)
    }
  }

  private createNavigationButtons(): void {
    const bounds = buildNavigationButtonBounds(this.scale.width, this.scale.height)
    this.createMenuButton(bounds[0], 'Main Menu', () => this.openMainMenu())
    this.createMenuButton(bounds[1], 'Company', () => this.openCompanyManagement())
  }

  private createCameraControlButtons(): void {
    const controls = buildCameraControlButtons(this.scale.width, this.scale.height)
    controls.forEach(({ action, label, bounds }) => {
      const x = rectCenterX(bounds)
      const y = rectCenterY(bounds)
      const button = this.add
        .rectangle(x, y, bounds.width, bounds.height, 0x0f172a, 0.88)
        .setStrokeStyle(2, 0xe2e8f0)
        .setScrollFactor(0)
        .setDepth(30)
        .setInteractive({ useHandCursor: true })

      this.add
        .text(x, y, label, {
          fontFamily: 'Arial',
          fontSize: '27px',
          color: '#f8fafc',
          fontStyle: 'bold',
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(31)

      button.on('pointerdown', () => this.applyCameraControl(action))
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
    })
    this.cameraGestureController.attach()
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

  private createMenuButton(bounds: LayoutRect, label: string, onTap: () => void): void {
    const x = rectCenterX(bounds)
    const y = rectCenterY(bounds)
    const fontSize = bounds.height <= 50 ? 17 : 20
    const button = this.add
      .rectangle(x, y, bounds.width, bounds.height, 0x1d4ed8, 0.95)
      .setStrokeStyle(2, 0xbfdbfe)
      .setScrollFactor(0)
      .setDepth(20)
      .setInteractive({ useHandCursor: true })

    this.add
      .text(x, y, label, {
        fontFamily: 'Arial',
        fontSize: `${fontSize}px`,
        color: '#eff6ff',
        fontStyle: 'bold',
        align: 'center',
        wordWrap: { width: Math.max(80, bounds.width - 10) },
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(21)

    button.on('pointerdown', onTap)
    this.menuButtons.push(button)
    this.menuButtonBounds.push({ ...bounds })
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
    this.menuButtonBounds.length = 0
    this.cameraControlButtons.length = 0
    this.cameraControlBounds.length = 0
  }
}
