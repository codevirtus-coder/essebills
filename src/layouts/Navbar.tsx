import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import esebillsLogo from "../assets/esebills_logo.png";
import { ROUTE_PATHS, getDashboardRouteByGroup } from "../router/paths";
import {
  clearAuthSession,
  getAuthSession,
  isAuthenticated,
  subscribeToAuthChanges,
} from "../features/auth/auth.storage";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authenticated, setAuthenticated] = useState(() => isAuthenticated());
  const [session, setSession] = useState(() => getAuthSession());
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isHome = pathname === "/";

  function handleHowItWorks(e: React.MouseEvent) {
    e.preventDefault();
    setMobileOpen(false);
    if (isHome) {
      document
        .getElementById("how-it-works")
        ?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate("/", { state: { scrollTo: "how-it-works" } });
    }
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
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
    ? `${session.profile.firstName ?? ""} ${session.profile.lastName ?? ""}`.trim() ||
      session.profile.username
    : null;

  const navLinks = [
    {
      label: "Services",
      to: "/#pay-now",
      onClick: undefined as ((e: React.MouseEvent) => void) | undefined,
    },
    { label: "How it Works", to: "#how-it-works", onClick: handleHowItWorks },
  ];

  return (
    <header
      className={`sticky top-0 inset-x-0 z-50 transition-all duration-500 backdrop-blur-xl border border-[#10B981]/25 shadow-[0_8px_30px_rgba(16,185,129,0.12)] ${
        scrolled || !isHome ? "bg-[#10B981]" : "bg-[#10B981]"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <NavLink
          to={ROUTE_PATHS.home}
          aria-label="Go to homepage"
          className="flex items-center"
        >
          <img
            src={esebillsLogo}
            alt="EseBills"
            className="h-24 w-auto brightness-0 invert"
          />
        </NavLink>

        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
          {navLinks.map((link) =>
            link.onClick ? (
              <a
                key={link.label}
                href={link.to}
                onClick={link.onClick}
                className="text-sm text-white/90 hover:text-white transition-colors font-medium"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.label}
                to={link.to}
                className="text-sm text-white/90 hover:text-white transition-colors font-medium"
              >
                {link.label}
              </Link>
            ),
          )}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {authenticated ? (
            <>
              {displayName && (
                <span className="text-sm text-white/80 hidden lg:block">
                  {displayName}
                </span>
              )}
              <NavLink
                to={dashboardRoute}
                className="text-sm font-medium text-white/90 hover:text-white px-4 py-2 rounded-lg transition-colors"
              >
                Dashboard
              </NavLink>
              <button
                onClick={clearAuthSession}
                className="text-sm font-semibold bg-white/15 border border-white/40 text-white px-4 py-2 rounded-lg hover:bg-white/25 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to={ROUTE_PATHS.login}
                className="text-sm font-medium text-white/90 hover:text-white px-4 py-2 rounded-lg transition-colors"
              >
                Login
              </Link>
              <Link
                to={ROUTE_PATHS.register}
                className="text-sm font-semibold bg-white text-[#10B981] px-4 lg:px-5 py-2 rounded-lg hover:bg-white/90 transition-colors"
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
        <div className="md:hidden bg-[#10B981] backdrop-blur-md border-t border-[#10B981]/25 px-4 py-4 space-y-1">
          {navLinks.map((link) =>
            link.onClick ? (
              <a
                key={link.label}
                href={link.to}
                onClick={link.onClick}
                className="block text-sm text-white/90 hover:text-white py-2.5 font-medium transition-colors"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.label}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className="block text-sm text-white/90 hover:text-white py-2.5 font-medium transition-colors"
              >
                {link.label}
              </Link>
            ),
          )}
          <div className="pt-3 flex flex-col gap-2 border-t border-white/10">
            {authenticated ? (
              <>
                <NavLink
                  to={dashboardRoute}
                  className="text-sm font-medium text-center py-2.5 rounded-lg border border-white/40 text-white/90 hover:text-white transition-colors"
                >
                  Dashboard
                </NavLink>
                <button
                  onClick={clearAuthSession}
                  className="text-sm font-semibold bg-white/15 text-white text-center py-2.5 rounded-lg border border-white/40"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to={ROUTE_PATHS.login}
                  className="text-sm font-medium text-center py-2.5 rounded-lg border border-white/40 text-white/90 hover:text-white transition-colors"
                >
                  Login
                </Link>
                <Link
                  to={ROUTE_PATHS.register}
                  className="text-sm font-semibold bg-white text-[#10B981] text-center py-2.5 rounded-lg hover:bg-white/90 transition-colors"
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
