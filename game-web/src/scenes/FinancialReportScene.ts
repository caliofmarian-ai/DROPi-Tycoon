import Phaser from 'phaser'
import { getBrowserSaveStorage } from '../persistence/browserSaveStorage'
import { autosaveIfApproved } from '../persistence/saveSystem'
import { getOrCreateGameSession, replaceGameSession } from '../state/gameSession'
import {
  buildFinancialReport,
  calculateDailyOperatingExpense,
  processDailyOperatingExpense,
} from '../systems/financialSystem'
import type { CompanyState, WorldState } from '../types/game'
import {
  buildFinancialReportLayout,
  type FinancialReportLayout,
} from '../ui/financialReportLayout'
import type { LayoutRect } from '../ui/mobileViewport'

const rectCenterX = (rect: LayoutRect): number => rect.left + rect.width / 2
const rectCenterY = (rect: LayoutRect): number => rect.top + rect.height / 2

export class FinancialReportScene extends Phaser.Scene {
  private worldState!: WorldState
  private companyState!: CompanyState
  private layout!: FinancialReportLayout

  private summaryText!: Phaser.GameObjects.Text
  private reportText!: Phaser.GameObjects.Text
  private feedbackText!: Phaser.GameObjects.Text
  private actionLabel!: Phaser.GameObjects.Text

  private readonly handleResize = (): void => {
    if (this.worldState && this.companyState) {
      replaceGameSession(this.worldState, this.companyState)
    }
    this.scene.restart()
  }

  constructor() {
    super('FinancialReport')
  }

  create(): void {
    const { width, height } = this.scale
    this.layout = buildFinancialReportLayout(width, height)
    const session = getOrCreateGameSession()
    this.worldState = session.world
    this.companyState = session.company

    this.cameras.main.setBackgroundColor('#101826')

    this.add.text(this.layout.title.x, this.layout.title.y, 'Financial Report', {
      fontFamily: 'Arial',
      fontSize: `${this.layout.title.fontSize}px`,
      color: '#f8fafc',
      fontStyle: 'bold',
    }).setOrigin(0.5)

    this.summaryText = this.add.text(this.layout.summary.x, this.layout.summary.y, '', {
      fontFamily: 'Arial',
      fontSize: `${this.layout.summary.fontSize}px`,
      color: '#dbeafe',
      align: 'center',
    }).setOrigin(0.5)

    this.add.rectangle(
      rectCenterX(this.layout.panel),
      rectCenterY(this.layout.panel),
      this.layout.panel.width,
      this.layout.panel.height,
      0x0f172a,
      0.97,
    ).setStrokeStyle(3, 0xf59e0b, 0.75)

    this.reportText = this.add.text(this.layout.reportText.x, this.layout.reportText.y, '', {
      fontFamily: 'Arial',
      fontSize: `${this.layout.reportText.fontSize}px`,
      color: '#e2e8f0',
      align: 'left',
      lineSpacing: 5,
      wordWrap: { width: this.layout.reportText.wrapWidth },
    }).setOrigin(0.5)

    this.feedbackText = this.add.text(this.layout.feedback.x, this.layout.feedback.y, '', {
      fontFamily: 'Arial',
      fontSize: `${this.layout.feedback.fontSize}px`,
      color: '#fef3c7',
      align: 'center',
      wordWrap: { width: this.layout.feedback.wrapWidth },
    }).setOrigin(0.5)

    const actionButton = this.add.rectangle(
      rectCenterX(this.layout.actionButton),
      rectCenterY(this.layout.actionButton),
      this.layout.actionButton.width,
      this.layout.actionButton.height,
      0xb45309,
      1,
    ).setStrokeStyle(2, 0xfcd34d).setInteractive({ useHandCursor: true })

    this.actionLabel = this.add.text(
      rectCenterX(this.layout.actionButton),
      rectCenterY(this.layout.actionButton),
      '',
      {
        fontFamily: 'Arial',
        fontSize: `${this.layout.actionFontSize}px`,
        color: '#fffbeb',
        fontStyle: 'bold',
        align: 'center',
      },
    ).setOrigin(0.5)

    actionButton.on('pointerdown', () => this.closeNextOperatingDay())

    this.createButton(this.layout.returnButton, 'Company', () => this.returnToCompany(), this.layout.navFontSize)
    this.createButton(this.layout.menuButton, 'Main Menu', () => this.returnToMainMenu(), this.layout.navFontSize)

    this.refreshView()
    this.scale.on(Phaser.Scale.Events.RESIZE, this.handleResize)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off(Phaser.Scale.Events.RESIZE, this.handleResize)
    })
  }

  private closeNextOperatingDay(): void {
    const dayId = this.companyState.financials.lastProcessedDay + 1
    const result = processDailyOperatingExpense(this.companyState, dayId)
    this.feedbackText.setText(result.message)
    if (result.processed) {
      this.companyState = result.company
      const session = replaceGameSession(this.worldState, this.companyState)
      const storage = getBrowserSaveStorage()
      if (storage) {
        const autosave = autosaveIfApproved(storage, session, 'daily-operating-expense-processed')
        if (!autosave.saved && autosave.reason === 'write-failed') {
          this.feedbackText.setText(`${result.message}\nLocal autosave failed: ${autosave.message ?? 'unknown error'}`)
        }
      }
    }
    this.refreshView()
  }

  private refreshView(): void {
    const report = buildFinancialReport(this.companyState)
    const nextExpense = calculateDailyOperatingExpense(this.companyState)

    this.summaryText.setText(`${this.companyState.companyName}   Cash: ${report.cashBalance}`)
    this.reportText.setText([
      `Income — deliveries: ${report.income}`,
      `Operating expenses: ${report.operatingExpenses}`,
      `Salary expenses: ${report.salaryExpenses}`,
      `Total tracked expenses: ${report.totalExpenses}`,
      `Net operating result: ${report.netResult}`,
      `Cash balance: ${report.cashBalance}`,
      '',
      `Closed operating days: ${report.lastProcessedDay}`,
      `Processed salary cycles: ${report.lastSalaryCycle}`,
    ])
    this.actionLabel.setText(`Close Day ${report.lastProcessedDay + 1} — Cost ${nextExpense}`)
  }

  private returnToCompany(): void {
    replaceGameSession(this.worldState, this.companyState)
    this.scene.start('CompanyManagement')
  }

  private returnToMainMenu(): void {
    replaceGameSession(this.worldState, this.companyState)
    this.scene.start('MainMenu')
  }

  private createButton(bounds: LayoutRect, label: string, onTap: () => void, fontSize: number): void {
    const x = rectCenterX(bounds)
    const y = rectCenterY(bounds)
    const button = this.add.rectangle(x, y, bounds.width, bounds.height, 0x0f766e, 1)
      .setStrokeStyle(2, 0x99f6e4)
      .setInteractive({ useHandCursor: true })
    this.add.text(x, y, label, {
      fontFamily: 'Arial',
      fontSize: `${fontSize}px`,
      color: '#ecfeff',
      fontStyle: 'bold',
      align: 'center',
      wordWrap: { width: Math.max(80, bounds.width - 12) },
    }).setOrigin(0.5)
    button.on('pointerdown', onTap)
  }
}
