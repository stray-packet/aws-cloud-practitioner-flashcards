import { useMemo, useState } from 'react'
import { ChevronRight, Shuffle } from 'lucide-react'
import type { Flashcard, CardDomain } from '../types/card'
import type { StudyStore } from '../lib/storage'
import { filterStudyCards, getDailyStudySummary, type SessionSize, type StudyOrder, type StudySessionOptions } from '../lib/studySession'
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
  const [size, setSize] = useState<SessionSize>('all')
  const options = useMemo<StudySessionOptions>(() => ({ mode: 'custom', sourceChat, domain, topic, order, size }), [domain, order, size, sourceChat, topic])
  const scopedCards = useMemo(() => filterStudyCards(cards, options), [cards, options])
  const sourceChats = useMemo(() => [...new Set(cards.map((card) => card.sourceChat))].sort(), [cards])
  const topics = useMemo(() => [...new Set(cards.filter((card) =>
    (sourceChat === 'all' || card.sourceChat === sourceChat)
    && (domain === 'all' || card.domain === domain),
  ).flatMap((card) => card.topics))].sort(), [cards, domain, sourceChat])
  const todayLabel = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date())
  const newCount = cards.filter((card) => !store.cards[card.id]).length
  const daily = getDailyStudySummary(cards, store)
  const reviewCount = daily.due
  const learningCount = cards.filter((card) => store.cards[card.id] && store.cards[card.id].reps < 3).length
  const sessionCount = size === 'all' ? scopedCards.length : Math.min(size, scopedCards.length)

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
          <h2>{daily.available ? `${daily.available} cards ready in Daily Review` : 'Daily Review is finished for now'}</h2>
          <p>{daily.due} due · {daily.remainingNew} new remaining today · {daily.introducedToday}/{store.settings.newCardsPerDay} new-card allowance used.</p>
        </div>
        <button className="primary-button" type="button" onClick={() => onNavigate('study')} disabled={!daily.available}>Start Daily Review</button>
      </section>

      <section className="custom-study-section" aria-labelledby="custom-study-title">
        <div className="section-heading">
          <div><h2 id="custom-study-title">Custom study</h2><p>Study beyond the daily limit by chat, domain, or topic.</p></div>
          <span>{scopedCards.length} matching {scopedCards.length === 1 ? 'card' : 'cards'}</span>
        </div>
        <div className="study-options">
          <label><span>Source chat</span><select aria-label="Source chat" value={sourceChat} onChange={(event) => { setSourceChat(event.target.value); setTopic('all') }}><option value="all">All chats</option>{sourceChats.map((chat) => <option value={chat} key={chat}>{chat}</option>)}</select></label>
          <label><span>Exam domain</span><select aria-label="Exam domain" value={domain} onChange={(event) => { setDomain(event.target.value as 'all' | CardDomain); setTopic('all') }}><option value="all">All exam domains</option>{domains.map((item) => <option value={item.name} key={item.name}>{item.name}</option>)}</select></label>
          <label><span>Topic</span><select aria-label="Card topic" value={topic} onChange={(event) => setTopic(event.target.value)}><option value="all">All topics</option>{topics.map((item) => <option value={item} key={item}>{item}</option>)}</select></label>
          <label><span>Order</span><select aria-label="Card order" value={order} onChange={(event) => setOrder(event.target.value as StudyOrder)}><option value="scheduled">Scheduled: reviews first</option><option value="random">Randomized</option></select></label>
          <label><span>Session size</span><select aria-label="Session size" value={size} onChange={(event) => setSize(event.target.value === 'all' ? 'all' : Number(event.target.value) as SessionSize)}><option value="all">All matching</option><option value="10">10 cards</option><option value="20">20 cards</option><option value="50">50 cards</option></select></label>
          <button className="primary-button custom-study-button" type="button" onClick={() => onStartStudy(options)} disabled={!sessionCount}>{order === 'random' && <Shuffle size={15} aria-hidden="true" />}{size === 'all' ? `Study all ${sessionCount}` : `Start ${sessionCount}-card session`}</button>
        </div>
        <p className="scheduler-note"><strong>How sessions work:</strong> a limited session stops after the selected number, then you can start the next batch. “All matching” includes every filtered card, even if it is not due. Your ratings update FSRS, so Again/Hard cards can reappear when their displayed interval becomes due.</p>
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
