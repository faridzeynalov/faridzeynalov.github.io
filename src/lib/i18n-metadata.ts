import type { Metadata } from "next";
import { routing, type Locale } from "@/i18n/routing";

const ogLocales: Record<Locale, string> = { en: "en_US", az: "az_AZ", ru: "ru_RU" };

/**
 * Public URL path of a page in one language. English (the default) has no prefix and nothing
 * ends in a slash: "/" and "/about" in English, "/az" and "/az/about" in Azerbaijani.
 * `path` is locale-less and starts with "/".
 */
export function localizedPath(locale: Locale, path: string) {
  if (locale === routing.defaultLocale) return path;
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}

/** Canonical URL plus hreflang alternates for a page that exists in every locale. */
export function localizedAlternates(locale: Locale, path: string): Metadata["alternates"] {
  const languages: Record<string, string> = Object.fromEntries(
    routing.locales.map((other) => [other, localizedPath(other, path)]),
  );
  languages["x-default"] = localizedPath(routing.defaultLocale, path);
  return { canonical: localizedPath(locale, path), languages };
}

export function ogLocale(locale: Locale) {
  return ogLocales[locale];
}
