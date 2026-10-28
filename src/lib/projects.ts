import { getContent } from "@/content";
import { getProjectList } from "@/data/projects";
import type { Locale } from "@/i18n/routing";
import type { Industry, Project } from "@/types/project";

export function getAllProjects(locale: Locale): Project[] {
  return getProjectList(locale);
}

export function getFeaturedProjects(locale: Locale): Project[] {
  return featuredOf(getProjectList(locale));
}

export function getProjectBySlug(slug: string, locale: Locale): Project | undefined {
  return getProjectList(locale).find((project) => project.slug === slug);
}

/** Previous/next projects, wrapping around the list. */
export function getAdjacentProjects(
  slug: string,
  locale: Locale,
): { previous: Project; next: Project } | null {
  return adjacentIn(getProjectList(locale), slug);
}

export function getIndustryLabels(locale: Locale): Record<Industry, string> {
  return getContent(locale).industries;
}

export function getIndustryLabel(industry: Industry, locale: Locale): string {
  return getContent(locale).industries[industry];
}

/** Highlighted on the home page. */
export function featuredOf(projects: Project[]): Project[] {
  return projects.filter((project) => project.featured);
}

/** Previous/next projects in a list, wrapping around. */
export function adjacentIn(
  projects: Project[],
  slug: string,
): { previous: Project; next: Project } | null {
  const index = projects.findIndex((project) => project.slug === slug);
  if (index === -1 || projects.length < 2) return null;
  return {
    previous: projects[(index - 1 + projects.length) % projects.length],
    next: projects[(index + 1) % projects.length],
  };
}
