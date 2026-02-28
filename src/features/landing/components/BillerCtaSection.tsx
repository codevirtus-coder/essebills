import { Link } from 'react-router-dom'
import { ROUTE_PATHS } from '../../../router/paths'

export function BillerCtaSection() {
  return (
    <section className="biller-cta">
      <div className="container">
        <div className="section-header biller-cta-header">
          <h2 className="type-section-title">Join the EseBills Ecosystem</h2>
          <p className="type-body text-muted">Empowering individuals and businesses across the region.</p>
        </div>

        <div className="biller-cta-grid">
          <article className="biller-cta-card biller-cta-card-customer">
            <h3 className="type-title-md">Become a Customer</h3>
            <p className="type-body">
              Pay your bills instantly, track your spending history, and manage all your accounts from one secure and
              simple dashboard.
            </p>
            <Link to={ROUTE_PATHS.registerBuyer} className="button biller-cta-button biller-cta-button-primary">
              Register as Customer
            </Link>
            <Link to={ROUTE_PATHS.login} className="biller-cta-link type-label">
              Already a customer? Login
            </Link>
          </article>

          <article className="biller-cta-card biller-cta-card-biller">
            <h3 className="type-title-md">Become a Biller</h3>
            <p className="type-body">
              For utility providers, schools, and corporate entities looking to digitize collections and reach more
              customers instantly.
            </p>
            <Link to={ROUTE_PATHS.registerBiller} className="button biller-cta-button biller-cta-button-secondary">
              Register as Biller
            </Link>
            <Link to={ROUTE_PATHS.loginBiller} className="biller-cta-link type-label">
              Existing biller? Login here
            </Link>
          </article>

          <article className="biller-cta-card biller-cta-card-agent">
            <h3 className="type-title-md">Become an EseAgent</h3>
            <p className="type-body">
              For shop owners and individuals. Sell airtime, water, and electricity tokens to earn attractive
              commissions.
            </p>
            <Link to={ROUTE_PATHS.registerAgent} className="button biller-cta-button biller-cta-button-primary">
              Register as EseAgent
            </Link>
            <Link to={ROUTE_PATHS.loginAgent} className="biller-cta-link type-label">
              Already an agent? Login
            </Link>
          </article>
        </div>
      </div>
    </section>
  )
}
