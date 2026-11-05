import type { ReactNode } from "react";
import { Enter } from "@/components/motion/enter";
import { KineticTitle } from "@/components/motion/split-text";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  accent?: string;
  description?: ReactNode;
  children?: ReactNode;
  className?: string;
  /** Smaller title and spacing, for app-like pages (the client portal). */
  compact?: boolean;
}

/** "/ about". In the Developer style it reads as a shell prompt: "~/farid $ cd about". */
export function PromptEyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="font-mono text-xs text-fg-subtle uppercase dev:text-sm dev:normal-case">
      <span className="text-accent dev:hidden">/</span>
      <span className="hidden dev:inline" aria-hidden>
        <span className="text-accent">~/farid</span> <span className="text-fg-muted">$</span>{" "}
        cd{" "}
      </span>
      <span className="dev:text-fg">{children}</span>
    </span>
  );
}

/** Shared top-of-page header with the kinetic split-character title. */
export function PageHeader({
  eyebrow,
  title,
  accent,
  description,
  children,
  className,
  compact,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "relative overflow-hidden",
        compact ? "pt-28 pb-10 md:pt-36 md:pb-14" : "pt-32 pb-16 md:pt-40 md:pb-20",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div className="absolute inset-0 bg-grid mask-radial" />
        <div className="absolute -top-80 left-[12%] h-[48rem] w-[58rem] [--glow-strength:10%] glow" />
      </div>
      <div className="container-page">
        <Enter as="p" className="mb-6">
          <PromptEyebrow>{eyebrow}</PromptEyebrow>
        </Enter>
        <KineticTitle
          text={title}
          accent={accent}
          className={
            compact
              ? "text-[clamp(2.1rem,6.5vw,4.75rem)] wrap-anywhere dev:text-[clamp(1.9rem,5.5vw,3.75rem)] pixel:text-[calc(var(--pixel-scale)*clamp(1.25rem,4vw,2.6rem))]"
              : undefined
          }
        />
        {description && (
          <Enter
            as="p"
            delay={450}
            className={cn(
              "max-w-2xl text-pretty text-fg-muted",
              compact
                ? "mt-5 text-base wrap-anywhere md:mt-6 md:text-lg"
                : "mt-8 text-lg md:text-xl",
            )}
          >
            {description}
          </Enter>
        )}
        {children && <Enter delay={550}>{children}</Enter>}
      </div>
    </header>
  );
}
