import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import bg1 from "../../../assets/bg1.jpg";

export function HomeBannerBreak() {
  const ref = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);

  return (
    <div ref={ref} className="relative h-52 sm:h-64 overflow-hidden">
      <motion.img
        src={bg1}
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        fetchPriority="low"
        className="absolute inset-0 w-full h-full object-cover scale-110"
        style={{ y: shouldReduceMotion ? "0%" : bgY }}
      />
      <div className="absolute inset-0 bg-slate-950/70" />
      <div className="relative z-10 h-full flex items-center justify-center px-4 sm:px-6">
        <p className="text-white text-xl sm:text-2xl lg:text-4xl font-bold text-center max-w-3xl leading-tight">
          Paying bills should be{" "}
          <span className="text-[#10B981]">simple, fast, and free.</span>
        </p>
      </div>
    </div>
  );
}
