import { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowLeft, Flag, Info, Shuffle } from 'lucide-react'
import serviceCatalogJson from '../data/service-catalog.json'
import { getIntervals, reviewCard, type RatingName } from '../lib/scheduler'
import { formatLearningWait, prioritizeReviewQueue, shouldRepeatInSession, type ReviewQueueEntry } from '../lib/reviewQueue'
import type { StudyStore } from '../lib/storage'

interface ServiceStudyCard {
  id: string
  name: string
  officialCategory: string
  groups: string[]
  scope: 'official' | 'supplementary'
  purpose: string
  hint: string
  examCue: string
  example: string
  icon: string
}

const services = serviceCatalogJson as ServiceStudyCard[]
const ratings: Array<{ key: string; name: RatingName; label: string }> = [
  { key: '1', name: 'again', label: 'Again' },
  { key: '2', name: 'hard', label: 'Hard' },
  { key: '3', name: 'good', label: 'Good' },
  { key: '4', name: 'easy', label: 'Easy' },
]

const shuffle = <T,>(items: T[]) => {
  const output = [...items]
  for (let index = output.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1))
    ;[output[index], output[swap]] = [output[swap], output[index]]
  }
  return output
}

interface ServicesViewProps {
  store: StudyStore
  onRate: (cardId: string, rating: RatingName, reviewedAt: Date) => void
  onToggleFlag: (serviceId: string) => void
  onReviewActiveChange: (active: boolean) => void
}

export function ServicesView({ store, onRate, onToggleFlag, onReviewActiveChange }: ServicesViewProps) {
  const [scope, setScope] = useState<'official' | 'all'>('official')
  const [group, setGroup] = useState('all')
  const [studySet, setStudySet] = useState<'all' | 'flagged'>('all')
  const [queue, setQueue] = useState<Array<ReviewQueueEntry<ServiceStudyCard>>>([])
  const [active, setActive] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [reviewedCount, setReviewedCount] = useState(0)
  const [uniqueCount, setUniqueCount] = useState(0)
  const [clock, setClock] = useState(() => Date.now())
  const groups = useMemo(() => [...new Set(services.flatMap((service) => service.groups))].sort(), [])
  const flaggedServiceIds = useMemo(() => new Set(store.flaggedServiceIds), [store.flaggedServiceIds])
  const flaggedServices = useMemo(() => services.filter((service) => flaggedServiceIds.has(service.id)), [flaggedServiceIds])
  const filtered = useMemo(() => services.filter((service) =>
    (scope === 'all' || service.scope === 'official')
    && (group === 'all' || service.groups.includes(group))
    && (studySet === 'all' || flaggedServiceIds.has(service.id)),
  ), [flaggedServiceIds, group, scope, studySet])
  const entry = queue[0]
  const waitingUntil = entry?.repetition && entry.availableAt && entry.availableAt > clock ? entry.availableAt : undefined
  const service = waitingUntil ? undefined : entry?.item
  const storageId = service ? `service:${service.id}` : ''
  const storedCard = service ? store.cards[storageId] : undefined
  const intervals = useMemo(() => service ? getIntervals(storedCard, store.settings.retention) : null, [service, store.settings.retention, storedCard])

  const beginReview = (items: ServiceStudyCard[]) => {
    const next = shuffle(items).map((item) => ({ item }))
    setQueue(next)
    setUniqueCount(next.length)
    setReviewedCount(0)
    setRevealed(false)
    setShowHint(false)
    setActive(true)
    onReviewActiveChange(true)
  }

  const start = () => beginReview(filtered)

  const startFlagged = () => {
    setScope('all')
    setGroup('all')
    setStudySet('flagged')
    beginReview(flaggedServices)
  }

  const leaveReview = () => {
    setActive(false)
    onReviewActiveChange(false)
  }

  const rate = useCallback((rating: RatingName) => {
    if (!service) return
    const reviewedAt = new Date()
    const result = reviewCard(storedCard, rating, store.settings.retention, reviewedAt)
    const dueAt = new Date(result.card.due).getTime()
    onRate(storageId, rating, reviewedAt)
    setQueue((current) => {
      const remaining = current.slice(1)
      if (shouldRepeatInSession(rating, dueAt, reviewedAt.getTime())) {
        remaining.push({ item: service, repetition: true, availableAt: dueAt })
      }
      return prioritizeReviewQueue(remaining, reviewedAt.getTime())
    })
    setReviewedCount((count) => count + 1)
    setClock(reviewedAt.getTime())
    setRevealed(false)
    setShowHint(false)
  }, [onRate, service, storageId, store.settings.retention, storedCard])

  useEffect(() => {
    if (!waitingUntil) return
    const timeout = window.setTimeout(() => {
      const current = Date.now()
      setClock(current)
      setQueue((pending) => prioritizeReviewQueue(pending, current))
    }, Math.min(1000, Math.max(0, waitingUntil - Date.now())))
    return () => window.clearTimeout(timeout)
  }, [waitingUntil])

  useEffect(() => {
    if (!active || !service) return
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (target?.isContentEditable || target?.closest('input, select, textarea, button')) return
      if (!revealed && (event.key === ' ' || event.key === 'Enter')) {
        event.preventDefault()
        setRevealed(true)
        return
      }
      if (revealed) {
        const selected = ratings.find((item) => item.key === event.key)
        if (selected) {
          event.preventDefault()
          rate(selected.name)
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [active, rate, revealed, service])

  if (active && waitingUntil) {
    return (
      <div className="finished-state waiting-state">
        <p className="section-kicker">Learning step scheduled</p>
        <h1>Next service in {formatLearningWait(waitingUntil - clock)}</h1>
        <p>The displayed interval is being respected. The service will appear automatically when it is due.</p>
        <button className="secondary-button" type="button" onClick={leaveReview}>Return to service categories</button>
      </div>
    )
  }

  if (active && !service) {
    return (
      <div className="finished-state">
        <div className="finished-mark">✓</div>
        <h1>Service review complete</h1>
        <p>You completed {reviewedCount} reviews across {uniqueCount} unique services.</p>
        <button className="primary-button" type="button" onClick={leaveReview}>Return to service categories</button>
      </div>
    )
  }

  if (active && service) {
    return (
      <div className="service-review-layout">
        <div className="service-review-meta"><button className="text-button" type="button" onClick={leaveReview}><ArrowLeft size={15} /> Categories</button><span>{studySet === 'flagged' ? 'Flagged services' : group === 'all' ? 'All service categories' : group} · randomized</span><div className="service-review-actions"><div className="queue-counts"><span className="new-count">{queue.length}</span><span className="review-count">{reviewedCount}</span></div></div></div>
        <section className="service-review-card" aria-live="polite">
          <div className="card-label"><span>{service.officialCategory}</span><span className="card-schedule-state">{entry.repetition ? 'Learning step' : service.scope === 'official' ? 'Official CLF-C02 scope' : 'Course supplementary'}</span></div>
          <div className="service-front">
            <img src={`${import.meta.env.BASE_URL}aws-icons/${service.icon}`} alt={`${service.name} official AWS architecture icon`} />
            <p className="eyebrow">Recognize the service</p>
            <h1>{service.name}</h1>
            <div className="service-card-actions"><button className="service-hint-button" type="button" aria-expanded={showHint} onClick={() => setShowHint((current) => !current)}><Info size={16} /> {showHint ? 'Hide hint' : 'Show hint'}</button><button className={`service-flag-toggle ${flaggedServiceIds.has(service.id) ? 'flagged' : ''}`} type="button" aria-pressed={flaggedServiceIds.has(service.id)} title={flaggedServiceIds.has(service.id) ? 'Remove service flag' : 'Flag service for focused review'} onClick={() => onToggleFlag(service.id)}><Flag size={15} fill={flaggedServiceIds.has(service.id) ? 'currentColor' : 'none'} /> {flaggedServiceIds.has(service.id) ? 'Flagged' : 'Flag'}</button></div>
            {showHint && <p className="service-hint">{service.hint}</p>}
          </div>
          {revealed && <div className="service-answer"><strong>What it does</strong><p>{service.purpose}</p><div className="service-example"><strong>Example:</strong> {service.example}</div><div className="exam-cue"><strong>Exam language:</strong> {service.examCue}</div></div>}
        </section>
        <footer className="service-review-footer">
          {!revealed ? <button className="show-answer" type="button" onClick={() => setRevealed(true)}>Show service meaning</button> : <div className="rating-buttons">{ratings.map((item) => <button className={`rating-button ${item.name}`} type="button" key={item.name} onClick={() => rate(item.name)}><span className="next-interval">{intervals?.[item.name]}</span><span>{item.label}</span><kbd>{item.key}</kbd></button>)}</div>}
        </footer>
      </div>
    )
  }

  return (
    <div className="content-page services-page">
      <header className="page-header compact"><div><p className="section-kicker">Visual recognition deck</p><h1>AWS services</h1><p>Official AWS icons, concise meanings, and the words most likely to identify each service on CLF-C02.</p></div></header>
      <section className="service-study-controls">
        <label><span>Coverage</span><select value={scope} onChange={(event) => setScope(event.target.value as 'official' | 'all')}><option value="official">Official CLF-C02 scope</option><option value="all">Official + course supplementary</option></select></label>
        <label><span>Study category</span><select value={group} onChange={(event) => setGroup(event.target.value)}><option value="all">All categories</option>{groups.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label><span>Study set</span><select value={studySet} onChange={(event) => setStudySet(event.target.value as 'all' | 'flagged')}><option value="all">All matching services</option><option value="flagged">Flagged services · {store.flaggedServiceIds.length}</option></select></label>
        <button className="primary-button" type="button" onClick={start} disabled={!filtered.length}><Shuffle size={16} /> Start random review · {filtered.length}</button>
      </section>
      {studySet === 'flagged' && !filtered.length && <p className="service-empty-state">No flagged services match these filters yet. Flag a service during a review, then return here to study it as often as you need.</p>}
      <section className="flagged-services-panel" aria-label="Flagged services">
        <div className="section-heading"><div><h2>Flagged services</h2><small>Services you want to revisit more often.</small></div>{flaggedServices.length > 0 && <button className="primary-button" type="button" onClick={startFlagged}><Shuffle size={14} /> Study all flagged · {flaggedServices.length}</button>}</div>
        {flaggedServices.length === 0 ? <p className="flagged-services-empty">No services are flagged yet. During a service flashcard, use Flag beside Show hint to add one here.</p> : <div className="flagged-services-list">{flaggedServices.map((item) => <div className="flagged-service-row" key={item.id}><img src={`${import.meta.env.BASE_URL}aws-icons/${item.icon}`} alt="" /><span><strong>{item.name}</strong><small>{item.officialCategory}</small></span><button className="service-flag-toggle flagged" type="button" onClick={() => onToggleFlag(item.id)}><Flag size={15} fill="currentColor" /> Remove</button></div>)}</div>}
      </section>
      <section className="service-category-list" aria-label="Service categories">
        <div className="section-heading"><h2>Categories</h2><span>Services can appear in more than one category</span></div>
        {groups.map((item) => {
          const count = services.filter((service) => (scope === 'all' || service.scope === 'official') && service.groups.includes(item) && (studySet === 'all' || flaggedServiceIds.has(service.id))).length
          return <button type="button" key={item} onClick={() => setGroup(item)}><span><strong>{item}</strong><small>{count} services</small></span><span>Study category</span></button>
        })}
      </section>
      <p className="service-source-note">Catalog aligned to the current AWS CLF-C02 in-scope service list. Supplementary entries preserve course topics that AWS currently lists outside the primary exam scope.</p>
    </div>
  )
}
