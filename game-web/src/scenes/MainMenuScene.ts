import Phaser from 'phaser'
import { appConfig } from '../config/env'
import {
  closeMainMenuPanel,
  createMainMenuState,
  INFORMATION_PANEL_LINES,
  openMainMenuPanel,
  SETTINGS_PANEL_LINES,
  type MainMenuPanel,
  type MainMenuState,
} from '../ui/MainMenuViewModel'

const BUTTON_WIDTH = 360
const BUTTON_HEIGHT = 76
const MODAL_DEPTH = 90

export class MainMenuScene extends Phaser.Scene {
  private menuState: MainMenuState = createMainMenuState()

  private modalOverlay!: Phaser.GameObjects.Rectangle
  private modalPanel!: Phaser.GameObjects.Rectangle
  private modalText!: Phaser.GameObjects.Text
  private modalCloseButton!: Phaser.GameObjects.Rectangle
  private modalCloseLabel!: Phaser.GameObjects.Text

  constructor() {
    super('MainMenu')
  }

  create(): void {
    const { width, height } = this.scale
    this.menuState = createMainMenuState()

    this.cameras.main.setBackgroundColor('#10151d')

    this.add
      .text(width / 2, 92, appConfig.appName, {
        fontFamily: 'Arial',
        fontSize: '54px',
        color: '#f8fafc',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)

    this.add
      .text(width / 2, 155, `Web Runtime Candidate v${appConfig.appVersion}`, {
        fontFamily: 'Arial',
        fontSize: '24px',
        color: '#cbd5e1',
      })
      .setOrigin(0.5)

    this.add
      .text(
        width / 2,
        225,
        'Start small. Deliver locally. Grow your company.',
        {
          fontFamily: 'Arial',
          fontSize: '23px',
          color: '#e2e8f0',
          align: 'center',
        },
      )
      .setOrigin(0.5)

    this.createButton(width / 2, 330, 'Start Game', () => this.scene.start('GameWorld'))
    this.createButton(width / 2, 420, 'Settings', () => this.showPanel('settings'))
    this.createButton(width / 2, 510, 'Information', () => this.showPanel('information'))

    this.createModal()
  }

  private createButton(x: number, y: number, label: string, onTap: () => void): void {
    const button = this.add
      .rectangle(x, y, BUTTON_WIDTH, BUTTON_HEIGHT, 0x2563eb, 1)
      .setStrokeStyle(3, 0x93c5fd)
      .setInteractive({ useHandCursor: true })

    this.add
      .text(x, y, label, {
        fontFamily: 'Arial',
        fontSize: '30px',
        color: '#eff6ff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)

    // Only the rectangle owns input. The label is intentionally non-interactive,
    // preventing one physical tap from triggering the same action twice.
    button.on('pointerdown', onTap)
  }

  private createModal(): void {
    const { width, height } = this.scale
    const panelWidth = Math.min(width - 48, 640)
    const panelHeight = Math.min(height - 80, 360)
    const centerX = width / 2
    const centerY = height / 2

    this.modalOverlay = this.add
      .rectangle(centerX, centerY, width, height, 0x020617, 0.72)
      .setDepth(MODAL_DEPTH)
      .setInteractive()
      .setVisible(false)
      .on('pointerdown', () => this.hidePanel())

    this.modalPanel = this.add
      .rectangle(centerX, centerY, panelWidth, panelHeight, 0x0f172a, 0.98)
      .setStrokeStyle(3, 0x38bdf8, 0.8)
      .setDepth(MODAL_DEPTH + 1)
      .setVisible(false)

    this.modalText = this.add
      .text(centerX, centerY - 38, '', {
        fontFamily: 'Arial',
        fontSize: '22px',
        color: '#f8fafc',
        align: 'center',
        lineSpacing: 5,
        wordWrap: { width: panelWidth - 48 },
      })
      .setOrigin(0.5)
      .setDepth(MODAL_DEPTH + 2)
      .setVisible(false)

    const closeY = centerY + panelHeight / 2 - 45
    this.modalCloseButton = this.add
      .rectangle(centerX, closeY, 180, 56, 0x2563eb, 1)
      .setStrokeStyle(2, 0x93c5fd)
      .setDepth(MODAL_DEPTH + 3)
      .setInteractive({ useHandCursor: true })
      .setVisible(false)
      .on('pointerdown', (_pointer, _localX, _localY, event: Phaser.Types.Input.EventData) => {
        event.stopPropagation()
        this.hidePanel()
      })

    this.modalCloseLabel = this.add
      .text(centerX, closeY, 'Close', {
        fontFamily: 'Arial',
        fontSize: '24px',
        color: '#eff6ff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setDepth(MODAL_DEPTH + 4)
      .setVisible(false)
  }

  private showPanel(panel: Exclude<MainMenuPanel, 'none'>): void {
    this.menuState = openMainMenuPanel(this.menuState, panel)
    const lines = panel === 'settings' ? SETTINGS_PANEL_LINES : INFORMATION_PANEL_LINES
    this.modalText.setText(lines)
    this.setModalVisible(true)
  }

  private hidePanel(): void {
    this.menuState = closeMainMenuPanel(this.menuState)
    this.setModalVisible(false)
  }

  private setModalVisible(visible: boolean): void {
    this.modalOverlay.setVisible(visible)
    this.modalPanel.setVisible(visible)
    this.modalText.setVisible(visible)
    this.modalCloseButton.setVisible(visible)
    this.modalCloseLabel.setVisible(visible)
  }
}
