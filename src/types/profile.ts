export interface SocialLink {
  label: string;
  href: string;
  handle: string;
}

export interface SkillGroup {
  title: string;
  description: string;
  items: string[];
}

export interface ExperienceEntry {
  role: string;
  company: string;
  companyUrl?: string;
  location: string;
  start: string;
  end: string;
  highlights: string[];
}

export interface EducationEntry {
  degree: string;
  field: string;
  institution: string;
  start: string;
  end: string;
}

export interface SpokenLanguage {
  name: string;
  level: string;
}

export interface Profile {
  name: string;
  firstName: string;
  initials: string;
  role: string;
  location: string;
  email: string;
  phone: string;
  /** Phone number in E.164 format, for `tel:` links. */
  phoneHref: string;
  yearsOfExperience: string;
  sitesShipped: string;
  industries: string[];
  summary: string;
  /** Headline and summary exactly as they appear on the CV. */
  cv: { title: string; summary: string };
  about: string[];
  social: SocialLink[];
  skills: SkillGroup[];
  experience: ExperienceEntry[];
  education: EducationEntry[];
  languages: SpokenLanguage[];
  certificates: { name: string; period: string }[];
}
