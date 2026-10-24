import { ArrowUpRight, Download, Link2, Mail, MapPin, Phone } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";
import { PrintButton } from "@/components/cv/print-button";
import { DrawLine, ReadingProgress } from "@/components/cv/reading-progress";
import { PromptEyebrow } from "@/components/layout/page-header";
import { Enter } from "@/components/motion/enter";
import { buttonVariants } from "@/components/ui/button";
import { getAi } from "@/data/ai";
import { getProfile } from "@/data/profile";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { localizedAlternates, localizedPath } from "@/lib/i18n-metadata";
import { getAllProjects } from "@/lib/projects";
import { withBasePath } from "@/lib/site";

export async function generateMetadata({ params }: PageProps<"/[locale]/cv">): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  const profile = getProfile(locale);
  return {
    title: t("cvTitle"),
    description: t("cvDescription", {
      name: profile.name,
      title: profile.cv.title,
      location: profile.location,
    }),
    alternates: localizedAlternates(locale, "/cv"),
    openGraph: { url: localizedPath(locale, "/cv") },
  };
}

const CV_PDF = "/farid-zeynalov-cv.pdf";

export default async function CvPage({ params }: PageProps<"/[locale]/cv">) {
  const locale = (await params).locale as Locale;
  setRequestLocale(locale);
  const t = await getTranslations("CvPage");
  const tc = await getTranslations("Common");
  const profile = getProfile(locale);
  const ai = getAi(locale);
  const projects = getAllProjects(locale);
  const linkedIn = profile.social.find((link) => link.label === "LinkedIn");

  const contacts = [
    { icon: MapPin, label: profile.location },
    { icon: Phone, label: profile.phone, href: `tel:${profile.phoneHref}` },
    { icon: Mail, label: profile.email, href: `mailto:${profile.email}` },
    ...(linkedIn
      ? [{ icon: Link2, label: `LinkedIn · ${linkedIn.handle}`, href: linkedIn.href }]
      : []),
  ];

  return (
    <div className="relative pt-28 pb-24 md:pt-36 print:p-0">
      <ReadingProgress />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[36rem] bg-grid mask-radial print:hidden"
        aria-hidden
      />

      <div className="container-page max-w-5xl print:max-w-none print:px-0">
        {/* Toolbar */}
        <Enter className="mb-6 flex flex-wrap items-center justify-between gap-4 print:hidden">
          <p>
            <PromptEyebrow>{t("eyebrow")}</PromptEyebrow>
          </p>
          <div className="flex flex-wrap gap-2">
            <PrintButton />
            <a href={withBasePath(CV_PDF)} download className={buttonVariants()}>
              <Download aria-hidden />
              {tc("downloadPdf")}
            </a>
          </div>
        </Enter>

        {/* Document */}
        <Enter
          delay={100}
          as="div"
          file="cv.md"
          className="relative overflow-hidden rounded-3xl border border-border bg-bg-elevated shadow-soft print:rounded-none print:border-0 print:shadow-none"
        >
          <article aria-labelledby="cv-name">
            <header className="border-b border-border px-6 py-10 sm:px-10 md:px-12 print:px-0 print:py-6 dev:pt-16">
              <h1
                id="cv-name"
                className="text-[clamp(2.25rem,6vw,3.75rem)] leading-none font-semibold tracking-[-0.04em] pixel:text-[calc(var(--pixel-scale)*clamp(1.4rem,3.6vw,2.4rem))]"
              >
                {profile.name}
              </h1>
              <p className="mt-3 text-lg text-fg-muted md:text-xl">{profile.cv.title}</p>
              <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                {contacts.map(({ icon: Icon, label, href }) => (
                  <li key={label} className="inline-flex items-center gap-2 text-fg-muted">
                    <Icon className="size-4 text-accent" aria-hidden />
                    {href ? (
                      <a
                        href={href}
                        {...(href.startsWith("http")
                          ? { target: "_blank", rel: "noreferrer" }
                          : {})}
                        className="transition-colors hover:text-fg"
                      >
                        {label}
                      </a>
                    ) : (
                      label
                    )}
                  </li>
                ))}
              </ul>
            </header>

            <div className="grid md:grid-cols-[1fr_17rem] print:grid-cols-[1fr_14rem]">
              {/* Main column */}
              <div className="space-y-12 px-6 py-10 sm:px-10 md:px-12 print:space-y-8 print:px-0 print:pr-8">
                <CvSection title={t("summary")}>
                  <p className="text-[15px] leading-relaxed text-pretty text-fg-muted">
                    {profile.cv.summary}
                  </p>
                </CvSection>

                <CvSection title={t("experience")}>
                  {profile.experience.map((job) => (
                    <div key={job.company}>
                      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                        <h3 className="text-lg font-semibold tracking-tight">
                          {job.role}{" "}
                          <span className="font-normal text-fg-muted">
                            ·{" "}
                            {job.companyUrl ? (
                              <a
                                href={job.companyUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="transition-colors hover:text-fg"
                              >
                                {job.company}
                              </a>
                            ) : (
                              job.company
                            )}
                          </span>
                        </h3>
                        <p className="font-mono text-xs text-fg-subtle">
                          {job.start} — {job.end}
                        </p>
                      </div>
                      <p className="mt-0.5 text-sm text-fg-subtle">{job.location}</p>
                      <ul className="mt-4 space-y-2.5">
                        {job.highlights.map((highlight) => (
                          <li
                            key={highlight}
                            className="relative pl-5 text-[15px] text-pretty text-fg-muted"
                          >
                            <span
                              className="absolute top-[0.65em] left-0 h-px w-2.5 bg-accent"
                              aria-hidden
                            />
                            {highlight}
                          </li>
                        ))}
                      </ul>

                      <h4 className="mt-6 text-sm font-medium">{t("projects")}</h4>
                      <ul className="mt-3 flex flex-wrap gap-1.5" aria-label={t("projects")}>
                        {projects.map((project) => (
                          <li key={project.slug}>
                            <Link
                              href={`/portfolio/${project.slug}`}
                              className="inline-flex rounded-md border border-border bg-bg-subtle/60 px-2 py-1 font-mono text-[11.5px] text-fg-muted transition-colors hover:border-border-strong hover:text-fg print:bg-transparent print:text-fg"
                            >
                              {project.domain}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </CvSection>

                <CvSection title={t("education")}>
                  <ul className="space-y-6">
                    {profile.education.map((entry) => (
                      <li key={entry.degree}>
                        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                          <h3 className="font-semibold tracking-tight">{entry.degree}</h3>
                          <p className="font-mono text-xs text-fg-subtle">
                            {entry.start} — {entry.end}
                          </p>
                        </div>
                        <p className="text-[15px] text-fg-muted">{entry.field}</p>
                        <p className="text-sm text-fg-subtle">{entry.institution}</p>
                      </li>
                    ))}
                  </ul>
                </CvSection>
              </div>

              {/* Sidebar */}
              <aside className="space-y-10 border-t border-border bg-bg-subtle/40 px-6 py-10 sm:px-10 md:border-t-0 md:border-l md:px-8 print:border-0 print:bg-transparent print:px-0">
                <CvSection title={t("skills")} compact>
                  <div className="space-y-5">
                    {profile.skills.map((group) => (
                      <div key={group.title}>
                        <h3 className="text-sm font-medium">{group.title}</h3>
                        <ul className="mt-2 flex flex-wrap gap-1.5">
                          {group.items.map((item) => (
                            <li
                              key={item}
                              className="rounded-md border border-border bg-bg-elevated px-2 py-0.5 text-[12.5px] text-fg-muted"
                            >
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </CvSection>

                <CvSection title={t("ai")} compact>
                  <ul className="flex flex-wrap gap-1.5">
                    {[...ai.skills, ...ai.tools].map((item) => (
                      <li
                        key={item}
                        className="rounded-md border border-border bg-bg-elevated px-2 py-0.5 text-[12.5px] text-fg-muted"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </CvSection>

                <CvSection title={t("languages")} compact>
                  <dl className="space-y-1.5 text-sm">
                    {profile.languages.map((language) => (
                      <div key={language.name} className="flex justify-between gap-4">
                        <dt>{language.name}</dt>
                        <dd className="text-fg-subtle">{language.level}</dd>
                      </div>
                    ))}
                  </dl>
                </CvSection>

                <CvSection title={t("certificates")} compact>
                  <ul className="space-y-1.5 text-sm">
                    {profile.certificates.map((certificate) => (
                      <li key={certificate.name} className="flex justify-between gap-4">
                        <span>{certificate.name}</span>
                        <span className="text-fg-subtle">{certificate.period}</span>
                      </li>
                    ))}
                  </ul>
                </CvSection>
              </aside>
            </div>
          </article>
        </Enter>

        <p className="mt-6 text-center text-sm text-fg-subtle print:hidden">
          {t("visual")}{" "}
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-1 text-fg-muted transition-colors hover:text-fg"
          >
            {t("browse")} <ArrowUpRight className="size-3.5" aria-hidden />
          </Link>
        </p>
      </div>
    </div>
  );
}

function CvSection({
  title,
  children,
  compact = false,
}: {
  title: string;
  children: ReactNode;
  compact?: boolean;
}) {
  return (
    <section className="break-inside-avoid-page">
      <h2
        className={
          compact
            ? "mb-4 font-mono text-xs tracking-wide text-fg-subtle uppercase"
            : "mb-5 flex items-center gap-3 font-mono text-xs tracking-wide text-fg-subtle uppercase"
        }
      >
        {title}
        {!compact && (
          <span className="relative h-px flex-1 bg-border" aria-hidden>
            <DrawLine className="absolute inset-0 block bg-accent print:hidden" />
          </span>
        )}
      </h2>
      {children}
    </section>
  );
}
