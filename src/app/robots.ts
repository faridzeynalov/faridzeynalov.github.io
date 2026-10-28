import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api", "/portal", "/az/portal", "/ru/portal"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
