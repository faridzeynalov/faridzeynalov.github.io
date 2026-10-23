import type { Metadata } from "next";
import { About } from "@/components/sections/about";
import { AiSection } from "@/components/sections/ai-section";
import { ContactCta } from "@/components/sections/contact-cta";
import { DomainMarquee } from "@/components/sections/domain-marquee";
import { Experience } from "@/components/sections/experience";
import { Hero } from "@/components/sections/hero";
import { SelectedWork } from "@/components/sections/selected-work";
import { Services } from "@/components/sections/services";
import { Skills } from "@/components/sections/skills";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <DomainMarquee />
      <SelectedWork />
      <Services />
      <Skills />
      <AiSection />
      <Experience />
      <About />
      <ContactCta />
    </>
  );
}
