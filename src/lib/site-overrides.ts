import { useMessages } from "next-intl";
import { owner } from "@/data/owner";
import { withBasePath } from "@/lib/site";

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
  /** The CV PDF uploaded in the admin. */
  cvUrl?: string;
  /** "Buy me a coffee": the link and its QR code. */
  kofeUrl?: string;
  kofeQr?: { src: string; width: number; height: number };
  /** Pages and home sections switched on or off under "Səhifələr" (everything on if missing). */
  pages?: {
    pages: Record<"portfolio" | "services" | "about" | "contact" | "cv", boolean>;
    home: Record<string, boolean>;
  };
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

/** The CV PDF: the one uploaded under "Sayt ayarları", or the file shipped in public/. */
export function cvHref(site: SiteOverrides, { download = false } = {}) {
  if (!site.cvUrl) return withBasePath("/farid-zeynalov-cv.pdf");
  // Vercel Blob serves the file as a download with this flag (download="" can't, across origins).
  return download ? `${site.cvUrl}?download=1` : site.cvUrl;
}

/** Whether a page is switched on in the admin (menus hide the ones that are off). */
export function usePageEnabled() {
  const pages = useSiteOverrides().pages?.pages;
  return (href: string) => {
    const page = href.split("/")[1] as keyof NonNullable<typeof pages>;
    return !page || pages?.[page] !== false;
  };
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
