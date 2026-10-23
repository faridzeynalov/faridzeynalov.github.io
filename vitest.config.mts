import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": `${import.meta.dirname}/src` },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    css: false,
    // next-intl imports "next/navigation" without an extension; let Vite resolve it.
    server: { deps: { inline: ["next-intl"] } },
  },
});
