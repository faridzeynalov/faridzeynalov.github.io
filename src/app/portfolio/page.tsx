import type { Metadata } from "next";
import { Enter } from "@/components/motion/enter";
import { PortfolioExplorer } from "@/components/projects/portfolio-explorer";
import { ContactCta } from "@/components/sections/contact-cta";
import { Accent } from "@/components/sections/section-heading";
import { getIndustryFilters } from "@/lib/industries";
import { getAllProjects } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Portfolio",
  description:
    "Production websites built at One Studio — hotels and resorts, residential developments, healthcare, e-commerce and industrial companies.",
  alternates: { canonical: "/portfolio/" },
  openGraph: { url: "/portfolio/" },
};

export default function PortfolioPage() {
  const projects = getAllProjects();
  const stats = [
    { value: projects.length, label: "Projects" },
    { value: getIndustryFilters(projects).length, label: "Industries" },
    {
      value: projects.filter((project) => project.stack.some((item) => item.startsWith("Next.js")))
        .length,
      label: "Next.js builds",
    },
  ];

  return (
    <>
      <section className="relative overflow-hidden pt-32 pb-16 md:pt-40">
        <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
          <div className="absolute inset-0 bg-grid mask-radial" />
          <div className="absolute -top-48 left-1/4 h-[30rem] w-[40rem] rounded-full bg-accent/10 blur-[120px]" />
        </div>
        <div className="container-page">
          <Enter>
            <p className="mb-5 font-mono text-xs text-fg-subtle uppercase">
              <span className="text-accent">/</span> portfolio
            </p>
            <h1 className="max-w-4xl text-[clamp(2.75rem,7vw,5.5rem)] leading-[0.98] font-semibold tracking-[-0.045em] text-balance">
              Everything I&rsquo;ve <Accent>shipped</Accent> at One Studio.
            </h1>
          </Enter>
          <Enter delay={120} className="mt-8 grid gap-10 md:grid-cols-[1fr_auto] md:items-end">
            <p className="max-w-2xl text-lg text-pretty text-fg-muted">
              Hotels and resorts, residential developments, clinics, online stores and industrial
              companies — all live production sites. Previews are screenshots of the live websites,
              captured in October 2026.
            </p>
            <dl className="flex gap-10">
              {stats.map((stat) => (
                <div key={stat.label} className="flex flex-col-reverse gap-1">
                  <dt className="text-xs text-fg-subtle">{stat.label}</dt>
                  <dd className="text-3xl font-semibold tracking-tight tabular-nums">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          </Enter>
        </div>
      </section>

      <section aria-label="Projects" className="pb-8">
        <div className="container-page">
          <PortfolioExplorer projects={projects} />
        </div>
      </section>

      <ContactCta
        compact
        title={
          <>
            Like what you see?{" "}
            <span className="font-serif font-normal tracking-normal text-fg-muted italic">
              Let&rsquo;s work together.
            </span>
          </>
        }
      />
    </>
  );
}
