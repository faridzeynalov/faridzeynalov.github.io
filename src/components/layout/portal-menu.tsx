"use client";

import { LayoutDashboard, LogOut, UserRound } from "lucide-react";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import { useTranslations } from "next-intl";
import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { logout } from "@/app/[locale]/portal/actions";
import { Link, usePathname } from "@/i18n/navigation";
import { useAppLocale } from "@/i18n/use-app-locale";
import { readPortalUser } from "@/lib/portal-session";
import { cn } from "@/lib/utils";

const noSubscription = () => () => {};

const buttonClass =
  "inline-flex size-9 items-center justify-center rounded-pill border border-border text-fg-muted transition-colors hover:border-border-strong hover:text-fg";

/**
 * The client portal in the header: a sign-in icon, or, when a client is signed in, their initial,
 * which opens a menu with their dashboard and sign-out.
 */
export function PortalMenu({ className }: { className?: string }) {
  const t = useTranslations("Nav");
  const locale = useAppLocale();
  // Re-read on every navigation (signing in or out goes through one), not only once.
  usePathname();
  const name = useSyncExternalStore(noSubscription, readPortalUser, () => null);
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

  if (!name) {
    return (
      <Link
        href="/portal/login"
        aria-label={t("portalSignIn")}
        title={t("portalSignIn")}
        className={cn(buttonClass, className)}
      >
        <UserRound className="size-4" aria-hidden />
      </Link>
    );
  }

  const item =
    "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-fg-muted transition-colors hover:bg-bg-subtle hover:text-fg";

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={t("portalAccount", { name })}
        className="inline-flex size-9 items-center justify-center rounded-pill bg-accent text-sm font-semibold text-accent-fg transition-[box-shadow] hover:ring-4 hover:ring-accent-soft"
      >
        {name.charAt(0).toUpperCase()}
      </button>

      <AnimatePresence>
        {open && (
          <m.div
            id={menuId}
            className="absolute right-0 z-[70] mt-2 w-56 overflow-hidden rounded-xl border border-border-strong bg-bg-elevated p-1 shadow-float"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.18 }}
          >
            <p className="border-b border-border px-3 pt-2 pb-2.5">
              <span className="block truncate text-sm font-medium text-fg">{name}</span>
              <span className="block font-mono text-[11px] text-fg-subtle uppercase">
                {t("portal")}
              </span>
            </p>
            <ul className="pt-1">
              <li>
                <Link href="/portal" onClick={() => setOpen(false)} className={item}>
                  <LayoutDashboard className="size-4" aria-hidden />
                  {t("portalDashboard")}
                </Link>
              </li>
              <li>
                <form action={logout}>
                  <input type="hidden" name="locale" value={locale} />
                  <button type="submit" className={item}>
                    <LogOut className="size-4" aria-hidden />
                    {t("portalSignOut")}
                  </button>
                </form>
              </li>
            </ul>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
