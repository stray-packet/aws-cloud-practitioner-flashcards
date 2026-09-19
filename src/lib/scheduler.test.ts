import { describe, expect, it } from 'vitest'
import { getIntervals, isDue, reviewCard } from './scheduler'

describe('FSRS scheduler wrapper', () => {
  it('previews every rating for a new card', () => {
    const now = new Date('2026-08-28T12:00:00.000Z')
    const intervals = getIntervals(undefined, 0.9, now)
    expect(Object.keys(intervals)).toEqual(['again', 'hard', 'good', 'easy'])
    expect(intervals.again).toMatch(/m|h|d/)
  })

  it('serializes a completed review and schedules it in the future', () => {
    const now = new Date('2026-08-28T12:00:00.000Z')
    const result = reviewCard(undefined, 'good', 0.9, now)
    expect(new Date(result.card.due).getTime()).toBeGreaterThan(now.getTime())
    expect(isDue(result.card, now)).toBe(false)
  })

  it('gives a new Good card a short learning step and Easy a later review', () => {
    const now = new Date('2026-08-28T12:00:00.000Z')
    const goodDelay = new Date(reviewCard(undefined, 'good', 0.9, now).card.due).getTime() - now.getTime()
    const easyDelay = new Date(reviewCard(undefined, 'easy', 0.9, now).card.due).getTime() - now.getTime()
    expect(goodDelay).toBeGreaterThan(0)
    expect(goodDelay).toBeLessThanOrEqual(30 * 60 * 1000)
    expect(easyDelay).toBeGreaterThan(30 * 60 * 1000)
  })
})
