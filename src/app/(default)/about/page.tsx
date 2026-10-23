import AboutPage, { generateMetadata as localizedMetadata } from "../../[locale]/about/page";
import { defaultLocaleProps } from "@/i18n/default-locale";

export function generateMetadata() {
  return localizedMetadata(defaultLocaleProps());
}

export default function DefaultAboutPage() {
  return <AboutPage {...defaultLocaleProps()} />;
}
