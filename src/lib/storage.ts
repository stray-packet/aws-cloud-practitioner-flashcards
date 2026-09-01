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
  mode: 'daily-review' | 'custom-study'
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

export function parseProgressJson(text: string): StudyStore {
  const parsed = JSON.parse(text) as Partial<StudyStore>
  if (!parsed || typeof parsed !== 'object' || !parsed.cards || !Array.isArray(parsed.reviewLogs) || !Array.isArray(parsed.examAttempts)) {
    throw new Error('This file is not a valid AWS Study progress backup.')
  }
  for (const card of Object.values(parsed.cards)) {
    if (!card || typeof card !== 'object' || typeof card.due !== 'string' || Number.isNaN(new Date(card.due).getTime())) {
      throw new Error('The backup contains an invalid scheduled card.')
    }
  }
  return {
    cards: parsed.cards,
    reviewLogs: parsed.reviewLogs,
    examAttempts: parsed.examAttempts,
    settings: { ...defaultSettings, ...parsed.settings },
  }
}

function emptyStore(): StudyStore {
  return { cards: {}, reviewLogs: [], examAttempts: [], settings: { ...defaultSettings } }
}
