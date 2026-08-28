import { useMemo, useState } from 'react'
import { Check, X } from 'lucide-react'
import type { Flashcard } from '../types/card'

interface ExamViewProps {
  cards: Flashcard[]
  onAttempt: (cardId: string, correct: boolean) => void
  onExit: () => void
}

export function ExamView({ cards, onAttempt, onExit }: ExamViewProps) {
  const examCards = useMemo(() => cards.filter((card) => card.options?.length), [cards])
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<string[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(0)
  const card = examCards[index]

  if (!card) return <div className="finished-state"><h1>Practice complete</h1><p>Score: {score}/{examCards.length}</p><button className="primary-button" type="button" onClick={onExit}>Return to Decks</button></div>

  const multiple = card.type === 'multiple-response'
  const toggle = (optionId: string) => {
    if (submitted) return
    setSelected((current) => multiple ? current.includes(optionId) ? current.filter((id) => id !== optionId) : [...current, optionId] : [optionId])
  }
  const correct = card.correctOptions?.length === selected.length && card.correctOptions.every((id) => selected.includes(id))
  const submit = () => { setSubmitted(true); if (correct) setScore((value) => value + 1); onAttempt(card.id, Boolean(correct)) }
  const next = () => { setIndex((value) => value + 1); setSelected([]); setSubmitted(false) }

  return (
    <div className="content-page exam-page">
      <header className="exam-header"><button className="text-button" type="button" onClick={onExit}>Exit</button><span>Question {index + 1} of {examCards.length}</span><strong>{score} correct</strong></header>
      <section className="exam-panel">
        <p className="section-kicker">{multiple ? 'Choose two answers' : 'Choose one answer'}</p>
        <h1>{card.prompt}</h1>
        <div className="option-list">
          {card.options?.map((option) => {
            const isSelected = selected.includes(option.id)
            const isCorrect = submitted && card.correctOptions?.includes(option.id)
            const isWrong = submitted && isSelected && !isCorrect
            return <button className={`exam-option ${isSelected ? 'selected' : ''} ${isCorrect ? 'correct' : ''} ${isWrong ? 'wrong' : ''}`} type="button" key={option.id} onClick={() => toggle(option.id)}><span>{option.id.toUpperCase()}</span><p>{option.text}</p>{isCorrect && <Check size={18} />}{isWrong && <X size={18} />}</button>
          })}
        </div>
        {submitted && <div className={`exam-feedback ${correct ? 'correct' : 'wrong'}`}><strong>{correct ? 'Correct' : 'Not quite'}</strong><p>{card.explanation}</p>{card.examCue && <p><strong>Exam cue:</strong> {card.examCue}</p>}</div>}
        <div className="exam-actions">{submitted ? <button className="primary-button" type="button" onClick={next}>Next Question</button> : <button className="primary-button" type="button" disabled={!selected.length} onClick={submit}>Check Answer</button>}</div>
      </section>
    </div>
  )
}
