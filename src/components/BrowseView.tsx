import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { Flashcard } from '../types/card'

export function BrowseView({ cards }: { cards: Flashcard[] }) {
  const [query, setQuery] = useState('')
  const [domain, setDomain] = useState('All domains')
  const [sourceChat, setSourceChat] = useState('All chats')
  const [topic, setTopic] = useState('All topics')
  const [collection, setCollection] = useState('All collections')
  const [selected, setSelected] = useState(cards[0]?.id)
  const domains = ['All domains', ...new Set(cards.map((card) => card.domain))]
  const sourceChats = ['All chats', ...[...new Set(cards.map((card) => card.sourceChat))].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))]
  const topics = ['All topics', ...[...new Set(cards.flatMap((card) => card.topics))].sort()]
  const filtered = useMemo(() => cards.filter((card) => {
    const haystack = `${card.prompt} ${card.answer} ${card.topics.join(' ')} ${card.services.join(' ')} ${card.sourceChat}`.toLowerCase()
    return (collection === 'All collections' || card.collection === collection)
      && (domain === 'All domains' || card.domain === domain)
      && (sourceChat === 'All chats' || card.sourceChat === sourceChat)
      && (topic === 'All topics' || card.topics.includes(topic))
      && haystack.includes(query.toLowerCase())
  }), [cards, collection, domain, query, sourceChat, topic])
  const current = filtered.find((card) => card.id === selected) ?? filtered[0]

  return (
    <div className="browser-layout">
      <aside className="browser-list">
        <div className="browser-toolbar"><label className="search-field"><Search size={15} /><input aria-label="Search cards" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search cards" /></label><select aria-label="Filter by collection" value={collection} onChange={(event) => setCollection(event.target.value)}><option>All collections</option><option value="studied">Studied chats</option><option value="extra">Extra · official coverage</option></select><select aria-label="Filter by domain" value={domain} onChange={(event) => setDomain(event.target.value)}>{domains.map((item) => <option key={item}>{item}</option>)}</select><select aria-label="Filter by chat" value={sourceChat} onChange={(event) => setSourceChat(event.target.value)}>{sourceChats.map((item) => <option key={item}>{item}</option>)}</select><select aria-label="Filter by topic" value={topic} onChange={(event) => setTopic(event.target.value)}>{topics.map((item) => <option key={item}>{item}</option>)}</select></div>
        <div className="browser-count">{filtered.length} {filtered.length === 1 ? 'card' : 'cards'}</div>
        <div className="card-list">{filtered.map((card) => <button className={card.id === current?.id ? 'active' : ''} type="button" key={card.id} onClick={() => setSelected(card.id)}><span>{card.prompt}</span><small>{card.domain} · {card.studyDate}</small></button>)}</div>
      </aside>
      <section className="browser-detail">
        {current ? <><div className="detail-meta"><span>{current.id}</span><span>{current.type}</span></div><div className="field-group"><label>Front</label><p>{current.prompt}</p></div><div className="field-group"><label>Back</label><p className="detail-answer">{current.answer}</p><p>{current.explanation}</p>{current.example && <p><strong>Example:</strong> {current.example}</p>}</div><div className="tag-list">{[current.certification, current.domain, ...current.topics, ...current.services].map((tag) => <span key={tag}>{tag}</span>)}</div><div className="detail-source">{current.sourceRef}</div></> : <p>No cards match these filters.</p>}
      </section>
    </div>
  )
}
