import type { ReactNode } from "react";
import { Enter, RiseLine } from "@/components/motion/enter";

interface HeroIntroProps {
  name: string;
  intro: ReactNode;
  actions: ReactNode;
  stats: { value: string; label: string }[];
}

/** Hero copy with a masked line-by-line reveal (CSS, so it plays before hydration). */
export function HeroIntro({ name, intro, actions, stats }: HeroIntroProps) {
  return (
    <div>
      <Enter
        as="p"
        className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-border bg-bg-elevated/60 py-1 pr-3.5 pl-2.5 text-[13px] text-fg-muted backdrop-blur"
      >
        <span className="size-2 animate-pulse-dot rounded-full bg-emerald-500" aria-hidden />
        Open to front-end roles &amp; freelance projects
      </Enter>

      {/* Sized against the column width (container units) so each line stays on one line. */}
      <div className="@container">
        <h1
          id="hero-title"
          className="text-[clamp(2.25rem,9.6cqw,4.6rem)] leading-[1.04] font-semibold tracking-[-0.045em]"
        >
          <RiseLine delay={50}>{name}</RiseLine>
          <RiseLine delay={150} className="text-fg-muted">
            Front-end developer
          </RiseLine>
          <RiseLine delay={250}>
            <span className="font-serif font-normal tracking-[-0.01em] italic">
              crafting polished UIs.
            </span>
          </RiseLine>
        </h1>
      </div>

      <Enter
        as="p"
        delay={400}
        className="mt-7 max-w-xl text-base text-pretty text-fg-muted md:text-lg"
      >
        {intro}
      </Enter>

      <Enter delay={500} className="mt-9 flex flex-wrap gap-3">
        {actions}
      </Enter>

      <Enter delay={650}>
        <dl className="mt-12 grid max-w-md grid-cols-3 gap-4 border-t border-border pt-6">
          {stats.map((stat) => (
            <div key={stat.label} className="grid content-start gap-1">
              <dt className="row-start-2 text-xs text-fg-subtle">{stat.label}</dt>
              <dd className="row-start-1 text-2xl font-semibold tracking-tight tabular-nums">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </Enter>
    </div>
  );
}
