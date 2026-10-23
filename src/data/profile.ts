import { getContent } from "@/content";
import { owner } from "@/data/owner";
import type { Locale } from "@/i18n/routing";
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
  social: [
    { label: "Email", href: `mailto:${owner.email}`, handle: owner.email },
    { label: "LinkedIn", href: owner.linkedIn.href, handle: owner.linkedIn.handle },
    { label: "Phone", href: `tel:${owner.phoneHref}`, handle: owner.phone },
  ],
  experience: [
    { company: "One Studio", companyUrl: "https://one.az/", start: "04/2022", end: null },
  ],
  education: [
    { start: "09/2018", end: "06/2020" },
    { start: "09/2014", end: "05/2018" },
  ],
} as const;

/** The full profile in one language. */
export function getProfile(locale: Locale): Profile {
  const text = getContent(locale).profile;
  return {
    name: base.name,
    firstName: base.firstName,
    initials: base.initials,
    email: base.email,
    phone: base.phone,
    phoneHref: base.phoneHref,
    yearsOfExperience: base.yearsOfExperience,
    sitesShipped: base.sitesShipped,
    social: base.social.map((link) => ({ ...link })),
    role: text.role,
    location: text.location,
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
