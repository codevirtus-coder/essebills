import { useEffect, useState, type FormEvent } from 'react'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import { useLoginMutation } from '../features/auth/auth.hooks'
import { buildAuthSession, getAuthSession, saveAuthSession } from '../features/auth/auth.storage'
import { getDashboardRouteByRole, ROUTE_PATHS } from '../router/paths'
import '../features/auth/styles/portal-login.css'

export function LoginPage() {
  const navigate = useNavigate()
  const loginMutation = useLoginMutation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    const existingSession = getAuthSession()

    if (existingSession) {
      navigate(getDashboardRouteByRole(existingSession.role), { replace: true })
    }
  }, [navigate])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      const data = await loginMutation.mutateAsync({ username, password })
      saveAuthSession(buildAuthSession(data.jwtToken, 'BUYER', data.authProvider))
      navigate(ROUTE_PATHS.home, { replace: true })
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Login failed. Check your username/password.',
      )
    }
  }

  return (
    <section className="login-shell mt-[2rem]">
      <div className="container">
        <div className="login-card">
          <aside className="login-aside">
            <div>
              <p className="login-brand">EseBills</p>
              <h1 className="login-aside-title">
                Your Wallet,
                <span>Simplified</span>
              </h1>
              <p className="type-body">
                Access your dashboard to pay bills, top up your wallet and track
                your payment history across all services instantly.
              </p>
            </div>
            <Link to={ROUTE_PATHS.home} className="login-back-link">
              Back to Home
            </Link>
          </aside>

          <div className="login-pane">
            <h2 className="type-section-title">Welcome Back</h2>
            <p className="type-body text-muted">
              Log in to manage your bills and wallet.
            </p>

            <form onSubmit={handleSubmit} className="login-form">
              <label className="type-label login-label">Email Address</label>
              <input
                type="text"
                placeholder="name@example.com"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                required
              />

              <div className="login-password-header">
                <label className="type-label login-label">Password</label>
                <button type="button" className="login-forgot">
                  Forgot?
                </button>
              </div>
              <div className="login-password-field">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="********"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                >
                  <span className="material-symbols-outlined icon-sm">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>

              <button
                type="submit"
                className="button button-primary login-submit"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending
                  ? 'Signing in to wallet...'
                  : 'Sign in to wallet'}
              </button>
            </form>
            <div className="login-register-wrap">
              <p className="type-body text-muted">
                Don&apos;t have an account yet?
              </p>
              <Link
                to={ROUTE_PATHS.register}
                className="button button-outline login-register-button"
              >
                Create free account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
