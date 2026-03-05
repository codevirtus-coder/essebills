import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "../../../components/ui/Icon";
import { useScrollDirection } from "../../../hooks/useScrollDirection";

const services = [
  {
    icon: "electric_bolt",
    title: "Utilities",
    tagline: "Power & Water",
    description:
      "Pay ZESA prepaid tokens, ZINWA water bills, and city council rates instantly — no queues, no delays.",
    cta: "Pay Utilities",
    accent: "#4f46e5",
    accentLight: "#eef2ff",
    gradient: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
    stat: "< 3 sec",
    statLabel: "avg. settlement",
  },
  {
    icon: "sim_card",
    title: "Airtime & Data",
    tagline: "Stay Connected",
    description:
      "Top up Econet, NetOne, and Telecel airtime or buy data bundles for yourself or anyone else, anywhere.",
    cta: "Buy Airtime",
    accent: "#059669",
    accentLight: "#ecfdf5",
    gradient: "linear-gradient(135deg, #059669 0%, #0d9488 100%)",
    stat: "3 networks",
    statLabel: "supported",
  },
  {
    icon: "school",
    title: "School Fees",
    tagline: "Education Payments",
    description:
      "Pay tuition and levies for universities, colleges, and schools across Zimbabwe straight from your phone.",
    cta: "Pay Fees",
    accent: "#d97706",
    accentLight: "#fffbeb",
    gradient: "linear-gradient(135deg, #d97706 0%, #f59e0b 100%)",
    stat: "50+ schools",
    statLabel: "on platform",
  },
  {
    icon: "health_and_safety",
    title: "Insurance",
    tagline: "Cover & Medical",
    description:
      "Settle CIMAS, Nyaradzo, and other insurance premiums on time every time with automated reminders.",
    cta: "Pay Insurance",
    accent: "#dc2626",
    accentLight: "#fef2f2",
    gradient: "linear-gradient(135deg, #dc2626 0%, #e11d48 100%)",
    stat: "100% secure",
    statLabel: "transactions",
  },
  {
    icon: "local_gas_station",
    title: "Fuel & Transport",
    tagline: "On the Move",
    description:
      "Purchase fuel vouchers and transport passes without cash. Accepted at major service stations nationwide.",
    cta: "Get Voucher",
    accent: "#7c3aed",
    accentLight: "#f5f3ff",
    gradient: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
    stat: "Cashless",
    statLabel: "fuel access",
  },
  {
    icon: "volunteer_activism",
    title: "Donations",
    tagline: "Give with Impact",
    description:
      "Support NGOs, churches, and community initiatives with transparent, traceable donation flows.",
    cta: "Donate Now",
    accent: "#0284c7",
    accentLight: "#f0f9ff",
    gradient: "linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)",
    stat: "Verified",
    statLabel: "recipients",
  },
];

export function ServicesRevealSection() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const scrollDirection = useScrollDirection();
  const inViewVariant =
    scrollDirection === "down" ? "visible" : "visibleInstant";

  const containerVariants = {
    hidden: {},
    visible: { transition: { delayChildren: 0.15, staggerChildren: 0.1 } },
    visibleInstant: { transition: { delayChildren: 0, staggerChildren: 0 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 48, scale: 0.94, filter: "blur(8px)" },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 16,
        mass: 0.8,
      },
    },
    visibleInstant: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: { duration: 0 },
    },
  };

  return (
    <section className="services-reveal-section">
      <div className="container">
        <div className="section-header">
          <motion.p
            className="section-kicker type-overline"
            initial="hidden"
            whileInView={inViewVariant}
            viewport={{ once: false, amount: 0.6 }}
            variants={{
              hidden: { opacity: 0, y: 12 },
              visible: {
                opacity: 1,
                y: 0,
                transition: {
                  duration: 0.5,
                  ease: [0.22, 1, 0.36, 1] as const,
                },
              },
              visibleInstant: { opacity: 1, y: 0, transition: { duration: 0 } },
            }}
          >
            What We Offer
          </motion.p>
          <motion.h2
            className="type-section-title"
            initial="hidden"
            whileInView={inViewVariant}
            viewport={{ once: false, amount: 0.5 }}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: {
                opacity: 1,
                y: 0,
                transition: {
                  duration: 0.55,
                  ease: [0.22, 1, 0.36, 1] as const,
                  delay: 0.08,
                },
              },
              visibleInstant: { opacity: 1, y: 0, transition: { duration: 0 } },
            }}
          >
            Every bill. One platform.
          </motion.h2>
          <motion.p
            className="type-body text-muted services-reveal-subtitle"
            initial="hidden"
            whileInView={inViewVariant}
            viewport={{ once: false, amount: 0.5 }}
            variants={{
              hidden: { opacity: 0, y: 16 },
              visible: {
                opacity: 1,
                y: 0,
                transition: {
                  duration: 0.5,
                  ease: "easeOut" as const,
                  delay: 0.18,
                },
              },
              visibleInstant: { opacity: 1, y: 0, transition: { duration: 0 } },
            }}
          >
            Hover a card to discover what's possible
          </motion.p>
        </div>

        <motion.div
          className="services-reveal-grid"
          initial="hidden"
          whileInView={inViewVariant}
          viewport={{ once: false, amount: 0.18 }}
          variants={containerVariants}
        >
          {services.map((service, index) => {
            const isHovered = hoveredIndex === index;

            return (
              <motion.article
                key={service.title}
                className={`srv-card${isHovered ? " srv-card--hovered" : ""}`}
                variants={cardVariants}
                onHoverStart={() => setHoveredIndex(index)}
                onHoverEnd={() => setHoveredIndex(null)}
                style={
                  {
                    "--srv-accent": service.accent,
                    "--srv-accent-light": service.accentLight,
                  } as React.CSSProperties
                }
                whileHover={{
                  y: -6,
                  transition: { type: "spring", stiffness: 320, damping: 22 },
                }}
              >
                {/* Glowing background blob */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      className="srv-card__glow"
                      initial={{ opacity: 0, scale: 0.6 }}
                      animate={{ opacity: 1, scale: 1.15 }}
                      exit={{ opacity: 0, scale: 0.7 }}
                      transition={{ duration: 0.38, ease: "easeOut" }}
                      style={{ background: service.gradient }}
                    />
                  )}
                </AnimatePresence>

                {/* Top row: stat badge */}
                <div className="srv-card__top">
                  <AnimatePresence mode="wait">
                    {isHovered ? (
                      <motion.div
                        key="stat"
                        className="srv-card__stat-badge"
                        initial={{ opacity: 0, x: 10, scale: 0.85 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 10, scale: 0.85 }}
                        transition={{ duration: 0.22 }}
                        style={{
                          background: service.accentLight,
                          color: service.accent,
                        }}
                      >
                        <span className="srv-card__stat-value">
                          {service.stat}
                        </span>
                        <span className="srv-card__stat-label">
                          {service.statLabel}
                        </span>
                      </motion.div>
                    ) : (
                      <motion.span
                        key="tagline"
                        className="srv-card__tagline"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.18 }}
                      >
                        {service.tagline}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>

                {/* Icon */}
                <motion.div
                  className="srv-card__icon-wrap"
                  animate={
                    isHovered
                      ? {
                          background: service.gradient,
                          color: "#fff",
                          scale: 1.1,
                          rotate: -4,
                        }
                      : {
                          background: service.accentLight,
                          color: service.accent,
                          scale: 1,
                          rotate: 0,
                        }
                  }
                  transition={{ type: "spring", stiffness: 260, damping: 18 }}
                >
                  <Icon name={service.icon} />
                </motion.div>

                {/* Title */}
                <motion.h3
                  className="srv-card__title type-title-md"
                  animate={
                    isHovered ? { color: service.accent } : { color: "#0f172a" }
                  }
                  transition={{ duration: 0.22 }}
                >
                  {service.title}
                </motion.h3>

                {/* Description — only visible on hover */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.p
                      className="srv-card__description type-body"
                      initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, y: 8, filter: "blur(4px)" }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                      {service.description}
                    </motion.p>
                  )}
                </AnimatePresence>

                {/* Divider line */}
                <motion.div
                  className="srv-card__divider"
                  animate={
                    isHovered
                      ? { scaleX: 1, background: service.gradient }
                      : { scaleX: 0.45, background: "#e2e8f0" }
                  }
                  transition={{ duration: 0.32, ease: "easeOut" }}
                />

                {/* CTA row */}
                <div className="srv-card__footer">
                  <motion.button
                    className="srv-card__cta"
                    animate={
                      isHovered
                        ? {
                            background: service.gradient,
                            color: "#fff",
                            x: 0,
                            opacity: 1,
                          }
                        : {
                            background: "transparent",
                            color: service.accent,
                            x: 0,
                            opacity: 0.7,
                          }
                    }
                    transition={{ duration: 0.25 }}
                    style={{ borderColor: service.accent }}
                  >
                    <span>{service.cta}</span>
                    <motion.span
                      className="srv-card__cta-arrow"
                      animate={isHovered ? { x: 4 } : { x: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                      }}
                    >
                      <Icon name="arrow_forward" />
                    </motion.span>
                  </motion.button>
                </div>
              </motion.article>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
