import type { CardDomain, Flashcard } from '../types/card'
import { isDue } from './scheduler'
import type { StudyStore } from './storage'

export type StudyOrder = 'scheduled' | 'random'
export type StudyMode = 'daily' | 'custom'
export type SessionSize = 10 | 20 | 50 | 'all'

export interface StudySessionOptions {
  mode: StudyMode
  sourceChat: 'all' | string
  domain: 'all' | CardDomain
  topic: 'all' | string
  order: StudyOrder
  size: SessionSize
}

export const defaultStudySession: StudySessionOptions = {
  mode: 'daily',
  sourceChat: 'all',
  domain: 'all',
  topic: 'all',
  order: 'scheduled',
  size: 10,
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
  const newCards = scoped.filter((card) => !store.cards[card.id])

  if (options.mode === 'daily') {
    const remainingNew = getDailyStudySummary(cards, store, now).remainingNew
    return [...reviews, ...newCards.slice(0, remainingNew)]
  }

  const futureReviews = scoped.filter((card) => store.cards[card.id] && !isDue(store.cards[card.id], now))
  const eligible = [...reviews, ...newCards, ...futureReviews]
  const ordered = options.order === 'random' ? shuffle(eligible, random) : eligible
  return options.size === 'all' ? ordered : ordered.slice(0, options.size)
}

export function getDailyStudySummary(cards: Flashcard[], store: StudyStore, now = new Date()) {
  const due = cards.filter((card) => store.cards[card.id] && isDue(store.cards[card.id], now)).length
  const unseen = cards.filter((card) => !store.cards[card.id]).length
  const introducedToday = countCardsIntroducedOn(store, now)
  const remainingNew = Math.min(unseen, Math.max(0, store.settings.newCardsPerDay - introducedToday))
  return { due, unseen, introducedToday, remainingNew, available: due + remainingNew }
}

export function countCardsIntroducedOn(store: StudyStore, day: Date) {
  const target = localDayKey(day)
  const firstReviewByCard = new Map<string, Date>()
  for (const review of store.reviewLogs) {
    const reviewedAt = new Date(review.reviewedAt)
    const current = firstReviewByCard.get(review.cardId)
    if (!current || reviewedAt < current) firstReviewByCard.set(review.cardId, reviewedAt)
  }
  return [...firstReviewByCard.values()].filter((date) => localDayKey(date) === target).length
}

function localDayKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function shuffle<T>(items: T[], random: () => number) {
  const shuffled = [...items]
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    ;[shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]]
  }
  return shuffled
}
