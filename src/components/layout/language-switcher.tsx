"use client";

import { Check, ChevronDown, Languages } from "lucide-react";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { usePathname } from "@/i18n/navigation";
import { LOCALE_STORAGE_KEY, localeNames, routing, type Locale } from "@/i18n/routing";
import { useAppLocale } from "@/i18n/use-app-locale";
import { localizedPath } from "@/lib/i18n-metadata";
import { cn } from "@/lib/utils";

/** Header language menu: switches to the same page in another language and remembers it. */
export function LanguageSwitcher({ className }: { className?: string }) {
  const t = useTranslations("Nav");
  const locale = useAppLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        rootRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function remember(next: Locale) {
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
    } catch {
      // Storage may be blocked; the URL still carries the language.
    }
    setOpen(false);
  }

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={`${t("language")}: ${localeNames[locale].native}`}
        className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border px-3 font-mono text-xs text-fg-muted transition-colors hover:border-border-strong hover:text-fg"
      >
        <Languages className="size-3.5" aria-hidden />
        {localeNames[locale].short}
        <ChevronDown
          className={cn("size-3 transition-transform duration-200", open && "rotate-180")}
          aria-hidden
        />
      </button>

      <AnimatePresence>
        {open && (
          <m.ul
            id={menuId}
            className="absolute right-0 z-[70] mt-2 min-w-44 overflow-hidden rounded-xl border border-border-strong bg-bg-elevated p-1 shadow-float"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.18 }}
          >
            {routing.locales.map((option) => {
              const label = (
                <>
                  <span className="w-6 font-mono text-[11px] text-fg-subtle">
                    {localeNames[option].short}
                  </span>
                  {localeNames[option].native}
                </>
              );
              // The current language is plain text, not a link: choosing it again would only
              // reload the page.
              if (option === locale) {
                return (
                  <li key={option}>
                    <span
                      lang={option}
                      aria-current="true"
                      className="flex cursor-default items-center gap-3 rounded-lg bg-bg-inset px-3 py-2 text-sm text-fg"
                    >
                      {label}
                      <Check className="ml-auto size-4 text-accent" aria-hidden />
                    </span>
                  </li>
                );
              }
              return (
                <li key={option}>
                  {/* The clean URL (English unprefixed); next-intl's locale switch would
                      link English as /en/…, which static hosting can only redirect. */}
                  <Link
                    href={localizedPath(option, pathname)}
                    hrefLang={option}
                    lang={option}
                    onClick={() => remember(option)}
                    aria-label={t("switchLanguage", { language: localeNames[option].native })}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-fg-muted transition-colors hover:bg-bg-subtle hover:text-fg"
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
          </m.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
