import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import { useRegisterMutation } from '../auth.hooks'
import { getAuthSession } from '../auth.storage'
import { getDashboardRouteByGroup, ROUTE_PATHS } from '../../../router/paths'
import '../styles/portal-login.css'

export type PortalRegisterSubmitPayload = {
  firstName: string
  lastName: string
  username: string
  email: string
  phoneNumber?: string
  companyName?: string
  password?: string
  confirmPassword?: string
}

type PortalRegisterProps = {
  title: string
  subtitle: string
  asideTitle: string
  asideAccent: string
  asideDescription: string
  submitLabel: string
  loginPath: string
  registerNote?: string
  showCompanyField?: boolean
  includePasswordFields?: boolean
  companyFieldPlaceholder?: string
  registerAction?: (payload: PortalRegisterSubmitPayload) => Promise<unknown>
  headerExtra?: ReactNode
}

export function PortalRegister({
  title,
  subtitle,
  asideTitle,
  asideAccent,
  asideDescription,
  submitLabel,
  loginPath,
  registerNote,
  showCompanyField = false,
  includePasswordFields = false,
  companyFieldPlaceholder = 'Organization name',
  registerAction,
  headerExtra,
}: PortalRegisterProps) {
  const navigate = useNavigate()
  const registerMutation = useRegisterMutation()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  useEffect(() => {
    const existingSession = getAuthSession()
    if (existingSession) {
      navigate(getDashboardRouteByGroup(existingSession.group), { replace: true })
    }
  }, [navigate])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (includePasswordFields) {
      if (!password || !confirmPassword) {
        toast.error('Password and confirm password are required')
        return
      }
      if (password !== confirmPassword) {
        toast.error('Passwords do not match')
        return
      }
    }

    const payload: PortalRegisterSubmitPayload = {
      firstName,
      lastName,
      username,
      email,
      phoneNumber: phoneNumber || undefined,
      companyName: companyName || undefined,
      password: password || undefined,
      confirmPassword: confirmPassword || undefined,
    }

    try {
      if (registerAction) {
        await registerAction(payload)
      } else {
        await registerMutation.mutateAsync({
          firstName,
          lastName,
          username,
          email,
          groupId: 2,
          phoneNumber: phoneNumber || undefined,
        })
      }

      toast.success(registerNote ?? 'Account created. Please log in.')
      navigate(loginPath, { replace: true })
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
                {asideTitle}
                <span>{asideAccent}</span>
              </h1>
              <p className="type-body">{asideDescription}</p>
            </div>
            <Link to={ROUTE_PATHS.home} className="login-back-link">
              Back to Home
            </Link>
          </aside>

          <div className="login-pane">
            <h2 className="type-section-title">{title}</h2>
            <p className="type-body text-muted">{subtitle}</p>
            {headerExtra ? <div className="mt-4">{headerExtra}</div> : null}

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

              {showCompanyField ? (
                <input
                  type="text"
                  placeholder={companyFieldPlaceholder}
                  value={companyName}
                  onChange={(event) => setCompanyName(event.target.value)}
                  required
                />
              ) : null}

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
                placeholder="Phone number"
                value={phoneNumber}
                onChange={(event) => setPhoneNumber(event.target.value)}
                required
              />

              {includePasswordFields ? (
                <>
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    minLength={8}
                    required
                  />
                  <input
                    type="password"
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    required
                  />
                </>
              ) : null}

              <button
                type="submit"
                className="button button-primary login-submit"
                disabled={!registerAction && registerMutation.isPending}
              >
                {!registerAction && registerMutation.isPending ? 'Submitting...' : submitLabel}
              </button>
            </form>

            <div className="login-register-wrap">
              <p className="type-body text-muted">Already have an account?</p>
              <Link to={loginPath} className="register-login-link">
                Log In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
