"use client";

import { usePathname } from "next/navigation";
import { navItems } from "@/lib/site";

/**
 * Returns the href of the nav item for the current page. Every menu item has its own page,
 * so this is a pathname match: Home only on "/", others also on their sub-pages.
 */
export function useActiveNav(): string {
  const pathname = usePathname();
  const normalized = pathname.endsWith("/") ? pathname : `${pathname}/`;
  if (normalized === "/") return "/";
  const match = navItems.find((item) => item.href !== "/" && normalized.startsWith(item.href));
  return match?.href ?? "";
}
