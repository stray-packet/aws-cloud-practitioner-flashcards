import { describe, expect, it } from 'vitest'
import cardsJson from '../data/generated-cards.json'
import { loadSpanishTranslations, simpleQuestionHelp } from './cardLanguage'
import { flashcardListSchema } from '../types/card'

describe('bilingual study content', () => {
  it('has a complete Spanish translation for every approved card', async () => {
    const cards = flashcardListSchema.parse(cardsJson)
    const spanishTranslations = await loadSpanishTranslations()
    expect(spanishTranslations.size).toBe(cards.length)
    for (const card of cards) {
      const translation = spanishTranslations.get(card.id)
      expect(translation?.prompt).toBeTruthy()
      expect(translation?.answer).toBeTruthy()
      expect(translation?.explanation).toBeTruthy()
      expect(translation?.example).toBeTruthy()
    }
  })

  it('offers simple, non-empty guidance for every card type in both languages', () => {
    const cards = flashcardListSchema.parse(cardsJson)
    for (const type of new Set(cards.map((card) => card.type))) {
      expect(simpleQuestionHelp(type, 'en').length).toBeGreaterThan(30)
      expect(simpleQuestionHelp(type, 'es').length).toBeGreaterThan(30)
    }
  })
})
