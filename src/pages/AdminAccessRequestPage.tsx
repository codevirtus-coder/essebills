import { useState, type FormEvent } from 'react'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import { ROUTE_PATHS } from '../router/paths'
import '../features/auth/styles/portal-login.css'

export function AdminAccessRequestPage() {
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)

    await new Promise((resolve) => {
      window.setTimeout(resolve, 700)
    })

    toast.success('Access request submitted for review.')
    setIsSubmitting(false)
    navigate(ROUTE_PATHS.loginAdmin, { replace: true })
  }

  return (
    <section className="login-shell mt-[2rem]">
      <div className="container">
        <div className="login-card">
          <aside className="login-aside">
            <div>
              <p className="login-brand">EseBills</p>
              <h1 className="login-aside-title">
                Admin
                <span>Access</span>
              </h1>
              <p className="type-body">
                Request elevated access for platform administration and system
                operations.
              </p>
            </div>
            <Link to={ROUTE_PATHS.home} className="login-back-link">
              Back to Home
            </Link>
          </aside>

          <div className="login-pane">
            <h2 className="type-section-title">Request Admin Access</h2>
            <p className="type-body text-muted">
              This request is reviewed by platform security.
            </p>

            <form onSubmit={handleSubmit} className="login-form register-form">
              <input
                type="text"
                placeholder="Full name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                required
              />
              <input
                type="email"
                placeholder="Work email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
              <textarea
                placeholder="Why do you need admin access?"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                rows={4}
                required
              />

              <button
                type="submit"
                className="button button-primary login-submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </form>

            <div className="login-register-wrap">
              <p className="type-body text-muted">Already approved?</p>
              <Link to={ROUTE_PATHS.loginAdmin} className="register-login-link">
                Go to Admin Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
