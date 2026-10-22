import type { ReactNode } from "react";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  index: string;
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  id?: string;
  className?: string;
  action?: ReactNode;
}

export function SectionHeading({
  index,
  eyebrow,
  title,
  description,
  id,
  className,
  action,
}: SectionHeadingProps) {
  return (
    <Reveal
      as="header"
      className={cn("flex flex-col gap-6 md:flex-row md:items-end md:justify-between", className)}
    >
      <div className="max-w-2xl">
        <p className="mb-4 flex items-center gap-3 font-mono text-xs text-fg-subtle uppercase">
          <span className="text-accent">{index}</span>
          <span className="h-px w-8 bg-border-strong" aria-hidden />
          {eyebrow}
        </p>
        <h2
          id={id}
          className="text-[clamp(2rem,4.6vw,3.25rem)] leading-[1.05] font-semibold tracking-[-0.035em] text-balance"
        >
          {title}
        </h2>
        {description && (
          <p className="mt-4 max-w-xl text-base text-pretty text-fg-muted md:text-lg">
            {description}
          </p>
        )}
      </div>
      {action}
    </Reveal>
  );
}

/** Italic serif accent used sparingly inside headings. */
export function Accent({ children }: { children: ReactNode }) {
  return (
    <span className="font-serif font-normal tracking-normal text-fg-muted italic">{children}</span>
  );
}
