"use client";

import { Check, Code2, LayoutTemplate, Moon, Sun, type LucideIcon } from "lucide-react";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import { useTranslations } from "next-intl";
import { useEffect, useId, useRef, useState } from "react";
import { useSkin, useTheme } from "@/components/layout/use-appearance";
import {
  FOLLOW_SYSTEM_THEME,
  applySkin,
  applyTheme,
  readStoredTheme,
  type Skin,
  type Theme,
} from "@/lib/theme";
import { cn } from "@/lib/utils";

/**
 * Header appearance menu: the site style (Classic / Developer) and light/dark mode. Light/dark
 * keeps the circular reveal from the button; a style change crossfades the whole page.
 */
export function AppearanceMenu({ className }: { className?: string }) {
  const t = useTranslations("Theme");
  const theme = useTheme();
  const skin = useSkin();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  // Follow OS theme changes until the visitor makes an explicit choice.
  useEffect(() => {
    if (!FOLLOW_SYSTEM_THEME) return;
    const media = window.matchMedia("(prefers-color-scheme: light)");
    const onChange = () => {
      if (!readStoredTheme()) applyTheme(media.matches ? "light" : "dark", false);
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function chooseTheme(next: Theme) {
    if (next === theme) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const button = buttonRef.current;
    if (!document.startViewTransition || reduceMotion || !button) {
      applyTheme(next);
      return;
    }
    // Circular reveal from the menu button.
    const rect = button.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const transition = document.startViewTransition(() => applyTheme(next));
    transition.ready
      .then(() => {
        document.documentElement.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
          {
            duration: 600,
            easing: "cubic-bezier(0.16, 1, 0.3, 1)",
            pseudoElement: "::view-transition-new(root)",
          },
        );
      })
      .catch(() => {});
  }

  function chooseSkin(next: Skin) {
    if (next === skin) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!document.startViewTransition || reduceMotion) applySkin(next);
    else document.startViewTransition(() => applySkin(next));
  }

  const label =
    theme && skin
      ? t("current", {
          style: t(skin === "dev" ? "developer" : "classic"),
          mode: t(theme),
        })
      : t("appearance");

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={label}
        title={label}
        className="relative inline-flex size-9 items-center justify-center overflow-hidden rounded-full border border-border text-fg-muted transition-colors hover:border-border-strong hover:text-fg"
      >
        {/* Same convention as the old toggle: Sun in dark mode, Moon in light mode. Both icons
            render and CSS picks one from the <html> class, so there's no hydration flash. */}
        <Sun
          aria-hidden
          className="absolute size-4 translate-y-5 rotate-90 opacity-0 transition-all duration-500 ease-out-expo dark:translate-y-0 dark:rotate-0 dark:opacity-100"
        />
        <Moon
          aria-hidden
          className="absolute size-4 transition-all duration-500 ease-out-expo dark:-translate-y-5 dark:-rotate-90 dark:opacity-0"
        />
        {/* Developer style badge */}
        <span
          aria-hidden
          className="absolute right-[3px] bottom-[3px] hidden size-2 rounded-full bg-accent ring-2 ring-bg dev:block"
        />
      </button>

      <AnimatePresence>
        {open && (
          <m.div
            id={menuId}
            className="absolute right-0 z-[70] mt-2 w-60 overflow-hidden rounded-xl border border-border-strong bg-bg-elevated p-1.5 shadow-float"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.18 }}
          >
            <Group label={t("style")}>
              <Option
                icon={LayoutTemplate}
                label={t("classic")}
                hint={t("classicHint")}
                selected={skin === "classic"}
                onSelect={() => chooseSkin("classic")}
              />
              <Option
                icon={Code2}
                label={t("developer")}
                hint={t("developerHint")}
                selected={skin === "dev"}
                onSelect={() => chooseSkin("dev")}
              />
            </Group>
            <div className="mx-2 my-1.5 h-px bg-border" aria-hidden />
            <Group label={t("mode")} row>
              <Option
                icon={Sun}
                label={t("light")}
                selected={theme === "light"}
                onSelect={() => chooseTheme("light")}
              />
              <Option
                icon={Moon}
                label={t("dark")}
                selected={theme === "dark"}
                onSelect={() => chooseTheme("dark")}
              />
            </Group>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Group({
  label,
  row = false,
  children,
}: {
  label: string;
  row?: boolean;
  children: React.ReactNode;
}) {
  const id = useId();
  return (
    <div role="group" aria-labelledby={id}>
      <p id={id} className="px-2.5 pt-1.5 pb-1 font-mono text-[10.5px] text-fg-subtle uppercase">
        {label}
      </p>
      <div className={cn(row ? "grid grid-cols-2 gap-1" : "space-y-0.5")}>{children}</div>
    </div>
  );
}

function Option({
  icon: Icon,
  label,
  hint,
  selected,
  onSelect,
}: {
  icon: LucideIcon;
  label: string;
  hint?: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-sm transition-colors",
        selected ? "bg-bg-inset text-fg" : "text-fg-muted hover:bg-bg-subtle hover:text-fg",
      )}
    >
      <Icon className={cn("size-4 shrink-0", selected && "text-accent")} aria-hidden />
      <span className="min-w-0 flex-1">
        <span className="block">{label}</span>
        {hint && <span className="block truncate text-xs text-fg-subtle">{hint}</span>}
      </span>
      {selected && hint && <Check className="size-4 shrink-0 text-accent" aria-hidden />}
    </button>
  );
}
