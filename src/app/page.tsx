import { AppFooter } from "@/components/app-footer";
import { CtaBanner } from "@/components/cta-banner";
import { CurriculumShowcase } from "@/components/curriculum-showcase";
import { HowItWorks } from "@/components/how-it-works";
import { StarterHero } from "@/components/starter-hero";

export default function Home() {
  return (
    <main id="main-content" className="flex flex-1 flex-col">
      <StarterHero />
      <HowItWorks />
      <CurriculumShowcase />
      <CtaBanner />
      <AppFooter />
    </main>
  );
}
