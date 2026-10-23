import type { ReactNode } from "react";

// The real document (<html>, fonts, header…) lives in app/[locale]/layout.tsx. This root layout
// only exists for the locale-less root page (redirect) and the global 404.
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
