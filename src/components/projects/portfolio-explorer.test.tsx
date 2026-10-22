import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { PortfolioExplorer } from "@/components/projects/portfolio-explorer";
import { makeProject } from "@/test/fixtures";

const projects = [
  makeProject({ slug: "hotel-a", name: "Hotel A", industry: "hospitality" }),
  makeProject({ slug: "hotel-b", name: "Hotel B", industry: "hospitality" }),
  makeProject({ slug: "clinic", name: "Clinic", industry: "healthcare" }),
];

afterEach(() => window.history.replaceState(null, "", "/"));

describe("PortfolioExplorer", () => {
  it("shows every project with counts per filter", () => {
    render(<PortfolioExplorer projects={projects} />);
    const filters = screen.getByRole("group", { name: "Filter projects by industry" });
    expect(within(filters).getByRole("button", { name: /All\s*3/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(within(filters).getByRole("button", { name: /Hospitality\s*2/ })).toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(3);
  });

  it("filters by industry and mirrors the choice to the URL", async () => {
    const user = userEvent.setup();
    render(<PortfolioExplorer projects={projects} />);

    await user.click(screen.getByRole("button", { name: /Healthcare/ }));

    expect(screen.getByRole("button", { name: /Healthcare/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(window.location.search).toBe("?industry=healthcare");
    expect(screen.getByRole("status")).toHaveTextContent("Showing 1 project");
  });

  it("reads the initial filter from the URL", () => {
    window.history.replaceState(null, "", "/portfolio/?industry=hospitality");
    render(<PortfolioExplorer projects={projects} />);
    expect(screen.getByRole("status")).toHaveTextContent("Showing 2 projects");
  });

  it("ignores unknown filters in the URL", () => {
    window.history.replaceState(null, "", "/portfolio/?industry=bogus");
    render(<PortfolioExplorer projects={projects} />);
    expect(screen.getByRole("status")).toHaveTextContent("Showing 3 projects");
  });
});
