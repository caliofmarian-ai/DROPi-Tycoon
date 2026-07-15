import Phaser from 'phaser'
import { createInitialWorldState, WORLD_HEIGHT, WORLD_WIDTH } from '../state/gameState'
import { attemptPickup, flagAcceptRequested, requestOrderAcceptance } from '../systems/orderSystem'
import type { WorldState } from '../types/game'
import { DebugPanel } from '../ui/DebugPanel'

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

export class GameWorldScene extends Phaser.Scene {
  private worldState!: WorldState

  private player!: Phaser.GameObjects.Sprite

  private readonly packagePosition = new Phaser.Math.Vector2(120, 440)

  private debugPanel!: DebugPanel

  private readonly menuButtons: Phaser.GameObjects.Rectangle[] = []

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
    this.worldState = createInitialWorldState()

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

    this.debugPanel = new DebugPanel(this)
    this.debugPanel.update(this.worldState)
    this.createNavigationButtons()

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.isPointerOnMenuButton(pointer)) {
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
        this.worldState.activeOrder = flagAcceptRequested(this.worldState.activeOrder)
        const accepted = requestOrderAcceptance(this.worldState.activeOrder, this.worldState.player)
        this.worldState.activeOrder = accepted.order
        this.worldState.player = accepted.player
      }

      this.debugPanel.update(this.worldState)
    })
  }

  update(_: number, delta: number): void {
    this.updateMovement(delta / 1000)
    this.updatePickupState()
    this.debugPanel.update(this.worldState)
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
  }

  private createNavigationButtons(): void {
    this.createMenuButton(110, 548, 'Main Menu', () => this.scene.start('MainMenu'))
    this.createMenuButton(290, 548, 'Company', () => this.scene.start('CompanyManagement'))
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
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', onTap)

    button.on('pointerdown', onTap)
    this.menuButtons.push(button)
  }

  private isPointerOnMenuButton(pointer: Phaser.Input.Pointer): boolean {
    return this.menuButtons.some((button) => button.getBounds().contains(pointer.x, pointer.y))
  }
}
