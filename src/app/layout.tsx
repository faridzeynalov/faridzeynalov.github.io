import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { CursorEffects } from "@/components/layout/cursor-effects";
import { RouteProgress } from "@/components/layout/route-progress";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { MotionProvider } from "@/components/motion/motion-provider";
import { profile } from "@/data/profile";
import { buildNavTree } from "@/lib/nav-tree";
import { siteUrl } from "@/lib/site";
import { themeInitScript } from "@/lib/theme";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: "italic",
});

const description = `${profile.role} in ${profile.location} with ${profile.yearsOfExperience} years of experience building fast, responsive websites with React, Next.js and TypeScript. ${profile.sitesShipped} production sites shipped.`;

export const metadata: Metadata = {
  // Includes the base path; Next.js joins it with the root-relative URLs used in page metadata.
  metadataBase: new URL(`${siteUrl}/`),
  title: {
    default: `${profile.name} — ${profile.role}`,
    template: `%s · ${profile.name}`,
  },
  description,
  applicationName: profile.name,
  authors: [{ name: profile.name }],
  creator: profile.name,
  keywords: [
    "Front-End Developer",
    "React",
    "Next.js",
    "TypeScript",
    "Tailwind CSS",
    "Baku",
    "Azerbaijan",
    profile.name,
  ],
  openGraph: {
    type: "website",
    siteName: profile.name,
    title: `${profile.name} — ${profile.role}`,
    description,
    url: "/",
    locale: "en_US",
    images: [
      { url: "/og.png", width: 1200, height: 630, alt: `${profile.name} — ${profile.role}` },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${profile.name} — ${profile.role}`,
    description,
    images: ["/og.png"],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0c" },
    { media: "(prefers-color-scheme: light)", color: "#f7f6f3" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // The theme class is added by the inline script before paint, so React must not
    // complain about the class/style it didn't render.
    // data-scroll-behavior="smooth": CSS keeps smooth scrolling for in-page links, but Next.js
    // switches it off during route changes so a new page always starts instantly at the top.
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-dvh">
        <a
          href="#main"
          className="fixed top-3 left-3 z-[100] -translate-y-20 rounded-full bg-fg px-4 py-2 text-sm text-bg transition-transform focus:translate-y-0"
        >
          Skip to content
        </a>
        <MotionProvider>
          <RouteProgress />
          <SiteHeader tree={buildNavTree()} />
          <main id="main">{children}</main>
          <SiteFooter />
          <CursorEffects />
        </MotionProvider>
      </body>
    </html>
  );
}
