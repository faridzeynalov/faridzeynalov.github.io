import type { CSSProperties, ReactNode } from "react";
import { Enter, RiseLine, TYPE_SPEED, TypeCaret, TypedText } from "@/components/motion/enter";

/** Pause between typed lines (Developer style), in ms. */
const LINE_PAUSE = 180;

interface HeroIntroProps {
  name: string;
  badge: string;
  jobTitle: string;
  tagline: string;
  intro: ReactNode;
  actions: ReactNode;
  stats: { value: string; label: string }[];
}

/** Hero copy with a masked line-by-line reveal (CSS, so it plays before hydration). */
export function HeroIntro({
  name,
  badge,
  jobTitle,
  tagline,
  intro,
  actions,
  stats,
}: HeroIntroProps) {
  // When each typed line starts (Developer style): one after another, with a short pause.
  const nameAt = 200;
  const jobTitleAt = nameAt + name.length * TYPE_SPEED + LINE_PAUSE;
  const taglineAt = jobTitleAt + jobTitle.length * TYPE_SPEED + LINE_PAUSE + TYPE_SPEED;
  const typed = {
    name: nameAt,
    jobTitle: jobTitleAt,
    tagline: taglineAt,
    end: taglineAt + tagline.length * TYPE_SPEED,
  };

  return (
    <div>
      <Enter
        as="p"
        className="mb-8 inline-flex items-center gap-2.5 rounded-pill border border-border bg-bg-elevated/80 py-1 pr-3.5 pl-2.5 text-[13px] text-fg-muted"
      >
        <span className="pulse-dot size-2 rounded-full bg-emerald-500" aria-hidden />
        <span className="hidden text-[var(--code-comment)] dev:inline" aria-hidden>
          {"//"}
        </span>
        {badge}
      </Enter>

      {/* Sized against the column width (container units) so each line stays on one line. */}
      <div className="@container">
        <h1
          id="hero-title"
          className="text-[clamp(2.25rem,9.6cqw,4.6rem)] leading-[1.04] font-semibold tracking-[-0.045em] dev:text-[clamp(1.9rem,7.4cqw,3.6rem)] dev:leading-[1.12] pixel:text-[calc(var(--pixel-scale)*clamp(1.1rem,4.9cqw,2.4rem))] pixel:leading-[1.45]"
        >
          {/* Classic: each line rises. Developer and 8-bit: the lines type out one after another. */}
          <RiseLine delay={50}>
            <TypedText text={name} delay={typed.name} />
          </RiseLine>
          <RiseLine delay={150} className="text-fg-muted">
            <TypedText text={jobTitle} delay={typed.jobTitle} />
          </RiseLine>
          <RiseLine delay={250}>
            <span
              className="accent-text font-serif font-normal tracking-[-0.01em] italic"
              style={
                {
                  "--quote-start": `${typed.tagline - TYPE_SPEED}ms`,
                  "--quote-end": `${typed.end}ms`,
                } as CSSProperties
              }
            >
              <TypedText text={tagline} delay={typed.tagline} />
            </span>
            <TypeCaret delay={typed.end} />
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
