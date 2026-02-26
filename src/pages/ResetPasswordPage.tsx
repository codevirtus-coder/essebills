import { useState, type FormEvent } from 'react'
import toast from 'react-hot-toast'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { resetPassword } from '../features/auth/auth.service'
import { ROUTE_PATHS } from '../router/paths'
import '../features/auth/styles/portal-login.css'

type PortalKey = 'buyer' | 'agent' | 'biller' | 'admin'

type ResetConfig = {
  title: string
  subtitle: string
  asideTitle: string
  asideAccent: string
  asideDescription: string
  loginPath: string
  forgotPath: string
}

const CONFIGS: Record<PortalKey, ResetConfig> = {
  buyer: {
    title: 'Reset Password',
    subtitle: 'Enter the reset token from your email and set a new password.',
    asideTitle: 'Your Wallet,',
    asideAccent: 'Simplified',
    asideDescription: 'Reset your customer account password using the reset token sent to your email.',
    loginPath: ROUTE_PATHS.buyer,
    forgotPath: ROUTE_PATHS.forgotPasswordBuyer,
  },
  agent: {
    title: 'Agent Reset Password',
    subtitle: 'Enter the reset token from your email and set a new password.',
    asideTitle: 'Agent',
    asideAccent: 'Operations',
    asideDescription: 'Reset your agent portal password securely using the reset token sent to your email.',
    loginPath: ROUTE_PATHS.loginAgent,
    forgotPath: ROUTE_PATHS.forgotPasswordAgent,
  },
  biller: {
    title: 'Biller Reset Password',
    subtitle: 'Enter the reset token from your email and set a new password.',
    asideTitle: 'Corporate',
    asideAccent: 'Collections',
    asideDescription: 'Reset your biller portal password using the reset token sent to your registered email.',
    loginPath: ROUTE_PATHS.loginBiller,
    forgotPath: ROUTE_PATHS.forgotPasswordBiller,
  },
  admin: {
    title: 'Admin Reset Password',
    subtitle: 'Enter the reset token from your email and set a new password.',
    asideTitle: 'Platform',
    asideAccent: 'Administration',
    asideDescription: 'Reset your admin password securely using the reset token sent to your email.',
    loginPath: ROUTE_PATHS.loginAdmin,
    forgotPath: ROUTE_PATHS.forgotPasswordAdmin,
  },
}

function resolvePortalKey(value?: string): PortalKey {
  if (value === 'buyer' || value === 'agent' || value === 'biller' || value === 'admin') {
    return value
  }
  return 'buyer'
}

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const { portal } = useParams<{ portal?: string }>()
  const portalKey = resolvePortalKey(portal)
  const config = CONFIGS[portalKey]

  const [resetToken, setResetToken] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!resetToken.trim() || !password || !confirmPassword) {
      toast.error('All fields are required')
      return
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    try {
      setIsSubmitting(true)
      await resetPassword({
        resetToken: resetToken.trim(),
        password,
      })
      toast.success('Password reset successful. Please log in.')
      navigate(config.loginPath, { replace: true })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to reset password')
    } finally {
      setIsSubmitting(false)
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
              <label className="type-label login-label">Reset Token</label>
              <div className="login-input-with-icon">
                <span className="material-symbols-outlined icon-sm">key</span>
                <input
                  type="text"
                  placeholder="Paste reset token from email"
                  value={resetToken}
                  onChange={(event) => setResetToken(event.target.value)}
                  required
                />
              </div>

              <label className="type-label login-label">New Password</label>
              <div className="login-password-field">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="********"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  minLength={8}
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

              <label className="type-label login-label">Confirm Password</label>
              <div className="login-password-field">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="********"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                />
                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showConfirmPassword}
                >
                  <span className="material-symbols-outlined icon-sm">
                    {showConfirmPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>

              <button
                type="submit"
                className="button button-primary login-submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>

            <div className="login-register-wrap">
              <p className="type-body text-muted">Didn&apos;t receive the email?</p>
              <Link to={config.forgotPath} className="register-login-link">
                Request Again
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
