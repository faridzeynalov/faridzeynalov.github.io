import Link from "next/link";
import type { CollectionSlug, Payload, TypedUser } from "payload";
import { getAdminStats, LOCALES } from "@/payload/components/admin-stats";

const text = {
  az: {
    eyebrow: "İdarə paneli",
    hello: "Xoş gəldiniz",
    lead: "Saytın bütün məzmunu buradan idarə olunur. Saxladığınız dəyişikliklər bir neçə saniyəyə saytda görünür.",
    site: "Saytı aç",
    newProject: "Yeni layihə",
    kpi: {
      projects: "Layihə",
      projectsNote: (hidden: number, featured: number) =>
        `${featured} ana səhifədə${hidden ? ` · ${hidden} gizli` : ""}`,
      services: "Xidmət",
      servicesNote: (hidden: number) => (hidden ? `${hidden} gizli` : "Hamısı aktiv"),
      faq: "Sual",
      faqNote: (steps: number) => `${steps} iş mərhələsi`,
      translations: "Tərcümə",
      translationsNote: (empty: number) => (empty ? `${empty} boş mətn` : "3 dildə tam"),
    },
    activity: "Son 14 gündə dəyişikliklər",
    activityNote: "Saxlanılan sənədlər, gün-gün",
    edits: (count: number) => `${count} dəyişiklik`,
    recent: "Son dəyişikliklər",
    viewAll: "Hamısı",
    empty: "Hələ dəyişiklik yoxdur.",
    industries: "Sahələr üzrə layihələr",
    coverage: "Tərcümə vəziyyəti",
    kinds: {
      projects: "Layihə",
      services: "Xidmət",
      "process-steps": "Mərhələ",
      faq: "Sual",
      translations: "Tərcümə",
    },
  },
  en: {
    eyebrow: "Dashboard",
    hello: "Welcome back",
    lead: "Everything on the site is managed here. Changes you save show up on the site within seconds.",
    site: "Open the site",
    newProject: "New project",
    kpi: {
      projects: "Projects",
      projectsNote: (hidden: number, featured: number) =>
        `${featured} on the home page${hidden ? ` · ${hidden} hidden` : ""}`,
      services: "Services",
      servicesNote: (hidden: number) => (hidden ? `${hidden} hidden` : "All active"),
      faq: "Questions",
      faqNote: (steps: number) => `${steps} process steps`,
      translations: "Translations",
      translationsNote: (empty: number) =>
        empty ? `${empty} empty texts` : "Complete in 3 languages",
    },
    activity: "Changes in the last 14 days",
    activityNote: "Saved documents, day by day",
    edits: (count: number) => `${count} changes`,
    recent: "Recent changes",
    viewAll: "View all",
    empty: "No changes yet.",
    industries: "Projects by industry",
    coverage: "Translation status",
    kinds: {
      projects: "Project",
      services: "Service",
      "process-steps": "Step",
      faq: "Question",
      translations: "Translation",
    },
  },
  ru: {
    eyebrow: "Панель управления",
    hello: "С возвращением",
    lead: "Здесь управляется весь контент сайта. Сохранённые изменения появляются на сайте за несколько секунд.",
    site: "Открыть сайт",
    newProject: "Новый проект",
    kpi: {
      projects: "Проекты",
      projectsNote: (hidden: number, featured: number) =>
        `${featured} на главной${hidden ? ` · ${hidden} скрыто` : ""}`,
      services: "Услуги",
      servicesNote: (hidden: number) => (hidden ? `${hidden} скрыто` : "Все активны"),
      faq: "Вопросы",
      faqNote: (steps: number) => `${steps} этапов работы`,
      translations: "Переводы",
      translationsNote: (empty: number) => (empty ? `Пустых: ${empty}` : "Полностью на 3 языках"),
    },
    activity: "Изменения за 14 дней",
    activityNote: "Сохранённые документы по дням",
    edits: (count: number) => `Изменений: ${count}`,
    recent: "Последние изменения",
    viewAll: "Все",
    empty: "Изменений пока нет.",
    industries: "Проекты по отраслям",
    coverage: "Состояние переводов",
    kinds: {
      projects: "Проект",
      services: "Услуга",
      "process-steps": "Этап",
      faq: "Вопрос",
      translations: "Перевод",
    },
  },
} as const;

const tracked = ["projects", "services", "process-steps", "faq", "translations"] as const;
type Tracked = (typeof tracked)[number];

const titleField: Record<Tracked, string> = {
  projects: "name",
  services: "title",
  "process-steps": "title",
  faq: "question",
  translations: "key",
};

/** The signed-in user's profile photo (set under Users), if any. */
async function avatarUrl(payload: Payload, user: TypedUser | null | undefined) {
  const avatar = (user as { avatar?: number | { url?: string | null } | null } | null | undefined)
    ?.avatar;
  if (!avatar) return null;
  if (typeof avatar === "object") return avatar.url ?? null;
  const media = await payload
    .findByID({ collection: "media", id: avatar, depth: 0 })
    .catch(() => null);
  return media?.url ?? null;
}

const DAYS = 14;
const dayKey = (date: Date) => date.toISOString().slice(0, 10);

/** Saves per day over the last two weeks, and the latest saved documents, across the content. */
async function getActivity(payload: Payload, locale: string) {
  const since = new Date(Date.now() - DAYS * 86_400_000);
  const results = await Promise.all(
    tracked.map(async (collection) => {
      const { docs } = await payload.find({
        collection: collection as CollectionSlug,
        locale: locale as never,
        depth: 0,
        pagination: false,
        sort: "-updatedAt",
        where: { updatedAt: { greater_than: since.toISOString() } },
        select: { updatedAt: true, [titleField[collection]]: true } as never,
      });
      return docs.map((doc) => {
        const record = doc as unknown as Record<string, unknown>;
        return {
          collection,
          id: record.id as number,
          title: String(record[titleField[collection]] ?? `#${record.id}`),
          updatedAt: String(record.updatedAt),
        };
      });
    }),
  );
  const all = results.flat().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const perDay = new Map<string, number>();
  for (const item of all)
    perDay.set(item.updatedAt.slice(0, 10), (perDay.get(item.updatedAt.slice(0, 10)) ?? 0) + 1);
  const days = Array.from({ length: DAYS }, (_, index) => {
    const date = new Date(Date.now() - (DAYS - 1 - index) * 86_400_000);
    return { date, count: perDay.get(dayKey(date)) ?? 0 };
  });
  return { days, recent: all.slice(0, 8) };
}

async function getIndustries(payload: Payload, locale: string) {
  const { docs } = await payload.find({
    collection: "projects",
    locale: locale as never,
    depth: 0,
    pagination: false,
    select: { industry: true },
  });
  const counts = new Map<string, number>();
  for (const doc of docs) counts.set(doc.industry, (counts.get(doc.industry) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}

/**
 * The dashboard, as in the HR panel of ai-interview: a greeting in the site's style, KPI cards
 * with a note under each number, saves per day, recent changes and two breakdowns. A Server
 * Component: Payload passes it the API, the user and the admin's language.
 */
export async function DashboardIntro({
  payload,
  i18n,
  user,
}: {
  payload: Payload;
  i18n: { language: string; t: (key: string) => string };
  user?: TypedUser | null;
}) {
  const language = i18n.language as keyof typeof text;
  const copy = text[language] ?? text.en;
  const contentLocale = LOCALES.includes(language as never) ? language : "az";
  const admin = payload.config.routes.admin;
  const fullName = (user as { name?: string | null } | null | undefined)?.name?.trim();
  const name = fullName?.split(" ")[0];
  // Same initials as the account button (components/avatar.tsx).
  const initials =
    (fullName || user?.email?.split("@")[0] || "")
      .split(/[\s._-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "?";
  const [stats, activity, industries, photo] = await Promise.all([
    getAdminStats(payload),
    getActivity(payload, contentLocale),
    getIndustries(payload, contentLocale),
    avatarUrl(payload, user),
  ]);
  const empty = Object.values(stats.emptyTranslations).reduce((sum, count) => sum + count, 0);
  const peak = Math.max(1, ...activity.days.map((day) => day.count));
  const industryField = payload.collections.projects.config.fields
    .flatMap((field) => ("tabs" in field ? field.tabs.flatMap((tab) => tab.fields) : [field]))
    .flatMap((field) => ("fields" in field && field.type === "row" ? field.fields : [field]))
    .find((field) => "name" in field && field.name === "industry");
  const industryLabel = (value: string) => {
    const option = (industryField && "options" in industryField ? industryField.options : []).find(
      (item) => typeof item === "object" && item.value === value,
    );
    const label = typeof option === "object" ? option.label : value;
    return typeof label === "object"
      ? ((label as Record<string, string>)[language] ?? value)
      : String(label);
  };
  const industryPeak = Math.max(1, ...industries.map(([, count]) => count));
  const dateFormat = new Intl.DateTimeFormat(language, { day: "numeric", month: "short" });
  const timeFormat = new Intl.DateTimeFormat(language, {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  const kpis = [
    {
      href: "collections/projects",
      label: copy.kpi.projects,
      value: stats.projects,
      note: copy.kpi.projectsNote(stats.hiddenProjects, stats.featured),
    },
    {
      href: "collections/services",
      label: copy.kpi.services,
      value: stats.services,
      note: copy.kpi.servicesNote(stats.hiddenServices),
    },
    {
      href: "collections/faq",
      label: copy.kpi.faq,
      value: stats.faq,
      note: copy.kpi.faqNote(stats.process),
    },
    {
      href: "collections/translations",
      label: copy.kpi.translations,
      value: stats.translations,
      note: copy.kpi.translationsNote(empty),
      warn: empty > 0,
    },
  ];

  return (
    <div className="fz-dash">
      <section className="fz-intro">
        <span className="fz-intro__avatar" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element -- a remote upload at a small fixed size */}
          {photo ? <img src={photo} alt="" /> : <span>{initials}</span>}
        </span>
        <p className="fz-intro__eyebrow">
          <span>/</span> {copy.eyebrow}
        </p>
        <h1>
          {copy.hello}
          {name ? (
            <>
              , <em>{name}</em>
            </>
          ) : (
            "."
          )}
        </h1>
        <p>{copy.lead}</p>
        <nav className="fz-intro__links">
          <Link href={`${admin}/collections/projects/create`} className="fz-intro__primary">
            + {copy.newProject}
          </Link>
          <a href="/" target="_blank" rel="noreferrer">
            {copy.site} ↗
          </a>
        </nav>
      </section>

      <section className="fz-kpis">
        {kpis.map((kpi) => (
          <Link key={kpi.href} href={`${admin}/${kpi.href}`} className="fz-kpi">
            <span className="fz-kpi__label">{kpi.label}</span>
            <strong>{kpi.value}</strong>
            <span className={kpi.warn ? "fz-kpi__note is-warn" : "fz-kpi__note"}>{kpi.note}</span>
          </Link>
        ))}
      </section>

      <div className="fz-dash__grid">
        <section className="fz-panel fz-panel--wide">
          <header className="fz-panel__head">
            <div>
              <h2>{copy.activity}</h2>
              <p>{copy.activityNote}</p>
            </div>
          </header>
          <ol className="fz-chart" aria-label={copy.activity}>
            {activity.days.map(({ date, count }) => (
              <li key={dayKey(date)} title={`${dateFormat.format(date)} · ${copy.edits(count)}`}>
                <span className="fz-chart__bar" style={{ height: `${(count / peak) * 100}%` }}>
                  {count > 0 && <span className="fz-chart__value">{count}</span>}
                </span>
                <span className="fz-chart__day">{date.getDate()}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="fz-panel">
          <header className="fz-panel__head">
            <h2>{copy.coverage}</h2>
          </header>
          <ul className="fz-bars">
            {LOCALES.map((locale) => (
              <li key={locale}>
                <span className="fz-bars__label">{locale.toUpperCase()}</span>
                <span className="fz-bars__track">
                  <span style={{ width: `${stats.coverage[locale]}%` }} />
                </span>
                <span className="fz-bars__value">{stats.coverage[locale]}%</span>
              </li>
            ))}
          </ul>
          <header className="fz-panel__head fz-panel__head--spaced">
            <h2>{copy.industries}</h2>
          </header>
          <ul className="fz-bars">
            {industries.map(([industry, count]) => (
              <li key={industry}>
                <span className="fz-bars__label fz-bars__label--wide">
                  {industryLabel(industry)}
                </span>
                <span className="fz-bars__track">
                  <span style={{ width: `${(count / industryPeak) * 100}%` }} />
                </span>
                <span className="fz-bars__value">{count}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="fz-panel fz-panel--full">
          <header className="fz-panel__head">
            <h2>{copy.recent}</h2>
            <Link href={`${admin}/collections/projects`}>{copy.viewAll} →</Link>
          </header>
          {activity.recent.length ? (
            <ul className="fz-recent">
              {activity.recent.map((item) => (
                <li key={`${item.collection}-${item.id}`}>
                  <Link href={`${admin}/collections/${item.collection}/${item.id}`}>
                    <span className={`fz-recent__kind fz-recent__kind--${item.collection}`}>
                      {copy.kinds[item.collection]}
                    </span>
                    <span className="fz-recent__title">{item.title}</span>
                    <time dateTime={item.updatedAt}>
                      {timeFormat.format(new Date(item.updatedAt))}
                    </time>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="fz-empty">{copy.empty}</p>
          )}
        </section>
      </div>
    </div>
  );
}
