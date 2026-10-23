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
}

/** Shared top-of-page header with the kinetic split-character title. */
export function PageHeader({
  eyebrow,
  title,
  accent,
  description,
  children,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn("relative overflow-hidden pt-32 pb-16 md:pt-40 md:pb-20", className)}>
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div className="absolute inset-0 bg-grid mask-radial" />
        <div className="absolute -top-80 left-[12%] h-[48rem] w-[58rem] [--glow-strength:10%] glow" />
      </div>
      <div className="container-page">
        <Enter as="p" className="mb-6 font-mono text-xs text-fg-subtle uppercase">
          <span className="text-accent">/</span> {eyebrow}
        </Enter>
        <KineticTitle text={title} accent={accent} />
        {description && (
          <Enter
            as="p"
            delay={450}
            className="mt-8 max-w-2xl text-lg text-pretty text-fg-muted md:text-xl"
          >
            {description}
          </Enter>
        )}
        {children && <Enter delay={550}>{children}</Enter>}
      </div>
    </header>
  );
}
