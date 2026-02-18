import BrandLogo from './BrandLogo'
import { Icon } from './Icon'
import { quickLinks, helpLinks, contacts } from '../data/siteData'

export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <BrandLogo />
            <p className="type-body-sm text-muted">
              The ultimate destination for all your bill payments. Reliable,
              secure and lightning fast settlements.
            </p>
          </div>

          <div>
            <h5 className="type-title-sm">Quick Links</h5>
            <ul>
              {quickLinks.map((item) => (
                <li key={item}>
                  <a href="#">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="type-title-sm">Help Center</h5>
            <ul>
              {helpLinks.map((item) => (
                <li key={item}>
                  <a href="#">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="type-title-sm">Contact Us</h5>
            <ul>
              {contacts.map((item) => (
                <li key={item.text} className="contact-item">
                  <Icon name={item.icon} className="text-primary" />
                  {item.text}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="footer-bottom">© 2024 EseBills. All Rights Reserved.</div>
      </div>
    </footer>
  )
}

