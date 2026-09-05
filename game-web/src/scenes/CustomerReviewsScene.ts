import Phaser from 'phaser'
import { getOrCreateGameSession, replaceGameSession } from '../state/gameSession'
import { buildCustomerReviewSummary } from '../systems/customerReviewSystem'
import type { CompanyState, CustomerReview, WorldState } from '../types/game'
import {
  buildCustomerReviewsLayout,
  type CustomerReviewsLayout,
} from '../ui/customerReviewsLayout'
import type { LayoutRect } from '../ui/mobileViewport'

const rectCenterX = (rect: LayoutRect): number => rect.left + rect.width / 2
const rectCenterY = (rect: LayoutRect): number => rect.top + rect.height / 2

export class CustomerReviewsScene extends Phaser.Scene {
  private worldState!: WorldState
  private companyState!: CompanyState
  private layout!: CustomerReviewsLayout
  private currentPage = 0

  private summaryText!: Phaser.GameObjects.Text
  private emptyText!: Phaser.GameObjects.Text
  private pageText!: Phaser.GameObjects.Text
  private previousButton!: Phaser.GameObjects.Rectangle
  private previousLabel!: Phaser.GameObjects.Text
  private nextButton!: Phaser.GameObjects.Rectangle
  private nextLabel!: Phaser.GameObjects.Text
  private rowBackgrounds: Phaser.GameObjects.Rectangle[] = []
  private rowTexts: Phaser.GameObjects.Text[] = []

  private readonly handleResize = (): void => {
    if (this.worldState && this.companyState) {
      replaceGameSession(this.worldState, this.companyState)
    }
    this.scene.restart()
  }

  constructor() {
    super('CustomerReviews')
  }

  create(): void {
    const { width, height } = this.scale
    this.layout = buildCustomerReviewsLayout(width, height)
    const session = getOrCreateGameSession()
    this.worldState = session.world
    this.companyState = session.company
    this.currentPage = 0

    this.cameras.main.setBackgroundColor('#08111f')

    this.add
      .text(this.layout.title.x, this.layout.title.y, 'Customer Reviews', {
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
        color: '#c4b5fd',
        align: 'center',
        lineSpacing: 3,
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
      .setStrokeStyle(2, 0x8b5cf6, 0.78)

    this.rowBackgrounds = this.layout.rowRects.map((rect) =>
      this.add
        .rectangle(
          rectCenterX(rect),
          rectCenterY(rect),
          rect.width,
          rect.height,
          0x1e293b,
          0.96,
        )
        .setStrokeStyle(1, 0x475569, 0.9),
    )

    this.rowTexts = this.layout.rowRects.map((rect) =>
      this.add
        .text(rect.left + 12, rectCenterY(rect), '', {
          fontFamily: 'Arial',
          fontSize: `${this.layout.rowFontSize}px`,
          color: '#e2e8f0',
          align: 'left',
          lineSpacing: 3,
          wordWrap: { width: this.layout.rowTextWrapWidth },
        })
        .setOrigin(0, 0.5),
    )

    this.emptyText = this.add
      .text(
        this.layout.emptyText.x,
        this.layout.emptyText.y,
        'No customer reviews yet. Complete or fail a settled delivery to create the first review.',
        {
          fontFamily: 'Arial',
          fontSize: `${this.layout.emptyText.fontSize}px`,
          color: '#cbd5e1',
          align: 'center',
          wordWrap: { width: this.layout.emptyText.wrapWidth },
        },
      )
      .setOrigin(0.5)

    this.previousButton = this.createButton(
      this.layout.previousButton,
      'Previous',
      () => this.changePage(-1),
      this.layout.compactLandscape ? 15 : 17,
    ).button
    this.previousLabel = this.getLastButtonLabel()

    this.nextButton = this.createButton(
      this.layout.nextButton,
      'Next',
      () => this.changePage(1),
      this.layout.compactLandscape ? 15 : 17,
    ).button
    this.nextLabel = this.getLastButtonLabel()

    this.pageText = this.add
      .text(this.layout.pageText.x, this.layout.pageText.y, '', {
        fontFamily: 'Arial',
        fontSize: `${this.layout.pageText.fontSize}px`,
        color: '#c4b5fd',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)

    this.createButton(
      this.layout.returnButton,
      'Company',
      () => this.returnToCompany(),
      this.layout.navFontSize,
    )
    this.createButton(
      this.layout.menuButton,
      'Main Menu',
      () => this.returnToMainMenu(),
      this.layout.navFontSize,
    )

    this.refreshView()

    this.scale.on(Phaser.Scale.Events.RESIZE, this.handleResize)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off(Phaser.Scale.Events.RESIZE, this.handleResize)
    })
  }

  private lastCreatedButtonLabel: Phaser.GameObjects.Text | null = null

  private getLastButtonLabel(): Phaser.GameObjects.Text {
    if (!this.lastCreatedButtonLabel) {
      throw new Error('Customer review navigation label was not created')
    }
    return this.lastCreatedButtonLabel
  }

  private changePage(delta: number): void {
    const pageCount = this.getPageCount()
    const nextPage = Math.min(pageCount - 1, Math.max(0, this.currentPage + delta))
    if (nextPage === this.currentPage) return
    this.currentPage = nextPage
    this.refreshView()
  }

  private getOrderedReviews(): CustomerReview[] {
    return [...this.companyState.reviews].reverse()
  }

  private getPageCount(): number {
    return Math.max(1, Math.ceil(this.companyState.reviews.length / this.layout.rowsPerPage))
  }

  private refreshView(): void {
    const reviews = this.getOrderedReviews()
    const summary = buildCustomerReviewSummary(reviews)
    const average = summary.count === 0 ? '—' : summary.averageRating.toFixed(1)
    const totalImpact = summary.totalReputationImpact >= 0
      ? `+${summary.totalReputationImpact}`
      : `${summary.totalReputationImpact}`

    this.summaryText.setText(
      this.layout.compactLandscape
        ? `${summary.count} reviews  •  ★ ${average}/5  •  +${summary.positiveCount} / -${summary.negativeCount}  •  Rep ${totalImpact}`
        : `${summary.count} reviews  •  ★ ${average}/5  •  Rep ${totalImpact}\n${summary.positiveCount} positive  •  ${summary.negativeCount} negative`,
    )

    const pageCount = this.getPageCount()
    this.currentPage = Math.min(this.currentPage, pageCount - 1)
    const start = this.currentPage * this.layout.rowsPerPage
    const visibleReviews = reviews.slice(start, start + this.layout.rowsPerPage)

    this.rowBackgrounds.forEach((background, index) => {
      const review = visibleReviews[index]
      const text = this.rowTexts[index]
      if (!review) {
        background.setVisible(false)
        text.setVisible(false)
        text.setText('')
        return
      }

      const impact = review.reputationImpact >= 0
        ? `+${review.reputationImpact}`
        : `${review.reputationImpact}`
      const stars = `${'★'.repeat(Math.max(0, Math.min(5, review.rating)))}${'☆'.repeat(Math.max(0, 5 - review.rating))}`
      const positive = review.sentiment === 'Positive'
      background
        .setVisible(true)
        .setFillStyle(positive ? 0x14352e : 0x3a1f2a, 0.97)
        .setStrokeStyle(1, positive ? 0x34d399 : 0xfb7185, 0.72)
      text
        .setVisible(true)
        .setText([
          `${review.orderId}   ${stars}`,
          review.message,
          `${review.sentiment}  •  Reputation ${impact}`,
        ])
    })

    const hasReviews = reviews.length > 0
    this.emptyText.setVisible(!hasReviews)
    this.pageText.setText(hasReviews ? `${this.currentPage + 1} / ${pageCount}` : '0 / 0')

    this.setPagingButtonState(
      this.previousButton,
      this.previousLabel,
      hasReviews && this.currentPage > 0,
      () => this.changePage(-1),
    )
    this.setPagingButtonState(
      this.nextButton,
      this.nextLabel,
      hasReviews && this.currentPage < pageCount - 1,
      () => this.changePage(1),
    )
  }

  private setPagingButtonState(
    button: Phaser.GameObjects.Rectangle,
    label: Phaser.GameObjects.Text,
    enabled: boolean,
    onTap: () => void,
  ): void {
    button.removeAllListeners('pointerdown')
    if (enabled) {
      button.setInteractive({ useHandCursor: true }).setAlpha(1).on('pointerdown', onTap)
      label.setAlpha(1)
      return
    }

    button.disableInteractive().setAlpha(0.45)
    label.setAlpha(0.45)
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
  ): { button: Phaser.GameObjects.Rectangle; label: Phaser.GameObjects.Text } {
    const x = rectCenterX(bounds)
    const y = rectCenterY(bounds)
    const button = this.add
      .rectangle(x, y, bounds.width, bounds.height, 0x5b21b6, 1)
      .setStrokeStyle(2, 0xc4b5fd)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', onTap)

    const text = this.add
      .text(x, y, label, {
        fontFamily: 'Arial',
        fontSize: `${fontSize}px`,
        color: '#f5f3ff',
        fontStyle: 'bold',
        align: 'center',
        wordWrap: { width: Math.max(68, bounds.width - 10) },
      })
      .setOrigin(0.5)

    this.lastCreatedButtonLabel = text
    return { button, label: text }
  }
}
