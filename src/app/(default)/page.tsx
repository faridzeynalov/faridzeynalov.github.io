import HomePage, { generateMetadata as localizedMetadata } from "../[locale]/page";
import { defaultLocaleProps } from "@/i18n/default-locale";

export function generateMetadata() {
  return localizedMetadata(defaultLocaleProps());
}

export default function DefaultHomePage() {
  return <HomePage {...defaultLocaleProps()} />;
}
