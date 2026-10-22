import { CloudOff } from "lucide-react";
import type { Project } from "@/types/project";
import { cn } from "@/lib/utils";

/**
 * Illustrative placeholder for projects whose live site couldn't be captured.
 * Deliberately typographic so it can't be mistaken for a real screenshot.
 */
export function UnavailablePreview({
  project,
  className,
}: {
  project: Pick<Project, "domain" | "accent">;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex aspect-[16/10] flex-col items-center justify-center gap-3 overflow-hidden bg-bg-subtle",
        className,
      )}
      role="img"
      aria-label={`No preview available for ${project.domain}`}
    >
      <div className="absolute inset-0 bg-grid opacity-80" aria-hidden />
      <div
        className="absolute inset-0 opacity-25"
        style={{
          background: `radial-gradient(60% 60% at 50% 45%, ${project.accent}, transparent 70%)`,
        }}
        aria-hidden
      />
      <span className="relative font-mono text-[clamp(1rem,3.4vw,2rem)] tracking-tight text-fg">
        {project.domain}
      </span>
      <span className="relative inline-flex items-center gap-1.5 rounded-full border border-border bg-bg/70 px-2.5 py-0.5 font-mono text-[11px] text-fg-muted">
        <CloudOff className="size-3" aria-hidden />
        Preview unavailable
      </span>
    </div>
  );
}
