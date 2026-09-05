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
  getOrCreateGameSession,
  peekGameSession,
  replaceEntireGameSession,
  startNewGameSession,
} from '../state/gameSession'
import { getAudioController } from '../systems/audioSystem'
import {
  closeMainMenuPanel,
  createMainMenuState,
  INFORMATION_PANEL_LINES,
  openMainMenuPanel,
  SETTINGS_PANEL_LINES,
  type MainMenuPanel,
  type MainMenuState,
} from '../ui/MainMenuViewModel'
import {
  buildMainMenuLayout,
  type MainMenuLayout,
} from '../ui/mobileViewport'

const MODAL_DEPTH = 90
const BRAND_LOGO_KEY = 'dropi-tycoon-logo'
const BRAND_LOGO_URL = '/assets/branding/dropi-tycoon-logo.png'
const EXIT_GAME_MESSAGE = 'dropi:exit-game'

type NativeBridgeWindow = Window & {
  ReactNativeWebView?: {
    postMessage: (message: string) => void
  }
}

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
  private soundToggleButton!: Phaser.GameObjects.Rectangle
  private soundToggleLabel!: Phaser.GameObjects.Text

  private readonly handleResize = (): void => {
    this.scene.restart()
  }

  constructor() {
    super('MainMenu')
  }

  preload(): void {
    this.load.image(BRAND_LOGO_KEY, BRAND_LOGO_URL)
  }

  create(): void {
    const { width, height } = this.scale
    this.menuState = createMainMenuState()
    this.saveStorage = getBrowserSaveStorage()
    this.saveSlot = this.saveStorage
      ? inspectSaveSlot(this.saveStorage)
      : { kind: 'unavailable', reason: 'Local storage is unavailable.' }

    const session = peekGameSession()
    getAudioController().setEnabled(session ? session.settings.soundEnabled : true)

    const actionCount = this.saveSlot.kind === 'valid' ? 5 : 4
    const hasNotice =
      this.saveSlot.kind === 'corrupted' ||
      this.saveSlot.kind === 'incompatible' ||
      this.saveSlot.kind === 'unavailable'
    const layout = buildMainMenuLayout(width, height, actionCount, hasNotice)
    const compactLandscape = width > height && height <= 440
    const logoSize = compactLandscape
      ? actionCount >= 5
        ? 48
        : 60
      : Math.min(140, Math.max(104, Math.round(Math.min(width, height) * 0.22)))
    const logoCenterY = compactLandscape
      ? layout.title.y + 6
      : logoSize / 2 + Math.max(8, Math.round(height * 0.015))
    const versionY = logoCenterY + logoSize / 2 + (compactLandscape ? 2 : 6)
    const taglineY = versionY + (compactLandscape ? 15 : 24)

    this.cameras.main.setBackgroundColor('#06162d')

    const glowRadius = Math.max(80, Math.round(Math.min(width, height) * 0.34))
    this.add.circle(width * 0.18, height * 0.18, glowRadius, 0x0b6cff, 0.08)
    this.add.circle(width * 0.86, height * 0.8, glowRadius * 0.8, 0x22c55e, 0.045)

    this.add
      .image(layout.title.x, logoCenterY, BRAND_LOGO_KEY)
      .setDisplaySize(logoSize, logoSize)

    this.add
      .text(layout.subtitle.x, versionY, `v${appConfig.appVersion}`, {
        fontFamily: 'Arial',
        fontSize: `${compactLandscape ? 12 : 14}px`,
        color: '#8bdcff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)

    this.add
      .text(layout.tagline.x, taglineY, 'Play. Deliver. Trade. Grow.', {
        fontFamily: 'Arial',
        fontSize: `${layout.tagline.fontSize}px`,
        color: '#f6c445',
        fontStyle: 'bold',
        align: 'center',
        wordWrap: { width: Math.max(180, width - 28) },
      })
      .setOrigin(0.5)

    this.createModal(layout)
    this.createSaveAwareActions(layout)

    this.scale.on(Phaser.Scale.Events.RESIZE, this.handleResize)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off(Phaser.Scale.Events.RESIZE, this.handleResize)
    })
  }

  private createSaveAwareActions(layout: MainMenuLayout): void {
    if (this.saveSlot.kind === 'valid') {
      const labels = ['Continue Game', 'Start New Game', 'Settings', 'Information', 'Exit Game']
      const actions = [
        () => this.continueGame(),
        () => this.requestStartNewGame(),
        () => this.showPanel('settings'),
        () => this.showPanel('information'),
        () => this.exitGame(),
      ]
      layout.actionCenters.forEach((center, index) => {
        this.createButton(center.x, center.y, labels[index], actions[index], layout)
      })
      return
    }

    if (this.saveSlot.kind === 'corrupted' || this.saveSlot.kind === 'incompatible') {
      this.add
        .text(
          layout.notice.x,
          layout.notice.y,
          'Local progress cannot be restored. Your existing save will be preserved until you confirm replacement.',
          {
            fontFamily: 'Arial',
            fontSize: `${layout.notice.fontSize}px`,
            color: '#fecaca',
            align: 'center',
            wordWrap: { width: layout.notice.wrapWidth },
          },
        )
        .setOrigin(0.5)

      const labels = ['Start New Game', 'Settings', 'Information', 'Exit Game']
      const actions = [
        () => this.requestStartNewGame(),
        () => this.showPanel('settings'),
        () => this.showPanel('information'),
        () => this.exitGame(),
      ]
      layout.actionCenters.forEach((center, index) => {
        this.createButton(center.x, center.y, labels[index], actions[index], layout)
      })
      return
    }

    if (this.saveSlot.kind === 'unavailable') {
      this.add
        .text(layout.notice.x, layout.notice.y, 'Local save storage is unavailable in this environment.', {
          fontFamily: 'Arial',
          fontSize: `${layout.notice.fontSize}px`,
          color: '#fde68a',
          align: 'center',
          wordWrap: { width: layout.notice.wrapWidth },
        })
        .setOrigin(0.5)
    }

    const labels = ['Start Game', 'Settings', 'Information', 'Exit Game']
    const actions = [
      () => this.startGame(),
      () => this.showPanel('settings'),
      () => this.showPanel('information'),
      () => this.exitGame(),
    ]
    layout.actionCenters.forEach((center, index) => {
      this.createButton(center.x, center.y, labels[index], actions[index], layout)
    })
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

  private exitGame(): void {
    const activeSession = peekGameSession()

    if (activeSession) {
      if (!this.saveStorage) {
        this.showMessage('The game cannot exit safely because local save storage is unavailable.')
        return
      }

      const write = writeSaveSlot(this.saveStorage, activeSession)
      if (!write.ok) {
        this.showMessage(`The game was not closed because progress could not be saved: ${write.reason}`)
        return
      }
    }

    const nativeBridge = (window as NativeBridgeWindow).ReactNativeWebView
    if (nativeBridge) {
      nativeBridge.postMessage(EXIT_GAME_MESSAGE)
      return
    }

    this.showMessage(
      activeSession
        ? 'Game saved. You can close this page safely.'
        : 'You can close this page safely.',
    )
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

  private createButton(
    x: number,
    y: number,
    label: string,
    onTap: () => void,
    layout: MainMenuLayout,
  ): void {
    const button = this.add
      .rectangle(x, y, layout.buttonWidth, layout.buttonHeight, 0x0b6cff, 1)
      .setStrokeStyle(3, 0x67e8f9)
      .setInteractive({ useHandCursor: true })

    this.add
      .text(x, y, label, {
        fontFamily: 'Arial',
        fontSize: `${layout.buttonFontSize}px`,
        color: '#f8fbff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)

    button.on('pointerdown', () => {
      getAudioController().unlock()
      getAudioController().play('ui-tap')
      onTap()
    })
  }

  private createModal(layout: MainMenuLayout): void {
    const { width, height } = this.scale
    const centerX = width / 2
    const centerY = height / 2
    const modal = layout.modal

    this.modalOverlay = this.add
      .rectangle(centerX, centerY, width, height, 0x020617, 0.72)
      .setDepth(MODAL_DEPTH)
      .setInteractive()
      .setVisible(false)
      .on('pointerdown', () => this.hidePanel())

    this.modalPanel = this.add
      .rectangle(
        modal.panel.left + modal.panel.width / 2,
        modal.panel.top + modal.panel.height / 2,
        modal.panel.width,
        modal.panel.height,
        0x071a33,
        0.98,
      )
      .setStrokeStyle(3, 0x38bdf8, 0.9)
      .setDepth(MODAL_DEPTH + 1)
      .setVisible(false)

    this.modalText = this.add
      .text(modal.textCenter.x, modal.textCenter.y, '', {
        fontFamily: 'Arial',
        fontSize: `${modal.textFontSize}px`,
        color: '#f8fafc',
        align: 'center',
        lineSpacing: 4,
        wordWrap: { width: modal.textWrapWidth },
      })
      .setOrigin(0.5)
      .setDepth(MODAL_DEPTH + 2)
      .setVisible(false)

    this.modalCloseButton = this.createModalActionButton(
      centerX,
      modal.actionY,
      modal.closeWidth,
      modal.actionHeight,
    ).on('pointerdown', this.stopAnd(() => this.hidePanel()))
    this.modalCloseLabel = this.createModalActionLabel(
      centerX,
      modal.actionY,
      'Close',
      modal.textFontSize,
    )

    this.modalConfirmButton = this.createModalActionButton(
      modal.confirmX,
      modal.actionY,
      modal.dualWidth,
      modal.actionHeight,
    ).on('pointerdown', this.stopAnd(() => this.confirmPendingAction()))
    this.modalConfirmLabel = this.createModalActionLabel(
      modal.confirmX,
      modal.actionY,
      'Confirm',
      modal.textFontSize,
    )

    this.modalCancelButton = this.createModalActionButton(
      modal.cancelX,
      modal.actionY,
      modal.dualWidth,
      modal.actionHeight,
    ).on('pointerdown', this.stopAnd(() => this.hidePanel()))
    this.modalCancelLabel = this.createModalActionLabel(
      modal.cancelX,
      modal.actionY,
      'Cancel',
      modal.textFontSize,
    )

    this.soundToggleButton = this.createModalActionButton(
      modal.confirmX,
      modal.actionY,
      modal.dualWidth,
      modal.actionHeight,
    ).on('pointerdown', this.stopAnd(() => this.toggleSound()))
    this.soundToggleLabel = this.createModalActionLabel(
      modal.confirmX,
      modal.actionY,
      this.soundToggleText(),
      modal.textFontSize,
    )
  }

  private createModalActionButton(
    x: number,
    y: number,
    width: number,
    height: number,
  ): Phaser.GameObjects.Rectangle {
    return this.add
      .rectangle(x, y, width, height, 0x0b6cff, 1)
      .setStrokeStyle(2, 0x67e8f9)
      .setDepth(MODAL_DEPTH + 3)
      .setInteractive({ useHandCursor: true })
      .setVisible(false)
  }

  private createModalActionLabel(
    x: number,
    y: number,
    label: string,
    fontSize: number,
  ): Phaser.GameObjects.Text {
    return this.add
      .text(x, y, label, {
        fontFamily: 'Arial',
        fontSize: `${fontSize}px`,
        color: '#f8fbff',
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
    this.setSoundToggleVisible(panel === 'settings')
  }

  private showMessage(message: string): void {
    this.pendingConfirmation = null
    this.modalText.setText(message)
    this.setModalVisible(true, false)
    this.setSoundToggleVisible(false)
  }

  private showConfirmation(message: string, onConfirm: () => void): void {
    this.pendingConfirmation = onConfirm
    this.modalText.setText(message)
    this.setModalVisible(true, true)
    this.setSoundToggleVisible(false)
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
    this.setSoundToggleVisible(false)
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

  private soundToggleText(): string {
    return getAudioController().isEnabled() ? 'Sound: ON' : 'Sound: OFF'
  }

  private setSoundToggleVisible(visible: boolean): void {
    this.soundToggleLabel.setText(this.soundToggleText())
    this.soundToggleButton.setVisible(visible)
    this.soundToggleLabel.setVisible(visible)
  }

  private toggleSound(): void {
    const session = getOrCreateGameSession()
    const nextEnabled = !session.settings.soundEnabled
    session.settings.soundEnabled = nextEnabled
    getAudioController().setEnabled(nextEnabled)
    getAudioController().unlock()
    if (nextEnabled) {
      getAudioController().play('positive')
    }
    this.soundToggleLabel.setText(this.soundToggleText())
  }
}
