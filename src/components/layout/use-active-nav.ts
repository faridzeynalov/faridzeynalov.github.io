"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const SECTIONS = ["services", "about", "contact"] as const;
type Section = (typeof SECTIONS)[number];

/** The section spanning the middle of the viewport (or the last one at page end). */
function findCurrentSection(): Section | null {
  const atBottom = window.innerHeight + window.scrollY >= document.body.scrollHeight - 4;
  if (atBottom) return SECTIONS[SECTIONS.length - 1];
  const middle = window.innerHeight * 0.5;
  for (const id of SECTIONS) {
    const rect = document.getElementById(id)?.getBoundingClientRect();
    if (rect && rect.top < middle && rect.bottom > middle) return id;
  }
  return null;
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
  if (pathname.startsWith("/cv")) return "/cv/";
  if (isHome && section) return `/#${section}`;
  if (isHome) return "/";
  return "";
}
