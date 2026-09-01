import type { User } from 'firebase/auth'
import type { StudySettings, StudyStore } from '../lib/storage'

interface SettingsViewProps {
  settings: StudySettings
  store: StudyStore
  user: User | null
  firebaseConfigured: boolean
  onChange: (settings: StudySettings) => void
  onSignIn: () => void
  onSignOut: () => void
  onExport: () => void
  onImport: (file: File) => void
}

export function SettingsView({ settings, store, user, firebaseConfigured, onChange, onSignIn, onSignOut, onExport, onImport }: SettingsViewProps) {
  const today = new Date()
  const reviewsToday = store.reviewLogs.filter((review) => {
    const date = new Date(review.reviewedAt)
    return date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth() && date.getDate() === today.getDate()
  }).length

  return (
    <div className="content-page settings-page">
      <header className="page-header compact"><div><h1>Preferences</h1><p>Study scheduling, appearance, and sync.</p></div></header>
      <section className="settings-group"><h2>Review</h2><label className="setting-row"><span><strong>Desired retention</strong><small>Higher values create more reviews.</small></span><output>{Math.round(settings.retention * 100)}%</output><input type="range" min="80" max="97" value={settings.retention * 100} onChange={(event) => onChange({ ...settings, retention: Number(event.target.value) / 100 })} /></label><label className="setting-row"><span><strong>New cards per day</strong><small>Applies only to Daily Review and resets on the next local calendar day. Custom Study can go beyond it.</small></span><input className="number-input" type="number" min="0" max="100" value={settings.newCardsPerDay} onChange={(event) => onChange({ ...settings, newCardsPerDay: Number(event.target.value) })} /></label></section>
      <section className="settings-group"><h2>Appearance</h2><label className="setting-row"><span><strong>Theme</strong><small>Use the system theme or select one.</small></span><select value={settings.theme} onChange={(event) => onChange({ ...settings, theme: event.target.value as StudySettings['theme'] })}><option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option></select></label></section>
      <section className="settings-group"><h2>Progress and backup</h2><div className="setting-row"><span><strong>{user ? `Signed in as ${user.email}` : firebaseConfigured ? 'Google sync is ready' : 'Local progress is active'}</strong><small>{user ? 'Review progress is saved to Firestore.' : firebaseConfigured ? 'Sign in to share progress across devices.' : `${Object.keys(store.cards).length} ${Object.keys(store.cards).length === 1 ? 'card' : 'cards'} introduced · ${reviewsToday} ${reviewsToday === 1 ? 'review' : 'reviews'} today. Saved automatically in this browser only.`}</small></span>{user ? <button className="secondary-button" type="button" onClick={onSignOut}>Sign Out</button> : <button className="secondary-button" type="button" onClick={onSignIn} disabled={!firebaseConfigured}>Sign In with Google</button>}</div><div className="setting-row"><span><strong>Portable local backup</strong><small>Export regularly, then import the JSON file to recover progress or move it to another browser.</small></span><div className="backup-actions"><button className="secondary-button" type="button" onClick={onExport}>Export Progress</button><label className="secondary-button import-button">Import Progress<input type="file" accept="application/json,.json" onChange={(event) => { const file = event.target.files?.[0]; if (file) onImport(file); event.target.value = '' }} /></label></div></div></section>
    </div>
  )
}
