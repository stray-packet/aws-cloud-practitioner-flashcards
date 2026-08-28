import { BarChart3, BookOpen, Cloud, Library, Settings, SlidersHorizontal } from 'lucide-react'
import type { User } from 'firebase/auth'

export type ViewName = 'overview' | 'study' | 'exam' | 'browse' | 'stats' | 'settings'

const primaryItems: Array<{ view: ViewName; label: string }> = [
  { view: 'overview', label: 'Decks' },
  { view: 'study', label: 'Study' },
  { view: 'browse', label: 'Browse' },
  { view: 'stats', label: 'Stats' },
]

const mobileItems = [
  { view: 'overview' as const, label: 'Decks', icon: BookOpen },
  { view: 'study' as const, label: 'Study', icon: SlidersHorizontal },
  { view: 'browse' as const, label: 'Browse', icon: Library },
  { view: 'stats' as const, label: 'Stats', icon: BarChart3 },
  { view: 'settings' as const, label: 'Settings', icon: Settings },
]

interface LayoutProps {
  view: ViewName
  user: User | null
  firebaseConfigured: boolean
  children: React.ReactNode
  onNavigate: (view: ViewName) => void
}

export function Layout({ view, user, firebaseConfigured, children, onNavigate }: LayoutProps) {
  const focusMode = view === 'study' || view === 'exam'
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
        <button className="sync-status" type="button" onClick={() => onNavigate('settings')}>
          <Cloud size={14} />
          <span>{user ? `Synced as ${user.displayName?.split(' ')[0] ?? 'user'}` : firebaseConfigured ? 'Sign in to sync' : 'Local mode'}</span>
        </button>
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
