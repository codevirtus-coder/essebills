import { Icon } from './Icon'

export function HeroSection() {
  return (
    <header className="hero">
      <div className="container hero-grid">
        <div className="hero-copy">
          <span className="chip">Fast & Secure</span>
          <p className="hero-kicker type-overline">Digital Wallet & Payment Solutions</p>
          <h1 className="type-display">
            Instant & Reliable <br />
            <span className="text-primary">Bill Payments</span>
          </h1>
          <p className="type-body-lg text-muted">
            Say goodbye to long queues and late fees. Pay your utility, medical,
            insurance, and internet bills instantly from anywhere, anytime.
          </p>
          <div className="hero-actions">
            <a href="#pay-now" className="button button-primary button-primary-cta button-lg">
              Get Started Now
            </a>
            <button type="button" className="button button-outline button-lg">
              <Icon name="play_circle" className="text-primary" />
              Watch Tutorial
            </button>
          </div>
        </div>

        <div className="hero-image-wrap">
          <div className="hero-glow hero-glow-right" />
          <div className="hero-glow hero-glow-left" />
          <div className="hero-image-shell">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuD4sL3oRU393IJofWUvu3QKo7KqlLvcB4cqJTfozFyoI7r0jTkMlUGS4LVY6irP8GSkTnqbxBEhGf2E30IcTC4fa1y14_L6zMkqYypt2xXHgg20yZ-30a0BZAk6QZMuP7rnwYx-ZM6w-JHcIdVr_THUe76eRBQnnCxS9cWlj-kIza4gHBxZFerIVesmEPsi-Dwm0MbCxiu92rjjFeWV8X_ND4YipRJ_4ghJHUGYreWn_UYdaGGSKxAUW_DpbsAqlC63zXC7X1Uqhl8"
              alt="Person managing bills on laptop"
              className="hero-image"
            />
          </div>

          <article className="floating-card floating-card-left">
            <p className="floating-title">Things to Do</p>
            <div className="floating-row">
              <span>PayNow ZESA</span>
              <strong>+$32.00</strong>
            </div>
            <div className="floating-row">
              <span>Airtime Topup</span>
              <strong>+$8.00</strong>
            </div>
          </article>
        </div>
      </div>
    </header>
  )
}
