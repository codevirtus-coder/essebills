import { Icon } from './Icon'
import { advantageCards } from '../data/siteData'

export function AdvantagesSection() {
  return (
    <section className="advantages">
      <div className="container">
        <div className="section-header">
          <p className="section-kicker type-overline">The EseBills Advantage</p>
          <h2 className="type-section-title">Simple, fast and hassle free</h2>
        </div>

        <div className="advantages-grid">
          {advantageCards.map((card) => (
            <article key={card.title} className="advantage-card">
              <div className={`advantage-icon ${card.accent}`}>
                <Icon name={card.icon} />
              </div>
              <h3 className="type-title-md">{card.title}</h3>
              <p className="type-body text-muted">{card.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
