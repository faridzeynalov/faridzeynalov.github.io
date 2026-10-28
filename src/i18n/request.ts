import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { getSiteOverrides } from "@/lib/cms";

export default getRequestConfig(async ({ requestLocale }) => {
  // Set by `setRequestLocale` in each layout/page (required for static rendering).
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;
  const [messages, site] = await Promise.all([
    import(`../../messages/${locale}.json`).then((module) => module.default),
    getSiteOverrides(locale),
  ]);

  // "Site" carries the admin panel's site settings to every component (see useSiteOverrides).
  return { locale, messages: { ...messages, Site: site } };
});
