import Phaser from 'phaser'
import { appConfig } from '../config/env'
import type { WorldState } from '../types/game'

export class DebugPanel {
  private readonly container: Phaser.GameObjects.Container

  private readonly text: Phaser.GameObjects.Text

  constructor(scene: Phaser.Scene) {
    const background = scene.add
      .rectangle(20, 20, 360, 112, 0x0f172a, 0.88)
      .setOrigin(0)
      .setScrollFactor(0)
      .setStrokeStyle(2, 0x38bdf8, 0.7)

    this.text = scene.add
      .text(32, 30, '', {
        fontFamily: 'Arial',
        fontSize: '22px',
        color: '#f8fafc',
        wordWrap: { width: 336 },
      })
      .setScrollFactor(0)

    this.container = scene.add.container(0, 0, [background, this.text]).setDepth(20)
    this.container.setVisible(appConfig.enableDebugPanel)
  }

  update(state: WorldState): void {
    this.text.setText([
      'TEMP DEBUG PANEL',
      `Order: ${state.activeOrder.status}`,
      `CarryingPackage: ${state.player.carryingPackage ? 'true' : 'false'}`,
      'Touch ground to move. Tap package to accept order.',
    ])
  }
}
