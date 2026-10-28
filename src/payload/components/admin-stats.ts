import type { CollectionSlug, Payload } from "payload";

/** Locales the site is written in, in the order the admin shows them. */
export const LOCALES = ["az", "en", "ru"] as const;

/**
 * Counts for the sidebar's badges, its content-health card and the dashboard: how much there is
 * of each kind, how much is switched off, and how many interface texts are still empty in
 * each language.
 */
export async function getAdminStats(payload: Payload) {
  const count = (collection: CollectionSlug, where?: Record<string, unknown>) =>
    payload.count({ collection, where: where as never }).then((result) => result.totalDocs);
  const inactive = { active: { equals: false } };

  const [projects, hiddenProjects, featured, services, hiddenServices, process, faq, translations] =
    await Promise.all([
      count("projects"),
      count("projects", inactive),
      count("projects", { featured: { equals: true }, active: { not_equals: false } }),
      count("services"),
      count("services", inactive),
      count("process-steps"),
      count("faq"),
      count("translations"),
    ]);
  const emptyTranslations = Object.fromEntries(
    await Promise.all(
      LOCALES.map(async (locale) => {
        const { totalDocs } = await payload.count({
          collection: "translations",
          // Each language is its own column.
          where: { or: [{ [locale]: { exists: false } }, { [locale]: { equals: "" } }] },
        });
        return [locale, totalDocs] as const;
      }),
    ),
  ) as Record<(typeof LOCALES)[number], number>;

  return {
    projects,
    hiddenProjects,
    featured,
    services,
    hiddenServices,
    process,
    faq,
    translations,
    emptyTranslations,
    /** Share of interface texts filled in, per language (0–100). */
    coverage: Object.fromEntries(
      LOCALES.map((locale) => [
        locale,
        translations
          ? Math.round(((translations - emptyTranslations[locale]) / translations) * 100)
          : 100,
      ]),
    ) as Record<(typeof LOCALES)[number], number>,
  };
}

export type AdminStats = Awaited<ReturnType<typeof getAdminStats>>;
