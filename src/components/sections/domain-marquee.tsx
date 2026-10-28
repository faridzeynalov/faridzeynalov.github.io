import { useTranslations } from "next-intl";
import type { Project } from "@/types/project";

/** Slow, pausable ticker of every shipped domain. Static and wrapped for reduced motion. */
export function DomainMarquee({ projects }: { projects: Project[] }) {
  const t = useTranslations("Marquee");
  const domains = projects.map((project) => project.domain);

  return (
    <section aria-label={t("ariaLabel")} className="border-y border-border bg-bg-subtle/40 py-5">
      <div className="container-page flex items-center gap-6">
        <p className="hidden shrink-0 font-mono text-xs text-fg-subtle uppercase md:block">
          {t("label")}
        </p>
        <div className="group relative min-w-0 flex-1 overflow-hidden mask-fade-x">
          <ul
            className="flex w-max animate-marquee gap-8 group-hover:[animation-play-state:paused] motion-reduce:w-full motion-reduce:animate-none motion-reduce:flex-wrap motion-reduce:gap-x-6 motion-reduce:gap-y-2"
            style={{ "--marquee-duration": "80s" } as React.CSSProperties}
          >
            {domains.map((domain) => (
              <li key={domain} className="font-mono text-sm whitespace-nowrap text-fg-muted">
                {domain}
              </li>
            ))}
            {/* Duplicate for a seamless loop — hidden from assistive tech. */}
            {domains.map((domain) => (
              <li
                key={`${domain}-copy`}
                aria-hidden
                className="font-mono text-sm whitespace-nowrap text-fg-muted motion-reduce:hidden"
              >
                {domain}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
