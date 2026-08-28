import type { Flashcard, CardDomain } from '../types/card'
import type { StudyStore } from '../lib/storage'

export function StatsView({ cards, store }: { cards: Flashcard[]; store: StudyStore }) {
  const reviewed = store.reviewLogs.length
  const passed = store.reviewLogs.filter((log) => log.rating !== 'again').length
  const retention = reviewed ? Math.round((passed / reviewed) * 100) : 0
  const domains = [...new Set(cards.map((card) => card.domain))] as CardDomain[]

  return (
    <div className="content-page stats-page">
      <header className="page-header compact"><div><p className="section-kicker">AWS Cloud Practitioner</p><h1>Statistics</h1></div></header>
      <section className="stat-summary"><div><span>Reviews</span><strong>{reviewed}</strong></div><div><span>True retention</span><strong>{reviewed ? `${retention}%` : '—'}</strong></div><div><span>Cards learned</span><strong>{Object.keys(store.cards).length}</strong></div><div><span>Exam questions</span><strong>{store.examAttempts.length}</strong></div></section>
      <section className="stats-section"><h2>Answer buttons</h2><div className="answer-table">{(['again', 'hard', 'good', 'easy'] as const).map((rating) => { const count = store.reviewLogs.filter((log) => log.rating === rating).length; const width = reviewed ? (count / reviewed) * 100 : 0; return <div className="answer-row" key={rating}><span>{rating[0].toUpperCase() + rating.slice(1)}</span><div><i className={rating} style={{ width: `${width}%` }} /></div><strong>{count}</strong></div> })}</div></section>
      <section className="stats-section"><h2>Cards by domain</h2><div className="answer-table">{domains.map((domain) => { const count = cards.filter((card) => card.domain === domain).length; return <div className="answer-row" key={domain}><span>{domain}</span><div><i style={{ width: `${(count / cards.length) * 100}%` }} /></div><strong>{count}</strong></div> })}</div></section>
    </div>
  )
}
