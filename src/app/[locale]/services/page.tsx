import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import { ContactCta } from "@/components/sections/contact-cta";
import { Accent, SectionHeading } from "@/components/sections/section-heading";
import { ProcessPath } from "@/components/services/process-path";
import { ServicesShowcase } from "@/components/services/services-showcase";
import { buttonVariants } from "@/components/ui/button";
import { getProcess, getServices } from "@/data/services";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { localizedAlternates, localizedPath } from "@/lib/i18n-metadata";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/services">): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return {
    title: t("servicesTitle"),
    description: t("servicesDescription"),
    alternates: localizedAlternates(locale, "/services"),
    openGraph: { url: localizedPath(locale, "/services") },
  };
}

export default async function ServicesPage({ params }: PageProps<"/[locale]/services">) {
  const locale = (await params).locale as Locale;
  setRequestLocale(locale);
  const t = await getTranslations("ServicesPage");
  const tc = await getTranslations("Common");
  const services = getServices(locale);

  return (
    <>
      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        accent={t("accent")}
        description={t("description")}
      >
        <ul className="mt-10 flex flex-wrap gap-2" aria-label={t("jump")}>
          {services.map((service, index) => (
            <li key={service.id}>
              <a
                href={`#${service.id}`}
                className="inline-flex items-center gap-2 rounded-pill border border-border bg-bg-elevated/60 px-4 py-2 text-sm text-fg-muted backdrop-blur transition-colors hover:border-border-strong hover:text-fg"
              >
                <span className="font-mono text-[11px] text-accent">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {service.title}
              </a>
            </li>
          ))}
        </ul>
      </PageHeader>

      <ServicesShowcase services={services} />

      <section id="process" aria-labelledby="process-title" className="scroll-mt-16 py-24 md:py-32">
        <div className="container-page">
          <SectionHeading
            id="process-title"
            index="—"
            eyebrow={t("processEyebrow")}
            title={
              <>
                {t("processTitle")} <Accent>{t("processAccent")}</Accent>
              </>
            }
            description={t("processDescription")}
            action={
              <Link href="/contact" className={buttonVariants({ variant: "secondary" })}>
                {tc("startProject")}
                <ArrowRight aria-hidden />
              </Link>
            }
          />
          <div className="mt-16 md:mt-20">
            <ProcessPath steps={getProcess(locale)} />
          </div>
        </div>
      </section>

      <ContactCta compact />
    </>
  );
}
