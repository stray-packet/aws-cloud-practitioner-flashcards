import type { RatingName } from './scheduler'

export interface ReviewQueueEntry<T> {
  item: T
  availableAt?: number
  repetition?: boolean
}

export function prioritizeReviewQueue<T>(entries: ReviewQueueEntry<T>[], now = Date.now()) {
  const readyRepetitions = entries.filter((entry) => entry.repetition && (entry.availableAt ?? 0) <= now)
  const fresh = entries.filter((entry) => !entry.repetition)
  const waitingRepetitions = entries
    .filter((entry) => entry.repetition && (entry.availableAt ?? 0) > now)
    .sort((a, b) => (a.availableAt ?? 0) - (b.availableAt ?? 0))
  return [...readyRepetitions, ...fresh, ...waitingRepetitions]
}

export function shouldRepeatInSession(rating: RatingName, dueAt: number, reviewedAt: number) {
  if (rating === 'easy') return false
  const delay = dueAt - reviewedAt
  return delay > 0 && delay <= 30 * 60 * 1000
}

export function formatLearningWait(milliseconds: number) {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = String(totalSeconds % 60).padStart(2, '0')
  return `${minutes}:${seconds}`
}
