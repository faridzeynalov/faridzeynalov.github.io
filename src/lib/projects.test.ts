import { describe, expect, it } from "vitest";
import {
  getAdjacentProjects,
  getAllProjects,
  getFeaturedProjects,
  getProjectBySlug,
} from "@/lib/projects";
import { routing } from "@/i18n/routing";

const projects = getAllProjects("en");

describe("project data", () => {
  it("has unique, URL-safe slugs", () => {
    const slugs = projects.map((project) => project.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it("links every project to its own domain over https", () => {
    for (const project of projects) {
      expect([`https://${project.domain}/`, `https://www.${project.domain}/`]).toContain(
        project.url,
      );
    }
  });

  it("has either preview images or an explanation for missing ones", () => {
    for (const project of projects) {
      expect(Boolean(project.images) || Boolean(project.unavailableReason)).toBe(true);
    }
  });

  it("lists every project (chinarhotel.az excluded while its live site is broken)", () => {
    expect(projects).toHaveLength(29);
    expect(projects.some((project) => project.domain === "chinarhotel.az")).toBe(false);
  });

  it("only features projects that have previews", () => {
    const featured = getFeaturedProjects("en");
    expect(featured.length).toBeGreaterThan(0);
    for (const project of featured) expect(project.images).toBeDefined();
  });
});

describe("project queries", () => {
  it("finds a project by slug", () => {
    expect(getProjectBySlug("panorama", "en")?.domain).toBe("panorama.az");
    expect(getProjectBySlug("does-not-exist", "en")).toBeUndefined();
  });

  it("wraps previous/next navigation around the list", () => {
    const first = projects[0];
    const last = projects[projects.length - 1];
    expect(getAdjacentProjects(first.slug, "en")?.previous.slug).toBe(last.slug);
    expect(getAdjacentProjects(last.slug, "en")?.next.slug).toBe(first.slug);
    expect(getAdjacentProjects("missing", "en")).toBeNull();
  });
});

describe("translations", () => {
  it("has the same projects, in the same order, in every language", () => {
    for (const locale of routing.locales) {
      expect(getAllProjects(locale).map((project) => project.slug)).toEqual(
        projects.map((project) => project.slug),
      );
    }
  });

  it("translates every project's text", () => {
    for (const locale of routing.locales.filter((other) => other !== "en")) {
      const translated = getAllProjects(locale);
      translated.forEach((project, index) => {
        expect(project.summary).toBeTruthy();
        expect(project.overview).not.toBe(projects[index].overview);
        expect(project.liveFeatures).toHaveLength(projects[index].liveFeatures.length);
      });
    }
  });
});
