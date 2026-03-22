import { Suspense, lazy, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useReducedMotion } from "framer-motion";
import { HomeHero } from "../sections/HomeHero";
import { HomeMakeSale } from "../sections/HomeMakeSale";
import { HomeOverview } from "../sections/HomeOverview";
import { HomeForWho } from "../sections/HomeForWho";
import { HomeBannerBreak } from "../sections/HomeBannerBreak";
import { HomeHowItWorks } from "../sections/HomeHowItWorks";
import { HomeFinalCTA } from "../sections/HomeFinalCTA";
import { type IdleCallbackHandle, requestIdle, cancelIdle } from "../sections/homePageUtils";

const ChatbotWidgetLazy = lazy(() =>
  import("../components/ChatbotWidget").then((mod) => ({ default: mod.ChatbotWidget })),
);

export function HomePage() {
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();
  const [showChatbot, setShowChatbot] = useState(false);

  useEffect(() => {
    const scrollTo = (location.state as { scrollTo?: string } | null)?.scrollTo;
    if (!scrollTo) return;
    const attempt = (retries: number) => {
      const el = document.getElementById(scrollTo);
      if (el) {
        el.scrollIntoView({ behavior: shouldReduceMotion ? "auto" : "smooth" });
      } else if (retries > 0) {
        setTimeout(() => attempt(retries - 1), 150);
      }
    };
    attempt(5);
  }, [location.state, shouldReduceMotion]);

  useEffect(() => {
    let idleHandle: IdleCallbackHandle | null = null;
    const enable = () => setShowChatbot(true);
    const onFirstInteraction = () => {
      enable();
      window.removeEventListener("pointerdown", onFirstInteraction);
      window.removeEventListener("keydown", onFirstInteraction);
    };
    window.addEventListener("pointerdown", onFirstInteraction, { passive: true });
    window.addEventListener("keydown", onFirstInteraction);
    idleHandle = requestIdle(enable, 6000);
    return () => {
      window.removeEventListener("pointerdown", onFirstInteraction);
      window.removeEventListener("keydown", onFirstInteraction);
      if (idleHandle !== null) cancelIdle(idleHandle);
    };
  }, []);

  return (
    <main className="bg-white">
      <HomeHero />
      <HomeMakeSale />
      <HomeOverview />
      <HomeForWho />
      <HomeBannerBreak />
      <HomeHowItWorks />
      <HomeFinalCTA />
      <Suspense fallback={null}>
        {showChatbot && <ChatbotWidgetLazy />}
      </Suspense>
    </main>
  );
}
