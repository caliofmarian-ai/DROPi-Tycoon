import Phaser from 'phaser'

/** Duration in milliseconds before a notification auto-dismisses. */
export const NOTIFICATION_DURATION_MS = 3000

/**
 * Camera-fixed notification display for player feedback.
 *
 * Shows a single message at a time.  New messages replace the current one
 * immediately, resetting the auto-dismiss timer.  The display never blocks
 * movement controls or the order HUD panel.
 *
 * Positioned near the top-center of the canvas so it is visible regardless of
 * whether the active-order panel is shown.
 *
 * Timer leak prevention: call `destroy()` when the scene stops/restarts.
 */
export class NotificationDisplay {
  private readonly background: Phaser.GameObjects.Rectangle
  private readonly text: Phaser.GameObjects.Text
  private dismissTimer: Phaser.Time.TimerEvent | null = null
  private readonly scene: Phaser.Scene

  constructor(scene: Phaser.Scene) {
    this.scene = scene

    // Centered near top of canvas, above the HUD elements.
    const cx = scene.scale.width / 2
    const cy = 90

    this.background = scene.add
      .rectangle(cx, cy, 600, 54, 0x1e293b, 0.92)
      .setStrokeStyle(2, 0x38bdf8, 0.8)
      .setScrollFactor(0)
      .setDepth(40)
      .setVisible(false)

    this.text = scene.add
      .text(cx, cy, '', {
        fontFamily: 'Arial',
        fontSize: '22px',
        color: '#f8fafc',
        fontStyle: 'bold',
        align: 'center',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(41)
      .setVisible(false)
  }

  /**
   * Show a notification message.  Replaces any currently displayed message and
   * resets the auto-dismiss countdown.
   */
  show(message: string): void {
    if (this.dismissTimer) {
      this.dismissTimer.remove(false)
      this.dismissTimer = null
    }
    this.text.setText(message)
    this.background.setVisible(true)
    this.text.setVisible(true)

    this.dismissTimer = this.scene.time.delayedCall(NOTIFICATION_DURATION_MS, () => {
      this.hide()
    })
  }

  /** Immediately hide the notification without waiting for the timer. */
  hide(): void {
    this.background.setVisible(false)
    this.text.setVisible(false)
    if (this.dismissTimer) {
      this.dismissTimer.remove(false)
      this.dismissTimer = null
    }
  }

  /**
   * Cancel pending timer and remove game objects.  Must be called when the scene
   * shuts down or restarts to prevent timer leaks.
   */
  destroy(): void {
    this.hide()
  }
}
