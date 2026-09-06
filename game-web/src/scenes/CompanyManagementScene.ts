import Phaser from 'phaser'
import { getBrowserSaveStorage } from '../persistence/browserSaveStorage'
import { autosaveIfApproved } from '../persistence/saveSystem'
import { getOrCreateGameSession, replaceGameSession } from '../state/gameSession'
import { getAudioController } from '../systems/audioSystem'
import { getAvailableUpgrades, purchaseUpgrade } from '../systems/upgradeSystem'
import { synchronizePlayerMovementSpeed } from '../systems/bicycleSystem'
import type { CompanyState, WorldState } from '../types/game'
import { buildCompanyDashboardLayout, insetRect } from '../ui/managementLayout'
import { buildManagementOverview } from '../ui/managementViewModel'
import { drawManagementFooter, drawManagementHeader } from '../ui/managementControls'
import { COLORS, formatMoney } from '../ui/theme'
import { createThemedButton, drawHeadquarters, drawPanel, fitText } from '../ui/themeControls'

export class CompanyManagementScene extends Phaser.Scene {
  private worldState!: WorldState
  private companyState!: CompanyState
  private feedback = ''
  private readonly handleResize = (): void => { this.render() }

  constructor() { super('CompanyManagement') }

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
    const layout = buildCompanyDashboardLayout(this.scale.width, this.scale.height)
    const data = buildManagementOverview(this.companyState)
    drawManagementHeader(this, layout, 'Your Company', this.companyState,
      this.feedback || `${data.name} · Reputation ${data.reputation}`)
    drawPanel(this, layout.hq, { tone: 'accent' })
    const hq = insetRect(layout.hq, 12)
    fitText(this, { ...hq, height: 25 }, 'Headquarters', 21, COLORS.textPrimary, true)
    fitText(this, { ...hq, top: hq.top + 27, height: 20 }, `Company level ${data.level}`, 14, COLORS.textGold, true)
    const action = { ...hq, top: hq.top + hq.height - 48, height: 48 }
    drawHeadquarters(this, { ...hq, top: hq.top + 46, height: action.top - hq.top - 49 })
    const upgrade = getAvailableUpgrades()[0]
    const owned = !!upgrade && this.companyState.purchasedUpgradeLevels[upgrade.id] >= upgrade.maxLevel
    if (upgrade && !owned) {
      createThemedButton(this, action, `Buy ${upgrade.name} · ${formatMoney(upgrade.cost)}`, 'success',
        () => this.purchaseSelectedUpgrade()).setEnabled(this.companyState.money >= upgrade.cost)
    } else {
      createThemedButton(this, action, 'Manage vehicles ›', 'primary', () => this.openVehicleFleet())
    }

    const stats = [
      { title: 'Employees', value: `${data.employees} hired · ${data.activeEmployees} active`, action: () => this.openEmployeeManagement() },
      { title: 'Vehicle Fleet', value: `${data.fleet} owned`, action: () => this.openVehicleFleet() },
    ]
    layout.stats.forEach((rect, index) => {
      const stat = stats[index]
      drawPanel(this, rect)
      fitText(this, { left: rect.left + 12, top: rect.top + 7, width: rect.width - 24, height: 23 },
        stat.value, 14, index === 0 ? COLORS.textSecondary : COLORS.textGold, true)
      createThemedButton(this, { left: rect.left + 8, top: rect.top + rect.height - 52,
        width: rect.width - 16, height: 48 }, `${stat.title} ›`, 'primary', stat.action, { fontSize: 14 })
    })

    drawPanel(this, layout.review)
    const review = insetRect(layout.review, 12)
    const compact = layout.compactLandscape
    const bottom = { ...review, top: review.top + review.height - 48, height: 48 }
    fitText(this, { ...review, height: 23 },
      `Recent Reviews${data.reviews.count ? ` · ${data.reviews.averageRating.toFixed(1)} ★` : ''}`,
      18, COLORS.textPrimary, true)
    const message = data.latestReview?.message ?? 'Your first delivery is the start of your reputation.'
    const messageHeight = bottom.top - review.top - 34
    if (!compact && messageHeight >= 26) {
      fitText(this, { ...review, top: review.top + 28, height: messageHeight },
        data.latestReview ? `“${message}”` : message, 15, COLORS.textSecondary)
    }
    const half = (bottom.width - 8) / 2
    createThemedButton(this, { ...bottom, width: half },
      compact ? `${data.reviews.count} Reviews ›` : 'All reviews ›', 'primary', () => this.openCustomerReviews(), { fontSize: 14 })
    createThemedButton(this, { ...bottom, left: bottom.left + half + 8, width: half },
      'Finances ›', 'primary', () => this.openFinancialReport(), { fontSize: 14 })
    drawManagementFooter(this, layout, { label: '‹ Back to city', action: () => this.returnToGameWorld() },
      () => this.returnToMainMenu())
  }

  private purchaseSelectedUpgrade(): void {
    const selectedUpgrade = getAvailableUpgrades()[0]
    if (!selectedUpgrade) return
    const result = purchaseUpgrade(this.companyState, selectedUpgrade.id)
    this.feedback = result.message
    getAudioController().play(result.purchased ? 'purchase' : 'negative')
    if (result.purchased) {
      this.companyState = result.company
      this.worldState = synchronizePlayerMovementSpeed(this.worldState, this.companyState)
      const session = replaceGameSession(this.worldState, this.companyState)
      const storage = getBrowserSaveStorage()
      if (storage) {
        const autosave = autosaveIfApproved(storage, session, 'upgrade-purchased')
        if (!autosave.saved && autosave.reason === 'write-failed') this.feedback = 'Purchased · Local autosave failed'
      } else {
        this.feedback = 'Purchased · Local autosave unavailable'
      }
    }
    this.render()
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
    if (typeof this.scene.isSleeping === 'function' && this.scene.isSleeping('GameWorld')) {
      // GameWorld owns the expensive city presentation. Wake the resident scene when possible
      // instead of rebuilding every building, tree, label and ambient actor on every visit.
      this.scene.wake('GameWorld')
      this.scene.stop()
      return
    }
    this.scene.start('GameWorld')
  }
  private returnToMainMenu(): void {
    replaceGameSession(this.worldState, this.companyState)
    this.scene.start('MainMenu')
  }
}
