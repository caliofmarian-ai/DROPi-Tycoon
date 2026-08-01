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
    const statusLine = `Order: ${state.activeOrder.status}`
    const carryLine = `CarryingPackage: ${state.player.carryingPackage ? 'true' : 'false'}`

    let guidanceLine: string
    if (state.activeOrder.status === 'PickedUp') {
      guidanceLine =
        'Tap DeliveryZone to complete. Tap wrong marker to test failure.'
    } else if (state.activeOrder.status === 'Completed') {
      guidanceLine = 'Delivery completed! Reward handling deferred to BATCH-009.'
    } else if (state.activeOrder.status === 'Failed') {
      guidanceLine = 'Delivery failed at wrong destination.'
    } else {
      guidanceLine = 'Touch ground to move. Tap package to accept order.'
    }

    this.text.setText([
      'TEMP DEBUG PANEL',
      statusLine,
      carryLine,
      guidanceLine,
    ])
  }
}
