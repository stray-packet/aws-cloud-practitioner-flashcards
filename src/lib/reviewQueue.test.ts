import { describe, expect, it } from 'vitest'
import { formatLearningWait, prioritizeReviewQueue, shouldRepeatInSession } from './reviewQueue'

describe('within-session learning queue', () => {
  it('places a due learning repetition before untouched cards', () => {
    const queue = prioritizeReviewQueue([
      { item: 'next-new' },
      { item: 'learning', repetition: true, availableAt: 1_000 },
      { item: 'later', repetition: true, availableAt: 10_000 },
    ], 2_000)
    expect(queue.map((entry) => entry.item)).toEqual(['learning', 'next-new', 'later'])
  })

  it('continues with untouched cards while a learning step is not due', () => {
    const queue = prioritizeReviewQueue([
      { item: 'learning', repetition: true, availableAt: 10_000 },
      { item: 'next-new' },
    ], 2_000)
    expect(queue.map((entry) => entry.item)).toEqual(['next-new', 'learning'])
  })

  it('repeats any short learning step except Easy in the same session', () => {
    expect(shouldRepeatInSession('hard', 61_000, 1_000)).toBe(true)
    expect(shouldRepeatInSession('good', 601_000, 1_000)).toBe(true)
    expect(shouldRepeatInSession('easy', 61_000, 1_000)).toBe(false)
    expect(shouldRepeatInSession('again', 3_601_000, 1_000)).toBe(false)
  })

  it('formats an exact learning-step countdown', () => {
    expect(formatLearningWait(601_000)).toBe('10:01')
    expect(formatLearningWait(59_001)).toBe('1:00')
  })
})
