import { Link } from 'react-router-dom'
import { ROUTE_PATHS } from '../router/paths'

export function UnauthorizedPage() {
  return (
    <section className="container" style={{ padding: '8rem 0 4rem' }}>
      <h1 className="type-section-title">Unauthorized</h1>
      <p className="type-body text-muted">You do not have permission to access this dashboard.</p>
      <Link to={ROUTE_PATHS.home} className="button button-outline" style={{ marginTop: '1rem' }}>
        Back to Home
      </Link>
    </section>
  )
}
