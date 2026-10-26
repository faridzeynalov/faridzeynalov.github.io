import type { Metadata } from "next";
import { Geist, Instrument_Serif } from "next/font/google";
import { buttonVariants } from "@/components/ui/button";
import { localeNames, routing } from "@/i18n/routing";
import { localizedPath } from "@/lib/i18n-metadata";
import { basePath } from "@/lib/site";
import { themeInitScript } from "@/lib/theme";
import { instrumentSerifSchwa } from "@/fonts/schwa";
import { skinFontVariables } from "@/fonts/skins";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin", "latin-ext"] });
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: "italic",
});

export const metadata: Metadata = {
  title: "Page not found · Farid Zeynalov",
  robots: { index: false },
};

/**
 * Served (out/404.html) for every unknown URL. Older link styles are redirected by Vercel before
 * they get here (vercel.json); this covers any other static host: a trailing slash
 * (/portfolio/panorama/) and the /en prefix (/en/about) are dropped.
 */
const legacyRedirect = `(function(){try{var base=${JSON.stringify(basePath)};var p=location.pathname;if(base&&p.indexOf(base)===0)p=p.slice(base.length)||"/";var q=p.replace(/\\/+$/,"")||"/";var d="/"+${JSON.stringify(routing.defaultLocale)};if(q===d)q="/";else if(q.indexOf(d+"/")===0)q=q.slice(d.length);if(q!==p)location.replace(base+(q==="/"&&base?"/":q)+location.search+location.hash);}catch(e){}})();`;

export default function NotFound() {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${instrumentSerif.variable} ${instrumentSerifSchwa.variable} ${skinFontVariables}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: legacyRedirect }} />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-dvh">
        <main className="relative flex min-h-dvh items-center overflow-hidden py-16">
          <div
            className="pointer-events-none absolute inset-0 -z-10 bg-grid mask-radial"
            aria-hidden
          />
          <div className="container-page">
            <p className="font-mono text-sm text-accent">Error 404</p>
            <h1 className="mt-4 text-[clamp(3rem,10vw,7rem)] leading-none font-semibold tracking-[-0.05em]">
              Nothing{" "}
              <span className="accent-text font-serif font-normal tracking-normal text-fg-muted italic">
                here.
              </span>
            </h1>
            <p className="mt-6 max-w-md text-lg text-fg-muted">
              The page you&rsquo;re looking for doesn&rsquo;t exist or has moved.
            </p>
            <nav aria-label="Language" className="mt-10 flex flex-wrap gap-3">
              {routing.locales.map((locale, index) => (
                <a
                  key={locale}
                  href={`${basePath}${localizedPath(locale, "/")}`}
                  hrefLang={locale}
                  className={buttonVariants({
                    variant: index === 0 ? "primary" : "secondary",
                    size: "lg",
                  })}
                >
                  {localeNames[locale].native}
                </a>
              ))}
            </nav>
          </div>
        </main>
      </body>
    </html>
  );
}
