import Phaser from 'phaser'
import { getBrowserSaveStorage } from '../persistence/browserSaveStorage'
import { autosaveIfApproved } from '../persistence/saveSystem'
import { getOrCreateGameSession, replaceGameSession } from '../state/gameSession'
import {
  getAvailableUpgrades,
  purchaseUpgrade,
  type UpgradeDefinition,
} from '../systems/upgradeSystem'
import type { CompanyState, WorldState } from '../types/game'

const BUTTON_WIDTH = 330
const BUTTON_HEIGHT = 58

export class CompanyManagementScene extends Phaser.Scene {
  private worldState!: WorldState
  private companyState!: CompanyState
  private selectedUpgrade!: UpgradeDefinition

  private companyInfoText!: Phaser.GameObjects.Text
  private upgradeStatusText!: Phaser.GameObjects.Text
  private feedbackText!: Phaser.GameObjects.Text
  private purchaseButton!: Phaser.GameObjects.Rectangle
  private purchaseLabel!: Phaser.GameObjects.Text

  constructor() {
    super('CompanyManagement')
  }

  create(): void {
    const { width, height } = this.scale
    const session = getOrCreateGameSession()
    this.worldState = session.world
    this.companyState = session.company

    const availableUpgrades = getAvailableUpgrades()
    const selectedUpgrade = availableUpgrades[0]
    if (!selectedUpgrade) {
      throw new Error('RBATCH-012 requires at least one available prototype upgrade')
    }
    this.selectedUpgrade = selectedUpgrade

    this.cameras.main.setBackgroundColor('#162032')

    this.add
      .text(width / 2, 48, 'Company Management', {
        fontFamily: 'Arial',
        fontSize: '42px',
        color: '#f8fafc',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)

    this.companyInfoText = this.add
      .text(width / 2, 112, '', {
        fontFamily: 'Arial',
        fontSize: '22px',
        color: '#dbeafe',
        align: 'center',
      })
      .setOrigin(0.5)

    this.add
      .rectangle(width / 2, 270, Math.min(width - 56, 650), 220, 0x0f172a, 0.96)
      .setStrokeStyle(3, 0x38bdf8, 0.7)

    this.add
      .text(width / 2, 198, this.selectedUpgrade.name, {
        fontFamily: 'Arial',
        fontSize: '32px',
        color: '#f8fafc',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)

    this.add
      .text(width / 2, 238, this.selectedUpgrade.description, {
        fontFamily: 'Arial',
        fontSize: '18px',
        color: '#cbd5e1',
        align: 'center',
        wordWrap: { width: Math.min(width - 100, 570) },
      })
      .setOrigin(0.5)

    this.upgradeStatusText = this.add
      .text(width / 2, 292, '', {
        fontFamily: 'Arial',
        fontSize: '21px',
        color: '#e2e8f0',
        align: 'center',
      })
      .setOrigin(0.5)

    this.purchaseButton = this.add
      .rectangle(width / 2, 350, BUTTON_WIDTH, BUTTON_HEIGHT, 0x2563eb, 1)
      .setStrokeStyle(2, 0x93c5fd)
      .setInteractive({ useHandCursor: true })
      .on(
        'pointerdown',
        (
          _pointer: Phaser.Input.Pointer,
          _localX: number,
          _localY: number,
          event: Phaser.Types.Input.EventData,
        ) => {
          event.stopPropagation()
          this.purchaseSelectedUpgrade()
        },
      )

    this.purchaseLabel = this.add
      .text(width / 2, 350, 'Purchase', {
        fontFamily: 'Arial',
        fontSize: '24px',
        color: '#eff6ff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)

    this.feedbackText = this.add
      .text(width / 2, 402, '', {
        fontFamily: 'Arial',
        fontSize: '19px',
        color: '#fef3c7',
        align: 'center',
        wordWrap: { width: Math.min(width - 70, 650) },
      })
      .setOrigin(0.5)

    this.createButton(width / 2, height - 116, 'Return to Game World', () => this.returnToGameWorld())
    this.createButton(width / 2, height - 48, 'Main Menu', () => this.returnToMainMenu())

    this.refreshView()
  }

  private purchaseSelectedUpgrade(): void {
    const result = purchaseUpgrade(this.companyState, this.selectedUpgrade.id)
    this.feedbackText.setText(result.message)

    if (result.purchased) {
      this.companyState = result.company
      const session = replaceGameSession(this.worldState, this.companyState)
      const storage = getBrowserSaveStorage()
      if (storage) {
        const autosave = autosaveIfApproved(storage, session, 'upgrade-purchased')
        if (!autosave.saved && autosave.reason === 'write-failed') {
          this.feedbackText.setText(`${result.message}\nLocal autosave failed: ${autosave.message ?? 'unknown error'}`)
        }
      }
    }

    this.refreshView()
  }

  private refreshView(): void {
    this.companyInfoText.setText([
      this.companyState.companyName,
      `Money: ${this.companyState.money}   Level: ${this.companyState.level}   Reputation: ${this.companyState.reputation}`,
    ])

    const currentLevel = this.companyState.purchasedUpgradeLevels[this.selectedUpgrade.id]
    const owned = currentLevel >= this.selectedUpgrade.maxLevel
    this.upgradeStatusText.setText(
      owned
        ? `Owned — Level ${currentLevel}/${this.selectedUpgrade.maxLevel}`
        : `Cost: ${this.selectedUpgrade.cost}   Level: ${currentLevel}/${this.selectedUpgrade.maxLevel}`,
    )

    this.purchaseLabel.setText(owned ? 'Owned' : 'Purchase')
    if (owned) {
      this.purchaseButton.disableInteractive().setAlpha(0.55)
    } else {
      this.purchaseButton.setInteractive({ useHandCursor: true }).setAlpha(1)
    }
  }

  private returnToGameWorld(): void {
    replaceGameSession(this.worldState, this.companyState)
    this.scene.start('GameWorld')
  }

  private returnToMainMenu(): void {
    replaceGameSession(this.worldState, this.companyState)
    this.scene.start('MainMenu')
  }

  private createButton(x: number, y: number, label: string, onTap: () => void): void {
    const button = this.add
      .rectangle(x, y, BUTTON_WIDTH, BUTTON_HEIGHT, 0x0f766e, 1)
      .setStrokeStyle(2, 0x99f6e4)
      .setInteractive({ useHandCursor: true })

    this.add
      .text(x, y, label, {
        fontFamily: 'Arial',
        fontSize: '23px',
        color: '#ecfeff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)

    // Single input owner: only the rectangle is interactive.
    button.on('pointerdown', onTap)
  }
}
