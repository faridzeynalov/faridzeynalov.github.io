import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { getContentOverrides, getSiteOverrides, getTranslationOverrides } from "@/lib/cms";

type Messages = { [key: string]: string | Messages };

/** Puts the admin's interface texts ("Nav.home" → "Ana səhifə") over the built-in messages. */
function withOverrides(messages: Messages, overrides: (readonly [string, string])[]) {
  const result: Messages = structuredClone(messages);
  for (const [key, value] of overrides) {
    const path = key.split(".");
    let node = result;
    for (const part of path.slice(0, -1)) {
      if (typeof node[part] !== "object") break;
      node = node[part] as Messages;
    }
    // Only keys that exist in the built-in messages, so a stale row can't break a namespace.
    const last = path.at(-1)!;
    if (typeof node[last] === "string") node[last] = value;
  }
  return result;
}

export default getRequestConfig(async ({ requestLocale }) => {
  // Set by `setRequestLocale` in each layout/page (required for static rendering).
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;
  const [messages, translations, site, content] = await Promise.all([
    import(`../../messages/${locale}.json`).then((module) => module.default as Messages),
    getTranslationOverrides(locale),
    getSiteOverrides(locale),
    getContentOverrides(locale),
  ]);

  return {
    locale,
    messages: {
      ...withOverrides(messages, translations),
      // The admin's site settings and page switches, for every component (useSiteOverrides).
      Site: site,
      // The admin's long-form content, for Server Components only: the locale layout leaves it
      // out of what it sends to the browser.
      Content: content,
    },
  };
});
