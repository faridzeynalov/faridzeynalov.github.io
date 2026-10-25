import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { AppearanceMenu } from "@/components/layout/appearance-menu";
import { renderWithIntl as render } from "@/test/intl";

afterEach(() => {
  document.documentElement.className = "";
  delete document.documentElement.dataset.skin;
  localStorage.clear();
});

function setup() {
  document.documentElement.classList.add("dark");
  document.documentElement.dataset.skin = "classic";
  const user = userEvent.setup();
  render(<AppearanceMenu />);
  return user;
}

describe("AppearanceMenu", () => {
  it("describes the current style and mode on its button", async () => {
    setup();
    expect(
      await screen.findByRole("button", { name: "Appearance: Classic, Dark" }),
    ).toHaveAttribute("aria-expanded", "false");
  });

  it("switches between light and dark and remembers the choice", async () => {
    const user = setup();
    await user.click(await screen.findByRole("button", { name: /Appearance/ }));
    await user.click(screen.getByRole("button", { name: "Light" }));

    expect(document.documentElement.classList.contains("light")).toBe(true);
    expect(localStorage.getItem("theme")).toBe("light");
    expect(screen.getByRole("button", { name: "Light" })).toHaveAttribute("aria-pressed", "true");
  });

  it("switches to the Developer style and remembers it", async () => {
    const user = setup();
    await user.click(await screen.findByRole("button", { name: /Appearance/ }));
    await user.click(screen.getByRole("button", { name: /^Developer/ }));

    expect(document.documentElement.dataset.skin).toBe("dev");
    expect(localStorage.getItem("skin")).toBe("dev");
    expect(screen.getByRole("button", { name: /^Developer/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(
      await screen.findByRole("button", { name: "Appearance: Developer, Dark" }),
    ).toBeInTheDocument();
  });

  it.each([
    ["8-bit", "pixel"],
    ["Paper", "paper"],
    ["Chess", "chess"],
    ["Football", "football"],
  ])("switches to the %s style and remembers it", async (name, skin) => {
    const user = setup();
    await user.click(await screen.findByRole("button", { name: /Appearance/ }));
    await user.click(screen.getByRole("button", { name: new RegExp(`^${name}`) }));

    expect(document.documentElement.dataset.skin).toBe(skin);
    expect(localStorage.getItem("skin")).toBe(skin);
    expect(
      await screen.findByRole("button", { name: `Appearance: ${name}, Dark` }),
    ).toBeInTheDocument();
  });

  it("lists all six styles", async () => {
    const user = setup();
    await user.click(await screen.findByRole("button", { name: /Appearance/ }));
    for (const name of ["Classic", "Developer", "8-bit", "Paper", "Chess", "Football"]) {
      expect(screen.getByRole("button", { name: new RegExp(`^${name}`) })).toBeInTheDocument();
    }
  });
});
