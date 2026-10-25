"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { useMemo, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { FootballIcon } from "@/components/football/football-icon";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import type { Industry, Project } from "@/types/project";

const GROUPS = "ABCDEFGH";

/** The cursor's spot over a sticker: it tilts towards it and the foil catches the light there. */
function follow(event: ReactPointerEvent<HTMLElement>) {
  const el = event.currentTarget;
  const rect = el.getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width;
  const y = (event.clientY - rect.top) / rect.height;
  el.style.setProperty("--mx", `${x * 100}%`);
  el.style.setProperty("--my", `${y * 100}%`);
  el.style.setProperty("--ry", `${(x - 0.5) * 16}deg`);
  el.style.setProperty("--rx", `${(0.5 - y) * 14}deg`);
}

function settle(event: ReactPointerEvent<HTMLElement>) {
  const el = event.currentTarget;
  el.style.setProperty("--ry", "0deg");
  el.style.setProperty("--rx", "0deg");
}

/**
 * Football style: the portfolio as a sticker album, the kind swapped in the playground. Each
 * industry is a group with its own page; each project a numbered sticker in its brand colour.
 * The featured projects are shiny foils. Stickers tilt to follow the cursor and lift at the
 * corner; they're stuck in one after another as the album opens.
 */
export function StickerAlbum({
  projects,
  industryLabels,
}: {
  projects: Project[];
  industryLabels: Record<Industry, string>;
}) {
  const t = useTranslations("Portfolio");
  const groups = useMemo(() => {
    const byIndustry = new Map<Industry, Project[]>();
    for (const project of projects) {
      byIndustry.set(project.industry, [...(byIndustry.get(project.industry) ?? []), project]);
    }
    // Sticker numbers run on through the album, as in the real thing.
    let first = 1;
    return [...byIndustry.entries()].map(([industry, items]) => {
      const group = { industry, items, first };
      first += items.length;
      return group;
    });
  }, [projects]);

  return (
    <div className="mt-10">
      <div className="album-cover mb-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl px-6 py-5">
        <div className="flex items-center gap-3">
          <FootballIcon className="size-9 text-[var(--accent)]" />
          <div>
            <p className="font-[family-name:var(--font-display)] text-2xl leading-none tracking-wide uppercase">
              {t("albumTitle")}
            </p>
            <p className="mt-1 text-xs tracking-[0.18em] text-white/70 uppercase">
              {t("albumSeason")}
            </p>
          </div>
        </div>
        <p className="album-count rounded-pill px-4 py-1.5 font-[family-name:var(--font-display)] text-lg tracking-wide tabular-nums">
          {t("albumCollected", { n: projects.length, total: projects.length })}
        </p>
      </div>

      <div className="space-y-12">
        {groups.map(({ industry, items, first }, g) => (
          <section key={industry} aria-label={industryLabels[industry]} className="album-page">
            <header className="mb-5 flex items-end justify-between gap-4 border-b-2 border-dashed border-border-strong pb-3">
              <h2 className="text-3xl">
                <span className="album-group mr-3 inline-flex size-10 items-center justify-center rounded-md align-middle text-xl">
                  {GROUPS[g % GROUPS.length]}
                </span>
                {industryLabels[industry]}
              </h2>
              <p className="shrink-0 font-[family-name:var(--font-display)] text-sm tracking-wide text-fg-subtle uppercase">
                {t("albumCount", { n: items.length })}
              </p>
            </header>

            <ul className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
              {items.map((project, i) => {
                const number = first + i;
                const foil = Boolean(project.featured);
                return (
                  <li key={project.slug} className="album-slot">
                    <Link
                      href={`/portfolio/${project.slug}`}
                      onPointerMove={follow}
                      onPointerLeave={settle}
                      className={cn("sticker group", foil && "is-foil")}
                      style={
                        {
                          "--kit": project.accent,
                          animationDelay: `${Math.min(i, 8) * 70}ms`,
                        } as CSSProperties
                      }
                    >
                      <span className="sticker-number">{String(number).padStart(2, "0")}</span>
                      <span className="sticker-photo">
                        {project.images ? (
                          <Image
                            src={project.images.thumb}
                            alt=""
                            fill
                            sizes="(min-width: 1024px) 260px, 45vw"
                            className="object-cover object-top"
                            draggable={false}
                          />
                        ) : (
                          <span className="flex size-full items-center justify-center font-[family-name:var(--font-display)] text-3xl text-white/80">
                            {project.name.slice(0, 2)}
                          </span>
                        )}
                      </span>
                      <span className="sticker-plate">
                        <span className="block truncate font-[family-name:var(--font-display)] text-lg leading-tight tracking-wide uppercase">
                          {project.name}
                        </span>
                        <span className="mt-0.5 block truncate text-[11px] tracking-wide opacity-75">
                          {project.domain}
                        </span>
                      </span>
                      {foil && <span className="sticker-foil" aria-hidden />}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
