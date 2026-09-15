import { describe, expect, it } from 'vitest'
import cardsJson from '../data/generated-cards.json'
import { flashcardListSchema } from './card'

describe('approved flashcard data', () => {
  it('matches the runtime schema and has stable unique ids', () => {
    const cards = flashcardListSchema.parse(cardsJson)
    expect(cards.length).toBeGreaterThan(0)
    expect(new Set(cards.map((card) => card.id)).size).toBe(cards.length)
    expect(new Set(cards.map((card) => card.prompt)).size).toBe(cards.length)
    expect(cards.every((card) => card.status === 'approved')).toBe(true)
    expect(cards.every((card) => Boolean(card.example))).toBe(true)
  })
})
