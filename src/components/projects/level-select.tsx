"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { useMemo, useState, type KeyboardEvent } from "react";
import { buttonVariants } from "@/components/ui/button";
import { Link, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import type { Industry, Project } from "@/types/project";

/**
 * 8-bit style: the portfolio as a game's level select. Industries are worlds and projects
 * their levels ("1-3"); a blinking cursor marks the chosen one and a dialogue box tells its
 * story. The arrow keys move (← → along a world, ↑ ↓ between worlds), Enter starts.
 */
export function LevelSelect({
  projects,
  industryLabels,
}: {
  projects: Project[];
  industryLabels: Record<Industry, string>;
}) {
  const t = useTranslations("Portfolio");
  const router = useRouter();
  // Worlds in the order their first project appears.
  const worlds = useMemo(() => {
    const byIndustry = new Map<Industry, Project[]>();
    for (const project of projects) {
      byIndustry.set(project.industry, [...(byIndustry.get(project.industry) ?? []), project]);
    }
    return [...byIndustry.entries()];
  }, [projects]);
  const [position, setPosition] = useState({ world: 0, level: 0 });
  const world = Math.min(position.world, worlds.length - 1);
  const level = Math.min(position.level, worlds[world][1].length - 1);
  const project = worlds[world][1][level];
  const stage = `${world + 1}-${level + 1}`;

  const move = (dw: number, dl: number) => {
    let nextWorld = world + dw;
    let nextLevel = level + dl;
    // Running off the end of a world continues into the next one, as on a map.
    if (nextLevel >= worlds[world][1].length && nextWorld === world && world < worlds.length - 1) {
      nextWorld = world + 1;
      nextLevel = 0;
    }
    if (nextLevel < 0 && nextWorld === world && world > 0) {
      nextWorld = world - 1;
      nextLevel = worlds[world - 1][1].length - 1;
    }
    nextWorld = Math.max(0, Math.min(worlds.length - 1, nextWorld));
    nextLevel = Math.max(0, Math.min(worlds[nextWorld][1].length - 1, nextLevel));
    setPosition({ world: nextWorld, level: nextLevel });
  };

  const onKeyDown = (event: KeyboardEvent) => {
    const moves: Record<string, [number, number]> = {
      ArrowRight: [0, 1],
      ArrowLeft: [0, -1],
      ArrowDown: [1, 0],
      ArrowUp: [-1, 0],
    };
    const delta = moves[event.key];
    if (delta) {
      event.preventDefault();
      move(...delta);
    }
    if (event.key === "Enter") router.push(`/portfolio/${project.slug}`);
  };

  return (
    <div className="mt-10" onKeyDown={onKeyDown}>
      <div
        role="listbox"
        tabIndex={0}
        aria-label={t("levelsView")}
        aria-activedescendant={`level-${project.slug}`}
        className="space-y-8 outline-none"
      >
        {worlds.map(([industry, levels], w) => (
          <section key={industry} aria-label={industryLabels[industry]}>
            <p className="mb-9 font-[family-name:var(--font-display)] text-xs text-accent uppercase">
              {t("levelsWorld", { n: w + 1 })} · {industryLabels[industry]}
            </p>
            {/* The dotted path the levels sit on. */}
            <div className="level-path flex flex-wrap gap-x-5 gap-y-7">
              {levels.map((item, l) => {
                const selected = w === world && l === level;
                return (
                  <div
                    key={item.slug}
                    id={`level-${item.slug}`}
                    role="option"
                    aria-selected={selected}
                    aria-label={`${w + 1}-${l + 1} ${item.name}`}
                    onClick={() => setPosition({ world: w, level: l })}
                    onDoubleClick={() => router.push(`/portfolio/${item.slug}`)}
                    className={cn(
                      "level-tile relative size-24 cursor-pointer border-[3px] bg-bg-elevated sm:size-28",
                      selected ? "is-selected border-accent" : "border-[var(--pixel-edge)]",
                    )}
                  >
                    {selected && (
                      <span
                        className="absolute -top-7 left-1/2 -translate-x-1/2 animate-[caret-blink_0.8s_steps(1)_infinite] font-[family-name:var(--font-display)] text-sm text-accent"
                        aria-hidden
                      >
                        ▼
                      </span>
                    )}
                    <span className="absolute inset-[3px] overflow-hidden">
                      {item.images ? (
                        <Image
                          src={item.images.thumb}
                          alt=""
                          fill
                          sizes="112px"
                          className={cn(
                            "object-cover object-top [image-rendering:pixelated]",
                            !selected && "opacity-60 grayscale-[60%]",
                          )}
                          draggable={false}
                        />
                      ) : (
                        <span className="block size-full" style={{ background: item.accent }} />
                      )}
                    </span>
                    <span className="absolute -bottom-[3px] -left-[3px] bg-[var(--pixel-edge)] px-1.5 py-0.5 font-[family-name:var(--font-display)] text-[10px] text-bg">
                      {w + 1}-{l + 1}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {/* The dialogue box */}
      <div
        key={project.slug}
        className="level-dialog sticky bottom-4 z-10 mt-10 border-[3px] border-[var(--pixel-edge)] bg-bg-elevated p-5 shadow-[6px_6px_0_0_var(--pixel-shadow)] max-sm:p-3.5"
        aria-live="polite"
      >
        <p className="font-[family-name:var(--font-display)] text-[11px] text-accent">
          {t("levelsStage", { n: stage })}
        </p>
        <p className="mt-2 font-[family-name:var(--font-display)] text-sm leading-relaxed text-fg sm:text-lg">
          {project.name}
        </p>
        <p className="level-text mt-2 text-sm text-fg-muted max-sm:line-clamp-2">
          {project.summary}
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-fg-subtle max-sm:hidden">{t("levelsHint")}</p>
          <Link
            href={`/portfolio/${project.slug}`}
            className={cn(buttonVariants({ size: "sm" }), "uppercase")}
          >
            ▶ {t("levelsStart")}
          </Link>
        </div>
      </div>
    </div>
  );
}
