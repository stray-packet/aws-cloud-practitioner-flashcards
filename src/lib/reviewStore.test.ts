import { describe, expect, it } from 'vitest'
import type { RatingName } from './scheduler'
import { applyReviewToStore } from './reviewStore'
import type { StudyStore } from './storage'

const emptyStore: StudyStore = {
  cards: {},
  reviewLogs: [],
  examAttempts: [],
  settings: { retention: 0.9, newCardsPerDay: 10, theme: 'system' },
}

describe('review rating buttons', () => {
  it.each(['again', 'hard', 'good', 'easy'] as RatingName[])('%s records the chosen rating and updates the FSRS card', (rating) => {
    const reviewedAt = new Date('2026-09-15T12:00:00.000Z')
    const update = applyReviewToStore(emptyStore, 'clf-c02-2026-09-15-001', rating, 'daily', reviewedAt, `event-${rating}`)

    expect(update.event.rating).toBe(rating)
    expect(update.event.mode).toBe('daily-review')
    expect(update.store.reviewLogs.at(-1)).toEqual(update.event)
    expect(update.store.cards['clf-c02-2026-09-15-001']).toEqual(update.card)
    expect(update.card.reps).toBe(1)
    expect(new Date(update.card.due).getTime()).toBeGreaterThan(reviewedAt.getTime())
  })

  it('keeps custom-study reviews identifiable in the local history', () => {
    const update = applyReviewToStore(emptyStore, 'clf-c02-2026-09-15-001', 'good', 'custom', new Date('2026-09-15T12:00:00.000Z'), 'custom-event')
    expect(update.event.mode).toBe('custom-study')
  })

  it('applies meaningfully different schedules for the four buttons', () => {
    const reviewedAt = new Date('2026-09-15T12:00:00.000Z')
    const dueTimes = (['again', 'hard', 'good', 'easy'] as RatingName[]).map((rating) =>
      new Date(applyReviewToStore(emptyStore, 'card', rating, 'daily', reviewedAt, rating).card.due).getTime(),
    )

    expect(new Set(dueTimes).size).toBe(4)
    expect(dueTimes[0]).toBeLessThan(dueTimes[1])
    expect(dueTimes[1]).toBeLessThan(dueTimes[2])
    expect(dueTimes[2]).toBeLessThan(dueTimes[3])
  })
})
