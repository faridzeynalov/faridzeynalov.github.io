import { describe, expect, it } from "vitest";
import {
  getAdjacentProjects,
  getAllProjects,
  getFeaturedProjects,
  getProjectBySlug,
} from "@/lib/projects";

const projects = getAllProjects();

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
    const featured = getFeaturedProjects();
    expect(featured.length).toBeGreaterThan(0);
    for (const project of featured) expect(project.images).toBeDefined();
  });
});

describe("project queries", () => {
  it("finds a project by slug", () => {
    expect(getProjectBySlug("panorama")?.domain).toBe("panorama.az");
    expect(getProjectBySlug("does-not-exist")).toBeUndefined();
  });

  it("wraps previous/next navigation around the list", () => {
    const first = projects[0];
    const last = projects[projects.length - 1];
    expect(getAdjacentProjects(first.slug)?.previous.slug).toBe(last.slug);
    expect(getAdjacentProjects(last.slug)?.next.slug).toBe(first.slug);
    expect(getAdjacentProjects("missing")).toBeNull();
  });
});
