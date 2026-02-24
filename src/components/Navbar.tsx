import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Icon } from './Icon'
import BrandLogo from './BrandLogo'
import { ROUTE_PATHS } from '../router/paths'
import { clearAuthSession, isAuthenticated, subscribeToAuthChanges } from '../features/auth/auth.storage'

const navLinks = [
  { label: 'Services', to: ROUTE_PATHS.services, icon: 'widgets' },
  { label: 'Biller', to: ROUTE_PATHS.loginBiller, icon: 'storefront' },
  { label: 'Agent', to: ROUTE_PATHS.loginAgent, icon: 'badge' },
  { label: 'Admin', to: ROUTE_PATHS.loginAdmin, icon: 'admin_panel_settings' },
  { label: 'Buyer', to: ROUTE_PATHS.buyer, icon: 'person' },
]

export function Navbar() {
  const [authenticated, setAuthenticated] = useState(() => isAuthenticated())

  useEffect(() => {
    return subscribeToAuthChanges(() => {
      setAuthenticated(isAuthenticated())
    })
  }, [])

  const handleLogout = () => {
    clearAuthSession()
  }

  return (
    <nav className="navbar">
      <div className="container">
        <div className="nav-content nav-surface">
          <NavLink to={ROUTE_PATHS.home} aria-label="Go to homepage">
            <BrandLogo />
          </NavLink>

          <div className="nav-actions">
            {navLinks.map((link) => (
              <NavLink key={link.label} to={link.to} className="nav-link">
                <Icon name={link.icon} className="nav-link-icon" />
                {link.label}
              </NavLink>
            ))}
            <div className="nav-divider" />
            {authenticated ? (
              <button type="button" className="button button-ghost" onClick={handleLogout}>
                Logout
              </button>
            ) : (
              <>
                <NavLink to={ROUTE_PATHS.login} className="button button-ghost">
                  Login
                </NavLink>
                <NavLink to={ROUTE_PATHS.register} className="button button-primary">
                  Register
                </NavLink>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
