import { ArrowUpRight, Mail, Phone } from "lucide-react";
import { OperaGame } from "@/components/chess/opera-game";
import { TacticsBoard } from "@/components/football/tactics-board";
import { Reveal } from "@/components/motion/reveal";
import { Accent, SectionEyebrow } from "@/components/sections/section-heading";
import { CopyButton } from "@/components/ui/copy-button";
import { buttonVariants } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { useProfile } from "@/data/profile";
import { cn } from "@/lib/utils";

interface ContactCtaProps {
  /** Compact variant for project pages. */
  compact?: boolean;
  title?: React.ReactNode;
}

export function ContactCta({ compact = false, title }: ContactCtaProps) {
  const t = useTranslations("ContactCta");
  const tc = useTranslations("Common");
  const profile = useProfile();
  const linkedIn = profile.social.find((link) => link.label === "LinkedIn");
  return (
    <section
      id={compact ? undefined : "contact"}
      aria-labelledby={compact ? "cta-title" : "contact-title"}
      className={cn(compact ? "py-20" : "py-24 md:py-32")}
    >
      <div className="container-page">
        <Reveal
          file="contact.sh"
          className="relative overflow-hidden rounded-[2rem] border border-border bg-bg-elevated px-6 py-14 sm:px-12 md:py-20 dev:rounded-3xl"
        >
          {/* Backdrop */}
          <div className="pointer-events-none absolute inset-0" aria-hidden>
            <div className="absolute inset-0 bg-grid mask-radial opacity-80" />
            <div className="absolute -bottom-64 left-1/2 h-[35rem] w-[64rem] -translate-x-1/2 [--glow-strength:15%] glow" />
          </div>

          <div className="relative mx-auto max-w-3xl text-center">
            {!compact && (
              <SectionEyebrow index="07" className="mx-auto mb-6 justify-center">
                {t("eyebrow")}
              </SectionEyebrow>
            )}
            <h2
              id={compact ? "cta-title" : "contact-title"}
              className="text-[clamp(2.1rem,5.5vw,4rem)] leading-[1.02] font-semibold tracking-[-0.04em] text-balance dev:text-[clamp(1.8rem,4.4vw,3.2rem)] dev:leading-[1.12] pixel:text-[calc(var(--pixel-scale)*clamp(1.2rem,3vw,2.2rem))] pixel:leading-[1.45]"
            >
              {title ?? (
                <>
                  {t("title")} <Accent>{t("accent")}</Accent>
                </>
              )}
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base text-pretty text-fg-muted md:text-lg">
              {t("text")}
            </p>

            <div className="mt-10 inline-flex max-w-full items-center gap-2 rounded-pill border border-border-strong bg-bg/85 p-1.5 pl-5">
              <a
                href={`mailto:${profile.email}`}
                className="truncate font-mono text-sm text-fg transition-colors hover:text-accent sm:text-base"
              >
                {profile.email}
              </a>
              <CopyButton value={profile.email} label={tc("copyEmail")} />
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <a href={`mailto:${profile.email}`} className={buttonVariants({ size: "lg" })}>
                <Mail aria-hidden />
                {t("emailMe")}
              </a>
              {linkedIn && (
                <a
                  href={linkedIn.href}
                  target="_blank"
                  rel="noreferrer"
                  className={buttonVariants({ variant: "secondary", size: "lg" })}
                >
                  LinkedIn
                  <ArrowUpRight aria-hidden />
                </a>
              )}
              <a
                href={`tel:${profile.phoneHref}`}
                className={buttonVariants({ variant: "ghost", size: "lg" })}
              >
                <Phone aria-hidden />
                {profile.phone}
              </a>
            </div>

            {/* Chess style only: "your move", under a board replaying a famous game. */}
            {!compact && <OperaGame className="mt-16" />}
            {/* Football style: a team move, played out on a tactics board. */}
            {!compact && <TacticsBoard className="mt-16" />}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
