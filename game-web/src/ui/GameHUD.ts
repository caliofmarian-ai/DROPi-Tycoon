import Phaser from 'phaser'
import type { HUDData } from './HUDViewModel'

/**
 * Canvas dimensions assumed by the HUD layout (matches VITE_GAME_WIDTH/HEIGHT defaults).
 * These are Phaser canvas units, not physical pixels.
 */
const CANVAS_WIDTH = 1280
const CANVAS_HEIGHT = 720

/** z-depth for all HUD elements — sits above game world and navigation buttons. */
const HUD_DEPTH = 30

/**
 * Player-facing GameWorld HUD.
 *
 * Layout (1280×720 canvas, scrollFactor=0 throughout):
 *   Top-right  — Company status panel (Money, Reputation) at x=[1050,1272], y=[8,70]
 *   Bottom     — Active-order panel at x=[420,1272], y=[465,571]
 *                Accept Order button within the active-order panel at right
 *
 * Navigation buttons (created by GameWorldScene) occupy x=[32,368], y=[521,575].
 * The active-order panel starts at x=420, so there is no overlap.
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
    // ── Company status panel ─────────────────────────────────────────────────
    const companyPanelCX = CANVAS_WIDTH - 111  // 1169
    const companyPanelCY = 39
    scene.add
      .rectangle(companyPanelCX, companyPanelCY, 222, 62, 0x0f172a, 0.9)
      .setStrokeStyle(2, 0x38bdf8, 0.6)
      .setScrollFactor(0)
      .setDepth(HUD_DEPTH)

    this.companyText = scene.add
      .text(companyPanelCX - 104, 14, '', {
        fontFamily: 'Arial',
        fontSize: '20px',
        color: '#f8fafc',
        lineSpacing: 2,
      })
      .setScrollFactor(0)
      .setDepth(HUD_DEPTH + 1)

    // ── Active-order panel ───────────────────────────────────────────────────
    // Occupies x=[420,1272], y=[465,571].
    // Nav buttons are at x=[32,368], y=[521,575] — no overlap.
    const orderPanelLeft = 420
    const orderPanelTop = 465
    const orderPanelW = CANVAS_WIDTH - orderPanelLeft - 8    // 852
    const orderPanelH = 106
    const orderPanelCX = orderPanelLeft + orderPanelW / 2
    const orderPanelCY = orderPanelTop + orderPanelH / 2

    this.orderBg = scene.add
      .rectangle(orderPanelCX, orderPanelCY, orderPanelW, orderPanelH, 0x0f172a, 0.9)
      .setStrokeStyle(2, 0x38bdf8, 0.6)
      .setScrollFactor(0)
      .setDepth(HUD_DEPTH)

    this.orderText = scene.add
      .text(orderPanelLeft + 10, orderPanelTop + 10, '', {
        fontFamily: 'Arial',
        fontSize: '19px',
        color: '#f8fafc',
        wordWrap: { width: 580 },
        lineSpacing: 4,
      })
      .setScrollFactor(0)
      .setDepth(HUD_DEPTH + 1)

    // ── Accept Order button ──────────────────────────────────────────────────
    // Minimum touch target 44×44 px (canonical mobile requirement).
    // Positioned at right side of the active-order panel.
    const acceptCX = CANVAS_WIDTH - 75  // 1205
    const acceptCY = orderPanelTop + orderPanelH / 2  // 518

    this.acceptButton = scene.add
      .rectangle(acceptCX, acceptCY, 120, 52, 0x16a34a, 1)
      .setStrokeStyle(2, 0x86efac)
      .setScrollFactor(0)
      .setDepth(HUD_DEPTH + 1)
      .setInteractive({ useHandCursor: true })

    this.acceptLabel = scene.add
      .text(acceptCX, acceptCY, 'Accept', {
        fontFamily: 'Arial',
        fontSize: '20px',
        color: '#f0fdf4',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(HUD_DEPTH + 2)
      .setInteractive({ useHandCursor: true })

    const handleAccept = () => {
      onAccept()
    }
    this.acceptButton.on('pointerdown', handleAccept)
    this.acceptLabel.on('pointerdown', handleAccept)
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
      const carrying = data.carryingPackage ? ' [Carrying package]' : ''
      this.orderText.setText([
        `Order: ${data.orderStatus}${carrying}`,
        `Destination: ${data.destination}`,
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
    return this.acceptButton.getBounds().contains(x, y)
  }

  /**
   * The canvas-space bounding box of the Accept button — exposed for tests.
   */
  getAcceptButtonBounds(): Phaser.Geom.Rectangle {
    return this.acceptButton.getBounds()
  }

  /**
   * Canvas height used by this layout — exposed so tests can verify positioning.
   */
  static get CANVAS_HEIGHT(): number {
    return CANVAS_HEIGHT
  }
}
