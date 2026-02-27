
import React, { useEffect, useMemo, useState } from 'react';
import NotificationMenu from './NotificationMenu';
import { getAuthSession, saveAuthSession } from '../../auth/auth.storage';
import { getCurrentUserProfile } from '../../auth/auth.service';
import type { UserProfileDto } from '../../auth/dto/auth.dto';

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
  const session = getAuthSession();
  const [profile, setProfile] = useState<UserProfileDto | null>(session?.profile ?? null);

  useEffect(() => {
    if (profile) return;
    let mounted = true;
    getCurrentUserProfile()
      .then((data) => {
        if (!mounted) return;
        setProfile(data);
        if (session) {
          saveAuthSession({ ...session, profile: data });
        }
      })
      .catch(() => {
        if (!mounted) return;
        setProfile(null);
      });
    return () => {
      mounted = false;
    };
  }, [profile, session]);

  const displayName = useMemo(() => {
    const first = profile?.firstName ?? '';
    const last = profile?.lastName ?? '';
    return `${first} ${last}`.trim() || profile?.username || 'User';
  }, [profile]);

  const displayRole = useMemo(() => {
    return profile?.group?.name ? profile.group.name.replace(/_/g, ' ') : 'User';
  }, [profile]);

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
      </div>
      
      <div className="flex items-center gap-4">
        <NotificationMenu />

        <div className="h-8 w-[1px] bg-neutral-light dark:bg-white/10 mx-2"></div>
        <div 
          onClick={onProfileClick}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-dark-text dark:text-white">{displayName}</p>
            <p className="text-[10px] text-neutral-text font-medium">{displayRole}</p>
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

