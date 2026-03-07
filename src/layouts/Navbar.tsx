import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import esebillsLogo from '../assets/esebills_logo.png';
import { ROUTE_PATHS, getDashboardRouteByGroup } from '../router/paths';
import {
  clearAuthSession,
  getAuthSession,
  isAuthenticated,
  subscribeToAuthChanges,
} from '../features/auth/auth.storage';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authenticated, setAuthenticated] = useState(() => isAuthenticated());
  const [session, setSession] = useState(() => getAuthSession());

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    return subscribeToAuthChanges(() => {
      setAuthenticated(isAuthenticated());
      setSession(getAuthSession());
    });
  }, []);

  const dashboardRoute = session?.group
    ? getDashboardRouteByGroup(session.group)
    : ROUTE_PATHS.portal;

  const displayName = session?.profile
    ? `${session.profile.firstName ?? ''} ${session.profile.lastName ?? ''}`.trim() ||
      session.profile.username
    : null;

  const navLinks = [
    { label: 'Services', to: ROUTE_PATHS.services },
    { label: 'How it Works', to: '#how-it-works' },
  ];

  return (
    <header
      className={`sticky top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-slate-900/90 backdrop-blur-md shadow-lg border-b border-white/10' : 'bg-slate-900'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <NavLink to={ROUTE_PATHS.home} aria-label="Go to homepage" className="flex items-center">
          <img src={esebillsLogo} alt="EseBills" className="h-14 w-auto brightness-0 invert" />
        </NavLink>

        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.to}
              className="text-sm text-white/85 visited:text-white/85 hover:text-white transition-colors font-medium"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {authenticated ? (
            <>
              {displayName && (
                <span className="text-sm text-slate-400 hidden lg:block">{displayName}</span>
              )}
              <NavLink
                to={dashboardRoute}
                className="text-sm font-medium text-white/85 visited:text-white/85 hover:text-white px-4 py-2 rounded-lg transition-colors"
              >
                Dashboard
              </NavLink>
              <button
                onClick={clearAuthSession}
                className="text-sm font-semibold bg-white/10 border border-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/15 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to={ROUTE_PATHS.login}
                className="text-sm font-medium text-white/85 visited:text-white/85 hover:text-white px-4 py-2 rounded-lg transition-colors"
              >
                Login
              </Link>
              <Link
                to={ROUTE_PATHS.register}
                className="text-sm font-semibold bg-emerald-600 text-white px-4 lg:px-5 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        <button
          className="md:hidden text-white p-2 -mr-1"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-slate-900 border-t border-white/10 px-4 py-4 space-y-1">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.to}
              onClick={() => setMobileOpen(false)}
              className="block text-sm text-white/85 visited:text-white/85 hover:text-white py-2.5 font-medium transition-colors"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-3 flex flex-col gap-2 border-t border-white/10">
            {authenticated ? (
              <>
                <NavLink
                  to={dashboardRoute}
                  className="text-sm font-medium text-center py-2.5 rounded-lg border border-white/20 text-white/85 visited:text-white/85 hover:text-white transition-colors"
                >
                  Dashboard
                </NavLink>
                <button
                  onClick={clearAuthSession}
                  className="text-sm font-semibold bg-white/10 text-white text-center py-2.5 rounded-lg border border-white/20"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to={ROUTE_PATHS.login}
                  className="text-sm font-medium text-center py-2.5 rounded-lg border border-white/20 text-white/85 visited:text-white/85 hover:text-white transition-colors"
                >
                  Login
                </Link>
                <Link
                  to={ROUTE_PATHS.register}
                  className="text-sm font-semibold bg-emerald-600 text-white text-center py-2.5 rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
