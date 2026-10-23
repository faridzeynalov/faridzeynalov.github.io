import { describe, expect, it } from "vitest";
import { getIndustryFilters, isIndustry } from "@/lib/industries";
import { getIndustryLabel, getIndustryLabels } from "@/lib/projects";

const labels = getIndustryLabels("en");

describe("industries", () => {
  it("counts projects per industry and sorts by count", () => {
    const filters = getIndustryFilters(
      [{ industry: "healthcare" }, { industry: "hospitality" }, { industry: "hospitality" }],
      labels,
    );
    expect(filters).toEqual([
      { id: "hospitality", label: "Hospitality", count: 2 },
      { id: "healthcare", label: "Healthcare", count: 1 },
    ]);
  });

  it("omits industries without projects", () => {
    expect(getIndustryFilters([], labels)).toEqual([]);
  });

  it("validates industry ids from untrusted input such as URL params", () => {
    expect(isIndustry("real-estate")).toBe(true);
    expect(isIndustry("toString")).toBe(false);
    expect(isIndustry("nope")).toBe(false);
    expect(isIndustry(null)).toBe(false);
  });

  it("returns human-readable labels in every language", () => {
    expect(getIndustryLabel("corporate", "en")).toBe("Corporate & industrial");
    expect(getIndustryLabel("corporate", "az")).not.toBe("Corporate & industrial");
    expect(getIndustryLabel("corporate", "ru")).toMatch(/[а-я]/i);
  });
});
