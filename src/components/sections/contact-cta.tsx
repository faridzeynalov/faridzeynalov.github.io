import { ArrowUpRight, Mail, Phone } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { CopyButton } from "@/components/ui/copy-button";
import { buttonVariants } from "@/components/ui/button";
import { profile } from "@/data/profile";
import { cn } from "@/lib/utils";

const linkedIn = profile.social.find((link) => link.label === "LinkedIn");

interface ContactCtaProps {
  /** Compact variant for project pages. */
  compact?: boolean;
  title?: React.ReactNode;
}

export function ContactCta({ compact = false, title }: ContactCtaProps) {
  return (
    <section
      id={compact ? undefined : "contact"}
      aria-labelledby={compact ? "cta-title" : "contact-title"}
      className={cn(compact ? "py-20" : "py-24 md:py-32")}
    >
      <div className="container-page">
        <Reveal className="relative overflow-hidden rounded-[2rem] border border-border bg-bg-elevated px-6 py-14 sm:px-12 md:py-20">
          {/* Backdrop */}
          <div className="pointer-events-none absolute inset-0" aria-hidden>
            <div className="absolute inset-0 bg-grid mask-radial opacity-80" />
            <div className="absolute -bottom-40 left-1/2 h-80 w-[48rem] -translate-x-1/2 rounded-full bg-accent/15 blur-[100px]" />
          </div>

          <div className="relative mx-auto max-w-3xl text-center">
            {!compact && (
              <p className="mb-6 font-mono text-xs text-fg-subtle uppercase">
                <span className="text-accent">07</span> — Contact
              </p>
            )}
            <h2
              id={compact ? "cta-title" : "contact-title"}
              className="text-[clamp(2.1rem,5.5vw,4rem)] leading-[1.02] font-semibold tracking-[-0.04em] text-balance"
            >
              {title ?? (
                <>
                  Have a role or a project in mind?{" "}
                  <span className="font-serif font-normal tracking-normal text-fg-muted italic">
                    Let&rsquo;s talk.
                  </span>
                </>
              )}
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base text-pretty text-fg-muted md:text-lg">
              I&rsquo;m looking for a mid-level front-end role and I&rsquo;m open to freelance work.
              Email is the fastest way to reach me.
            </p>

            <div className="mt-10 inline-flex max-w-full items-center gap-2 rounded-full border border-border-strong bg-bg/70 p-1.5 pl-5 backdrop-blur">
              <a
                href={`mailto:${profile.email}`}
                className="truncate font-mono text-sm text-fg transition-colors hover:text-accent sm:text-base"
              >
                {profile.email}
              </a>
              <CopyButton value={profile.email} label="Copy email address" />
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <a href={`mailto:${profile.email}`} className={buttonVariants({ size: "lg" })}>
                <Mail aria-hidden />
                Email me
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
          </div>
        </Reveal>
      </div>
    </section>
  );
}
