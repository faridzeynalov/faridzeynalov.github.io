import { routing } from "@/i18n/routing";

/**
 * Props for rendering an app/[locale] page or layout in the default language. English lives at
 * unprefixed URLs (/about, not /en/about); with no middleware on GitHub Pages, the routes in
 * app/(default) render the same pages with these props instead of a rewrite.
 */
export function defaultLocaleProps<Extra extends Record<string, string>>(
  extra: Promise<Extra> = Promise.resolve({} as Extra),
) {
  return {
    params: extra.then((params) => ({ ...params, locale: routing.defaultLocale })),
    searchParams: Promise.resolve({}),
  };
}
