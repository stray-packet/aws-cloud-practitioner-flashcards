import { describe, expect, it } from 'vitest'
import { prioritizeReviewQueue, shouldRepeatInSession } from './reviewQueue'

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

  it('only repeats short Again or Hard intervals in the same session', () => {
    expect(shouldRepeatInSession('hard', 61_000, 1_000)).toBe(true)
    expect(shouldRepeatInSession('good', 61_000, 1_000)).toBe(false)
    expect(shouldRepeatInSession('again', 3_601_000, 1_000)).toBe(false)
  })
})
