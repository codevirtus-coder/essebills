
import React from 'react';
import NotificationMenu from './NotificationMenu';

interface HeaderProps {
  onBack?: () => void;
  onProfileClick?: () => void;
  showBack?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onBack, onProfileClick, showBack = true }) => {
  return (
    <header className="h-16 bg-white  border-b border-neutral-light dark:border-white/5 shadow-sm flex items-center justify-between px-8 sticky top-0 z-[60]">
      <div className="flex items-center gap-4 flex-1">
        {showBack && (
          <button 
            onClick={onBack}
            className="p-2 hover:bg-neutral-light dark:hover:bg-white/5 rounded-full transition-colors text-neutral-text dark:text-gray-400 flex items-center justify-center"
            title="Go Back"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
        )}
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-neutral-text/50 text-xl">search</span>
            <input 
              className="w-full bg-neutral-light/50 dark:bg-white/5 border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 text-dark-text dark:text-white placeholder:text-neutral-text/50" 
              placeholder="Search transactions, users, or billers..." 
              type="text"
            />
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <NotificationMenu />

        <div className="h-8 w-[1px] bg-neutral-light dark:bg-white/10 mx-2"></div>
        <div 
          onClick={onProfileClick}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-dark-text dark:text-white">Alex Mukunda</p>
            <p className="text-[10px] text-neutral-text font-medium">System Administrator</p>
          </div>
          <div 
            className="w-10 h-10 rounded-full bg-cover bg-center border-2 border-primary/10 group-hover:scale-110 transition-transform shadow-sm" 
            style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuCX_vV9EyjAURNA75Ew1cacAmyL1_zLC_LWTvPRzXiTmbHAkcYffvlhR2Zeoj-kKY1Y07HD5H8hm4YARk10BoIWYAozXWVVvw1ndoQJ62m4t_FNG4CERZwkg6_L2bnZ74yYP_aV2fAUoLjVaAeM1IQImX8e_GnvlSW2Fnpm0-iMiwImKLnfjq36EwAVl1svXsUIVQ07jrN15SWXj9vbWAhveG64qrgsmHsaKhmnTmYNpHje8HAwJ9XEi0JXjxzfCRKnUW3xRylP6qkA')` }}
          ></div>
        </div>
      </div>
    </header>
  );
};

export default Header;

