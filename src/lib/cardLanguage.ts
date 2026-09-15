import type { CardType } from '../types/card'
import { cardTranslationListSchema, type CardTranslation } from '../types/translation'

export type StudyLanguage = 'en' | 'es'

let spanishTranslationCache: Map<string, CardTranslation> | undefined

export async function loadSpanishTranslations() {
  if (spanishTranslationCache) return spanishTranslationCache
  const { default: translationsJson } = await import('../data/generated-translations-es.json')
  const translations = cardTranslationListSchema.parse(translationsJson)
  spanishTranslationCache = new Map<string, CardTranslation>(translations.map((translation) => [translation.id, translation]))
  return spanishTranslationCache
}

const helpByType: Record<CardType, Record<StudyLanguage, string>> = {
  recall: {
    en: 'Say what the concept is, what it is for, and the one idea that makes it easy to recognize. You do not need a textbook definition.',
    es: 'Di qué es el concepto, para qué sirve y cuál es la idea que permite reconocerlo. No necesitas recitar una definición de libro.',
  },
  scenario: {
    en: 'Find the main need in the situation—such as cost, security, speed, or data type—and choose the AWS option that solves that exact need.',
    es: 'Busca la necesidad principal del caso —costo, seguridad, velocidad o tipo de datos— y elige la opción de AWS que resuelve exactamente esa necesidad.',
  },
  comparison: {
    en: 'Focus on the difference that prevents you from confusing the options and on the situation where you would choose each one.',
    es: 'Concéntrate en la diferencia que evita confundir las opciones y en la situación en la que escogerías cada una.',
  },
  cloze: {
    en: 'Identify the missing AWS concept from the relationship described in the sentence. Read the words immediately around the blank as clues.',
    es: 'Identifica el concepto de AWS que falta usando la relación descrita. Las palabras cercanas al espacio en blanco son las pistas.',
  },
  'single-choice': {
    en: 'There is one best answer. Eliminate choices that solve a different problem, then select the option that matches every important clue.',
    es: 'Hay una sola mejor respuesta. Descarta las opciones que resuelven otro problema y elige la que coincide con todas las pistas importantes.',
  },
  'multiple-response': {
    en: 'More than one answer is correct. Judge each choice separately instead of stopping after finding the first plausible one.',
    es: 'Hay más de una respuesta correcta. Evalúa cada opción por separado y no te detengas al encontrar la primera que parezca válida.',
  },
}

export function simpleQuestionHelp(type: CardType, language: StudyLanguage) {
  return helpByType[type][language]
}
