import { useEffect, useState, type FormEvent } from 'react'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import { useRegisterMutation } from '../features/auth/auth.hooks'
import { getAuthSession } from '../features/auth/auth.storage'
import { getDashboardRouteByRole, ROUTE_PATHS } from '../router/paths'
import '../features/auth/styles/portal-login.css'

export function RegisterPage() {
  const navigate = useNavigate()
  const registerMutation = useRegisterMutation()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')

  useEffect(() => {
    const existingSession = getAuthSession()

    if (existingSession) {
      navigate(getDashboardRouteByRole(existingSession.role), { replace: true })
    }
  }, [navigate])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      await registerMutation.mutateAsync({
        firstName,
        lastName,
        username,
        email,
        groupId: 2,
        phoneNumber: phoneNumber || undefined,
      })
      navigate(ROUTE_PATHS.login)
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Registration failed. Check your details and try again.',
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
                Join the
                <span>Ecosystem</span>
              </h1>
              <p className="type-body">
                Unlock instant payments, financial tracking, and rewarding
                commissions for your business.
              </p>
            </div>
            <Link to={ROUTE_PATHS.home} className="login-back-link">
              Back to Home
            </Link>
          </aside>

          <div className="login-pane">
            <h2 className="type-section-title">Create Account</h2>
            <p className="type-body text-muted">
              Join thousands of users and businesses.
            </p>

            <form onSubmit={handleSubmit} className="login-form register-form">
              <div className="register-name-row">
                <input
                  type="text"
                  placeholder="First name"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  required
                />
                <input
                  type="text"
                  placeholder="Last name"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  required
                />
              </div>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                required
              />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
              <input
                type="tel"
                placeholder="Phone (optional)"
                value={phoneNumber}
                onChange={(event) => setPhoneNumber(event.target.value)}
              />

              <button
                type="submit"
                className="button button-primary login-submit"
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? 'Creating account...' : 'Create account'}
              </button>
            </form>

            <div className="login-register-wrap">
              <p className="type-body text-muted">Already have an account?</p>
              <Link to={ROUTE_PATHS.login} className="register-login-link">
                Log In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
