import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { Icon } from "./Icon";
import BrandLogo from "./BrandLogo";
import { ROUTE_PATHS } from "../router/paths";
import {
  clearAuthSession,
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
  {
    label: "Biller",
    to: ROUTE_PATHS.biller,
    icon: "storefront",
    reloadDocument: true,
  },
  {
    label: "Agent",
    to: ROUTE_PATHS.agent,
    icon: "badge",
    reloadDocument: true,
  },
  {
    label: "Admin",
    to: ROUTE_PATHS.admin,
    icon: "admin_panel_settings",
    reloadDocument: true,
  },
  {
    label: "Buyer",
    to: ROUTE_PATHS.buyer,
    icon: "person",
    reloadDocument: true,
  },
];

export function Navbar() {
  const [authenticated, setAuthenticated] = useState(() => isAuthenticated());

  useEffect(() => {
    return subscribeToAuthChanges(() => {
      setAuthenticated(isAuthenticated());
    });
  }, []);

  const handleLogout = () => {
    clearAuthSession();
  };

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
              <button
                type="button"
                className="button button-ghost"
                onClick={handleLogout}
              >
                Logout
              </button>
            ) : (
              <>
                {/* <NavLink to={ROUTE_PATHS.login} className="button button-ghost" reloadDocument>
                  Login
                </NavLink> */}
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
