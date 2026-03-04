import { motion } from 'framer-motion'
import { Icon } from '../components/ui/Icon'
import { useScrollDirection } from '../hooks/useScrollDirection'
import { contacts, helpLinks, quickLinks } from '../features/landing/data/siteData'
import BrandLogo from './BrandLogo'

export function Footer() {
  const scrollDirection = useScrollDirection()
  const inViewVariant = scrollDirection === 'down' ? 'visible' : 'visibleInstant'

  const socialLinks = [
    { icon: 'instagram', href: '#' },
    { icon: 'circle-dot', href: '#' },
    { icon: 'twitter', href: '#' },
    { icon: 'linkedin', href: '#' },
  ]

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        delayChildren: 0.12,
        staggerChildren: 0.14,
      },
    },
    visibleInstant: {
      transition: { delayChildren: 0, staggerChildren: 0 },
    },
  }

  const columnVariants = {
    hidden: { opacity: 0, y: 26, filter: 'blur(6px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { duration: 0.58, ease: 'easeOut' as const },
    },
    visibleInstant: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { duration: 0 },
    },
  }

  return (
    <footer className="footer">
      <div className="container">
        <motion.div
          className="footer-grid"
          initial="hidden"
          whileInView={inViewVariant}
          viewport={{ once: false, amount: 0.25 }}
          variants={containerVariants}
        >
          <motion.div variants={columnVariants}>
            <BrandLogo />
            <p className="type-body-sm text-muted">
              The ultimate destination for all your bill payments. Reliable, secure and lightning fast settlements.
            </p>
            <div className="footer-socials">
              {socialLinks.map((social) => (
                <a key={social.icon} href={social.href} aria-label={social.icon}>
                  <Icon name={social.icon} size={16} />
                </a>
              ))}
            </div>
          </motion.div>

          <motion.div variants={columnVariants}>
            <h5 className="type-title-sm">Quick Links</h5>
            <ul>
              {quickLinks.map((item) => (
                <li key={item}>
                  <a href="#">{item}</a>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div variants={columnVariants}>
            <h5 className="type-title-sm">Help Center</h5>
            <ul>
              {helpLinks.map((item) => (
                <li key={item}>
                  <a href="#">{item}</a>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div variants={columnVariants}>
            <h5 className="type-title-sm">Contact Us</h5>
            <ul>
              {contacts.map((item) => (
                <li key={item.text} className="contact-item">
                  <Icon name={item.icon} className="text-primary" />
                  {item.text}
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>

        <motion.div
          className="footer-bottom"
          initial="hidden"
          whileInView={inViewVariant}
          viewport={{ once: false, amount: 0.4 }}
          variants={{
            hidden: { opacity: 0, y: 16 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.55, ease: 'easeOut' as const },
            },
            visibleInstant: {
              opacity: 1,
              y: 0,
              transition: { duration: 0 },
            },
          }}
        >
          © 2024 EseBills. All Rights Reserved.
        </motion.div>
      </div>
    </footer>
  )
}
