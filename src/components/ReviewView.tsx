import { useEffect, useMemo, useState } from 'react'
import { Info, MoreHorizontal, Pencil, RotateCcw } from 'lucide-react'
import type { Flashcard } from '../types/card'
import type { StudyStore } from '../lib/storage'
import { getIntervals, isDue, type RatingName } from '../lib/scheduler'
import { buildStudyQueue, filterStudyCards, type StudySessionOptions } from '../lib/studySession'
import { loadSpanishTranslations, simpleQuestionHelp, type StudyLanguage } from '../lib/cardLanguage'
import type { CardTranslation } from '../types/translation'

const ratings: Array<{ key: string; name: RatingName }> = [
  { key: '1', name: 'again' },
  { key: '2', name: 'hard' },
  { key: '3', name: 'good' },
  { key: '4', name: 'easy' },
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
  const [language, setLanguage] = useState<StudyLanguage>('en')
  const [spanishTranslations, setSpanishTranslations] = useState<Map<string, CardTranslation>>()
  const [showSimpleHelp, setShowSimpleHelp] = useState(false)
  const card = queue[index]
  const storedCard = card ? store.cards[card.id] : undefined
  const intervals = useMemo(() => card ? getIntervals(storedCard, store.settings.retention) : null, [card, storedCard, store.settings.retention])
  const matchingCount = filterStudyCards(cards, options).length
  const translation = card ? spanishTranslations?.get(card.id) : undefined
  const content = language === 'es' && translation ? translation : card
  const spanish = language === 'es'
  const ratingLabels: Record<RatingName, string> = spanish
    ? { again: 'Otra vez', hard: 'Difícil', good: 'Bien', easy: 'Fácil' }
    : { again: 'Again', hard: 'Hard', good: 'Good', easy: 'Easy' }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!card) return
      if ((event.target as HTMLElement | null)?.closest('button, input, select, textarea')) return
      if ((event.key === ' ' || event.key === 'Enter') && !revealed) {
        event.preventDefault(); setRevealed(true); return
      }
      if (revealed && ['1', '2', '3', '4'].includes(event.key)) {
        const rating = ratings[Number(event.key) - 1].name
        onRate(card, rating)
        setRevealed(false)
        setShowSimpleHelp(false)
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
        <h1>{spanish ? 'Sesión completada' : 'Session complete'}</h1>
        <p>{spanish ? `Repasaste ${queue.length} ${queue.length === 1 ? 'tarjeta' : 'tarjetas'}.` : `You reviewed ${queue.length} ${queue.length === 1 ? 'card' : 'cards'}.`}</p>
        {options.mode === 'custom' && matchingCount > queue.length && <p className="finished-detail">{spanish ? `${matchingCount - queue.length} tarjetas coincidentes quedaron fuera de este lote. Puedes iniciar otra sesión cuando quieras.` : `${matchingCount - queue.length} matching cards were outside this batch. Start another session whenever you are ready.`}</p>}
        {options.mode === 'custom' && matchingCount === queue.length && <p className="finished-detail">{spanish ? 'Llegaste a todas las tarjetas que coinciden con estos filtros.' : 'You reached every card matching these filters.'}</p>}
        {options.mode === 'daily' && <p className="finished-detail">{spanish ? 'El límite de tarjetas nuevas se comparte durante todo el día. Las tarjetas marcadas Otra vez o Difícil volverán cuando llegue su intervalo.' : 'The new-card allowance is shared across the whole day. Cards rated Again or Hard can return when their displayed interval becomes due.'}</p>}
        <button className="primary-button" type="button" onClick={onFinished}>{spanish ? 'Volver a los mazos' : 'Return to Decks'}</button>
      </div>
    )
  }

  const rate = (rating: RatingName) => {
    onRate(card, rating)
    setRevealed(false)
    setShowSimpleHelp(false)
    setIndex((current) => current + 1)
  }

  const toggleLanguage = () => {
    if (spanish) {
      setLanguage('en')
      return
    }
    void loadSpanishTranslations().then((translations) => {
      setSpanishTranslations(translations)
      setLanguage('es')
    })
  }

  return (
    <div className="review-layout">
      <div className="review-meta">
        <span>{options.mode === 'daily' ? (spanish ? 'Repaso diario' : 'Daily Review') : (spanish ? 'Estudio personalizado' : 'Custom Study')} · {options.sourceChat === 'all' ? (spanish ? 'Todos los chats' : 'All chats') : options.sourceChat} · {options.domain === 'all' ? (spanish ? 'Todos los dominios' : 'All domains') : options.domain}{options.topic === 'all' ? '' : ` · ${options.topic}`}{options.order === 'random' ? ` · ${spanish ? 'Aleatorio' : 'Randomized'}` : ''}</span>
        <div className="review-meta-actions"><button className="language-toggle" type="button" aria-label={spanish ? 'Cambiar las flashcards a inglés' : 'Cambiar las flashcards a español'} aria-pressed={spanish} onClick={toggleLanguage}><span className={!spanish ? 'active' : ''}>EN</span><span aria-hidden="true">/</span><span className={spanish ? 'active' : ''}>ES</span></button><div className="queue-counts" aria-label={spanish ? 'Tarjetas restantes' : 'Cards remaining'}><span className="new-count">{queue.length - index}</span><span className="review-count">{index}</span></div></div>
      </div>
      <section className="review-card" aria-live="polite">
        <div className="card-label"><span>{card.domain} · {card.topics[0]}</span><span className="card-schedule-state">{!store.cards[card.id] ? (spanish ? 'Nueva' : 'New') : isDue(store.cards[card.id]) ? (spanish ? 'Repaso pendiente' : 'Due review') : (spanish ? 'Práctica programada' : 'Scheduled practice')}</span></div>
        <div className="question-block"><p className="eyebrow">{spanish ? ({ recall: 'recordar', scenario: 'situación', comparison: 'comparación', cloze: 'completar', 'single-choice': 'una respuesta', 'multiple-response': 'varias respuestas' } as const)[card.type] : card.type.replace('-', ' ')}</p><button className="question-help-trigger" type="button" aria-expanded={showSimpleHelp} aria-label={`${content?.prompt} ${spanish ? 'Pulsa para explicarla de forma sencilla.' : 'Select to explain it simply.'}`} title={spanish ? 'Explícamelo fácil' : 'Explain simply'} onClick={() => setShowSimpleHelp((current) => !current)}><span>{content?.prompt}</span><Info size={18} aria-hidden="true" /></button>{showSimpleHelp && <div className="simple-help" role="note"><strong>{spanish ? 'En modo fácil' : 'In simple terms'}</strong><p>{simpleQuestionHelp(card.type, language)}</p></div>}</div>
        {revealed && (
          <div className="answer-block">
            <p className="answer-title">{content?.answer}</p>
            <p>{content?.explanation}</p>
            {content?.example && <div className="example-block"><strong>{spanish ? 'Ejemplo:' : 'Example:'}</strong> {content.example}</div>}
            {content?.examCue && <div className="exam-cue"><strong>{spanish ? 'Pista de examen:' : 'Exam cue:'}</strong> {content.examCue}</div>}
            <div className="source-ref">{spanish ? 'Fuente' : 'Source'}: {card.sourceRef}</div>
          </div>
        )}
      </section>
      <footer className="review-footer">
        <div className="footer-actions"><button className="utility-button" type="button"><Pencil size={16} /> {spanish ? 'Editar' : 'Edit'}</button><button className="utility-button" type="button"><RotateCcw size={16} /> {spanish ? 'Deshacer' : 'Undo'}</button></div>
        {!revealed ? (
          <button className="show-answer" type="button" onClick={() => setRevealed(true)}>{spanish ? 'Mostrar respuesta' : 'Show Answer'} <kbd>{spanish ? 'Espacio' : 'Space'}</kbd></button>
        ) : (
          <div className="rating-buttons" aria-label={spanish ? 'Calificar recuerdo' : 'Rate recall'}>
            {ratings.map((item) => <button className={`rating-button ${item.name}`} type="button" key={item.name} onClick={() => rate(item.name)}><span className="next-interval">{intervals?.[item.name]}</span><span>{ratingLabels[item.name]}</span><kbd>{item.key}</kbd></button>)}
          </div>
        )}
        <button className="utility-button more-button" type="button"><MoreHorizontal size={18} /> {spanish ? 'Más' : 'More'}</button>
      </footer>
    </div>
  )
}
