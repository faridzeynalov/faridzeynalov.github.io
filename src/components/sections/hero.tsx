import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { HeroIntro } from "@/components/sections/hero-intro";
import { HeroShowcase, type ShowcaseItem } from "@/components/sections/hero-showcase";
import { buttonVariants } from "@/components/ui/button";
import { profile } from "@/data/profile";
import { getIndustryLabel } from "@/lib/industries";
import { getFeaturedProjects } from "@/lib/projects";

export function Hero() {
  const showcase: ShowcaseItem[] = getFeaturedProjects().flatMap((project) =>
    project.images
      ? [
          {
            slug: project.slug,
            name: project.name,
            domain: project.domain,
            industry: getIndustryLabel(project.industry),
            stack: project.stack,
            cover: project.images.cover,
            mobile: project.images.mobile,
          },
        ]
      : [],
  );

  const stats = [
    { value: profile.yearsOfExperience, label: "years in production" },
    { value: profile.sitesShipped, label: "websites shipped" },
    { value: String(profile.industries.length), label: "industries" },
  ];

  return (
    <section
      aria-labelledby="hero-title"
      className="relative overflow-hidden pt-28 pb-20 md:pt-36 md:pb-28"
    >
      {/* Backdrop: grid + soft accent glow */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div className="absolute inset-0 bg-grid mask-radial" />
        <div className="absolute -top-40 left-1/2 h-[36rem] w-[60rem] -translate-x-1/2 rounded-full bg-accent/10 blur-[120px]" />
      </div>

      <div className="container-page grid items-center gap-14 lg:grid-cols-[1.05fr_1fr] lg:gap-12">
        <HeroIntro
          name={profile.name}
          intro={
            <>
              For the past {profile.yearsOfExperience} years at One Studio I&rsquo;ve been building
              production websites with React, Next.js and TypeScript — {profile.sitesShipped} of
              them live, for hotels, residential developers, clinics, retailers and industrial
              companies.
            </>
          }
          actions={
            <>
              <Link href="/portfolio/" className={buttonVariants({ size: "lg" })}>
                View my work
                <ArrowRight aria-hidden />
              </Link>
              <Link
                href="/#contact"
                className={buttonVariants({ variant: "secondary", size: "lg" })}
              >
                Contact me
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
