import { useCallback, useEffect, useMemo, useState } from 'react'
import type { User } from 'firebase/auth'
import cardsJson from './data/generated-cards.json'
import { BrowseView } from './components/BrowseView'
import { ExamView } from './components/ExamView'
import { Layout, type ViewName } from './components/Layout'
import { Overview } from './components/Overview'
import { ReviewView } from './components/ReviewView'
import { SettingsView } from './components/SettingsView'
import { StatsView } from './components/StatsView'
import { reviewCard, type RatingName } from './lib/scheduler'
import { exportProgress, loadStore, saveStore, type ReviewEvent, type StudySettings, type StudyStore } from './lib/storage'
import { flashcardListSchema, type Flashcard } from './types/card'
import './App.css'

const cards = flashcardListSchema.parse(cardsJson) as Flashcard[]
const firebaseConfigured = [
  import.meta.env.VITE_FIREBASE_API_KEY,
  import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  import.meta.env.VITE_FIREBASE_PROJECT_ID,
  import.meta.env.VITE_FIREBASE_APP_ID,
].every(Boolean)

function App() {
  const [view, setView] = useState<ViewName>('overview')
  const [store, setStore] = useState<StudyStore>(() => loadStore())
  const [user, setUser] = useState<User | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    if (!firebaseConfigured) return
    let unsubscribe: (() => void) | undefined
    void import('./lib/firebase').then(({ observeUser, loadCloudCards }) => {
      unsubscribe = observeUser(async (nextUser) => {
        setUser(nextUser)
        if (nextUser) {
          try {
            const cloudCards = await loadCloudCards(nextUser)
            setStore((current) => ({ ...current, cards: { ...current.cards, ...cloudCards } }))
          } catch {
            setNotice('Cloud sync is temporarily unavailable. Local study still works.')
          }
        }
      })
    })
    return () => unsubscribe?.()
  }, [])

  useEffect(() => { saveStore(store) }, [store])

  useEffect(() => {
    const root = document.documentElement
    if (store.settings.theme === 'system') root.removeAttribute('data-theme')
    else root.dataset.theme = store.settings.theme
  }, [store.settings.theme])

  useEffect(() => {
    if (!notice) return
    const timeout = window.setTimeout(() => setNotice(null), 4500)
    return () => window.clearTimeout(timeout)
  }, [notice])

  const rateCard = useCallback((card: Flashcard, rating: RatingName) => {
    const reviewedAt = new Date()
    setStore((current) => {
      const result = reviewCard(current.cards[card.id], rating, current.settings.retention, reviewedAt)
      const event: ReviewEvent = { id: crypto.randomUUID(), cardId: card.id, rating, reviewedAt: reviewedAt.toISOString(), mode: 'daily-review' }
      if (user) void import('./lib/firebase').then(({ saveCloudReview }) => saveCloudReview(user, card.id, result.card, event)).catch(() => setNotice('Review saved locally; cloud sync will retry later.'))
      return { ...current, cards: { ...current.cards, [card.id]: result.card }, reviewLogs: [...current.reviewLogs, event] }
    })
  }, [user])

  const recordExamAttempt = useCallback((cardId: string, correct: boolean) => {
    setStore((current) => ({ ...current, examAttempts: [...current.examAttempts, { cardId, correct, answeredAt: new Date().toISOString() }] }))
  }, [])

  const updateSettings = useCallback((settings: StudySettings) => {
    setStore((current) => ({ ...current, settings }))
    if (user) void import('./lib/firebase').then(({ saveCloudSettings }) => saveCloudSettings(user, settings)).catch(() => setNotice('Settings saved locally.'))
  }, [user])

  const content = useMemo(() => {
    switch (view) {
      case 'study': return <ReviewView cards={cards} store={store} onRate={rateCard} onFinished={() => setView('overview')} />
      case 'exam': return <ExamView cards={cards} onAttempt={recordExamAttempt} onExit={() => setView('overview')} />
      case 'browse': return <BrowseView cards={cards} />
      case 'stats': return <StatsView cards={cards} store={store} />
      case 'settings': return <SettingsView settings={store.settings} user={user} firebaseConfigured={firebaseConfigured} onChange={updateSettings} onSignIn={() => void import('./lib/firebase').then(({ signInWithGoogle }) => signInWithGoogle()).catch(() => setNotice('Google sign-in was not completed.'))} onSignOut={() => void import('./lib/firebase').then(({ signOutUser }) => signOutUser())} onExport={() => exportProgress(store)} />
      default: return <Overview cards={cards} store={store} onNavigate={setView} />
    }
  }, [recordExamAttempt, rateCard, store, updateSettings, user, view])

  return (
    <Layout view={view} user={user} firebaseConfigured={firebaseConfigured} onNavigate={setView}>
      {notice && <div className="notice" role="status">{notice}</div>}
      {content}
    </Layout>
  )
}

export default App
