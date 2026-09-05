import Phaser from 'phaser'
import { getBrowserSaveStorage } from '../persistence/browserSaveStorage'
import { autosaveIfApproved } from '../persistence/saveSystem'
import { getOrCreateGameSession, replaceGameSession } from '../state/gameSession'
import { getAudioController } from '../systems/audioSystem'
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
  private nameText!: Phaser.GameObjects.Text
  private roleText!: Phaser.GameObjects.Text
  private statusChip!: Phaser.GameObjects.Rectangle
  private statusLabel!: Phaser.GameObjects.Text
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

    this.cameras.main.setBackgroundColor('#08111f')

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
        color: '#b9d8ff',
        align: 'center',
        lineSpacing: 2,
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
      .setStrokeStyle(2, 0x2dd4bf, 0.78)

    this.add
      .rectangle(
        this.layout.panel.left + 3,
        rectCenterY(this.layout.panel),
        6,
        Math.max(28, this.layout.panel.height - 22),
        0x22c55e,
        0.92,
      )

    this.createCandidateAvatar(candidate.name)

    this.nameText = this.add
      .text(this.layout.identity.x, this.layout.identity.y, candidate.name, {
        fontFamily: 'Arial',
        fontSize: `${this.layout.identity.fontSize}px`,
        color: '#f8fafc',
        fontStyle: 'bold',
        wordWrap: { width: this.layout.identity.wrapWidth },
      })
      .setOrigin(0, 0)

    this.roleText = this.add
      .text(this.layout.identity.x, this.layout.identity.y + 28, candidate.role, {
        fontFamily: 'Arial',
        fontSize: `${Math.max(13, this.layout.identity.fontSize - 4)}px`,
        color: '#93c5fd',
        wordWrap: { width: this.layout.identity.wrapWidth },
      })
      .setOrigin(0, 0)

    this.statusChip = this.add
      .rectangle(
        rectCenterX(this.layout.statusChip),
        rectCenterY(this.layout.statusChip),
        this.layout.statusChip.width,
        this.layout.statusChip.height,
        0x1d4ed8,
        0.95,
      )
      .setStrokeStyle(1, 0x93c5fd, 0.9)

    this.statusLabel = this.add
      .text(rectCenterX(this.layout.statusChip), rectCenterY(this.layout.statusChip), '', {
        fontFamily: 'Arial',
        fontSize: '13px',
        color: '#eff6ff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)

    this.detailsText = this.add
      .text(this.layout.details.x, this.layout.details.y, '', {
        fontFamily: 'Arial',
        fontSize: `${this.layout.details.fontSize}px`,
        color: '#dbe6f5',
        align: 'left',
        lineSpacing: 5,
        wordWrap: { width: this.layout.details.wrapWidth },
      })
      .setOrigin(0, 0)

    this.feedbackText = this.add
      .text(this.layout.feedback.x, this.layout.feedback.y, '', {
        fontFamily: 'Arial',
        fontSize: `${this.layout.feedback.fontSize}px`,
        color: '#fde68a',
        align: 'left',
        lineSpacing: 2,
        wordWrap: { width: this.layout.feedback.wrapWidth },
      })
      .setOrigin(0, 0.5)

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
      .text(rectCenterX(this.layout.actionButton), rectCenterY(this.layout.actionButton), '', {
        fontFamily: 'Arial',
        fontSize: `${this.layout.actionFontSize}px`,
        color: '#f0fdf4',
        fontStyle: 'bold',
        align: 'center',
      })
      .setOrigin(0.5)

    this.createButton(this.layout.returnButton, 'Company', () => this.returnToCompany(), this.layout.navFontSize)
    this.createButton(this.layout.menuButton, 'Main Menu', () => this.returnToMainMenu(), this.layout.navFontSize)

    this.refreshView()

    this.scale.on(Phaser.Scale.Events.RESIZE, this.handleResize)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off(Phaser.Scale.Events.RESIZE, this.handleResize)
    })
  }

  private createCandidateAvatar(name: string): void {
    const avatar = this.layout.avatar
    const centerX = rectCenterX(avatar)
    const centerY = rectCenterY(avatar)
    const faceRadius = avatar.width * 0.19
    const faceY = avatar.top + avatar.height * 0.37

    this.add
      .rectangle(centerX, centerY, avatar.width, avatar.height, 0x16324a, 1)
      .setStrokeStyle(2, 0x67e8f9, 0.86)

    // A compact illustrated portrait keeps Alex visually identifiable without
    // inventing gameplay attributes that do not yet exist in the employee model.
    this.add.ellipse(centerX, faceY - faceRadius * 0.42, faceRadius * 2.2, faceRadius * 1.34, 0x3b2f2f, 1)
    this.add.circle(centerX, faceY, faceRadius, 0xe7b98e, 1)
    this.add.circle(centerX - faceRadius * 0.37, faceY - faceRadius * 0.06, Math.max(1.5, faceRadius * 0.075), 0x1f2937, 1)
    this.add.circle(centerX + faceRadius * 0.37, faceY - faceRadius * 0.06, Math.max(1.5, faceRadius * 0.075), 0x1f2937, 1)

    const portraitGraphics = this.add.graphics()
    portraitGraphics.lineStyle(Math.max(1, avatar.width * 0.018), 0x7c4a2d, 1)
    portraitGraphics.beginPath()
    portraitGraphics.arc(centerX, faceY + faceRadius * 0.22, faceRadius * 0.34, 0.15, Math.PI - 0.15, false)
    portraitGraphics.strokePath()

    this.add.ellipse(
      centerX,
      avatar.top + avatar.height * 0.78,
      avatar.width * 0.72,
      avatar.height * 0.38,
      0x0f766e,
      1,
    )
    this.add
      .rectangle(centerX, avatar.top + avatar.height * 0.69, avatar.width * 0.16, avatar.height * 0.15, 0xf8fafc, 0.92)
      .setStrokeStyle(1, 0x99f6e4, 0.8)

    this.add
      .circle(avatar.left + avatar.width - 14, avatar.top + 14, 11, 0x0f766e, 1)
      .setStrokeStyle(1, 0x99f6e4, 0.9)

    this.add
      .text(avatar.left + avatar.width - 14, avatar.top + 14, name.slice(0, 1).toUpperCase(), {
        fontFamily: 'Arial',
        fontSize: '12px',
        color: '#ecfeff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
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
      getAudioController().play(result.hired ? 'employee-hired' : 'negative')
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
      getAudioController().play(result.activated ? 'positive' : 'negative')
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
    const summary = this.layout.compactLandscape
      ? `${this.companyState.companyName}   Money: ${this.companyState.money}   ${this.companyState.employees.length} employees • ${activeCount} active`
      : `${this.companyState.companyName}   •   Money: ${this.companyState.money}\n${this.companyState.employees.length} employees   •   ${activeCount} active`

    this.summaryText.setText(summary)

    if (!employee) {
      this.nameText.setText(candidate.name)
      this.roleText.setText(`${candidate.role} candidate`)
      this.setStatus('Candidate')
      this.detailsText.setText([
        `Hire cost     ${candidate.hireCost}`,
        `Salary        ${candidate.salaryPerCycle} / salary cycle`,
        '',
        'Hiring begins onboarding. Alex becomes payroll-eligible after onboarding is complete.',
      ])
      this.actionLabel.setText(`Hire ${candidate.name} — ${candidate.hireCost}`)
      this.actionButton.setFillStyle(0x15803d, 1).setStrokeStyle(2, 0x86efac)
      this.actionButton.setInteractive({ useHandCursor: true }).setAlpha(1)
      return
    }

    this.nameText.setText(employee.name)
    this.roleText.setText(employee.role)
    this.setStatus(employee.status)
    this.detailsText.setText([
      `Salary        ${employee.salaryPerCycle} / salary cycle`,
      `Payroll       last processed cycle ${this.companyState.payroll.lastProcessedCycle}`,
      '',
      employee.status === 'Active'
        ? 'Ready for work and eligible for payroll.'
        : 'Onboarding in progress. Complete it to activate Alex and start payroll eligibility.',
    ])

    if (employee.status === 'Onboarding') {
      this.actionLabel.setText('Complete Onboarding')
      this.actionButton.setFillStyle(0x1d4ed8, 1).setStrokeStyle(2, 0x93c5fd)
      this.actionButton.setInteractive({ useHandCursor: true }).setAlpha(1)
    } else {
      this.actionLabel.setText('Active Employee')
      this.actionButton.setFillStyle(0x334155, 1).setStrokeStyle(2, 0x64748b)
      this.actionButton.disableInteractive().setAlpha(0.72)
    }
  }

  private setStatus(status: string): void {
    if (status === 'Active') {
      this.statusChip.setFillStyle(0x166534, 0.96).setStrokeStyle(1, 0x86efac, 0.95)
      this.statusLabel.setColor('#f0fdf4')
    } else if (status === 'Onboarding') {
      this.statusChip.setFillStyle(0x1d4ed8, 0.96).setStrokeStyle(1, 0x93c5fd, 0.95)
      this.statusLabel.setColor('#eff6ff')
    } else {
      this.statusChip.setFillStyle(0x7c3aed, 0.94).setStrokeStyle(1, 0xc4b5fd, 0.95)
      this.statusLabel.setColor('#f5f3ff')
    }
    this.statusLabel.setText(status)
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
