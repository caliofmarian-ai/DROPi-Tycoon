import Phaser from 'phaser'
import { getOrCreateGameSession, replaceGameSession } from '../state/gameSession'
import { buildCustomerReviewSummary } from '../systems/customerReviewSystem'
import type { CompanyState, WorldState } from '../types/game'
import { buildManagementCards, insetRect } from '../ui/managementLayout'
import { pageAfterResize, pageItems } from '../ui/managementViewModel'
import { bindManagementPaging, drawManagementFooter, drawManagementHeader } from '../ui/managementControls'
import { COLORS } from '../ui/theme'
import { drawPanel, fitText } from '../ui/themeControls'

export class CustomerReviewsScene extends Phaser.Scene {
  private worldState!: WorldState
  private companyState!: CompanyState
  private currentPage = 0
  private pageSize = 1
  private readonly handleResize = (): void => {
    const nextSize = buildManagementCards(this.scale.width, this.scale.height).pageSize
    this.currentPage = pageAfterResize(this.currentPage, this.pageSize, nextSize)
    this.render()
  }

  constructor() { super('CustomerReviews') }

  create(): void {
    const session = getOrCreateGameSession()
    this.worldState = session.world
    this.companyState = session.company
    this.currentPage = 0
    this.render()
    bindManagementPaging(this, () => buildManagementCards(this.scale.width, this.scale.height).body,
      (delta) => this.changePage(delta))
    this.scale.on(Phaser.Scale.Events.RESIZE, this.handleResize)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off(Phaser.Scale.Events.RESIZE, this.handleResize)
    })
  }

  private render(): void {
    this.children.removeAll(true)
    const layout = buildManagementCards(this.scale.width, this.scale.height)
    this.pageSize = layout.pageSize
    const reviews = [...this.companyState.reviews].reverse()
    const summary = buildCustomerReviewSummary(reviews)
    const paging = pageItems(reviews, this.currentPage, layout.pageSize)
    this.currentPage = paging.page
    drawManagementHeader(this, layout, 'Customer Reviews', this.companyState,
      summary.count ? `${summary.averageRating.toFixed(1)} ★ · ${summary.count} reviews · Reputation ${this.companyState.reputation}`
        : 'Your reputation starts with your next delivery')
    if (!reviews.length) {
      drawPanel(this, layout.body, { tone: 'accent' })
      const box = insetRect(layout.body, 24)
      fitText(this, { ...box, height: 42 }, '☆ ☆ ☆ ☆ ☆', 30, COLORS.textGold, true, 'center')
      fitText(this, { ...box, top: box.top + 58, height: 32 }, 'Your story starts here', 22, COLORS.textPrimary, true, 'center')
      fitText(this, { ...box, top: box.top + 98, height: Math.min(86, box.height - 98) },
        'Make a delivery to hear from your customers. Every completed or failed delivery can shape your reputation.',
        16, COLORS.textSecondary, false, 'center')
    }
    paging.items.forEach((review, index) => {
      const card = layout.cards[index]
      const box = insetRect(card, 16)
      drawPanel(this, card, { tone: review.sentiment === 'Positive' ? 'success' : 'danger' })
      const rating = Math.max(0, Math.min(5, Math.round(review.rating)))
      fitText(this, { ...box, height: 28 }, '★'.repeat(rating) + '☆'.repeat(5 - rating), 24, COLORS.textGold, true)
      fitText(this, { ...box, top: box.top + 42, height: box.height - 104 }, `“${review.message}”`, 18, COLORS.textPrimary)
      fitText(this, { ...box, top: box.top + box.height - 47, height: 21 },
        `${review.sentiment} · Reputation ${review.reputationImpact >= 0 ? '+' : ''}${review.reputationImpact}`,
        13, review.sentiment === 'Positive' ? COLORS.textSuccess : COLORS.textDanger)
      fitText(this, { ...box, top: box.top + box.height - 22, height: 22 }, review.orderId, 12, COLORS.textMuted)
    })
    drawManagementFooter(this, layout, { label: 'Company', action: () => this.returnToCompany() },
      () => this.returnToMainMenu(), { ...paging, change: (delta) => this.changePage(delta) })
  }

  private changePage(delta: number): void {
    const next = pageItems(this.companyState.reviews, this.currentPage + delta, this.pageSize).page
    if (next === this.currentPage) return
    this.currentPage = next
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
