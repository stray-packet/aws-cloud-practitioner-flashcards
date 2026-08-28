import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut, type Auth, type User } from 'firebase/auth'
import { collection, doc, getDocs, initializeFirestore, persistentLocalCache, persistentMultipleTabManager, setDoc, type Firestore } from 'firebase/firestore'
import type { ReviewEvent, StudySettings } from './storage'
import type { StoredFsrsCard } from './scheduler'

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const firebaseConfigured = Object.values(config).every(Boolean)
let app: FirebaseApp | undefined
let auth: Auth | undefined
let database: Firestore | undefined

if (firebaseConfigured) {
  app = initializeApp(config)
  auth = getAuth(app)
  database = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
  })
}

export function observeUser(callback: (user: User | null) => void) {
  if (!auth) {
    callback(null)
    return () => undefined
  }
  return onAuthStateChanged(auth, callback)
}

export async function signInWithGoogle() {
  if (!auth) throw new Error('Firebase is not configured.')
  return signInWithPopup(auth, new GoogleAuthProvider())
}

export async function signOutUser() {
  if (auth) await signOut(auth)
}

export async function saveCloudReview(user: User, cardId: string, state: StoredFsrsCard, event: ReviewEvent) {
  if (!database) return
  await Promise.all([
    setDoc(doc(database, 'users', user.uid, 'cards', cardId), { ...state, updatedAt: event.reviewedAt }),
    setDoc(doc(database, 'users', user.uid, 'reviewLogs', event.id), event),
  ])
}

export async function saveCloudSettings(user: User, settings: StudySettings) {
  if (database) await setDoc(doc(database, 'users', user.uid, 'settings', 'study'), settings)
}

export async function loadCloudCards(user: User) {
  if (!database) return {} as Record<string, StoredFsrsCard>
  const snapshot = await getDocs(collection(database, 'users', user.uid, 'cards'))
  const result: Record<string, StoredFsrsCard> = {}
  snapshot.forEach((entry) => {
    const data = entry.data()
    const { updatedAt: _updatedAt, ...card } = data
    void _updatedAt
    result[entry.id] = card as StoredFsrsCard
  })
  return result
}
