import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProjectCard } from "@/components/projects/project-card";
import { makeProject } from "@/test/fixtures";
import { renderWithIntl } from "@/test/intl";
import type { Project } from "@/types/project";

const render = (project: Project) =>
  renderWithIntl(<ProjectCard project={project} industryLabel="Hospitality" />);

describe("ProjectCard", () => {
  it("links to the project detail page", () => {
    render(makeProject({ slug: "panorama", name: "Panorama" }));
    // English is the default language, so its links have no locale prefix.
    expect(screen.getByRole("link", { name: "Panorama" }).getAttribute("href")).toBe(
      "/portfolio/panorama",
    );
  });

  it("shows a described screenshot and the stack", () => {
    render(makeProject());
    expect(screen.getByAltText("Homepage of example.az")).toBeInTheDocument();
    expect(screen.getByRole("list", { name: "Technologies" })).toHaveTextContent("React");
  });

  it("falls back to a clearly labelled placeholder when there is no screenshot", () => {
    render(makeProject({ images: undefined, stack: [] }));
    expect(screen.getByRole("img", { name: "No preview available for example.az" })).toBeVisible();
    expect(screen.queryByRole("list", { name: "Technologies" })).not.toBeInTheDocument();
  });
});
