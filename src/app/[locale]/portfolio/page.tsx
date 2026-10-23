import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import { PortfolioExplorer } from "@/components/projects/portfolio-explorer";
import { ContactCta } from "@/components/sections/contact-cta";
import type { Locale } from "@/i18n/routing";
import { localizedAlternates, localizedPath } from "@/lib/i18n-metadata";
import { getIndustryFilters } from "@/lib/industries";
import { getAllProjects, getIndustryLabels } from "@/lib/projects";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/portfolio">): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return {
    title: t("portfolioTitle"),
    description: t("portfolioDescription"),
    alternates: localizedAlternates(locale, "/portfolio"),
    openGraph: { url: localizedPath(locale, "/portfolio") },
  };
}

export default async function PortfolioPage({ params }: PageProps<"/[locale]/portfolio">) {
  const locale = (await params).locale as Locale;
  setRequestLocale(locale);
  const t = await getTranslations("Portfolio");
  const tCta = await getTranslations("ContactCta");
  const projects = getAllProjects(locale);
  const industryLabels = getIndustryLabels(locale);
  const stats = [
    { value: projects.length, label: t("statProjects") },
    {
      value: getIndustryFilters(projects, industryLabels, locale).length,
      label: t("statIndustries"),
    },
    {
      value: projects.filter((project) => project.stack.some((item) => item.startsWith("Next.js")))
        .length,
      label: t("statNext"),
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        accent={t("accent")}
        description={t("description")}
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

      <section aria-label={t("projectsLabel")} className="pb-8">
        <div className="container-page">
          <PortfolioExplorer projects={projects} industryLabels={industryLabels} />
        </div>
      </section>

      <ContactCta
        compact
        title={
          <>
            {tCta("portfolioTitle")}{" "}
            <span className="font-serif font-normal tracking-normal text-fg-muted italic">
              {tCta("portfolioAccent")}
            </span>
          </>
        }
      />
    </>
  );
}
