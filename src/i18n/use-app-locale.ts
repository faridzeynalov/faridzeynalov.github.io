import { useLocale } from "next-intl";
import type { Locale } from "@/i18n/routing";

/** The current locale, typed. Works in Server Components (non-async) and Client Components. */
export function useAppLocale(): Locale {
  return useLocale() as Locale;
}
