import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { ChevronRight, Mouse } from "lucide-react";
import ecocashBadge from "../../../assets/ecocash-badge.svg";
import innbucksBadge from "../../../assets/innbucks-badge.svg";
import mastercardBadge from "../../../assets/mastercard-badge.svg";
import omariBadge from "../../../assets/omari-badge.svg";
import onemoneyBadge from "../../../assets/onemoney-badge.svg";
import telecashBadge from "../../../assets/telecash-badge.svg";
import zimswitchBadge from "../../../assets/zimswitch-badge.svg";
import visaBadge from "../../../assets/visa-badge.svg";
import { ROUTE_PATHS } from "../../../router/paths";
import { QuickPay } from "../../customer/components/QuickPay";

export function HomeHero() {
  const ref = useRef<HTMLElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);

  const phrases = useMemo(
    () =>
      shouldReduceMotion
        ? ["Instantly."]
        : ["Instantly.", "Ipapo Ipapo", "Khonapho Khonapho"],
    [shouldReduceMotion],
  );
  const [typedText, setTypedText] = useState(
    shouldReduceMotion ? "Instantly." : "",
  );
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [stopped, setStopped] = useState(shouldReduceMotion);

  useEffect(() => {
    if (!shouldReduceMotion) return;
    setTypedText("Instantly.");
    setPhraseIndex(0);
    setCharIndex(0);
    setDeleting(false);
    setStopped(true);
  }, [shouldReduceMotion]);

  useEffect(() => {
    if (shouldReduceMotion || stopped) return;
    const current = phrases[phraseIndex];
    const isComplete = charIndex === current.length;
    const isEmpty = charIndex === 0;
    const delay = deleting ? 50 : 90;
    const hold = isComplete && !deleting ? 900 : isEmpty && deleting ? 400 : 0;
    const timeoutId = window.setTimeout(() => {
      if (isComplete && !deleting) {
        if (phraseIndex === phrases.length - 1) {
          setTypedText("Instantly.");
          setStopped(true);
          return;
        }
        setDeleting(true);
        return;
      }
      if (isEmpty && deleting) {
        setDeleting(false);
        if (phraseIndex === phrases.length - 1) {
          setTypedText("Instantly.");
          setCharIndex(0);
          setStopped(true);
          return;
        }
        setPhraseIndex(phraseIndex + 1);
        return;
      }
      const nextIndex = deleting ? charIndex - 1 : charIndex + 1;
      setCharIndex(nextIndex);
      setTypedText(current.slice(0, nextIndex));
    }, hold || delay);
    if (!deleting && isEmpty) setTypedText("");
    return () => window.clearTimeout(timeoutId);
  }, [charIndex, deleting, phraseIndex, phrases, shouldReduceMotion, stopped]);

  return (
    <section
      ref={ref}
      className="-mt-20 relative min-h-[100svh] sm:min-h-screen flex items-center justify-center overflow-hidden"
    >
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundColor: "#10B981",
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 2000 1500'%3E%3Cdefs%3E%3Crect stroke='%2310B981' stroke-width='0.2' width='1' height='1' id='s'/%3E%3Cpattern id='a' width='3' height='3' patternUnits='userSpaceOnUse' patternTransform='scale(26.55) translate(-962.34 -721.75)'%3E%3Cuse fill='%2327bb85' href='%23s' y='2'/%3E%3Cuse fill='%2327bb85' href='%23s' x='1' y='2'/%3E%3Cuse fill='%2335bc88' href='%23s' x='2' y='2'/%3E%3Cuse fill='%2335bc88' href='%23s'/%3E%3Cuse fill='%2340be8c' href='%23s' x='2'/%3E%3Cuse fill='%2340be8c' href='%23s' x='1' y='1'/%3E%3C/pattern%3E%3Cpattern id='b' width='7' height='11' patternUnits='userSpaceOnUse' patternTransform='scale(26.55) translate(-962.34 -721.75)'%3E%3Cg fill='%234ac08f'%3E%3Cuse href='%23s'/%3E%3Cuse href='%23s' y='5' /%3E%3Cuse href='%23s' x='1' y='10'/%3E%3Cuse href='%23s' x='2' y='1'/%3E%3Cuse href='%23s' x='2' y='4'/%3E%3Cuse href='%23s' x='3' y='8'/%3E%3Cuse href='%23s' x='4' y='3'/%3E%3Cuse href='%23s' x='4' y='7'/%3E%3Cuse href='%23s' x='5' y='2'/%3E%3Cuse href='%23s' x='5' y='6'/%3E%3Cuse href='%23s' x='6' y='9'/%3E%3C/g%3E%3C/pattern%3E%3Cpattern id='h' width='5' height='13' patternUnits='userSpaceOnUse' patternTransform='scale(26.55) translate(-962.34 -721.75)'%3E%3Cg fill='%234ac08f'%3E%3Cuse href='%23s' y='5'/%3E%3Cuse href='%23s' y='8'/%3E%3Cuse href='%23s' x='1' y='1'/%3E%3Cuse href='%23s' x='1' y='9'/%3E%3Cuse href='%23s' x='1' y='12'/%3E%3Cuse href='%23s' x='2'/%3E%3Cuse href='%23s' x='2' y='4'/%3E%3Cuse href='%23s' x='3' y='2'/%3E%3Cuse href='%23s' x='3' y='6'/%3E%3Cuse href='%23s' x='3' y='11'/%3E%3Cuse href='%23s' x='4' y='3'/%3E%3Cuse href='%23s' x='4' y='7'/%3E%3Cuse href='%23s' x='4' y='10'/%3E%3C/g%3E%3C/pattern%3E%3Cpattern id='c' width='17' height='13' patternUnits='userSpaceOnUse' patternTransform='scale(26.55) translate(-962.34 -721.75)'%3E%3Cg fill='%2352c193'%3E%3Cuse href='%23s' y='11'/%3E%3Cuse href='%23s' x='2' y='9'/%3E%3Cuse href='%23s' x='5' y='12'/%3E%3Cuse href='%23s' x='9' y='4'/%3E%3Cuse href='%23s' x='12' y='1'/%3E%3Cuse href='%23s' x='16' y='6'/%3E%3C/g%3E%3C/pattern%3E%3Cpattern id='d' width='19' height='17' patternUnits='userSpaceOnUse' patternTransform='scale(26.55) translate(-962.34 -721.75)'%3E%3Cg fill='%2310B981'%3E%3Cuse href='%23s' y='9'/%3E%3Cuse href='%23s' x='16' y='5'/%3E%3Cuse href='%23s' x='14' y='2'/%3E%3Cuse href='%23s' x='11' y='11'/%3E%3Cuse href='%23s' x='6' y='14'/%3E%3C/g%3E%3Cg fill='%235ac396'%3E%3Cuse href='%23s' x='3' y='13'/%3E%3Cuse href='%23s' x='9' y='7'/%3E%3Cuse href='%23s' x='13' y='10'/%3E%3Cuse href='%23s' x='15' y='4'/%3E%3Cuse href='%23s' x='18' y='1'/%3E%3C/g%3E%3C/pattern%3E%3Cpattern id='e' width='47' height='53' patternUnits='userSpaceOnUse' patternTransform='scale(26.55) translate(-962.34 -721.75)'%3E%3Cg fill='%2310B981'%3E%3Cuse href='%23s' x='2' y='5'/%3E%3Cuse href='%23s' x='16' y='38'/%3E%3Cuse href='%23s' x='46' y='42'/%3E%3Cuse href='%23s' x='29' y='20'/%3E%3C/g%3E%3C/pattern%3E%3Cpattern id='f' width='59' height='71' patternUnits='userSpaceOnUse' patternTransform='scale(26.55) translate(-962.34 -721.75)'%3E%3Cg fill='%2310B981'%3E%3Cuse href='%23s' x='33' y='13'/%3E%3Cuse href='%23s' x='27' y='54'/%3E%3Cuse href='%23s' x='55' y='55'/%3E%3C/g%3E%3C/pattern%3E%3Cpattern id='g' width='139' height='97' patternUnits='userSpaceOnUse' patternTransform='scale(26.55) translate(-962.34 -721.75)'%3E%3Cg fill='%2310B981'%3E%3Cuse href='%23s' x='11' y='8'/%3E%3Cuse href='%23s' x='51' y='13'/%3E%3Cuse href='%23s' x='17' y='73'/%3E%3Cuse href='%23s' x='99' y='57'/%3E%3C/g%3E%3C/pattern%3E%3C/defs%3E%3Crect fill='url(%23a)' width='100%25' height='100%25'/%3E%3Crect fill='url(%23b)' width='100%25' height='100%25'/%3E%3Crect fill='url(%23h)' width='100%25' height='100%25'/%3E%3Crect fill='url(%23c)' width='100%25' height='100%25'/%3E%3Crect fill='url(%23d)' width='100%25' height='100%25'/%3E%3Crect fill='url(%23e)' width='100%25' height='100%25'/%3E%3Crect fill='url(%23f)' width='100%25' height='100%25'/%3E%3Crect fill='url(%23g)' width='100%25' height='100%25'/%3E%3C/svg%3E\")",
          backgroundAttachment: "scroll",
          backgroundSize: "cover",
          y: shouldReduceMotion ? "0%" : bgY,
        }}
      />
      {/* Vignette: darkens edges, spotlights centre */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 70% at 50% 50%, transparent 40%, rgba(5,90,60,0.45) 100%)",
        }}
      />
      <div className="absolute top-1/3 -right-20 sm:right-1/4 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-white/10 rounded-full blur-[80px] sm:blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 -left-20 sm:left-1/3 w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] bg-white/10 rounded-full blur-[60px] sm:blur-[120px] pointer-events-none" />

      <motion.div
        style={{ y: shouldReduceMotion ? "0%" : contentY }}
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8 sm:pt-32 sm:pb-12 md:pt-36 md:pb-6 w-full"
      >
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-14 items-start lg:items-center">
          {/* ── Left: Text content ── */}
          <div className="flex flex-col text-center lg:text-left">
            <motion.h1
              initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: shouldReduceMotion ? 0 : 0.7,
                ease: "easeOut",
                delay: shouldReduceMotion ? 0 : 0.1,
              }}
              className="text-[2.5rem] sm:text-[3.5rem] lg:text-[5rem] xl:text-7xl font-black text-white leading-[0.95] sm:leading-[0.9] lg:leading-[0.85] tracking-tighter mb-4 sm:mb-6"
            >
              Pay any bill.
              <br />
              <span
                className="relative text-[1.5rem] sm:text-[2.25rem] lg:text-[3.5rem] text-white"
                aria-label={typedText || phrases[phraseIndex]}
              >
                <span
                  className="invisible pointer-events-none select-none"
                  aria-hidden="true"
                >
                  Khonapho Khonapho
                </span>
                <span className="absolute left-0 top-0 h-full w-full inline-flex items-center text-white">
                  {stopped ? (
                    <motion.span
                      className="relative"
                      initial={shouldReduceMotion ? false : { opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: shouldReduceMotion ? 0 : 0.5 }}
                    >
                      {typedText}
                      <motion.span
                        className="absolute -bottom-1 left-0 h-[3px] rounded-full bg-white/70"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{
                          duration: shouldReduceMotion ? 0 : 0.5,
                          delay: shouldReduceMotion ? 0 : 0.3,
                          ease: "easeOut",
                        }}
                        aria-hidden="true"
                      />
                    </motion.span>
                  ) : (
                    <>
                      {typedText}
                      {!shouldReduceMotion && (
                        <span className="ml-0.5 w-[2px] h-[0.85em] bg-white/90 animate-pulse inline-block" />
                      )}
                    </>
                  )}
                </span>
              </span>
            </motion.h1>
            <motion.p
              initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: shouldReduceMotion ? 0 : 0.6,
                ease: "easeOut",
                delay: shouldReduceMotion ? 0 : 0.2,
              }}
              className="text-sm sm:text-base lg:text-lg text-white/80 leading-relaxed mb-6 sm:mb-8 max-w-xl mx-auto lg:mx-0"
            >
              Pay utility, mobile, education, and insurance bills instantly from
              anywhere, anytime.
            </motion.p>
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: shouldReduceMotion ? 0 : 0.6,
                ease: "easeOut",
                delay: shouldReduceMotion ? 0 : 0.3,
              }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start"
            >
              <a
                href="#pay-now"
                className="group inline-flex w-full sm:w-auto items-center justify-center gap-2 bg-white text-[#10B981] font-extrabold text-sm sm:text-base px-5 sm:px-8 py-3 sm:py-4 rounded-xl hover:bg-white/90 transition-all shadow-lg hover:-translate-y-0.5 active:translate-y-0"
              >
                Pay a Bill Now{" "}
                <ChevronRight
                  size={18}
                  className="group-hover:translate-x-0.5 transition-transform"
                />
              </a>
              <Link
                to={ROUTE_PATHS.login}
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 bg-transparent text-white font-bold text-sm sm:text-base px-5 sm:px-8 py-3 sm:py-4 rounded-xl border border-white/40 hover:bg-white/10 transition-all"
              >
                Sign In
              </Link>
            </motion.div>
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: shouldReduceMotion ? 0 : 0.5,
                delay: shouldReduceMotion ? 0 : 0.45,
              }}
              className="mt-4 sm:mt-6 flex flex-col items-center lg:items-start gap-2"
            >
              {/* Marquee — horizontal scroll on mobile */}
              <div className="w-full pt-3 sm:pt-4">
                <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
                  <div
                    className="flex gap-2 w-max"
                    style={{
                      animation: shouldReduceMotion
                        ? "none"
                        : "marquee 22s linear infinite",
                    }}
                  >
                    {[
                      { icon: visaBadge, label: "Visa" },
                      { icon: mastercardBadge, label: "Mastercard" },
                      { icon: onemoneyBadge, label: "OneMoney" },
                      { icon: ecocashBadge, label: "EcoCash" },
                      { icon: innbucksBadge, label: "InnBucks" },
                      { icon: omariBadge, label: "Omari" },
                      { icon: telecashBadge, label: "Telecash" },
                      { icon: zimswitchBadge, label: "ZimSwitch" },
                    ].map(({ icon, label }) => (
                      <img
                        key={label}
                        src={icon}
                        alt={label + " badge"}
                        loading="lazy"
                        decoding="async"
                        className="h-6 sm:h-[3rem] w-auto object-contain shrink-0 opacity-70"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
          {/*── Right: QuickPay card (hidden on mobile) ── */}
          <div
            id="quick-pay-hero"
            className="hidden lg:block w-full bg-white/95 dark:bg-slate-800/95 rounded-[2rem] border border-white/20 dark:border-white/10 shadow-2xl backdrop-blur-md p-4 lg:p-5 flex flex-col gap-4"
          >
            <div className="flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                {/* <div className="w-8 h-8 rounded-xl bg-[#10B981] flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-4 h-4 text-white"
                  >
                    <path
                      fillRule="evenodd"
                      d="M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l1.992-7.302H3.75a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.913-.143z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div> */}
                {/* <span className="font-black text-slate-900 dark:text-white text-sm tracking-tight">
                  Quick Pay
                </span> */}
              </div>
              {/* <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse inline-block" />
                Live · 24/7
              </div> */}
            </div>
            <div className="flex-1 min-h-0">
              <QuickPay />
            </div>
          </div>
        </div>
      </motion.div>
      <motion.button
        initial={shouldReduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          delay: shouldReduceMotion ? 0 : 1.2,
          duration: shouldReduceMotion ? 0 : 0.8,
        }}
        onClick={() =>
          document.getElementById("pay-now")?.scrollIntoView({
            behavior: shouldReduceMotion ? "auto" : "smooth",
          })
        }
        type="button"
        className="absolute bottom-20 left-3/4 -translate-x-1/2 hidden lg:flex flex-col items-center gap-2 text-white/50 hover:text-white/90 text-xs font-medium tracking-[0.25em] uppercase transition-colors z-20 group"
        aria-label="Scroll to services"
      >
        <div className="flex items-center gap-2">
          <Mouse className="w-4 h-4" />
          <span>Scroll</span>
        </div>
        <div className="w-px h-8 bg-gradient-to-b from-white/40 to-transparent group-hover:h-12 transition-all duration-500" />
      </motion.button>
    </section>
  );
}
