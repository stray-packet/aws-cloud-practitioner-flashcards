import { ChevronRight } from 'lucide-react'
import type { Flashcard, CardDomain } from '../types/card'
import type { StudyStore } from '../lib/storage'
import { isDue } from '../lib/scheduler'
import type { ViewName } from './Layout'

const domains: Array<{ name: CardDomain; weight: number }> = [
  { name: 'Cloud Concepts', weight: 24 },
  { name: 'Security and Compliance', weight: 30 },
  { name: 'Cloud Technology and Services', weight: 34 },
  { name: 'Billing, Pricing, and Support', weight: 12 },
]

interface OverviewProps {
  cards: Flashcard[]
  store: StudyStore
  onNavigate: (view: ViewName) => void
}

export function Overview({ cards, store, onNavigate }: OverviewProps) {
  const todayLabel = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date())
  const newCount = cards.filter((card) => !store.cards[card.id]).length
  const reviewCount = cards.filter((card) => store.cards[card.id] && isDue(store.cards[card.id])).length
  const learningCount = cards.filter((card) => store.cards[card.id] && store.cards[card.id].reps < 3).length
  const dueTotal = Math.min(newCount, store.settings.newCardsPerDay) + reviewCount

  return (
    <div className="content-page overview-page">
      <header className="page-header compact">
        <div>
          <p className="section-kicker">{todayLabel}</p>
          <h1>Decks</h1>
        </div>
        <button className="secondary-button" type="button" onClick={() => onNavigate('exam')}>Exam Practice</button>
      </header>

      <section className="deck-table" aria-label="Study decks">
        <div className="deck-table-head">
          <span>Deck</span><span className="new-count">New</span><span className="learn-count">Learn</span><span className="review-count">Due</span>
        </div>
        <button className="deck-row" type="button" onClick={() => onNavigate('study')}>
          <span className="deck-name"><strong>AWS Cloud Practitioner</strong><small>CLF-C02 · {cards.length} approved cards</small></span>
          <span className="new-count">{newCount}</span>
          <span className="learn-count">{learningCount}</span>
          <span className="review-count">{reviewCount}</span>
          <ChevronRight size={18} aria-hidden="true" />
        </button>
      </section>

      <section className="study-overview">
        <div>
          <h2>{dueTotal ? `${dueTotal} cards available today` : 'You are finished for today'}</h2>
          <p>Reviews are shown before new material. New-card limit: {store.settings.newCardsPerDay}.</p>
        </div>
        <button className="primary-button" type="button" onClick={() => onNavigate('study')} disabled={!dueTotal}>Study Now</button>
      </section>

      <section className="coverage-section">
        <div className="section-heading"><h2>CLF-C02 coverage</h2><span>Exam weight</span></div>
        <div className="coverage-list">
          {domains.map((domain) => {
            const count = cards.filter((card) => card.domain === domain.name).length
            const share = cards.length ? Math.round((count / cards.length) * 100) : 0
            return (
              <div className="coverage-row" key={domain.name}>
                <div className="coverage-label"><span>{domain.name}</span><small>{count} cards · target {domain.weight}%</small></div>
                <div className="coverage-track"><span style={{ width: `${share}%` }} /></div>
                <strong>{share}%</strong>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
