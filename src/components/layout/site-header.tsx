"use client";

import { Link } from "@/i18n/navigation";
import * as m from "motion/react-m";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { Logo } from "@/components/layout/logo";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { useActiveNav } from "@/components/layout/use-active-nav";
import { buttonVariants } from "@/components/ui/button";
import { navItems } from "@/lib/site";
import { cn } from "@/lib/utils";
import type { TreeNode } from "@/types/nav";

export function SiteHeader({ tree }: { tree: TreeNode[] }) {
  const t = useTranslations("Nav");
  const active = useActiveNav();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 print:hidden">
      <div
        className={cn(
          "absolute inset-0 border-b transition-[background-color,border-color] duration-300",
          scrolled
            ? // Phones get a solid bar: a blurred backdrop on a fixed header is re-rendered on
              // every scroll frame, which is what makes mobile scrolling stutter.
              "border-border bg-bg/95 md:bg-bg/75 md:backdrop-blur-lg"
            : "border-transparent bg-transparent",
        )}
        aria-hidden
      />
      <div className="relative container-page flex h-16 items-center justify-between gap-4">
        <Logo />

        <nav aria-label={t("main")} className="hidden md:block">
          <ul className="flex items-center gap-1 rounded-full border border-border bg-bg-elevated/50 p-1 backdrop-blur">
            {navItems.map((item) => {
              const isActive = active === item.href;
              return (
                <li key={item.href} className="relative">
                  {isActive && (
                    <m.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full bg-bg-inset"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      aria-hidden
                    />
                  )}
                  <Link
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "relative block rounded-full px-4 py-1.5 text-[13.5px] transition-colors",
                      isActive ? "text-fg" : "text-fg-muted hover:text-fg",
                    )}
                  >
                    {t(item.key)}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
          <Link
            href="/contact"
            className={cn(buttonVariants({ size: "sm" }), "hidden lg:inline-flex")}
          >
            {t("letsTalk")}
          </Link>
          <MobileNav tree={tree} />
        </div>
      </div>
    </header>
  );
}
