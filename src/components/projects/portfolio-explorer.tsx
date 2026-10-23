"use client";

import { LayoutGrid, List, SearchX } from "lucide-react";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import { useEffect, useMemo, useState } from "react";
import { ProjectCard } from "@/components/projects/project-card";
import { ProjectList } from "@/components/projects/project-list";
import { Button } from "@/components/ui/button";
import { getIndustryFilters, isIndustry } from "@/lib/industries";
import { cn } from "@/lib/utils";
import type { Industry, Project } from "@/types/project";

type Filter = Industry | "all";
type View = "grid" | "list";

const PARAM = "industry";
const VIEW_PARAM = "view";

/**
 * Filterable project grid. The active filter is mirrored to `?industry=` so filtered
 * views can be shared — read on the client because the page is statically exported.
 */
export function PortfolioExplorer({ projects }: { projects: Project[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [view, setView] = useState<View>("grid");
  const filters = useMemo(() => getIndustryFilters(projects), [projects]);

  useEffect(() => {
    const syncFromUrl = () => {
      const value = new URLSearchParams(window.location.search).get(PARAM);
      setFilter(isIndustry(value) ? value : "all");
      setView(
        new URLSearchParams(window.location.search).get(VIEW_PARAM) === "list" ? "list" : "grid",
      );
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
    { id: "all", label: "All", count: projects.length },
    ...filters,
  ];

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div
          role="group"
          aria-label="Filter projects by industry"
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
                  "relative inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors",
                  active
                    ? "border-transparent text-bg"
                    : "border-border text-fg-muted hover:border-border-strong hover:text-fg",
                )}
              >
                {active && (
                  <m.span
                    layoutId="filter-pill"
                    className="absolute inset-0 rounded-full bg-fg"
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
          aria-label="Layout"
          className="flex shrink-0 gap-1 self-start rounded-full border border-border p-1"
        >
          {(["grid", "list"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => selectView(option)}
              aria-pressed={view === option}
              aria-label={option === "grid" ? "Grid view" : "List view"}
              title={option === "grid" ? "Grid view" : "List view"}
              className={cn(
                "inline-flex size-8 items-center justify-center rounded-full transition-colors",
                view === option ? "bg-fg text-bg" : "text-fg-muted hover:text-fg",
              )}
            >
              {option === "grid" ? (
                <LayoutGrid className="size-4" aria-hidden />
              ) : (
                <List className="size-4" aria-hidden />
              )}
            </button>
          ))}
        </div>
      </div>

      <p role="status" className="sr-only">
        Showing {visible.length} {visible.length === 1 ? "project" : "projects"}
      </p>

      {visible.length === 0 ? (
        <div className="mt-10 flex flex-col items-center rounded-2xl border border-dashed border-border-strong px-6 py-20 text-center">
          <SearchX className="size-8 text-fg-subtle" aria-hidden />
          <p className="mt-4 text-lg font-medium">No projects in this category yet</p>
          <p className="mt-1 text-sm text-fg-muted">Try another industry, or see everything.</p>
          <Button variant="secondary" className="mt-6" onClick={() => select("all")}>
            Show all projects
          </Button>
        </div>
      ) : view === "list" ? (
        <div className="mt-10">
          <ProjectList projects={visible} />
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
                <ProjectCard project={project} headingLevel="h2" />
              </m.li>
            ))}
          </AnimatePresence>
        </m.ul>
      )}
    </div>
  );
}
