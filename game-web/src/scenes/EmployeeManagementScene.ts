import Phaser from 'phaser'
import { getBrowserSaveStorage } from '../persistence/browserSaveStorage'
import { autosaveIfApproved } from '../persistence/saveSystem'
import { getOrCreateGameSession, replaceGameSession } from '../state/gameSession'
import {
  completeEmployeeOnboarding,
  EMPLOYEE_CANDIDATES,
  hireEmployee,
} from '../systems/employeeSystem'
import type { CompanyState, EmployeeState, WorldState } from '../types/game'
import {
  buildEmployeeManagementLayout,
  type EmployeeManagementLayout,
} from '../ui/employeeManagementLayout'
import type { LayoutRect } from '../ui/mobileViewport'

const rectCenterX = (rect: LayoutRect): number => rect.left + rect.width / 2
const rectCenterY = (rect: LayoutRect): number => rect.top + rect.height / 2

export class EmployeeManagementScene extends Phaser.Scene {
  private worldState!: WorldState
  private companyState!: CompanyState
  private layout!: EmployeeManagementLayout

  private summaryText!: Phaser.GameObjects.Text
  private detailsText!: Phaser.GameObjects.Text
  private feedbackText!: Phaser.GameObjects.Text
  private actionButton!: Phaser.GameObjects.Rectangle
  private actionLabel!: Phaser.GameObjects.Text

  private readonly handleResize = (): void => {
    if (this.worldState && this.companyState) {
      replaceGameSession(this.worldState, this.companyState)
    }
    this.scene.restart()
  }

  constructor() {
    super('EmployeeManagement')
  }

  create(): void {
    const { width, height } = this.scale
    this.layout = buildEmployeeManagementLayout(width, height)
    const session = getOrCreateGameSession()
    this.worldState = session.world
    this.companyState = session.company

    const candidate = EMPLOYEE_CANDIDATES[0]
    if (!candidate) {
      throw new Error('RBATCH-018 requires at least one employee candidate')
    }

    this.cameras.main.setBackgroundColor('#111827')

    this.add
      .text(this.layout.title.x, this.layout.title.y, 'Employees', {
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
        color: '#dbeafe',
        align: 'center',
      })
      .setOrigin(0.5)

    this.add
      .rectangle(
        rectCenterX(this.layout.panel),
        rectCenterY(this.layout.panel),
        this.layout.panel.width,
        this.layout.panel.height,
        0x0f172a,
        0.97,
      )
      .setStrokeStyle(3, 0x22c55e, 0.75)

    this.detailsText = this.add
      .text(this.layout.details.x, this.layout.details.y, '', {
        fontFamily: 'Arial',
        fontSize: `${this.layout.details.fontSize}px`,
        color: '#e2e8f0',
        align: 'center',
        lineSpacing: 5,
        wordWrap: { width: this.layout.details.wrapWidth },
      })
      .setOrigin(0.5)

    this.feedbackText = this.add
      .text(this.layout.feedback.x, this.layout.feedback.y, '', {
        fontFamily: 'Arial',
        fontSize: `${this.layout.feedback.fontSize}px`,
        color: '#fef3c7',
        align: 'center',
        wordWrap: { width: this.layout.feedback.wrapWidth },
      })
      .setOrigin(0.5)

    this.actionButton = this.add
      .rectangle(
        rectCenterX(this.layout.actionButton),
        rectCenterY(this.layout.actionButton),
        this.layout.actionButton.width,
        this.layout.actionButton.height,
        0x15803d,
        1,
      )
      .setStrokeStyle(2, 0x86efac)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.performPrimaryAction())

    this.actionLabel = this.add
      .text(
        rectCenterX(this.layout.actionButton),
        rectCenterY(this.layout.actionButton),
        '',
        {
          fontFamily: 'Arial',
          fontSize: `${this.layout.actionFontSize}px`,
          color: '#f0fdf4',
          fontStyle: 'bold',
          align: 'center',
        },
      )
      .setOrigin(0.5)

    this.createButton(this.layout.returnButton, 'Company', () => this.returnToCompany(), this.layout.navFontSize)
    this.createButton(this.layout.menuButton, 'Main Menu', () => this.returnToMainMenu(), this.layout.navFontSize)

    this.refreshView()

    this.scale.on(Phaser.Scale.Events.RESIZE, this.handleResize)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off(Phaser.Scale.Events.RESIZE, this.handleResize)
    })
  }

  private getManagedEmployee(): EmployeeState | null {
    const candidate = EMPLOYEE_CANDIDATES[0]
    if (!candidate) return null
    return this.companyState.employees.find((employee) => employee.employeeId === candidate.employeeId) ?? null
  }

  private performPrimaryAction(): void {
    const candidate = EMPLOYEE_CANDIDATES[0]
    if (!candidate) return

    const employee = this.getManagedEmployee()
    if (!employee) {
      const result = hireEmployee(this.companyState, candidate.employeeId)
      this.feedbackText.setText(result.message)
      if (result.hired) {
        this.companyState = result.company
        this.persistMeaningfulChange('employee-hired', result.message)
      }
      this.refreshView()
      return
    }

    if (employee.status === 'Onboarding') {
      const result = completeEmployeeOnboarding(this.companyState, employee.employeeId)
      this.feedbackText.setText(result.message)
      if (result.activated) {
        this.companyState = result.company
        this.persistMeaningfulChange('employee-onboarding-completed', result.message)
      }
      this.refreshView()
    }
  }

  private persistMeaningfulChange(event: string, successMessage: string): void {
    const session = replaceGameSession(this.worldState, this.companyState)
    const storage = getBrowserSaveStorage()
    if (!storage) {
      this.feedbackText.setText(`${successMessage}\nLocal autosave is unavailable.`)
      return
    }

    const autosave = autosaveIfApproved(storage, session, event)
    if (!autosave.saved && autosave.reason === 'write-failed') {
      this.feedbackText.setText(
        `${successMessage}\nLocal autosave failed: ${autosave.message ?? 'unknown error'}`,
      )
    }
  }

  private refreshView(): void {
    const candidate = EMPLOYEE_CANDIDATES[0]
    if (!candidate) return

    const employee = this.getManagedEmployee()
    const activeCount = this.companyState.employees.filter((item) => item.status === 'Active').length

    this.summaryText.setText(
      `${this.companyState.companyName}   Money: ${this.companyState.money}   Employees: ${this.companyState.employees.length} (${activeCount} active)`,
    )

    if (!employee) {
      this.detailsText.setText([
        `Candidate: ${candidate.name}`,
        `Role: ${candidate.role}`,
        `Hire cost: ${candidate.hireCost}`,
        `Salary: ${candidate.salaryPerCycle} / salary cycle`,
        '',
        'Hiring starts onboarding. Salary eligibility begins only after onboarding is completed.',
      ])
      this.actionLabel.setText(`Hire ${candidate.name} — ${candidate.hireCost}`)
      this.actionButton.setInteractive({ useHandCursor: true }).setAlpha(1)
      return
    }

    this.detailsText.setText([
      `${employee.name} — ${employee.role}`,
      `Status: ${employee.status}`,
      `Salary: ${employee.salaryPerCycle} / salary cycle`,
      `Last processed salary cycle: ${this.companyState.payroll.lastProcessedCycle}`,
      '',
      employee.status === 'Active'
        ? 'Employee is salary-eligible and ready for future assigned-work systems.'
        : 'Complete onboarding before this employee becomes salary-eligible.',
    ])

    if (employee.status === 'Onboarding') {
      this.actionLabel.setText('Complete Onboarding')
      this.actionButton.setInteractive({ useHandCursor: true }).setAlpha(1)
    } else {
      this.actionLabel.setText('Active Employee')
      this.actionButton.disableInteractive().setAlpha(0.55)
    }
  }

  private returnToCompany(): void {
    replaceGameSession(this.worldState, this.companyState)
    this.scene.start('CompanyManagement')
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
        wordWrap: { width: Math.max(80, bounds.width - 12) },
      })
      .setOrigin(0.5)

    button.on('pointerdown', onTap)
  }
}
