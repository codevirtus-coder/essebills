
import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ADMIN_MENU_SECTIONS, ADMIN_PREFERENCE_ITEMS } from '../data/constants';
import Logo from './Logo';
import { ROUTE_PATHS } from '../../../router/paths';
import type { AdminMenuItem } from '../data/types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSignOut?: () => void;
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onSignOut,
  className = "",
}) => {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const effectiveExpandedGroups = useMemo(() => {
    const defaults: Record<string, boolean> = {};
    ADMIN_MENU_SECTIONS.forEach((section) => {
      section.items.forEach((item) => {
        if (item.children?.length) {
          defaults[item.id] = true;
        }
      });
    });
    return { ...defaults, ...expandedGroups };
  }, [expandedGroups]);

  const isItemActive = (item: AdminMenuItem) => {
    if (item.id === activeTab) return true;
    if (!item.children) return false;
    return item.children.some((child) => child.id === activeTab);
  };

  const isItemExactActive = (item: AdminMenuItem) => item.id === activeTab;

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => ({ ...prev, [groupId]: !effectiveExpandedGroups[groupId] }));
  };

  const handlePrimaryItemClick = (item: AdminMenuItem) => {
    if (item.children?.length) {
      setExpandedGroups((prev) => ({ ...prev, [item.id]: true }));
      setActiveTab(item.children[0].id);
      return;
    }
    setActiveTab(item.id);
  };

  return (
    <aside className={`w-64 bg-white  border-r border-neutral-light dark:border-white/5 flex flex-col h-full shrink-0 ${className}`}>
      <div className="p-6">
        <Link to={ROUTE_PATHS.home} aria-label="Go to home page" className="inline-flex">
          <Logo className="h-20" />
        </Link>
      </div>
      
      <nav className="flex-1 px-4 space-y-5 overflow-y-auto hide-scrollbar pt-4">
        {ADMIN_MENU_SECTIONS.map((section) => (
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
                          event.stopPropagation();
                          toggleGroup(item.id);
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
                          onClick={() => setActiveTab(child.id)}
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

        <div className="pt-2 pb-1">
          <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-neutral-text/50">Preferences</p>
        </div>
        
        {ADMIN_PREFERENCE_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
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

        {onSignOut && (
          <button
            onClick={onSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors mt-8 mb-4"
          >
            <span className="material-symbols-outlined">logout</span>
            Sign Out
          </button>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;

