
import React from 'react';
import { NAV_ITEMS, PREFERENCE_ITEMS } from '../data/constants';
import Logo from './Logo';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSignOut?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onSignOut }) => {
  return (
    <aside className="w-64 bg-white  border-r border-neutral-light dark:border-white/5 flex flex-col h-full shrink-0">
      <div className="p-6">
        <Logo className="h-9" />
      </div>
      
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto hide-scrollbar pt-4">
        {NAV_ITEMS.map((item) => (
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

        <div className="pt-10 pb-4">
          <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-neutral-text/50">Preferences</p>
        </div>
        
        {PREFERENCE_ITEMS.map((item) => (
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

