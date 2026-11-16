import { AppFooter } from "@/components/app-footer";
import { StarterHero } from "@/components/starter-hero";

export default function Home() {
  return (
    <main id="main-content" className="flex flex-1 flex-col">
      <StarterHero />
      <AppFooter />
    </main>
  );
}
