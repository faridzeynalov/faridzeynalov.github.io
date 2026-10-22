"use client";

import { ArrowUpRight, Menu, X } from "lucide-react";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LogoMark } from "@/components/layout/logo";
import { profile } from "@/data/profile";
import { navItems } from "@/lib/site";
import { cn } from "@/lib/utils";

const linkedIn = profile.social.find((link) => link.label === "LinkedIn");

export function MobileNav({ active }: { active: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close whenever the route changes.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.querySelector<HTMLElement>("a")?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
        return;
      }
      // Keep keyboard focus inside the open menu.
      if (event.key === "Tab" && panelRef.current && toggleRef.current) {
        const focusable = [
          toggleRef.current,
          ...panelRef.current.querySelectorAll<HTMLElement>("a, button"),
        ];
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        ref={toggleRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        className="relative z-[60] inline-flex size-9 items-center justify-center rounded-full border border-border bg-bg text-fg"
      >
        <AnimatePresence initial={false} mode="wait">
          <m.span
            key={open ? "close" : "open"}
            initial={{ opacity: 0, rotate: -45, scale: 0.6 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 45, scale: 0.6 }}
            transition={{ duration: 0.2 }}
            className="flex"
          >
            {open ? <X className="size-4" aria-hidden /> : <Menu className="size-4" aria-hidden />}
          </m.span>
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {open && (
          <m.div
            ref={panelRef}
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="fixed inset-0 z-[55] flex flex-col bg-bg px-5 pt-24 pb-10"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          >
            <div
              className="pointer-events-none absolute inset-0 bg-grid mask-radial opacity-70"
              aria-hidden
            />
            <LogoMark className="absolute top-[18px] left-5" />
            <nav aria-label="Mobile" className="relative">
              <m.ul
                className="flex flex-col"
                initial="hidden"
                animate="show"
                variants={{ show: { transition: { staggerChildren: 0.06, delayChildren: 0.15 } } }}
              >
                {navItems.map((item, index) => (
                  <m.li
                    key={item.href}
                    variants={{ hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0 } }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="border-b border-border"
                  >
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      aria-current={active === item.href ? "page" : undefined}
                      className={cn(
                        "flex items-baseline justify-between py-5 text-4xl font-medium tracking-tight",
                        active === item.href ? "text-fg" : "text-fg-muted",
                      )}
                    >
                      {item.label}
                      <span aria-hidden className="font-mono text-xs text-fg-subtle">
                        0{index + 1}
                      </span>
                    </Link>
                  </m.li>
                ))}
              </m.ul>
            </nav>
            <m.div
              className="relative mt-auto space-y-3 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.4 } }}
            >
              <p className="font-mono text-xs text-fg-subtle uppercase">Get in touch</p>
              <a href={`mailto:${profile.email}`} className="block text-lg text-fg">
                {profile.email}
              </a>
              {linkedIn && (
                <a
                  href={linkedIn.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-fg-muted"
                >
                  LinkedIn <ArrowUpRight className="size-3.5" aria-hidden />
                </a>
              )}
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
