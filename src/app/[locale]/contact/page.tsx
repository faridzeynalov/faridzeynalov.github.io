import { ArrowUpRight, Download, Link2, Mail, MapPin, Phone } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { MessageComposer } from "@/components/contact/message-composer";
import { LocalTime } from "@/components/layout/local-time";
import { PageHeader } from "@/components/layout/page-header";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { CopyButton } from "@/components/ui/copy-button";
import { getProfile } from "@/data/profile";
import type { Locale } from "@/i18n/routing";
import { localizedAlternates, localizedPath } from "@/lib/i18n-metadata";
import { withBasePath } from "@/lib/site";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/contact">): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return {
    title: t("contactTitle"),
    description: t("contactDescription", { name: getProfile(locale).name }),
    alternates: localizedAlternates(locale, "/contact"),
    openGraph: { url: localizedPath(locale, "/contact") },
  };
}

export default async function ContactPage({ params }: PageProps<"/[locale]/contact">) {
  const locale = (await params).locale as Locale;
  setRequestLocale(locale);
  const t = await getTranslations("ContactPage");
  const tc = await getTranslations("Common");
  const profile = getProfile(locale);
  const linkedIn = profile.social.find((link) => link.label === "LinkedIn");

  return (
    <>
      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        accent={t("accent")}
        description={t("description")}
      >
        <p className="mt-8 inline-flex items-center gap-2.5 rounded-pill border border-border bg-bg-elevated/60 py-1.5 pr-4 pl-3 text-sm text-fg-muted backdrop-blur">
          <span className="pulse-dot size-2 rounded-full bg-emerald-500" aria-hidden />
          {t("available")}
        </p>
      </PageHeader>

      {/* Signature band: oversized marquee, alternating solid and outlined text */}
      <div
        className="group overflow-hidden border-y border-border py-6 select-none md:py-10"
        aria-hidden
      >
        <div
          className="flex w-max animate-marquee gap-10 group-hover:[animation-play-state:paused] motion-reduce:animate-none"
          style={{ "--marquee-duration": "28s" } as React.CSSProperties}
        >
          {/* Even count: the loop shifts by half, so both halves must match. */}
          {Array.from({ length: 4 }, (_, index) => (
            <span
              key={index}
              className={
                index % 2 === 0
                  ? "text-[clamp(3.5rem,10vw,9rem)] leading-none font-semibold tracking-[-0.05em] whitespace-nowrap"
                  : "font-serif text-[clamp(3.5rem,10vw,9rem)] leading-none whitespace-nowrap text-transparent italic [-webkit-text-stroke:1.5px_var(--accent)]"
              }
            >
              {t("marquee")} <span className="text-accent">✦</span>
            </span>
          ))}
        </div>
      </div>

      <section aria-label={t("getInTouch")} className="py-20 md:py-28">
        <div className="container-page grid gap-10 lg:grid-cols-12 lg:gap-14">
          <Reveal className="lg:col-span-7">
            <MessageComposer email={profile.email} />
          </Reveal>

          <div className="lg:col-span-5">
            <Stagger as="ul" className="space-y-3" stagger={0.08}>
              <StaggerItem as="li">
                <div className="group flex items-center justify-between gap-4 rounded-2xl border border-border bg-bg-elevated p-5 transition-colors hover:border-border-strong">
                  <a href={`mailto:${profile.email}`} className="flex min-w-0 items-center gap-4">
                    <IconTile>
                      <Mail aria-hidden />
                    </IconTile>
                    <span className="min-w-0">
                      <span className="block font-mono text-[11px] text-fg-subtle uppercase">
                        {t("email")}
                      </span>
                      <span className="block truncate text-[15px] text-fg">{profile.email}</span>
                    </span>
                  </a>
                  <CopyButton value={profile.email} label={tc("copyEmail")} />
                </div>
              </StaggerItem>
              <StaggerItem as="li">
                <ContactRow
                  href={`tel:${profile.phoneHref}`}
                  label={t("phone")}
                  value={profile.phone}
                  icon={<Phone aria-hidden />}
                />
              </StaggerItem>
              {linkedIn && (
                <StaggerItem as="li">
                  <ContactRow
                    href={linkedIn.href}
                    label={t("linkedin")}
                    value={linkedIn.handle}
                    icon={<Link2 aria-hidden />}
                    external
                  />
                </StaggerItem>
              )}
              <StaggerItem as="li">
                <div className="flex items-center gap-4 rounded-2xl border border-border bg-bg-elevated p-5">
                  <IconTile>
                    <MapPin aria-hidden />
                  </IconTile>
                  <span>
                    <span className="block font-mono text-[11px] text-fg-subtle uppercase">
                      {t("basedIn")}
                    </span>
                    <span className="block text-[15px] text-fg">
                      {profile.location} · <LocalTime className="font-mono text-fg-muted" /> GMT+4
                    </span>
                  </span>
                </div>
              </StaggerItem>
              <StaggerItem as="li">
                <ContactRow
                  href={withBasePath("/farid-zeynalov-cv.pdf")}
                  label={t("cv")}
                  value={tc("downloadPdf")}
                  icon={<Download aria-hidden />}
                  download
                />
              </StaggerItem>
            </Stagger>
          </div>
        </div>
      </section>
    </>
  );
}

function IconTile({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl border border-border bg-bg-subtle text-accent [&_svg]:size-[18px]">
      {children}
    </span>
  );
}

function ContactRow({
  href,
  label,
  value,
  icon,
  external = false,
  download = false,
}: {
  href: string;
  label: string;
  value: string;
  icon: React.ReactNode;
  external?: boolean;
  download?: boolean;
}) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      {...(download ? { download: true } : {})}
      className="group flex items-center gap-4 rounded-2xl border border-border bg-bg-elevated p-5 transition-[border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-border-strong"
    >
      <IconTile>{icon}</IconTile>
      <span className="min-w-0">
        <span className="block font-mono text-[11px] text-fg-subtle uppercase">{label}</span>
        <span className="block truncate text-[15px] text-fg">{value}</span>
      </span>
      <ArrowUpRight
        className="ml-auto size-4 text-fg-subtle transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent"
        aria-hidden
      />
    </a>
  );
}
