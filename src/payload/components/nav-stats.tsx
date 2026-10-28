import type { Payload } from "payload";
import { getAdminStats, LOCALES } from "@/payload/components/admin-stats";
import { PanelStylePicker } from "@/payload/components/panel-style";
import { PANEL_STYLE_COOKIE, toPanelStyle } from "@/payload/components/panel-style-shared";
import { cookies } from "next/headers";

const copy = {
  az: {
    health: "Tərcümələr",
    complete: "Hamısı doldurulub",
    missing: (count: number) => `${count} mətn boşdur`,
    style: "Panel üslubu",
  },
  en: {
    health: "Translations",
    complete: "All filled in",
    missing: (count: number) => `${count} texts empty`,
    style: "Panel style",
  },
  ru: {
    health: "Переводы",
    complete: "Всё заполнено",
    missing: (count: number) => `Пустых текстов: ${count}`,
    style: "Стиль панели",
  },
} as const;

type Props = { payload: Payload; i18n: { language: string } };

/**
 * Count badges for the sidebar links, as CSS custom properties on each link's id (Payload renders
 * the links itself): muted counts, and accented ones for things that need attention. Also renders
 * the chosen panel style as a marker element that custom.css reads with :has(), so it is there
 * with the first paint without any script.
 */
export async function NavBadges({ payload }: Props) {
  const stats = await getAdminStats(payload);
  const empty = Object.values(stats.emptyTranslations).reduce((sum, count) => sum + count, 0);
  const badges: [string, number, boolean][] = [
    ["nav-projects", stats.projects, false],
    ["nav-services", stats.services, false],
    ["nav-process-steps", stats.process, false],
    ["nav-faq", stats.faq, false],
    ["nav-translations", empty || stats.translations, empty > 0],
  ];
  const css = badges
    .map(
      ([id, value, attention]) =>
        `#${id}{--fz-badge:"${value}";${attention ? "--fz-badge-bg:var(--fz-accent);--fz-badge-fg:var(--fz-accent-fg);" : ""}}`,
    )
    .join("");
  return (
    <>
      <span hidden data-fz-style-marker={await currentStyle()} />
      <style dangerouslySetInnerHTML={{ __html: css }} />
    </>
  );
}

/**
 * The bottom of the sidebar: how complete the translations are in each language (like a usage
 * meter), the panel style picker and a link to the live site.
 */
export async function NavFooter({ payload, i18n }: Props) {
  const text = copy[i18n.language as keyof typeof copy] ?? copy.en;
  const stats = await getAdminStats(payload);
  const empty = Object.values(stats.emptyTranslations).reduce((sum, count) => sum + count, 0);
  const admin = payload.config.routes.admin;

  return (
    <div className="fz-nav-foot">
      <a href={`${admin}/collections/translations`} className="fz-health">
        <span className="fz-health__head">
          <span>{text.health}</span>
          <strong className={empty ? "is-warn" : undefined}>
            {empty ? text.missing(empty) : text.complete}
          </strong>
        </span>
        {LOCALES.map((locale) => (
          <span key={locale} className="fz-health__row">
            <span className="fz-health__code">{locale}</span>
            <span className="fz-health__bar">
              <span style={{ width: `${stats.coverage[locale]}%` }} />
            </span>
            <span className="fz-health__value">{stats.coverage[locale]}%</span>
          </span>
        ))}
      </a>
      <PanelStylePicker
        label={text.style}
        language={i18n.language}
        initial={await currentStyle()}
      />
      <SiteLink language={i18n.language} />
    </div>
  );
}

async function currentStyle() {
  return toPanelStyle((await cookies()).get(PANEL_STYLE_COOKIE)?.value);
}

const site = {
  az: "Saytı aç",
  en: "Open the site",
  ru: "Открыть сайт",
} as const;

function SiteLink({ language }: { language: string }) {
  return (
    <a href="/" target="_blank" rel="noreferrer" className="fz-nav-site">
      <span className="fz-nav-site__dot" aria-hidden />
      <span>
        <strong>{site[language as keyof typeof site] ?? site.en}</strong>
        <small>faridzeynalov.com</small>
      </span>
      <span className="fz-nav-site__arrow" aria-hidden>
        ↗
      </span>
    </a>
  );
}
