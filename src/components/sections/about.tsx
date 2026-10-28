import { ArrowRight, Download, MapPin } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/motion/reveal";
import { Accent, SectionHeading } from "@/components/sections/section-heading";
import { buttonVariants } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { useProfile } from "@/data/profile";
import { withBasePath } from "@/lib/site";

export function About() {
  const t = useTranslations("AboutSection");
  const tc = useTranslations("Common");
  const profile = useProfile();
  return (
    <section id="about" aria-labelledby="about-title" className="py-24 md:py-32">
      <div className="container-page">
        <SectionHeading
          id="about-title"
          index="06"
          eyebrow={t("eyebrow")}
          title={
            <>
              {t("title")} <Accent>{t("accent")}</Accent>
            </>
          }
        />

        <div className="mt-14 grid gap-12 lg:grid-cols-12">
          <Reveal className="space-y-5 text-lg leading-relaxed text-pretty text-fg-muted lg:col-span-7">
            {profile.about.map((paragraph, index) => (
              <p key={index} className={index === 0 ? "text-xl text-fg md:text-2xl" : undefined}>
                {paragraph}
              </p>
            ))}
            <div className="flex flex-wrap gap-3 pt-4">
              <a
                href={withBasePath("/farid-zeynalov-cv.pdf")}
                download
                className={buttonVariants({ variant: "secondary" })}
              >
                <Download aria-hidden />
                {tc("downloadCv")}
                <span className="font-mono text-xs text-fg-subtle">PDF</span>
              </a>
              <Link href="/about" className={buttonVariants({ variant: "ghost" })}>
                {t("moreAboutMe")}
                <ArrowRight aria-hidden />
              </Link>
            </div>
          </Reveal>

          <Reveal delay={0.15} className="lg:col-span-5">
            <dl className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-bg-elevated">
              <Fact label={t("basedIn")}>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="size-4 text-accent" aria-hidden />
                  {profile.location}
                </span>
              </Fact>
              <Fact label={t("currently")}>{t("currentlyValue", { role: profile.role })}</Fact>
              <Fact label={t("focus")}>React, Next.js, TypeScript</Fact>
              <Fact label={t("education")}>{t("educationValue")}</Fact>
              <Fact label={t("languages")}>
                <ul className="flex flex-wrap gap-x-4 gap-y-1">
                  {profile.languages.map((language) => (
                    <li key={language.name}>
                      {language.name}{" "}
                      <span className="text-sm text-fg-subtle">· {language.level}</span>
                    </li>
                  ))}
                </ul>
              </Fact>
            </dl>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 px-6 py-4 sm:grid-cols-[7.5rem_1fr] sm:gap-4">
      <dt className="pt-0.5 font-mono text-xs text-fg-subtle uppercase">{label}</dt>
      <dd className="text-[15px] text-fg">{children}</dd>
    </div>
  );
}
