import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Project } from "@/types/project";

/** Previous / next project navigation. */
export function ProjectPager({ previous, next }: { previous: Project; next: Project }) {
  return (
    <nav aria-label="More projects" className="grid gap-3 sm:grid-cols-2">
      <PagerLink project={previous} direction="previous" />
      <PagerLink project={next} direction="next" />
    </nav>
  );
}

function PagerLink({ project, direction }: { project: Project; direction: "previous" | "next" }) {
  const isNext = direction === "next";
  const Icon = isNext ? ArrowRight : ArrowLeft;

  return (
    <Link
      href={`/portfolio/${project.slug}/`}
      rel={isNext ? "next" : "prev"}
      className={cn(
        "group relative flex flex-col gap-2 overflow-hidden rounded-2xl border border-border bg-bg-elevated p-6 transition-colors duration-300 hover:border-border-strong",
        isNext && "sm:items-end sm:text-right",
      )}
    >
      <span
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-20"
        style={{
          background: `radial-gradient(70% 90% at ${isNext ? "100%" : "0%"} 50%, ${project.accent}, transparent 70%)`,
        }}
        aria-hidden
      />
      <span className="relative inline-flex items-center gap-2 font-mono text-xs text-fg-subtle uppercase">
        {!isNext && (
          <Icon className="size-3.5 transition-transform group-hover:-translate-x-1" aria-hidden />
        )}
        {isNext ? "Next project" : "Previous project"}
        {isNext && (
          <Icon className="size-3.5 transition-transform group-hover:translate-x-1" aria-hidden />
        )}
      </span>
      <span className="relative text-xl font-semibold tracking-tight">{project.name}</span>
      <span className="relative font-mono text-xs text-fg-subtle">{project.domain}</span>
    </Link>
  );
}
