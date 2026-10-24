import type { CSSProperties, ReactNode } from "react";
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
        <SectionEyebrow index={index} className="mb-4">
          {eyebrow}
        </SectionEyebrow>
        <h2 id={id} className={sectionTitleClass}>
          <HeadingMark />
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

/** Size and weight of section titles (smaller in Developer and 8-bit: their fonts run wider). */
export const sectionTitleClass =
  "text-[clamp(2rem,4.6vw,3.25rem)] leading-[1.05] font-semibold tracking-[-0.035em] text-balance dev:text-[clamp(1.75rem,3.9vw,2.75rem)] pixel:text-[calc(var(--pixel-scale)*clamp(1.2rem,2.7vw,1.9rem))] pixel:leading-[1.45]";

/**
 * "02 —— Services". In the Developer style it reads as a code comment: "// 02 · Services".
 */
export function SectionEyebrow({
  index,
  children,
  className,
}: {
  index: string;
  children: ReactNode;
  className?: string;
}) {
  // Developer style: the comment types itself out when its section is revealed
  // (`.type-on-reveal`), one step per character of "// 02 · Services".
  const steps = 6 + index.length + (typeof children === "string" ? children.length : 12);
  return (
    <p
      className={cn(
        "type-on-reveal flex w-fit items-center gap-3 font-mono text-xs text-fg-subtle uppercase dev:gap-2 dev:text-[var(--code-comment)] dev:normal-case",
        className,
      )}
      style={{ "--type-steps": steps } as CSSProperties}
    >
      <span className="hidden dev:inline" aria-hidden>
        {"//"}
      </span>
      <span className="text-accent">{index}</span>
      <span className="h-px w-8 bg-border-strong dev:hidden" aria-hidden />
      <span className="hidden dev:inline" aria-hidden>
        ·
      </span>
      {children}
    </p>
  );
}

/** Markdown heading mark ("## ") in front of section titles, Developer style only. */
export function HeadingMark() {
  return (
    <span className="hidden text-accent dev:inline" aria-hidden>
      ##{" "}
    </span>
  );
}

/** Italic serif accent used sparingly inside headings (a quoted string in the Developer style). */
export function Accent({ children }: { children: ReactNode }) {
  return (
    <span className="accent-text font-serif font-normal tracking-normal text-fg-muted italic">
      {children}
    </span>
  );
}
