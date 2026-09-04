import { describe, expect, it } from 'vitest'
import { buildCustomerReviewSummary } from '../src/systems/customerReviewSystem'
import type { CustomerReview } from '../src/types/game'
import { buildCustomerReviewsLayout } from '../src/ui/customerReviewsLayout'
import {
  MIN_TOUCH_TARGET_PX,
  SUPPORTED_ANDROID_VIEWPORTS,
  rectInsideViewport,
} from '../src/ui/mobileViewport'

const REVIEWS: readonly CustomerReview[] = [
  {
    orderId: 'ORDER-001',
    rating: 5,
    sentiment: 'Positive',
    message: 'Fast and reliable delivery.',
    reputationImpact: 2,
  },
  {
    orderId: 'ORDER-002',
    rating: 1,
    sentiment: 'Negative',
    message: 'The delivery did not reach the expected destination.',
    reputationImpact: -5,
  },
  {
    orderId: 'ORDER-003',
    rating: 5,
    sentiment: 'Positive',
    message: 'Fast and reliable delivery.',
    reputationImpact: 2,
  },
]

describe('RBATCH-021 — customer review display summary', () => {
  it('derives review count, sentiment totals, average rating and reputation impact without mutation', () => {
    const snapshot = JSON.stringify(REVIEWS)
    expect(buildCustomerReviewSummary(REVIEWS)).toEqual({
      count: 3,
      positiveCount: 2,
      negativeCount: 1,
      averageRating: 11 / 3,
      totalReputationImpact: -1,
    })
    expect(JSON.stringify(REVIEWS)).toBe(snapshot)
  })

  it('returns a clear zero summary before any review exists', () => {
    expect(buildCustomerReviewSummary([])).toEqual({
      count: 0,
      positiveCount: 0,
      negativeCount: 0,
      averageRating: 0,
      totalReputationImpact: 0,
    })
  })
})

describe('RBATCH-021 — customer reviews Android layout', () => {
  for (const viewport of SUPPORTED_ANDROID_VIEWPORTS) {
    it(`keeps review rows and controls usable at ${viewport.width}x${viewport.height}`, () => {
      const layout = buildCustomerReviewsLayout(viewport.width, viewport.height)

      expect(rectInsideViewport(layout.panel, viewport.width, viewport.height)).toBe(true)
      expect(rectInsideViewport(layout.previousButton, viewport.width, viewport.height)).toBe(true)
      expect(rectInsideViewport(layout.nextButton, viewport.width, viewport.height)).toBe(true)
      expect(rectInsideViewport(layout.returnButton, viewport.width, viewport.height)).toBe(true)
      expect(rectInsideViewport(layout.menuButton, viewport.width, viewport.height)).toBe(true)
      expect(layout.rowRects).toHaveLength(layout.rowsPerPage)

      for (const row of layout.rowRects) {
        expect(rectInsideViewport(row, viewport.width, viewport.height)).toBe(true)
        expect(row.height).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET_PX)
        expect(row.left).toBeGreaterThanOrEqual(layout.panel.left)
        expect(row.left + row.width).toBeLessThanOrEqual(layout.panel.left + layout.panel.width)
      }

      expect(layout.previousButton.height).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET_PX)
      expect(layout.nextButton.height).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET_PX)
      expect(layout.returnButton.height).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET_PX)
      expect(layout.menuButton.height).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET_PX)
      expect(layout.rowTextWrapWidth).toBeGreaterThanOrEqual(180)
    })
  }

  it('uses compact landscape paging on short Android landscape viewports', () => {
    const landscape = buildCustomerReviewsLayout(800, 360)
    const portrait = buildCustomerReviewsLayout(360, 800)

    expect(landscape.compactLandscape).toBe(true)
    expect(landscape.rowsPerPage).toBe(3)
    expect(portrait.compactLandscape).toBe(false)
    expect(portrait.rowsPerPage).toBe(5)
  })
})
