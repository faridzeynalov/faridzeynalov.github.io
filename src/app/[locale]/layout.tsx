import type { Metadata, Viewport } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { notFound } from "next/navigation";
import { CursorEffects } from "@/components/layout/cursor-effects";
import { RouteProgress } from "@/components/layout/route-progress";
import { ThemeSync } from "@/components/layout/theme-sync";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { MotionProvider } from "@/components/motion/motion-provider";
import { getProfile } from "@/data/profile";
import { LOCALE_STORAGE_KEY, routing } from "@/i18n/routing";
import { localizedAlternates, localizedPath, ogLocale } from "@/lib/i18n-metadata";
import { buildNavTree } from "@/lib/nav-tree";
import { getAllProjects } from "@/lib/projects";
import { basePath, siteUrl } from "@/lib/site";
import { themeInitScript } from "@/lib/theme";
import { instrumentSerifSchwa } from "@/fonts/schwa";
import "../globals.css";

// Latin-ext covers Azerbaijani (ə, ğ, ı, ş …); Cyrillic covers Russian. Instrument Serif has no
// Cyrillic, so Russian accent lines fall back to the system serif.
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext", "cyrillic"],
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "latin-ext", "cyrillic"],
});
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin", "latin-ext"],
  weight: "400",
  style: "italic",
});

// English is served without a prefix by app/(default); only the other languages get /az, /ru.
export const dynamicParams = false;

export function generateStaticParams() {
  return routing.locales
    .filter((locale) => locale !== routing.defaultLocale)
    .map((locale) => ({ locale }));
}

/**
 * Unprefixed (English) pages send visitors who picked another language last time to the same
 * page in that language, before anything paints. Choosing English in the switcher saves "en".
 */
const savedLocaleRedirect = `(function(){try{var l=localStorage.getItem(${JSON.stringify(LOCALE_STORAGE_KEY)});if(!l||l===${JSON.stringify(routing.defaultLocale)}||${JSON.stringify(routing.locales)}.indexOf(l)<0)return;var base=${JSON.stringify(basePath)};var p=location.pathname.slice(base.length)||"/";location.replace(base+"/"+l+(p==="/"?"":p)+location.search+location.hash);}catch(e){}})();`;

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "Metadata" });
  const profile = getProfile(locale);
  const title = t("siteTitle", { name: profile.name, role: profile.role });
  const description = t("siteDescription", {
    role: profile.role,
    location: profile.location,
    years: profile.yearsOfExperience,
    sites: profile.sitesShipped,
  });

  return {
    // Includes the base path; Next.js joins it with the root-relative URLs used in page metadata.
    metadataBase: new URL(`${siteUrl}/`),
    title: { default: title, template: `%s · ${profile.name}` },
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
    alternates: localizedAlternates(locale, "/"),
    openGraph: {
      type: "website",
      siteName: profile.name,
      title,
      description,
      url: localizedPath(locale, "/"),
      locale: ogLocale(locale),
      images: [{ url: "/og.png", width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description, images: ["/og.png"] },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0c" },
    { media: "(prefers-color-scheme: light)", color: "#f7f6f3" },
  ],
};

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  // Enables static rendering for this locale (no request-time data on GitHub Pages).
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Nav" });
  const tExplorer = await getTranslations({ locale, namespace: "Explorer" });
  const tree = buildNavTree(locale, {
    projects: tExplorer("projects", { count: getAllProjects(locale).length }),
  });

  return (
    // The theme class is added by the inline script before paint, so React must not complain
    // about the class/style it didn't render. data-scroll-behavior="smooth": CSS keeps smooth
    // scrolling for in-page links, but Next.js switches it off during route changes so a new
    // page always starts instantly at the top.
    <html
      lang={locale}
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} ${instrumentSerifSchwa.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        {locale === routing.defaultLocale && (
          <script dangerouslySetInnerHTML={{ __html: savedLocaleRedirect }} />
        )}
      </head>
      <body className="min-h-dvh">
        <NextIntlClientProvider>
          <a
            href="#main"
            className="fixed top-3 left-3 z-[100] -translate-y-20 rounded-full bg-fg px-4 py-2 text-sm text-bg transition-transform focus:translate-y-0"
          >
            {t("skip")}
          </a>
          <MotionProvider>
            <ThemeSync />
            <RouteProgress />
            <SiteHeader tree={tree} />
            <main id="main">{children}</main>
            <SiteFooter />
            <CursorEffects />
          </MotionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
