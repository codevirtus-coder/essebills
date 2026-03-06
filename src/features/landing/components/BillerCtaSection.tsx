import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useScrollDirection } from '../../../hooks/useScrollDirection'
import { ROUTE_PATHS } from '../../../router/paths'

export function BillerCtaSection() {
  const headingWords = ['Join', 'the', 'EseBills', 'Ecosystem']
  const scrollDirection = useScrollDirection()
  const inViewVariant = scrollDirection === 'down' ? 'visible' : 'visibleInstant'
  const cardsContainerVariants = {
    hidden: {},
    visible: {
      transition: {
        delayChildren: 0.18,
        staggerChildren: 0.24,
      },
    },
    visibleInstant: {
      transition: { delayChildren: 0, staggerChildren: 0 },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 78, scale: 0.9, filter: 'blur(10px) saturate(0.7)' },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: 'blur(0px) saturate(1)',
      transition: {
        type: 'spring' as const,
        stiffness: 95,
        damping: 14,
        mass: 0.85,
        when: 'beforeChildren',
        staggerChildren: 0.09,
      },
    },
    visibleInstant: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: 'blur(0px) saturate(1)',
      transition: {
        duration: 0,
        when: 'beforeChildren',
        staggerChildren: 0,
      },
    },
  }

  const cardItemVariants = {
    hidden: { opacity: 0, y: 20, filter: 'blur(3px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { duration: 0.42, ease: 'easeOut' as const },
    },
    visibleInstant: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { duration: 0 },
    },
  }

  return (
    <section className="biller-cta">
      <div className="container">
        <div className="section-header biller-cta-header">
          <motion.h2
            className="type-section-title section-animated-title landing-shared-heading"
            initial="hidden"
            whileInView={inViewVariant}
            viewport={{ once: false, amount: 0.55 }}
            variants={{
              hidden: {},
              visible: {
                transition: {
                  delayChildren: 0.08,
                  staggerChildren: 0.2,
                },
              },
              visibleInstant: {
                transition: { delayChildren: 0, staggerChildren: 0 },
              },
            }}
          >
            {headingWords.map((word, index) => (
              <motion.span
                key={`${word}-${index}`}
                className="section-animated-word"
                variants={{
                  hidden: {
                    opacity: 0.2,
                    y: 18,
                    scale: 0.94,
                    color: 'var(--landing-heading-color-muted)',
                  },
                  visible: {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    color: 'var(--landing-heading-color)',
                  },
                  visibleInstant: {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    color: 'var(--landing-heading-color)',
                    transition: { duration: 0 },
                  },
                }}
                transition={{
                  type: 'spring',
                  stiffness: 220,
                  damping: 18,
                  mass: 0.75,
                }}
              >
                {word}
              </motion.span>
            ))}
          </motion.h2>
          <motion.p
            className="type-body text-muted"
            initial="hidden"
            whileInView={inViewVariant}
            viewport={{ once: false, amount: 0.6 }}
            variants={{
              hidden: { opacity: 0, y: 14 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const, delay: 0.15 },
              },
              visibleInstant: {
                opacity: 1,
                y: 0,
                transition: { duration: 0 },
              },
            }}
          >
            Empowering individuals and businesses across the region.
          </motion.p>
        </div>

        <motion.div
          className="biller-cta-grid"
          initial="hidden"
          whileInView={inViewVariant}
          viewport={{ once: false, amount: 0.28 }}
          variants={cardsContainerVariants}
        >
          <motion.article className="biller-cta-card biller-cta-card-customer" variants={cardVariants}>
            <motion.h3 className="type-title-md landing-card-heading" variants={cardItemVariants}>
              Become a Customer
            </motion.h3>
            <motion.p className="type-body landing-card-copy" variants={cardItemVariants}>
              Pay your bills instantly, track your spending history, and manage all your accounts from one secure and
              simple dashboard.
            </motion.p>
            <motion.div variants={cardItemVariants}>
              <Link to={ROUTE_PATHS.registerBuyer} className="button biller-cta-button biller-cta-button-primary">
                Register as Customer
              </Link>
            </motion.div>
            <motion.div variants={cardItemVariants}>
              <Link to={ROUTE_PATHS.login} className="biller-cta-link type-label">
                Already a customer? Login
              </Link>
            </motion.div>
          </motion.article>

          <motion.article
            className="biller-cta-card biller-cta-card-biller"
            variants={cardVariants}
          >
            <motion.h3 className="type-title-md landing-card-heading" variants={cardItemVariants}>
              Become a Biller
            </motion.h3>
            <motion.p className="type-body landing-card-copy" variants={cardItemVariants}>
              For utility providers, schools, and corporate entities looking to digitize collections and reach more
              customers instantly.
            </motion.p>
            <motion.div variants={cardItemVariants}>
              <Link to={ROUTE_PATHS.registerBiller} className="button biller-cta-button biller-cta-button-secondary">
                Register as Biller
              </Link>
            </motion.div>
            <motion.div variants={cardItemVariants}>
              <Link to={ROUTE_PATHS.loginBiller} className="biller-cta-link type-label">
                Existing biller? Login here
              </Link>
            </motion.div>
          </motion.article>

          <motion.article
            className="biller-cta-card biller-cta-card-agent"
            variants={cardVariants}
          >
            <motion.h3 className="type-title-md landing-card-heading" variants={cardItemVariants}>
              Become an EseAgent
            </motion.h3>
            <motion.p className="type-body landing-card-copy" variants={cardItemVariants}>
              For shop owners and individuals. Sell airtime, water, and electricity tokens to earn attractive
              commissions.
            </motion.p>
            <motion.div variants={cardItemVariants}>
              <Link to={ROUTE_PATHS.registerAgent} className="button biller-cta-button biller-cta-button-primary">
                Register as EseAgent
              </Link>
            </motion.div>
            <motion.div variants={cardItemVariants}>
              <Link to={ROUTE_PATHS.loginAgent} className="biller-cta-link type-label">
                Already an agent? Login
              </Link>
            </motion.div>
          </motion.article>
        </motion.div>
      </div>
    </section>
  )
}
