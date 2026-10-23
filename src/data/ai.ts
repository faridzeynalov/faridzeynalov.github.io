import { getContent } from "@/content";
import type { Locale } from "@/i18n/routing";
import type { AiIcon, AiProfile } from "@/types/content";

/**
 * AI skills shown on the home page and the CV page. Not on the CV; the tools list was
 * confirmed by Farid (October 2026). Text is translated in src/content/{en,az,ru}.ts.
 */
const tools = [
  "ChatGPT",
  "Claude",
  "Cursor",
  "GitHub Copilot",
  "OpenAI API",
  "Anthropic API",
  "Vercel AI SDK",
  "Zod",
];

/** Icons for the capabilities, in the same order as the content. */
const capabilityIcons: AiIcon[] = ["bot", "plug", "messages", "braces"];

export function getAi(locale: Locale): AiProfile {
  const text = getContent(locale).ai;
  return {
    intro: text.intro,
    capabilities: text.capabilities.map((capability, index) => ({
      ...capability,
      icon: capabilityIcons[index],
    })),
    tools,
    skills: text.skills,
  };
}
