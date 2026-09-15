import { reviewCard, type RatingName } from './scheduler'
import type { ReviewEvent, StudyStore } from './storage'
import type { StudyMode } from './studySession'

export function applyReviewToStore(
  store: StudyStore,
  cardId: string,
  rating: RatingName,
  mode: StudyMode,
  reviewedAt = new Date(),
  eventId: string = crypto.randomUUID(),
) {
  const result = reviewCard(store.cards[cardId], rating, store.settings.retention, reviewedAt)
  const event: ReviewEvent = {
    id: eventId,
    cardId,
    rating,
    reviewedAt: reviewedAt.toISOString(),
    mode: mode === 'daily' ? 'daily-review' : 'custom-study',
  }
  return {
    card: result.card,
    event,
    store: {
      ...store,
      cards: { ...store.cards, [cardId]: result.card },
      reviewLogs: [...store.reviewLogs, event],
    },
  }
}
