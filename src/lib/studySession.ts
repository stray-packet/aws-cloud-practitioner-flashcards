import type { CardDomain, Flashcard } from '../types/card'
import { isDue } from './scheduler'
import type { StudyStore } from './storage'

export type StudyOrder = 'scheduled' | 'random'

export interface StudySessionOptions {
  sourceChat: 'all' | string
  domain: 'all' | CardDomain
  topic: 'all' | string
  order: StudyOrder
}

export const defaultStudySession: StudySessionOptions = {
  sourceChat: 'all',
  domain: 'all',
  topic: 'all',
  order: 'scheduled',
}

export function filterStudyCards(cards: Flashcard[], options: StudySessionOptions) {
  return cards.filter((card) =>
    (options.sourceChat === 'all' || card.sourceChat === options.sourceChat)
    && (options.domain === 'all' || card.domain === options.domain)
    && (options.topic === 'all' || card.topics.includes(options.topic)),
  )
}

export function buildStudyQueue(
  cards: Flashcard[],
  store: StudyStore,
  options: StudySessionOptions,
  now = new Date(),
  random = Math.random,
) {
  const scoped = filterStudyCards(cards, options)
  const reviews = scoped.filter((card) => store.cards[card.id] && isDue(store.cards[card.id], now))
  const newCards = scoped.filter((card) => !store.cards[card.id]).slice(0, store.settings.newCardsPerDay)
  const queue = [...reviews, ...newCards]
  return options.order === 'random' ? shuffle(queue, random) : queue
}

function shuffle<T>(items: T[], random: () => number) {
  const shuffled = [...items]
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    ;[shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]]
  }
  return shuffled
}
