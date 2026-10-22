import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProjectCard } from "@/components/projects/project-card";
import { makeProject } from "@/test/fixtures";

describe("ProjectCard", () => {
  it("links to the project detail page", () => {
    render(<ProjectCard project={makeProject({ slug: "panorama", name: "Panorama" })} />);
    // Next.js appends the trailing slash at build time (trailingSlash: true), not under Vitest.
    expect(screen.getByRole("link", { name: "Panorama" }).getAttribute("href")).toMatch(
      /^\/portfolio\/panorama\/?$/,
    );
  });

  it("shows a described screenshot and the stack", () => {
    render(<ProjectCard project={makeProject()} />);
    expect(screen.getByAltText("Homepage of example.az")).toBeInTheDocument();
    expect(screen.getByRole("list", { name: "Technologies" })).toHaveTextContent("React");
  });

  it("falls back to a clearly labelled placeholder when there is no screenshot", () => {
    render(<ProjectCard project={makeProject({ images: undefined, stack: [] })} />);
    expect(screen.getByRole("img", { name: "No preview available for example.az" })).toBeVisible();
    expect(screen.queryByRole("list", { name: "Technologies" })).not.toBeInTheDocument();
  });
});
