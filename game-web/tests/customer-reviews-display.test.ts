import { describe, expect, it } from 'vitest'
import { buildCustomerReviewSummary } from '../src/systems/customerReviewSystem'
import type { CustomerReview } from '../src/types/game'
import { buildManagementCards } from '../src/ui/managementLayout'
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

describe('RBATCH-021 / Product Experience — customer reviews Android layout', () => {
  for (const viewport of SUPPORTED_ANDROID_VIEWPORTS) {
    it(`keeps review rows, summary and controls usable at ${viewport.width}x${viewport.height}`, () => {
      const layout = buildManagementCards(viewport.width, viewport.height)

      expect(rectInsideViewport(layout.body, viewport.width, viewport.height)).toBe(true)
      expect(layout.cards).toHaveLength(layout.pageSize)
      expect(layout.header.width).toBeLessThanOrEqual(viewport.width)

      for (const row of layout.cards) {
        expect(rectInsideViewport(row, viewport.width, viewport.height)).toBe(true)
        expect(row.height).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET_PX)
        expect(row.left).toBeGreaterThanOrEqual(layout.body.left)
        expect(row.left + row.width).toBeLessThanOrEqual(layout.body.left + layout.body.width)
        expect(row.height).toBeGreaterThanOrEqual(200)
      }

      for (const nav of layout.navigation) {
        expect(rectInsideViewport(nav, viewport.width, viewport.height)).toBe(true)
        expect(nav.height).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET_PX)
      }
    })
  }

  it('uses readable two-card paging in portrait and landscape', () => {
    const landscape = buildManagementCards(800, 360)
    const portrait = buildManagementCards(360, 800)

    expect(landscape.compactLandscape).toBe(true)
    expect(landscape.pageSize).toBe(2)
    expect(portrait.compactLandscape).toBe(false)
    expect(portrait.pageSize).toBe(2)
    expect(portrait.header.width).toBeLessThan(360)
  })
})
