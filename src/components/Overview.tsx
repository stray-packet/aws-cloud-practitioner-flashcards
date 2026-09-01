import { useMemo, useState } from 'react'
import { ChevronRight, Shuffle } from 'lucide-react'
import type { Flashcard, CardDomain } from '../types/card'
import type { StudyStore } from '../lib/storage'
import { isDue } from '../lib/scheduler'
import { filterStudyCards, type StudyOrder, type StudySessionOptions } from '../lib/studySession'
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
  onStartStudy: (options: StudySessionOptions) => void
}

export function Overview({ cards, store, onNavigate, onStartStudy }: OverviewProps) {
  const [sourceChat, setSourceChat] = useState('all')
  const [domain, setDomain] = useState<'all' | CardDomain>('all')
  const [topic, setTopic] = useState('all')
  const [order, setOrder] = useState<StudyOrder>('scheduled')
  const options = useMemo<StudySessionOptions>(() => ({ sourceChat, domain, topic, order }), [domain, order, sourceChat, topic])
  const scopedCards = useMemo(() => filterStudyCards(cards, options), [cards, options])
  const sourceChats = useMemo(() => [...new Set(cards.map((card) => card.sourceChat))], [cards])
  const topics = useMemo(() => [...new Set(cards.filter((card) =>
    (sourceChat === 'all' || card.sourceChat === sourceChat)
    && (domain === 'all' || card.domain === domain),
  ).flatMap((card) => card.topics))].sort(), [cards, domain, sourceChat])
  const todayLabel = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date())
  const newCount = cards.filter((card) => !store.cards[card.id]).length
  const reviewCount = cards.filter((card) => store.cards[card.id] && isDue(store.cards[card.id])).length
  const learningCount = cards.filter((card) => store.cards[card.id] && store.cards[card.id].reps < 3).length
  const dueTotal = Math.min(newCount, store.settings.newCardsPerDay) + reviewCount
  const scopedNew = scopedCards.filter((card) => !store.cards[card.id]).length
  const scopedReviews = scopedCards.filter((card) => store.cards[card.id] && isDue(store.cards[card.id])).length
  const scopedAvailable = Math.min(scopedNew, store.settings.newCardsPerDay) + scopedReviews

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

      <section className="custom-study-section" aria-labelledby="custom-study-title">
        <div className="section-heading">
          <div><h2 id="custom-study-title">Custom study</h2><p>Choose a Gemini chat, exam domain, and card order.</p></div>
          <span>{scopedCards.length} matching cards</span>
        </div>
        <div className="study-options">
          <label><span>Chat / study day</span><select aria-label="Chat or study day" value={sourceChat} onChange={(event) => { setSourceChat(event.target.value); setTopic('all') }}><option value="all">All chats</option>{sourceChats.map((chat) => <option value={chat} key={chat}>{chat}</option>)}</select></label>
          <label><span>Exam domain</span><select aria-label="Exam domain" value={domain} onChange={(event) => { setDomain(event.target.value as 'all' | CardDomain); setTopic('all') }}><option value="all">All exam domains</option>{domains.map((item) => <option value={item.name} key={item.name}>{item.name}</option>)}</select></label>
          <label><span>Topic</span><select aria-label="Card topic" value={topic} onChange={(event) => setTopic(event.target.value)}><option value="all">All topics</option>{topics.map((item) => <option value={item} key={item}>{item}</option>)}</select></label>
          <label><span>Order</span><select aria-label="Card order" value={order} onChange={(event) => setOrder(event.target.value as StudyOrder)}><option value="scheduled">Scheduled: reviews first</option><option value="random">Randomized</option></select></label>
          <button className="primary-button custom-study-button" type="button" onClick={() => onStartStudy(options)} disabled={!scopedAvailable}>{order === 'random' && <Shuffle size={15} aria-hidden="true" />}Start {scopedAvailable}-card session</button>
        </div>
        <p className="scheduler-note"><strong>After revealing an answer:</strong> Again, Hard, Good, and Easy show the next interval before you choose it. New cards use short learning steps such as 1m and 10m; later intervals adapt with FSRS.</p>
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
