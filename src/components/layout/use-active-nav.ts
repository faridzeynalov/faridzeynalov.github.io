"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const SECTIONS = ["about", "contact"] as const;
type Section = (typeof SECTIONS)[number];

/** The last section whose top has passed the middle of the viewport (or the last one at page end). */
function findCurrentSection(): Section | null {
  const atBottom = window.innerHeight + window.scrollY >= document.body.scrollHeight - 4;
  if (atBottom) return SECTIONS[SECTIONS.length - 1];
  let current: Section | null = null;
  for (const id of SECTIONS) {
    const element = document.getElementById(id);
    if (element && element.getBoundingClientRect().top < window.innerHeight * 0.5) current = id;
  }
  return current;
}

/**
 * Returns the href of the nav item that should be highlighted.
 * On the home page, "About" / "Contact" light up as their sections scroll into view.
 */
export function useActiveNav(): string {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [section, setSection] = useState<Section | null>(null);

  useEffect(() => {
    if (!isHome) return;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setSection(findCurrentSection()));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [isHome]);

  if (pathname.startsWith("/portfolio")) return "/portfolio/";
  if (isHome && section) return `/#${section}`;
  if (isHome) return "/";
  return "";
}
