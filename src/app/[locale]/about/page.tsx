import { ArrowUpRight, Download, GraduationCap, MapPin } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ScrollLitText } from "@/components/about/scroll-lit-text";
import { PageHeader } from "@/components/layout/page-header";
import { CountUp } from "@/components/motion/count-up";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { ContactCta } from "@/components/sections/contact-cta";
import { Accent, SectionHeading } from "@/components/sections/section-heading";
import { buttonVariants } from "@/components/ui/button";
import { getContent } from "@/content";
import { getSeo, getSiteProfile } from "@/lib/cms";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { localizedAlternates, localizedPath } from "@/lib/i18n-metadata";
import { withBasePath } from "@/lib/site";
import { toFileName } from "@/lib/utils";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/about">): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  // Set in the admin panel's SEO tab; the title there is used as is, without the name suffix.
  const seo = await getSeo(locale, "about");
  const profile = await getSiteProfile(locale);
  return {
    title: seo.title ? { absolute: seo.title } : t("aboutTitle"),
    description:
      seo.description ??
      t("aboutDescription", {
        name: profile.name,
        role: profile.role,
        location: profile.location,
      }),
    alternates: localizedAlternates(locale, "/about"),
    openGraph: { url: localizedPath(locale, "/about") },
  };
}

export default async function AboutPage({ params }: PageProps<"/[locale]/about">) {
  const locale = (await params).locale as Locale;
  setRequestLocale(locale);
  const t = await getTranslations("AboutPage");
  const tc = await getTranslations("Common");
  const profile = await getSiteProfile(locale);
  /** Principles drawn from the CV's summary and experience. */
  const principles = getContent(locale).principles;
  const job = profile.experience[0];
  const stats = [
    {
      value: Number.parseInt(profile.yearsOfExperience, 10),
      suffix: "+",
      label: t("statYears"),
    },
    { value: Number.parseInt(profile.sitesShipped, 10), suffix: "+", label: t("statSites") },
    { value: profile.industries.length, suffix: "", label: t("statIndustries") },
    { value: profile.languages.length, suffix: "", label: t("statLanguages") },
  ];

  return (
    <>
      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        accent={t("accent")}
        description={
          <span className="inline-flex items-center gap-2">
            <MapPin className="size-5 text-accent" aria-hidden />
            {profile.role} · {profile.location}
          </span>
        }
      />

      {/* Story — lights up as you read */}
      <section id="story" aria-label={t("story")} className="scroll-mt-24 pb-24 md:pb-32">
        <div className="container-page">
          <ScrollLitText
            text={profile.about.join(" ")}
            className="max-w-5xl text-[clamp(1.5rem,3.2vw,2.6rem)] leading-[1.3] font-medium tracking-[-0.02em] paper:text-[clamp(1.85rem,3.9vw,3.2rem)]"
          />
        </div>
      </section>

      {/* Numbers */}
      <section aria-label={t("numbers")} className="border-y border-border bg-bg-subtle/30">
        <Stagger
          as="ul"
          className="container-page grid grid-cols-2 divide-border md:grid-cols-4 md:divide-x"
          stagger={0.08}
        >
          {stats.map((stat) => (
            <StaggerItem as="li" key={stat.label} className="px-2 py-10 md:px-8 md:py-14">
              <p className="text-[clamp(2.75rem,6vw,4.5rem)] leading-none font-semibold tracking-[-0.04em]">
                <CountUp value={stat.value} suffix={stat.suffix} />
              </p>
              <p className="mt-3 text-sm text-fg-muted">{stat.label}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* Principles */}
      <section
        id="principles"
        aria-labelledby="principles-title"
        className="scroll-mt-16 py-24 md:py-32"
      >
        <div className="container-page">
          <SectionHeading
            id="principles-title"
            index="01"
            eyebrow={t("principlesEyebrow")}
            title={
              <>
                {t("principlesTitle")} <Accent>{t("principlesAccent")}</Accent>
              </>
            }
          />
          <Stagger className="mt-14 grid gap-4 md:grid-cols-3" stagger={0.12}>
            {principles.map((principle, index) => (
              <StaggerItem
                key={principle.title}
                file={toFileName(getContent("en").principles[index].title, "md")}
                className="group relative overflow-hidden rounded-2xl border border-border bg-bg-elevated p-7 transition-colors hover:border-border-strong dev:pt-15"
              >
                <span className="font-mono text-xs text-accent">0{index + 1}</span>
                <h3 className="mt-6 text-xl font-semibold tracking-tight">{principle.title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-pretty text-fg-muted">
                  {principle.text}
                </p>
                <span
                  className="absolute inset-x-7 bottom-0 h-px origin-left scale-x-0 bg-accent transition-transform duration-700 ease-out-expo group-hover:scale-x-100"
                  aria-hidden
                />
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Journey */}
      <section id="journey" aria-labelledby="journey-title" className="scroll-mt-24 pb-24 md:pb-32">
        <div className="container-page">
          <SectionHeading
            id="journey-title"
            index="02"
            eyebrow={t("journeyEyebrow")}
            title={
              <>
                {t("journeyTitle")} <Accent>{t("journeyAccent")}</Accent>
              </>
            }
          />
          <ol className="relative mt-14 border-l border-border pl-8 md:ml-[9rem] md:pl-12">
            <Reveal as="li" className="relative pb-14">
              <TimelineDot active />
              <p className="font-mono text-xs text-fg-subtle md:absolute md:top-1 md:-left-[13.5rem] md:w-40 md:text-right">
                {job.start} — {job.end}
              </p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight md:mt-0">
                {job.role} ·{" "}
                {job.companyUrl ? (
                  <a
                    href={job.companyUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-fg-muted transition-colors hover:text-fg"
                  >
                    {job.company}
                    <ArrowUpRight className="size-4" aria-hidden />
                  </a>
                ) : (
                  job.company
                )}
              </h3>
              <ul className="mt-5 max-w-2xl space-y-2.5">
                {job.highlights.slice(0, 4).map((highlight) => (
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
            </Reveal>
            {profile.education.map((entry) => (
              <Reveal as="li" key={entry.degree} className="relative pb-14 last:pb-0">
                <TimelineDot />
                <p className="font-mono text-xs text-fg-subtle md:absolute md:top-1 md:-left-[13.5rem] md:w-40 md:text-right">
                  {entry.start} — {entry.end}
                </p>
                <h3 className="mt-2 flex items-center gap-2 text-xl font-semibold tracking-tight md:mt-0">
                  <GraduationCap className="size-5 text-fg-subtle" aria-hidden />
                  {entry.degree}
                </h3>
                <p className="mt-1 text-[15px] text-fg-muted">{entry.field}</p>
                <p className="text-sm text-fg-subtle">{entry.institution}</p>
              </Reveal>
            ))}
          </ol>

          <Reveal className="mt-16 flex flex-wrap gap-3">
            <a
              href={withBasePath("/farid-zeynalov-cv.pdf")}
              download
              className={buttonVariants({ variant: "secondary" })}
            >
              <Download aria-hidden />
              {tc("downloadCv")}
            </a>
            <Link href="/cv" className={buttonVariants({ variant: "ghost" })}>
              {t("viewCv")}
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Languages */}
      <section aria-labelledby="languages-title" className="pb-8">
        <div className="container-page">
          <Reveal>
            <h2 id="languages-title" className="font-mono text-xs text-fg-subtle uppercase">
              {t("languagesTitle")}
            </h2>
          </Reveal>
          <Stagger as="ul" className="mt-6 flex flex-wrap gap-3" stagger={0.06}>
            {profile.languages.map((language) => (
              <StaggerItem
                as="li"
                key={language.name}
                className="rounded-pill border border-border bg-bg-elevated px-5 py-2.5 text-[15px]"
              >
                {language.name} <span className="text-fg-subtle">· {language.level}</span>
              </StaggerItem>
            ))}
            {profile.certificates.map((certificate) => (
              <StaggerItem
                as="li"
                key={certificate.name}
                className="rounded-pill border border-accent/40 bg-accent-soft px-5 py-2.5 text-[15px]"
              >
                {certificate.name} <span className="text-fg-subtle">· {certificate.period}</span>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <ContactCta compact />
    </>
  );
}

function TimelineDot({ active = false }: { active?: boolean }) {
  return (
    <span
      className={
        active
          ? "absolute top-1.5 -left-[calc(2rem+5px)] size-[9px] rounded-full bg-accent ring-4 ring-accent/20 md:-left-[calc(3rem+5px)]"
          : "absolute top-1.5 -left-[calc(2rem+5px)] size-[9px] rounded-full border border-border-strong bg-bg md:-left-[calc(3rem+5px)]"
      }
      aria-hidden
    />
  );
}
