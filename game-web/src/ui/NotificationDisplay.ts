import Phaser from 'phaser'
import { buildNotificationLayout, type RectBounds } from './hudLayout'

/** Duration in milliseconds before a notification auto-dismisses. */
export const NOTIFICATION_DURATION_MS = 3000

/**
 * Screen-space notification display for player feedback.
 *
 * Shows a single message at a time. New messages replace the current one
 * immediately, resetting the auto-dismiss timer. When a UI layer is supplied,
 * the notification is rendered by the fixed UI camera and is therefore immune
 * to world-camera pan, zoom and rotation.
 */
export class NotificationDisplay {
  private readonly background: Phaser.GameObjects.Rectangle
  private readonly text: Phaser.GameObjects.Text
  private readonly layout: RectBounds
  private dismissTimer: Phaser.Time.TimerEvent | null = null
  private readonly scene: Phaser.Scene
  private readonly onExpired?: () => void

  constructor(
    scene: Phaser.Scene,
    onExpired?: () => void,
    uiLayer?: Phaser.GameObjects.Layer,
  ) {
    this.scene = scene
    this.onExpired = onExpired

    const notifLayout = buildNotificationLayout(scene.scale.width, scene.scale.height)
    this.layout = { ...notifLayout }
    const cx = notifLayout.left + Math.floor(notifLayout.width / 2)
    const cy = notifLayout.top + Math.floor(notifLayout.height / 2)

    this.background = scene.add
      .rectangle(cx, cy, notifLayout.width, notifLayout.height, 0x1e293b, 0.92)
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

    uiLayer?.add([this.background, this.text])
  }

  /**
   * Show a notification message. Replaces any currently displayed message and
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
      this.onExpired?.()
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

  isVisible(): boolean {
    return this.background.visible
  }

  getScreenBounds(): RectBounds {
    return { ...this.layout }
  }

  /**
   * Cancel pending timer and remove game objects. Must be called when the scene
   * shuts down or restarts to prevent timer leaks.
   */
  destroy(): void {
    this.hide()
  }
}
