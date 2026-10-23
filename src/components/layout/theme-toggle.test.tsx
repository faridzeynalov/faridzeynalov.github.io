import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { renderWithIntl as render } from "@/test/intl";

afterEach(() => {
  document.documentElement.className = "";
  localStorage.clear();
});

describe("ThemeToggle", () => {
  it("switches between dark and light and remembers the choice", async () => {
    document.documentElement.classList.add("dark");
    const user = userEvent.setup();
    render(<ThemeToggle />);

    await user.click(screen.getByRole("button", { name: "Switch to light theme" }));

    expect(document.documentElement.classList.contains("light")).toBe(true);
    expect(localStorage.getItem("theme")).toBe("light");
    expect(await screen.findByRole("button", { name: "Switch to dark theme" })).toBeVisible();
  });
});
