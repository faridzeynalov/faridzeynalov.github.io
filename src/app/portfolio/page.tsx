import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { PortfolioExplorer } from "@/components/projects/portfolio-explorer";
import { ContactCta } from "@/components/sections/contact-cta";
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
      <PageHeader
        eyebrow="portfolio"
        title="Portfolio"
        accent="everything I’ve shipped."
        description="Hotels and resorts, residential developments, clinics, online stores and industrial companies — all live production sites built at One Studio. Previews are screenshots of the live websites, captured in October 2026."
      >
        <dl className="mt-10 flex gap-10">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col-reverse gap-1">
              <dt className="text-xs text-fg-subtle">{stat.label}</dt>
              <dd className="text-3xl font-semibold tracking-tight tabular-nums">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </PageHeader>

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
