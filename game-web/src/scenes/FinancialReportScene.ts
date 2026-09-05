import Phaser from 'phaser'
import { getBrowserSaveStorage } from '../persistence/browserSaveStorage'
import { autosaveIfApproved } from '../persistence/saveSystem'
import { getOrCreateGameSession, replaceGameSession } from '../state/gameSession'
import { buildFinancialReport, calculateDailyOperatingExpense, processDailyOperatingExpense } from '../systems/financialSystem'
import { calculateDailyVehicleMaintenanceExpense } from '../systems/vehicleSystem'
import type { CompanyState, WorldState } from '../types/game'
import { buildFinanceDashboardLayout, insetRect } from '../ui/managementLayout'
import { drawManagementFooter, drawManagementHeader } from '../ui/managementControls'
import { COLORS, formatMoney } from '../ui/theme'
import { createThemedButton, drawPanel, fitText } from '../ui/themeControls'

export class FinancialReportScene extends Phaser.Scene {
  private worldState!: WorldState
  private companyState!: CompanyState
  private feedback = ''
  private readonly handleResize = (): void => { this.render() }

  constructor() { super('FinancialReport') }

  create(): void {
    const session = getOrCreateGameSession()
    this.worldState = session.world
    this.companyState = session.company
    this.feedback = ''
    this.render()
    this.scale.on(Phaser.Scale.Events.RESIZE, this.handleResize)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off(Phaser.Scale.Events.RESIZE, this.handleResize)
    })
  }

  private render(): void {
    this.children.removeAll(true)
    const layout = buildFinanceDashboardLayout(this.scale.width, this.scale.height)
    const report = buildFinancialReport(this.companyState)
    const nextExpense = calculateDailyOperatingExpense(this.companyState)
    const nextMaintenance = calculateDailyVehicleMaintenanceExpense(this.companyState)
    drawManagementHeader(this, layout, 'Financial Report', this.companyState,
      this.feedback || `${this.companyState.companyName} · All-time performance`)
    const metrics = [
      { label: 'Delivery income', value: report.income, tone: 'success' as const, color: COLORS.textSuccess },
      { label: 'Expenses', value: report.totalExpenses, tone: 'gold' as const, color: COLORS.textGold },
      { label: 'Net result', value: report.netResult, tone: 'accent' as const,
        color: report.netResult < 0 ? COLORS.textDanger : COLORS.textSuccess },
      { label: 'Cash balance', value: report.cashBalance, tone: 'accent' as const, color: COLORS.textGold },
    ]
    layout.metrics.forEach((rect, index) => {
      const metric = metrics[index]
      drawPanel(this, rect, { tone: metric.tone })
      const box = insetRect(rect, 12)
      fitText(this, { ...box, height: 20 }, metric.label, 13, COLORS.textSecondary)
      fitText(this, { ...box, top: box.top + 26, height: box.height - 26 },
        formatMoney(metric.value), 25, metric.color, true)
    })
    drawPanel(this, layout.operations)
    const operations = insetRect(layout.operations, 12)
    fitText(this, { ...operations, height: 23 }, 'Operations', 18, COLORS.textPrimary, true)
    const lineHeight = Math.min(26, (operations.height - 27) / 3)
    const rows = [
      `Operating days closed   ${report.lastProcessedDay}`,
      `Salary cycles paid   ${report.lastSalaryCycle}`,
      `Maintenance paid   ${formatMoney(report.maintenanceExpenses)}`,
    ]
    rows.forEach((text, index) => {
      fitText(this, { ...operations, top: operations.top + 27 + index * lineHeight, height: lineHeight },
        text, 14, COLORS.textSecondary)
    })
    if (layout.compactLandscape) {
      fitText(this, { ...layout.action, top: layout.operations.top, height: 26 },
        'Next operating day', 15, COLORS.textSecondary)
      fitText(this, { ...layout.action, top: layout.operations.top + 28, height: 26 },
        formatMoney(nextExpense + nextMaintenance), 23, COLORS.textGold, true)
    }
    createThemedButton(this, layout.action,
      `Close day ${report.lastProcessedDay + 1} · ${formatMoney(nextExpense + nextMaintenance)}`,
      'gold', () => this.closeNextOperatingDay(), { fontSize: 16 })
    drawManagementFooter(this, layout, { label: 'Company', action: () => this.returnToCompany() },
      () => this.returnToMainMenu())
  }

  private closeNextOperatingDay(): void {
    const dayId = this.companyState.financials.lastProcessedDay + 1
    const result = processDailyOperatingExpense(this.companyState, dayId)
    this.feedback = result.message
    if (result.processed) {
      this.companyState = result.company
      const session = replaceGameSession(this.worldState, this.companyState)
      const storage = getBrowserSaveStorage()
      if (storage) {
        const autosave = autosaveIfApproved(storage, session, 'operating-day-closed')
        if (!autosave.saved && autosave.reason === 'write-failed') this.feedback = 'Day closed · Local autosave failed'
      } else {
        this.feedback = 'Day closed · Local autosave unavailable'
      }
    }
    this.render()
  }

  private returnToCompany(): void {
    replaceGameSession(this.worldState, this.companyState)
    this.scene.start('CompanyManagement')
  }
  private returnToMainMenu(): void {
    replaceGameSession(this.worldState, this.companyState)
    this.scene.start('MainMenu')
  }
}
