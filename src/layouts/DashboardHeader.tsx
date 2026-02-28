import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import NotificationMenu from '../components/ui/NotificationMenu'
import { Icon } from '../components/ui/Icon'
import { useCurrentUser } from '../features/auth/hooks/useCurrentUser'
import { clearAuthSession } from '../features/auth/auth.storage'
import { ROUTE_PATHS } from '../router/paths'

interface DashboardHeaderProps {
  onToggleMobileNav?: () => void
  isMobileNavOpen?: boolean
}

export function DashboardHeader({
  onToggleMobileNav,
  isMobileNavOpen = false,
}: DashboardHeaderProps) {
  const navigate = useNavigate()
  const { profile, group, loading } = useCurrentUser()
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const displayName = useMemo(() => {
    const first = profile?.firstName ?? ''
    const last = profile?.lastName ?? ''
    return `${first} ${last}`.trim() || profile?.username || 'User'
  }, [profile])

  const displayRole = useMemo(() => {
    return group ? group.replace(/_/g, ' ') : profile?.group?.name?.replace(/_/g, ' ') || 'User'
  }, [group, profile])

  const initials = useMemo(() => {
    return [profile?.firstName?.[0], profile?.lastName?.[0]]
      .filter(Boolean)
      .join('')
      .toUpperCase() || 'U'
  }, [profile])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = () => {
    setProfileMenuOpen(false)
    clearAuthSession()
    navigate(ROUTE_PATHS.login)
  }

  return (
    <header className="h-14 bg-white border-b border-neutral-light dark:border-white/5 shadow-sm flex items-center justify-between px-4 md:px-6 sticky top-0 z-[60]">
      <div className="flex items-center gap-4 flex-1">
        <button
          type="button"
          onClick={onToggleMobileNav}
          className="md:hidden w-9 h-9 rounded-lg bg-neutral-light text-neutral-text flex items-center justify-center"
          aria-label={isMobileNavOpen ? 'Close navigation' : 'Open navigation'}
        >
          <Icon name={isMobileNavOpen ? 'close' : 'menu'} size={18} />
        </button>
      </div>

      <div className="flex items-center gap-3">
        <NotificationMenu />

        <div className="h-8 w-px bg-neutral-light dark:bg-white/10" />

        {/* Profile dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setProfileMenuOpen((p) => !p)}
            className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-neutral-light/50 transition-colors"
            aria-label="Open profile menu"
          >
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-dark-text dark:text-white">
                {loading ? '...' : displayName}
              </p>
              <p className="text-[10px] text-neutral-text font-medium">{displayRole}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center">
              {initials}
            </div>
            <Icon name="expand_more" size={14} className="text-neutral-text hidden sm:block" />
          </button>

          {profileMenuOpen && (
            <div className="absolute top-12 right-0 w-52 bg-white border border-neutral-light rounded-xl shadow-xl overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-150">
              {/* User summary */}
              <div className="px-4 py-3 border-b border-neutral-light">
                <p className="text-sm font-bold text-dark-text truncate">{displayName}</p>
                <p className="text-[10px] text-neutral-text uppercase tracking-wider mt-0.5">{displayRole}</p>
              </div>

              {/* Actions */}
              <div className="py-1">
                <Link
                  to="/portal/profile"
                  onClick={() => setProfileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-dark-text hover:bg-neutral-light/50 transition-colors w-full"
                >
                  <Icon name="person" size={15} className="text-neutral-text" />
                  My Profile
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors w-full"
                >
                  <Icon name="logout" size={15} />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
