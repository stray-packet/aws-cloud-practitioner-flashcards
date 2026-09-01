import { describe, expect, it } from 'vitest'
import type { Flashcard } from '../types/card'
import type { StudyStore } from './storage'
import { buildStudyQueue, filterStudyCards, type StudySessionOptions } from './studySession'

const makeCard = (id: string, sourceChat: string, domain: Flashcard['domain']): Flashcard => ({
  id: `clf-c02-2026-09-01-${id.padStart(3, '0')}`,
  certification: 'CLF-C02',
  studyDate: '2026-09-01',
  sourceChat,
  domain,
  topics: ['Test'],
  services: [],
  type: 'recall',
  prompt: `Question number ${id}`,
  answer: 'Answer',
  explanation: 'Test explanation.',
  sourceRef: 'test',
  difficulty: 1,
  status: 'approved',
  version: 1,
})

const cards = [
  makeCard('1', 'Chat A', 'Cloud Concepts'),
  makeCard('2', 'Chat B', 'Cloud Concepts'),
  makeCard('3', 'Chat A', 'Security and Compliance'),
]

const store: StudyStore = {
  cards: {},
  reviewLogs: [],
  examAttempts: [],
  settings: { retention: 0.9, newCardsPerDay: 20, theme: 'system' },
}

describe('study session selection', () => {
  it('filters by chat and exam domain', () => {
    const options: StudySessionOptions = { sourceChat: 'Chat A', domain: 'Cloud Concepts', topic: 'Test', order: 'scheduled' }
    expect(filterStudyCards(cards, options).map((card) => card.id)).toEqual(['clf-c02-2026-09-01-001'])
  })

  it('randomizes the eligible queue with an injectable random source', () => {
    const options: StudySessionOptions = { sourceChat: 'all', domain: 'all', topic: 'all', order: 'random' }
    const queue = buildStudyQueue(cards, store, options, new Date('2026-09-01T12:00:00Z'), () => 0)
    expect(queue.map((card) => card.id)).toEqual([
      'clf-c02-2026-09-01-002',
      'clf-c02-2026-09-01-003',
      'clf-c02-2026-09-01-001',
    ])
  })
})
