import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { BrowserFrame } from "@/components/projects/device-frames";
import { UnavailablePreview } from "@/components/projects/unavailable-preview";
import { Badge } from "@/components/ui/badge";
import { getIndustryLabel } from "@/lib/industries";
import { cn } from "@/lib/utils";
import type { Project } from "@/types/project";

interface ProjectCardProps {
  project: Project;
  className?: string;
  headingLevel?: "h2" | "h3";
}

export function ProjectCard({ project, className, headingLevel = "h3" }: ProjectCardProps) {
  const Heading = headingLevel;
  const href = `/portfolio/${project.slug}/`;

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col rounded-2xl border border-border bg-bg-elevated p-2 transition-[border-color,box-shadow,transform] duration-500 ease-out-expo hover:-translate-y-1 hover:border-border-strong hover:shadow-float",
        className,
      )}
    >
      <div className="relative aspect-[16/11] overflow-hidden rounded-xl bg-bg-subtle">
        <div
          className="absolute inset-0 opacity-30 transition-opacity duration-500 group-hover:opacity-45"
          style={{
            background: `radial-gradient(90% 80% at 30% 0%, ${project.accent}, transparent 70%)`,
          }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-grid opacity-60" aria-hidden />
        {project.images ? (
          <BrowserFrame
            domain={project.domain}
            compact
            className="absolute top-[9%] left-[7%] w-[93%] rounded-r-none border-r-0 transition-transform duration-700 ease-out-expo group-hover:-translate-x-1 group-hover:-translate-y-1.5"
          >
            <Image
              src={project.images.thumb}
              alt={`Homepage of ${project.domain}`}
              sizes="(min-width: 1024px) 380px, (min-width: 640px) 45vw, 90vw"
              className="h-auto w-full"
              placeholder="blur"
            />
          </BrowserFrame>
        ) : (
          <UnavailablePreview project={project} className="absolute inset-0 aspect-auto" />
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-3 pt-4">
        <div className="flex items-center justify-between gap-3 font-mono text-[11px] text-fg-subtle uppercase">
          <span className="truncate">
            {getIndustryLabel(project.industry)}
            {project.group ? ` · ${project.group}` : ""}
          </span>
          <ArrowUpRight
            className="size-4 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent"
            aria-hidden
          />
        </div>
        <div>
          <Heading className="text-lg font-semibold tracking-tight">
            <Link
              href={href}
              className="after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-ring"
            >
              {project.name}
            </Link>
          </Heading>
          <p className="mt-0.5 font-mono text-xs text-fg-subtle">{project.domain}</p>
        </div>
        <p className="text-sm text-pretty text-fg-muted">{project.summary}</p>
        {project.stack.length > 0 && (
          <ul className="mt-auto flex flex-wrap gap-1.5 pt-1" aria-label="Technologies">
            {project.stack.slice(0, 3).map((item) => (
              <li key={item}>
                <Badge>{item}</Badge>
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}
