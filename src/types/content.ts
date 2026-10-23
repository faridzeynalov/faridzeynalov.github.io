export type ServiceIcon = "code" | "palette" | "gauge" | "sparkles" | "plug" | "wrench";

export interface Service {
  id: string;
  title: string;
  /** Short line shown in the sticky index. */
  tagline: string;
  description: string;
  deliverables: string[];
  icon: ServiceIcon;
}

export type AiIcon = "bot" | "plug" | "messages" | "braces";

export interface AiCapability {
  title: string;
  description: string;
  icon: AiIcon;
}

export interface AiProfile {
  intro: string;
  capabilities: AiCapability[];
  /** AI tools and libraries. Review this list — it isn't from the CV. */
  tools: string[];
  /** Compact list for the CV page sidebar. */
  skills: string[];
}
