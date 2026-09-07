import { MainMenuScene } from './MainMenuScene'

export const APPROVED_ORDERS_ICON_KEY = 'dropi-approved-orders-icon-v1'
export const APPROVED_ORDERS_ICON_URL = '/assets/production/icon-orders.webp'

/**
 * First governed runtime adoption of an owner-approved generated asset.
 *
 * This scene deliberately extends the proven MainMenu implementation instead of
 * changing menu/save/navigation behavior. The approved orders icon is a small
 * visual delivery emblem only; if its texture cannot load, the canonical menu
 * remains fully functional without it.
 */
export class ApprovedAssetMainMenuScene extends MainMenuScene {
  preload(): void {
    super.preload()
    this.load.image(APPROVED_ORDERS_ICON_KEY, APPROVED_ORDERS_ICON_URL)
  }

  create(): void {
    super.create()
    if (!this.textures.exists(APPROVED_ORDERS_ICON_KEY)) return

    const { width, height } = this.scale
    const iconSize = Math.min(52, Math.max(40, Math.round(Math.min(width, height) * 0.12)))

    this.add
      .image(width - iconSize / 2 - 10, iconSize / 2 + 10, APPROVED_ORDERS_ICON_KEY)
      .setDisplaySize(iconSize, iconSize)
      .setAlpha(0.96)
      .setDepth(4)
      .setName('approved-orders-delivery-emblem')
  }
}
