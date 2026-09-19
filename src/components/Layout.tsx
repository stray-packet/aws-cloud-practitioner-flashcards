import { BarChart3, BookOpen, Cloud, Library, Moon, Settings, SlidersHorizontal, Sun, Boxes } from 'lucide-react'
import type { User } from 'firebase/auth'
import type { ThemePreference } from '../lib/storage'

export type ViewName = 'overview' | 'study' | 'services' | 'exam' | 'browse' | 'stats' | 'settings'

const primaryItems: Array<{ view: ViewName; label: string }> = [
  { view: 'overview', label: 'Decks' },
  { view: 'study', label: 'Study' },
  { view: 'services', label: 'Services' },
  { view: 'browse', label: 'Browse' },
  { view: 'stats', label: 'Stats' },
]

const mobileItems = [
  { view: 'overview' as const, label: 'Decks', icon: BookOpen },
  { view: 'study' as const, label: 'Study', icon: SlidersHorizontal },
  { view: 'services' as const, label: 'Services', icon: Boxes },
  { view: 'browse' as const, label: 'Browse', icon: Library },
  { view: 'stats' as const, label: 'Stats', icon: BarChart3 },
  { view: 'settings' as const, label: 'Settings', icon: Settings },
]

interface LayoutProps {
  view: ViewName
  user: User | null
  firebaseConfigured: boolean
  theme: ThemePreference
  children: React.ReactNode
  onNavigate: (view: ViewName) => void
  onToggleTheme: () => void
}

export function Layout({ view, user, firebaseConfigured, theme, children, onNavigate, onToggleTheme }: LayoutProps) {
  const focusMode = view === 'study' || view === 'exam'
  const systemDark = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
  const dark = theme === 'dark' || (theme === 'system' && systemDark)
  return (
    <div className={`app-shell ${focusMode ? 'focus-mode' : ''}`}>
      <header className="topbar">
        <button className="brand" type="button" onClick={() => onNavigate('overview')} aria-label="AWS Study home">
          <span className="brand-mark">A</span>
          <span>AWS Study</span>
        </button>
        <nav className="desktop-nav" aria-label="Primary navigation">
          {primaryItems.map((item) => (
            <button className={`nav-item ${view === item.view ? 'active' : ''}`} type="button" key={item.view} onClick={() => onNavigate(item.view)}>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="topbar-actions"><button className="theme-toggle" type="button" onClick={onToggleTheme} aria-label={dark ? 'Use light theme' : 'Use dark theme'} title={dark ? 'Use light theme' : 'Use dark theme'}>{dark ? <Sun size={16} /> : <Moon size={16} />}<span>{dark ? 'Light' : 'Dark'}</span></button><button className="sync-status" type="button" onClick={() => onNavigate('settings')}><Cloud size={14} /><span>{user ? `Synced as ${user.displayName?.split(' ')[0] ?? 'user'}` : firebaseConfigured ? 'Sign in to sync' : 'Local mode'}</span></button></div>
      </header>
      <main className="main-area">{children}</main>
      {!focusMode && (
        <nav className="mobile-nav" aria-label="Mobile navigation">
          {mobileItems.map(({ view: itemView, label, icon: Icon }) => (
            <button className={view === itemView ? 'active' : ''} type="button" key={itemView} onClick={() => onNavigate(itemView)}>
              <Icon size={19} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      )}
    </div>
  )
}
