
import React from 'react';
import NotificationMenu from './NotificationMenu';

interface HeaderProps {
  onBack?: () => void;
  onProfileClick?: () => void;
  showBack?: boolean;
  onToggleMobileNav?: () => void;
  isMobileNavOpen?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  onBack,
  onProfileClick,
  showBack = true,
  onToggleMobileNav,
  isMobileNavOpen = false,
}) => {
  return (
    <header
      className="min-h-[5.25rem] md:min-h-16 bg-white border-b border-neutral-light dark:border-white/5 shadow-sm flex items-center justify-between px-4 md:px-8 sticky top-0 z-[60] py-2 md:py-0"
      style={{ paddingTop: "max(env(safe-area-inset-top), 0.5rem)" }}
    >
      <div className="flex items-center gap-4 flex-1">
        <button
          type="button"
          onClick={onToggleMobileNav}
          className="md:hidden w-10 h-10 rounded-xl bg-neutral-light text-neutral-text flex items-center justify-center"
          aria-label={isMobileNavOpen ? "Close navigation" : "Open navigation"}
        >
          <span className="material-symbols-outlined text-lg">
            {isMobileNavOpen ? "close" : "menu"}
          </span>
        </button>
        {showBack && (
          <button 
            onClick={onBack}
            className="p-2 hover:bg-neutral-light dark:hover:bg-white/5 rounded-full transition-colors text-neutral-text dark:text-gray-400 flex items-center justify-center"
            title="Go Back"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
        )}
        <div className="hidden sm:block flex-1 max-w-xl">
          <div className="h-12 bg-white dark:bg-white/5 border border-neutral-light dark:border-white/10 rounded-2xl shadow-sm shadow-neutral-light/40 px-4 flex items-center gap-3 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/40">
            <span className="text-neutral-text/55 inline-flex items-center justify-center shrink-0">
              <svg
                className="w-[18px] h-[18px]"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                <path d="M20 20L16.8 16.8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </span>
            <input 
              className="w-full h-full bg-transparent border-none p-0 text-[15px] leading-5 text-dark-text dark:text-white placeholder:text-neutral-text/55 focus:ring-0 focus:outline-none" 
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

