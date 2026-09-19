import { useCallback, useEffect, useMemo, useState } from 'react'
import type { User } from 'firebase/auth'
import cardsJson from './data/generated-cards.json'
import { BrowseView } from './components/BrowseView'
import { ExamView } from './components/ExamView'
import { Layout, type ViewName } from './components/Layout'
import { Overview } from './components/Overview'
import { ReviewView } from './components/ReviewView'
import { ServicesView } from './components/ServicesView'
import { SettingsView } from './components/SettingsView'
import { StatsView } from './components/StatsView'
import type { RatingName } from './lib/scheduler'
import { applyReviewToStore } from './lib/reviewStore'
import { defaultStudySession, type StudySessionOptions } from './lib/studySession'
import { exportProgress, loadStore, parseProgressJson, saveStore, type StudySettings, type StudyStore } from './lib/storage'
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
  const [studySession, setStudySession] = useState<StudySessionOptions>(defaultStudySession)
  const [serviceReviewActive, setServiceReviewActive] = useState(false)

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

  const rateCard = useCallback((card: Flashcard, rating: RatingName, mode: StudySessionOptions['mode'], reviewedAt = new Date()) => {
    setStore((current) => {
      const update = applyReviewToStore(current, card.id, rating, mode, reviewedAt)
      if (user) void import('./lib/firebase').then(({ saveCloudReview }) => saveCloudReview(user, card.id, update.card, update.event)).catch(() => setNotice('Review saved locally; cloud sync will retry later.'))
      return update.store
    })
  }, [user])

  const recordExamAttempt = useCallback((cardId: string, correct: boolean) => {
    setStore((current) => ({ ...current, examAttempts: [...current.examAttempts, { cardId, correct, answeredAt: new Date().toISOString() }] }))
  }, [])

  const rateService = useCallback((cardId: string, rating: RatingName, reviewedAt: Date) => {
    setStore((current) => applyReviewToStore(current, cardId, rating, 'custom', reviewedAt).store)
  }, [])

  const toggleServiceFlag = useCallback((serviceId: string) => {
    setStore((current) => {
      const flagged = current.flaggedServiceIds.includes(serviceId)
      return {
        ...current,
        flaggedServiceIds: flagged
          ? current.flaggedServiceIds.filter((id) => id !== serviceId)
          : [...current.flaggedServiceIds, serviceId],
      }
    })
  }, [])

  const updateSettings = useCallback((settings: StudySettings) => {
    setStore((current) => ({ ...current, settings }))
    if (user) void import('./lib/firebase').then(({ saveCloudSettings }) => saveCloudSettings(user, settings)).catch(() => setNotice('Settings saved locally.'))
  }, [user])

  const toggleTheme = useCallback(() => {
    setStore((current) => {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      const dark = current.settings.theme === 'dark' || (current.settings.theme === 'system' && systemDark)
      return { ...current, settings: { ...current.settings, theme: dark ? 'light' : 'dark' } }
    })
  }, [])

  const navigate = useCallback((nextView: ViewName) => {
    if (nextView === 'study') setStudySession(defaultStudySession)
    if (nextView !== 'services') setServiceReviewActive(false)
    setView(nextView)
  }, [])

  const startStudy = useCallback((options: StudySessionOptions) => {
    setStudySession(options)
    setView('study')
  }, [])

  const importLocalProgress = useCallback(async (file: File) => {
    try {
      setStore(parseProgressJson(await file.text()))
      setNotice('Local progress imported successfully.')
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Progress could not be imported.')
    }
  }, [])

  const content = useMemo(() => {
    switch (view) {
      case 'study': return <ReviewView cards={cards} store={store} options={studySession} onRate={(card, rating, reviewedAt) => rateCard(card, rating, studySession.mode, reviewedAt)} onFinished={() => setView('overview')} />
      case 'services': return <ServicesView store={store} onRate={rateService} onToggleFlag={toggleServiceFlag} onReviewActiveChange={setServiceReviewActive} />
      case 'exam': return <ExamView cards={cards} onAttempt={recordExamAttempt} onExit={() => setView('overview')} />
      case 'browse': return <BrowseView cards={cards} />
      case 'stats': return <StatsView cards={cards} store={store} />
      case 'settings': return <SettingsView settings={store.settings} store={store} user={user} firebaseConfigured={firebaseConfigured} onChange={updateSettings} onSignIn={() => void import('./lib/firebase').then(({ signInWithGoogle }) => signInWithGoogle()).catch(() => setNotice('Google sign-in was not completed.'))} onSignOut={() => void import('./lib/firebase').then(({ signOutUser }) => signOutUser())} onExport={() => exportProgress(store)} onImport={importLocalProgress} />
      default: return <Overview cards={cards} store={store} onNavigate={navigate} onStartStudy={startStudy} />
    }
  }, [importLocalProgress, navigate, rateService, recordExamAttempt, rateCard, startStudy, store, studySession, toggleServiceFlag, updateSettings, user, view])

  return (
    <Layout view={view} serviceReviewActive={serviceReviewActive} user={user} firebaseConfigured={firebaseConfigured} theme={store.settings.theme} onNavigate={navigate} onToggleTheme={toggleTheme}>
      {notice && <div className="notice" role="status">{notice}</div>}
      {content}
    </Layout>
  )
}

export default App
