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

const METRIC_LABELS = ['Delivery income', 'Expenses', 'Net result', 'Cash'] as const
const METRIC_ACCENTS = [0x22c55e, 0xf59e0b, 0x38bdf8, 0x8b5cf6] as const

export class FinancialReportScene extends Phaser.Scene {
  private worldState!: WorldState
  private companyState!: CompanyState
  private layout!: FinancialReportLayout

  private summaryText!: Phaser.GameObjects.Text
  private metricValueTexts: Phaser.GameObjects.Text[] = []
  private operationsText!: Phaser.GameObjects.Text
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

    this.cameras.main.setBackgroundColor('#08111f')

    this.add
      .text(this.layout.title.x, this.layout.title.y, 'Financial Report', {
        fontFamily: 'Arial',
        fontSize: `${this.layout.title.fontSize}px`,
        color: '#f8fafc',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)

    this.summaryText = this.add
      .text(this.layout.summary.x, this.layout.summary.y, '', {
        fontFamily: 'Arial',
        fontSize: `${this.layout.summary.fontSize}px`,
        color: '#b9d8ff',
        align: 'center',
        wordWrap: { width: this.layout.summary.wrapWidth },
      })
      .setOrigin(0.5)

    this.add
      .rectangle(
        rectCenterX(this.layout.panel),
        rectCenterY(this.layout.panel),
        this.layout.panel.width,
        this.layout.panel.height,
        0x101b2d,
        0.98,
      )
      .setStrokeStyle(2, 0xf59e0b, 0.76)

    this.metricValueTexts = this.layout.metricRects.map((rect, index) => {
      const accent = METRIC_ACCENTS[index] ?? 0x38bdf8
      this.add
        .rectangle(rectCenterX(rect), rectCenterY(rect), rect.width, rect.height, 0x17243a, 0.98)
        .setStrokeStyle(1, accent, 0.72)

      this.add
        .rectangle(rect.left + 3, rectCenterY(rect), 5, Math.max(24, rect.height - 18), accent, 0.9)

      this.add
        .text(rect.left + 14, rect.top + 11, METRIC_LABELS[index] ?? '', {
          fontFamily: 'Arial',
          fontSize: `${this.layout.metricLabelFontSize}px`,
          color: '#9fb5d0',
          fontStyle: 'bold',
        })
        .setOrigin(0, 0)

      return this.add
        .text(rect.left + 14, rect.top + rect.height - 12, '0', {
          fontFamily: 'Arial',
          fontSize: `${this.layout.metricValueFontSize}px`,
          color: '#f8fafc',
          fontStyle: 'bold',
        })
        .setOrigin(0, 1)
    })

    this.add
      .rectangle(
        rectCenterX(this.layout.operationsCard),
        rectCenterY(this.layout.operationsCard),
        this.layout.operationsCard.width,
        this.layout.operationsCard.height,
        0x0f1d31,
        0.98,
      )
      .setStrokeStyle(1, 0x475569, 0.9)

    this.add
      .text(this.layout.operationsCard.left + 14, this.layout.operationsCard.top + 10, 'Operations', {
        fontFamily: 'Arial',
        fontSize: `${this.layout.operationsFontSize}px`,
        color: '#f8fafc',
        fontStyle: 'bold',
      })
      .setOrigin(0, 0)

    this.operationsText = this.add
      .text(
        this.layout.operationsCard.left + 14,
        this.layout.operationsCard.top + this.layout.operationsCard.height - 10,
        '',
        {
          fontFamily: 'Arial',
          fontSize: `${Math.max(11, this.layout.operationsFontSize - 1)}px`,
          color: '#cbd5e1',
          lineSpacing: 3,
          wordWrap: { width: Math.max(180, this.layout.operationsCard.width - 28) },
        },
      )
      .setOrigin(0, 1)

    this.feedbackText = this.add
      .text(this.layout.feedback.x, this.layout.feedback.y, '', {
        fontFamily: 'Arial',
        fontSize: `${this.layout.feedback.fontSize}px`,
        color: '#fde68a',
        align: 'center',
        wordWrap: { width: this.layout.feedback.wrapWidth },
      })
      .setOrigin(0.5)

    const actionButton = this.add
      .rectangle(
        rectCenterX(this.layout.actionButton),
        rectCenterY(this.layout.actionButton),
        this.layout.actionButton.width,
        this.layout.actionButton.height,
        0xb45309,
        1,
      )
      .setStrokeStyle(2, 0xfcd34d)
      .setInteractive({ useHandCursor: true })

    this.actionLabel = this.add
      .text(rectCenterX(this.layout.actionButton), rectCenterY(this.layout.actionButton), '', {
        fontFamily: 'Arial',
        fontSize: `${this.layout.actionFontSize}px`,
        color: '#fffbeb',
        fontStyle: 'bold',
        align: 'center',
      })
      .setOrigin(0.5)

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
        const autosave = autosaveIfApproved(storage, session, 'progression-changed')
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

    this.summaryText.setText(`${this.companyState.companyName}  •  Business finances`)

    const values = [
      report.income,
      report.totalExpenses,
      report.netResult,
      report.cashBalance,
    ]
    this.metricValueTexts.forEach((text, index) => {
      text.setText(`${values[index] ?? 0}`)
    })

    const netText = this.metricValueTexts[2]
    if (netText) {
      netText.setColor(report.netResult < 0 ? '#fca5a5' : '#86efac')
    }
    const cashText = this.metricValueTexts[3]
    if (cashText) {
      cashText.setColor(report.cashBalance <= 0 ? '#fca5a5' : '#ddd6fe')
    }

    this.operationsText.setText([
      `Closed operating days   ${report.lastProcessedDay}`,
      `Processed salary cycles   ${report.lastSalaryCycle}`,
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
        wordWrap: { width: Math.max(80, bounds.width - 12) },
      })
      .setOrigin(0.5)
    button.on('pointerdown', onTap)
  }
}
