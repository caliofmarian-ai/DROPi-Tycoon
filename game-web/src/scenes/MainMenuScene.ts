import Phaser from 'phaser'
import { appConfig } from '../config/env'
import { getBrowserSaveStorage } from '../persistence/browserSaveStorage'
import {
  inspectSaveSlot,
  preserveInvalidSaveBeforeReplacement,
  restoreGameSessionFromSave,
  writeSaveSlot,
  type SaveSlotInspection,
  type SaveStorage,
} from '../persistence/saveSystem'
import {
  replaceEntireGameSession,
  startNewGameSession,
} from '../state/gameSession'
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
const BUTTON_HEIGHT = 64
const MODAL_DEPTH = 90

export class MainMenuScene extends Phaser.Scene {
  private menuState: MainMenuState = createMainMenuState()
  private saveStorage: SaveStorage | null = null
  private saveSlot: SaveSlotInspection = { kind: 'missing' }
  private pendingConfirmation: (() => void) | null = null

  private modalOverlay!: Phaser.GameObjects.Rectangle
  private modalPanel!: Phaser.GameObjects.Rectangle
  private modalText!: Phaser.GameObjects.Text
  private modalCloseButton!: Phaser.GameObjects.Rectangle
  private modalCloseLabel!: Phaser.GameObjects.Text
  private modalConfirmButton!: Phaser.GameObjects.Rectangle
  private modalConfirmLabel!: Phaser.GameObjects.Text
  private modalCancelButton!: Phaser.GameObjects.Rectangle
  private modalCancelLabel!: Phaser.GameObjects.Text

  constructor() {
    super('MainMenu')
  }

  create(): void {
    const { width } = this.scale
    this.menuState = createMainMenuState()
    this.saveStorage = getBrowserSaveStorage()
    this.saveSlot = this.saveStorage
      ? inspectSaveSlot(this.saveStorage)
      : { kind: 'unavailable', reason: 'Local storage is unavailable.' }

    this.cameras.main.setBackgroundColor('#10151d')

    this.add
      .text(width / 2, 78, appConfig.appName, {
        fontFamily: 'Arial',
        fontSize: '52px',
        color: '#f8fafc',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)

    this.add
      .text(width / 2, 136, `Web Runtime Candidate v${appConfig.appVersion}`, {
        fontFamily: 'Arial',
        fontSize: '22px',
        color: '#cbd5e1',
      })
      .setOrigin(0.5)

    this.add
      .text(
        width / 2,
        200,
        'Start small. Deliver locally. Grow your company.',
        {
          fontFamily: 'Arial',
          fontSize: '22px',
          color: '#e2e8f0',
          align: 'center',
        },
      )
      .setOrigin(0.5)

    this.createModal()
    this.createSaveAwareActions(width)
  }

  private createSaveAwareActions(width: number): void {
    if (this.saveSlot.kind === 'valid') {
      this.createButton(width / 2, 292, 'Continue Game', () => this.continueGame())
      this.createButton(width / 2, 368, 'Start New Game', () => this.requestStartNewGame())
      this.createButton(width / 2, 444, 'Settings', () => this.showPanel('settings'))
      this.createButton(width / 2, 520, 'Information', () => this.showPanel('information'))
      return
    }

    if (this.saveSlot.kind === 'corrupted' || this.saveSlot.kind === 'incompatible') {
      this.add
        .text(
          width / 2,
          250,
          'Local progress cannot be restored. Your existing save will be preserved until you confirm replacement.',
          {
            fontFamily: 'Arial',
            fontSize: '17px',
            color: '#fecaca',
            align: 'center',
            wordWrap: { width: Math.min(width - 72, 680) },
          },
        )
        .setOrigin(0.5)

      this.createButton(width / 2, 342, 'Start New Game', () => this.requestStartNewGame())
      this.createButton(width / 2, 430, 'Settings', () => this.showPanel('settings'))
      this.createButton(width / 2, 518, 'Information', () => this.showPanel('information'))
      return
    }

    if (this.saveSlot.kind === 'unavailable') {
      this.add
        .text(width / 2, 252, 'Local save storage is unavailable in this environment.', {
          fontFamily: 'Arial',
          fontSize: '17px',
          color: '#fde68a',
          align: 'center',
        })
        .setOrigin(0.5)
    }

    this.createButton(width / 2, 330, 'Start Game', () => this.startGame())
    this.createButton(width / 2, 420, 'Settings', () => this.showPanel('settings'))
    this.createButton(width / 2, 510, 'Information', () => this.showPanel('information'))
  }

  private startGame(): void {
    startNewGameSession()
    this.scene.start('GameWorld')
  }

  private continueGame(): void {
    if (!this.saveStorage) {
      this.showMessage('Local save storage is unavailable, so the saved game cannot be loaded.')
      return
    }

    const inspection = inspectSaveSlot(this.saveStorage)
    this.saveSlot = inspection
    if (inspection.kind !== 'valid') {
      this.showMessage(this.describeUnreadableSave(inspection))
      return
    }

    const session = restoreGameSessionFromSave(inspection.save)
    replaceEntireGameSession(session)

    // A repaired payload or recovered staging write is normalized immediately.
    if (inspection.repaired || inspection.source === 'staging') {
      writeSaveSlot(this.saveStorage, session)
    }

    this.scene.start('GameWorld')
  }

  private requestStartNewGame(): void {
    if (
      this.saveSlot.kind === 'valid' ||
      this.saveSlot.kind === 'corrupted' ||
      this.saveSlot.kind === 'incompatible'
    ) {
      const message =
        this.saveSlot.kind === 'valid'
          ? 'A saved game already exists. Start a new game and replace that progress?'
          : 'The existing save cannot be restored. Start a new game and replace it? A backup of unreadable data will be preserved when possible.'
      this.showConfirmation(message, () => this.confirmNewGameReplacement())
      return
    }

    this.startGame()
  }

  private confirmNewGameReplacement(): void {
    const session = startNewGameSession()

    if (this.saveStorage) {
      const currentInspection = inspectSaveSlot(this.saveStorage)
      preserveInvalidSaveBeforeReplacement(this.saveStorage, currentInspection)
      const write = writeSaveSlot(this.saveStorage, session)
      if (!write.ok) {
        this.showMessage(`The new game could not replace the local save: ${write.reason}`)
        return
      }
    }

    this.scene.start('GameWorld')
  }

  private describeUnreadableSave(inspection: SaveSlotInspection): string {
    if (inspection.kind === 'corrupted') {
      return `Saved progress is corrupted and cannot be restored. ${inspection.reason}`
    }
    if (inspection.kind === 'incompatible') {
      return `Saved progress uses an incompatible format and cannot be restored. ${inspection.reason}`
    }
    if (inspection.kind === 'unavailable') {
      return `Local save storage is unavailable. ${inspection.reason}`
    }
    if (inspection.kind === 'missing') {
      return 'No saved game exists yet.'
    }
    return 'Saved progress is available.'
  }

  private createButton(x: number, y: number, label: string, onTap: () => void): void {
    const button = this.add
      .rectangle(x, y, BUTTON_WIDTH, BUTTON_HEIGHT, 0x2563eb, 1)
      .setStrokeStyle(3, 0x93c5fd)
      .setInteractive({ useHandCursor: true })

    this.add
      .text(x, y, label, {
        fontFamily: 'Arial',
        fontSize: '27px',
        color: '#eff6ff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)

    // Only the rectangle owns input. The label is intentionally non-interactive.
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
      .text(centerX, centerY - 46, '', {
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

    const actionY = centerY + panelHeight / 2 - 45

    this.modalCloseButton = this.createModalActionButton(centerX, actionY, 180)
      .on('pointerdown', this.stopAnd(() => this.hidePanel()))
    this.modalCloseLabel = this.createModalActionLabel(centerX, actionY, 'Close')

    this.modalConfirmButton = this.createModalActionButton(centerX - 112, actionY, 190)
      .on('pointerdown', this.stopAnd(() => this.confirmPendingAction()))
    this.modalConfirmLabel = this.createModalActionLabel(centerX - 112, actionY, 'Confirm')

    this.modalCancelButton = this.createModalActionButton(centerX + 112, actionY, 190)
      .on('pointerdown', this.stopAnd(() => this.hidePanel()))
    this.modalCancelLabel = this.createModalActionLabel(centerX + 112, actionY, 'Cancel')
  }

  private createModalActionButton(
    x: number,
    y: number,
    width: number,
  ): Phaser.GameObjects.Rectangle {
    return this.add
      .rectangle(x, y, width, 56, 0x2563eb, 1)
      .setStrokeStyle(2, 0x93c5fd)
      .setDepth(MODAL_DEPTH + 3)
      .setInteractive({ useHandCursor: true })
      .setVisible(false)
  }

  private createModalActionLabel(x: number, y: number, label: string): Phaser.GameObjects.Text {
    return this.add
      .text(x, y, label, {
        fontFamily: 'Arial',
        fontSize: '23px',
        color: '#eff6ff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setDepth(MODAL_DEPTH + 4)
      .setVisible(false)
  }

  private stopAnd(action: () => void) {
    return (
      _pointer: Phaser.Input.Pointer,
      _localX: number,
      _localY: number,
      event: Phaser.Types.Input.EventData,
    ): void => {
      event.stopPropagation()
      action()
    }
  }

  private showPanel(panel: Exclude<MainMenuPanel, 'none'>): void {
    this.menuState = openMainMenuPanel(this.menuState, panel)
    this.pendingConfirmation = null
    const lines = panel === 'settings' ? SETTINGS_PANEL_LINES : INFORMATION_PANEL_LINES
    this.modalText.setText([...lines])
    this.setModalVisible(true, false)
  }

  private showMessage(message: string): void {
    this.pendingConfirmation = null
    this.modalText.setText(message)
    this.setModalVisible(true, false)
  }

  private showConfirmation(message: string, onConfirm: () => void): void {
    this.pendingConfirmation = onConfirm
    this.modalText.setText(message)
    this.setModalVisible(true, true)
  }

  private confirmPendingAction(): void {
    const action = this.pendingConfirmation
    this.hidePanel()
    action?.()
  }

  private hidePanel(): void {
    this.menuState = closeMainMenuPanel(this.menuState)
    this.pendingConfirmation = null
    this.setModalVisible(false, false)
  }

  private setModalVisible(visible: boolean, confirmation: boolean): void {
    this.modalOverlay.setVisible(visible)
    this.modalPanel.setVisible(visible)
    this.modalText.setVisible(visible)
    this.modalCloseButton.setVisible(visible && !confirmation)
    this.modalCloseLabel.setVisible(visible && !confirmation)
    this.modalConfirmButton.setVisible(visible && confirmation)
    this.modalConfirmLabel.setVisible(visible && confirmation)
    this.modalCancelButton.setVisible(visible && confirmation)
    this.modalCancelLabel.setVisible(visible && confirmation)
  }
}
