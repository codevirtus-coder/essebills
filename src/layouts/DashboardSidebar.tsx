import React, { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getMenuByGroup, ADMIN_PREFERENCE_ITEMS, type MenuItem, type MenuSection } from '../features/portal/menuConfig'
import Logo from '../components/ui/Logo'
import { ROUTE_PATHS } from '../router/paths'
import type { UserGroup } from '../features/auth/dto/auth.dto'
import { clearAuthSession } from '../features/auth/auth.storage'

interface DashboardSidebarProps {
  group: UserGroup
  activeTab: string
  onTabChange?: (tab: string) => void
  className?: string
}

export function DashboardSidebar({
  group,
  activeTab,
  onTabChange,
  className = '',
}: DashboardSidebarProps) {
  const navigate = useNavigate()
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})

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
      // Trigger tab change for child item
      const firstChild = item.children[0]
      if (onTabChange) {
        onTabChange(firstChild.id)
      }
      // If there's a path for the child, navigate to it
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

  return (
    <aside className={`w-64 bg-white border-r border-neutral-light dark:border-white/5 flex flex-col h-full shrink-0 ${className}`}>
      <div className="p-6">
        <Link to={ROUTE_PATHS.home} aria-label="Go to home page" className="inline-flex">
          <Logo className="h-20" />
        </Link>
      </div>
      
      <nav className="flex-1 px-4 space-y-5 overflow-y-auto hide-scrollbar pt-4">
        {menuSections.map((section) => (
          <div key={section.id}>
            {section.title ? (
              <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-neutral-text/50">
                {section.title}
              </p>
            ) : null}
            <div className="space-y-1">
              {section.items.map((item) => (
                <div key={item.id}>
                  <button
                    onClick={() => handlePrimaryItemClick(item)}
                    className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                      isItemExactActive(item)
                        ? 'bg-primary text-white'
                        : isItemActive(item)
                          ? 'bg-primary/10 text-primary border-l-4 border-primary'
                        : 'text-neutral-text dark:text-gray-400 hover:bg-neutral-light/50 dark:hover:bg-white/5'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span className="material-symbols-outlined">{item.icon}</span>
                      {item.label}
                    </span>
                    {item.children?.length ? (
                      <span
                        className="material-symbols-outlined text-base cursor-pointer"
                        onClick={(event) => {
                          event.stopPropagation()
                          toggleGroup(item.id)
                        }}
                      >
                        {effectiveExpandedGroups[item.id] ? "expand_less" : "expand_more"}
                      </span>
                    ) : null}
                  </button>
                  {item.children?.length && effectiveExpandedGroups[item.id] ? (
                    <div className="ml-8 mt-1 space-y-1">
                      {item.children.map((child) => (
                        <button
                          key={child.id}
                          onClick={() => handleChildClick(child)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                            activeTab === child.id
                              ? "bg-primary text-white font-semibold"
                              : "text-neutral-text hover:bg-neutral-light/40"
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

        {/* Show preference items for ADMIN */}
        {group === 'ADMIN' && (
          <>
            <div className="pt-2 pb-1">
              <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-neutral-text/50">Preferences</p>
            </div>
            
            {ADMIN_PREFERENCE_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => item.path ? navigate(item.path) : (onTabChange ? onTabChange(item.id) : null)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  activeTab === item.id 
                    ? 'bg-neutral-light text-dark-text border-l-4 border-primary' 
                    : 'text-neutral-text dark:text-gray-400 hover:bg-neutral-light/50 dark:hover:bg-white/5'
                }`}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </>
        )}

        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors mt-8 mb-4"
        >
          <span className="material-symbols-outlined">logout</span>
          Sign Out
        </button>
      </nav>
    </aside>
  )
}
