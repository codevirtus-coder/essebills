import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import NotificationMenu from '../components/ui/NotificationMenu'
import { Icon } from '../components/ui/Icon'
import { useCurrentUser } from '../features/auth/hooks/useCurrentUser'
import { clearAuthSession } from '../features/auth/auth.storage'
import { ROUTE_PATHS } from '../router/paths'
import { cn } from '../lib/utils'
import { User, LogOut, Settings, HelpCircle, ChevronDown, Menu, X, Bell } from 'lucide-react'

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
    <header className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 md:px-8 sticky top-0 z-[60] shadow-sm">
      <div className="flex items-center gap-4 flex-1">
        <button
          type="button"
          onClick={onToggleMobileNav}
          className="md:hidden w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center transition-all hover:bg-slate-200 dark:hover:bg-slate-700"
          aria-label={isMobileNavOpen ? 'Close navigation' : 'Open navigation'}
        >
          {isMobileNavOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        
        {/* Dynamic Page Kicker (Optional) */}
        <div className="hidden lg:block">
           <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-[0.2em]">Secure Node: Operational</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <NotificationMenu />

        <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-2" />

        {/* Profile dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setProfileMenuOpen((p) => !p)}
            className={cn(
              "flex items-center gap-3 rounded-2xl p-1.5 transition-all",
              profileMenuOpen ? "bg-slate-100 dark:bg-slate-800 shadow-inner" : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
            )}
            aria-label="Open profile menu"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white text-xs font-black flex items-center justify-center shadow-lg shadow-emerald-900/20">
              {initials}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                {loading ? '...' : displayName}
              </p>
              <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">{displayRole}</p>
            </div>
            <ChevronDown size={14} className={cn("text-slate-400 hidden sm:block transition-transform", profileMenuOpen && "rotate-180")} />
          </button>

          {profileMenuOpen && (
            <div className="absolute top-[calc(100%+8px)] right-0 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
              {/* User summary */}
              <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{displayName}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{displayRole}</p>
              </div>

              {/* Actions */}
              <div className="p-2 space-y-1">
                <Link
                  to="/portal/profile"
                  onClick={() => setProfileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-emerald-600 transition-colors rounded-xl"
                >
                  <User size={18} />
                  My Profile
                </Link>
                <Link
                  to="/portal-admin/settings"
                  onClick={() => setProfileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors rounded-xl"
                >
                  <Settings size={18} />
                  System Settings
                </Link>
                <div className="h-px bg-slate-100 dark:bg-slate-800 my-1 mx-2" />
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors rounded-xl w-full"
                >
                  <LogOut size={18} />
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
