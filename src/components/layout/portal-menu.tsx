"use client";

import { LayoutDashboard, LogIn, LogOut, UserRound } from "lucide-react";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import { useTranslations } from "next-intl";
import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { logout } from "@/app/[locale]/portal/actions";
import { Link, usePathname } from "@/i18n/navigation";
import { useAppLocale } from "@/i18n/use-app-locale";
import { PORTAL_USER_EVENT, readPortalUser, writePortalUser } from "@/lib/portal-session";
import { cn } from "@/lib/utils";

function subscribe(onChange: () => void) {
  window.addEventListener(PORTAL_USER_EVENT, onChange);
  return () => window.removeEventListener(PORTAL_USER_EVENT, onChange);
}

/** The signed-in client's first name, or null; re-read on every navigation too. */
export function usePortalUser() {
  usePathname();
  return useSyncExternalStore(subscribe, readPortalUser, () => null);
}

/** Rendered on the portal's signed-in pages: marks the session for the header if it isn't yet. */
export function PortalSessionMark({ name }: { name: string }) {
  useEffect(() => {
    if (readPortalUser() !== name) writePortalUser(name);
  }, [name]);
  return null;
}

function SignOut({ className, children }: { className: string; children: React.ReactNode }) {
  const locale = useAppLocale();
  return (
    <form action={logout}>
      <input type="hidden" name="locale" value={locale} />
      <button type="submit" className={className}>
        {children}
      </button>
    </form>
  );
}

/**
 * The client portal at the right of the header (wider screens; phones have it in the menu): an
 * icon, or the signed-in client's initial, that opens a menu to sign in, or to go to the dashboard
 * and sign out.
 */
export function PortalMenu({ className }: { className?: string }) {
  const t = useTranslations("Nav");
  const name = usePortalUser();
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

  const item =
    "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-fg-muted transition-colors hover:bg-bg-subtle hover:text-fg";

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={name ? t("portalAccount", { name }) : t("portal")}
        className={cn(
          "inline-flex size-9 items-center justify-center rounded-pill transition-[border-color,color,box-shadow]",
          name
            ? "bg-accent text-sm font-semibold text-accent-fg hover:ring-4 hover:ring-accent-soft"
            : "border border-border text-fg-muted hover:border-border-strong hover:text-fg",
        )}
      >
        {name ? name.charAt(0).toUpperCase() : <UserRound className="size-4" aria-hidden />}
      </button>

      <AnimatePresence>
        {open && (
          <m.div
            id={menuId}
            className="absolute right-0 z-[70] mt-2 w-60 overflow-hidden rounded-xl border border-border-strong bg-bg-elevated p-1 shadow-float"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.18 }}
          >
            <p className="border-b border-border px-3 pt-2 pb-2.5">
              <span className="block truncate text-sm font-medium text-fg">
                {name ?? t("portal")}
              </span>
              <span className="block text-xs text-fg-subtle">
                {name ? t("portal") : t("portalHint")}
              </span>
            </p>
            <ul className="pt-1">
              {name ? (
                <>
                  <li>
                    <Link href="/portal" onClick={() => setOpen(false)} className={item}>
                      <LayoutDashboard className="size-4" aria-hidden />
                      {t("portalDashboard")}
                    </Link>
                  </li>
                  <li>
                    <SignOut className={item}>
                      <LogOut className="size-4" aria-hidden />
                      {t("portalSignOut")}
                    </SignOut>
                  </li>
                </>
              ) : (
                <li>
                  <Link href="/portal/login" onClick={() => setOpen(false)} className={item}>
                    <LogIn className="size-4" aria-hidden />
                    {t("portalSignIn")}
                  </Link>
                </li>
              )}
            </ul>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** The client portal in the mobile menu: sign in, or the dashboard and sign-out. */
export function MobilePortalLinks({
  onNavigate,
  className,
}: {
  onNavigate: () => void;
  className?: string;
}) {
  const t = useTranslations("Nav");
  const name = usePortalUser();
  const link =
    "inline-flex items-center gap-2 rounded-pill border border-border px-3.5 py-2 text-sm text-fg transition-colors hover:border-border-strong";

  return (
    <div className={cn("rounded-2xl border border-border bg-bg-elevated p-4", className)}>
      <div className="mb-3 flex items-center gap-3">
        <span
          className={cn(
            "inline-flex size-9 shrink-0 items-center justify-center rounded-pill",
            name ? "bg-accent text-sm font-semibold text-accent-fg" : "bg-bg-subtle text-fg-muted",
          )}
          aria-hidden
        >
          {name ? name.charAt(0).toUpperCase() : <UserRound className="size-4" />}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium text-fg">{name ?? t("portal")}</span>
          <span className="block text-xs text-fg-subtle">
            {name ? t("portal") : t("portalHint")}
          </span>
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {name ? (
          <>
            <Link href="/portal" onClick={onNavigate} className={link}>
              <LayoutDashboard className="size-4" aria-hidden />
              {t("portalDashboard")}
            </Link>
            <SignOut className={cn(link, "text-fg-muted")}>
              <LogOut className="size-4" aria-hidden />
              {t("portalSignOut")}
            </SignOut>
          </>
        ) : (
          <Link href="/portal/login" onClick={onNavigate} className={link}>
            <LogIn className="size-4" aria-hidden />
            {t("portalSignIn")}
          </Link>
        )}
      </div>
    </div>
  );
}
