import { HeroSection } from "../components/HeroSection";
import { PaymentSection } from "../components/PaymentSection";
import { AdvantagesSection } from "../components/AdvantagesSection";
import { PartnersSection } from "../components/PartnersSection";
import { BillerCtaSection } from "../components/BillerCtaSection";

export function HomePage() {
  return (
    <>
      <HeroSection />
      <PaymentSection />
      <AdvantagesSection />
      <BillerCtaSection />
    </>
  );
}
