import { Code2, Gauge, Palette, Plug, Sparkles, Wrench, type LucideIcon } from "lucide-react";
import type { ServiceIcon } from "@/types/content";

export const serviceIcons: Record<ServiceIcon, LucideIcon> = {
  code: Code2,
  palette: Palette,
  gauge: Gauge,
  sparkles: Sparkles,
  plug: Plug,
  wrench: Wrench,
};
