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
import {
  buildCompanyManagementLayout,
  type LayoutRect,
} from '../ui/mobileViewport'

const rectCenterX = (rect: LayoutRect): number => rect.left + rect.width / 2
const rectCenterY = (rect: LayoutRect): number => rect.top + rect.height / 2

export class CompanyManagementScene extends Phaser.Scene {
  private worldState!: WorldState
  private companyState!: CompanyState
  private selectedUpgrade!: UpgradeDefinition

  private companyInfoText!: Phaser.GameObjects.Text
  private upgradeStatusText!: Phaser.GameObjects.Text
  private feedbackText!: Phaser.GameObjects.Text
  private purchaseButton!: Phaser.GameObjects.Rectangle
  private purchaseLabel!: Phaser.GameObjects.Text

  private readonly handleResize = (): void => {
    if (this.worldState && this.companyState) {
      replaceGameSession(this.worldState, this.companyState)
    }
    this.scene.restart()
  }

  constructor() {
    super('CompanyManagement')
  }

  create(): void {
    const { width, height } = this.scale
    const layout = buildCompanyManagementLayout(width, height)
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
      .text(layout.title.x, layout.title.y, 'Company Management', {
        fontFamily: 'Arial',
        fontSize: `${layout.title.fontSize}px`,
        color: '#f8fafc',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)

    this.companyInfoText = this.add
      .text(layout.companyInfo.x, layout.companyInfo.y, '', {
        fontFamily: 'Arial',
        fontSize: `${layout.companyInfo.fontSize}px`,
        color: '#dbeafe',
        align: 'center',
      })
      .setOrigin(0.5)

    this.add
      .rectangle(
        rectCenterX(layout.card),
        rectCenterY(layout.card),
        layout.card.width,
        layout.card.height,
        0x0f172a,
        0.96,
      )
      .setStrokeStyle(3, 0x38bdf8, 0.7)

    this.add
      .text(layout.upgradeName.x, layout.upgradeName.y, this.selectedUpgrade.name, {
        fontFamily: 'Arial',
        fontSize: `${layout.upgradeName.fontSize}px`,
        color: '#f8fafc',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)

    this.add
      .text(layout.description.x, layout.description.y, this.selectedUpgrade.description, {
        fontFamily: 'Arial',
        fontSize: `${layout.description.fontSize}px`,
        color: '#cbd5e1',
        align: 'center',
        wordWrap: { width: layout.description.wrapWidth },
      })
      .setOrigin(0.5)

    this.upgradeStatusText = this.add
      .text(layout.status.x, layout.status.y, '', {
        fontFamily: 'Arial',
        fontSize: `${layout.status.fontSize}px`,
        color: '#e2e8f0',
        align: 'center',
      })
      .setOrigin(0.5)

    this.purchaseButton = this.add
      .rectangle(
        rectCenterX(layout.purchase),
        rectCenterY(layout.purchase),
        layout.purchase.width,
        layout.purchase.height,
        0x2563eb,
        1,
      )
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
      .text(rectCenterX(layout.purchase), rectCenterY(layout.purchase), 'Purchase', {
        fontFamily: 'Arial',
        fontSize: `${layout.purchase.fontSize}px`,
        color: '#eff6ff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)

    this.feedbackText = this.add
      .text(layout.feedback.x, layout.feedback.y, '', {
        fontFamily: 'Arial',
        fontSize: `${layout.feedback.fontSize}px`,
        color: '#fef3c7',
        align: 'center',
        wordWrap: { width: layout.feedback.wrapWidth },
      })
      .setOrigin(0.5)

    let employeeButtonBounds: LayoutRect
    let financialButtonBounds: LayoutRect
    let reviewsButtonBounds: LayoutRect
    let returnButtonBounds = layout.returnButton
    let menuButtonBounds = layout.menuButton

    if (layout.compactLandscape) {
      const gap = 6
      const top = 70
      const bottom = height - 8
      const buttonHeight = Math.max(
        48,
        Math.min(
          layout.returnButton.height,
          Math.floor((bottom - top - gap * 4) / 5),
        ),
      )
      const makeBounds = (index: number): LayoutRect => ({
        left: layout.returnButton.left,
        top: top + index * (buttonHeight + gap),
        width: layout.returnButton.width,
        height: buttonHeight,
      })

      employeeButtonBounds = makeBounds(0)
      financialButtonBounds = makeBounds(1)
      reviewsButtonBounds = makeBounds(2)
      returnButtonBounds = makeBounds(3)
      menuButtonBounds = makeBounds(4)
    } else {
      const managementTop = Math.max(8, layout.returnButton.top - layout.returnButton.height - 10)
      const gap = 8
      const availableWidth = layout.returnButton.width - gap * 2
      const buttonWidth = Math.max(48, Math.floor(availableWidth / 3))

      employeeButtonBounds = {
        left: layout.returnButton.left,
        top: managementTop,
        width: buttonWidth,
        height: layout.returnButton.height,
      }
      financialButtonBounds = {
        left: employeeButtonBounds.left + employeeButtonBounds.width + gap,
        top: managementTop,
        width: buttonWidth,
        height: layout.returnButton.height,
      }
      reviewsButtonBounds = {
        left: financialButtonBounds.left + financialButtonBounds.width + gap,
        top: managementTop,
        width: Math.max(
          48,
          layout.returnButton.left + layout.returnButton.width -
            (financialButtonBounds.left + financialButtonBounds.width + gap),
        ),
        height: layout.returnButton.height,
      }
    }

    this.createButton(employeeButtonBounds, 'Employees', () => this.openEmployeeManagement(), layout.navFontSize)
    this.createButton(financialButtonBounds, 'Finances', () => this.openFinancialReport(), layout.navFontSize)
    this.createButton(reviewsButtonBounds, 'Reviews', () => this.openCustomerReviews(), layout.navFontSize)
    this.createButton(returnButtonBounds, 'Return to Game World', () => this.returnToGameWorld(), layout.navFontSize)
    this.createButton(menuButtonBounds, 'Main Menu', () => this.returnToMainMenu(), layout.navFontSize)

    this.refreshView()

    this.scale.on(Phaser.Scale.Events.RESIZE, this.handleResize)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off(Phaser.Scale.Events.RESIZE, this.handleResize)
    })
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
    const activeEmployees = this.companyState.employees.filter((employee) => employee.status === 'Active').length
    this.companyInfoText.setText([
      this.companyState.companyName,
      `Money: ${this.companyState.money}   Level: ${this.companyState.level}   Reputation: ${this.companyState.reputation}`,
      `Employees: ${this.companyState.employees.length} (${activeEmployees} active)   Reviews: ${this.companyState.reviews.length}`,
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

  private openEmployeeManagement(): void {
    replaceGameSession(this.worldState, this.companyState)
    this.scene.start('EmployeeManagement')
  }

  private openFinancialReport(): void {
    replaceGameSession(this.worldState, this.companyState)
    this.scene.start('FinancialReport')
  }

  private openCustomerReviews(): void {
    replaceGameSession(this.worldState, this.companyState)
    this.scene.start('CustomerReviews')
  }

  private returnToGameWorld(): void {
    replaceGameSession(this.worldState, this.companyState)
    this.scene.start('GameWorld')
  }

  private returnToMainMenu(): void {
    replaceGameSession(this.worldState, this.companyState)
    this.scene.start('MainMenu')
  }

  private createButton(
    bounds: LayoutRect,
    label: string,
    onTap: () => void,
    fontSize: number,
  ): void {
    const x = rectCenterX(bounds)
    const y = rectCenterY(bounds)
    const button = this.add
      .rectangle(x, y, bounds.width, bounds.height, 0x0f766e, 1)
      .setStrokeStyle(2, 0x99f6e4)
      .setInteractive({ useHandCursor: true })

    this.add
      .text(x, y, label, {
        fontFamily: 'Arial',
        fontSize: `${fontSize}px`,
        color: '#ecfeff',
        fontStyle: 'bold',
        align: 'center',
        wordWrap: { width: Math.max(72, bounds.width - 10) },
      })
      .setOrigin(0.5)

    button.on('pointerdown', onTap)
  }
}
