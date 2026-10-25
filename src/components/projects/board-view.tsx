"use client";

import {
  ArrowUpRight,
  ChessBishop,
  ChessKing,
  ChessKnight,
  ChessPawn,
  ChessQueen,
  ChessRook,
  type LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useState, type KeyboardEvent } from "react";
import { buttonVariants } from "@/components/ui/button";
import { Link, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import type { Industry, Project } from "@/types/project";

/** Each industry is a piece: grand hotels the king, towers the rook, and so on. */
const PIECES: Record<Industry, { icon: LucideIcon; letter: string }> = {
  hospitality: { icon: ChessKing, letter: "K" },
  "real-estate": { icon: ChessRook, letter: "R" },
  healthcare: { icon: ChessBishop, letter: "B" },
  "e-commerce": { icon: ChessQueen, letter: "Q" },
  corporate: { icon: ChessKnight, letter: "N" },
  education: { icon: ChessPawn, letter: "" },
};

const FILES = "abcdefgh";

/**
 * Chess style: the projects set out on a board, one per square from a1, each marked with its
 * industry's piece. Picking a square reads it like a move ("Re4") beside the board. The arrow
 * keys move around the board, Enter opens the project.
 */
export function BoardView({
  projects,
  industryLabels,
}: {
  projects: Project[];
  industryLabels: Record<Industry, string>;
}) {
  const t = useTranslations("Portfolio");
  const router = useRouter();
  const [active, setActive] = useState(0);
  const index = Math.min(active, projects.length - 1);
  const ranks = Math.max(1, Math.ceil(projects.length / 8));
  const project = projects[index];
  const square = (i: number) => `${FILES[i % 8]}${Math.floor(i / 8) + 1}`;
  const piece = PIECES[project.industry];
  const notation = `${piece.letter}${square(index)}`;

  const onKeyDown = (event: KeyboardEvent) => {
    // Up the board is up the screen: rank 1 is the bottom row.
    const steps: Record<string, number> = {
      ArrowRight: 1,
      ArrowLeft: -1,
      ArrowUp: 8,
      ArrowDown: -8,
    };
    const step = steps[event.key];
    if (step !== undefined) {
      event.preventDefault();
      const next = index + step;
      if (next >= 0 && next < projects.length) setActive(next);
    }
    if (event.key === "Enter") router.push(`/portfolio/${project.slug}`);
  };

  // Rows top to bottom: the highest rank first.
  const rows = Array.from({ length: ranks }, (_, r) => ranks - 1 - r);

  return (
    <div className="mt-10 grid items-start gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
      <div>
        <div
          role="listbox"
          tabIndex={0}
          aria-label={t("boardView")}
          aria-activedescendant={`board-${project.slug}`}
          onKeyDown={onKeyDown}
          className="overflow-hidden rounded-md shadow-[0_0_0_8px_var(--board-rim),0_24px_40px_-24px_rgb(var(--shadow-color)/0.6)] outline-none focus-visible:shadow-[0_0_0_8px_var(--accent)]"
        >
          {rows.map((rank) => (
            <div key={rank} className="grid grid-cols-8">
              {Array.from({ length: 8 }, (_, file) => {
                const i = rank * 8 + file;
                const item = projects[i];
                const dark = (rank + file) % 2 === 0;
                const selected = i === index;
                const Icon = item ? PIECES[item.industry].icon : null;
                return (
                  <div
                    key={file}
                    id={item ? `board-${item.slug}` : undefined}
                    role={item ? "option" : undefined}
                    aria-selected={item ? selected : undefined}
                    aria-label={item ? `${square(i)} ${item.name}` : undefined}
                    onClick={item ? () => setActive(i) : undefined}
                    onDoubleClick={item ? () => router.push(`/portfolio/${item.slug}`) : undefined}
                    className={cn(
                      "group relative aspect-square",
                      dark ? "bg-[var(--square-dark)]" : "bg-[var(--square-light)]",
                      item && "cursor-pointer",
                    )}
                  >
                    {item?.images && (
                      <Image
                        src={item.images.thumb}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 90px, 12vw"
                        className={cn(
                          "object-cover object-top transition-opacity duration-300",
                          selected ? "opacity-90" : "opacity-25 group-hover:opacity-55",
                        )}
                        draggable={false}
                      />
                    )}
                    {selected && (
                      <span className="absolute inset-0 bg-[var(--move)] ring-3 ring-[var(--accent)] ring-inset" />
                    )}
                    {Icon && (
                      <Icon
                        className={cn(
                          "absolute top-1/2 left-1/2 size-[46%] -translate-1/2 drop-shadow-[0_2px_2px_rgb(0_0_0/0.35)] transition-transform duration-300",
                          dark ? "text-[var(--piece-white)]" : "text-[var(--piece-black)]",
                          selected ? "scale-110" : "group-hover:-translate-y-[60%]",
                        )}
                        strokeWidth={2.2}
                        aria-hidden
                      />
                    )}
                    {/* Coordinates down the a-file and along the first rank. */}
                    {file === 0 && (
                      <span className="absolute top-[4%] left-[6%] font-serif text-[clamp(8px,1.6vw,11px)] font-bold text-[var(--square-light)] mix-blend-normal [text-shadow:0_0_2px_rgb(0_0_0/0.3)]">
                        {rank + 1}
                      </span>
                    )}
                    {rank === 0 && (
                      <span className="absolute right-[6%] bottom-[3%] font-serif text-[clamp(8px,1.6vw,11px)] font-bold text-[var(--square-light)] [text-shadow:0_0_2px_rgb(0_0_0/0.3)]">
                        {FILES[file]}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <p className="mt-6 text-sm text-fg-subtle">{t("boardHint")}</p>
        <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2" aria-label={t("boardLegend")}>
          {(Object.keys(PIECES) as Industry[])
            .filter((industry) => projects.some((item) => item.industry === industry))
            .map((industry) => {
              const Icon = PIECES[industry].icon;
              return (
                <li
                  key={industry}
                  className="inline-flex items-center gap-1.5 text-sm text-fg-muted"
                >
                  <Icon className="size-4 text-accent" aria-hidden />
                  {industryLabels[industry]}
                </li>
              );
            })}
        </ul>
      </div>

      {/* The move, read out: piece, square and the project. */}
      <aside
        key={project.slug}
        className="board-move rounded-lg border border-border bg-bg-elevated p-6 lg:sticky lg:top-28"
        aria-live="polite"
      >
        <div className="flex items-center gap-4">
          <span className="inline-flex size-14 shrink-0 items-center justify-center rounded-md bg-[var(--square-dark)] text-[var(--piece-white)]">
            <piece.icon className="size-8" strokeWidth={2.2} aria-hidden />
          </span>
          <div>
            <p className="font-serif text-3xl text-accent italic">{notation}</p>
            <p className="text-xs text-fg-subtle uppercase">{industryLabels[project.industry]}</p>
          </div>
        </div>
        <h2 className="mt-5 text-2xl leading-tight">{project.name}</h2>
        <p className="mt-1 font-mono text-xs text-fg-subtle">{project.domain}</p>
        {project.images && (
          <div className="relative mt-4 aspect-[16/10] overflow-hidden rounded-md border border-border">
            <Image
              src={project.images.thumb}
              alt=""
              fill
              sizes="(min-width: 1024px) 400px, 90vw"
              className="object-cover object-top"
            />
          </div>
        )}
        <p className="mt-4 text-sm text-pretty text-fg-muted">{project.summary}</p>
        {project.stack.length > 0 && (
          <p className="mt-2 text-sm text-fg-subtle">{project.stack.slice(0, 4).join(" · ")}</p>
        )}
        <Link
          href={`/portfolio/${project.slug}`}
          className={cn(buttonVariants({ size: "md" }), "mt-5")}
        >
          {t("boardOpen")}
          <ArrowUpRight aria-hidden />
        </Link>
      </aside>
    </div>
  );
}
