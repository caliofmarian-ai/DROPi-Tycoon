import Phaser from 'phaser'
import { getBrowserSaveStorage } from '../persistence/browserSaveStorage'
import { autosaveIfApproved } from '../persistence/saveSystem'
import { getOrCreateGameSession, replaceGameSession } from '../state/gameSession'
import { getAudioController } from '../systems/audioSystem'
import { completeEmployeeOnboarding, hireEmployee } from '../systems/employeeSystem'
import type { CompanyState, WorldState } from '../types/game'
import { buildManagementLayout, buildStaffCardLayout } from '../ui/managementLayout'
import { buildEmployeeCards, buildManagementOverview, pageItems } from '../ui/managementViewModel'
import { bindManagementPaging, drawManagementFooter, drawManagementHeader } from '../ui/managementControls'
import { COLORS, formatMoney } from '../ui/theme'
import { createThemedButton, drawEmployeePortrait, drawPanel, fitText } from '../ui/themeControls'

export class EmployeeManagementScene extends Phaser.Scene {
  private worldState!: WorldState
  private companyState!: CompanyState
  private currentPage = 0
  private feedback = ''
  private readonly handleResize = (): void => { this.render() }

  constructor() { super('EmployeeManagement') }

  create(): void {
    const session = getOrCreateGameSession()
    this.worldState = session.world
    this.companyState = session.company
    this.currentPage = 0
    this.feedback = ''
    this.render()
    bindManagementPaging(this, () => buildManagementLayout(this.scale.width, this.scale.height).body,
      (delta) => this.changePage(delta))
    this.scale.on(Phaser.Scale.Events.RESIZE, this.handleResize)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off(Phaser.Scale.Events.RESIZE, this.handleResize)
    })
  }

  private render(): void {
    this.children.removeAll(true)
    const layout = buildManagementLayout(this.scale.width, this.scale.height, true)
    const data = buildManagementOverview(this.companyState)
    const paging = pageItems(buildEmployeeCards(this.companyState), this.currentPage, 1)
    this.currentPage = paging.page
    drawManagementHeader(this, layout, 'Employees', this.companyState,
      this.feedback || `${data.employees} hired · ${data.activeEmployees} active`)
    const employee = paging.items[0]
    if (employee) {
      const boxes = buildStaffCardLayout(layout.body)
      drawPanel(this, boxes.panel, { tone: employee.status === 'Active' ? 'success' : 'accent' })
      drawEmployeePortrait(this, boxes.avatar)
      fitText(this, { ...boxes.identity, height: 28 }, employee.name, 23, COLORS.textPrimary, true)
      fitText(this, { ...boxes.identity, top: boxes.identity.top + 30, height: 20 }, employee.role, 15, COLORS.textSecondary)
      fitText(this, { ...boxes.identity, top: boxes.identity.top + 55, height: 20 },
        employee.status === 'Active' ? '✓ Active' : employee.status, 14,
        employee.status === 'Active' ? COLORS.textSuccess : COLORS.textGold, true)
      fitText(this, boxes.salary, `Salary · ${formatMoney(employee.salaryPerCycle)} per cycle`, 16, COLORS.textGold, true)
      if (boxes.note.height >= 28) {
        fitText(this, boxes.note,
          employee.status === 'Active' ? `Ready for work.\n${this.companyState.payroll.lastProcessedCycle} salary cycles processed.`
            : employee.hired ? 'Welcome aboard! Complete onboarding to activate this courier.'
              : `Grow your team.\nHiring costs ${formatMoney(employee.hireCost)}. Onboarding starts after hiring.`,
          16, COLORS.textSecondary)
      }
      const label = employee.status === 'Active' ? '✓ Active employee'
        : employee.hired ? 'Complete onboarding'
          : employee.canAct ? `Hire ${employee.name} · ${formatMoney(employee.hireCost)}`
            : `Need ${formatMoney(employee.hireCost)} to hire`
      createThemedButton(this, boxes.action, label, 'success', () => this.performPrimaryAction(employee.employeeId))
        .setEnabled(employee.canAct)
    }
    drawManagementFooter(this, layout, { label: 'Company', action: () => this.returnToCompany() },
      () => this.returnToMainMenu(), { ...paging, change: (delta) => this.changePage(delta) })
  }

  private changePage(delta: number): void {
    const next = pageItems(buildEmployeeCards(this.companyState), this.currentPage + delta, 1).page
    if (next === this.currentPage) return
    this.currentPage = next
    this.feedback = ''
    this.render()
  }

  private performPrimaryAction(employeeId: string): void {
    const employee = this.companyState.employees.find((item) => item.employeeId === employeeId)
    if (!employee) {
      const result = hireEmployee(this.companyState, employeeId)
      this.feedback = result.message
      getAudioController().play(result.hired ? 'employee-hired' : 'negative')
      if (result.hired) {
        this.companyState = result.company
        this.persistMeaningfulChange('employee-hired')
      }
    } else if (employee.status === 'Onboarding') {
      const result = completeEmployeeOnboarding(this.companyState, employee.employeeId)
      this.feedback = result.message
      getAudioController().play(result.activated ? 'positive' : 'negative')
      if (result.activated) {
        this.companyState = result.company
        this.persistMeaningfulChange('employee-onboarding-completed')
      }
    }
    this.render()
  }

  private persistMeaningfulChange(event: string): void {
    const session = replaceGameSession(this.worldState, this.companyState)
    const storage = getBrowserSaveStorage()
    if (!storage) { this.feedback = 'Updated · Local autosave unavailable'; return }
    const autosave = autosaveIfApproved(storage, session, event)
    if (!autosave.saved && autosave.reason === 'write-failed') this.feedback = 'Updated · Local autosave failed'
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
