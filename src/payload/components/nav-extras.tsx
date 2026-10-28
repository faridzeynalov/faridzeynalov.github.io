"use client";

import { useConfig, useTranslation } from "@payloadcms/ui";
import { usePathname } from "next/navigation";
import { SiteLogoMark } from "@/payload/components/brand";

const labels = {
  az: { dashboard: "İdarə paneli", newProject: "Yeni layihə" },
  en: { dashboard: "Dashboard", newProject: "New project" },
  ru: { dashboard: "Панель", newProject: "Новый проект" },
} as const;

/**
 * The top of the sidebar: the brand (the site's monogram and name), the main action (a new portfolio project) and a link back
 * to the dashboard.
 */
export function NavHeader() {
  const { config } = useConfig();
  const { i18n } = useTranslation();
  const pathname = usePathname();
  const copy = labels[i18n.language as keyof typeof labels] ?? labels.en;
  const admin = config.routes.admin;
  const onDashboard = pathname === admin || pathname === `${admin}/`;

  return (
    <div className="fz-nav-head">
      <a href={admin} className="fz-nav-brand">
        <SiteLogoMark className="fz-nav-brand__mark" />
        <span>
          <strong>
            Farid <em>Zeynalov</em>
          </strong>
          <small>Content studio</small>
        </span>
      </a>
      <a href={`${admin}/collections/projects/create`} className="fz-nav-cta">
        <span aria-hidden>+</span> {copy.newProject}
      </a>
      <a
        href={admin}
        className={
          onDashboard ? "nav__link fz-nav-dashboard is-current" : "nav__link fz-nav-dashboard"
        }
        aria-current={onDashboard ? "page" : undefined}
      >
        {onDashboard && <span className="nav__link-indicator" />}
        <span className="nav__link-label">{copy.dashboard}</span>
      </a>
    </div>
  );
}
