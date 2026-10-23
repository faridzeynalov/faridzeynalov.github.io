import type { StaticImageData } from "next/image";

export type Industry =
  "hospitality" | "real-estate" | "healthcare" | "e-commerce" | "corporate" | "education";

/** A language a project's live site is available in. */
export type SiteLanguage = "az" | "en" | "ru";

export interface ProjectImages {
  /** Desktop (1440×900) capture of the live site, used on detail pages. */
  cover: StaticImageData;
  /** Smaller desktop capture for cards. */
  thumb: StaticImageData;
  /** Mobile (390×844 @1.2x) capture. */
  mobile: StaticImageData;
  /** Optional below-the-fold section capture. */
  section?: StaticImageData;
}

/** The parts of a project that are the same in every language (src/data/projects.ts). */
export interface ProjectBase {
  slug: string;
  name: string;
  domain: string;
  url: string;
  industry: Industry;
  /** Optional umbrella brand, e.g. the Tabia Group hotel portfolio. */
  group?: string;
  /**
   * Front-end stack detected from the live site's public build.
   * Only filled in where it could be verified.
   */
  stack: string[];
  /** Languages the live site is available in. */
  languages: SiteLanguage[];
  /** Brand accent sampled from the live site, used to tint previews. */
  accent: string;
  /** Highlighted on the home page. */
  featured?: boolean;
}

/** A project with its text in one language. */
export interface Project extends ProjectBase {
  /** One-line summary for cards. */
  summary: string;
  /** Longer overview for the detail page — describes the product, based on the live site. */
  overview: string;
  /** Features publicly visible on the live site (observed, not claimed as personal contributions). */
  liveFeatures: string[];
  /**
   * Your own notes on your role for this specific project.
   * Left empty on purpose: the CV doesn't document per-project responsibilities.
   */
  contribution?: string;
  /** Present when the live site could be reached and captured. */
  images?: ProjectImages;
  /** Explains why there's no preview (e.g. the live site is currently offline). */
  unavailableReason?: string;
  /** Extra context about the live site's current state. */
  note?: string;
}
