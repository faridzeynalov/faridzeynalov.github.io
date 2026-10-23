import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { ContactCta } from "@/components/sections/contact-cta";
import { Accent, SectionHeading } from "@/components/sections/section-heading";
import { ProcessPath } from "@/components/services/process-path";
import { ServicesShowcase } from "@/components/services/services-showcase";
import { buttonVariants } from "@/components/ui/button";
import { services } from "@/data/services";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Front-end development, UI design, SEO & performance, AI integration, API-driven web apps and ongoing maintenance — by Farid Zeynalov.",
  alternates: { canonical: "/services/" },
  openGraph: { url: "/services/" },
};

export default function ServicesPage() {
  return (
    <>
      <PageHeader
        eyebrow="services"
        title="Services"
        accent="built to last."
        description="From the first layout to a fast, findable product in production — and the care it needs after launch. Pick one piece, or the whole journey."
      >
        <ul className="mt-10 flex flex-wrap gap-2" aria-label="Jump to a service">
          {services.map((service, index) => (
            <li key={service.id}>
              <a
                href={`#${service.id}`}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-bg-elevated/60 px-4 py-2 text-sm text-fg-muted backdrop-blur transition-colors hover:border-border-strong hover:text-fg"
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

      <ServicesShowcase />

      <section id="process" aria-labelledby="process-title" className="scroll-mt-16 py-24 md:py-32">
        <div className="container-page">
          <SectionHeading
            id="process-title"
            index="—"
            eyebrow="How I work"
            title={
              <>
                Four steps, <Accent>no surprises.</Accent>
              </>
            }
            description="A clear rhythm from first call to launch, with something you can click at every stage."
            action={
              <Link href="/contact/" className={buttonVariants({ variant: "secondary" })}>
                Start a project
                <ArrowRight aria-hidden />
              </Link>
            }
          />
          <div className="mt-16 md:mt-20">
            <ProcessPath />
          </div>
        </div>
      </section>

      <ContactCta compact />
    </>
  );
}
