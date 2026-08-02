import Phaser from 'phaser'
import type { HUDData } from './HUDViewModel'
import { boundsContainPoint, buildHUDLayout, type RectBounds } from './hudLayout'

/**
/** z-depth for all HUD elements — sits above game world and navigation buttons. */
const HUD_DEPTH = 30

/**
 * Player-facing GameWorld HUD.
 *
 * Layout is derived from the active Phaser scale size (scene.scale.width/height),
 * with all elements fixed to camera (scrollFactor = 0).
 *
 * Pointer exclusion: call `containsPoint(pointer.x, pointer.y)` from the scene's
 * pointerdown handler.  Returns true when the pointer is over any interactive HUD
 * element, preventing world movement or delivery intent registration.
 */
export class GameHUD {
  private readonly companyText: Phaser.GameObjects.Text

  private readonly orderBg: Phaser.GameObjects.Rectangle
  private readonly orderText: Phaser.GameObjects.Text

  private readonly acceptButton: Phaser.GameObjects.Rectangle
  private readonly acceptLabel: Phaser.GameObjects.Text

  /**
   * @param scene   The Phaser scene that owns these game objects.
   * @param onAccept  Callback invoked when the Accept Order button is pressed.
   *                  The callback must check order state for idempotency.
   */
  constructor(scene: Phaser.Scene, onAccept: () => void) {
    const layout = buildHUDLayout(scene.scale.width, scene.scale.height)

    // ── Company status panel ─────────────────────────────────────────────────
    const companyPanelCX = layout.companyPanel.left + layout.companyPanel.width / 2
    const companyPanelCY = layout.companyPanel.top + layout.companyPanel.height / 2
    scene.add
      .rectangle(
        companyPanelCX,
        companyPanelCY,
        layout.companyPanel.width,
        layout.companyPanel.height,
        0x0f172a,
        0.9,
      )
      .setStrokeStyle(2, 0x38bdf8, 0.6)
      .setScrollFactor(0)
      .setDepth(HUD_DEPTH)

    this.companyText = scene.add
      .text(layout.companyPanel.left + 10, layout.companyPanel.top + 8, '', {
        fontFamily: 'Arial',
        fontSize: '18px',
        color: '#f8fafc',
        lineSpacing: 2,
      })
      .setScrollFactor(0)
      .setDepth(HUD_DEPTH + 1)

    // ── Active-order panel ───────────────────────────────────────────────────
    const orderPanelCX = layout.orderPanel.left + layout.orderPanel.width / 2
    const orderPanelCY = layout.orderPanel.top + layout.orderPanel.height / 2

    this.orderBg = scene.add
      .rectangle(
        orderPanelCX,
        orderPanelCY,
        layout.orderPanel.width,
        layout.orderPanel.height,
        0x0f172a,
        0.9,
      )
      .setStrokeStyle(2, 0x38bdf8, 0.6)
      .setScrollFactor(0)
      .setDepth(HUD_DEPTH)

    this.orderText = scene.add
      .text(layout.orderPanel.left + 10, layout.orderPanel.top + 10, '', {
        fontFamily: 'Arial',
        fontSize: '17px',
        color: '#f8fafc',
        wordWrap: { width: layout.orderTextWidth },
        lineSpacing: 3,
      })
      .setScrollFactor(0)
      .setDepth(HUD_DEPTH + 1)

    // ── Accept Order button ──────────────────────────────────────────────────
    // Minimum touch target 44×44 px (canonical mobile requirement).
    // Positioned at right side of the active-order panel.
    const acceptCX = layout.acceptButton.left + layout.acceptButton.width / 2
    const acceptCY = layout.acceptButton.top + layout.acceptButton.height / 2

    this.acceptButton = scene.add
      .rectangle(acceptCX, acceptCY, layout.acceptButton.width, layout.acceptButton.height, 0x16a34a, 1)
      .setStrokeStyle(2, 0x86efac)
      .setScrollFactor(0)
      .setDepth(HUD_DEPTH + 1)
      .setInteractive({ useHandCursor: true })

    this.acceptLabel = scene.add
      .text(acceptCX, acceptCY, 'Accept', {
        fontFamily: 'Arial',
        fontSize: '18px',
        color: '#f0fdf4',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(HUD_DEPTH + 2)

    const handleAccept = () => {
      onAccept()
    }
    this.acceptButton.on('pointerdown', handleAccept)
  }

  /**
   * Update all visible HUD elements to reflect current game state.
   * Safe to call every frame — only redraws text when needed by Phaser internally.
   */
  update(data: HUDData): void {
    // Company status — always visible
    this.companyText.setText([`Money: ${data.money}`, `Rep:   ${data.reputation}`])

    // Active-order panel — visible only while order is active
    const showOrder = data.showActiveOrder
    this.orderBg.setVisible(showOrder)
    this.orderText.setVisible(showOrder)

    if (showOrder) {
      this.orderText.setText([
        `Order: ${data.orderId}`,
        `Status: ${data.orderStatus}`,
        `Pickup: ${data.pickupLocation}`,
        `Destination: ${data.destination}`,
        `Reward: ${data.reward}`,
        `Package: ${data.carryingPackage ? 'Carrying' : 'Not carrying'}`,
      ])
    }

    // Accept button — visible only when order is Available
    this.acceptButton.setVisible(data.showAcceptButton)
    this.acceptLabel.setVisible(data.showAcceptButton)
  }

  /**
   * Returns true if the canvas-space point (pointer.x, pointer.y) falls within
   * any interactive HUD element.  Use this to exclude HUD presses from world
   * pointer handling (movement, delivery intent, etc.).
   */
  containsPoint(x: number, y: number): boolean {
    if (!this.acceptButton.visible) return false
    const bounds = this.getAcceptButtonBounds()
    return boundsContainPoint(bounds, x, y)
  }

  /**
   * The canvas-space bounding box of the Accept button — exposed for tests.
   */
  getAcceptButtonBounds(): RectBounds {
    const bounds = this.acceptButton.getBounds()
    return {
      left: bounds.x,
      top: bounds.y,
      width: bounds.width,
      height: bounds.height,
    }
  }

  /**
   * Returns all active interactive UI bounds.
   */
  getInteractiveBounds(): RectBounds[] {
    return this.acceptButton.visible ? [this.getAcceptButtonBounds()] : []
  }
}
