import { industryIds } from "@/data/industries";
import type { Industry, Project } from "@/types/project";

// Pure helpers with no dependency on the project dataset or translations, so client components
// can use them. Labels are passed in (see getIndustryLabels in lib/projects).

export interface IndustryFilter {
  id: Industry;
  label: string;
  count: number;
}

/** Industries that have at least one project, ordered by project count. */
export function getIndustryFilters(
  list: Pick<Project, "industry">[],
  labels: Record<Industry, string>,
  locale = "en",
): IndustryFilter[] {
  const counts = new Map<Industry, number>();
  for (const project of list) counts.set(project.industry, (counts.get(project.industry) ?? 0) + 1);
  return [...counts.entries()]
    .map(([id, count]) => ({ id, label: labels[id], count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, locale));
}

export function isIndustry(value: string | null | undefined): value is Industry {
  return !!value && (industryIds as string[]).includes(value);
}
