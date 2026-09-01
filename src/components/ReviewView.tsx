import { useEffect, useState } from 'react'
import { MoreHorizontal, Pencil, RotateCcw } from 'lucide-react'
import type { Flashcard } from '../types/card'
import type { StudyStore } from '../lib/storage'
import { getIntervals, isDue, type RatingName } from '../lib/scheduler'
import { buildStudyQueue, filterStudyCards, type StudySessionOptions } from '../lib/studySession'

const ratings: Array<{ key: string; name: RatingName; label: string }> = [
  { key: '1', name: 'again', label: 'Again' },
  { key: '2', name: 'hard', label: 'Hard' },
  { key: '3', name: 'good', label: 'Good' },
  { key: '4', name: 'easy', label: 'Easy' },
]

interface ReviewViewProps {
  cards: Flashcard[]
  store: StudyStore
  options: StudySessionOptions
  onRate: (card: Flashcard, rating: RatingName) => void
  onFinished: () => void
}

export function ReviewView({ cards, store, options, onRate, onFinished }: ReviewViewProps) {
  const [queue] = useState(() => buildStudyQueue(cards, store, options))
  const [index, setIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const card = queue[index]
  const intervals = card ? getIntervals(store.cards[card.id], store.settings.retention) : null
  const matchingCount = filterStudyCards(cards, options).length

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!card) return
      if ((event.key === ' ' || event.key === 'Enter') && !revealed) {
        event.preventDefault(); setRevealed(true); return
      }
      if (revealed && ['1', '2', '3', '4'].includes(event.key)) {
        const rating = ratings[Number(event.key) - 1].name
        onRate(card, rating)
        setRevealed(false)
        setIndex((current) => current + 1)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [card, onRate, revealed])

  if (!card) {
    return (
      <div className="finished-state">
        <div className="finished-mark">✓</div>
        <h1>Session complete</h1>
        <p>You reviewed {queue.length} {queue.length === 1 ? 'card' : 'cards'}.</p>
        {options.mode === 'custom' && matchingCount > queue.length && <p className="finished-detail">{matchingCount - queue.length} matching cards were outside this batch. Start another session whenever you are ready.</p>}
        {options.mode === 'custom' && matchingCount === queue.length && <p className="finished-detail">You reached every card matching these filters.</p>}
        {options.mode === 'daily' && <p className="finished-detail">The new-card allowance is shared across the whole day. Cards rated Again or Hard can return when their displayed interval becomes due.</p>}
        <button className="primary-button" type="button" onClick={onFinished}>Return to Decks</button>
      </div>
    )
  }

  const rate = (rating: RatingName) => {
    onRate(card, rating)
    setRevealed(false)
    setIndex((current) => current + 1)
  }

  return (
    <div className="review-layout">
      <div className="review-meta">
        <span>{options.mode === 'daily' ? 'Daily Review' : 'Custom Study'} · {options.sourceChat === 'all' ? 'All chats' : options.sourceChat} · {options.domain === 'all' ? 'All domains' : options.domain}{options.topic === 'all' ? '' : ` · ${options.topic}`}{options.order === 'random' ? ' · Randomized' : ''}</span>
        <div className="queue-counts" aria-label="Cards remaining"><span className="new-count">{queue.length - index}</span><span className="review-count">{index}</span></div>
      </div>
      <section className="review-card" aria-live="polite">
        <div className="card-label"><span>{card.domain} · {card.topics[0]}</span><span className="card-schedule-state">{!store.cards[card.id] ? 'New' : isDue(store.cards[card.id]) ? 'Due review' : 'Scheduled practice'}</span></div>
        <div className="question-block"><p className="eyebrow">{card.type.replace('-', ' ')}</p><h1>{card.prompt}</h1></div>
        {revealed && (
          <div className="answer-block">
            <p className="answer-title">{card.answer}</p>
            <p>{card.explanation}</p>
            {card.examCue && <div className="exam-cue"><strong>Exam cue:</strong> {card.examCue}</div>}
            <div className="source-ref">Source: {card.sourceRef}</div>
          </div>
        )}
      </section>
      <footer className="review-footer">
        <div className="footer-actions"><button className="utility-button" type="button"><Pencil size={16} /> Edit</button><button className="utility-button" type="button"><RotateCcw size={16} /> Undo</button></div>
        {!revealed ? (
          <button className="show-answer" type="button" onClick={() => setRevealed(true)}>Show Answer <kbd>Space</kbd></button>
        ) : (
          <div className="rating-buttons" aria-label="Rate recall">
            {ratings.map((item) => <button className={`rating-button ${item.name}`} type="button" key={item.name} onClick={() => rate(item.name)}><span className="next-interval">{intervals?.[item.name]}</span><span>{item.label}</span><kbd>{item.key}</kbd></button>)}
          </div>
        )}
        <button className="utility-button more-button" type="button"><MoreHorizontal size={18} /> More</button>
      </footer>
    </div>
  )
}
