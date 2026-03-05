import { useEffect, useState } from "react";
import { Icon } from "../../../components/ui/Icon";
import { motion } from "framer-motion";

export function HeroSection() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mediaQuery.matches);
    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  const backCardVariants = {
    stacked: { x: 0, y: 0, rotate: -1, opacity: 1, scale: 1 },
    split: {
      x: isMobile ? -20 : -44,
      y: isMobile ? 30 : 70,
      rotate: -1,
      opacity: 1,
      scale: 1,
    },
  };

  const frontCardVariants = {
    stacked: { x: 0, y: 0, rotate: -1, opacity: 1, scale: 1 },
    split: {
      x: isMobile ? 20 : 44,
      y: isMobile ? -12 : -22,
      rotate: -1,
      opacity: 1,
      scale: 1,
    },
  };

  const topContentVariants = {
    hidden: { opacity: 0, y: 28, filter: "blur(4px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.7, ease: "easeOut" as const },
    },
  };

  const actionsVariants = {
    hidden: { opacity: 0, y: 34 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" as const, delay: 0.2 },
    },
  };

  return (
    <header className="hero">
      <div className="container  hero-grid">
        <div className="hero-copy mt-12">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={topContentVariants}
          >
            <span className="chip">Fast & Secure</span>
            <p className="hero-kicker type-overline">
              Digital Wallet & Payment Solutions
            </p>
            <h1 className="type-display">
              Instant & Reliable <br />
              <span className="text-primary">Bill Payments</span>
            </h1>
            <p className="type-body-lg text-muted">
              Say goodbye to long queues and late fees. Pay your utility,
              medical, insurance, and internet bills instantly from anywhere,
              anytime.
            </p>
          </motion.div>

          <motion.div
            className="hero-actions"
            initial="hidden"
            animate="visible"
            variants={actionsVariants}
          >
            <a href="#pay-now" className="button button-lg hero-cta-solid-hero">
              Get Started Now
            </a>
            <button type="button" className="button button-outline button-lg">
              <Icon name="play_circle" className="text-primary" />
              Watch Tutorial
            </button>
          </motion.div>
        </div>

        <div className="hero-image-wrap">
          <motion.div
            className="hero-card-stack"
            aria-hidden="true"
            initial="stacked"
            whileInView="split"
            whileHover="stacked"
            viewport={{ once: false, amount: 0.5 }}
          >
            <motion.img
              src="/zesa.png"
              alt="ZESA card"
              className="hero-stack-card hero-stack-card-back"
              variants={backCardVariants}
              transition={{ duration: 0.55, ease: "easeOut", delay: 0.05 }}
            />
            <motion.img
              src="/econet.png"
              alt="Econet card"
              className="hero-stack-card hero-stack-card-front"
              variants={frontCardVariants}
              transition={{ duration: 0.55, ease: "easeOut" }}
            />
          </motion.div>
        </div>
      </div>
    </header>
  );
}
