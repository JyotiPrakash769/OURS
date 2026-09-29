import { NavLink } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { ThemeToggle } from './ThemeToggle'
import { NotificationToggle } from './NotificationToggle'

// Letters are reached from Home and desktop TopBar, not the mobile bottom nav (per spec).
const items = [
  { to: '/app', label: 'Home', end: true },
  { to: '/app/story', label: 'Story', end: false },
  { to: '/app/memories', label: 'Memories', end: false },
  { to: '/app/future', label: 'Future', end: false },
] as const

const desktopItems = [
  ...items,
  { to: '/app/letters', label: 'Letters', end: false },
] as const

export function TopBar({ relationshipId }: { relationshipId?: string }) {
  const { signOut } = useAuth()
  return (
    <header className="flex items-center justify-between px-6 py-4">
      <NavLink to="/app" className="font-serif text-2xl">
        OURS <span className="text-accent">♡</span>
      </NavLink>
      <nav aria-label="Desktop" className="hidden gap-8 text-sm md:flex">
        {desktopItems.map((i) => (
          <NavLink
            key={i.to}
            to={i.to}
            end={i.end}
            className={({ isActive }) => (isActive ? 'text-accent' : 'text-muted hover:text-text')}
          >
            {i.label}
          </NavLink>
        ))}
      </nav>
      <div className="flex items-center gap-2 sm:gap-3">
        <NavLink
          to="/app/letters"
          title="Letters"
          aria-label="Letters"
          className="flex h-9 w-9 items-center justify-center rounded-xl text-muted transition hover:bg-surface hover:text-text md:hidden"
        >
          💌
        </NavLink>
        {relationshipId && <NotificationToggle relationshipId={relationshipId} />}
        <ThemeToggle />
        <button type="button" onClick={signOut} className="min-h-11 px-2 text-sm text-muted hover:text-text">
          Log out
        </button>
      </div>
    </header>
  )
}

export function BottomNavigation() {
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-10 border-t border-border bg-bg/95 pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="mx-auto flex max-w-md">
        {items.map((i) => (
          <li key={i.to} className="flex-1">
            <NavLink
              to={i.to}
              end={i.end}
              className={({ isActive }) =>
                `flex min-h-14 items-center justify-center text-sm ${
                  isActive ? 'font-medium text-accent' : 'text-muted'
                }`
              }
            >
              {i.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
