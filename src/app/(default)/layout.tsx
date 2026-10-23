import LocaleLayout, { generateMetadata as localizedMetadata } from "../[locale]/layout";
import { defaultLocaleProps } from "@/i18n/default-locale";

// English pages at unprefixed URLs (/, /about, …) share the [locale] document.
export { viewport } from "../[locale]/layout";

export function generateMetadata() {
  return localizedMetadata({ ...defaultLocaleProps(), children: null });
}

export default function DefaultLocaleLayout({ children }: { children: React.ReactNode }) {
  return <LocaleLayout {...defaultLocaleProps()}>{children}</LocaleLayout>;
}
