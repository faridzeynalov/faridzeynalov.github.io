import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { HeroIntro } from "@/components/sections/hero-intro";
import { HeroShowcase, type ShowcaseItem } from "@/components/sections/hero-showcase";
import { buttonVariants } from "@/components/ui/button";
import { useProfile } from "@/data/profile";
import { Link } from "@/i18n/navigation";
import { useAppLocale } from "@/i18n/use-app-locale";
import { industryLabels, useContentOverrides } from "@/lib/content-overrides";
import { featuredOf } from "@/lib/projects";
import type { Project } from "@/types/project";

export function Hero({ projects }: { projects: Project[] }) {
  const locale = useAppLocale();
  const t = useTranslations("Hero");
  const profile = useProfile();
  const industries = industryLabels(locale, useContentOverrides());

  const showcase: ShowcaseItem[] = featuredOf(projects).flatMap((project) =>
    project.images
      ? [
          {
            slug: project.slug,
            name: project.name,
            domain: project.domain,
            industry: industries[project.industry],
            stack: project.stack,
            cover: project.images.cover,
            mobile: project.images.mobile,
          },
        ]
      : [],
  );

  const stats = [
    { value: profile.yearsOfExperience, label: t("statYears") },
    { value: profile.sitesShipped, label: t("statSites") },
    { value: String(profile.industries.length), label: t("statIndustries") },
  ];

  return (
    <section
      aria-labelledby="hero-title"
      className="relative overflow-hidden pt-28 pb-20 md:pt-36 md:pb-28"
    >
      {/* Backdrop: grid + soft accent glow */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div className="absolute inset-0 bg-grid mask-radial" />
        <div className="absolute -top-72 left-1/2 h-[54rem] w-[78rem] -translate-x-1/2 [--glow-strength:10%] glow" />
      </div>

      <div className="container-page grid items-center gap-14 lg:grid-cols-[1.05fr_1fr] lg:gap-12">
        <HeroIntro
          name={profile.name}
          badge={t("badge")}
          jobTitle={t("jobTitle")}
          tagline={t("tagline")}
          intro={t("intro", { years: profile.yearsOfExperience, sites: profile.sitesShipped })}
          actions={
            <>
              <Link href="/portfolio" className={buttonVariants({ size: "lg" })}>
                {t("viewWork")}
                <ArrowRight aria-hidden />
              </Link>
              <Link
                href="/contact"
                className={buttonVariants({ variant: "secondary", size: "lg" })}
              >
                {t("contactMe")}
              </Link>
            </>
          }
          stats={stats}
        />

        <HeroShowcase items={showcase} />
      </div>
    </section>
  );
}
