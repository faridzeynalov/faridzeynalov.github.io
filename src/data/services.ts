import type { ProcessStep, Service } from "@/types/content";

/** How a project runs, shown on the Services page. */
export const process: ProcessStep[] = [
  {
    title: "Discover",
    description:
      "We talk through goals, audience and constraints. I review existing designs, content and code, then agree on scope, priorities and timeline.",
  },
  {
    title: "Design",
    description:
      "Layouts, components and every interactive state are defined — in your design files or mine — with responsive behaviour and accessibility considered up front.",
  },
  {
    title: "Build",
    description:
      "Typed, component-based implementation with regular previews, so you see progress early and can steer before the details are locked in.",
  },
  {
    title: "Launch & care",
    description:
      "Performance, SEO and cross-browser checks before launch — then improvements, fixes and new features as the product grows.",
  },
];

/**
 * Services shown on the home page. Front-end, SEO/performance, API and maintenance work come
 * straight from the CV; design and AI were added on request — edit freely.
 */
export const services: Service[] = [
  {
    id: "frontend",
    title: "Front-end development",
    tagline: "React, Next.js & TypeScript",
    description:
      "Production-ready websites and web apps built with React, Next.js and TypeScript. Clean, component-based code that's fast, accessible and easy for your team to extend long after launch.",
    deliverables: [
      "React & Next.js (App Router) applications",
      "Reusable, strictly typed component systems",
      "State management with Redux Toolkit, RTK Query or Zustand",
      "Responsive, cross-browser layouts down to the pixel",
    ],
    icon: "code",
  },
  {
    id: "design",
    title: "UI design & design systems",
    tagline: "Interfaces with intent",
    description:
      "Interfaces that look considered and feel effortless. I turn rough ideas or existing designs into a consistent visual language — spacing, typography, colour and every interactive state worked out.",
    deliverables: [
      "UI concepts, page layouts and responsive variants",
      "Design tokens and component libraries",
      "Motion and micro-interactions that guide, not distract",
      "Accessible colour, contrast and focus states",
    ],
    icon: "palette",
  },
  {
    id: "seo",
    title: "SEO & performance",
    tagline: "Fast, findable, measurable",
    description:
      "Sites that load quickly and get found. Technical SEO and performance are built in from the first commit — not bolted on after launch — so search engines and real users both get a fast experience.",
    deliverables: [
      "Technical SEO: metadata, sitemaps, Open Graph, semantic HTML",
      "Core Web Vitals and Lighthouse optimisation",
      "Code splitting, lazy loading and image optimisation",
      "Static generation and caching strategies",
    ],
    icon: "gauge",
  },
  {
    id: "ai",
    title: "AI integration",
    tagline: "Practical AI in your product",
    description:
      "AI features your users will actually use: assistants, smart search and content tools connected to modern LLM APIs, with streaming, clear loading states and safe fallbacks so they feel fast and trustworthy.",
    deliverables: [
      "Chat and assistant interfaces with streamed responses",
      "LLM API integration (OpenAI, Anthropic)",
      "AI-powered search, summaries and content tools",
      "Prompt design with structured, validated output",
    ],
    icon: "sparkles",
  },
  {
    id: "integrations",
    title: "APIs & web applications",
    tagline: "Connected to real data",
    description:
      "Dynamic products wired to real data — booking flows, catalogues, dashboards and forms connected to REST or GraphQL APIs, with solid loading, empty and error states at every step.",
    deliverables: [
      "REST and GraphQL API integration",
      "Booking systems, product catalogues and filters",
      "Forms, validation and error handling",
      "Multilingual sites (Azerbaijani, English, Russian)",
    ],
    icon: "plug",
  },
  {
    id: "maintenance",
    title: "Maintenance & optimisation",
    tagline: "Care for live products",
    description:
      "Ongoing care for live, business-critical sites. New features, fixes and performance improvements shipped carefully, without disrupting the traffic and customers that depend on them.",
    deliverables: [
      "Feature development on existing codebases",
      "Bug fixing and cross-browser / cross-device QA",
      "Migrating legacy markup to modern components",
      "Dependency upgrades and code audits",
    ],
    icon: "wrench",
  },
];
