import { ArrowUpRight, Briefcase, GraduationCap } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { Accent, SectionHeading } from "@/components/sections/section-heading";
import { useTranslations } from "next-intl";
import { useProfile } from "@/data/profile";
import { toFileName } from "@/lib/utils";

export function Experience() {
  const t = useTranslations("Experience");
  const profile = useProfile();
  return (
    <section aria-labelledby="experience-title" className="py-24 md:py-32">
      <div className="container-page">
        <SectionHeading
          id="experience-title"
          index="05"
          eyebrow={t("eyebrow")}
          title={
            <>
              {t("title")} <Accent>{t("accent")}</Accent>
            </>
          }
        />

        <div className="mt-14 grid gap-12 lg:grid-cols-12">
          {/* Work */}
          <div className="lg:col-span-8">
            {profile.experience.map((job) => (
              <Reveal
                key={job.company}
                as="article"
                file={toFileName(job.company, "md")}
                className="relative rounded-2xl border border-border bg-bg-elevated p-6 md:p-8 dev:pt-14 dev:md:pt-16"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <span className="mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-xl border border-border bg-bg-subtle text-fg-muted">
                      <Briefcase className="size-[18px]" aria-hidden />
                    </span>
                    <div>
                      <h3 className="text-xl font-semibold tracking-tight">{job.role}</h3>
                      <p className="mt-0.5 text-fg-muted">
                        {job.companyUrl ? (
                          <a
                            href={job.companyUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 transition-colors hover:text-fg"
                          >
                            {job.company}
                            <ArrowUpRight className="size-3.5" aria-hidden />
                          </a>
                        ) : (
                          job.company
                        )}{" "}
                        · {job.location}
                      </p>
                    </div>
                  </div>
                  <p className="inline-flex items-center gap-2 rounded-pill border border-border px-3 py-1 font-mono text-xs text-fg-muted">
                    <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden />
                    {job.start} — {job.end}
                  </p>
                </div>

                <Stagger
                  as="ul"
                  className="mt-8 space-y-4 border-t border-border pt-6"
                  stagger={0.06}
                >
                  {job.highlights.map((highlight) => (
                    <StaggerItem
                      as="li"
                      key={highlight}
                      className="relative pl-6 text-[15px] text-pretty text-fg-muted"
                    >
                      <span
                        className="absolute top-[0.6em] left-0 h-px w-3 bg-accent"
                        aria-hidden
                      />
                      {highlight}
                    </StaggerItem>
                  ))}
                </Stagger>
              </Reveal>
            ))}
          </div>

          {/* Education & certificates */}
          <div className="lg:col-span-4">
            <Reveal delay={0.1}>
              <h3 className="mb-6 flex items-center gap-2 font-mono text-xs text-fg-subtle uppercase">
                <GraduationCap className="size-4" aria-hidden />
                {t("education")}
              </h3>
              <ol className="relative space-y-8 border-l border-border pl-6">
                {profile.education.map((entry) => (
                  <li key={entry.degree} className="relative">
                    <span
                      className="absolute top-1.5 -left-[calc(1.5rem+4.5px)] size-2 rounded-full border border-border-strong bg-bg"
                      aria-hidden
                    />
                    <p className="font-mono text-xs text-fg-subtle">
                      {entry.start} — {entry.end}
                    </p>
                    <p className="mt-1.5 font-medium">{entry.degree}</p>
                    <p className="text-sm text-fg-muted">{entry.field}</p>
                    <p className="mt-0.5 text-sm text-fg-subtle">{entry.institution}</p>
                  </li>
                ))}
              </ol>

              <h3 className="mt-12 mb-4 font-mono text-xs text-fg-subtle uppercase">
                {t("certificates")}
              </h3>
              <ul className="space-y-2">
                {profile.certificates.map((certificate) => (
                  <li
                    key={certificate.name}
                    className="flex items-center justify-between rounded-xl border border-border px-4 py-3 text-sm"
                  >
                    <span className="font-medium">{certificate.name}</span>
                    <span className="font-mono text-xs text-fg-subtle">{certificate.period}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
