"use client";

import { useConfig, useNav, useTranslation } from "@payloadcms/ui";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { SiteLogoMark } from "@/payload/components/brand";
import Link from "next/link";

const labels = {
  az: { dashboard: "İdarə paneli", newProject: "Yeni layihə", close: "Menyunu bağla" },
  en: { dashboard: "Dashboard", newProject: "New project", close: "Close menu" },
  ru: { dashboard: "Панель", newProject: "Новый проект", close: "Закрыть меню" },
} as const;

/** Below this width the sidebar is a drawer over the page (see custom.css). */
const DRAWER_QUERY = "(max-width: 1024px)";

/**
 * The top of the sidebar: the brand (the site's monogram and name), the main action (a new
 * portfolio project) and a link back to the dashboard. On phones and tablets it also runs the
 * drawer: a close button, a backdrop that closes it, Escape, and closing after navigating.
 */
export function NavHeader() {
  const { config } = useConfig();
  const { i18n } = useTranslation();
  const { navOpen, setNavOpen } = useNav();
  const pathname = usePathname();
  const copy = labels[i18n.language as keyof typeof labels] ?? labels.en;
  const admin = config.routes.admin;
  const onDashboard = pathname === admin || pathname === `${admin}/`;
  const [drawer, setDrawer] = useState(false);
  const previousPath = useRef(pathname);

  useEffect(() => {
    const query = window.matchMedia(DRAWER_QUERY);
    const update = () => setDrawer(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  // A link in the drawer was followed: put the drawer away.
  useEffect(() => {
    if (previousPath.current === pathname) return;
    previousPath.current = pathname;
    if (drawer) setNavOpen(false);
  }, [pathname, drawer, setNavOpen]);

  useEffect(() => {
    if (!drawer || !navOpen) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setNavOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawer, navOpen, setNavOpen]);

  return (
    <div className="fz-nav-head">
      <div className="fz-nav-head__top">
        <Link href={admin} className="fz-nav-brand">
          <SiteLogoMark className="fz-nav-brand__mark" />
          <span>
            <strong>
              Farid <em>Zeynalov</em>
            </strong>
            <small>Content studio</small>
          </span>
        </Link>
        <button
          type="button"
          className="fz-nav-close"
          aria-label={copy.close}
          onClick={() => setNavOpen(false)}
        >
          <svg viewBox="0 0 24 24" aria-hidden>
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>
      <Link href={`${admin}/collections/projects/create`} className="fz-nav-cta">
        <span aria-hidden>+</span> {copy.newProject}
      </Link>
      <Link
        href={admin}
        className={
          onDashboard ? "nav__link fz-nav-dashboard is-current" : "nav__link fz-nav-dashboard"
        }
        aria-current={onDashboard ? "page" : undefined}
      >
        {onDashboard && <span className="nav__link-indicator" />}
        <span className="nav__link-label">{copy.dashboard}</span>
      </Link>
      {drawer &&
        navOpen &&
        createPortal(
          <button
            type="button"
            className="fz-nav-backdrop"
            aria-label={copy.close}
            onClick={() => setNavOpen(false)}
          />,
          // Inside the page frame, which isolates its own stacking order: below the drawer.
          document.querySelector(".template-default") ?? document.body,
        )}
    </div>
  );
}
