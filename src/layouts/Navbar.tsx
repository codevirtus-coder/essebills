import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { Icon } from "../components/ui/Icon";
import BrandLogo from "./BrandLogo";
import { ROUTE_PATHS, getDashboardRouteByGroup } from "../router/paths";
import {
  clearAuthSession,
  getAuthSession,
  isAuthenticated,
  subscribeToAuthChanges,
} from "../features/auth/auth.storage";

const navLinks = [
  {
    label: "Services",
    to: ROUTE_PATHS.services,
    icon: "widgets",
    reloadDocument: true,
  },
];

export function Navbar() {
  const [authenticated, setAuthenticated] = useState(() => isAuthenticated());
  const [session, setSession] = useState(() => getAuthSession());

  useEffect(() => {
    return subscribeToAuthChanges(() => {
      setAuthenticated(isAuthenticated());
      setSession(getAuthSession());
    });
  }, []);

  const handleLogout = () => {
    clearAuthSession();
  };

  const dashboardRoute = session?.group
    ? getDashboardRouteByGroup(session.group)
    : ROUTE_PATHS.portal;

  const displayName = session?.profile
    ? `${session.profile.firstName ?? ""} ${session.profile.lastName ?? ""}`.trim() ||
      session.profile.username
    : null;

  return (
    <nav className="navbar">
      <div className="container">
        <div className="nav-content nav-surface">
          <NavLink to={ROUTE_PATHS.home} aria-label="Go to homepage">
            <BrandLogo />
          </NavLink>

          <div className="nav-actions">
            {navLinks.map((link) => (
              <NavLink
                key={link.label}
                to={link.to}
                className="nav-link"
                reloadDocument={Boolean(link.reloadDocument)}
              >
                <Icon name={link.icon} className="nav-link-icon" />
                {link.label}
              </NavLink>
            ))}
            <div className="nav-divider" />
            {authenticated ? (
              <>
                {displayName ? (
                  <span className="type-label text-muted hidden sm:block">
                    {displayName}
                  </span>
                ) : null}
                <NavLink
                  to={dashboardRoute}
                  className="button button-ghost"
                >
                  Dashboard
                </NavLink>
                <button
                  type="button"
                  className="button button-outline"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink
                  to={ROUTE_PATHS.login}
                  className="button button-ghost"
                  reloadDocument
                >
                  Login
                </NavLink>
                <NavLink
                  to={ROUTE_PATHS.register}
                  className="button button-primary"
                  reloadDocument
                >
                  Register
                </NavLink>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
