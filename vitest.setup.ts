import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { createElement, type ImgHTMLAttributes } from "react";
import { afterEach, vi } from "vitest";

afterEach(() => cleanup());

// next/image needs the Next.js runtime; render a plain <img> in unit tests.
vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    priority: _priority,
    placeholder: _placeholder,
    ...rest
  }: Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "placeholder"> & {
    src: string | { src: string };
    priority?: boolean;
    placeholder?: string;
  }) => createElement("img", { src: typeof src === "string" ? src : src.src, alt, ...rest }),
}));

// jsdom has no matchMedia.
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }),
});

// jsdom has no IntersectionObserver (used by Motion's whileInView).
class IntersectionObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}
Object.defineProperty(window, "IntersectionObserver", {
  writable: true,
  value: IntersectionObserverStub,
});
