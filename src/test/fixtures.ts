import type { StaticImageData } from "next/image";
import type { Project } from "@/types/project";

const image = (name: string): StaticImageData => ({
  src: `/${name}.webp`,
  width: 1440,
  height: 900,
});

export function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    slug: "example",
    name: "Example",
    domain: "example.az",
    url: "https://example.az/",
    industry: "hospitality",
    summary: "Summary",
    overview: "Overview",
    liveFeatures: [],
    stack: ["Next.js (App Router)", "React"],
    languages: ["English"],
    accent: "#123456",
    images: { cover: image("cover"), thumb: image("thumb"), mobile: image("mobile") },
    ...overrides,
  };
}
