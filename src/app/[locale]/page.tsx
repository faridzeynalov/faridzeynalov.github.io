import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { RevealReplay } from "@/components/motion/scroll-reveal";
import { About } from "@/components/sections/about";
import { AiSection } from "@/components/sections/ai-section";
import { ContactCta } from "@/components/sections/contact-cta";
import { DomainMarquee } from "@/components/sections/domain-marquee";
import { Experience } from "@/components/sections/experience";
import { Hero } from "@/components/sections/hero";
import { PortalShowcase } from "@/components/sections/portal-showcase";
import { SelectedWork } from "@/components/sections/selected-work";
import { Services } from "@/components/sections/services";
import { Skills } from "@/components/sections/skills";
import type { Locale } from "@/i18n/routing";
import { getPageSwitches, getPortalShowcase, getProjects, getServicesContent } from "@/lib/cms";
import { localizedAlternates } from "@/lib/i18n-metadata";

export async function generateMetadata({ params }: PageProps<"/[locale]">): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  return { alternates: localizedAlternates(locale, "/") };
}

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const locale = (await params).locale as Locale;
  setRequestLocale(locale);
  const [projects, { home: services }, { home: show }, portal] = await Promise.all([
    getProjects(locale),
    getServicesContent(locale),
    getPageSwitches(locale),
    getPortalShowcase(locale),
  ]);

  // On the home page, scroll animations play every time a section scrolls in and reverse
  // when you scroll back up past it.
  return (
    <RevealReplay>
      <Hero projects={projects} />
      {/* Sections can be hidden under "Səhifələr" in the admin panel. */}
      {show.marquee && <DomainMarquee projects={projects} />}
      {show.selectedWork && <SelectedWork projects={projects} />}
      {show.services && services.length > 0 && <Services services={services} />}
      {show.skills && <Skills />}
      {show.ai && <AiSection />}
      {show.experience && <Experience />}
      {show.about && <About />}
      {show.portal && <PortalShowcase content={portal} />}
      {show.contact && <ContactCta />}
    </RevealReplay>
  );
}
