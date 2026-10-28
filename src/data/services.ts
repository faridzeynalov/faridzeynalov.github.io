import { getContent } from "@/content";
import type { Locale } from "@/i18n/routing";
import type { ProcessStep, Service, ServiceIcon } from "@/types/content";

/**
 * Services, in display order. Text is translated in src/content/{en,az,ru}.ts. Front-end,
 * SEO/performance, API and maintenance work come from the CV; design and AI were added on request.
 */
const serviceBase: { id: keyof ReturnType<typeof getContent>["services"]; icon: ServiceIcon }[] = [
  { id: "frontend", icon: "code" },
  { id: "design", icon: "palette" },
  { id: "seo", icon: "gauge" },
  { id: "ai", icon: "sparkles" },
  { id: "integrations", icon: "plug" },
  { id: "maintenance", icon: "wrench" },
];

export const serviceIds = serviceBase.map((service) => service.id);

export function getServices(locale: Locale): Service[] {
  const text = getContent(locale).services;
  return serviceBase.map(({ id, icon }) => ({ id, icon, ...text[id] }));
}

/** How a project runs, shown on the Services page. */
export function getProcess(locale: Locale): ProcessStep[] {
  return getContent(locale).process;
}

/** Common questions about getting a website made, answered on the Services page. */
export function getFaq(locale: Locale) {
  return getContent(locale).faq;
}
