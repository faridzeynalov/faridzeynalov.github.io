import type { AiProfile } from "@/types/content";

/**
 * AI skills shown on the home page and the CV page. Added on request — not from the CV.
 * Check that the tools listed match what you actually use.
 */
export const ai: AiProfile = {
  intro:
    "I use AI tools every day to prototype, refactor and test faster — and I build AI-powered features into the interfaces I ship. The judgment, the review and the final quality stay with me.",
  capabilities: [
    {
      title: "AI-assisted development",
      description:
        "Pairing with AI coding assistants to scaffold components, refactor legacy code, write tests and review changes — with every line reviewed before it ships.",
      icon: "bot",
    },
    {
      title: "LLM integration",
      description:
        "Connecting front ends to large language model APIs: server-side calls that keep keys safe, streamed responses, retries, rate limits and graceful fallbacks.",
      icon: "plug",
    },
    {
      title: "Conversational UI",
      description:
        "Chat and assistant interfaces that feel responsive — streamed tokens, cancellation, message history, Markdown rendering and fully keyboard-accessible flows.",
      icon: "messages",
    },
    {
      title: "Prompt engineering",
      description:
        "Structured prompts and system instructions, JSON output checked against a schema, and testing responses so AI features behave predictably in production.",
      icon: "braces",
    },
  ],
  tools: [
    "ChatGPT",
    "Claude",
    "Cursor",
    "GitHub Copilot",
    "OpenAI API",
    "Anthropic API",
    "Vercel AI SDK",
    "Zod",
  ],
  skills: [
    "AI-assisted development",
    "LLM API integration",
    "Conversational UI",
    "Prompt engineering",
  ],
};
