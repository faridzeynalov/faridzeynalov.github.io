"use client";

import { ArrowUpRight } from "lucide-react";
import {
  AnimatePresence,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";
import * as m from "motion/react-m";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useEffect, useState, type PointerEvent } from "react";
import type { Industry, Project } from "@/types/project";

/**
 * Portfolio page signature: an editorial list where the hovered project's screenshot follows
 * the cursor and tilts with its speed. Touch devices get inline thumbnails instead.
 */
export function ProjectList({
  projects,
  industryLabels,
}: {
  projects: Project[];
  industryLabels: Record<Industry, string>;
}) {
  const reduceMotion = useReducedMotion();
  const [finePointer, setFinePointer] = useState(false);
  const [hovered, setHovered] = useState<Project | null>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 260, damping: 28, mass: 0.5 });
  const springY = useSpring(y, { stiffness: 260, damping: 28, mass: 0.5 });
  const rotate = useTransform(useVelocity(springX), [-1500, 0, 1500], [-8, 0, 8], {
    clamp: true,
  });

  useEffect(() => {
    const media = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setFinePointer(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  const showPreview = finePointer && !reduceMotion && hovered?.images;

  function onMove(event: PointerEvent) {
    x.set(event.clientX);
    y.set(event.clientY);
  }

  return (
    <>
      <ul
        className="border-t border-border"
        onPointerMove={onMove}
        onPointerLeave={() => setHovered(null)}
      >
        {projects.map((project, index) => (
          <li key={project.slug}>
            <Link
              href={`/portfolio/${project.slug}`}
              onPointerEnter={() => setHovered(project)}
              className="group grid grid-cols-[2.5rem_1fr_auto] items-center gap-4 border-b border-border py-5 transition-colors duration-300 hover:bg-bg-subtle/40 md:grid-cols-[3.5rem_1.6fr_1fr_1fr_auto] md:py-7"
            >
              <span className="font-mono text-xs text-fg-subtle tabular-nums transition-colors group-hover:text-accent">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0">
                <h2 className="truncate text-xl font-semibold tracking-[-0.02em] transition-transform duration-500 ease-out-expo group-hover:translate-x-2 md:text-3xl">
                  {project.name}
                </h2>
                <span className="mt-1 block truncate font-mono text-xs text-fg-subtle md:hidden">
                  {project.domain}
                </span>
              </span>
              <span className="hidden text-sm text-fg-muted md:block">
                {industryLabels[project.industry]}
              </span>
              <span className="hidden truncate font-mono text-xs text-fg-subtle md:block">
                {project.domain}
              </span>
              <span className="flex items-center gap-3">
                {/* Inline thumbnail where hover isn't available */}
                {project.images && (
                  <span className="hidden overflow-hidden rounded-md border border-border [@media(hover:none)]:block">
                    <Image
                      src={project.images.thumb}
                      alt=""
                      sizes="72px"
                      className="h-auto w-[72px]"
                    />
                  </span>
                )}
                <ArrowUpRight
                  className="size-5 text-fg-subtle transition-transform duration-300 group-hover:rotate-45 group-hover:text-accent"
                  aria-hidden
                />
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {/* Floating preview that follows the cursor */}
      <m.div
        className="pointer-events-none fixed top-0 left-0 z-40 print:hidden"
        style={{ x: springX, y: springY, rotate }}
        aria-hidden
      >
        <AnimatePresence>
          {showPreview && (
            <m.div
              key="preview"
              className="-translate-x-1/2 -translate-y-1/2"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="relative aspect-[16/10] w-[360px] overflow-hidden rounded-xl border border-border-strong bg-frame shadow-float">
                <AnimatePresence initial={false}>
                  <m.div
                    key={hovered.slug}
                    className="absolute inset-0"
                    initial={{ clipPath: "inset(100% 0 0 0)" }}
                    animate={{ clipPath: "inset(0% 0 0 0)" }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Image
                      src={hovered.images!.thumb}
                      alt=""
                      sizes="360px"
                      className="h-full w-full object-cover object-top"
                    />
                  </m.div>
                </AnimatePresence>
              </div>
            </m.div>
          )}
        </AnimatePresence>
      </m.div>
    </>
  );
}
