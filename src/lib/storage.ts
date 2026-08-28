import type { StoredFsrsCard, RatingName } from './scheduler'

export type ThemePreference = 'system' | 'light' | 'dark'

export interface StudySettings {
  retention: number
  newCardsPerDay: number
  theme: ThemePreference
}

export interface ReviewEvent {
  id: string
  cardId: string
  rating: RatingName
  reviewedAt: string
  mode: 'daily-review'
}

export interface ExamAttempt {
  cardId: string
  correct: boolean
  answeredAt: string
}

export interface StudyStore {
  cards: Record<string, StoredFsrsCard>
  reviewLogs: ReviewEvent[]
  examAttempts: ExamAttempt[]
  settings: StudySettings
}

const STORAGE_KEY = 'aws-study-progress-v1'
export const defaultSettings: StudySettings = { retention: 0.9, newCardsPerDay: 10, theme: 'system' }

export function loadStore(): StudyStore {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return emptyStore()
    const parsed = JSON.parse(saved) as Partial<StudyStore>
    return {
      cards: parsed.cards ?? {},
      reviewLogs: parsed.reviewLogs ?? [],
      examAttempts: parsed.examAttempts ?? [],
      settings: { ...defaultSettings, ...parsed.settings },
    }
  } catch {
    return emptyStore()
  }
}

export function saveStore(store: StudyStore) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
}

export function exportProgress(store: StudyStore) {
  const blob = new Blob([JSON.stringify(store, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `aws-study-progress-${new Date().toISOString().slice(0, 10)}.json`
  anchor.click()
  URL.revokeObjectURL(url)
}

function emptyStore(): StudyStore {
  return { cards: {}, reviewLogs: [], examAttempts: [], settings: { ...defaultSettings } }
}
