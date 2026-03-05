import React, { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getMenuByGroup, ADMIN_PREFERENCE_ITEMS, type MenuItem } from '../features/portal/menuConfig'
import Logo from '../components/ui/Logo'
import { Icon } from '../components/ui/Icon'
import { ROUTE_PATHS } from '../router/paths'
import type { UserGroup } from '../features/auth/dto/auth.dto'
import { clearAuthSession } from '../features/auth/auth.storage'
import { useCurrentUser } from '../features/auth/hooks/useCurrentUser'

interface DashboardSidebarProps {
  group: UserGroup
  activeTab: string
  onTabChange?: (tab: string) => void
  className?: string
  /** When true, hides the collapse toggle (e.g. in the mobile overlay) */
  disableCollapse?: boolean
}

export function DashboardSidebar({
  group,
  activeTab,
  onTabChange,
  className = '',
  disableCollapse = false,
}: DashboardSidebarProps) {
  const navigate = useNavigate()
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})
  const { profile, group: userGroup } = useCurrentUser()

  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (disableCollapse) return false
    try { return localStorage.getItem('sidebar-collapsed') === 'true' } catch { return false }
  })

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev
      try { localStorage.setItem('sidebar-collapsed', String(next)) } catch { /* noop */ }
      return next
    })
  }

  const menuSections = useMemo(() => getMenuByGroup(group), [group])

  const effectiveExpandedGroups = useMemo(() => {
    const defaults: Record<string, boolean> = {}
    menuSections.forEach((section) => {
      section.items.forEach((item) => {
        if (item.children?.length) {
          defaults[item.id] = true
        }
      })
    })
    return { ...defaults, ...expandedGroups }
  }, [menuSections, expandedGroups])

  const isItemActive = (item: MenuItem): boolean => {
    if (item.id === activeTab) return true
    if (!item.children) return false
    return item.children.some((child) => child.id === activeTab)
  }

  const isItemExactActive = (item: MenuItem): boolean => item.id === activeTab

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => ({ ...prev, [groupId]: !effectiveExpandedGroups[groupId] }))
  }

  const handlePrimaryItemClick = (item: MenuItem) => {
    if (item.path) {
      navigate(item.path)
      return
    }
    if (item.children?.length) {
      setExpandedGroups((prev) => ({ ...prev, [item.id]: true }))
      const firstChild = item.children[0]
      if (onTabChange) {
        onTabChange(firstChild.id)
      }
      if (firstChild.path) {
        navigate(firstChild.path)
      }
      return
    }
    if (onTabChange) {
      onTabChange(item.id)
    }
  }

  const handleChildClick = (child: MenuItem) => {
    if (onTabChange) {
      onTabChange(child.id)
    }
    if (child.path) {
      navigate(child.path)
    }
  }

  const handleSignOut = () => {
    clearAuthSession()
    navigate(ROUTE_PATHS.login)
  }

  const initials = [profile?.firstName?.[0], profile?.lastName?.[0]]
    .filter(Boolean)
    .join('')
    .toUpperCase() || 'U'

  const displayName = [profile?.firstName, profile?.lastName].filter(Boolean).join(' ') || profile?.username || 'User'
  const displayRole = userGroup ?? group

  return (
    <aside
      className={`${collapsed ? 'w-16' : 'w-64'} transition-[width] duration-300 ease-in-out bg-[#13102b] border-r border-white/5 flex flex-col h-full shrink-0 overflow-hidden ${className}`}
    >
      {/* Logo + collapse toggle */}
      <div className={`flex items-center ${collapsed ? 'justify-center px-2 py-4' : 'justify-between px-4 py-4'}`}>
        {!collapsed && (
          <Link to={ROUTE_PATHS.home} aria-label="Go to home page" className="inline-flex">
            <Logo className="h-10" />
          </Link>
        )}
        {!disableCollapse && (
          <button
            onClick={toggleCollapsed}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors shrink-0"
          >
            <Icon name={collapsed ? 'chevron_right' : 'chevron_left'} size={16} />
          </button>
        )}
      </div>

      <nav className="flex-1 px-2 space-y-5 overflow-y-auto hide-scrollbar pt-1">
        {menuSections.map((section) => (
          <div key={section.id}>
            {/* Section title — hidden when collapsed */}
            {section.title && !collapsed ? (
              <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-white/25">
                {section.title}
              </p>
            ) : section.title && collapsed ? (
              <div className="pb-2 border-t border-white/10 mt-1" />
            ) : null}

            <div className="space-y-0.5">
              {section.items.map((item) => (
                <div key={item.id}>
                  <button
                    onClick={() => handlePrimaryItemClick(item)}
                    title={collapsed ? item.label : undefined}
                    className={`w-full flex items-center rounded-lg text-sm font-medium transition-colors ${
                      collapsed
                        ? 'justify-center px-0 py-2.5'
                        : 'justify-between gap-3 px-3 py-2.5'
                    } border border-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                      isItemExactActive(item)
                        ? 'bg-white/10 text-white'
                        : isItemActive(item)
                          ? 'text-primary'
                          : 'text-white/55 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span className={`flex items-center ${collapsed ? '' : 'gap-3'}`}>
                      <Icon name={item.icon} size={collapsed ? 20 : 16} />
                      {!collapsed && item.label}
                    </span>
                    {!collapsed && item.children?.length ? (
                      <span
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleGroup(item.id)
                        }}
                        className="cursor-pointer"
                      >
                        <Icon
                          name={effectiveExpandedGroups[item.id] ? 'expand_less' : 'expand_more'}
                          size={16}
                        />
                      </span>
                    ) : null}
                  </button>

                  {/* Child items — hidden when collapsed */}
                  {!collapsed && item.children?.length && effectiveExpandedGroups[item.id] ? (
                    <div className="ml-7 mt-0.5 space-y-0.5">
                      {item.children.map((child) => (
                        <button
                          key={child.id}
                          onClick={() => handleChildClick(child)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm border border-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 transition-colors ${
                            activeTab === child.id
                              ? 'bg-primary/20 text-white font-semibold'
                              : 'text-white/45 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          {child.label}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ))}

        {group === 'ADMIN' && (
          <>
            <div className="pt-2 pb-1">
              {!collapsed && (
                <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-white/25">Preferences</p>
              )}
              {collapsed && <div className="border-t border-white/10" />}
            </div>
            {ADMIN_PREFERENCE_ITEMS.map((item) => (
              <button
                key={item.id}
                title={collapsed ? item.label : undefined}
                onClick={() => item.path ? navigate(item.path) : (onTabChange ? onTabChange(item.id) : null)}
                className={`w-full flex items-center rounded-lg text-sm font-medium transition-colors ${
                  collapsed ? 'justify-center px-0 py-2.5' : 'gap-3 px-3 py-2.5'
                } ${
                  activeTab === item.id
                    ? 'bg-white/10 text-white'
                    : 'text-white/55 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon name={item.icon} size={collapsed ? 20 : 16} />
                {!collapsed && item.label}
              </button>
            ))}
          </>
        )}
      </nav>

      {/* Bottom user card */}
      <div className="border-t border-white/10 px-2 py-3">
        {collapsed ? (
          /* Collapsed: avatar + sign-out stacked */
          <div className="flex flex-col items-center gap-2">
            <div
              title={displayName}
              className="w-8 h-8 rounded-full bg-primary/30 text-primary text-xs font-bold flex items-center justify-center shrink-0"
            >
              {initials}
            </div>
            <button
              onClick={handleSignOut}
              title="Sign out"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <Icon name="logout" size={15} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/30 text-primary text-xs font-bold flex items-center justify-center shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{displayName}</p>
              <p className="text-[10px] text-white/40 uppercase tracking-wider">{displayRole}</p>
            </div>
            <button
              onClick={handleSignOut}
              title="Sign out"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
            >
              <Icon name="logout" size={15} />
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}
