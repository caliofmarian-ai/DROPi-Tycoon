import Phaser from 'phaser'
import type { HUDData } from './HUDViewModel'
import { boundsContainPoint, buildHUDLayout, type RectBounds } from './hudLayout'

/** z-depth for all HUD elements — sits above game world and navigation buttons. */
const HUD_DEPTH = 30

const compactLocationLabel = (value: string): string => {
  const canonicalAliases: Record<string, string> = {
    PickupZone: 'Pickup',
    DeliveryZone: 'Delivery',
    CommercialPickup: 'Commercial',
    ResidentialPickup: 'Residential',
    DeliveryPoint: 'Drop-off',
  }
  const aliased = canonicalAliases[value] ?? value
  return aliased.length > 13 ? `${aliased.slice(0, 12)}…` : aliased
}

const compactOrderId = (value: string): string => value.replace(/^ORDER-/, '#')

/**
 * Player-facing GameWorld HUD.
 *
 * The persistent cluster is intentionally compact and upper-right anchored so
 * the map center remains available for exploration on Android. When a UI layer
 * is supplied, every HUD object is moved into that layer so it can be rendered
 * by a screen-space camera that is independent from world pan/zoom/rotation.
 */
export class GameHUD {
  private readonly companyPanelBounds: RectBounds
  private readonly orderPanelBounds: RectBounds
  private readonly acceptButtonBounds: RectBounds

  private readonly companyText: Phaser.GameObjects.Text

  private readonly orderBg: Phaser.GameObjects.Rectangle
  private readonly orderText: Phaser.GameObjects.Text

  private readonly acceptButton: Phaser.GameObjects.Rectangle
  private readonly acceptLabel: Phaser.GameObjects.Text

  constructor(scene: Phaser.Scene, onAccept: () => void, uiLayer?: Phaser.GameObjects.Layer) {
    const layout = buildHUDLayout(scene.scale.width, scene.scale.height)
    this.companyPanelBounds = { ...layout.companyPanel }
    this.orderPanelBounds = { ...layout.orderPanel }
    this.acceptButtonBounds = { ...layout.acceptButton }

    const companyPanelCX = layout.companyPanel.left + layout.companyPanel.width / 2
    const companyPanelCY = layout.companyPanel.top + layout.companyPanel.height / 2
    const companyBg = scene.add
      .rectangle(
        companyPanelCX,
        companyPanelCY,
        layout.companyPanel.width,
        layout.companyPanel.height,
        0x0f172a,
        0.78,
      )
      .setStrokeStyle(1, 0x38bdf8, 0.5)
      .setScrollFactor(0)
      .setDepth(HUD_DEPTH)

    this.companyText = scene.add
      .text(layout.companyPanel.left + 6, layout.companyPanel.top + 7, '', {
        fontFamily: 'Arial',
        fontSize: `${layout.companyFontSize}px`,
        color: '#f8fafc',
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
        0.74,
      )
      .setStrokeStyle(1, 0x38bdf8, 0.5)
      .setScrollFactor(0)
      .setDepth(HUD_DEPTH)

    this.orderText = scene.add
      .text(layout.orderPanel.left + 7, layout.orderPanel.top + 7, '', {
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
      .rectangle(acceptCX, acceptCY, layout.acceptButton.width, layout.acceptButton.height, 0x16a34a, 0.95)
      .setStrokeStyle(1, 0x86efac)
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

    uiLayer?.add([
      companyBg,
      this.companyText,
      this.orderBg,
      this.orderText,
      this.acceptButton,
      this.acceptLabel,
    ])

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
    this.companyText.setText(`M ${data.money} · R ${data.reputation}`)

    const showOrder = data.showActiveOrder
    this.orderBg.setVisible(showOrder)
    this.orderText.setVisible(showOrder)

    if (showOrder) {
      this.orderText.setText(
        `${compactOrderId(data.orderId)} ${data.orderStatus} +${data.reward} · ${compactLocationLabel(data.pickupLocation)}→${compactLocationLabel(data.destination)} · ${data.carryingPackage ? 'Carry' : 'Empty'}`,
      )
    }

    this.acceptButton.setVisible(data.showAcceptButton)
    this.acceptLabel.setVisible(data.showAcceptButton)
  }

  containsPoint(x: number, y: number): boolean {
    if (!this.acceptButton.visible) return false
    return boundsContainPoint(this.acceptButtonBounds, x, y)
  }

  getAcceptButtonBounds(): RectBounds {
    return { ...this.acceptButtonBounds }
  }

  getInteractiveBounds(): RectBounds[] {
    return this.acceptButton.visible ? [this.getAcceptButtonBounds()] : []
  }

  /**
   * Persistent screen-space region that should never start a map gesture.
   */
  getScreenBlockingBounds(): RectBounds[] {
    const bounds = [{ ...this.companyPanelBounds }]
    if (this.orderBg.visible) {
      bounds.push({ ...this.orderPanelBounds })
    }
    if (this.acceptButton.visible) {
      bounds.push({ ...this.acceptButtonBounds })
    }
    return bounds
  }
}
