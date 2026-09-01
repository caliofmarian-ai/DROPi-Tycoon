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
import type { RectBounds } from '../ui/hudLayout'
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

export class GameWorldScene extends Phaser.Scene {
  private worldState!: WorldState

  private companyState!: CompanyState

  private player!: Phaser.GameObjects.Sprite

  private readonly packagePosition = new Phaser.Math.Vector2(120, 440)

  private gameHUD!: GameHUD

  private notificationDisplay!: NotificationDisplay

  private notificationState!: NotificationState

  private readonly menuButtons: Phaser.GameObjects.Rectangle[] = []
  private readonly menuButtonBounds: RectBounds[] = []
  private pointerDownHandler: ((pointer: Phaser.Input.Pointer) => void) | null = null

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

    this.cameras.main.setBackgroundColor('#91d0ff')
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT)

    this.add.rectangle(WORLD_WIDTH / 2, WORLD_HEIGHT / 2, WORLD_WIDTH, WORLD_HEIGHT, 0xa7f3d0)

    ROAD_POSITIONS.forEach(({ x, y }) => {
      this.add.image(x, y, 'environment_road_tile')
    })

    BUILDINGS.forEach(({ x, y, texture }) => {
      this.add.image(x, y, texture)
    })

    this.add.image(this.packagePosition.x, this.packagePosition.y, 'package_delivery')

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

    this.cameras.main.startFollow(this.player, false, 1, 1)

    this.notificationState = createNotificationState(this.worldState.activeOrder.status)
    this.createNavigationButtons()
    this.gameHUD = new GameHUD(this, () => this.onAcceptButtonPressed())
    this.notificationDisplay = new NotificationDisplay(this, () => {
      this.notificationState = clearNotification(this.notificationState)
    })
    this.gameHUD.update(buildHUDData(this.worldState, this.companyState))

    this.pointerDownHandler = (pointer: Phaser.Input.Pointer) => {
      if (
        isPointerOnInteractiveUI(pointer.x, pointer.y, {
          menuButtonBounds: this.menuButtonBounds,
          hudControlBounds: this.gameHUD.getInteractiveBounds(),
        })
      ) {
        return
      }

      this.worldState.tapTarget = { x: pointer.worldX, y: pointer.worldY }
      this.worldState.isMoving = true

      // Compatibility acceptance path: tap near the package sprite while Available.
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
    this.input.on('pointerdown', this.pointerDownHandler)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.handleSceneShutdown, this)
  }

  private onAcceptButtonPressed(): void {
    this.applyAcceptance(this.worldState.activeOrder.orderId)
    this.gameHUD.update(buildHUDData(this.worldState, this.companyState))
  }

  /**
   * Apply the Available → Accepted transition through the canonical domain path.
   * Safe to call from both the HUD button and the package-tap compatibility path.
   */
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
      expectedPickupLocation: 'PickupZone',
      pickupRadius: this.worldState.pickupRadius,
    })

    this.worldState.activeOrder = pickupAttempt.order
    this.worldState.player = pickupAttempt.player
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
      }
    }
  }

  /**
   * Check whether the order status has changed since the notification controller
   * last observed it. If a canonical notification message exists for the
   * transition, display it once. Safe to call after any state update — idempotent
   * when the status has not changed.
   */
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
    this.createMenuButton(110, 548, 'Main Menu', () => this.openMainMenu())
    this.createMenuButton(290, 548, 'Company', () => this.openCompanyManagement())
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

  private createMenuButton(x: number, y: number, label: string, onTap: () => void): void {
    const button = this.add
      .rectangle(x, y, 156, 54, 0x1d4ed8, 0.95)
      .setStrokeStyle(2, 0xbfdbfe)
      .setScrollFactor(0)
      .setDepth(20)
      .setInteractive({ useHandCursor: true })

    this.add
      .text(x, y, label, {
        fontFamily: 'Arial',
        fontSize: '22px',
        color: '#eff6ff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(21)

    // Single input owner: the label is intentionally non-interactive.
    button.on('pointerdown', onTap)
    this.menuButtons.push(button)
    this.menuButtonBounds.push({
      left: x - 78,
      top: y - 27,
      width: 156,
      height: 54,
    })
  }

  private handleSceneShutdown(): void {
    if (this.pointerDownHandler) {
      this.input.off('pointerdown', this.pointerDownHandler)
      this.pointerDownHandler = null
    }
    this.notificationDisplay.destroy()
    this.menuButtons.length = 0
    this.menuButtonBounds.length = 0
  }
}
