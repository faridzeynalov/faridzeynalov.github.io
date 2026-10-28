import { useMessages } from "next-intl";
import { getContent } from "@/content";
import type { Locale } from "@/i18n/routing";
import type { AiProfile } from "@/types/content";
import type { Profile } from "@/types/profile";
import type { Industry } from "@/types/project";

/** The parts of the profile edited under "Profil" in the admin panel. */
export type ProfileText = Partial<
  Pick<
    Profile,
    | "summary"
    | "about"
    | "industries"
    | "cv"
    | "skills"
    | "experience"
    | "education"
    | "languages"
    | "certificates"
  >
>;

/**
 * Long-form content from the admin panel (Profil, Süni intellekt), already resolved: only what
 * was filled in is present. Server Components read it from the "Content" messages namespace
 * (see src/i18n/request.ts), which is not sent to the browser.
 */
export interface ContentOverrides {
  profile?: ProfileText;
  ai?: AiProfile;
  principles?: { title: string; text: string }[];
  industries?: Partial<Record<Industry, string>>;
}

export function useContentOverrides(): ContentOverrides {
  return (useMessages().Content ?? {}) as ContentOverrides;
}

/** Industry names in one language, with the admin's names applied. */
export function industryLabels(
  locale: Locale,
  overrides: ContentOverrides = {},
): Record<Industry, string> {
  return { ...getContent(locale).industries, ...overrides.industries };
}
