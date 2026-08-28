import { createEmptyCard, fsrs, Rating, type Card } from 'ts-fsrs'

export type StoredFsrsCard = Omit<Card, 'due' | 'last_review'> & {
  due: string
  last_review?: string
}

const ratingMap = {
  again: Rating.Again,
  hard: Rating.Hard,
  good: Rating.Good,
  easy: Rating.Easy,
} as const

export type RatingName = keyof typeof ratingMap

const schedulerFor = (retention: number) => fsrs({
  request_retention: retention,
  maximum_interval: 36500,
  enable_fuzz: true,
  enable_short_term: true,
  learning_steps: ['1m', '10m'],
  relearning_steps: ['10m'],
})

export function deserializeCard(stored?: StoredFsrsCard): Card {
  if (!stored) return createEmptyCard()
  return {
    ...stored,
    due: new Date(stored.due),
    last_review: stored.last_review ? new Date(stored.last_review) : undefined,
  }
}

export function serializeCard(card: Card): StoredFsrsCard {
  return {
    ...card,
    due: card.due.toISOString(),
    last_review: card.last_review?.toISOString(),
  }
}

export function getIntervals(stored: StoredFsrsCard | undefined, retention: number, now = new Date()) {
  const preview = schedulerFor(retention).repeat(deserializeCard(stored), now)
  return {
    again: formatInterval(preview[Rating.Again].card.due.getTime() - now.getTime()),
    hard: formatInterval(preview[Rating.Hard].card.due.getTime() - now.getTime()),
    good: formatInterval(preview[Rating.Good].card.due.getTime() - now.getTime()),
    easy: formatInterval(preview[Rating.Easy].card.due.getTime() - now.getTime()),
  }
}

export function reviewCard(stored: StoredFsrsCard | undefined, rating: RatingName, retention: number, now = new Date()) {
  const result = schedulerFor(retention).next(deserializeCard(stored), now, ratingMap[rating])
  return { card: serializeCard(result.card), log: result.log }
}

export function isDue(stored: StoredFsrsCard | undefined, now = new Date()) {
  return !stored || new Date(stored.due).getTime() <= now.getTime()
}

function formatInterval(milliseconds: number) {
  const minutes = Math.max(1, Math.round(milliseconds / 60000))
  if (minutes < 60) return `${minutes}m`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.round(hours / 24)
  if (days < 30) return `${days}d`
  const months = Math.round(days / 30)
  if (months < 12) return `${months}mo`
  return `${Math.round(months / 12)}y`
}
