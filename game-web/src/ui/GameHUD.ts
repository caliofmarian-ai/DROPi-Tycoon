import Phaser from 'phaser'
import type { HUDData } from './HUDViewModel'
import { boundsContainPoint, buildHUDLayout, type RectBounds } from './hudLayout'

/** z-depth for all HUD elements — sits above game world and navigation buttons. */
const HUD_DEPTH = 30

/**
 * Player-facing GameWorld HUD.
 *
 * Layout is derived from the active Phaser scale size (scene.scale.width/height),
 * with all elements fixed to camera (scrollFactor = 0).
 *
 * Pointer exclusion: call `containsPoint(pointer.x, pointer.y)` from the scene's
 * pointerdown handler. Returns true when the pointer is over any interactive HUD
 * element, preventing world movement or delivery intent registration.
 */
export class GameHUD {
  private readonly companyText: Phaser.GameObjects.Text

  private readonly orderBg: Phaser.GameObjects.Rectangle
  private readonly orderText: Phaser.GameObjects.Text

  private readonly acceptButton: Phaser.GameObjects.Rectangle
  private readonly acceptLabel: Phaser.GameObjects.Text

  constructor(scene: Phaser.Scene, onAccept: () => void) {
    const layout = buildHUDLayout(scene.scale.width, scene.scale.height)

    const companyPanelCX = layout.companyPanel.left + layout.companyPanel.width / 2
    const companyPanelCY = layout.companyPanel.top + layout.companyPanel.height / 2
    scene.add
      .rectangle(
        companyPanelCX,
        companyPanelCY,
        layout.companyPanel.width,
        layout.companyPanel.height,
        0x0f172a,
        0.82,
      )
      .setStrokeStyle(2, 0x38bdf8, 0.55)
      .setScrollFactor(0)
      .setDepth(HUD_DEPTH)

    this.companyText = scene.add
      .text(layout.companyPanel.left + 8, layout.companyPanel.top + 6, '', {
        fontFamily: 'Arial',
        fontSize: `${layout.companyFontSize}px`,
        color: '#f8fafc',
        lineSpacing: 1,
      })
      .setScrollFactor(0)
      .setDepth(HUD_DEPTH + 1)

    const orderPanelCX = layout.orderPanel.left + layout.orderPanel.width / 2
    const orderPanelCY = layout.orderPanel.top + layout.orderPanel.height / 2

    this.orderBg = scene.add
      .rectangle(
        orderPanelCX,
        orderPanelCY,
        layout.orderPanel.width,
        layout.orderPanel.height,
        0x0f172a,
        0.78,
      )
      .setStrokeStyle(2, 0x38bdf8, 0.55)
      .setScrollFactor(0)
      .setDepth(HUD_DEPTH)

    this.orderText = scene.add
      .text(layout.orderPanel.left + 9, layout.orderPanel.top + 8, '', {
        fontFamily: 'Arial',
        fontSize: `${layout.orderFontSize}px`,
        color: '#f8fafc',
        wordWrap: { width: layout.orderTextWidth },
        lineSpacing: 2,
      })
      .setScrollFactor(0)
      .setDepth(HUD_DEPTH + 1)

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
        fontSize: `${layout.acceptFontSize}px`,
        color: '#f0fdf4',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(HUD_DEPTH + 2)

    const handleAccept = (
      _pointer: Phaser.Input.Pointer,
      _localX: number,
      _localY: number,
      event: Phaser.Types.Input.EventData,
    ) => {
      event.stopPropagation()
      onAccept()
    }
    this.acceptButton.on('pointerdown', handleAccept)
  }

  update(data: HUDData): void {
    this.companyText.setText([`Money: ${data.money}`, `Rep: ${data.reputation}`])

    const showOrder = data.showActiveOrder
    this.orderBg.setVisible(showOrder)
    this.orderText.setVisible(showOrder)

    if (showOrder) {
      this.orderText.setText([
        `${data.orderId} · ${data.orderStatus}`,
        `${data.pickupLocation} → ${data.destination}`,
        `Reward ${data.reward} · ${data.carryingPackage ? 'Carrying' : 'Not carrying'}`,
      ])
    }

    this.acceptButton.setVisible(data.showAcceptButton)
    this.acceptLabel.setVisible(data.showAcceptButton)
  }

  containsPoint(x: number, y: number): boolean {
    if (!this.acceptButton.visible) return false
    const bounds = this.getAcceptButtonBounds()
    return boundsContainPoint(bounds, x, y)
  }

  getAcceptButtonBounds(): RectBounds {
    const bounds = this.acceptButton.getBounds()
    return {
      left: bounds.x,
      top: bounds.y,
      width: bounds.width,
      height: bounds.height,
    }
  }

  getInteractiveBounds(): RectBounds[] {
    return this.acceptButton.visible ? [this.getAcceptButtonBounds()] : []
  }
}
