import { defineRouting } from "next-intl/routing";

/**
 * English (the default) lives at unprefixed URLs (/, /about); other languages under their own
 * prefix (/az, /ru/about). Static export has no middleware, so app/(default) renders the English
 * routes and app/[locale] the others.
 */
export const routing = defineRouting({
  locales: ["en", "az", "ru"],
  defaultLocale: "en",
  localePrefix: "as-needed",
});

export type Locale = (typeof routing.locales)[number];

export const localeNames: Record<Locale, { short: string; native: string }> = {
  en: { short: "EN", native: "English" },
  az: { short: "AZ", native: "Azərbaycanca" },
  ru: { short: "RU", native: "Русский" },
};

/** Where the visitor's language choice is remembered (read by the English pages' redirect). */
export const LOCALE_STORAGE_KEY = "locale";
