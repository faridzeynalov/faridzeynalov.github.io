"use client";

import {
  BookOpen,
  GalleryHorizontal,
  Grid3x3,
  Joystick,
  LayoutGrid,
  List,
  SearchX,
  SquareTerminal,
} from "lucide-react";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import { useLocale, useTranslations } from "next-intl";
import { Suspense, lazy, useEffect, useMemo, useState } from "react";
import { useSkin } from "@/components/layout/use-appearance";
import { ProjectCard } from "@/components/projects/project-card";
import { ProjectList } from "@/components/projects/project-list";
import { Button } from "@/components/ui/button";
import { getIndustryFilters, isIndustry } from "@/lib/industries";
import type { Skin } from "@/lib/theme";
import { cn } from "@/lib/utils";
import type { Industry, Project } from "@/types/project";

type Filter = Industry | "all";

// Each style's own view is loaded only when it's opened, so the page stays light (and
// quick to become interactive) for everyone else.
const ShowcaseView = lazy(() =>
  import("@/components/projects/showcase-view").then((mod) => ({ default: mod.ShowcaseView })),
);
const TerminalView = lazy(() =>
  import("@/components/projects/terminal-view").then((mod) => ({ default: mod.TerminalView })),
);
const LevelSelect = lazy(() =>
  import("@/components/projects/level-select").then((mod) => ({ default: mod.LevelSelect })),
);
const Journal = lazy(() =>
  import("@/components/projects/journal").then((mod) => ({ default: mod.Journal })),
);
const BoardView = lazy(() =>
  import("@/components/projects/board-view").then((mod) => ({ default: mod.BoardView })),
);
const STYLE_VIEW_COMPONENTS = {
  showcase: ShowcaseView,
  terminal: TerminalView,
  levels: LevelSelect,
  journal: Journal,
  board: BoardView,
};
/** Each style's own third view, after the grid and the list. */
const STYLE_VIEWS = {
  classic: "showcase",
  dev: "terminal",
  pixel: "levels",
  paper: "journal",
  chess: "board",
} as const satisfies Record<Skin, string>;
type StyleView = (typeof STYLE_VIEWS)[Skin];
type View = "grid" | "list" | StyleView;
const VIEW_ICONS = {
  grid: LayoutGrid,
  list: List,
  showcase: GalleryHorizontal,
  terminal: SquareTerminal,
  levels: Joystick,
  journal: BookOpen,
  board: Grid3x3,
} as const;
const isView = (value: string | null): value is View => !!value && value in VIEW_ICONS;

const PARAM = "industry";
const VIEW_PARAM = "view";

/**
 * Filterable project grid. The active filter is mirrored to `?industry=` so filtered
 * views can be shared — read on the client because the page is statically exported.
 */
export function PortfolioExplorer({
  projects,
  industryLabels,
}: {
  projects: Project[];
  industryLabels: Record<Industry, string>;
}) {
  const t = useTranslations("Portfolio");
  const locale = useLocale();
  const [filter, setFilter] = useState<Filter>("all");
  const [chosenView, setView] = useState<View>("grid");
  /** Set once the controls respond (the page hydrates in parts; tests wait for it). */
  const [ready, setReady] = useState(false);
  const skin = useSkin();
  const wide = useWideScreen();
  // The styles' own views are made for larger screens: phones keep the grid and the list.
  // Before the style is known (server render) there's no third view yet either.
  const styleView = skin && wide ? STYLE_VIEWS[skin] : null;
  // A style's own view belongs to that style; in the others the grid stands in for it.
  const view =
    chosenView === "grid" || chosenView === "list" || chosenView === styleView
      ? chosenView
      : "grid";
  const filters = useMemo(
    () => getIndustryFilters(projects, industryLabels, locale),
    [projects, industryLabels, locale],
  );

  useEffect(() => {
    const syncFromUrl = () => {
      const value = new URLSearchParams(window.location.search).get(PARAM);
      setFilter(isIndustry(value) ? value : "all");
      const requested = new URLSearchParams(window.location.search).get(VIEW_PARAM);
      setView(isView(requested) ? requested : "grid");
      setReady(true);
    };
    syncFromUrl();
    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, []);

  function selectView(next: View) {
    setView(next);
    const url = new URL(window.location.href);
    if (next === "grid") url.searchParams.delete(VIEW_PARAM);
    else url.searchParams.set(VIEW_PARAM, next);
    window.history.replaceState(window.history.state, "", url);
  }

  function select(next: Filter) {
    setFilter(next);
    const url = new URL(window.location.href);
    if (next === "all") url.searchParams.delete(PARAM);
    else url.searchParams.set(PARAM, next);
    window.history.replaceState(window.history.state, "", url);
  }

  const visible = filter === "all" ? projects : projects.filter((p) => p.industry === filter);
  const options: { id: Filter; label: string; count: number }[] = [
    { id: "all", label: t("all"), count: projects.length },
    ...filters,
  ];

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div
          role="group"
          aria-label={t("filterLabel")}
          className="-mx-5 flex [scrollbar-width:none] gap-1.5 overflow-x-auto px-5 pb-2 sm:mx-0 sm:flex-wrap sm:px-0"
        >
          {options.map((option) => {
            const active = option.id === filter;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => select(option.id)}
                aria-pressed={active}
                className={cn(
                  "relative inline-flex shrink-0 items-center gap-2 rounded-pill border px-4 py-2 text-sm transition-colors",
                  active
                    ? "border-transparent text-bg"
                    : "border-border text-fg-muted hover:border-border-strong hover:text-fg",
                )}
              >
                {active && (
                  <m.span
                    layoutId="filter-pill"
                    className="absolute inset-0 rounded-pill bg-fg"
                    transition={{ type: "spring", stiffness: 400, damping: 34 }}
                    aria-hidden
                  />
                )}
                <span className="relative">{option.label}</span>
                <span
                  className={cn(
                    "relative font-mono text-[11px]",
                    active ? "text-bg/70" : "text-fg-subtle",
                  )}
                >
                  {option.count}
                </span>
              </button>
            );
          })}
        </div>

        <div
          role="group"
          aria-label={t("layout")}
          data-ready={ready || undefined}
          className="flex shrink-0 gap-1 self-start rounded-pill border border-border p-1"
        >
          {(["grid", "list", ...(styleView ? [styleView] : [])] as View[]).map((option) => {
            const Icon = VIEW_ICONS[option];
            const label = t(`${option}View`);
            return (
              <button
                key={option}
                type="button"
                onClick={() => selectView(option)}
                aria-pressed={view === option}
                aria-label={label}
                title={label}
                className={cn(
                  "inline-flex size-8 items-center justify-center rounded-pill transition-colors",
                  view === option ? "bg-fg text-bg" : "text-fg-muted hover:text-fg",
                )}
              >
                <Icon className="size-4" aria-hidden />
              </button>
            );
          })}
        </div>
      </div>

      <p role="status" className="sr-only">
        {t("showing", { count: visible.length })}
      </p>

      {visible.length === 0 ? (
        <div className="mt-10 flex flex-col items-center rounded-2xl border border-dashed border-border-strong px-6 py-20 text-center">
          <SearchX className="size-8 text-fg-subtle" aria-hidden />
          <p className="mt-4 text-lg font-medium">{t("emptyTitle")}</p>
          <p className="mt-1 text-sm text-fg-muted">{t("emptyText")}</p>
          <Button variant="secondary" className="mt-6" onClick={() => select("all")}>
            {t("showAll")}
          </Button>
        </div>
      ) : view !== "grid" && view !== "list" ? (
        <Suspense fallback={<div className="mt-10 h-96 animate-pulse rounded-2xl bg-bg-subtle" />}>
          <StyleViewPanel view={view} projects={visible} industryLabels={industryLabels} />
        </Suspense>
      ) : view === "list" ? (
        <div className="mt-10">
          <ProjectList projects={visible} industryLabels={industryLabels} />
        </div>
      ) : (
        <m.ul layout className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout" initial={false}>
            {visible.map((project, index) => (
              <m.li
                key={project.slug}
                layout
                initial={{ opacity: 0, y: 24, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.2 } }}
                transition={{
                  duration: 0.6,
                  delay: Math.min(index, 8) * 0.04,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <ProjectCard
                  project={project}
                  industryLabel={industryLabels[project.industry]}
                  headingLevel="h2"
                />
              </m.li>
            ))}
          </AnimatePresence>
        </m.ul>
      )}
    </div>
  );
}

/** Whether the screen is wide enough for the styles' own views (tablets and up). */
function useWideScreen() {
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    const update = () => setWide(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return wide;
}

/** The current style's own view of the projects (see STYLE_VIEWS). */
function StyleViewPanel({
  view,
  projects,
  industryLabels,
}: {
  view: StyleView;
  projects: Project[];
  industryLabels: Record<Industry, string>;
}) {
  const View = STYLE_VIEW_COMPONENTS[view];
  return <View projects={projects} industryLabels={industryLabels} />;
}
