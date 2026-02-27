import { useState, type FormEvent } from 'react'
import toast from 'react-hot-toast'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { requestPasswordReset } from '../features/auth/auth.service'
import { ROUTE_PATHS } from '../router/paths'
import '../features/auth/styles/portal-login.css'

type PortalKey = 'buyer' | 'agent' | 'biller' | 'admin'

type ForgotConfig = {
  title: string
  subtitle: string
  asideTitle: string
  asideAccent: string
  asideDescription: string
  loginPath: string
  submitLabel: string
  successMessage: string
}

const CONFIGS: Record<PortalKey, ForgotConfig> = {
  buyer: {
    title: 'Forgot Password',
    subtitle: 'Enter your email address to reset your password.',
    asideTitle: 'Your Wallet,',
    asideAccent: 'Simplified',
    asideDescription:
      'Recover your customer account access securely and continue paying bills with confidence.',
    loginPath: ROUTE_PATHS.login,
    submitLabel: 'Send reset email',
    successMessage: 'Password reset link sent. Check your email.',
  },
  agent: {
    title: 'Agent Forgot Password',
    subtitle: 'Enter your agent email to reset your password.',
    asideTitle: 'Agent',
    asideAccent: 'Operations',
    asideDescription:
      'Recover access to your field and retail agent portal securely.',
    loginPath: ROUTE_PATHS.login,
    submitLabel: 'Send reset email',
    successMessage: 'Password reset link sent. Check your email.',
  },
  biller: {
    title: 'Biller Forgot Password',
    subtitle: 'Enter your biller admin email to reset your password.',
    asideTitle: 'Corporate',
    asideAccent: 'Collections',
    asideDescription:
      'Recover access to your biller portal and continue managing collections.',
    loginPath: ROUTE_PATHS.login,
    submitLabel: 'Send reset email',
    successMessage: 'Password reset link sent. Check your email.',
  },
  admin: {
    title: 'Admin Forgot Password',
    subtitle: 'Enter your admin email to reset your password.',
    asideTitle: 'Platform',
    asideAccent: 'Administration',
    asideDescription:
      'Recover your secure admin portal access using your registered email.',
    loginPath: ROUTE_PATHS.login,
    submitLabel: 'Send reset email',
    successMessage: 'Password reset link sent. Check your email.',
  },
}

function resolvePortalKey(value?: string): PortalKey {
  if (value === 'agent' || value === 'biller' || value === 'admin' || value === 'buyer') {
    return value
  }
  return 'buyer'
}

export function ForgotPasswordPage() {
  const navigate = useNavigate()
  const { portal } = useParams<{ portal?: string }>()
  const portalKey = resolvePortalKey(portal)
  const config = CONFIGS[portalKey]
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      setIsSubmitting(true)
      await requestPasswordReset(email.trim())
      toast.success(config.successMessage)
      navigate(ROUTE_PATHS.home, { replace: true })
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to request password reset',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="login-shell">
      <div className="container">
        <div className="login-card">
          <aside className="login-aside">
            <div>
              <p className="login-brand">EseBills</p>
              <h1 className="login-aside-title">
                {config.asideTitle}
                <span>{config.asideAccent}</span>
              </h1>
              <p className="type-body">{config.asideDescription}</p>
            </div>
            <Link to={ROUTE_PATHS.home} className="login-back-link">
              Back to Home
            </Link>
          </aside>

          <div className="login-pane">
            <h2 className="type-section-title">{config.title}</h2>
            <p className="type-body text-muted">{config.subtitle}</p>

            <form onSubmit={handleSubmit} className="login-form">
              <label className="type-label login-label">Email Address</label>
              <div className="login-input-with-icon">
                <span className="material-symbols-outlined icon-sm">mail</span>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="button button-primary login-submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending...' : config.submitLabel}
              </button>
            </form>

            <div className="login-register-wrap">
              <p className="type-body text-muted">Remembered your password?</p>
              <Link to={config.loginPath} className="register-login-link">
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
