import { industryLabels } from "@/data/industries";
import type { Industry, Project } from "@/types/project";

// Pure helpers with no dependency on the project dataset, so client components can use them.

export interface IndustryFilter {
  id: Industry;
  label: string;
  count: number;
}

/** Industries that have at least one project, ordered by project count. */
export function getIndustryFilters(list: Pick<Project, "industry">[]): IndustryFilter[] {
  const counts = new Map<Industry, number>();
  for (const project of list) counts.set(project.industry, (counts.get(project.industry) ?? 0) + 1);
  return [...counts.entries()]
    .map(([id, count]) => ({ id, label: industryLabels[id], count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

export function isIndustry(value: string | null | undefined): value is Industry {
  return !!value && Object.hasOwn(industryLabels, value);
}

export function getIndustryLabel(industry: Industry) {
  return industryLabels[industry];
}
