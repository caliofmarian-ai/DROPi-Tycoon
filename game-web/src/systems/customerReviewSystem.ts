import { BALANCING } from '../config/balancing'
import type { CompanyState, CustomerReview, OrderState } from '../types/game'

export type CustomerReviewResult =
  | {
      generated: true
      company: CompanyState
      review: CustomerReview
    }
  | {
      generated: false
      company: CompanyState
      review: CustomerReview | null
      reason: 'order-not-settled' | 'non-terminal-order' | 'already-reviewed'
    }

export interface CustomerReviewSummary {
  count: number
  positiveCount: number
  negativeCount: number
  averageRating: number
  totalReputationImpact: number
}

export const buildCustomerReviewSummary = (
  reviews: readonly CustomerReview[],
): CustomerReviewSummary => {
  const count = reviews.length
  const positiveCount = reviews.filter((review) => review.sentiment === 'Positive').length
  const negativeCount = reviews.filter((review) => review.sentiment === 'Negative').length
  const totalRating = reviews.reduce((total, review) => total + review.rating, 0)
  const totalReputationImpact = reviews.reduce(
    (total, review) => total + review.reputationImpact,
    0,
  )

  return {
    count,
    positiveCount,
    negativeCount,
    averageRating: count === 0 ? 0 : totalRating / count,
    totalReputationImpact,
  }
}

export const buildCustomerReviewForOrder = (order: OrderState): CustomerReview | null => {
  if (!order.economySettled) return null

  if (order.status === 'Completed') {
    return {
      orderId: order.orderId,
      rating: 5,
      sentiment: 'Positive',
      message: 'Fast and reliable delivery.',
      reputationImpact: BALANCING.REPUTATION_ON_SUCCESS,
    }
  }

  if (order.status === 'Failed') {
    return {
      orderId: order.orderId,
      rating: 1,
      sentiment: 'Negative',
      message: 'The delivery did not reach the expected destination.',
      reputationImpact: BALANCING.REPUTATION_ON_FAILURE,
    }
  }

  return null
}

export const appendCustomerReview = (
  company: CompanyState,
  order: OrderState,
): CustomerReviewResult => {
  if (!order.economySettled) {
    return {
      generated: false,
      company,
      review: null,
      reason: 'order-not-settled',
    }
  }

  if (order.status !== 'Completed' && order.status !== 'Failed') {
    return {
      generated: false,
      company,
      review: null,
      reason: 'non-terminal-order',
    }
  }

  const reviews = company.reviews ?? []
  const existing = reviews.find((review) => review.orderId === order.orderId) ?? null
  if (existing) {
    return {
      generated: false,
      company: { ...company, reviews: [...reviews] },
      review: existing,
      reason: 'already-reviewed',
    }
  }

  const review = buildCustomerReviewForOrder(order)
  if (!review) {
    return {
      generated: false,
      company,
      review: null,
      reason: 'non-terminal-order',
    }
  }

  return {
    generated: true,
    review,
    company: {
      ...company,
      reviews: [...reviews, review],
    },
  }
}
