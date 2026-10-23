import { az } from "@/content/az";
import { en } from "@/content/en";
import { ru } from "@/content/ru";
import type { SiteContent } from "@/content/types";
import type { Locale } from "@/i18n/routing";

export const content: Record<Locale, SiteContent> = { en, az, ru };

export function getContent(locale: Locale): SiteContent {
  return content[locale];
}
