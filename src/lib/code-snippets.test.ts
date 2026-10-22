import { describe, expect, it } from "vitest";
import { CODE_SNIPPETS, createSnippetPicker } from "@/lib/code-snippets";

describe("code snippets", () => {
  it("has many unique terms", () => {
    expect(new Set(CODE_SNIPPETS).size).toBe(CODE_SNIPPETS.length);
    expect(CODE_SNIPPETS.length).toBeGreaterThanOrEqual(90);
  });

  it("never repeats a term within 30 picks", () => {
    const next = createSnippetPicker(CODE_SNIPPETS, 30);
    const picks = Array.from({ length: 5000 }, next);
    const lastSeen = new Map<string, number>();
    picks.forEach((pick, index) => {
      const previous = lastSeen.get(pick);
      if (previous !== undefined) expect(index - previous).toBeGreaterThan(30);
      lastSeen.set(pick, index);
    });
  });

  it("still covers the whole list over time", () => {
    const next = createSnippetPicker(CODE_SNIPPETS, 30);
    const seen = new Set(Array.from({ length: 3000 }, next));
    expect(seen.size).toBe(CODE_SNIPPETS.length);
  });

  it("caps the gap for short lists instead of running out of items", () => {
    const next = createSnippetPicker(["a", "b", "c"], 30);
    const picks = Array.from({ length: 9 }, next);
    expect(picks.every(Boolean)).toBe(true);
    // With 3 items the gap becomes 2, so every window of 3 has no duplicates.
    for (let i = 0; i + 3 <= picks.length; i++) {
      expect(new Set(picks.slice(i, i + 3)).size).toBe(3);
    }
  });
});
