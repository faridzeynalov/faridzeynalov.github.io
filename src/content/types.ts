import type { Industry } from "@/types/project";

/** Long-form, translatable site content. One object per locale (en.ts, az.ts, ru.ts). */
export interface SiteContent {
  profile: {
    role: string;
    location: string;
    /** Shown instead of an end date for the current job. */
    present: string;
    summary: string;
    about: string[];
    /** Same order as the industries in the CV. */
    industries: string[];
    cv: { title: string; summary: string };
    /** Same order as `skillGroups` in src/data/profile.ts. */
    skills: { title: string; description: string; items: string[] }[];
    /** Same order as `experience` in src/data/profile.ts. */
    experience: { role: string; location: string; highlights: string[] }[];
    /** Same order as `education` in src/data/profile.ts. */
    education: { degree: string; field: string; institution: string }[];
    languages: { name: string; level: string }[];
    certificates: { name: string; period: string }[];
  };
  services: Record<
    "frontend" | "design" | "seo" | "ai" | "integrations" | "maintenance",
    { title: string; tagline: string; description: string; deliverables: string[] }
  >;
  process: { title: string; description: string }[];
  /** Common questions about getting a website made, on the Services page (and as FAQPage data). */
  faq: { question: string; answer: string }[];
  ai: {
    intro: string;
    capabilities: { title: string; description: string }[];
    skills: string[];
  };
  /** "What I care about" on the About page. */
  principles: { title: string; text: string }[];
  industries: Record<Industry, string>;
  /** Keyed by project slug (see src/data/projects.ts). */
  projects: Record<
    string,
    {
      summary: string;
      overview: string;
      liveFeatures: string[];
      note?: string;
      unavailableReason?: string;
    }
  >;
}
