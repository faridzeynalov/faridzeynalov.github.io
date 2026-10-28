import { getContent } from "@/content";
import { owner } from "@/data/owner";
import type { Locale } from "@/i18n/routing";
import { useAppLocale } from "@/i18n/use-app-locale";
import { linkHandle, phoneHref, useSiteOverrides, type SiteOverrides } from "@/lib/site-overrides";
import type { Profile } from "@/types/profile";

/**
 * Facts from the CV that don't change between languages. Translatable text (summary, about,
 * skills, experience highlights, …) lives in src/content/{en,az,ru}.ts.
 */
const base = {
  name: owner.name,
  firstName: owner.firstName,
  initials: owner.initials,
  email: owner.email,
  phone: owner.phone,
  phoneHref: owner.phoneHref,
  yearsOfExperience: "4+",
  sitesShipped: "25+",
  experience: [
    { company: "One Studio", companyUrl: "https://one.az/", start: "04/2022", end: null },
  ],
  education: [
    { start: "09/2018", end: "06/2020" },
    { start: "09/2014", end: "05/2018" },
  ],
} as const;

/**
 * The full profile in one language. `site` holds the settings filled in in the admin panel
 * (useProfile and getSiteProfile pass them); anything not set there keeps the built-in value.
 */
export function getProfile(locale: Locale, site: SiteOverrides = {}): Profile {
  const text = getContent(locale).profile;
  const name = site.name ?? base.name;
  const email = site.email ?? base.email;
  const phone = site.phone ?? base.phone;
  const tel = site.phone ? phoneHref(site.phone) : base.phoneHref;
  const linkedIn = site.linkedIn ?? owner.linkedIn.href;
  const social = [
    { label: "Email", href: `mailto:${email}`, handle: email },
    {
      label: "LinkedIn",
      href: linkedIn,
      handle: site.linkedIn ? linkHandle(linkedIn) : owner.linkedIn.handle,
    },
    ...(site.github
      ? [{ label: "GitHub", href: site.github, handle: linkHandle(site.github) }]
      : []),
    ...(site.instagram
      ? [{ label: "Instagram", href: site.instagram, handle: linkHandle(site.instagram) }]
      : []),
    { label: "Phone", href: `tel:${tel}`, handle: phone },
  ];
  return {
    name,
    firstName: site.name ? site.name.split(" ")[0] : base.firstName,
    initials: site.name
      ? site.name
          .split(/s+/)
          .map((part) => part[0])
          .join("")
          .slice(0, 2)
          .toUpperCase()
      : base.initials,
    email,
    phone,
    phoneHref: tel,
    yearsOfExperience: site.yearsOfExperience ?? base.yearsOfExperience,
    sitesShipped: site.sitesShipped ?? base.sitesShipped,
    social,
    role: site.role ?? text.role,
    location: site.location ?? text.location,
    summary: text.summary,
    about: text.about,
    industries: text.industries,
    cv: text.cv,
    skills: text.skills,
    experience: base.experience.map((job, index) => ({
      company: job.company,
      companyUrl: job.companyUrl,
      start: job.start,
      end: job.end ?? text.present,
      role: text.experience[index].role,
      location: text.experience[index].location,
      highlights: text.experience[index].highlights,
    })),
    education: base.education.map((entry, index) => ({
      ...entry,
      ...text.education[index],
    })),
    languages: text.languages,
    certificates: text.certificates,
  };
}

/** The profile with the admin panel's site settings applied (Server and Client Components). */
export function useProfile(): Profile {
  return getProfile(useAppLocale(), useSiteOverrides());
}
