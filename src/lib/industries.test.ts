import { describe, expect, it } from "vitest";
import { getIndustryFilters, getIndustryLabel, isIndustry } from "@/lib/industries";

describe("industries", () => {
  it("counts projects per industry and sorts by count", () => {
    const filters = getIndustryFilters([
      { industry: "healthcare" },
      { industry: "hospitality" },
      { industry: "hospitality" },
    ]);
    expect(filters).toEqual([
      { id: "hospitality", label: "Hospitality", count: 2 },
      { id: "healthcare", label: "Healthcare", count: 1 },
    ]);
  });

  it("omits industries without projects", () => {
    expect(getIndustryFilters([])).toEqual([]);
  });

  it("validates industry ids from untrusted input such as URL params", () => {
    expect(isIndustry("real-estate")).toBe(true);
    expect(isIndustry("toString")).toBe(false);
    expect(isIndustry("nope")).toBe(false);
    expect(isIndustry(null)).toBe(false);
  });

  it("returns human-readable labels", () => {
    expect(getIndustryLabel("corporate")).toBe("Corporate & industrial");
  });
});
