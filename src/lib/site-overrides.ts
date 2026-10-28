import { useMessages } from "next-intl";
import { owner } from "@/data/owner";

/**
 * Identity and contact details filled in under "Sayt ayarları" in the admin panel. Only fields
 * that were filled in are present; everything else keeps the built-in value. They reach
 * components through the "Site" messages namespace (see src/i18n/request.ts), so Server and
 * Client Components can read them without awaiting anything.
 */
export interface SiteOverrides {
  name?: string;
  role?: string;
  location?: string;
  email?: string;
  phone?: string;
  yearsOfExperience?: string;
  sitesShipped?: string;
  linkedIn?: string;
  github?: string;
  instagram?: string;
}

/** `+994 51 306 35 96` -> `+994513063596`, for tel: links. */
export function phoneHref(phone: string) {
  return phone.replace(/[^\d+]/g, "");
}

/** The handle shown for a profile link: `https://www.linkedin.com/in/x/` -> `in/x`. */
export function linkHandle(href: string) {
  return href.replace(/^https?:\/\/(www\.)?[^/]+\//, "").replace(/\/+$/, "") || href;
}

/** Site settings as filled in by the admin, without empty fields. */
export function useSiteOverrides(): SiteOverrides {
  return (useMessages().Site ?? {}) as SiteOverrides;
}

/** The owner's identity with the admin's site settings applied (safe in Client Components). */
export function useOwner() {
  const site = useSiteOverrides();
  return {
    ...owner,
    name: site.name ?? owner.name,
    email: site.email ?? owner.email,
    phone: site.phone ?? owner.phone,
    phoneHref: site.phone ? phoneHref(site.phone) : owner.phoneHref,
    linkedIn: site.linkedIn
      ? { href: site.linkedIn, handle: linkHandle(site.linkedIn) }
      : owner.linkedIn,
  };
}
