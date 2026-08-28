import type { User } from 'firebase/auth'
import type { StudySettings } from '../lib/storage'

interface SettingsViewProps {
  settings: StudySettings
  user: User | null
  firebaseConfigured: boolean
  onChange: (settings: StudySettings) => void
  onSignIn: () => void
  onSignOut: () => void
  onExport: () => void
}

export function SettingsView({ settings, user, firebaseConfigured, onChange, onSignIn, onSignOut, onExport }: SettingsViewProps) {
  return (
    <div className="content-page settings-page">
      <header className="page-header compact"><div><h1>Preferences</h1><p>Study scheduling, appearance, and sync.</p></div></header>
      <section className="settings-group"><h2>Review</h2><label className="setting-row"><span><strong>Desired retention</strong><small>Higher values create more reviews.</small></span><output>{Math.round(settings.retention * 100)}%</output><input type="range" min="80" max="97" value={settings.retention * 100} onChange={(event) => onChange({ ...settings, retention: Number(event.target.value) / 100 })} /></label><label className="setting-row"><span><strong>New cards per day</strong><small>Reviews are always shown first.</small></span><input className="number-input" type="number" min="0" max="100" value={settings.newCardsPerDay} onChange={(event) => onChange({ ...settings, newCardsPerDay: Number(event.target.value) })} /></label></section>
      <section className="settings-group"><h2>Appearance</h2><label className="setting-row"><span><strong>Theme</strong><small>Use the system theme or select one.</small></span><select value={settings.theme} onChange={(event) => onChange({ ...settings, theme: event.target.value as StudySettings['theme'] })}><option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option></select></label></section>
      <section className="settings-group"><h2>Sync</h2><div className="setting-row"><span><strong>{user ? `Signed in as ${user.email}` : firebaseConfigured ? 'Google sync is ready' : 'Local mode'}</strong><small>{user ? 'Review progress is saved to Firestore.' : firebaseConfigured ? 'Sign in to share progress across devices.' : 'Add Firebase environment values to enable cloud sync.'}</small></span>{user ? <button className="secondary-button" type="button" onClick={onSignOut}>Sign Out</button> : <button className="secondary-button" type="button" onClick={onSignIn} disabled={!firebaseConfigured}>Sign In with Google</button>}</div><div className="setting-row"><span><strong>Local backup</strong><small>Download a portable JSON copy of your progress.</small></span><button className="secondary-button" type="button" onClick={onExport}>Export Progress</button></div></section>
    </div>
  )
}
