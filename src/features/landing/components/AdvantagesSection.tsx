import { Icon } from '../../../components/ui/Icon'
import { motion } from 'framer-motion'
import { useScrollDirection } from '../../../hooks/useScrollDirection'
import { advantageCards } from '../data/siteData'

export function AdvantagesSection() {
  const headingWords = ['Simple,', 'fast', 'and', 'hassle', 'free']
  const scrollDirection = useScrollDirection()
  const inViewVariant = scrollDirection === 'down' ? 'visible' : 'visibleInstant'
  const cardContainerVariants = {
    hidden: {},
    visible: {
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.28,
      },
    },
    visibleInstant: {
      transition: { delayChildren: 0, staggerChildren: 0 },
    },
  }

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 78,
      scale: 0.9,
      filter: 'blur(10px) saturate(0.7)',
    },
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
      },
    },
    visibleInstant: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: 'blur(0px) saturate(1)',
      transition: { duration: 0 },
    },
  }

  const cardContentVariants = {
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
    <section className="advantages">
      <div className="container">
        <div className="section-header">
          <motion.p
            className="section-kicker type-overline"
            initial="hidden"
            whileInView={inViewVariant}
            viewport={{ once: false, amount: 0.6 }}
            variants={{
              hidden: { opacity: 0, y: 12, letterSpacing: "0.28em" },
              visible: {
                opacity: 1,
                y: 0,
                letterSpacing: "0.22em",
                transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
              },
              visibleInstant: {
                opacity: 1,
                y: 0,
                letterSpacing: "0.22em",
                transition: { duration: 0 },
              },
            }}
          >
            The EseBills Advantage
          </motion.p>
          <motion.h2
            className="type-section-title section-animated-title"
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
                    color: '#9ca3af',
                  },
                  visible: {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    color: '#0f172a',
                  },
                  visibleInstant: {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    color: '#0f172a',
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
        </div>

        <motion.div
          className="advantages-grid"
          initial="hidden"
          whileInView={inViewVariant}
          viewport={{ once: false, amount: 0.22 }}
          variants={cardContainerVariants}
        >
          {advantageCards.map((card, index) => (
            <motion.article
              key={card.title}
              className={`advantage-card${index === 0 ? ' advantage-card-spotlight' : ''}`}
              variants={cardVariants}
            >
              <motion.div
                className={`advantage-icon ${card.accent}`}
                variants={cardContentVariants}
              >
                <Icon name={card.icon} />
              </motion.div>
              <motion.h3 className="type-title-md" variants={cardContentVariants}>
                {card.title}
              </motion.h3>
              <motion.p className="type-body text-muted" variants={cardContentVariants}>
                {card.description}
              </motion.p>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
