import type { MetadataRoute } from "next";
import { getAllProjects } from "@/lib/projects";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${siteUrl}/`, priority: 1 },
    { url: `${siteUrl}/portfolio/`, priority: 0.9 },
    { url: `${siteUrl}/services/`, priority: 0.9 },
    { url: `${siteUrl}/about/`, priority: 0.8 },
    { url: `${siteUrl}/contact/`, priority: 0.8 },
    { url: `${siteUrl}/cv/`, priority: 0.8 },
    ...getAllProjects().map((project) => ({
      url: `${siteUrl}/portfolio/${project.slug}/`,
      priority: 0.7,
    })),
  ];
}
