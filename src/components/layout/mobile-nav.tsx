"use client";

import {
  ArrowUpRight,
  ChessKnight,
  ChevronRight,
  CircleCheck,
  Ellipsis,
  GitBranch,
  Menu,
  X,
} from "lucide-react";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState, type RefObject } from "react";
import { ExplorerTree } from "@/components/layout/explorer-tree";
import { LogoMark } from "@/components/layout/logo";
import { useSkin } from "@/components/layout/use-appearance";
import { useActiveNav } from "@/components/layout/use-active-nav";
import { owner } from "@/data/owner";
import { Link, usePathname } from "@/i18n/navigation";
import { navItems } from "@/lib/site";
import { cn } from "@/lib/utils";
import type { TreeNode } from "@/types/nav";

const ease = [0.16, 1, 0.3, 1] as const;

/**
 * Mobile menu. The Classic style gets a simple full-screen list of pages; the Developer style
 * gets a VS Code Explorer, where sections are folders and pages and links are files.
 */
export function MobileNav({ tree }: { tree: TreeNode[] }) {
  const t = useTranslations("Nav");
  const skin = useSkin();
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
    panelRef.current?.querySelector<HTMLElement>("[aria-current='page'], a, button")?.focus();

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

  const close = () => setOpen(false);

  return (
    <div className="md:hidden">
      <button
        ref={toggleRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? t("closeMenu") : t("openMenu")}
        className="relative z-[60] inline-flex size-9 items-center justify-center rounded-pill border border-border bg-bg text-fg"
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
        {open &&
          (skin === "dev" ? (
            <ExplorerPanel key="explorer" panelRef={panelRef} tree={tree} onNavigate={close} />
          ) : (
            <ClassicPanel key="classic" panelRef={panelRef} onNavigate={close} />
          ))}
      </AnimatePresence>
    </div>
  );
}

interface PanelProps {
  panelRef: RefObject<HTMLDivElement | null>;
  onNavigate: () => void;
}

/** Classic style: large page links that slide in one after another, plus contact details. */
function ClassicPanel({ panelRef, onNavigate }: PanelProps) {
  const t = useTranslations("Nav");
  const active = useActiveNav();

  return (
    <m.div
      ref={panelRef}
      id="mobile-menu"
      role="dialog"
      aria-modal="true"
      aria-label={t("menu")}
      className="fixed inset-0 z-[55] flex flex-col overflow-y-auto bg-bg px-5 pt-24 pb-10"
      initial={{ clipPath: "inset(0 0 100% 0)" }}
      animate={{ clipPath: "inset(0 0 0% 0)" }}
      exit={{ clipPath: "inset(0 0 100% 0)" }}
      transition={{ duration: 0.55, ease }}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-grid mask-radial opacity-70"
        aria-hidden
      />
      <LogoMark className="absolute top-[18px] left-5" />
      <nav aria-label={t("mobile")} className="relative">
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
              transition={{ duration: 0.6, ease }}
              className="border-b border-border"
            >
              <Link
                href={item.href}
                onClick={onNavigate}
                aria-current={active === item.href ? "page" : undefined}
                className={cn(
                  "flex items-baseline justify-between py-5 text-4xl font-medium tracking-tight",
                  active === item.href ? "text-fg" : "text-fg-muted",
                )}
              >
                <span>
                  {/* 8-bit style: a game-menu cursor on the current page. Chess: a knight. */}
                  {active === item.href && (
                    <>
                      <span
                        aria-hidden
                        className="mr-3 hidden animate-[caret-blink_1.06s_steps(1)_infinite] text-accent pixel:inline"
                      >
                        ▶
                      </span>
                      <ChessKnight
                        aria-hidden
                        className="mr-3 hidden size-7 -translate-y-0.5 align-middle text-accent chess:inline"
                      />
                    </>
                  )}
                  {t(item.key)}
                </span>
                <span aria-hidden className="font-mono text-xs text-fg-subtle">
                  0{index + 1}
                </span>
              </Link>
            </m.li>
          ))}
        </m.ul>
      </nav>
      <m.div
        className="relative mt-auto space-y-3 pt-10 text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.4 } }}
      >
        <p className="font-mono text-xs text-fg-subtle uppercase">{t("getInTouch")}</p>
        <a href={`mailto:${owner.email}`} className="block text-lg text-fg">
          {owner.email}
        </a>
        <a
          href={owner.linkedIn.href}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-fg-muted"
        >
          LinkedIn <ArrowUpRight className="size-3.5" aria-hidden />
        </a>
      </m.div>
    </m.div>
  );
}

/** Developer style: a VS Code-like Explorer sidebar with a status bar. */
function ExplorerPanel({ panelRef, onNavigate, tree }: PanelProps & { tree: TreeNode[] }) {
  const t = useTranslations("Nav");
  const te = useTranslations("Explorer");
  const [rootOpen, setRootOpen] = useState(true);
  const pathname = usePathname();

  return (
    <m.div
      ref={panelRef}
      id="mobile-menu"
      role="dialog"
      aria-modal="true"
      aria-label={t("menu")}
      className="fixed inset-0 z-[55] flex flex-col bg-bg-elevated pt-16"
      initial={{ clipPath: "inset(0 100% 0 0)" }}
      animate={{ clipPath: "inset(0 0% 0 0)" }}
      exit={{ clipPath: "inset(0 100% 0 0)" }}
      transition={{ duration: 0.5, ease }}
    >
      <LogoMark className="absolute top-[18px] left-5" />

      {/* Sidebar title bar */}
      <div className="flex h-10 shrink-0 items-center justify-between border-y border-border px-5 font-mono text-[11px] tracking-wider text-fg-subtle uppercase">
        {te("title")}
        <Ellipsis className="size-4" aria-hidden />
      </div>

      {/* Workspace root */}
      <nav aria-label={t("mobile")} className="flex min-h-0 flex-1 flex-col">
        <button
          type="button"
          onClick={() => setRootOpen((value) => !value)}
          aria-expanded={rootOpen}
          aria-controls="explorer-root"
          className="flex h-9 shrink-0 items-center gap-1 px-3 text-left font-mono text-[11.5px] font-semibold tracking-wider text-fg uppercase"
        >
          <ChevronRight
            className={cn("size-4 transition-transform duration-200", rootOpen && "rotate-90")}
            aria-hidden
          />
          farid-zeynalov
        </button>
        <AnimatePresence initial={false}>
          {rootOpen && (
            <m.div
              id="explorer-root"
              key="root"
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 pb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <ExplorerTree nodes={tree} pathname={pathname} onNavigate={onNavigate} />
            </m.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Status bar */}
      <m.div
        className="flex h-7 shrink-0 items-center justify-between bg-accent px-3 font-mono text-[11px] text-accent-fg"
        initial={{ y: 28 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.4, delay: 0.25, ease }}
        aria-hidden
      >
        <span className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <GitBranch className="size-3.5" />
            main
          </span>
          <span className="flex items-center gap-1">
            <CircleCheck className="size-3.5" />
            {te("openToWork")}
          </span>
        </span>
        <span>TSX · UTF-8</span>
      </m.div>
    </m.div>
  );
}
