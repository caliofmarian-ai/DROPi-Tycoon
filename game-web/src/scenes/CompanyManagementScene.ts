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
import { COLORS, formatMoney, rectCenterX, rectCenterY } from '../ui/theme'
import {
  createStatusChip,
  createThemedButton,
  drawPanel,
  paintBackdrop,
} from '../ui/themeControls'

export class CompanyManagementScene extends Phaser.Scene {
  private worldState!: WorldState
  private companyState!: CompanyState
  private selectedUpgrade!: UpgradeDefinition

  private companyInfoText!: Phaser.GameObjects.Text
  private snapshotText!: Phaser.GameObjects.Text
  private upgradeNameText!: Phaser.GameObjects.Text
  private descriptionText!: Phaser.GameObjects.Text
  private upgradeStatusText!: Phaser.GameObjects.Text
  private feedbackText!: Phaser.GameObjects.Text
  private purchaseControl!: ReturnType<typeof createThemedButton>
  private ownedAssetGroup!: Phaser.GameObjects.Container

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

    this.cameras.main.setBackgroundColor('#050b16')
    paintBackdrop(this, width, height)

    // TOP: company identity dashboard strip (name, money, level, reputation).
    drawPanel(this, layout.identityBar, { tone: 'accent', radius: 12 })

    this.add
      .text(layout.title.x, layout.title.y, 'COMPANY DASHBOARD', {
        fontFamily: 'Arial',
        fontSize: `${layout.title.fontSize}px`,
        color: COLORS.textMuted,
        fontStyle: 'bold',
      })
      .setOrigin(0.5)

    this.companyInfoText = this.add
      .text(layout.companyInfo.x, layout.companyInfo.y, '', {
        fontFamily: 'Arial',
        fontSize: `${layout.companyInfo.fontSize}px`,
        color: COLORS.textPrimary,
        fontStyle: 'bold',
        align: 'center',
      })
      .setOrigin(0.5)

    this.snapshotText = this.add
      .text(layout.snapshot.x, layout.snapshot.y, '', {
        fontFamily: 'Arial',
        fontSize: `${layout.snapshot.fontSize}px`,
        color: COLORS.textSecondary,
        align: 'center',
      })
      .setOrigin(0.5)

    // BODY: Bicycle asset card — compact once owned instead of dominating the screen.
    drawPanel(this, layout.card, { tone: 'default' })

    this.upgradeNameText = this.add
      .text(layout.upgradeName.x, layout.upgradeName.y, this.selectedUpgrade.name, {
        fontFamily: 'Arial',
        fontSize: `${layout.upgradeName.fontSize}px`,
        color: COLORS.textPrimary,
        fontStyle: 'bold',
      })
      .setOrigin(0.5)

    this.descriptionText = this.add
      .text(layout.description.x, layout.description.y, this.selectedUpgrade.description, {
        fontFamily: 'Arial',
        fontSize: `${layout.description.fontSize}px`,
        color: COLORS.textSecondary,
        align: 'center',
        wordWrap: { width: layout.description.wrapWidth },
      })
      .setOrigin(0.5)

    this.upgradeStatusText = this.add
      .text(layout.status.x, layout.status.y, '', {
        fontFamily: 'Arial',
        fontSize: `${layout.status.fontSize}px`,
        color: COLORS.textSecondary,
        align: 'center',
      })
      .setOrigin(0.5)

    this.purchaseControl = createThemedButton(
      this,
      layout.purchase,
      'Purchase',
      'primary',
      () => this.purchaseSelectedUpgrade(),
      { fontSize: layout.purchase.fontSize },
    )

    // Compact "already owned" asset-state group, shown instead of the empty
    // description/status/purchase area once the Bicycle has been purchased.
    this.ownedAssetGroup = this.add.container(0, 0)
    const ownedChip = createStatusChip(
      this,
      layout.upgradeName.x,
      layout.description.y,
      '🚲 Bicycle — Owned',
      'success',
      Math.round(layout.upgradeName.fontSize * 0.72),
    )
    const ownedCaption = this.add
      .text(
        layout.status.x,
        layout.status.y,
        'First delivery vehicle unlocked. Manage the full fleet in Vehicles.',
        {
          fontFamily: 'Arial',
          fontSize: `${Math.max(12, layout.status.fontSize - 2)}px`,
          color: COLORS.textMuted,
          align: 'center',
          wordWrap: { width: layout.description.wrapWidth },
        },
      )
      .setOrigin(0.5)
    this.ownedAssetGroup.add([ownedChip.background, ownedChip.label, ownedCaption])

    this.feedbackText = this.add
      .text(layout.feedback.x, layout.feedback.y, '', {
        fontFamily: 'Arial',
        fontSize: `${layout.feedback.fontSize}px`,
        color: COLORS.textGold,
        align: 'center',
        wordWrap: { width: layout.feedback.wrapWidth },
      })
      .setOrigin(0.5)

    if (layout.compactLandscape) {
      const gap = 6
      const columnGap = 6
      const left = layout.returnButton.left
      const totalWidth = layout.returnButton.width
      const columnWidth = Math.max(48, Math.floor((totalWidth - columnGap) / 2))
      const rowHeight = 52
      const top = 72
      const grid = (column: number, row: number): LayoutRect => ({
        left: left + column * (columnWidth + columnGap),
        top: top + row * (rowHeight + gap),
        width: column === 0 ? columnWidth : Math.max(48, totalWidth - columnWidth - columnGap),
        height: rowHeight,
      })

      this.createButton(grid(0, 0), 'Employees', () => this.openEmployeeManagement(), 14)
      this.createButton(grid(1, 0), 'Finances', () => this.openFinancialReport(), 14)
      this.createButton(grid(0, 1), 'Reviews', () => this.openCustomerReviews(), 14)
      this.createButton(grid(1, 1), 'Vehicles', () => this.openVehicleFleet(), 14)
      this.createButton(grid(0, 2), 'Game', () => this.returnToGameWorld(), 14)
      this.createButton(grid(1, 2), 'Menu', () => this.returnToMainMenu(), 14)
    } else {
      const gap = 6
      const managementTop = Math.max(8, layout.returnButton.top - layout.returnButton.height - 10)
      const availableWidth = layout.returnButton.width - gap * 3
      const buttonWidth = Math.max(48, Math.floor(availableWidth / 4))
      const managementBounds = Array.from({ length: 4 }, (_, index): LayoutRect => ({
        left: layout.returnButton.left + index * (buttonWidth + gap),
        top: managementTop,
        width: index === 3
          ? Math.max(48, layout.returnButton.left + layout.returnButton.width -
              (layout.returnButton.left + index * (buttonWidth + gap)))
          : buttonWidth,
        height: layout.returnButton.height,
      }))
      const managementFont = Math.min(layout.navFontSize, 15)

      this.createButton(managementBounds[0], 'Employees', () => this.openEmployeeManagement(), managementFont)
      this.createButton(managementBounds[1], 'Finances', () => this.openFinancialReport(), managementFont)
      this.createButton(managementBounds[2], 'Reviews', () => this.openCustomerReviews(), managementFont)
      this.createButton(managementBounds[3], 'Vehicles', () => this.openVehicleFleet(), managementFont)
      this.createButton(layout.returnButton, 'Return to Game World', () => this.returnToGameWorld(), layout.navFontSize)
      this.createButton(layout.menuButton, 'Main Menu', () => this.returnToMainMenu(), layout.navFontSize)
    }

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
    this.companyInfoText.setText(
      `${this.companyState.companyName}  ·  ${formatMoney(this.companyState.money)}  ·  Level ${this.companyState.level}  ·  ★ ${this.companyState.reputation}`,
    )
    this.snapshotText.setText(
      `Employees ${activeEmployees}/${this.companyState.employees.length}    Vehicles ${this.companyState.vehicles.length}    Reviews ${this.companyState.reviews.length}`,
    )

    const currentLevel = this.companyState.purchasedUpgradeLevels[this.selectedUpgrade.id]
    const owned = currentLevel >= this.selectedUpgrade.maxLevel
    this.upgradeStatusText.setText(
      owned
        ? `Owned — Level ${currentLevel}/${this.selectedUpgrade.maxLevel}`
        : `Cost: ${formatMoney(this.selectedUpgrade.cost)}   Level: ${currentLevel}/${this.selectedUpgrade.maxLevel}`,
    )

    // Once owned, the Bicycle upgrade collapses to a compact asset-state
    // group instead of leaving the description/purchase area empty.
    this.upgradeNameText.setVisible(!owned)
    this.descriptionText.setVisible(!owned)
    this.upgradeStatusText.setVisible(!owned)
    this.purchaseControl.background.setVisible(!owned)
    this.purchaseControl.label.setVisible(!owned)
    this.ownedAssetGroup.setVisible(owned)

    this.purchaseControl.setLabel(owned ? 'Owned' : 'Purchase')
    this.purchaseControl.setEnabled(!owned)
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

  private openVehicleFleet(): void {
    replaceGameSession(this.worldState, this.companyState)
    this.scene.start('VehicleFleet')
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
    bounds: LayoutRect | undefined,
    label: string,
    onTap: () => void,
    fontSize: number,
  ): void {
    if (!bounds) return
    const x = rectCenterX(bounds)
    const y = rectCenterY(bounds)
    const button = this.add
      .rectangle(x, y, bounds.width, bounds.height, COLORS.surfaceRaised, 1)
      .setStrokeStyle(2, COLORS.accent, 0.75)
      .setInteractive({ useHandCursor: true })

    this.add
      .text(x, y, label, {
        fontFamily: 'Arial',
        fontSize: `${fontSize}px`,
        color: COLORS.textPrimary,
        fontStyle: 'bold',
        align: 'center',
        wordWrap: { width: Math.max(46, bounds.width - 8) },
      })
      .setOrigin(0.5)

    button.on('pointerdown', onTap)
  }
}
